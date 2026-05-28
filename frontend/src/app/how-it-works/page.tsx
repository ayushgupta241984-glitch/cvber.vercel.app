"use client";

import Link from "next/link";
import { Upload, Stamp, Award, ArrowRight, ShieldCheck, Search } from "lucide-react";
import { motion } from "framer-motion";

const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number = 0) => ({
        opacity: 1, y: 0,
        transition: { delay: i * 0.2, duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] as const }
    })
};

export default function HowItWorksPage() {
    return (
        <div className="min-h-screen bg-gallery-black text-luxury-cream selection:bg-luxury-gold/25 overflow-x-hidden">
            {/* Hero */}
            <section className="relative pt-40 pb-20 px-8 md:px-16 overflow-hidden">
                <div className="absolute inset-0 opacity-[0.03]">
                    <img src="https://images.unsplash.com/photo-1501088430049-ac71c51e8f07?auto=format&fit=crop&w=1920&q=80" alt="" loading="lazy" decoding="async" className="w-full h-full object-cover" />
                </div>
                <div className="max-w-7xl mx-auto text-center relative z-10">
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="tag mb-10">Protocol Workflow</motion.div>
                    <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        className="font-display text-5xl md:text-8xl font-bold text-luxury-cream mb-8 leading-tight gold-glow">
                        Security in<br /><span className="text-luxury-gold">Three Steps.</span>
                    </motion.h1>
                    <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                        className="text-lg text-luxury-muted max-w-2xl mx-auto font-sans">
                        We've simplified complex cryptographic provenance and neural monitoring into a frictionless workflow that takes seconds, not hours.
                    </motion.p>
                </div>
            </section>

            {/* Steps */}
            <section className="py-24 md:py-32 px-8 md:px-16">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-3 gap-12 md:gap-16">
                        {[
                            { step: '01', title: 'Upload & Identify', desc: 'Upload your digital assets. Our system immediately hashes the content for blockchain-anchored attestation.', icon: Upload },
                            { step: '02', title: 'Apply Provenance', desc: 'Inject C2PA metadata and neural fingerprints. This creates a permanent, invisible digital birth certificate for your work.', icon: Stamp },
                            { step: '03', title: 'Active Defense', desc: 'Our Watchtower monitor begins scanning the web, notifying you in real-time of theft or unauthorized AI ingestion.', icon: Award },
                        ].map((item, idx) => (
                            <motion.div
                                key={idx}
                                custom={idx}
                                variants={fadeUp}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                                className="group relative"
                            >
                                <div className="font-display text-[10rem] font-bold text-white/[0.02] absolute -top-20 -left-8 pointer-events-none select-none">
                                    {item.step}
                                </div>
                                <div className="relative z-10">
                                    <div className="w-16 h-16 rounded-full border border-luxury-gold/25 flex items-center justify-center mb-10 group-hover:border-luxury-gold/50 transition-colors">
                                        <item.icon className="w-8 h-8 text-luxury-gold" />
                                    </div>
                                    <h3 className="font-display text-3xl font-bold text-luxury-cream mb-6">{item.title}</h3>
                                    <p className="text-luxury-muted font-sans text-base leading-relaxed">{item.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Tech Deep Dive */}
            <section className="py-24 md:py-32 px-8 md:px-16 border-y border-gallery-border bg-gallery-deep/50">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-12 md:gap-24 items-center">
                        <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                            <span className="tag mb-6 block">Technology</span>
                            <h2 className="font-display text-4xl md:text-6xl font-bold text-luxury-cream mb-8 leading-tight">
                                Built for the<br /><span className="text-luxury-gold">AI Era.</span>
                            </h2>
                            <p className="text-luxury-muted font-sans text-base leading-relaxed mb-10">
                                Traditional copyright is a defensive relic. In an era where AI can scrape millions of records per minute, you need an offensive digital wall.
                            </p>
                            <div className="space-y-4">
                                <div className="card-gallery p-6 md:p-8 flex gap-6">
                                    <div className="shrink-0 w-10 h-10 rounded-full border border-luxury-gold/20 flex items-center justify-center">
                                        <ShieldCheck className="w-5 h-5 text-luxury-gold" />
                                    </div>
                                    <div>
                                        <h4 className="font-sans text-sm font-bold text-luxury-cream mb-1 uppercase tracking-wide">C2PA Standard Compliance</h4>
                                        <p className="text-luxury-muted text-xs font-sans">Industry-standard protocols used by Adobe and Microsoft for universal verification.</p>
                                    </div>
                                </div>
                                <div className="card-gallery p-6 md:p-8 flex gap-6">
                                    <div className="shrink-0 w-10 h-10 rounded-full border border-luxury-gold/20 flex items-center justify-center">
                                        <Search className="w-5 h-5 text-luxury-gold" />
                                    </div>
                                    <div>
                                        <h4 className="font-sans text-sm font-bold text-luxury-cream mb-1 uppercase tracking-wide">Neural Monitoring</h4>
                                        <p className="text-luxury-muted text-xs font-sans">Detection of fingerprints even if the image is cropped, filtered, or heavily compressed.</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="relative aspect-square rounded-3xl bg-gallery-surface border border-gallery-border overflow-hidden flex items-center justify-center"
                        >
                            <div className="absolute inset-0 bg-gradient-radial from-luxury-gold/[0.05] to-transparent" />
                            <div className="absolute inset-0 opacity-[0.03]">
                                <img src="https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?auto=format&fit=crop&w=800&q=80" alt="" loading="lazy" decoding="async" className="w-full h-full object-cover" />
                            </div>
                            {/* Animated rings */}
                            {[1, 2, 3, 4].map((r) => (
                                <motion.div
                                    key={r}
                                    animate={{ scale: [1, 1.05, 1], opacity: [0.15, 0.3, 0.15] }}
                                    transition={{ duration: 3 + r, repeat: Infinity, delay: r * 0.5 }}
                                    className="absolute rounded-full border border-luxury-gold/20"
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
                                    animate={{ opacity: [0.3, 0.8, 0.3], scale: [1, 1.3, 1] }}
                                    transition={{ duration: 2 + i * 0.3, repeat: Infinity, delay: i * 0.4 }}
                                    className="absolute w-2 h-2 bg-luxury-gold rounded-full"
                                    style={{ left: pos.x, top: pos.y, boxShadow: '0 0 6px rgba(201, 169, 98, 0.4)' }}
                                />
                            ))}
                            <div className="relative z-10 text-center">
                                <div className="text-[9px] font-bold text-luxury-gold/50 uppercase tracking-[0.3em] font-sans mb-2">Neural Grid Active</div>
                                <div className="font-display text-2xl md:text-3xl font-bold text-white/10">Monitoring</div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-24 md:py-32 px-8 md:px-16 text-center">
                <div className="max-w-4xl mx-auto">
                    <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                        className="font-display text-4xl md:text-6xl font-bold text-luxury-cream mb-12 leading-tight gold-glow">
                        Ready to start?
                    </motion.h2>
                    <Link href="/register" className="btn-primary inline-flex items-center gap-3 group">
                        Secure Your Legacy <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </section>
        </div>
    );
}
