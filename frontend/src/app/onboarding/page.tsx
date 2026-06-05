"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Upload, Eye, Bell, Check, ArrowRight, Sparkles, Lock, Zap } from "lucide-react";

const steps = [
    {
        icon: Shield,
        title: "Get Your Certificate",
        description: "Upload your art and get a C2PA certificate in seconds. Cryptographic proof that you created it.",
        color: "from-purple-500 to-indigo-600",
    },
    {
        icon: Eye,
        title: "We Watch 24/7",
        description: "Our Watchtower scans Instagram, TikTok, YouTube, and more for unauthorized copies of your work.",
        color: "from-blue-500 to-cyan-600",
    },
    {
        icon: Bell,
        title: "Get Alerted Instantly",
        description: "When theft is detected, you get notified immediately with evidence and a one-click DMCA takedown.",
        color: "from-amber-500 to-orange-600",
    },
];

export default function OnboardingPage() {
    const router = useRouter();
    const [step, setStep] = useState(0);
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            // For now, redirect to register with pre-filled data
            router.push(`/register?email=${encodeURIComponent(email)}&name=${encodeURIComponent(name)}`);
        } catch (err) {
            setError("Something went wrong");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white overflow-hidden">
            {/* Animated background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
                <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                    transition={{ duration: 8, repeat: Infinity }}
                    className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-purple-500/20 blur-[120px] rounded-full"
                />
            </div>

            <div className="relative z-10 min-h-screen flex flex-col">
                {/* Header */}
                <header className="p-6 flex justify-between items-center">
                    <Link href="/" className="flex items-center gap-2">
                        <Shield className="w-8 h-8 text-purple-500" />
                        <span className="text-xl font-bold">CVBER</span>
                    </Link>
                    <Link href="/login" className="text-sm text-zinc-400 hover:text-white transition-colors">
                        Already have an account? Sign in
                    </Link>
                </header>

                {/* Main content */}
                <div className="flex-1 flex items-center justify-center p-6">
                    <div className="max-w-4xl w-full">
                        <AnimatePresence mode="wait">
                            {step < 3 ? (
                                <motion.div
                                    key={step}
                                    initial={{ opacity: 0, x: 50 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -50 }}
                                    transition={{ duration: 0.3 }}
                                    className="text-center"
                                >
                                    {/* Step indicator */}
                                    <div className="flex justify-center gap-2 mb-12">
                                        {[0, 1, 2].map((i) => (
                                            <div
                                                key={i}
                                                className={`h-1 rounded-full transition-all duration-500 ${
                                                    i <= step ? "w-12 bg-purple-500" : "w-8 bg-white/10"
                                                }`}
                                            />
                                        ))}
                                    </div>

                                    {/* Icon */}
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: "spring", duration: 0.6 }}
                                        className={`w-24 h-24 rounded-3xl bg-gradient-to-br ${steps[step].color} flex items-center justify-center mx-auto mb-8 shadow-2xl`}
                                    >
                                        {(() => {
                                            const Icon = steps[step].icon;
                                            return <Icon className="w-12 h-12 text-white" />;
                                        })()}
                                    </motion.div>

                                    {/* Text */}
                                    <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6">
                                        {steps[step].title}
                                    </h1>
                                    <p className="text-xl text-zinc-400 max-w-lg mx-auto mb-12">
                                        {steps[step].description}
                                    </p>

                                    {/* Next button */}
                                    <button
                                        onClick={() => setStep(step + 1)}
                                        className="px-10 py-5 bg-white text-black rounded-full font-bold text-sm uppercase tracking-widest hover:bg-zinc-200 transition-all flex items-center gap-3 mx-auto"
                                    >
                                        {step === 2 ? "Get Started Free" : "Next"}
                                        <ArrowRight className="w-5 h-5" />
                                    </button>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="signup"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.3 }}
                                    className="max-w-md mx-auto"
                                >
                                    {/* Header */}
                                    <div className="text-center mb-10">
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: "spring" }}
                                            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center mx-auto mb-6"
                                        >
                                            <Sparkles className="w-8 h-8 text-white" />
                                        </motion.div>
                                        <h1 className="text-3xl font-black tracking-tight mb-3">
                                            Start Protecting Your Art
                                        </h1>
                                        <p className="text-zinc-400">
                                            Free forever. No credit card required.
                                        </p>
                                    </div>

                                    {/* Form */}
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div>
                                            <input
                                                type="text"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                placeholder="Your name"
                                                required
                                                className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500/50 transition-all"
                                            />
                                        </div>
                                        <div>
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="your@email.com"
                                                required
                                                className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500/50 transition-all"
                                            />
                                        </div>

                                        {error && (
                                            <p className="text-red-400 text-sm">{error}</p>
                                        )}

                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full py-5 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl font-bold text-sm uppercase tracking-widest hover:from-purple-500 hover:to-indigo-500 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                        >
                                            {loading ? (
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            ) : (
                                                <>
                                                    Create Free Account
                                                    <ArrowRight className="w-5 h-5" />
                                                </>
                                            )}
                                        </button>
                                    </form>

                                    {/* Trust signals */}
                                    <div className="mt-8 flex items-center justify-center gap-6 text-zinc-500 text-xs">
                                        <div className="flex items-center gap-2">
                                            <Lock className="w-3 h-3" />
                                            <span>Encrypted</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Check className="w-3 h-3" />
                                            <span>No credit card</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Zap className="w-3 h-3" />
                                            <span>Setup in 30s</span>
                                        </div>
                                    </div>

                                    {/* Features list */}
                                    <div className="mt-10 p-6 rounded-3xl bg-white/[0.02] border border-white/5">
                                        <p className="text-xs text-zinc-500 uppercase tracking-widest mb-4">What you get free:</p>
                                        <div className="space-y-3">
                                            {[
                                                "C2PA certificates for your art",
                                                "Automated DMCA takedowns",
                                                "24/7 theft monitoring",
                                                "Blockchain ownership proof",
                                                "Invisible watermarking",
                                            ].map((feature, i) => (
                                                <div key={i} className="flex items-center gap-3">
                                                    <Check className="w-4 h-4 text-green-400" />
                                                    <span className="text-sm text-zinc-300">{feature}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}
