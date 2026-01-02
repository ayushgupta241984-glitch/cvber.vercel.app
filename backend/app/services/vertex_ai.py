import os
import json
import logging
from datetime import datetime
from typing import Optional

# Configure logger
logger = logging.getLogger(__name__)

# Try to import both SDKs
try:
    import google.generativeai as genai
    GENAI_AVAILABLE = True
except ImportError:
    GENAI_AVAILABLE = False

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
        """Initialize AI Service. Prefers Google AI Studio (Free) over Vertex AI."""
        self.model = None
        self.initialized = False
        self.use_vertex = False
        self._setup_attempted = False
        
        # Initial setup attempt
        self.ensure_initialized()
    
    def ensure_initialized(self):
        """Ensure an AI service is initialized."""
        if self.initialized:
            return True
            
        # 1. Try Google AI Studio (Free API Key) - Best for users without billing
        if GENAI_AVAILABLE and settings.google_api_key:
            try:
                genai.configure(api_key=settings.google_api_key)
                # Note: 'gemini-1.5-flash' is the model name for AI Studio SDK
                self.model = genai.GenerativeModel('gemini-1.5-flash')
                self.initialized = True
                self.use_vertex = False
                logger.info("Google AI Studio (Gemini) successfully initialized (Free Mode)")
                return True
            except Exception as e:
                logger.error(f"Google AI Studio initialization failed: {e}")

        # 2. Fallback to Vertex AI (Enterprise) - Requires GCP Service Account
        if VERTEX_AI_AVAILABLE:
            try:
                # Set credentials if file exists
                if os.path.exists(settings.google_application_credentials):
                    os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = settings.google_application_credentials
                else:
                    return False
                
                # Initialize Vertex AI
                aiplatform.init(
                    project=settings.gcp_project_id,
                    location=settings.vertex_ai_location
                )
                
                # Initialize Gemini model
                self.model = GenerativeModel(
                    settings.vertex_ai_model,
                    generation_config={
                        "temperature": 0.2,
                        "top_p": 0.8,
                        "top_k": 40,
                        "max_output_tokens": 8192,
                    }
                )
                self.initialized = True
                self.use_vertex = True
                logger.info("Vertex AI successfully initialized (Enterprise Mode)")
                return True
            except Exception as e:
                if not self._setup_attempted:
                    logger.warning(f"Vertex AI initialization failed: {e}")
                    self._setup_attempted = True
        
        return False
    
    async def analyze_file_threat(
        self, 
        file_buffer: bytes, 
        file_name: str,
        file_type: str
    ) -> RiskReport:
        """Analyze a file for security threats."""
        self.ensure_initialized()
        
        # Security analysis prompt (shared)
        prompt = f"""You are an expert cybersecurity analyst. Analyze this file:
- Name: {file_name}
- Type: {file_type}
- Size: {len(file_buffer)} bytes

Return JSON: {{
    "overall_risk_score": 0-100,
    "threat_categories": [{{"name": str, "severity": "low|medium|high", "confidence": 0-1, "description": str}}],
    "detailed_findings": [{{"category": str, "description": str, "evidence": str}}],
    "recommendations": [{{"priority": "low|medium|high", "action": str, "rationale": str}}],
    "confidence_level": 0-1
}}"""

        if not self.initialized or self.model is None:
            return self._generate_mock_report(file_name, file_type, len(file_buffer))
        
        try:
            if self.use_vertex:
                # Vertex AI Implementation
                file_part = Part.from_data(data=file_buffer, mime_type=file_type)
                response = await self.model.generate_content_async([prompt, file_part])
            else:
                # AI Studio Implementation
                # AI Studio requires local file upload or small bytes as part
                response = await self.model.generate_content_async([
                    prompt,
                    {"mime_type": file_type, "data": file_buffer}
                ])
            
            response_text = self._clean_json_response(response.text)
            analysis_data = json.loads(response_text)
            
            return RiskReport(
                overall_risk_score=analysis_data["overall_risk_score"],
                threat_categories=[ThreatCategory(**cat) for cat in analysis_data["threat_categories"]],
                detailed_findings=[DetailedFinding(**finding) for finding in analysis_data["detailed_findings"]],
                recommendations=[Recommendation(**rec) for rec in analysis_data["recommendations"]],
                confidence_level=analysis_data["confidence_level"],
                scan_timestamp=datetime.utcnow(),
                file_metadata={"file_name": file_name, "file_type": file_type, "file_size": len(file_buffer)}
            )
        except Exception as e:
            logger.error(f"Analysis failed: {e}")
            return self._generate_mock_report(file_name, file_type, len(file_buffer))

    async def get_mentor_response(self, message: str, history: list = []) -> str:
        """Get a generative response from the Security Mentor."""
        self.ensure_initialized()
        
        system_prompt = "You are the CVBER Free Security Assistant, a cybersecurity expert. Help the user with security and app questions."

        if not self.initialized or self.model is None:
            return "I'm in offline mode. Please add a GOOGLE_API_KEY to your environment to enable my AI brain!"

        try:
            context_str = "\n".join([f"{h['role']}: {h['content']}" for h in history])
            full_prompt = f"{system_prompt}\n\nRecent Conversation:\n{context_str}\n\nUser: {message}\nAssistant:"
            
            response = await self.model.generate_content_async(full_prompt)
            return response.text.strip()
        except Exception as e:
            logger.error(f"Mentor response failed: {e}")
            return "I encountered a digital glitch. Please check your API key and try again."

    def _clean_json_response(self, text: str) -> str:
        """Clean markdown formatting from JSON response."""
        text = text.strip()
        if text.startswith("```json"): text = text[7:]
        if text.startswith("```"): text = text[3:]
        if text.endswith("```"): text = text[:-3]
        return text.strip()

    def _generate_mock_report(self, file_name: str, file_type: str, file_size: int) -> RiskReport:
        """Mock report when AI is unavailable."""
        return RiskReport(
            overall_risk_score=0.0,
            threat_categories=[],
            detailed_findings=[DetailedFinding(category="System", description="AI Service Offline")],
            recommendations=[Recommendation(priority="high", action="Set GOOGLE_API_KEY", rationale="Enable AI")],
            confidence_level=0.0,
            scan_timestamp=datetime.utcnow(),
            file_metadata={"file_name": file_name, "file_type": file_type, "file_size": file_size}
        )

# Singleton
vertex_ai_service = VertexAIService()
