import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { GridBackground, Particles, NoiseOverlay } from "../Backgrounds";
import { PanelFrame, AnimatedCursor, StepLabel } from "../Components";

export const UploadScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Cursor path — moves from bottom-right to the drop zone
  const cursorPath = [
    { x: 1400, y: 700, frame: 0 },
    { x: 1200, y: 550, frame: fps * 0.8 },
    { x: 1100, y: 450, frame: fps * 1.5 },
    { x: 1050, y: 420, frame: fps * 2 },
  ];

  // File appearance
  const fileAppear = interpolate(frame, [fps * 3, fps * 3.5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const fileScale = spring({ frame: frame - fps * 3, fps, config: { damping: 12 } });

  // Upload progress
  const uploadProgress = interpolate(frame, [fps * 3.5, fps * 6], [0, 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Scan beam
  const scanY = interpolate(frame, [fps * 1, fps * 5], [-10, 110], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Drop zone glow when cursor approaches
  const dropGlow = interpolate(frame, [fps * 1.5, fps * 2.5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <GridBackground opacity={0.03} />
      <Particles count={15} />
      <NoiseOverlay opacity={0.025} />

      <div style={{ display: "flex", gap: 60, alignItems: "center", position: "relative", zIndex: 1 }}>
        <StepLabel
          step="01"
          title={<>Upload any artwork.</>}
          description="Drag and drop. PSD, PNG, JPG, SVG. Pillow validates every file: corruption check, magic bytes, dimension cap."
        />

        <div style={{ position: "relative" }}>
          <PanelFrame title="CVBER Dashboard" delay={fps * 0.3}>
            {/* Drop zone */}
            <div style={{
              border: `2px dashed ${dropGlow > 0.5 ? "rgba(74,222,128,0.4)" : "rgba(255,255,255,0.1)"}`,
              borderRadius: 12,
              padding: "40px 30px",
              textAlign: "center",
              position: "relative",
              overflow: "hidden",
              background: dropGlow > 0.5 ? "rgba(74,222,128,0.03)" : "transparent",
              transition: "all 0.3s",
            }}>
              {/* Scan beam */}
              <div style={{
                position: "absolute",
                left: 0,
                right: 0,
                height: 40,
                top: `${scanY}%`,
                background: "linear-gradient(to bottom, transparent, rgba(74,222,128,0.08), transparent)",
                pointerEvents: "none",
              }} />

              <div style={{ fontSize: 32, marginBottom: 12 }}>📁</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: dropGlow > 0.5 ? "#4ade80" : "#ccc", marginBottom: 4 }}>
                {dropGlow > 0.5 ? "Release to upload" : "Drop artwork here"}
              </div>
              <div style={{ fontSize: 11, color: "#555" }}>PSD, PNG, JPG, SVG — up to 50MB</div>
            </div>

            {/* File appeared */}
            <div style={{
              marginTop: 16,
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "12px 16px",
              borderRadius: 10,
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(74,222,128,0.1)",
              opacity: fileAppear,
              transform: `scale(${interpolate(fileScale, [0, 1], [0.9, 1])})`,
            }}>
              <div style={{
                width: 40,
                height: 40,
                borderRadius: 8,
                background: "linear-gradient(135deg, #7c3aed30, #3b82f630)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
              }}>
                🎨
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#ccc" }}>sunset-painting-v3.psd</div>
                <div style={{ fontSize: 10, color: "#555", marginTop: 2 }}>24.8 MB</div>
              </div>
              {uploadProgress < 100 ? (
                <div style={{ width: 60 }}>
                  <div style={{ height: 3, borderRadius: 2, background: "rgba(255,255,255,0.06)" }}>
                    <div style={{ height: "100%", width: `${uploadProgress}%`, borderRadius: 2, background: "#4ade80" }} />
                  </div>
                  <div style={{ fontSize: 9, color: "#666", textAlign: "right", marginTop: 2 }}>{Math.round(uploadProgress)}%</div>
                </div>
              ) : (
                <div style={{
                  padding: "3px 10px",
                  borderRadius: 20,
                  fontSize: 10,
                  fontWeight: 700,
                  color: "#4ade80",
                  background: "rgba(74,222,128,0.1)",
                }}>
                  ✓ Uploaded
                </div>
              )}
            </div>
          </PanelFrame>

          {/* Animated cursor */}
          <AnimatedCursor path={cursorPath} clickFrame={fps * 2} />
        </div>
      </div>
    </AbsoluteFill>
  );
};
