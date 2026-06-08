import React from "react";
import { useCurrentFrame, interpolate } from "remotion";

// Animated grid background
export const GridBackground: React.FC<{ opacity?: number }> = ({ opacity = 0.08 }) => {
  const frame = useCurrentFrame();
  const drift = frame * 0.15;
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      {/* Grid */}
      <div style={{
        position: "absolute",
        inset: -100,
        backgroundImage: `
          linear-gradient(rgba(255,255,255,${opacity}) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,${opacity}) 1px, transparent 1px)
        `,
        backgroundSize: "80px 80px",
        transform: `translateY(${drift % 80}px)`,
      }} />
      {/* Radial fade */}
      <div style={{
        position: "absolute",
        inset: 0,
        background: "radial-gradient(ellipse at center, transparent 0%, #050505 70%)",
      }} />
    </div>
  );
};

// Floating particles
export const Particles: React.FC<{ count?: number; color?: string }> = ({ count = 30, color = "rgba(255,255,255,0.15)" }) => {
  const frame = useCurrentFrame();
  const particles = React.useMemo(() => {
    const arr = [];
    for (let i = 0; i < count; i++) {
      arr.push({
        x: (i * 137.508) % 100,
        y: (i * 73.137) % 100,
        size: 1 + (i % 3),
        speed: 0.2 + (i % 5) * 0.1,
        drift: (i % 2 === 0 ? 1 : -1) * (0.3 + (i % 3) * 0.2),
      });
    }
    return arr;
  }, [count]);

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      {particles.map((p, i) => {
        const y = (p.y + frame * p.speed * 0.3) % 110 - 5;
        const x = p.x + Math.sin(frame * 0.02 + i) * p.drift * 10;
        const particleOpacity = interpolate(y, [-5, 10, 90, 105], [0, 0.6, 0.6, 0]);
        return (
          <div key={i} style={{
            position: "absolute",
            left: `${x}%`,
            top: `${y}%`,
            width: p.size,
            height: p.size,
            borderRadius: "50%",
            background: color,
            opacity: particleOpacity,
          }} />
        );
      })}
    </div>
  );
};

// Glow orb (floating accent)
export const GlowOrb: React.FC<{ x: string; y: string; color: string; size?: number }> = ({ x, y, color, size = 300 }) => {
  const frame = useCurrentFrame();
  const drift = Math.sin(frame * 0.015) * 20;
  const driftY = Math.cos(frame * 0.012) * 15;
  return (
    <div style={{
      position: "absolute",
      left: x,
      top: y,
      width: size,
      height: size,
      borderRadius: "50%",
      background: `radial-gradient(circle, ${color}40, transparent 70%)`,
      filter: "blur(60px)",
      transform: `translate(${drift}px, ${driftY}px)`,
      pointerEvents: "none",
    }} />
  );
};

// Noise grain overlay
export const NoiseOverlay: React.FC<{ opacity?: number }> = ({ opacity = 0.03 }) => {
  const frame = useCurrentFrame();
  // Pseudo-random noise via CSS
  return (
    <div style={{
      position: "absolute",
      inset: 0,
      opacity,
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
      backgroundSize: "256px 256px",
      backgroundPosition: `${frame * 7}px ${frame * 11}px`,
      pointerEvents: "none",
      mixBlendMode: "overlay",
    }} />
  );
};

// Scan line
export const ScanLine: React.FC<{ color?: string; speed?: number }> = ({ color = "rgba(74,222,128,0.15)", speed = 0.4 }) => {
  const frame = useCurrentFrame();
  const y = (frame * speed) % 120 - 10;
  return (
    <div style={{
      position: "absolute",
      left: 0,
      right: 0,
      top: `${y}%`,
      height: 2,
      background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
      pointerEvents: "none",
    }} />
  );
};

// Animated gradient border
export const GradientBorder: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => {
  const frame = useCurrentFrame();
  const angle = frame * 2;
  return (
    <div style={{
      position: "relative",
      borderRadius: 16,
      padding: 1,
      background: `conic-gradient(from ${angle}deg, #4ade80, #22d3ee, #a78bfa, #f472b6, #4ade80)`,
      ...style,
    }}>
      <div style={{ borderRadius: 15, background: "#0a0a0a", width: "100%", height: "100%" }}>
        {children}
      </div>
    </div>
  );
};
