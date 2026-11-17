from fastapi.testclient import TestClient


def create_task(client: TestClient, plan_date: str = "2026-11-09", title: str = "两数之和") -> dict:
    response = client.post(
        f"/api/learning/plans/{plan_date}/items",
        json={"title": title, "estimated_minutes": 25, "priority": 1},
    )
    assert response.status_code == 201, response.text
    return response.json()


def test_task_list_across_dates(client: TestClient) -> None:
    first = create_task(client, "2026-11-09", "两数之和")
    second = create_task(client, "2026-11-10", "滑动窗口")

    response = client.get("/api/learning/tasks?from_date=2026-11-09&to_date=2026-11-10")
    assert response.status_code == 200
    tasks = response.json()
    assert [task["id"] for task in tasks] == [first["id"], second["id"]]
    assert [task["plan_date"] for task in tasks] == ["2026-11-09", "2026-11-10"]
    assert "subject_name" not in tasks[0]

    invalid = client.get("/api/learning/tasks?from_date=2026-11-10&to_date=2026-11-09")
    assert invalid.status_code == 400


def test_time_session_lifecycle(client: TestClient) -> None:
    task = create_task(client)

    created = client.post(
        "/api/learning/time-sessions",
        json={
            "plan_item_id": task["id"],
            "task_title": task["title"],
            "started_at": "2026-11-09T09:00:00",
            "ended_at": "2026-11-09T09:25:00",
            "minutes": 25,
            "mode": "focus",
            "source": "pomodoro",
        },
    )
    assert created.status_code == 201, created.text
    session = created.json()
    assert session["minutes"] == 25
    assert session["task_title"] == "两数之和"
    assert session["mode"] == "focus"

    sessions = client.get("/api/learning/time-sessions?date=2026-11-09").json()
    assert [item["id"] for item in sessions] == [session["id"]]

    other_day = client.get("/api/learning/time-sessions?date=2026-11-10").json()
    assert other_day == []

    deleted = client.delete(f"/api/learning/time-sessions/{session['id']}")
    assert deleted.status_code == 204
    assert client.get("/api/learning/time-sessions?date=2026-11-09").json() == []


def test_time_session_validation(client: TestClient) -> None:
    base = {
        "task_title": "自由学习",
        "started_at": "2026-11-09T10:00:00",
        "ended_at": "2026-11-09T09:00:00",
        "minutes": 25,
    }
    reversed_time = client.post("/api/learning/time-sessions", json=base)
    assert reversed_time.status_code == 400

    invalid_mode = client.post(
        "/api/learning/time-sessions",
        json={
            **base,
            "started_at": "2026-11-09T09:00:00",
            "ended_at": "2026-11-09T09:25:00",
            "mode": "nap",
        },
    )
    assert invalid_mode.status_code == 422
