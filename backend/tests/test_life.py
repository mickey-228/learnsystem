from fastapi.testclient import TestClient


def configure_budget(client: TestClient, month: str = "2026-11", amount: float = 1000) -> dict:
    response = client.put(f"/api/life/months/{month}/budget", json={"amount": amount})
    assert response.status_code == 200, response.text
    return response.json()


def add_item(client: TestClient, month: str = "2026-11", **overrides) -> dict:
    payload = {
        "name": "机械键盘",
        "category": "数码",
        "quantity": 1,
        "estimated_price": 399,
        "priority": "必需",
        "status": "want",
    }
    payload.update(overrides)
    response = client.post(f"/api/life/months/{month}/items", json=payload)
    assert response.status_code == 201, response.text
    return response.json()


def get_month(client: TestClient, month: str = "2026-11") -> dict:
    response = client.get(f"/api/life/months/{month}")
    assert response.status_code == 200, response.text
    return response.json()


def test_empty_month_and_budget_upsert(client: TestClient) -> None:
    month = get_month(client)
    assert month["budget"] is None
    assert month["items"] == []
    assert month["summary"]["budget_amount"] is None
    assert month["summary"]["remaining_amount"] is None

    created = client.put("/api/life/months/2026-11/budget", json={"amount": 1000, "note": "本月"})
    assert created.json() == {"amount": 1000.0, "note": "本月"}

    updated = client.put("/api/life/months/2026-11/budget", json={"amount": 800})
    assert updated.json() == {"amount": 800.0, "note": None}


def test_item_statuses_and_summary(client: TestClient) -> None:
    configure_budget(client)
    add_item(client, name="机械键盘", estimated_price=399)
    add_item(
        client,
        name="牛奶",
        category="食品",
        estimated_price=30,
        actual_price=25,
        status="bought",
    )
    add_item(client, name="游戏机", estimated_price=2999, status="dropped")

    summary = get_month(client)["summary"]
    assert summary == {
        "budget_amount": 1000.0,
        "spent_amount": 25.0,
        "want_count": 1,
        "want_amount": 399.0,
        "bought_count": 1,
        "remaining_amount": 975.0,
        "usage_rate": 0.025,
        "counts": {"want": 1, "bought": 1, "dropped": 1},
    }


def test_mark_bought_requires_actual_price(client: TestClient) -> None:
    configure_budget(client)
    item = add_item(client, name="机械键盘", estimated_price=399)

    missing = client.patch(f"/api/life/items/{item['id']}", json={"status": "bought"})
    assert missing.status_code == 400

    marked = client.patch(
        f"/api/life/items/{item['id']}", json={"status": "bought", "actual_price": 350}
    )
    assert marked.status_code == 200
    assert marked.json()["status"] == "bought"
    assert marked.json()["actual_price"] == 350.0
    assert marked.json()["bought_at"] is not None

    month = get_month(client)
    assert month["summary"]["spent_amount"] == 350.0
    assert month["summary"]["counts"]["bought"] == 1
    assert month["summary"]["counts"]["want"] == 0


def test_month_isolation_and_delete(client: TestClient) -> None:
    configure_budget(client)
    dropped = add_item(client, name="游戏机", estimated_price=2999, status="dropped")
    add_item(client, month="2026-12", name="跨月物品")

    december = get_month(client, "2026-12")
    assert december["summary"]["counts"]["want"] == 1
    assert december["budget"] is None

    deleted = client.delete(f"/api/life/items/{dropped['id']}")
    assert deleted.status_code == 204
    assert get_month(client)["summary"]["counts"]["dropped"] == 0


def test_fund_lifecycle(client: TestClient) -> None:
    created = client.post(
        "/api/life/funds",
        json={
            "name": "去日本旅游",
            "target_amount": 20000,
            "monthly_plan": 1500,
            "category": "旅游",
        },
    )
    assert created.status_code == 201, created.text
    fund = created.json()
    assert fund["saved_amount"] == 0.0
    assert fund["progress"] == 0.0
    assert fund["remaining_amount"] == 20000.0

    entry = client.post(
        f"/api/life/funds/{fund['id']}/entries",
        json={"date": "2026-11-01", "amount": 8000, "note": "第一笔"},
    )
    assert entry.status_code == 201
    assert entry.json()["amount"] == 8000.0

    funds = client.get("/api/life/funds").json()
    assert funds[0]["saved_amount"] == 8000.0
    assert funds[0]["progress"] == 0.4
    assert funds[0]["remaining_amount"] == 12000.0
    assert funds[0]["status"] == "active"

    client.post(
        f"/api/life/funds/{fund['id']}/entries", json={"date": "2026-11-15", "amount": 12000}
    )
    funds = client.get("/api/life/funds").json()
    assert funds[0]["status"] == "done"

    renamed = client.patch(f"/api/life/funds/{fund['id']}", json={"name": "日本旅行基金"})
    assert renamed.json()["name"] == "日本旅行基金"

    deleted = client.delete(f"/api/life/funds/{fund['id']}")
    assert deleted.status_code == 204
    assert client.get("/api/life/funds").json() == []
