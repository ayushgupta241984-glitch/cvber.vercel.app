"use client";

import { useState, useRef, useEffect, useCallback, MouseEvent } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Shield, ChevronDown, Play, X, Eye, Lock, Zap, FileText, Mail, ArrowLeft } from "lucide-react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import StructuredData from "@/components/seo/StructuredData";
import Preloader from "@/components/Preloader";
import SidebarNav from "@/components/nav/SidebarNav";
import CursorFollower from "@/components/CursorFollower";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

// ─── Animated Background ──────────────────────────────────────────

function AnimatedBG() {
    return (
        <div className="fixed inset-0 z-0 overflow-hidden">
            <div className="absolute inset-0 bg-[#050505]" />
            <div className="absolute inset-0 bg-grid-white/[0.015] bg-[size:50px_50px]" />
            <motion.div animate={{ x: [0, 100, -50, 0], y: [0, -80, 60, 0], scale: [1, 1.3, 0.9, 1], opacity: [0.15, 0.3, 0.12, 0.15] }} transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }} className="absolute top-[-20%] left-[10%] w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[150px]" />
            <motion.div animate={{ x: [0, -80, 40, 0], y: [0, 60, -40, 0], scale: [1, 0.8, 1.2, 1], opacity: [0.1, 0.2, 0.08, 0.1] }} transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 3 }} className="absolute bottom-[10%] right-[5%] w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-[130px]" />
            {Array.from({ length: 20 }).map((_, i) => (
                <motion.div key={i} className="absolute w-1 h-1 rounded-full bg-white/[0.15]" style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }} animate={{ y: [0, -(20 + Math.random() * 40), 0], opacity: [0, 0.4, 0] }} transition={{ duration: 4 + Math.random() * 6, repeat: Infinity, delay: Math.random() * 5, ease: "easeInOut" }} />
            ))}
            <div className="absolute inset-0 bg-[#050505] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,transparent_20%,black)]" />
        </div>
    );
}

// ─── Scroll Progress Indicator ────────────────────────────────────

function ScrollProgress() {
    const barRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (!barRef.current) return;
        gsap.to(barRef.current, { scaleY: 1, ease: "none", scrollTrigger: { trigger: document.documentElement, start: "top top", end: "bottom bottom", scrub: 0.3 } });
    }, []);
    return (
        <div className="fixed right-6 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col items-center gap-3 select-none pointer-events-none">
            <div className="w-px h-20 bg-white/[0.06] relative overflow-hidden rounded-full">
                <div ref={barRef} className="absolute inset-x-0 top-0 h-full bg-gradient-to-b from-purple-500 to-blue-500 origin-top scale-y-0 rounded-full" />
            </div>
        </div>
    );
}

// ─── Interactive Card (3D tilt) ──────────────────────────────────

function InteractiveCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    const ref = useRef<HTMLDivElement>(null);
    const [rotate, setRotate] = useState({ x: 0, y: 0 });
    const handleMouse = useCallback((e: MouseEvent<HTMLDivElement>) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        setRotate({ x: (y - rect.height / 2) / 20, y: (rect.width / 2 - x) / 20 });
    }, []);
    const reset = useCallback(() => setRotate({ x: 0, y: 0 }), []);
    return (
        <div ref={ref} onMouseMove={handleMouse} onMouseLeave={reset} className={className} style={{ perspective: 1000 }}>
            <div style={{ transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`, transition: "transform 0.15s ease-out" }} className="h-full">{children}</div>
        </div>
    );
}

// ─── GSAP Helpers ─────────────────────────────────────────────────

function RevealText({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (!ref.current) return;
        gsap.fromTo(ref.current, { clipPath: "inset(0 0 100% 0)", y: 40, opacity: 0 }, { clipPath: "inset(0 0 0% 0)", y: 0, opacity: 1, duration: 1, ease: "power3.out", delay, scrollTrigger: { trigger: ref.current, start: "top 85%", once: true } });
    }, [delay]);
    return <div ref={ref} className={className}>{children}</div>;
}

// ─── Video Overlay (Lusion-style) ─────────────────────────────────

function VideoOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const progressRef = useRef<HTMLDivElement>(null);
    const [playing, setPlaying] = useState(false);
    const [muted, setMuted] = useState(true);

    useEffect(() => {
        if (!open) { setPlaying(false); return; }
        if (videoRef.current) {
            videoRef.current.muted = true;
            videoRef.current.play().then(() => setPlaying(true)).catch(() => {});
        }
    }, [open]);

    useEffect(() => {
        const video = videoRef.current;
        if (!video || !open) return;
        const onTimeUpdate = () => {
            if (progressRef.current) {
                progressRef.current.style.width = `${(video.currentTime / (video.duration || 1)) * 100}%`;
            }
        };
        video.addEventListener("timeupdate", onTimeUpdate);
        return () => video.removeEventListener("timeupdate", onTimeUpdate);
    }, [open]);

    const togglePlay = useCallback(() => {
        if (!videoRef.current) return;
        if (playing) { videoRef.current.pause(); } else { videoRef.current.play(); }
        setPlaying(!playing);
    }, [playing]);

    const toggleMute = useCallback(() => {
        if (!videoRef.current) return;
        videoRef.current.muted = !muted;
        setMuted(!muted);
    }, [muted]);

    return (
        <AnimatePresence>
            {open && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }} className="fixed inset-0 z-[100] bg-black flex flex-col" onClick={onClose}>
                    <div className="flex-1 flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }} className="relative w-full h-full">
                            <video ref={videoRef} className="w-full h-full object-cover" playsInline onEnded={() => setPlaying(false)}>
                                <source src="https://cdn.coverr.co/videos/coverr-purple-ink-in-water-3483/1080p.mp4" type="video/mp4" />
                            </video>
                            {/* Play/Pause overlay */}
                            <button onClick={togglePlay} className="absolute inset-0 flex items-center justify-center">
                                {!playing && (
                                    <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-24 h-24 rounded-full bg-white/[0.08] border border-white/20 flex items-center justify-center backdrop-blur-sm">
                                        <Play className="w-10 h-10 text-white fill-white ml-1.5" />
                                    </motion.div>
                                )}
                            </button>
                            {/* Bottom controls */}
                            <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/80 to-transparent">
                                <div className="flex items-center gap-6 max-w-4xl mx-auto">
                                    <button onClick={togglePlay} className="text-[11px] font-bold uppercase tracking-[0.25em] text-white/70 hover:text-white transition-colors">
                                        {playing ? "PAUSE" : "PLAY"}
                                    </button>
                                    <div className="flex-1 h-px bg-white/20 relative">
                                        <div ref={progressRef} className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 to-blue-500 w-0 transition-all" />
                                    </div>
                                    <button onClick={toggleMute} className="text-[11px] font-bold uppercase tracking-[0.25em] text-white/70 hover:text-white transition-colors">
                                        {muted ? "UNMUTE" : "MUTE"}
                                    </button>
                                    <button onClick={onClose} className="text-[11px] font-bold uppercase tracking-[0.25em] text-white/70 hover:text-white transition-colors">
                                        CLOSE
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                    {/* Custom cursor close icon */}
                    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-[101] hidden md:block">
                        <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M31 31L17.928 18L31 5M5 5L13.072 18L5 31" />
                        </svg>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

// ─── Product Slide (Lusion-style full-viewport section) ──────────

function ProductSlide({ num, title, desc, img, gradient, children }: { num: string; title: string; desc: string; img: string; gradient: string; children?: React.ReactNode }) {
    const sectionRef = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLDivElement>(null);
    const numRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!sectionRef.current || !textRef.current || !numRef.current) return;
        const tl = gsap.timeline({ scrollTrigger: { trigger: sectionRef.current, start: "top 70%", end: "top 30%", scrub: 0.5 } });
        tl.fromTo(textRef.current, { y: 60, opacity: 0 }, { y: 0, opacity: 1 })
          .fromTo(numRef.current, { y: -40, opacity: 0 }, { y: 0, opacity: 0.15 }, "-=0.5");
    }, []);

    return (
        <section ref={sectionRef} className="relative z-10 h-screen flex items-center overflow-hidden snap-start">
            {/* Background image */}
            <div className="absolute inset-0">
                <img src={img} alt={title} className="w-full h-full object-cover" />
                <div className={`absolute inset-0 ${gradient}`} />
            </div>
            {/* Content */}
            <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
                <div ref={numRef} className="text-[200px] md:text-[300px] font-black text-white/5 absolute -top-32 -right-10 md:-right-20 select-none leading-none pointer-events-none">
                    {num}
                </div>
                <div ref={textRef} className="max-w-2xl">
                    <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40 mb-6">{num}</div>
                    <h2 className="text-5xl md:text-7xl lg:text-[80px] font-black tracking-tighter leading-[0.9] mb-6">{title}</h2>
                    <p className="text-base md:text-lg text-white/60 max-w-lg leading-relaxed">{desc}</p>
                    {children}
                </div>
            </div>
        </section>
    );
}

// ─── Inline Onboarding Flow ───────────────────────────────────────

function InlineOnboarding({ onComplete }: { onComplete: () => void }) {
    const [step, setStep] = useState(0);
    const [email, setEmail] = useState("");
    const [answer, setAnswer] = useState("");

    const questions = [
        { q: "What kind of artist are you?", options: ["Digital Illustrator", "Photographer", "3D Artist", "AI Artist"] },
        { q: "Where do you publish your work?", options: ["Instagram", "DeviantArt", "ArtStation", "TikTok", "YouTube"] },
        { q: "What worries you most?", options: ["AI companies scraping my work", "People stealing and reposting", "Proving I'm the original creator", "Filing DMCA takedowns manually"] },
    ];

    const handleCreateAccount = (e: React.FormEvent) => {
        e.preventDefault();
        localStorage.setItem("cvber_onboarding_complete", "true");
        onComplete();
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] bg-[#050505] flex items-center justify-center">
            <div className="w-full max-w-lg px-6">
                <AnimatePresence mode="wait">
                    {step < questions.length ? (
                        <motion.div key={`q-${step}`} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.3 }}>
                            <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-600 mb-6">Step {step + 1} of {questions.length + 2}</div>
                            <h2 className="text-2xl md:text-3xl font-black tracking-tight mb-8">{questions[step].q}</h2>
                            <div className="space-y-3">
                                {questions[step].options.map((opt) => (
                                    <button key={opt} onClick={() => { setAnswer(opt); setTimeout(() => setStep(step + 1), 200); }} className={`w-full p-4 rounded-xl border text-left text-sm font-medium transition-all ${answer === opt ? "bg-purple-500/10 border-purple-500/30 text-white" : "bg-white/[0.02] border-white/[0.06] text-zinc-400 hover:border-white/[0.12] hover:text-white"}`}>
                                        {opt}
                                    </button>
                                ))}
                            </div>
                            {step > 0 && <button onClick={() => setStep(step - 1)} className="mt-6 text-xs text-zinc-500 hover:text-white transition-colors flex items-center gap-2"><ArrowLeft className="w-3 h-3" /> Back</button>}
                        </motion.div>
                    ) : step === questions.length ? (
                        <motion.div key="email" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.3 }}>
                            <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-600 mb-6">Step {step + 1} of {step + 2}</div>
                            <h2 className="text-2xl md:text-3xl font-black tracking-tight mb-3">Create your account</h2>
                            <p className="text-zinc-500 text-sm mb-8">Free forever. No credit card required.</p>
                            <form onSubmit={handleCreateAccount} className="space-y-3">
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" required className="w-full pl-11 pr-4 py-4 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-purple-500/30 transition-all" />
                                </div>
                                <button type="submit" className="w-full py-4 bg-white text-black rounded-xl font-bold text-sm hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 active:scale-[0.98]">
                                    Create Account <ArrowRight className="w-4 h-4" />
                                </button>
                            </form>
                            <button onClick={() => setStep(step - 1)} className="mt-6 text-xs text-zinc-500 hover:text-white transition-colors flex items-center gap-2"><ArrowLeft className="w-3 h-3" /> Back</button>
                        </motion.div>
                    ) : (
                        <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
                            <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }} className="w-20 h-20 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-8">
                                <Shield className="w-10 h-10 text-purple-400" />
                            </motion.div>
                            <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-4">You&apos;re all set.</h2>
                            <p className="text-zinc-500 text-sm mb-10 max-w-sm mx-auto">Your art is about to be protected.</p>
                            <Link href="/dashboard" className="px-10 py-5 bg-white text-black rounded-xl font-bold text-sm hover:bg-zinc-200 transition-all inline-flex items-center gap-3 active:scale-95">
                                Go to Dashboard <ArrowRight className="w-5 h-5" />
                            </Link>
                        </motion.div>
                    )}
                </AnimatePresence>
                {step <= questions.length && (
                    <button onClick={() => step === 0 ? onComplete() : setStep(step - 1)} className="absolute top-6 right-6 w-10 h-10 rounded-full border border-white/[0.08] flex items-center justify-center hover:border-white/20 transition-colors">
                        <X className="w-4 h-4 text-zinc-400" />
                    </button>
                )}
            </div>
        </motion.div>
    );
}

// ─── Page ───────────────────────────────────────────────────────────

export default function Home() {
    const [loaded, setLoaded] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [onboardingOpen, setOnboardingOpen] = useState(false);
    const [videoOpen, setVideoOpen] = useState(false);
    const pageRef = useRef<HTMLDivElement>(null);

    // Hero entrance
    useEffect(() => {
        if (!loaded) return;
        const tl = gsap.timeline({ delay: 0.2 });
        tl.fromTo(".hero-badge", { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.6, ease: "back.out(1.7)" })
          .fromTo(".hero-title", { opacity: 0, y: 50, clipPath: "inset(0 0 100% 0)" }, { opacity: 1, y: 0, clipPath: "inset(0 0 0% 0)", duration: 0.9, ease: "power3.out" }, "-=0.3")
          .fromTo(".hero-subtitle", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }, "-=0.5")
          .fromTo(".hero-cta", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }, "-=0.3")
          .fromTo(".hero-scroll", { opacity: 0 }, { opacity: 1, duration: 0.5 }, "-=0.2");
    }, [loaded]);

    // Hero parallax
    useEffect(() => {
        if (!loaded) return;
        gsap.to(".hero-content", { y: 150, opacity: 0, ease: "none", scrollTrigger: { trigger: ".hero-section", start: "top top", end: "bottom top", scrub: 0.5 } });
    }, [loaded]);

    return (
        <>
            <StructuredData />
            <Preloader onComplete={() => setLoaded(true)} />
            <AnimatePresence>
                {loaded && (
                    <motion.div ref={pageRef} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }} className="relative min-h-screen bg-[#050505] text-white selection:bg-purple-500/30 overflow-x-hidden font-sans snap-y snap-mandatory">
                        <AnimatedBG />
                        <ScrollProgress />
                        <CursorFollower />
                        <VideoOverlay open={videoOpen} onClose={() => setVideoOpen(false)} />
                        <SidebarNav open={menuOpen} onClose={() => setMenuOpen(false)} onStartOnboarding={() => setOnboardingOpen(true)} />
                        <AnimatePresence>
                            {onboardingOpen && <InlineOnboarding onComplete={() => setOnboardingOpen(false)} />}
                        </AnimatePresence>

                        {/* ─── HEADER ─── */}
                        <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-5 mix-blend-exclusion">
                            <Link href="/" className="flex items-center gap-2.5">
                                <Shield className="w-5 h-5" />
                                <span className="text-sm font-black tracking-tight uppercase italic">CVBER</span>
                            </Link>
                            <div className="flex items-center gap-6">
                                <Link href="/login" className="text-[11px] font-bold uppercase tracking-[0.25em] hover:opacity-60 transition-opacity">
                                    Log In
                                </Link>
                                <button onClick={() => setOnboardingOpen(true)} className="text-[11px] font-bold uppercase tracking-[0.25em] hover:opacity-60 transition-opacity">
                                    Get Started
                                </button>
                                <button onClick={() => setMenuOpen(true)} className="text-[11px] font-bold uppercase tracking-[0.25em] hover:opacity-60 transition-opacity">
                                    Menu
                                </button>
                            </div>
                        </header>

                        {/* ─── HERO ─── */}
                        <section className="hero-section relative z-10 h-screen flex flex-col items-center justify-center px-6 snap-start">
                            <div className="hero-content flex flex-col items-center text-center">
                                <div className="hero-badge inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.08] text-zinc-500 text-[9px] font-bold uppercase tracking-[0.2em] mb-8 opacity-0">
                                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
                                    AI Art Protection
                                </div>
                                <h1 className="hero-title text-5xl md:text-7xl lg:text-[100px] font-black tracking-tighter leading-[0.9] mb-5 opacity-0">
                                    Protect your art<br />
                                    <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">from AI theft</span>
                                </h1>
                                <p className="hero-subtitle text-base md:text-lg text-zinc-500 max-w-lg mb-10 leading-relaxed opacity-0">
                                    Free C2PA certificates. DMCA automation. 24/7 monitoring.
                                </p>
                                <div className="hero-cta flex flex-col sm:flex-row items-center gap-4 opacity-0">
                                    <button onClick={() => setOnboardingOpen(true)} className="group px-10 py-5 bg-white text-black rounded-xl font-bold text-sm hover:bg-zinc-200 transition-all flex items-center gap-3 active:scale-95 shadow-[0_20px_40px_rgba(255,255,255,0.05)]">
                                        Get Started <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                    <button onClick={() => setVideoOpen(true)} className="group px-8 py-5 rounded-xl font-bold text-sm text-zinc-400 hover:text-white border border-white/[0.08] hover:border-white/20 transition-all flex items-center gap-3">
                                        Watch Demo <Play className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Scroll prompt */}
                            <div className="hero-scroll absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 opacity-0">
                                <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-[0.3em]">Scroll to explore</span>
                                <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
                                    <ChevronDown className="w-4 h-4 text-zinc-500" />
                                </motion.div>
                            </div>
                        </section>

                        {/* ─── PRODUCT SLIDES ─── */}
                        <ProductSlide
                            num="01"
                            title="C2PA Certificates"
                            desc="Cryptographic proof of ownership embedded in your files. Recognized by Adobe, Microsoft, Google, and the BBC."
                            img="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1600&h=900&fit=crop&q=80"
                            gradient="bg-gradient-to-r from-black/80 via-black/50 to-transparent"
                        >
                            <div className="flex gap-4 mt-8">
                                <div className="flex -space-x-2">
                                    {["Adobe", "Microsoft", "Google", "BBC"].map((brand) => (
                                        <div key={brand} className="px-3 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.08] text-[9px] font-bold uppercase tracking-wider">{brand}</div>
                                    ))}
                                </div>
                            </div>
                        </ProductSlide>

                        <ProductSlide
                            num="02"
                            title="Neural Monitoring"
                            desc="Continuous deep-web scanning detects unauthorized usage across social platforms and marketplaces in real-time."
                            img="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1600&h=900&fit=crop&q=80"
                            gradient="bg-gradient-to-l from-black/80 via-black/50 to-transparent"
                        >
                            <div className="flex gap-3 mt-8">
                                {["Instagram", "TikTok", "YouTube", "DeviantArt", "Pinterest"].map((p) => (
                                    <div key={p} className="px-3 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.08] text-[9px] font-bold uppercase tracking-wider">{p}</div>
                                ))}
                            </div>
                        </ProductSlide>

                        <ProductSlide
                            num="03"
                            title="DMCA Automation"
                            desc="Automatically generates legally formatted DMCA takedown notices when your art is stolen. Send to any platform with one click."
                            img="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1600&h=900&fit=crop&q=80"
                            gradient="bg-gradient-to-r from-black/80 via-black/50 to-transparent"
                        />

                        <ProductSlide
                            num="04"
                            title="Blockchain Proof"
                            desc="Permanent, tamper-proof timestamp of your work on the blockchain. Verifiable by anyone, anywhere."
                            img="https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=1600&h=900&fit=crop&q=80"
                            gradient="bg-gradient-to-l from-black/80 via-black/50 to-transparent"
                        />

                        <ProductSlide
                            num="05"
                            title="Universal SDK"
                            desc="Protect your entire portfolio with two lines of code. Integrates with any framework or platform."
                            img="https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1600&h=900&fit=crop&q=80"
                            gradient="bg-gradient-to-r from-black/80 via-black/30 to-transparent"
                        />

                        {/* ─── CTA ─── */}
                        <section className="relative z-10 h-screen flex items-center justify-center snap-start px-6">
                            <div className="text-center max-w-3xl">
                                <RevealText>
                                    <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500 mb-6">CVBER</div>
                                </RevealText>
                                <RevealText delay={0.1}>
                                    <h2 className="text-5xl md:text-7xl lg:text-[80px] font-black tracking-tighter leading-[0.9] mb-6 uppercase italic">Join the<br />Resistance.</h2>
                                </RevealText>
                                <RevealText delay={0.2}>
                                    <p className="text-zinc-500 text-base max-w-md mx-auto mb-10">Reclaim your digital sovereignty today.</p>
                                </RevealText>
                                <RevealText delay={0.3}>
                                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                        <button onClick={() => setOnboardingOpen(true)} className="px-10 py-5 bg-white text-black rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-zinc-100 transition-all inline-flex items-center gap-3 active:scale-95 shadow-xl shadow-black/20">
                                            Secure Your Art <ArrowRight className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => setVideoOpen(true)} className="px-8 py-5 rounded-xl font-bold text-sm uppercase tracking-widest text-zinc-400 hover:text-white border border-white/[0.08] hover:border-white/20 transition-all inline-flex items-center gap-3">
                                            Play Demo <Play className="w-4 h-4" />
                                        </button>
                                    </div>
                                </RevealText>
                            </div>
                        </section>

                        {/* ─── FOOTER ─── */}
                        <footer className="relative z-10 py-16 px-6 border-t border-white/[0.04] snap-start">
                            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 text-zinc-600 font-bold text-[9px] uppercase tracking-[0.3em]">
                                <div className="flex items-center gap-3 opacity-30 grayscale brightness-200">
                                    <Shield className="w-5 h-5" />
                                    <span className="text-xs font-black tracking-tighter uppercase italic">CVBER</span>
                                </div>
                                <div className="flex flex-wrap justify-center gap-8">
                                    <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
                                    <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
                                    <Link href="/art-hub" className="hover:text-white transition-colors">Help</Link>
                                </div>
                                <div className="opacity-40">&copy; 2026 CVBER</div>
                            </div>
                        </footer>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
