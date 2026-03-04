"use client";

import Link from "next/link";
import { Shield, Check, FileCode, Zap, Globe, Lock, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function FeaturesPage() {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6 }
        },
    };

    return (
        <div className="relative min-h-screen bg-[#050505] text-white selection:bg-purple-500/30 overflow-x-hidden font-sans">
            {/* Persistent Grid Background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
                <div className="absolute inset-x-0 top-0 h-[800px] bg-gradient-to-b from-purple-500/10 via-transparent to-transparent opacity-60" />
            </div>

            {/* Header Content */}
            <section className="relative z-10 pt-40 pb-20 px-6 overflow-hidden">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1 }}
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-purple-500/10 blur-[120px] rounded-full pointer-events-none"
                />

                <div className="max-w-7xl mx-auto text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-purple-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-10"
                    >
                        Feature Catalog v2.6.0
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-8xl font-black tracking-tighter mb-8 italic uppercase"
                    >
                        Advanced <span className="text-glow">Defense.</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl text-zinc-500 max-w-2xl mx-auto font-medium"
                    >
                        Enterprise-grade tools built for the modern creator. Protect, prove, and enforce digital ownership.
                    </motion.p>
                </div>
            </section>

            {/* Features Matrix */}
            <section className="relative z-10 py-32 px-6">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
                    >
                        {[
                            {
                                title: 'AI Theft Detection',
                                desc: 'Monitor the web for unauthorized AI training and image scraping using our advanced neural detection engine.',
                                icon: Zap,
                                color: 'text-yellow-400',
                                bg: 'bg-yellow-400/5',
                                border: 'border-yellow-400/10'
                            },
                            {
                                title: 'C2PA Provenance',
                                desc: 'Embed tamper-proof cryptographic signatures directly into your files to prove original authorship forever.',
                                icon: FileCode,
                                color: 'text-blue-400',
                                bg: 'bg-blue-400/5',
                                border: 'border-blue-400/10'
                            },
                            {
                                title: 'Automated DMCA',
                                desc: 'Generate and send legally-compliant takedown notices to over 12,000 domains in minutes, not hours.',
                                icon: Shield,
                                color: 'text-purple-400',
                                bg: 'bg-purple-400/5',
                                border: 'border-purple-400/10'
                            },
                            {
                                title: 'Global Monitoring',
                                desc: 'Our Watchtower service scans social media and marketplace sites 24/7 for unauthorized usage of your fingerprints.',
                                icon: Globe,
                                color: 'text-green-400',
                                bg: 'bg-green-400/5',
                                border: 'border-green-400/10'
                            },
                            {
                                title: 'Safe Vault',
                                desc: 'Encrypted storage for your original RAW files with immutable proof-of-creation anchored to the blockchain.',
                                icon: Lock,
                                color: 'text-red-400',
                                bg: 'bg-red-400/5',
                                border: 'border-red-400/10'
                            },
                            {
                                title: 'Trust Score',
                                desc: 'A verifiable creator index that certifies your content authenticity across the digital ecosystem.',
                                icon: Check,
                                color: 'text-purple-500',
                                bg: 'bg-purple-500/5',
                                border: 'border-purple-500/10'
                            }
                        ].map((feature, idx) => (
                            <motion.div
                                key={idx}
                                variants={itemVariants}
                                whileHover={{ y: -8 }}
                                className={`p-10 rounded-[2.5rem] bg-[#0D0D10] border border-white/5 hover:border-white/10 transition-all flex flex-col justify-between min-h-[320px] group`}
                            >
                                <div>
                                    <div className={`w-14 h-14 ${feature.bg} ${feature.border} border rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500`}>
                                        <feature.icon className={`w-7 h-7 ${feature.color}`} />
                                    </div>
                                    <h3 className="text-2xl font-black tracking-tight text-white mb-4 uppercase">{feature.title}</h3>
                                    <p className="text-zinc-500 font-medium leading-relaxed">{feature.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Visual Showcase — Premium CSS Art Cards */}
            <section className="relative z-10 py-16 md:py-32 px-4 md:px-6 border-t border-white/5">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-12 md:mb-20">
                        <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-4 md:mb-6 uppercase italic">Protected<br />Mediums</h2>
                        <p className="text-zinc-500 font-medium text-base md:text-lg leading-relaxed max-w-lg">From single concept arts to massive photography portfolios, CVBER scales to your creative ambition.</p>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-8">
                        {[
                            {
                                title: 'Digital Art',
                                category: 'Illustration',
                                visual: (
                                    <div className="absolute inset-0 overflow-hidden rounded-[2rem]">
                                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,#7c3aed_0%,transparent_60%)]" />
                                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,#4c1d95_0%,transparent_60%)]" />
                                        <div className="absolute inset-0 bg-grid-white/[0.04] bg-[size:20px_20px]" />
                                        <div className="absolute top-1/4 left-1/4 w-24 h-24 md:w-32 md:h-32 border border-purple-500/30 rounded-full animate-pulse" />
                                        <div className="absolute top-1/3 left-1/3 w-16 h-16 md:w-20 md:h-20 border border-purple-400/20 rounded-full" />
                                        <div className="absolute bottom-1/4 right-1/4 w-8 h-8 md:w-12 md:h-12 bg-purple-500/30 rounded-full blur-sm" />
                                    </div>
                                )
                            },
                            {
                                title: 'Photography',
                                category: 'Portfolio',
                                visual: (
                                    <div className="absolute inset-0 overflow-hidden rounded-[2rem]">
                                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,#1e3a8a_0%,transparent_70%)]" />
                                        <div className="absolute inset-0 bg-[conic-gradient(from_0deg_at_50%_50%,transparent_0deg,#1d4ed8/10_90deg,transparent_180deg)]" />
                                        {[...Array(5)].map((_, i) => (
                                            <div key={i} className="absolute inset-0 border border-blue-500/10 rounded-[2rem]" style={{ margin: `${i * 14}%` }} />
                                        ))}
                                        <div className="absolute bottom-1/3 right-1/3 w-12 h-12 md:w-16 md:h-16 bg-blue-500/20 rounded-full blur-md" />
                                    </div>
                                )
                            },
                            {
                                title: 'Video Content',
                                category: 'Motion',
                                visual: (
                                    <div className="absolute inset-0 overflow-hidden rounded-[2rem]">
                                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,#9d174d_0%,transparent_60%)]" />
                                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,#831843_0%,transparent_60%)]" />
                                        {[...Array(4)].map((_, i) => (
                                            <div key={i} className="absolute h-px bg-gradient-to-r from-transparent via-pink-500/50 to-transparent" style={{ top: `${25 + i * 18}%`, left: 0, right: 0 }} />
                                        ))}
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 border-4 border-pink-500/60 rounded-sm rotate-45" />
                                    </div>
                                )
                            },
                            {
                                title: '3D Assets',
                                category: 'Environments',
                                visual: (
                                    <div className="absolute inset-0 overflow-hidden rounded-[2rem]">
                                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,#312e81_0%,transparent_70%)]" />
                                        <div className="absolute inset-0 bg-[linear-gradient(120deg,transparent_30%,#4f46e5/15_50%,transparent_70%)]" />
                                        {[...Array(3)].map((_, i) => (
                                            <div key={i} className="absolute border border-indigo-500/20" style={{
                                                inset: `${10 + i * 15}%`,
                                                transform: `rotate(${45 + i * 15}deg)`,
                                                borderRadius: '4px'
                                            }} />
                                        ))}
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 md:w-14 md:h-14 bg-indigo-500/30 blur-lg rounded-sm" />
                                    </div>
                                )
                            }
                        ].map((asset, idx) => (
                            <motion.div
                                key={idx}
                                whileHover={{ y: -10 }}
                                className="group relative overflow-hidden rounded-[2rem] md:rounded-[2.5rem] bg-[#0D0D10] border border-white/5 hover:border-white/10 transition-all cursor-default"
                            >
                                <div className="aspect-[3/4] relative">
                                    {asset.visual}
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D10] via-transparent to-transparent" />
                                </div>
                                <div className="px-4 md:px-6 pb-4 md:pb-6 -mt-4 relative z-10">
                                    <span className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-purple-500 font-black mb-1 block">{asset.category}</span>
                                    <h3 className="text-base md:text-xl font-black text-white tracking-tight italic">{asset.title}</h3>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="relative z-10 py-40 px-6">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="max-w-5xl mx-auto rounded-[4rem] bg-gradient-to-br from-purple-600 to-purple-800 p-16 md:p-24 text-center overflow-hidden relative"
                >
                    <div className="relative z-10 flex flex-col items-center">
                        <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-10 uppercase italic">Deploy your defense.</h2>
                        <Link href="/register" className="px-12 py-6 bg-white text-black rounded-full font-bold text-sm uppercase tracking-widest hover:bg-zinc-100 transition-all flex items-center gap-3 active:scale-95 shadow-xl shadow-black/20">
                            Secure Now <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                    {/* Decorative element */}
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_0%_0%,rgba(255,255,255,0.1),transparent_50%)]" />
                </motion.div>
            </section>
        </div>
    );
}
