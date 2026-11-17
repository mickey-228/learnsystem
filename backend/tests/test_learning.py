from fastapi.testclient import TestClient


def create_subject(client: TestClient, name: str = "算法") -> dict:
    response = client.post(
        "/api/learning/subjects",
        json={"name": name, "color": "#2563eb"},
    )
    assert response.status_code == 201
    return response.json()


def test_create_goal_and_subject(client: TestClient) -> None:
    goal_response = client.post(
        "/api/learning/goals",
        json={
            "title": "刷完 500 题",
            "target_value": 500,
            "target_unit": "题",
            "target_date": "2026-12-31",
        },
    )
    assert goal_response.status_code == 201
    goal = goal_response.json()
    assert goal["status"] == "active"

    subject_response = client.post(
        "/api/learning/subjects",
        json={"name": "算法", "color": "#2563eb", "goal_id": goal["id"]},
    )
    assert subject_response.status_code == 201
    assert subject_response.json()["goal_id"] == goal["id"]

    assert len(client.get("/api/learning/goals").json()) == 1
    assert len(client.get("/api/learning/subjects").json()) == 1

    duplicate = client.post("/api/learning/subjects", json={"name": "算法"})
    assert duplicate.status_code == 400


def test_plan_complete_and_reopen(client: TestClient) -> None:
    subject = create_subject(client)

    empty_plan = client.get("/api/learning/plans/2026-11-09")
    assert empty_plan.status_code == 200
    assert empty_plan.json()["summary"]["total_items"] == 0

    item_response = client.post(
        "/api/learning/plans/2026-11-09/items",
        json={
            "title": "两数之和",
            "subject_id": subject["id"],
            "estimated_minutes": 40,
            "priority": 1,
        },
    )
    assert item_response.status_code == 201
    item = item_response.json()
    assert item["subject_name"] == "算法"
    assert item["status"] == "pending"

    completed = client.post(
        f"/api/learning/plan-items/{item['id']}/complete",
        json={"minutes": 45, "content": "做完并复盘", "self_rating": 4},
    )
    assert completed.status_code == 200
    assert completed.json()["status"] == "done"
    assert completed.json()["actual_minutes"] == 45

    plan = client.get("/api/learning/plans/2026-11-09").json()
    assert plan["summary"] == {
        "total_items": 1,
        "done_items": 1,
        "completion_rate": 1.0,
        "planned_minutes": 40,
        "actual_minutes": 45,
    }

    checkins = client.get("/api/learning/checkins?date=2026-11-09").json()
    assert len(checkins) == 1
    assert checkins[0]["minutes"] == 45
    assert checkins[0]["self_rating"] == 4

    reopened = client.post(f"/api/learning/plan-items/{item['id']}/reopen")
    assert reopened.status_code == 200
    assert reopened.json()["status"] == "pending"
    assert client.get("/api/learning/checkins?date=2026-11-09").json() == []


def test_update_and_delete_plan_item(client: TestClient) -> None:
    item = client.post(
        "/api/learning/plans/2026-11-10/items",
        json={"title": "看文档", "estimated_minutes": 30},
    ).json()

    updated = client.patch(
        f"/api/learning/plan-items/{item['id']}",
        json={"title": "看 FastAPI 文档", "estimated_minutes": 60},
    )
    assert updated.status_code == 200
    assert updated.json()["title"] == "看 FastAPI 文档"
    assert updated.json()["estimated_minutes"] == 60

    deleted = client.delete(f"/api/learning/plan-items/{item['id']}")
    assert deleted.status_code == 204
    assert client.get("/api/learning/plans/2026-11-10").json()["items"] == []
