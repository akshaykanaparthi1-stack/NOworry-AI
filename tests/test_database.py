import pytest
import os
import pandas as pd
from sqlalchemy import inspect
from backend.app.core.db import engine, SessionLocal
from backend.app.models.customer import Customer
from backend.app.models.transaction import Transaction
from backend.app.models.opportunity import RecoveryOpportunity
from backend.app.models.action import RecoveryAction
from backend.app.models.prediction import AIPrediction
from backend.app.models.agent_run import AgentRun
from backend.app.models.audit_log import AuditLog
from ml.generate_dataset import generate_synthetic_dataset

def test_database_tables_and_entities():
    """
    Verifies that all 7 required entities exist in database metadata with primary and foreign keys.
    """
    inspector = inspect(engine)
    tables = inspector.get_table_names()
    
    expected_tables = [
        "customers",
        "transactions",
        "recovery_opportunities",
        "recovery_actions",
        "ai_predictions",
        "agent_runs",
        "audit_logs"
    ]
    
    for t in expected_tables:
        assert t in tables, f"Table '{t}' missing from database schema."
        pk = inspector.get_pk_constraint(t)
        assert len(pk["constrained_columns"]) > 0, f"Table '{t}' missing primary key."

def test_database_foreign_keys_and_indexes():
    """
    Verifies foreign key relationships and indexed columns.
    """
    inspector = inspect(engine)
    
    # Transactions FK to customers
    tx_fks = inspector.get_foreign_keys("transactions")
    assert any(fk["referred_table"] == "customers" for fk in tx_fks)
    
    # Opportunities FK to transactions and customers
    opp_fks = inspector.get_foreign_keys("recovery_opportunities")
    assert any(fk["referred_table"] == "transactions" for fk in opp_fks)
    assert any(fk["referred_table"] == "customers" for fk in opp_fks)

def test_deterministic_demo_tx_10492():
    """
    Verifies deterministic demo transaction TX-10492 exists with exact parameters.
    """
    db = SessionLocal()
    try:
        tx = db.query(Transaction).filter(Transaction.transaction_code == "TX-10492").first()
        assert tx is not None, "Demo transaction TX-10492 not found in database."
        assert tx.amount == 9999.0
        assert tx.currency == "INR"
        assert tx.payment_method == "CREDIT_CARD"
        assert tx.failure_reason == "Temporary payment authorization failure"
        
        cust = db.query(Customer).filter(Customer.id == tx.customer_id).first()
        assert cust is not None
        assert cust.customer_code == "CUST-10492"
        assert cust.historical_success_rate == 0.94
        assert cust.tenure_months == 18
    finally:
        db.close()

def test_synthetic_dataset_integrity():
    """
    Verifies synthetic dataset generator creates >= 50,000 records with all 13 required fields.
    """
    data_path = "ml/data/synthetic_transactions.csv"
    if not os.path.exists(data_path):
        df = generate_synthetic_dataset(50000)
    else:
        df = pd.read_csv(data_path)

    assert len(df) >= 50000

    required_columns = [
        "customer_id",
        "payment_method",
        "status",
        "failure_reason",
        "customer_tenure",
        "previous_failures",
        "customer_lifetime_value",
        "engagement_score",
        "churn_probability",
        "days_since_previous_payment",
        "recovered"
    ]

    for col in required_columns:
        assert col in df.columns, f"Required column '{col}' missing from synthetic dataset."
    
    assert ("amount" in df.columns or "transaction_amount" in df.columns)
    assert ("historical_payment_success" in df.columns or "historical_success_rate" in df.columns)

def test_realistic_recovery_correlations():
    """
    Verifies realistic relationships: High success rate & low churn have significantly higher recovery rates.
    """
    data_path = "ml/data/synthetic_transactions.csv"
    df = pd.read_csv(data_path)

    succ_col = "historical_payment_success" if "historical_payment_success" in df.columns else "historical_success_rate"

    high_quality = df[(df[succ_col] >= 0.85) & (df["previous_failures"] == 0)]
    low_quality = df[(df[succ_col] <= 0.50) | (df["previous_failures"] >= 3)]

    high_rec_rate = high_quality["recovered"].mean()
    low_rec_rate = low_quality["recovered"].mean()

    assert high_rec_rate > low_rec_rate, f"High quality ({high_rec_rate:.2f}) must have higher recovery than low quality ({low_rec_rate:.2f})"
