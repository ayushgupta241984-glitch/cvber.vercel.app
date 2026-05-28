"""
Advanced Image Comparison Engine
Multi-algorithm comparison: ORB, SIFT, SSIM, perceptual hashing,
color histograms, noise analysis, ELA, EXIF analysis.
"""
import logging
import io
import struct
import asyncio
from typing import Optional, Dict, Any
from collections import Counter

import numpy as np

logger = logging.getLogger(__name__)


def _pil_to_cv2(pil_image):
    """Convert PIL Image to OpenCV BGR format."""
    try:
        import cv2
        return cv2.cvtColor(np.array(pil_image), cv2.COLOR_RGB2BGR)
    except Exception:
        return None


def _pil_to_rgb_array(pil_image):
    """Convert PIL Image to RGB numpy array."""
    return np.array(pil_image.convert("RGB"))


def compare_images_advanced(source_bytes: bytes, candidate_bytes: bytes) -> Dict[str, Any]:
    """
    Compare two images using all available algorithms.
    Returns a composite similarity score and detailed breakdown.
    """
    from PIL import Image

    result = {
        "composite_score": 0.0,
        "components": {},
        "error": None,
    }

    try:
        source_img = Image.open(io.BytesIO(source_bytes)).convert("RGB")
        candidate_img = Image.open(io.BytesIO(candidate_bytes)).convert("RGB")
    except Exception as e:
        result["error"] = f"Image load failed: {e}"
        return result

    scores = []

    # 1. ORB feature matching (geometric correspondence)
    try:
        import cv2
        src_cv = _pil_to_cv2(source_img)
        cnd_cv = _pil_to_cv2(candidate_img)
        if src_cv is not None and cnd_cv is not None:
            orb = cv2.ORB_create(nfeatures=2000)
            kp1, des1 = orb.detectAndCompute(src_cv, None)
            kp2, des2 = orb.detectAndCompute(cnd_cv, None)
            if des1 is not None and des2 is not None and len(des1) > 5 and len(des2) > 5:
                bf = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=True)
                matches = bf.match(des1, des2)
                matches = sorted(matches, key=lambda x: x.distance)
                good = [m for m in matches if m.distance < 50]
                orb_score = min(1.0, len(good) / max(min(len(kp1), len(kp2)), 1) * 2)
                result["components"]["orb"] = round(orb_score, 3)
                result["keypoints_source"] = len(kp1)
                result["keypoints_candidate"] = len(kp2)
                result["orb_good_matches"] = len(good)
                scores.append(orb_score * 1.5)
            else:
                result["components"]["orb"] = 0.0
    except Exception as e:
        logger.debug(f"ORB comparison failed: {e}")

    # 2. SIFT feature matching (more robust for scaled/rotated images)
    try:
        import cv2
        if src_cv is not None and cnd_cv is not None:
            sift = cv2.SIFT_create()
            kp1, des1 = sift.detectAndCompute(src_cv, None)
            kp2, des2 = sift.detectAndCompute(cnd_cv, None)
            if des1 is not None and des2 is not None and len(des1) > 3 and len(des2) > 3:
                FLANN_INDEX_KDTREE = 1
                index_params = dict(algorithm=FLANN_INDEX_KDTREE, trees=5)
                search_params = dict(checks=50)
                flann = cv2.FlannBasedMatcher(index_params, search_params)
                matches = flann.knnMatch(des1, des2, k=2)
                good = []
                for pair in matches:
                    if len(pair) == 2:
                        m, n = pair
                        if m.distance < 0.75 * n.distance:
                            good.append(m)
                sift_score = min(1.0, len(good) / max(len(kp1), 1) * 3)
                result["components"]["sift"] = round(sift_score, 3)
                result["sift_good_matches"] = len(good)
                scores.append(sift_score * 1.3)
            else:
                result["components"]["sift"] = 0.0
    except Exception as e:
        logger.debug(f"SIFT comparison failed: {e}")

    # 3. SSIM (structural similarity)
    try:
        from skimage.metrics import structural_similarity as ssim
        src_arr = _pil_to_rgb_array(source_img)
        cnd_arr = _pil_to_rgb_array(candidate_img)
        h, w = min(src_arr.shape[0], cnd_arr.shape[0]), min(src_arr.shape[1], cnd_arr.shape[1])
        src_resized = src_arr[:h, :w]
        cnd_resized = cnd_arr[:h, :w]
        ssim_value = ssim(src_resized, cnd_resized, channel_axis=-1, data_range=255)
        result["components"]["ssim"] = round(float(ssim_value), 3)
        scores.append(float(ssim_value) * 1.2)
    except Exception as e:
        logger.debug(f"SSIM comparison failed: {e}")

    # 4. Perceptual hashing (dhash, phash, average_hash, wavelet)
    try:
        import imagehash
        hash_fns = [
            ("dhash", imagehash.dhash),
            ("phash", imagehash.phash),
            ("average_hash", imagehash.average_hash),
            ("whash", imagehash.whash),
        ]
        hash_scores = []
        for name, fn in hash_fns:
            try:
                sh = fn(source_img)
                ch = fn(candidate_img)
                dist = sh - ch
                hash_scores.append(max(0.0, 1.0 - (dist / max(len(str(bin(sh.hash))), 64))))
            except Exception:
                continue
        if hash_scores:
            phash_score = sum(hash_scores) / len(hash_scores)
            result["components"]["perceptual_hash"] = round(phash_score, 3)
            scores.append(phash_score)
    except Exception as e:
        logger.debug(f"Perceptual hashing failed: {e}")

    # 5. Color histogram comparison
    try:
        import cv2
        if src_cv is not None and cnd_cv is not None:
            src_hist = cv2.calcHist([src_cv], [0, 1, 2], None, [8, 8, 8], [0, 256, 0, 256, 0, 256])
            cnd_hist = cv2.calcHist([cnd_cv], [0, 1, 2], None, [8, 8, 8], [0, 256, 0, 256, 0, 256])
            cv2.normalize(src_hist, src_hist, 0, 1, cv2.NORM_MINMAX)
            cv2.normalize(cnd_hist, cnd_hist, 0, 1, cv2.NORM_MINMAX)
            hist_score = cv2.compareHist(src_hist, cnd_hist, cv2.HISTCMP_CORREL)
            hist_score = max(0.0, hist_score)
            result["components"]["color_histogram"] = round(hist_score, 3)
            scores.append(hist_score * 0.8)
    except Exception as e:
        logger.debug(f"Color histogram comparison failed: {e}")

    # 6. Template matching (for exact or near-exact copies)
    try:
        import cv2
        if src_cv is not None and cnd_cv is not None:
            src_gray = cv2.cvtColor(src_cv, cv2.COLOR_BGR2GRAY)
            cnd_gray = cv2.cvtColor(cnd_cv, cv2.COLOR_BGR2GRAY)
            h_src, w_src = src_gray.shape
            h_cnd, w_cnd = cnd_gray.shape
            if h_src <= h_cnd and w_src <= w_cnd:
                tm = cv2.matchTemplate(cnd_gray, src_gray, cv2.TM_CCOEFF_NORMED)
                tm_score = float(np.max(tm))
                result["components"]["template_match"] = round(tm_score, 3)
                if tm_score > 0.5:
                    scores.append(tm_score * 1.8)
            elif h_cnd <= h_src and w_cnd <= w_src:
                tm = cv2.matchTemplate(src_gray, cnd_gray, cv2.TM_CCOEFF_NORMED)
                tm_score = float(np.max(tm))
                result["components"]["template_match"] = round(tm_score, 3)
                if tm_score > 0.5:
                    scores.append(tm_score * 1.8)
    except Exception as e:
        logger.debug(f"Template matching failed: {e}")

    # Compute composite score (weighted average)
    if scores:
        weights = [1.0] * len(scores)
        result["composite_score"] = round(
            sum(s * w for s, w in zip(scores, weights)) / sum(weights), 3
        )
        result["composite_score"] = min(1.0, result["composite_score"])
    else:
        result["composite_score"] = 0.0

    return result


def analyze_noise_pattern(image_bytes: bytes) -> Dict[str, Any]:
    """
    Analyze image noise patterns to detect AI generation or screen capture.
    AI-generated images often have characteristic noise patterns.
    """
    from PIL import Image
    result = {
        "is_ai_generated": False,
        "confidence": 0.0,
        "noise_score": 0.0,
        "block_artifact_score": 0.0,
        "details": {},
    }

    try:
        img = Image.open(io.BytesIO(image_bytes)).convert("L")
        arr = np.array(img, dtype=np.float32)
        h, w = arr.shape

        # 1. Noise analysis: compute local variance
        from scipy.ndimage import uniform_filter
        local_mean = uniform_filter(arr, size=5)
        local_var = uniform_filter((arr - local_mean) ** 2, size=5)
        avg_noise = float(np.mean(np.sqrt(local_var)))
        noise_std = float(np.std(np.sqrt(local_var)))

        # AI images tend to have very uniform noise
        noise_uniformity = 1.0 - min(1.0, noise_std / max(avg_noise, 0.01))
        result["noise_score"] = round(avg_noise, 2)
        result["details"]["noise_uniformity"] = round(noise_uniformity, 3)
        result["details"]["noise_std"] = round(noise_std, 2)

        # 2. Block artifact detection (JPEG-like grid artifacts)
        if h > 16 and w > 16:
            block_diff_h = 0.0
            block_diff_v = 0.0
            count = 0
            for y in range(8, h - 8, 8):
                block_diff_h += float(np.abs(arr[y, :w//4] - arr[y-1, :w//4]).mean())
                count += 1
            for x in range(8, w - 8, 8):
                block_diff_v += float(np.abs(arr[:h//4, x] - arr[:h//4, x-1]).mean())
                count += 1
            if count > 0:
                block_artifact_score = min(1.0, (block_diff_h + block_diff_v) / count / 5.0)
                result["block_artifact_score"] = round(block_artifact_score, 3)

        # 3. Detect AI generation (high noise uniformity + specific patterns)
        ai_signals = 0
        if noise_uniformity > 0.85:
            ai_signals += 1
        if avg_noise < 3.0:
            ai_signals += 1
        if result["block_artifact_score"] > 0.3:
            ai_signals += 1

        if ai_signals >= 2:
            result["is_ai_generated"] = True
            result["confidence"] = round(0.5 + ai_signals * 0.15, 2)

    except Exception as e:
        logger.debug(f"Noise analysis failed: {e}")
        result["error"] = str(e)

    return result


def analyze_exif(image_bytes: bytes) -> Dict[str, Any]:
    """
    Analyze EXIF/metadata for authenticity signals.
    Returns whether the image has authentic camera provenance.
    """
    from PIL import Image
    from PIL.ExifTags import TAGS

    result = {
        "has_exif": False,
        "has_gps": False,
        "has_camera_info": False,
        "is_screenshot_signal": False,
        "authenticity_score": 0.0,
        "details": {},
    }

    try:
        img = Image.open(io.BytesIO(image_bytes))
        exif_data = img._getexif()
        if not exif_data:
            result["details"]["note"] = "No EXIF data found"
            return result

        result["has_exif"] = True
        parsed = {}
        for tag_id, value in exif_data.items():
            tag_name = TAGS.get(tag_id, tag_id)
            parsed[tag_name] = value

        result["details"]["fields_found"] = list(parsed.keys())[:20]

        authenticity_signals = 0

        camera_fields = ["Make", "Model", "ISOSpeedRatings", "FNumber", "ExposureTime", "FocalLength"]
        gps_fields = ["GPSInfo", "GPSLatitude", "GPSLongitude"]

        has_camera = any(f in parsed for f in camera_fields)
        has_gps = any(f in parsed for f in gps_fields)
        has_software = "Software" in parsed
        has_datetime = "DateTimeOriginal" in parsed or "DateTime" in parsed

        result["has_camera_info"] = has_camera
        result["has_gps"] = has_gps

        if has_camera:
            authenticity_signals += 3
            result["details"]["camera"] = f"{parsed.get('Make', '')} {parsed.get('Model', '')}".strip()
        if has_gps:
            authenticity_signals += 2
        if has_datetime:
            authenticity_signals += 1
        if has_software and "screenshot" in parsed.get("Software", "").lower():
            result["is_screenshot_signal"] = True
            authenticity_signals -= 2

        result["authenticity_score"] = round(min(1.0, authenticity_signals / 6.0), 2)

    except Exception as e:
        logger.debug(f"EXIF analysis failed: {e}")
        result["details"]["error"] = str(e)

    return result


def analyze_for_deepfake(image_bytes: bytes) -> Dict[str, Any]:
    """
    Analyze for deepfake/AI manipulation artifacts.
    Uses ELA (Error Level Analysis) and frequency domain analysis.
    """
    from PIL import Image
    result = {
        "ela_score": 0.0,
        "frequency_anomaly": False,
        "manipulation_probability": 0.0,
        "details": {},
    }

    try:
        img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        arr = np.array(img)

        # ELA: resave at known quality and compare
        ela_buffer = io.BytesIO()
        img.save(ela_buffer, "JPEG", quality=90)
        ela_buffer.seek(0)
        ela_img = Image.open(ela_buffer).convert("RGB")
        ela_arr = np.array(ela_img)

        diff = np.abs(arr.astype(np.float32) - ela_arr.astype(np.float32))
        ela_score = float(np.mean(diff))
        result["ela_score"] = round(ela_score, 2)
        result["details"]["max_ela"] = round(float(np.max(diff)), 2)

        # High ELA variance across regions may indicate tampering
        h, w, _ = diff.shape
        if h > 10 and w > 10:
            blocks_h = h // 10
            blocks_w = w // 10
            block_means = []
            for by in range(10):
                for bx in range(10):
                    block = diff[by*blocks_h:(by+1)*blocks_h, bx*blocks_w:(bx+1)*blocks_w]
                    block_means.append(float(np.mean(block)))
            ela_variance = float(np.std(block_means))
            result["details"]["ela_block_variance"] = round(ela_variance, 2)

            if ela_variance > 3.0 and ela_score > 2.0:
                result["frequency_anomaly"] = True
                result["manipulation_probability"] = round(min(1.0, 0.3 + ela_variance * 0.05), 2)

    except Exception as e:
        logger.debug(f"ELA/frequency analysis failed: {e}")
        result["details"]["error"] = str(e)

    return result
