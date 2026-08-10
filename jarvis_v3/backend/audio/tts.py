"""Text-to-Speech -- edge-tts with async streaming for fast response."""
import asyncio
import edge_tts
import pygame
import os
import tempfile
import threading
import time

from config import TTS_VOICE, TTS_RATE


class TextToSpeech:
    def __init__(self):
        self.voice = TTS_VOICE
        self.rate = TTS_RATE
        self._initialized = False
        self.lock = threading.Lock()
        self._queue = []
        self._speaking = False
        self._stop = False

    def init(self):
        with self.lock:
            if self._initialized:
                return
            try:
                pygame.mixer.init(frequency=24000, size=-16, channels=1, buffer=512)
                self._initialized = True
                print(f"[TTS] Initialized with voice: {self.voice}")
            except Exception as e:
                print(f"[TTS] Init failed: {e}")

    def speak(self, text=None, callback=None):
        if text and text.strip():
            def _worker(self, text, callback):
                self._speaking = True
                loop = asyncio.new_event_loop()
                asyncio.set_event_loop(loop)
                try:
                    async def _gen():
                        tmp = os.path.join(tempfile.gettempdir(), f"jarvis_tts_{int(time.time() * 1000)}.mp3")
                        communicate = edge_tts.Communicate(text, self.voice, rate=self.rate)
                        await communicate.save(tmp)
                        return tmp

                    mp3 = loop.run_until_complete(asyncio.wait_for(_gen(), timeout=10))
                    pygame.mixer.music.load(mp3)
                    pygame.mixer.music.play()
                    while pygame.mixer.music.get_busy() and not self._stop:
                        time.sleep(0.05)
                    pygame.mixer.music.stop()
                    try:
                        os.remove(mp3)
                    except Exception:
                        pass
                except asyncio.TimeoutError:
                    print("[TTS] edge-tts API timeout - cannot reach Microsoft servers")
                except Exception as e:
                    print(f"[TTS] Play error: {e}")
                finally:
                    self._speaking = False
                    if callback:
                        callback()
                    loop.close()

            t = threading.Thread(target=_worker, args=(self, text, callback), daemon=True)
            t.start()

    def speak_sync(self, text, callback=None):
        done = threading.Event()
        self.speak(text, callback=lambda: done.set())
        done.wait(timeout=30)

    def stop(self):
        self._stop = True
        try:
            pygame.mixer.music.stop()
        except Exception:
            pass

    def resume(self):
        self._stop = False

    @property
    def is_speaking(self):
        return self._speaking
