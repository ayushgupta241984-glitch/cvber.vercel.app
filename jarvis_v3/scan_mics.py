"""Scan all input devices for 8 seconds and print peak RMS levels.
Use this to find which mic actually receives your voice."""
import pyaudio, numpy as np, time

pa = pyaudio.PyAudio()

devs = []
for i in range(pa.get_device_count()):
    info = pa.get_device_info_by_index(i)
    if info.get("maxInputChannels", 0) > 0:
        devs.append((i, info["name"], int(info.get("defaultSampleRate", 0))))

print(f"Found {len(devs)} input devices. Speaking for 8 seconds...\n")

for idx, name, rate in devs:
    try:
        stream = pa.open(
            format=pyaudio.paFloat32, channels=1, rate=16000,
            input=True, input_device_index=idx, frames_per_buffer=1024,
        )
        # read 8 seconds, find peak RMS
        peak = 0.0
        start = time.time()
        while time.time() - start < 8:
            data = stream.read(1024, exception_on_overflow=False)
            audio = np.frombuffer(data, dtype=np.float32)
            rms = np.sqrt(np.mean(audio ** 2))
            if rms > peak:
                peak = rms
        stream.stop_stream()
        stream.close()
        bar = "#" * int(min(peak / 0.02, 40))
        print(f"[{idx}] peak_rms={peak:.4f} {bar}  {name}")
    except Exception as e:
        print(f"[{idx}] ERROR: {e}")
    pa.terminate()
    pa = pyaudio.PyAudio()

pa.terminate()
print("\nDone. Peak rms >= ~0.01 means your voice was captured.")
