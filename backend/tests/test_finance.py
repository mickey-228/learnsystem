from fastapi.testclient import TestClient


def test_finance_summary_and_transactions(client: TestClient) -> None:
    client.post(
        "/api/finance/transactions",
        json={"date": "2026-11-05", "type": "income", "amount": 4000, "category": "收入"},
    )
    client.post(
        "/api/finance/transactions",
        json={"date": "2026-11-06", "type": "expense", "amount": 600, "category": "餐饮"},
    )
    client.post(
        "/api/finance/transactions",
        json={"date": "2026-11-07", "type": "expense", "amount": 400, "category": "学习"},
    )

    summary = client.get("/api/finance/summary?month=2026-11").json()
    assert summary["income"] == 4000.0
    assert summary["expense"] == 1000.0
    assert summary["balance"] == 3000.0
    assert summary["by_category"] == [
        {"category": "餐饮", "amount": 600.0, "pct": 0.6},
        {"category": "学习", "amount": 400.0, "pct": 0.4},
    ]

    transactions = client.get("/api/finance/transactions?month=2026-11").json()
    assert len(transactions) == 3

    # 月份隔离
    client.post(
        "/api/finance/transactions",
        json={"date": "2026-12-01", "type": "expense", "amount": 100, "category": "其他"},
    )
    assert client.get("/api/finance/summary?month=2026-11").json()["expense"] == 1000.0
    assert client.get("/api/finance/summary?month=2026-12").json()["expense"] == 100.0

    transaction_id = transactions[0]["id"]
    deleted = client.delete(f"/api/finance/transactions/{transaction_id}")
    assert deleted.status_code == 204
    assert len(client.get("/api/finance/transactions?month=2026-11").json()) == 2
