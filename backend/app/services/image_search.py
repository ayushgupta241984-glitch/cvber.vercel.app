import io
import re
import logging
from urllib.parse import urlparse, unquote

from PIL import Image
import httpx

logger = logging.getLogger(__name__)

USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
]


def _get_headers(accept_json: bool = False):
    return {
        "User-Agent": USER_AGENTS[0],
        "Accept": "application/json, text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8" if accept_json else "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
        "Connection": "keep-alive",
        "DNT": "1",
        "Upgrade-Insecure-Requests": "1",
    }


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


def _extract_urls(html: str) -> list[str]:
    patterns = [
        r'mediaurl=["\']([^"\']+)["\']',
        r'src=["\'](https?://[^"\']+\.(?:jpg|jpeg|png|webp|gif)[^"\']*)["\']',
        r'href=["\'](https?://[^"\']+\.(?:jpg|jpeg|png|webp|gif)[^"\']*)["\']',
        r'imgurl=([^&\s"]+)',
        r'"url"\s*:\s*"([^"]+)"',
        r'"contentUrl"\s*:\s*"([^"]+)"',
    ]
    found = set()
    for pattern in patterns:
        for match in re.finditer(pattern, html, re.IGNORECASE):
            url = unquote(match.group(1))
            parsed = urlparse(url)
            if parsed.scheme in ("http", "https") and any(
                ext in url.lower() for ext in [".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp"]
            ):
                found.add(url)
    return list(found)


async def search_yandex(image_bytes: bytes) -> list[dict]:
    results = []
    try:
        async with httpx.AsyncClient(timeout=30, follow_redirects=True) as client:
            resp = await client.post(
                "https://yandex.com/images/search",
                params={"rpt": "imageview"},
                files={"upfile": ("image.jpg", image_bytes, "image/jpeg")},
                headers=_get_headers(),
            )
            if resp.status_code != 200:
                logger.warning(f"Yandex returned status {resp.status_code}")
                return results

            urls = _extract_urls(resp.text)
            seen = set()
            for url in urls[:30]:
                if url not in seen:
                    seen.add(url)
                    results.append({"source": "Yandex", "url": url, "title": "", "thumbnail": url, "similarity": 0})
    except Exception as e:
        logger.warning(f"Yandex search failed: {e}")

    return results


async def search_bing(image_bytes: bytes) -> list[dict]:
    results = []
    try:
        async with httpx.AsyncClient(timeout=30, follow_redirects=True) as client:
            resp = await client.post(
                "https://www.bing.com/images/search",
                params={"view": "detailv2", "iss": "sbi", "form": "SBIHMP", "q": "imgurl:"},
                files={"image": ("image.jpg", image_bytes, "image/jpeg")},
                headers=_get_headers(),
            )
            if resp.status_code != 200:
                logger.warning(f"Bing returned status {resp.status_code}")
                return results

            urls = _extract_urls(resp.text)
            seen = set()
            for url in urls[:30]:
                if url not in seen:
                    seen.add(url)
                    results.append({"source": "Bing", "url": url, "title": "", "thumbnail": url, "similarity": 0})
    except Exception as e:
        logger.warning(f"Bing search failed: {e}")

    return results


async def search_image(image_bytes: bytes) -> dict:
    original_hash = dhash(image_bytes)
    logger.info(f"Image search starting — dhash: {original_hash}")

    yandex_results, bing_results = await search_yandex(image_bytes), await search_bing(image_bytes)
    all_results = yandex_results + bing_results

    deduped = []
    seen_urls = set()
    for r in all_results:
        if r["url"] not in seen_urls:
            seen_urls.add(r["url"])
            deduped.append(r)

    return {
        "total_urls_found": len(all_results),
        "matches": deduped[:30],
        "high_confidence_matches": 0,
        "medium_confidence_matches": 0,
        "original_hash": original_hash,
    }
