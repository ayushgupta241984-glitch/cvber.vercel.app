import io
import re
import logging
from typing import Optional
from urllib.parse import quote

from PIL import Image
import httpx

logger = logging.getLogger(__name__)

YANDEX_SEARCH_URL = "https://yandex.com/images/search"
BING_SEARCH_URL = "https://www.bing.com/images/search"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
}


def dhash(image_bytes: bytes) -> str:
    img = Image.open(io.BytesIO(image_bytes)).convert("L")
    img = img.resize((9, 8), Image.LANCZOS)
    pixels = list(img.getdata())
    hash_bits = []
    for y in range(8):
        for x in range(8):
            left = pixels[y * 9 + x]
            right = pixels[y * 9 + x + 1]
            hash_bits.append("1" if left > right else "0")
    return hex(int("".join(hash_bits), 2))[2:].zfill(16)


def hamming_distance(h1: str, h2: str) -> int:
    b1 = bin(int(h1, 16))[2:].zfill(64)
    b2 = bin(int(h2, 16))[2:].zfill(64)
    return sum(1 for a, b in zip(b1, b2) if a != b)


def similarity_percent(h1: str, h2: str) -> float:
    dist = hamming_distance(h1, h2)
    return round((1 - dist / 64) * 100, 1)


async def _fetch_image_bytes(url: str, client: httpx.AsyncClient) -> Optional[bytes]:
    try:
        resp = await client.get(url, headers=HEADERS, timeout=10)
        if resp.status_code == 200 and len(resp.content) > 1000:
            return resp.content
    except Exception as e:
        logger.debug(f"Failed to fetch {url}: {e}")
    return None


async def search_yandex(image_bytes: bytes, client: httpx.AsyncClient) -> list[dict]:
    results = []
    try:
        files = {"upfile": ("image.jpg", image_bytes, "image/jpeg")}
        params = {"rpt": "imageview", "format": "json"}
        resp = await client.post(
            YANDEX_SEARCH_URL,
            params=params,
            files=files,
            headers={**HEADERS, "Accept": "application/json"},
            timeout=20,
        )
        if resp.status_code != 200:
            logger.warning(f"Yandex returned {resp.status_code}")
            return results

        try:
            data = resp.json()
        except Exception:
            return results

        for item in data.get("matches", []):
            url = item.get("url") or (item.get("sites", [{}])[0].get("url") if item.get("sites") else None)
            if url:
                results.append({
                    "source": "Yandex",
                    "url": url,
                    "title": item.get("title", ""),
                    "thumbnail": item.get("thumbnail", {}).get("url") or item.get("preview", {}).get("url"),
                    "site": item.get("site", ""),
                })
    except Exception as e:
        logger.warning(f"Yandex search failed: {e}")

    if not results:
        try:
            params = {"rpt": "imageview", "url": ""}
            resp = await client.post(
                YANDEX_SEARCH_URL,
                params=params,
                files={"upfile": ("image.jpg", image_bytes, "image/jpeg")},
                headers=HEADERS,
                timeout=20,
            )
            html = resp.text
            thumb_urls = re.findall(r'(?:src|href)="(https?://[^"]+\.(?:jpg|jpeg|png|webp)[^"]*)"', html)
            seen = set()
            for url in thumb_urls[:30]:
                if url not in seen:
                    seen.add(url)
                    results.append({
                        "source": "Yandex",
                        "url": url,
                        "title": "",
                        "thumbnail": url,
                        "site": "",
                    })
        except Exception as e:
            logger.warning(f"Yandex fallback failed: {e}")

    return results


async def search_bing(image_bytes: bytes, client: httpx.AsyncClient) -> list[dict]:
    results = []
    try:
        data_url = f"data:image/jpeg;base64,{io.BytesIO(image_bytes).read().hex()}"
        params = {
            "view": "detailv2",
            "iss": "sbi",
            "form": "SBIHMP",
            "sbisrc": "UrlPaste",
            "q": "imgurl:" + quote("data:image/jpeg;base64,"),
        }
        resp = await client.post(
            BING_SEARCH_URL,
            params=params,
            files={"image": ("image.jpg", image_bytes, "image/jpeg")},
            headers=HEADERS,
            timeout=20,
        )
        html = resp.text

        image_urls = re.findall(r'mediaurl="([^"]+)"', html)
        thumb_urls = re.findall(r'<img[^>]+src="([^"]+)"[^>]*class="[^"]*mimg[^"]*"', html)
        titles = re.findall(r'<a[^>]+aria-label="([^"]+)"[^>]*>', html)

        seen = set()
        all_urls = image_urls + thumb_urls
        for i, url in enumerate(all_urls[:40]):
            if url in seen:
                continue
            seen.add(url)
            results.append({
                "source": "Bing",
                "url": url,
                "title": titles[i] if i < len(titles) else "",
                "thumbnail": url,
                "site": "",
            })
    except Exception as e:
        logger.warning(f"Bing search failed: {e}")

    return results


def _rate_image(original_hash: str, img_bytes: bytes) -> tuple[float, str]:
    try:
        match_hash = dhash(img_bytes)
        sim = similarity_percent(original_hash, match_hash)
        return sim, match_hash
    except Exception:
        return 0.0, ""


async def search_image(image_bytes: bytes) -> dict:
    original_hash = dhash(image_bytes)
    logger.info(f"Image search starting — dhash: {original_hash}")

    async with httpx.AsyncClient() as client:
        yandex_results = await search_yandex(image_bytes, client)
        bing_results = await search_bing(image_bytes, client)

    all_results = yandex_results + bing_results
    scored = []

    for r in all_results[:60]:
        thumb_bytes = await _fetch_image_bytes(r["url"], httpx.AsyncClient())
        if thumb_bytes:
            sim, _ = _rate_image(original_hash, thumb_bytes)
        else:
            sim = 0.0
        if sim >= 30:
            scored.append({**r, "similarity": sim})

    scored.sort(key=lambda x: x["similarity"], reverse=True)

    deduped = []
    seen_urls = set()
    for r in scored:
        if r["url"] not in seen_urls:
            seen_urls.add(r["url"])
            deduped.append(r)

    total_raw = len(all_results)
    high_match = sum(1 for r in deduped if r["similarity"] >= 70)
    medium_match = sum(1 for r in deduped if 50 <= r["similarity"] < 70)

    return {
        "total_urls_found": total_raw,
        "matches": deduped[:30],
        "high_confidence_matches": high_match,
        "medium_confidence_matches": medium_match,
        "original_hash": original_hash,
    }
