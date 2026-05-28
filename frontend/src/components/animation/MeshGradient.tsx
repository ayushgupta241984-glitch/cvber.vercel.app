"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface MeshGradientProps {
    className?: string;
    colors?: string[];
    speed?: number;
}

export default function MeshGradient({
    className, colors = ["#0a0a0f", "#1a1a1a", "#0f0a05", "#C9A962", "#8B7355"], speed = 0.001,
}: MeshGradientProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let animationFrameId: number;
        let time = 0;
        let lastFrame = 0;

        const resize = () => {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
        };
        resize();
        window.addEventListener("resize", resize);

        const step = 20;
        const draw = (now: number) => {
            if (now - lastFrame < 32) { animationFrameId = requestAnimationFrame(draw); return; }
            lastFrame = now;
            time += speed;
            const w = canvas.width;
            const h = canvas.height;

            ctx.clearRect(0, 0, w, h);

            for (let x = 0; x < w; x += step) {
                for (let y = 0; y < h; y += step) {
                    const n1 = noise(x * 0.002, y * 0.002, time);
                    const n2 = noise(x * 0.003 + 100, y * 0.003 + 100, time * 0.7);

                    const blend = (n1 + n2) * 0.5;
                    const colorIndex = Math.max(0, Math.min(colors.length - 1, Math.floor((blend + 0.5) * (colors.length - 1))));
                    const c = colors[colorIndex];

                    ctx.fillStyle = c;
                    ctx.globalAlpha = 0.3 + blend * 0.4;
                    ctx.fillRect(x, y, step, step);
                }
            }

            animationFrameId = requestAnimationFrame(draw);
        };
        animationFrameId = requestAnimationFrame(draw);

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener("resize", resize);
        };
    }, [colors, speed]);

    return (
        <canvas
            ref={canvasRef}
            className={cn("w-full h-full", className)}
        />
    );
}

function noise(x: number, y: number, t: number): number {
    const val = Math.sin(x * 3.0 + t) * Math.cos(y * 2.5 + t * 0.7)
        + Math.sin(x * 1.5 + y * 1.2 + t * 0.5) * 0.5
        + Math.cos(x * 2.0 - y * 3.0 + t * 0.3) * 0.3;
    return Math.max(-1, Math.min(1, val));
}
