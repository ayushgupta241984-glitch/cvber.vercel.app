import os

try:
    from dotenv import load_dotenv
    load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env"))
except ImportError:
    pass

SAMPLE_RATE = 16000
FRAME_SIZE = 512

_PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
_VOSK_CACHE = os.path.join(os.path.expanduser("~"), ".cache", "vosk")

_VOSK_LOCAL = os.path.join(_PROJECT_ROOT, "models", "vosk-model-small-en-us")
_VOSK_LOCAL_FALLBACK = os.path.join(_PROJECT_ROOT, "models", "vosk-model-small-en-us-0.15")

_VOSK_CACHE_MODEL = ""
if os.path.isdir(_VOSK_CACHE):
    _dirs = [d for d in os.listdir(_VOSK_CACHE)
             if d.startswith("vosk-model") and os.path.isdir(os.path.join(_VOSK_CACHE, d))]
    _lgraph = [d for d in _dirs if "lgraph" in d]
    _pref = sorted(_lgraph if _lgraph else _dirs)
    if _pref:
        _VOSK_CACHE_MODEL = os.path.join(_VOSK_CACHE, _pref[0])

VOSK_MODEL_PATH = os.environ.get("VOSK_MODEL_PATH") or (
    _VOSK_LOCAL if os.path.isdir(_VOSK_LOCAL) else
    _VOSK_LOCAL_FALLBACK if os.path.isdir(_VOSK_LOCAL_FALLBACK) else
    _VOSK_CACHE_MODEL if _VOSK_CACHE_MODEL else ""
)

WAKE_WORD = "jarvis"
MIN_AUDIO_DURATION = 0.15
MAX_AUDIO_DURATION = 30.0
VAD_THRESHOLD = 0.018
VAD_NOISE_GATE = 0.008
VAD_SILENCE_THRESHOLD = 40

TTS_VOICE = "en-GB-ThomasNeural"
TTS_RATE = "+0%"

NVIDIA_API_KEY = os.environ.get("NVIDIA_API_KEY", "")
NVIDIA_MODEL = "stepfun-ai/step-3.7-flash"
NVIDIA_FAST_MODEL = "stepfun-ai/step-3.7-flash"

FRONTEND_DIR = os.path.normpath(os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "frontend",
    "out",
))
