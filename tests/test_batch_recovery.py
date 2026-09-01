import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.core.db import SessionLocal, init_db_schema
from backend.app.models import Customer, Transaction, RecoveryOpportunity, BatchRun, AuditLog
from agent.batch_engine import BatchAgentEngine
from data.seed_batch_recovery import seed_100_transaction_batch

client = TestClient(app)
init_db_schema()

def test_seed_100_transaction_batch():
    """
    Verifies seeding a controlled 100-transaction batch anchored by TX-10492.
    """
    db = SessionLocal()
    try:
        batch = seed_100_transaction_batch(db)
        assert batch is not None
        assert batch.total_transactions >= 90
        assert batch.revenue_at_risk > 0
        assert batch.expected_recovery > 0

        # Anchor transaction check
        anchor_tx = db.query(Transaction).filter(Transaction.transaction_code == "TX-10492").first()
        assert anchor_tx is not None
        assert anchor_tx.amount == 9999.00
    finally:
        db.close()

def test_batch_creation_and_execution():
    """
    Tests BatchAgentEngine creation, scoring, prioritization, and bounded execution.
    """
    db = SessionLocal()
    try:
        engine = BatchAgentEngine(db)
        batch = engine.create_batch_from_failed_transactions(batch_name="Test Automation Batch", limit=10)
        assert batch.id is not None
        assert batch.total_transactions > 0

        result = engine.run_batch_recovery(batch_id=batch.id)
        assert result["batch_id"] == batch.id
        assert "revenue_at_risk" in result
        assert "expected_recovery" in result
        assert "actual_recovered" in result
        assert "recovery_rate" in result
    finally:
        db.close()

def test_expected_vs_actual_recovery_calculation():
    """
    Verifies that Expected Recovery = Amount * Probability, while Actual Recovered represents empirical funds.
    """
    db = SessionLocal()
    try:
        opps = db.query(RecoveryOpportunity).all()
        for opp in opps:
            if opp.recovery_probability > 0:
                expected_calc = round(opp.amount * opp.recovery_probability, 2)
                assert abs(opp.expected_recovery - expected_calc) <= 0.05
            
            # Assert actual_recovered field exists and is tracked separately
            assert hasattr(opp, "actual_recovered")
            if opp.status == "RECOVERED" and opp.actual_recovered > 0:
                assert opp.actual_recovered == opp.amount
            elif opp.status in ["FAILED", "ESCALATED", "PENDING_APPROVAL"]:
                assert opp.actual_recovered == 0.0
    finally:
        db.close()

def test_bounded_retry_stopping_rules():
    """
    Asserts that reaching max_attempts (3) stops automatic retries and triggers an ESCALATED state.
    """
    db = SessionLocal()
    try:
        # Create transaction with max attempts reached
        cust = Customer(
            customer_code="CUST-MAX-ATTEMPT",
            name="Max Attempt Customer Ltd",
            email="max@attempts.com",
            tenure_months=12,
            lifetime_value=10000.0,
            historical_success_rate=0.80,
            total_transactions=10,
            engagement_score=0.70
        )
        db.add(cust)
        db.commit()

        tx = Transaction(
            transaction_code="TX-MAX-STOP",
            customer_id=cust.id,
            amount=5000.0,
            currency="INR",
            payment_method="CREDIT_CARD",
            status="FAILED",
            failure_reason="Temporary payment authorization failure"
        )
        db.add(tx)
        db.commit()

        opp = RecoveryOpportunity(
            transaction_id=tx.id,
            customer_id=cust.id,
            amount=5000.0,
            failure_reason=tx.failure_reason,
            status="FAILED",
            attempts_count=3, # Already reached max attempts (3)
            max_attempts=3
        )
        db.add(opp)
        db.commit()

        batch = BatchRun(name="Stopping Rule Test Batch", total_transactions=1, revenue_at_risk=5000.0)
        db.add(batch)
        db.commit()

        opp.batch_id = batch.id
        db.commit()

        engine = BatchAgentEngine(db)
        result = engine.run_batch_recovery(batch_id=batch.id)
        
        db.refresh(opp)
        assert opp.status == "ESCALATED"
        assert opp.escalated is True
    finally:
        db.close()

def test_batch_metrics_api():
    """
    Tests GET /api/v1/batch/metrics endpoint.
    """
    headers = {"Authorization": "Bearer role_token_OPERATOR"}
    res = client.get("/api/v1/batch/metrics", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert "revenue_at_risk" in data
    assert "expected_recovery" in data
    assert "actual_recovered" in data
    assert "recovery_rate" in data
    assert "escalated_count" in data

def test_batch_audit_trail_api():
    """
    Tests GET /api/v1/batch/{batch_id}/audit endpoint.
    """
    db = SessionLocal()
    try:
        batch = db.query(BatchRun).first()
        assert batch is not None

        headers = {"Authorization": "Bearer role_token_OPERATOR"}
        res = client.get(f"/api/v1/batch/{batch.id}/audit", headers=headers)
        assert res.status_code == 200
        logs = res.json()
        assert isinstance(logs, list)
    finally:
        db.close()
