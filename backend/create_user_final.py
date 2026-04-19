from supabase import create_client
import os
import uuid
from dotenv import load_dotenv

# Load from the correct path
load_dotenv(".env")

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

s = create_client(url, key)

def create_user():
    email = os.getenv("ADMIN_EMAIL", "gupta16192425@gmail.com")
    password = os.getenv("ADMIN_PASSWORD")
    if not password:
        print("ERROR: ADMIN_PASSWORD not set in environment.")
        return False
    full_name = "Ayush Gupta"
    
    print(f"Manually creating user: {email}")
    try:
        r = s.auth.admin.create_user(attributes={
            "email": email,
            "password": password,
            "email_confirm": True,
            "user_metadata": {"full_name": full_name}
        })
        print(f"SUCCESS: User {r.user.id} created.")
        return True
    except Exception as e:
        print(f"FAILED: {e}")
        return False

if __name__ == "__main__":
    create_user()
