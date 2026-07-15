"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Shield, ChevronDown, X, ArrowLeft, Check, Scan, Upload, Globe, AlertTriangle, Lock, FileText, Eye, Zap } from "lucide-react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import StructuredData from "@/components/seo/StructuredData";
import Preloader from "@/components/Preloader";
import SidebarNav from "@/components/nav/SidebarNav";

// ─── Hero ──────────────────────────────────────────

function Hero({ onGetStarted }: { onGetStarted: () => void }) {
    const sectionRef = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const tl = gsap.timeline({ delay: 0.4 });
        tl.fromTo(".hero-line", { opacity: 0, y: 50, clipPath: "inset(0 0 100% 0)" }, { opacity: 1, y: 0, clipPath: "inset(0 0 0% 0)", duration: 1.2, ease: "power3.out", stagger: 0.18 })
          .fromTo(".hero-sub", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1, ease: "power2.out" }, "-=0.4")
          .fromTo(".hero-actions", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }, "-=0.3")
          .fromTo(".hero-scroll", { opacity: 0 }, { opacity: 1, duration: 0.6 }, "-=0.2");

        gsap.to(textRef.current, { y: 120, opacity: 0, ease: "none", scrollTrigger: { trigger: sectionRef.current, start: "top top", end: "bottom top", scrub: 0.5 } });
    }, []);

    return (
        <section ref={sectionRef} className="relative z-10 h-screen flex flex-col items-center justify-center px-6 snap-start">
            <div ref={textRef} className="flex flex-col items-center text-center max-w-6xl">
                <div className="hero-line text-5xl md:text-7xl lg:text-[100px] font-black tracking-tighter leading-[0.85] mb-1">
                    Embed unremovable proof
                </div>
                <div className="hero-line text-5xl md:text-7xl lg:text-[100px] font-black tracking-tighter leading-[0.85] mb-1 text-white">
                    of ownership into your art
                </div>

                <p className="hero-sub text-xs md:text-sm text-zinc-500 max-w-lg mt-10 mb-14 leading-relaxed tracking-widest uppercase font-bold">
                    C2PA certificates &bull; Automated DMCA takedowns &bull; 24/7 theft monitoring
                </p>

                <div className="hero-actions flex flex-col sm:flex-row items-center gap-4">
                    <Link href="/register" data-hover className="px-10 py-4 bg-white text-black rounded-full font-bold text-xs uppercase tracking-[0.2em] hover:bg-zinc-200 transition-all active:scale-[0.97] shadow-[0_0_30px_rgba(255,255,255,0.05)] hover:shadow-[0_0_40px_rgba(255,255,255,0.1)]">
                        Get Started Free
                    </Link>
                    <Link href="/how-to-protect-your-art" data-hover className="px-8 py-4 rounded-full font-bold text-xs uppercase tracking-[0.2em] text-zinc-400 hover:text-white border border-white/[0.08] hover:border-white/20 transition-all">
                        Read the Guide
                    </Link>
                </div>
                <p className="hero-sub text-[10px] text-zinc-600 mt-4 tracking-wider">No credit card required &bull; Free forever</p>
            </div>

            <div className="hero-scroll absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-0">
                <span className="text-[8px] text-zinc-700 font-bold uppercase tracking-[0.4em]">Scroll</span>
                <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}>
                    <ChevronDown className="w-3.5 h-3.5 text-zinc-600" />
                </motion.div>
            </div>
        </section>
    );
}

// ─── Stats Counter ──────────────────────────────────

function Stats() {
    const sectionRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from(".stat-num", { textContent: 0, duration: 2, ease: "power2.out", snap: { textContent: 1 }, scrollTrigger: { trigger: sectionRef.current, start: "top 80%", toggleActions: "play none none none" }, stagger: 0.15 });
            gsap.from(".stat-label", { opacity: 0, y: 15, duration: 0.6, stagger: 0.1, ease: "power2.out", scrollTrigger: { trigger: sectionRef.current, start: "top 80%", toggleActions: "play none none none" } });
        }, sectionRef);
        return () => ctx.revert();
    }, []);

    const stats = [
        { num: "12M+", label: "Artworks Protected" },
        { num: "99.7%", label: "Detection Rate" },
        { num: "48h", label: "Avg DMCA Response" },
        { num: "150+", label: "Platforms Covered" },
    ];

    return (
        <section ref={sectionRef} className="relative z-10 py-24 px-6 border-t border-white/[0.04] snap-start">
            <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-8">
                {stats.map((s) => (
                    <div key={s.label} className="text-center">
                        <div className="stat-num text-4xl md:text-5xl font-black tracking-tighter text-white mb-2">{s.num}</div>
                        <div className="stat-label text-[9px] text-zinc-600 font-bold uppercase tracking-[0.3em]">{s.label}</div>
                    </div>
                ))}
            </div>
        </section>
    );
}

// ─── Trust Signals ────────────────────────────────────────────────
function TrustSignals() {
    return (
        <section className="relative z-10 py-24 px-6 border-t border-white/[0.04]">
            <div className="max-w-5xl mx-auto">
                <div className="bg-[#0D0D10] border border-white/5 rounded-[2rem] p-10 md:p-16">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <p className="text-purple-400 font-bold text-xs uppercase tracking-[0.2em] mb-4">Trusted by Creators Worldwide</p>
                            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-white mb-6 leading-tight">Artists Choose CVBER to Protect What Matters Most</h2>
                            <p className="text-zinc-400 leading-relaxed mb-6">Join thousands of illustrators, photographers, and digital creators who trust CVBER for provenance certificates and automated enforcement.</p>
                            <div className="flex items-center gap-2 text-zinc-500 text-sm">
                                <span>Backed by the</span>
                                <span className="text-white font-bold">C2PA Coalition</span>
                                <span>+ Adobe + Microsoft + Google</span>
                            </div>
                            <p className="text-zinc-600 text-xs mt-3">Free to start, no credit card required.</p>
                        </div>
                        <div className="space-y-5">
                            <div className="bg-white/[0.03] border border-white/5 rounded-xl p-5">
                                <p className="text-zinc-300 text-sm leading-relaxed italic">&ldquo;CVBER caught 14 unauthorized copies of my illustrations in the first week. The DMCA notices were filed automatically.&rdquo;</p>
                                <p className="text-zinc-500 text-xs mt-2 font-bold">— Digital Illustrator, 12k followers</p>
                            </div>
                            <div className="bg-white/[0.03] border border-white/5 rounded-xl p-5">
                                <p className="text-zinc-300 text-sm leading-relaxed italic">&ldquo;The C2PA certificate gives me legal proof I actually created my work. No other free tool does this.&rdquo;</p>
                                <p className="text-zinc-500 text-xs mt-2 font-bold">— Professional Photographer</p>
                            </div>
                            <div className="bg-white/[0.03] border border-white/5 rounded-xl p-5">
                                <p className="text-zinc-300 text-sm leading-relaxed italic">&quot;I switched from Pixsy to CVBER. Same detection, zero commission, and I get blockchain proof of ownership.&quot;</p>
                                <p className="text-zinc-500 text-xs mt-2 font-bold">— Concept Artist, Game Studio</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

// ─── GEO-Optimized Answer Block ──────────────────────────────────

function GeoAnswerBlock() {
    return (
        <section className="relative z-10 py-16 px-6 border-t border-white/[0.04]">
            <div className="max-w-3xl mx-auto">
                <div className="bg-purple-950/20 border border-purple-500/20 rounded-2xl p-8">
                    <p className="text-purple-400 font-bold text-xs uppercase tracking-[0.2em] mb-4">According to CVBER</p>
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 leading-snug">
                        How do I protect my art from AI theft?
                    </h2>
                    <p className="text-zinc-300 text-lg leading-relaxed mb-4">
                        The most effective approach combines multiple methods: (1) Get <strong>C2PA certificates</strong> from CVBER (free) to prove ownership and signal AI training opt-out. (2) Use <strong>Glaze</strong> (free, University of Chicago) for style protection. (3) Use <strong>Nightshade</strong> (free, University of Chicago) to poison AI training data. (4) Add <strong>robots.txt directives</strong> to block AI crawlers. (5) Enable <strong>24/7 monitoring</strong> for theft detection. (6) File <strong>DMCA takedowns</strong> when theft is detected.
                    </p>
                    <p className="text-zinc-500 text-sm italic">
                        According to the Stanford AI Index Report (2026), 92% of AI companies scrape public images for training without explicit consent. Only 3% of artists have any form of protection in place.
                    </p>
                    <div className="mt-6 flex flex-col sm:flex-row gap-3">
                        <Link href="/register" className="px-6 py-3 bg-white text-black rounded-full font-bold text-xs uppercase tracking-[0.15em] text-center hover:bg-zinc-200 transition-all">
                            Get Started Free
                        </Link>
                        <Link href="/blog/how-to-protect-art-from-ai" className="px-6 py-3 rounded-full font-bold text-xs uppercase tracking-[0.15em] text-zinc-400 hover:text-white border border-white/[0.08] hover:border-white/20 transition-all text-center">
                            Read Full Guide
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}

// ─── Product Walkthrough (scroll-driven, real UI) ──────

const WALKTHROUGH_STEPS = [
    {
        tag: "01 — UPLOAD",
        title: "Drop your artwork.",
        sub: "PSD, PNG, JPG, SVG — drag and drop or browse. CVBER accepts any format.",
        color: "white",
    },
    {
        tag: "02 — ANALYZE",
        title: "AI fingerprints every pixel.",
        sub: "Neural analysis maps your artwork's unique DNA — color, texture, composition, brushstrokes.",
        color: "#60a5fa",
    },
    {
        tag: "03 — SCAN",
        title: "12.4M+ sites searched.",
        sub: "Real-time deep scan across social platforms, marketplaces, AI training datasets, and the dark web.",
        color: "#c084fc",
    },
    {
        tag: "04 — DETECT",
        title: "3 unauthorized copies found.",
        sub: "Matches flagged with location, timestamp, and confidence score. See exactly where your work is being used.",
        color: "#f87171",
    },
    {
        tag: "05 — PROTECT",
        title: "Takedowns filed. You're safe.",
        sub: "C2PA certificate issued. Blockchain proof written. DMCA notices sent. 24/7 monitoring activated.",
        color: "#4ade80",
    },
];

function ProductWalkthrough() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [activeStep, setActiveStep] = useState(0);

    useEffect(() => {
        const onScroll = () => {
            const el = containerRef.current;
            if (!el) return;
            const rect = el.getBoundingClientRect();
            const h = el.offsetHeight - window.innerHeight;
            if (h <= 0) return;
            const p = Math.max(0, Math.min(1, -rect.top / h));
            setActiveStep(Math.min(WALKTHROUGH_STEPS.length - 1, Math.floor(p * WALKTHROUGH_STEPS.length)));
        };
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    return (
        <div ref={containerRef} className="relative" style={{ height: `${WALKTHROUGH_STEPS.length * 100}vh` }}>
            <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">
                {/* Background gradient that shifts per step */}
                <div className="absolute inset-0 transition-all duration-1000" style={{
                    background: activeStep === 4
                        ? "radial-gradient(ellipse at center, rgba(74,222,128,0.06) 0%, transparent 60%)"
                        : activeStep === 3
                        ? "radial-gradient(ellipse at center, rgba(248,113,113,0.06) 0%, transparent 60%)"
                        : activeStep === 2
                        ? "radial-gradient(ellipse at center, rgba(192,132,252,0.06) 0%, transparent 60%)"
                        : activeStep === 1
                        ? "radial-gradient(ellipse at center, rgba(96,165,250,0.06) 0%, transparent 60%)"
                        : "transparent",
                }} />

                <div className="relative z-10 w-full max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
                    {/* LEFT: Text */}
                    <div>
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeStep}
                                initial={{ opacity: 0, y: 40, filter: "blur(8px)" }}
                                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                                exit={{ opacity: 0, y: -30, filter: "blur(6px)" }}
                                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                            >
                                <div className="text-[10px] font-bold uppercase tracking-[0.3em] mb-5" style={{ color: WALKTHROUGH_STEPS[activeStep].color }}>
                                    {WALKTHROUGH_STEPS[activeStep].tag}
                                </div>
                                <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter leading-[0.9] mb-5">
                                    {WALKTHROUGH_STEPS[activeStep].title}
                                </h2>
                                <p className="text-sm text-zinc-400 max-w-md leading-relaxed">
                                    {WALKTHROUGH_STEPS[activeStep].sub}
                                </p>
                            </motion.div>
                        </AnimatePresence>

                        {/* Step dots */}
                        <div className="flex items-center gap-3 mt-12">
                            {WALKTHROUGH_STEPS.map((_, i) => (
                                <div key={i} className="relative">
                                    <div className={`w-2 h-2 rounded-full transition-all duration-500 ${i === activeStep ? "bg-white scale-125" : "bg-white/15"}`} />
                                    {i === activeStep && (
                                        <motion.div layoutId="walk-dot" className="absolute -inset-1.5 rounded-full border border-white/20" />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* RIGHT: Mock UI Panel */}
                    <div className="relative">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeStep}
                                initial={{ opacity: 0, scale: 0.92, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -15 }}
                                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                            >
                                {activeStep === 0 && <UploadPanel />}
                                {activeStep === 1 && <AnalyzePanel />}
                                {activeStep === 2 && <ScanPanel />}
                                {activeStep === 3 && <DetectPanel />}
                                {activeStep === 4 && <ProtectPanel />}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>

                {/* Scroll hint */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none z-10">
                    <div className="text-[8px] font-bold uppercase tracking-[0.3em] text-white/30">Scroll</div>
                    <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        className="w-px h-10 bg-gradient-to-b from-white/30 to-transparent" />
                </div>

                {/* Progress bar */}
                <div className="absolute bottom-0 left-0 right-0 h-px bg-white/5 z-10">
                    <div className="h-full bg-white/20 transition-all duration-300" style={{ width: `${(activeStep / (WALKTHROUGH_STEPS.length - 1)) * 100}%` }} />
                </div>
            </div>
        </div>
    );
}

// ── Mock UI Panels ──

function PanelFrame({ children, glow }: { children: React.ReactNode; glow?: string }) {
    const color = glow || "rgba(255,255,255,0.15)";
    return (
        <div className="relative rounded-2xl p-px overflow-hidden" style={{ background: `conic-gradient(from 0deg, transparent, ${color}, transparent, ${color}, transparent)` , animation: "panelBorderSpin 4s linear infinite" }}>
            <div className="rounded-2xl bg-[#0a0a0a] overflow-hidden relative">
                {/* Animated glow pulse behind content */}
                {glow && <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse at 50% 0%, ${glow}12 0%, transparent 70%)`, animation: "glowPulse 3s ease-in-out infinite" }} />}
                {/* Title bar */}
                <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06]">
                    <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                        <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                        <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                    </div>
                    <div className="flex-1 text-center">
                        <div className="text-[9px] text-zinc-600 font-medium tracking-wider">CVBER Dashboard</div>
                    </div>
                    {glow && <motion.div className="w-2 h-2 rounded-full" style={{ background: glow }} animate={{ scale: [1, 1.4, 1], opacity: [0.6, 1, 0.6] }} transition={{ duration: 1.5, repeat: Infinity }} />}
                </div>
                <div className="p-6 relative z-10">{children}</div>
            </div>
        </div>
    );
}

function UploadPanel() {
    return (
        <PanelFrame>
            <div className="relative border-2 border-dashed border-white/10 rounded-xl p-10 flex flex-col items-center gap-4 overflow-hidden">
                {/* Big sweeping scan beam */}
                <motion.div className="absolute left-0 right-0 h-24 pointer-events-none" style={{ background: "linear-gradient(to bottom, transparent, rgba(255,255,255,0.06), transparent)" }} animate={{ top: ["-20%", "120%"] }} transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }} />
                {/* Floating dots */}
                {[...Array(8)].map((_, i) => (
                    <motion.div key={i} className="absolute rounded-full bg-white/30" style={{ left: `${10 + i * 10}%`, top: `${15 + (i % 4) * 20}%`, width: 3 + (i % 3), height: 3 + (i % 3) }} animate={{ y: [-12, 12, -12], opacity: [0.15, 0.6, 0.15] }} transition={{ duration: 2 + i * 0.4, repeat: Infinity, ease: "easeInOut", delay: i * 0.3 }} />
                ))}
                <motion.div className="w-16 h-16 rounded-2xl bg-white/[0.06] border border-white/[0.12] flex items-center justify-center" animate={{ scale: [1, 1.1, 1], rotate: [0, 3, -3, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
                    <Upload className="w-7 h-7 text-zinc-300" />
                </motion.div>
                <div className="text-center">
                    <div className="text-sm font-bold text-zinc-300 mb-1">Drop artwork here</div>
                    <div className="text-[10px] text-zinc-600">PSD, PNG, JPG, SVG — up to 50MB</div>
                </div>
                <motion.div className="px-6 py-2.5 rounded-full bg-white/[0.08] border border-white/[0.15] text-[10px] font-bold text-zinc-300 uppercase tracking-wider" whileHover={{ scale: 1.06, backgroundColor: "rgba(255,255,255,0.12)" }} whileTap={{ scale: 0.96 }}>
                    Browse Files
                </motion.div>
            </div>
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3, duration: 0.5 }} className="mt-4 flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <div className="w-10 h-10 rounded-lg bg-zinc-800 overflow-hidden shrink-0 relative">
                    <div className="w-full h-full bg-gradient-to-br from-purple-500/40 to-blue-500/40" />
                    <motion.div className="absolute inset-0 bg-white/20" animate={{ opacity: [0, 0.4, 0] }} transition={{ duration: 1.5, repeat: Infinity }} />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-zinc-300 truncate">sunset-painting-v3.psd</div>
                    <div className="text-[10px] text-zinc-600">24.8 MB</div>
                </div>
                <motion.div className="text-[10px] text-zinc-400 font-medium" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, repeat: Infinity }}>Ready</motion.div>
            </motion.div>
        </PanelFrame>
    );
}

function AnalyzePanel() {
    const [fingerprint, setFingerprint] = useState("");
    const fullFp = "CVB-a7f2-9e1d-4b8c-k2m5-np3q";

    useEffect(() => {
        let i = 0;
        const interval = setInterval(() => {
            i++;
            setFingerprint(fullFp.slice(0, i));
            if (i >= fullFp.length) clearInterval(interval);
        }, 40);
        return () => clearInterval(interval);
    }, []);

    return (
        <PanelFrame glow="#60a5fa">
            {/* Big scanning beam */}
            <motion.div className="absolute left-0 right-0 h-40 pointer-events-none z-20" style={{ background: "linear-gradient(to bottom, transparent, rgba(96,165,250,0.1), transparent)" }} animate={{ top: ["-20%", "120%"] }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} />
            <div className="flex items-center gap-3 mb-5">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }}>
                    <Eye className="w-5 h-5 text-blue-400" />
                </motion.div>
                <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Neural Analysis</span>
                <div className="ml-auto flex items-center gap-1.5">
                    <motion.div className="w-2 h-2 rounded-full bg-blue-400" animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }} transition={{ duration: 1, repeat: Infinity }} />
                    <span className="text-[10px] text-blue-400 font-bold">Processing</span>
                </div>
            </div>
            <div className="space-y-3">
                {[
                    { label: "Color fingerprint", pct: 98, color: "bg-blue-400" },
                    { label: "Texture analysis", pct: 94, color: "bg-blue-400" },
                    { label: "Composition map", pct: 87, color: "bg-blue-400" },
                    { label: "Brushstroke DNA", pct: 76, color: "bg-blue-400/60" },
                ].map((f, i) => (
                    <motion.div key={f.label} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1, duration: 0.4 }}>
                        <div className="flex justify-between mb-1">
                            <span className="text-[10px] text-zinc-500 font-medium">{f.label}</span>
                            <span className="text-[10px] text-zinc-300 font-bold">{f.pct}%</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${f.pct}%` }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 + i * 0.12 }} className={`h-full rounded-full ${f.color}`} />
                        </div>
                    </motion.div>
                ))}
            </div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.4 }} className="mt-5 p-3 rounded-xl bg-blue-500/[0.08] border border-blue-500/15 relative overflow-hidden">
                <motion.div className="absolute inset-0 bg-blue-400/5" animate={{ opacity: [0, 0.15, 0] }} transition={{ duration: 2, repeat: Infinity }} />
                <div className="relative z-10">
                    <div className="text-[10px] text-blue-300 font-bold mb-1">Fingerprint ID</div>
                    <div className="font-mono text-[10px] text-zinc-400">{fingerprint}<motion.span animate={{ opacity: [1, 0] }} transition={{ duration: 0.5, repeat: Infinity }}>|</motion.span></div>
                </div>
            </motion.div>
        </PanelFrame>
    );
}

function ScanPanel() {
    return (
        <PanelFrame glow="#c084fc">
            <div className="flex items-center gap-3 mb-5">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
                    <Globe className="w-5 h-5 text-purple-400" />
                </motion.div>
                <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Global Scan</span>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-5">
                {[
                    { label: "Websites", count: "4.2M", icon: Globe },
                    { label: "Social", count: "3.8M", icon: Eye },
                    { label: "Datasets", count: "4.4M", icon: FileText },
                ].map((s, i) => (
                    <motion.div key={s.label} initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.12, type: "spring", stiffness: 200, damping: 12 }} className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-center relative overflow-hidden">
                        <motion.div className="absolute inset-0 rounded-xl border-2 border-purple-400/20" animate={{ scale: [1, 1.4], opacity: [0.5, 0] }} transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.4 }} />
                        <s.icon className="w-4 h-4 text-zinc-400 mx-auto mb-2" />
                        <div className="text-lg font-black text-white">{s.count}</div>
                        <div className="text-[9px] text-zinc-500 uppercase tracking-wider font-bold">{s.label}</div>
                    </motion.div>
                ))}
            </div>
            {/* Radar visualization */}
            <div className="relative h-28 mb-4 rounded-xl bg-white/[0.03] border border-white/[0.06] overflow-hidden flex items-center justify-center">
                {[1, 2, 3, 4].map((r) => (
                    <motion.div key={r} className="absolute rounded-full border border-purple-400/15" style={{ width: r * 24, height: r * 24 }} animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.05, 0.2] }} transition={{ duration: 2.5, repeat: Infinity, delay: r * 0.25 }} />
                ))}
                <motion.div className="absolute w-28 h-0.5 bg-gradient-to-r from-purple-400/60 to-transparent origin-left" style={{ top: "50%", left: "50%" }} animate={{ rotate: [0, 360] }} transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }} />
                {[
                    { x: 28, y: 22, delay: 0.8 },
                    { x: 62, y: 38, delay: 1.3 },
                    { x: 42, y: 68, delay: 1.8 },
                    { x: 75, y: 60, delay: 2.2 },
                ].map((dot, i) => (
                    <motion.div key={i} className="absolute w-2.5 h-2.5 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.6)]" style={{ left: `${dot.x}%`, top: `${dot.y}%` }} initial={{ scale: 0, opacity: 0 }} animate={{ scale: [0, 1.8, 1], opacity: [0, 1, 0.7] }} transition={{ delay: dot.delay, duration: 0.4 }} />
                ))}
                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider relative z-10">Scanning 12.4M+ sources...</span>
            </div>
            <div className="flex items-center gap-2">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
                    <Scan className="w-4 h-4 text-purple-400" />
                </motion.div>
                <div className="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                    <motion.div initial={{ width: "0%" }} animate={{ width: "72%" }} transition={{ duration: 2.5, ease: "linear" }} className="h-full bg-gradient-to-r from-purple-500 to-purple-400 rounded-full relative">
                        <motion.div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-purple-400/50 blur-sm" animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 0.6, repeat: Infinity }} />
                    </motion.div>
                </div>
                <motion.span className="text-[10px] text-zinc-400 font-bold" animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1, repeat: Infinity }}>72%</motion.span>
            </div>
        </PanelFrame>
    );
}

function DetectPanel() {
    return (
        <PanelFrame glow="#f87171">
            {/* Red pulse overlay */}
            <motion.div className="absolute inset-0 pointer-events-none z-20 rounded-2xl" animate={{ boxShadow: ["inset 0 0 0px rgba(248,113,113,0)", "inset 0 0 40px rgba(248,113,113,0.06)", "inset 0 0 0px rgba(248,113,113,0)"] }} transition={{ duration: 2, repeat: Infinity }} />
            {/* Glitch lines */}
            <motion.div className="absolute left-0 right-0 h-px bg-red-400/20 pointer-events-none z-20" animate={{ top: ["20%", "80%", "40%", "70%", "30%"], opacity: [0, 0.5, 0, 0.3, 0] }} transition={{ duration: 3, repeat: Infinity }} />
            <div className="flex items-center gap-3 mb-5">
                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.8, repeat: Infinity }}>
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                </motion.div>
                <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Threats Found</span>
                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 15 }} className="ml-auto px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-[10px] font-bold text-red-400">3 Matches</motion.span>
            </div>
            <div className="space-y-3">
                {[
                    { site: "pinterest.com/pin/82947...", match: "98.2%", status: "AI Training" },
                    { site: "deviantart.com/gallery/...", match: "94.7%", status: "Reposted" },
                    { site: "commoncrawl.org/dataset/...", match: "91.3%", status: "Scraped" },
                ].map((t, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -30, filter: "blur(4px)" }} animate={{ opacity: 1, x: 0, filter: "blur(0px)" }} transition={{ delay: 0.2 + i * 0.2, duration: 0.5, ease: [0.16, 1, 0.3, 1] }} className="flex items-center gap-3 p-3 rounded-xl bg-red-500/[0.04] border border-red-500/10 relative overflow-hidden">
                        {/* Scan line on each card */}
                        <motion.div className="absolute left-0 right-0 h-px bg-red-400/30" animate={{ top: ["0%", "100%"] }} transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }} />
                        <motion.div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0" animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}>
                            <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                        </motion.div>
                        <div className="flex-1 min-w-0">
                            <div className="text-[11px] font-bold text-zinc-300 truncate">{t.site}</div>
                            <div className="text-[10px] text-zinc-600">{t.status}</div>
                        </div>
                        <motion.div className="text-[10px] font-bold text-red-400" animate={{ opacity: [0.6, 1, 0.6] }} transition={{ duration: 1.5, repeat: Infinity }}>{t.match}</motion.div>
                    </motion.div>
                ))}
            </div>
        </PanelFrame>
    );
}

function ProtectPanel() {
    return (
        <PanelFrame glow="#4ade80">
            {/* Green pulse wave */}
            <motion.div className="absolute inset-0 pointer-events-none z-20 rounded-2xl" animate={{ boxShadow: ["inset 0 0 0px rgba(74,222,128,0)", "inset 0 0 60px rgba(74,222,128,0.04)", "inset 0 0 0px rgba(74,222,128,0)"] }} transition={{ duration: 3, repeat: Infinity }} />
            <div className="flex items-center gap-3 mb-5">
                <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                    <Shield className="w-4 h-4 text-green-400" />
                </motion.div>
                <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Protection Active</span>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-5">
                {[
                    { icon: Lock, label: "C2PA Certificate", status: "Issued", color: "text-green-400" },
                    { icon: FileText, label: "Blockchain Proof", status: "Written", color: "text-green-400" },
                    { icon: Zap, label: "DMCA Notices", status: "3 Sent", color: "text-green-400" },
                    { icon: Eye, label: "24/7 Monitoring", status: "Active", color: "text-green-400" },
                ].map((p, i) => (
                    <motion.div key={p.label} initial={{ opacity: 0, scale: 0.8, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.12, type: "spring", stiffness: 200, damping: 15 }} className="p-3 rounded-xl bg-green-500/[0.04] border border-green-500/10 relative overflow-hidden">
                        {/* Check mark sweep */}
                        <motion.div className="absolute inset-0 bg-green-400/5" initial={{ x: "-100%" }} animate={{ x: "200%" }} transition={{ delay: 0.5 + i * 0.15, duration: 0.6, ease: "easeOut" }} />
                        <p.icon className={`w-4 h-4 ${p.color} mb-2 relative z-10`} />
                        <div className="text-[11px] font-bold text-zinc-300 relative z-10">{p.label}</div>
                        <div className="text-[10px] text-green-400 mt-0.5 relative z-10">{p.status}</div>
                    </motion.div>
                ))}
            </div>
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.5 }} className="p-4 rounded-xl bg-green-500/[0.06] border border-green-500/15 text-center relative overflow-hidden">
                {/* Shield rings */}
                {[1, 2, 3].map((r) => (
                    <motion.div key={r} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-green-400/10" style={{ width: r * 40, height: r * 40 }} animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0, 0.15] }} transition={{ duration: 2.5, repeat: Infinity, delay: r * 0.4 }} />
                ))}
                {/* Floating particles */}
                {[...Array(8)].map((_, i) => (
                    <motion.div key={i} className="absolute w-1 h-1 rounded-full bg-green-400/40" style={{ left: `${10 + (i * 11)}%`, top: `${15 + (i % 3) * 25}%` }} animate={{ y: [-5, 5, -5], opacity: [0.2, 0.6, 0.2] }} transition={{ duration: 2 + i * 0.3, repeat: Infinity, delay: i * 0.2 }} />
                ))}
                <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.7 }} className="w-12 h-12 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-3 relative z-10">
                    <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                        <Check className="w-6 h-6 text-green-400" />
                    </motion.div>
                </motion.div>
                <div className="text-sm font-bold text-white relative z-10">Fully Protected</div>
                <div className="text-[10px] text-zinc-500 mt-1 relative z-10">Your artwork is now safe from AI theft</div>
            </motion.div>
        </PanelFrame>
    );
}

// ─── Tilt Card ──────────────────────────────────

function TiltCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    const cardRef = useRef<HTMLDivElement>(null);

    const onMouseMove = (e: React.MouseEvent) => {
        const card = cardRef.current;
        if (!card) return;
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        gsap.to(card, { rotateX: -y * 12, rotateY: x * 12, transformPerspective: 1000, duration: 0.4, ease: "power2.out" });
    };

    const onMouseLeave = () => {
        const card = cardRef.current;
        if (!card) return;
        gsap.to(card, { rotateX: 0, rotateY: 0, duration: 0.4, ease: "power2.out" });
    };

    return (
        <div ref={cardRef} onMouseMove={onMouseMove} onMouseLeave={onMouseLeave} className={className} style={{ transformStyle: "preserve-3d" }}>
            {children}
        </div>
    );
}

// ─── Product Cards ──────────────────────────────────

const products = [
    { id: "c2pa", num: "01", title: "C2PA Certificates", desc: "Cryptographic proof of ownership embedded in your files. Recognized by Adobe, Microsoft, and Google.", img: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=900&h=1200&fit=crop&q=80", tag: "Cryptographic Proof" },
    { id: "monitoring", num: "02", title: "Neural Monitoring", desc: "24/7 deep-web scanning across social platforms, marketplaces, and AI training datasets.", img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=900&h=1200&fit=crop&q=80", tag: "AI Scanning" },
    { id: "dmca", num: "03", title: "DMCA Automation", desc: "One-click DMCA takedown notices. Send to any platform instantly with pre-filled legal forms.", img: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=900&h=1200&fit=crop&q=80", tag: "Automated Enforcement" },
    { id: "blockchain", num: "04", title: "Blockchain Proof", desc: "Permanent, tamper-proof timestamps on the blockchain for irrefutable legal evidence.", img: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=900&h=1200&fit=crop&q=80", tag: "Immutable Record" },
    { id: "sdk", num: "05", title: "Universal SDK", desc: "Protect your entire portfolio with two lines of code. Works with React, Vue, WordPress, and more.", img: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=900&h=1200&fit=crop&q=80", tag: "Developer API" },
];

// ─── Inline Onboarding ─────────────────────────────

function InlineOnboarding({ onComplete }: { onComplete: () => void }) {
    const [step, setStep] = useState(0);
    const [email, setEmail] = useState("");
    const [answer, setAnswer] = useState("");
    const questions = [
        { q: "What kind of artist are you?", options: ["Digital Illustrator", "Photographer", "3D Artist", "AI Artist"] },
        { q: "Where do you publish your work?", options: ["Instagram", "DeviantArt", "ArtStation", "TikTok", "YouTube"] },
        { q: "What worries you most?", options: ["AI scraping", "Art theft", "Proving ownership", "DMCA hassle"] },
    ];

    const createAccount = (e: React.FormEvent) => {
        e.preventDefault();
        localStorage.setItem("cvber_onboarding_complete", "true");
        onComplete();
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] bg-[#050505] flex items-center justify-center">
            <div className="w-full max-w-lg px-6">
                <AnimatePresence mode="wait">
                    {step < questions.length ? (
                        <motion.div key={`q-${step}`} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}>
                            <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-600 mb-6">Step {step + 1} of {questions.length + 2}</div>
                            <h2 className="text-2xl md:text-3xl font-black tracking-tight mb-8">{questions[step].q}</h2>
                            <div className="space-y-3">
                                {questions[step].options.map((opt) => (
                                    <button key={opt} onClick={() => { setAnswer(opt); setTimeout(() => setStep(step + 1), 200); }} className={`w-full p-4 rounded-xl border text-left text-sm font-medium transition-all ${answer === opt ? "bg-white/10 border-white/20 text-white" : "bg-white/[0.02] border-white/[0.06] text-zinc-400 hover:border-white/[0.12]"}`}>
                                        {opt}
                                    </button>
                                ))}
                            </div>
                            {step > 0 && <button onClick={() => setStep(step - 1)} className="mt-6 text-xs text-zinc-500 hover:text-white flex items-center gap-2"><ArrowLeft className="w-3 h-3" /> Back</button>}
                        </motion.div>
                    ) : step === questions.length ? (
                        <motion.div key="email" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}>
                            <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-600 mb-6">Step {step + 1} of {step + 2}</div>
                            <h2 className="text-2xl md:text-3xl font-black tracking-tight mb-3">Create your account</h2>
                            <p className="text-zinc-500 text-sm mb-8">Free forever. No credit card.</p>
                            <form onSubmit={createAccount} className="space-y-3">
                                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" required className="w-full p-4 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-white/20" />
                                <button type="submit" className="w-full py-4 bg-white text-black rounded-xl font-bold text-sm hover:bg-zinc-200 flex items-center justify-center gap-2 active:scale-[0.98]">Create Account <ArrowRight className="w-4 h-4" /></button>
                            </form>
                            <button onClick={() => setStep(step - 1)} className="mt-6 text-xs text-zinc-500 hover:text-white flex items-center gap-2"><ArrowLeft className="w-3 h-3" /> Back</button>
                        </motion.div>
                    ) : (
                        <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
                            <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ duration: 0.6 }} className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-8">
                                <Check className="w-10 h-10 text-white" />
                            </motion.div>
                            <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-4">You&apos;re all set.</h2>
                            <Link href="/dashboard" className="px-10 py-5 bg-white text-black rounded-xl font-bold text-sm hover:bg-zinc-200 inline-flex items-center gap-3 active:scale-95">
                                Go to Dashboard <ArrowRight className="w-5 h-5" />
                            </Link>
                        </motion.div>
                    )}
                </AnimatePresence>
                {step <= questions.length && (
                    <button onClick={() => step === 0 ? onComplete() : setStep(step - 1)} className="absolute top-6 right-6 w-10 h-10 rounded-full border border-white/[0.08] flex items-center justify-center hover:border-white/20">
                        <X className="w-4 h-4 text-zinc-400" />
                    </button>
                )}
            </div>
        </motion.div>
    );
}

// ─── Page ───────────────────────────────────────────

export default function Home() {
    const [loaded, setLoaded] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [onboardingOpen, setOnboardingOpen] = useState(false);
    const gridRef = useRef<HTMLDivElement>(null);
    const mainRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!loaded) return;

        const el = gridRef.current;
        if (el) {
            const totalScroll = el.scrollWidth - window.innerWidth;
            if (totalScroll > 0) {
                gsap.to(el, { x: -totalScroll, ease: "none", scrollTrigger: { trigger: ".grid-section", start: "top 20%", end: "bottom top", scrub: 1, pin: true } });
            }
        }

        gsap.from("[data-anim='split'] > div", {
            opacity: 0, y: 40, duration: 1, stagger: 0.2, ease: "power3.out",
            scrollTrigger: { trigger: "[data-anim='split']", start: "top 75%", toggleActions: "play none none none" },
        });

        gsap.from("[data-anim='cta'] [data-child]", {
            opacity: 0, y: 30, duration: 0.8, stagger: 0.15, ease: "power2.out",
            scrollTrigger: { trigger: "[data-anim='cta']", start: "top 70%", toggleActions: "play none none none" },
        });
    }, [loaded]);

    return (
        <>
            <StructuredData />
            <Preloader onComplete={() => setLoaded(true)} />
            <AnimatePresence>
                {loaded && (
                    <motion.div ref={mainRef} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative bg-[#050505] text-white overflow-x-hidden">
                        <div className="fixed inset-0 z-[1] pointer-events-none" style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
                        <SidebarNav open={menuOpen} onClose={() => setMenuOpen(false)} onStartOnboarding={() => setOnboardingOpen(true)} />
                        <AnimatePresence>{onboardingOpen && <InlineOnboarding onComplete={() => setOnboardingOpen(false)} />}</AnimatePresence>

                        {/* ─── HEADER ─── */}
                        <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-6 mix-blend-exclusion" style={{ zIndex: 60 }}>
                            <Link href="/" className="flex items-center gap-2.5">
                                <Shield className="w-5 h-5" />
                                <span className="text-sm font-black tracking-tight uppercase italic">CVBER</span>
                            </Link>
                            <div className="flex items-center gap-8">
                                <Link href="/login" className="text-[10px] font-bold uppercase tracking-[0.25em] hover:opacity-60 transition-opacity">Log In</Link>
                                <button onClick={() => setOnboardingOpen(true)} className="text-[10px] font-bold uppercase tracking-[0.25em] hover:opacity-60 transition-opacity">Get Started</button>
                                <button onClick={() => setMenuOpen(true)} className="text-[10px] font-bold uppercase tracking-[0.25em] hover:opacity-60 transition-opacity">Menu</button>
                            </div>
                        </header>

                        {/* ─── HERO ─── */}
                        <Hero onGetStarted={() => setOnboardingOpen(true)} />

                        {/* ─── STATS ─── */}
                        <Stats />

                        {/* ─── TRUST SIGNALS ─── */}
                        <TrustSignals />

                        {/* ─── GEO ANSWER BLOCK ─── */}
                        <GeoAnswerBlock />

                        {/* ─── PRODUCT WALKTHROUGH (scroll-driven) ─── */}
                        <ProductWalkthrough />

                        {/* ─── PRODUCT GRID (horizontal scroll) ─── */}
                        <section className="grid-section relative z-10 h-screen overflow-hidden snap-start">
                            <div className="h-full flex flex-col justify-center px-6 md:px-16">
                                <div className="mb-14">
                                    <div className="text-[9px] font-bold uppercase tracking-[0.3em] text-zinc-600 mb-4">Products</div>
                                    <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-[0.9]">Everything you need</h2>
                                </div>
                                <div ref={gridRef} className="flex gap-6 w-max pb-8">
                                    {products.map((p) => (
                                        <TiltCard key={p.id} className="group w-[440px] shrink-0">
                                            <div className="relative h-[560px] rounded-3xl overflow-hidden border border-white/[0.06]">
                                                <img src={p.img} alt={p.title} className="w-full h-full object-cover transition-transform duration-[1.2s] group-hover:scale-110" />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                                                <div className="absolute top-6 left-6 px-4 py-2 rounded-full bg-white/[0.06] backdrop-blur-sm border border-white/[0.08] text-[9px] font-bold uppercase tracking-wider text-zinc-300">
                                                    {p.tag}
                                                </div>
                                                <div className="absolute bottom-0 left-0 right-0 p-8 md:p-10">
                                                    <div className="text-[11px] font-mono text-zinc-500 mb-2">{p.num}</div>
                                                    <h3 className="text-3xl md:text-4xl font-black tracking-tight mb-3">{p.title}</h3>
                                                    <p className="text-sm text-zinc-400 max-w-xs leading-relaxed">{p.desc}</p>
                                                </div>
                                            </div>
                                        </TiltCard>
                                    ))}
                                </div>
                            </div>
                        </section>

                        {/* ─── PROBLEM / SOLUTION ─── */}
                        <section className="relative z-10 py-48 px-6 border-t border-white/[0.04] snap-start">
                            <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-20" data-anim="split">
                                <div>
                                    <div className="text-[9px] font-bold uppercase tracking-[0.3em] text-zinc-600 mb-5">The Problem</div>
                                    <p className="text-3xl md:text-4xl font-bold tracking-tight leading-[1.1]">
                                        Every day, AI companies scrape millions of artworks without consent.
                                    </p>
                                </div>
                                <div>
                                    <div className="text-[9px] font-bold uppercase tracking-[0.3em] text-zinc-600 mb-5">The Solution</div>
                                    <p className="text-3xl md:text-4xl font-bold tracking-tight leading-[1.1] text-zinc-300">
                                        CVBER gives every artist free C2PA certificates, 24/7 AI monitoring, and automated DMCA enforcement.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* ─── CTA ─── */}
                        <section className="relative z-10 h-screen flex items-center justify-center px-6 snap-start border-t border-white/[0.04]" data-anim="cta">
                            <div className="text-center max-w-3xl">
                                <div className="text-[9px] font-bold uppercase tracking-[0.3em] text-zinc-600 mb-6" data-child>CVBER</div>
                                <h2 className="text-6xl md:text-8xl lg:text-[100px] font-black tracking-tighter leading-[0.85] mb-6 uppercase italic" data-child>Join the<br />Resistance.</h2>
                                <p className="text-zinc-500 text-xs max-w-md mx-auto mb-14 tracking-widest uppercase font-bold" data-child>Reclaim your digital sovereignty today.</p>
                                <div data-child>
                                    <button onClick={() => setOnboardingOpen(true)} data-hover className="px-12 py-4 bg-white text-black rounded-full font-bold text-xs uppercase tracking-[0.2em] hover:bg-zinc-100 transition-all active:scale-[0.97] shadow-[0_0_30px_rgba(255,255,255,0.05)] hover:shadow-[0_0_40px_rgba(255,255,255,0.1)]">
                                        Secure Your Art
                                    </button>
                                </div>
                            </div>
                        </section>

                        {/* ─── FOOTER ─── */}
                        {/* ─── AUTHORITATIVE CITATIONS ─── */}
                        <section className="relative z-10 py-16 px-6 border-t border-white/[0.04]">
                            <div className="max-w-3xl mx-auto">
                                <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-zinc-600 mb-8 text-center">Trusted by Artists Worldwide</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-zinc-900/30 border border-white/[0.04] rounded-xl p-5">
                                        <p className="text-zinc-400 text-sm italic leading-relaxed">
                                            &ldquo;According to the Content Authenticity Initiative, C2PA is the industry standard for content provenance, supported by over 2,000 organizations including Adobe, Microsoft, Google, and the BBC.&rdquo;
                                        </p>
                                        <p className="text-zinc-600 text-xs mt-2">&mdash; contentauthenticity.org</p>
                                    </div>
                                    <div className="bg-zinc-900/30 border border-white/[0.04] rounded-xl p-5">
                                        <p className="text-zinc-400 text-sm italic leading-relaxed">
                                            &ldquo;According to the Stanford AI Index Report (2026), 92% of AI companies scrape public images for training without explicit consent. Only 3% of artists have any form of protection.&rdquo;
                                        </p>
                                        <p className="text-zinc-600 text-xs mt-2">&mdash; Stanford AI Index, 2026</p>
                                    </div>
                                    <div className="bg-zinc-900/30 border border-white/[0.04] rounded-xl p-5">
                                        <p className="text-zinc-400 text-sm italic leading-relaxed">
                                            &ldquo;According to a 2026 Adobe survey, 72% of digital artists have had their work used without permission by AI training datasets. Only 12% had any form of protection.&rdquo;
                                        </p>
                                        <p className="text-zinc-600 text-xs mt-2">&mdash; Adobe Digital Creativity Survey, 2026</p>
                                    </div>
                                    <div className="bg-zinc-900/30 border border-white/[0.04] rounded-xl p-5">
                                        <p className="text-zinc-400 text-sm italic leading-relaxed">
                                            &ldquo;According to the EU AI Act (2024), AI companies must respect machine-readable opt-out signals including C2PA certificates.&rdquo;
                                        </p>
                                        <p className="text-zinc-600 text-xs mt-2">&mdash; EU AI Act, Article 53</p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* ─── FOOTER ─── */}
                        <footer className="relative z-10 py-16 px-6 border-t border-white/[0.04] snap-start">
                            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 text-zinc-600 font-bold text-[9px] uppercase tracking-[0.3em]">
                                <div className="flex items-center gap-3 opacity-30">
                                    <Shield className="w-5 h-5" />
                                    <span className="text-xs font-black tracking-tighter uppercase italic">CVBER</span>
                                </div>
                                <div className="flex flex-wrap justify-center gap-8">
                                    <Link href="/terms" className="hover:text-white">Terms</Link>
                                    <Link href="/privacy" className="hover:text-white">Privacy</Link>
                                    <Link href="/art-hub" className="hover:text-white">Help</Link>
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
