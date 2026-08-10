import logging
import httpx
from typing import Optional, List, Dict, Any
from app.config import settings

logger = logging.getLogger(__name__)


class LocalBrainAdapter:
    def __init__(self):
        self.base_url = settings.local_brain_url.rstrip("/")
        self.model = settings.local_brain_model
        self.enabled = settings.local_brain_enabled
        self._client: Optional[httpx.AsyncClient] = None

    @property
    def client(self) -> httpx.AsyncClient:
        if self._client is None or self._client.is_closed:
            self._client = httpx.AsyncClient(
                base_url=self.base_url,
                timeout=httpx.Timeout(120.0, connect=10.0),
            )
        return self._client

    async def health_check(self) -> Dict[str, Any]:
        if not self.enabled:
            return {"status": "disabled", "reason": "local_brain_enabled is False"}
        try:
            resp = await self.client.get("/health")
            if resp.status_code == 200:
                data = resp.json()
                return {"status": "healthy", "model": data.get("model", self.model)}
            return {"status": "unhealthy", "http_status": resp.status_code}
        except httpx.ConnectError:
            return {"status": "unreachable", "url": self.base_url}
        except Exception as e:
            logger.error(f"Local brain health check failed: {e}")
            return {"status": "error", "detail": str(e)}

    async def chat_completion(
        self,
        messages: List[Dict[str, str]],
        tools: Optional[List[Any]] = None,
        temperature: float = 0.3,
        max_tokens: int = 2048,
    ) -> "ChatCompletionResult":
        payload = {
            "model": self.model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
            "stream": False,
        }
        if tools:
            payload["tools"] = tools
            payload["tool_choice"] = "auto"

        try:
            resp = await self.client.post("/chat/completions", json=payload)
            resp.raise_for_status()
            data = resp.json()
            choice = data["choices"][0]["message"]
            return ChatCompletionResult(
                content=choice.get("content", ""),
                tool_calls=choice.get("tool_calls", []),
                finish_reason=data["choices"][0].get("finish_reason", "stop"),
                usage=data.get("usage", {}),
            )
        except httpx.HTTPStatusError as e:
            logger.error(f"Local brain HTTP error: {e.response.status_code} {e.response.text}")
            raise
        except Exception as e:
            logger.error(f"Local brain chat completion failed: {e}")
            raise

    async def close(self):
        if self._client and not self._client.is_closed:
            await self._client.aclose()
            self._client = None


class ChatCompletionResult:
    def __init__(self, content: str, tool_calls: list, finish_reason: str, usage: dict):
        self.content = content
        self.tool_calls = tool_calls
        self.finish_reason = finish_reason
        self.usage = usage


local_brain = LocalBrainAdapter()