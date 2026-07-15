import json
import os
import logging
import threading
from typing import Optional

logger = logging.getLogger(__name__)

_DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "data")
_HASH_DB_PATH = os.path.join(_DATA_DIR, "image_hashes.json")
_db_lock = threading.Lock()


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


def register_hash(scan_id: str, hashes: dict[str, str], file_name: str, user_id: str):
    with _db_lock:
        db = _load_db()
        if user_id not in db:
            db[user_id] = {}
        db[user_id][scan_id] = {
            "dhash": hashes.get("dhash", ""),
            "ahash": hashes.get("ahash", ""),
            "color_hist": hashes.get("color_hist", ""),
            "file_name": file_name,
            "scan_id": scan_id,
        }
        _save_db(db)
    logger.info(f"Registered multi-hash for {file_name} ({scan_id})")


def hamming_distance(a: str, b: str) -> int:
    max_len = max(len(a), len(b))
    a = a.zfill(max_len)
    b = b.zfill(max_len)
    return sum(1 for ca, cb in zip(a, b) if ca != cb)


def color_hist_distance(a: str, b: str) -> int:
    av = [int(x) for x in a.split(",")]
    bv = [int(x) for x in b.split(",")]
    return sum(abs(av[i] - bv[i]) for i in range(min(len(av), len(bv)))) // len(av)


_THRESHOLDS = {"dhash": 8, "ahash": 8, "color_hist": 15}
_HASH_WEIGHTS = {"dhash": 2, "ahash": 2, "color_hist": 1}


def find_similar_multi(query_hashes: dict[str, str], user_id: str, min_confidence: float = 50.0) -> list[dict]:
    with _db_lock:
        db = _load_db()
    user_hashes = db.get(user_id, {})
    if not user_hashes:
        return []

    results = []
    for scan_id, entry in user_hashes.items():
        agreements = 0
        total_weight = 0
        details = {}
        for htype in ("dhash", "ahash", "color_hist"):
            qh = query_hashes.get(htype, "")
            sh = entry.get(htype, "")
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
        if confidence >= min_confidence:
            results.append({
                "scan_id": scan_id,
                "file_name": entry.get("file_name", "Unknown"),
                "confidence": confidence,
                "details": details,
            })

    results.sort(key=lambda r: r["confidence"], reverse=True)
    return results


def get_hashes_for_scan(scan_id: str, user_id: str) -> Optional[dict[str, str]]:
    with _db_lock:
        db = _load_db()
    entry = db.get(user_id, {}).get(scan_id)
    if entry:
        return {"dhash": entry.get("dhash", ""), "ahash": entry.get("ahash", ""), "color_hist": entry.get("color_hist", "")}
    return None
