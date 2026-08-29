import requests
import json

SUPABASE_URL = "https://qtulrhuecnrlntbgusqt.supabase.co"
SUPABASE_PUBLISHABLE_KEY = "sb_publishable_t8wQQT4fBnxTibjBoOY91g_slUA0cQT"

def test_supabase_signup_and_login():
    email = "testuser_demo@noworry.ai"
    password = "Password123!"
    
    print("Testing Supabase Auth SignUp...")
    signup_url = f"{SUPABASE_URL}/auth/v1/signup"
    headers = {
        "apikey": SUPABASE_PUBLISHABLE_KEY,
        "Content-Type": "application/json"
    }
    body = {
        "email": email,
        "password": password,
        "data": {
            "full_name": "Demo Test User",
            "role": "OPERATOR"
        }
    }
    
    try:
        resp = requests.post(signup_url, headers=headers, json=body, timeout=8)
        print(f"SignUp HTTP Status: {resp.status_code}")
        print(f"SignUp Response Payload: {resp.text[:200]}")
    except Exception as e:
        print(f"SignUp Exception: {e}")

    print("\nTesting Supabase Auth Login...")
    login_url = f"{SUPABASE_URL}/auth/v1/token?grant_type=password"
    try:
        resp = requests.post(login_url, headers=headers, json={"email": email, "password": password}, timeout=8)
        print(f"Login HTTP Status: {resp.status_code}")
        print(f"Login Response Payload: {resp.text[:200]}")
    except Exception as e:
        print(f"Login Exception: {e}")

if __name__ == "__main__":
    test_supabase_signup_and_login()
