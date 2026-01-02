import os
import json
import logging
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
    from groq import Groq
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
        self.client = None # For Groq
        self.initialized = False
        self.provider = None # "google", "groq", "vertex"
        self._setup_attempted = False
        
        self.ensure_initialized()
    
    def ensure_initialized(self):
        """Ensure an AI service is initialized."""
        if self.initialized:
            return True
            
        # 1. Try Google AI Studio (Free)
        if GENAI_AVAILABLE and settings.google_api_key:
            try:
                genai.configure(api_key=settings.google_api_key)
                self.model = genai.GenerativeModel('gemini-1.5-flash')
                self.initialized = True
                self.provider = "google"
                logger.info("Google AI Studio (Gemini) initialized")
                return True
            except Exception as e:
                logger.error(f"Google AI Studio init failed: {e}")

        # 2. Try Groq (Free & Fast) - Great alternative if Google is blocked
        if GROQ_AVAILABLE and settings.groq_api_key:
            try:
                self.client = Groq(api_key=settings.groq_api_key)
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
        
        prompt = f"Analyze this file for security threats. Name: {file_name}, Type: {file_type}, Content length: {len(file_buffer)} bytes. Return structured JSON with overall_risk_score (0-100), threat_categories, detailed_findings, and recommendations."

        if not self.initialized:
            return self._generate_mock_report(file_name, file_type, len(file_buffer))
        
        try:
            if self.provider == "google":
                response = await self.model.generate_content_async([prompt, {"mime_type": file_type, "data": file_buffer}])
                response_text = response.text
            elif self.provider == "groq":
                # Groq doesn't support file buffer directly in same way, sending metadata + first 2KB of text if possible
                sample = file_buffer[:2000].decode('utf-8', errors='ignore')
                chat_completion = self.client.chat.completions.create(
                    messages=[{"role": "user", "content": f"{prompt}\n\nFile Sample:\n{sample}"}],
                    model="llama3-70b-8192",
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
            return self._generate_mock_report(file_name, file_type, len(file_buffer))

    async def get_mentor_response(self, message: str, history: list = []) -> str:
        """Get a generative response from the Security Mentor."""
        self.ensure_initialized()
        
        system_prompt = "You are the CVBER Free Security Assistant, a cybersecurity expert. Help the user."

        if not self.initialized:
            return "I'm in offline mode. Please add a GOOGLE_API_KEY or GROQ_API_KEY to your environment!"

        try:
            full_prompt = f"{system_prompt}\n\nHistory: {history}\n\nUser: {message}"
            
            if self.provider in ["google", "vertex"]:
                response = await self.model.generate_content_async(full_prompt)
                return response.text.strip()
            elif self.provider == "groq":
                messages = [{"role": "system", "content": system_prompt}]
                for h in history:
                    messages.append({"role": h["role"], "content": h["content"]})
                messages.append({"role": "user", "content": message})
                
                completion = self.client.chat.completions.create(
                    messages=messages,
                    model="llama3-70b-8192",
                )
                return completion.choices[0].message.content
        except Exception as e:
            logger.error(f"Mentor failed: {e}")
            return "I encountered a digital glitch. Please check your API keys."

    def _clean_json_response(self, text: str) -> str:
        text = text.strip()
        if text.startswith("```json"): text = text[7:]
        if text.startswith("```"): text = text[3:]
        if text.endswith("```"): text = text[:-3]
        return text.strip()

    def _generate_mock_report(self, file_name: str, file_type: str, file_size: int) -> RiskReport:
        return RiskReport(
            overall_risk_score=0.0,
            threat_categories=[],
            detailed_findings=[DetailedFinding(category="System", description="AI Offline")],
            recommendations=[Recommendation(priority="high", action="Add API Key", rationale="Enable AI")],
            confidence_level=0.0,
            scan_timestamp=datetime.utcnow(),
            file_metadata={"file_name": file_name, "file_type": file_type, "file_size": file_size}
        )

vertex_ai_service = VertexAIService()
