"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, ArrowRight, Check, Clock, ArrowLeft, Loader2 } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "https://cvber-free-las-app.onrender.com";

const PAINTINGS = [
  { src: "https://lh3.googleusercontent.com/aida-public/AB6AXuDRVqZHy5VcnFaUDqXaLiHA1ucNKUws9Kl_gb9nPiPTkTN9-D9PMdZLE6J33UBem9ysE5U2vWCBH3vvDEPlVPPUXdFfdpKCWCblS22KPA-s96mUmYXSNQat6lE-6AxhiC-WJUnjMDhmUczTccOJjrO_VKYgWtQDVXBkrk-YnrVfTu_Qgg-ElAyPWFNtylWg2I8cTYmU5kG5nkTcqCFa-6Nzgug42dHA3Ko9r88n_XaIeKotwxxeuJtqT1mNJQ4_BZi26A", label: "Adoration of the Shepherds — Murillo, c. 1650" },
  { src: "https://lh3.googleusercontent.com/aida-public/AB6AXuDkS2ZMyPfVAk-ZQDoCq9HqsCcxRUvDZW3VE3p8ZorqDvX6CfHVYDzx_4_MiYIGXXZOLV58oNJVTg5qrzQXkpk4ufMwXmMUfnY1ubYjerze6W1T4VnfMqANJuTLf5LiRPUyi3568imHoPl7T3yZ2kHBBVlqjG162vG7iObOqVAeL0drw3xdtinJ3kMgS99dwknnRXOAjKOAi4fgGmzd5-sQz4DVMcw-vK_0B4s2Xwn_G6RFZYjNVNAt", label: "The Concert — Vermeer, c. 1664" },
  { src: "https://lh3.googleusercontent.com/aida-public/AB6AXuCf7gvB9TPVurApCRKFD7_qSFPs1D7QKSznj5XT3j_6Ph0fx2_KMKnxzB-Tyug8OqRCiq2TeFRH_tKI7Mt6KEbEKFvhu_z7sDG9G7c4VxXtR_ZsiEMT6DNnLrIMP6VtlHNGkJIp8g-7j7ZDyS6mzBoOZ6Cjx_pPd64sj3DDxa5IBvPDaNAtOHFgDN_IsLmacpxmEY1t7Qg73RJY_RqKjsbuLRL4doRYVbQY7b_VgXNbHGxPlDY8RBZ9zXadvvZcsfnK6w", label: "Mona Lisa — Leonardo da Vinci, c. 1503" },
  { src: "https://lh3.googleusercontent.com/aida-public/AB6AXuAmLFKzjEQhlrwUneQJRX6az04iqOoawPZjbzYerPLFYzwFprZ8nsAthOx2WRya71NlylVG5vrJkaoUuVDwsi6Jg5-uLJGzLeKdNpkVo3h9ZVbUKubuWfZPm5JUa7-zMg6YKzkbtuWe45YNpNYmIYxCgJF_rssR3gM1wZl9CQ0cxex8TBMiU7-OOCrIGyDoME2F_pDhmL5HsMKd9g_asvTzIGmAOw3wJAV1Z1LgY67e1a7RUklD4uLbiaMMQVnbAV3iOw", label: "The Art of Painting — Vermeer, c. 1666" },
];

const OVERLAY_PNG = "https://soft-zoom-63098134.figma.site/_assets/v11/0b4a435b2df2747593c43d7a1c9b4578f7d8d90c.png";

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

  const [activePainting, setActivePainting] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

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
    <section className="relative w-full h-screen overflow-hidden bg-black">
      {/* ─── PAINTINGS ─── */}
      {PAINTINGS.map((p, i) => (
        <img
          key={i}
          src={p.src}
          alt={p.label}
          className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-1000 ease-in-out ${
            i === activePainting ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}

      {/* ─── OVERLAY PNG ─── */}
      <img
        src={OVERLAY_PNG}
        alt=""
        className="absolute inset-0 w-full h-full object-cover z-[1] pointer-events-none"
        style={{
          animation: "train-bob 3s ease-in-out infinite",
          transform: "scale(1.03)",
        }}
      />

      {/* ─── DARK OVERLAY ─── */}
      <div className="absolute inset-0 z-[2] bg-gradient-to-b from-black/60 via-black/30 to-black/70" />

      {/* ─── PAINTING LABEL ─── */}
      <div className="absolute bottom-6 right-8 z-[3] text-[9px] text-white/25 font-mono tracking-wider">
        {PAINTINGS[activePainting].label}
      </div>

      {/* ─── CONTENT ─── */}
      <div className="relative z-10 w-full h-full flex flex-col">
        {/* ─── NAV ─── */}
        <nav className="flex items-center justify-between px-6 md:px-12 py-6">
          <Link href="/" className="flex items-center gap-2.5">
            <Shield className="w-5 h-5 text-white" />
            <span className="text-white text-xl md:text-2xl" style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic" }}>
              CVBER
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm text-white/70">
            <Link href="/features" className="hover:text-white transition-colors">Features</Link>
            <Link href="/how-it-works" className="hover:text-white transition-colors">How It Works</Link>
            <Link href="/art-hub" className="hover:text-white transition-colors">Art Hub</Link>
            <Link href="/verify" className="hover:text-white transition-colors">Verify</Link>
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
                    className="text-4xl md:text-5xl font-black tracking-tight text-white mb-4"
                    style={{ fontFamily: "'Instrument Serif', serif" }}
                  >
                    You got in.
                  </h1>
                  <p className="text-white/60 mb-10" style={{ fontFamily: "system-ui, sans-serif" }}>
                    Welcome to CVBER. Your art is about to be protected.
                  </p>
                  <Link
                    href="/register"
                    className="liquid-glass inline-flex items-center gap-3 px-10 py-4 rounded-full text-white font-bold text-sm hover:scale-[1.03] transition-transform"
                    style={{ fontFamily: "system-ui, sans-serif" }}
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
                  <div className="flex items-center justify-center gap-3 mb-6">
                    <Shield className="w-8 h-8 text-white" />
                    <span
                      className="text-sm font-black tracking-tight uppercase italic text-white/60"
                      style={{ fontFamily: "'Instrument Serif', serif" }}
                    >
                      CVBER
                    </span>
                  </div>
                  <h1
                    className="text-3xl md:text-4xl font-black tracking-tight text-white mb-3"
                    style={{ fontFamily: "'Instrument Serif', serif" }}
                  >
                    Application submitted.
                  </h1>
                  <p className="text-white/50 mb-10" style={{ fontFamily: "system-ui, sans-serif" }}>
                    You&apos;re #{position} in line. Processing automatically.
                  </p>

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
                      <Clock className="w-5 h-5 text-white/40 mb-1" />
                      <span className="text-3xl font-black text-white font-mono">{formatTime(remaining)}</span>
                    </div>
                  </div>

                  <p className="text-white/30 text-xs" style={{ fontFamily: "system-ui, sans-serif" }}>
                    This page will update automatically when you&apos;re accepted.
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
                            className="text-xs font-black tracking-tight uppercase italic text-white/40"
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
                        className="text-2xl md:text-3xl font-black tracking-tight text-white mb-8"
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
                          className="flex-1 py-4 bg-white text-black rounded-xl font-bold text-sm hover:bg-white/90 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-[0.98] flex items-center justify-center gap-2"
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
                            className="text-xs font-black tracking-tight uppercase italic text-white/40"
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
                        className="text-2xl md:text-3xl font-black tracking-tight text-white mb-3"
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
                          className="flex-1 py-4 bg-white text-black rounded-xl font-bold text-sm hover:bg-white/90 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-[0.98] flex items-center justify-center gap-2"
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

      {/* ─── TRAIN-BOB ANIMATION ─── */}
      <style>{`
        @keyframes train-bob {
          0%, 100% { transform: scale(1.03) translateY(0); }
          50% { transform: scale(1.03) translateY(-6px); }
        }
      `}</style>
    </section>
  );
}
