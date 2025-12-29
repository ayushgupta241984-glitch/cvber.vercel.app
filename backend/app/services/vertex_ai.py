import os
import json
from datetime import datetime
from typing import Optional

# Make Google Cloud imports optional
try:
    from google.cloud import aiplatform
    from vertexai.generative_models import GenerativeModel, Part
    VERTEX_AI_AVAILABLE = True
except ImportError:
    VERTEX_AI_AVAILABLE = False
    print("Warning: Google Cloud AI Platform not installed. Using mock data.")

from app.config import settings
from app.models.schemas import RiskReport, ThreatCategory, DetailedFinding, Recommendation


class VertexAIService:
    def __init__(self):
        """Initialize Vertex AI with project configuration."""
        self.model = None
        self.initialized = False
        
        if not VERTEX_AI_AVAILABLE:
            print("Vertex AI libraries not available - using mock data mode")
            return
        
        try:
            # Set credentials if file exists
            if os.path.exists(settings.google_application_credentials):
                os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = settings.google_application_credentials
            
            # Initialize Vertex AI
            aiplatform.init(
                project=settings.gcp_project_id,
                location=settings.vertex_ai_location
            )
            
            # Initialize Gemini model
            self.model = GenerativeModel(
                settings.vertex_ai_model,
                generation_config={
                    "temperature": 0.2,  # Lower temperature for consistent security analysis
                    "top_p": 0.8,
                    "top_k": 40,
                    "max_output_tokens": 8192,
                }
            )
            self.initialized = True
        except Exception as e:
            print(f"Warning: Vertex AI initialization failed: {e}")
            print("API will return mock data for testing purposes.")
    
    async def analyze_file_threat(
        self, 
        file_buffer: bytes, 
        file_name: str,
        file_type: str
    ) -> RiskReport:
        """
        Analyze a file for security threats using Gemini 3 Flash.
        
        Args:
            file_buffer: The file content as bytes
            file_name: Name of the file
            file_type: MIME type of the file
            
        Returns:
            RiskReport with detailed threat analysis
        """
        # Create security analysis prompt
        prompt = f"""You are an expert cybersecurity analyst specializing in threat detection and risk assessment.

Analyze the following file for security threats and risks:

**File Information:**
- Name: {file_name}
- Type: {file_type}
- Size: {len(file_buffer)} bytes

**Analysis Requirements:**
Perform a comprehensive security analysis covering:

1. **Malware Detection**: Check for known malware signatures, suspicious code patterns, obfuscation techniques
2. **Phishing Indicators**: Look for social engineering tactics, credential harvesting attempts, deceptive content
3. **Data Exfiltration Risks**: Identify potential data leakage, unauthorized network connections, suspicious API calls
4. **Code Injection**: Detect SQL injection, XSS, command injection vulnerabilities
5. **Suspicious Patterns**: Unusual file structures, hidden content, steganography, encrypted payloads

**Output Format:**
Return a JSON object with this exact structure:
{{
    "overall_risk_score": <number 0-100>,
    "threat_categories": [
        {{
            "name": "<category name>",
            "severity": "<low|medium|high|critical>",
            "confidence": <0.0-1.0>,
            "description": "<detailed description>"
        }}
    ],
    "detailed_findings": [
        {{
            "category": "<threat category>",
            "description": "<specific finding>",
            "evidence": "<code snippet or pattern found>",
            "line_number": <number or null>
        }}
    ],
    "recommendations": [
        {{
            "priority": "<low|medium|high>",
            "action": "<recommended action>",
            "rationale": "<why this action is needed>"
        }}
    ],
    "confidence_level": <0.0-1.0>
}}

**Important:**
- Be thorough but precise
- Provide specific evidence for findings
- Rate confidence based on certainty of detection
- If the file appears safe, still provide analysis with low risk scores
- Consider file type context in your analysis

Begin analysis:
"""

        # Return mock data if Vertex AI not initialized
        if not self.initialized or self.model is None:
            return self._generate_mock_report(file_name, file_type, len(file_buffer))
        
        try:
            # Create file part for multimodal input
            file_part = Part.from_data(
                data=file_buffer,
                mime_type=file_type
            )
            
            # Generate analysis
            response = await self.model.generate_content_async(
                [prompt, file_part],
                generation_config={
                    "temperature": 0.2,
                }
            )
            
            # Extract JSON from response
            response_text = response.text.strip()
            
            # Remove markdown code blocks if present
            if response_text.startswith("```json"):
                response_text = response_text[7:]
            if response_text.startswith("```"):
                response_text = response_text[3:]
            if response_text.endswith("```"):
                response_text = response_text[:-3]
            
            response_text = response_text.strip()
            
            # Parse JSON response
            analysis_data = json.loads(response_text)
            
            # Create RiskReport object
            risk_report = RiskReport(
                overall_risk_score=analysis_data["overall_risk_score"],
                threat_categories=[
                    ThreatCategory(**cat) for cat in analysis_data["threat_categories"]
                ],
                detailed_findings=[
                    DetailedFinding(**finding) for finding in analysis_data["detailed_findings"]
                ],
                recommendations=[
                    Recommendation(**rec) for rec in analysis_data["recommendations"]
                ],
                confidence_level=analysis_data["confidence_level"],
                scan_timestamp=datetime.utcnow(),
                file_metadata={
                    "file_name": file_name,
                    "file_type": file_type,
                    "file_size": len(file_buffer)
                }
            )
            
            return risk_report
            
        except json.JSONDecodeError as e:
            # Fallback if JSON parsing fails
            return RiskReport(
                overall_risk_score=50.0,
                threat_categories=[
                    ThreatCategory(
                        name="Analysis Error",
                        severity="medium",
                        confidence=0.5,
                        description="Unable to parse AI analysis response"
                    )
                ],
                detailed_findings=[
                    DetailedFinding(
                        category="System",
                        description=f"JSON parsing error: {str(e)}",
                        evidence=response_text[:200] if 'response_text' in locals() else "No response"
                    )
                ],
                recommendations=[
                    Recommendation(
                        priority="medium",
                        action="Retry scan or manual review",
                        rationale="Automated analysis encountered an error"
                    )
                ],
                confidence_level=0.3,
                scan_timestamp=datetime.utcnow(),
                file_metadata={
                    "file_name": file_name,
                    "file_type": file_type,
                    "file_size": len(file_buffer)
                }
            )
        
        except Exception as e:
            # General error handling
            return RiskReport(
                overall_risk_score=0.0,
                threat_categories=[],
                detailed_findings=[
                    DetailedFinding(
                        category="System Error",
                        description=f"Analysis failed: {str(e)}"
                    )
                ],
                recommendations=[
                    Recommendation(
                        priority="high",
                        action="Contact support or retry",
                        rationale="System encountered an unexpected error"
                    )
                ],
                confidence_level=0.0,
                scan_timestamp=datetime.utcnow(),
                file_metadata={
                    "file_name": file_name,
                    "file_type": file_type,
                    "file_size": len(file_buffer)
                }
            )
    
    def _generate_mock_report(self, file_name: str, file_type: str, file_size: int) -> RiskReport:
        """Generate mock report for testing when Vertex AI is unavailable."""
        return RiskReport(
            overall_risk_score=15.5,
            threat_categories=[
                ThreatCategory(
                    name="File Analysis",
                    severity="low",
                    confidence=0.85,
                    description="Mock analysis - Vertex AI not configured. File appears to be standard format."
                )
            ],
            detailed_findings=[
                DetailedFinding(
                    category="System",
                    description="This is a mock scan result. Configure Vertex AI credentials for real threat analysis.",
                    evidence=f"File: {file_name}, Type: {file_type}, Size: {file_size} bytes"
                )
            ],
            recommendations=[
                Recommendation(
                    priority="low",
                    action="Configure Vertex AI credentials in .env file",
                    rationale="Enable real-time AI threat detection by setting up Google Cloud credentials"
                )
            ],
            confidence_level=0.5,
            scan_timestamp=datetime.utcnow(),
            file_metadata={
                "file_name": file_name,
                "file_type": file_type,
                "file_size": file_size,
                "mock_data": True
            }
        )


# Singleton instance
vertex_ai_service = VertexAIService()
