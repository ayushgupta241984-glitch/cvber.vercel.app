"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, ArrowRight, ArrowLeft, Loader2 } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "https://cvber-free-las-app.onrender.com";

const questions = [
  { id: "who_are_you", q: "Who are you?", placeholder: "e.g. Digital illustrator, photographer, game artist..." },
  { id: "why_want", q: "Why do you want CVBER?", placeholder: "e.g. My art is being scraped by AI training datasets..." },
  { id: "why_give", q: "Why should we give you access?", placeholder: "e.g. I've had 3 pieces stolen this month with no way to prove ownership..." },
];

const statusBars = [
  "Application received",
  "Queue position assigned",
  "Reviewing your work",
  "Checking availability",
  "Almost there",
  "Final review",
  "Access granted",
];

export default function GatePage() {
  const [step, setStep] = useState(0);
  const [email, setEmail] = useState("");
  const [answers, setAnswers] = useState({ who_are_you: "", why_want: "", why_give: "" });
  const [status, setStatus] = useState<"idle" | "submitting" | "pending" | "accepted" | "error">("idle");
  const [remaining, setRemaining] = useState(120);
  const [errorMsg, setErrorMsg] = useState("");
  const [activeBar, setActiveBar] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Check if we already have an email in sessionStorage (skip to form if so)
  useEffect(() => {
    const saved = sessionStorage.getItem("cvber_gate_email");
    if (saved) setEmail(saved);
  }, []);

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

  // Animate status bars during pending
  useEffect(() => {
    if (status !== "pending") return;
    const barInterval = setInterval(() => {
      setActiveBar((prev) => {
        if (prev >= statusBars.length - 1) return prev;
        return prev + 1;
      });
    }, 17000); // ~120s / 7 bars ≈ 17s each
    return () => clearInterval(barInterval);
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
        sessionStorage.setItem("cvber_gate_email", email);
        setStatus("pending");
        setRemaining(120);
        setActiveBar(0);
      } else {
        setErrorMsg(data.detail || "something went wrong. try again.");
        setStatus("error");
      }
    } catch {
      setErrorMsg("network error. check your connection.");
      setStatus("error");
    }
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: '#000' }}>
      <div className="w-full max-w-lg">
        <AnimatePresence mode="wait">
          {status === "accepted" ? (
            <motion.div key="accepted" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.6, type: "spring" }}
                className="w-20 h-20 rounded-full border flex items-center justify-center mx-auto mb-8"
                style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'var(--border)' }}
              >
                <span style={{ fontSize: '32px', color: 'var(--text-primary)' }}>&#10003;</span>
              </motion.div>
              <h1 style={{ fontSize: 'clamp(32px, 5vw, 44px)', fontWeight: 900, color: 'var(--text-primary)', lineHeight: '1.1', letterSpacing: '-0.02em', marginBottom: '16px' }}>
                Your application is approved.
              </h1>
              <p style={{ fontSize: '15px', color: 'var(--text-tertiary)', marginBottom: '40px', lineHeight: '1.6' }}>
                You are one of the 1,000.
              </p>
              <Link href="/register"
                className="inline-flex items-center gap-3 px-10 py-4"
                style={{ background: 'rgba(255,255,255,0.9)', color: '#000', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '+0.15em', borderRadius: 'var(--radius)' }}>
                Create Your Account <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          ) : status === "pending" ? (
            <motion.div key="pending" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center">
              <h1 style={{ fontSize: 'clamp(32px, 5vw, 44px)', fontWeight: 900, color: 'var(--text-primary)', lineHeight: '1.1', letterSpacing: '-0.02em', marginBottom: '16px' }}>
                Application received.
              </h1>
              <p style={{ fontSize: '14px', color: 'var(--text-quaternary)', marginBottom: '48px', maxWidth: '400px', margin: '0 auto 48px', lineHeight: '1.6' }}>
                We accept a limited number of creators each week to ensure quality access for everyone.
              </p>

              {/* Timer */}
              <div className="mb-10">
                <span style={{ fontSize: 'clamp(40px, 8vw, 56px)', fontWeight: 900, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}>
                  {formatTime(remaining)}
                </span>
              </div>

              {/* Status bars */}
              <div className="space-y-3 mb-10">
                {statusBars.map((label, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="flex-1 h-[2px] rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: i <= activeBar ? '100%' : '0%' }}
                        transition={{ duration: 1.5, ease: 'easeOut' }}
                        className="h-full rounded-full"
                        style={{ background: i <= activeBar ? 'var(--text-secondary)' : 'transparent' }}
                      />
                    </div>
                    <span style={{
                      fontSize: '10px',
                      fontWeight: 900,
                      letterSpacing: '+0.08em',
                      textTransform: 'uppercase',
                      color: i <= activeBar ? 'var(--text-tertiary)' : 'var(--text-quaternary)',
                      minWidth: '120px',
                      textAlign: 'right',
                    }}>
                      {label}
                    </span>
                  </div>
                ))}
              </div>

              <p style={{ fontSize: '11px', color: 'var(--text-quaternary)' }}>
                you&apos;ll be notified the moment a spot opens for you.
              </p>
            </motion.div>
          ) : step <= questions.length ? (
            <motion.div key={`step-${step}`} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}>
              {step < questions.length ? (
                <>
                  <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5" style={{ color: 'var(--text-tertiary)' }} />
                      <span style={{ fontSize: '12px', color: 'var(--text-quaternary)', letterSpacing: '+0.08em', textTransform: 'uppercase' }}>CVBER</span>
                    </div>
                    <span style={{ fontSize: '10px', fontWeight: 900, color: 'var(--text-quaternary)', letterSpacing: '+0.08em' }}>
                      {step + 1} / {questions.length}
                    </span>
                  </div>
                  <h2 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 900, color: 'var(--text-primary)', lineHeight: '1.1', letterSpacing: '-0.02em', marginBottom: '32px' }}>
                    {questions[step].q}
                  </h2>
                  <textarea
                    autoFocus
                    value={answers[questions[step].id as keyof typeof answers]}
                    onChange={(e) => setAnswers({ ...answers, [questions[step].id]: e.target.value })}
                    placeholder={questions[step].placeholder}
                    rows={3}
                    className="w-full p-4 border text-sm focus:outline-none focus:ring-2 resize-none mb-8"
                    style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)', color: 'var(--text-primary)', borderRadius: 'var(--radius)' }}
                  />
                  <div className="flex items-center gap-4">
                    {step > 0 && (
                      <button onClick={() => setStep(step - 1)} className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-quaternary)' }}>
                        <ArrowLeft className="w-3 h-3" /> Back
                      </button>
                    )}
                    <button
                      onClick={() => setStep(step + 1)}
                      disabled={!answers[questions[step].id as keyof typeof answers].trim()}
                      className="flex-1 py-4 text-sm flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                      style={{ background: 'rgba(255,255,255,0.9)', color: '#000', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '+0.15em', borderRadius: 'var(--radius)' }}
                    >
                      Continue <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5" style={{ color: 'var(--text-tertiary)' }} />
                      <span style={{ fontSize: '12px', color: 'var(--text-quaternary)', letterSpacing: '+0.08em', textTransform: 'uppercase' }}>CVBER</span>
                    </div>
                    <span style={{ fontSize: '10px', fontWeight: 900, color: 'var(--text-quaternary)', letterSpacing: '+0.08em' }}>
                      {step + 1} / {questions.length + 1}
                    </span>
                  </div>
                  <h2 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 900, color: 'var(--text-primary)', lineHeight: '1.1', letterSpacing: '-0.02em', marginBottom: '12px' }}>
                    What&apos;s your email?
                  </h2>
                  <p style={{ fontSize: '13px', color: 'var(--text-quaternary)', marginBottom: '32px' }}>
                    We&apos;ll send you access details if accepted.
                  </p>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoFocus
                    className="w-full p-4 border text-sm focus:outline-none focus:ring-2 mb-8"
                    style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)', color: 'var(--text-primary)', borderRadius: 'var(--radius)' }}
                  />
                  {errorMsg && <p className="text-xs mb-4" style={{ color: '#f87171' }}>{errorMsg}</p>}
                  <div className="flex items-center gap-4">
                    <button onClick={() => setStep(step - 1)} className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-quaternary)' }}>
                      <ArrowLeft className="w-3 h-3" /> Back
                    </button>
                    <button
                      onClick={submitApplication}
                      disabled={!email.includes("@") || status === "submitting"}
                      className="flex-1 py-4 text-sm flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                      style={{ background: 'rgba(255,255,255,0.9)', color: '#000', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '+0.15em', borderRadius: 'var(--radius)' }}
                    >
                      {status === "submitting" ? (<><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>) : (<>Submit Application <ArrowRight className="w-4 h-4" /></>)}
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
