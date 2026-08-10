"""Start JARVIS server on port 8000.

Endpoints:
  GET  /api/status      - check backend status
  POST /api/command     - send text command {"text": "..."}
  POST /api/start-mic   - start microphone capture
  POST /api/stop-mic    - stop microphone capture
  GET  /                - frontend SPA
"""
import sys, os

os.environ["PYTHONUNBUFFERED"] = "1"
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "backend"))

from main import app
import uvicorn

if __name__ == "__main__":
    print("Starting JARVIS v3 server on http://0.0.0.0:8000")
    uvicorn.run(app, host="0.0.0.0", port=8000, timeout_graceful_shutdown=5)
