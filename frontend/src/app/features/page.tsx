"use client";

import Link from "next/link";
import { Shield, Check, FileCode, Zap, Globe, Lock, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number = 0) => ({
        opacity: 1, y: 0,
        transition: { delay: i * 0.1, duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] as const }
    })
};

export default function FeaturesPage() {
    const features = [
        { icon: Zap, title: 'AI Theft Detection', desc: 'Monitor the web for unauthorized AI training and image scraping using our advanced neural detection engine.' },
        { icon: FileCode, title: 'C2PA Provenance', desc: 'Embed tamper-proof cryptographic signatures directly into your files to prove original authorship forever.' },
        { icon: Shield, title: 'Automated DMCA', desc: 'Generate and send legally-compliant takedown notices to over 12,000 domains in minutes, not hours.' },
        { icon: Globe, title: 'Global Monitoring', desc: 'Our Watchtower service scans social media and marketplace sites 24/7 for unauthorized usage of your fingerprints.' },
        { icon: Lock, title: 'Safe Vault', desc: 'Encrypted storage for your original RAW files with immutable proof-of-creation anchored to the blockchain.' },
        { icon: Check, title: 'Trust Score', desc: 'A verifiable creator index that certifies your content authenticity across the digital ecosystem.' },
    ];

    return (
        <div className="min-h-screen bg-gallery-black text-luxury-cream selection:bg-luxury-gold/25 overflow-x-hidden">
            {/* Hero */}
            <section className="relative pt-40 pb-20 px-8 md:px-16 overflow-hidden">
                <div className="absolute inset-0 opacity-[0.03]">
                    <img src="https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=1920&q=80" alt="" loading="lazy" decoding="async" className="w-full h-full object-cover" />
                </div>
                <div className="max-w-7xl mx-auto text-center relative z-10">
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="tag mb-10">Feature Catalog</motion.div>
                    <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                        className="font-display text-5xl md:text-8xl font-bold text-luxury-cream mb-8 leading-tight gold-glow">
                        Advanced <span className="text-luxury-gold">Defense.</span>
                    </motion.h1>
                    <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                        className="text-lg text-luxury-muted max-w-2xl mx-auto font-sans">
                        Enterprise-grade tools built for the modern creator. Protect, prove, and enforce digital ownership.
                    </motion.p>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-24 md:py-32 px-8 md:px-16">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                        {features.map((feature, idx) => (
                            <motion.div
                                key={idx}
                                custom={idx}
                                variants={fadeUp}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                                className="card-gallery p-10 min-h-[320px] flex flex-col justify-between group"
                            >
                                <div>
                                    <div className="w-14 h-14 rounded-full border border-luxury-gold/20 flex items-center justify-center mb-8 group-hover:border-luxury-gold/40 transition-colors">
                                        <feature.icon className="w-7 h-7 text-luxury-gold" />
                                    </div>
                                    <h3 className="font-display text-2xl font-bold text-luxury-cream mb-4">{feature.title}</h3>
                                    <p className="text-luxury-muted font-sans text-sm leading-relaxed">{feature.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Protected Mediums */}
            <section className="py-24 md:py-32 px-8 md:px-16 border-t border-gallery-border">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-16">
                        <span className="tag mb-4 block">Supported Media</span>
                        <h2 className="font-display text-4xl md:text-6xl font-bold text-luxury-cream leading-tight">Protected<br />Mediums</h2>
                        <p className="text-luxury-muted font-sans text-base mt-4 max-w-lg">From concept art to photography portfolios, CVBER scales to your creative ambition.</p>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                        {[
                            { title: 'Digital Art', subtitle: 'Illustration', img: 'https://images.unsplash.com/photo-1561214115-f2f134cc4912?auto=format&fit=crop&w=600&q=80' },
                            { title: 'Photography', subtitle: 'Portfolio', img: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?auto=format&fit=crop&w=600&q=80' },
                            { title: 'Video Content', subtitle: 'Motion', img: 'https://images.unsplash.com/photo-1536240478700-b869070f9279?auto=format&fit=crop&w=600&q=80' },
                            { title: '3D Assets', subtitle: 'Environments', img: 'https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?auto=format&fit=crop&w=600&q=80' },
                        ].map((asset, idx) => (
                            <motion.div
                                key={idx}
                                custom={idx}
                                variants={fadeUp}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                                className="group relative overflow-hidden rounded-2xl bg-gallery-surface border border-gallery-border hover:border-luxury-gold/20 transition-all cursor-default"
                            >
                                <div className="aspect-[3/4] relative overflow-hidden">
                                    <img src={asset.img} alt={asset.title} loading="lazy" decoding="async" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-gallery-surface via-transparent to-transparent" />
                                </div>
                                <div className="px-5 pb-5 -mt-10 relative z-10">
                                    <span className="text-[9px] font-bold uppercase tracking-ultra-wide text-luxury-gold font-sans">{asset.subtitle}</span>
                                    <h3 className="font-display text-lg font-bold text-luxury-cream">{asset.title}</h3>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-24 md:py-32 px-8 md:px-16 text-center">
                <div className="max-w-4xl mx-auto">
                    <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                        className="font-display text-4xl md:text-6xl font-bold text-luxury-cream mb-10 leading-tight gold-glow">
                        Start protecting your art.
                    </motion.h2>
                    <Link href="/gate" className="btn-primary inline-flex items-center gap-3 group">
                        Apply for Access <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <p className="mt-4 text-xs text-zinc-500">Free — no credit card required</p>
                    <p className="mt-2 text-sm text-zinc-500">
                        <Link href="/blog" className="text-purple-400 hover:text-purple-300 transition-colors">Read more on our Blog →</Link>
                    </p>
                </div>
            </section>
        </div>
    );
}
