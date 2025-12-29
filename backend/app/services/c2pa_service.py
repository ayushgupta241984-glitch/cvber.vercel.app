import httpx
from typing import Dict, Any
from app.config import settings
from app.models.schemas import RiskReport, C2PASignature, C2PAManifest
from datetime import datetime
from uuid import uuid4


class C2PAService:
    """Service to interact with the C2PA Node.js microservice."""
    
    def __init__(self):
        self.c2pa_url = settings.c2pa_service_url
        self.client = httpx.AsyncClient(timeout=30.0)
    
    async def sign_file(
        self,
        file_buffer: bytes,
        file_name: str,
        scan_results: RiskReport,
        user_id: str
    ) -> Dict[str, Any]:
        """
        Send file to C2PA service for digital signing.
        
        Args:
            file_buffer: File content as bytes
            file_name: Name of the file
            scan_results: Risk report from AI analysis
            user_id: User ID for provenance tracking
            
        Returns:
            Dictionary with signed file and manifest data
        """
        try:
            # Prepare metadata for C2PA manifest
            metadata = {
                "author": user_id,
                "timestamp": datetime.utcnow().isoformat(),
                "file_name": file_name,
                "scan_results": {
                    "overall_risk_score": scan_results.overall_risk_score,
                    "confidence_level": scan_results.confidence_level,
                    "threat_categories": [
                        {
                            "name": cat.name,
                            "severity": cat.severity,
                            "confidence": cat.confidence
                        }
                        for cat in scan_results.threat_categories
                    ],
                    "scan_timestamp": scan_results.scan_timestamp.isoformat()
                }
            }
            
            # Prepare multipart form data
            files = {
                "file": (file_name, file_buffer)
            }
            
            import json
            data = {
                "metadata": json.dumps(metadata)
            }
            
            # Send request to C2PA service
            response = await self.client.post(
                f"{self.c2pa_url}/sign",
                files=files,
                data=data
            )
            
            response.raise_for_status()
            
            result = response.json()
            
            return {
                "signed_file": result.get("signed_file_url"),
                "manifest": result.get("manifest"),
                "signature": result.get("signature"),
                "kms_key_version": result.get("kms_key_version")
            }
            
        except httpx.HTTPError as e:
            raise Exception(f"C2PA service error: {str(e)}")
        except Exception as e:
            raise Exception(f"Failed to sign file: {str(e)}")
    
    async def verify_signature(self, file_buffer: bytes) -> Dict[str, Any]:
        """
        Verify C2PA signature on a file.
        
        Args:
            file_buffer: File content as bytes
            
        Returns:
            Verification result with manifest data
        """
        try:
            files = {"file": file_buffer}
            
            response = await self.client.post(
                f"{self.c2pa_url}/verify",
                files=files
            )
            
            response.raise_for_status()
            
            return response.json()
            
        except httpx.HTTPError as e:
            raise Exception(f"C2PA verification error: {str(e)}")
        except Exception as e:
            raise Exception(f"Failed to verify signature: {str(e)}")
    
    async def close(self):
        """Close the HTTP client."""
        await self.client.aclose()


# Singleton instance
c2pa_service = C2PAService()
