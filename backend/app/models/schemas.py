from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from uuid import UUID


class UserProfile(BaseModel):
    id: UUID
    email: str
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class ThreatCategory(BaseModel):
    name: str
    severity: str  # "low", "medium", "high", "critical"
    confidence: float
    description: str


class DetailedFinding(BaseModel):
    category: str
    description: str
    evidence: Optional[str] = None
    line_number: Optional[int] = None


class Recommendation(BaseModel):
    priority: str  # "low", "medium", "high"
    action: str
    rationale: str


class RiskReport(BaseModel):
    overall_risk_score: float = Field(..., ge=0, le=100)
    threat_categories: List[ThreatCategory]
    detailed_findings: List[DetailedFinding]
    recommendations: List[Recommendation]
    confidence_level: float = Field(..., ge=0, le=1)
    originality_score: float = Field(default=100.0, ge=0, le=100) # 0 = repost/screenshot, 100 = original
    is_screenshot: bool = Field(default=False)
    scan_timestamp: datetime
    file_metadata: Dict[str, Any]


class ScanRequest(BaseModel):
    file_name: str
    file_size: int
    file_type: str


class ScanResponse(BaseModel):
    scan_id: UUID
    status: str  # "pending", "scanning", "completed", "failed"
    risk_report: Optional[RiskReport] = None
    message: Optional[str] = None
    storage_url: Optional[str] = None  # Signed URL to view/download the stored file
    storage_path: Optional[str] = None  # Internal path in Supabase Storage
    original_hash: Optional[str] = None  # SHA-256 hex digest of the file


class C2PAManifest(BaseModel):
    claim_generator: str
    timestamp: datetime
    assertions: List[Dict[str, Any]]
    signature: str


class C2PASignature(BaseModel):
    file_id: UUID
    original_hash: str
    signed_hash: str
    manifest: C2PAManifest
    kms_key_version: str
    verified_at: datetime


class VerifyRequest(BaseModel):
    file_name: str
    scan_results: RiskReport


class VerifyResponse(BaseModel):
    verification_id: UUID
    signed_file_url: str
    c2pa_signature: C2PASignature
    status: str


class RefreshRequest(BaseModel):
    refresh_token: str


class AuthTokens(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int


class LoginRequest(BaseModel):
    email: str
    password: str


class RegisterRequest(BaseModel):
    email: str
    password: str
    full_name: Optional[str] = None


class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str


class ChatRequest(BaseModel):
    message: str
    history: List[ChatMessage] = []


class ChatResponse(BaseModel):
    response: str
    context_used: Optional[List[str]] = []


class VaultFile(BaseModel):
    id: UUID
    scan_id: UUID
    file_name: str
    file_size: int
    storage_path: str
    bucket: str
    content_type: str
    original_hash: Optional[str] = None
    risk_score: Optional[float] = None
    originality_score: Optional[float] = None
    is_screenshot: bool = False
    proof_required: bool = False
    ownership_proof_status: Optional[str] = None
    storage_url: Optional[str] = None
    created_at: datetime


class BlockchainProof(BaseModel):
    proof_id: str
    asset_hash: str
    asset_name: str
    status: str  # pending, confirmed, local_only
    verification_url: str
    blockchain: str
    bitcoin_block: Optional[int] = None
    created_at: datetime
    confirmed_at: Optional[datetime] = None
    vault_file_id: Optional[UUID] = None


class VaultFileDetail(BaseModel):
    file: VaultFile
    blockchain_proofs: List[BlockchainProof] = []


class VaultFileList(BaseModel):
    files: List[VaultFile]
    total: int


class OwnershipProofRequest(BaseModel):
    proof_type: str = "declaration"
    proof_text: str = ""
    proof_url: str = ""


class AuditLog(BaseModel):
    id: UUID
    user_id: UUID
    event_type: str
    file_name: str
    risk_score: Optional[float] = None
    metadata: Dict[str, Any]
    created_at: datetime
