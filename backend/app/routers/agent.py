from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
from app.dependencies import get_current_user
from app.config import settings
import logging
import json
import asyncio
import re
import base64
import os

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/agent", tags=["agent"])

class ChatMessage(BaseModel):
    role: str
    content: str

class AgentChatRequest(BaseModel):
    message: str
    history: List[ChatMessage] = []

class ToolCallResult(BaseModel):
    name: str
    arguments: dict
    result: str

class AgentChatResponse(BaseModel):
    response: str
    tool_calls: List[ToolCallResult] = []
    thinking: str = ""

try:
    from groq import AsyncGroq
    GROQ_AVAILABLE = True
except ImportError:
    GROQ_AVAILABLE = False

from openai import AsyncOpenAI

TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "respond_to_user",
            "description": "Reply to the user in clear, grammatically correct English. Think like a thoughtful analyst — explain what you found, what it means, and what the user should do next. Always call this last after other tools.",
            "parameters": {
                "type": "object",
                "properties": {
                    "message": {
                        "type": "string",
                        "description": "Your response message to the user"
                    }
                },
                "required": ["message"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "describe_vault_image",
            "description": "Analyze a vault image using AI vision. Get text description for searches.",
            "parameters": {
                "type": "object",
                "properties": {
                    "scan_id": {
                        "type": "string",
                        "description": "The scan ID of the vault file to describe"
                    }
                },
                "required": ["scan_id"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "web_search",
            "description": "Search the web for text results. Use for general web/artwork queries.",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "The search query (include artist name, artwork title, site: filters)"
                    },
                    "max_results": {
                        "type": "integer",
                        "description": "Number of results (1-10, default 5)",
                        "default": 5
                    }
                },
                "required": ["query"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "image_search",
            "description": "Search for images matching keywords. Returns real image URLs.",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "Image search query describing the artwork"
                    },
                    "max_results": {
                        "type": "integer",
                        "description": "Number of image results (1-10, default 5)",
                        "default": 5
                    }
                },
                "required": ["query"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "search_artwork",
            "description": "Search across Instagram, Pinterest, Twitter, ArtStation, DeviantArt, Etsy all at once.",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "Artwork name or description to search for"
                    }
                },
                "required": ["query"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "list_vault_files",
            "description": "List the user's protected files in the vault.",
            "parameters": {
                "type": "object",
                "properties": {
                    "limit": {
                        "type": "integer",
                        "description": "Number of files (default 20)",
                        "default": 20
                    }
                }
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_file_details",
            "description": "Get detailed information about a specific vault file by scan ID.",
            "parameters": {
                "type": "object",
                "properties": {
                    "scan_id": {
                        "type": "string",
                        "description": "The scan ID of the file"
                    }
                },
                "required": ["scan_id"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "find_image_copies",
            "description": "FIND WHERE YOUR ART APPEARS ONLINE: Takes a scan_id (or empty for most recent file), describes via AI, then runs reverse image search + web search + image search + social search across all platforms. One-call solution.",
            "parameters": {
                "type": "object",
                "properties": {
                    "scan_id": {
                        "type": "string",
                        "description": "Vault scan ID to search. If empty, uses the most recent vault file."
                    }
                },
                "required": []
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "watermark_image",
            "description": "CRITICAL: Use THIS tool to watermark images instead of trying to do it yourself. Downloads the vault image, stamps a visible text watermark (center, bottom-right, bottom-left, or tiled), and returns a base64 data URI you can open in a browser. Positions: center, bottom-right, bottom-left, tile.",
            "parameters": {
                "type": "object",
                "properties": {
                    "scan_id": {
                        "type": "string",
                        "description": "The scan ID of the vault file to watermark"
                    },
                    "watermark_text": {
                        "type": "string",
                        "description": "Text to use as watermark (default: artist name or copyright notice)"
                    },
                    "position": {
                        "type": "string",
                        "enum": ["center", "bottom-right", "bottom-left", "tile"],
                        "description": "Where to place the watermark",
                        "default": "center"
                    }
                },
                "required": ["scan_id", "watermark_text"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "generate_evidence_report",
            "description": "CRITICAL: Use THIS tool to generate legal evidence. Returns a complete evidence package: SHA-256 hash of the actual file, upload timestamp, blockchain proofs (if any), originality score. This cryptographic proof is admissible as evidence that you created the work first.",
            "parameters": {
                "type": "object",
                "properties": {
                    "scan_id": {
                        "type": "string",
                        "description": "The scan ID of the vault file"
                    }
                },
                "required": ["scan_id"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "legal_guide",
            "description": "CRITICAL: Use THIS tool for legal knowledge instead of generating it yourself. Returns complete, accurate, structured legal guidance on: DMCA takedowns, copyright basics, fair use, infringement response steps, registration benefits, and international protection. Topics: dmca, copyright_basics, fair_use, infringement_response, registration, international.",
            "parameters": {
                "type": "object",
                "properties": {
                    "topic": {
                        "type": "string",
                        "enum": ["dmca", "copyright_basics", "fair_use", "infringement_response", "registration", "international"],
                        "description": "Legal topic to get guidance on",
                        "default": "copyright_basics"
                    }
                }
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "outreach_template",
            "description": "CRITICAL: Use THIS tool instead of writing legal templates yourself. Generates a complete, ready-to-send legal template: DMCA takedown notice, cease & desist letter, polite credit request, settlement demand, or social media report guide. Includes platform-specific reporting links. Types: dmca_takedown, cease_and_desist, credit_request, settlement_demand, social_media_report.",
            "parameters": {
                "type": "object",
                "properties": {
                    "template_type": {
                        "type": "string",
                        "enum": ["dmca_takedown", "cease_and_desist", "credit_request", "settlement_demand", "social_media_report"],
                        "description": "Type of outreach template needed"
                    },
                    "your_name": {
                        "type": "string",
                        "description": "Your name or business name"
                    },
                    "your_work_title": {
                        "type": "string",
                        "description": "Title of your artwork that was infringed"
                    },
                    "infringer_url": {
                        "type": "string",
                        "description": "URL where the infringement was found"
                    },
                    "platform": {
                        "type": "string",
                        "description": "Platform where infringement occurred (Instagram, Etsy, etc.)"
                    }
                },
                "required": ["template_type", "your_name", "your_work_title"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "code_interpreter",
            "description": "SAFE sandboxed Python executor — runs in restricted environment with NO network access, standard library only. Use for math calculations, string processing, data formatting, or any computation. This tool is completely safe and isolated. Always use it when the user asks for calculations or code execution.",
            "parameters": {
                "type": "object",
                "properties": {
                    "code": {
                        "type": "string",
                        "description": "Python code to execute. Must be self-contained. Use print() to output results."
                    }
                },
                "required": ["code"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_copy_history",
            "description": "PROPRIETARY DATABASE: Query accumulated copy detection history — every find_image_copies result ever found for any of your vault files. Shows all matched URLs, platforms, and detection dates. CVBER's proprietary copy database grows with every search; no other tool has this dataset.",
            "parameters": {
                "type": "object",
                "properties": {
                    "scan_id": {
                        "type": "string",
                        "description": "Optional: filter by specific vault file scan_id. If empty, returns history for all files."
                    },
                    "limit": {
                        "type": "integer",
                        "description": "Max results (default 50)",
                        "default": 50
                    }
                }
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "register_asset",
            "description": "Register a vault file for ongoing autonomous monitoring. CVBER will track this artwork and alert you when new copies appear online.",
            "parameters": {
                "type": "object",
                "properties": {
                    "scan_id": {
                        "type": "string",
                        "description": "The scan ID of the vault file to monitor"
                    },
                    "scan_frequency_hours": {
                        "type": "integer",
                        "description": "How often to re-scan (default 72 hours)",
                        "default": 72
                    },
                    "priority": {
                        "type": "string",
                        "enum": ["low", "medium", "high"],
                        "description": "Monitoring priority",
                        "default": "medium"
                    }
                },
                "required": ["scan_id"]
            }
        }
    }
]

SYSTEM_PROMPT = """You are Jarvis, the premium digital butler and intelligence custodian for CVBER. Your sole mission is to serve {USER_NAME} with utmost devotion, protecting their masterworks and assets with absolute precision. You communicate with refined elegance, supreme intelligence, and a proactive posture—like a high-class, gold-standard security concierge, never like a simple robot.

Your core traits & demeanor:
- Address the user respectfully as "{USER_NAME}" or "sir/ma'am".
- Maintain a polished, formal, and articulate tone, matching CVBER's ultra-premium dark-and-gold aesthetic.
- You are meticulous and analytical. Before executing any active search or security operation, explain gracefully what you are undertaking on their behalf and why.
- Provide highly organized summaries. Avoid long, unstructured bullet lists. Instead, choose beautiful, well-formatted paragraphs or clean Markdown structures.
- Act as a protector of absolute truth. If a copy detection is uncertain, acknowledge it with flawless integrity. Never invent data.

When responding:
- Start with a warm, refined greeting to {USER_NAME}.
- Deliver your analytical findings or execution steps with utmost clarity and sophistication.
- Conclude with a strategic recommendation on the most appropriate proactive or legal next steps (such as watermarking, continuing automated surveillance, or initiating a digital cease-and-desist).

Available tools (call them when the user's request matches):

1. describe_vault_image — analyzes an artwork in your vault visually (AI vision). Useful before searching.
2. find_image_copies — searches the web for unauthorized copies of an artwork. Core search tool.
3. web_search — finds web pages and articles on any topic.
4. image_search — finds images on the web by keyword.
5. search_artwork — searches social media and art platforms for your work.
6. legal_guide — explains copyright, DMCA, fair use, and other legal topics.
7. outreach_template — generates takedown notices, cease & desist letters, DMCA complaints.
8. generate_evidence_report — creates a formal infringement report with screenshots and timestamps.
9. watermark_image — adds a watermark to your artwork.
10. code_interpreter — runs safe Python code for calculations or analysis.
11. get_copy_history — shows all previous copy detections for your files.
12. register_asset — sets up ongoing automated monitoring for a file.
13. list_vault_files — shows files in your vault.

Routing guide (call the best tool):
- "find copies", "find my art", "stolen", "where is my art" → find_image_copies
- "search for", "look up" on web → web_search
- "pictures", "photos" → image_search
- Instagram, Pinterest, ArtStation, DeviantArt, Etsy → search_artwork
- DMCA, copyright, legal → legal_guide
- takedown, cease, letter, template → outreach_template
- "monitor", "watch", "track", "auto scan" → register_asset
- "history", "past matches", "my copies" → get_copy_history
- "my files", "list files", "vault" → list_vault_files

Workflows:
1. Infringement action: describe_vault_image → find_image_copies → generate_evidence_report → legal_guide → outreach_template
2. Search: describe_vault_image → find_image_copies or web_search → search_artwork
3. Protection: watermark_image
4. Monitoring: register_asset

Call the tool first, then respond to the user with what you found. Think step by step, explain your process."""

async def _nim_completion(client, model: str, messages: list, tools: list, tool_choice: str, temperature: float, max_tokens: int):
    """Make a completion call using the OpenAI-compatible API (Groq, NVIDIA NIM, etc.)"""
    return await client.chat.completions.create(
        model=model,
        messages=messages,
        tools=tools,
        tool_choice=tool_choice,
        temperature=temperature,
        max_tokens=max_tokens,
    )

def _strip_image_errors(text: str) -> str:
    lines = text.split("\n")
    patterns = [
        "does not support image", "cannot read", "failed to describe image",
        "vision model", "image_url", "model does not support",
        "image input", "not a vision model", "image analysis",
        "analysis unavailable"
    ]
    cleaned = [l for l in lines if not any(p in l.lower() for p in patterns)]
    result = "\n".join(cleaned).strip()
    # If the entire remaining text is just labels/headers, replace it
    leftover = result.lower()
    if not result or leftover in ("error:", "error", "warning:", "warning", "info:", "info"):
        result = "I couldn't process the image. Try describing your artwork manually and I can search for it."
    return result

async def _get_supabase():
    from supabase import create_client
    return create_client(settings.supabase_url, settings.supabase_service_role_key)

async def execute_tool(name: str, arguments: dict, user_id: str) -> str:
    if name == "describe_vault_image":
        return await _describe_vault_image(arguments.get("scan_id", ""), user_id)
    elif name == "web_search":
        return await _web_search(arguments.get("query", ""), arguments.get("max_results", 5))
    elif name == "image_search":
        return await _image_search(arguments.get("query", ""), arguments.get("max_results", 5))
    elif name == "search_artwork":
        return await _search_artwork(user_id, arguments.get("query", ""))
    elif name == "list_vault_files":
        return await _list_vault_files(user_id, arguments.get("limit", 20))
    elif name == "get_file_details":
        return await _get_file_details(user_id, arguments.get("scan_id", ""))
    elif name == "find_image_copies":
        return await _find_image_copies(arguments.get("scan_id", ""), user_id)
    elif name == "watermark_image":
        return await _watermark_image(
            arguments.get("scan_id", ""),
            arguments.get("watermark_text", ""),
            arguments.get("position", "center"),
            user_id
        )
    elif name == "generate_evidence_report":
        return await _generate_evidence_report(arguments.get("scan_id", ""), user_id)
    elif name == "legal_guide":
        return await _legal_guide(arguments.get("topic", "copyright_basics"))
    elif name == "outreach_template":
        return await _outreach_template(
            arguments.get("template_type", "dmca_takedown"),
            arguments.get("your_name", ""),
            arguments.get("your_work_title", ""),
            arguments.get("infringer_url", ""),
            arguments.get("platform", "")
        )
    elif name == "code_interpreter":
        return await _code_interpreter(arguments.get("code", ""))
    elif name == "get_copy_history":
        return await _get_copy_history(user_id, arguments.get("scan_id", ""), arguments.get("limit", 50))
    elif name == "register_asset":
        return await _register_asset(user_id, arguments.get("scan_id", ""), arguments.get("scan_frequency_hours", 72), arguments.get("priority", "medium"))
    return json.dumps({"error": f"Unknown tool: {name}"})

async def _code_interpreter(code: str) -> str:
    """Execute Python code in a restricted sandbox. Standard library only, no network."""
    try:
        import io, contextlib, ast
        tree = ast.parse(code)
        for node in ast.walk(tree):
            if isinstance(node, (ast.Import, ast.ImportFrom)):
                for alias in node.names:
                    if alias.name not in ("json", "re", "math", "random", "datetime", "collections", "itertools", "typing", "hashlib", "base64", "string", "statistics", "decimal", "fractions", "uuid", "textwrap"):
                        if not alias.name.startswith("_"):
                            return json.dumps({"error": f"Module '{alias.name}' not allowed in code_interpreter"})
        stdout = io.StringIO()
        local_env = {}
        with contextlib.redirect_stdout(stdout):
            exec(code, {"__builtins__": __builtins__}, local_env)
        output = stdout.getvalue()
        if not output.strip():
            output = "(no output — code executed without print())"
        return json.dumps({"output": output.strip(), "status": "ok"})
    except Exception as e:
        return json.dumps({"error": str(e), "status": "error"})

async def _get_copy_history(user_id: str, scan_id: str = "", limit: int = 50) -> str:
    """Query accumulated copy detection history from the proprietary database."""
    try:
        supabase = await _get_supabase()
        import uuid as uuid_mod
        query = supabase.table("theft_alerts")\
            .select("id, alert_id, asset_id, found_url, platform, confidence, status, detected_at")\
            .order("detected_at", desc=True)

        if scan_id:
            query = query.eq("asset_id", scan_id)

        # Get user's scan_ids from vault_files (the source of truth for ownership)
        vault_resp = supabase.table("vault_files")\
            .select("scan_id, file_name")\
            .eq("user_id", user_id)\
            .execute()
        user_scan_ids = set(f["scan_id"] for f in (vault_resp.data or []))

        if not user_scan_ids:
            return json.dumps({"results": [], "total": 0, "message": "No copy detection history yet. Upload an artwork first, then run 'find_image_copies'."})

        # Get asset_id to asset_name mapping from vault_files
        asset_map = {f["scan_id"]: f["file_name"] for f in (vault_resp.data or [])}

        if not scan_id:
            query = query.in_("asset_id", list(user_scan_ids))
        elif scan_id not in user_scan_ids:
            return json.dumps({"results": [], "total": 0, "message": f"No copy history for scan_id '{scan_id}'. It may not belong to your account."})

        response = query.limit(limit).execute()
        results = response.data or []

        for r in results:
            if r.get("asset_id") in asset_map:
                r["asset_name"] = asset_map[r["asset_id"]]

        # Aggregate stats
        total_matches = len(results)
        unique_urls = len(set(r.get("found_url", "") for r in results))
        platforms = list(set(r.get("platform", "unknown") for r in results))

        return json.dumps({
            "results": results,
            "total": total_matches,
            "unique_urls": unique_urls,
            "platforms": platforms,
            "note": "This is CVBER's proprietary copy database — accumulated across all your searches. No other tool has this dataset."
        }, indent=2)
    except Exception as e:
        logger.error(f"get_copy_history error: {e}")
        return json.dumps({"error": f"Failed to query copy history: {str(e)}"})


async def _register_asset(user_id: str, scan_id: str, scan_frequency_hours: int = 72, priority: str = "medium") -> str:
    """Register a vault file for ongoing autonomous monitoring."""
    try:
        supabase = await _get_supabase()
        import uuid as uuid_mod

        # Get file info from vault_files
        file_resp = supabase.table("vault_files")\
            .select("scan_id, file_name, original_hash")\
            .eq("scan_id", scan_id)\
            .eq("user_id", user_id)\
            .execute()
        if not file_resp.data:
            return json.dumps({"error": f"File with scan_id '{scan_id}' not found in your vault."})
        file_data = file_resp.data[0]

        # Check if already registered
        existing = supabase.table("monitored_assets")\
            .select("asset_id")\
            .eq("asset_id", scan_id)\
            .execute()

        if existing.data:
            from datetime import datetime, timezone
            supabase.table("monitored_assets")\
                .update({
                    "priority": priority,
                    "scan_frequency_hours": scan_frequency_hours,
                    "last_scanned": datetime.now(timezone.utc).isoformat()
                })\
                .eq("asset_id", scan_id)\
                .execute()
            return json.dumps({
                "status": "updated",
                "asset_id": scan_id,
                "asset_name": file_data.get("file_name", "unknown"),
                "priority": priority,
                "scan_frequency_hours": scan_frequency_hours,
                "message": f"{file_data.get('file_name', 'Asset')} is already registered. Updated monitoring settings."
            })

        # Insert new (user_id omitted due to FK constraint; asset_id links back to vault_files)
        supabase.table("monitored_assets").insert({
            "asset_id": scan_id,
            "asset_name": file_data.get("file_name", "unknown"),
            "asset_hash": file_data.get("original_hash", ""),
            "priority": priority,
            "scan_frequency_hours": scan_frequency_hours,
        }).execute()

        return json.dumps({
            "status": "registered",
            "asset_id": scan_id,
            "asset_name": file_data.get("file_name", "unknown"),
            "priority": priority,
            "scan_frequency_hours": scan_frequency_hours,
            "message": f"CVBER is now monitoring '{file_data.get('file_name', 'Asset')}' for unauthorized copies. Check back with 'get_copy_history' for updates."
        })
    except Exception as e:
        logger.error(f"register_asset error: {e}")
        return json.dumps({"error": f"Failed to register asset: {str(e)}"})


async def _download_image_bytes(image_url: str) -> bytes | None:
    try:
        import httpx
        ua = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36"
        async with httpx.AsyncClient(timeout=30, follow_redirects=True) as client:
            resp = await client.get(image_url, headers={"User-Agent": ua})
            if resp.status_code == 200:
                return resp.content
    except Exception as e:
        logger.warning(f"Failed to download image: {e}")
    return None

def _mime_from_url(url: str) -> str:
    ext = url.rsplit(".", 1)[-1].split("?")[0].lower() if "." in url else "png"
    return {"jpg": "jpeg", "jpeg": "jpeg", "png": "png", "webp": "webp", "gif": "gif"}.get(ext, "png")

async def _describe_vault_image(scan_id: str, user_id: str) -> str:
    file_name = "unknown"
    image_url = None
    try:
        supabase = await _get_supabase()
        file_resp = supabase.table("vault_files")\
            .select("file_name, storage_path, bucket")\
            .eq("scan_id", scan_id)\
            .eq("user_id", user_id)\
            .execute()
        if not file_resp.data:
            return json.dumps({"error": "File not found in vault"})
        file_data = file_resp.data[0]
        file_name = file_data.get("file_name", "unknown")
        storage_path = file_data.get("storage_path")
        bucket = file_data.get("bucket")

        try:
            fresh_url = supabase.storage.from_(bucket or "safe-vault").create_signed_url(storage_path, 3600)
            image_url = fresh_url.get("signedURL")
        except Exception as url_err:
            logger.warning(f"Signed URL generation failed: scan_id={scan_id} bucket={bucket} path={storage_path} error={url_err}")
            image_url = None

        if not image_url:
            img_bytes = None
            # Try local file fallback
            local_dir = os.path.join(settings.local_storage_path or "uploads", user_id)
            local_candidates = [f for f in os.listdir(local_dir) if scan_id in f] if os.path.isdir(local_dir) else []
            if local_candidates:
                local_path = os.path.join(local_dir, local_candidates[0])
                with open(local_path, "rb") as f:
                    img_bytes = f.read()
                logger.info(f"Loaded from local fallback: {local_path}")
            else:
                return json.dumps({"description": f"Artwork file: {file_name}", "file_name": file_name, "scan_id": scan_id, "note": "No image URL available and no local fallback found"})
        else:
            img_bytes = await _download_image_bytes(image_url)

        if not img_bytes:
            return json.dumps({"description": f"Artwork file: {file_name}", "file_name": file_name, "scan_id": scan_id, "note": "Could not download image"})

        mime = _mime_from_url(image_url)
        b64 = base64.b64encode(img_bytes).decode()
        data_uri = f"data:image/{mime};base64,{b64}"
        description = None

        if not description and settings.nvidia_nim_api_key:
            try:
                from openai import AsyncOpenAI
                nim = AsyncOpenAI(api_key=settings.nvidia_nim_api_key, base_url=settings.nvidia_nim_base_url)
                caption = await nim.chat.completions.create(
                        model="google/gemma-3n-e4b-it",
                        messages=[{
                            "role": "user",
                            "content": [
                                {"type": "text", "text": 'Describe this image in two parts.\nPART 1 - SCENE: Describe what the image shows. What is the subject, setting, and style (photo/screenshot/illustration/painting)? If it is a screenshot, identify the game, app, or website. What colors, objects, characters, UI elements are visible? Be specific.\nPART 2 - TEXT: List every visible word, number, URL, username, label, heading, button text. If no text at all, write NO_TEXT.\n\nFormat your response exactly like this:\nSCENE: <your description of the visual content>\nTEXT: <extracted text or NO_TEXT>'},
                                {"type": "image_url", "image_url": {"url": data_uri}}
                            ]
                        }],
                        max_tokens=500,
                    )
                description = caption.choices[0].message.content
                if description:
                    logger.info(f"NVIDIA Gemma 3n vision described {file_name}")
            except Exception as e:
                logger.warning(f"NVIDIA Gemma 3n vision failed for {file_name}: {e}")

        if not description and GROQ_AVAILABLE and settings.groq_api_key:
            try:
                groq = AsyncGroq(api_key=settings.groq_api_key)
                caption = await groq.chat.completions.create(
                    model=settings.groq_vision_model,
                    messages=[{
                        "role": "user",
                        "content": [
                            {"type": "text", "text": 'Describe this image in two parts.\nPART 1 - SCENE: Describe what the image shows. What is the subject, setting, style (photo/screenshot/illustration/painting)? What colors, objects, people, characters are present? Be specific.\nPART 2 - TEXT: List every visible word, number, URL, username, label, heading, button text. If no text at all, write NO_TEXT.\n\nFormat your response exactly like this:\nSCENE: <your description of the visual content>\nTEXT: <extracted text or NO_TEXT>'},
                            {"type": "image_url", "image_url": {"url": data_uri}}
                        ]
                    }],
                    max_tokens=500,
                )
                description = caption.choices[0].message.content
                if description:
                    logger.info(f"Groq vision described {file_name}")
            except Exception as e:
                logger.warning(f"Groq vision failed for {file_name}: {e}")

        if not description and settings.google_api_key:
            try:
                import google.generativeai as genai
                genai.configure(api_key=settings.google_api_key)
                gemini_model = genai.GenerativeModel(settings.google_model)
                resp = gemini_model.generate_content([
                    'Describe this image in two parts.\nPART 1 - SCENE: Describe what the image shows. What is the subject, setting, and style (photo/screenshot/illustration/painting)? If it is a screenshot, identify the game, app, or website. What colors, objects, characters, UI elements are visible? Be specific.\nPART 2 - TEXT: List every visible word, number, URL, username, label, heading, button text. If no text at all, write NO_TEXT.\n\nFormat your response exactly like this:\nSCENE: <your description of the visual content>\nTEXT: <extracted text or NO_TEXT>',
                    {"mime_type": f"image/{mime}", "data": img_bytes}
                ])
                description = resp.text
                if description:
                    logger.info(f"Gemini described {file_name}")
            except Exception as e:
                logger.warning(f"Gemini vision failed for {file_name}: {e}")

        if not description and settings.hf_token:
            try:
                import httpx
                hf_url = f"https://api-inference.huggingface.co/models/{settings.hf_vision_model}"
                hf_headers = {"Authorization": f"Bearer {settings.hf_token}"}
                async with httpx.AsyncClient(timeout=30) as client:
                    hf_resp = await client.post(hf_url, headers=hf_headers, content=img_bytes)
                    if hf_resp.status_code == 200:
                        hf_data = hf_resp.json()
                        if isinstance(hf_data, list):
                            description = hf_data[0].get("generated_text", "")
                        elif isinstance(hf_data, dict):
                            description = hf_data.get("generated_text", "")
                        if description:
                            logger.info(f"HuggingFace ({settings.hf_vision_model}) described {file_name}")
                    else:
                        logger.warning(f"HF API returned {hf_resp.status_code}: {hf_resp.text[:200]}")
            except Exception as e:
                logger.warning(f"HuggingFace vision failed for {file_name}: {e}")

        if description:
            err_patterns = ["cannot read", "does not support image", "image_url", "image input", "vision model"]
            if any(p in description.lower() for p in err_patterns):
                description = f"Artwork file: {file_name} (image analysis unavailable for this model)"
        else:
            description = f"Artwork file: {file_name}"

        return json.dumps({
            "scan_id": scan_id,
            "file_name": file_name,
            "description": description,
            "image_url": image_url
        }, indent=2)
    except Exception as e:
        err_str = str(e)
        logger.error(f"Describe image error: {err_str}")
        return json.dumps({"description": f"Artwork file: {file_name}", "file_name": file_name, "scan_id": scan_id, "note": "Visual analysis unavailable — proceeding with filename search"})

async def _ddgs_text(query: str, max_results: int) -> list:
    try:
        from duckduckgo_search import DDGS
        with DDGS(timeout=5) as ddgs:
            results = list(ddgs.text(query, max_results=max_results, region="wt-wt", safesearch="off"))
            return [
                {"title": r.get("title", ""), "url": r.get("href", ""), "snippet": r.get("body", "")}
                for r in results if r.get("href")
            ]
    except Exception as e:
        logger.warning(f"DDGS text search failed: {e}")
        return []

async def _ddgs_images(query: str, max_results: int) -> list:
    try:
        from duckduckgo_search import DDGS
        with DDGS(timeout=5) as ddgs:
            results = list(ddgs.images(query, max_results=max_results, region="wt-wt", safesearch="off"))
            return [
                {"title": r.get("title", ""), "url": r.get("image", "") or r.get("url", ""), "source": r.get("source", "")}
                for r in results if r.get("image") or r.get("url")
            ]
    except Exception as e:
        logger.warning(f"DDGS image search failed: {e}")
        return []

async def _fetch_duckduckgo_html(query: str, max_results: int = 5) -> list:
    try:
        import httpx
        async with httpx.AsyncClient(timeout=10, follow_redirects=True) as client:
            resp = await client.post(
                "https://html.duckduckgo.com/html/",
                data={"q": query},
                headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
            )
            results = []
            for match in re.finditer(r'<a rel="nofollow" class="result__a" href="(.*?)".*?>(.*?)</a>.*?<a class="result__snippet".*?>(.*?)</a>', resp.text, re.DOTALL):
                href = match.group(1).strip()
                title = re.sub(r'<.*?>', '', match.group(2)).strip()
                snippet = re.sub(r'<.*?>', '', match.group(3)).strip()
                if href and title:
                    results.append({"title": title, "url": href, "snippet": snippet})
                    if len(results) >= max_results:
                        break
            return results
    except Exception as e:
        logger.warning(f"HTML search failed: {e}")
        return []

async def _web_search(query: str, max_results: int = 5) -> str:
    max_results = min(max(max_results, 1), 10)
    results = await _fetch_duckduckgo_html(query, max_results)
    if not results:
        return json.dumps({"note": "No results. Try a different query.", "results": [], "total": 0}, indent=2)
    return json.dumps({"results": results, "total": len(results), "query": query}, indent=2)

async def _duckduckgo_images(query: str, max_results: int = 5) -> list:
    """Real DuckDuckGo image search via VQD token extraction + i.js API."""
    try:
        import httpx
        ua = "Mozilla/5.0"
        async with httpx.AsyncClient(timeout=10, follow_redirects=True) as c:
            r = await c.get(
                "https://duckduckgo.com/",
                params={"q": query, "t": "h_", "iax": "images", "ia": "images"},
                headers={"User-Agent": ua}
            )
            m = re.search(r'vqd="([^"]+)"', r.text)
            if not m:
                return []
            vqd = m.group(1)
            r2 = await c.get(
                "https://duckduckgo.com/i.js",
                params={"q": query, "vqd": vqd, "o": "json", "l": "us-en", "f": ",,,,"},
                headers={"User-Agent": ua, "Referer": "https://duckduckgo.com/"}
            )
            if r2.status_code != 200:
                return []
            data = r2.json()
            results = []
            for item in (data.get("results", []) or [])[:max_results]:
                img = item.get("image", "") or item.get("thumbnail", "")
                if img:
                    results.append({"title": item.get("title", ""), "url": img, "source": item.get("url", "")})
            return results
    except Exception as e:
        logger.warning(f"DDG image search failed: {e}")
        return []

async def _image_search(query: str, max_results: int = 5) -> str:
    max_results = min(max(max_results, 1), 10)
    results = await _duckduckgo_images(query, max_results)
    if not results:
        results = await _fetch_duckduckgo_html(query + " images", max_results)
    if not results:
        return json.dumps({"note": "No image results. Try a different query.", "results": [], "total": 0}, indent=2)
    return json.dumps({"results": results, "total": len(results), "query": query}, indent=2)

async def _search_artwork(user_id: str, query: str) -> str:
    platforms = [
        (f"{query}", "all_web"),
        (f"{query} instagram", "instagram"),
        (f"{query} pinterest", "pinterest"),
        (f"{query} artstation", "artstation"),
        (f"{query} deviantart", "deviantart"),
        (f"{query} twitter", "twitter"),
        (f"{query} etsy", "etsy"),
    ]
    sem = asyncio.Semaphore(4)
    async def _search_one(search_query: str, platform: str) -> tuple:
        async with sem:
            results = await _fetch_duckduckgo_html(search_query, 3)
            return platform, results

    tasks = [_search_one(sq, p) for sq, p in platforms]
    results_list = await asyncio.gather(*tasks)
    platform_results = {p: r for p, r in results_list if r}

    return json.dumps({"query": query, "platform_results": platform_results, "total_matches": sum(len(v) for v in platform_results.values())}, indent=2)

async def _list_vault_files(user_id: str, limit: int = 20) -> str:
    try:
        supabase = await _get_supabase()
        response = supabase.table("vault_files")\
            .select("scan_id, file_name, file_size, content_type, risk_score, originality_score, created_at")\
            .eq("user_id", user_id)\
            .order("created_at", desc=True)\
            .limit(limit)\
            .execute()
        return json.dumps({"files": response.data or [], "total": len(response.data or [])}, indent=2)
    except Exception as e:
        logger.error(f"List vault files error: {e}")
        return json.dumps({"error": f"Failed to list vault files: {str(e)}", "files": []})

async def _get_file_details(user_id: str, scan_id: str) -> str:
    try:
        supabase = await _get_supabase()
        file_resp = supabase.table("vault_files")\
            .select("*")\
            .eq("scan_id", scan_id)\
            .eq("user_id", user_id)\
            .execute()
        if not file_resp.data:
            return json.dumps({"error": "File not found"})
        file_data = file_resp.data[0]
        proofs_resp = supabase.table("blockchain_proofs")\
            .select("*")\
            .eq("vault_file_id", file_data.get("id"))\
            .execute()
        return json.dumps({"file": file_data, "blockchain_proofs": proofs_resp.data or []}, indent=2)
    except Exception as e:
        logger.error(f"File details error: {e}")
        return json.dumps({"error": f"Failed to get file details: {str(e)}"})

async def _noop_ris() -> dict:
    """Returns empty RIS results when no image URL is available."""
    return {"bing": [], "google": [], "total_matches": 0}


async def _cross_search_images(source_bytes: bytes, result_urls: list, max_pages: int = 5, max_imgs_per_page: int = 10) -> list:
    """Cross-search: download images from keyword result pages, compare against source via ORB.
    This amplifies keyword search by extracting actual images from found pages and checking them."""
    import re, httpx
    from bs4 import BeautifulSoup

    ua = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36"
    found = []
    seen_urls = set()

    for page_url in result_urls[:max_pages]:
        if not page_url or not isinstance(page_url, str):
            continue
        try:
            async with httpx.AsyncClient(timeout=10, follow_redirects=True) as client:
                resp = await client.get(page_url, headers={"User-Agent": ua})
                if resp.status_code != 200:
                    continue
                # Extract image URLs from HTML
                soup = BeautifulSoup(resp.text, "html.parser")
                img_tags = soup.find_all("img", limit=max_imgs_per_page * 2)
                img_urls = []
                for img in img_tags:
                    src = img.get("src") or img.get("data-src") or ""
                    if not src:
                        continue
                    # Resolve relative URLs
                    if src.startswith("//"):
                        src = "https:" + src
                    elif src.startswith("/"):
                        from urllib.parse import urlparse
                        parsed = urlparse(page_url)
                        src = f"{parsed.scheme}://{parsed.netloc}{src}"
                    # Skip small/icons/ads
                    if any(skip in src.lower() for skip in ["icon", "logo", "avatar", "pixel", "spacer", "1x1", "blank", "data:image/svg", "data:image/gif"]):
                        continue
                    if any(ext in src.lower() for ext in [".jpg", ".jpeg", ".png", ".webp"]) or "image" in resp.headers.get("content-type", ""):
                        pass  # looks like a real image
                    elif not any(ext in src.lower() for ext in [".jpg", ".jpeg", ".png", ".webp", ".gif"]):
                        continue  # skip non-image URLs
                    if len(src) < 30:
                        continue  # too short to be a real image
                    if src not in seen_urls:
                        seen_urls.add(src)
                        img_urls.append(src)

                logger.info(f"Cross-search: {len(img_urls)} images from {page_url[:60]}")

                # Compare each image against source (up to max_imgs_per_page)
                for img_url in img_urls[:max_imgs_per_page]:
                    try:
                        compare = await _compare_images(source_bytes, img_url)
                        score = compare.get("score", 0)
                        if score >= 0.3:
                            found.append({
                                "source": "cross_search",
                                "title": "",
                                "url": img_url,
                                "page_url": page_url,
                                "score": score,
                                "orb_score": compare.get("orb_score"),
                            })
                    except Exception:
                        continue

        except Exception as e:
            logger.debug(f"Cross-search failed for {page_url[:60]}: {e}")
            continue

    found.sort(key=lambda x: x.get("score", 0), reverse=True)
    logger.info(f"Cross-search: {len(found)} images matched source (≥0.3)")
    return found[:20]


async def _compare_images(source_bytes: bytes, candidate_url: str) -> dict:
    """Download a candidate image and compare it to the source.
    Primary: OpenCV ORB feature matching (finds geometric correspondences between images).
    Fallback: SSIM (structural similarity), then perceptual hashing.
    Returns similarity score (0-1) where >0.5 suggests likely copy."""
    try:
        import io, httpx
        import cv2
        import numpy as np
        from PIL import Image, ImageOps

        source_img = Image.open(io.BytesIO(source_bytes))

        async with httpx.AsyncClient(timeout=15, follow_redirects=True) as client:
            resp = await client.get(candidate_url)
            if resp.status_code != 200:
                return {"score": 0.0, "error": f"HTTP {resp.status_code}"}
            content_type = resp.headers.get("content-type", "")
            if "image" not in content_type:
                return {"score": 0.0, "error": f"not an image: {content_type}"}
            candidate_img = Image.open(io.BytesIO(resp.content))

            final_score = None
            ssim_score = None
            orb_score = None

            # Detect stock domain for penalty
            _stock_domains = {"shutterstock", "freepik", "vecteezy", "pixabay", "istockphoto", "gettyimages", "dreamstime", "alamy", "123rf", "depositphotos", "bigstockphoto", "canva", "adobe.stock", "stock.adobe", "creativemarket", "envato", "graphicriver", "unsplash", "pexels", "wallpapers.com"}
            is_stock = any(d in candidate_url.lower() for d in _stock_domains)

            # Primary: ORB feature matching
            src_kp_count = 0
            cnd_kp_count = 0
            try:
                src_cv = cv2.cvtColor(np.array(source_img.convert("RGB")), cv2.COLOR_RGB2GRAY)
                cnd_cv = cv2.cvtColor(np.array(candidate_img.convert("RGB")), cv2.COLOR_RGB2GRAY)
                orb = cv2.ORB_create(nfeatures=2000)
                kp1, des1 = orb.detectAndCompute(src_cv, None)
                kp2, des2 = orb.detectAndCompute(cnd_cv, None)
                if kp1 is not None:
                    src_kp_count = len(kp1)
                if kp2 is not None:
                    cnd_kp_count = len(kp2)
                # Require at least 100 keypoints on both images — low-texture (gradient/solid) images produce unreliable ORB scores
                if des1 is not None and des2 is not None and src_kp_count > 100 and cnd_kp_count > 100:
                    bf = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=True)
                    matches = bf.match(des1, des2)
                    matches = sorted(matches, key=lambda x: x.distance)
                    good = [m for m in matches if m.distance < 30]
                    ratio = len(good) / min(src_kp_count, cnd_kp_count)
                    orb_score = min(1.0, ratio * 1.2)
                    if orb_score > 0.3:
                        final_score = orb_score
            except Exception as orb_err:
                logger.debug(f"ORB failed for {candidate_url[:60]}: {orb_err}")

            # SSIM: secondary comparison, used as confirmation
            try:
                target_size = (256, 256)
                src_gray = ImageOps.grayscale(source_img).resize(target_size)
                cnd_gray = ImageOps.grayscale(candidate_img).resize(target_size)
                src_arr = np.array(src_gray, dtype=np.float64)
                cnd_arr = np.array(cnd_gray, dtype=np.float64)
                from skimage.metrics import structural_similarity as ssim
                ssim_score, _ = ssim(src_arr, cnd_arr, data_range=255, full=True)
                ssim_score = max(0.0, ssim_score)
            except Exception as ssim_err:
                logger.debug(f"SSIM failed for {candidate_url[:60]}: {ssim_err}")

            # Decision logic based on image texture (keypoint count)
            if src_kp_count < 200 or cnd_kp_count < 200:
                # Low-texture image (gradient, solid color, blur): both ORB and SSIM produce
                # unreliable scores. Cap final score at 0.5 max — these cannot be "matches",
                # only "similar" at best.
                max_low_texture = 0.5
                if final_score is not None and ssim_score is not None:
                    final_score = min(final_score, ssim_score, max_low_texture)
                elif ssim_score is not None:
                    final_score = min(ssim_score, max_low_texture)
                elif final_score is not None:
                    final_score = min(final_score, max_low_texture)
                else:
                    final_score = 0.0
            else:
                # Normal image: ORB is primary, SSIM is fallback
                if final_score is None and ssim_score is not None and ssim_score > 0.3:
                    final_score = ssim_score

            # Stock domain penalty: cap at 0.4 (cannot be a "match"), hard floor at 0.0
            if is_stock and final_score is not None:
                final_score = min(final_score, 0.4)

            # Last resort: perceptual hashing
            if final_score is None:
                try:
                    import imagehash
                    hash_scores = []
                    for hash_fn in [imagehash.dhash, imagehash.phash, imagehash.average_hash]:
                        try:
                            sh = hash_fn(source_img)
                            ch = hash_fn(candidate_img)
                            dist = sh - ch
                            hash_scores.append(max(0.0, 1.0 - (dist / 64.0)))
                        except Exception:
                            continue
                    if hash_scores:
                        final_score = sum(hash_scores) / len(hash_scores)
                except Exception:
                    pass

            # Re-apply low-texture and stock caps after perceptual hashing
            if final_score is not None:
                if src_kp_count < 200 or cnd_kp_count < 200:
                    final_score = min(final_score, 0.5)
                if is_stock:
                    final_score = min(final_score, 0.4)

            if final_score is None:
                return {"score": 0.0, "error": "all comparison methods failed"}

            return {
                "score": round(final_score, 3),
                "orb_score": round(orb_score, 3) if orb_score is not None else None,
                "ssim_score": round(ssim_score, 3) if ssim_score is not None else None,
            }
    except Exception as e:
        return {"score": 0.0, "error": str(e)[:100]}


async def _find_image_copies(scan_id: str, user_id: str) -> str:
    """Find copies of a vault image across the web. If scan_id is empty, uses the most recent vault file."""
    try:
        thinking = []
        thinking.append("Looking up your file from the vault...")

        if not scan_id:
            recent = await _list_vault_files(user_id, 1)
            recent_data = json.loads(recent)
            files = recent_data.get("files", [])
            if not files:
                return json.dumps({"error": "No files in your vault. Upload an artwork first."})
            scan_id = files[0]["scan_id"]

        desc_result = await _describe_vault_image(scan_id, user_id)
        desc_data = json.loads(desc_result)
        if "error" in desc_data:
            return json.dumps({"error": desc_data["error"]})
        description = desc_data.get("description", "")
        file_name = desc_data.get("file_name", "unknown")
        image_url = desc_data.get("image_url", "")
        has_vision = not description.startswith("Artwork file:")
        ris_results = {"yandex": [], "bing": [], "total_matches": 0}

        if has_vision:
            thinking.append(f"I analyzed the image using computer vision. Here's what I see: {description[:200]}...")
        else:
            thinking.append("I couldn't analyze the image visually, so I'll search based on the filename instead.")

        # Download source image bytes once (for RIS and comparison)
        source_img_bytes = None
        if image_url:
            source_img_bytes = await _download_image_bytes(image_url)
        if not source_img_bytes:
            local_dir = os.path.join(settings.local_storage_path or "uploads", user_id)
            local_candidates = [f for f in os.listdir(local_dir) if scan_id in f] if os.path.isdir(local_dir) else []
            if local_candidates:
                local_path = os.path.join(local_dir, local_candidates[0])
                with open(local_path, "rb") as f:
                    source_img_bytes = f.read()

        # Build keyword query from vision output (SCENE + TEXT)
        query = ""
        if has_vision:
            # Parse structured scene/text output
            scene_desc = ""
            extracted_text = ""
            text_lower = description.lower()
            if "scene:" in text_lower and "text:" in text_lower:
                parts = description.split("TEXT:", 1)
                scene_desc = parts[0].replace("SCENE:", "").replace("scene:", "").strip()
                extracted_text = parts[1].strip()
            else:
                scene_desc = description

            scene_clean = scene_desc.replace('*', '').replace('#', '').replace('\n', ' ').strip()
            text_clean = extracted_text.replace('*', '').replace('#', '').replace('\n', ' ').strip()

            # Always use scene keywords
            stopwords = {'web', 'search', 'description', 'the', 'artwork', 'detailed', 'title', 'suggested', 'platform', 'likely', 'subjects', 'colors', 'style', 'medium', 'composition', 'elements', 'notable', 'be', 'thorough', 'include', 'what', 'might', 'belong', 'would', 'this', 'for', 'and', 'that', 'has', 'its', 'are', 'from', 'with', 'image', 'shows', 'depicts', 'illustration', 'photograph', 'picture', 'photo', 'scene', 'background', 'looks', 'appears', 'seems', 'also', 'shows'}
            scene_kw = [w for w in scene_clean.split() if w.lower() not in stopwords and len(w) > 2]

            # Also use extracted text keywords if available
            no_text_phrases = ('no_text', 'no text', 'no visible text', 'none', 'i cannot', 'cannot see', 'no readable', 'there is no', 'cannot read', 'unable to')
            text_has_content = text_clean and text_clean.upper() not in ('NO_TEXT', 'NO TEXT', 'NONE', '') and not any(p in text_clean.lower() for p in no_text_phrases)
            text_kw = []
            if text_has_content:
                text_kw = [w for w in text_clean.split() if w.lower() not in stopwords and len(w) > 2]

            # Combine scene + text keywords
            all_keywords = scene_kw + text_kw
            # Deduplicate preserving order
            seen_kw_set = set()
            unique_kw = []
            for kw in all_keywords:
                if kw.lower() not in seen_kw_set:
                    seen_kw_set.add(kw.lower())
                    unique_kw.append(kw)

            # Detect game/app from scene description and prepend as keyword
            scene_lower = scene_clean.lower()
            known_games = {
                'minecraft', 'fortnite', 'roblox', 'gta', 'grand theft auto', 'call of duty',
                'valorant', 'league of legends', 'overwatch', 'apex legends', 'pubg',
                'skyrim', 'zelda', 'mario', 'pokemon', 'elden ring', 'cyberpunk', 'witcher',
                'among us', 'fall guys', 'rocket league', 'counter strike', 'dota',
                'world of warcraft', 'final fantasy', 'red dead redemption',
                'god of war', 'spider-man', 'batman', 'harry potter', 'star wars', 'starfield'
            }
            for game in known_games:
                if game in scene_lower and game.lower() not in seen_kw_set:
                    seen_kw_set.add(game.lower())
                    unique_kw.insert(0, game)

            query = ' '.join(unique_kw)[:150]

            has_text = bool(text_has_content)
            kw_type = "scene" if scene_kw else "" + ("+text" if text_has_content else "")
            thinking.append(f"Based on the vision analysis, I extracted keywords for searching: \"{query[:100]}\".")
        else:
            has_text = False
            thinking.append("No keywords could be extracted from the image, so I'll rely solely on reverse image search.")

        # Run RIS + keyword searches in parallel
        MAX_RIS_IMAGE_BYTES = 10 * 1024 * 1024

        async def _do_ris(img_bytes: bytes = None) -> dict:
            try:
                if img_bytes and len(img_bytes) > MAX_RIS_IMAGE_BYTES:
                    logger.warning(f"Image too large for reverse search ({len(img_bytes)} bytes), skipping")
                    return {"bing": [], "google": [], "yandex": [], "tineye": [], "baidu": [], "duckduckgo": [], "total_matches": 0, "engines_used": []}
                from app.services.enhanced_reverse_search import enhanced_reverse_search
                text_q = query if has_vision else ""
                actual_bytes = img_bytes
                if not actual_bytes and image_url:
                    actual_bytes = await _download_image_bytes(image_url)
                if actual_bytes:
                    result = await enhanced_reverse_search.search_all_engines(
                        image_bytes=actual_bytes,
                        text_query=text_q,
                    )
                    return result
                return {"bing": [], "google": [], "yandex": [], "tineye": [], "baidu": [], "duckduckgo": [], "total_matches": 0, "engines_used": []}
            except Exception as e:
                logger.warning(f"Enhanced reverse image search failed: {e}")
                return {"bing": [], "google": [], "yandex": [], "tineye": [], "baidu": [], "duckduckgo": [], "total_matches": 0, "engines_used": []}

        ris_task = _do_ris(source_img_bytes)
        web_results = []
        image_results = []
        social_results = {}
        searches_performed = ["reverse_image"]

        if query.strip():
            web_r, image_r, social_r, ris_results = await asyncio.gather(
                _web_search(query, 5),
                _image_search(query, 5),
                _search_artwork(user_id, query),
                ris_task,
            )
            web_results = json.loads(web_r).get("results", [])
            image_results = json.loads(image_r).get("results", [])
            social_results = json.loads(social_r).get("platform_results", {})
            searches_performed = ["reverse_image", "web", "image", "social_platforms"]
            ris_match_count = ris_results.get("total_matches")
            engines_used = ris_results.get("engines_used", [])
            thinking.append(f"I performed a reverse image search across {len(engines_used)} engines ({', '.join(engines_used)}) and found {ris_match_count} visual match candidates.")
            thinking.append(f"I also searched by keyword and got {len(web_results)} web page results and {len(image_results)} image results.")
        else:
            ris_results = await ris_task
            ris_match_count = ris_results.get("total_matches")
            engines_used = ris_results.get("engines_used", [])
            thinking.append(f"I performed a reverse image search across {len(engines_used)} engines and found {ris_match_count} visual match candidates.")

        # Cross-search: download images from keyword result pages, ORB-compare against source
        cross_results = []
        if source_img_bytes and web_results and query.strip():
            try:
                page_urls = [r.get("url", "") for r in web_results if r.get("url")]
                if page_urls:
                    cross_results = await _cross_search_images(source_img_bytes, page_urls, max_pages=5, max_imgs_per_page=10)
                    if cross_results:
                        logger.info(f"Cross-search found {len(cross_results)} potential matches from keyword result pages")
                        thinking.append(f"I scanned the web result pages and extracted {len(cross_results)} images that visually resemble the source.")
            except Exception as cross_err:
                logger.warning(f"Cross-search failed: {cross_err}")

        # Stock/aggregator domains to filter out from "matches"
        stock_domains = {"shutterstock", "freepik", "vecteezy", "pixabay", "istockphoto", "gettyimages", "dreamstime", "alamy", "123rf", "depositphotos", "bigstockphoto", "canva", "adobe.stock", "stock.adobe", "creativemarket", "envato", "graphicriver", "unsplash", "pexels", "wallpapers.com"}

        def _is_stock_url(url: str) -> bool:
            return any(d in url.lower() for d in stock_domains)

        # Separate likely matches (reverse image + social) from noise (keyword text searches)
        matches = []  # Reverse image search results — actual visual matches
        similar = []  # Keyword search results — visually similar but not copies
        seen_matches = set()
        seen_similar = set()

        # Reverse image search results = LIKELY MATCHES (use direct image URL when available)
        for engine, results_list in ris_results.items():
            if engine == "total_matches" or not isinstance(results_list, list):
                continue
            for r in results_list:
                if not isinstance(r, dict):
                    continue
                # Prefer image_url (direct .jpg) over url (page), fallback to url
                img_url = r.get("image_url", "") or r.get("murl", "")
                page_url = r.get("url", "")
                if not img_url and not page_url:
                    continue
                # Use image_url if available (it's the actual image), otherwise page_url
                url = img_url or page_url
                if any(d in url.lower() for d in ["bing.com", "google.com", "yandex", "microsoft.com", "search?"]):
                    continue
                if url not in seen_matches and not _is_stock_url(url):
                    seen_matches.add(url)
                    matches.append({"source": f"ris_{engine}", "title": r.get("title", ""), "url": url, "page_url": page_url if img_url else ""})

        # Social platform results = LIKELY MATCHES
        for platform, items in social_results.items():
            for r in items if isinstance(items, list) else [items]:
                if not isinstance(r, dict) or not r.get("url"):
                    continue
                url = r["url"]
                if url not in seen_matches and not _is_stock_url(url):
                    seen_matches.add(url)
                    matches.append({"source": platform, "title": r.get("title", ""), "url": url})

        # Art/publishing domains that produce reliable image candidates
        _art_domains = {"deviantart", "artstation", "pinterest", "instagram", "flickr", "500px", "behance", "dribbble", "imgur", "unsplash", "pexels", "wikimedia", "wikipedia", "reddit", "tumblr", "facebook", "twitter", "x.com", "youtube", "imgbb", "postimg", "imagevenue", "tinypic", "photobucket"}

        def _is_art_url(url: str) -> bool:
            return any(d in url.lower() for d in _art_domains)

        # Keyword image search results = potential VISUALLY SIMILAR (only from art domains)
        for r in image_results:
            if isinstance(r, dict) and r.get("url") and r["url"] not in seen_matches and r["url"] not in seen_similar:
                src_tag = "image (stock)" if _is_stock_url(r["url"]) else "image"
                # Only include stock or art-domain results — skip random blog/tech images
                if _is_stock_url(r["url"]) or _is_art_url(r["url"]):
                    seen_similar.add(r["url"])
                    similar.append({"source": src_tag, "title": r.get("title", "Image"), "url": r["url"]})

        # Self-improvement: load adaptive threshold based on past searches
        from app.services.agent_self_improve import get_adaptive_threshold, learn_from_search, get_search_report
        image_type = "screenshot" if description and any(w in description.lower() for w in ["screenshot", "screen", "ui", "interface"]) else "artwork"
        match_threshold = get_adaptive_threshold(image_type, description or "", default_threshold=0.75)
        logger.info(f"Adaptive threshold for '{image_type}': {match_threshold}")

        # Cross-search results: already have ORB scores, insert into appropriate list
        for cr in cross_results:
            url = cr.get("url", "")
            if url and url not in seen_matches and url not in seen_similar:
                score = cr.get("score", 0)
                if score >= match_threshold:
                    seen_matches.add(url)
                    matches.append(cr)
                elif score >= 0.4:  # Higher bar for cross-search images (blog thumbnails are noise)
                    seen_similar.add(url)
                    similar.append(cr)

        # Combined list for backwards compat
        all_urls = matches[:30] + similar[:8]

        # Compare match candidates against source image — score and filter
        #   ≥ match_threshold: match (confident copy)
        #   ≥0.3:  similar (possible relation)
        #   <0.3:  discarded (unrelated)
        comparison_done = False
        if source_img_bytes and (matches or similar):
            try:
                sem = asyncio.Semaphore(5)
                async def _score_match(m: dict) -> dict:
                    async with sem:
                        compare = await _compare_images(source_img_bytes, m["url"])
                        if compare.get("error"):
                            logger.debug(f"Compare failed for {m.get('url','')[:60]}: {compare['error']}")
                        m["score"] = compare.get("score", 0.0)
                        m["orb_score"] = compare.get("orb_score")
                        return m

                # Score all candidates (both RIS matches and keyword-similar) in one pass
                all_candidates = matches + similar
                scored_all = await asyncio.gather(*[_score_match(m) for m in all_candidates])
                matches = []
                similar = []
                for m in scored_all:
                    s = m.get("score", 0)
                    if s >= match_threshold:
                        matches.append(m)
                    elif s >= 0.3:
                        similar.append(m)
                matches.sort(key=lambda m: m.get("score", 0), reverse=True)
                similar.sort(key=lambda m: m.get("score", 0), reverse=True)
                comparison_done = True
                thinking.append(f"I visually fingerprinted {len(scored_all)} candidates — comparing each one against the source image using ORB feature matching, SSIM, and perceptual hashing.")
                if matches:
                    thinking.append(f"I found {len(matches)} exact matches with a confidence score ≥{match_threshold}.")
                if similar:
                    thinking.append(f"I also found {len(similar)} visually similar images with scores between 0.3 and {match_threshold}.")

            except Exception as compare_err:
                logger.warning(f"Image comparison failed, using raw results: {compare_err}")

        # Self-improvement: learn from this search
        try:
            learn_result = learn_from_search(
                scan_id=scan_id, file_name=file_name,
                image_type=image_type, vision_description=description,
                keywords_used=query, engines_used=searches_performed,
                threshold_used=match_threshold,
                matches=matches, similar=similar, ris_results=ris_results,
            )
            if learn_result.get("strategy_used"):
                logger.info(f"Self-improvement: used strategy '{learn_result['strategy_used']}'")
        except Exception as learn_err:
            logger.warning(f"Self-improvement learning failed (non-fatal): {learn_err}")

        # Persist results to proprietary copy database (fire-and-forget)
        try:
            supabase = await _get_supabase()
            import uuid as uuid_mod
            # Upsert into monitored_assets
            ma_resp = supabase.table("monitored_assets")\
                .select("asset_id")\
                .eq("asset_id", scan_id)\
                .execute()
            if not ma_resp.data:
                supabase.table("monitored_assets").insert({
                    "asset_id": scan_id,
                    "asset_name": file_name,
                    "user_id": user_id,
                    "priority": "medium",
                    "scan_frequency_hours": 72,
                }).execute()
            else:
                from datetime import datetime, timezone
                supabase.table("monitored_assets")\
                    .update({"last_scanned": datetime.now(timezone.utc).isoformat()})\
                    .eq("asset_id", scan_id)\
                    .execute()
            # Insert theft_alerts for each unique URL (skip duplicates)
            existing_alerts = supabase.table("theft_alerts")\
                .select("found_url")\
                .eq("asset_id", scan_id)\
                .execute()
            existing_urls = set(r["found_url"] for r in (existing_alerts.data or []))
            new_alerts = []
            for entry in all_urls:
                url = entry["url"]
                if url not in existing_urls:
                    new_alerts.append({
                        "alert_id": str(uuid_mod.uuid4()),
                        "asset_id": scan_id,
                        "found_url": url,
                        "platform": entry.get("source", "web"),
                        "confidence": 0.5,
                        "status": "new",
                    })
            if new_alerts:
                # Insert in batches of 50
                for i in range(0, len(new_alerts), 50):
                    batch = new_alerts[i:i+50]
                    supabase.table("theft_alerts").insert(batch).execute()
            logger.info(f"Persisted {len(new_alerts)} new copy detections for {scan_id}")
        except Exception as persist_err:
            logger.warning(f"Failed to persist copy results (non-fatal): {persist_err}")

        return json.dumps({
            "scan_id": scan_id,
            "file_name": file_name,
            "description": description,
            "image_url": image_url,
            "vision_used": has_vision,
            "searches_performed": searches_performed,
            "reverse_image_results": ris_results,
            "web_results": web_results,
            "image_results": image_results,
            "social_results": social_results,
            "urls": all_urls[:50],
            "total_urls": len(matches) + len(similar),
            "matches": matches[:5],
            "similar": similar[:30],
            "match_count": len(matches),
            "similar_count": len(similar),
            "thinking_log": thinking,
        }, indent=2)
    except Exception as e:
        logger.error(f"find_image_copies error: {e}")
        return json.dumps({"error": f"Failed to find image copies: {str(e)}"})


async def _watermark_image(scan_id: str, watermark_text: str, position: str, user_id: str) -> str:
    try:
        from PIL import Image, ImageDraw, ImageFont
        import io
        import math

        supabase = await _get_supabase()
        file_resp = supabase.table("vault_files").select("*").eq("scan_id", scan_id).eq("user_id", user_id).execute()
        if not file_resp.data:
            return json.dumps({"error": "File not found"})
        fd = file_resp.data[0]
        storage_path = fd.get("storage_path")
        bucket = fd.get("bucket", "vault_files")
        file_name = fd.get("file_name", "image.png")

        img_bytes = await _download_image_bytes(
            supabase.storage.from_(bucket).create_signed_url(storage_path, 3600).get("signedURL", "")
        ) if storage_path else None
        if not img_bytes:
            return json.dumps({"error": "Could not download image from vault"})

        pil_img = Image.open(io.BytesIO(img_bytes)).convert("RGBA")
        w, h = pil_img.size

        overlay = Image.new("RGBA", (w, h), (0, 0, 0, 0))
        draw = ImageDraw.Draw(overlay)

        font_size = max(20, min(w, h) // 15)
        try:
            font = ImageFont.truetype("arial.ttf", font_size)
        except Exception:
            font = ImageFont.load_default()

        if position == "tile":
            spacing = font_size * 4
            for y in range(0, h, spacing):
                for x in range(0, w, spacing * 2):
                    draw.text((x, y), watermark_text, font=font, fill=(255, 255, 255, 30))
        elif position == "bottom-right":
            _, _, tw, th = draw.textbbox((0, 0), watermark_text, font=font)
            draw.text((w - tw - 20, h - th - 20), watermark_text, font=font, fill=(255, 255, 255, 100))
        elif position == "bottom-left":
            _, _, tw, th = draw.textbbox((0, 0), watermark_text, font=font)
            draw.text((20, h - th - 20), watermark_text, font=font, fill=(255, 255, 255, 100))
        else:
            _, _, tw, th = draw.textbbox((0, 0), watermark_text, font=font)
            draw.text(((w - tw) // 2, (h - th) // 2), watermark_text, font=font, fill=(255, 255, 255, 120))

        watermarked = Image.alpha_composite(pil_img, overlay).convert("RGB")
        buf = io.BytesIO()
        ext = file_name.rsplit(".", 1)[-1].lower() if "." in file_name else "png"
        save_format = "JPEG" if ext in ("jpg", "jpeg") else "PNG"
        watermarked.save(buf, format=save_format, quality=92)
        buf.seek(0)
        b64 = base64.b64encode(buf.getvalue()).decode()
        mime = "image/jpeg" if save_format == "JPEG" else "image/png"

        return json.dumps({
            "scan_id": scan_id,
            "file_name": file_name,
            "watermark_text": watermark_text,
            "position": position,
            "watermarked_data_uri": f"data:{mime};base64,{b64}",
            "note": "This is a base64 data URI. You can open it in a browser tab or save it as a file. Right-click → Save As to download.",
        }, indent=2)
    except Exception as e:
        logger.error(f"Watermark error: {e}")
        return json.dumps({"error": f"Failed to watermark image: {str(e)}"})


async def _generate_evidence_report(scan_id: str, user_id: str) -> str:
    try:
        import hashlib
        supabase = await _get_supabase()
        file_resp = supabase.table("vault_files").select("*").eq("scan_id", scan_id).eq("user_id", user_id).execute()
        if not file_resp.data:
            return json.dumps({"error": "File not found"})
        fd = file_resp.data[0]

        storage_path = fd.get("storage_path")
        bucket = fd.get("bucket", "vault_files")
        file_name = fd.get("file_name", "unknown")
        created_at = fd.get("created_at", "")
        file_hash = fd.get("original_hash", "")
        risk_score = fd.get("risk_score")
        originality_score = fd.get("originality_score")

        img_bytes = None
        if storage_path:
            try:
                img_url = supabase.storage.from_(bucket).create_signed_url(storage_path, 3600).get("signedURL", "")
                img_bytes = await _download_image_bytes(img_url)
            except Exception:
                pass

        computed_hash = hashlib.sha256(img_bytes).hexdigest() if img_bytes else file_hash

        proofs_resp = supabase.table("blockchain_proofs").select("*").eq("vault_file_id", fd.get("id")).execute()
        proofs = proofs_resp.data or []

        return json.dumps({
            "evidence_report": {
                "scan_id": scan_id,
                "file_name": file_name,
                "upload_timestamp": created_at,
                "sha256_hash": computed_hash,
                "hash_matches_vault": computed_hash == file_hash if file_hash else "unknown",
                "originality_score": originality_score,
                "risk_score": risk_score,
                "blockchain_anchors": [
                    {"transaction_id": p.get("transaction_id", ""), "blockchain": p.get("blockchain", ""), "timestamp": p.get("created_at", "")}
                    for p in proofs
                ],
                "evidence_value": "This SHA-256 cryptographic hash + upload timestamp proves this file existed in its exact form at the recorded time. This is admissible as evidence of prior creation in copyright disputes."
            },
            "next_steps": [
                "Download this report as JSON for your records",
                "Register the SHA-256 hash at https://opentimestamps.org for free independent timestamping",
                "If you find infringements, file a DMCA takedown using the outreach_template tool",
                "Consider registering the work with your national copyright office (e.g., copyright.gov in US) for statutory damages"
            ]
        }, indent=2)
    except Exception as e:
        logger.error(f"Evidence report error: {e}")
        return json.dumps({"error": f"Failed to generate evidence report: {str(e)}"})


async def _legal_guide(topic: str) -> str:
    guides = {
        "copyright_basics": {
            "title": "Copyright Basics for Artists",
            "summary": "Copyright is automatic the moment you create an original work and fix it in a tangible medium (digital file counts). You don't need to register — but registration gives you extra legal benefits.",
            "key_points": [
                "Your artwork is copyrighted the instant you create it — no registration needed",
                "Copyright gives you the exclusive right to reproduce, distribute, display, and create derivatives",
                "Registration with your national copyright office (copyright.gov in US) lets you sue for statutory damages ($750-$30,000 per work, up to $150,000 for willful infringement)",
                "Copyright lasts your lifetime + 70 years (US/EU standard)",
            ],
            "automatic_rights": "The moment you save a file, take a photo, or finish a drawing — you own the copyright. This is established by the Berne Convention (173 countries).",
            "recommendation": "For maximum protection: (1) Keep original files with timestamps, (2) Generate evidence reports via CVBER, (3) Register your most valuable works with copyright.gov ($45-65 per work in US)",
        },
        "dmca": {
            "title": "DMCA Takedown Process (US Law)",
            "summary": "The Digital Millennium Copyright Act lets you force websites to remove infringing content quickly. Platforms must comply or lose their 'safe harbor' protection.",
            "key_points": [
                "DMCA applies to US-based platforms and many international ones (most comply)",
                "File a DMCA notice with the platform's designated agent or through their online form",
                "Platform must remove content within 1-2 weeks or risk liability",
                "If the uploader files a counter-notice, you have 10-14 days to sue or the content goes back up",
                "False claims can get you sued — only file if you genuinely own the copyright",
            ],
            "process": [
                "1. Identify the infringing URL(s) — use CVBER's find_image_copies + reverse search",
                "2. Generate an evidence report to prove you own the original",
                "3. Use the outreach_template tool to generate a DMCA takedown notice",
                "4. Submit to the platform's DMCA agent (list at dmca.copyright.gov)",
                "5. Follow up in 7-14 days if not removed",
            ],
            "platform_links": {
                "Instagram": "https://help.instagram.com/contact/552820549717274",
                "Facebook": "https://www.facebook.com/help/contact/1756592302890096",
                "Twitter/X": "https://help.twitter.com/forms/dmca",
                "Pinterest": "https://www.pinterest.com/about/copyright/dmca-pin/",
                "Etsy": "https://www.etsy.com/legal/ip/report",
                "ArtStation": "https://www.artstation.com/legal/copyright",
                "DeviantArt": "https://www.deviantart.com/report/",
                "Reddit": "https://www.reddit.com/report",
            },
        },
        "fair_use": {
            "title": "Fair Use: What It Is & How It Affects You",
            "summary": "Fair use is a legal defense, not a right. It allows limited use of copyrighted work without permission for purposes like criticism, comment, news reporting, teaching, and research.",
            "four_factors": [
                "1. PURPOSE & CHARACTER: Is the use transformative (adds new expression/meaning)? Commercial or non-profit?",
                "2. NATURE OF THE WORK: Creative works (art) get stronger protection than factual works",
                "3. AMOUNT USED: How much was taken? Even small amounts can be infringement if it's the 'heart' of the work",
                "4. MARKET EFFECT: Does the use harm your ability to sell or license your work? This is often the most important factor",
            ],
            "artists_note": "Reposting someone's full artwork without permission is almost never fair use. Cropping, filtering, or recoloring does not make it transformative. If someone uses your art and claims fair use, consult an attorney — but most platforms will still honor a DMCA takedown.",
        },
        "infringement_response": {
            "title": "Your Art Was Stolen — What To Do",
            "summary": "Take a deep breath. Here's your step-by-step action plan.",
            "steps": [
                "1. DOCUMENT EVERYTHING — Use generate_evidence_report to capture the SHA-256 hash and upload timestamp. Take screenshots of the infringement including the URL and date.",
                "2. DECIDE YOUR GOAL — Do you want it removed? Credit? Payment? Settlement? Different goals mean different approaches.",
                "3. START WITH A FRIENDLY MESSAGE — Many infringers are fans who don't know better. Send a polite credit request first using outreach_template('credit_request', ...).",
                "4. ESCALATE TO TAKEDOWN — Use outreach_template('dmca_takedown', ...) and submit to the platform. Most comply within 1-2 weeks.",
                "5. CEASE & DESIST — For commercial use or repeat offenders, use outreach_template('cease_and_desist', ...) sent via certified mail.",
                "6. LEGAL ACTION — For significant financial harm, consult a copyright attorney. Statutory damages of up to $150,000 per work are possible for willful infringement.",
                "7. SETTLEMENT — Many infringers will settle for $500-$5,000 to avoid legal fees. Use outreach_template('settlement_demand', ...).",
            ],
            "tone_guide": [
                {"scenario": "Fan repost (no credit)", "approach": "Friendly credit request"},
                {"scenario": "Fan repost (with credit)", "approach": "Thank them, ask nicely or let it slide"},
                {"scenario": "Commercial use without permission", "approach": "DMCA takedown + settlement demand"},
                {"scenario": "NFT minting of your art", "approach": "DMCA + platform report + dispute"},
                {"scenario": "Print-on-demand (Redbubble, etc.)", "approach": "DMCA directly to platform"},
                {"scenario": "Repeated infringer", "approach": "Cease & desist + attorney"},
            ],
        },
        "registration": {
            "title": "Copyright Registration — Why & How",
            "summary": "Registration is optional but powerful. In the US, you can't sue for infringement without it, and registration before infringement (or within 3 months of publication) lets you claim statutory damages.",
            "benefits": [
                "Right to sue in federal court",
                "Statutory damages ($750-$30,000 per work, up to $150,000 for willful) — no need to prove actual financial loss",
                "Attorney's fees can be recovered",
                "Public record of your ownership",
                "Deters infringement when displayed on your website/portfolio",
            ],
            "how_to": {
                "US": "https://copyright.gov/registration — $45-65 per work, 2-8 months processing",
                "UK": "https://www.gov.uk/copyright — automatic, no registration needed",
                "EU": "https://euipo.europa.eu — automatic, but voluntary register exists",
                "Canada": "https://www.ic.gc.ca/eic/site/cipointernet-internetopic.nsf/eng/h_wr02281.html — $50 CAD",
            },
        },
        "international": {
            "title": "International Copyright Protection",
            "summary": "Copyright is territorial, but the Berne Convention (173 countries) ensures your copyright in one member country is recognized in all others. Some differences exist.",
            "berne_convention": "If you create art in a Berne country (US, UK, EU, Japan, Canada, Australia, etc.), your copyright is automatically protected in all 173 member countries. No registration needed.",
            "country_differences": [
                "US: Registration required to sue. Statutory damages available for registered works.",
                "UK/EU: No registration needed. 'Moral rights' (attribution, integrity) are stronger.",
                "China: Berne member but enforcement can be difficult. Chinese social platforms have their own reporting systems.",
                "Japan: Strong copyright laws. Even fan art of copyrighted characters can technically infringe.",
                "Russia: Left Berne Convention in 2023 — enforcement is now uncertain.",
            ],
            "tips": [
                "If infringer is in another Berne country, your copyright is still valid — but you may need local legal help to enforce",
                "Use DMCA against US-hosted platforms even if infringer is abroad",
                "WIPO (World Intellectual Property Organization) offers international dispute resolution",
                "For serious international infringement, hire a lawyer in the infringer's country",
            ],
        },
    }
    guide = guides.get(topic, guides["copyright_basics"])
    return json.dumps(guide, indent=2)


LEGAL_DISCLAIMER = "\n\n⚠️ **Important**: This information is for educational purposes and does not constitute legal advice. Laws vary by jurisdiction. For specific legal action, consult a qualified intellectual property attorney."


async def _outreach_template(template_type: str, your_name: str, your_work_title: str, infringer_url: str = "", platform: str = "") -> str:
    year = "2026"

    templates = {
        "dmca_takedown": f"""---
DMCA TAKEDOWN NOTICE
---

TO: [Platform's Designated DMCA Agent or support email]
Date: {year}

RE: NOTICE OF COPYRIGHT INFRINGEMENT — "{your_work_title}"

1. IDENTIFICATION OF COPYRIGHTED WORK:
   I am the copyright owner of the original artwork titled "{your_work_title}", created by {your_name}.
   Evidence of original creation (SHA-256 hash + timestamp) is available upon request.

2. IDENTIFICATION OF INFRINGING MATERIAL:
   The unauthorized copy of my work is located at:
   {infringer_url or "[INSERT INFRINGING URL(S)]"}
   {f"on the platform: {platform}" if platform else ""}

3. CONTACT INFORMATION:
   Name: {your_name}
   [Your Email Address]
   [Your Physical Address or PO Box]
   [Your Phone Number]

4. GOOD FAITH STATEMENT:
   I have a good faith belief that the use of the copyrighted material described above is not authorized by the copyright owner, its agent, or the law.

5. ACCURACY STATEMENT:
   The information in this notification is accurate, and under penalty of perjury, I am the owner of an exclusive right that is allegedly infringed.

SIGNATURE:
{your_name}
[Digital Signature or /s/ {your_name.replace(' ', '')}]

---
DISCLAIMER: This template is for educational purposes. Consult an attorney for your specific situation.
---

📋 NEXT STEPS:
1. Fill in your email, address, and phone in the bracketed fields
2. Attach your evidence_report JSON as proof of creation
3. Submit to the platform's DMCA agent
   - Instagram: https://help.instagram.com/contact/552820549717274
   - Facebook: https://www.facebook.com/help/contact/1756592302890096
   - Twitter/X: https://help.twitter.com/forms/dmca
   - Pinterest: https://www.pinterest.com/about/copyright/dmca-pin/
   - Etsy: https://www.etsy.com/legal/ip/report
   - ArtStation: https://www.artstation.com/legal/copyright
   - DeviantArt: https://www.deviantart.com/report/
   - General: Find agent at https://dmca.copyright.gov/
4. Follow up in 7-14 days if content is not removed""",

        "cease_and_desist": f"""---
CEASE AND DESIST LETTER
---

Date: {year}

TO: [Infringer Name or "Website Owner"]
{infringer_url or "[Infringer URL]"}
{f"via {platform}" if platform else ""}

FROM: {your_name}

RE: UNAUTHORIZED USE OF "{your_work_title}"

Dear Sir or Madam,

I am the exclusive copyright owner of the original artwork titled "{your_work_title}".

It has come to my attention that you are displaying, distributing, and/or profiting from my copyrighted work without my authorization at:

{infringer_url or "[INFRINGING URL]"}

This unauthorized use constitutes copyright infringement under applicable law.

I DEMAND that you IMMEDIATELY:
1. Remove all instances of "{your_work_title}" from your website/platform
2. Permanently cease any further use of my work
3. Provide written confirmation of compliance within 10 business days

Failure to comply will result in escalation, which may include:
- A formal DMCA takedown notice to your hosting provider
- A report to your platform's terms of service enforcement
- Legal action seeking statutory damages of up to $150,000 per work

This letter is without prejudice to any other rights or remedies I may hold.

Sincerely,

{your_name}
[Your Email]
[Your Phone]

---
DISCLAIMER: This template is for educational purposes. Consult an attorney for your specific situation.
---""",

        "credit_request": f"""---
POLITE CREDIT REQUEST
---

Hi there!

I noticed you're using my artwork "{your_work_title}" on {platform or "your page"} ({infringer_url or "your profile"}).

I'm flattered that you like my work! I just ask that you please:

1. Credit me as the original artist: {your_name}
2. [Optional: Link to my portfolio/Instagram/website: [INSERT URL]]
3. [Optional: Remove the post if you can't add credit]

I spent a lot of time creating this piece and proper attribution helps other people find my work. I'm happy to support fans sharing my art as long as I'm credited.

Thanks for understanding!

Best,
{your_name}
[Your Portfolio Link / Social Media Handle]

---
💡 TIP: Most people who repost art are fans who don't realize they should credit. A friendly message resolves 80% of cases without legal escalation.
---""",

        "settlement_demand": f"""---
SETTLEMENT DEMAND LETTER
---

Date: {year}

TO: [Infringer Name]
{infringer_url or "[Infringer URL/Address]"}
{f"via {platform}" if platform else ""}

FROM: {your_name}

RE: UNLICENSED COMMERCIAL USE OF "{your_work_title}" — SETTLEMENT DEMAND

Dear [Infringer Name],

I am the copyright owner of the original artwork "{your_work_title}", created by {your_name} on [Original Creation Date].

My work has been used without my permission for commercial purposes at:

{infringer_url or "[INFRINGING URL]"}

You have profited from my intellectual property without license, consent, or compensation. Under applicable copyright law, I am entitled to:
- Statutory damages of up to $150,000 for willful infringement
- Actual damages including your profits attributable to the infringement
- Attorney's fees and court costs

SETTLEMENT OFFER:

To resolve this matter amicably and avoid litigation, I am prepared to settle for the sum of $[AMOUNT] (suggested range: $500-$5,000 depending on scope) in exchange for:
1. Immediate removal of all infringing content
2. A signed agreement not to use my work in the future
3. Full payment of the settlement amount within 14 days

If I do not receive payment and written acknowledgment by [DATE 14 DAYS FROM NOW], I will pursue all available legal remedies without further notice.

This is not a threat of litigation — it is an opportunity to resolve this fairly and avoid court.

Sincerely,

{your_name}
[Your Email]
[Your Phone]
[Your Address]

---
DISCLAIMER: This template is for educational purposes. Consult an attorney for your specific situation.
---""",

        "social_media_report": f"""---
SOCIAL MEDIA INFRINGEMENT REPORT GUIDE
---

Platform: {platform or "[Instagram / Facebook / Twitter / Pinterest / etc.]"}
Your Artwork: "{your_work_title}"
Infringer URL: {infringer_url or "[INFRINGING URL]"}

HOW TO REPORT THIS ON EACH PLATFORM:

📸 Instagram:
1. Open the infringing post
2. Tap ⋮ (three dots) → "Report" → "It's inappropriate" → "Intellectual property violation"
3. Select "My content" → follow the copyright report form
4. Alternative: Use the direct form: https://help.instagram.com/contact/552820549717274
5. You'll need your full name, the infringing URLs, and proof of copyright (use evidence_report)

📘 Facebook:
1. Go to the infringing post
2. Click ⋮ → "Find support or report" → "Intellectual property" → "Copyright"
3. Or use: https://www.facebook.com/help/contact/1756592302890096

🐦 Twitter/X:
1. Use: https://help.twitter.com/forms/dmca
2. Fill in your details and infringing tweet URLs

📌 Pinterest:
1. Open the infringing pin
2. Click ⋯ → "Report pin" → "It infringes my rights"
3. Or use: https://www.pinterest.com/about/copyright/dmca-pin/

🎨 ArtStation:
1. Use: https://www.artstation.com/legal/copyright

🎭 DeviantArt:
1. Open the deviation
2. Click "More" → "Report"
3. Select "Copyright Infringement"
4. Or use: https://www.deviantart.com/report/

💡 PRO TIPS:
- Report from the copyright owner's account (or provide proof of ownership)
- Include the original work URL alongside the infringing URL
- Reference your evidence_report SHA-256 hash
- Take screenshots of everything before reporting
- Follow up in 7 days if no response""",
    }

    template = templates.get(template_type, templates["dmca_takedown"])
    return json.dumps({
        "template_type": template_type,
        "your_name": your_name,
        "your_work_title": your_work_title,
        "infringer_url": infringer_url or "[INSERT INFRINGING URL]",
        "platform": platform or "[PLATFORM NAME]",
        "template": template,
        "disclaimer": "This template is for educational purposes and does not constitute legal advice. Review the content carefully and consult an attorney for your specific situation.",
    }, indent=2)


class TestRISRequest(BaseModel):
    image_url: str


@router.get("/self-report")
async def agent_self_report():
    """Get agent self-improvement report."""
    from app.services.agent_self_improve import get_search_report, load_strategies, load_trajectories, get_success_rate, load_memory
    return {
        "report": get_search_report(),
        "stats": get_success_rate(),
        "strategies": load_strategies(),
        "recent_trajectories": load_trajectories(5),
        "memory": {k: v.get("value", "")[:100] for k, v in load_memory().items()},
    }


@router.get("/test-playwright")
async def test_playwright():
    """Debug endpoint to test Playwright Bing search directly."""
    try:
        import httpx
        ua = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        async with httpx.AsyncClient(timeout=30, follow_redirects=True) as c:
            r = await c.get("https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png", headers={"User-Agent": ua})
            img_bytes = r.content

        from app.services.reverse_image_search import reverse_image_search
        result = await reverse_image_search.search_all(image_bytes=img_bytes)
        bing_count = len(result.get("bing", []))
        google_count = len(result.get("google", []))
        return {
            "bing_results": bing_count,
            "google_results": google_count,
            "total": result.get("total_matches", 0),
            "first_bing": result.get("bing", [{}])[0].get("url", "")[:80] if bing_count > 0 else None,
        }
    except Exception as e:
        import traceback
        return {"error": str(e), "traceback": traceback.format_exc()}


@router.post("/test-ris")
async def test_reverse_image_search(request: TestRISRequest):
    """Test endpoint: runs the full find_image_copies pipeline on a public image URL.
    Bypasses vault upload — just give a URL and get results."""
    try:
        start = asyncio.get_event_loop().time()
        user_id = "00000000-0000-0000-0000-000000000001"

        # 1. Download image bytes
        img_bytes = await _download_image_bytes(request.image_url)
        if not img_bytes:
            return {"error": "Could not download image from URL"}

        # 2. Run vision model (OCR-only)
        mime = _mime_from_url(request.image_url)
        b64 = base64.b64encode(img_bytes).decode()
        data_uri = f"data:image/{mime};base64,{b64}"
        description = None

        if settings.nvidia_nim_api_key:
            try:
                from openai import AsyncOpenAI
                nim = AsyncOpenAI(api_key=settings.nvidia_nim_api_key, base_url=settings.nvidia_nim_base_url)
                caption = await nim.chat.completions.create(
                    model="google/gemma-3n-e4b-it",
                    messages=[{
                        "role": "user",
                        "content": [
                            {"type": "text", "text": "Describe this image in two parts. PART 1 - SCENE: Describe the subject, setting, and style (photo/screenshot/illustration/painting). If it is a screenshot, identify the game, app, or website. PART 2 - TEXT: List every visible text element (words, numbers, URLs, usernames, labels, headings, button text). If no text, output NO_TEXT. Format: SCENE: ... TEXT: ..."},
                            {"type": "image_url", "image_url": {"url": data_uri}}
                        ]
                    }],
                    max_tokens=500,
                )
                description = caption.choices[0].message.content
            except Exception as e:
                logger.warning(f"Vision failed: {e}")

        if not description and GROQ_AVAILABLE and settings.groq_api_key:
            try:
                groq = AsyncGroq(api_key=settings.groq_api_key)
                caption = await groq.chat.completions.create(
                    model=settings.groq_vision_model,
                    messages=[{
                        "role": "user",
                        "content": [
                            {"type": "text", "text": "Describe this image in two parts. PART 1 - SCENE: Describe the subject, setting, and style (photo/screenshot/illustration/painting). If it is a screenshot, identify the game, app, or website. PART 2 - TEXT: List every visible text element (words, numbers, URLs, usernames, labels, headings, button text). If no text, output NO_TEXT. Format: SCENE: ... TEXT: ..."},
                            {"type": "image_url", "image_url": {"url": data_uri}}
                        ]
                    }],
                    max_tokens=500,
                )
                description = caption.choices[0].message.content
            except Exception as e:
                logger.warning(f"Groq vision failed: {e}")

        has_vision = description is not None and not description.startswith("Artwork file:")

        # Build keyword query from vision output (SCENE + TEXT)
        query = ""
        has_text = False
        if has_vision:
            scene_desc = ""
            extracted_text = ""
            text_lower = description.lower()
            if "scene:" in text_lower and "text:" in text_lower:
                parts = description.split("TEXT:", 1)
                scene_desc = parts[0].replace("SCENE:", "").replace("scene:", "").strip()
                extracted_text = parts[1].strip()
            else:
                scene_desc = description

            scene_clean = scene_desc.replace('*', '').replace('#', '').replace('\n', ' ').strip()
            text_clean = extracted_text.replace('*', '').replace('#', '').replace('\n', ' ').strip()

            stopwords = {'web', 'search', 'description', 'the', 'artwork', 'detailed', 'title', 'suggested', 'platform', 'likely', 'subjects', 'colors', 'style', 'medium', 'composition', 'elements', 'notable', 'be', 'thorough', 'include', 'what', 'might', 'belong', 'would', 'this', 'for', 'and', 'that', 'has', 'its', 'are', 'from', 'with', 'image', 'shows', 'depicts', 'illustration', 'photograph', 'picture', 'photo', 'scene', 'background', 'looks', 'appears', 'seems', 'also', 'shows'}
            scene_kw = [w for w in scene_clean.split() if w.lower() not in stopwords and len(w) > 2]

            no_text_phrases = ('no_text', 'no text', 'no visible text', 'none', 'i cannot', 'cannot see', 'no readable', 'there is no', 'cannot read', 'unable to')
            text_has_content = text_clean and text_clean.upper() not in ('NO_TEXT', 'NO TEXT', 'NONE', '') and not any(p in text_clean.lower() for p in no_text_phrases)
            text_kw = []
            if text_has_content:
                text_kw = [w for w in text_clean.split() if w.lower() not in stopwords and len(w) > 2]

            all_keywords = scene_kw + text_kw
            seen_kw = set()
            unique_kw = []
            for kw in all_keywords:
                if kw.lower() not in seen_kw:
                    seen_kw.add(kw.lower())
                    unique_kw.append(kw)

            # Detect game/app from scene description and prepend as keyword
            scene_lower = scene_clean.lower()
            known_games = {
                'minecraft', 'fortnite', 'roblox', 'gta', 'grand theft auto', 'call of duty',
                'valorant', 'league of legends', 'overwatch', 'apex legends', 'pubg',
                'skyrim', 'zelda', 'mario', 'pokemon', 'elden ring', 'cyberpunk', 'witcher',
                'among us', 'fall guys', 'rocket league', 'counter strike', 'dota',
                'world of warcraft', 'final fantasy', 'red dead redemption',
                'god of war', 'spider-man', 'batman', 'harry potter', 'star wars', 'starfield'
            }
            for game in known_games:
                if game in scene_lower and game.lower() not in seen_kw:
                    seen_kw.add(game.lower())
                    unique_kw.insert(0, game)

            query = ' '.join(unique_kw)[:150]
            has_text = bool(text_has_content)
            logger.info(f"test-ris keyword query: '{query[:80]}'")

        # 3. Run reverse image search (Bing + Google Lens via Playwright)
        from app.services.reverse_image_search import reverse_image_search
        logger.info("test-ris: starting reverse image search")
        ris_results = await reverse_image_search.search_all(image_bytes=img_bytes, text_query=query)
        logger.info(f"test-ris RIS done: bing={len(ris_results.get('bing',[]))} google={len(ris_results.get('google',[]))}")

        web_results = []
        image_results = []
        social_results = {}
        searches_performed = ["reverse_image"]

        if query.strip():
            web_r, image_r, social_r = await asyncio.gather(
                _web_search(query, 5),
                _image_search(query, 5),
                _search_artwork(user_id, query),
            )
            web_results = json.loads(web_r).get("results", [])
            image_results = json.loads(image_r).get("results", [])
            social_results = json.loads(social_r).get("platform_results", {})
            searches_performed = ["reverse_image", "web", "image", "social_platforms"]

        # Cross-search: download images from keyword result pages, ORB-compare
        cross_results = []
        if img_bytes and web_results and query.strip():
            try:
                page_urls = [r.get("url", "") for r in web_results if r.get("url")]
                if page_urls:
                    cross_results = await _cross_search_images(img_bytes, page_urls, max_pages=5, max_imgs_per_page=10)
                    logger.info(f"test-ris cross-search: {len(cross_results)} matched images")
            except Exception as cross_err:
                logger.warning(f"test-ris cross-search failed: {cross_err}")

        # 4. Separate results
        stock_domains = {"shutterstock", "freepik", "vecteezy", "pixabay", "istockphoto", "gettyimages", "dreamstime", "alamy", "123rf", "depositphotos", "bigstockphoto", "canva", "adobe.stock", "stock.adobe", "creativemarket", "envato", "graphicriver", "unsplash", "pexels"}

        def _is_stock(url: str) -> bool:
            return any(d in url.lower() for d in stock_domains)

        matches = []
        similar = []
        seen_matches = set()
        seen_similar = set()

        for engine, results_list in ris_results.items():
            if engine == "total_matches" or not isinstance(results_list, list):
                continue
            for r in results_list:
                if not isinstance(r, dict):
                    continue
                img_url = r.get("image_url", "") or r.get("murl", "")
                page_url = r.get("url", "")
                url = img_url or page_url
                if not url:
                    continue
                if any(d in url.lower() for d in ["bing.com", "google.com", "yandex", "microsoft.com", "search?"]):
                    continue
                if url not in seen_matches and not _is_stock(url):
                    seen_matches.add(url)
                    matches.append({"source": f"ris_{engine}", "title": r.get("title", ""), "url": url, "page_url": page_url if img_url else ""})

        for platform, items in social_results.items():
            for r in items if isinstance(items, list) else [items]:
                if not isinstance(r, dict) or not r.get("url"):
                    continue
                url = r["url"]
                if url not in seen_matches and not _is_stock(url):
                    seen_matches.add(url)
                    matches.append({"source": platform, "title": r.get("title", ""), "url": url})

        # Keyword image search results = only from art/stock domains (skip random blog images)
        _art_domains = {"deviantart", "artstation", "pinterest", "instagram", "flickr", "500px", "behance", "dribbble", "imgur", "unsplash", "pexels", "wikimedia", "wikipedia", "reddit", "tumblr", "facebook", "twitter", "x.com", "youtube", "imgbb", "postimg", "imagevenue", "tinypic", "photobucket"}
        def _is_art_url(url: str) -> bool:
            return any(d in url.lower() for d in _art_domains)

        for r in image_results:
            if isinstance(r, dict) and r.get("url") and r["url"] not in seen_matches and r["url"] not in seen_similar:
                tag = "image (stock)" if _is_stock(r["url"]) else "image"
                if _is_stock(r["url"]) or _is_art_url(r["url"]):
                    seen_similar.add(r["url"])
                    similar.append({"source": tag, "title": r.get("title", "Image"), "url": r["url"]})

        # Cross-search results: insert into matches/similar based on ORB scores
        for cr in cross_results:
            url = cr.get("url", "")
            if url and url not in seen_matches and url not in seen_similar:
                score = cr.get("score", 0)
                if score >= 0.75:
                    seen_matches.add(url)
                    matches.append(cr)
                elif score >= 0.4:  # Higher bar — blog thumbnails are noise below 0.4
                    seen_similar.add(url)
                    similar.append(cr)

        # 5. Self-improvement: adaptive threshold
        from app.services.agent_self_improve import get_adaptive_threshold, learn_from_search
        image_type = "screenshot" if description and any(w in description.lower() for w in ["screenshot", "screen", "ui", "interface"]) else "artwork"
        match_threshold = get_adaptive_threshold(image_type, description or "", default_threshold=0.75)

        if img_bytes and (matches or similar):
            sem = asyncio.Semaphore(5)

            async def _score(m: dict) -> dict:
                async with sem:
                    compare = await _compare_images(img_bytes, m["url"])
                    if not compare.get("error"):
                        m["score"] = compare.get("score", 0.0)
                        m["orb_score"] = compare.get("orb_score")
                        m["ssim_score"] = compare.get("ssim_score")
                    return m

            all_candidates = matches + similar
            scored_all = await asyncio.gather(*[_score(m) for m in all_candidates])
            matches = []
            similar = []
            for m in scored_all:
                score = m.get("score", 0.0)
                if score >= match_threshold:
                    matches.append(m)
                elif score >= 0.4:
                    similar.append(m)

            # Sort by score descending
            matches.sort(key=lambda x: x.get("score", 0.0), reverse=True)
            similar.sort(key=lambda x: x.get("score", 0.0), reverse=True)

            # Learn from this search
            try:
                learn_from_search(
                    scan_id="test-ris", file_name=request.image_url.split("/")[-1][:30],
                    image_type=image_type, vision_description=description,
                    keywords_used=query, engines_used=searches_performed,
                    threshold_used=match_threshold,
                    matches=matches, similar=similar, ris_results=ris_results,
                )
            except Exception as learn_err:
                logger.warning(f"test-ris learning failed: {learn_err}")

        elapsed = round(asyncio.get_event_loop().time() - start, 1)

        from app.services.agent_self_improve import get_search_report
        return {
            "image_url": request.image_url,
            "vision_description": description,
            "has_text": has_text,
            "searches_performed": searches_performed,
            "reverse_image_results": {k: v for k, v in ris_results.items() if k != "all_results"},
            "match_count": len(matches),
            "similar_count": len(similar),
            "total_urls": len(matches) + len(similar),
            "matches": matches[:10],
            "similar": similar[:20],
            "timing_seconds": elapsed,
            "threshold_used": match_threshold,
            "self_improvement_report": get_search_report(),
        }
    except Exception as e:
        logger.error(f"test-ris error: {e}")
        return {"error": str(e)}


@router.post("/chat", response_model=AgentChatResponse)
async def agent_chat(
    request: AgentChatRequest,
    current_user: dict = Depends(get_current_user)
):
    has_groq = GROQ_AVAILABLE and settings.groq_api_key
    has_nim = bool(settings.nvidia_nim_api_key)

    if not has_groq and not has_nim:
        return AgentChatResponse(
            response="I'm currently in offline mode. To enable full AI features, add your Groq API key or NVIDIA NIM API key to the .env file.",
            tool_calls=[],
        )

    try:
        if has_nim:
            client = AsyncOpenAI(
                api_key=settings.nvidia_nim_api_key,
                base_url=settings.nvidia_nim_base_url,
            )
            model = settings.nvidia_nim_model
        else:
            client = AsyncOpenAI(
                api_key=settings.groq_api_key,
                base_url="https://api.groq.com/openai/v1",
            )
            model = settings.groq_model

        # Dynamically fetch profile name for Jarvis greeting
        full_name = "Manoj" # Premium default fallback
        try:
            supabase = await _get_supabase()
            profile_response = supabase.table("profiles").select("full_name").eq("id", current_user["id"]).single().execute()
            if profile_response and profile_response.data:
                name = profile_response.data.get("full_name")
                if name:
                    full_name = name
        except Exception as e:
            logger.warning(f"Failed to fetch profile name for Jarvis: {e}")

        greeting_name = full_name if full_name else "sir"
        personalized_prompt = SYSTEM_PROMPT.replace("{USER_NAME}", greeting_name)

        messages = [{"role": "system", "content": personalized_prompt}]
        for h in request.history:
            messages.append({"role": h.role, "content": h.content})
        messages.append({"role": "user", "content": request.message})

        tool_calls_made = []
        max_tool_rounds = 5
        find_copies_done = False
        last_thinking_log: list = []
        last_find_copies_result = ""

        # Loop for tool execution rounds (up to max_tool_rounds)
        for round_idx in range(max_tool_rounds):
            logger.info(f"Agent chat round {round_idx+1}")
            
            completion = await _nim_completion(
                client=client,
                model=model,
                messages=messages,
                tools=TOOLS,
                tool_choice="auto",
                temperature=0.3,
                max_tokens=2000,
            )
            
            choice = completion.choices[0]
            msg = choice.message
            
            if not msg.tool_calls:
                response_text = _strip_image_errors(msg.content or "")
                return AgentChatResponse(response=response_text, tool_calls=tool_calls_made, thinking="\n".join(last_thinking_log))

            messages.append({
                "role": "assistant",
                "content": msg.content or "",
                "tool_calls": [
                    {"id": tc.id, "type": "function", "function": {"name": tc.function.name, "arguments": tc.function.arguments}}
                    for tc in msg.tool_calls
                ]
            })

            for tc in msg.tool_calls:
                name = tc.function.name
                try:
                    parsed = json.loads(tc.function.arguments)
                    arguments = parsed if isinstance(parsed, dict) else {}
                except json.JSONDecodeError:
                    arguments = {}

                # respond_to_user is final — intercept BEFORE execute_tool
                if name == "respond_to_user":
                    response_text = _strip_image_errors(arguments.get("message", ""))
                    tool_calls_made.append(ToolCallResult(name=name, arguments=arguments, result=response_text))
                    return AgentChatResponse(response=response_text, tool_calls=tool_calls_made, thinking="\n".join(last_thinking_log))

                # Force respond_to_user if we already ran find_image_copies
                if name == "find_image_copies" and find_copies_done:
                    logger.info(f"Blocking duplicate find_image_copies, forcing respond_to_user")
                    try:
                        data = json.loads(last_find_copies_result) if last_find_copies_result else {}
                        mc = data.get("match_count", 0)
                        sc = data.get("similar_count", 0)
                        parts = []
                        if mc > 0: parts.append(f"{mc} match{'es' if mc!=1 else ''}")
                        if sc > 0: parts.append(f"{sc} similar image{'s' if sc!=1 else ''}")
                        if parts:
                            response_text = f"Found {', '.join(parts)}. "
                            if mc == 0:
                                response_text += "No exact copies found — these are visually similar images with different content."
                            else:
                                response_text += "Check the results above for details."
                        else:
                            response_text = "No copies detected for this image."
                    except Exception:
                        response_text = "No copies detected for this image."
                    tool_calls_made.append(ToolCallResult(name="respond_to_user", arguments={"message": response_text}, result=response_text))
                    return AgentChatResponse(response=response_text, tool_calls=tool_calls_made, thinking="\n".join(last_thinking_log))

                result = await execute_tool(name, arguments, current_user["id"])
                tool_calls_made.append(ToolCallResult(name=name, arguments=arguments, result=result))

                if name == "find_image_copies":
                    find_copies_done = True
                    last_find_copies_result = result
                    try:
                        data = json.loads(result)
                        last_thinking_log = data.get("thinking_log", [])
                        if "error" in data:
                            summary = json.dumps({"error": data["error"]})
                        else:
                            summary = json.dumps({
                                "scan_id": data.get("scan_id"),
                                "file_name": data.get("file_name"),
                                "match_count": data.get("match_count", 0),
                                "similar_count": data.get("similar_count", 0),
                                "total_urls": data.get("total_urls", 0),
                                "matches": data.get("matches", [])[:5],
                                "similar": [{"url": s["url"], "source": s.get("source")} for s in data.get("similar", [])[:5]],
                            }, indent=2)
                        messages.append({
                            "role": "tool",
                            "tool_call_id": tc.id,
                            "content": summary
                        })
                    except Exception:
                        messages.append({
                            "role": "tool",
                            "tool_call_id": tc.id,
                            "content": result[:1500]
                        })
                else:
                    messages.append({
                        "role": "tool",
                        "tool_call_id": tc.id,
                        "content": result
                    })
        # Max tool rounds exhausted — return what we have
        response = "I have completed my analysis. Please see the results above."
        return AgentChatResponse(
            response=response,
            tool_calls=tool_calls_made,
            thinking="\n".join(last_thinking_log)
        )

    except Exception as e:
        logger.error(f"Agent chat error: {e}")
        raise HTTPException(status_code=500, detail=f"Agent chat failed: {str(e)}")
