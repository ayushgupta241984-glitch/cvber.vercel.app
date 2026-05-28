"use client";

import { motion } from "framer-motion";

interface SlideEffectProps {
    children: React.ReactNode;
    direction?: "top" | "bottom" | "left" | "right";
    delay?: number;
    duration?: number;
    className?: string;
}

export default function SlideEffect({
    children, direction = "top", delay = 0, duration = 0.35, className,
}: SlideEffectProps) {
    const offset = 60;
    const initial = {
        opacity: 0,
        y: direction === "top" ? offset : direction === "bottom" ? -offset : 0,
        x: direction === "left" ? offset : direction === "right" ? -offset : 0,
    };

    return (
        <motion.div
            initial={initial}
            whileInView={{ opacity: 1, y: 0, x: 0 }}
            viewport={{ once: true, amount: 0.05 }}
            transition={{ duration, ease: [0.16, 1, 0.3, 1], delay }}
            className={className}
        >
            {children}
        </motion.div>
    );
}
