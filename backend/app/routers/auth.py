from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from supabase import create_client
from app.config import settings
from app.models.schemas import LoginRequest, RegisterRequest, AuthTokens, UserProfile
from uuid import uuid4

router = APIRouter(prefix="/auth", tags=["auth"])

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Supabase client
supabase = create_client(settings.supabase_url, settings.supabase_service_role_key)


def create_access_token(data: dict, expires_delta: timedelta = None):
    """Create JWT access token."""
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.access_token_expire_minutes)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.jwt_secret, algorithm=settings.jwt_algorithm)
    
    return encoded_jwt


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against hash."""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Hash password."""
    return pwd_context.hash(password)


@router.post("/register", response_model=AuthTokens)
async def register(request: RegisterRequest):
    """
    Register new user with email and password.
    
    - Creates user in Supabase Auth
    - Creates profile record (optional, won't fail signup)
    - Returns JWT tokens
    """
    try:
        # Register user with Supabase Auth
        auth_response = supabase.auth.sign_up({
            "email": request.email,
            "password": request.password
        })
        
        if not auth_response.user:
            raise HTTPException(status_code=400, detail="Registration failed - no user returned")
        
        user_id = auth_response.user.id
        
        # Try to create profile (optional - won't fail signup if profiles table doesn't exist)
        try:
            profile = {
                "id": user_id,
                "email": request.email,
                "full_name": request.full_name,
                "created_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat()
            }
            supabase.table("profiles").insert(profile).execute()
        except Exception as profile_error:
            # Profile creation is optional - log but don't fail
            print(f"Warning: Could not create profile: {profile_error}")
        
        # Create JWT tokens
        access_token = create_access_token(
            data={"sub": user_id, "email": request.email}
        )
        
        refresh_token = create_access_token(
            data={"sub": user_id, "email": request.email},
            expires_delta=timedelta(days=7)
        )
        
        return AuthTokens(
            access_token=access_token,
            refresh_token=refresh_token,
            expires_in=settings.access_token_expire_minutes * 60
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Registration error: {type(e).__name__}: {e}")
        raise HTTPException(status_code=400, detail=f"Registration failed: {str(e)}")


@router.post("/login", response_model=AuthTokens)
async def login(request: LoginRequest):
    """
    Login with email and password.
    
    - Authenticates user
    - Returns JWT tokens
    """
    try:
        # Authenticate with Supabase
        auth_response = supabase.auth.sign_in_with_password({
            "email": request.email,
            "password": request.password
        })
        
        if not auth_response.user:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        user_id = auth_response.user.id
        
        # Create JWT tokens
        access_token = create_access_token(
            data={"sub": user_id, "email": request.email}
        )
        
        refresh_token = create_access_token(
            data={"sub": user_id, "email": request.email},
            expires_delta=timedelta(days=7)
        )
        
        return AuthTokens(
            access_token=access_token,
            refresh_token=refresh_token,
            expires_in=settings.access_token_expire_minutes * 60
        )
        
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Login failed: {str(e)}")


@router.get("/me", response_model=UserProfile)
async def get_current_user_profile():
    """Get current user profile.
    TODO: Implement JWT token validation from headers."""
    try:
        # Placeholder - extract user_id from JWT token
        user_id = "00000000-0000-0000-0000-000000000000"
        
        response = supabase.table("profiles")\
            .select("*")\
            .eq("id", user_id)\
            .single()\
            .execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="User not found")
        
        return response.data
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch profile: {str(e)}")
