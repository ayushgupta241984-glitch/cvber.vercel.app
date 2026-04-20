import requests
import json

try:
    print("Trying Register...")
    res1 = requests.post("http://localhost:8000/auth/register", json={"email": "mentor_test@example.com", "password": "TestPassword123!", "full_name": "Mentor Test"})
    
    if res1.status_code == 400 and "User already registered" in res1.text:
       print("Already registered, trying Login...")
       res1 = requests.post("http://localhost:8000/auth/login", json={"email": "mentor_test@example.com", "password": "TestPassword123!"})
       
    print("Auth Status:", res1.status_code)
    token = res1.json().get("access_token")
    
    if token:
        print("\nTrying Mentor Chat...")
        headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
        payload = {"message": "hey", "history": []}
        res2 = requests.post("http://localhost:8000/mentor/chat", json=payload, headers=headers)
        print("Mentor Status:", res2.status_code)
        print("Mentor Response:", res2.text)
    else:
        print("No token received", res1.text)
        
except Exception as e:
    print("Error:", e)
