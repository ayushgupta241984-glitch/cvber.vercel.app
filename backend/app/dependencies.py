from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
import jwt
from jwt import InvalidTokenError
from app.config import settings
import logging

logger = logging.getLogger(__name__)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

# Reject the development default secret in production-like environments
PLACEHOLDER_SECRETS = ["dev-secret-key-change-in-production", "placeholder"]


def _is_placeholder_secret(secret: str) -> bool:
    return any(p in secret.lower() for p in PLACEHOLDER_SECRETS)


async def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if _is_placeholder_secret(settings.jwt_secret):
        logger.critical("JWT_SECRET is still set to the default placeholder! "
                        "Set a strong unique secret in production via environment variable.")
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
