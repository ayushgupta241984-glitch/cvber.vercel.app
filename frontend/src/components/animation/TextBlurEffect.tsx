"use client";

import { motion } from "framer-motion";

export default function TextBlurEffect({ children, className }: { children: string; className?: string }) {
    return (
        <>
            {children.split("").map((char, i) => (
                <motion.span
                    key={i}
                    style={{ display: "inline-block", whiteSpace: "pre" }}
                    initial={{ opacity: 0, filter: "blur(32px)", scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, filter: "blur(0px)", scale: 1, y: 0 }}
                    transition={{ delay: i * 0.008, ease: [0.16, 1, 0.3, 1], duration: 0.2 }}
                    className={className}
                >
                    {char}
                </motion.span>
            ))}
        </>
    );
}
