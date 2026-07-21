"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, ArrowRight, Check, Clock, ArrowLeft, Loader2 } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "https://cvber.free.las.app";

const questions = [
    { id: "who_are_you", q: "Who are you?", placeholder: "e.g. Digital illustrator, photographer, game artist..." },
    { id: "why_want", q: "Why do you want CVBER?", placeholder: "e.g. My art is being scraped by AI training datasets..." },
    { id: "why_give", q: "Why should we give you access?", placeholder: "e.g. I've had 3 pieces stolen this month with no way to prove ownership..." },
];

export default function GatePage() {
    const [step, setStep] = useState(0);
    const [email, setEmail] = useState("");
    const [answers, setAnswers] = useState({ who_are_you: "", why_want: "", why_give: "" });
    const [status, setStatus] = useState<"idle" | "submitting" | "pending" | "accepted" | "error">("idle");
    const [position, setPosition] = useState(0);
    const [remaining, setRemaining] = useState(120);
    const [errorMsg, setErrorMsg] = useState("");
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Countdown timer
    useEffect(() => {
        if (status !== "pending") return;
        timerRef.current = setInterval(() => {
            setRemaining((prev) => {
                if (prev <= 1) {
                    clearInterval(timerRef.current!);
                    checkStatus();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [status]);

    const checkStatus = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/gate/status?email=${encodeURIComponent(email)}`);
            const data = await res.json();
            if (data.status === "accepted") {
                setStatus("accepted");
                if (timerRef.current) clearInterval(timerRef.current);
            }
        } catch {
            // Retry in 5s
            setTimeout(checkStatus, 5000);
        }
    };

    const submitApplication = async () => {
        setStatus("submitting");
        setErrorMsg("");
        try {
            const res = await fetch(`${API_BASE}/api/gate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, ...answers }),
            });
            const data = await res.json();
            if (res.ok) {
                setPosition(data.position || 1);
                setStatus("pending");
                setRemaining(120);
            } else {
                setErrorMsg(data.detail || "Something went wrong. Try again.");
                setStatus("error");
            }
        } catch {
            setErrorMsg("Network error. Check your connection.");
            setStatus("error");
        }
    };

    const formatTime = (s: number) => {
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return `${m}:${sec.toString().padStart(2, "0")}`;
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center px-6">
            <div className="w-full max-w-lg">
                <AnimatePresence mode="wait">
                    {status === "accepted" ? (
                        /* ─── ACCEPTED ─── */
                        <motion.div
                            key="accepted"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center"
                        >
                            <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ duration: 0.6, type: "spring" }}
                                className="w-20 h-20 rounded-full bg-white/10 border border-white/20 flex items-center justify-center mx-auto mb-8"
                            >
                                <Check className="w-10 h-10 text-white" />
                            </motion.div>
                            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-4">You got in.</h1>
                            <p className="text-zinc-400 mb-10">Welcome to CVBER. Your art is about to be protected.</p>
                            <Link
                                href="/register"
                                className="inline-flex items-center gap-3 px-10 py-4 bg-white text-black rounded-full font-bold text-sm hover:bg-zinc-200 transition-all active:scale-95"
                            >
                                Create Your Account <ArrowRight className="w-5 h-5" />
                            </Link>
                        </motion.div>
                    ) : status === "pending" ? (
                        /* ─── PENDING / COUNTDOWN ─── */
                        <motion.div
                            key="pending"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center"
                        >
                            <div className="flex items-center justify-center gap-3 mb-6">
                                <Shield className="w-8 h-8 text-white" />
                                <span className="text-sm font-black tracking-tight uppercase italic text-white">CVBER</span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white mb-3">Application submitted.</h1>
                            <p className="text-zinc-400 mb-10">You&apos;re #{position} in line. Processing automatically.</p>

                            {/* Countdown ring */}
                            <div className="relative w-40 h-40 mx-auto mb-10">
                                <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                                    <circle cx="60" cy="60" r="54" stroke="rgba(255,255,255,0.06)" strokeWidth="4" fill="none" />
                                    <circle
                                        cx="60" cy="60" r="54"
                                        stroke="white"
                                        strokeWidth="4"
                                        fill="none"
                                        strokeDasharray={`${2 * Math.PI * 54}`}
                                        strokeDashoffset={`${2 * Math.PI * 54 * (1 - remaining / 120)}`}
                                        strokeLinecap="round"
                                        className="transition-all duration-1000"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <Clock className="w-5 h-5 text-zinc-500 mb-1" />
                                    <span className="text-3xl font-black text-white font-mono">{formatTime(remaining)}</span>
                                </div>
                            </div>

                            <p className="text-zinc-600 text-xs">This page will update automatically when you&apos;re accepted.</p>
                        </motion.div>
                    ) : step <= questions.length ? (
                        /* ─── QUESTION STEPS ─── */
                        <motion.div
                            key={`step-${step}`}
                            initial={{ opacity: 0, x: 40 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -40 }}
                        >
                            {step < questions.length ? (
                                <>
                                    <div className="flex items-center justify-between mb-10">
                                        <div className="flex items-center gap-3">
                                            <Shield className="w-5 h-5 text-white" />
                                            <span className="text-xs font-black tracking-tight uppercase italic text-white/40">CVBER</span>
                                        </div>
                                        <span className="text-[10px] text-zinc-600 font-bold tracking-wider">
                                            {step + 1} / {questions.length}
                                        </span>
                                    </div>
                                    <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white mb-8">
                                        {questions[step].q}
                                    </h2>
                                    <textarea
                                        autoFocus
                                        value={answers[questions[step].id as keyof typeof answers]}
                                        onChange={(e) => setAnswers({ ...answers, [questions[step].id]: e.target.value })}
                                        placeholder={questions[step].placeholder}
                                        rows={3}
                                        className="w-full p-4 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-white/20 resize-none mb-8"
                                    />
                                    <div className="flex items-center gap-4">
                                        {step > 0 && (
                                            <button
                                                onClick={() => setStep(step - 1)}
                                                className="flex items-center gap-2 text-xs text-zinc-500 hover:text-white transition-colors"
                                            >
                                                <ArrowLeft className="w-3 h-3" /> Back
                                            </button>
                                        )}
                                        <button
                                            onClick={() => setStep(step + 1)}
                                            disabled={!answers[questions[step].id as keyof typeof answers].trim()}
                                            className="flex-1 py-4 bg-white text-black rounded-xl font-bold text-sm hover:bg-zinc-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                                        >
                                            Continue <ArrowRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </>
                            ) : (
                                /* ─── EMAIL STEP ─── */
                                <>
                                    <div className="flex items-center justify-between mb-10">
                                        <div className="flex items-center gap-3">
                                            <Shield className="w-5 h-5 text-white" />
                                            <span className="text-xs font-black tracking-tight uppercase italic text-white/40">CVBER</span>
                                        </div>
                                        <span className="text-[10px] text-zinc-600 font-bold tracking-wider">
                                            {step + 1} / {questions.length + 1}
                                        </span>
                                    </div>
                                    <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white mb-3">What&apos;s your email?</h2>
                                    <p className="text-zinc-500 text-sm mb-8">We&apos;ll send you access details if accepted.</p>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="you@example.com"
                                        autoFocus
                                        className="w-full p-4 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-white/20 mb-8"
                                    />
                                    {errorMsg && <p className="text-red-400 text-xs mb-4">{errorMsg}</p>}
                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={() => setStep(step - 1)}
                                            className="flex items-center gap-2 text-xs text-zinc-500 hover:text-white transition-colors"
                                        >
                                            <ArrowLeft className="w-3 h-3" /> Back
                                        </button>
                                        <button
                                            onClick={submitApplication}
                                            disabled={!email.includes("@") || status === "submitting"}
                                            className="flex-1 py-4 bg-white text-black rounded-xl font-bold text-sm hover:bg-zinc-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                                        >
                                            {status === "submitting" ? (
                                                <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
                                            ) : (
                                                <>Apply for Access <ArrowRight className="w-4 h-4" /></>
                                            )}
                                        </button>
                                    </div>
                                </>
                            )}
                        </motion.div>
                    ) : null}
                </AnimatePresence>
            </div>
        </div>
    );
}
