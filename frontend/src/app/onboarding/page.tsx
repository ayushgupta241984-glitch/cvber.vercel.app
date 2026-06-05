"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Upload, Scan, FileCheck, Eye, ArrowRight } from "lucide-react";

const steps = [
    {
        icon: Upload,
        label: "Upload your art",
        sub: "JPEG, PNG, WebP — drag & drop",
        color: "#a855f7",
        bg: "rgba(168,85,247,0.1)",
        preview: (
            <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-2xl border-2 border-dashed border-purple-500/40 flex items-center justify-center">
                    <Upload className="w-7 h-7 text-purple-400" />
                </div>
                <span className="text-xs text-zinc-500">Drop your file here</span>
            </div>
        ),
    },
    {
        icon: Scan,
        label: "Scanning 15+ engines",
        sub: "Searching for copies online",
        color: "#3b82f6",
        bg: "rgba(59,130,246,0.1)",
        preview: (
            <div className="flex flex-col items-center gap-3 w-full max-w-[200px]">
                <Scan className="w-7 h-7 text-blue-400" />
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-blue-500 rounded-full"
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 2.5, ease: "easeInOut" }}
                    />
                </div>
                <span className="text-xs text-zinc-500">Checking DeviantArt, Pinterest...</span>
            </div>
        ),
    },
    {
        icon: FileCheck,
        label: "C2PA certificate issued",
        sub: "Cryptographic proof of ownership",
        color: "#22c55e",
        bg: "rgba(34,197,94,0.1)",
        preview: (
            <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-2xl bg-green-500/20 flex items-center justify-center">
                    <FileCheck className="w-7 h-7 text-green-400" />
                </div>
                <div className="text-center">
                    <p className="text-xs font-mono text-green-400/80">0x7f3a...c9e2</p>
                    <p className="text-[10px] text-zinc-600 mt-0.5">Verified • Timestamped</p>
                </div>
            </div>
        ),
    },
    {
        icon: Eye,
        label: "24/7 monitoring active",
        sub: "Auto-detects theft, files DMCA",
        color: "#f59e0b",
        bg: "rgba(245,158,11,0.1)",
        preview: (
            <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/20 flex items-center justify-center relative">
                    <Eye className="w-7 h-7 text-amber-400" />
                    <motion.span
                        className="absolute top-2 right-2 w-2 h-2 rounded-full bg-green-400"
                        animate={{ opacity: [1, 0.3, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    />
                </div>
                <span className="text-xs text-zinc-500">3 matches found • 0 DMCA filed</span>
            </div>
        ),
    },
];

export default function OnboardingPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [activeStep, setActiveStep] = useState(0);
    const intervalRef = useRef<ReturnType<typeof setInterval>>();

    useEffect(() => {
        intervalRef.current = setInterval(() => {
            setActiveStep((prev) => (prev + 1) % steps.length);
        }, 3200);
        return () => clearInterval(intervalRef.current);
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        router.push(`/register?email=${encodeURIComponent(email)}`);
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-6">
            <div className="max-w-2xl w-full">
                {/* Logo */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="flex items-center justify-center mb-10"
                >
                    <Shield className="w-8 h-8 text-purple-500" />
                </motion.div>

                {/* Headline */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-3">
                        Protect your art<br />from AI theft
                    </h1>
                    <p className="text-zinc-500 text-base">
                        Free C2PA certificates, DMCA automation, 24/7 monitoring.
                    </p>
                </motion.div>

                {/* Animated Product Demo — Figma-style */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="relative mb-12"
                >
                    {/* Browser chrome */}
                    <div className="rounded-2xl overflow-hidden border border-white/5 bg-white/[0.02]">
                        {/* Title bar */}
                        <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
                            <div className="flex gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-red-500/60" />
                                <div className="w-3 h-3 rounded-full bg-amber-500/60" />
                                <div className="w-3 h-3 rounded-full bg-green-500/60" />
                            </div>
                            <div className="flex-1 flex justify-center">
                                <div className="bg-white/5 rounded-md px-3 py-1 text-[11px] text-zinc-500 font-mono">
                                    cvber.app/upload
                                </div>
                            </div>
                        </div>

                        {/* Content area */}
                        <div className="p-8 md:p-10">
                            {/* Step indicators — horizontal timeline */}
                            <div className="flex items-center justify-center gap-0 mb-8">
                                {steps.map((step, i) => (
                                    <div key={i} className="flex items-center">
                                        <div className="flex flex-col items-center">
                                            <motion.div
                                                className="relative w-10 h-10 rounded-xl flex items-center justify-center"
                                                animate={{
                                                    backgroundColor: i === activeStep ? step.bg : "rgba(255,255,255,0.02)",
                                                    scale: i === activeStep ? 1 : 0.85,
                                                }}
                                                transition={{ duration: 0.5 }}
                                            >
                                                <step.icon
                                                    className="w-5 h-5"
                                                    style={{ color: i === activeStep ? step.color : "rgba(255,255,255,0.15)" }}
                                                />
                                                {/* Step number */}
                                                <span className="absolute -top-1.5 -right-1.5 text-[9px] font-mono text-zinc-600">
                                                    {i + 1}
                                                </span>
                                            </motion.div>
                                            <motion.p
                                                className="text-[10px] mt-1.5 font-medium whitespace-nowrap"
                                                animate={{
                                                    color: i === activeStep ? "#fff" : "rgba(255,255,255,0.15)",
                                                }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                {step.label.split(" ")[0]}
                                            </motion.p>
                                        </div>
                                        {i < steps.length - 1 && (
                                            <div className="w-12 md:w-16 h-px mx-2 relative">
                                                <motion.div
                                                    className="absolute inset-0"
                                                    animate={{
                                                        backgroundColor: i < activeStep ? steps[i].color : "rgba(255,255,255,0.06)",
                                                    }}
                                                    transition={{ duration: 0.5 }}
                                                />
                                                {/* Animated dot moving along the line */}
                                                {i === activeStep - 1 && (
                                                    <motion.div
                                                        className="absolute -top-[2px] w-1.5 h-1.5 rounded-full"
                                                        style={{ backgroundColor: steps[i].color }}
                                                        initial={{ left: "0%" }}
                                                        animate={{ left: "100%" }}
                                                        transition={{ duration: 0.8, ease: "easeInOut" }}
                                                    />
                                                )}
                                                {i === activeStep && (
                                                    <motion.div
                                                        className="absolute -top-[2px] w-1.5 h-1.5 rounded-full bg-white/20"
                                                        initial={{ left: "0%" }}
                                                        animate={{ left: "100%" }}
                                                        transition={{ duration: 0.8, ease: "easeInOut" }}
                                                    />
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Active step content */}
                            <div className="flex justify-center min-h-[120px] items-center">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={activeStep}
                                        initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
                                        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                                        exit={{ opacity: 0, y: -12, filter: "blur(4px)" }}
                                        transition={{ duration: 0.5 }}
                                        className="flex flex-col items-center gap-2"
                                    >
                                        {steps[activeStep].preview}
                                        <p className="text-sm font-medium mt-1">{steps[activeStep].label}</p>
                                        <p className="text-xs text-zinc-500">{steps[activeStep].sub}</p>
                                    </motion.div>
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Email form */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                >
                    <form onSubmit={handleSubmit}>
                        <div className="flex gap-3">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                required
                                className="flex-1 px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500/50 transition-all"
                            />
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-4 bg-white text-black rounded-xl font-bold text-sm hover:bg-zinc-200 transition-all flex items-center gap-2 disabled:opacity-50"
                            >
                                {loading ? (
                                    <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                ) : (
                                    <>
                                        Start
                                        <ArrowRight className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="mt-5 flex items-center justify-center gap-4 text-zinc-600 text-xs">
                        <span>Free forever</span>
                        <span>·</span>
                        <span>No credit card</span>
                        <span>·</span>
                        <span>Setup in 30s</span>
                    </div>

                    <p className="text-center mt-6 text-zinc-500 text-sm">
                        Already have an account?{" "}
                        <Link href="/login" className="text-purple-400 hover:text-purple-300">
                            Sign in
                        </Link>
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
