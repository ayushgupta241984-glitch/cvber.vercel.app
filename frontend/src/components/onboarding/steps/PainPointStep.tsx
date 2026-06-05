"use client";

import { motion } from "framer-motion";
import { ArrowRight, ArrowLeft, Bot, Repeat, ShieldCheck, FileText, Eye } from "lucide-react";
import type { OnboardingData } from "../OnboardingWizard";

const options = [
    { id: "ai-scraping", label: "AI companies scraping my work", icon: Bot, color: "text-purple-400" },
    { id: "theft-repost", label: "People stealing and reposting", icon: Repeat, color: "text-blue-400" },
    { id: "proving-ownership", label: "Proving I'm the original creator", icon: ShieldCheck, color: "text-green-400" },
    { id: "dmca-manual", label: "Filing DMCA takedowns manually", icon: FileText, color: "text-amber-400" },
    { id: "monitoring", label: "Not knowing if my art is being used", icon: Eye, color: "text-cyan-400" },
];

interface Props {
    data: OnboardingData;
    update: (partial: Partial<OnboardingData>) => void;
    onNext: () => void;
    onBack: () => void;
}

export default function PainPointStep({ data, update, onNext, onBack }: Props) {
    const select = (id: string) => {
        update({ primaryConcern: id });
        setTimeout(onNext, 300);
    };

    return (
        <div className="max-w-lg mx-auto px-6">
            <motion.h2 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-2xl md:text-3xl font-black tracking-tight mb-3 text-center">
                What worries you most?
            </motion.h2>
            <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="text-zinc-500 text-sm text-center mb-10">
                We&apos;ll prioritize the features that matter most to you.
            </motion.p>

            <div className="space-y-3 mb-8">
                {options.map((opt, i) => (
                    <motion.button
                        key={opt.id}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.15 + i * 0.05 }}
                        onClick={() => select(opt.id)}
                        className={`w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all ${
                            data.primaryConcern === opt.id
                                ? "bg-purple-500/10 border-purple-500/30"
                                : "bg-white/[0.02] border-white/[0.06] hover:border-white/[0.12]"
                        }`}
                    >
                        <opt.icon className={`w-5 h-5 ${opt.color}`} />
                        <span className="text-sm font-medium">{opt.label}</span>
                    </motion.button>
                ))}
            </div>

            <button onClick={onBack} className="px-6 py-3.5 rounded-xl border border-white/[0.06] text-zinc-400 text-sm font-medium hover:border-white/[0.12] transition-all">
                <ArrowLeft className="w-4 h-4" />
            </button>
        </div>
    );
}
