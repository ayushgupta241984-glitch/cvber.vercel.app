import os
import json
import logging
import asyncio
import base64
from datetime import datetime
from typing import Optional, Dict, Any

# Configure logger
logger = logging.getLogger(__name__)

# Try to import SDKs
try:
    import google.generativeai as genai
    GENAI_AVAILABLE = True
    logger.info("✅ google.generativeai imported successfully")
except ImportError as e:
    GENAI_AVAILABLE = False
    logger.warning(f"⚠️ google.generativeai not available: {e}")

try:
    from groq import AsyncGroq
    GROQ_AVAILABLE = True
    logger.info("✅ groq.AsyncGroq imported successfully")
except ImportError as e:
    GROQ_AVAILABLE = False
    logger.warning(f"⚠️ groq.AsyncGroq not available: {e}")

try:
    from google.cloud import aiplatform
    from vertexai.generative_models import GenerativeModel, Part
    VERTEX_AI_AVAILABLE = True
    logger.info("✅ Vertex AI SDK imported successfully")
except ImportError as e:
    # Vertex AI SDK isn't installed or cannot be imported.
    VERTEX_AI_AVAILABLE = False
    logger.warning(f"⚠️ Vertex AI SDK not available: {e}")

from app.config import settings
from app.models.schemas import RiskReport, ThreatCategory, DetailedFinding, Recommendation


class VertexAIService:
    def __init__(self):
        """Initialize AI Service. Supports Google AI Studio, Groq, and Vertex AI."""
        self.model = None
        self.groq_client = None
        self.initialized = False
        self.provider = None # "google", "groq", "vertex"
        self._setup_attempted = False
        
        self.ensure_initialized()
    
    def is_valid_key(self, key: Optional[str]) -> bool:
        """Check if a key is provided and isn't a known placeholder."""
        if not key:
            return False
        placeholders = ["placeholder", "your-", "key-here", "secret-here"]
        return not any(p in key.lower() for p in placeholders)

    def ensure_initialized(self):
        """Ensure an AI service is initialized. Always retries if not yet successful."""
        if self.initialized:
            return True
        
        # Log available keys for debugging
        groq_key_status = "present" if settings.groq_api_key else "missing"
        google_key_status = "present" if settings.google_api_key else "missing"
        logger.info(f"AI Service init check: groq_key={groq_key_status}, google_key={google_key_status}, GROQ_AVAILABLE={GROQ_AVAILABLE}, GENAI_AVAILABLE={GENAI_AVAILABLE}")
        
        # Always attempt initialization if not yet successful, in case new keys appeared
        # 1. Try Groq (Free & Fast) - PRIMARY
        if GROQ_AVAILABLE and self.is_valid_key(settings.groq_api_key):
            if not self.provider == "groq":  # Only reinit if not already attempted
                logger.info(f"Attempting Groq init with key prefix: {settings.groq_api_key[:20]}...")
                try:
                    self.groq_client = AsyncGroq(api_key=settings.groq_api_key)
                    self.initialized = True
                    self.provider = "groq"
                    logger.info("✅ Groq initialized successfully")
                    return True
                except Exception as e:
                    logger.error(f"❌ Groq init failed: {type(e).__name__}: {e}")
                    self.provider = None  # clear so we can retry later

        # 2. Try Google AI Studio (Free & Reliable) - FALLBACK
        if GENAI_AVAILABLE and self.is_valid_key(settings.google_api_key):
            if not self.provider == "google":  # Only reinit if not already attempted
                logger.info(f"Attempting Google init with key prefix: {settings.google_api_key[:20]}...")
                try:
                    genai.configure(api_key=settings.google_api_key)
                    self.model = genai.GenerativeModel('gemini-1.5-flash', tools='google_search_retrieval')
                    self.initialized = True
                    self.provider = "google"
                    logger.info("✅ Google AI Studio (Gemini) initialized successfully")
                    return True
                except Exception as e:
                    logger.error(f"❌ Google AI Studio init failed: {type(e).__name__}: {e}")
                    self.provider = None  # clear so we can retry later

        # 3. Fallback to Vertex AI (Enterprise)
        if VERTEX_AI_AVAILABLE and os.path.exists(settings.google_application_credentials):
            if not self.provider == "vertex":  # Only reinit if not already attempted
                try:
                    os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = settings.google_application_credentials
                    aiplatform.init(project=settings.gcp_project_id, location=settings.vertex_ai_location)
                    self.model = GenerativeModel(settings.vertex_ai_model)
                    self.initialized = True
                    self.provider = "vertex"
                    logger.info("Vertex AI initialized successfully")
                    return True
                except Exception as e:
                    logger.warning(f"Vertex AI init failed: {e}")
                    self.provider = None  # clear so we can retry later
        
        return False
    
    def _rule_based_analysis(self, file_name: str) -> Dict[str, Any]:
        """Apply hard-coded forensic rules before AI runs."""
        is_screenshot_hint = "screenshot" in file_name.lower() or "screen shot" in file_name.lower()
        # Common mobile screenshot patterns
        is_mobile_pattern = any(x in file_name.lower() for x in ["img_", "screenshot_", "captured_"])
        
        if is_screenshot_hint:
            return {
                "is_screenshot": True,
                "originality_score": 5.0,
                "forensic_details": "RULE-BASED: File name contains definitive 'screenshot' patterns. Content flagged as non-original capture."
            }
        return {
            "is_screenshot": False,
            "originality_score": 100.0,
            "forensic_details": "No obvious screenshot indicators in filename."
        }

    async def analyze_file_threat(self, file_buffer: bytes, file_name: str, file_type: str, has_c2pa: bool = False) -> RiskReport:
        """Analyze a file for security threats and originality."""
        self.ensure_initialized()
        
        # Apply pre-scan rules (Hard fallback for screenshots)
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
    "forensic_details": "Detailed technical explanation. Mention specific artifacts found (e.g. 'Compression gap in top-right corner characteristic of iOS capture').",
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
                active_model = "gemini-1.5-flash"
                response = await self.model.generate_content_async([prompt, {"mime_type": file_type, "data": file_buffer}])
                response_text = response.text
                
            elif self.provider == "groq":

                if "image" in file_type:
                    # Groq Vision models (llama-3.2-90b/11b) are currently decommissioned/unstable.
                    # Fallback to Rule-Based Pre-Scan for now to prevent crashes.
                    logger.warning("Groq Vision models are decommissioned. Falling back to Rule-Based Pre-Scan.")
                    description = f"Groq Vision Unavailable. {rules['forensic_details']}"
                    
                    return RiskReport(
                        overall_risk_score=0.0,
                        originality_score=rules["originality_score"],
                        is_screenshot=rules["is_screenshot"],
                        threat_categories=[
                            ThreatCategory(name="Vision Offline", severity="medium", confidence=1.0, description="AI Vision is currently unavailable (Groq Decommissioned). Using forensic rule-based detection.")
                        ],
                        detailed_findings=[DetailedFinding(category="System", description=description, evidence=file_name)],
                        recommendations=[Recommendation(priority="high", action="Use Google Key", rationale="Switch to Google AI Studio for reliable Vision & Search.")],
                        confidence_level=0.5,
                        scan_timestamp=datetime.utcnow(),
                        file_metadata={
                            "file_name": file_name, 
                            "file_type": file_type, 
                            "file_size": len(file_buffer),
                            "ai_provider": "groq_fallback",
                            "ai_model": "rule_based_v1",
                            "forensic_summary": description,
                            "web_detection": "inactive"
                        }
                    )
                else:
                    active_model = "llama-3.3-70b-versatile"
                    sample = file_buffer[:2000].decode('utf-8', errors='ignore')
                    chat_completion = await self.groq_client.chat.completions.create(
                        messages=[{"role": "user", "content": f"{prompt}\n\nFile Content Sample:\n{sample}"}],
                        model=active_model,
                        response_format={"type": "json_object"}
                    )
                    response_text = chat_completion.choices[0].message.content
                    
            elif self.provider == "vertex":
                active_model = settings.vertex_ai_model
                file_part = Part.from_data(data=file_buffer, mime_type=file_type)
                response = await self.model.generate_content_async([prompt, file_part])
                response_text = response.text
            
            data = json.loads(self._clean_json_response(response_text))
            
            # Merge AI results with pre-scan rules (Rules win if AI is too generous)
            is_screenshot = data.get("is_screenshot", False) or rules["is_screenshot"]
            ai_originality_score = float(data.get("originality_score", 100))
            
            # --- STRICT ENFORCEMENT LAYER ---
            # 1. If it's a screenshot, it CANNOT be original. Max 15%.
            if is_screenshot:
                originality_score = min(ai_originality_score, 15.0)
            # 2. If it lacks C2PA, it CANNOT be 100% verified original. Max 85%.
            elif not has_c2pa:
                originality_score = min(ai_originality_score, 85.0)
            else:
                originality_score = ai_originality_score

            # Explicit rule-based override (highest priority)
            if rules["is_screenshot"]:
                originality_score = min(originality_score, rules["originality_score"])
            
            description = data.get("forensic_details", rules["forensic_details"])
            if is_screenshot and "Screenshot" not in description:
                description = f"Screenshot Detected: {description}"

            # Post-processing: Add specific threat
            threats = [ThreatCategory(**c) for c in data.get("threat_categories", [])]
            if is_screenshot:
                threats.append(ThreatCategory(
                    name="Ownership Alert",
                    severity="high",
                    confidence=1.0,
                    description="The file has been definitively flagged as a screenshot. Original intellectual property cannot be verified at the source level."
                ))

            # Final Risk Report
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
                    "file_name": file_name, 
                    "file_type": file_type, 
                    "file_size": len(file_buffer),
                    "ai_provider": self.provider,
                    "ai_model": active_model,
                    "forensic_summary": description,
                    "web_detection": "active" if self.provider == "google" else "inactive",
                    "c2pa_verified": has_c2pa
                }
            )
        except Exception as e:
            logger.error(f"Analysis failed: {e}")
            return self._generate_mock_report(file_name, file_type, len(file_buffer), error=str(e), rules=rules)

    async def get_mentor_response(self, message: str, history: list = []) -> str:
        """Get a response from the Security Mentor with work awareness."""
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
            full_message = message
            if self.provider in ["google", "vertex"]:
                # Use history and context in the prompt
                prompt = f"{system_prompt}\n\nSearch Request: {message}\n\nRecent History: {history}"
                response = await self.model.generate_content_async(prompt)
                return response.text.strip()
            
            elif self.provider == "groq":
                messages = [{"role": "system", "content": system_prompt}]
                for h in history:
                    messages.append({"role": h["role"], "content": h["content"]})
                messages.append({"role": "user", "content": message})
                
                completion = await self.groq_client.chat.completions.create(
                    messages=messages,
                    model="llama-3.3-70b-versatile",
                )
                return completion.choices[0].message.content
        except Exception as e:
            # If we hit an authentication error, try to fall back automatically.
            err_str = str(e)
            logger.error(f"Mentor AI Error (provider={self.provider}): {err_str}")
            if "401" in err_str or "Invalid API Key" in err_str:
                old_provider = self.provider
                logger.warning(f"{old_provider} returned 401; clearing key and reinitializing.")
                # clear the offending key so ensure_initialized won't pick it again
                if old_provider == "groq":
                    settings.groq_api_key = None
                elif old_provider == "google":
                    settings.google_api_key = None
                # mark as not initialized so we can retry
                self.initialized = False
                self.provider = None
                # attempt to reinitialize and retry once
                if self.ensure_initialized() and self.provider != old_provider:
                    try:
                        return await self.get_mentor_response(message, history)
                    except Exception as e2:
                        # if retry fails, fall through to return original error
                        logger.error(f"Retry after fallback also failed: {e2}")
            # include provider in the response so frontend can know which service failed
            return f"Digital Glitch ({self.provider}): {err_str[:100]}... Please check your API keys."

    def _clean_json_response(self, text: str) -> str:
        text = text.strip()
        if text.startswith("```json"): text = text[7:]
        if text.startswith("```"): text = text[3:]
        if text.endswith("```"): text = text[:-3]
        return text.strip()

    def _generate_mock_report(self, file_name: str, file_type: str, file_size: int, error: str = None, rules: Dict = None) -> RiskReport:
        desc = "AI OFFLINE" if not error else f"ANALYSIS ERROR: {error[:30]}"
        
        # Merge with rules
        is_screenshot = rules["is_screenshot"] if rules else "screenshot" in file_name.lower()
        originality = rules["originality_score"] if rules else (15.0 if is_screenshot else 100.0)
        forensic_summary = rules["forensic_details"] if rules else (f"{desc} | Screenshot flag" if is_screenshot else f"{desc} | Unknown")

        return RiskReport(
            overall_risk_score=0.0,
            originality_score=originality,
            is_screenshot=is_screenshot,
            threat_categories=[ThreatCategory(name="AI Offline", severity="medium", confidence=1.0, description="The AI scanning engine is currently unreachable. Results are based on local pre-scan rules.")],
            detailed_findings=[DetailedFinding(category="System", description=desc, evidence=file_name)],
            recommendations=[Recommendation(priority="high", action="Configure AI", rationale="Connect Google AI or Groq to enable pixel-level forensics.")],
            confidence_level=0.5,
            scan_timestamp=datetime.utcnow(),
            file_metadata={
                "file_name": file_name, 
                "file_type": file_type, 
                "file_size": file_size,
                "ai_provider": "local_pre_scanner",
                "ai_model": "rule_v1",
                "forensic_summary": forensic_summary
            }
        )

vertex_ai_service = VertexAIService()
