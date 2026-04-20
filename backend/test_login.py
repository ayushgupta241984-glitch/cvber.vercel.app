import requests
import json

try:
    print("Trying Register...")
    response = requests.post("http://localhost:8000/auth/register", json={"email": "testlogin2@example.com", "password": "TestPassword123!", "full_name": "Test User 2"})
    print("Register Status:", response.status_code)
    print("Register Response:", response.text)

    print("\nTrying Login...")
    response2 = requests.post("http://localhost:8000/auth/login", json={"email": "testlogin2@example.com", "password": "TestPassword123!"})
    print("Login Status:", response2.status_code)
    print("Login Response:", response2.text)
except Exception as e:
    print("Error:", e)
