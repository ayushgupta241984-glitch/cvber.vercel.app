"use client";

import { motion } from "framer-motion";
import { Camera, Palette, Box, Sparkles, HelpCircle } from "lucide-react";
import type { OnboardingData } from "../OnboardingWizard";

const options = [
    { id: "digital-illustrator", label: "Digital Illustrator", desc: "Illustrations, concept art, character designs", icon: Palette },
    { id: "photographer", label: "Photographer", desc: "Professional or hobbyist photography", icon: Camera },
    { id: "3d-artist", label: "3D Artist", desc: "3D renders, models, animations", icon: Box },
    { id: "ai-artist", label: "AI Artist", desc: "AI-generated or AI-refined art", icon: Sparkles },
    { id: "other", label: "Other", desc: "Something else entirely", icon: HelpCircle },
];

interface Props {
    data: OnboardingData;
    update: (partial: Partial<OnboardingData>) => void;
    onNext: () => void;
    onBack: () => void;
}

export default function ArtistTypeStep({ data, update, onNext }: Props) {
    const select = (id: string) => {
        update({ artistType: id });
        setTimeout(onNext, 300);
    };

    return (
        <div className="max-w-lg mx-auto px-6">
            <motion.h2 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-2xl md:text-3xl font-black tracking-tight mb-3 text-center">
                What best describes you?
            </motion.h2>
            <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="text-zinc-500 text-sm text-center mb-10">
                This helps us personalize your experience.
            </motion.p>

            <div className="space-y-3">
                {options.map((opt, i) => (
                    <motion.button
                        key={opt.id}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.15 + i * 0.05 }}
                        onClick={() => select(opt.id)}
                        className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${
                            data.artistType === opt.id
                                ? "bg-purple-500/10 border-purple-500/30"
                                : "bg-white/[0.02] border-white/[0.06] hover:border-white/[0.12]"
                        }`}
                    >
                        <div className="w-10 h-10 rounded-lg bg-white/[0.04] flex items-center justify-center shrink-0">
                            <opt.icon className="w-5 h-5 text-zinc-400" />
                        </div>
                        <div>
                            <p className="text-sm font-bold">{opt.label}</p>
                            <p className="text-xs text-zinc-500">{opt.desc}</p>
                        </div>
                    </motion.button>
                ))}
            </div>
        </div>
    );
}
