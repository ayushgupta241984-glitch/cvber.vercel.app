"""Speech-to-Text -- Vosk-based transcription."""
import json
import numpy as np
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from config import VOSK_MODEL_PATH, SAMPLE_RATE


class SpeechToText:
    def __init__(self):
        self._model = None
        self._rec = None
        self._loaded = False

    def load(self):
        if self._loaded:
            return
        try:
            import vosk
            if not os.path.exists(VOSK_MODEL_PATH):
                print(f"[STT] Model not found at {VOSK_MODEL_PATH}")
                return
            self._model = vosk.Model(VOSK_MODEL_PATH)
            self._loaded = True
            print(f"[STT] Vosk model loaded: {VOSK_MODEL_PATH}")
        except Exception as e:
            print(f"[STT] Failed to load model: {e}")

    def _to_int16(self, audio_data):
        if isinstance(audio_data, np.ndarray):
            return (audio_data * 32767).astype(np.int16).tobytes()
        if isinstance(audio_data, bytes):
            audio_np = np.frombuffer(audio_data, dtype=np.float32)
            if np.max(np.abs(audio_np)) > 0:
                return (audio_np * 32767).astype(np.int16).tobytes()
            try:
                return audio_np.astype(np.int16).tobytes()
            except Exception:
                return audio_data
        return bytes(audio_data)

    def start(self, sample_rate=16000):
        import vosk
        if not self._loaded or self._model is None:
            return False
        self._rec = vosk.KaldiRecognizer(self._model, sample_rate)
        return True

    def feed(self, audio_data, gain=1.5):
        if self._rec is None:
            return
        audio = audio_data
        if isinstance(audio_data, np.ndarray):
            audio = audio_data * gain
        self._rec.AcceptWaveform(self._to_int16(audio))

    def finish(self):
        if self._rec is None:
            return ("", "en", 0.0)
        text = json.loads(self._rec.FinalResult()).get("text", "").strip()
        self._rec = None
        if text:
            print(f"[STT] '{text}'")
            return (text, "en", 0.8)
        return ("", "en", 0.0)

    def transcribe(self, audio_data, sample_rate=16000):
        try:
            if not self._loaded or self._model is None:
                return ("", "en", 0.0)

            audio_int16 = self._to_int16(audio_data)
            import vosk
            rec = vosk.KaldiRecognizer(self._model, sample_rate)

            chunk = 4000
            for i in range(0, len(audio_int16), chunk):
                rec.AcceptWaveform(audio_int16[i:i + chunk])
            text = json.loads(rec.FinalResult()).get("text", "").strip()
            if text:
                print(f"[STT] '{text}'")
                return (text, "en", 0.8)
            return ("", "en", 0.0)
        except Exception as e:
            print(f"[STT] error: {e}")
            return ("", "en", 0.0)

    def reset(self):
        if self._loaded and self._model is not None:
            import vosk
            self._rec = vosk.KaldiRecognizer(self._model, SAMPLE_RATE)
