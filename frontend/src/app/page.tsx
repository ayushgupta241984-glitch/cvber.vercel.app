"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Shield, ChevronDown, Play, X } from "lucide-react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import StructuredData from "@/components/seo/StructuredData";
import Preloader from "@/components/Preloader";
import SidebarNav from "@/components/nav/SidebarNav";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

// ─── Animated Background ──────────────────────────────────────────

function AnimatedBG() {
    return (
        <div className="fixed inset-0 z-0 overflow-hidden">
            <div className="absolute inset-0 bg-[#050505]" />
            <div className="absolute inset-0 bg-grid-white/[0.015] bg-[size:50px_50px]" />

            <motion.div
                animate={{ x: [0, 100, -50, 0], y: [0, -80, 60, 0], scale: [1, 1.3, 0.9, 1], opacity: [0.15, 0.3, 0.12, 0.15] }}
                transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-[-20%] left-[10%] w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[150px]"
            />
            <motion.div
                animate={{ x: [0, -80, 40, 0], y: [0, 60, -40, 0], scale: [1, 0.8, 1.2, 1], opacity: [0.1, 0.2, 0.08, 0.1] }}
                transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 3 }}
                className="absolute bottom-[10%] right-[5%] w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-[130px]"
            />
            <motion.div
                animate={{ x: [0, 60, -80, 0], y: [0, -40, 80, 0], scale: [1, 1.1, 0.95, 1], opacity: [0.08, 0.15, 0.05, 0.08] }}
                transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 7 }}
                className="absolute top-[40%] left-[40%] w-[400px] h-[400px] bg-violet-500/10 rounded-full blur-[120px]"
            />

            {Array.from({ length: 30 }).map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute w-1 h-1 rounded-full bg-white/[0.15]"
                    style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
                    animate={{ y: [0, -(20 + Math.random() * 40), 0], opacity: [0, 0.4, 0] }}
                    transition={{ duration: 4 + Math.random() * 6, repeat: Infinity, delay: Math.random() * 5, ease: "easeInOut" }}
                />
            ))}

            <div className="absolute inset-0 bg-[#050505] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,transparent_20%,black)]" />
        </div>
    );
}

// ─── Scroll Progress ──────────────────────────────────────────────

function ScrollProgress() {
    const barRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!barRef.current) return;
        gsap.to(barRef.current, {
            scaleY: 1,
            ease: "none",
            scrollTrigger: {
                trigger: document.documentElement,
                start: "top top",
                end: "bottom bottom",
                scrub: 0.3,
            },
        });
    }, []);

    return (
        <div className="fixed right-6 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col items-center gap-3">
            <div className="w-px h-20 bg-white/[0.06] relative overflow-hidden rounded-full">
                <div ref={barRef} className="absolute inset-x-0 top-0 h-full bg-gradient-to-b from-purple-500 to-blue-500 origin-top scale-y-0 rounded-full" />
            </div>
        </div>
    );
}

// ─── GSAP Text Reveal ────────────────────────────────────────────

function RevealText({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!ref.current) return;
        const el = ref.current;

        gsap.fromTo(el,
            { clipPath: "inset(0 0 100% 0)", y: 40, opacity: 0 },
            {
                clipPath: "inset(0 0 0% 0)", y: 0, opacity: 1,
                duration: 1, ease: "power3.out", delay,
                scrollTrigger: { trigger: el, start: "top 85%", once: true },
            }
        );
    }, [delay]);

    return <div ref={ref} className={className}>{children}</div>;
}

// ─── GSAP Parallax ───────────────────────────────────────────────

function Parallax({ children, className = "", speed = 0.3 }: { children: React.ReactNode; className?: string; speed?: number }) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!ref.current) return;
        gsap.to(ref.current, {
            y: speed * -100,
            ease: "none",
            scrollTrigger: { trigger: ref.current, start: "top bottom", end: "bottom top", scrub: 0.5 },
        });
    }, [speed]);

    return <div ref={ref} className={className}>{children}</div>;
}

// ─── GSAP Section Reveal ─────────────────────────────────────────

function GSSection({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!ref.current) return;
        gsap.fromTo(ref.current,
            { opacity: 0, y: 60 },
            {
                opacity: 1, y: 0,
                duration: 1, ease: "power3.out", delay,
                scrollTrigger: { trigger: ref.current, start: "top 85%", once: true },
            }
        );
    }, [delay]);

    return <div ref={ref} className={className}>{children}</div>;
}

// ─── Page ───────────────────────────────────────────────────────────

export default function Home() {
    const [loaded, setLoaded] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [videoOpen, setVideoOpen] = useState(false);
    const [playing, setPlaying] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    const handlePlay = useCallback(() => {
        if (videoRef.current) {
            if (playing) { videoRef.current.pause(); } else { videoRef.current.play(); }
            setPlaying(!playing);
        }
    }, [playing]);

    // Hero entrance animations
    useEffect(() => {
        if (!loaded) return;
        const tl = gsap.timeline({ delay: 0.2 });

        tl.fromTo(".hero-badge", { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.6, ease: "back.out(1.7)" })
          .fromTo(".hero-title", { opacity: 0, y: 50, clipPath: "inset(0 0 100% 0)" }, { opacity: 1, y: 0, clipPath: "inset(0 0 0% 0)", duration: 0.9, ease: "power3.out" }, "-=0.3")
          .fromTo(".hero-subtitle", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }, "-=0.5")
          .fromTo(".hero-cta", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }, "-=0.3")
          .fromTo(".hero-proof", { opacity: 0 }, { opacity: 1, duration: 0.5 }, "-=0.2")
          .fromTo(".hero-scroll", { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.5 }, "-=0.1");
    }, [loaded]);

    // Parallax on hero content
    useEffect(() => {
        if (!loaded) return;
        gsap.to(".hero-content", {
            y: 150,
            opacity: 0,
            ease: "none",
            scrollTrigger: { trigger: ".hero-section", start: "top top", end: "bottom top", scrub: 0.5 },
        });
    }, [loaded]);

    return (
        <>
            <StructuredData />
            <Preloader onComplete={() => setLoaded(true)} />

            <AnimatePresence>
                {loaded && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.6 }}
                        className="relative min-h-screen bg-[#050505] text-white selection:bg-purple-500/30 overflow-x-hidden font-sans"
                    >
                        <AnimatedBG />
                        <ScrollProgress />
                        <SidebarNav open={menuOpen} onClose={() => setMenuOpen(false)} />

                        {/* ─── HEADER ─── */}
                        <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-5">
                            <Link href="/" className="flex items-center gap-2.5">
                                <Shield className="w-5 h-5 text-purple-400" />
                                <span className="text-sm font-black tracking-tight uppercase italic text-white/80">CVBER</span>
                            </Link>
                            <div className="flex items-center gap-4">
                                <Link href="/onboarding" className="hidden md:inline-flex text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 hover:text-white transition-colors">
                                    Get Started
                                </Link>
                                <button
                                    onClick={() => setMenuOpen(true)}
                                    className="w-9 h-9 rounded-full border border-white/[0.08] flex items-center justify-center hover:border-white/20 transition-colors"
                                >
                                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-zinc-400">
                                        <path d="M0 7h14M0 2h14M0 12h14" stroke="currentColor" strokeWidth="1.5" />
                                    </svg>
                                </button>
                            </div>
                        </header>

                        {/* ─── HERO ─── */}
                        <section className="hero-section relative z-10 min-h-screen flex flex-col items-center justify-center px-6 pb-24">
                            <div className="hero-content flex flex-col items-center text-center">
                                <div className="hero-badge inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.02] border border-white/[0.06] text-zinc-500 text-[9px] font-bold uppercase tracking-[0.2em] mb-8 opacity-0">
                                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
                                    AI Art Protection
                                </div>

                                <h1 className="hero-title text-5xl md:text-7xl lg:text-[100px] font-black tracking-tighter leading-[0.9] mb-5 opacity-0">
                                    Protect your art<br />
                                    <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">from AI theft</span>
                                </h1>

                                <p className="hero-subtitle text-base md:text-lg text-zinc-500 max-w-lg mb-12 leading-relaxed opacity-0">
                                    Free C2PA certificates, DMCA automation, and 24/7 monitoring.
                                </p>

                                <div className="hero-cta flex flex-col sm:flex-row items-center gap-4 opacity-0">
                                    <Link
                                        href="/onboarding"
                                        className="group px-10 py-5 bg-white text-black rounded-xl font-bold text-sm hover:bg-zinc-200 transition-all flex items-center gap-3 active:scale-95 shadow-[0_20px_40px_rgba(255,255,255,0.05)]"
                                    >
                                        Get Started
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                    <button
                                        onClick={() => setVideoOpen(true)}
                                        className="group px-8 py-5 rounded-xl font-bold text-sm text-zinc-400 hover:text-white border border-white/[0.06] hover:border-white/[0.15] transition-all flex items-center gap-3"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center group-hover:bg-white/[0.1] transition-colors">
                                            <Play className="w-3 h-3 text-white fill-white ml-0.5" />
                                        </div>
                                        Watch Demo
                                    </button>
                                </div>

                                <div className="hero-proof flex items-center justify-center gap-4 mt-8 text-zinc-600 text-xs opacity-0">
                                    <span>Free forever</span>
                                    <span>·</span>
                                    <span>No credit card</span>
                                    <span>·</span>
                                    <span>30s setup</span>
                                </div>
                            </div>

                            <div className="hero-scroll absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-0">
                                <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-[0.25em]">Scroll to explore</span>
                                <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
                                    <ChevronDown className="w-4 h-4 text-zinc-500" />
                                </motion.div>
                            </div>
                        </section>

                        {/* ─── VIDEO OVERLAY ─── */}
                        <AnimatePresence>
                            {videoOpen && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.4 }}
                                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm"
                                    onClick={() => { setVideoOpen(false); setPlaying(false); }}
                                >
                                    <motion.div
                                        initial={{ scale: 0.9, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        exit={{ scale: 0.9, opacity: 0 }}
                                        transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                                        className="relative w-full max-w-4xl aspect-video mx-6"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <button
                                            onClick={() => { setVideoOpen(false); setPlaying(false); }}
                                            className="absolute -top-12 right-0 w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:border-white/50 transition-colors"
                                        >
                                            <X className="w-4 h-4 text-white" />
                                        </button>

                                        <div className="w-full h-full rounded-2xl overflow-hidden bg-gradient-to-br from-purple-900/50 to-blue-900/50 border border-white/[0.06] flex items-center justify-center">
                                            <video ref={videoRef} className="w-full h-full object-cover" onEnded={() => setPlaying(false)}>
                                                <source src="https://cdn.coverr.co/videos/coverr-purple-ink-in-water-3483/1080p.mp4" type="video/mp4" />
                                            </video>
                                            <button onClick={handlePlay} className="absolute inset-0 flex items-center justify-center">
                                                {!playing && (
                                                    <motion.div
                                                        initial={{ scale: 0.8, opacity: 0 }}
                                                        animate={{ scale: 1, opacity: 1 }}
                                                        className="w-20 h-20 rounded-full bg-white/10 border border-white/20 flex items-center justify-center backdrop-blur-sm hover:bg-white/20 transition-colors"
                                                    >
                                                        <Play className="w-8 h-8 text-white fill-white ml-1" />
                                                    </motion.div>
                                                )}
                                            </button>
                                        </div>
                                    </motion.div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* ─── HOW IT WORKS ─── */}
                        <section className="relative z-10 py-32 px-6">
                            <div className="max-w-6xl mx-auto">
                                <RevealText className="text-center mb-20">
                                    <h2 className="text-3xl md:text-5xl font-black tracking-tighter mb-4">How it works</h2>
                                    <p className="text-zinc-500 max-w-md mx-auto">Three steps to protect your creative work forever.</p>
                                </RevealText>

                                <div className="grid md:grid-cols-3 gap-8">
                                    {[
                                        { step: "01", title: "Upload your work", desc: "Drag and drop any image. JPEG, PNG, WebP — all standard formats." },
                                        { step: "02", title: "We scan & certify", desc: "C2PA certificate issued. We scan 15+ platforms for unauthorized copies." },
                                        { step: "03", title: "24/7 protection", desc: "We monitor the web for theft and auto-generate DMCA takedown notices." },
                                    ].map((item, i) => (
                                        <GSSection key={i} delay={i * 0.15}>
                                            <div className="p-8 rounded-3xl bg-white/[0.01] border border-white/[0.04] hover:border-white/[0.08] transition-all group h-full">
                                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-transparent flex items-center justify-center mb-6">
                                                    <span className="text-xs font-mono text-zinc-400">{item.step}</span>
                                                </div>
                                                <h3 className="text-lg font-bold mb-3">{item.title}</h3>
                                                <p className="text-zinc-500 text-sm leading-relaxed">{item.desc}</p>
                                            </div>
                                        </GSSection>
                                    ))}
                                </div>
                            </div>
                        </section>

                        {/* ─── FEATURES ─── */}
                        <section className="relative z-10 py-32 px-6 border-t border-white/[0.04]">
                            <div className="max-w-7xl mx-auto">
                                <RevealText className="mb-16">
                                    <h2 className="text-3xl md:text-5xl font-black tracking-tighter mb-4">Everything you need</h2>
                                    <p className="text-zinc-500 max-w-md">From cryptographic certificates to automated enforcement.</p>
                                </RevealText>

                                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                                    {[
                                        { title: "Neural-Net Monitoring", desc: "Continuous deep-web scanning detects unauthorized usage across social platforms and marketplaces.", col: "md:col-span-8", icon: "⚡", iconBg: "bg-purple-500/10 border-purple-500/20" },
                                        { title: "Asset Verification", desc: "Verify origin of any file using our C2PA validator.", col: "md:col-span-4", icon: "🔍", iconBg: "bg-white/[0.03] border-white/[0.06]", link: "/verify", linkText: "Launch Validator" },
                                        { title: "The Art Hub", desc: "DMCA templates, scraping defense guides, legal toolkits.", col: "md:col-span-4", icon: "📖", iconBg: "bg-white/[0.03] border-white/[0.06]", link: "/art-hub", linkText: "Enter Hub" },
                                        { title: "Universal SDK", desc: "Protect your entire portfolio with two lines of code.", col: "md:col-span-8", icon: "🛡️", iconBg: "bg-white/[0.03] border-white/[0.06]", code: true },
                                    ].map((item, i) => (
                                        <GSSection key={i} className={item.col} delay={i * 0.1}>
                                            <div className="p-10 md:p-14 rounded-3xl bg-white/[0.01] border border-white/[0.04] min-h-[380px] flex flex-col justify-between group hover:border-white/[0.08] transition-all h-full">
                                                <div>
                                                    <div className={`w-14 h-14 rounded-2xl ${item.iconBg} border flex items-center justify-center mb-8`}>
                                                        <span className="text-xl">{item.icon}</span>
                                                    </div>
                                                    <h3 className="text-3xl md:text-4xl font-black tracking-tight mb-4">{item.title}</h3>
                                                    <p className="text-base text-zinc-500 max-w-sm leading-relaxed">{item.desc}</p>
                                                </div>
                                                {item.code && (
                                                    <div className="mt-8 p-6 md:p-8 rounded-2xl bg-black/60 border border-white/[0.04] font-mono text-xs text-purple-400/50 leading-relaxed backdrop-blur-sm">
                                                        <pre className="whitespace-pre-wrap">{`const defense = await Cvber.init({\n  vault: "./assets/*",\n  autoReport: true,\n  monitor: true\n});`}</pre>
                                                    </div>
                                                )}
                                                {item.link && (
                                                    <Link href={item.link} className="mt-8 text-[10px] font-bold uppercase tracking-widest text-purple-500 flex items-center gap-2 group/link">
                                                        {item.linkText} <ArrowRight className="w-3 h-3 group-hover/link:translate-x-1 transition-transform" />
                                                    </Link>
                                                )}
                                            </div>
                                        </GSSection>
                                    ))}
                                </div>
                            </div>
                        </section>

                        {/* ─── GEO CONTENT ─── */}
                        <section className="relative z-10 py-32 px-6 border-t border-white/[0.04]" aria-label="What is CVBER">
                            <div className="max-w-5xl mx-auto">
                                <RevealText className="text-center mb-16">
                                    <h2 className="text-3xl md:text-5xl font-black tracking-tighter">What Is CVBER?</h2>
                                </RevealText>

                                <div className="grid md:grid-cols-2 gap-12 mb-20">
                                    <GSSection>
                                        <h3 className="text-lg font-bold mb-4">The Problem</h3>
                                        <p className="text-zinc-500 text-sm leading-relaxed">AI companies scrape millions of artworks from Instagram, TikTok, YouTube, DeviantArt, and stock sites to train generative models — without permission, credit, or compensation.</p>
                                    </GSSection>
                                    <GSSection delay={0.1}>
                                        <h3 className="text-lg font-bold mb-4">The Solution</h3>
                                        <p className="text-zinc-500 text-sm leading-relaxed">CVBER is a free AI-powered art protection platform combining C2PA digital provenance certificates, automated DMCA takedown generation, AI theft detection, and blockchain ownership attestation.</p>
                                    </GSSection>
                                </div>

                                <div className="grid md:grid-cols-3 gap-6">
                                    {[
                                        { title: "C2PA Certificates", desc: "Cryptographic proof of ownership embedded in your files. Recognized by Adobe, Microsoft, Google, and the BBC." },
                                        { title: "DMCA Automation", desc: "Automatically generates legally formatted DMCA takedown notices when your art is stolen. Send to any platform." },
                                        { title: "24/7 Monitoring", desc: "Watchtower scans social media, stock sites, and NFT marketplaces continuously. Get instant alerts on theft." },
                                    ].map((item, i) => (
                                        <GSSection key={i} delay={i * 0.1}>
                                            <div className="p-8 rounded-3xl bg-white/[0.01] border border-white/[0.04] h-full">
                                                <h3 className="text-base font-bold mb-3">{item.title}</h3>
                                                <p className="text-zinc-500 text-sm leading-relaxed">{item.desc}</p>
                                            </div>
                                        </GSSection>
                                    ))}
                                </div>

                                <GSSection className="mt-16 text-center">
                                    <p className="text-zinc-500 text-sm max-w-2xl mx-auto leading-relaxed">
                                        <strong className="text-white">CVBER is free to start.</strong> Upload up to 100 files per month, get C2PA certificates, access DMCA templates — no credit card required.
                                    </p>
                                </GSSection>
                            </div>
                        </section>

                        {/* ─── FINAL CTA ─── */}
                        <section className="relative z-10 py-40 px-6">
                            <div className="max-w-5xl mx-auto rounded-[3rem] bg-gradient-to-br from-purple-600 to-purple-800 p-16 md:p-24 text-center overflow-hidden relative shadow-[0_40px_80px_rgba(168,85,247,0.2)]">
                                <Parallax className="relative z-10 flex flex-col items-center">
                                    <RevealText>
                                        <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-6 uppercase italic leading-none">Join the Resistance.</h2>
                                    </RevealText>
                                    <RevealText delay={0.1}>
                                        <p className="text-base text-purple-100/60 max-w-xl mb-10">Reclaim your digital sovereignty today.</p>
                                    </RevealText>
                                    <RevealText delay={0.2}>
                                        <Link href="/onboarding" className="px-10 py-5 bg-white text-black rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-zinc-100 transition-all flex items-center gap-3 active:scale-95 shadow-xl shadow-black/20">
                                            Secure Your Creative Soul
                                            <ArrowRight className="w-4 h-4" />
                                        </Link>
                                    </RevealText>
                                </Parallax>
                                <div className="absolute bottom-0 right-0 opacity-5 pointer-events-none">
                                    <Shield className="w-[300px] h-[300px] -mr-20 -mb-20 text-white" />
                                </div>
                            </div>
                        </section>

                        {/* ─── FOOTER ─── */}
                        <footer className="relative z-10 py-20 border-t border-white/[0.04] px-6">
                            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 text-zinc-600 font-bold text-[9px] uppercase tracking-[0.3em]">
                                <div className="flex items-center gap-3 opacity-30 grayscale brightness-200">
                                    <Shield className="w-5 h-5" />
                                    <span className="text-xs font-black tracking-tighter uppercase italic">CVBER</span>
                                </div>
                                <div className="flex flex-wrap justify-center gap-8">
                                    <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
                                    <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
                                    <Link href="/contact" className="hover:text-white transition-colors">Support</Link>
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
