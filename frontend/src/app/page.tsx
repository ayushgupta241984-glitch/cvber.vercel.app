"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Shield, Zap, Search, BookOpen, Upload, Scan, FileCheck, Eye, ChevronDown, Mail } from "lucide-react";
import Logo from "@/components/common/Logo";
import StructuredData from "@/components/seo/StructuredData";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import Lenis from "lenis";

function useLenis() {
    useEffect(() => {
        const lenis = new Lenis({ duration: 1.4, easing: (t) => 1 - Math.pow(1 - t, 3) });
        let rafId: number;
        const raf = (time: number) => { lenis.raf(time); rafId = requestAnimationFrame(raf); };
        rafId = requestAnimationFrame(raf);
        return () => { cancelAnimationFrame(rafId); lenis.destroy(); };
    }, []);
}

function Section({ children, className = "", ...props }: { children: React.ReactNode; className?: string }) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-10%" });
    return (
        <motion.section
            ref={ref}
            initial={{ opacity: 0, y: 60 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
            className={className}
            {...props}
        />
    );
}

// ─── Product Demo Animation ────────────────────────────────────────

const demoSteps = [
    {
        icon: Upload,
        label: "Upload your art",
        sub: "JPEG, PNG, WebP",
        color: "#a855f7",
        bg: "rgba(168,85,247,0.1)",
        preview: (
            <div className="flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-2xl border-2 border-dashed border-purple-500/30 flex items-center justify-center">
                    <Upload className="w-6 h-6 text-purple-400" />
                </div>
                <span className="text-[11px] text-zinc-500">Drop your file here</span>
            </div>
        ),
    },
    {
        icon: Scan,
        label: "Scanning 15+ engines",
        sub: "DeviantArt, Instagram, Pinterest...",
        color: "#3b82f6",
        bg: "rgba(59,130,246,0.1)",
        preview: (
            <div className="flex flex-col items-center gap-3 w-full max-w-[180px]">
                <Scan className="w-6 h-6 text-blue-400" />
                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-blue-500 rounded-full"
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 2.5, ease: "easeInOut" }}
                    />
                </div>
            </div>
        ),
    },
    {
        icon: FileCheck,
        label: "C2PA certificate issued",
        sub: "Cryptographic proof of ownership",
        color: "#22c55e",
        bg: "rgba(34,197,94,0.1)",
        preview: (
            <div className="flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-green-500/20 flex items-center justify-center">
                    <FileCheck className="w-6 h-6 text-green-400" />
                </div>
                <p className="text-[11px] font-mono text-green-400/60">0x7f3a...c9e2</p>
            </div>
        ),
    },
    {
        icon: Eye,
        label: "24/7 monitoring active",
        sub: "Auto-files DMCA on theft",
        color: "#f59e0b",
        bg: "rgba(245,158,11,0.1)",
        preview: (
            <div className="flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/20 flex items-center justify-center relative">
                    <Eye className="w-6 h-6 text-amber-400" />
                    <motion.span
                        className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-green-400"
                        animate={{ opacity: [1, 0.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    />
                </div>
            </div>
        ),
    },
];

function ProductDemo() {
    const [step, setStep] = useState(0);
    const intervalRef = useRef<ReturnType<typeof setInterval>>();

    useEffect(() => {
        intervalRef.current = setInterval(() => setStep((p) => (p + 1) % demoSteps.length), 2800);
        return () => clearInterval(intervalRef.current);
    }, []);

    return (
        <div className="rounded-2xl overflow-hidden border border-white/[0.04] bg-white/[0.01] backdrop-blur-sm">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/[0.04]">
                <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/40" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500/40" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/40" />
                </div>
                <div className="flex-1 flex justify-center">
                    <div className="bg-white/[0.03] rounded-md px-3 py-1 text-[10px] text-zinc-600 font-mono">
                        cvber.app
                    </div>
                </div>
            </div>
            <div className="p-6 md:p-8">
                <div className="flex items-center justify-center gap-0 mb-6">
                    {demoSteps.map((s, i) => (
                        <div key={i} className="flex items-center">
                            <div className="flex flex-col items-center">
                                <motion.div
                                    className="relative w-9 h-9 rounded-lg flex items-center justify-center"
                                    animate={{
                                        backgroundColor: i === step ? s.bg : "rgba(255,255,255,0.02)",
                                        scale: i === step ? 1 : 0.8,
                                    }}
                                    transition={{ duration: 0.4 }}
                                >
                                    <s.icon className="w-4 h-4" style={{ color: i === step ? s.color : "rgba(255,255,255,0.12)" }} />
                                </motion.div>
                                <motion.p
                                    className="text-[9px] mt-1.5 font-medium"
                                    animate={{ color: i === step ? "#fff" : "rgba(255,255,255,0.12)" }}
                                    transition={{ duration: 0.3 }}
                                >
                                    {s.label.split(" ")[0]}
                                </motion.p>
                            </div>
                            {i < demoSteps.length - 1 && (
                                <div className="w-8 md:w-12 h-px mx-1.5 bg-white/[0.04]" />
                            )}
                        </div>
                    ))}
                </div>
                <div className="flex justify-center min-h-[90px] items-center">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={step}
                            initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
                            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                            exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
                            transition={{ duration: 0.4 }}
                            className="flex flex-col items-center gap-1.5"
                        >
                            {demoSteps[step].preview}
                            <p className="text-sm font-medium">{demoSteps[step].label}</p>
                            <p className="text-[11px] text-zinc-500">{demoSteps[step].sub}</p>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}

// ─── Scroll Indicator ───────────────────────────────────────────────

function ScrollIndicator() {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 1 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
            <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-[0.25em]">Scroll to explore</span>
            <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
                <ChevronDown className="w-4 h-4 text-zinc-500" />
            </motion.div>
        </motion.div>
    );
}

// ─── Background ────────────────────────────────────────────────────

function Background() {
    return (
        <div className="fixed inset-0 z-0 pointer-events-none">
            <div className="absolute inset-0 bg-grid-white/[0.015] bg-[size:50px_50px]" />
            <div className="absolute inset-0 bg-[#050505] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,transparent_20%,black)]" />
            <motion.div
                animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.35, 0.2] }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-[-5%] left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-purple-500/15 blur-[150px] rounded-full"
            />
            <motion.div
                animate={{ scale: [1, 1.15, 1], opacity: [0.1, 0.2, 0.1] }}
                transition={{ duration: 14, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                className="absolute bottom-[10%] right-[-10%] w-[600px] h-[600px] bg-blue-500/10 blur-[120px] rounded-full"
            />
        </div>
    );
}

// ─── Page ───────────────────────────────────────────────────────────

export default function Home() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    useLenis();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        router.push(`/register?email=${encodeURIComponent(email)}`);
    };

    return (
        <div className="relative min-h-screen bg-[#050505] text-white selection:bg-purple-500/30 overflow-x-hidden font-sans">
            <StructuredData />
            <Background />

            {/* ─── HERO ─── */}
            <section className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 pb-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="flex flex-col items-center text-center max-w-2xl w-full"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.02] border border-white/[0.06] text-zinc-500 text-[9px] font-bold uppercase tracking-[0.2em] mb-8">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
                        AI Art Protection
                    </div>

                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.92] mb-5">
                        Protect your art<br />
                        <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">from AI theft</span>
                    </h1>

                    <p className="text-base md:text-lg text-zinc-500 max-w-lg mb-10 leading-relaxed">
                        Free C2PA certificates, DMCA automation, and 24/7 monitoring.
                    </p>

                    <div className="w-full max-w-md mb-10">
                        <ProductDemo />
                    </div>

                    <form onSubmit={handleSubmit} className="w-full max-w-md">
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email"
                                    required
                                    className="w-full pl-11 pr-4 py-3.5 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-purple-500/30 transition-all"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-3.5 bg-white text-black rounded-xl font-bold text-sm hover:bg-zinc-200 transition-all flex items-center gap-2 disabled:opacity-50 active:scale-95"
                            >
                                {loading ? (
                                    <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                ) : (
                                    <>
                                        Start
                                        <ArrowRight className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="flex items-center justify-center gap-4 mt-4 text-zinc-600 text-xs">
                        <span>Free forever</span>
                        <span>·</span>
                        <span>No credit card</span>
                        <span>·</span>
                        <span>30s setup</span>
                    </div>
                </motion.div>

                <ScrollIndicator />
            </section>

            {/* ─── HOW IT WORKS ─── */}
            <Section className="relative z-10 py-32 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-20">
                        <h2 className="text-3xl md:text-5xl font-black tracking-tighter mb-4">How it works</h2>
                        <p className="text-zinc-500 max-w-md mx-auto">Three steps to protect your creative work forever.</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { step: "01", title: "Upload your work", desc: "Drag and drop any image. We support JPEG, PNG, WebP — all standard formats.", color: "from-purple-500/20" },
                            { step: "02", title: "We scan & certify", desc: "C2PA certificate issued to your file. We scan 15+ platforms for unauthorized copies.", color: "from-blue-500/20" },
                            { step: "03", title: "24/7 protection", desc: "We monitor the web for theft and auto-generate DMCA takedown notices when needed.", color: "from-amber-500/20" },
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: i * 0.15 }}
                                className="p-8 rounded-3xl bg-white/[0.01] border border-white/[0.04] hover:border-white/[0.08] transition-all group"
                            >
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} to-transparent flex items-center justify-center mb-6`}>
                                    <span className="text-xs font-mono text-zinc-400">{item.step}</span>
                                </div>
                                <h3 className="text-lg font-bold mb-3">{item.title}</h3>
                                <p className="text-zinc-500 text-sm leading-relaxed">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </Section>

            {/* ─── FEATURES ─── */}
            <Section className="relative z-10 py-32 px-6 border-t border-white/[0.04]">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-16">
                        <h2 className="text-3xl md:text-5xl font-black tracking-tighter mb-4">Everything you need</h2>
                        <p className="text-zinc-500 max-w-md">Full-spectrum art protection — from cryptographic certificates to automated enforcement.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                            className="md:col-span-8 p-10 md:p-14 rounded-3xl bg-white/[0.01] border border-white/[0.04] min-h-[400px] flex flex-col justify-between group hover:border-white/[0.08] transition-all"
                        >
                            <div>
                                <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-8">
                                    <Zap className="w-7 h-7 text-purple-500" />
                                </div>
                                <h3 className="text-3xl md:text-4xl font-black tracking-tight mb-4">Neural-Net Monitoring</h3>
                                <p className="text-base text-zinc-500 max-w-sm leading-relaxed">Continuous deep-web scanning detects unauthorized usage of your digital fingerprints across social platforms and marketplaces.</p>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
                            className="md:col-span-4 p-10 rounded-3xl bg-white/[0.01] border border-white/[0.04] min-h-[400px] flex flex-col justify-between group hover:border-white/[0.08] transition-all"
                        >
                            <div>
                                <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-6">
                                    <Search className="w-5 h-5 text-zinc-400" />
                                </div>
                                <h3 className="text-xl font-black tracking-tight mb-3">Asset Verification</h3>
                                <p className="text-sm text-zinc-500 leading-relaxed">Verify the origin of any file using our decentralized C2PA validator.</p>
                            </div>
                            <Link href="/verify" className="mt-8 text-[10px] font-bold uppercase tracking-widest text-purple-500 flex items-center gap-2 group/link">
                                Launch Validator <ArrowRight className="w-3 h-3 group-hover/link:translate-x-1 transition-transform" />
                            </Link>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
                            className="md:col-span-4 p-10 rounded-3xl bg-white/[0.01] border border-white/[0.04] min-h-[400px] flex flex-col justify-between group hover:border-white/[0.08] transition-all"
                        >
                            <div>
                                <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-6">
                                    <BookOpen className="w-5 h-5 text-zinc-400" />
                                </div>
                                <h3 className="text-xl font-black tracking-tight mb-3">The Art Hub</h3>
                                <p className="text-sm text-zinc-500 leading-relaxed">Mission control for art protection. DMCA templates, scraping defense guides, and legal toolkits.</p>
                            </div>
                            <Link href="/art-hub" className="mt-8 text-[10px] font-bold uppercase tracking-widest text-purple-500 flex items-center gap-2 group/link">
                                Enter Hub <ArrowRight className="w-3 h-3 group-hover/link:translate-x-1 transition-transform" />
                            </Link>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }}
                            className="md:col-span-8 p-10 md:p-14 rounded-3xl bg-white/[0.01] border border-white/[0.04] min-h-[400px] flex flex-col md:flex-row items-start md:items-center justify-between group hover:border-white/[0.08] transition-all"
                        >
                            <div className="max-w-sm">
                                <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-6">
                                    <Shield className="w-5 h-5 text-zinc-400" />
                                </div>
                                <h3 className="text-3xl md:text-4xl font-black tracking-tight mb-4">Universal SDK</h3>
                                <p className="text-base text-zinc-500 leading-relaxed">Protect your entire portfolio with two lines of code. Automated reporting and provenance injection built-in.</p>
                            </div>
                            <div className="mt-8 md:mt-0 p-6 md:p-8 rounded-2xl bg-black/60 border border-white/[0.04] font-mono text-xs text-purple-400/50 leading-relaxed backdrop-blur-sm">
                                <pre className="whitespace-pre-wrap">
                                    {`const defense = await Cvber.init({
  vault: "./assets/*",
  autoReport: true,
  monitor: true
});`}
                                </pre>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </Section>

            {/* ─── GEO CONTENT ─── */}
            <Section className="relative z-10 py-32 px-6 border-t border-white/[0.04]" aria-label="What is CVBER and how it works">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-3xl md:text-5xl font-black tracking-tighter mb-16 text-center">What Is CVBER?</h2>
                    <div className="grid md:grid-cols-2 gap-12 mb-20">
                        <div>
                            <h3 className="text-lg font-bold mb-4">The Problem</h3>
                            <p className="text-zinc-500 text-sm leading-relaxed">
                                AI companies scrape millions of artworks from Instagram, TikTok, YouTube, DeviantArt, Reddit, and stock sites to train generative models — without permission, credit, or compensation.
                            </p>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold mb-4">The Solution</h3>
                            <p className="text-zinc-500 text-sm leading-relaxed">
                                CVBER is a free AI-powered art protection platform combining C2PA digital provenance certificates, automated DMCA takedown generation, AI theft detection, and blockchain ownership attestation.
                            </p>
                        </div>
                    </div>
                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            { title: "C2PA Certificates", desc: "Cryptographic proof of ownership embedded in your files. Recognized by Adobe, Microsoft, Google, and the BBC." },
                            { title: "DMCA Automation", desc: "Automatically generates legally formatted DMCA takedown notices when your art is stolen. Send to any platform." },
                            { title: "24/7 Monitoring", desc: "Watchtower scans social media, stock sites, and NFT marketplaces continuously. Get instant alerts on theft." },
                        ].map((item, i) => (
                            <div key={i} className="p-8 rounded-3xl bg-white/[0.01] border border-white/[0.04]">
                                <h3 className="text-base font-bold mb-3">{item.title}</h3>
                                <p className="text-zinc-500 text-sm leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                    <div className="mt-16 text-center">
                        <p className="text-zinc-500 text-sm max-w-2xl mx-auto leading-relaxed">
                            <strong className="text-white">CVBER is free to start.</strong> Upload up to 100 files per month, get C2PA certificates, access DMCA templates — no credit card required.
                        </p>
                    </div>
                </div>
            </Section>

            {/* ─── FINAL CTA ─── */}
            <Section className="relative z-10 py-40 px-6">
                <div className="max-w-5xl mx-auto rounded-[3rem] bg-gradient-to-br from-purple-600 to-purple-800 p-16 md:p-24 text-center overflow-hidden relative shadow-[0_40px_80px_rgba(168,85,247,0.2)]">
                    <div className="relative z-10 flex flex-col items-center">
                        <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-6 uppercase italic leading-none">Join the Resistance.</h2>
                        <p className="text-base text-purple-100/60 max-w-xl mb-10">Reclaim your digital sovereignty today.</p>
                        <Link
                            href="/register"
                            className="px-10 py-5 bg-white text-black rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-zinc-100 transition-all flex items-center gap-3 active:scale-95 shadow-xl shadow-black/20"
                        >
                            Secure Your Creative Soul
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                    <div className="absolute bottom-0 right-0 p-12 opacity-5 pointer-events-none">
                        <Logo size="xl" className="w-[300px] h-[300px] -mr-20 -mb-20" />
                    </div>
                </div>
            </Section>

            {/* ─── FOOTER ─── */}
            <footer className="relative z-10 py-20 border-t border-white/[0.04] px-6">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 text-zinc-600 font-bold text-[9px] uppercase tracking-[0.3em]">
                    <div className="flex items-center gap-3 opacity-30 grayscale brightness-200">
                        <Logo className="w-5 h-5" />
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
        </div>
    );
}
