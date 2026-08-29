import sys
import os
import uuid
from datetime import datetime, timezone, timedelta
import random

# Add root directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.app.core.db import engine, Base, SessionLocal
from backend.app.models.customer import Customer
from backend.app.models.transaction import Transaction
from backend.app.models.opportunity import RecoveryOpportunity
from backend.app.models.action import RecoveryAction
from backend.app.models.prediction import AIPrediction
from backend.app.models.agent_run import AgentRun
from backend.app.models.audit_log import AuditLog
from ml.predictor import predict_recovery

def seed_database():
    print("Creating database schema tables...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        print("Seeding database with customers, transactions, and recovery opportunities...")

        # 1. Primary Demo Transaction Customer: Acme Corp / TX-10492
        demo_customer = Customer(
            id=str(uuid.uuid4()),
            customer_code="CUST-10492",
            name="Acme Global Solutions",
            email="finance@acmeglobal.com",
            segment="Enterprise",
            tenure_months=18,
            lifetime_value=125000.0,
            historical_success_rate=0.94,
            total_transactions=24,
            engagement_score=0.92
        )
        db.add(demo_customer)
        db.flush()

        # Seed TX-10492 exact demo transaction
        demo_tx = Transaction(
            id=str(uuid.uuid4()),
            transaction_code="TX-10492",
            customer_id=demo_customer.id,
            amount=9999.0,
            currency="INR",
            payment_method="CREDIT_CARD",
            failure_reason="Temporary payment authorization failure",
            status="FAILED",
            days_since_previous_payment=30,
            previous_failures_count=0,
            created_at=datetime.now(timezone.utc) - timedelta(hours=2)
        )
        db.add(demo_tx)
        db.flush()

        # Predict ML score for TX-10492
        tx_data = {
            "amount": demo_tx.amount,
            "payment_method": demo_tx.payment_method,
            "failure_reason": "AUTH_FAILED",
            "tenure_months": demo_customer.tenure_months,
            "historical_success_rate": demo_customer.historical_success_rate,
            "previous_failures_count": demo_tx.previous_failures_count,
            "lifetime_value": demo_customer.lifetime_value,
            "engagement_score": demo_customer.engagement_score,
            "churn_probability": 0.08,
            "days_since_previous_payment": demo_tx.days_since_previous_payment
        }
        pred_res = predict_recovery(tx_data)

        demo_opp = RecoveryOpportunity(
            id=str(uuid.uuid4()),
            transaction_id=demo_tx.id,
            customer_id=demo_customer.id,
            amount=demo_tx.amount,
            failure_reason=demo_tx.failure_reason,
            recovery_probability=pred_res["probability"],
            expected_recovery=pred_res["expected_recovery"],
            recommended_action="RETRY_PAYMENT",
            priority="HIGH",
            status="DETECTED"
        )
        db.add(demo_opp)

        # 2. Additional Realistic Enterprise Synthetic Customers & Transactions
        companies = [
            ("Apex Logistics", "billing@apexlogistics.io", "Enterprise", 36, 450000.0, 0.96, 48, 0.95),
            ("Zenith SaaS", "finance@zenithsaas.com", "Mid-Market", 12, 65000.0, 0.88, 14, 0.78),
            ("Starlight Health", "accounts@starlighthealth.org", "Enterprise", 24, 180000.0, 0.92, 26, 0.85),
            ("Vortex Commerce", "pay@vortexcommerce.net", "SMB", 6, 18000.0, 0.75, 8, 0.65),
            ("Nimbus Cloud", "billing@nimbuscloud.io", "Enterprise", 40, 520000.0, 0.98, 55, 0.96),
            ("Hyperion Retail", "finance@hyperion.com", "Mid-Market", 15, 85000.0, 0.86, 18, 0.82),
            ("Quantum Analytics", "pay@quantumanalytics.co", "SMB", 4, 12000.0, 0.70, 5, 0.55),
            ("Aura Technologies", "accounts@auratech.com", "Enterprise", 28, 310000.0, 0.94, 32, 0.90),
            ("Pinnacle Pay", "finance@pinnaclepay.in", "Mid-Market", 10, 48000.0, 0.82, 12, 0.74),
            ("CyberShield Security", "billing@cybershield.io", "Enterprise", 22, 240000.0, 0.91, 25, 0.88)
        ]

        failure_reasons_pool = [
            ("CARD_EXPIRED", "Card expired during subscription auto-renew", "SEND_PAYMENT_REMINDER"),
            ("INSUFFICIENT_FUNDS", "Insufficient balance in account", "SEND_PAYMENT_REMINDER"),
            ("AUTH_FAILED", "Temporary payment authorization failure", "RETRY_PAYMENT"),
            ("GATEWAY_TIMEOUT", "Bank gateway connection timeout", "RETRY_PAYMENT"),
            ("NETWORK_ERROR", "Network packet loss during transaction handshake", "RETRY_PAYMENT")
        ]

        payment_methods_pool = ["CREDIT_CARD", "UPI", "AUTO_DEBIT", "NET_BANKING"]

        for idx, (c_name, c_email, c_seg, c_ten, c_ltv, c_succ, c_tot, c_eng) in enumerate(companies, start=101):
            cust = Customer(
                id=str(uuid.uuid4()),
                customer_code=f"CUST-{idx}",
                name=c_name,
                email=c_email,
                segment=c_seg,
                tenure_months=c_ten,
                lifetime_value=c_ltv,
                historical_success_rate=c_succ,
                total_transactions=c_tot,
                engagement_score=c_eng
            )
            db.add(cust)
            db.flush()

            # Create 2 failed transactions per customer for rich dataset
            for t_idx in range(1, 3):
                tx_code = f"TX-{idx}{t_idx}"
                f_code, f_desc, rec_act = random.choice(failure_reasons_pool)
                p_method = random.choice(payment_methods_pool)
                amount = round(random.uniform(500, 25000), 2)
                prev_fail = random.randint(0, 3)

                tx = Transaction(
                    id=str(uuid.uuid4()),
                    transaction_code=tx_code,
                    customer_id=cust.id,
                    amount=amount,
                    currency="INR",
                    payment_method=p_method,
                    failure_reason=f_desc,
                    status="FAILED" if random.random() > 0.3 else "RECOVERED",
                    days_since_previous_payment=random.randint(5, 60),
                    previous_failures_count=prev_fail,
                    created_at=datetime.now(timezone.utc) - timedelta(days=random.randint(1, 30))
                )
                db.add(tx)
                db.flush()

                # Calculate ML prediction
                pred = predict_recovery({
                    "amount": amount,
                    "payment_method": p_method,
                    "failure_reason": f_code,
                    "tenure_months": c_ten,
                    "historical_success_rate": c_succ,
                    "previous_failures_count": prev_fail,
                    "lifetime_value": c_ltv,
                    "engagement_score": c_eng,
                    "churn_probability": round(1 - c_eng, 2),
                    "days_since_previous_payment": tx.days_since_previous_payment
                })

                priority = "HIGH" if amount >= 10000 or pred["probability"] >= 0.75 else ("MEDIUM" if amount >= 1000 else "LOW")
                opp_status = "DETECTED" if tx.status == "FAILED" else "RECOVERED"

                opp = RecoveryOpportunity(
                    id=str(uuid.uuid4()),
                    transaction_id=tx.id,
                    customer_id=cust.id,
                    amount=amount,
                    failure_reason=f_desc,
                    recovery_probability=pred["probability"],
                    expected_recovery=pred["expected_recovery"],
                    recommended_action=rec_act,
                    priority=priority,
                    status=opp_status
                )
                db.add(opp)

        db.commit()
        print("Database successfully seeded with demo records and TX-10492!")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
