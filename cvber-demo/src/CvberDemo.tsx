import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { TitleScene } from "./scenes/TitleScene";
import { ProblemScene } from "./scenes/ProblemScene";
import { SolutionScene } from "./scenes/SolutionScene";
import { UploadScene } from "./scenes/UploadScene";
import { AnalyzeScene } from "./scenes/AnalyzeScene";
import { ScanScene } from "./scenes/ScanScene";
import { DetectScene } from "./scenes/DetectScene";
import { ProtectScene } from "./scenes/ProtectScene";
import { CtaScene } from "./scenes/CtaScene";

const FPS = 30;

// Scene wrapper with fade in/out transitions
const SceneTransition: React.FC<{
  children: React.ReactNode;
  durationInFrames: number;
  fadeIn?: number;
  fadeOut?: number;
}> = ({ children, durationInFrames, fadeIn = 12, fadeOut = 12 }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(
    frame,
    [0, fadeIn, durationInFrames - fadeOut, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  return (
    <AbsoluteFill style={{ opacity }}>
      {children}
    </AbsoluteFill>
  );
};

export const CvberDemo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#050505" }}>
      {/* Scene 1: Title (0-5s) */}
      <Sequence from={0} durationInFrames={5 * FPS}>
        <SceneTransition durationInFrames={5 * FPS}>
          <TitleScene />
        </SceneTransition>
      </Sequence>

      {/* Scene 2: Problem (5-13s) */}
      <Sequence from={5 * FPS} durationInFrames={8 * FPS}>
        <SceneTransition durationInFrames={8 * FPS}>
          <ProblemScene />
        </SceneTransition>
      </Sequence>

      {/* Scene 3: Solution (13-19s) */}
      <Sequence from={13 * FPS} durationInFrames={6 * FPS}>
        <SceneTransition durationInFrames={6 * FPS}>
          <SolutionScene />
        </SceneTransition>
      </Sequence>

      {/* Scene 4: Upload (19-27s) */}
      <Sequence from={19 * FPS} durationInFrames={8 * FPS}>
        <SceneTransition durationInFrames={8 * FPS}>
          <UploadScene />
        </SceneTransition>
      </Sequence>

      {/* Scene 5: Analyze (27-35s) */}
      <Sequence from={27 * FPS} durationInFrames={8 * FPS}>
        <SceneTransition durationInFrames={8 * FPS}>
          <AnalyzeScene />
        </SceneTransition>
      </Sequence>

      {/* Scene 6: Scan (35-45s) */}
      <Sequence from={35 * FPS} durationInFrames={10 * FPS}>
        <SceneTransition durationInFrames={10 * FPS}>
          <ScanScene />
        </SceneTransition>
      </Sequence>

      {/* Scene 7: Detect (45-53s) */}
      <Sequence from={45 * FPS} durationInFrames={8 * FPS}>
        <SceneTransition durationInFrames={8 * FPS}>
          <DetectScene />
        </SceneTransition>
      </Sequence>

      {/* Scene 8: Protect (53-63s) */}
      <Sequence from={53 * FPS} durationInFrames={10 * FPS}>
        <SceneTransition durationInFrames={10 * FPS}>
          <ProtectScene />
        </SceneTransition>
      </Sequence>

      {/* Scene 9: CTA (63-90s) */}
      <Sequence from={63 * FPS} durationInFrames={27 * FPS}>
        <SceneTransition durationInFrames={27 * FPS} fadeIn={15}>
          <CtaScene />
        </SceneTransition>
      </Sequence>
    </AbsoluteFill>
  );
};
