"""Monitor worker — scans vault files for new copies and creates notifications."""
import logging
import json
from datetime import datetime, timezone

logger = logging.getLogger(__name__)


async def run_monitoring_cycle(user_id: str) -> dict:
    """Run a monitoring cycle for all indexed files. Returns alert count."""
    try:
        from app.routers.agent import _get_supabase, _find_image_copies
        supabase = await _get_supabase()

        # Get all indexed files for this user
        result = supabase.table("vault_files") \
            .select("scan_id, file_name") \
            .eq("user_id", user_id) \
            .not_.is_("clip_embedding", "null") \
            .execute()

        files = result.data or []
        alerts = 0

        for f in files:
            try:
                scan_result = await _find_image_copies(f["scan_id"], user_id)
                data = json.loads(scan_result) if scan_result.startswith("{") else {}

                match_count = data.get("match_count", 0)
                if match_count > 0:
                    # Create notification
                    supabase.table("agent_notifications").insert({
                        "user_id": user_id,
                        "type": "copy_found",
                        "title": f"Found {match_count} copy{'es' if match_count != 1 else ''} of {f['file_name']}",
                        "body": f"Monitoring detected {match_count} potential copy{'es' if match_count != 1 else ''} online.",
                        "metadata": json.dumps({
                            "scan_id": f["scan_id"],
                            "file_name": f["file_name"],
                            "match_count": match_count,
                            "matches": data.get("matches", [])[:5],
                        }),
                    }).execute()
                    alerts += 1

            except Exception as e:
                logger.warning(f"Monitor scan failed for {f['scan_id']}: {e}")
                continue

        return {"status": "completed", "scanned": len(files), "alerts": alerts}

    except Exception as e:
        logger.error(f"Monitor cycle error: {e}")
        return {"status": "error", "error": str(e)}
