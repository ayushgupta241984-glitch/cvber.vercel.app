import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { GridBackground, Particles, GlowOrb, NoiseOverlay } from "../Backgrounds";
import { PanelFrame, StepLabel } from "../Components";

export const ProtectScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const protections = [
    { icon: "📝", title: "DMCA Takedown", desc: "Auto-generated, platform-ready", status: "Sent", color: "#4ade80" },
    { icon: "🔗", title: "Blockchain Proof", desc: "OpenTimestamps — timestamp 18:34 UTC", status: "Sealed", color: "#22d3ee" },
    { icon: "📋", title: "C2PA Certificate", desc: "Adobe Content Credentials — origin verified", status: "Signed", color: "#a78bfa" },
    { icon: "💧", title: "Invisible Watermark", desc: "Digimarc payload embedded — survives screenshot", status: "Active", color: "#4ade80" },
  ];

  // Shield animation
  const shieldScale = spring({ frame: frame - fps * 0.5, fps, config: { damping: 12, mass: 0.5 } });
  const shieldPulse = 1 + Math.sin(frame * 0.08) * 0.03;

  // Rings expanding outward
  const ring1 = interpolate(frame, [fps * 0.8, fps * 2], [0.5, 1.5], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const ring1Opacity = interpolate(frame, [fps * 0.8, fps * 2], [0.5, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const ring2 = interpolate(frame, [fps * 1.2, fps * 2.5], [0.5, 1.8], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const ring2Opacity = interpolate(frame, [fps * 1.2, fps * 2.5], [0.4, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <GridBackground opacity={0.03} />
      <Particles count={20} color="rgba(74,222,128,0.1)" />
      <GlowOrb x="50%" y="40%" color="#4ade80" size={300} />
      <NoiseOverlay opacity={0.025} />

      <div style={{ display: "flex", gap: 60, alignItems: "center", position: "relative", zIndex: 1 }}>
        <StepLabel
          step="05"
          title={<>4 layers of legal protection.</>}
          description="DMCA, blockchain proof, C2PA certificate, invisible watermark — all generated instantly."
        />

        <PanelFrame title="CVBER — Protection Layers" delay={fps * 0.3}>
          {/* Shield with rings */}
          <div style={{ textAlign: "center", marginBottom: 20, position: "relative" }}>
            {/* Expanding rings */}
            <div style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: 80,
              height: 80,
              borderRadius: "50%",
              border: "2px solid rgba(74,222,128,0.3)",
              transform: `translate(-50%, -50%) scale(${ring1})`,
              opacity: ring1Opacity,
            }} />
            <div style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: 80,
              height: 80,
              borderRadius: "50%",
              border: "1px solid rgba(74,222,128,0.2)",
              transform: `translate(-50%, -50%) scale(${ring2})`,
              opacity: ring2Opacity,
            }} />

            {/* Shield */}
            <div style={{
              display: "inline-block",
              fontSize: 52,
              transform: `scale(${interpolate(shieldScale, [0, 1], [0.3, 1]) * shieldPulse})`,
              filter: "drop-shadow(0 0 30px rgba(74,222,128,0.5))",
              position: "relative",
              zIndex: 1,
            }}>
              🛡️
            </div>
            <div style={{
              fontSize: 12,
              color: "#4ade80",
              fontWeight: 700,
              marginTop: 8,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              opacity: interpolate(frame, [fps * 1, fps * 1.5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
            }}>
              Protection Active
            </div>
          </div>

          {/* Protection layers */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {protections.map((p, i) => {
              const layerDelay = fps * (1.5 + i * 0.6);
              const layerOpacity = interpolate(frame, [layerDelay, layerDelay + fps * 0.4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
              const layerX = interpolate(frame, [layerDelay, layerDelay + fps * 0.4], [20, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
              const ringScale = spring({ frame: frame - layerDelay, fps, config: { damping: 12, mass: 0.4 } });
              const checkAppear = spring({ frame: frame - (layerDelay + fps * 0.3), fps, config: { damping: 10 } });

              return (
                <div key={p.title} style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 14px",
                  borderRadius: 10,
                  background: "rgba(255,255,255,0.02)",
                  border: `1px solid ${p.color}15`,
                  opacity: layerOpacity,
                  transform: `translateX(${layerX}px)`,
                }}>
                  {/* Icon with ring */}
                  <div style={{
                    width: 38,
                    height: 38,
                    borderRadius: "50%",
                    border: `2px solid ${p.color}40`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 16,
                    transform: `scale(${interpolate(ringScale, [0, 1], [0.5, 1])})`,
                    boxShadow: `0 0 15px ${p.color}15`,
                  }}>
                    {p.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#ccc" }}>{p.title}</div>
                    <div style={{ fontSize: 10, color: "#555" }}>{p.desc}</div>
                  </div>
                  {/* Status badge */}
                  <div style={{
                    padding: "3px 12px",
                    borderRadius: 20,
                    fontSize: 10,
                    fontWeight: 700,
                    color: p.color,
                    background: `${p.color}15`,
                    transform: `scale(${interpolate(checkAppear, [0, 1], [0.5, 1])})`,
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}>
                    <span style={{ fontSize: 8 }}>✓</span>
                    {p.status}
                  </div>
                </div>
              );
            })}
          </div>
        </PanelFrame>
      </div>
    </AbsoluteFill>
  );
};
