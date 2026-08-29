import requests

def test_login_endpoint():
    url = "http://127.0.0.1:8000/api/v1/auth/login"
    payload = {
        "email": "admin@noworry.ai",
        "password": "password123"
    }
    resp = requests.post(url, json=payload)
    print(f"Status Code: {resp.status_code}")
    print(f"Response Body: {resp.text}")

if __name__ == "__main__":
    test_login_endpoint()
