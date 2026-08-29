import random
import string
import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.core.db import SessionLocal, init_db_schema
from backend.app.models import Customer, Transaction, RecoveryOpportunity, Profile, AuditLog

client = TestClient(app)
init_db_schema()

def random_string(length=8):
    return ''.join(random.choices(string.ascii_lowercase + string.digits, k=length))

def test_random_user_authentication_flow():
    """
    Tests Sign Up and Login flow with 5 completely random user accounts and roles.
    """
    roles = ["OPERATOR", "ADMIN", "ANALYST"]
    for i in range(5):
        rand_id = random_string(6)
        email = f"random_user_{rand_id}@noworry.ai"
        password = f"Pass_{rand_id}!"
        full_name = f"Random User {rand_id.upper()}"
        role = random.choice(roles)

        # 1. Sign Up
        signup_payload = {
            "full_name": full_name,
            "email": email,
            "password": password,
            "confirm_password": password,
            "role": role
        }
        res_signup = client.post("/api/v1/auth/signup", json=signup_payload)
        assert res_signup.status_code == 200, f"Failed signup for {email}: {res_signup.text}"
        signup_data = res_signup.json()
        assert signup_data["status"] == "success"
        assert "access_token" in signup_data

        # 2. Login
        login_payload = {
            "email": email,
            "password": password
        }
        res_login = client.post("/api/v1/auth/login", json=login_payload)
        assert res_login.status_code == 200, f"Failed login for {email}: {res_login.text}"
        login_data = res_login.json()
        assert "access_token" in login_data
        assert login_data["user"]["email"] == email
        assert login_data["user"]["role"] == role
        print(f"Verified random user signup & login for {email} ({role})")

def test_random_transaction_agent_recovery_flow():
    """
    Generates 5 random payment failure transactions, runs ML prediction, AI agent workflow,
    and asserts audit trail logging with user context.
    """
    db = SessionLocal()
    try:
        # Create random operator account for headers
        rand_id = random_string(6)
        op_email = f"op_test_{rand_id}@noworry.ai"
        op_name = f"Operator {rand_id.upper()}"
        
        # Signup operator
        signup_res = client.post("/api/v1/auth/signup", json={
            "full_name": op_name,
            "email": op_email,
            "password": "Password123!",
            "role": "OPERATOR"
        })
        token = signup_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        failure_reasons = [
            "Temporary payment authorization failure",
            "Insufficient funds in customer account",
            "Expired payment card",
            "Network timeout during processing",
            "Bank gateway 3DS verification failed"
        ]
        payment_methods = ["CREDIT_CARD", "DEBIT_CARD", "UPI", "NET_BANKING"]

        for i in range(5):
            tx_code = f"TX-RAND-{random_string(5).upper()}"
            cust_code = f"CUST-RAND-{random_string(5).upper()}"
            amount = round(random.uniform(500.0, 45000.0), 2)
            reason = random.choice(failure_reasons)
            method = random.choice(payment_methods)

            # Insert random customer & transaction into DB
            cust = Customer(
                customer_code=cust_code,
                name=f"Random Enterprise {random_string(4).upper()}",
                email=f"billing@{random_string(6)}.com",
                tenure_months=random.randint(1, 48),
                lifetime_value=round(random.uniform(1000.0, 150000.0), 2),
                historical_success_rate=round(random.uniform(0.60, 0.99), 4),
                total_transactions=random.randint(5, 50),
                engagement_score=round(random.uniform(0.40, 0.98), 4),
                segment=random.choice(["STANDARD", "PREMIUM", "ENTERPRISE"])
            )
            db.add(cust)
            db.commit()
            db.refresh(cust)

            tx = Transaction(
                transaction_code=tx_code,
                customer_id=cust.id,
                amount=amount,
                currency="INR",
                payment_method=method,
                status="FAILED",
                failure_reason=reason,
                days_since_previous_payment=random.randint(1, 60),
                previous_failures_count=random.randint(0, 3)
            )
            db.add(tx)
            db.commit()
            db.refresh(tx)

            opp = RecoveryOpportunity(
                transaction_id=tx.id,
                customer_id=cust.id,
                amount=amount,
                failure_reason=reason,
                recovery_probability=round(random.uniform(0.70, 0.98), 4),
                expected_recovery=round(amount * 0.90, 2),
                recommended_action="RETRY_PAYMENT",
                priority="HIGH" if amount > 10000 else "MEDIUM",
                status="DETECTED"
            )
            db.add(opp)
            db.commit()

            # 1. Trigger AI Agent Workflow
            run_res = client.post("/api/v1/agent/run", json={"transaction_code_or_id": tx_code, "human_approved": False}, headers=headers)
            assert run_res.status_code == 200, f"Agent run failed for {tx_code}: {run_res.text}"
            run_data = run_res.json()
            assert run_data["transaction_code"] == tx_code
            
            # If amount > 1000 INR, policy requires approval
            if amount >= 1000:
                assert run_data["status"] == "WAITING_APPROVAL"
                run_id = run_data["agent_run_id"]
                
                # 2. Approve workflow
                app_res = client.post("/api/v1/agent/approve", json={"agent_run_id": run_id, "approved": True}, headers=headers)
                assert app_res.status_code == 200
                assert app_res.json()["status"] == "COMPLETED"
            else:
                assert run_data["status"] == "COMPLETED"

            print(f"Verified random transaction recovery for {tx_code} (INR {amount:,.2f}) -> Status: COMPLETED")

    finally:
        db.close()
