"""
Multi-Engine Reverse Image Search
Searches across Google Lens, Bing, Yandex, TinEye, Baidu, and DuckDuckGo.
All searches are free and require no API keys.
"""
import logging
import json
import asyncio
import os
import tempfile
import urllib.parse
from typing import List, Dict, Optional

logger = logging.getLogger(__name__)


class EnhancedReverseSearch:

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

    async def _new_context(self):
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
        return context

    async def search_all_engines(self, image_bytes: bytes, text_query: str = "") -> Dict[str, list]:
        """Run all reverse image search engines in parallel."""
        results = {
            "google_lens": [],
            "bing": [],
            "yandex": [],
            "tineye": [],
            "baidu": [],
            "duckduckgo": [],
            "all_results": [],
            "total_matches": 0,
            "engines_used": [],
        }

        tasks = {}
        tasks["google_lens"] = asyncio.create_task(self._search_google_lens(image_bytes))
        tasks["bing"] = asyncio.create_task(self._search_bing(image_bytes))
        tasks["yandex"] = asyncio.create_task(self._search_yandex(image_bytes))
        tasks["tineye"] = asyncio.create_task(self._search_tineye(image_bytes))
        tasks["baidu"] = asyncio.create_task(self._search_baidu(image_bytes))
        if text_query:
            tasks["duckduckgo"] = asyncio.create_task(self._search_duckduckgo(text_query))

        for name, task in tasks.items():
            try:
                result = await task
                if result:
                    results[name] = result
                    results["engines_used"].append(name)
            except Exception as e:
                logger.warning(f"{name} search failed: {e}")

        seen = set()
        all_unique = []
        for engine in results["engines_used"]:
            for m in results[engine]:
                url = m.get("url", "") or m.get("image_url", "")
                if url and url not in seen:
                    seen.add(url)
                    all_unique.append(m)

        results["all_results"] = all_unique
        results["total_matches"] = len(all_unique)
        return results

    async def _save_temp_image(self, image_bytes: bytes) -> str:
        tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".jpg")
        try:
            tmp.write(image_bytes)
            return tmp.name
        finally:
            tmp.close()

    async def _search_google_lens(self, image_bytes: bytes) -> Optional[List[Dict]]:
        """Google Lens reverse image search."""
        context = None
        tmp_path = None
        try:
            context = await self._new_context()
            page = await context.new_page()
            tmp_path = await self._save_temp_image(image_bytes)

            await page.goto("https://www.google.com/imghp", wait_until="domcontentloaded", timeout=20000)
            await page.wait_for_timeout(1500)

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
                    logger.warning("Google Lens: camera button not found")
                    return []

            try:
                file_input = page.locator("input[type='file']")
                await file_input.set_input_files(tmp_path, timeout=5000)
                await page.wait_for_timeout(4000)
            except Exception as e:
                logger.warning(f"Google Lens: file upload failed: {e}")
                return []

            try:
                await page.wait_for_url("**/search**", timeout=20000)
                await page.wait_for_timeout(2000)
            except Exception:
                logger.warning("Google Lens: navigation timeout")
                return []

            results = []
            seen = set()
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

            for link in found_links[:40]:
                try:
                    href = await link.get_attribute("href")
                    if not href:
                        continue
                    if "/imgres" in href:
                        parsed = urllib.parse.parse_qs(urllib.parse.urlparse(href).query)
                        img_url = parsed.get("imgurl", [""])[0]
                        if img_url and img_url not in seen and "google.com" not in img_url.lower():
                            seen.add(img_url)
                            results.append({
                                "title": await link.get_attribute("aria-label") or img_url[:80],
                                "url": img_url,
                                "image_url": img_url,
                                "engine": "google_lens",
                                "confidence": 0.75,
                            })
                    else:
                        if href and href not in seen and "google.com" not in href.lower():
                            seen.add(href)
                            results.append({
                                "title": (await link.inner_text()).strip() or href[:80],
                                "url": href,
                                "image_url": "",
                                "engine": "google_lens",
                                "confidence": 0.6,
                            })
                except Exception:
                    continue

            return results[:40]
        except Exception as e:
            logger.warning(f"Google Lens failed: {e}")
            return []
        finally:
            if context:
                try:
                    await context.close()
                except Exception:
                    pass
            if tmp_path:
                try:
                    os.unlink(tmp_path)
                except Exception:
                    pass

    async def _search_bing(self, image_bytes: bytes) -> Optional[List[Dict]]:
        """Bing reverse image search."""
        context = None
        tmp_path = None
        try:
            context = await self._new_context()
            page = await context.new_page()
            tmp_path = await self._save_temp_image(image_bytes)

            await page.goto("https://www.bing.com/images/search", wait_until="domcontentloaded", timeout=20000)
            await page.wait_for_timeout(1000)

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
                    logger.warning("Bing: SBI button not found")
                    return []

            try:
                file_input = page.locator("#sb_fileinput")
                await file_input.set_input_files(tmp_path, timeout=5000)
                await page.wait_for_timeout(3000)
            except Exception as e:
                logger.warning(f"Bing: file upload failed: {e}")
                return []

            try:
                await page.wait_for_selector("a.iusc", timeout=15000)
                await page.wait_for_timeout(1000)
            except Exception:
                logger.warning("Bing: results timeout")
                return []

            results = []
            seen = set()
            links = await page.locator("a.iusc").all()
            for link in links[:40]:
                try:
                    data_attr = await link.get_attribute("m")
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
                            "engine": "bing",
                            "confidence": 0.7,
                        })
                except Exception:
                    continue

            return results[:40]
        except Exception as e:
            logger.warning(f"Bing search failed: {e}")
            return []
        finally:
            if context:
                try:
                    await context.close()
                except Exception:
                    pass
            if tmp_path:
                try:
                    os.unlink(tmp_path)
                except Exception:
                    pass

    async def _search_yandex(self, image_bytes: bytes) -> Optional[List[Dict]]:
        """Yandex Images reverse image search."""
        context = None
        tmp_path = None
        try:
            context = await self._new_context()
            page = await context.new_page()
            tmp_path = await self._save_temp_image(image_bytes)

            await page.goto("https://yandex.com/images/", wait_until="domcontentloaded", timeout=20000)
            await page.wait_for_timeout(1500)

            try:
                camera_btn = page.locator("button[aria-label*='image' i], button[class*='camera' i], div[class*='camera'] button, .cbir-section button")
                if await camera_btn.count() > 0:
                    await camera_btn.first.click(timeout=5000)
                else:
                    try:
                        link_btn = page.locator("a[href*='cbir' i], a[class*='cbir']")
                        await link_btn.first.click(timeout=5000)
                    except Exception:
                        logger.warning("Yandex: camera button not found")
                        return []
                await page.wait_for_timeout(1000)
            except Exception:
                try:
                    await page.goto("https://yandex.com/images/cbir", wait_until="domcontentloaded", timeout=15000)
                    await page.wait_for_timeout(1000)
                except Exception:
                    return []

            try:
                file_input = page.locator("input[type='file']")
                if await file_input.count() == 0:
                    file_input = page.locator("input[accept*='image' i]")
                await file_input.first.set_input_files(tmp_path, timeout=5000)
                await page.wait_for_timeout(5000)
            except Exception as e:
                logger.warning(f"Yandex: file upload failed: {e}")
                return []

            try:
                await page.wait_for_url("**/search**", timeout=25000)
                await page.wait_for_timeout(2000)
            except Exception:
                try:
                    await page.wait_for_url("**/images**", timeout=10000)
                    await page.wait_for_timeout(2000)
                except Exception:
                    logger.warning("Yandex: search navigation timeout")
                    return []

            results = []
            seen = set()
            selectors = [
                "a[href*='https://'] img",
                ".serp-item a",
                "div.Image a",
                "a[class*='link']",
            ]
            for sel in selectors:
                try:
                    elements = await page.locator(sel).all()
                    for el in elements[:30]:
                        try:
                            href = await el.get_attribute("href")
                            img_src = await el.get_attribute("src")
                            url = href or img_src or ""
                            if url and url not in seen and "yandex" not in url.lower():
                                seen.add(url)
                                results.append({
                                    "title": "",
                                    "url": url,
                                    "image_url": img_src or "",
                                    "engine": "yandex",
                                    "confidence": 0.65,
                                })
                        except Exception:
                            continue
                except Exception:
                    continue

            return results[:30]
        except Exception as e:
            logger.warning(f"Yandex search failed: {e}")
            return []
        finally:
            if context:
                try:
                    await context.close()
                except Exception:
                    pass
            if tmp_path:
                try:
                    os.unlink(tmp_path)
                except Exception:
                    pass

    async def _search_tineye(self, image_bytes: bytes) -> Optional[List[Dict]]:
        """TinEye reverse image search."""
        context = None
        tmp_path = None
        try:
            context = await self._new_context()
            page = await context.new_page()
            tmp_path = await self._save_temp_image(image_bytes)

            await page.goto("https://tineye.com/", wait_until="domcontentloaded", timeout=20000)
            await page.wait_for_timeout(1500)

            try:
                file_input = page.locator("input[type='file']")
                await file_input.set_input_files(tmp_path, timeout=5000)
                await page.wait_for_timeout(3000)
            except Exception as e:
                logger.warning(f"TinEye: file upload failed: {e}")
                return []

            try:
                await page.wait_for_selector(".result-link, .match, .match-info", timeout=30000)
                await page.wait_for_timeout(2000)
            except Exception:
                try:
                    await page.wait_for_timeout(5000)
                except Exception:
                    logger.warning("TinEye: results timeout")
                    return []

            results = []
            seen = set()
            selectors = [
                "a.result-link",
                "a.match-info",
                "a[href*='http']",
            ]
            for sel in selectors:
                try:
                    links = await page.locator(sel).all()
                    for link in links:
                        try:
                            href = await link.get_attribute("href")
                            if href and href not in seen and "tineye" not in href.lower():
                                seen.add(href)
                                results.append({
                                    "title": (await link.inner_text()).strip() or href[:80],
                                    "url": href,
                                    "image_url": "",
                                    "engine": "tineye",
                                    "confidence": 0.8,
                                })
                        except Exception:
                            continue
                except Exception:
                    continue

            return results[:50]
        except Exception as e:
            logger.warning(f"TinEye search failed: {e}")
            return []
        finally:
            if context:
                try:
                    await context.close()
                except Exception:
                    pass
            if tmp_path:
                try:
                    os.unlink(tmp_path)
                except Exception:
                    pass

    async def _search_baidu(self, image_bytes: bytes) -> Optional[List[Dict]]:
        """Baidu reverse image search."""
        context = None
        tmp_path = None
        try:
            context = await self._new_context()
            page = await context.new_page()
            tmp_path = await self._save_temp_image(image_bytes)

            await page.goto("https://image.baidu.com/", wait_until="domcontentloaded", timeout=20000)
            await page.wait_for_timeout(1500)

            try:
                camera_btn = page.locator("span[class*='camera' i], div[class*='upload' i], a#sttb")
                await camera_btn.first.click(timeout=5000)
                await page.wait_for_timeout(1000)
            except Exception:
                try:
                    upload_btn = page.locator("input[type='file']")
                    if await upload_btn.count() > 0:
                        pass
                    else:
                        return []
                except Exception:
                    return []

            try:
                file_input = page.locator("input[type='file']")
                await file_input.first.set_input_files(tmp_path, timeout=5000)
                await page.wait_for_timeout(5000)
            except Exception as e:
                logger.warning(f"Baidu: file upload failed: {e}")
                return []

            try:
                await page.wait_for_url("**/detail**", timeout=25000)
                await page.wait_for_timeout(2000)
            except Exception:
                try:
                    await page.wait_for_timeout(5000)
                except Exception:
                    pass

            results = []
            seen = set()
            selectors = [
                "a[href*='http'] img",
                ".imglist a",
                ".search-result a",
            ]
            for sel in selectors:
                try:
                    elements = await page.locator(sel).all()
                    for el in elements[:30]:
                        try:
                            href = await el.get_attribute("href")
                            img_src = await el.get_attribute("src")
                            url = href or img_src or ""
                            if url and url not in seen and "baidu" not in url.lower():
                                seen.add(url)
                                results.append({
                                    "title": await el.get_attribute("alt") or "",
                                    "url": url,
                                    "image_url": img_src or "",
                                    "engine": "baidu",
                                    "confidence": 0.6,
                                })
                        except Exception:
                            continue
                except Exception:
                    continue

            return results[:30]
        except Exception as e:
            logger.warning(f"Baidu search failed: {e}")
            return []
        finally:
            if context:
                try:
                    await context.close()
                except Exception:
                    pass
            if tmp_path:
                try:
                    os.unlink(tmp_path)
                except Exception:
                    pass

    async def _search_duckduckgo(self, text_query: str) -> Optional[List[Dict]]:
        """DuckDuckGo image search by keyword."""
        context = None
        try:
            context = await self._new_context()
            page = await context.new_page()

            encoded = urllib.parse.quote(text_query[:200])
            await page.goto(f"https://duckduckgo.com/?q={encoded}&iax=images&ia=images", wait_until="domcontentloaded", timeout=15000)
            await page.wait_for_timeout(2000)

            results = []
            seen = set()
            selectors = [
                "a[href*='http'] img.tile",
                ".tile--img img",
                "a[data-tile]",
            ]
            for sel in selectors:
                try:
                    elements = await page.locator(sel).all()
                    for el in elements[:30]:
                        try:
                            src = await el.get_attribute("src")
                            href = await el.get_attribute("href")
                            url = src or href or ""
                            if url and url not in seen and "duckduckgo" not in url.lower():
                                seen.add(url)
                                results.append({
                                    "title": await el.get_attribute("alt") or "",
                                    "url": url,
                                    "image_url": src or "",
                                    "engine": "duckduckgo",
                                    "confidence": 0.5,
                                })
                        except Exception:
                            continue
                except Exception:
                    continue

            return results[:30]
        except Exception as e:
            logger.warning(f"DuckDuckGo search failed: {e}")
            return []
        finally:
            if context:
                try:
                    await context.close()
                except Exception:
                    pass


enhanced_reverse_search = EnhancedReverseSearch()
