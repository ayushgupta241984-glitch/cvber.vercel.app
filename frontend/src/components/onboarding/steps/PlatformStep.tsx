"use client";

import { motion } from "framer-motion";
import { ArrowRight, ArrowLeft } from "lucide-react";
import type { OnboardingData } from "../OnboardingWizard";

const platforms = [
    { id: "instagram", label: "Instagram", emoji: "📸" },
    { id: "deviantart", label: "DeviantArt", emoji: "🎨" },
    { id: "artstation", label: "ArtStation", emoji: "🖼️" },
    { id: "tiktok", label: "TikTok", emoji: "🎵" },
    { id: "youtube", label: "YouTube", emoji: "▶️" },
    { id: "pinterest", label: "Pinterest", emoji: "📌" },
    { id: "behance", label: "Behance", emoji: "🎭" },
    { id: "etsy", label: "Etsy / Shopify", emoji: "🛍️" },
    { id: "personal", label: "Personal Website", emoji: "🌐" },
    { id: "other", label: "Other", emoji: "✨" },
];

interface Props {
    data: OnboardingData;
    update: (partial: Partial<OnboardingData>) => void;
    onNext: () => void;
    onBack: () => void;
}

export default function PlatformStep({ data, update, onNext, onBack }: Props) {
    const toggle = (id: string) => {
        const current = data.platforms;
        const next = current.includes(id) ? current.filter((p) => p !== id) : [...current, id];
        update({ platforms: next });
    };

    return (
        <div className="max-w-lg mx-auto px-6">
            <motion.h2 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-2xl md:text-3xl font-black tracking-tight mb-3 text-center">
                Where do you publish your work?
            </motion.h2>
            <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="text-zinc-500 text-sm text-center mb-8">
                Select all that apply. We&apos;ll monitor these platforms.
            </motion.p>

            <div className="grid grid-cols-2 gap-3 mb-8">
                {platforms.map((p, i) => (
                    <motion.button
                        key={p.id}
                        initial={{ y: 15, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1 + i * 0.03 }}
                        onClick={() => toggle(p.id)}
                        className={`flex items-center gap-3 p-3 rounded-xl border text-left text-sm transition-all ${
                            data.platforms.includes(p.id)
                                ? "bg-purple-500/10 border-purple-500/30"
                                : "bg-white/[0.02] border-white/[0.06] hover:border-white/[0.12]"
                        }`}
                    >
                        <span className="text-lg">{p.emoji}</span>
                        <span className="font-medium">{p.label}</span>
                    </motion.button>
                ))}
            </div>

            <div className="flex gap-3">
                <button onClick={onBack} className="px-6 py-3.5 rounded-xl border border-white/[0.06] text-zinc-400 text-sm font-medium hover:border-white/[0.12] transition-all">
                    <ArrowLeft className="w-4 h-4" />
                </button>
                <button
                    onClick={onNext}
                    disabled={data.platforms.length === 0}
                    className="flex-1 py-3.5 bg-white text-black rounded-xl font-bold text-sm hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed active:scale-[0.98]"
                >
                    Continue <ArrowRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
