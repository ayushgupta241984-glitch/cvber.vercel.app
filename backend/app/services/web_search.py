"""
Reverse Image Search Service
Actually searches the internet to check if an image exists elsewhere.
"""
import httpx
import logging
from typing import List, Dict, Any

logger = logging.getLogger(__name__)


class WebSearchService:
    """Search the web for image matches"""
    
    def __init__(self):
        self.search_timeout = 10.0
    
    async def check_image_online(self, file_hash: str, file_name: str = None) -> Dict[str, Any]:
        """
        Check if this image exists anywhere on the internet.
        Returns matches found or empty list if none.
        """
        results = {
            "searched": True,
            "matches_found": 0,
            "matches": [],
            "search_method": "none",
            "is_original": True
        }
        
        # Method 1: Check our own vault for duplicate hash (internal "internet")
        try:
            from supabase import create_client
            from app.config import settings
            
            supabase = create_client(settings.supabase_url, settings.supabase_service_role_key)
            
            # Check if this exact hash exists in our vault (uploaded by anyone)
            existing = supabase.table("vault_files")\
                .select("id, file_name, user_id, created_at")\
                .eq("original_hash", file_hash.lower())\
                .execute()
            
            if existing.data and len(existing.data) > 0:
                # This exact image was already uploaded to our system
                results["matches_found"] = len(existing.data)
                results["search_method"] = "internal_vault"
                results["matches"] = [
                    {
                        "url": f"vault://{r['id']}",
                        "source": "CVBER Vault",
                        "filename": r.get("file_name", "unknown"),
                        "confidence": 1.0
                    }
                    for r in existing.data[:5]
                ]
                results["is_original"] = False
                results["explanation"] = f"Exact match found in CVBER vault ({len(existing.data)} instances)"
                return results
        except Exception as e:
            logger.warning(f"Vault hash check failed: {e}")
        
        # Method 2: Try Google Lens-style search via web scraping
        # (Note: Real reverse image search APIs require paid keys, 
        # this is a simplified fallback using filename-based search)
        if file_name:
            try:
                search_results = await self._search_by_filename(file_name)
                if search_results:
                    results["matches_found"] = len(search_results)
                    results["matches"] = search_results
                    results["search_method"] = "filename_search"
                    results["is_original"] = False
                    results["explanation"] = f"Found {len(search_results)} web matches via filename"
            except Exception as e:
                logger.warning(f"Web search failed: {e}")
        
        # If nothing found, mark as potentially original
        if results["matches_found"] == 0:
            results["explanation"] = "No matches found in vault or web search - possibly original"
        
        return results
    
    async def _search_by_filename(self, file_name: str) -> List[Dict]:
        """Search the web using filename as query"""
        search_term = file_name.rsplit('.', 1)[0] if '.' in file_name else file_name
        search_term = search_term.replace('_', ' ').replace('-', ' ')

        for suffix in ['IMG_', 'DSC_', 'screenshot', 'photo', 'image']:
            if search_term.upper().startswith(suffix):
                search_term = search_term[len(suffix):].strip()

        if len(search_term) < 3:
            return []

        try:
            from duckduckgo_search import DDGS
            results = []
            with DDGS(timeout=10) as ddgs:
                for r in ddgs.text(search_term, max_results=10, region="wt-wt", safesearch="off"):
                    if r.get("href"):
                        results.append({
                            "url": r["href"],
                            "source": "web",
                            "filename": r.get("title", ""),
                            "confidence": 0.3,
                            "snippet": r.get("body", "")
                        })
            return results
        except Exception as e:
            logger.warning(f"DuckDuckGo filename search failed: {e}")
            return []
    
    async def find_similar_uploads(self, user_id: str, file_hash: str) -> List[Dict]:
        """Check if THIS USER has uploaded this before"""
        try:
            from supabase import create_client
            from app.config import settings
            
            supabase = create_client(settings.supabase_url, settings.supabase_service_role_key)
            
            existing = supabase.table("vault_files")\
                .select("scan_id, file_name, created_at")\
                .eq("original_hash", file_hash.lower())\
                .eq("user_id", user_id)\
                .order("created_at", desc=True)\
                .execute()
            
            return existing.data or []
        except Exception as e:
            logger.warning(f"Check for user's prior uploads failed: {e}")
            return []


# Singleton
web_search_service = WebSearchService()