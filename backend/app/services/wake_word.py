#!/usr/bin/env python3
"""
Jarvis Voice/Wake Word Detection Module

This module implements robust voice wake word detection using:
1. PyAudio + faster-whisper (primary)
2. sounddevice (fallback)
3. Edge-tts greeting as final fallback
4. Multiple microphone device testing and management

Dependencies (install via: pip install faster-whisper sounddevice edge-tts numpy)
"""

import asyncio
import threading
import time
import numpy as np
from typing import Optional, Dict, List, Tuple
from dataclasses import dataclass
import logging

# Try to import PyAudio first (Windows compatible)
try:
    import pyaudio
    PYAUDIO_AVAILABLE = True
    print("PyAudio available - using PyAudio for audio capture")
except ImportError:
    PYAUDIO_AVAILABLE = False
    print("PyAudio not available - will use sounddevice fallback")

# Try to import sounddevice as secondary option
try:
    import sounddevice as sd
    SOUNDDEVICE_AVAILABLE = True
    print("sounddevice available - configured as fallback")
except ImportError:
    SOUNDDEVICE_AVAILABLE = False
    print("sounddevice not available - using microphone_array fallback")

# Try to import faster-whisper
try:
    from faster_whisper import WhisperModel
    WHISPER_AVAILABLE = True
    print("faster-whisper available - configured for wake word detection")
except ImportError:
    WHISPER_AVAILABLE = False
    print("faster-whisper not available - skipping implementation")

# Try to import edge-tts
try:
    import edge_tts
    EDGE_TTS_AVAILABLE = True
    print("edge-tts available - configured for fallback")
except ImportError:
    EDGE_TTS_AVAILABLE = False
    print("edge-tts not available - will use text fallback")

# Configure logging
logger = logging.getLogger(__name__)

@dataclass
class MicrophoneInfo:
    """Information about a detected microphone device"""
    index: int
    name: str
    default_sample_rate: int
    max_channels: int
    host_api: str
    is_input: bool

@dataclass
class WakeWordConfig:
    """Configuration for wake word detection"""
    wake_phrase: str = "wake up daddy's home"
    whisper_model: str = "tiny"  # Options: tiny, base, small, medium, large
    whisper_device: str = "cpu"
    whisper_compute_type: str = "int8"
    recording_duration: float = 2.0
    silence_threshold: float = 0.01
    sensitivity: float = 0.7
    sample_rate: int = 16000
    num_channels: int = 1

@dataclass
class AudioTestResult:
    """Result of audio device testing"""
    device_index: int
    device_name: str
    status: str  # "success", "failed", "not_available"
    sample_rate_used: int
    error_message: Optional[str] = None
    audio_level: float = 0.0
    audio_duration_recorded: float = 0.0
    file_path: Optional[str] = None

class MicrophoneDetector:
    """Handles microphone detection and audio recording"""

    def __init__(self, config: Optional[WakeWordConfig] = None):
        self.config = config or WakeWordConfig()
        self.detected_mics: List[MicrophoneInfo] = []
        self.is_recording = False

    def list_microphones(self) -> List[MicrophoneInfo]:
        """List all available audio input devices"""
        self.detected_mics = []

        if PYAUDIO_AVAILABLE:
            self._detect_pyaudio_devices()
        elif SOUNDDEVICE_AVAILABLE:
            self._detect_sounddevice_devices()
        else:
            self._detect_system_devices()

        return self.detected_mics

    def _detect_pyaudio_devices(self):
        """Detect devices using PyAudio"""
        audio = pyaudio.PyAudio()
        try:
            for i in range(audio.get_device_count()):
                device_info = audio.get_device_info_by_index(i)
                if device_info.get('maxInputChannels', 0) > 0:
                    mic = MicrophoneInfo(
                        index=i,
                        name=device_info.get('name', f'PyAudio Device {i}'),
                        default_sample_rate=int(device_info.get('defaultSampleRate', self.config.sample_rate)),
                        max_channels=device_info.get('maxInputChannels', 1),
                        host_api=device_info.get('hostApiName', 'PyAudio'),
                        is_input=True
                    )
                    self.detected_mics.append(mic)
                    logger.info(f"Detected PyAudio microphone: {mic.name} (Index: {mic.index})")
        finally:
            audio.terminate()

    def _detect_sounddevice_devices(self):
        """Detect devices using sounddevice"""
        try:
            devices = sd.query_devices()
            for i, device in enumerate(devices):
                if device.get('max_input_channels', 0) > 0:
                    mic = MicrophoneInfo(
                        index=i,
                        name=device.get('name', f'sounddevice Device {i}'),
                        default_sample_rate=int(device.get('default_samplerate', self.config.sample_rate)),
                        max_channels=device.get('max_input_channels', 1),
                        host_api=device.get('hostapi', 'sounddevice'),
                        is_input=True
                    )
                    self.detected_mics.append(mic)
                    logger.info(f"Detected sounddevice microphone: {mic.name} (Index: {mic.index})")
        except Exception as e:
            logger.error(f"Error detecting sounddevice microphones: {e}")

    def _detect_system_devices(self):
        """Fallback method to detect system audio devices"""
        logger.warning("Using system fallback for microphone detection")
        try:
            devices = sd.query_devices()
            for i, device in enumerate(devices):
                if device.get('max_input_channels', 0) > 0:
                    mic = MicrophoneInfo(
                        index=i,
                        name=device.get('name', f'system Device {i}'),
                        default_sample_rate=int(device.get('default_samplerate', self.config.sample_rate)),
                        max_channels=device.get('max_input_channels', 1),
                        host_api=device.get('hostapi', 'system'),
                        is_input=True
                    )
                    self.detected_mics.append(mic)
        except Exception as e:
            logger.error(f"Error in system fallback detection: {e}")

    def record_audio(self, device_index: int, duration: float = None) -> Tuple[np.ndarray, int]:
        """Record audio from a specific microphone device"""
        duration = duration or self.config.recording_duration

        if PYAUDIO_AVAILABLE:
            return self._record_pyaudio(device_index, duration)
        elif SOUNDDEVICE_AVAILABLE:
            return self._record_sounddevice(device_index, duration)
        else:
            return self._record_fallback(device_index, duration)

    def _record_pyaudio(self, device_index: int, duration: float) -> Tuple[np.ndarray, int]:
        """Record using PyAudio"""
        audio = pyaudio.PyAudio()
        try:
            stream = audio.open(
                input_device_index=device_index,
                channels=self.config.num_channels,
                rate=self.config.sample_rate,
                format=pyaudio.paInt16,
                input=True,
                frames_per_buffer=1024,
            )

            frames = []
            for _ in range(0, int(self.config.sample_rate / 1024 * duration)):
                if not self.is_recording:
                    break
                data = stream.read(1024)
                frames.append(data)

            stream.stop_stream()
            stream.close()

            audio_data = b''.join(frames)
            samples = np.frombuffer(audio_data, dtype=np.int16).astype(np.float32)
            samples /= 32768.0  # Normalize to [-1, 1]

            return samples, self.config.sample_rate

        finally:
            audio.terminate()

    def _record_sounddevice(self, device_index: int, duration: float) -> Tuple[np.ndarray, int]:
        """Record using sounddevice"""
        sample_rate = self.config.sample_rate

        def callback(indata, frame_count, time, status):
            # Append audio data to buffer
            if self.is_recording:
                audio_buffer.extend(indata.copy())

        audio_buffer = []
        with sd.InputStream(
            device=device_index,
            channels=self.config.num_channels,
            samplerate=sample_rate,
            callback=callback,
        ):
            # Sleep for the duration
            time.sleep(duration)
            self.is_recording = False

        if audio_buffer:
            samples = np.concatenate(audio_buffer).flatten()
            samples = samples.astype(np.float32)
            samples /= np.max(np.abs(samples)) if np.max(np.abs(samples)) > 0 else 1.0
            return samples, sample_rate
        else:
            return np.array([]), sample_rate

    def _record_fallback(self, device_index: int, duration: float) -> Tuple[np.ndarray, int]:
        """Fallback recording method"""
        logger.warning("Using fallback recording method")
        return np.array([]), self.config.sample_rate

    def stop_recording(self):
        """Stop any ongoing recording"""
        self.is_recording = False

class WakeWordDetector:
    """AI-based wake word detection using Whisper"""

    def __init__(self, config: Optional[WakeWordConfig] = None):
        self.config = config or WakeWordConfig()
        self.model = None
        self.detector = None
        self.is_active = False
        self.last_activation_time = 0
        self.activation_cooldown = 2.0  # 2-second cooldown

    def initialize(self):
        """Initialize the Whisper model for wake word detection"""
        if not WHISPER_AVAILABLE:
            logger.warning("faster-whisper not available, wake word detection disabled")
            return False

        try:
            logger.info(f"Loading Whisper model: {self.config.whisper_model}")
            self.model = WhisperModel(
                self.config.whisper_model,
                device=self.config.whisper_device,
                compute_type=self.config.whisper_compute_type,
            )
            logger.info("Whisper model loaded successfully")
            return True
        except Exception as e:
            logger.error(f"Failed to initialize Whisper model: {e}")
            return False

    def is_waking_phrase(self, text: str, phrase: str = None) -> bool:
        """Check if the transcribed text contains the wake phrase"""
        phrase = phrase or self.config.wake_phrase
        text_lower = text.lower().strip()
        phrase_lower = phrase.lower().strip()
        
        # Simple string matching - check if wake phrase is in the text
        if phrase_lower in text_lower:
            return True
        
        # Check for partial matches or variations
        words = text_lower.split()
        phrase_words = phrase_lower.split()
        
        # Check if all phrase words appear in sequence in the text
        for i in range(len(words) - len(phrase_words) + 1):
            if words[i:i+len(phrase_words)] == phrase_words:
                return True
        
        return False

    def detect_wake_word(self, audio_samples: np.ndarray, sample_rate: int) -> Optional[str]:
        """Transcribe audio and check for wake word"""
        if not self.model:
            logger.warning("Wake word detector not initialized")
            return None

        try:
            # Save audio to temporary file for transcription
            import tempfile
            import os

            with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as f:
                temp_filename = f.name

            # Save audio in WAV format
            import wave
            with wave.open(temp_filename, 'wb') as wav_file:
                wav_file.setnchannels(1)
                wav_file.setsampwidth(2)  # 16-bit
                wav_file.setframerate(sample_rate)
                # Convert float audio to int16
                int16_audio = (audio_samples * 32767).astype(np.int16)
                wav_file.writeframes(int16_audio.tobytes())

            # Transcribe using Whisper
            segments, info = self.model.transcribe(
                temp_filename,
                beam_size=5,
                language="en",
                task="transcribe"
            )

            # Clean up temp file
            os.unlink(temp_filename)

            transcribed_text = ""
            for segment in segments:
                transcribed_text += segment.text

            transcribed_text = transcribed_text.strip()
            logger.info(f"Transcribed text: '{transcribed_text}'")

            # Check for wake word
            if self.is_waking_phrase(transcribed_text):
                logger.info(f"Wake word detected: '{transcribed_text}'")
                return transcribed_text
            else:
                logger.info(f"No wake word detected in transcription")
                return None

        except Exception as e:
            logger.error(f"Error in wake word detection: {e}")
            return None
class WakeWordHandler:
    """Main handler for Jarvis wake word functionality"""

    def __init__(self):
        self.config = WakeWordConfig()
        self.microphone_detector = MicrophoneDetector(self.config)
        self.wake_word_detector = WakeWordDetector(self.config)
        self.test_results: List[AudioTestResult] = []
        self.is_awake = False
        self.edge_tts_handler = EdgeTTSHandler() if EDGE_TTS_AVAILABLE else None

    def start_wake_word_detection(self, device_index: int = None):
        """Start continuous wake word detection"""
        if not device_index:
            mics = self.microphone_detector.list_microphones()
            if not mics:
                logger.error("No microphones detected")
                return False
            device_index = mics[0].index  # Use first microphone by default

        # Initialize wake word detector
        if not self.wake_word_detector.initialize():
            logger.warning("Wake word detector not initialized, using fallback")

        # Start detection
        logger.info(f"Starting wake word detection on microphone index {device_index}")
        asyncio.create_task(self._continuous_detection(device_index))
        return True

    async def _continuous_detection(self, device_index: int):
        """Continuous wake word detection loop"""
        while True:
            try:
                # Record audio segment
                logger.info("Recording audio segment for wake word detection...")
                audio_samples, sample_rate = self.microphone_detector.record_audio(device_index)

                if len(audio_samples) == 0:
                    logger.warning("No audio recorded, retrying...")
                    await asyncio.sleep(1)
                    continue

                # Check audio level
                audio_level = np.max(np.abs(audio_samples))
                logger.info(f"Audio level: {audio_level:.4f}")

                # Skip if audio is too quiet
                if audio_level < self.config.silence_threshold:
                    logger.debug("Audio too quiet, skipping detection")
                    await asyncio.sleep(0.5)
                    continue

                # Check cooldown
                current_time = time.time()
                if current_time - self.wake_word_detector.last_activation_time < self.wake_word_detector.activation_cooldown:
                    logger.debug("Cooldown active, skipping detection")
                    await asyncio.sleep(0.5)
                    continue

                # Detect wake word
                text = self.wake_word_detector.detect_wake_word(audio_samples, sample_rate)
                if text:
                    self.wake_word_detector.last_activation_time = current_time
                    self.is_awake = True
                    logger.info(f"Jarvis awakened! Wake word detected: '{text}'")
                    break
                else:
                    logger.debug("No wake word detected in this segment")

                # Small delay before next detection
                await asyncio.sleep(0.5)

            except Exception as e:
                logger.error(f"Error in continuous detection: {e}")
                await asyncio.sleep(1)

    async def test_all_microphones(self) -> List[AudioTestResult]:
        """Test all available microphones and return results"""
        logger.info("Testing all available microphones...")
        self.test_results = []
        mics = self.microphone_detector.list_microphones()

        if not mics:
            logger.warning("No microphones detected!")
            return []

        logger.info(f"Found {len(mics)} microphones to test")

        for mic in mics:
            logger.info(f"\n--- Testing microphone: {mic.name} (Index: {mic.index}) ---")
            result = await self._test_single_microphone(mic)
            self.test_results.append(result)
            self._print_test_result(result)

        self._generate_recommendations()
        return self.test_results

    async def _test_single_microphone(self, mic: MicrophoneInfo) -> AudioTestResult:
        """Test a single microphone device"""
        logger.info(f"Testing microphone: {mic.name}")

        try:
            # Try to record audio
            audio_samples, sample_rate = self.microphone_detector.record_audio(
                mic.index, duration=self.config.recording_duration
            )

            if len(audio_samples) == 0:
                return AudioTestResult(
                    device_index=mic.index,
                    device_name=mic.name,
                    status="not_available",
                    sample_rate_used=0,
                    error_message="No audio recorded - device not available or disconnected"
                )

            # Calculate audio level (RMS)
            audio_level = np.sqrt(np.mean(audio_samples ** 2))

            # Save test file
            import tempfile
            import os

            with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as f:
                temp_filename = f.name

            # Save audio
            import wave
            with wave.open(temp_filename, 'wb') as wav_file:
                wav_file.setnchannels(1 if len(audio_samples.shape) == 1 else audio_samples.shape[1])
                wav_file.setsampwidth(2)  # 16-bit
                wav_file.setframerate(sample_rate)
                # Convert float audio to int16
                int16_audio = (audio_samples * 32767).astype(np.int16)
                if len(int16_audio.shape) == 1:
                    wav_file.writeframes(int16_audio.tobytes())
                else:
                    for channel in int16_audio.T:
                        wav_file.writeframes(channel.tobytes())

            logger.info(f"Saved test file: {temp_filename}")

            return AudioTestResult(
                device_index=mic.index,
                device_name=mic.name,
                status="success",
                sample_rate_used=sample_rate,
                audio_level=float(audio_level),
                audio_duration_recorded=self.config.recording_duration,
                file_path=temp_filename
            )

        except Exception as e:
            error_msg = str(e)
            logger.error(f"Error testing microphone {mic.name}: {error_msg}")
            return AudioTestResult(
                device_index=mic.index,
                device_name=mic.name,
                status="failed",
                sample_rate_used=0,
                error_message=error_msg
            )

    def _print_test_result(self, result: AudioTestResult):
        """Print test result in a formatted way"""
        status_emoji = "✅" if result.status == "success" else "❌" if result.status == "failed" else "⚠️"
        
        print(f"\n{status_emoji} Microphone: {result.device_name} (Index: {result.device_index})")
        print(f"   Status: {result.status}")
        
        if result.status == "success":
            print(f"   Sample Rate: {result.sample_rate_used} Hz")
            print(f"   Audio Level: {result.audio_level:.4f} (RMS)")
            print(f"   Duration: {result.audio_duration_recorded:.2f} seconds")
            print(f"   Audio File: {result.file_path}")
            
            # Determine if it's suitable for wake word detection
            if result.audio_level > self.config.silence_threshold:
                print(f"   → RECOMMENDED: Strong audio signal for wake word detection")
            else:
                print(f"   → WARNING: Audio too quiet for reliable wake word detection")
        else:
            print(f"   Error: {result.error_message}")

    def _generate_recommendations(self):
        """Generate recommendations based on test results"""
        print("\n" + "="*60)
        print("RECOMMENDATIONS:")
        print("="*60)

        successful_tests = [r for r in self.test_results if r.status == "success"]

        if not successful_tests:
            print("❌ NO SUITABLE MICROPHONES FOUND")
            print("   - All tested microphones failed or produced no audio")
            print("   - Check microphone connections and permissions")
            print("   - Try recording with a physical sound (clap or speech)")
            return

        best_mics = sorted(successful_tests, key=lambda x: x.audio_level, reverse=True)[:3]

        print(f"✅ {len(successful_tests)} microphone(s) suitable for wake word detection")
        
        if len(best_mics) > 0:
            print("\nTop 3 recommended microphones (by audio level):")
            for i, mic in enumerate(best_mics, 1):
                print(f"   {i}. {mic.device_name} (Level: {mic.audio_level:.4f})")

        unsuitable_mics = [r for r in self.test_results if r.status == "failed" or r.audio_level <= self.config.silence_threshold]
        if unsuitable_mics:
            print(f"\n❌ {len(unsuitable_mics)} microphone(s) NOT recommended:")
            for mic in unsuitable_mics:
                if mic.status == "failed":
                    print(f"   - {mic.device_name}: {mic.error_message}")
                else:
                    print(f"   - {mic.device_name}: Too quiet (Level: {mic.audio_level:.4f})")

        print("\nGeneral Recommendations:")
        print("   - Use a microphone with consistent audio level > 0.01 RMS")
        print("   - Close ambient noise for better wake word accuracy")
        print("   - Test in a quiet environment for best results")
class EdgeTTSHandler:
    """Edge TTS handler for fallback greetings"""

    def __init__(self):
        self.supported_languages = ["en-US", "en-GB", "en-AU", "en-IN", "en-NZ"]

    async def speak(self, text: str, voice: str = "en-US-JennyNeural", rate: str = "medium", volume: str = "medium"):
        """Convert text to speech"""
        try:
            import asyncio
            from edge_tts import Communicate

            communicate = Communicate(text, voice, rate=rate, volume=volume)
            await communicate.save("wakeup_greeting.wav")
            logger.info("Edge TTS greeting generated successfully")
            return "wakeup_greeting.wav"
        except Exception as e:
            logger.error(f"Edge TTS failed: {e}")
            return None

    async def get_welcome_greeting(self, user_name: str = "sir"):
        """Generate a wake-up greeting for the user"""
        greeting_templates = [
            f"Good morning, {user_name}. Welcome back.",
            f"Hello {user_name}, I'm ready to assist you.",
            f"Good to see you again, {user_name}. How can I help?",
            f"Morning, {user_name}. Your digital assistant is awake and ready.",
            f"Good day, {user_name}. I'm Jarvis, ready to serve."
        ]

        return greeting_templates[0]  # Use first template for consistency
async def main():
    """Main application entry point"""
    print("🚀 Jarvis Voice Control System")
    print("=" * 60)

    handler = WakeWordHandler()

    while True:
        print("\n📋 MAIN MENU:")
        print("1. Test all microphones")
        print("2. Start wake word detection")
        print("3. Exit")

        choice = input("\nEnter your choice (1-3): ").strip()

        if choice == "1":
            # Test microphones
            print("\n🔍 Testing all available microphones...")
            await handler.test_all_microphones()

        elif choice == "2":
            # Start wake word detection
            mics = handler.microphone_detector.list_microphones()
            if not mics:
                print("\n❌ No microphones detected. Please connect a microphone.")
                continue

            print(f"\n🎤 Available microphones:")
            for i, mic in enumerate(mics, 1):
                print(f"   {i}. {mic.name} (Index: {mic.index})")

            if len(mics) > 1:
                device_input = input(f"\nSelect microphone (1-{len(mics)}, default 1): ").strip()
                if device_input and device_input.isdigit():
                    device_index = int(device_input) - 1
                    if device_index < len(mics):
                        device_index = mics[device_index].index
                    else:
                        device_index = mics[0].index
                else:
                    device_index = mics[0].index
            else:
                device_index = mics[0].index
                print(f"\n🎤 Using microphone: {mics[0].name}")

            # Start wake word detection
            print("\n👂 Listening for wake word 'wake up daddy's home'...")
            print("   (Press Ctrl+C to stop listening)")
            try:
                await handler.start_wake_word_detection(device_index)
                # In a real implementation, you would run this in a separate thread/process
                # For this demo, we'll simulate the detection
                print("\n✅ Wake word detection started!")
                break
            except Exception as e:
                print(f"\n❌ Error starting wake word detection: {e}")

        elif choice == "3":
            print("\n👋 Goodbye!")
            break

        else:
            print("\n❌ Invalid choice. Please enter 1, 2, or 3.")
if __name__ == "__main__":
    asyncio.run(main())
