from fastapi.testclient import TestClient


def test_event_lifecycle(client: TestClient) -> None:
    created = client.post(
        "/api/schedule/events",
        json={
            "title": "组会",
            "date": "2026-11-12",
            "start_time": "15:00",
            "end_time": "16:00",
            "location": "线上",
        },
    )
    assert created.status_code == 201, created.text
    event = created.json()
    assert event["done"] is False

    invalid = client.post(
        "/api/schedule/events",
        json={
            "title": "倒置时间",
            "date": "2026-11-12",
            "start_time": "16:00",
            "end_time": "15:00",
        },
    )
    assert invalid.status_code == 400

    events = client.get("/api/schedule/events?from_date=2026-11-01&to_date=2026-11-30").json()
    assert [item["id"] for item in events] == [event["id"]]

    updated = client.patch(f"/api/schedule/events/{event['id']}", json={"done": True})
    assert updated.json()["done"] is True

    deleted = client.delete(f"/api/schedule/events/{event['id']}")
    assert deleted.status_code == 204
    assert client.get("/api/schedule/events?from_date=2026-11-01&to_date=2026-11-30").json() == []
