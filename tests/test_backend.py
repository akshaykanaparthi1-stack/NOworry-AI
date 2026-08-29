import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.core.db import SessionLocal
from backend.app.models.transaction import Transaction

client = TestClient(app)

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["product"] == "NoWorry AI — Autonomous Revenue Recovery Agent"

def test_dashboard_summary():
    response = client.get("/api/v1/dashboard/summary")
    assert response.status_code == 200
    data = response.json()
    assert "revenue_at_risk" in data
    assert "recovery_rate" in data

def test_opportunities_list():
    response = client.get("/api/v1/opportunities")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert len(data["items"]) > 0

def test_tx_10492_agent_run():
    # Trigger run on demo transaction TX-10492 (Amount = 9,999 INR -> Gated by Policy for approval)
    response = client.post("/api/v1/agent/run", json={"transaction_code_or_id": "TX-10492", "human_approved": False})
    assert response.status_code == 200
    data = response.json()
    assert data["status"] in ["WAITING_APPROVAL", "COMPLETED"]
    assert data["transaction_code"] == "TX-10492"

    # Now approve
    run_id = data["agent_run_id"]
    app_response = client.post("/api/v1/agent/approve", json={"agent_run_id": run_id, "approved": True})
    assert app_response.status_code == 200
    app_data = app_response.json()
    assert app_data["status"] == "COMPLETED"

def test_roi_calculator():
    req_data = {
        "monthly_transactions": 10000,
        "avg_transaction_value": 2000.0,
        "failure_rate_percent": 10.0,
        "current_recovery_rate_percent": 10.0,
        "projected_ai_recovery_rate_percent": 60.0
    }
    response = client.post("/api/v1/roi/calculate", json=req_data)
    assert response.status_code == 200
    res = response.json()
    assert res["monthly_revenue"] == 20000000.0
    assert res["revenue_at_risk"] == 2000000.0
    assert res["current_recovered_revenue"] == 200000.0
    assert res["projected_recovered_revenue"] == 1200000.0
    assert res["additional_monthly_revenue"] == 1000000.0
    assert res["annualized_revenue_impact"] == 12000000.0
