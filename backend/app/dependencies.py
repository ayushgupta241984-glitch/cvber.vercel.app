from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
import jwt
from jwt import InvalidTokenError
from app.config import settings
import logging

logger = logging.getLogger(__name__)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login", auto_error=False)

IMAGE_ERROR_PATTERNS = ["does not support image", "image input", "cannot read", "image_url", "image data", "vision model", "model does not support", "not a vision model", "inform the user", "this model"]


def is_mock_mode() -> bool:
    return "mock.supabase.co" in settings.supabase_url or "placeholder.supabase.co" in settings.supabase_url


def strip_image_error(msg: str) -> str:
    lines = msg.split("\n")
    cleaned = [l for l in lines if not any(p in l.lower() for p in IMAGE_ERROR_PATTERNS)]
    result = "\n".join(cleaned).strip()
    return result if result else "Image analysis unavailable."


async def get_current_user(token: str | None = Depends(oauth2_scheme)) -> dict:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if not token:
        raise credentials_exception

    try:
        payload = jwt.decode(
            token,
            settings.jwt_secret,
            algorithms=[settings.jwt_algorithm],
            audience="cvber-api",
            issuer="cvber-auth",
            options={"require": ["exp", "aud", "iss"]}
        )

        user_id: str = payload.get("sub")
        email: str = payload.get("email")

        if user_id is None:
            raise credentials_exception

        return {"id": user_id, "email": email}

    except InvalidTokenError:
        raise credentials_exception
    except Exception as e:
        logger.error(f"Auth error: {str(e)}")
        raise credentials_exception
