import json
from datetime import UTC, datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.shared.db import Base


def utc_now() -> datetime:
    return datetime.now(UTC)


class KnowledgeVault(Base):
    __tablename__ = "knowledge_vaults"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100))
    path: Mapped[str] = mapped_column(String(500))
    sync_mode: Mapped[str] = mapped_column(String(20), default="folder")
    last_synced_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), default=None)
    enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

    notes: Mapped[list["KnowledgeNote"]] = relationship(
        back_populates="vault", cascade="all, delete-orphan"
    )


class KnowledgeNote(Base):
    __tablename__ = "knowledge_notes"
    __table_args__ = (UniqueConstraint("vault_id", "path", name="uq_knowledge_notes_vault_path"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    vault_id: Mapped[int] = mapped_column(
        ForeignKey("knowledge_vaults.id", ondelete="CASCADE"), index=True
    )
    path: Mapped[str] = mapped_column(String(500))
    title: Mapped[str] = mapped_column(String(300))
    tags_json: Mapped[str] = mapped_column(Text, default="[]")
    modified_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    indexed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

    vault: Mapped[KnowledgeVault] = relationship(back_populates="notes")

    @property
    def tags(self) -> list[str]:
        try:
            value = json.loads(self.tags_json)
        except (TypeError, ValueError):
            return []
        return [str(tag) for tag in value] if isinstance(value, list) else []
