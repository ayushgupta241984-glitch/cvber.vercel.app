"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface FollowCursorProps {
    size?: number;
    color?: string;
}

export default function FollowCursor({ size = 6, color = "rgba(201, 169, 98, 0.3)" }: FollowCursorProps) {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const updateMousePosition = (e: MouseEvent) => {
            setPosition({ x: e.clientX, y: e.clientY });
            if (!isVisible) setIsVisible(true);
        };
        window.addEventListener("mousemove", updateMousePosition);
        return () => window.removeEventListener("mousemove", updateMousePosition);
    }, [isVisible]);

    return (
        <motion.div
            className="pointer-events-none fixed"
            animate={{ x: position.x - size / 2, y: position.y - size / 2 }}
            transition={{ type: "spring", mass: 0.15, damping: 8, stiffness: 800 }}
            style={{
                width: size, height: size, borderRadius: "50%",
                backgroundColor: color, zIndex: 9999999,
                opacity: isVisible ? 1 : 0,
            }}
        />
    );
}
