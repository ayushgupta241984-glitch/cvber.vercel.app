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
            <section className="relative z-10 py-32 px-6 border-y border-white/5 bg-white/[0.01]">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-24 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-10 uppercase italic">Built for the <br /><span className="text-purple-500">AI Era.</span></h2>
                            <p className="text-zinc-500 text-xl font-medium leading-relaxed mb-10">
                                Traditional copyright is a defensive relic. In an era where AI can scrape millions of records per minute, you need an offensive digital wall.
                            </p>
                            <div className="space-y-6">
                                <div className="flex gap-6 p-8 rounded-[2rem] bg-[#0D0D10] border border-white/5">
                                    <div className="shrink-0 w-12 h-12 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                                        <ShieldCheck className="w-6 h-6 text-green-500" />
                                    </div>
                                    <div>
                                        <h4 className="text-white font-bold mb-2 uppercase tracking-wide">C2PA Standard Compliance</h4>
                                        <p className="text-zinc-500 text-sm font-medium">Industry-standard protocols used by Adobe and Microsoft for universal verification.</p>
                                    </div>
                                </div>
                                <div className="flex gap-6 p-8 rounded-[2rem] bg-[#0D0D10] border border-white/5">
                                    <div className="shrink-0 w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                                        <Search className="w-6 h-6 text-purple-500" />
                                    </div>
                                    <div>
                                        <h4 className="text-white font-bold mb-2 uppercase tracking-wide">Neural Monitoring</h4>
                                        <p className="text-zinc-500 text-sm font-medium">Detection of fingerprints even if the image is cropped, filtered, or heavily compressed.</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="relative aspect-square rounded-[4rem] bg-gradient-to-br from-purple-500/20 to-transparent border border-white/5 overflow-hidden flex items-center justify-center"
                        >
                            <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:30px_30px]" />
                            <Logo className="w-48 h-48 relative z-10 opacity-40 drop-shadow-[0_0_50px_rgba(168,85,247,0.3)]" />
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
