# pytest.ini_options asyncio_mode must be "auto" or test must mark asyncio
import pytest
import httpx
from app.services.clip_service import generate_embedding_from_bytes
import math
import io
from PIL import Image

def test_clip_embedding_from_pil():
    """Test CLIP embedding using a locally generated test image (no network needed)."""
    # 1. Create a simple solid-color test image in memory
    img = Image.new("RGB", (224, 224), color=(128, 64, 200))
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    image_bytes = buf.getvalue()

    # 2. Generate embedding
    embedding = generate_embedding_from_bytes(image_bytes)

    # 3. Verify it's a list of 512 floats
    assert embedding is not None, "Embedding generation failed"
    assert isinstance(embedding, list), "Embedding should be a list"
    assert len(embedding) == 512, "CLIP ViT-B-32 embeddings should be 512 dimensions"

    # 4. Verify the L2 norm is approximately 1.0 (normalized)
    norm = math.sqrt(sum(x * x for x in embedding))
    assert math.isclose(norm, 1.0, rel_tol=1e-5), f"Embedding is not normalized to unit length (norm={norm})"
    print(f"\nPASS: CLIP embedding 512-dim, L2 norm = {norm:.6f}")

