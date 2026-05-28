"use client";

import { motion, type TargetAndTransition } from "framer-motion";
import { cn } from "@/lib/utils";

interface TextRevealProps {
    children: string;
    className?: string;
    as?: "h1" | "h2" | "h3" | "h4" | "p" | "span" | "div";
    per?: "char" | "word";
    delay?: number;
    stagger?: number;
    variant?: "blur" | "fade" | "slide" | "scale";
}

const styles: Record<string, { initial: TargetAndTransition; animate: TargetAndTransition }> = {
    blur: { initial: { opacity: 0 }, animate: { opacity: 1 } },
    fade: { initial: { opacity: 0 }, animate: { opacity: 1 } },
    slide: { initial: { opacity: 0, y: 30 }, animate: { opacity: 1, y: 0 } },
    scale: { initial: { opacity: 0, scale: 0.9 }, animate: { opacity: 1, scale: 1 } },
};

const easing: [number, number, number, number] = [0.22, 1, 0.36, 1];

export default function TextReveal({
    children, className, as: Tag = "span", per = "word", delay = 0, stagger = 0.04, variant = "slide",
}: TextRevealProps) {
    const segments = per === "word" ? children.split(/(\s+)/) : children.split("");

    return (
        <Tag className={cn("inline", className)}>
            {segments.map((seg, i) => (
                <motion.span
                    key={i}
                    style={{ display: "inline-block", whiteSpace: per === "word" && seg === " " ? "pre" : "inline-block" }}
                    initial={styles[variant].initial}
                    animate={styles[variant].animate}
                    transition={{ delay: delay + i * stagger, duration: 0.3, ease: easing }}
                >
                    {seg}
                </motion.span>
            ))}
        </Tag>
    );
}
