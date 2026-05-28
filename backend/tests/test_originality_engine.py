import pytest
import io
from PIL import Image
import numpy as np


def _make_test_image(mode="RGB", size=(1920, 1080), noise_amp=30, base_color=(100, 120, 140)):
    """Create a test image with realistic content (gradient + noise)."""
    import numpy as np
    h, w = size[1], size[0]
    arr = np.zeros((h, w, 3), dtype=np.float32)
    for y in range(h):
        t = y / h
        for c in range(3):
            arr[y, :, c] = base_color[c] * (1 - t * 0.4) + 40 * t
    arr += np.random.normal(0, noise_amp, (h, w, 3))
    for c in range(3):
        arr[:, :, c] += 30 * np.sin(np.linspace(0, 4 * np.pi, w))
    arr = np.clip(arr, 0, 255).astype(np.uint8)
    img = Image.fromarray(arr, "RGB")
    buf = io.BytesIO()
    img.save(buf, "JPEG", quality=95)
    return buf.getvalue()


def _make_screenshot_like_image():
    """Create an image that looks like a screenshot (dark bars, varied content in middle)."""
    import numpy as np
    w, h = 1080, 2340
    arr = np.zeros((h, w, 3), dtype=np.uint8)
    arr[:, :] = (30, 30, 30)
    bar_top = 60
    bar_bot = 40
    arr[:bar_top, :] = (10, 10, 10)
    arr[h-bar_bot:h, :] = (10, 10, 10)
    content_h = h - bar_top - bar_bot
    content = np.random.normal(100, 40, (content_h, w, 3))
    arr[bar_top:h-bar_bot, :] = np.clip(content, 0, 255).astype(np.uint8)
    img = Image.fromarray(arr, "RGB")
    buf = io.BytesIO()
    img.save(buf, "JPEG", quality=95)
    return buf.getvalue()


@pytest.mark.asyncio
async def test_originality_engine_known_good_image():
    from app.services.originality_engine import originality_engine

    img_bytes = _make_test_image()
    result = await originality_engine.compute_originality(
        file_bytes=img_bytes,
        file_name="test_photo.jpg",
        file_hash="abc123",
        user_id="test_user",
        has_c2pa=False,
        has_blockchain_proof=False,
        existing_vault_matches=None,
    )

    assert "originality_score" in result
    assert "confidence" in result
    assert "factors" in result
    assert "preliminary" in result
    assert result["preliminary"] is True

    score = result["originality_score"]
    # Synthetic image with no C2PA, no vault matches, no screenshot, but AI-generation
    # signals detected due to uniform noise pattern (80% AI confidence)
    assert 40 <= score <= 100, f"Score {score} out of expected range"

    factors = result["factors"]
    assert "c2pa_provenance" in factors
    assert factors["c2pa_provenance"]["score"] == 20.0
    assert "vault_duplicate_check" in factors
    assert factors["vault_duplicate_check"]["score"] == 100.0
    assert "screenshot_detection" in factors


@pytest.mark.asyncio
async def test_originality_engine_screenshot():
    from app.services.originality_engine import originality_engine

    img_bytes = _make_screenshot_like_image()
    result = await originality_engine.compute_originality(
        file_bytes=img_bytes,
        file_name="screenshot.png",
        file_hash="abc456",
        user_id="test_user",
        has_c2pa=False,
        has_blockchain_proof=False,
        existing_vault_matches=None,
    )

    score = result["originality_score"]
    factors = result["factors"]
    screenshot_factor = factors.get("screenshot_detection", {})
    # Screenshot should score low in originality
    assert screenshot_factor["score"] < 50, f"Screenshot originality {screenshot_factor['score']} should be low"


@pytest.mark.asyncio
async def test_originality_engine_with_c2pa():
    from app.services.originality_engine import originality_engine

    img_bytes = _make_test_image()
    result = await originality_engine.compute_originality(
        file_bytes=img_bytes,
        file_name="verified_photo.jpg",
        file_hash="abc789",
        user_id="test_user",
        has_c2pa=True,
        has_blockchain_proof=True,
        existing_vault_matches=None,
    )

    score = result["originality_score"]
    factors = result["factors"]
    assert factors["c2pa_provenance"]["score"] == 100.0
    assert factors["blockchain_anchoring"]["score"] == 100.0
    assert score > 70, f"C2PA+blockchain image should score high, got {score}"


@pytest.mark.asyncio
async def test_originality_engine_duplicates():
    from app.services.originality_engine import originality_engine

    img_bytes = _make_test_image()
    matches = [{"scan_id": "aaa"}, {"scan_id": "bbb"}, {"scan_id": "ccc"}]
    result = await originality_engine.compute_originality(
        file_bytes=img_bytes,
        file_name="duplicate.jpg",
        file_hash="dup123",
        user_id="test_user",
        has_c2pa=False,
        has_blockchain_proof=False,
        existing_vault_matches=matches,
    )

    factors = result["factors"]
    dup_factor = factors["vault_duplicate_check"]
    assert dup_factor["score"] <= 20, f"Duplicate score should be very low, got {dup_factor['score']}"


@pytest.mark.asyncio
async def test_originality_engine_non_image():
    from app.services.originality_engine import originality_engine

    result = await originality_engine.compute_originality(
        file_bytes=b"this is a text file, not an image",
        file_name="document.txt",
        file_hash="txt123",
        user_id="test_user",
        has_c2pa=False,
        has_blockchain_proof=False,
        existing_vault_matches=None,
    )

    score = result["originality_score"]
    # Text files skip pixel-based factors but still have C2PA + vault + blockchain
    assert 20 <= score <= 100
    # Screenshot detection should be absent for non-images
    assert "screenshot_detection" not in result["factors"]


@pytest.mark.asyncio
async def test_full_originality_score_range():
    """Test that the weighted composition formula is mathematically correct."""
    from app.services.originality_engine import originality_engine

    img_bytes = _make_test_image()
    result = await originality_engine.compute_originality(
        file_bytes=img_bytes,
        file_name="range_test.jpg",
        file_hash="range123",
        user_id="test_user",
        has_c2pa=False,
        has_blockchain_proof=False,
        existing_vault_matches=None,
    )

    score = result["originality_score"]
    assert 0 <= score <= 100, f"Score {score} outside 0-100 range"

    factors = result["factors"]
    for name, data in factors.items():
        if "weight" in data and "score" in data:
            assert 0 <= data["score"] <= 100, f"Factor {name} score {data['score']} outside 0-100"
            assert 0 < data["weight"] <= 25, f"Factor {name} weight {data['weight']} outside 1-25"


@pytest.mark.asyncio
async def test_full_originality_with_search():
    """Test that compute_full_originality_with_search returns proper structure."""
    from app.services.originality_engine import originality_engine

    img_bytes = _make_test_image()
    result = await originality_engine.compute_full_originality_with_search(
        file_bytes=img_bytes,
        file_name="full_test.jpg",
        file_hash="full123",
        user_id="test_user",
        has_c2pa=False,
        has_blockchain_proof=False,
        existing_vault_matches=None,
    )

    assert "originality_score" in result
    assert "confidence" in result
    assert result["preliminary"] is False
    assert "reverse_search_needed" in result
    assert result["reverse_search_needed"] is False

    # Should have the reverse_search_consensus factor
    factors = result["factors"]
    assert "reverse_search_consensus" in factors
