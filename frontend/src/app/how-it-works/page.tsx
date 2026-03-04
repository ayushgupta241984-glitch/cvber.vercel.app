"use client";

import Link from "next/link";
import { Upload, Stamp, Award, ArrowRight, ShieldCheck, Search } from "lucide-react";
import Logo from "@/components/common/Logo";
import { motion } from "framer-motion";

export default function HowItWorksPage() {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
                delayChildren: 0.2,
            },
        },
    };

    const stepVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: {
            opacity: 1,
            x: 0,
            transition: { duration: 0.8 }
        },
    };

    return (
        <div className="relative min-h-screen bg-[#050505] text-white selection:bg-purple-500/30 overflow-x-hidden font-sans">
            {/* Persistent Grid Background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
                <div className="absolute inset-x-0 top-0 h-[800px] bg-gradient-to-b from-purple-500/10 via-transparent to-transparent opacity-60" />
            </div>

            {/* Hero Section */}
            <section className="relative z-10 pt-40 pb-20 px-6">
                <div className="max-w-7xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-purple-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-10"
                    >
                        Protocol Workflow v1.0
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl md:text-8xl font-black tracking-tighter mb-10 uppercase italic"
                    >
                        Security in <br /><span className="text-glow">Three Steps.</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-lg md:text-xl text-zinc-500 max-w-2xl mx-auto font-medium leading-relaxed"
                    >
                        We've simplified complex cryptographic provenance and neural monitoring into a frictionless workflow that takes seconds, not hours.
                    </motion.p>
                </div>
            </section>

            {/* Steps Section */}
            <section className="relative z-10 py-32 px-6">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="grid md:grid-cols-3 gap-12"
                    >
                        {[
                            {
                                step: '01',
                                title: 'Upload & Identify',
                                desc: 'Upload your digital assets—be it art, photography, or video. Our system immediately hashes the content for blockchain-anchored attestation.',
                                icon: Upload
                            },
                            {
                                step: '02',
                                title: 'Apply Provenance',
                                desc: 'Inject C2PA metadata and neural fingerprints. This creates a permanent, invisible digital birth certificate for your work.',
                                icon: Stamp
                            },
                            {
                                step: '03',
                                title: 'Active Defense',
                                desc: 'Our Watchtower monitor begins scanning the web, notifying you in real-time of theft or unauthorized ingestion into AI models.',
                                icon: Award
                            }
                        ].map((item, idx) => (
                            <motion.div key={idx} variants={stepVariants} className="group relative">
                                <div className="text-[12rem] font-black text-white/[0.02] absolute -top-24 -left-10 z-0 pointer-events-none group-hover:text-purple-500/[0.05] transition-colors duration-1000">
                                    {item.step}
                                </div>
                                <div className="relative z-10">
                                    <div className="w-20 h-20 bg-purple-500/10 border border-purple-500/20 rounded-3xl flex items-center justify-center mb-10 group-hover:scale-110 transition-all duration-500">
                                        <item.icon className="w-10 h-10 text-purple-500" />
                                    </div>
                                    <h3 className="text-3xl font-black tracking-tight text-white mb-6 uppercase italic">{item.title}</h3>
                                    <p className="text-zinc-500 font-medium leading-relaxed text-lg">
                                        {item.desc}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Tech Deep Dive */}
            <section className="relative z-10 py-16 md:py-32 px-4 md:px-6 border-y border-white/5 bg-white/[0.01]">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-12 md:gap-24 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-6 md:mb-10 uppercase italic">Built for the <br /><span className="text-purple-500">AI Era.</span></h2>
                            <p className="text-zinc-500 text-base md:text-xl font-medium leading-relaxed mb-8 md:mb-10">
                                Traditional copyright is a defensive relic. In an era where AI can scrape millions of records per minute, you need an offensive digital wall.
                            </p>
                            <div className="space-y-4 md:space-y-6">
                                <div className="flex gap-4 md:gap-6 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] bg-[#0D0D10] border border-white/5">
                                    <div className="shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                                        <ShieldCheck className="w-5 h-5 md:w-6 md:h-6 text-green-500" />
                                    </div>
                                    <div>
                                        <h4 className="text-white font-bold mb-1 md:mb-2 uppercase tracking-wide text-sm md:text-base">C2PA Standard Compliance</h4>
                                        <p className="text-zinc-500 text-xs md:text-sm font-medium">Industry-standard protocols used by Adobe and Microsoft for universal verification.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4 md:gap-6 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] bg-[#0D0D10] border border-white/5">
                                    <div className="shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                                        <Search className="w-5 h-5 md:w-6 md:h-6 text-purple-500" />
                                    </div>
                                    <div>
                                        <h4 className="text-white font-bold mb-1 md:mb-2 uppercase tracking-wide text-sm md:text-base">Neural Monitoring</h4>
                                        <p className="text-zinc-500 text-xs md:text-sm font-medium">Detection of fingerprints even if the image is cropped, filtered, or heavily compressed.</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="relative aspect-square rounded-[3rem] md:rounded-[4rem] bg-[#0D0D10] border border-white/5 overflow-hidden flex items-center justify-center"
                        >
                            {/* Premium animated neural grid visual */}
                            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,#4c1d95_0%,#1e0a3c_40%,transparent_70%)]" />
                            <div className="absolute inset-0 bg-grid-white/[0.04] bg-[size:24px_24px]" />
                            {/* Animated rings */}
                            {[1, 2, 3, 4].map((r) => (
                                <motion.div
                                    key={r}
                                    animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.6, 0.3] }}
                                    transition={{ duration: 3 + r, repeat: Infinity, delay: r * 0.5 }}
                                    className="absolute rounded-full border border-purple-500/30"
                                    style={{ inset: `${r * 10}%` }}
                                />
                            ))}
                            {/* Node dots */}
                            {[
                                { x: '20%', y: '30%' }, { x: '70%', y: '20%' }, { x: '80%', y: '65%' },
                                { x: '30%', y: '75%' }, { x: '50%', y: '50%' }, { x: '15%', y: '55%' }
                            ].map((pos, i) => (
                                <motion.div
                                    key={i}
                                    animate={{ opacity: [0.4, 1, 0.4], scale: [1, 1.3, 1] }}
                                    transition={{ duration: 2 + i * 0.3, repeat: Infinity, delay: i * 0.4 }}
                                    className="absolute w-2 h-2 md:w-3 md:h-3 bg-purple-500 rounded-full shadow-[0_0_8px_rgba(168,85,247,0.8)]"
                                    style={{ left: pos.x, top: pos.y }}
                                />
                            ))}
                            <div className="relative z-10 text-center py-4">
                                <div className="text-[10px] font-black text-purple-500/60 uppercase tracking-[0.3em] mb-2">Neural Grid Active</div>
                                <div className="text-2xl md:text-4xl font-black text-white/10 italic uppercase tracking-tighter">Monitoring</div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="relative z-10 py-40 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-12 uppercase italic leading-none">Ready to start?</h2>
                    <Link href="/register" className="px-14 py-6 bg-white text-black rounded-full font-bold text-sm uppercase tracking-widest hover:bg-zinc-100 transition-all inline-flex items-center gap-4 active:scale-95 shadow-2xl shadow-white/10">
                        Secure Your Legacy <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </section>
        </div>
    );
}
