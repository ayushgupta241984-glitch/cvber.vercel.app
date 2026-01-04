import os
import json
import logging
import asyncio
import base64
from datetime import datetime
from typing import Optional

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
            
        # 1. Try Google AI Studio (Free)
        if GENAI_AVAILABLE and self.is_valid_key(settings.google_api_key):
            try:
                genai.configure(api_key=settings.google_api_key)
                self.model = genai.GenerativeModel('gemini-1.5-flash')
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
    
    async def analyze_file_threat(self, file_buffer: bytes, file_name: str, file_type: str) -> RiskReport:
        """Analyze a file for security threats and originality."""
        self.ensure_initialized()
        
        prompt = f"""You are a professional digital forensics and cybersecurity analyst for CVBER Free. 
Analyze this file: {file_name} ({file_type}).

### CRITICAL REQUIREMENTS:
1. **Ownership Detection**: 
   - Check if this is a **SCREENSHOT**. Look for mobile status bars, battery icons, wifi icons, navigation buttons, or browser address bars at the edges of the image.
   - If you see ANY UI elements (like 'Search...', 'Log In', or 'Get Started' buttons from this or other websites), set `is_screenshot` to `true` and `originality_score` below `30`.
   - If the file name starts with 'Screenshot' or 'Screen Shot', it is likely a screenshot.

2. **Originality Assessment**:
   - Assess if it's an original photograph/design or a repost from the web.
   - Look for compression artifacts, platform watermarks (like TikTok/Instagram logos), or low resolution.
   - Assign `originality_score` (0-100). 100 is perfectly original, 0 is a clear repost/screenshot.

3. **Security Scan**:
   - Identify malware, phishing indicators, or sensitive data leaks.

### OUTPUT FORMAT (Valid JSON only):
{{
    "overall_risk_score": 0-100,
    "originality_score": 0-100,
    "is_screenshot": true/false,
    "threat_categories": [{{"name": string, "severity": "low|medium|high|critical", "confidence": 0-1, "description": string}}],
    "detailed_findings": [{{"category": string, "description": string, "evidence": string}}],
    "recommendations": [{{"priority": "low|medium|high", "action": string, "rationale": string}}],
    "confidence_level": 0.0-1.0
}}"""

        if not self.initialized:
            return self._generate_mock_report(file_name, file_type, len(file_buffer))
        
        try:
            response_text = ""
            if self.provider == "google":
                # Gemini handles byte directly
                response = await self.model.generate_content_async([prompt, {"mime_type": file_type, "data": file_buffer}])
                response_text = response.text
                
            elif self.provider == "groq":
                # For images, use a Vision model and base64
                if "image" in file_type:
                    base64_image = base64.b64encode(file_buffer).decode('utf-8')
                    chat_completion = await self.groq_client.chat.completions.create(
                        messages=[
                            {
                                "role": "user",
                                "content": [
                                    {"type": "text", "text": prompt},
                                    {
                                        "type": "image_url",
                                        "image_url": {"url": f"data:{file_type};base64,{base64_image}"}
                                    }
                                ]
                            }
                        ],
                        model="llama-3.2-90b-vision-preview",
                        response_format={"type": "json_object"}
                    )
                    response_text = chat_completion.choices[0].message.content
                else:
                    # Non-image fallback (text/pdf sample)
                    sample = file_buffer[:2000].decode('utf-8', errors='ignore')
                    chat_completion = await self.groq_client.chat.completions.create(
                        messages=[{"role": "user", "content": f"{prompt}\n\nFile Content Sample:\n{sample}"}],
                        model="llama-3.3-70b-versatile",
                        response_format={"type": "json_object"}
                    )
                    response_text = chat_completion.choices[0].message.content
                    
            elif self.provider == "vertex":
                file_part = Part.from_data(data=file_buffer, mime_type=file_type)
                response = await self.model.generate_content_async([prompt, file_part])
                response_text = response.text
            
            data = json.loads(self._clean_json_response(response_text))
            
            # Post-processing: If originality is low, add a specific threat
            threats = [ThreatCategory(**c) for c in data.get("threat_categories", [])]
            if data.get("originality_score", 100) < 50 or data.get("is_screenshot", False):
                threats.append(ThreatCategory(
                    name="Ownership Alert",
                    severity="medium",
                    confidence=0.9,
                    description="File detected as a screenshot or non-original repost. This may affect intellectual property verification."
                ))

            # Final Risk Report
            return RiskReport(
                overall_risk_score=data.get("overall_risk_score", 0),
                originality_score=data.get("originality_score", 100),
                is_screenshot=data.get("is_screenshot", False),
                threat_categories=threats,
                detailed_findings=[DetailedFinding(**f) for f in data.get("detailed_findings", [])],
                recommendations=[Recommendation(**r) for r in data.get("recommendations", [])],
                confidence_level=data.get("confidence_level", 0.9),
                scan_timestamp=datetime.utcnow(),
                file_metadata={"file_name": file_name, "file_type": file_type, "file_size": len(file_buffer)}
            )
        except Exception as e:
            logger.error(f"Analysis failed: {e}")
            return self._generate_mock_report(file_name, file_type, len(file_buffer), error=str(e))

    async def get_mentor_response(self, message: str, history: list = []) -> str:
        """Get a response from the Security Mentor."""
        self.ensure_initialized()
        
        system_prompt = "You are the CVBER Free Security Assistant, a senior expert. Answer questions about security, ownership, and using the CVBER vault/watermark tools."

        if not self.initialized:
            return "I'm in basic mode. Add a `GROQ_API_KEY` or `GOOGLE_API_KEY` to Render for full AI protection!"

        try:
            if self.provider in ["google", "vertex"]:
                full_prompt = f"{system_prompt}\n\nHistory: {history}\n\nUser: {message}"
                response = await self.model.generate_content_async(full_prompt)
                return response.text.strip()
            
            elif self.provider == "groq":
                messages = [{"role": "system", "content": system_prompt}]
                for h in history:
                    messages.append({"role": h["role"], "content": h["content"]})
                messages.append({"role": "user", "content": message})
                
                completion = await self.groq_client.chat.completions.create(
                    messages=messages,
                    model="llama-3.3-70b-versatile", # Mentor uses the versatile text model
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

    def _generate_mock_report(self, file_name: str, file_type: str, file_size: int, error: str = None) -> RiskReport:
        desc = "AI Offline" if not error else f"Error: {error[:50]}"
        return RiskReport(
            overall_risk_score=0.0,
            originality_score=100.0,
            is_screenshot=False,
            threat_categories=[],
            detailed_findings=[DetailedFinding(category="System", description=desc)],
            recommendations=[Recommendation(priority="high", action="Check Key", rationale="Enable AI")],
            confidence_level=0.0,
            scan_timestamp=datetime.utcnow(),
            file_metadata={"file_name": file_name, "file_type": file_type, "file_size": file_size}
        )

vertex_ai_service = VertexAIService()
