import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { GridBackground, Particles, NoiseOverlay } from "../Backgrounds";
import { PanelFrame, StepLabel, ProgressBar } from "../Components";
import { useCountUp } from "../utils";

export const ScanScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scanCount = useCountUp(12400000, fps * 0.8, fps * 4);

  // Radar
  const radarAngle = interpolate(frame, [0, fps * 4], [0, 720], { extrapolateRight: "clamp" });
  const radarFadeIn = interpolate(frame, [0, fps * 0.5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const engines = [
    { name: "Google Vision", target: 100, color: "#4ade80" },
    { name: "TinEye", target: 100, color: "#4ade80" },
    { name: "Yandex", target: 95, color: "#22d3ee" },
    { name: "Bing", target: 88, color: "#22d3ee" },
    { name: "PimEyes", target: 80, color: "#fbbf24" },
  ];

  const scanResults = [
    { platform: "ArtStation", url: "artstation.com/user/38472", date: "2024-11-12", risk: "high" as const },
    { platform: "DeviantArt", url: "deviantart.com/view/918237", date: "2024-12-03", risk: "high" as const },
    { platform: "Pixiv", url: "pixiv.net/artworks/10293", date: "2025-01-15", risk: "medium" as const },
  ];

  // Blip positions
  const blips = [
    { x: 35, y: 25, delay: fps * 1.5 },
    { x: 70, y: 55, delay: fps * 2 },
    { x: 50, y: 80, delay: fps * 2.5 },
    { x: 85, y: 35, delay: fps * 3 },
    { x: 20, y: 65, delay: fps * 3.5 },
    { x: 60, y: 20, delay: fps * 4 },
  ];

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <GridBackground opacity={0.03} />
      <Particles count={15} />
      <NoiseOverlay opacity={0.025} />

      <div style={{ display: "flex", gap: 60, alignItems: "center", position: "relative", zIndex: 1 }}>
        <StepLabel
          step="03"
          title={<>Scan <span style={{ color: "#22d3ee" }}>12.4M+</span> sources.</>}
          description="5 reverse image search engines run in parallel. SSE streaming shows results as they arrive."
        />

        <PanelFrame title="CVBER — Scan" delay={fps * 0.3}>
          {/* Radar */}
          <div style={{ position: "relative", width: 130, height: 130, margin: "0 auto 16px", opacity: radarFadeIn }}>
            {/* Rings */}
            {[0, 18, 36].map((inset) => (
              <div key={inset} style={{
                position: "absolute",
                inset: inset,
                borderRadius: "50%",
                border: `1px solid rgba(255,255,255,${0.06 - inset * 0.001})`,
              }} />
            ))}
            {/* Sweep */}
            <div style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              width: "50%",
              height: 2,
              transformOrigin: "0 0",
              transform: `rotate(${radarAngle}deg)`,
              background: "linear-gradient(90deg, rgba(34,211,238,0.8), transparent)",
            }} />
            {/* Sweep glow */}
            <div style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              width: "50%",
              height: 30,
              transformOrigin: "0 0",
              transform: `rotate(${radarAngle - 15}deg)`,
              background: "linear-gradient(90deg, rgba(34,211,238,0.1), transparent)",
              filter: "blur(8px)",
            }} />
            {/* Blips */}
            {blips.map((blip, i) => {
              const blipScale = spring({ frame: frame - blip.delay, fps, config: { damping: 10, mass: 0.3 } });
              const blipOpacity = interpolate(frame, [blip.delay, blip.delay + 5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
              const blipPulse = 1 + Math.sin((frame - blip.delay) * 0.2) * 0.2;
              return (
                <div key={i} style={{
                  position: "absolute",
                  left: `${blip.x}%`,
                  top: `${blip.y}%`,
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#22d3ee",
                  boxShadow: "0 0 12px rgba(34,211,238,0.8)",
                  opacity: blipOpacity,
                  transform: `translate(-50%, -50%) scale(${blipScale * blipPulse})`,
                }} />
              );
            })}
            {/* Center dot */}
            <div style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: "#fff",
              transform: "translate(-50%, -50%)",
              boxShadow: "0 0 15px rgba(255,255,255,0.5)",
            }} />
          </div>

          {/* Scan count */}
          <div style={{ fontSize: 22, fontWeight: 900, color: "#22d3ee", textAlign: "center", marginBottom: 14, letterSpacing: "-0.02em" }}>
            {scanCount.toLocaleString()} sources scanned
          </div>

          {/* Engines */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 }}>
            {engines.map((eng, i) => {
              const engProgress = interpolate(frame, [fps * (0.8 + i * 0.3), fps * (2.5 + i * 0.3)], [0, eng.target], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
              return (
                <div key={eng.name} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ fontSize: 10, color: "#666", width: 80, fontWeight: 500 }}>{eng.name}</div>
                  <div style={{ flex: 1 }}>
                    <ProgressBar progress={engProgress} color={eng.color} height={2} />
                  </div>
                  <div style={{ fontSize: 9, color: eng.color, fontWeight: 700, width: 30, textAlign: "right" }}>
                    {Math.round(engProgress)}%
                  </div>
                </div>
              );
            })}
          </div>

          {/* Results */}
          {scanResults.map((r, i) => {
            const rDelay = fps * (5 + i * 1);
            const rOpacity = interpolate(frame, [rDelay, rDelay + fps * 0.4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            const rX = interpolate(frame, [rDelay, rDelay + fps * 0.4], [15, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            const isHigh = r.risk === "high";
            return (
              <div key={r.platform} style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 12px",
                borderRadius: 8,
                background: isHigh ? "rgba(239,68,68,0.05)" : "rgba(234,179,8,0.05)",
                border: `1px solid ${isHigh ? "rgba(239,68,68,0.15)" : "rgba(234,179,8,0.15)"}`,
                marginBottom: 4,
                opacity: rOpacity,
                transform: `translateX(${rX}px)`,
              }}>
                <div style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: isHigh ? "#ef4444" : "#eab308",
                  boxShadow: `0 0 8px ${isHigh ? "rgba(239,68,68,0.5)" : "rgba(234,179,8,0.5)"}`,
                }} />
                <div style={{ flex: 1, fontSize: 11, fontWeight: 700, color: "#ccc" }}>{r.platform}</div>
                <div style={{ fontSize: 9, color: "#555" }}>{r.url}</div>
                <div style={{ fontSize: 9, color: "#555" }}>{r.date}</div>
              </div>
            );
          })}
        </PanelFrame>
      </div>
    </AbsoluteFill>
  );
};
