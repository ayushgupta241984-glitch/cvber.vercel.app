"""JARVIS v3 - minimal voice loop. Say "hey jarvis ..." and it replies out loud.

Usage:
  python jarvis_cli.py            # auto-pick input mic
  python jarvis_cli.py 1          # force input device index 1 (built-in mic array)
"""
import os, sys, time, numpy as np, pyaudio
from scipy.signal import resample_poly

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "backend"))
sys.path.insert(0, os.path.join(HERE, "backend", "audio"))
sys.path.insert(0, os.path.join(HERE, "backend", "agents"))

from audio.vad import VoiceDetector
from audio.stt import SpeechToText
from audio.tts import TextToSpeech
from agents.brain import Brain

STT_RATE = 16000
CHUNK = 1024

vad = VoiceDetector(threshold=0.004, noise_gate=0.0015, silence_threshold=25)
stt = SpeechToText()
tts = TextToSpeech()
brain = Brain()

stt.load()
tts.init()

pa = pyaudio.PyAudio()

input_devices = []
for i in range(pa.get_device_count()):
    info = pa.get_device_info_by_index(i)
    if info.get("maxInputChannels", 0) > 0:
        input_devices.append((i, info["name"]))

print("\nAvailable input devices:")
for idx, name in input_devices:
    print(f"  [{idx}] {name}")

if len(sys.argv) > 1:
    mic_idx = int(sys.argv[1])
else:
    mic_idx = pa.get_default_input_device_info()["index"]

dev_info = pa.get_device_info_by_index(mic_idx)
dev_rate = int(dev_info["defaultSampleRate"])
dev_channels = min(int(dev_info["maxInputChannels"]), 2)
print(f"\nUsing device [{mic_idx}] at {dev_rate} Hz, {dev_channels} ch")

UP, DOWN = dev_rate, STT_RATE


def to_stt(audio):
    mono = audio.reshape(-1, dev_channels).mean(axis=1) if dev_channels > 1 else audio
    if dev_rate == STT_RATE:
        mono = mono.astype(np.float32)
    else:
        mono = resample_poly(mono, STT_RATE, dev_rate).astype(np.float32)
    return mono * 25.0


def on_speech_start():
    print("[VAD] speech_start detected")
    stt.start(STT_RATE)


def on_speech_end(audio_bytes):
    text, lang, conf = stt.finish()
    print(f"[STT] raw: '{text}'")
    if not text or len(text) <= 2:
        return
    print(f"[YOU] {text}")
    ack = f"Yes sir, let me search and tell you about {text}."
    print(f"[JARVIS] {ack}")
    tts.speak(ack)
    reply = brain.think(text).get("content", "")
    print(f"[JARVIS] {reply}")
    tts.speak(reply)


def on_frame(audio_np):
    vad.process_chunk(audio_np)
    stt.feed(audio_np)


vad.on("speech_end", on_speech_end)
vad.on("speech_start", on_speech_start)

stream = pa.open(
    format=pyaudio.paFloat32,
    channels=dev_channels,
    rate=dev_rate,
    input=True,
    input_device_index=mic_idx,
    frames_per_buffer=CHUNK,
)

print("=" * 46)
print("  JARVIS v3 - listening. Say 'hey jarvis'.")
print("  Ctrl+C to quit.")
print("=" * 46)

last_level_t = time.time()
try:
    while True:
        data = stream.read(CHUNK, exception_on_overflow=False)
        audio = np.frombuffer(data, dtype=np.float32).copy()
        if len(audio) < dev_channels:
            continue
        stt_audio = to_stt(audio)
        on_frame(stt_audio)
        now = time.time()
        if now - last_level_t > 1.0:
            last_level_t = now
            print(f"[LEVEL] rms={np.sqrt(np.mean(stt_audio**2)):.5f}")
except KeyboardInterrupt:
    print("\nBye.")
finally:
    stream.stop_stream()
    stream.close()
    pa.terminate()
