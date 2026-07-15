"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Shield, Upload, Scan, FileCheck, Eye, Mail } from "lucide-react";

const demoSteps = [
    { icon: Upload, label: "Upload your art", sub: "JPEG, PNG, WebP", color: "#a855f7", bg: "rgba(168,85,247,0.1)", preview: ( <div className="flex flex-col items-center gap-3"><div className="w-14 h-14 rounded-2xl border-2 border-dashed border-purple-500/30 flex items-center justify-center"><Upload className="w-6 h-6 text-purple-400" /></div><span className="text-[11px] text-zinc-500">Drop your file</span></div> ) },
    { icon: Scan, label: "Scanning 15+ engines", sub: "DeviantArt, Instagram...", color: "#3b82f6", bg: "rgba(59,130,246,0.1)", preview: ( <div className="flex flex-col items-center gap-3 w-full max-w-[180px]"><Scan className="w-6 h-6 text-blue-400" /><div className="w-full h-1 bg-white/5 rounded-full overflow-hidden"><motion.div className="h-full bg-blue-500 rounded-full" initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: 2.5, ease: "easeInOut" }} /></div></div> ) },
    { icon: FileCheck, label: "C2PA certificate issued", sub: "Cryptographic proof", color: "#22c55e", bg: "rgba(34,197,94,0.1)", preview: ( <div className="flex flex-col items-center gap-3"><div className="w-14 h-14 rounded-2xl bg-green-500/20 flex items-center justify-center"><FileCheck className="w-6 h-6 text-green-400" /></div><p className="text-[11px] font-mono text-green-400/60">0x7f3a...c9e2</p></div> ) },
    { icon: Eye, label: "24/7 monitoring active", sub: "Auto-files DMCA on theft", color: "#f59e0b", bg: "rgba(245,158,11,0.1)", preview: ( <div className="flex flex-col items-center gap-3"><div className="w-14 h-14 rounded-2xl bg-amber-500/20 flex items-center justify-center relative"><Eye className="w-6 h-6 text-amber-400" /><motion.span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-green-400" animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 2, repeat: Infinity }} /></div></div> ) },
];

export default function OnboardingPage() {
    const router = useRouter();
    const [step, setStep] = useState(0);
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const intervalRef = useRef<ReturnType<typeof setInterval>>();

    useEffect(() => {
        intervalRef.current = setInterval(() => setStep((p) => (p + 1) % demoSteps.length), 2800);
        return () => clearInterval(intervalRef.current);
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        router.push(`/register?email=${encodeURIComponent(email)}`);
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white selection:bg-purple-500/30 flex items-center justify-center p-6">
            <div className="max-w-lg w-full">
                {/* Logo */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="flex items-center justify-center mb-10"
                >
                    <Link href="/" className="flex items-center gap-2.5">
                        <Shield className="w-6 h-6 text-purple-400" />
                        <span className="text-sm font-black tracking-tight uppercase italic text-white/60">CVBER</span>
                    </Link>
                </motion.div>

                {/* Headline */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="text-center mb-10"
                >
                    <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-3">
                        Protect your art<br />from AI theft
                    </h1>
                    <p className="text-zinc-500 text-sm">
                        Free C2PA certificates, DMCA automation, 24/7 monitoring.
                    </p>
                </motion.div>

                {/* Product demo */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="mb-10"
                >
                    <div className="rounded-2xl overflow-hidden border border-white/[0.04] bg-white/[0.02] backdrop-blur-sm">
                        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/[0.04]">
                            <div className="flex gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-500/40" /><div className="w-2.5 h-2.5 rounded-full bg-amber-500/40" /><div className="w-2.5 h-2.5 rounded-full bg-green-500/40" /></div>
                            <div className="flex-1 flex justify-center"><div className="bg-white/[0.03] rounded-md px-3 py-1 text-[10px] text-zinc-600 font-mono">cvber.app</div></div>
                        </div>
                        <div className="p-6 md:p-8">
                            <div className="flex items-center justify-center gap-0 mb-6">
                                {demoSteps.map((s, i) => (
                                    <div key={i} className="flex items-center">
                                        <div className="flex flex-col items-center">
                                            <motion.div className="relative w-9 h-9 rounded-lg flex items-center justify-center" animate={{ backgroundColor: i === step ? s.bg : "rgba(255,255,255,0.02)", scale: i === step ? 1 : 0.8 }} transition={{ duration: 0.4 }}>
                                                <s.icon className="w-4 h-4" style={{ color: i === step ? s.color : "rgba(255,255,255,0.12)" }} />
                                            </motion.div>
                                            <motion.p className="text-[9px] mt-1.5 font-medium" animate={{ color: i === step ? "#fff" : "rgba(255,255,255,0.12)" }} transition={{ duration: 0.3 }}>{s.label.split(" ")[0]}</motion.p>
                                        </div>
                                        {i < demoSteps.length - 1 && <div className="w-8 md:w-12 h-px mx-1.5 bg-white/[0.04]" />}
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-center min-h-[90px] items-center">
                                <AnimatePresence mode="wait">
                                    <motion.div key={step} initial={{ opacity: 0, y: 10, filter: "blur(4px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} exit={{ opacity: 0, y: -10, filter: "blur(4px)" }} transition={{ duration: 0.4 }} className="flex flex-col items-center gap-1.5">
                                        {demoSteps[step].preview}
                                        <p className="text-sm font-medium">{demoSteps[step].label}</p>
                                        <p className="text-[11px] text-zinc-500">{demoSteps[step].sub}</p>
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
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email"
                                    required
                                    className="w-full pl-11 pr-4 py-3.5 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-purple-500/30 transition-all"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-3.5 bg-white text-black rounded-xl font-bold text-sm hover:bg-zinc-200 transition-all flex items-center gap-2 disabled:opacity-50 active:scale-95"
                            >
                                {loading ? (
                                    <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                ) : (
                                    <><span className="hidden sm:inline">Start</span><ArrowRight className="w-4 h-4" /></>
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="flex items-center justify-center gap-4 mt-4 text-zinc-600 text-xs">
                        <span>Free forever</span>
                        <span>·</span>
                        <span>No credit card</span>
                        <span>·</span>
                        <span>30s setup</span>
                    </div>

                    <p className="text-center mt-6 text-zinc-500 text-sm">
                        Already have an account?{" "}
                        <Link href="/login" className="text-purple-400 hover:text-purple-300">Sign in</Link>
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
