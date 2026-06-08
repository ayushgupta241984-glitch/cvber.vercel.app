import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { GridBackground, Particles, NoiseOverlay } from "../Backgrounds";
import { PanelFrame, StepLabel } from "../Components";

export const DetectScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const detections = [
    { platform: "ArtStation", img: "sunset-v2.jpg", similarity: 97, stolen: true },
    { platform: "DeviantArt", img: "sunset-crop.png", similarity: 89, stolen: true },
    { platform: "Pixiv", img: "sunset-recolor.jpg", similarity: 72, stolen: false },
  ];

  // Glitch effect timing
  const glitchPhase = frame > fps * 1.5 && frame < fps * 3;
  const glitchIntensity = glitchPhase ? Math.sin(frame * 3) * 0.5 + 0.5 : 0;

  // Comparison cards scale in
  const cardScale = spring({ frame: frame - fps * 0.8, fps, config: { damping: 15 } });

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <GridBackground opacity={0.03} />
      <Particles count={15} />
      <NoiseOverlay opacity={0.03} />

      <div style={{ display: "flex", gap: 60, alignItems: "center", position: "relative", zIndex: 1 }}>
        <StepLabel
          step="04"
          title={<>Find every stolen copy.</>}
          description="Deep image search detects theft: identical, cropped, resized, recolored."
        />

        <PanelFrame title="CVBER — Detection Results" delay={fps * 0.3}>
          {/* Side-by-side comparison */}
          <div style={{
            display: "flex",
            gap: 12,
            marginBottom: 20,
            transform: `scale(${interpolate(cardScale, [0, 1], [0.9, 1])})`,
          }}>
            {/* Original */}
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: 9,
                color: "#4ade80",
                fontWeight: 700,
                letterSpacing: "0.1em",
                marginBottom: 6,
                textTransform: "uppercase",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80" }} />
                Your Original
              </div>
              <div style={{
                height: 130,
                borderRadius: 10,
                background: "linear-gradient(135deg, #7c3aed15, #3b82f615, #22d3ee15)",
                border: "1px solid rgba(74,222,128,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                overflow: "hidden",
              }}>
                <div style={{ fontSize: 40 }}>🌅</div>
                {/* Subtle grid */}
                <div style={{
                  position: "absolute",
                  inset: 0,
                  backgroundImage: "linear-gradient(rgba(74,222,128,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(74,222,128,0.03) 1px, transparent 1px)",
                  backgroundSize: "20px 20px",
                }} />
              </div>
            </div>

            {/* Stolen copy */}
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: 9,
                color: "#ef4444",
                fontWeight: 700,
                letterSpacing: "0.1em",
                marginBottom: 6,
                textTransform: "uppercase",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#ef4444" }} />
                Detected Copy
              </div>
              <div style={{
                height: 130,
                borderRadius: 10,
                background: "linear-gradient(135deg, #7c3aed15, #3b82f615, #22d3ee15)",
                border: "1px solid rgba(239,68,68,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                overflow: "hidden",
              }}>
                <div style={{
                  fontSize: 40,
                  filter: "hue-rotate(30deg) saturate(0.8)",
                  transform: `translateX(${glitchIntensity * 3}px)`,
                }}>
                  🌅
                </div>
                {/* Glitch lines */}
                {[15, 30, 50, 70, 85].map((top) => (
                  <div key={top} style={{
                    position: "absolute",
                    top: `${top}%`,
                    left: 0,
                    right: 0,
                    height: 1,
                    background: `rgba(239,68,68,${glitchIntensity * 0.4})`,
                    transform: `translateX(${glitchIntensity * (top % 2 === 0 ? 5 : -5)}px)`,
                  }} />
                ))}
                {/* Red scan overlay */}
                <div style={{
                  position: "absolute",
                  inset: 0,
                  background: `rgba(239,68,68,${glitchIntensity * 0.05})`,
                }} />
              </div>
            </div>
          </div>

          {/* Match percentage badge */}
          {glitchPhase && (
            <div style={{
              textAlign: "center",
              marginBottom: 12,
            }}>
              <div style={{
                display: "inline-block",
                padding: "4px 16px",
                borderRadius: 20,
                background: "rgba(239,68,68,0.15)",
                border: "1px solid rgba(239,68,68,0.3)",
                fontSize: 12,
                fontWeight: 900,
                color: "#ef4444",
                letterSpacing: "0.05em",
              }}>
                ⚠ 97% SIMILARITY DETECTED
              </div>
            </div>
          )}

          {/* Detection list */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {detections.map((d, i) => {
              const itemDelay = fps * (2 + i * 0.8);
              const itemOpacity = interpolate(frame, [itemDelay, itemDelay + fps * 0.4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
              const itemX = interpolate(frame, [itemDelay, itemDelay + fps * 0.4], [20, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
              const isHigh = d.similarity > 85;
              return (
                <div key={d.platform} style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 14px",
                  borderRadius: 10,
                  background: isHigh ? "rgba(239,68,68,0.05)" : "rgba(255,255,255,0.02)",
                  border: `1px solid ${isHigh ? "rgba(239,68,68,0.15)" : "rgba(255,255,255,0.04)"}`,
                  opacity: itemOpacity,
                  transform: `translateX(${itemX}px)`,
                }}>
                  <div style={{ fontSize: 16 }}>{d.stolen ? "⚠️" : "✅"}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#ccc" }}>{d.platform}</div>
                    <div style={{ fontSize: 10, color: "#555" }}>{d.img}</div>
                  </div>
                  <div style={{
                    padding: "3px 12px",
                    borderRadius: 20,
                    fontSize: 11,
                    fontWeight: 900,
                    color: isHigh ? "#ef4444" : d.similarity > 70 ? "#eab308" : "#4ade80",
                    background: isHigh ? "rgba(239,68,68,0.1)" : d.similarity > 70 ? "rgba(234,179,8,0.1)" : "rgba(74,222,128,0.1)",
                  }}>
                    {d.similarity}% match
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
