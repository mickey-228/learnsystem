from fastapi.testclient import TestClient


def test_habit_toggle_and_streak(client: TestClient) -> None:
    created = client.post("/api/habits", json={"name": "早起"})
    assert created.status_code == 201, created.text
    habit = created.json()
    assert habit["name"] == "早起"
    assert habit["done_today"] is False
    assert habit["streak"] == 0
    habit_id = habit["id"]

    toggled = client.post(f"/api/habits/{habit_id}/toggle?date=2026-11-10")
    assert toggled.json()["done_today"] is True
    assert toggled.json()["streak"] == 1

    client.post(f"/api/habits/{habit_id}/toggle?date=2026-11-09")
    listed = client.get("/api/habits?date=2026-11-10").json()
    assert listed[0]["streak"] == 2

    untoggled = client.post(f"/api/habits/{habit_id}/toggle?date=2026-11-10")
    assert untoggled.json()["done_today"] is False
    assert untoggled.json()["streak"] == 1


def test_habit_update_archive_and_delete(client: TestClient) -> None:
    created = client.post("/api/habits", json={"name": "早起"})
    habit_id = created.json()["id"]

    renamed = client.patch(f"/api/habits/{habit_id}", json={"name": "早起拉伸"})
    assert renamed.json()["name"] == "早起拉伸"

    archived = client.patch(f"/api/habits/{habit_id}", json={"archived": True})
    assert archived.json()["archived"] is True
    assert client.get("/api/habits").json() == []

    deleted = client.delete(f"/api/habits/{habit_id}")
    assert deleted.status_code == 204
