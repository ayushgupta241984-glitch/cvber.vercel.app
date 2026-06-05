"use client";

import { motion } from "framer-motion";
import { ArrowRight, ArrowLeft, Shield, Eye, FileText, Link2 } from "lucide-react";

const features = [
    { icon: Shield, title: "C2PA Certificates", desc: "Cryptographic proof of ownership. Recognized by Adobe, Microsoft, Google.", color: "text-purple-400" },
    { icon: Eye, title: "24/7 Monitoring", desc: "We scan social platforms and marketplaces for unauthorized copies.", color: "text-blue-400" },
    { icon: FileText, title: "DMCA Automation", desc: "One-click takedown notices for Instagram, TikTok, YouTube, and more.", color: "text-green-400" },
    { icon: Link2, title: "Blockchain Timestamps", desc: "Permanent proof of existence on the blockchain.", color: "text-amber-400" },
];

interface Props {
    onNext: () => void;
    onBack: () => void;
}

export default function FeatureShowcaseStep({ onNext, onBack }: Props) {
    return (
        <div className="max-w-2xl mx-auto px-6">
            <motion.h2 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-2xl md:text-3xl font-black tracking-tight mb-3 text-center">
                How CVBER protects you
            </motion.h2>
            <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="text-zinc-500 text-sm text-center mb-10">
                Here&apos;s what you get for free.
            </motion.p>

            <div className="grid md:grid-cols-2 gap-4 mb-8">
                {features.map((f, i) => (
                    <motion.div
                        key={f.title}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.15 + i * 0.08 }}
                        className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06]"
                    >
                        <f.icon className={`w-6 h-6 ${f.color} mb-4`} />
                        <h3 className="text-sm font-bold mb-2">{f.title}</h3>
                        <p className="text-xs text-zinc-500 leading-relaxed">{f.desc}</p>
                    </motion.div>
                ))}
            </div>

            <div className="flex gap-3">
                <button onClick={onBack} className="px-6 py-3.5 rounded-xl border border-white/[0.06] text-zinc-400 text-sm font-medium hover:border-white/[0.12] transition-all">
                    <ArrowLeft className="w-4 h-4" />
                </button>
                <button
                    onClick={onNext}
                    className="flex-1 py-3.5 bg-white text-black rounded-xl font-bold text-sm hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                    Continue <ArrowRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
