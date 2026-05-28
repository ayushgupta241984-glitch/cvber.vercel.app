from fastapi import APIRouter, HTTPException, Depends, Request
from datetime import datetime, timedelta
import jwt
from jwt import InvalidTokenError
from passlib.context import CryptContext
from app.supabase_client import get_supabase
from app.config import settings
from app.models.schemas import LoginRequest, RegisterRequest, AuthTokens, UserProfile, RefreshRequest
from app.dependencies import get_current_user
from app.rate_limiter import limiter
from uuid import uuid4
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["auth"])

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
supabase = get_supabase()


def _encode_jwt(payload: dict) -> str:
    token = jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)
    return token if isinstance(token, str) else token.decode("utf-8")


def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=settings.access_token_expire_minutes))
    to_encode.update({"exp": expire, "type": "access", "iss": "cvber-auth", "aud": "cvber-api"})
    return _encode_jwt(to_encode)


def create_refresh_token(data: dict):
    to_encode = data.copy()
    to_encode.update({"exp": datetime.utcnow() + timedelta(days=30), "type": "refresh", "iss": "cvber-auth", "aud": "cvber-api"})
    return _encode_jwt(to_encode)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


@router.post("/register", response_model=AuthTokens)
@limiter.limit("5/minute")
async def register(request: Request, body: RegisterRequest):
    try:
        user_attributes = {
            "email": body.email,
            "password": body.password,
            "email_confirm": True,
            "user_metadata": {"full_name": body.full_name or ""}
        }

        try:
            admin_response = supabase.auth.admin.create_user(user_attributes)
        except Exception as create_error:
            err_msg = str(create_error)
            if "already registered" in err_msg.lower():
                raise HTTPException(status_code=409, detail="User already registered")
            if "weak password" in err_msg.lower():
                raise HTTPException(status_code=400, detail="Password is too weak. Use at least 6 characters.")
            if "not allowed" in err_msg.lower():
                raise HTTPException(status_code=400, detail="Registration is disabled. Please enable 'User Signups' in your Supabase dashboard (Authentication > Settings).")
            logger.error(f"Admin create_user failed: {err_msg}")
            raise HTTPException(status_code=400, detail=f"Registration failed: {err_msg}")

        if not admin_response.user:
            raise HTTPException(status_code=400, detail="Registration failed: no user returned")

        user_id = admin_response.user.id

        try:
            auth_response = supabase.auth.sign_in_with_password({
                "email": body.email,
                "password": body.password
            })
        except Exception as login_err:
            logger.warning(f"Auto-login after registration failed: {login_err}")
            auth_response = None

        try:
            profile = {
                "id": user_id,
                "email": body.email,
                "full_name": body.full_name or "",
                "created_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat()
            }
            supabase.table("profiles").insert(profile).execute()
        except Exception as profile_error:
            err = str(profile_error)
            if "relation" in err or "42P01" in err:
                logger.warning("Profiles table missing. Run database migrations.")
            else:
                logger.warning(f"Profile creation warning: {err}")

        access_token = create_access_token(data={"sub": user_id, "email": body.email})
        refresh_token = create_refresh_token(data={"sub": user_id, "email": body.email})

        return AuthTokens(
            access_token=access_token,
            refresh_token=refresh_token,
            expires_in=settings.access_token_expire_minutes * 60
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Registration error: {e}")
        raise HTTPException(status_code=400, detail="Registration failed")


@router.post("/login", response_model=AuthTokens)
@limiter.limit("10/minute")
async def login(request: Request, body: LoginRequest):
    try:
        auth_response = supabase.auth.sign_in_with_password({
            "email": body.email,
            "password": body.password
        })

        if not auth_response or not auth_response.user:
            raise HTTPException(status_code=401, detail="Invalid email or password")

        user_id = auth_response.user.id

        access_token = create_access_token(data={"sub": user_id, "email": body.email})
        refresh_token = create_refresh_token(data={"sub": user_id, "email": body.email})

        return AuthTokens(
            access_token=access_token,
            refresh_token=refresh_token,
            expires_in=settings.access_token_expire_minutes * 60
        )

    except HTTPException:
        raise
    except Exception as e:
        err_msg = str(e)
        if "Invalid login credentials" in err_msg:
            raise HTTPException(status_code=401, detail="Invalid email or password")
        logger.error(f"Login error: {err_msg}")
        raise HTTPException(status_code=401, detail="Login failed")


# DEV LOGIN REMOVED - Security: using a hardcoded backdoor user with no authentication
# was a critical vulnerability. Use /auth/login with valid credentials instead.


@router.post("/refresh")
async def refresh_token(request: RefreshRequest):
    try:
        payload = jwt.decode(request.refresh_token, settings.jwt_secret, algorithms=[settings.jwt_algorithm], audience="cvber-api", issuer="cvber-auth", options={"require": ["exp", "aud", "iss"]})
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid refresh token")

        user_id = payload.get("sub")
        email = payload.get("email")
        if not user_id or not email:
            raise HTTPException(status_code=401, detail="Invalid refresh token payload")

        new_access = create_access_token(data={"sub": user_id, "email": email})
        new_refresh = create_refresh_token(data={"sub": user_id, "email": email})

        return {
            "access_token": new_access,
            "refresh_token": new_refresh,
            "token_type": "bearer",
            "expires_in": settings.access_token_expire_minutes * 60
        }
    except InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token")


@router.get("/oauth/{provider}")
async def oauth_login(provider: str):
    valid_providers = {"google", "github", "discord"}
    if provider not in valid_providers:
        raise HTTPException(status_code=400, detail=f"Unsupported provider. Use: {', '.join(valid_providers)}")

    try:
        redirect_to = f"{settings.backend_url}/auth/oauth/callback"
        response = supabase.auth.sign_in_with_oauth({
            "provider": provider,
            "options": {"redirect_to": redirect_to}
        })
        if not response or not response.url:
            raise HTTPException(status_code=500, detail="Failed to generate OAuth URL")
        return {"url": response.url, "provider": provider}
    except Exception as e:
        logger.error(f"OAuth URL generation failed for {provider}: {e}")
        raise HTTPException(status_code=500, detail=f"OAuth setup failed for {provider}")


@router.get("/oauth/callback")
async def oauth_callback(code: str = None, error: str = None, error_description: str = None):
    if error:
        raise HTTPException(status_code=400, detail=f"OAuth error: {error_description or error}")

    if not code:
        raise HTTPException(status_code=400, detail="Missing authorization code")

    try:
        session = supabase.auth.exchange_code_for_session({"auth_code": code})
        if not session or not session.user:
            raise HTTPException(status_code=401, detail="OAuth authentication failed")

        user_id = session.user.id
        email = session.user.email or ""

        access_token = create_access_token(data={"sub": user_id, "email": email})
        refresh_token = create_refresh_token(data={"sub": user_id, "email": email})

        try:
            profile = {
                "id": user_id,
                "email": email,
                "full_name": session.user.user_metadata.get("full_name", ""),
                "avatar_url": session.user.user_metadata.get("avatar_url", ""),
                "created_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat()
            }
            supabase.table("profiles").upsert(profile).execute()
        except Exception as e:
            logger.warning(f"Profile upsert after OAuth: {e}")

        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "expires_in": settings.access_token_expire_minutes * 60,
            "user": {
                "id": user_id,
                "email": email,
                "full_name": session.user.user_metadata.get("full_name", ""),
            }
        }
    except Exception as e:
        logger.error(f"OAuth callback error: {e}")
        raise HTTPException(status_code=500, detail="OAuth callback processing failed")


@router.get("/me", response_model=UserProfile)
async def get_current_user_profile(current_user: dict = Depends(get_current_user)):
    try:
        response = supabase.table("profiles").select("*").eq("id", current_user["id"]).single().execute()
        if response.data:
            return response.data
    except Exception as e:
        err = str(e)
        if "relation" in err or "42P01" in err:
            logger.warning("Profiles table missing, returning default profile")
        else:
            logger.warning(f"Profile fetch error (returning default): {err}")

    return UserProfile(
        id=current_user["id"],
        email=current_user.get("email", ""),
        full_name=None,
        avatar_url=None,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
