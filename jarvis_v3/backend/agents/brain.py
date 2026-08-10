"""Brain layer -- calls NVIDIA NIM API with two-model strategy."""
import requests
import json
import time
import sys
import os
import threading
from datetime import datetime

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from config import NVIDIA_API_KEY, NVIDIA_MODEL, NVIDIA_FAST_MODEL
from agents.tools import Tools


PERSONALITY_PROMPT = """You are JARVIS, a helpful AI assistant. You have memory, tools, and voice.
You reply concisely. Use tools when needed. Stay in character as a calm, capable assistant."""


class Brain:
    def __init__(self):
        self.api_key = NVIDIA_API_KEY
        self.model = NVIDIA_MODEL
        self.fast_model = NVIDIA_FAST_MODEL
        self.tools = Tools()
        self._context = []
        self._personality_cached = False

    def _local_response(self, text):
        """Local fallback responses when API key is missing or API fails."""
        text_lower = text.lower().strip()

        if "time" in text_lower:
            return {"content": datetime.now().strftime("%I:%M %p")}
        if "date" in text_lower:
            return {"content": datetime.now().strftime("%A, %B %d, %Y")}
        if "hello" in text_lower or "hi" in text_lower:
            return {"content": "Hello! How can I help you?"}
        if "name" in text_lower and "your" in text_lower:
            return {"content": "I am JARVIS, your AI assistant."}
        if "how are" in text_lower:
            return {"content": "I am functioning perfectly. How are you?"}
        if "weather" in text_lower:
            return {"content": "I can check the weather for you. What city?"}
        if "bye" in text_lower or "goodbye" in text_lower:
            return {"content": "Goodbye! I'll be here when you need me."}
        if "thank" in text_lower:
            return {"content": "You're welcome! Anything else I can help with?"}
        if "?" in text_lower:
            return {"content": "That's a great question. I'd need to connect to the internet for that."}
        return {"content": "I'm ready to help. Try asking me about the time, date, or say hello!"}

    def _is_instant(self, text):
        tl = text.lower().strip()
        if tl in ("hello", "hi", "hey", "hey jarvis", "hi jarvis", "hello jarvis"):
            return True
        if any(w in tl for w in ("time is it", "what time", "current time")):
            return True
        if any(w in tl for w in ("date is it", "what date", "today's date", "todays date")):
            return True
        return False

    def think(self, text, tools_enabled=True):
        if not self.api_key:
            print("[BRAIN] No API key - using local response")
            self._context.append({"role": "user", "content": text})
            response = self._local_response(text)
            self._context.append({"role": "assistant", "content": response["content"]})
            return response

        if self._is_instant(text):
            print("[BRAIN] Instant intent - local response")
            self._context.append({"role": "user", "content": text})
            response = self._local_response(text)
            self._context.append({"role": "assistant", "content": response["content"]})
            return response

        messages = self._context + [
            {"role": "system", "content": PERSONALITY_PROMPT},
            {"role": "user", "content": text},
        ]

        try:
            url = "https://integrate.api.nvidia.com/v1/chat/completions"
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
                "Accept": "application/json",
            }

            attempts = 0
            max_attempts = 5
            while attempts < max_attempts:
                attempts += 1
                payload = {
                    "model": self.model,
                    "messages": messages,
                    "tools": self.tools.SCHEMA if tools_enabled else [],
                    "tool_choice": "auto" if tools_enabled else "none",
                    "max_tokens": 1000,
                    "temperature": 0.7,
                }
                try:
                    r = requests.post(url, headers=headers, json=payload, timeout=20)
                except Exception as e:
                    print(f"[BRAIN] Attempt {attempts}/{max_attempts} timeout: {e}")
                    continue
                if r.status_code != 200:
                    print(f"[BRAIN] API error: {r.status_code} - {r.text[:200]}")
                    return self._local_response(text)
                data = r.json()
                msg = data["choices"][0]["message"]
                tool_calls = msg.get("tool_calls") or []
                if not tool_calls:
                    return msg
                messages.append({
                    "role": "assistant",
                    "content": msg.get("content"),
                    "tool_calls": tool_calls,
                })
                for tc in tool_calls:
                    fn = tc["function"]
                    args = json.loads(fn.get("arguments") or "{}")
                    result = self.tools.execute(fn["name"], args)
                    print(f"[BRAIN] tool {fn['name']}({args}) -> {result}")
                    messages.append({
                        "role": "tool",
                        "tool_call_id": tc.get("id"),
                        "content": str(result),
                    })
            return {"content": "I couldn't complete that."}
        except Exception as e:
            print(f"[BRAIN] Error: {e}")
            return self._local_response(text)

    def think_fast(self, text):
        if not self.api_key:
            return self._local_response(text)["content"]
        messages = [
            {"role": "system", "content": "You are a helpful assistant. Reply briefly."},
            {"role": "user", "content": text},
        ]
        try:
            url = "https://integrate.api.nvidia.com/v1/chat/completions"
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
                "Accept": "application/json",
            }
            payload = {
                "model": self.fast_model,
                "messages": messages,
                "max_tokens": 500,
                "temperature": 0.7,
            }
            r = requests.post(url, headers=headers, json=payload, timeout=15)
            if r.status_code == 200:
                return r.json()["choices"][0]["message"]["content"].strip()
            return "I couldn't process that."
        except Exception as e:
            print(f"[BRAIN] Fast error: {e}")
            return "I couldn't process that."

    def update_context(self, role, content):
        self._context.append({"role": role, "content": content})
        if len(self._context) > 20:
            self._context = self._context[-15:]
