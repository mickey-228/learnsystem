import json
import re
from datetime import UTC, datetime
from pathlib import Path

from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.domains.knowledge import models, schemas

INLINE_TAG_RE = re.compile(r"(?<!\S)#([A-Za-z0-9_\u4e00-\u9fff/-]+)")
H1_RE = re.compile(r"^#\s+(.+)$", re.MULTILINE)
FRONTMATTER_RE = re.compile(r"^---\s*\n(.*?)\n---\s*(?:\n|$)", re.DOTALL)

MAX_FILES = 5000
MAX_NOTE_BYTES = 2 * 1024 * 1024


def _bad_request(detail: str) -> HTTPException:
    return HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=detail)


def get_vault(db: Session) -> models.KnowledgeVault | None:
    return db.scalar(select(models.KnowledgeVault).order_by(models.KnowledgeVault.id).limit(1))


def _resolve_directory(raw_path: str) -> Path:
    try:
        resolved = Path(raw_path).expanduser().resolve()
    except OSError as exc:
        raise _bad_request("vault path is invalid") from exc
    if not resolved.exists() or not resolved.is_dir():
        raise _bad_request("vault path must be an existing directory")
    return resolved


def upsert_vault(db: Session, payload: schemas.VaultConfig) -> models.KnowledgeVault:
    resolved = _resolve_directory(payload.path)
    vault = get_vault(db)
    if vault is None:
        vault = models.KnowledgeVault(
            name=payload.name,
            path=str(resolved),
            sync_mode=payload.sync_mode,
        )
        db.add(vault)
    else:
        vault.name = payload.name
        vault.path = str(resolved)
        vault.sync_mode = payload.sync_mode
        vault.enabled = True

    db.commit()
    db.refresh(vault)
    return vault


def get_status(db: Session) -> schemas.VaultStatus:
    vault = get_vault(db)
    if vault is None:
        return schemas.VaultStatus(vault=None, note_count=0, last_synced_at=None)

    note_count = (
        db.scalar(
            select(func.count())
            .select_from(models.KnowledgeNote)
            .where(models.KnowledgeNote.vault_id == vault.id)
        )
        or 0
    )
    return schemas.VaultStatus(
        vault=schemas.VaultRead.model_validate(vault),
        note_count=note_count,
        last_synced_at=vault.last_synced_at,
    )


def _clean_tag(tag: str) -> str:
    return tag.strip().lstrip("#").strip().strip('"').strip("'")


def parse_markdown(text: str, stem: str) -> tuple[str, list[str]]:
    title = ""
    tags: list[str] = []
    body = text

    frontmatter = FRONTMATTER_RE.match(text)
    if frontmatter:
        block = frontmatter.group(1)
        body = text[frontmatter.end() :]
        lines = block.splitlines()
        for index, line in enumerate(lines):
            key, separator, value = line.partition(":")
            if not separator:
                continue
            key = key.strip().lower()
            value = value.strip()
            if key == "title" and value:
                title = value.strip('"').strip("'")
            elif key == "tags":
                if value.startswith("[") and value.endswith("]"):
                    tags.extend(value[1:-1].split(","))
                elif value:
                    tags.extend(value.split(","))
                else:
                    for follow in lines[index + 1 :]:
                        stripped = follow.strip()
                        if stripped.startswith("- "):
                            tags.append(stripped[2:])
                        elif stripped:
                            break

    if not title:
        heading = H1_RE.search(body)
        if heading:
            title = heading.group(1).strip()
    title = title.strip() or stem

    tags.extend(INLINE_TAG_RE.findall(body))
    cleaned: list[str] = []
    for tag in tags:
        tag = _clean_tag(tag)
        if tag and tag not in cleaned:
            cleaned.append(tag)
    return title, cleaned


def _as_aware(value: datetime) -> datetime:
    return value if value.tzinfo is not None else value.replace(tzinfo=UTC)


def scan_vault(db: Session, vault: models.KnowledgeVault) -> schemas.SyncResult:
    if vault.sync_mode != "folder":
        raise _bad_request("only folder sync is currently supported")

    root = _resolve_directory(vault.path)
    files: list[Path] = []
    for path in sorted(root.rglob("*.md")):
        relative = path.relative_to(root)
        if any(part.startswith(".") for part in relative.parts):
            continue
        if not path.is_file() or path.is_symlink():
            continue
        try:
            if path.stat().st_size > MAX_NOTE_BYTES:
                continue
        except OSError:
            continue
        files.append(path)
        if len(files) >= MAX_FILES:
            break

    existing = {
        note.path: note
        for note in db.scalars(
            select(models.KnowledgeNote).where(models.KnowledgeNote.vault_id == vault.id)
        )
    }
    seen: set[str] = set()
    created = 0
    updated = 0

    for path in files:
        relative_path = path.relative_to(root).as_posix()
        seen.add(relative_path)
        try:
            text = path.read_text(encoding="utf-8", errors="replace")
            modified_at = datetime.fromtimestamp(path.stat().st_mtime, UTC)
        except OSError:
            continue

        title, tags = parse_markdown(text, path.stem)
        tags_json = json.dumps(tags, ensure_ascii=False)
        note = existing.get(relative_path)
        if note is None:
            db.add(
                models.KnowledgeNote(
                    vault_id=vault.id,
                    path=relative_path,
                    title=title,
                    tags_json=tags_json,
                    modified_at=modified_at,
                )
            )
            created += 1
            continue

        changed = (
            note.title != title
            or note.tags_json != tags_json
            or abs((_as_aware(note.modified_at) - modified_at).total_seconds()) > 1
        )
        if changed:
            note.title = title
            note.tags_json = tags_json
            note.modified_at = modified_at
            note.indexed_at = models.utc_now()
            updated += 1

    removed = 0
    for relative_path, note in existing.items():
        if relative_path not in seen:
            db.delete(note)
            removed += 1

    vault.last_synced_at = models.utc_now()
    db.commit()

    total = (
        db.scalar(
            select(func.count())
            .select_from(models.KnowledgeNote)
            .where(models.KnowledgeNote.vault_id == vault.id)
        )
        or 0
    )
    return schemas.SyncResult(
        scanned=len(files),
        created=created,
        updated=updated,
        removed=removed,
        total=total,
    )


def list_notes(
    db: Session, tag: str | None = None, query: str | None = None
) -> list[models.KnowledgeNote]:
    notes = list(
        db.scalars(
            select(models.KnowledgeNote).order_by(
                models.KnowledgeNote.modified_at.desc(),
                models.KnowledgeNote.id.desc(),
            )
        )
    )
    if tag:
        notes = [note for note in notes if tag in note.tags]
    if query:
        needle = query.lower()
        notes = [
            note for note in notes if needle in note.title.lower() or needle in note.path.lower()
        ]
    return notes
