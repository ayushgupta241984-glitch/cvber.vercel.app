import React from "react";
import { useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";

// Professional dashboard panel
export const PanelFrame: React.FC<{
  children: React.ReactNode;
  title: string;
  delay?: number;
  width?: number;
}> = ({ children, title, delay = 0, width = 700 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scale = spring({ frame: frame - delay, fps, config: { damping: 20, mass: 0.6 } });
  const opacity = interpolate(frame, [delay, delay + fps * 0.3], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div style={{
      borderRadius: 16,
      border: "1px solid rgba(255,255,255,0.08)",
      background: "linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
      backdropFilter: "blur(20px)",
      overflow: "hidden",
      width,
      opacity,
      transform: `scale(${interpolate(scale, [0, 1], [0.96, 1])})`,
      boxShadow: "0 25px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05) inset",
    }}>
      {/* Title bar */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "12px 16px",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        background: "rgba(255,255,255,0.015)",
      }}>
        <div style={{ display: "flex", gap: 6 }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "rgba(255,80,80,0.6)" }} />
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "rgba(255,180,50,0.6)" }} />
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "rgba(80,220,80,0.6)" }} />
        </div>
        <div style={{ flex: 1, textAlign: "center", fontSize: 11, color: "#555", fontWeight: 500, letterSpacing: "0.05em" }}>
          {title}
        </div>
        <div style={{ width: 44 }} />
      </div>
      {/* Content */}
      <div style={{ padding: 24 }}>{children}</div>
    </div>
  );
};

// Animated cursor (simulates user interaction)
export const AnimatedCursor: React.FC<{
  path: { x: number; y: number; frame: number }[];
  clickFrame?: number;
}> = ({ path, clickFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Interpolate position along path
  let pos = path[0];
  for (let i = 0; i < path.length - 1; i++) {
    if (frame >= path[i].frame && frame <= path[i + 1].frame) {
      const t = interpolate(frame, [path[i].frame, path[i + 1].frame], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const eased = t * t * (3 - 2 * t); // smoothstep
      pos = {
        x: interpolate(eased, [0, 1], [path[i].x, path[i + 1].x]),
        y: interpolate(eased, [0, 1], [path[i].y, path[i + 1].y]),
      };
      break;
    }
    if (frame > path[i + 1].frame) pos = path[i + 1];
  }

  const isClicking = clickFrame !== undefined && frame >= clickFrame && frame <= clickFrame + 4;
  const clickScale = isClicking ? 0.8 : 1;
  const cursorOpacity = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: "clamp" });

  return (
    <div style={{
      position: "absolute",
      left: pos.x,
      top: pos.y,
      width: 20,
      height: 20,
      opacity: cursorOpacity,
      pointerEvents: "none",
      zIndex: 100,
    }}>
      {/* Cursor arrow */}
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M4 2L4 16L8 12L12 18L14 17L10 11L16 11L4 2Z" fill="white" stroke="rgba(0,0,0,0.5)" strokeWidth="1" />
      </svg>
      {/* Click ring */}
      {isClicking && (
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 20,
          height: 20,
          borderRadius: "50%",
          border: "2px solid rgba(74,222,128,0.6)",
          transform: `scale(${clickScale + 1})`,
          opacity: interpolate(frame, [clickFrame!, clickFrame! + 4], [0.8, 0], { extrapolateRight: "clamp" }),
        }} />
      )}
    </div>
  );
};

// Step label (lower third)
export const StepLabel: React.FC<{
  step: string;
  title: string;
  description: string;
  delay?: number;
}> = ({ step, title, description, delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const lineScale = spring({ frame: frame - delay, fps, config: { damping: 20 } });
  const textOpacity = interpolate(frame, [delay + fps * 0.15, delay + fps * 0.4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const textY = interpolate(frame, [delay + fps * 0.15, delay + fps * 0.4], [20, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div style={{ width: 400 }}>
      {/* Step number */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        marginBottom: 20,
        opacity: textOpacity,
      }}>
        <div style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: "linear-gradient(135deg, rgba(74,222,128,0.15), rgba(34,211,238,0.15))",
          border: "1px solid rgba(74,222,128,0.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 14,
          fontWeight: 900,
          color: "#4ade80",
        }}>
          {step}
        </div>
        <div style={{
          height: 1,
          flex: 1,
          background: "linear-gradient(90deg, rgba(74,222,128,0.3), transparent)",
          transform: `scaleX(${lineScale})`,
          transformOrigin: "left",
        }} />
      </div>

      {/* Title */}
      <div style={{
        fontSize: 48,
        fontWeight: 900,
        color: "white",
        letterSpacing: "-0.03em",
        lineHeight: 0.95,
        marginBottom: 16,
        opacity: textOpacity,
        transform: `translateY(${textY}px)`,
      }}>
        {title}
      </div>

      {/* Description */}
      <div style={{
        fontSize: 16,
        color: "#888",
        lineHeight: 1.6,
        opacity: textOpacity,
        transform: `translateY(${textY}px)`,
      }}>
        {description}
      </div>
    </div>
  );
};

// Animated progress bar
export const ProgressBar: React.FC<{
  progress: number;
  color?: string;
  height?: number;
  glow?: boolean;
}> = ({ progress, color = "#4ade80", height = 4, glow = false }) => {
  return (
    <div style={{ height, borderRadius: height / 2, background: "rgba(255,255,255,0.06)", overflow: "hidden", position: "relative" }}>
      <div style={{
        height: "100%",
        width: `${progress}%`,
        borderRadius: height / 2,
        background: `linear-gradient(90deg, ${color}, ${color}cc)`,
        transition: "width 0.1s",
        boxShadow: glow ? `0 0 12px ${color}60` : undefined,
      }} />
    </div>
  );
};

// Stat card with animated number
export const StatCard: React.FC<{
  value: string;
  label: string;
  delay?: number;
  color?: string;
}> = ({ value, label, delay = 0, color = "white" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({ frame: frame - delay, fps, config: { damping: 15, mass: 0.5 } });
  const opacity = interpolate(frame, [delay, delay + fps * 0.3], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div style={{
      textAlign: "center",
      opacity,
      transform: `scale(${interpolate(scale, [0, 1], [0.8, 1])})`,
    }}>
      <div style={{ fontSize: 52, fontWeight: 900, color, letterSpacing: "-0.03em" }}>{value}</div>
      <div style={{ fontSize: 14, color: "#666", marginTop: 8, fontWeight: 500 }}>{label}</div>
    </div>
  );
};
