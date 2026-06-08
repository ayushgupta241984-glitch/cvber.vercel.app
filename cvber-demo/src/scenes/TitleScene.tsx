import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { GridBackground, Particles, GlowOrb, NoiseOverlay } from "../Backgrounds";

export const TitleScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // "Introducing" label
  const labelOpacity = interpolate(frame, [fps * 0.3, fps * 0.8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const labelY = interpolate(frame, [fps * 0.3, fps * 0.8], [20, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Main title - character by character reveal
  const title = "CVBER";
  const titleChars = title.split("").map((char, i) => {
    const charDelay = fps * 0.6 + i * 3;
    const charOpacity = interpolate(frame, [charDelay, charDelay + 6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const charY = interpolate(frame, [charDelay, charDelay + 8], [40, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const charScale = spring({ frame: frame - charDelay, fps, config: { damping: 12, mass: 0.4 } });
    return { char, opacity: charOpacity, y: charY, scale: charScale };
  });

  // Gradient line
  const lineScale = spring({ frame: frame - fps * 1, fps, config: { damping: 20 } });

  // Subtitle
  const subOpacity = interpolate(frame, [fps * 1.3, fps * 1.8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const subY = interpolate(frame, [fps * 1.3, fps * 1.8], [15, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Glow pulse behind title
  const glowScale = interpolate(frame, [fps * 0.8, fps * 2], [0.5, 1.2], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const glowOpacity = interpolate(frame, [fps * 0.8, fps * 2], [0, 0.4], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <GridBackground opacity={0.04} />
      <Particles count={20} />
      <GlowOrb x="50%" y="40%" color="#4ade80" size={400} />
      <GlowOrb x="30%" y="60%" color="#22d3ee" size={250} />
      <NoiseOverlay opacity={0.025} />

      <div style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
        {/* Glow behind title */}
        <div style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: 500,
          height: 200,
          transform: `translate(-50%, -50%) scale(${glowScale})`,
          background: "radial-gradient(ellipse, rgba(74,222,128,0.15), transparent 70%)",
          opacity: glowOpacity,
          pointerEvents: "none",
        }} />

        {/* "Introducing" */}
        <div style={{
          fontSize: 16,
          fontWeight: 700,
          letterSpacing: "0.4em",
          color: "#666",
          textTransform: "uppercase",
          marginBottom: 30,
          opacity: labelOpacity,
          transform: `translateY(${labelY}px)`,
        }}>
          Introducing
        </div>

        {/* Title - character reveal */}
        <div style={{ display: "flex", justifyContent: "center", gap: 4 }}>
          {titleChars.map((c, i) => (
            <span key={i} style={{
              fontSize: 140,
              fontWeight: 900,
              color: "white",
              letterSpacing: "-0.03em",
              lineHeight: 0.9,
              opacity: c.opacity,
              transform: `translateY(${c.y}px) scale(${interpolate(c.scale, [0, 1], [0.7, 1])})`,
              display: "inline-block",
              textShadow: "0 0 60px rgba(74,222,128,0.2)",
            }}>
              {c.char}
            </span>
          ))}
        </div>

        {/* Gradient line */}
        <div style={{
          width: 100,
          height: 2,
          background: "linear-gradient(90deg, transparent, #4ade80, #22d3ee, transparent)",
          margin: "30px auto",
          transform: `scaleX(${lineScale})`,
        }} />

        {/* Subtitle */}
        <div style={{
          fontSize: 20,
          color: "#888",
          letterSpacing: "0.2em",
          fontWeight: 600,
          opacity: subOpacity,
          transform: `translateY(${subY}px)`,
        }}>
          Free AI-Powered Art Protection
        </div>
      </div>
    </AbsoluteFill>
  );
};
