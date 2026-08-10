"""Orchestrator -- manages the conversation turn loop."""
import sys
import os
import re
import time
import json
import threading

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from config import WAKE_WORD, MAX_AUDIO_DURATION
from agents.brain import Brain
from agents.tools import Tools


class Orchestrator:
    def __init__(self, stt=None, tts=None, brain=None, tools=None):
        self.stt = stt
        self.tts = tts
        self.brain = brain or Brain()
        self.tools = tools or Tools()
        self._callbacks = {"state_update": [], "response": []}
        self._current_response = []
        self._last_cmd_time = 0

    def on(self, event, callback):
        if event not in self._callbacks:
            self._callbacks[event] = []
        self._callbacks[event].append(callback)

    def _emit(self, event, data=None):
        for cb in self._callbacks.get(event, []):
            try:
                if data is not None:
                    cb(data)
                else:
                    cb()
            except Exception as e:
                print(f"[ORCH] Callback error: {e}")

    def process_text(self, text, no_tts=False):
        text = text.strip().lower()
        if not text:
            return

        if WAKE_WORD in text:
            text = re.sub(rf"\b{WAKE_WORD}\b", "", text, flags=re.IGNORECASE).strip()

        if not text:
            return

        self._emit("state_update", {"state": "thinking"})

        result = self.brain.think(text)
        reply = result.get("content", "") if isinstance(result, dict) else str(result)

        tool_calls = result.get("tool_calls", []) if isinstance(result, dict) else []
        if tool_calls:
            for call in tool_calls:
                name = call.get("function", {}).get("name", "")
                params = call.get("function", {}).get("arguments", {})
                if isinstance(params, str):
                    try:
                        params = json.loads(params)
                    except:
                        params = {}
                res = self.tools.execute(name, params)
                self.brain.update_context("tool", res)
                self._emit("state_update", {"state": "tool_call", "tool": name, "result": res})

        self._emit("response", reply)
        if self.tts and reply and not no_tts:
            threading.Thread(target=self.tts.speak, args=(reply,), daemon=True).start()
        self._emit("state_update", {"state": "listening"})
        self.brain.update_context("assistant", reply)

    def process(self, audio_data):
        if self.stt:
            text, lang, conf = self.stt.transcribe(audio_data)
            if text and len(text) > 2:
                self.process_text(text)
