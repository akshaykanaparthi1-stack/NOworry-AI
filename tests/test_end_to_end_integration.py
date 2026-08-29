import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.core.db import SessionLocal
from backend.app.models.transaction import Transaction
from backend.app.models.opportunity import RecoveryOpportunity
from backend.app.models.action import RecoveryAction
from backend.app.models.audit_log import AuditLog
from backend.app.models.customer import Customer
from ml.predict import predict_recovery

client = TestClient(app)

def test_full_tx_10492_end_to_end_integration():
    """
    Executes and verifies full end-to-end integration flow for TX-10492:
    Retrieval -> ML Prediction -> Policy Check -> Human Approval -> 
    Simulated Execution -> Database Update -> Audit Log -> Dashboard Refresh
    """
    db = SessionLocal()
    try:
        # 1. Reset demo state to clean baseline
        reset_res = client.post("/api/v1/demo/reset")
        assert reset_res.status_code == 200

        # 2. Verify Transaction & Customer Retrieval
        tx = db.query(Transaction).filter(Transaction.transaction_code == "TX-10492").first()
        assert tx is not None, "TX-10492 must exist in database"
        assert tx.amount == 9999.0
        
        cust = db.query(Customer).filter(Customer.id == tx.customer_id).first()
        assert cust is not None
        assert cust.customer_code == "CUST-10492"

        # 3. Verify Real ML Prediction
        ml_res = predict_recovery({
            "transaction_amount": tx.amount,
            "payment_method": tx.payment_method,
            "failure_reason": tx.failure_reason,
            "customer_tenure": cust.tenure_months,
            "historical_payment_success": cust.historical_success_rate,
            "previous_failures": tx.previous_failures_count,
            "customer_lifetime_value": cust.lifetime_value,
            "engagement_score": cust.engagement_score,
            "churn_probability": 0.08,
            "days_since_previous_payment": tx.days_since_previous_payment,
            "transaction_history": cust.total_transactions
        })
        assert "probability" in ml_res
        assert "expected_recovery" in ml_res
        assert ml_res["probability"] > 0.50

        # 4. Fetch initial Dashboard Summary before agent run
        dash_before = client.get("/api/v1/dashboard/summary").json()

        # 5. Execute Agent Run (Triggers Steps 1 through 8 -> Policy Check -> WAITING_APPROVAL)
        agent_res = client.post("/api/v1/agent/run", json={"transaction_code_or_id": "TX-10492", "human_approved": False})
        assert agent_res.status_code == 200
        run_data = agent_res.json()
        
        assert run_data["status"] == "WAITING_APPROVAL"
        assert run_data["policy"]["requires_human_approval"] is True
        
        run_id = run_data["agent_run_id"]

        # 6. Perform Human Approval (Triggers Steps 9 through 11 -> Execution -> Verification -> Audit)
        approve_res = client.post("/api/v1/agent/approve", json={"agent_run_id": run_id, "approved": True})
        assert approve_res.status_code == 200
        approved_data = approve_res.json()
        
        assert approved_data["status"] == "COMPLETED"

        # 7. Verify Database Updates
        db.expire_all()
        tx_after = db.query(Transaction).filter(Transaction.transaction_code == "TX-10492").first()
        opp_after = db.query(RecoveryOpportunity).filter(RecoveryOpportunity.transaction_id == tx_after.id).first()
        
        assert tx_after.status == "RECOVERED"
        assert opp_after.status == "RECOVERED"

        # 8. Verify Recovery Action & Audit Log Creation
        actions = db.query(RecoveryAction).filter(RecoveryAction.opportunity_id == opp_after.id).all()
        assert len(actions) > 0
        assert actions[0].status == "SUCCESS"
        assert actions[0].execution_mode == "SIMULATION"

        audit_logs = db.query(AuditLog).filter(AuditLog.agent_run_id == run_id).all()
        assert len(audit_logs) > 0
        assert audit_logs[0].execution_result == "SUCCESS"

        # 9. Verify Dashboard Metrics Updated Real-Time
        dash_after = client.get("/api/v1/dashboard/summary").json()
        assert dash_after["revenue_recovered"] >= dash_before["revenue_recovered"] + 9999.0
        assert dash_after["successful_actions"] >= dash_before["successful_actions"] + 1

    finally:
        db.close()
