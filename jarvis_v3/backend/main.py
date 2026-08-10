"""JARVIS v3 -- FastAPI backend with WebSocket + non-blocking audio pipeline."""
import asyncio
import json
import os
import sys
import time
import threading
import queue

import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from config import (
    SAMPLE_RATE,
    FRAME_SIZE,
    VOSK_MODEL_PATH,
    MIN_AUDIO_DURATION,
    MAX_AUDIO_DURATION,
    WAKE_WORD,
    TTS_VOICE,
    TTS_RATE,
    FRONTEND_DIR,
)
from audio.vad import VoiceDetector
from audio.stt import SpeechToText
from audio.tts import TextToSpeech
from audio.mic_manager import MicManager
from agents.orchestrator import Orchestrator
import jarvis_state
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="JARVIS v3")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

vad = VoiceDetector()
stt = SpeechToText()
tts = TextToSpeech()
mic = MicManager()
orch = Orchestrator(stt=stt, tts=tts)

jarvis_state.current_state = "standby"

orch.on("state_update", lambda data: jarvis_state.broadcast("state_update", data))
orch.on("response", lambda text: jarvis_state.broadcast("response", text))


@app.websocket("/ws")
async def websocket_endpoint(ws: WebSocket):
    await ws.accept()
    jarvis_state.connected_clients.add(ws)
    print(f"[WS] Client connected ({len(jarvis_state.connected_clients)} total)")

    try:
        while True:
            await ws.receive_text()
    except WebSocketDisconnect:
        pass
    finally:
        jarvis_state.connected_clients.discard(ws)
        print(f"[WS] Client disconnected ({len(jarvis_state.connected_clients)} total)")


def process_command(cmd):
    cmd_type, cmd_data = cmd
    if cmd_type == "text":
        no_tts = False
        if isinstance(cmd_data, dict):
            no_tts = cmd_data.get("no_tts", False)
            cmd_data = cmd_data.get("text", "")
        orch.process_text(cmd_data, no_tts=no_tts)
    elif cmd_type == "audio":
        text, lang, conf = stt.transcribe(cmd_data)
        if text and len(text) > 2:
            orch.process_text(text)


def command_worker():
    jarvis_state._await_cmd_until = time.time()
    print("[WORKER] Command worker started")
    while True:
        try:
            cmd = jarvis_state.command_queue.get(timeout=1.0)
            if cmd is None:
                break
            with jarvis_state.processing_lock:
                jarvis_state.is_processing = True
                process_command(cmd)
                jarvis_state.is_processing = False
            jarvis_state._await_cmd_until = time.time()
        except queue.Empty:
            if time.time() - jarvis_state._await_cmd_until > 5:
                jarvis_state._await_cmd_until = time.time()
        except Exception as e:
            print(f"[WORKER] Error: {e}")


def audio_pipeline(audio_np):
    rms = float(np.sqrt(np.mean(audio_np ** 2)))
    if rms < vad.noise_gate:
        return False

    dur = len(audio_np) / 16000.0

    if dur < MIN_AUDIO_DURATION:
        return False
    if dur > MAX_AUDIO_DURATION:
        return False

    return vad.process_chunk(audio_np)


def on_frame(audio_np):
    audio_pipeline(audio_np)


mic.on_frame(on_frame)
vad.on("speech_end", lambda audio_data: jarvis_state.command_queue.put(("audio", audio_data)))
vad.on("speech_start", lambda: jarvis_state.broadcast("vad_event", {"event": "speech_start"}))
vad.on("speech_end", lambda data: jarvis_state.broadcast("vad_event", {"event": "speech_end", "duration": len(data) / 16000.0 / 4}))

_worker = threading.Thread(target=command_worker, daemon=True)
_worker.start()


@app.on_event("startup")
def startup():
    jarvis_state.init(asyncio.get_running_loop())
    print("=" * 50)
    print("  J.A.R.V.I.S. v3 -- Starting up...")
    print("=" * 50)
    print(f"  CUDA: No (PyTorch not installed)")
    print(f"  VAD: threshold={vad.threshold} noise_gate={vad.noise_gate}")
    stt.load()
    tts.init()
    orch._emit("state_update", {"state": "listening"})
    print("=" * 50)
    print("  J.A.R.V.I.S. online. Say 'Hey Jarvis'.")
    print("=" * 50)


@app.get("/api/status")
def get_status():
    return {
        "state": jarvis_state.current_state,
        "stt_loaded": stt._loaded,
        "tts_initialized": tts._initialized,
        "mic_device": mic.device_index,
        "queue_size": jarvis_state.command_queue.qsize(),
        "processing": jarvis_state.is_processing,
    }


@app.post("/api/command")
def text_command(payload: dict):
    text = payload.get("text", "")
    jarvis_state.command_queue.put(("text", payload))
    return JSONResponse({"status": "queued", "text": text})


@app.post("/api/clear")
def clear_memory():
    jarvis_state.current_state = "standby"
    jarvis_state.command_queue = queue.Queue()
    vad.reset()
    stt.reset()
    return JSONResponse({"status": "clear"})


@app.post("/api/start-mic")
def start_mic():
    try:
        mic.start()
        return JSONResponse({"status": "started", "device": mic.device_index})
    except Exception as e:
        return JSONResponse({"status": "error", "error": str(e)})


@app.post("/api/stop-mic")
def stop_mic():
    try:
        mic.stop()
        return JSONResponse({"status": "stopped"})
    except Exception as e:
        return JSONResponse({"status": "error", "error": str(e)})


if os.path.exists(FRONTEND_DIR):
    app.mount("/_next", StaticFiles(directory=os.path.join(FRONTEND_DIR, "_next")), name="next")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        return FileResponse(os.path.join(FRONTEND_DIR, "index.html"))
else:
    print(f"[FRONTEND] NOT FOUND - looking in: {FRONTEND_DIR}")
    _internal = os.path.join(os.path.dirname(sys.executable), "_internal", "frontend", "out")
    if os.path.exists(_internal):
        FRONTEND_DIR = _internal
        app.mount("/_next", StaticFiles(directory=os.path.join(FRONTEND_DIR, "_next")), name="next")

        @app.get("/{full_path:path}")
        async def serve_spa(full_path: str):
            return FileResponse(os.path.join(FRONTEND_DIR, "index.html"))
    else:
        print(f"[FRONTEND] Also not in _internal: {_internal}")


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("JARVIS_PORT", "8001"))
    uvicorn.run(app, host="127.0.0.1", port=port)
