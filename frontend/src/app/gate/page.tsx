"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, ArrowRight, Check, Clock, ArrowLeft, Loader2 } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "https://cvber-free-las-app.onrender.com";

const PAINTINGS = [
  { src: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Mona_Lisa.jpg/800px-Mona_Lisa.jpg", label: "Mona Lisa — Da Vinci, stolen 1911 (recovered)" },
  { src: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/Vermeer_-_The_Concert.jpg/1280px-Vermeer_-_The_Concert.jpg", label: "The Concert — Vermeer, stolen 1990 (still missing)" },
  { src: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Edvard_Munch%2C_1893%2C_The_Scream%2C_oil%2C_tempera_and_pastel_on_cardboard%2C_91_x_73_cm%2C_National_Gallery_of_Norway.jpg/800px-Edvard_Munch%2C_1893%2C_The_Scream%2C_oil%2C_tempera_and_pastel_on_cardboard%2C_91_x_73_cm%2C_National_Gallery_of_Norway.jpg", label: "The Scream — Munch, stolen 1994 (recovered)" },
  { src: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg/1024px-Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg", label: "Poppy Flowers — Van Gogh, stolen 2010 (still missing)" },
];

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
  const [scrolled, setScrolled] = useState(false);

  const [activePainting, setActivePainting] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Painting auto-cycle
  useEffect(() => {
    const interval = setInterval(() => {
      if (isTransitioning) return;
      setIsTransitioning(true);
      setActivePainting((prev) => (prev + 1) % PAINTINGS.length);
      setTimeout(() => setIsTransitioning(false), 1200);
    }, 6000);
    return () => clearInterval(interval);
  }, [isTransitioning]);

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
    <section className="relative w-full h-screen overflow-hidden bg-[hsl(222,47%,11%)]">
      {/* ─── PAINTINGS ─── */}
      {PAINTINGS.map((p, i) => (
        <img
          key={i}
          src={p.src}
          alt={p.label}
          className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-[1200ms] ease-in-out ${
            i === activePainting ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}

      {/* ─── DARK OVERLAY (matches hero) ─── */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-[hsl(222,47%,11%)]/60 via-[hsl(222,47%,11%)]/30 to-[hsl(222,47%,11%)]/80" />

      {/* ─── PAINTING LABEL ─── */}
      <div className="absolute bottom-6 right-8 z-[3] text-[9px] text-white/25 font-mono tracking-wider">
        {PAINTINGS[activePainting].label}
      </div>

      {/* ─── CONTENT ─── */}
      <div className="relative z-10 w-full h-full flex flex-col">
        {/* ─── NAV (liquid glass pill, matches hero) ─── */}
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? "py-3" : "py-6"}`}>
          <div className={`max-w-7xl mx-auto px-6 flex items-center justify-between transition-all duration-500 ${scrolled ? "liquid-glass rounded-full px-8 py-3 mx-4 max-w-none shadow-lg shadow-black/20" : ""}`}>
            <Link href="/" className="flex items-center gap-2.5">
              <Shield className="w-5 h-5 text-white" />
              <span className="text-white text-xl md:text-2xl" style={{ fontFamily: "'Instrument Serif', serif" }}>
                CVBER<sup className="text-[9px] ml-0.5 opacity-60">&reg;</sup>
              </span>
            </Link>
            <div className="hidden md:flex items-center gap-8 text-sm text-white/50">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <Link href="/features" className="hover:text-white transition-colors">Features</Link>
              <Link href="/how-it-works" className="hover:text-white transition-colors">How It Works</Link>
              <Link href="/art-hub" className="hover:text-white transition-colors">Art Hub</Link>
              <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login" className="text-sm text-white/50 hover:text-white transition-colors hidden md:block">
                Log In
              </Link>
              <Link href="/gate" className="liquid-glass rounded-full px-6 py-2.5 text-sm text-white hover:scale-[1.03] transition-transform">
                Apply for Access
              </Link>
            </div>
          </div>
        </nav>

        {/* ─── FORM AREA ─── */}
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="w-full max-w-lg">
            <AnimatePresence mode="wait">
              {status === "accepted" ? (
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
                  <h1
                    className="text-4xl md:text-5xl tracking-tight text-white mb-4"
                    style={{ fontFamily: "'Instrument Serif', serif" }}
                  >
                    You got in.
                  </h1>
                  <p className="text-white/60 mb-10 text-base" style={{ fontFamily: "system-ui, sans-serif" }}>
                    Welcome to CVBER. Your art is about to be protected.
                  </p>
                  <Link
                    href="/register"
                    className="liquid-glass inline-flex items-center gap-3 px-14 py-5 rounded-full text-white text-base hover:scale-[1.03] transition-transform"
                  >
                    Create Your Account <ArrowRight className="w-5 h-5" />
                  </Link>
                </motion.div>
              ) : status === "pending" ? (
                <motion.div
                  key="pending"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center"
                >
                  <h1
                    className="text-4xl md:text-6xl tracking-tight text-white mb-4"
                    style={{ fontFamily: "'Instrument Serif', serif" }}
                  >
                    Application received.
                  </h1>
                  <p className="text-white/50 mb-12 text-base max-w-md mx-auto" style={{ fontFamily: "system-ui, sans-serif" }}>
                    Your application is being reviewed. We accept a limited number of creators each week to ensure quality access for everyone.
                  </p>

                  {/* ─── GLASSMORPHIC TIMER ─── */}
                  <div className="liquid-glass rounded-3xl p-10 md:p-14 max-w-md mx-auto mb-10">
                    {/* Ring */}
                    <div className="relative w-48 h-48 mx-auto mb-8">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
                        {/* Background track */}
                        <circle cx="100" cy="100" r="88" stroke="rgba(255,255,255,0.06)" strokeWidth="3" fill="none" />
                        {/* Progress ring */}
                        <circle
                          cx="100" cy="100" r="88"
                          stroke="white"
                          strokeWidth="3"
                          fill="none"
                          strokeDasharray={`${2 * Math.PI * 88}`}
                          strokeDashoffset={`${2 * Math.PI * 88 * (1 - remaining / 120)}`}
                          strokeLinecap="round"
                          className="transition-all duration-1000 ease-linear"
                        />
                        {/* Glow dot at the tip */}
                        <circle
                          cx={100 + 88 * Math.cos((2 * Math.PI * (remaining / 120)) - Math.PI / 2)}
                          cy={100 + 88 * Math.sin((2 * Math.PI * (remaining / 120)) - Math.PI / 2)}
                          r="4"
                          fill="white"
                          className="transition-all duration-1000"
                          style={{ filter: "drop-shadow(0 0 6px rgba(255,255,255,0.6))" }}
                        />
                      </svg>
                      {/* Center display */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span
                          className="text-5xl md:text-6xl text-white tracking-tight"
                          style={{ fontFamily: "'Instrument Serif', serif" }}
                        >
                          {formatTime(remaining)}
                        </span>
                        <span className="text-white/30 text-xs mt-2 tracking-widest uppercase" style={{ fontFamily: "system-ui, sans-serif" }}>
                          remaining
                        </span>
                      </div>
                    </div>

                    {/* Status text */}
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-white/60 animate-pulse" />
                      <span className="text-white/40 text-sm" style={{ fontFamily: "system-ui, sans-serif" }}>
                        Reviewing your application...
                      </span>
                    </div>
                  </div>

                  <p className="text-white/20 text-xs" style={{ fontFamily: "system-ui, sans-serif" }}>
                    You&apos;ll be notified the moment a spot opens for you.
                  </p>
                </motion.div>
              ) : step <= questions.length ? (
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
                          <span
                            className="text-xs tracking-tight uppercase text-white/40"
                            style={{ fontFamily: "'Instrument Serif', serif" }}
                          >
                            CVBER
                          </span>
                        </div>
                        <span className="text-[10px] text-white/30 font-bold tracking-wider" style={{ fontFamily: "system-ui, sans-serif" }}>
                          {step + 1} / {questions.length}
                        </span>
                      </div>
                      <h2
                        className="text-2xl md:text-4xl tracking-tight text-white mb-8"
                        style={{ fontFamily: "'Instrument Serif', serif" }}
                      >
                        {questions[step].q}
                      </h2>
                      <textarea
                        autoFocus
                        value={answers[questions[step].id as keyof typeof answers]}
                        onChange={(e) => setAnswers({ ...answers, [questions[step].id]: e.target.value })}
                        placeholder={questions[step].placeholder}
                        rows={3}
                        className="w-full p-4 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder-white/30 text-sm focus:outline-none focus:border-white/20 resize-none mb-8"
                        style={{ fontFamily: "system-ui, sans-serif" }}
                      />
                      <div className="flex items-center gap-4">
                        {step > 0 && (
                          <button
                            onClick={() => setStep(step - 1)}
                            className="flex items-center gap-2 text-xs text-white/40 hover:text-white transition-colors"
                            style={{ fontFamily: "system-ui, sans-serif" }}
                          >
                            <ArrowLeft className="w-3 h-3" /> Back
                          </button>
                        )}
                        <button
                          onClick={() => setStep(step + 1)}
                          disabled={!answers[questions[step].id as keyof typeof answers].trim()}
                          className="flex-1 py-4 liquid-glass rounded-xl text-white text-sm disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:scale-[1.01] flex items-center justify-center gap-2"
                          style={{ fontFamily: "system-ui, sans-serif" }}
                        >
                          Continue <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center justify-between mb-10">
                        <div className="flex items-center gap-3">
                          <Shield className="w-5 h-5 text-white" />
                          <span
                            className="text-xs tracking-tight uppercase text-white/40"
                            style={{ fontFamily: "'Instrument Serif', serif" }}
                          >
                            CVBER
                          </span>
                        </div>
                        <span className="text-[10px] text-white/30 font-bold tracking-wider" style={{ fontFamily: "system-ui, sans-serif" }}>
                          {step + 1} / {questions.length + 1}
                        </span>
                      </div>
                      <h2
                        className="text-2xl md:text-4xl tracking-tight text-white mb-3"
                        style={{ fontFamily: "'Instrument Serif', serif" }}
                      >
                        What&apos;s your email?
                      </h2>
                      <p className="text-white/50 text-sm mb-8" style={{ fontFamily: "system-ui, sans-serif" }}>
                        We&apos;ll send you access details if accepted.
                      </p>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        autoFocus
                        className="w-full p-4 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder-white/30 text-sm focus:outline-none focus:border-white/20 mb-8"
                        style={{ fontFamily: "system-ui, sans-serif" }}
                      />
                      {errorMsg && <p className="text-red-400 text-xs mb-4">{errorMsg}</p>}
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => setStep(step - 1)}
                          className="flex items-center gap-2 text-xs text-white/40 hover:text-white transition-colors"
                          style={{ fontFamily: "system-ui, sans-serif" }}
                        >
                          <ArrowLeft className="w-3 h-3" /> Back
                        </button>
                        <button
                          onClick={submitApplication}
                          disabled={!email.includes("@") || status === "submitting"}
                          className="flex-1 py-4 liquid-glass rounded-xl text-white text-sm disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:scale-[1.01] flex items-center justify-center gap-2"
                          style={{ fontFamily: "system-ui, sans-serif" }}
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

        {/* ─── BOTTOM PAINTING SWITCHER ─── */}
        <div className="relative z-10 flex items-center justify-center gap-6 pb-8">
          {PAINTINGS.map((p, i) => (
            <button
              key={i}
              onClick={() => {
                if (i !== activePainting && !isTransitioning) {
                  setIsTransitioning(true);
                  setActivePainting(i);
                  setTimeout(() => setIsTransitioning(false), 1200);
                }
              }}
              className={`text-[10px] tracking-wider transition-all duration-300 pb-1 border-b ${
                i === activePainting
                  ? "text-white border-white"
                  : "text-white/40 border-transparent hover:text-white/70"
              }`}
              style={{ fontFamily: "system-ui, sans-serif" }}
            >
              {p.label.split("—")[0].trim()}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
