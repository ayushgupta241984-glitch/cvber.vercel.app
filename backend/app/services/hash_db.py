import json
import os
import logging
from typing import Optional

logger = logging.getLogger(__name__)

_DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "data")
_HASH_DB_PATH = os.path.join(_DATA_DIR, "image_hashes.json")


def _ensure_data_dir():
    os.makedirs(_DATA_DIR, exist_ok=True)


def _load_db() -> dict:
    _ensure_data_dir()
    if not os.path.exists(_HASH_DB_PATH):
        return {}
    try:
        with open(_HASH_DB_PATH, "r") as f:
            return json.load(f)
    except (json.JSONDecodeError, OSError) as e:
        logger.warning(f"Failed to load hash DB: {e}")
        return {}


def _save_db(db: dict):
    _ensure_data_dir()
    with open(_HASH_DB_PATH, "w") as f:
        json.dump(db, f)


def register_hash(scan_id: str, dhash: str, file_name: str, user_id: str):
    db = _load_db()
    if user_id not in db:
        db[user_id] = {}
    db[user_id][scan_id] = {
        "dhash": dhash,
        "file_name": file_name,
        "scan_id": scan_id,
    }
    _save_db(db)
    logger.info(f"Registered dhash for {file_name} ({scan_id})")


def find_similar(dhash: str, user_id: str, max_distance: int = 10) -> list[dict]:
    db = _load_db()
    user_hashes = db.get(user_id, {})
    if not user_hashes:
        return []

    query_int = int(dhash, 16)
    results = []
    for scan_id, entry in user_hashes.items():
        stored_dhash = entry.get("dhash", "")
        if not stored_dhash:
            continue
        stored_int = int(stored_dhash, 16)
        dist = bin(query_int ^ stored_int).count("1")
        if dist <= max_distance:
            results.append({
                "scan_id": scan_id,
                "file_name": entry.get("file_name", "Unknown"),
                "hash_distance": dist,
            })

    results.sort(key=lambda r: r["hash_distance"])
    return results


def get_hash_for_scan(scan_id: str, user_id: str) -> Optional[str]:
    db = _load_db()
    user_hashes = db.get(user_id, {})
    entry = user_hashes.get(scan_id)
    if entry:
        return entry.get("dhash")
    return None
