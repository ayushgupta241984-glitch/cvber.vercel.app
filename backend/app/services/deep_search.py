import io
import base64
import time
import logging
from typing import Optional

import httpx
from PIL import Image
from duckduckgo_search import DDGS

from app.services.image_search import dhash

logger = logging.getLogger(__name__)

NVIDIA_API_URL = "https://integrate.api.nvidia.com/v1/chat/completions"
NVIDIA_MODEL = "google/gemma-3n-e4b-it"
MAX_ITERATIONS = 5
QUERIES_PER_BATCH = 5
IMAGES_PER_QUERY = 30
SIMILARITY_THRESHOLD = 26
MAX_RESULTS = 10
TIMEOUT_IMAGE_DL = 10
TIMEOUT_NIM = 45
DDGS_DELAY = 2.0  # seconds between DuckDuckGo calls to avoid rate limits


def _nim_call(messages: list, api_key: str, max_tokens: int = 256, temp: float = 0.1) -> Optional[str]:
    payload = {
        "model": NVIDIA_MODEL,
        "messages": messages,
        "max_tokens": max_tokens,
        "temperature": temp,
    }
    try:
        r = httpx.post(
            NVIDIA_API_URL,
            headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
            json=payload,
            timeout=TIMEOUT_NIM,
        )
        if r.status_code != 200:
            logger.warning(f"NIM API error {r.status_code}: {r.text[:200]}")
            return None
        data = r.json()
        return data["choices"][0]["message"]["content"]
    except Exception as e:
        logger.warning(f"NIM call failed: {e}")
        return None


def describe_image(image_bytes: bytes, api_key: str) -> Optional[str]:
    b64 = base64.b64encode(image_bytes).decode()
    messages = [
        {
            "role": "user",
            "content": [
                {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{b64}"}},
                {"type": "text", "text": "Describe this image in detail. Focus on the main subject, setting, colors, composition, style, and any distinctive visual elements. Be specific and thorough."}
            ]
        }
    ]
    return _nim_call(messages, api_key, max_tokens=300, temp=0.1)


def generate_queries(description: str, api_key: str, iteration: int = 0) -> list[str]:
    prompt = (
        f"Based on this image description:\n{description}\n\n"
        f"Generate {QUERIES_PER_BATCH} specific image search queries that would find visually similar or identical images on the web. "
        "Focus on concrete visual keywords: the main subject, colors, composition, setting, style. "
        "Return only the queries, one per line."
    )
    if iteration > 0:
        prompt += (
            "\n\nThe previous queries didn't find good visual matches. "
            "Try completely different approaches — focus on unique visual features, unusual details, "
            "or specific technical aspects (lighting, angle, texture, framing) that make this image distinctive."
        )

    messages = [{"role": "user", "content": [{"type": "text", "text": prompt}]}]
    result = _nim_call(messages, api_key, max_tokens=300, temp=0.3)
    if not result:
        return []
    queries = [q.strip().strip('"').strip("'").strip("- ").lstrip("1234567890.") for q in result.strip().split("\n") if q.strip()]
    return queries[:QUERIES_PER_BATCH]


def _search_bing(query: str, max_results: int = IMAGES_PER_QUERY) -> list[dict]:
    """Fallback: scrape Bing image search via web interface."""
    import re
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
    }
    params = {"q": query, "form": "HDRSC2", "first": "1", "count": str(min(max_results, 35))}
    try:
        time.sleep(1.0)
        r = httpx.get("https://www.bing.com/images/search", headers=headers, params=params, timeout=15.0, follow_redirects=True)
        if r.status_code != 200:
            logger.warning(f"Bing search returned {r.status_code} for '{query[:50]}'")
            return []
        # Extract image URLs from the page
        # Bing stores image metadata in a JSON-like script tag and also in data-src attributes
        urls = set()
        # Method 1: data-src attributes (lazy-loaded images)
        for match in re.finditer(r'data-src="(https?://[^"]+)"', r.text):
            url = match.group(1).replace("\\u0026", "&").replace("\\/", "/")
            urls.add(url)
        # Method 2: murl (media URL) in JSON metadata
        for match in re.finditer(r'"murl"\s*:\s*"(https?://[^"]+)"', r.text):
            url = match.group(1).replace("\\u0026", "&").replace("\\/", "/")
            urls.add(url)
        # Method 3: img src fallback
        for match in re.finditer(r'<img[^>]+src="(https?://[^"]+)"', r.text):
            url = match.group(1).replace("\\u0026", "&").replace("\\/", "/")
            if "th.bing.com" in url:
                urls.add(url)
        results = []
        for url in list(urls)[:max_results]:
            results.append({"url": url, "title": "", "source": ""})
        if results:
            logger.info(f"  Bing '{query[:50]}' → {len(results)} results")
        return results
    except Exception as e:
        logger.warning(f"Bing search failed for '{query[:50]}': {e}")
        return []


def search_images(query: str, max_results: int = IMAGES_PER_QUERY) -> list[dict]:
    time.sleep(DDGS_DELAY)
    try:
        with DDGS() as ddgs:
            results = list(ddgs.images(query, max_results=max_results))
            if results:
                return [{"url": r["image"], "title": r.get("title", ""), "source": r.get("url", "")} for r in results if r.get("image")]
    except Exception as e:
        logger.debug(f"DuckDuckGo failed for '{query[:50]}': {e}")
    # Fallback to Bing scrape
    return _search_bing(query, max_results)


def compare_and_score(original_dhash: str, image_url: str) -> Optional[dict]:
    try:
        r = httpx.get(image_url, timeout=TIMEOUT_IMAGE_DL, follow_redirects=True)
        if r.status_code != 200:
            return None
        content_type = r.headers.get("content-type", "")
        if "image" not in content_type:
            return None
        img_bytes = r.content
        if len(img_bytes) > 10 * 1024 * 1024:
            return None
        found_hash = dhash(img_bytes)
        dist = bin(int(original_dhash, 16) ^ int(found_hash, 16)).count("1")
        similarity = max(0, round((1 - dist / 64) * 100))
        return {
            "url": image_url,
            "dhash": found_hash,
            "distance": dist,
            "similarity": similarity,
        }
    except Exception as e:
        logger.debug(f"Image compare failed for {image_url[:60]}: {e}")
        return None


def search_and_score_batch(queries: list[str], original_dhash: str, seen_urls: set) -> list[dict]:
    batch_results = []
    for query in queries:
        search_results = search_images(query)
        if not search_results:
            continue
        logger.info(f"  '{query[:50]}' → {len(search_results)} results")
        for sr in search_results:
            url = sr["url"]
            if url in seen_urls:
                continue
            seen_urls.add(url)
            comparison = compare_and_score(original_dhash, url)
            if comparison and comparison["distance"] <= SIMILARITY_THRESHOLD:
                batch_results.append({
                    "url": comparison["url"],
                    "title": sr.get("title", ""),
                    "source": sr.get("source", ""),
                    "similarity": comparison["similarity"],
                    "hash_distance": comparison["distance"],
                })
                logger.info(f"    ✓ {comparison['similarity']}% - {url[:70]}")
    return batch_results


async def deep_search(image_bytes: bytes, api_key: str) -> dict:
    original_dhash_val = dhash(image_bytes)
    logger.info(f"Deep search starting — dhash: {original_dhash_val}")

    description = describe_image(image_bytes, api_key)
    if not description:
        return {"error": "Failed to describe image", "results": [], "total_found": 0}
    logger.info(f"Description: {description[:100]}...")

    seen_urls: set[str] = set()
    all_results: list[dict] = []
    queries_used: list[str] = []

    for iteration in range(MAX_ITERATIONS):
        queries = generate_queries(description, api_key, iteration)
        if not queries:
            break
        queries_used.extend(queries)
        logger.info(f"Iteration {iteration + 1}: {queries}")

        batch = search_and_score_batch(queries, original_dhash_val, seen_urls)
        all_results.extend(batch)

        all_results.sort(key=lambda r: r["similarity"], reverse=True)
        if len(all_results) >= MAX_RESULTS:
            all_results = all_results[:MAX_RESULTS]
            break

    all_results.sort(key=lambda r: r["similarity"], reverse=True)

    logger.info(f"Complete — {len(all_results)} matches from {len(seen_urls)} images searched")

    return {
        "original_dhash": original_dhash_val,
        "description": description,
        "results": all_results[:MAX_RESULTS],
        "total_found": min(len(all_results), MAX_RESULTS),
        "queries_used": queries_used,
        "images_searched": len(seen_urls),
    }
