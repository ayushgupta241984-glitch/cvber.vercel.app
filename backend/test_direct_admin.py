from supabase import create_client
import os
import uuid
from dotenv import load_dotenv

# Load from the correct path
load_dotenv(".env")

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

print(f"URL: {url}")
print(f"Key provided: {'Yes' if key else 'No'}")

s = create_client(url, key)

def test_direct():
    email = f"direct_test_{uuid.uuid4().hex[:8]}@gmail.com"
    print(f"Testing direct admin registration for: {email}")
    try:
        # Try both styles just in case
        try:
            r = s.auth.admin.create_user(attributes={
                "email": email,
                "password": "DirectPassword123!",
                "email_confirm": True
            })
            print(f"Result (attributes keyword): SUCCESS - {r.user.id}")
        except Exception as e1:
            print(f"Result (attributes keyword) failed: {e1}")
            r = s.auth.admin.create_user({
                "email": email,
                "password": "DirectPassword123!",
                "email_confirm": True
            })
            print(f"Result (positional): SUCCESS - {r.user.id}")
    except Exception as e2:
        print(f"Both styles failed: {e2}")

if __name__ == "__main__":
    test_direct()
