import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { GridBackground, Particles, GlowOrb, NoiseOverlay, ScanLine } from "../Backgrounds";
import { StatCard } from "../Components";
import { useCountUp } from "../utils";

export const ProblemScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Label
  const labelOpacity = interpolate(frame, [fps * 0.3, fps * 0.7], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Main headline
  const headlineOpacity = interpolate(frame, [fps * 0.5, fps * 1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const headlineY = interpolate(frame, [fps * 0.5, fps * 1], [40, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Counter
  const count = useCountUp(580, fps * 0.8, fps * 2);

  // Glitch effect on the number
  const glitchActive = frame > fps * 0.8 && frame < fps * 1.2;
  const glitchX = glitchActive ? Math.sin(frame * 5) * 3 : 0;

  // Red scan line
  const scanY = interpolate(frame, [fps * 0.5, fps * 4], [-10, 110], { extrapolateRight: "clamp" });

  // Exit
  const exitOpacity = interpolate(frame, [fps * 6.5, fps * 7.5], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Red vignette
  const vignetteOpacity = interpolate(frame, [fps * 0.5, fps * 2], [0, 0.15], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity: exitOpacity }}>
      <GridBackground opacity={0.03} />
      <Particles count={15} color="rgba(239,68,68,0.15)" />
      <GlowOrb x="60%" y="30%" color="#ef4444" size={350} />
      <NoiseOverlay opacity={0.03} />

      {/* Red vignette */}
      <div style={{
        position: "absolute",
        inset: 0,
        background: "radial-gradient(ellipse at center, transparent 40%, rgba(239,68,68,0.08) 100%)",
        opacity: vignetteOpacity,
        pointerEvents: "none",
      }} />

      {/* Red scan line */}
      <div style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: `${scanY}%`,
        height: 1,
        background: "linear-gradient(90deg, transparent, rgba(239,68,68,0.4), transparent)",
        pointerEvents: "none",
      }} />

      <div style={{ textAlign: "center", maxWidth: 1000, position: "relative", zIndex: 1 }}>
        {/* Label */}
        <div style={{
          fontSize: 14,
          fontWeight: 700,
          letterSpacing: "0.3em",
          color: "#ef4444",
          textTransform: "uppercase",
          marginBottom: 30,
          opacity: labelOpacity,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
        }}>
          <div style={{ width: 20, height: 1, background: "#ef4444" }} />
          The Problem
          <div style={{ width: 20, height: 1, background: "#ef4444" }} />
        </div>

        {/* Headline */}
        <div style={{
          fontSize: 72,
          fontWeight: 900,
          color: "white",
          letterSpacing: "-0.03em",
          lineHeight: 0.95,
          opacity: headlineOpacity,
          transform: `translateY(${headlineY}px)`,
        }}>
          AI companies scraped{" "}
          <span style={{
            color: "#ef4444",
            display: "inline-block",
            transform: `translateX(${glitchX}px)`,
            textShadow: glitchActive ? "2px 0 #ef4444, -2px 0 #3b82f6" : "none",
          }}>
            {count}M+
          </span>{" "}
          images without consent.
        </div>

        {/* Stats */}
        <div style={{ display: "flex", justifyContent: "center", gap: 80, marginTop: 60 }}>
          <StatCard value="78%" label="of artists fear AI training" delay={fps * 3} color="#ef4444" />
          <StatCard value="$0" label="compensation paid" delay={fps * 3.5} color="#ef4444" />
          <StatCard value="0" label="free tools that do everything" delay={fps * 4} color="#ef4444" />
        </div>
      </div>
    </AbsoluteFill>
  );
};
