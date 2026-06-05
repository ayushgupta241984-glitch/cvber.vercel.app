"use client";

import { motion } from "framer-motion";
import { ArrowRight, ArrowLeft } from "lucide-react";
import type { OnboardingData } from "../OnboardingWizard";

const options = [
    { id: "1-10", label: "1–10 pieces", desc: "Perfect for starting out" },
    { id: "11-100", label: "11–100 pieces", desc: "Bulk upload available" },
    { id: "101-1000", label: "101–1,000 pieces", desc: "Portfolio-level protection" },
    { id: "1000+", label: "1,000+ pieces", desc: "Enterprise-grade" },
];

interface Props {
    data: OnboardingData;
    update: (partial: Partial<OnboardingData>) => void;
    onNext: () => void;
    onBack: () => void;
}

export default function PortfolioSizeStep({ data, update, onNext, onBack }: Props) {
    const select = (id: string) => {
        update({ portfolioSize: id });
        setTimeout(onNext, 300);
    };

    return (
        <div className="max-w-lg mx-auto px-6">
            <motion.h2 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-2xl md:text-3xl font-black tracking-tight mb-3 text-center">
                How many pieces do you want to protect?
            </motion.h2>
            <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="text-zinc-500 text-sm text-center mb-10">
                This helps us recommend the right workflow.
            </motion.p>

            <div className="space-y-3 mb-8">
                {options.map((opt, i) => (
                    <motion.button
                        key={opt.id}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.15 + i * 0.05 }}
                        onClick={() => select(opt.id)}
                        className={`w-full p-4 rounded-xl border text-left transition-all ${
                            data.portfolioSize === opt.id
                                ? "bg-purple-500/10 border-purple-500/30"
                                : "bg-white/[0.02] border-white/[0.06] hover:border-white/[0.12]"
                        }`}
                    >
                        <p className="text-sm font-bold">{opt.label}</p>
                        <p className="text-xs text-zinc-500 mt-0.5">{opt.desc}</p>
                    </motion.button>
                ))}
            </div>

            <button onClick={onBack} className="px-6 py-3.5 rounded-xl border border-white/[0.06] text-zinc-400 text-sm font-medium hover:border-white/[0.12] transition-all">
                <ArrowLeft className="w-4 h-4" />
            </button>
        </div>
    );
}
