import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { GridBackground, Particles, GlowOrb, NoiseOverlay } from "../Backgrounds";

export const CtaScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Headline word-by-word reveal
  const words = ["Protect", "your", "art."];
  const highlightWords = ["For", "free."];

  const features = [
    "5 Engines · 12.4M+ Sources",
    "DMCA + Blockchain + C2PA",
    "Real-Time SSE Streaming",
    "Invisible Watermarking",
    "100% Free, No Credit Card",
  ];

  // CTA button
  const ctaScale = spring({ frame: frame - fps * 3, fps, config: { damping: 12, mass: 0.5 } });
  const ctaOpacity = interpolate(frame, [fps * 3, fps * 3.5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Subtitle
  const subOpacity = interpolate(frame, [fps * 4, fps * 4.5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <GridBackground opacity={0.04} />
      <Particles count={30} color="rgba(74,222,128,0.1)" />
      <GlowOrb x="50%" y="35%" color="#4ade80" size={500} />
      <GlowOrb x="30%" y="60%" color="#22d3ee" size={300} />
      <GlowOrb x="70%" y="50%" color="#a78bfa" size={250} />
      <NoiseOverlay opacity={0.025} />

      <div style={{ textAlign: "center", maxWidth: 900, position: "relative", zIndex: 1 }}>
        {/* Headline */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ display: "flex", justifyContent: "center", gap: 16, flexWrap: "wrap" }}>
            {words.map((word, i) => {
              const wordDelay = fps * 0.5 + i * 6;
              const wordScale = spring({ frame: frame - wordDelay, fps, config: { damping: 12, mass: 0.4 } });
              const wordOpacity = interpolate(frame, [wordDelay, wordDelay + 6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
              return (
                <span key={i} style={{
                  fontSize: 80,
                  fontWeight: 900,
                  color: "white",
                  letterSpacing: "-0.03em",
                  opacity: wordOpacity,
                  transform: `scale(${interpolate(wordScale, [0, 1], [0.5, 1])})`,
                  display: "inline-block",
                }}>
                  {word}
                </span>
              );
            })}
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 8 }}>
            {highlightWords.map((word, i) => {
              const wordDelay = fps * 0.8 + i * 6;
              const wordScale = spring({ frame: frame - wordDelay, fps, config: { damping: 12, mass: 0.4 } });
              const wordOpacity = interpolate(frame, [wordDelay, wordDelay + 6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
              return (
                <span key={i} style={{
                  fontSize: 80,
                  fontWeight: 900,
                  color: "#4ade80",
                  letterSpacing: "-0.03em",
                  opacity: wordOpacity,
                  transform: `scale(${interpolate(wordScale, [0, 1], [0.5, 1])})`,
                  display: "inline-block",
                  textShadow: "0 0 40px rgba(74,222,128,0.3)",
                }}>
                  {word}
                </span>
              );
            })}
          </div>
        </div>

        {/* Feature pills */}
        <div style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: 12,
          marginBottom: 50,
        }}>
          {features.map((f, i) => {
            const pillDelay = fps * 1.5 + i * 4;
            const pillScale = spring({ frame: frame - pillDelay, fps, config: { damping: 15, mass: 0.4 } });
            const pillOpacity = interpolate(frame, [pillDelay, pillDelay + 6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            return (
              <div key={f} style={{
                padding: "8px 18px",
                borderRadius: 30,
                border: "1px solid rgba(74,222,128,0.2)",
                background: "rgba(74,222,128,0.05)",
                fontSize: 13,
                fontWeight: 700,
                color: "#4ade80",
                letterSpacing: "0.05em",
                opacity: pillOpacity,
                transform: `scale(${interpolate(pillScale, [0, 1], [0.7, 1])})`,
              }}>
                {f}
              </div>
            );
          })}
        </div>

        {/* CTA button */}
        <div style={{
          opacity: ctaOpacity,
          transform: `scale(${interpolate(ctaScale, [0, 1], [0.8, 1])})`,
        }}>
          {/* Glow behind button */}
          <div style={{
            position: "absolute",
            left: "50%",
            top: "70%",
            width: 400,
            height: 80,
            transform: "translate(-50%, -50%)",
            background: "radial-gradient(ellipse, rgba(74,222,128,0.2), transparent 70%)",
            filter: "blur(30px)",
            pointerEvents: "none",
          }} />

          <div style={{
            display: "inline-block",
            padding: "20px 70px",
            borderRadius: 16,
            background: "linear-gradient(135deg, #4ade80, #22d3ee)",
            fontSize: 22,
            fontWeight: 900,
            color: "#050505",
            letterSpacing: "-0.01em",
            position: "relative",
            boxShadow: "0 10px 40px rgba(74,222,128,0.3), 0 0 0 1px rgba(255,255,255,0.1) inset",
          }}>
            Start protecting at cvber.vercel.app
          </div>
        </div>

        {/* Subtitle */}
        <div style={{
          fontSize: 14,
          color: "#666",
          fontWeight: 500,
          marginTop: 24,
          opacity: subOpacity,
          letterSpacing: "0.05em",
        }}>
          No signup required · No API key needed
        </div>
      </div>
    </AbsoluteFill>
  );
};
