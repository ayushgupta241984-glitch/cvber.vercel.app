"use client";

import { useState, useRef, useEffect, useCallback, MouseEvent } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Shield, ChevronDown, Play, X, ExternalLink, Eye, Lock, Zap, FileText } from "lucide-react";
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
            <motion.div animate={{ x: [0, 100, -50, 0], y: [0, -80, 60, 0], scale: [1, 1.3, 0.9, 1], opacity: [0.15, 0.3, 0.12, 0.15] }} transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }} className="absolute top-[-20%] left-[10%] w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[150px]" />
            <motion.div animate={{ x: [0, -80, 40, 0], y: [0, 60, -40, 0], scale: [1, 0.8, 1.2, 1], opacity: [0.1, 0.2, 0.08, 0.1] }} transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 3 }} className="absolute bottom-[10%] right-[5%] w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-[130px]" />
            {Array.from({ length: 20 }).map((_, i) => (
                <motion.div key={i} className="absolute w-1 h-1 rounded-full bg-white/[0.15]" style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }} animate={{ y: [0, -(20 + Math.random() * 40), 0], opacity: [0, 0.4, 0] }} transition={{ duration: 4 + Math.random() * 6, repeat: Infinity, delay: Math.random() * 5, ease: "easeInOut" }} />
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
        gsap.to(barRef.current, { scaleY: 1, ease: "none", scrollTrigger: { trigger: document.documentElement, start: "top top", end: "bottom bottom", scrub: 0.3 } });
    }, []);
    return (
        <div className="fixed right-6 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col items-center gap-3">
            <div className="w-px h-20 bg-white/[0.06] relative overflow-hidden rounded-full">
                <div ref={barRef} className="absolute inset-x-0 top-0 h-full bg-gradient-to-b from-purple-500 to-blue-500 origin-top scale-y-0 rounded-full" />
            </div>
        </div>
    );
}

// ─── Interactive Card (Lusion-style hover) ────────────────────────

function InteractiveCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    const ref = useRef<HTMLDivElement>(null);
    const [rotate, setRotate] = useState({ x: 0, y: 0 });

    const handleMouse = useCallback((e: MouseEvent<HTMLDivElement>) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        setRotate({ x: (y - centerY) / 20, y: (centerX - x) / 20 });
    }, []);

    const reset = useCallback(() => setRotate({ x: 0, y: 0 }), []);

    return (
        <div ref={ref} onMouseMove={handleMouse} onMouseLeave={reset} className={className} style={{ perspective: 1000 }}>
            <div style={{ transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`, transition: "transform 0.15s ease-out" }} className="h-full">
                {children}
            </div>
        </div>
    );
}

// ─── GSAP Reveal ─────────────────────────────────────────────────

function GSSection({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (!ref.current) return;
        gsap.fromTo(ref.current, { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: 1, ease: "power3.out", delay, scrollTrigger: { trigger: ref.current, start: "top 85%", once: true } });
    }, [delay]);
    return <div ref={ref} className={className}>{children}</div>;
}

function RevealText({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (!ref.current) return;
        gsap.fromTo(ref.current, { clipPath: "inset(0 0 100% 0)", y: 40, opacity: 0 }, { clipPath: "inset(0 0 0% 0)", y: 0, opacity: 1, duration: 1, ease: "power3.out", delay, scrollTrigger: { trigger: ref.current, start: "top 85%", once: true } });
    }, [delay]);
    return <div ref={ref} className={className}>{children}</div>;
}

// ─── Showcase Images (art protection examples) ────────────────────

const showcaseImages = [
    { src: "https://images.unsplash.com/photo-1561998338-13ad7883b20f?w=600&h=800&fit=crop&q=80", title: "Digital Illustration", tag: "Protected", color: "from-purple-600 to-pink-600" },
    { src: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=600&h=800&fit=crop&q=80", title: "Abstract Art", tag: "Monitored", color: "from-blue-600 to-cyan-600" },
    { src: "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=600&h=800&fit=crop&q=80", title: "Photography", tag: "Certified", color: "from-amber-600 to-orange-600" },
    { src: "https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=600&h=800&fit=crop&q=80", title: "Concept Art", tag: "Protected", color: "from-green-600 to-emerald-600" },
    { src: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&h=800&fit=crop&q=80", title: "AI Art", tag: "Verified", color: "from-violet-600 to-purple-600" },
    { src: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=800&fit=crop&q=80", title: "Brand Assets", tag: "Secured", color: "from-rose-600 to-red-600" },
];

// ─── Page ───────────────────────────────────────────────────────────

export default function Home() {
    const [loaded, setLoaded] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [videoOpen, setVideoOpen] = useState(false);
    const [playing, setPlaying] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const showcaseRef = useRef<HTMLDivElement>(null);

    const handlePlay = useCallback(() => {
        if (videoRef.current) {
            if (playing) videoRef.current.pause(); else videoRef.current.play();
            setPlaying(!playing);
        }
    }, [playing]);

    // Hero entrance
    useEffect(() => {
        if (!loaded) return;
        const tl = gsap.timeline({ delay: 0.2 });
        tl.fromTo(".hero-badge", { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.6, ease: "back.out(1.7)" })
          .fromTo(".hero-title", { opacity: 0, y: 50, clipPath: "inset(0 0 100% 0)" }, { opacity: 1, y: 0, clipPath: "inset(0 0 0% 0)", duration: 0.9, ease: "power3.out" }, "-=0.3")
          .fromTo(".hero-subtitle", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }, "-=0.5")
          .fromTo(".hero-cta", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }, "-=0.3")
          .fromTo(".hero-proof", { opacity: 0 }, { opacity: 1, duration: 0.5 }, "-=0.2")
          .fromTo(".hero-mockup", { opacity: 0, y: 60, scale: 0.95 }, { opacity: 1, y: 0, scale: 1, duration: 1, ease: "power3.out" }, "-=0.4")
          .fromTo(".hero-scroll", { opacity: 0 }, { opacity: 1, duration: 0.5 }, "-=0.2");
    }, [loaded]);

    // Hero parallax
    useEffect(() => {
        if (!loaded) return;
        gsap.to(".hero-content", { y: 150, opacity: 0, ease: "none", scrollTrigger: { trigger: ".hero-section", start: "top top", end: "bottom top", scrub: 0.5 } });
        gsap.to(".hero-mockup", { y: 100, ease: "none", scrollTrigger: { trigger: ".hero-section", start: "top top", end: "bottom top", scrub: 0.3 } });
    }, [loaded]);

    // Showcase horizontal scroll
    useEffect(() => {
        if (!loaded || !showcaseRef.current) return;
        const el = showcaseRef.current;
        const totalScroll = el.scrollWidth - el.parentElement!.offsetWidth;
        gsap.to(el, { x: -totalScroll, ease: "none", scrollTrigger: { trigger: ".showcase-section", start: "top 40%", end: "bottom 20%", scrub: 1, pin: true } });
    }, [loaded]);

    return (
        <>
            <StructuredData />
            <Preloader onComplete={() => setLoaded(true)} />
            <AnimatePresence>
                {loaded && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }} className="relative min-h-screen bg-[#050505] text-white selection:bg-purple-500/30 overflow-x-hidden font-sans">
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
                                <Link href="/onboarding" className="hidden md:inline-flex text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 hover:text-white transition-colors">Get Started</Link>
                                <button onClick={() => setMenuOpen(true)} className="w-9 h-9 rounded-full border border-white/[0.08] flex items-center justify-center hover:border-white/20 transition-colors">
                                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-zinc-400"><path d="M0 7h14M0 2h14M0 12h14" stroke="currentColor" strokeWidth="1.5" /></svg>
                                </button>
                            </div>
                        </header>

                        {/* ─── HERO ─── */}
                        <section className="hero-section relative z-10 min-h-screen flex flex-col items-center justify-center px-6 pb-24 pt-32">
                            <div className="hero-content flex flex-col items-center text-center mb-16">
                                <div className="hero-badge inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.02] border border-white/[0.06] text-zinc-500 text-[9px] font-bold uppercase tracking-[0.2em] mb-8 opacity-0">
                                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
                                    AI Art Protection
                                </div>
                                <h1 className="hero-title text-5xl md:text-7xl lg:text-[100px] font-black tracking-tighter leading-[0.9] mb-5 opacity-0">
                                    Protect your art<br />
                                    <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">from AI theft</span>
                                </h1>
                                <p className="hero-subtitle text-base md:text-lg text-zinc-500 max-w-lg mb-10 leading-relaxed opacity-0">
                                    Free C2PA certificates, DMCA automation, and 24/7 monitoring.
                                </p>
                                <div className="hero-cta flex flex-col sm:flex-row items-center gap-4 opacity-0">
                                    <Link href="/onboarding" className="group px-10 py-5 bg-white text-black rounded-xl font-bold text-sm hover:bg-zinc-200 transition-all flex items-center gap-3 active:scale-95 shadow-[0_20px_40px_rgba(255,255,255,0.05)]">
                                        Get Started <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                    <button onClick={() => setVideoOpen(true)} className="group px-8 py-5 rounded-xl font-bold text-sm text-zinc-400 hover:text-white border border-white/[0.06] hover:border-white/[0.15] transition-all flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center group-hover:bg-white/[0.1] transition-colors">
                                            <Play className="w-3 h-3 text-white fill-white ml-0.5" />
                                        </div>
                                        Watch Demo
                                    </button>
                                </div>
                                <div className="hero-proof flex items-center justify-center gap-4 mt-8 text-zinc-600 text-xs opacity-0">
                                    <span>Free forever</span><span>·</span><span>No credit card</span><span>·</span><span>30s setup</span>
                                </div>
                            </div>

                            {/* Hero Mockup — Dashboard Preview */}
                            <div className="hero-mockup w-full max-w-5xl opacity-0">
                                <InteractiveCard className="rounded-2xl overflow-hidden">
                                    <div className="relative rounded-2xl border border-white/[0.08] bg-[#0a0a0a] overflow-hidden shadow-[0_40px_100px_rgba(168,85,247,0.15)]">
                                        {/* Browser chrome */}
                                        <div className="flex items-center gap-2 px-5 py-3.5 border-b border-white/[0.06] bg-[#0d0d0d]">
                                            <div className="flex gap-1.5">
                                                <div className="w-3 h-3 rounded-full bg-red-500/60" />
                                                <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                                                <div className="w-3 h-3 rounded-full bg-green-500/60" />
                                            </div>
                                            <div className="flex-1 flex justify-center">
                                                <div className="px-4 py-1 rounded-lg bg-white/[0.04] text-[10px] text-zinc-500 font-mono">cvber.vercel.app/dashboard</div>
                                            </div>
                                        </div>
                                        {/* Dashboard content */}
                                        <div className="p-6 md:p-8">
                                            <div className="grid grid-cols-3 gap-4 mb-6">
                                                <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
                                                    <div className="text-2xl font-black text-purple-400">47</div>
                                                    <div className="text-[10px] text-zinc-500 uppercase tracking-wider mt-1">Artworks Protected</div>
                                                </div>
                                                <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                                                    <div className="text-2xl font-black text-blue-400">12</div>
                                                    <div className="text-[10px] text-zinc-500 uppercase tracking-wider mt-1">DMCA Sent</div>
                                                </div>
                                                <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                                                    <div className="text-2xl font-black text-green-400">99%</div>
                                                    <div className="text-[10px] text-zinc-500 uppercase tracking-wider mt-1">Scan Accuracy</div>
                                                </div>
                                            </div>
                                            <div className="flex gap-4">
                                                <div className="flex-1 rounded-xl border border-white/[0.06] overflow-hidden">
                                                    <img src="https://images.unsplash.com/photo-1561998338-13ad7883b20f?w=400&h=300&fit=crop&q=80" alt="Protected artwork" className="w-full h-40 object-cover opacity-80" />
                                                    <div className="p-4 flex items-center justify-between">
                                                        <div>
                                                            <div className="text-xs font-bold">Cyberpunk Sunset.png</div>
                                                            <div className="text-[10px] text-zinc-500 mt-0.5">C2PA Certified · 2 hours ago</div>
                                                        </div>
                                                        <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                                                            <Lock className="w-3.5 h-3.5 text-green-400" />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex-1 rounded-xl border border-white/[0.06] overflow-hidden">
                                                    <img src="https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=400&h=300&fit=crop&q=80" alt="Monitored artwork" className="w-full h-40 object-cover opacity-80" />
                                                    <div className="p-4 flex items-center justify-between">
                                                        <div>
                                                            <div className="text-xs font-bold">Abstract Flow.jpg</div>
                                                            <div className="text-[10px] text-zinc-500 mt-0.5">Monitoring · 15 platforms</div>
                                                        </div>
                                                        <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                                                            <Eye className="w-3.5 h-3.5 text-blue-400" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </InteractiveCard>
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
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm" onClick={() => { setVideoOpen(false); setPlaying(false); }}>
                                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }} className="relative w-full max-w-4xl aspect-video mx-6" onClick={(e) => e.stopPropagation()}>
                                        <button onClick={() => { setVideoOpen(false); setPlaying(false); }} className="absolute -top-12 right-0 w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:border-white/50 transition-colors">
                                            <X className="w-4 h-4 text-white" />
                                        </button>
                                        <div className="w-full h-full rounded-2xl overflow-hidden bg-gradient-to-br from-purple-900/50 to-blue-900/50 border border-white/[0.06] flex items-center justify-center">
                                            <video ref={videoRef} className="w-full h-full object-cover" onEnded={() => setPlaying(false)}>
                                                <source src="https://cdn.coverr.co/videos/coverr-purple-ink-in-water-3483/1080p.mp4" type="video/mp4" />
                                            </video>
                                            <button onClick={handlePlay} className="absolute inset-0 flex items-center justify-center">
                                                {!playing && (
                                                    <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-20 h-20 rounded-full bg-white/10 border border-white/20 flex items-center justify-center backdrop-blur-sm hover:bg-white/20 transition-colors">
                                                        <Play className="w-8 h-8 text-white fill-white ml-1" />
                                                    </motion.div>
                                                )}
                                            </button>
                                        </div>
                                    </motion.div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* ─── SHOWCASE — Horizontal scroll gallery ─── */}
                        <section className="showcase-section relative z-10 py-32 overflow-hidden">
                            <div className="max-w-7xl mx-auto px-6 mb-12">
                                <RevealText>
                                    <h2 className="text-3xl md:text-5xl font-black tracking-tighter mb-3">Protected Artwork</h2>
                                </RevealText>
                                <RevealText delay={0.1}>
                                    <p className="text-zinc-500 max-w-md">Every piece of art on CVBER gets a cryptographic certificate and 24/7 monitoring.</p>
                                </RevealText>
                            </div>
                            <div className="overflow-hidden">
                                <div ref={showcaseRef} className="flex gap-6 px-6 md:px-12 w-max">
                                    {showcaseImages.map((img, i) => (
                                        <InteractiveCard key={i} className="w-[350px] shrink-0">
                                            <div className="group relative rounded-2xl overflow-hidden border border-white/[0.06] bg-[#0a0a0a]">
                                                <div className="relative h-[450px] overflow-hidden">
                                                    <img src={img.src} alt={img.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                                                    <div className={`absolute top-4 left-4 px-3 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-gradient-to-r ${img.color} text-white`}>
                                                        {img.tag}
                                                    </div>
                                                    <div className="absolute bottom-0 left-0 right-0 p-6">
                                                        <h3 className="text-xl font-black mb-2">{img.title}</h3>
                                                        <div className="flex items-center gap-2 text-[10px] text-zinc-400">
                                                            <Lock className="w-3 h-3" />
                                                            <span>C2PA Certificate</span>
                                                            <span>·</span>
                                                            <span>Blockchain Verified</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </InteractiveCard>
                                    ))}
                                </div>
                            </div>
                        </section>

                        {/* ─── HOW IT WORKS with images ─── */}
                        <section className="relative z-10 py-32 px-6">
                            <div className="max-w-6xl mx-auto">
                                <RevealText className="text-center mb-20">
                                    <h2 className="text-3xl md:text-5xl font-black tracking-tighter mb-4">How it works</h2>
                                    <p className="text-zinc-500 max-w-md mx-auto">Three steps to protect your creative work forever.</p>
                                </RevealText>
                                <div className="grid md:grid-cols-3 gap-8">
                                    {[
                                        { step: "01", title: "Upload your work", desc: "Drag and drop any image. JPEG, PNG, WebP — all standard formats.", img: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=300&fit=crop&q=80", icon: Zap },
                                        { step: "02", title: "We scan & certify", desc: "C2PA certificate issued. We scan 15+ platforms for unauthorized copies.", img: "https://images.unsplash.com/photo-1509281373149-e957c6296406?w=400&h=300&fit=crop&q=80", icon: Eye },
                                        { step: "03", title: "24/7 protection", desc: "We monitor the web for theft and auto-generate DMCA takedown notices.", img: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&h=300&fit=crop&q=80", icon: Shield },
                                    ].map((item, i) => (
                                        <GSSection key={i} delay={i * 0.15}>
                                            <div className="group rounded-2xl overflow-hidden border border-white/[0.06] bg-[#0a0a0a] hover:border-white/[0.12] transition-all">
                                                <div className="relative h-48 overflow-hidden">
                                                    <img src={item.img} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] to-transparent" />
                                                    <div className="absolute top-4 left-4 w-10 h-10 rounded-xl bg-white/[0.08] backdrop-blur-sm flex items-center justify-center border border-white/[0.1]">
                                                        <item.icon className="w-4 h-4 text-white" />
                                                    </div>
                                                </div>
                                                <div className="p-6">
                                                    <div className="text-[10px] font-mono text-zinc-500 mb-2">STEP {item.step}</div>
                                                    <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                                                    <p className="text-zinc-500 text-sm leading-relaxed">{item.desc}</p>
                                                </div>
                                            </div>
                                        </GSSection>
                                    ))}
                                </div>
                            </div>
                        </section>

                        {/* ─── FEATURES with interactive cards ─── */}
                        <section className="relative z-10 py-32 px-6 border-t border-white/[0.04]">
                            <div className="max-w-7xl mx-auto">
                                <RevealText className="mb-16">
                                    <h2 className="text-3xl md:text-5xl font-black tracking-tighter mb-4">Everything you need</h2>
                                    <p className="text-zinc-500 max-w-md">From cryptographic certificates to automated enforcement.</p>
                                </RevealText>
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                                    <InteractiveCard className="md:col-span-8">
                                        <div className="p-10 md:p-14 rounded-3xl bg-white/[0.01] border border-white/[0.04] min-h-[380px] flex flex-col justify-between group hover:border-purple-500/20 transition-all h-full relative overflow-hidden">
                                            <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/5 rounded-full blur-[100px]" />
                                            <div className="relative z-10">
                                                <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-8">
                                                    <Zap className="w-6 h-6 text-purple-400" />
                                                </div>
                                                <h3 className="text-3xl md:text-4xl font-black tracking-tight mb-4">Neural-Net Monitoring</h3>
                                                <p className="text-base text-zinc-500 max-w-sm leading-relaxed">Continuous deep-web scanning detects unauthorized usage across social platforms and marketplaces.</p>
                                            </div>
                                            <div className="relative z-10 mt-8 flex gap-4">
                                                <img src="https://images.unsplash.com/photo-1561998338-13ad7883b20f?w=200&h=150&fit=crop&q=80" alt="" className="w-24 h-18 rounded-lg object-cover border border-white/[0.06] opacity-60" />
                                                <img src="https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=200&h=150&fit=crop&q=80" alt="" className="w-24 h-18 rounded-lg object-cover border border-white/[0.06] opacity-60" />
                                                <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&h=150&fit=crop&q=80" alt="" className="w-24 h-18 rounded-lg object-cover border border-white/[0.06] opacity-60" />
                                            </div>
                                        </div>
                                    </InteractiveCard>

                                    <InteractiveCard className="md:col-span-4">
                                        <div className="p-10 rounded-3xl bg-white/[0.01] border border-white/[0.04] min-h-[380px] flex flex-col justify-between group hover:border-blue-500/20 transition-all h-full">
                                            <div>
                                                <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-8">
                                                    <Eye className="w-6 h-6 text-blue-400" />
                                                </div>
                                                <h3 className="text-3xl md:text-4xl font-black tracking-tight mb-4">Asset Verification</h3>
                                                <p className="text-base text-zinc-500 max-w-sm leading-relaxed">Verify origin of any file using our C2PA validator.</p>
                                            </div>
                                            <Link href="/verify" className="mt-8 text-[10px] font-bold uppercase tracking-widest text-blue-500 flex items-center gap-2 group/link">
                                                Launch Validator <ArrowRight className="w-3 h-3 group-hover/link:translate-x-1 transition-transform" />
                                            </Link>
                                        </div>
                                    </InteractiveCard>

                                    <InteractiveCard className="md:col-span-4">
                                        <div className="p-10 rounded-3xl bg-white/[0.01] border border-white/[0.04] min-h-[380px] flex flex-col justify-between group hover:border-amber-500/20 transition-all h-full">
                                            <div>
                                                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-8">
                                                    <FileText className="w-6 h-6 text-amber-400" />
                                                </div>
                                                <h3 className="text-3xl md:text-4xl font-black tracking-tight mb-4">The Art Hub</h3>
                                                <p className="text-base text-zinc-500 max-w-sm leading-relaxed">DMCA templates, scraping defense guides, legal toolkits.</p>
                                            </div>
                                            <Link href="/art-hub" className="mt-8 text-[10px] font-bold uppercase tracking-widest text-amber-500 flex items-center gap-2 group/link">
                                                Enter Hub <ArrowRight className="w-3 h-3 group-hover/link:translate-x-1 transition-transform" />
                                            </Link>
                                        </div>
                                    </InteractiveCard>

                                    <InteractiveCard className="md:col-span-8">
                                        <div className="p-10 md:p-14 rounded-3xl bg-white/[0.01] border border-white/[0.04] min-h-[380px] flex flex-col justify-between group hover:border-green-500/20 transition-all h-full relative overflow-hidden">
                                            <div className="absolute bottom-0 left-0 w-60 h-60 bg-green-500/5 rounded-full blur-[80px]" />
                                            <div className="relative z-10">
                                                <div className="w-14 h-14 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-8">
                                                    <Shield className="w-6 h-6 text-green-400" />
                                                </div>
                                                <h3 className="text-3xl md:text-4xl font-black tracking-tight mb-4">Universal SDK</h3>
                                                <p className="text-base text-zinc-500 max-w-sm leading-relaxed">Protect your entire portfolio with two lines of code.</p>
                                            </div>
                                            <div className="relative z-10 mt-8 p-6 md:p-8 rounded-2xl bg-black/60 border border-white/[0.04] font-mono text-xs text-green-400/50 leading-relaxed backdrop-blur-sm">
                                                <pre className="whitespace-pre-wrap">{`const defense = await Cvber.init({\n  vault: "./assets/*",\n  autoReport: true,\n  monitor: true\n});`}</pre>
                                            </div>
                                        </div>
                                    </InteractiveCard>
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
                                        { title: "C2PA Certificates", desc: "Cryptographic proof of ownership embedded in your files. Recognized by Adobe, Microsoft, Google, and the BBC.", img: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&h=250&fit=crop&q=80" },
                                        { title: "DMCA Automation", desc: "Automatically generates legally formatted DMCA takedown notices when your art is stolen.", img: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400&h=250&fit=crop&q=80" },
                                        { title: "24/7 Monitoring", desc: "Watchtower scans social media, stock sites, and NFT marketplaces continuously.", img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop&q=80" },
                                    ].map((item, i) => (
                                        <GSSection key={i} delay={i * 0.1}>
                                            <InteractiveCard className="h-full">
                                                <div className="rounded-2xl border border-white/[0.06] overflow-hidden bg-[#0a0a0a] h-full group">
                                                    <div className="relative h-40 overflow-hidden">
                                                        <img src={item.img} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
                                                        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] to-transparent" />
                                                    </div>
                                                    <div className="p-6">
                                                        <h3 className="text-base font-bold mb-3">{item.title}</h3>
                                                        <p className="text-zinc-500 text-sm leading-relaxed">{item.desc}</p>
                                                    </div>
                                                </div>
                                            </InteractiveCard>
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
                            <div className="max-w-5xl mx-auto rounded-[3rem] overflow-hidden relative shadow-[0_40px_80px_rgba(168,85,247,0.2)]">
                                {/* Background image */}
                                <div className="absolute inset-0">
                                    <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&h=600&fit=crop&q=80" alt="" className="w-full h-full object-cover opacity-30" />
                                    <div className="absolute inset-0 bg-gradient-to-br from-purple-900/90 to-blue-900/90" />
                                </div>
                                <div className="relative z-10 p-16 md:p-24 text-center">
                                    <RevealText>
                                        <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-6 uppercase italic leading-none">Join the Resistance.</h2>
                                    </RevealText>
                                    <RevealText delay={0.1}>
                                        <p className="text-base text-purple-100/60 max-w-xl mb-10">Reclaim your digital sovereignty today.</p>
                                    </RevealText>
                                    <RevealText delay={0.2}>
                                        <Link href="/onboarding" className="px-10 py-5 bg-white text-black rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-zinc-100 transition-all inline-flex items-center gap-3 active:scale-95 shadow-xl shadow-black/20">
                                            Secure Your Creative Soul <ArrowRight className="w-4 h-4" />
                                        </Link>
                                    </RevealText>
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
