"use client";

import { motion } from "framer-motion";
import { Shield, ArrowRight, Mail } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function WelcomeStep({ onNext }: { onNext: () => void }) {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        router.push(`/register?email=${encodeURIComponent(email)}`);
    };

    return (
        <div className="max-w-lg mx-auto px-6 text-center">
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5 }}>
                <Shield className="w-12 h-12 text-purple-400 mx-auto mb-8" />
            </motion.div>

            <motion.h2 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="text-3xl md:text-4xl font-black tracking-tight mb-4">
                Protect your art<br />from AI theft
            </motion.h2>

            <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="text-zinc-500 text-sm mb-10">
                Free C2PA certificates, DMCA automation, 24/7 monitoring.
            </motion.p>

            <motion.form onSubmit={handleSubmit} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="space-y-3">
                <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        required
                        className="w-full pl-11 pr-4 py-4 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-purple-500/30 transition-all"
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-white text-black rounded-xl font-bold text-sm hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98]"
                >
                    {loading ? (
                        <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    ) : (
                        <>Continue <ArrowRight className="w-4 h-4" /></>
                    )}
                </button>
            </motion.form>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="flex items-center justify-center gap-4 mt-6 text-zinc-600 text-xs">
                <span>Free forever</span>
                <span>·</span>
                <span>No credit card</span>
            </motion.div>

            <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                onClick={onNext}
                className="mt-6 text-xs text-zinc-500 hover:text-white transition-colors"
            >
                Already have an account? Sign in →
            </motion.button>
        </div>
    );
}
