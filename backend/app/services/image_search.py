import io
import logging
from uuid import uuid4
from typing import Optional

from PIL import Image
from app.services.hash_db import find_similar

logger = logging.getLogger(__name__)

# In-memory temp storage for images uploaded for search
# Key: scan_id (str) → bytes
_temp_store: dict[str, bytes] = {}
_TEMP_MAX_KB = 5 * 1024 * 1024  # 5MB max
_TEMP_TTL_SECONDS = 300  # 5 minutes

# Magic bytes for common image formats — used to reject non-image uploads
_IMAGE_MAGIC: list[bytes] = [
    b"\xff\xd8\xff",       # JPEG
    b"\x89PNG\r\n\x1a\n",  # PNG
    b"GIF87a",             # GIF87
    b"GIF89a",             # GIF89
    b"RIFF",               # WEBP (RIFF header)
    b"BM",                 # BMP
    b"\x00\x00\x01\x00",   # ICO
]


def is_valid_image(data: bytes) -> bool:
    return any(data.startswith(m) for m in _IMAGE_MAGIC)


def dhash(image_bytes: bytes) -> str:
    if not is_valid_image(image_bytes):
        raise ValueError("Not a valid image file")
    img = Image.open(io.BytesIO(image_bytes)).convert("L")
    img = img.resize((9, 8), Image.LANCZOS)
    pixels = list(img.getdata())
    bits = []
    for y in range(8):
        for x in range(8):
            left = pixels[y * 9 + x]
            right = pixels[y * 9 + x + 1]
            bits.append("1" if left > right else "0")
    return hex(int("".join(bits), 2))[2:].zfill(16)


def store_temp_image(image_bytes: bytes) -> Optional[str]:
    if not is_valid_image(image_bytes):
        logger.warning("Rejected upload: invalid image magic bytes")
        return None
    if len(image_bytes) > _TEMP_MAX_KB:
        logger.warning(f"Image too large for temp storage: {len(image_bytes)} bytes")
        return None
    scan_id = str(uuid4())
    _temp_store[scan_id] = image_bytes
    if len(_temp_store) > 100:
        logger.warning("Temp image store reached 100 entries — clearing all")
        _temp_store.clear()
    return scan_id


def get_temp_image(scan_id: str) -> Optional[bytes]:
    return _temp_store.get(scan_id)


async def search_image(image_bytes: bytes, user_id: Optional[str] = None) -> dict:
    original_hash = dhash(image_bytes)
    scan_id = store_temp_image(image_bytes)
    logger.info(f"Image search — dhash: {original_hash}, scan_id: {scan_id}, user_id: {user_id}")

    similar_files = []
    if user_id:
        similar_files = find_similar(original_hash, user_id, max_distance=10)

    return {
        "scan_id": scan_id,
        "original_hash": original_hash,
        "similar_files": similar_files,
        "message": "Image processed. Use scan_id to search on Yandex, Bing, Google Lens, SauceNAO, or TinEye.",
    }
