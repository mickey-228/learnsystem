from pathlib import Path

from fastapi.testclient import TestClient


def make_vault(tmp_path: Path) -> Path:
    vault = tmp_path / "vault"
    vault.mkdir()
    (vault / "note1.md").write_text(
        "# 算法笔记\n\n#算法 #复习\n",
        encoding="utf-8",
    )
    (vault / "note2.md").write_text(
        "---\ntitle: 雅思笔记\ntags: [英语, 雅思]\n---\n内容\n",
        encoding="utf-8",
    )
    (vault / "plain.md").write_text("没有标题也没有标签\n", encoding="utf-8")
    (vault / ".obsidian").mkdir()
    (vault / ".obsidian" / "hidden.md").write_text("# 隐藏\n", encoding="utf-8")
    (vault / "image.png").write_bytes(b"not a note")
    return vault


def configure(client: TestClient, vault: Path) -> dict:
    response = client.put(
        "/api/knowledge/obsidian/config",
        json={"name": "LifeVault", "path": str(vault), "sync_mode": "folder"},
    )
    assert response.status_code == 200, response.text
    return response.json()


def test_status_and_config(client: TestClient, tmp_path: Path) -> None:
    empty = client.get("/api/knowledge/obsidian/status")
    assert empty.status_code == 200
    assert empty.json() == {"vault": None, "note_count": 0, "last_synced_at": None}

    vault = make_vault(tmp_path)
    configured = configure(client, vault)
    assert configured["name"] == "LifeVault"
    assert Path(configured["path"]) == vault.resolve()
    assert configured["sync_mode"] == "folder"

    status = client.get("/api/knowledge/obsidian/status").json()
    assert status["vault"]["id"] == configured["id"]
    assert status["note_count"] == 0
    assert status["last_synced_at"] is None

    missing = client.put(
        "/api/knowledge/obsidian/config",
        json={"name": "Broken", "path": str(tmp_path / "missing")},
    )
    assert missing.status_code == 400


def test_sync_indexes_notes_and_is_idempotent(client: TestClient, tmp_path: Path) -> None:
    vault = make_vault(tmp_path)
    configure(client, vault)

    first = client.post("/api/knowledge/obsidian/sync")
    assert first.status_code == 200, first.text
    assert first.json() == {
        "scanned": 3,
        "created": 3,
        "updated": 0,
        "removed": 0,
        "total": 3,
    }

    notes = client.get("/api/knowledge/notes").json()
    by_title = {note["title"]: note for note in notes}
    assert set(by_title) == {"算法笔记", "雅思笔记", "plain"}
    assert by_title["算法笔记"]["tags"] == ["算法", "复习"]
    assert by_title["雅思笔记"]["tags"] == ["英语", "雅思"]
    assert by_title["plain"]["tags"] == []

    second = client.post("/api/knowledge/obsidian/sync").json()
    assert second == {
        "scanned": 3,
        "created": 0,
        "updated": 0,
        "removed": 0,
        "total": 3,
    }

    (vault / "new.md").write_text("# 新笔记\n\n#新\n", encoding="utf-8")
    third = client.post("/api/knowledge/obsidian/sync").json()
    assert third["created"] == 1
    assert third["total"] == 4

    (vault / "note1.md").write_text("# 算法笔记\n\n#算法 #新标签\n", encoding="utf-8")
    fourth = client.post("/api/knowledge/obsidian/sync").json()
    assert fourth["updated"] == 1
    assert fourth["total"] == 4

    (vault / "plain.md").unlink()
    fifth = client.post("/api/knowledge/obsidian/sync").json()
    assert fifth["removed"] == 1
    assert fifth["total"] == 3
    assert "plain" not in {note["title"] for note in client.get("/api/knowledge/notes").json()}

    by_tag = client.get("/api/knowledge/notes", params={"tag": "英语"}).json()
    assert [note["title"] for note in by_tag] == ["雅思笔记"]

    by_query = client.get("/api/knowledge/notes", params={"q": "雅思"}).json()
    assert [note["title"] for note in by_query] == ["雅思笔记"]


def test_sync_requires_config(client: TestClient) -> None:
    response = client.post("/api/knowledge/obsidian/sync")
    assert response.status_code == 400
    assert response.json()["detail"] == "vault is not configured"


def test_rest_mode_sync_is_rejected(client: TestClient, tmp_path: Path) -> None:
    vault = make_vault(tmp_path)
    response = client.put(
        "/api/knowledge/obsidian/config",
        json={"name": "LifeVault", "path": str(vault), "sync_mode": "rest_api"},
    )
    assert response.status_code == 200

    sync = client.post("/api/knowledge/obsidian/sync")
    assert sync.status_code == 400
    assert "only folder sync" in sync.json()["detail"]
