"""Start JARVIS server - listens on port 8000."""
import sys, os

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "backend"))

from main import app
import uvicorn

print("Starting JARVIS server on port 8000...")
uvicorn.run(app, host="0.0.0.0", port=8000, timeout_graceful_shutdown=5)
