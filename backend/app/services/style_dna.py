"""Style DNA Fingerprinting — compares any image against an artist's stored style embeddings."""
import logging
from typing import Optional
from app.services.clip_service import generate_embedding_from_bytes

logger = logging.getLogger(__name__)

_cosine_similarity = None

def _get_cosine():
    global _cosine_similarity
    if _cosine_similarity is None:
        try:
            from numpy.linalg import norm
            def cosine(a, b):
                a, b = __import__('numpy').array(a), __import__('numpy').array(b)
                n = norm(a) * norm(b)
                return float(__import__('numpy').dot(a, b) / n) if n > 0 else 0.0
            _cosine_similarity = cosine
        except ImportError:
            def cosine(a, b):
                dot = sum(x * y for x, y in zip(a, b))
                na = sum(x * x for x in a) ** 0.5
                nb = sum(x * x for x in b) ** 0.5
                return dot / (na * nb) if na * nb > 0 else 0.0
            _cosine_similarity = cosine
    return _cosine_similarity


async def find_style_matches(
    image_bytes: bytes,
    user_embeddings: list[dict],
    threshold: float = 0.75,
    limit: int = 10,
) -> list[dict]:
    query_emb = generate_embedding_from_bytes(image_bytes)
    if query_emb is None:
        return []

    cosine = _get_cosine()
    scored = []
    for item in user_embeddings:
        emb = item.get("embedding")
        if not emb or len(emb) != 512:
            continue
        sim = cosine(query_emb, emb)
        if sim >= threshold:
            scored.append({
                "scan_id": item.get("scan_id"),
                "file_name": item.get("file_name"),
                "similarity": round(sim, 4),
                "created_at": item.get("created_at"),
            })

    scored.sort(key=lambda x: x["similarity"], reverse=True)
    return scored[:limit]


def compute_style_profile(embeddings: list[list[float]]) -> Optional[list[float]]:
    if not embeddings:
        return None
    try:
        dim = len(embeddings[0])
        centroid = [sum(e[i] for e in embeddings) / len(embeddings) for i in range(dim)]
        norm = sum(x * x for x in centroid) ** 0.5
        return [x / norm for x in centroid] if norm > 0 else centroid
    except Exception as e:
        logger.error(f"Failed to compute style profile: {e}")
        return None
