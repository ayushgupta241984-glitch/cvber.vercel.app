import httpx
import uuid

def test_domains():
    url = "https://cvber-free-las-app.onrender.com/auth/register"
    domains = ["outlook.com", "icloud.com", "gmail.com", "cvber.test"]
    
    for d in domains:
        email = f"test_{uuid.uuid4().hex[:8]}@{d}"
        payload = {
            "email": email,
            "password": "Password123!",
            "full_name": f"Test {d}"
        }
        print(f"Testing domain: {d} ({email})")
        try:
            r = httpx.post(url, json=payload, timeout=20.0)
            print(f"  Status: {r.status_code}")
            print(f"  Body: {r.text}")
        except Exception as e:
            print(f"  Failed: {e}")

if __name__ == "__main__":
    test_domains()
