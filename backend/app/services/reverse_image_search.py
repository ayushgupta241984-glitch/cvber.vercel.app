import logging
import json
import asyncio
import os
import tempfile
from typing import List, Dict, Optional

logger = logging.getLogger(__name__)

_REVERSE_SEARCH_ENABLED = os.getenv("REVERSE_SEARCH_ENABLED", "true").lower() in ("1", "true", "yes")


class ReverseImageSearchService:

    def __init__(self):
        self._browser = None
        self._playwright = None

    async def _get_browser(self):
        if self._browser is None:
            from playwright.async_api import async_playwright
            self._playwright = await async_playwright().start()
            import sys
            is_windows = sys.platform == "win32"
            launch_args = [
                "--disable-blink-features=AutomationControlled",
            ]
            if not is_windows:
                launch_args.extend(["--no-sandbox", "--disable-dev-shm-usage"])
            self._browser = await self._playwright.chromium.launch(
                headless=True,
                args=launch_args,
            )
        return self._browser

    async def search_all(self, image_url: str = "", image_bytes: bytes = None, text_query: str = "") -> Dict[str, list]:
        if not _REVERSE_SEARCH_ENABLED:
            logger.info("Reverse search disabled via REVERSE_SEARCH_ENABLED env var")
            return {"bing": [], "google": [], "total_matches": 0, "all_results": []}

        results = {"bing": [], "google": [], "total_matches": 0}

        if image_bytes:
            bing_task = asyncio.create_task(self._search_bing_playwright(image_bytes))
            google_task = asyncio.create_task(self._search_google_lens_playwright(image_bytes))
            bing_r, google_r = await asyncio.gather(bing_task, google_task, return_exceptions=True)
            if bing_r and not isinstance(bing_r, Exception):
                results["bing"] = bing_r
            if google_r and not isinstance(google_r, Exception):
                results["google"] = google_r

        all_matches = results["bing"] + results["google"]
        seen = set()
        unique = []
        for m in all_matches:
            url = m.get("url", "")
            if url and url not in seen:
                seen.add(url)
                unique.append(m)
        results["all_results"] = unique
        results["total_matches"] = len(unique)
        return results

    async def _search_bing_playwright(self, image_bytes: bytes) -> Optional[List[Dict]]:
        browser = None
        try:
            browser = await self._get_browser()
            context = await browser.new_context(
                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
                viewport={"width": 1920, "height": 1080},
                locale="en-US",
            )
            await context.add_init_script("""
                Object.defineProperty(navigator, 'webdriver', { get: () => false });
                Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
                Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
            """)

            page = await context.new_page()

            # Save image to temp file for upload
            tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".jpg")
            try:
                tmp.write(image_bytes)
                tmp_path = tmp.name
            finally:
                tmp.close()

            # Go to Bing images search page
            await page.goto("https://www.bing.com/images/search", wait_until="domcontentloaded", timeout=20000)
            await page.wait_for_timeout(1000)

            # Click the "Search by image" button (camera icon)
            try:
                sbi_btn = page.locator("#sbiarea")
                await sbi_btn.click(timeout=5000)
                await page.wait_for_timeout(500)
            except Exception:
                try:
                    sbi_btn = page.locator("a[class*='sbi']")
                    await sbi_btn.first.click(timeout=5000)
                    await page.wait_for_timeout(500)
                except Exception:
                    logger.warning("Could not find SBI button on Bing")
                    await context.close()
                    return []

            # Upload the image file
            try:
                file_input = page.locator("#sb_fileinput")
                await file_input.set_input_files(tmp_path, timeout=5000)
                await page.wait_for_timeout(3000)
            except Exception as e:
                logger.warning(f"Failed to upload image to Bing: {e}")
                await context.close()
                return []

            # Wait for results to load
            try:
                await page.wait_for_selector("a.iusc", timeout=15000)
                await page.wait_for_timeout(1000)
            except Exception:
                logger.warning("Bing search timed out waiting for results")
                await context.close()
                return []

            # Extract results
            results = []
            seen = set()
            links = await page.locator("a.iusc").all()
            for link in links:
                try:
                    data_attr = await link.get_attribute("m")
                    if not data_attr:
                        for attr_name in ["m", "data", "data-m", "attr"]:
                            data_attr = await link.get_attribute(attr_name)
                            if data_attr:
                                break
                    if not data_attr:
                        continue
                    data = json.loads(data_attr)
                    purl = data.get("purl", "") or data.get("pgurl", "")
                    murl = data.get("murl", "")
                    title = data.get("t", "") or data.get("title", "")
                    if purl and purl not in seen and not any(d in purl.lower() for d in ["bing.com", "microsoft.com"]):
                        seen.add(purl)
                        results.append({
                            "title": title if title else purl[:80],
                            "url": purl,
                            "image_url": murl,
                            "snippet": "",
                            "engine": "bing_visual",
                            "confidence": 0.7,
                        })
                except Exception:
                    continue

            logger.info(f"Bing Playwright: {len(results)} results")
            await context.close()

            # Cleanup temp file
            try:
                os.unlink(tmp_path)
            except Exception:
                pass

            return results[:40]

        except Exception as e:
            logger.warning(f"Bing Playwright search failed: {e}")
            if browser and context:
                try:
                    await context.close()
                except Exception:
                    pass
            return []

    async def _search_google_lens_playwright(self, image_bytes: bytes) -> Optional[List[Dict]]:
        """Search via Google Lens (images.google.com) using Playwright."""
        browser = None
        try:
            browser = await self._get_browser()
            context = await browser.new_context(
                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
                viewport={"width": 1920, "height": 1080},
                locale="en-US",
            )
            await context.add_init_script("""
                Object.defineProperty(navigator, 'webdriver', { get: () => false });
                Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
                Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
            """)

            page = await context.new_page()

            # Save image to temp file
            tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".jpg")
            try:
                tmp.write(image_bytes)
                tmp_path = tmp.name
            finally:
                tmp.close()

            # Go to Google Images
            await page.goto("https://www.google.com/imghp", wait_until="domcontentloaded", timeout=20000)
            await page.wait_for_timeout(1000)

            # Click the camera/search-by-image button
            try:
                camera_btn = page.locator("div[aria-label='Search by image']")
                await camera_btn.click(timeout=5000)
                await page.wait_for_timeout(500)
            except Exception:
                try:
                    camera_btn = page.locator("div[aria-label*='search by image' i], button[aria-label*='camera' i]")
                    await camera_btn.first.click(timeout=5000)
                    await page.wait_for_timeout(500)
                except Exception:
                    logger.warning("Could not find Google camera button")
                    await context.close()
                    return []

            # Upload the image via the file input
            try:
                file_input = page.locator("input[type='file']")
                await file_input.set_input_files(tmp_path, timeout=5000)
                await page.wait_for_timeout(4000)
            except Exception as e:
                logger.warning(f"Failed to upload image to Google: {e}")
                await context.close()
                return []

            # Wait for results page to load
            try:
                await page.wait_for_url("**/search**", timeout=20000)
                await page.wait_for_timeout(2000)
            except Exception:
                logger.warning("Google search navigation timed out")
                await context.close()
                return []

            # Try to find visually similar image links
            results = []
            seen = set()

            # Look for image result links in the search results grid
            selectors = [
                "a[href*='/imgres']",
                "a[jsname*='hSRGPd']",
                "div[data-ri] a",
                "a[href*='imgurl=']",
                "h3 a",
            ]
            found_links = []
            for sel in selectors:
                try:
                    links = await page.locator(sel).all()
                    if links:
                        found_links = links
                        break
                except Exception:
                    continue

            for link in found_links[:30]:
                try:
                    href = await link.get_attribute("href")
                    if not href:
                        continue
                    # Extract image URL from /imgres links
                    if "/imgres" in href:
                        import urllib.parse
                        parsed = urllib.parse.parse_qs(urllib.parse.urlparse(href).query)
                        img_url = parsed.get("imgurl", [""])[0]
                        if img_url and img_url not in seen and "google.com" not in img_url.lower():
                            seen.add(img_url)
                            results.append({
                                "title": await link.get_attribute("aria-label") or img_url[:80],
                                "url": img_url,
                                "image_url": img_url,
                                "snippet": "",
                                "engine": "google_lens",
                                "confidence": 0.7,
                            })
                    else:
                        title = (await link.inner_text()).strip() or href[:80]
                        if href and href not in seen and "google.com" not in href.lower():
                            seen.add(href)
                            results.append({
                                "title": title,
                                "url": href,
                                "image_url": "",
                                "snippet": "",
                                "engine": "google_lens",
                                "confidence": 0.6,
                            })
                except Exception:
                    continue

            # If no structured links, try extracting from page text
            if not results:
                try:
                    body_text = await page.inner_text("body")
                    for line in body_text.split("\n"):
                        line = line.strip()
                        if line.startswith("http") and "google" not in line.lower():
                            if line not in seen:
                                seen.add(line)
                                results.append({
                                    "title": line[:80],
                                    "url": line,
                                    "image_url": "",
                                    "snippet": "",
                                    "engine": "google_lens",
                                    "confidence": 0.5,
                                })
                except Exception:
                    pass

            logger.info(f"Google Lens Playwright: {len(results)} results")
            await context.close()

            try:
                os.unlink(tmp_path)
            except Exception:
                pass

            return results[:30]

        except Exception as e:
            logger.warning(f"Google Lens Playwright search failed: {e}")
            if browser:
                try:
                    await context.close()
                except Exception:
                    pass
            return []


reverse_image_search = ReverseImageSearchService()
