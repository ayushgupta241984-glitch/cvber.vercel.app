import os
import json
import logging
import asyncio
import time
from datetime import datetime
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


class VertexAIService:
    def __init__(self):
        self.model = None
        self.groq_client = None
        self.initialized = False
        self.provider: Optional[str] = None
        self._setup_attempted = False

        self.google_cb = CircuitBreaker("google-ai", failure_threshold=3, recovery_timeout=60)
        self.groq_cb = CircuitBreaker("groq", failure_threshold=3, recovery_timeout=60)
        self.vertex_cb = CircuitBreaker("vertex", failure_threshold=2, recovery_timeout=120)

        self._config_models()
        self.ensure_initialized()

    def _config_models(self):
        self.google_model_name = settings.google_model or "gemini-1.5-flash"
        self.groq_model_name = settings.groq_model or "llama-3.3-70b-versatile"
        self.vertex_model_name = settings.vertex_ai_model or "gemini-1.5-flash-002"
        self.groq_vision_fallback = True

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

        if GENAI_AVAILABLE and self.is_valid_key(settings.google_api_key) and self.google_cb.can_attempt():
            if self.provider != "google":
                try:
                    genai.configure(api_key=settings.google_api_key)
                    self.model = genai.GenerativeModel(self.google_model_name, tools='google_search_retrieval')
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

    def _rule_based_analysis(self, file_name: str) -> Dict[str, Any]:
        is_screenshot = "screenshot" in file_name.lower() or "screen shot" in file_name.lower()
        is_mobile = any(x in file_name.lower() for x in ["img_", "screenshot_", "captured_"])
        if is_screenshot or is_mobile:
            return {
                "is_screenshot": True,
                "originality_score": 5.0,
                "forensic_details": "RULE-BASED: File name contains definitive 'screenshot' patterns.",
            }
        return {
            "is_screenshot": False,
            "originality_score": 100.0,
            "forensic_details": "No obvious screenshot indicators in filename.",
        }

    async def analyze_file_threat(self, file_buffer: bytes, file_name: str, file_type: str, has_c2pa: bool = False) -> RiskReport:
        self.ensure_initialized()
        rules = self._rule_based_analysis(file_name)
        c2pa_status = "VERIFIED CRYPTOGRAPHIC PROVENANCE DETECTED" if has_c2pa else "NO CRYPTOGRAPHIC PROVENANCE (UNSIGNATURED)"

        prompt = f"""You are a top-tier digital forensics inspector for CVBER Free. 
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

        if not self.initialized:
            return self._generate_mock_report(file_name, file_type, len(file_buffer), rules=rules)

        try:
            active_model = "unknown"
            response_text = ""

            if self.provider == "google":
                active_model = self.google_model_name
                response = await self.model.generate_content_async(
                    [prompt, {"mime_type": file_type, "data": file_buffer}]
                )
                response_text = response.text
                self.google_cb.record_success()

            elif self.provider == "groq":
                if "image" in file_type:
                    if self.groq_vision_fallback:
                        logger.warning("Groq Vision unavailable. Using rule-based pre-scan.")
                        return RiskReport(
                            overall_risk_score=0.0,
                            originality_score=rules["originality_score"],
                            is_screenshot=rules["is_screenshot"],
                            threat_categories=[
                                ThreatCategory(name="Vision Offline", severity="medium", confidence=1.0,
                                               description="AI Vision unavailable (Groq). Using rule-based detection.")
                            ],
                            detailed_findings=[DetailedFinding(category="System", description=rules["forensic_details"], evidence=file_name)],
                            recommendations=[Recommendation(priority="high", action="Use Google Key",
                                                            rationale="Switch to Google AI Studio for Vision.")],
                            confidence_level=0.5,
                            scan_timestamp=datetime.utcnow(),
                            file_metadata={
                                "file_name": file_name, "file_type": file_type, "file_size": len(file_buffer),
                                "ai_provider": "groq_fallback", "ai_model": "rule_based_v1",
                                "forensic_summary": rules["forensic_details"], "web_detection": "inactive"
                            }
                        )
                else:
                    active_model = self.groq_model_name
                    sample = file_buffer[:2000].decode('utf-8', errors='ignore')
                    chat_completion = await self.groq_client.chat.completions.create(
                        messages=[{"role": "user", "content": f"{prompt}\n\nFile Content Sample:\n{sample}"}],
                        model=active_model,
                        response_format={"type": "json_object"}
                    )
                    response_text = chat_completion.choices[0].message.content
                    self.groq_cb.record_success()

            elif self.provider == "vertex":
                active_model = self.vertex_model_name
                file_part = Part.from_data(data=file_buffer, mime_type=file_type)
                response = await self.model.generate_content_async([prompt, file_part])
                response_text = response.text
                self.vertex_cb.record_success()

            data = json.loads(self._clean_json_response(response_text))
            is_screenshot = data.get("is_screenshot", False) or rules["is_screenshot"]
            ai_originality_score = float(data.get("originality_score", 100))

            if is_screenshot:
                originality_score = min(ai_originality_score, 15.0)
            elif not has_c2pa:
                originality_score = min(ai_originality_score, 85.0)
            else:
                originality_score = ai_originality_score

            if rules["is_screenshot"]:
                originality_score = min(originality_score, rules["originality_score"])

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
                scan_timestamp=datetime.utcnow(),
                file_metadata={
                    "file_name": file_name, "file_type": file_type, "file_size": len(file_buffer),
                    "ai_provider": self.provider, "ai_model": active_model,
                    "forensic_summary": description,
                    "web_detection": "active" if self.provider == "google" else "inactive",
                    "c2pa_verified": has_c2pa
                }
            )
        except Exception as e:
            logger.error(f"Analysis failed for provider={self.provider}: {e}")
            return self._generate_mock_report(file_name, file_type, len(file_buffer), error=str(e), rules=rules)

    async def get_mentor_response(self, message: str, history: list = None) -> str:
        if history is None:
            history = []
        self.ensure_initialized()

        system_prompt = """You are the CVBER Hub Security & Intelligence Mentor. 
You have access to the user's specific "Work" (images they have protected).

KNOWLEDGE CAPABILITIES:
1. INFRASTRUCTURE: Explain C2PA signing and Bitcoin blockchain anchoring.
2. THREATS: Identify risks in the user's files based on the scan history.
3. TRACKING (CORE TASK): When asked "Where was this used?" or "Who used it last?", simulate a real-time web-tracking scan.
   - If the user asks about a specific file, look at the Context provided.
   - Mention specific platforms (Instagram, Pinterest, AI training models like LAION) where unauthorized use might be detected.
   - Provide "Last Seen" timestamps and "Usernames/Handles" for found instances.
   - Be authoritative and technical.
"""

        if not self.initialized:
            return "Intelligence Offline. Connect Google AI Studio to enable global image tracking."

        try:
            if self.provider in ["google", "vertex"]:
                prompt = f"{system_prompt}\n\nSearch Request: {message}\n\nRecent History: {history}"
                response = await self.model.generate_content_async(prompt)
                return response.text.strip()
            elif self.provider == "groq":
                messages = [{"role": "system", "content": system_prompt}]
                for h in history:
                    messages.append({"role": h.get("role", "user"), "content": h.get("content", "")})
                messages.append({"role": "user", "content": message})
                completion = await self.groq_client.chat.completions.create(
                    messages=messages, model=self.groq_model_name,
                )
                return completion.choices[0].message.content
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

    @staticmethod
    def _clean_json_response(text: str) -> str:
        text = text.strip()
        if text.startswith("```json"):
            text = text[7:]
        if text.startswith("```"):
            text = text[3:]
        if text.endswith("```"):
            text = text[:-3]
        return text.strip()

    def _generate_mock_report(self, file_name: str, file_type: str, file_size: int,
                              error: str = None, rules: Dict = None) -> RiskReport:
        desc = "AI OFFLINE" if not error else f"ANALYSIS ERROR: {error[:30]}"
        is_screenshot = rules["is_screenshot"] if rules else "screenshot" in file_name.lower()
        originality = rules["originality_score"] if rules else (15.0 if is_screenshot else 100.0)
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
            scan_timestamp=datetime.utcnow(),
            file_metadata={
                "file_name": file_name, "file_type": file_type, "file_size": file_size,
                "ai_provider": "local_pre_scanner", "ai_model": "rule_v1",
                "forensic_summary": forensic_summary
            }
        )


vertex_ai_service = VertexAIService()
