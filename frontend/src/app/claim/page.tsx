"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Shield, ArrowRight, Check, Clock, Loader2 } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "https://cvber.free.las.app";

export default function ClaimPage() {
    const searchParams = useSearchParams();
    const emailParam = searchParams.get("email") || "";

    const [email, setEmail] = useState(emailParam);
    const [password, setPassword] = useState("");
    const [status, setStatus] = useState<"idle" | "checking" | "pending" | "accepted" | "claimed" | "error">("idle");
    const [position, setPosition] = useState(0);
    const [remaining, setRemaining] = useState(0);
    const [errorMsg, setErrorMsg] = useState("");
    const [acceptedAt, setAcceptedAt] = useState("");

    useEffect(() => {
        if (emailParam) {
            setEmail(emailParam);
            checkStatus(emailParam);
        }
    }, [emailParam]);

    const checkStatus = async (e?: string) => {
        const checkEmail = e || email;
        if (!checkEmail) return;
        setStatus("checking");
        try {
            const res = await fetch(`${API_BASE}/api/gate/status?email=${encodeURIComponent(checkEmail)}`);
            const data = await res.json();
            if (data.status === "accepted") {
                setStatus("accepted");
                setAcceptedAt(data.accepted_at || "");
            } else if (data.status === "pending") {
                setStatus("pending");
                setPosition(data.position || 0);
                setRemaining(data.remaining_seconds || 0);
            } else {
                setStatus("idle");
                setErrorMsg("No application found. Apply at /gate first.");
            }
        } catch {
            setStatus("idle");
            setErrorMsg("Could not check status. Try again.");
        }
    };

    const claimAccount = async () => {
        if (!email || !password || password.length < 6) return;
        setStatus("checking");
        setErrorMsg("");
        try {
            const res = await fetch(`${API_BASE}/api/gate/claim`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();
            if (res.ok) {
                setStatus("claimed");
                if (data.access_token) {
                    localStorage.setItem("access_token", data.access_token);
                }
            } else {
                setErrorMsg(data.detail || "Claim failed. Try again.");
                setStatus("accepted");
            }
        } catch {
            setErrorMsg("Network error. Try again.");
            setStatus("accepted");
        }
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center px-6">
            <div className="w-full max-w-lg">
                {status === "claimed" ? (
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
                        <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ duration: 0.6, type: "spring" }}
                            className="w-20 h-20 rounded-full bg-white/10 border border-white/20 flex items-center justify-center mx-auto mb-8"
                        >
                            <Check className="w-10 h-10 text-white" />
                        </motion.div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-4">Welcome to CVBER.</h1>
                        <p className="text-zinc-400 mb-10">Your account is ready. Start protecting your art.</p>
                        <Link
                            href="/dashboard"
                            className="inline-flex items-center gap-3 px-10 py-4 bg-white text-black rounded-full font-bold text-sm hover:bg-zinc-200 transition-all active:scale-95"
                        >
                            Go to Dashboard <ArrowRight className="w-5 h-5" />
                        </Link>
                    </motion.div>
                ) : status === "accepted" ? (
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
                        <div className="flex items-center gap-3 mb-8">
                            <Shield className="w-5 h-5 text-white" />
                            <span className="text-xs font-black tracking-tight uppercase italic text-white/40">CVBER</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white mb-3">You&apos;re in.</h1>
                        <p className="text-zinc-400 mb-10">Create your password to claim access.</p>

                        <input
                            type="email"
                            value={email}
                            readOnly
                            className="w-full p-4 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white/50 text-sm mb-4 cursor-not-allowed"
                        />
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Create a password (min 6 characters)"
                            autoFocus
                            className="w-full p-4 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-white/20 mb-8"
                        />
                        {errorMsg && <p className="text-red-400 text-xs mb-4">{errorMsg}</p>}
                        <button
                            onClick={claimAccount}
                            disabled={password.length < 6}
                            className="w-full py-4 bg-white text-black rounded-xl font-bold text-sm hover:bg-zinc-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                        >
                            Claim Access <ArrowRight className="w-4 h-4" />
                        </button>
                    </motion.div>
                ) : status === "pending" ? (
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center">
                        <div className="flex items-center justify-center gap-3 mb-6">
                            <Shield className="w-8 h-8 text-white" />
                            <span className="text-sm font-black tracking-tight uppercase italic text-white">CVBER</span>
                        </div>
                        <h1 className="text-3xl font-black tracking-tight text-white mb-3">Still waiting.</h1>
                        <p className="text-zinc-400 mb-8">You&apos;re #{position}. Check back in {Math.ceil(remaining / 60)} minutes.</p>
                        <div className="relative w-32 h-32 mx-auto mb-8">
                            <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                                <circle cx="60" cy="60" r="54" stroke="rgba(255,255,255,0.06)" strokeWidth="4" fill="none" />
                                <circle cx="60" cy="60" r="54" stroke="white" strokeWidth="4" fill="none"
                                    strokeDasharray={`${2 * Math.PI * 54}`}
                                    strokeDashoffset={`${2 * Math.PI * 54 * (1 - remaining / 120)}`}
                                    strokeLinecap="round" className="transition-all duration-1000" />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Clock className="w-5 h-5 text-zinc-500" />
                            </div>
                        </div>
                        <button onClick={() => checkStatus()} className="text-xs text-zinc-500 hover:text-white transition-colors">
                            Refresh status
                        </button>
                    </motion.div>
                ) : (
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
                        <div className="flex items-center gap-3 mb-8">
                            <Shield className="w-5 h-5 text-white" />
                            <span className="text-xs font-black tracking-tight uppercase italic text-white/40">CVBER</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white mb-3">Claim your access.</h1>
                        <p className="text-zinc-400 mb-8">Enter the email you applied with.</p>

                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            autoFocus
                            className="w-full p-4 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-white/20 mb-6"
                        />
                        {errorMsg && <p className="text-red-400 text-xs mb-4">{errorMsg}</p>}
                        <button
                            onClick={() => checkStatus()}
                            disabled={!email.includes("@") || status === "checking"}
                            className="w-full py-4 bg-white text-black rounded-xl font-bold text-sm hover:bg-zinc-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                        >
                            {status === "checking" ? (
                                <><Loader2 className="w-4 h-4 animate-spin" /> Checking...</>
                            ) : (
                                <>Check Status <ArrowRight className="w-4 h-4" /></>
                            )}
                        </button>
                        <p className="text-center mt-6">
                            <Link href="/gate" className="text-xs text-zinc-500 hover:text-white transition-colors">
                                Haven&apos;t applied yet? Go to /gate
                            </Link>
                        </p>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
