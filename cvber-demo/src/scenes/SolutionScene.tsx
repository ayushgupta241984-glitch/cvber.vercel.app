import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { GridBackground, Particles, GlowOrb, NoiseOverlay } from "../Backgrounds";

export const SolutionScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const labelOpacity = interpolate(frame, [fps * 0.3, fps * 0.7], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const headlineOpacity = interpolate(frame, [fps * 0.5, fps * 1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const headlineY = interpolate(frame, [fps * 0.5, fps * 1], [40, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const steps = ["Upload", "AI Analyze", "Scan 12.4M+", "Detect", "DMCA", "Blockchain", "C2PA", "Monitor"];

  // Animated connector line between pills
  const lineProgress = interpolate(frame, [fps * 1.5, fps * 3], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <GridBackground opacity={0.04} />
      <Particles count={25} color="rgba(74,222,128,0.12)" />
      <GlowOrb x="40%" y="40%" color="#4ade80" size={400} />
      <GlowOrb x="70%" y="60%" color="#22d3ee" size={300} />
      <NoiseOverlay opacity={0.025} />

      <div style={{ textAlign: "center", maxWidth: 1000, position: "relative", zIndex: 1 }}>
        {/* Label */}
        <div style={{
          fontSize: 14,
          fontWeight: 700,
          letterSpacing: "0.3em",
          color: "#4ade80",
          textTransform: "uppercase",
          marginBottom: 30,
          opacity: labelOpacity,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
        }}>
          <div style={{ width: 20, height: 1, background: "#4ade80" }} />
          The Solution
          <div style={{ width: 20, height: 1, background: "#4ade80" }} />
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
          marginBottom: 50,
        }}>
          The first <span style={{ color: "#4ade80" }}>free, full-pipeline</span>{" "}
          copyright shield.
        </div>

        {/* Pipeline pills with connector */}
        <div style={{ position: "relative" }}>
          {/* Connector line */}
          <div style={{
            position: "absolute",
            top: "50%",
            left: "10%",
            right: "10%",
            height: 1,
            background: "linear-gradient(90deg, rgba(74,222,128,0.3), rgba(34,211,238,0.3))",
            transform: `scaleX(${lineProgress})`,
            transformOrigin: "left",
            zIndex: 0,
          }} />

          <div style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: 12,
            position: "relative",
            zIndex: 1,
          }}>
            {steps.map((step, i) => {
              const pillDelay = fps * 1.2 + i * 4;
              const pillScale = spring({ frame: frame - pillDelay, fps, config: { damping: 12, mass: 0.4 } });
              const pillOpacity = interpolate(frame, [pillDelay, pillDelay + 6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
              const isActive = frame > pillDelay + 10;
              return (
                <div
                  key={step}
                  style={{
                    padding: "10px 20px",
                    borderRadius: 30,
                    border: `1px solid ${isActive ? "rgba(74,222,128,0.3)" : "rgba(255,255,255,0.08)"}`,
                    background: isActive ? "rgba(74,222,128,0.08)" : "rgba(255,255,255,0.02)",
                    fontSize: 13,
                    fontWeight: 700,
                    color: isActive ? "#4ade80" : "#888",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    opacity: pillOpacity,
                    transform: `scale(${interpolate(pillScale, [0, 1], [0.6, 1])})`,
                    boxShadow: isActive ? "0 0 20px rgba(74,222,128,0.1)" : "none",
                    transition: "all 0.3s",
                  }}
                >
                  {step}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
