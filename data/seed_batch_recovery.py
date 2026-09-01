import random
import uuid
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from backend.app.core.db import SessionLocal, init_db_schema
from backend.app.models import Customer, Transaction, RecoveryOpportunity, BatchRun, Profile
from agent.batch_engine import BatchAgentEngine

def seed_100_transaction_batch(db: Session = None):
    """
    Seeds a controlled 100-transaction dataset anchored by TX-10492 into Supabase/PostgreSQL.
    Runs the BatchAgentEngine to score, prioritize, and calculate Expected vs Actual recovery.
    """
    close_session = False
    if db is None:
        init_db_schema()
        db = SessionLocal()
        close_session = True

    try:
        print("Seeding 100-Transaction Batch Revenue Recovery Dataset...")

        # 1. Anchor Transaction TX-10492 & Customer CUST-10492
        anchor_cust = db.query(Customer).filter(Customer.customer_code == "CUST-10492").first()
        if not anchor_cust:
            anchor_cust = Customer(
                customer_code="CUST-10492",
                name="Acme Global Solutions",
                email="billing@acmeglobal.com",
                tenure_months=18,
                lifetime_value=125000.00,
                historical_success_rate=0.94,
                total_transactions=24,
                engagement_score=0.88,
                segment="ENTERPRISE"
            )
            db.add(anchor_cust)
            db.commit()
            db.refresh(anchor_cust)

        anchor_tx = db.query(Transaction).filter(Transaction.transaction_code == "TX-10492").first()
        if not anchor_tx:
            anchor_tx = Transaction(
                transaction_code="TX-10492",
                customer_id=anchor_cust.id,
                amount=9999.00,
                currency="INR",
                payment_method="CREDIT_CARD",
                status="FAILED",
                failure_reason="Temporary payment authorization failure",
                days_since_previous_payment=30,
                previous_failures_count=1
            )
            db.add(anchor_tx)
            db.commit()
            db.refresh(anchor_tx)

        tx_list = [anchor_tx]

        # 2. Synthetic 100 Failed Transactions (0 to 99)
        failure_reasons = [
            "Temporary payment authorization failure",
            "Insufficient funds in customer account",
            "Expired payment card",
            "Network timeout during processing",
            "Bank gateway 3DS verification failed"
        ]
        payment_methods = ["CREDIT_CARD", "DEBIT_CARD", "UPI", "NET_BANKING"]
        segments = ["STANDARD", "PREMIUM", "ENTERPRISE"]

        for i in range(0, 100):
            tx_code = f"TX-BATCH-{i:03d}"
            cust_code = f"CUST-BATCH-{i:03d}"
            
            cust = db.query(Customer).filter(Customer.customer_code == cust_code).first()
            if not cust:
                cust = Customer(
                    customer_code=cust_code,
                    name=f"Enterprise Client {i:03d} Ltd",
                    email=f"billing.client{i:03d}@enterprise.in",
                    tenure_months=random.randint(2, 48),
                    lifetime_value=round(random.uniform(5000.0, 200000.0), 2),
                    historical_success_rate=round(random.uniform(0.65, 0.98), 4),
                    total_transactions=random.randint(5, 60),
                    engagement_score=round(random.uniform(0.40, 0.96), 4),
                    segment=random.choice(segments)
                )
                db.add(cust)
                db.commit()
                db.refresh(cust)

            tx = db.query(Transaction).filter(Transaction.transaction_code == tx_code).first()
            if not tx:
                reason_desc = random.choice(failure_reasons)
                # Varied amount distribution
                if i % 5 == 0:
                    amount = round(random.uniform(15000.0, 45000.0), 2)
                elif i % 2 == 0:
                    amount = round(random.uniform(2500.0, 9500.0), 2)
                else:
                    amount = round(random.uniform(500.0, 2400.0), 2)

                tx = Transaction(
                    transaction_code=tx_code,
                    customer_id=cust.id,
                    amount=amount,
                    currency="INR",
                    payment_method=random.choice(payment_methods),
                    status="FAILED",
                    failure_reason=reason_desc,
                    days_since_previous_payment=random.randint(1, 45),
                    previous_failures_count=random.randint(0, 3)
                )
                db.add(tx)
                db.commit()
                db.refresh(tx)

            tx_list.append(tx)

        print(f"Created {len(tx_list)} Transactions in DB (Anchor TX-10492 + 100 Synthetic Txs).")

        # 3. Create Batch Run
        engine = BatchAgentEngine(db)
        batch = engine.create_batch_from_failed_transactions(
            batch_name="Q3 Enterprise Revenue Leakage Recovery Batch",
            transaction_ids=[t.id for t in tx_list],
            limit=len(tx_list)
        )

        # 4. Run Batch Engine Execution
        result = engine.run_batch_recovery(batch_id=batch.id)

        print("\n=================================================================")
        print("          BATCH REVENUE RECOVERY DEMO SEED COMPLETED             ")
        print("=================================================================")
        print(f"  * Batch ID:               {result['batch_id']}")
        print(f"  * Transactions Analyzed:   {result['total_transactions']}")
        print(f"  * Revenue at Risk:        INR {result['revenue_at_risk']:,.2f}")
        print(f"  * Expected Recovery:       INR {result['expected_recovery']:,.2f} (ML Predicted)")
        print(f"  * ACTUAL RECOVERED MONEY:  INR {result['actual_recovered']:,.2f}")
        print(f"  * Recovery Rate:           {result['recovery_rate']:.2f}%")
        print(f"  * Successful Recoveries:   {result['successful_recoveries']}")
        print(f"  * Failed / Retried:        {result['failed_recoveries']}")
        print(f"  * Escalated Count:         {result['escalated_count']}")
        print(f"  * Pending Approval:        {result['pending_approval_count']}")
        print("=================================================================\n")

        return batch

    finally:
        if close_session:
            db.close()

if __name__ == "__main__":
    seed_100_transaction_batch()
