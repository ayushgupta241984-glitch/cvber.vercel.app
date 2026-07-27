"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Shield, ArrowRight, Loader2 } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "https://cvber-free-las-app.onrender.com";

function ClaimForm() {
    const searchParams = useSearchParams();
    const emailParam = searchParams.get("email") || "";

    const [email, setEmail] = useState(emailParam);
    const [password, setPassword] = useState("");
    const [status, setStatus] = useState<"idle" | "checking" | "pending" | "accepted" | "unboxing" | "claimed" | "error">("idle");
    const [errorMsg, setErrorMsg] = useState("");
    const [unboxPhase, setUnboxPhase] = useState(0);

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
            } else if (data.status === "pending") {
                setStatus("pending");
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
                if (data.access_token) {
                    localStorage.setItem("access_token", data.access_token);
                }
                // Start unboxing sequence
                setStatus("unboxing");
                setUnboxPhase(0);
            } else {
                setErrorMsg(data.detail || "claim failed. try again.");
                setStatus("accepted");
            }
        } catch {
            setErrorMsg("network error. try again.");
            setStatus("accepted");
        }
    };

    // Unboxing animation phases
    useEffect(() => {
        if (status !== "unboxing") return;
        const timers = [
            setTimeout(() => setUnboxPhase(1), 0),      // T+0: "You're in."
            setTimeout(() => setUnboxPhase(2), 1400),    // T+1.4: "Access confirmed."
            setTimeout(() => setUnboxPhase(3), 2400),    // T+2.4: dividing line
            setTimeout(() => setUnboxPhase(4), 3000),    // T+3.0: "Open the workspace"
            setTimeout(() => setStatus("claimed"), 4000), // T+4.0: done
        ];
        return () => timers.forEach(clearTimeout);
    }, [status]);

    // Already claimed - show final state
    if (status === "claimed") {
        return (
            <div className="min-h-screen flex items-center justify-center px-6" style={{ background: '#000' }}>
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
                    <div className="w-20 h-20 rounded-full border flex items-center justify-center mx-auto mb-8"
                        style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'var(--border)' }}>
                        <span style={{ fontSize: '32px', color: 'var(--text-primary)' }}>&#10003;</span>
                    </div>
                    <h1 style={{ fontSize: 'clamp(32px, 5vw, 44px)', fontWeight: 900, color: 'var(--text-primary)', lineHeight: '1.1', letterSpacing: '-0.02em', marginBottom: '16px' }}>
                        Welcome to CVBER.
                    </h1>
                    <p style={{ fontSize: '14px', color: 'var(--text-quaternary)', marginBottom: '40px' }}>
                        Your account is ready. Start protecting your art.
                    </p>
                    <Link href="/dashboard"
                        className="inline-flex items-center gap-3 px-10 py-4"
                        style={{ background: 'rgba(255,255,255,0.9)', color: '#000', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '+0.15em', borderRadius: 'var(--radius)' }}>
                        Open Workspace <ArrowRight className="w-4 h-4" />
                    </Link>
                </motion.div>
            </div>
        );
    }

    // Unboxing sequence
    if (status === "unboxing") {
        return (
            <div className="min-h-screen flex items-center justify-center px-6" style={{ background: '#000' }}>
                <div className="text-center w-full max-w-lg">
                    {/* T+0: "You're in." */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: unboxPhase >= 1 ? 1 : 0, y: unboxPhase >= 1 ? 0 : 20 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h1 style={{ fontSize: 'clamp(32px, 5vw, 44px)', fontWeight: 900, color: 'var(--text-primary)', lineHeight: '1.1', letterSpacing: '-0.02em' }}>
                            You&apos;re in.
                        </h1>
                    </motion.div>

                    {/* T+1.4: "Access confirmed." */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: unboxPhase >= 2 ? 1 : 0, y: unboxPhase >= 2 ? 0 : 20 }}
                        transition={{ duration: 0.5 }}
                        className="mt-6"
                    >
                        <p style={{ fontSize: '15px', color: 'var(--text-tertiary)' }}>
                            Access confirmed.
                        </p>
                    </motion.div>

                    {/* T+2.4: Dividing line */}
                    <motion.div
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: unboxPhase >= 3 ? 1 : 0 }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className="mt-8 mx-auto"
                        style={{ height: '1px', background: 'var(--border)', maxWidth: '200px', transformOrigin: 'center' }}
                    />

                    {/* T+3.0: "Open the workspace" */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: unboxPhase >= 4 ? 1 : 0, y: unboxPhase >= 4 ? 0 : 20 }}
                        transition={{ duration: 0.5 }}
                        className="mt-8"
                    >
                        <Link href="/dashboard"
                            className="inline-flex items-center gap-3 px-10 py-4"
                            style={{ background: 'rgba(255,255,255,0.9)', color: '#000', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '+0.15em', borderRadius: 'var(--radius)' }}>
                            Open the workspace <ArrowRight className="w-4 h-4" />
                        </Link>
                    </motion.div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-6" style={{ background: '#000' }}>
            <div className="w-full max-w-lg">
                {status === "accepted" ? (
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
                        <div className="flex items-center gap-3 mb-8">
                            <Shield className="w-5 h-5" style={{ color: 'var(--text-tertiary)' }} />
                            <span style={{ fontSize: '12px', color: 'var(--text-quaternary)', letterSpacing: '+0.08em', textTransform: 'uppercase' }}>CVBER</span>
                        </div>
                        <h1 style={{ fontSize: 'clamp(28px, 4vw, 36px)', fontWeight: 900, color: 'var(--text-primary)', lineHeight: '1.1', letterSpacing: '-0.02em', marginBottom: '12px' }}>
                            You&apos;re in.
                        </h1>
                        <p style={{ fontSize: '14px', color: 'var(--text-quaternary)', marginBottom: '40px' }}>
                            Create your password to claim access.
                        </p>

                        <input type="email" value={email} readOnly
                            className="w-full p-4 border text-sm mb-4 cursor-not-allowed"
                            style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)', color: 'var(--text-quaternary)', borderRadius: 'var(--radius)' }} />
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                            placeholder="Create a password (min 6 characters)" autoFocus
                            className="w-full p-4 border text-sm focus:outline-none focus:ring-2 mb-8"
                            style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)', color: 'var(--text-primary)', borderRadius: 'var(--radius)' }} />
                        {errorMsg && <p className="text-xs mb-4" style={{ color: '#f87171' }}>{errorMsg}</p>}
                        <button onClick={claimAccount} disabled={password.length < 6}
                            className="w-full py-4 text-sm font-bold disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                            style={{ background: 'rgba(255,255,255,0.9)', color: '#000', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '+0.15em', borderRadius: 'var(--radius)' }}>
                            Claim Access <ArrowRight className="w-4 h-4" />
                        </button>
                    </motion.div>
                ) : status === "pending" ? (
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center">
                        <div className="flex items-center justify-center gap-3 mb-6">
                            <Shield className="w-8 h-8" style={{ color: 'var(--text-tertiary)' }} />
                        </div>
                        <h1 style={{ fontSize: 'clamp(28px, 4vw, 36px)', fontWeight: 900, color: 'var(--text-primary)', lineHeight: '1.1', letterSpacing: '-0.02em', marginBottom: '12px' }}>
                            Still waiting.
                        </h1>
                        <p style={{ fontSize: '14px', color: 'var(--text-quaternary)', marginBottom: '32px' }}>
                            Your application is being reviewed.
                        </p>
                        <button onClick={() => checkStatus()} style={{ fontSize: '12px', color: 'var(--text-quaternary)' }} className="hover:text-[var(--text-primary)] transition-colors">
                            Refresh status
                        </button>
                    </motion.div>
                ) : (
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
                        <div className="flex items-center gap-3 mb-8">
                            <Shield className="w-5 h-5" style={{ color: 'var(--text-tertiary)' }} />
                            <span style={{ fontSize: '12px', color: 'var(--text-quaternary)', letterSpacing: '+0.08em', textTransform: 'uppercase' }}>CVBER</span>
                        </div>
                        <h1 style={{ fontSize: 'clamp(28px, 4vw, 36px)', fontWeight: 900, color: 'var(--text-primary)', lineHeight: '1.1', letterSpacing: '-0.02em', marginBottom: '12px' }}>
                            Claim your access.
                        </h1>
                        <p style={{ fontSize: '14px', color: 'var(--text-quaternary)', marginBottom: '32px' }}>
                            Enter the email you applied with.
                        </p>

                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com" autoFocus
                            className="w-full p-4 border text-sm focus:outline-none focus:ring-2 mb-6"
                            style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)', color: 'var(--text-primary)', borderRadius: 'var(--radius)' }} />
                        {errorMsg && <p className="text-xs mb-4" style={{ color: '#f87171' }}>{errorMsg}</p>}
                        <button onClick={() => checkStatus()}
                            disabled={!email.includes("@") || status === "checking"}
                            className="w-full py-4 text-sm disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                            style={{ background: 'rgba(255,255,255,0.9)', color: '#000', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '+0.15em', borderRadius: 'var(--radius)' }}>
                            {status === "checking" ? (<><Loader2 className="w-4 h-4 animate-spin" /> Checking...</>) : (<>Check Status <ArrowRight className="w-4 h-4" /></>)}
                        </button>
                        <p className="text-center mt-6">
                            <Link href="/gate" style={{ fontSize: '12px', color: 'var(--text-quaternary)' }} className="hover:text-[var(--text-primary)] transition-colors">
                                Haven&apos;t applied yet? Go to /gate
                            </Link>
                        </p>
                    </motion.div>
                )}
            </div>
        </div>
    );
}

export default function ClaimPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center" style={{ background: '#000' }}>
                <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--text-quaternary)' }} />
            </div>
        }>
            <ClaimForm />
        </Suspense>
    );
}
