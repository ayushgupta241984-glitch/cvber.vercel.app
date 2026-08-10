"""Minimal JARVIS server - no mic, no Vosk, just API."""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "backend"))

from fastapi import FastAPI
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import threading
import queue
import json
import time

app = FastAPI(title="JARVIS Minimal")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

command_queue = queue.Queue()
is_processing = False

@app.get("/api/status")
def status():
    return {
        "state": "ready",
        "stt_loaded": True,
        "tts_initialized": True,
        "mic_device": 0,
        "queue_size": command_queue.qsize(),
        "processing": is_processing,
    }

def process_command(cmd):
    global is_processing
    is_processing = True
    text = cmd.get("text", "")
    print(f"[CMD] Processing: {text}")
    
    response = "I'm JARVIS. Ready to help. Try asking about time or date."
    
    if "time" in text.lower():
        response = datetime.now().strftime("%I:%M %p")
    elif "date" in text.lower():
        response = datetime.now().strftime("%A, %B %d, %Y")
    elif "hello" in text.lower() or "hi" in text.lower():
        response = "Hello! How can I help you?"
    elif "name" in text.lower() and "your" in text.lower():
        response = "I am JARVIS, your AI assistant."
    elif "how are" in text.lower():
        response = "I am functioning perfectly. How are you?"
    elif "?" in text:
        response = "That's a great question!"
    
    print(f"[CMD] Response: {response}")
    is_processing = False

def worker():
    while True:
        try:
            cmd = command_queue.get(timeout=1.0)
            if cmd is None:
                break
            process_command(cmd)
        except queue.Empty:
            continue
        except Exception as e:
            print(f"[WORKER] Error: {e}")

t = threading.Thread(target=worker, daemon=True)
t.start()

@app.post("/api/command")
def text_command(payload: dict):
    text = payload.get("text", "")
    command_queue.put({"text": text})
    return JSONResponse({"status": "queued", "text": text})

if __name__ == "__main__":
    import uvicorn
    print("Starting minimal JARVIS server on port 8000...")
    uvicorn.run(app, host="0.0.0.0", port=8000, timeout_graceful_shutdown=5)
