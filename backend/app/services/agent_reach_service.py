import logging
from urllib.parse import urlparse

logger = logging.getLogger(__name__)

_web_channel = None


def _get_web_channel():
    global _web_channel
    if _web_channel is None:
        try:
            from agent_reach.channels.web import WebChannel
            _web_channel = WebChannel()
        except ImportError:
            logger.warning("Agent-Reach not installed; web channel unavailable")
            return None
    return _web_channel


async def fetch_webpage(url: str, timeout: int = 30) -> str:
    """Fetch a webpage as Markdown using Agent-Reach's Jina Reader channel.

    Works with zero config — no API keys needed.
    Supports any public URL.
    """
    ch = _get_web_channel()
    if ch is None:
        return "Agent-Reach web channel not available."

    parsed = urlparse(url)
    if not parsed.scheme or not parsed.netloc:
        return f"Invalid URL: {url}"

    blocked = ["localhost", "127.0.0.1", "0.0.0.0", "::1", "[::1]"]
    if any(b in parsed.netloc.lower() for b in blocked):
        return "Cannot fetch from private or local addresses."

    allowed_schemes = {"http", "https"}
    if parsed.scheme not in allowed_schemes:
        return f"Unsupported URL scheme: {parsed.scheme}"

    try:
        content = ch.read(url)
        if isinstance(content, bytes):
            content = content.decode("utf-8", errors="replace")
        max_len = 15000
        if len(content) > max_len:
            content = content[:max_len] + f"\n\n[... truncated to {max_len} chars]"
        return content
    except Exception as e:
        logger.warning(f"WebChannel read failed for {url}: {e}")
        return f"Failed to fetch {url}: {str(e)}"


def get_doctor_status() -> dict:
    """Return Agent-Reach doctor status for all available channels."""
    try:
        from agent_reach import AgentReach
        from agent_reach.config import Config
        config = Config()
        ar = AgentReach(config=config)
        results = ar.doctor()
        summary = {}
        for name, info in results.items():
            summary[name] = {
                "status": info.get("status", "unknown"),
                "tier": info.get("tier", "N/A"),
            }
        return summary
    except ImportError:
        return {"error": "Agent-Reach not installed"}
    except Exception as e:
        return {"error": str(e)}
