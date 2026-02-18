import os
import uuid
import asyncio
from app.config import settings
from supabase import create_client
from app.routers.auth import register, login
from app.models.schemas import RegisterRequest, LoginRequest

async def test_auth():
    print(f"Testing with URL: {settings.supabase_url}")
    
    test_email = f"real_test_v2_{uuid.uuid4().hex[:8]}@example.com"
    test_pass = "TestPassword123!"
    full_name = "Real Test User V2"
    
    print(f"--- Testing Registration for {test_email} ---")
    reg_request = RegisterRequest(email=test_email, password=test_pass, full_name=full_name)
    
    try:
        reg_response = await register(reg_request)
        print("Registration SUCCESS")
        print(f"Access Token: {reg_response.access_token[:20]}...")
    except Exception as e:
        print(f"Registration FAILED: {e}")
        return

    print(f"--- Testing Login for {test_email} ---")
    login_request = LoginRequest(email=test_email, password=test_pass)
    
    try:
        login_response = await login(login_request)
        print("Login SUCCESS")
        print(f"Access Token: {login_response.access_token[:20]}...")
    except Exception as e:
        print(f"Login FAILED: {e}")

if __name__ == "__main__":
    asyncio.run(test_auth())
