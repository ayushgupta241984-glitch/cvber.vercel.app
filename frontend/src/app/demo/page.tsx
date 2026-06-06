"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Upload, Eye, Globe, AlertTriangle, Check, Lock, FileText, Zap, ArrowRight, ExternalLink, Scan } from "lucide-react";

const ease = [0.16, 1, 0.3, 1] as const;

// ─── Sections ───────────────────────────────────────

function ProblemSection() {
    return (
        <section className="min-h-screen flex items-center justify-center px-6 relative">
            <div className="max-w-4xl mx-auto text-center">
                <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, ease }}>
                    <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-red-400 mb-6">The Problem</div>
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.85] mb-8">
                        AI companies scraped<br />
                        <span className="text-red-400">5.8 billion images</span><br />
                        without consent.
                    </h1>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2, ease }} className="grid grid-cols-3 gap-8 max-w-2xl mx-auto mt-16">
                    {[
                        { num: "78%", label: "of artists fear AI training on their work" },
                        { num: "$0", label: "compensation paid to most artists" },
                        { num: "0", label: "free tools that do everything" },
                    ].map((s) => (
                        <div key={s.label}>
                            <div className="text-3xl md:text-4xl font-black text-white mb-2">{s.num}</div>
                            <div className="text-[10px] text-zinc-500 leading-relaxed">{s.label}</div>
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}

function SolutionSection() {
    return (
        <section className="min-h-screen flex items-center justify-center px-6 relative">
            <div className="max-w-4xl mx-auto text-center">
                <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, ease }}>
                    <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-green-400 mb-6">The Solution</div>
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.85] mb-8">
                        CVBER: the first<br />
                        <span className="text-green-400">free, full-pipeline</span><br />
                        copyright shield.
                    </h1>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2, ease }} className="flex flex-wrap justify-center gap-4 mt-12">
                    {["Upload", "AI Analyze", "Scan 12.4M+ Sites", "Detect Theft", "File DMCA", "Blockchain Proof", "C2PA Certificate", "24/7 Monitor"].map((step, i) => (
                        <motion.div key={step} initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.4 }} className="px-4 py-2 rounded-full border border-white/[0.08] bg-white/[0.02] text-[11px] font-bold text-zinc-300 uppercase tracking-wider">
                            {step}
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}

// ─── Live Product Walkthrough ────────────────────────

const STEPS = [
    { tag: "01", title: "Upload any artwork", sub: "Drag and drop. PSD, PNG, JPG, SVG — up to 50MB. Pillow validates every file: corruption check, magic bytes, 10000px cap." },
    { tag: "02", title: "AI fingerprints your work", sub: "NVIDIA NIM Gemma 3n analyzes color, texture, composition, brushstrokes. Returns a unique style DNA — your artwork's fingerprint." },
    { tag: "03", title: "Scans 12.4M+ sources", sub: "Bing scraper searches websites, social platforms, AI training datasets. Perceptual hashing compares each result in real-time via SSE streaming." },
    { tag: "04", title: "Finds unauthorized copies", sub: "Match confidence scores, source URLs, timestamps. Three algorithms cross-validate: dHash, aHash, color histogram." },
    { tag: "05", title: "Files DMCA automatically", sub: "One-click takedowns for YouTube, Instagram, TikTok, X, and more. Legally-formatted notices with platform-specific instructions." },
    { tag: "06", title: "Proves ownership forever", sub: "OpenTimestamps Bitcoin anchor. C2PA cryptographic certificate via Adobe SDK. Immutable, tamper-proof, globally recognized." },
];

function Walkthrough() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [active, setActive] = useState(0);

    useEffect(() => {
        const onScroll = () => {
            const el = containerRef.current;
            if (!el) return;
            const rect = el.getBoundingClientRect();
            const h = el.offsetHeight - window.innerHeight;
            if (h <= 0) return;
            const p = Math.max(0, Math.min(1, -rect.top / h));
            setActive(Math.min(STEPS.length - 1, Math.floor(p * STEPS.length)));
        };
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    return (
        <div ref={containerRef} className="relative" style={{ height: `${STEPS.length * 100}vh` }}>
            <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden">
                <div className="w-full max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
                    {/* Left: Text */}
                    <div>
                        <AnimatePresence mode="wait">
                            <motion.div key={active} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.5, ease }} className="relative z-10">
                                <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-600 mb-4">
                                    Step {STEPS[active].tag}
                                </div>
                                <h2 className="text-4xl md:text-5xl font-black tracking-tighter leading-[0.9] mb-4">
                                    {STEPS[active].title}
                                </h2>
                                <p className="text-sm text-zinc-400 max-w-md leading-relaxed">
                                    {STEPS[active].sub}
                                </p>
                            </motion.div>
                        </AnimatePresence>
                        {/* Progress dots */}
                        <div className="flex gap-2 mt-10">
                            {STEPS.map((_, i) => (
                                <div key={i} className={`h-1 rounded-full transition-all duration-500 ${i === active ? "bg-white w-8" : i < active ? "bg-white/30 w-4" : "bg-white/10 w-4"}`} />
                            ))}
                        </div>
                    </div>

                    {/* Right: Live dashboard mockup */}
                    <div className="relative">
                        <AnimatePresence mode="wait">
                            <motion.div key={active} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }} transition={{ duration: 0.5, ease }} className="relative rounded-2xl p-px overflow-hidden" style={{ background: `conic-gradient(from 0deg, transparent, rgba(255,255,255,0.12), transparent, rgba(255,255,255,0.06), transparent)`, animation: "panelBorderSpin 4s linear infinite" }}>
                                <div className="rounded-2xl bg-[#0a0a0a]">
                                    <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06]">
                                        <div className="flex gap-1.5">
                                            <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                                            <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                                            <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                                        </div>
                                        <div className="flex-1 text-center text-[9px] text-zinc-600 font-medium tracking-wider">CVBER Dashboard</div>
                                    </div>
                                    <div className="p-6">
                                        {active === 0 && <DemoUpload />}
                                        {active === 1 && <DemoAnalyze />}
                                        {active === 2 && <DemoScan />}
                                        {active === 3 && <DemoDetect />}
                                        {active === 4 && <DemoDMCA />}
                                        {active === 5 && <DemoProtect />}
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>

                {/* Scroll hint */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none">
                    <div className="text-[8px] font-bold uppercase tracking-[0.3em] text-white/20">Scroll to demo</div>
                    <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 1.5, repeat: Infinity }} className="w-px h-8 bg-gradient-to-b from-white/20 to-transparent" />
                </div>
            </div>
        </div>
    );
}

// ── Demo Panels ──

function DemoUpload() {
    return (
        <div className="border-2 border-dashed border-white/10 rounded-xl p-8 flex flex-col items-center gap-3 relative overflow-hidden">
            <motion.div className="absolute left-0 right-0 h-20 pointer-events-none" style={{ background: "linear-gradient(to bottom, transparent, rgba(255,255,255,0.05), transparent)" }} animate={{ top: ["-20%", "120%"] }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} />
            <motion.div className="w-14 h-14 rounded-2xl bg-white/[0.05] border border-white/[0.1] flex items-center justify-center" animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                <Upload className="w-6 h-6 text-zinc-400" />
            </motion.div>
            <div className="text-sm font-bold text-zinc-300">Drop artwork here</div>
            <div className="text-[10px] text-zinc-600">PSD, PNG, JPG, SVG — up to 50MB</div>
        </div>
    );
}

function DemoAnalyze() {
    return (
        <div className="space-y-3">
            <motion.div className="absolute left-0 right-0 h-32 pointer-events-none z-20" style={{ background: "linear-gradient(to bottom, transparent, rgba(96,165,250,0.08), transparent)" }} animate={{ top: ["-20%", "120%"] }} transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }} />
            <div className="flex items-center gap-2 mb-4">
                <Eye className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Neural Analysis</span>
                <motion.div className="ml-auto w-2 h-2 rounded-full bg-blue-400" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity }} />
            </div>
            {[{ label: "Color fingerprint", pct: 98 }, { label: "Texture analysis", pct: 94 }, { label: "Composition map", pct: 87 }, { label: "Brushstroke DNA", pct: 76 }].map((f, i) => (
                <div key={f.label}>
                    <div className="flex justify-between mb-1">
                        <span className="text-[10px] text-zinc-500">{f.label}</span>
                        <span className="text-[10px] text-zinc-300 font-bold">{f.pct}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${f.pct}%` }} transition={{ duration: 0.8, ease, delay: 0.1 + i * 0.1 }} className="h-full bg-blue-400 rounded-full" />
                    </div>
                </div>
            ))}
            <div className="mt-3 p-2 rounded-lg bg-blue-500/[0.06] border border-blue-500/10">
                <div className="text-[9px] text-blue-300 font-bold">Fingerprint ID: CVB-a7f2-9e1d</div>
            </div>
        </div>
    );
}

function DemoScan() {
    return (
        <div>
            <div className="flex items-center gap-2 mb-4">
                <Globe className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Global Scan</span>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-4">
                {[{ l: "Websites", n: "4.2M" }, { l: "Social", n: "3.8M" }, { l: "Datasets", n: "4.4M" }].map((s) => (
                    <div key={s.l} className="p-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-center">
                        <div className="text-base font-black text-white">{s.n}</div>
                        <div className="text-[8px] text-zinc-600 uppercase">{s.l}</div>
                    </div>
                ))}
            </div>
            {/* Radar */}
            <div className="relative h-24 rounded-lg bg-white/[0.02] border border-white/[0.04] flex items-center justify-center overflow-hidden mb-4">
                {[1, 2, 3].map((r) => (
                    <motion.div key={r} className="absolute rounded-full border border-purple-400/10" style={{ width: r * 22, height: r * 22 }} animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity, delay: r * 0.2 }} />
                ))}
                <motion.div className="absolute w-20 h-px bg-gradient-to-r from-purple-400/50 to-transparent origin-left" style={{ top: "50%", left: "50%" }} animate={{ rotate: [0, 360] }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} />
                {[{ x: 25, y: 20 }, { x: 60, y: 40 }, { x: 40, y: 65 }].map((d, i) => (
                    <motion.div key={i} className="absolute w-2 h-2 rounded-full bg-purple-400" style={{ left: `${d.x}%`, top: `${d.y}%` }} initial={{ scale: 0 }} animate={{ scale: [0, 1.5, 1] }} transition={{ delay: 0.8 + i * 0.5, duration: 0.4 }} />
                ))}
            </div>
            <div className="flex items-center gap-2">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}><Scan className="w-3 h-3 text-purple-400" /></motion.div>
                <div className="flex-1 h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
                    <motion.div initial={{ width: "0%" }} animate={{ width: "72%" }} transition={{ duration: 2, ease: "linear" }} className="h-full bg-purple-400 rounded-full" />
                </div>
                <span className="text-[10px] text-zinc-500 font-bold">72%</span>
            </div>
        </div>
    );
}

function DemoDetect() {
    return (
        <div>
            <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Threats Found</span>
                <span className="ml-auto px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-[9px] font-bold text-red-400">3 Matches</span>
            </div>
            <div className="space-y-2">
                {[
                    { site: "pinterest.com/pin/82947...", match: "98.2%", why: "AI Training" },
                    { site: "deviantart.com/gallery/...", match: "94.7%", why: "Reposted" },
                    { site: "commoncrawl.org/dataset/...", match: "91.3%", why: "Scraped" },
                ].map((t, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.15 }} className="flex items-center gap-3 p-2.5 rounded-lg bg-red-500/[0.04] border border-red-500/10">
                        <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                        <div className="flex-1 min-w-0">
                            <div className="text-[11px] font-bold text-zinc-300 truncate">{t.site}</div>
                            <div className="text-[9px] text-zinc-600">{t.why}</div>
                        </div>
                        <div className="text-[10px] font-bold text-red-400">{t.match}</div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

function DemoDMCA() {
    return (
        <div>
            <div className="flex items-center gap-2 mb-4">
                <FileText className="w-4 h-4 text-orange-400" />
                <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">DMCA Takedown</span>
            </div>
            <div className="space-y-2 mb-4">
                {["Platform identified: Pinterest", "Infringement details attached", "Legal notice formatted"].map((s, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.2 }} className="flex items-center gap-2 text-[11px] text-zinc-400">
                        <Check className="w-3 h-3 text-orange-400 shrink-0" />
                        {s}
                    </motion.div>
                ))}
            </div>
            <div className="p-3 rounded-lg bg-orange-500/[0.06] border border-orange-500/10 text-center">
                <div className="text-sm font-bold text-white mb-1">Notice Ready</div>
                <div className="text-[10px] text-zinc-500">Download or send directly to platform</div>
            </div>
        </div>
    );
}

function DemoProtect() {
    return (
        <div>
            <div className="flex items-center gap-2 mb-4">
                <Shield className="w-4 h-4 text-green-400" />
                <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Ownership Proven</span>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-4">
                {[
                    { icon: Lock, label: "C2PA Certificate", status: "Issued" },
                    { icon: FileText, label: "Blockchain Proof", status: "Anchored" },
                    { icon: Zap, label: "DMCA Sent", status: "3 Filed" },
                    { icon: Eye, label: "Monitoring", status: "Active" },
                ].map((p) => (
                    <div key={p.label} className="p-2.5 rounded-lg bg-green-500/[0.04] border border-green-500/10">
                        <p.icon className="w-3.5 h-3.5 text-green-400 mb-1.5" />
                        <div className="text-[10px] font-bold text-zinc-300">{p.label}</div>
                        <div className="text-[9px] text-green-400">{p.status}</div>
                    </div>
                ))}
            </div>
            <div className="p-3 rounded-lg bg-green-500/[0.06] border border-green-500/10 text-center">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 15 }} className="w-10 h-10 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-2">
                    <Check className="w-5 h-5 text-green-400" />
                </motion.div>
                <div className="text-sm font-bold text-white">Fully Protected</div>
            </div>
        </div>
    );
}

// ─── Traction ───────────────────────────────────────

function TractionSection() {
    return (
        <section className="min-h-screen flex items-center justify-center px-6 relative">
            <div className="max-w-5xl mx-auto">
                <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, ease }} className="text-center mb-16">
                    <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-600 mb-6">Traction</div>
                    <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-[0.9]">Built. Deployed. Working.</h2>
                </motion.div>
                <div className="grid md:grid-cols-2 gap-6">
                    {[
                        { num: "39+", label: "SEO-optimized pages", detail: "Blog, features, comparisons, guides" },
                        { num: "7", label: "Core features", detail: "Vault, Search, C2PA, Blockchain, DMCA, Watermark, Monitor" },
                        { num: "$0", label: "Infrastructure cost", detail: "Everything runs on free tiers" },
                        { num: "5", label: "Search engines", detail: "Yandex, Bing, Google Lens, SauceNAO, TinEye" },
                        { num: "12.4M+", label: "Sources scanned", detail: "Websites, social, AI datasets" },
                        { num: "100%", label: "Open source", detail: "Transparent, auditable, self-hostable" },
                    ].map((t, i) => (
                        <motion.div key={t.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.5 }} className="p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
                            <div className="text-3xl font-black text-white mb-1">{t.num}</div>
                            <div className="text-sm font-bold text-zinc-300 mb-1">{t.label}</div>
                            <div className="text-[10px] text-zinc-600">{t.detail}</div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// ─── Market ─────────────────────────────────────────

function MarketSection() {
    return (
        <section className="min-h-screen flex items-center justify-center px-6 relative">
            <div className="max-w-5xl mx-auto">
                <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, ease }} className="text-center mb-16">
                    <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-600 mb-6">Market</div>
                    <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-[0.9] mb-6">
                        <span className="text-blue-400">$59B</span> digital content market.
                    </h2>
                    <p className="text-sm text-zinc-400 max-w-lg mx-auto">350M+ digital artists worldwide. 78% concerned about AI training. No free, full-pipeline tool exists today.</p>
                </motion.div>
                <div className="grid md:grid-cols-3 gap-4">
                    {[
                        { tool: "Glaze", what: "Style cloaking", price: "Free", gap: "Prevents training, doesn't detect theft" },
                        { tool: "Nightshade", what: "Data poisoning", price: "Free", gap: "Research tool, not production" },
                        { tool: "Have I Been Trained", what: "Dataset check", price: "Free", gap: "Detection only, no enforcement" },
                        { tool: "Copyright.ai", what: "Registration", price: "$15/mo", gap: "Paid, US-focused" },
                        { tool: "Imatag", what: "Watermarking", price: "Enterprise", gap: "Not for individual artists" },
                        { tool: "CVBER", what: "Full pipeline", price: "Free", gap: "No gap. Covers everything.", highlight: true },
                    ].map((c, i) => (
                        <motion.div key={c.tool} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.4 }} className={`p-4 rounded-xl border ${c.highlight ? "border-green-500/20 bg-green-500/[0.04]" : "border-white/[0.06] bg-white/[0.02]"}`}>
                            <div className="flex items-center justify-between mb-2">
                                <div className="text-sm font-bold text-zinc-300">{c.tool}</div>
                                <div className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${c.highlight ? "bg-green-500/10 text-green-400" : "bg-white/[0.04] text-zinc-500"}`}>{c.price}</div>
                            </div>
                            <div className="text-[10px] text-zinc-500 mb-1">{c.what}</div>
                            <div className={`text-[10px] ${c.highlight ? "text-green-400 font-bold" : "text-zinc-600"}`}>{c.gap}</div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// ─── Business Model ─────────────────────────────────

function BusinessModelSection() {
    return (
        <section className="min-h-screen flex items-center justify-center px-6 relative">
            <div className="max-w-4xl mx-auto">
                <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, ease }} className="text-center mb-16">
                    <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-600 mb-6">Business Model</div>
                    <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-[0.9] mb-6">
                        Free core. <span className="text-white">Paid power.</span>
                    </h2>
                    <p className="text-sm text-zinc-400 max-w-lg mx-auto">Detection, proof, enforcement, monitoring — free forever. Revenue from power users and enterprises.</p>
                </motion.div>
                <div className="grid md:grid-cols-3 gap-4">
                    {[
                        { tier: "Free", price: "$0", features: ["Unlimited uploads", "AI analysis", "5-engine search", "DMCA generator", "Blockchain proof", "C2PA signing"], cta: "What we launch with" },
                        { tier: "Pro", price: "$9/mo", features: ["Priority scanning", "Advanced analytics", "Team collaboration", "API access", "Custom watermarks", "Export reports"], cta: "Power users" },
                        { tier: "Enterprise", price: "Custom", features: ["White-label", "Bulk processing", "SLA guarantee", "Dedicated support", "Custom integrations", "On-premise option"], cta: "Agencies & studios" },
                    ].map((p, i) => (
                        <motion.div key={p.tier} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }} className={`p-6 rounded-2xl border ${i === 0 ? "border-green-500/20 bg-green-500/[0.04]" : "border-white/[0.06] bg-white/[0.02]"}`}>
                            <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2">{p.tier}</div>
                            <div className="text-3xl font-black text-white mb-1">{p.price}</div>
                            <div className="text-[10px] text-zinc-600 mb-5">{p.cta}</div>
                            <div className="space-y-2">
                                {p.features.map((f) => (
                                    <div key={f} className="flex items-center gap-2 text-[11px] text-zinc-400">
                                        <Check className="w-3 h-3 text-green-400 shrink-0" />
                                        {f}
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </div>
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3, duration: 0.5 }} className="mt-8 p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] text-center">
                    <div className="text-sm font-bold text-zinc-300 mb-2">Future Revenue Streams</div>
                    <div className="flex flex-wrap justify-center gap-3">
                        {["Style licensing marketplace", "AI royalty engine", "Provenance graph API", "Artist token economy"].map((s) => (
                            <span key={s} className="px-3 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] text-[10px] font-bold text-zinc-400">{s}</span>
                        ))}
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

// ─── Team ───────────────────────────────────────────

function TeamSection() {
    return (
        <section className="min-h-screen flex items-center justify-center px-6 relative">
            <div className="max-w-4xl mx-auto text-center">
                <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, ease }}>
                    <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-600 mb-6">Team</div>
                    <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-[0.9] mb-8">
                        Built by someone who<br />lived this problem.
                    </h2>
                    <p className="text-sm text-zinc-400 max-w-lg mx-auto mb-12">
                        I started CVBER because I watched AI companies scrape millions of artworks — including work from artists I know — and realized there was no free tool to fight back. So I built one.
                    </p>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2, duration: 0.5 }} className="grid md:grid-cols-3 gap-4 text-left">
                    {[
                        { title: "Full-Stack Builder", desc: "Built the entire product end-to-end: frontend, backend, AI pipeline, blockchain, C2PA, deployment." },
                        { title: "Market Research", desc: "Analyzed every competitor, mapped the $59B content market, identified the gap: no free, full-pipeline tool." },
                        { title: "Shipped Fast", desc: "Working product in weeks. 39+ SEO pages. 50+ backlinks. Live on Vercel + Render. Ready to scale." },
                    ].map((r, i) => (
                        <div key={r.title} className="p-5 rounded-xl border border-white/[0.06] bg-white/[0.02]">
                            <div className="text-sm font-bold text-white mb-2">{r.title}</div>
                            <div className="text-[11px] text-zinc-500 leading-relaxed">{r.desc}</div>
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}

// ─── The Ask ────────────────────────────────────────

function AskSection() {
    return (
        <section className="min-h-screen flex items-center justify-center px-6 relative">
            <div className="max-w-4xl mx-auto text-center">
                <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, ease }}>
                    <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-white mb-6">The Ask</div>
                    <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.85] mb-8">
                        We&apos;re raising <span className="text-white">$1.5M</span><br />to scale the shield.
                    </h2>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2, duration: 0.5 }} className="grid md:grid-cols-3 gap-4 max-w-3xl mx-auto text-left mb-12">
                    {[
                        { use: "40%", what: "Engineering", detail: "Hire 2 backend engineers, scale infrastructure" },
                        { use: "35%", what: "Growth", detail: "Content marketing, community, artist partnerships" },
                        { use: "25%", what: "Operations", detail: "Legal, compliance, entity setup" },
                    ].map((u, i) => (
                        <div key={u.what} className="p-5 rounded-xl border border-white/[0.06] bg-white/[0.02]">
                            <div className="text-2xl font-black text-white mb-1">{u.use}</div>
                            <div className="text-sm font-bold text-zinc-300 mb-1">{u.what}</div>
                            <div className="text-[10px] text-zinc-600">{u.detail}</div>
                        </div>
                    ))}
                </motion.div>
                <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.4, duration: 0.5 }} className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link href="https://cvber.vercel.app" target="_blank" className="px-10 py-4 bg-white text-black rounded-full font-bold text-xs uppercase tracking-[0.2em] hover:bg-zinc-200 transition-all active:scale-[0.97] flex items-center gap-2">
                        Live Product <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                    <Link href="https://github.com/ayushgupta241984-glitch/cvber.free.las.app" target="_blank" className="px-10 py-4 rounded-full font-bold text-xs uppercase tracking-[0.2em] text-zinc-400 hover:text-white border border-white/[0.08] hover:border-white/20 transition-all flex items-center gap-2">
                        Source Code <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                </motion.div>
                <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.6, duration: 0.5 }} className="mt-16 pt-8 border-t border-white/[0.06]">
                    <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-bold">
                        CVBER — Protect today. Empower tomorrow.
                    </p>
                </motion.div>
            </div>
        </section>
    );
}

// ─── Page ───────────────────────────────────────────

export default function DemoPage() {
    return (
        <div className="bg-[#050505] text-white overflow-x-hidden">
            {/* Fixed header */}
            <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-6 mix-blend-exclusion">
                <Link href="/" className="flex items-center gap-2.5">
                    <Shield className="w-5 h-5" />
                    <span className="text-sm font-black tracking-tight uppercase italic">CVBER</span>
                </Link>
                <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-500">
                    Product Demo — Techstars
                </div>
            </header>

            <ProblemSection />
            <SolutionSection />
            <Walkthrough />
            <TractionSection />
            <MarketSection />
            <BusinessModelSection />
            <TeamSection />
            <AskSection />
        </div>
    );
}
