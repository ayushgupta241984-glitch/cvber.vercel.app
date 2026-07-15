import os
import json
import logging
import asyncio
import time
from datetime import datetime, timezone
from typing import Optional, Dict, Any, List
from enum import Enum

logger = logging.getLogger(__name__)

try:
    import google.genai as genai
    GENAI_AVAILABLE = True
except ImportError:
    GENAI_AVAILABLE = False
    logger.warning("google.genai not available")

try:
    from groq import AsyncGroq
    GROQ_AVAILABLE = True
except ImportError:
    GROQ_AVAILABLE = False
    logger.warning("groq.AsyncGroq not available")

try:
    from google.cloud import aiplatform
    from vertexai.generative_models import GenerativeModel, Part
    VERTEX_AI_AVAILABLE = True
except ImportError:
    VERTEX_AI_AVAILABLE = False
    logger.warning("Vertex AI SDK not available")

from app.config import settings
from app.models.schemas import RiskReport, ThreatCategory, DetailedFinding, Recommendation

IMAGE_EXTENSIONS = {'.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp', '.tiff', '.tif', '.svg'}
IMAGE_MIME_PREFIXES = ('image/', 'application/octet-stream')


def is_image_file(file_name: str, file_type: str) -> bool:
    if file_type.startswith('image/'):
        return True
    ext = os.path.splitext(file_name)[1].lower()
    return ext in IMAGE_EXTENSIONS


class ProviderState(Enum):
    HEALTHY = "healthy"
    DEGRADED = "degraded"
    FAILED = "failed"


class CircuitBreaker:
    def __init__(self, name: str, failure_threshold: int = 3, recovery_timeout: int = 60):
        self.name = name
        self.failure_threshold = failure_threshold
        self.recovery_timeout = recovery_timeout
        self.failure_count = 0
        self.last_failure_time = 0.0
        self.state = ProviderState.HEALTHY

    def record_success(self):
        self.failure_count = 0
        self.state = ProviderState.HEALTHY

    def record_failure(self):
        self.failure_count += 1
        self.last_failure_time = time.time()
        if self.failure_count >= self.failure_threshold:
            self.state = ProviderState.FAILED
            logger.warning(f"Circuit breaker '{self.name}' OPEN after {self.failure_count} failures")

    def can_attempt(self) -> bool:
        if self.state == ProviderState.HEALTHY:
            return True
        if self.state == ProviderState.FAILED:
            elapsed = time.time() - self.last_failure_time
            if elapsed >= self.recovery_timeout:
                self.state = ProviderState.DEGRADED
                logger.info(f"Circuit breaker '{self.name}' HALF-OPEN, allowing retry")
                return True
            return False
        return True


def _rule_based_analysis(file_name: str) -> Dict[str, Any]:
    filename_lower = file_name.lower()
    
    # Only flag as screenshot if filename VERY clearly indicates screenshot
    strong_screenshot_indicators = [
        "screenshot", "screen shot", "screen_cap", "capture", 
        "screengrab", "snip", "snap_", "_screen"
    ]
    
    is_screenshot = any(indicator in filename_lower for indicator in strong_screenshot_indicators)
    
    if is_screenshot:
        return {
            "is_screenshot": True,
            "originality_score": 5.0,
            "forensic_details": "RULE-BASED: Filename contains strong screenshot indicator.",
        }
    
    # Let image analysis determine this - return neutral values
    return {
        "is_screenshot": False,
        "originality_score": 50.0,
        "forensic_details": "Performing image analysis...",
    }


def _analyze_image_for_screenshot(file_buffer: bytes, file_name: str = "") -> Dict[str, Any]:
    """
    Actually analyze image to detect screenshots - checks pixels, aspect ratios, edge uniformity.
    This is self-sufficient detection that doesn't rely on AI or filenames.
    Skips analysis for video files.
    """
    video_extensions = {'.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv'}
    ext = '.' + file_name.split('.')[-1].lower() if file_name else ''
    if ext in video_extensions:
        return {"is_screenshot": False, "score": 0, "reasons": ["video_file"], "aspect_ratio": 0, "dimensions": "0x0"}

    try:
        from PIL import Image
        import io
        
        img = Image.open(io.BytesIO(file_buffer))
        width, height = img.size
        aspect_ratio = width / height if height > 0 else 0
        
        screenshot_score = 0
        reasons = []
        
        # Check aspect ratios - more aggressive
        common_screenshot_ratios = [
            (19.5, 9), (18, 9), (18.5, 9), (18.8, 9), (19.2, 9),  # iPhones
            (4, 3), (3, 4),  # iPads
            (16, 10), (16, 9), (14, 9),  # Androids, laptops
            (21, 9), (32, 9),  # Ultra-wide
            (9, 16), (9, 19.5), (9, 18),  # Vertical videos/screenshots
        ]
        for r_w, r_h in common_screenshot_ratios:
            expected = r_w / r_h
            if abs(aspect_ratio - expected) < 0.2:
                screenshot_score += 3
                reasons.append(f"ratio_{r_w}x{r_h}")
                break
        
        # Additional: check for suspiciously "perfect" aspect ratios for photos
        # Most camera photos are 4:3 (3:2) - screenshot-like ratios are suspicious
        photo_ratios = [1.5, 1.33]  # 3:2, 4:3
        if not reasons:  # Only if not already detected
            for pr in photo_ratios:
                if abs(aspect_ratio - pr) < 0.05:
                    # This could be either photo OR screenshot - check other factors
                    break
        
        # Check for uniform edges (screenshot borders) - more lenient
        if img.mode in ('RGB', 'RGBA'):
            try:
                pixels = img.load()
                edge_colors = []
                # Sample edges
                for x in range(0, width, max(1, width // 10)):
                    edge_colors.append(pixels[x, 0])
                    edge_colors.append(pixels[x, height - 1])
                for y in range(0, height, max(1, height // 10)):
                    edge_colors.append(pixels[0, y])
                    edge_colors.append(pixels[width - 1, y])
                
                if edge_colors:
                    first = edge_colors[0]
                    similar = sum(1 for c in edge_colors if c == first) / len(edge_colors)
                    # Lower threshold from 0.75 to 0.6
                    if similar > 0.6:
                        screenshot_score += 2
                        reasons.append("uniform_edges")
            except Exception:
                pass
        
        # Check for notch/status bar region - more lenient
        if img.mode in ('RGB', 'RGBA'):
            try:
                pixels = img.load()
                # Check top 5% for dark bar (notch)
                top_region_height = max(1, height // 20)
                dark_rows = 0
                for y in range(0, top_region_height):
                    row_colors = [pixels[x, y] for x in range(0, width, max(1, width // 20))]
                    dark_in_row = sum(1 for c in row_colors if sum(c[:3]) < 30)
                    if dark_in_row / len(row_colors) > 0.5:
                        dark_rows += 1
                
                if dark_rows >= top_region_height * 0.5:
                    screenshot_score += 2
                    reasons.append("notch_bar")
            except Exception:
                pass
        
        # NEW: Check for bottom bar (home indicator)
        if img.mode in ('RGB', 'RGBA'):
            try:
                pixels = img.load()
                bottom_region_height = max(1, height // 25)
                dark_rows = 0
                for y in range(height - bottom_region_height, height):
                    row_colors = [pixels[x, y] for x in range(0, width, max(1, width // 20))]
                    dark_in_row = sum(1 for c in row_colors if sum(c[:3]) < 30)
                    if dark_in_row / len(row_colors) > 0.5:
                        dark_rows += 1
                
                if dark_rows >= bottom_region_height * 0.5:
                    screenshot_score += 2
                    reasons.append("home_bar")
            except Exception:
                pass
        
        # NEW: Very small image size check (screenshots often have specific sizes)
        # Phone screenshots are often between 500KB-5MB, not huge originals
        # This is weak signal, only use if other factors present
        if width < 2000 and height < 4000:
            screenshot_score += 1
            reasons.append("small_dimensions")
        
        # Threshold: require at least 4 points to reduce false positives on simple/solid-color images
        is_screenshot = screenshot_score >= 4
        
        return {
            "is_screenshot": is_screenshot,
            "score": screenshot_score,
            "reasons": reasons,
            "aspect_ratio": round(aspect_ratio, 2),
            "dimensions": f"{width}x{height}"
        }
    except Exception as e:
        return {"is_screenshot": False, "score": 0, "reasons": [], "error": str(e)}


def _clean_json_response(text: str) -> str:
    text = text.strip()
    if text.startswith("```json"):
        text = text[7:]
    if text.startswith("```"):
        text = text[3:]
    if text.endswith("```"):
        text = text[:-3]
    return text.strip()


def _generate_mock_report(file_name: str, file_type: str, file_size: int,
                          error: str = None, rules: Dict = None) -> RiskReport:
    desc = "AI OFFLINE" if not error else "ANALYSIS UNAVAILABLE"
    is_screenshot = rules["is_screenshot"] if rules else "screenshot" in file_name.lower()
    if rules and rules["originality_score"] is not None:
        originality = rules["originality_score"]
    else:
        originality = 15.0 if is_screenshot else 50.0
    forensic_summary = rules["forensic_details"] if rules else (
        f"{desc} | Screenshot flag" if is_screenshot else f"{desc} | Unknown")

    return RiskReport(
        overall_risk_score=0.0,
        originality_score=originality,
        is_screenshot=is_screenshot,
        threat_categories=[ThreatCategory(
            name="AI Offline", severity="medium", confidence=1.0,
            description="AI scanning engine unreachable. Results based on local pre-scan rules."
        )],
        detailed_findings=[DetailedFinding(category="System", description=desc, evidence=file_name)],
        recommendations=[Recommendation(priority="high", action="Configure AI",
                                        rationale="Connect Google AI or Groq to enable pixel-level forensics.")],
        confidence_level=0.5,
        scan_timestamp=datetime.now(timezone.utc),
        file_metadata={
            "file_name": file_name, "file_type": file_type, "file_size": file_size,
            "ai_provider": "local_pre_scanner", "ai_model": "rule_v1",
            "forensic_summary": forensic_summary
        }
    )


def _build_forensic_prompt(file_name: str, file_type: str, has_c2pa: bool) -> str:
    c2pa_status = "VERIFIED CRYPTOGRAPHIC PROVENANCE DETECTED" if has_c2pa else "NO CRYPTOGRAPHIC PROVENANCE (UNSIGNATURED)"
    return f"""You are a top-tier digital forensics inspector for CVBER Free. 
Analyze this file: {file_name} ({file_type}).
CRYPTO STATUS: {c2pa_status}

### STEP 1: PIXEL-LEVEL FORENSICS
Look at the edges, corners, and color gradients.
Identify subtle signs of a "Capture" instead of an "Original Source":
- **UI Artifacts**: Any status bar icons, home bars, time, battery, or scroll bars?
- **Compression Gaps**: Screenshots often have different noise patterns than original sensor data.
- **Edge Oscillations**: Look for the slight blur characteristic of OS-level screen capture overlays.

### STEP 2: SCORING RULES (STRICT)
- **IS_SCREENSHOT**: Set to `true` if ANY capture artifacts exist. 
- **ORIGINALITY_SCORE**: 
  - 0-15: Confirmed screenshot or direct duplicate found online.
  - 16-50: Likely screenshot or repost from social media (TikTok/Insta artifacts).
  - 51-84: Possibly original, but lacks cryptographic proof.
  - 85-100: ONLY allow if the file shows genuine sensor/creative depth AND has NO capture artifacts. 
  - **CAP**: If CRYPTO STATUS is 'NO CRYPTOGRAPHIC PROVENANCE', do NOT exceed 85% even if it looks perfect.

### OUTPUT FORMAT (Valid JSON only):
{{
    "overall_risk_score": 0-100,
    "originality_score": 0-100,
    "is_screenshot": true/false,
    "forensic_details": "Detailed technical explanation.",
    "threat_categories": [{{"name": string, "severity": "low|medium|high|critical", "confidence": 0-1, "description": string}}],
    "detailed_findings": [{{"category": string, "description": string, "evidence": string}}],
    "recommendations": [{{"priority": "low|medium|high", "action": string, "rationale": string}}],
    "confidence_level": 0.0-1.0
}}"""


def _build_risk_from_data(data: dict, rules: dict, has_c2pa: bool, provider: str, model: str,
                          file_name: str, file_type: str, file_size: int) -> RiskReport:
    is_screenshot = data.get("is_screenshot", False) or rules["is_screenshot"]
    ai_originality_score = float(data.get("originality_score", 100))

    if is_screenshot:
        originality_score = min(ai_originality_score, 15.0)
    else:
        originality_score = ai_originality_score

    if rules["is_screenshot"]:
        originality_score = min(originality_score, rules["originality_score"])

    # Text-only models can't actually verify originality — cap at 70
    if provider in ("groq",) and not is_screenshot:
        originality_score = min(originality_score, 70.0)

    description = data.get("forensic_details", rules["forensic_details"])
    if is_screenshot and "Screenshot" not in description:
        description = f"Screenshot Detected: {description}"

    threats = [ThreatCategory(**c) for c in data.get("threat_categories", [])]
    if is_screenshot:
        threats.append(ThreatCategory(
            name="Ownership Alert", severity="high", confidence=1.0,
            description="File flagged as screenshot. Original IP cannot be verified at source level."
        ))

    return RiskReport(
        overall_risk_score=data.get("overall_risk_score", 0),
        originality_score=originality_score,
        is_screenshot=is_screenshot,
        threat_categories=threats,
        detailed_findings=[DetailedFinding(**f) for f in data.get("detailed_findings", [])],
        recommendations=[Recommendation(**r) for r in data.get("recommendations", [])],
        confidence_level=data.get("confidence_level", 0.9),
        scan_timestamp=datetime.now(timezone.utc),
        file_metadata={
            "file_name": file_name, "file_type": file_type, "file_size": file_size,
            "ai_provider": provider, "ai_model": model,
            "forensic_summary": description,
            "web_detection": "active" if provider == "google" else "inactive",
            "c2pa_verified": has_c2pa
        }
    )


class VertexAIService:
    def __init__(self):
        self.model = None
        self.groq_client = None
        self.nim_client = None
        self.initialized = False
        self.provider: Optional[str] = None
        self._setup_attempted = False

        self.google_cb = CircuitBreaker("google-ai", failure_threshold=3, recovery_timeout=60)
        self.groq_cb = CircuitBreaker("groq", failure_threshold=3, recovery_timeout=60)
        self.vertex_cb = CircuitBreaker("vertex", failure_threshold=2, recovery_timeout=120)
        self.nim_cb = CircuitBreaker("nim", failure_threshold=3, recovery_timeout=60)

        self._config_models()
        self.ensure_initialized()

    def _config_models(self):
        self.google_model_name = settings.google_model or "gemini-1.5-flash"
        self.groq_model_name = settings.groq_model or "llama-3.3-70b-versatile"
        self.groq_vision_model = settings.groq_vision_model or "llama-3.2-90b-vision-preview"
        self.vertex_model_name = settings.vertex_ai_model or "gemini-1.5-flash-002"
        self.nim_model_name = settings.nvidia_nim_model or "google/gemma-3n-e4b-it"
        self.nim_base_url = settings.nvidia_nim_base_url

    @staticmethod
    def is_valid_key(key: Optional[str]) -> bool:
        if not key:
            return False
        placeholders = ["placeholder", "your-", "key-here", "secret-here"]
        return not any(p in key.lower() for p in placeholders)

    def get_provider_status(self) -> Dict[str, Any]:
        return {
            "google": {
                "available": GENAI_AVAILABLE,
                "key_present": self.is_valid_key(settings.google_api_key),
                "circuit_breaker": self.google_cb.state.value,
            },
            "groq": {
                "available": GROQ_AVAILABLE,
                "key_present": self.is_valid_key(settings.groq_api_key),
                "circuit_breaker": self.groq_cb.state.value,
            },
            "vertex": {
                "available": VERTEX_AI_AVAILABLE,
                "creds_present": bool(settings.google_application_credentials and os.path.exists(settings.google_application_credentials)),
                "circuit_breaker": self.vertex_cb.state.value,
            },
            "nim": {
                "available": True,
                "key_present": self.is_valid_key(settings.nvidia_nim_api_key),
                "circuit_breaker": self.nim_cb.state.value,
            },
            "active_provider": self.provider,
            "initialized": self.initialized,
        }

    def ensure_initialized(self):
        if self.initialized:
            return True

        groq_key_status = "present" if settings.groq_api_key else "missing"
        google_key_status = "present" if settings.google_api_key else "missing"
        logger.info(f"AI init: groq_key={groq_key_status}, google_key={google_key_status}")

        if GROQ_AVAILABLE and self.is_valid_key(settings.groq_api_key) and self.groq_cb.can_attempt():
            if self.provider != "groq":
                try:
                    self.groq_client = AsyncGroq(api_key=settings.groq_api_key)
                    self.initialized = True
                    self.provider = "groq"
                    self.groq_cb.record_success()
                    logger.info("Groq initialized successfully")
                    return True
                except Exception as e:
                    logger.error(f"Groq init failed: {e}")
                    self.groq_cb.record_failure()
                    self.provider = None

        if self.is_valid_key(settings.nvidia_nim_api_key) and self.nim_cb.can_attempt():
            if self.provider != "nim":
                try:
                    from openai import AsyncOpenAI
                    self.nim_client = AsyncOpenAI(
                        api_key=settings.nvidia_nim_api_key,
                        base_url=settings.nvidia_nim_base_url,
                    )
                    self.initialized = True
                    self.provider = "nim"
                    self.nim_cb.record_success()
                    logger.info(f"NVIDIA NIM ({self.nim_model_name}) initialized")
                    return True
                except Exception as e:
                    logger.error(f"NVIDIA NIM init failed: {e}")
                    self.nim_cb.record_failure()
                    self.provider = None

        if GENAI_AVAILABLE and self.is_valid_key(settings.google_api_key) and self.google_cb.can_attempt():
            if self.provider != "google":
                try:
                    genai.configure(api_key=settings.google_api_key)
                    self.model = genai.GenerativeModel(self.google_model_name)
                    self.initialized = True
                    self.provider = "google"
                    self.google_cb.record_success()
                    logger.info(f"Google AI ({self.google_model_name}) initialized")
                    return True
                except Exception as e:
                    logger.error(f"Google AI init failed: {e}")
                    self.google_cb.record_failure()
                    self.provider = None

        if VERTEX_AI_AVAILABLE and os.path.exists(settings.google_application_credentials) and self.vertex_cb.can_attempt():
            if self.provider != "vertex":
                try:
                    os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = settings.google_application_credentials
                    aiplatform.init(project=settings.gcp_project_id, location=settings.vertex_ai_location)
                    self.model = GenerativeModel(self.vertex_model_name)
                    self.initialized = True
                    self.provider = "vertex"
                    self.vertex_cb.record_success()
                    logger.info(f"Vertex AI ({self.vertex_model_name}) initialized")
                    return True
                except Exception as e:
                    logger.warning(f"Vertex AI init failed: {e}")
                    self.vertex_cb.record_failure()
                    self.provider = None

        return False

    async def _fallback_image_analysis(self, file_name: str, file_type: str, file_buffer: bytes,
                                       rules: dict, has_c2pa: bool) -> RiskReport:
        logger.warning(f"Image analysis not supported by provider={self.provider}. Using rule-based fallback.")
        return RiskReport(
            overall_risk_score=0.0,
            originality_score=rules["originality_score"],
            is_screenshot=rules["is_screenshot"],
            threat_categories=[
                ThreatCategory(name="Vision Unavailable", severity="medium", confidence=1.0,
                               description="AI Vision unavailable for this provider. Using forensic rule-based detection.")
            ],
            detailed_findings=[DetailedFinding(category="System", description=rules["forensic_details"], evidence=file_name)],
            recommendations=[Recommendation(priority="high", action="Use Google AI Studio",
                                            rationale="Switch to Google AI Studio for reliable Vision & Search.")],
            confidence_level=0.5,
            scan_timestamp=datetime.now(timezone.utc),
            file_metadata={
                "file_name": file_name, "file_type": file_type, "file_size": len(file_buffer),
                "ai_provider": f"{self.provider or 'none'}_fallback", "ai_model": "rule_based_v1",
                "forensic_summary": rules["forensic_details"], "web_detection": "inactive",
                "c2pa_verified": has_c2pa
            }
        )

    async def analyze_file_threat(self, file_buffer: bytes, file_name: str, file_type: str, has_c2pa: bool = False) -> RiskReport:
        self.ensure_initialized()
        rules = _rule_based_analysis(file_name)
        
        # Perform actual image analysis for screenshot detection (doesn't rely on AI)
        image_analysis = _analyze_image_for_screenshot(file_buffer)
        if image_analysis.get("is_screenshot"):
            rules["is_screenshot"] = True
            rules["originality_score"] = 15.0
            rules["forensic_details"] = f"PIXEL ANALYSIS: Detected screenshot (score={image_analysis.get('score')}, reasons={image_analysis.get('reasons')}, ratio={image_analysis.get('aspect_ratio')})"
        
        prompt = _build_forensic_prompt(file_name, file_type, has_c2pa)

        if not self.initialized:
            return _generate_mock_report(file_name, file_type, len(file_buffer), rules=rules)

        is_image = is_image_file(file_name, file_type)

        try:
            active_model = "unknown"

            if self.provider == "google":
                active_model = self.google_model_name
                if is_image:
                    response = await self.model.generate_content_async(
                        [prompt, {"mime_type": file_type, "data": file_buffer}]
                    )
                else:
                    sample = file_buffer[:5000].decode('utf-8', errors='replace')
                    response = await self.model.generate_content_async(
                        f"{prompt}\n\nFile Content:\n{sample[:3000]}"
                    )
                response_text = response.text
                self.google_cb.record_success()

            elif self.provider == "groq":
                if is_image:
                    return await self._fallback_image_analysis(file_name, file_type, file_buffer, rules, has_c2pa)
                else:
                    active_model = self.groq_model_name
                    sample = file_buffer[:2000].decode('utf-8', errors='replace')
                    chat_completion = await self.groq_client.chat.completions.create(
                        messages=[{"role": "user", "content": f"{prompt}\n\nFile Content Sample:\n{sample}"}],
                        model=active_model,
                        response_format={"type": "json_object"}
                    )
                    response_text = chat_completion.choices[0].message.content
                    self.groq_cb.record_success()

            elif self.provider == "vertex":
                active_model = self.vertex_model_name
                if is_image:
                    file_part = Part.from_data(data=file_buffer, mime_type=file_type)
                    response = await self.model.generate_content_async([prompt, file_part])
                else:
                    sample = file_buffer[:5000].decode('utf-8', errors='replace')
                    response = await self.model.generate_content_async(
                        f"{prompt}\n\nFile Content:\n{sample[:3000]}"
                    )
                response_text = response.text
                self.vertex_cb.record_success()

            elif self.provider == "nim":
                if is_image:
                    return await self._fallback_image_analysis(file_name, file_type, file_buffer, rules, has_c2pa)
                active_model = self.nim_model_name
                sample = file_buffer[:5000].decode('utf-8', errors='replace')
                messages = [{"role": "user", "content": f"{prompt}\n\nFile Content:\n{sample[:3000]}"}]
                completion = await self.nim_client.chat.completions.create(
                    model=active_model, messages=messages,
                    response_format={"type": "json_object"},
                    max_tokens=2000,
                )
                response_text = completion.choices[0].message.content
                self.nim_cb.record_success()

            data = json.loads(_clean_json_response(response_text))
            return _build_risk_from_data(data, rules, has_c2pa, self.provider, active_model,
                                         file_name, file_type, len(file_buffer))

        except Exception as e:
            err_str = str(e)
            logger.error(f"Analysis failed for provider={self.provider}: {err_str}")

            image_errors = ["does not support image", "image input", "cannot read", "image_url", "image data", "vision model", "inform the user", "image.png", "this model"]
            if any(e in err_str.lower() for e in image_errors):
                logger.warning("Model does not support image input. Falling back to rule-based analysis.")
                return await self._fallback_image_analysis(file_name, file_type, file_buffer, rules, has_c2pa)

            return _generate_mock_report(file_name, file_type, len(file_buffer), error=err_str, rules=rules)

    @staticmethod
    def _strip_image_errors(text: str) -> str:
        lines = text.split("\n")
        patterns = ["does not support image", "cannot read", "vision model", "image_url", "image input", "model does not support", "inform the user", "image.png", "image data"]
        cleaned = [l for l in lines if not any(p in l.lower() for p in patterns)]
        result = "\n".join(cleaned).strip()
        if not result:
            result = "I cannot view or analyze images directly. Could you describe what you need help with? I can search the web or check your vault files."
        return result

    async def get_mentor_response(self, message: str, history: list = None) -> str:
        if history is None:
            history = []
        self.ensure_initialized()

        system_prompt = """You are the CVBER Hub Security & Intelligence Mentor.

IMPORTANT LIMITATION: You CANNOT read, view, or analyze images. You are a text-only AI model. If a user asks you to look at an image, tell them you cannot process images and ask them to describe what they need.

CAPABILITIES:
1. INFRASTRUCTURE: Explain C2PA signing and Bitcoin blockchain anchoring.
2. THREATS: Identify risks in the user's files based on the scan history.
3. TRACKING: When asked "Where was this used?" or "Who used it last?", direct them to the Agent Hub which has web search tools for finding artwork online.
   - If the user asks about a specific file, look at the Context provided.
   - Mention specific platforms (Instagram, Pinterest, AI training models like LAION).
   - Be authoritative and technical.

RULES:
- Never claim you can read or analyze images. You cannot.
- Never return error messages about image processing. Instead, redirect to the Agent Hub.
"""

        if not self.initialized:
            return "AI is in offline mode. To enable AI features, add your Groq API key in the backend .env file (GROQ_API_KEY=your_key). Get a free key at https://console.groq.com/keys"

        try:
            if self.provider in ["google", "vertex"]:
                full_prompt = f"{system_prompt}\n\nSearch Request: {message}\n\nRecent History: {history}"
                response = await self.model.generate_content_async(full_prompt)
                return self._strip_image_errors(response.text.strip())
            elif self.provider == "groq":
                messages = [{"role": "system", "content": system_prompt}]
                for h in history:
                    messages.append({"role": h.get("role", "user"), "content": h.get("content", "")})
                messages.append({"role": "user", "content": message})
                completion = await self.groq_client.chat.completions.create(
                    messages=messages, model=self.groq_model_name,
                )
                return self._strip_image_errors(completion.choices[0].message.content)
            elif self.provider == "nim":
                messages = [{"role": "system", "content": system_prompt}]
                for h in history:
                    messages.append({"role": h.get("role", "user"), "content": h.get("content", "")})
                messages.append({"role": "user", "content": message})
                completion = await self.nim_client.chat.completions.create(
                    messages=messages, model=self.nim_model_name,
                )
                return self._strip_image_errors(completion.choices[0].message.content)
        except Exception as e:
            err_str = str(e)
            logger.error(f"Mentor AI Error (provider={self.provider}): {err_str}")
            if "401" in err_str or "Invalid API Key" in err_str:
                old_provider = self.provider
                if old_provider == "groq":
                    settings.groq_api_key = None
                elif old_provider == "google":
                    settings.google_api_key = None
                self.initialized = False
                self.provider = None
                if self.ensure_initialized() and self.provider != old_provider:
                    try:
                        return await self.get_mentor_response(message, history)
                    except Exception:
                        pass
            return "AI service unavailable. Please check your API keys."


vertex_ai_service = VertexAIService()
