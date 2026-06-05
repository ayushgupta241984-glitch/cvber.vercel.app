"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { motion, useInView, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import { ArrowRight, Shield, ChevronDown, Menu, Zap, Search, BookOpen } from "lucide-react";
import StructuredData from "@/components/seo/StructuredData";
import Preloader from "@/components/Preloader";
import Logo from "@/components/common/Logo";

const Scene3D = dynamic(() => import("@/components/canvas/Scene3D"), { ssr: false });

// ─── Reusable scroll-reveal section ─────────────────────────────────

function Section({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    const sectionRef = useRef<HTMLDivElement>(null);
    const inView = useInView(sectionRef, { once: true, margin: "-10%" });
    return (
        <motion.section
            ref={sectionRef}
            initial={{ opacity: 0, y: 50 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
            className={className}
        >
            {children}
        </motion.section>
    );
}

// ─── Page ───────────────────────────────────────────────────────────

export default function Home() {
    const [loaded, setLoaded] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

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
                        {/* 3D Background */}
                        <Scene3D />

                        {/* ─── HEADER ─── */}
                        <motion.header
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8, duration: 0.6 }}
                            className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-5"
                        >
                            <Link href="/" className="flex items-center gap-2.5">
                                <Shield className="w-5 h-5 text-purple-400" />
                                <span className="text-sm font-black tracking-tight uppercase italic text-white/80">CVBER</span>
                            </Link>
                            <div className="flex items-center gap-4">
                                <Link href="/onboarding" className="hidden md:inline-flex text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 hover:text-white transition-colors">
                                    Get Started
                                </Link>
                                <button
                                    onClick={() => setMenuOpen(!menuOpen)}
                                    className="w-9 h-9 rounded-full border border-white/[0.08] flex items-center justify-center hover:border-white/20 transition-colors"
                                >
                                    <Menu className="w-4 h-4 text-zinc-400" />
                                </button>
                            </div>
                        </motion.header>

                        {/* ─── HERO ─── */}
                        <section className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 pb-24">
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1.2, duration: 0.8 }}
                                className="flex flex-col items-center text-center"
                            >
                                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.02] border border-white/[0.06] text-zinc-500 text-[9px] font-bold uppercase tracking-[0.2em] mb-8">
                                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
                                    AI Art Protection
                                </div>

                                <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.92] mb-5">
                                    Protect your art<br />
                                    <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">from AI theft</span>
                                </h1>

                                <p className="text-base md:text-lg text-zinc-500 max-w-lg mb-12 leading-relaxed">
                                    Free C2PA certificates, DMCA automation, and 24/7 monitoring.
                                </p>

                                <Link
                                    href="/onboarding"
                                    className="group px-10 py-5 bg-white text-black rounded-xl font-bold text-sm hover:bg-zinc-200 transition-all flex items-center gap-3 active:scale-95 shadow-[0_20px_40px_rgba(255,255,255,0.05)]"
                                >
                                    Get Started
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </Link>

                                <div className="flex items-center justify-center gap-4 mt-6 text-zinc-600 text-xs">
                                    <span>Free forever</span>
                                    <span>·</span>
                                    <span>No credit card</span>
                                    <span>·</span>
                                    <span>30s setup</span>
                                </div>
                            </motion.div>

                            {/* Scroll indicator */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 2.5, duration: 1 }}
                                className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
                            >
                                <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-[0.25em]">Scroll to explore</span>
                                <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
                                    <ChevronDown className="w-4 h-4 text-zinc-500" />
                                </motion.div>
                            </motion.div>
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
                                        { step: "01", title: "Upload your work", desc: "Drag and drop any image. JPEG, PNG, WebP — all standard formats." },
                                        { step: "02", title: "We scan & certify", desc: "C2PA certificate issued. We scan 15+ platforms for unauthorized copies." },
                                        { step: "03", title: "24/7 protection", desc: "We monitor the web for theft and auto-generate DMCA takedown notices." },
                                    ].map((item, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, y: 30 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ duration: 0.6, delay: i * 0.15 }}
                                            className="p-8 rounded-3xl bg-white/[0.01] border border-white/[0.04] hover:border-white/[0.08] transition-all group"
                                        >
                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-transparent flex items-center justify-center mb-6">
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
                                    <p className="text-zinc-500 max-w-md">From cryptographic certificates to automated enforcement.</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="md:col-span-8 p-10 md:p-14 rounded-3xl bg-white/[0.01] border border-white/[0.04] min-h-[380px] flex flex-col justify-between group hover:border-white/[0.08] transition-all">
                                        <div>
                                            <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-8">
                                                <Zap className="w-7 h-7 text-purple-500" />
                                            </div>
                                            <h3 className="text-3xl md:text-4xl font-black tracking-tight mb-4">Neural-Net Monitoring</h3>
                                            <p className="text-base text-zinc-500 max-w-sm leading-relaxed">Continuous deep-web scanning detects unauthorized usage across social platforms and marketplaces.</p>
                                        </div>
                                    </motion.div>
                                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="md:col-span-4 p-10 rounded-3xl bg-white/[0.01] border border-white/[0.04] min-h-[380px] flex flex-col justify-between group hover:border-white/[0.08] transition-all">
                                        <div>
                                            <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-6">
                                                <Search className="w-5 h-5 text-zinc-400" />
                                            </div>
                                            <h3 className="text-xl font-black tracking-tight mb-3">Asset Verification</h3>
                                            <p className="text-sm text-zinc-500 leading-relaxed">Verify origin of any file using our C2PA validator.</p>
                                        </div>
                                        <Link href="/verify" className="mt-8 text-[10px] font-bold uppercase tracking-widest text-purple-500 flex items-center gap-2 group/link">
                                            Launch Validator <ArrowRight className="w-3 h-3 group-hover/link:translate-x-1 transition-transform" />
                                        </Link>
                                    </motion.div>
                                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="md:col-span-4 p-10 rounded-3xl bg-white/[0.01] border border-white/[0.04] min-h-[380px] flex flex-col justify-between group hover:border-white/[0.08] transition-all">
                                        <div>
                                            <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-6">
                                                <BookOpen className="w-5 h-5 text-zinc-400" />
                                            </div>
                                            <h3 className="text-xl font-black tracking-tight mb-3">The Art Hub</h3>
                                            <p className="text-sm text-zinc-500 leading-relaxed">DMCA templates, scraping defense guides, legal toolkits.</p>
                                        </div>
                                        <Link href="/art-hub" className="mt-8 text-[10px] font-bold uppercase tracking-widest text-purple-500 flex items-center gap-2 group/link">
                                            Enter Hub <ArrowRight className="w-3 h-3 group-hover/link:translate-x-1 transition-transform" />
                                        </Link>
                                    </motion.div>
                                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }} className="md:col-span-8 p-10 md:p-14 rounded-3xl bg-white/[0.01] border border-white/[0.04] min-h-[380px] flex flex-col md:flex-row items-start md:items-center justify-between group hover:border-white/[0.08] transition-all">
                                        <div className="max-w-sm">
                                            <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-6">
                                                <Shield className="w-5 h-5 text-zinc-400" />
                                            </div>
                                            <h3 className="text-3xl md:text-4xl font-black tracking-tight mb-4">Universal SDK</h3>
                                            <p className="text-base text-zinc-500 leading-relaxed">Protect your entire portfolio with two lines of code.</p>
                                        </div>
                                        <div className="mt-8 md:mt-0 p-6 md:p-8 rounded-2xl bg-black/60 border border-white/[0.04] font-mono text-xs text-purple-400/50 leading-relaxed backdrop-blur-sm">
                                            <pre className="whitespace-pre-wrap">{`const defense = await Cvber.init({\n  vault: "./assets/*",\n  autoReport: true,\n  monitor: true\n});`}</pre>
                                        </div>
                                    </motion.div>
                                </div>
                            </div>
                        </Section>

                        {/* ─── GEO CONTENT ─── */}
                        <Section className="relative z-10 py-32 px-6 border-t border-white/[0.04]" aria-label="What is CVBER">
                            <div className="max-w-5xl mx-auto">
                                <h2 className="text-3xl md:text-5xl font-black tracking-tighter mb-16 text-center">What Is CVBER?</h2>
                                <div className="grid md:grid-cols-2 gap-12 mb-20">
                                    <div>
                                        <h3 className="text-lg font-bold mb-4">The Problem</h3>
                                        <p className="text-zinc-500 text-sm leading-relaxed">AI companies scrape millions of artworks from Instagram, TikTok, YouTube, DeviantArt, and stock sites to train generative models — without permission, credit, or compensation.</p>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold mb-4">The Solution</h3>
                                        <p className="text-zinc-500 text-sm leading-relaxed">CVBER is a free AI-powered art protection platform combining C2PA digital provenance certificates, automated DMCA takedown generation, AI theft detection, and blockchain ownership attestation.</p>
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
                                    <Link href="/register" className="px-10 py-5 bg-white text-black rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-zinc-100 transition-all flex items-center gap-3 active:scale-95 shadow-xl shadow-black/20">
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
