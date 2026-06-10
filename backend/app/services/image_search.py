import io
import math
import logging
import urllib.parse
from uuid import uuid4
from typing import Optional

from PIL import Image
from app.services.hash_db import find_similar_multi

logger = logging.getLogger(__name__)

_TEMP_MAX_BYTES = 5 * 1024 * 1024
_TEMP_TTL_SECONDS = 300

_IMAGE_MAGIC: list[bytes] = [
    b"\xff\xd8\xff",
    b"\x89PNG\r\n\x1a\n",
    b"GIF87a",
    b"GIF89a",
    b"\x52\x49\x46\x46",
    b"BM",
    b"\x00\x00\x01\x00",
    b"\x49\x49\x2a\x00",
    b"\x4d\x4d\x00\x2a",
    b"\x00\x00\x00\x18\x66\x74\x79\x70",
    b"\x00\x00\x00\x1c\x66\x74\x79\x70",
    b"\x00\x00\x00\x20\x66\x74\x79\x70",
]

_WEBP_MAGIC = b"RIFF"


def is_valid_image(data: bytes) -> bool:
    if len(data) < 4:
        return False
    if data[:4] == _WEBP_MAGIC:
        return len(data) >= 12 and data[8:12] == b"WEBP"
    return any(data.startswith(m) for m in _IMAGE_MAGIC)


def verify_image_structure(image_bytes: bytes) -> dict:
    if not is_valid_image(image_bytes):
        raise ValueError("Invalid image magic bytes")
    img = Image.open(io.BytesIO(image_bytes))
    img.verify()
    img = Image.open(io.BytesIO(image_bytes))
    img.load()
    w, h = img.size
    if w > 10000 or h > 10000:
        raise ValueError(f"Dimensions too large: {w}x{h}")
    return {"width": w, "height": h, "format": img.format, "mode": img.mode}


def _open_image(image_bytes: bytes) -> Image.Image:
    verify_image_structure(image_bytes)
    return Image.open(io.BytesIO(image_bytes))


def dhash(image_bytes: bytes) -> str:
    img = _open_image(image_bytes).convert("L")
    img = img.resize((9, 8), Image.LANCZOS)
    pixels = list(img.getdata())
    bits = []
    for y in range(8):
        for x in range(8):
            left = pixels[y * 9 + x]
            right = pixels[y * 9 + x + 1]
            bits.append("1" if left > right else "0")
    return hex(int("".join(bits), 2))[2:].zfill(16)


def ahash(image_bytes: bytes) -> str:
    img = _open_image(image_bytes).convert("L")
    img = img.resize((8, 8), Image.LANCZOS)
    pixels = list(img.getdata())
    mean = sum(pixels) / len(pixels)
    bits = ["1" if p > mean else "0" for p in pixels]
    return hex(int("".join(bits), 2))[2:].zfill(16)


def color_histogram(image_bytes: bytes) -> str:
    img = _open_image(image_bytes)
    if img.mode not in ("RGB", "RGBA"):
        img = img.convert("RGB")
    bins = 4
    bucket_size = 256 // bins
    w, h = img.size
    pixels = list(img.getdata())
    total = len(pixels)
    r_hist = [0] * bins
    g_hist = [0] * bins
    b_hist = [0] * bins
    for r, g, b, *_ in pixels:
        r_hist[min(r // bucket_size, bins - 1)] += 1
        g_hist[min(g // bucket_size, bins - 1)] += 1
        b_hist[min(b // bucket_size, bins - 1)] += 1
    sig = r_hist + g_hist + b_hist
    sig_str = ",".join(str(round(c / total * 100)) for c in sig)
    return sig_str


def compute_hashes(image_bytes: bytes) -> dict[str, str]:
    return {
        "dhash": dhash(image_bytes),
        "ahash": ahash(image_bytes),
        "color_hist": color_histogram(image_bytes),
    }


_HASH_WEIGHTS = {"dhash": 2, "ahash": 2, "color_hist": 1}


def hamming_distance(a: str, b: str) -> int:
    max_len = max(len(a), len(b))
    a = a.zfill(max_len)
    b = b.zfill(max_len)
    return sum(1 for ca, cb in zip(a, b) if ca != cb)


def color_hist_distance(a: str, b: str) -> int:
    av = [int(x) for x in a.split(",")]
    bv = [int(x) for x in b.split(",")]
    return sum(abs(av[i] - bv[i]) for i in range(min(len(av), len(bv)))) // len(av)


_THRESHOLDS = {
    "dhash": 8,
    "ahash": 8,
    "color_hist": 15,
}


def hashes_match(query: dict[str, str], stored: dict[str, str]) -> float:
    agreements = 0
    total_weight = 0
    details = {}
    for htype in ("dhash", "ahash", "color_hist"):
        qh = query.get(htype, "")
        sh = stored.get(htype, "")
        if qh and sh:
            w = _HASH_WEIGHTS.get(htype, 1)
            total_weight += w
            if htype == "color_hist":
                d = color_hist_distance(qh, sh)
            else:
                d = hamming_distance(qh, sh)
            threshold = _THRESHOLDS.get(htype, 10)
            matches = d <= threshold
            details[htype] = {"distance": d, "threshold": threshold, "match": matches}
            if matches:
                agreements += w
    confidence = round(agreements / total_weight * 100, 1) if total_weight > 0 else 0
    return confidence, details


_temp_store: dict[str, bytes] = {}


def store_temp_image(image_bytes: bytes) -> Optional[str]:
    if not is_valid_image(image_bytes):
        logger.warning("Rejected upload: invalid image magic bytes")
        return None
    if len(image_bytes) > _TEMP_MAX_BYTES:
        logger.warning(f"Image too large for temp storage: {len(image_bytes)} bytes")
        return None
    scan_id = str(uuid4())
    _temp_store[scan_id] = image_bytes
    if len(_temp_store) > 100:
        logger.warning("Temp image store reached 100 entries")
        _temp_store.clear()
    return scan_id


def get_temp_image(scan_id: str) -> Optional[bytes]:
    return _temp_store.get(scan_id)


def generate_search_links(scan_id: str, site_url: str = "https://cvber.vercel.app") -> dict:
    """Generate search engine links for the uploaded image."""
    image_url = f"{site_url}/search/temp/{scan_id}"
    encoded_url = urllib.parse.quote(image_url, safe="")

    return {
        "image_url": image_url,
        "yandex": f"https://yandex.com/images/search?rpt=imageview&url={encoded_url}",
        "bing": f"https://www.bing.com/images/search?view=detailv2&iss=sbi&form=SBIVSP&sbisrc=UrlPaste&q=imgurl:{encoded_url}",
        "google_lens": f"https://lens.google.com/uploadbyurl?url={encoded_url}",
        "tineye": f"https://tineye.com/search?url={encoded_url}",
        "saurcenao": f"https://saucenao.com/search.php?url={encoded_url}",
    }


async def search_image(image_bytes: bytes, user_id: Optional[str] = None) -> dict:
    hashes = compute_hashes(image_bytes)
    scan_id = store_temp_image(image_bytes)
    logger.info(f"Image search — hashes: {list(hashes.keys())}, scan_id: {scan_id}, user_id: {user_id}")

    similar_files = []
    if user_id:
        similar_files = find_similar_multi(hashes, user_id, min_confidence=50.0)

    search_links = generate_search_links(scan_id) if scan_id else {}

    return {
        "scan_id": scan_id,
        "hashes": hashes,
        "similar_files": similar_files,
        "search_links": search_links,
        "hash_methods": ["dhash", "ahash", "color_hist"],
        "message": "Image processed. Use search_links to find where this image appears online.",
    }
