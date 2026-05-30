from fastapi import APIRouter, HTTPException, Depends, Query
from uuid import UUID
from datetime import datetime
from typing import Optional
from app.supabase_client import get_supabase, init_supabase
from app.config import settings
from app.dependencies import get_current_user
from app.services.storage import storage_service
from app.models.schemas import VaultFile, VaultFileList, VaultFileDetail, BlockchainProof, OwnershipProofRequest
from app.services.blockchain import blockchain_service
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/vault", tags=["vault"])

supabase = init_supabase()


def _is_mock_mode() -> bool:
    return "mock.supabase.co" in settings.supabase_url or "placeholder.supabase.co" in settings.supabase_url


@router.get("/files", response_model=VaultFileList)
async def list_vault_files(
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    current_user: dict = Depends(get_current_user)
):
    if _is_mock_mode():
        return VaultFileList(files=[], total=0)

    try:
        supabase = init_supabase()
        response = supabase.table("vault_files")\
            .select("*", count="exact")\
            .eq("user_id", current_user["id"])\
            .order("created_at", desc=True)\
            .limit(limit)\
            .offset(offset)\
            .execute()

        files = []
        for item in response.data or []:
            signed_url = None
            try:
                signed_url = await storage_service.get_file_url(
                    file_path=item["storage_path"],
                    bucket=item.get("bucket", "safe-vault")
                )
            except Exception as url_err:
                logger.debug(f"Failed to generate signed URL for {item.get('storage_path')}: {url_err}")

            files.append(VaultFile(
                id=item["id"],
                scan_id=item["scan_id"],
                file_name=item["file_name"],
                file_size=item.get("file_size", 0),
                storage_path=item["storage_path"],
                bucket=item.get("bucket", "safe-vault"),
                content_type=item.get("content_type", "application/octet-stream"),
                original_hash=item.get("original_hash"),
                risk_score=item.get("risk_score"),
                originality_score=item.get("originality_score"),
                is_screenshot=item.get("is_screenshot", False),
                proof_required=bool(item.get("proof_required")),
                ownership_proof_status=item.get("ownership_proof_status"),
                storage_url=signed_url,
                created_at=item.get("created_at", datetime.utcnow())
            ))

        return VaultFileList(files=files, total=response.count or len(files))
    except Exception as e:
        logger.error(f"Failed to list vault files: {e}")
        raise HTTPException(status_code=500, detail="Failed to list vault files")


@router.get("/files/{scan_id}/url")
async def get_vault_file_url(
    scan_id: UUID,
    current_user: dict = Depends(get_current_user)
):
    try:
        response = supabase.table("vault_files")\
            .select("storage_path, bucket, file_name")\
            .eq("scan_id", str(scan_id))\
            .eq("user_id", current_user["id"])\
            .single()\
            .execute()

        if not response.data:
            raise HTTPException(status_code=404, detail="File not found in vault")

        signed_url = await storage_service.get_file_url(
            file_path=response.data["storage_path"],
            bucket=response.data.get("bucket", "safe-vault")
        )

        return {
            "url": signed_url,
            "file_name": response.data["file_name"],
            "scan_id": str(scan_id)
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get file URL: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate file URL")


@router.get("/files/{scan_id}/download")
async def download_vault_file(
    scan_id: UUID,
    current_user: dict = Depends(get_current_user)
):
    try:
        response = supabase.table("vault_files")\
            .select("storage_path, bucket, file_name, content_type")\
            .eq("scan_id", str(scan_id))\
            .eq("user_id", current_user["id"])\
            .single()\
            .execute()

        if not response.data:
            raise HTTPException(status_code=404, detail="File not found in vault")

        file_bytes = await storage_service.download_file(
            file_path=response.data["storage_path"],
            bucket=response.data.get("bucket", "safe-vault")
        )

        from fastapi.responses import Response
        return Response(
            content=file_bytes,
            media_type=response.data.get("content_type", "application/octet-stream"),
            headers={
                "Content-Disposition": f'attachment; filename="{response.data["file_name"]}"'
            }
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to download file: {e}")
        raise HTTPException(status_code=500, detail="Failed to download file")


@router.delete("/files/{scan_id}")
async def delete_vault_file(
    scan_id: UUID,
    current_user: dict = Depends(get_current_user)
):
    try:
        response = supabase.table("vault_files")\
            .select("storage_path, bucket")\
            .eq("scan_id", str(scan_id))\
            .eq("user_id", current_user["id"])\
            .single()\
            .execute()

        if not response.data:
            raise HTTPException(status_code=404, detail="File not found in vault")

        deleted = await storage_service.delete_file(
            file_path=response.data["storage_path"],
            bucket=response.data.get("bucket", "safe-vault")
        )

        supabase.table("vault_files")\
            .delete()\
            .eq("scan_id", str(scan_id))\
            .eq("user_id", current_user["id"])\
            .execute()

        return {"deleted": True, "scan_id": str(scan_id)}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to delete file: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete file")


@router.get("/proofs/{proof_id}/ots-proof")
async def download_ots_proof(
    proof_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Download the .ots proof file for local verification."""
    try:
        resp = supabase.table("blockchain_proofs")\
            .select("ots_proof, asset_name")\
            .eq("proof_id", proof_id)\
            .eq("user_id", current_user["id"])\
            .single()\
            .execute()

        if not resp.data:
            raise HTTPException(status_code=404, detail="Proof not found")
        
        ots_proof = resp.data.get("ots_proof")
        if not ots_proof:
            raise HTTPException(status_code=404, detail="No OTS proof file available (timestamp may have failed)")

        import base64
        from fastapi.responses import Response

        # Try to decode - if it's already raw bytes stored as base64, this should work
        try:
            ots_bytes = base64.b64decode(ots_proof)
        except Exception:
            # If decode fails, might be already binary - try as-is
            ots_bytes = ots_proof.encode('latin1') if isinstance(ots_proof, str) else ots_proof
        
        base_name = resp.data.get("asset_name", "proof")
        if "." in base_name:
            base_name = base_name.rsplit(".", 1)[0]

        return Response(
            content=ots_bytes,
            media_type="application/octet-stream",
            headers={
                "Content-Disposition": f'attachment; filename="{base_name}.ots"',
                "Content-Length": str(len(ots_bytes))
            }
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to download OTS proof: {e}")
        raise HTTPException(status_code=500, detail="Failed to download OTS proof")


@router.get("/files/{scan_id}/proofs", response_model=VaultFileDetail)
async def get_vault_file_with_proofs(
    scan_id: UUID,
    current_user: dict = Depends(get_current_user)
):
    """Get vault file details plus linked blockchain proofs."""
    try:
        file_resp = supabase.table("vault_files")\
            .select("*")\
            .eq("scan_id", str(scan_id))\
            .eq("user_id", current_user["id"])\
            .single()\
            .execute()

        if not file_resp.data:
            raise HTTPException(status_code=404, detail="File not found")

        item = file_resp.data
        signed_url = None
        try:
            signed_url = await storage_service.get_file_url(
                file_path=item["storage_path"],
                bucket=item.get("bucket", "safe-vault")
            )
        except Exception:
            pass

        vault_file = VaultFile(
            id=item["id"],
            scan_id=item["scan_id"],
            file_name=item["file_name"],
            file_size=item.get("file_size", 0),
            storage_path=item["storage_path"],
            bucket=item.get("bucket", "safe-vault"),
            content_type=item.get("content_type", "application/octet-stream"),
            original_hash=item.get("original_hash"),
            risk_score=item.get("risk_score"),
            originality_score=item.get("originality_score"),
            is_screenshot=item.get("is_screenshot", False),
            storage_url=signed_url,
            created_at=item.get("created_at", datetime.utcnow())
        )

        # Fetch linked blockchain proofs
        proofs = []
        try:
            proof_resp = supabase.table("blockchain_proofs")\
                .select("*")\
                .eq("vault_file_id", item["id"])\
                .order("created_at", desc=True)\
                .execute()

            for p in proof_resp.data or []:
                proofs.append(BlockchainProof(
                    proof_id=p["proof_id"],
                    asset_hash=p["asset_hash"],
                    asset_name=p["asset_name"],
                    status=p["status"],
                    verification_url=p["verification_url"],
                    blockchain=p.get("blockchain", "bitcoin"),
                    bitcoin_block=p.get("bitcoin_block"),
                    created_at=p.get("created_at", datetime.utcnow()),
                    confirmed_at=p.get("confirmed_at"),
                    vault_file_id=p.get("vault_file_id")
                ))
        except Exception as proof_err:
            logger.debug(f"Failed to fetch proofs: {proof_err}")

        return VaultFileDetail(file=vault_file, blockchain_proofs=proofs)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get file with proofs: {e}")
        raise HTTPException(status_code=500, detail="Failed to get file details")


@router.post("/files/{scan_id}/ownership-proof")
async def submit_ownership_proof(
    scan_id: UUID,
    body: OwnershipProofRequest,
    current_user: dict = Depends(get_current_user)
):
    """Submit proof of ownership for a file that was flagged as screenshot/not original"""
    proof_type = body.proof_type
    proof_text = body.proof_text
    proof_url = body.proof_url
    try:
        # Verify file belongs to user
        vault_resp = supabase.table("vault_files")\
            .select("id, proof_required")\
            .eq("scan_id", str(scan_id))\
            .eq("user_id", current_user["id"])\
            .single()\
            .execute()
        
        if not vault_resp.data:
            raise HTTPException(status_code=404, detail="File not found")
        
        # Check if proof is actually required
        if not vault_resp.data.get("proof_required"):
            return {"success": True, "message": "Proof not required for this file"}
        
        # Insert ownership proof
        proof_data = {
            "scan_id": str(scan_id),
            "user_id": current_user["id"],
            "proof_type": proof_type,
            "proof_text": proof_text[:500] if proof_text else "",
            "proof_url": proof_url[:500] if proof_url else "",
            "status": "pending"
        }
        supabase.table("ownership_proofs").insert(proof_data).execute()
        
        # Update vault file status
        supabase.table("vault_files")\
            .update({"ownership_proof_status": "pending"})\
            .eq("scan_id", str(scan_id))\
            .execute()
        
        return {"success": True, "message": "Ownership proof submitted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to submit ownership proof: {e}")
        raise HTTPException(status_code=500, detail="Failed to submit proof")
