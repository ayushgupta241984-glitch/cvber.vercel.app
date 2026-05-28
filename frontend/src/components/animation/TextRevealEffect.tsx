"use client";

import { motion } from "framer-motion";

export default function TextRevealEffect({ children, className }: { children: string; className?: string }) {
    return (
        <>
            {children.split("").map((char, i) => (
                <motion.span
                    key={i}
                    style={{ display: "inline-block", whiteSpace: "pre" }}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.004, ease: [0.16, 1, 0.3, 1], duration: 0.2 }}
                    viewport={{ once: true }}
                    className={className}
                >
                    {char}
                </motion.span>
            ))}
        </>
    );
}
