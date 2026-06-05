"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Preloader({ onComplete }: { onComplete: () => void }) {
    const [progress, setProgress] = useState(0);
    const [done, setDone] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress((prev) => {
                const next = prev + Math.floor(Math.random() * 8) + 2;
                return next >= 100 ? 100 : next;
            });
        }, 60);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (progress >= 100) {
            setDone(true);
            setTimeout(onComplete, 600);
        }
    }, [progress, onComplete]);

    const digits = String(Math.min(progress, 100)).padStart(3, "0").split("");

    return (
        <AnimatePresence>
            {!done && (
                <motion.div
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
                    className="fixed inset-0 z-[100] bg-[#050505] flex items-center justify-center"
                >
                    <div className="flex items-baseline gap-1">
                        {digits.map((d, i) => (
                            <motion.span
                                key={`${i}-${d}`}
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                className="text-6xl md:text-8xl font-black tracking-tighter text-white/10"
                                style={{ fontVariantNumeric: "tabular-nums" }}
                            >
                                {d}
                            </motion.span>
                        ))}
                        <span className="text-6xl md:text-8xl font-black tracking-tighter text-white/10 ml-2">%</span>
                    </div>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="absolute bottom-20 text-[10px] text-zinc-600 uppercase tracking-[0.3em]"
                    >
                        Loading
                    </motion.p>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
