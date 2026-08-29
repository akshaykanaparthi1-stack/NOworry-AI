import requests
import json
import uuid
from backend.app.core.config import settings

SUPABASE_URL = settings.SUPABASE_URL.rstrip('/')
SECRET_KEY = settings.SUPABASE_SECRET_KEY
PUBLISHABLE_KEY = settings.SUPABASE_PUBLISHABLE_KEY

headers = {
    "apikey": SECRET_KEY or PUBLISHABLE_KEY,
    "Authorization": f"Bearer {SECRET_KEY or PUBLISHABLE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "resolution=merge-duplicates"
}

def seed_supabase_tables():
    print(f"Connecting to Supabase REST API at {SUPABASE_URL}...")

    # 1. Seed Profiles Table
    profiles_data = [
        {
            "auth_user_id": str(uuid.uuid4()),
            "full_name": "System Administrator",
            "email": "admin@noworry.ai",
            "role": "ADMIN"
        },
        {
            "auth_user_id": str(uuid.uuid4()),
            "full_name": "System Operator",
            "email": "operator@noworry.ai",
            "role": "OPERATOR"
        },
        {
            "auth_user_id": str(uuid.uuid4()),
            "full_name": "Revenue Analyst",
            "email": "analyst@noworry.ai",
            "role": "ANALYST"
        }
    ]

    prof_resp = requests.post(f"{SUPABASE_URL}/rest/v1/profiles", headers=headers, json=profiles_data)
    print(f"Profiles Seed Response: {prof_resp.status_code} - {prof_resp.text}")

    # 2. Seed Customer (CUST-10492)
    cust_id = "c1049200-0000-0000-0000-000000000000"
    customer_data = [{
        "id": cust_id,
        "customer_code": "CUST-10492",
        "name": "Acme Global Solutions",
        "email": "billing@acmeglobal.com",
        "tenure_months": 18,
        "lifetime_value": 125000.00,
        "historical_success_rate": 0.9400,
        "previous_failures_count": 1,
        "engagement_score": 0.8800,
        "segment": "ENTERPRISE"
    }]
    cust_resp = requests.post(f"{SUPABASE_URL}/rest/v1/customers", headers=headers, json=customer_data)
    print(f"Customers Seed Response: {cust_resp.status_code} - {cust_resp.text}")

    # 3. Seed Transaction (TX-10492)
    tx_id = "t1049200-0000-0000-0000-000000000000"
    tx_data = [{
        "id": tx_id,
        "transaction_code": "TX-10492",
        "customer_id": cust_id,
        "amount": 9999.00,
        "currency": "INR",
        "payment_method": "CREDIT_CARD",
        "status": "FAILED",
        "failure_reason": "Temporary payment authorization failure",
        "failure_code": "AUTH_FAILED",
        "days_since_previous_payment": 30,
        "previous_failures_count": 1
    }]
    tx_resp = requests.post(f"{SUPABASE_URL}/rest/v1/transactions", headers=headers, json=tx_data)
    print(f"Transactions Seed Response: {tx_resp.status_code} - {tx_resp.text}")

    # 4. Seed Recovery Opportunity (TX-10492)
    opp_id = "o1049200-0000-0000-0000-000000000000"
    opp_data = [{
        "id": opp_id,
        "transaction_id": tx_id,
        "customer_id": cust_id,
        "amount": 9999.00,
        "failure_reason": "Temporary payment authorization failure",
        "recovery_probability": 0.9548,
        "expected_recovery": 9547.05,
        "recommended_action": "RETRY_PAYMENT",
        "priority": "HIGH",
        "status": "DETECTED"
    }]
    opp_resp = requests.post(f"{SUPABASE_URL}/rest/v1/recovery_opportunities", headers=headers, json=opp_data)
    print(f"Recovery Opportunities Seed Response: {opp_resp.status_code} - {opp_resp.text}")

if __name__ == "__main__":
    seed_supabase_tables()
