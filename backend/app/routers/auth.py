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
        # Register user with Supabase Admin API to skip email confirmation
        # We use the admin api because we have the service_role_key initialized in 'supabase' client
        try:
            # Create user and auto-confirm email
            user_attributes = {
                "email": request.email,
                "password": request.password,
                "email_confirm": True,
                "user_metadata": {"full_name": request.full_name}
            }
            # Note: supabase-py v2+ often expects keyword arguments
            admin_response = supabase.auth.admin.create_user(attributes=user_attributes)
            
            if not admin_response.user:
                 raise Exception("Admin creation failed: No user returned")
                 
            user_id = admin_response.user.id
            
        except Exception as create_error:
            # Fallback or specific error handling
            # If user already exists, this typically throws.
            raise HTTPException(status_code=400, detail=f"Registration failed: {str(create_error)}")

        # Now sign in to get tokens
        auth_response = supabase.auth.sign_in_with_password(credentials={
            "email": request.email,
            "password": request.password
        })
        
        if not auth_response.user:
            raise HTTPException(status_code=400, detail="Registration successful but auto-login failed")
        
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
            # Check if it is a missing table error to give better logs
            error_msg = str(profile_error)
            if "relation \"public.profiles\" does not exist" in error_msg or "42P01" in error_msg:
                print(f"CRITICAL WARNING: Database schema not initialized. 'profiles' table missing. Run migrations!")
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
        import traceback
        tb = traceback.format_exc()
        print(f"Registration error:\n{tb}")
        # Improve error message for specific cases
        msg = str(e)
        if "User already registered" in msg:
            raise HTTPException(status_code=400, detail="User already registered")
        
        # Include raw error for debugging the "User not allowed" issue
        raise HTTPException(status_code=400, detail=f"Registration failed: {msg} (Traceback: {tb[:200]}...)")


@router.post("/login", response_model=AuthTokens)
async def login(request: LoginRequest):
    """
    Login with email and password.
    
    - Authenticates user
    - Returns JWT tokens
    """
    try:
        # Authenticate with Supabase
        auth_response = supabase.auth.sign_in_with_password(credentials={
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


from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    return user_id

@router.get("/me", response_model=UserProfile)
async def get_current_user_profile(user_id: str = Depends(get_current_user)):
    """Get current user profile."""
    try:
        response = supabase.table("profiles")\
            .select("*")\
            .eq("id", user_id)\
            .single()\
            .execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="User not found")
        
        return response.data
        
    except Exception as e:
        error_msg = str(e)
        if "relation \"public.profiles\" does not exist" in error_msg or "42P01" in error_msg:
             raise HTTPException(
                 status_code=503, 
                 detail="Database schema not initialized. Please run migrations."
             )
        raise HTTPException(status_code=500, detail=f"Failed to fetch profile: {str(e)}")
