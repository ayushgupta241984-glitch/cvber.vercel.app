"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface SpotlightCardProps {
    children: React.ReactNode;
    className?: string;
    spotlightColor?: string;
    radius?: number;
}

export default function SpotlightCard({
    children, className, spotlightColor = "rgba(201, 169, 98, 0.12)", radius = 400,
}: SpotlightCardProps) {
    const divRef = useRef<HTMLDivElement>(null);
    const [isFocused, setIsFocused] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [opacity, setOpacity] = useState(0);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!divRef.current) return;
        const rect = divRef.current.getBoundingClientRect();
        setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };

    return (
        <div
            ref={divRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => { setIsFocused(true); setOpacity(1); }}
            onMouseLeave={() => { setIsFocused(false); setOpacity(0); }}
            className={cn("relative overflow-hidden", className)}
        >
            <div
                className="pointer-events-none absolute inset-0 transition-opacity duration-150"
                style={{ opacity }}
            >
                <div
                    className="absolute inset-0"
                    style={{
                        background: `radial-gradient(${radius}px circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 80%)`,
                    }}
                />
            </div>
            {children}
        </div>
    );
}
