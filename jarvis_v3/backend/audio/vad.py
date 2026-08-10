"""Voice Activity Detection -- energy-based with dynamic noise tracking and noise gate."""
import numpy as np
import time
import threading
from config import SAMPLE_RATE, FRAME_SIZE, VAD_THRESHOLD, VAD_NOISE_GATE, VAD_SILENCE_THRESHOLD


class VoiceDetector:
    def __init__(self, threshold=None, noise_gate=None, silence_threshold=None):
        self.threshold = threshold if threshold is not None else VAD_THRESHOLD
        self.noise_gate = noise_gate if noise_gate is not None else VAD_NOISE_GATE
        self.silence_threshold = silence_threshold if silence_threshold is not None else VAD_SILENCE_THRESHOLD
        self.is_speaking = False
        self.silence_count = 0
        self.speech_buffer = []
        self.lock = threading.Lock()
        self.callbacks = {"speech_start": [], "speech_end": []}
        self._noise_floor = 0.0005
        self._calib_done = True
        self._frame_count = 0
        self._last_speech_time = 0

    def on(self, event, callback):
        self.callbacks[event].append(callback)

    def _emit(self, event, data=None):
        for cb in self.callbacks.get(event, []):
            try:
                if data is not None:
                    cb(data)
                else:
                    cb()
            except Exception as e:
                print(f"[VAD] Callback error: {e}")

    def process_chunk(self, audio_np):
        rms = float(np.sqrt(np.mean(audio_np ** 2)))
        self._frame_count += 1

        if rms < self.noise_gate:
            is_speech = False
            self._noise_floor = 0.95 * self._noise_floor + 0.05 * rms
        else:
            dynamic_threshold = max(self.threshold, self._noise_floor * 3.0)
            is_speech = rms > dynamic_threshold

        with self.lock:
            if is_speech:
                self.silence_count = 0
                self.speech_buffer.append(audio_np.tobytes())
                self._last_speech_time = time.time()
                if not self.is_speaking:
                    self.is_speaking = True
                    self._emit("speech_start")
            else:
                self.silence_count += 1
                if self.is_speaking and self.silence_count >= self.silence_threshold:
                    self.is_speaking = False
                    audio_data = b"".join(self.speech_buffer)
                    self.speech_buffer = []
                    self.silence_count = 0
                    self._emit("speech_end", audio_data)

        return is_speech

    def reset(self):
        with self.lock:
            self.is_speaking = False
            self.speech_buffer = []
            self.silence_count = 0
