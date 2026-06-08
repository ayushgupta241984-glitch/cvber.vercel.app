import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { GridBackground, Particles, NoiseOverlay } from "../Backgrounds";
import { PanelFrame, StepLabel, ProgressBar } from "../Components";
import { useProgress } from "../utils";

export const AnalyzeScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const overallProgress = useProgress(100, fps * 0.8, fps * 3);

  const items = [
    { label: "Face recognition", sub: "5 known matches", icon: "👤", target: 95, color: "#4ade80" },
    { label: "Watermark detection", sub: "Invisible Digimarc + visible", icon: "💧", target: 88, color: "#22d3ee" },
    { label: "C2PA metadata", sub: "Origin + chain of custody", icon: "📋", target: 92, color: "#a78bfa" },
    { label: "Steganography", sub: "Hidden data extraction", icon: "🔬", target: 85, color: "#f472b6" },
    { label: "Similarity fingerprint", sub: "Perceptual hash vector", icon: "🧬", target: 90, color: "#fbbf24" },
  ];

  // Pulsing dot animation
  const dotScale = interpolate(Math.sin(frame * 0.15) * 0.5 + 0.5, [0, 1], [0.8, 1.2]);

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <GridBackground opacity={0.03} />
      <Particles count={15} />
      <NoiseOverlay opacity={0.025} />

      <div style={{ display: "flex", gap: 60, alignItems: "center", position: "relative", zIndex: 1 }}>
        <StepLabel
          step="02"
          title={<>AI inspects every layer.</>}
          description="12-layer CVBER classifier. Groq LLaMA 3.7B analyzes semantically. Pillow reads EXIF/XMP."
        />

        <PanelFrame title="CVBER — AI Analysis" delay={fps * 0.3}>
          {/* Processing indicator */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <div style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#4ade80",
              transform: `scale(${dotScale})`,
              boxShadow: "0 0 10px rgba(74,222,128,0.5)",
            }} />
            <span style={{ fontSize: 11, color: "#666", fontWeight: 600 }}>Processing layers...</span>
            <div style={{ flex: 1 }} />
            <span style={{ fontSize: 11, color: "#4ade80", fontWeight: 700 }}>{Math.round(overallProgress)}%</span>
          </div>

          {/* Overall progress */}
          <ProgressBar progress={overallProgress} color="#4ade80" height={3} glow />

          {/* Individual analyzers */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 16 }}>
            {items.map((item, i) => {
              const itemProgress = useProgress(item.target, fps * (0.8 + i * 0.4), fps * 1.5);
              const itemOpacity = interpolate(frame, [fps * (0.6 + i * 0.4), fps * (1 + i * 0.4)], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
              const itemX = interpolate(frame, [fps * (0.6 + i * 0.4), fps * (1 + i * 0.4)], [15, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

              return (
                <div key={item.label} style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 14px",
                  borderRadius: 10,
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.04)",
                  opacity: itemOpacity,
                  transform: `translateX(${itemX}px)`,
                }}>
                  <div style={{
                    fontSize: 18,
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: `${item.color}10`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}>
                    {item.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#ccc" }}>{item.label}</div>
                    <div style={{ fontSize: 10, color: "#555" }}>{item.sub}</div>
                  </div>
                  <div style={{ width: 100 }}>
                    <ProgressBar progress={itemProgress} color={item.color} height={3} />
                  </div>
                  <div style={{ fontSize: 10, color: item.color, fontWeight: 700, width: 35, textAlign: "right" }}>
                    {Math.round(itemProgress)}%
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
