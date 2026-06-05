"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";

import WelcomeStep from "./steps/WelcomeStep";
import ArtistTypeStep from "./steps/ArtistTypeStep";
import PlatformStep from "./steps/PlatformStep";
import PortfolioSizeStep from "./steps/PortfolioSizeStep";
import PainPointStep from "./steps/PainPointStep";
import FeatureShowcaseStep from "./steps/FeatureShowcaseStep";
import ConfirmationStep from "./steps/ConfirmationStep";

export interface OnboardingData {
    artistType: string;
    platforms: string[];
    portfolioSize: string;
    primaryConcern: string;
}

const TOTAL_STEPS = 7;

const slideVariants = {
    enter: (direction: number) => ({ x: direction > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (direction: number) => ({ x: direction > 0 ? -300 : 300, opacity: 0 }),
};

export default function OnboardingWizard({ onComplete }: { onComplete: () => void }) {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [direction, setDirection] = useState(1);
    const [data, setData] = useState<OnboardingData>({
        artistType: "",
        platforms: [],
        portfolioSize: "",
        primaryConcern: "",
    });

    const goNext = useCallback(() => {
        setDirection(1);
        setStep((s) => Math.min(s + 1, TOTAL_STEPS));
    }, []);

    const goBack = useCallback(() => {
        setDirection(-1);
        setStep((s) => Math.max(s - 1, 1));
    }, []);

    const updateData = useCallback((partial: Partial<OnboardingData>) => {
        setData((d) => ({ ...d, ...partial }));
    }, []);

    const handleComplete = useCallback(() => {
        localStorage.setItem("cvber_onboarding_data", JSON.stringify(data));
        localStorage.setItem("cvber_onboarding_complete", "true");
        onComplete();
        router.push("/dashboard");
    }, [data, onComplete, router]);

    const progress = (step / TOTAL_STEPS) * 100;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-[200] bg-[#050505] flex flex-col"
        >
            {/* Progress bar */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-white/[0.06] z-10">
                <motion.div
                    className="h-full bg-purple-500"
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
                />
            </div>

            {/* Close button */}
            <button
                onClick={onComplete}
                className="absolute top-6 right-6 z-20 w-10 h-10 rounded-full border border-white/[0.08] flex items-center justify-center hover:border-white/20 transition-colors"
            >
                <X className="w-4 h-4 text-zinc-400" />
            </button>

            {/* Step counter */}
            <div className="absolute top-6 left-6 z-20 text-[10px] text-zinc-600 font-bold uppercase tracking-[0.2em]">
                Step {step} of {TOTAL_STEPS}
            </div>

            {/* Steps */}
            <div className="flex-1 flex items-center justify-center overflow-hidden">
                <AnimatePresence mode="wait" custom={direction}>
                    <motion.div
                        key={step}
                        custom={direction}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                        className="w-full"
                    >
                        {step === 1 && <WelcomeStep onNext={goNext} />}
                        {step === 2 && <ArtistTypeStep data={data} update={updateData} onNext={goNext} onBack={goBack} />}
                        {step === 3 && <PlatformStep data={data} update={updateData} onNext={goNext} onBack={goBack} />}
                        {step === 4 && <PortfolioSizeStep data={data} update={updateData} onNext={goNext} onBack={goBack} />}
                        {step === 5 && <PainPointStep data={data} update={updateData} onNext={goNext} onBack={goBack} />}
                        {step === 6 && <FeatureShowcaseStep onNext={goNext} onBack={goBack} />}
                        {step === 7 && <ConfirmationStep onComplete={handleComplete} />}
                    </motion.div>
                </AnimatePresence>
            </div>
        </motion.div>
    );
}
