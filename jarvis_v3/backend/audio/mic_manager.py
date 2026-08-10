"""Microphone manager -- PyAudio-based input capture with device auto-detection."""
import pyaudio
import threading
import numpy as np
import time
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from config import SAMPLE_RATE


class MicManager:
    def __init__(self, device_index=None, sample_rate=None, channels=2, frames_per_buffer=1024):
        self.p = pyaudio.PyAudio()
        self.sample_rate = sample_rate or 48000
        self.channels = channels
        self.frames_per_buffer = frames_per_buffer
        self.device_index = device_index
        self.stream = None
        self._callbacks = []
        self._thread = None
        self._running = False

        if device_index is None:
            self.device_index = self._find_default_input()

    def _find_default_input(self):
        info = self.p.get_host_api_info_by_type(pyaudio.paWASAPI)
        for i in range(info.get("deviceCount", 0)):
            dev_info = self.p.get_device_info_by_index(i)
            if dev_info.get("maxInputChannels", 0) > 0:
                name = dev_info.get("name", "")
                if "Microphone Array" in name or "mic" in name.lower():
                    return i
        for i in range(self.p.get_device_count()):
            dev_info = self.p.get_device_info_by_index(i)
            if dev_info.get("maxInputChannels", 0) > 0:
                return i
        return self.p.get_default_input_device_info()["index"]

    def on_frame(self, callback):
        self._callbacks.append(callback)

    def _callback(self, in_data, frame_count, time_info, status):
        if self._running and in_data:
            audio = np.frombuffer(in_data, dtype=np.float32)
            if self.channels > 1:
                audio = audio.reshape(-1, self.channels).mean(axis=1)
            audio = audio.astype(np.float32)
            for cb in self._callbacks:
                try:
                    cb(audio)
                except Exception:
                    pass
        return (in_data, pyaudio.paContinue)

    def start(self):
        if self.stream is not None:
            return
        try:
            self.stream = self.p.open(
                format=pyaudio.paFloat32,
                channels=self.channels,
                rate=self.sample_rate,
                input=True,
                input_device_index=self.device_index,
                frames_per_buffer=self.frames_per_buffer,
                stream_callback=self._callback,
            )
            self._running = True
            print(f"[MIC] Using PyAudio device {self.device_index}: {self.p.get_device_info_by_index(self.device_index)['name']}")
        except Exception as e:
            print(f"[MIC] Failed to open stream: {e}")
            raise

    def stop(self):
        if self.stream:
            self._running = False
            self.stream.stop_stream()
            self.stream.close()
            self.stream = None

    def __del__(self):
        try:
            self.stop()
            self.p.terminate()
        except:
            pass
