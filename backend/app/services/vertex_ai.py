import os
import json
import logging
import asyncio
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
                logger.info("Groq (Llama 3) initialized")
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
        """Analyze a file for security threats."""
        self.ensure_initialized()
        
        prompt = f"Analyze this file for security threats. Name: {file_name}, Type: {file_type}. Return structured JSON with overall_risk_score (0-100), threat_categories, detailed_findings, and recommendations."

        if not self.initialized:
            return self._generate_mock_report(file_name, file_type, len(file_buffer))
        
        try:
            response_text = ""
            if self.provider == "google":
                response = await self.model.generate_content_async([prompt, {"mime_type": file_type, "data": file_buffer}])
                response_text = response.text
            elif self.provider == "groq":
                # Basic text sample for Groq since it's a chat model
                sample = file_buffer[:1500].decode('utf-8', errors='ignore')
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
            return RiskReport(
                overall_risk_score=data.get("overall_risk_score", 0),
                threat_categories=[ThreatCategory(**c) for c in data.get("threat_categories", [])],
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
        
        system_prompt = "You are the CVBER Free Security Assistant. Help the user with security and app questions. Be helpful and expert."

        if not self.initialized:
            return "I'm currently in basic mode. To enable my full AI brain, please add a `GROQ_API_KEY` or `GOOGLE_API_KEY` to your Render environment. You can get these for free at console.groq.com or aistudio.google.com!"

        try:
            if self.provider == "google":
                # For Google, we use history in a specific way if we wanted state, but staying simple for now
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
                    model="llama-3.3-70b-versatile",
                )
                return completion.choices[0].message.content
                
            elif self.provider == "vertex":
                full_prompt = f"{system_prompt}\n\nHistory: {history}\n\nUser: {message}"
                response = await self.model.generate_content_async(full_prompt)
                return response.text.strip()
                
        except Exception as e:
            error_msg = str(e).lower()
            logger.error(f"Mentor AI Error: {e}")
            
            if "api_key" in error_msg or "unauthorized" in error_msg or "401" in error_msg:
                return "Your API key seems to be invalid or expired. Please double-check it in your Render settings."
            if "quota" in error_msg or "limit" in error_msg or "429" in error_msg:
                return "I've reached my free limit for a moment. Please wait about 60 seconds and try again!"
            
            return f"I'm having a bit of trouble talking to my AI provider ({self.provider}). The error was: {str(e)[:100]}... Please check your internet or API settings."

    def _clean_json_response(self, text: str) -> str:
        text = text.strip()
        if text.startswith("```json"): text = text[7:]
        if text.startswith("```"): text = text[3:]
        if text.endswith("```"): text = text[:-3]
        return text.strip()

    def _generate_mock_report(self, file_name: str, file_type: str, file_size: int, error: str = None) -> RiskReport:
        desc = "AI Service Offline" if not error else f"AI Error: {error[:50]}"
        return RiskReport(
            overall_risk_score=0.0,
            threat_categories=[],
            detailed_findings=[DetailedFinding(category="System", description=desc)],
            recommendations=[Recommendation(priority="high", action="Check API Key", rationale="Enable AI")],
            confidence_level=0.0,
            scan_timestamp=datetime.utcnow(),
            file_metadata={"file_name": file_name, "file_type": file_type, "file_size": file_size}
        )

vertex_ai_service = VertexAIService()
