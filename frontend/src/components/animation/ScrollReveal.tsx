"use client";

import { motion, type Target } from "framer-motion";
import { cn } from "@/lib/utils";

type RevealVariant = "fade-up" | "fade-down" | "fade-left" | "fade-right" | "zoom-in" | "zoom-out" | "flip-up" | "blur-in" | "slide-up-spring";

interface ScrollRevealProps {
    children: React.ReactNode;
    className?: string;
    variant?: RevealVariant;
    delay?: number;
    duration?: number;
    once?: boolean;
    amount?: number;
}

const variants: Record<RevealVariant, Target> = {
    "fade-up": { opacity: 0, y: 60 },
    "fade-down": { opacity: 0, y: -60 },
    "fade-left": { opacity: 0, x: 60 },
    "fade-right": { opacity: 0, x: -60 },
    "zoom-in": { opacity: 0, scale: 0.8 },
    "zoom-out": { opacity: 0, scale: 1.2 },
    "flip-up": { opacity: 0, y: 40, rotateX: -15 },
    "blur-in": { opacity: 0 },
    "slide-up-spring": { opacity: 0, y: 80 },
};

const easing: [number, number, number, number] = [0.16, 1, 0.3, 1];
const springEasing = { type: "spring" as const, stiffness: 350, damping: 12, mass: 0.3 };

export default function ScrollReveal({
    children, className, variant = "fade-up", delay = 0, duration = 0.2, once = true, amount = 0.02,
}: ScrollRevealProps) {
    return (
        <motion.div
            initial={variants[variant]}
            whileInView={{ opacity: 1, y: 0, x: 0, scale: 1, rotateX: 0 }}
            viewport={{ once, amount }}
            transition={variant === "slide-up-spring" ? { ...springEasing, delay } : { duration, ease: easing, delay }}
            className={cn(className)}
        >
            {children}
        </motion.div>
    );
}
