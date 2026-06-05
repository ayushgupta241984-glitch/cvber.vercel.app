"use client";

import { motion } from "framer-motion";
import { Shield, ArrowRight } from "lucide-react";

interface Props {
    onComplete: () => void;
}

export default function ConfirmationStep({ onComplete }: Props) {
    return (
        <div className="max-w-lg mx-auto px-6 text-center">
            <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
                className="w-20 h-20 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-8"
            >
                <Shield className="w-10 h-10 text-purple-400" />
            </motion.div>

            <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-3xl md:text-4xl font-black tracking-tight mb-4"
            >
                You&apos;re all set.
            </motion.h2>

            <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-zinc-500 text-sm mb-10 max-w-sm mx-auto"
            >
                Your art is about to be protected. Upload your first piece to get started.
            </motion.p>

            <motion.button
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                onClick={onComplete}
                className="px-10 py-5 bg-white text-black rounded-xl font-bold text-sm hover:bg-zinc-200 transition-all flex items-center gap-3 mx-auto active:scale-95 shadow-[0_20px_40px_rgba(255,255,255,0.05)]"
            >
                Go to Dashboard
                <ArrowRight className="w-5 h-5" />
            </motion.button>

            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="text-zinc-600 text-xs mt-6"
            >
                Your preferences have been saved. You can change them anytime.
            </motion.p>
        </div>
    );
}
