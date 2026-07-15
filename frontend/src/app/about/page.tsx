"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, Heart, Zap, Users, Globe, Lock, Menu } from "lucide-react";
import Link from "next/link";
import SidebarNav from "@/components/nav/SidebarNav";

const fadeIn = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const } },
};

const stagger = {
    visible: { transition: { staggerChildren: 0.15 } },
};

export default function AboutPage() {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <main className="min-h-screen bg-black text-white">
            <button
                onClick={() => setMenuOpen(true)}
                className="fixed top-6 right-6 z-[140] w-12 h-12 rounded-full border border-white/10 flex items-center justify-center hover:border-white/20 transition-colors bg-black/50 backdrop-blur-md"
            >
                <Menu className="w-5 h-5 text-zinc-400" />
            </button>
            <SidebarNav open={menuOpen} onClose={() => setMenuOpen(false)} />

            {/* Hero */}
            <section className="pt-32 pb-20 px-6">
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={stagger}
                    className="max-w-4xl mx-auto"
                >
                    <motion.h1
                        variants={fadeIn}
                        className="text-5xl md:text-7xl font-black tracking-tighter mb-6"
                    >
                        We built CVBER because artists deserve better.
                    </motion.h1>
                    <motion.p
                        variants={fadeIn}
                        className="text-lg md:text-xl text-zinc-400 max-w-2xl leading-relaxed"
                    >
                        Every day, billions of artworks are scraped, copied, and fed into AI models without consent.
                        Artists lose $27B+ annually. Existing tools cost $19-$199/month or take 30-50% commission.
                        We thought that was unacceptable.
                    </motion.p>
                </motion.div>
            </section>

            {/* The Problem */}
            <section className="py-20 px-6 border-t border-white/5">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={stagger}
                    className="max-w-4xl mx-auto"
                >
                    <motion.h2 variants={fadeIn} className="text-3xl md:text-5xl font-black tracking-tighter mb-8">
                        The problem is real.
                    </motion.h2>
                    <div className="grid md:grid-cols-2 gap-8">
                        <motion.div variants={fadeIn} className="bg-white/5 rounded-2xl p-8 border border-white/10">
                            <div className="text-4xl font-black text-red-500 mb-3">2.5B</div>
                            <div className="text-sm text-zinc-400">images stolen daily by AI training pipelines</div>
                        </motion.div>
                        <motion.div variants={fadeIn} className="bg-white/5 rounded-2xl p-8 border border-white/10">
                            <div className="text-4xl font-black text-red-500 mb-3">$27B+</div>
                            <div className="text-sm text-zinc-400">lost annually by artists to AI scraping and theft</div>
                        </motion.div>
                        <motion.div variants={fadeIn} className="bg-white/5 rounded-2xl p-8 border border-white/10">
                            <div className="text-4xl font-black text-red-500 mb-3">76%</div>
                            <div className="text-sm text-zinc-400">of digital artists have experienced art theft</div>
                        </motion.div>
                        <motion.div variants={fadeIn} className="bg-white/5 rounded-2xl p-8 border border-white/10">
                            <div className="text-4xl font-black text-red-500 mb-3">85%</div>
                            <div className="text-sm text-zinc-400">can&apos;t afford existing protection tools ($19-$199/mo)</div>
                        </motion.div>
                    </div>
                </motion.div>
            </section>

            {/* Our Approach */}
            <section className="py-20 px-6 border-t border-white/5">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={stagger}
                    className="max-w-4xl mx-auto"
                >
                    <motion.h2 variants={fadeIn} className="text-3xl md:text-5xl font-black tracking-tighter mb-8">
                        So we did something different.
                    </motion.h2>
                    <motion.div variants={fadeIn} className="space-y-6 text-zinc-400 text-lg leading-relaxed">
                        <p>
                            Before writing a single line of code, we ran <strong className="text-white">2,400 synthetic interviews</strong> across
                            8 art segments using cognitive behavioral science frameworks. Not surveys. Not polls.
                            Deep, structured conversations that simulate how real artists think, feel, and make decisions.
                        </p>
                        <p>
                            We used <strong className="text-white">Jobs-to-be-Done</strong> theory to understand what job artists
                            hire protection tools to do. We applied <strong className="text-white">Prospect Theory</strong> to understand
                            loss aversion. We ran <strong className="text-white">Cognitive Load analysis</strong> to figure out
                            exactly how many clicks a protection workflow can have before artists abandon it.
                        </p>
                        <p>
                            The result? We found our beachhead: <strong className="text-white">tattoo artists</strong>.
                            8.5/10 fit score. 60% daily use intent. 85% would recommend. They have unique designs,
                            rampant theft, no existing tools, and a tight-knit community that spreads by word-of-mouth.
                        </p>
                    </motion.div>
                </motion.div>
            </section>

            {/* What We Built */}
            <section className="py-20 px-6 border-t border-white/5">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={stagger}
                    className="max-w-4xl mx-auto"
                >
                    <motion.h2 variants={fadeIn} className="text-3xl md:text-5xl font-black tracking-tighter mb-8">
                        What we built.
                    </motion.h2>
                    <motion.div variants={fadeIn} className="space-y-6 text-zinc-400 text-lg leading-relaxed">
                        <p>
                            CVBER is a free, open-source AI-powered copyright protection platform.
                            It covers the full lifecycle: <strong className="text-white">detect → prove → enforce</strong>.
                        </p>
                        <p>
                            Upload your art. AI scans for theft across 5 search engines.
                            Get a C2PA certificate (recognized by Adobe, Microsoft, Google).
                            Anchor proof to the Bitcoin blockchain.
                            Generate DMCA takedown notices. Download court-ready evidence PDFs.
                        </p>
                        <p>
                            All of it. Free. No credit card required. No commission on your earnings.
                        </p>
                    </motion.div>

                    <motion.div variants={fadeIn} className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-12">
                        {[
                            { icon: Shield, label: "C2PA Certificates" },
                            { icon: Lock, label: "Blockchain Proof" },
                            { icon: Zap, label: "AI Scan" },
                            { icon: Globe, label: "5-Engine Search" },
                            { icon: Heart, label: "Invisible Watermark" },
                            { icon: Users, label: "DMCA Automation" },
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-3 bg-white/5 rounded-xl p-4 border border-white/10">
                                <item.icon className="w-5 h-5 text-white/60" />
                                <span className="text-sm font-medium">{item.label}</span>
                            </div>
                        ))}
                    </motion.div>
                </motion.div>
            </section>

            {/* Open Source */}
            <section className="py-20 px-6 border-t border-white/5">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={stagger}
                    className="max-w-4xl mx-auto"
                >
                    <motion.h2 variants={fadeIn} className="text-3xl md:text-5xl font-black tracking-tighter mb-8">
                        Open source by design.
                    </motion.h2>
                    <motion.div variants={fadeIn} className="space-y-6 text-zinc-400 text-lg leading-relaxed">
                        <p>
                            Artists have been burned by tools that disappear, change pricing, or sell their data.
                            We believe protection tools should be transparent. Every line of CVBER&apos;s code is
                            open-source. You can audit it, fork it, contribute to it.
                        </p>
                        <p>
                            Trust is earned through transparency, not marketing.
                        </p>
                    </motion.div>
                    <motion.div variants={fadeIn}>
                        <Link
                            href="https://github.com/ayushgupta241984-glitch/cvber.free.las.app"
                            target="_blank"
                            className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-white/10 rounded-full text-sm font-bold uppercase tracking-widest hover:bg-white/20 transition-colors"
                        >
                            View on GitHub
                        </Link>
                    </motion.div>
                </motion.div>
            </section>

            {/* CTA */}
            <section className="py-20 px-6 border-t border-white/5">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={stagger}
                    className="max-w-4xl mx-auto text-center"
                >
                    <motion.h2 variants={fadeIn} className="text-3xl md:text-5xl font-black tracking-tighter mb-6">
                        Ready to protect your art?
                    </motion.h2>
                    <motion.p variants={fadeIn} className="text-zinc-400 text-lg mb-8">
                        Free. Open-source. No credit card required.
                    </motion.p>
                    <motion.div variants={fadeIn}>
                        <Link
                            href="/register"
                            className="inline-flex items-center px-10 py-4 bg-white text-black rounded-full font-bold text-xs uppercase tracking-[0.2em] hover:bg-zinc-200 transition-all"
                        >
                            Get Started Free
                        </Link>
                    </motion.div>
                </motion.div>
            </section>
        </main>
    );
}
