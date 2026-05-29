import io
import logging
from uuid import uuid4
from typing import Optional

from PIL import Image

logger = logging.getLogger(__name__)

# In-memory temp storage for images uploaded for search
# Key: scan_id (str) → bytes
_temp_store: dict[str, bytes] = {}
_TEMP_MAX_KB = 5 * 1024 * 1024  # 5MB max
_TEMP_TTL_SECONDS = 300  # 5 minutes


def dhash(image_bytes: bytes) -> str:
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
    if len(image_bytes) > _TEMP_MAX_KB:
        logger.warning(f"Image too large for temp storage: {len(image_bytes)} bytes")
        return None
    scan_id = str(uuid4())
    _temp_store[scan_id] = image_bytes
    if len(_temp_store) > 100:
        _temp_store.clear()
    return scan_id


def get_temp_image(scan_id: str) -> Optional[bytes]:
    return _temp_store.get(scan_id)


async def search_image(image_bytes: bytes) -> dict:
    original_hash = dhash(image_bytes)
    scan_id = store_temp_image(image_bytes)
    logger.info(f"Image search — dhash: {original_hash}, scan_id: {scan_id}")

    return {
        "scan_id": scan_id,
        "original_hash": original_hash,
        "message": "Image processed. Use scan_id to search on Yandex or Bing.",
    }
