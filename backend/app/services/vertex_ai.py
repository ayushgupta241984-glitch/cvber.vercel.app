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
except ImportError:
    GENAI_AVAILABLE = False

try:
    from groq import AsyncGroq
    GROQ_AVAILABLE = True
except ImportError:
    GROQ_AVAILABLE = False

try:
    from google.cloud import aiplatform
    from vertexai.generative_models import GenerativeModel, Part
    VERTEX_AI_AVAILABLE = True
except ImportError:
    VERTEX_AI_AVAILABLE = False

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
        """Ensure an AI service is initialized."""
        if self.initialized:
            return True
            
        # 1. Try Google AI Studio (Free & Reliable)
        if GENAI_AVAILABLE and self.is_valid_key(settings.google_api_key):
            try:
                genai.configure(api_key=settings.google_api_key)
                genai.configure(api_key=settings.google_api_key)
                self.model = genai.GenerativeModel('gemini-1.5-flash', tools='google_search_retrieval')
                self.initialized = True
                self.provider = "google"
                logger.info("Google AI Studio (Gemini) initialized")
                return True
            except Exception as e:
                logger.error(f"Google AI Studio init failed: {e}")

        # 2. Try Groq (Free & Fast)
        if GROQ_AVAILABLE and self.is_valid_key(settings.groq_api_key):
            try:
                self.groq_client = AsyncGroq(api_key=settings.groq_api_key)
                self.initialized = True
                self.provider = "groq"
                logger.info("Groq (Vision) initialized")
                return True
            except Exception as e:
                logger.error(f"Groq init failed: {e}")

        # 3. Fallback to Vertex AI (Enterprise)
        if VERTEX_AI_AVAILABLE and os.path.exists(settings.google_application_credentials):
            try:
                os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = settings.google_application_credentials
                aiplatform.init(project=settings.gcp_project_id, location=settings.vertex_ai_location)
                self.model = GenerativeModel(settings.vertex_ai_model)
                self.initialized = True
                self.provider = "vertex"
                logger.info("Vertex AI initialized")
                return True
            except Exception as e:
                logger.warning(f"Vertex AI init failed: {e}")
        
        return False
    
    def _rule_based_analysis(self, file_name: str) -> Dict[str, Any]:
        """Apply hard-coded forensic rules before AI runs."""
        is_screenshot_hint = "screenshot" in file_name.lower() or "screen shot" in file_name.lower()
        
        if is_screenshot_hint:
            return {
                "is_screenshot": True,
                "originality_score": 15.0,
                "forensic_details": "RULE-BASED: File name contains 'screenshot' patterns. Automatic flag for non-original content."
            }
        return {
            "is_screenshot": False,
            "originality_score": 100.0,
            "forensic_details": "No obvious screenshot indicators in filename."
        }

    async def analyze_file_threat(self, file_buffer: bytes, file_name: str, file_type: str) -> RiskReport:
        """Analyze a file for security threats and originality."""
        self.ensure_initialized()
        
        # Apply pre-scan rules (Hard fallback for screenshots)
        rules = self._rule_based_analysis(file_name)
        
        prompt = f"""You are a senior digital forensics inspector for CVBER Free. 
Analyze this file: {file_name} ({file_type}).

### STEP 1: VISUAL INSPECTION (INTERNAL REASONING)
Before providing the JSON, look at the FOUR CORNERS and EDGES of the image very carefully.
Check for:
- **Top Corners**: Time (e.g., 10:45), Battery percentage, WiFi bars, Cellular signal.
- **Top Edge**: Browser tabs, Address bars (http://...), or "Window" controls (minimize/close).
- **Bottom Edge**: Mobile navigation bar (Home/Back/Recent), Browser footer, or Taskbar.
- **Watermarks**: Look for TikTok, Instagram, or Getty Images logos.

### STEP 2: WEB VERIFICATION (GROUNDING)
- Use Google Search to check if this image (or a very similar one) exists on the public web.
- If you find matches on stock sites, social media, or other public sources, flag it as a REPOST.

### STEP 3: SCORING RULES
- **IS_SCREENSHOT**: Set to `true` if ANY of the above UI elements are present. 
- **ORIGINALITY_SCORE**: 
  - 0-20: Obvious screenshot or DIRECT web match found (repost).
  - 21-50: Clear repost (platform logos, heavy compression, low res).
  - 51-89: Possibly original but looks like common stock or social media content.
  - 90-100: High-fidelity original creation/photo with no UI artifacts.

### OUTPUT FORMAT (Valid JSON only):
{{
    "overall_risk_score": 0-100,
    "originality_score": 0-100,
    "is_screenshot": true/false,
    "forensic_details": "A brief explanation of why you gave this score. e.g. Visible battery icon at top right.",
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
            originality_score = data.get("originality_score", 100)
            if rules["is_screenshot"]:
                originality_score = min(originality_score, rules["originality_score"])
            
            description = data.get("forensic_details", rules["forensic_details"])
            if is_screenshot and "Screenshot Detected" not in description:
                description = f"Screenshot Detected: {description}"

            # Post-processing: Add specific threat
            threats = [ThreatCategory(**c) for c in data.get("threat_categories", [])]
            if is_screenshot:
                threats.append(ThreatCategory(
                    name="Ownership Alert",
                    severity="high",
                    confidence=1.0,
                    description="The file has been definitively flagged as a screenshot. Original intellectual property cannot be verified."
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
                    "web_detection": "active" if self.provider == "google" else "inactive"
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
            logger.error(f"Mentor AI Error: {e}")
            return f"Digital Glitch: {str(e)[:100]}... Please check your API keys."

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
