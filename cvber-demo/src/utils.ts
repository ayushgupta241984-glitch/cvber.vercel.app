import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

// Spring helper
export const useSpring = (delay: number, config?: { damping?: number; mass?: number; stiffness?: number }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({
    frame: frame - delay,
    fps,
    config: { damping: 15, mass: 0.8, stiffness: 120, ...config },
  });
};

// Fade in + slide up
export const useFadeSlide = (delay: number, distance = 30) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = interpolate(frame, [delay, delay + fps * 0.5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return {
    opacity: progress,
    transform: `translateY(${interpolate(progress, [0, 1], [distance, 0])}px)`,
  };
};

// Stagger delay calculator
export const stagger = (index: number, baseDelay: number, gap = 4) => baseDelay + index * gap;

// Counter animation
export const useCountUp = (target: number, startFrame: number, durationFrames: number) => {
  const frame = useCurrentFrame();
  const progress = interpolate(frame, [startFrame, startFrame + durationFrames], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
  return Math.round(target * eased);
};

// Typewriter
export const useTypewriter = (text: string, startFrame: number, charsPerFrame = 0.8) => {
  const frame = useCurrentFrame();
  const elapsed = Math.max(0, frame - startFrame);
  const chars = Math.min(Math.floor(elapsed * charsPerFrame), text.length);
  return text.slice(0, chars);
};

// Progress bar with spring
export const useProgress = (target: number, startFrame: number, durationFrames: number) => {
  const frame = useCurrentFrame();
  return interpolate(frame, [startFrame, startFrame + durationFrames], [0, target], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
};

// Pulse scale
export const usePulse = (speed = 0.03, min = 0.97, max = 1.03) => {
  const frame = useCurrentFrame();
  const t = Math.sin(frame * speed) * 0.5 + 0.5;
  return interpolate(t, [0, 1], [min, max]);
};

// Glow pulse
export const useGlowPulse = (speed = 0.05, minOpacity = 0.3, maxOpacity = 0.7) => {
  const frame = useCurrentFrame();
  const t = Math.sin(frame * speed) * 0.5 + 0.5;
  return interpolate(t, [0, 1], [minOpacity, maxOpacity]);
};

// Rotation
export const useRotation = (speed = 1) => {
  const frame = useCurrentFrame();
  return (frame * speed) % 360;
};

// Exit fade
export const useExitFade = (startFrame: number, durationFrames: number) => {
  const frame = useCurrentFrame();
  return interpolate(frame, [startFrame, startFrame + durationFrames], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
};

// Clamp
export const clamp = (val: number, min: number, max: number) => Math.min(Math.max(val, min), max);
