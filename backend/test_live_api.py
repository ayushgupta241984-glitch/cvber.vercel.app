import httpx
import uuid

def test_live_registration():
    url = "https://cvber-free-las-app.onrender.com/auth/register"
    email = f"live_test_{uuid.uuid4().hex[:8]}@example.com"
    payload = {
        "email": email,
        "password": "LivePassword123!",
        "full_name": "Live Test User"
    }
    
    print(f"Testing registration for: {email}")
    try:
        r = httpx.post(url, json=payload, timeout=30.0)
        print(f"Status: {r.status_code}")
        print(f"Response: {r.text}")
    except Exception as e:
        print(f"Request failed: {e}")

if __name__ == "__main__":
    test_live_registration()
