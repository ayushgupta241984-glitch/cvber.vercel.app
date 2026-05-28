"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Shield, Eye, Gavel, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { ScrollReveal, TextReveal, SpotlightCard } from "@/components/animation";
import FadeEffect from "@/components/animation/FadeEffect";
import SlideEffect from "@/components/animation/SlideEffect";
import Badge from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import StructuredData from "@/components/seo/StructuredData";

export default function Home() {
    return (
        <>
            <StructuredData />

            {/* ===== HERO ===== */}
            <section className="relative h-screen w-full overflow-hidden bg-[#080808]">
                <div className="absolute inset-0">
                    <Image
                        src="https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=1920&q=85"
                        alt=""
                        fill
                        sizes="100vw"
                        priority
                        className="object-cover"
                    />
                    <div className="absolute inset-0 mesh-gradient" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-black/60 to-black/40" />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-black/50" />
                    <div className="absolute inset-0 opacity-[0.015] noise-overlay" />
                </div>

                <div className="relative z-10 h-full flex flex-col justify-center px-8 md:px-20">
                    <div className="max-w-4xl">
                        <SlideEffect delay={0.05}>
                            <Badge text="Digital Content Protection" className="mb-8" />
                        </SlideEffect>

                        <h1 className="font-display text-6xl md:text-8xl lg:text-9xl font-bold text-white leading-[0.85] mb-6 tracking-tight">
                            <TextReveal per="word" stagger={0.01} delay={0.1} variant="slide">
                                Protect Your Art.
                            </TextReveal>
                            <br />
                            <span className="bg-gradient-to-r from-[#C9A962] via-[#D4B97A] to-[#C9A962] bg-clip-text text-transparent">
                                <TextReveal per="word" stagger={0.01} delay={0.2} variant="blur">
                                    Own Your Future.
                                </TextReveal>
                            </span>
                        </h1>

                        <ScrollReveal variant="fade-up" delay={0.08} amount={0.05}>
                            <p className="text-base md:text-lg text-[#F5F0EB]/40 font-sans font-light max-w-xl mb-10">
                                Provenance certificates, real-time theft monitoring, and automated DMCA enforcement — all in one platform.
                            </p>
                        </ScrollReveal>

                        <div className="flex flex-wrap items-center gap-4">
                            <ScrollReveal variant="fade-up" delay={0.1} amount={0.05}>
                                <Link href="/register">
                                    <Button variant="primary" size="lg" className="gap-3 group">
                                        Begin Protection <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </Link>
                            </ScrollReveal>
                            <ScrollReveal variant="fade-up" delay={0.12} amount={0.05}>
                                <Link href="/features">
                                    <Button variant="secondary" size="lg">
                                        Explore Features
                                    </Button>
                                </Link>
                            </ScrollReveal>
                        </div>
                        </div>

                    <SlideEffect delay={0.15} className="absolute bottom-12 left-8 md:left-20">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-px bg-[#C9A962]/40" />
                            <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-white/30">Scroll</span>
                        </div>
                    </SlideEffect>
                </div>
            </section>

            {/* ===== WHAT WE DO ===== */}
            <section className="py-28 md:py-36 px-8 md:px-20 bg-[#080808] relative">
                <div className="absolute inset-0 bg-gradient-to-b from-[#C9A962]/[0.02] to-transparent pointer-events-none" />
                <div className="max-w-7xl mx-auto relative z-10">
                    <ScrollReveal variant="blur-in" className="text-center mb-20">
                        <Badge number={1} text="What We Do" className="mb-6" />
                        <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
                            Three pillars of{" "}
                            <span className="text-gradient-gold">digital protection</span>
                        </h2>
                    </ScrollReveal>

                    <div className="grid md:grid-cols-3 gap-6 md:gap-8">
                        {[
                            {
                                icon: Shield, title: "Provenance",
                                desc: "Cryptographic proof of ownership embedded into your files. C2PA-compliant, tamper-proof, verifiable across any platform.",
                                image: "https://images.unsplash.com/photo-1501088430049-ac71c51e8f07?auto=format&fit=crop&w=800&q=80"
                            },
                            {
                                icon: Eye, title: "Monitoring",
                                desc: "Continuous web surveillance detects your work across marketplaces, social media, and AI training datasets. 24/7 real-time coverage.",
                                image: "https://images.unsplash.com/photo-1596541223130-5d31a73a6b8c?auto=format&fit=crop&w=800&q=80"
                            },
                            {
                                icon: Gavel, title: "Enforcement",
                                desc: "Automated DMCA takedowns to 12,000+ platforms. Legal-grade notices generated in seconds. From detection to resolution.",
                                image: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=800&q=80"
                            },
                        ].map((item, i) => (
                            <ScrollReveal key={i} variant="flip-up" delay={i * 0.03} amount={0.05}>
                                <SpotlightCard
                                    spotlightColor="rgba(201, 169, 98, 0.1)"
                                    className="group bg-[#111111] border border-white/[0.06] hover:border-[#C9A962]/20 transition-all duration-300 h-full"
                                >
                                    <div className="h-52 overflow-hidden relative">
                                        <img
                                            src={item.image}
                                            alt=""
                                            loading="lazy"
                                            decoding="async"
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-transparent to-transparent" />
                                        <div className="absolute inset-0 frame-gold" />
                                    </div>
                                    <div className="p-8 md:p-10">
                                        <div className="w-12 h-12 rounded-full border border-[#C9A962]/25 flex items-center justify-center mb-6 group-hover:border-[#C9A962]/50 group-hover:bg-[#C9A962]/5 transition-all duration-200">
                                            <item.icon className="w-5 h-5 text-[#C9A962]" />
                                        </div>
                                        <h3 className="font-display text-2xl font-bold text-white mb-3">{item.title}</h3>
                                        <p className="text-[#F5F0EB]/40 font-sans text-sm leading-relaxed">{item.desc}</p>
                                    </div>
                                </SpotlightCard>
                            </ScrollReveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== SHOWCASE 1 — Provenance ===== */}
            <section className="bg-[#080808] border-t border-white/[0.04]">
                <div className="grid md:grid-cols-2 min-h-[600px]">
                    <ScrollReveal variant="fade-right" className="relative overflow-hidden order-2 md:order-1 flex items-center p-10 md:p-16 lg:p-20">
                        <div className="max-w-lg">
                            <Badge number={2} text="Provenance" className="mb-6" />
                            <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                                Every creation<br />
                                <span className="text-gradient-gold">has a signature</span>
                            </h2>
                            <p className="text-[#F5F0EB]/40 font-sans text-base leading-relaxed mb-8">
                                C2PA-compliant cryptographic certificates embedded directly into your digital files. Verifiable authorship, cross-platform, forever.
                            </p>
                            <div className="h-px w-full bg-gradient-to-r from-[#C9A962]/20 to-transparent mb-8" />
                            <Link href="/how-it-works">
                                <Button variant="gold" className="gap-2 group">
                                    Learn the protocol <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </Link>
                        </div>
                    </ScrollReveal>

                    <ScrollReveal variant="fade-left" className="relative overflow-hidden order-1 md:order-2 min-h-[400px] md:min-h-full frame-gold">
                        <img
                            src="https://images.unsplash.com/photo-1501088430049-ac71c51e8f07?auto=format&fit=crop&w=1100&q=85"
                            alt=""
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-cover absolute inset-0"
                        />
                        <div className="absolute inset-0 bg-gradient-to-l from-black/60 via-black/20 to-transparent md:bg-gradient-to-r" />
                        <FadeEffect position="bottom" />
                    </ScrollReveal>
                </div>
            </section>

            {/* ===== SHOWCASE 2 — Monitoring ===== */}
            <section className="bg-[#080808] border-t border-white/[0.04]">
                <div className="grid md:grid-cols-2 min-h-[600px]">
                    <ScrollReveal variant="fade-right" className="relative overflow-hidden min-h-[400px] md:min-h-full frame-gold">
                        <img
                            src="https://images.unsplash.com/photo-1596541223130-5d31a73a6b8c?auto=format&fit=crop&w=1100&q=85"
                            alt=""
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-cover absolute inset-0"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />
                        <FadeEffect position="bottom" />
                    </ScrollReveal>

                    <ScrollReveal variant="fade-left" className="flex items-center p-10 md:p-16 lg:p-20">
                        <div className="max-w-lg">
                            <Badge number={3} text="Monitoring" className="mb-6" />
                            <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                                We scan the web<br />
                                <span className="text-gradient-gold">so you don&apos;t have to</span>
                            </h2>
                            <p className="text-[#F5F0EB]/40 font-sans text-base leading-relaxed mb-8">
                                Neural monitoring detects your work across marketplaces, social platforms, and AI training datasets in real-time.
                            </p>
                            <div className="h-px w-full bg-gradient-to-r from-[#C9A962]/20 to-transparent mb-8" />
                            <Link href="/features">
                                <Button variant="gold" className="gap-2 group">
                                    View features <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </Link>
                        </div>
                    </ScrollReveal>
                </div>
            </section>

            {/* ===== SHOWCASE 3 — Enforcement ===== */}
            <section className="bg-[#080808] border-t border-white/[0.04]">
                <div className="grid md:grid-cols-2 min-h-[600px]">
                    <ScrollReveal variant="fade-right" className="order-2 md:order-1 flex items-center p-10 md:p-16 lg:p-20">
                        <div className="max-w-lg">
                            <Badge number={4} text="Enforcement" className="mb-6" />
                            <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                                Take action<br />
                                <span className="text-gradient-gold">at scale</span>
                            </h2>
                            <p className="text-[#F5F0EB]/40 font-sans text-base leading-relaxed mb-8">
                                Generate legally-compliant DMCA takedown notices for 12,000+ platforms in minutes. From detection to resolution, fully automated.
                            </p>
                            <div className="h-px w-full bg-gradient-to-r from-[#C9A962]/20 to-transparent mb-8" />
                            <Link href="/register">
                                <Button variant="gold" className="gap-2 group">
                                    Start protecting <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </Link>
                        </div>
                    </ScrollReveal>

                    <ScrollReveal variant="fade-left" className="relative overflow-hidden order-1 md:order-2 min-h-[400px] md:min-h-full frame-gold">
                        <img
                            src="https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=1100&q=85"
                            alt=""
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-cover absolute inset-0"
                        />
                        <div className="absolute inset-0 bg-gradient-to-l from-black/60 via-black/20 to-transparent md:bg-gradient-to-r" />
                        <FadeEffect position="bottom" />
                    </ScrollReveal>
                </div>
            </section>

            {/* ===== STANDARDS & COMPLIANCE ===== */}
            <section className="py-24 md:py-32 px-8 md:px-20 bg-[#080808] border-t border-white/[0.04] relative">
                <div className="absolute inset-0 mesh-gradient" />
                <div className="max-w-7xl mx-auto relative z-10">
                    <ScrollReveal variant="blur-in" className="text-center mb-16">
                        <h2 className="font-display text-4xl md:text-5xl font-bold text-white">
                            Built on <span className="text-gradient-gold">industry standards</span>
                        </h2>
                    </ScrollReveal>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
                        {[
                            { icon: "C2PA", title: "C2PA Compliant", desc: "Content credentials and provenance signing per Coalition for Content Provenance and Authenticity specifications." },
                            { icon: "SHA-256", title: "Blockchain Anchored", desc: "Cryptographic hashes timestamped on the Bitcoin blockchain via OpenTimestamps protocol." },
                            { icon: "DMCA", title: "Legal Enforcement", desc: "Automated DMCA takedown generation for 12,000+ platforms with full legal compliance." },
                            { icon: "ISO", title: "Audit Trail", desc: "Append-only hash-chained audit records admissible as evidence in legal proceedings." },
                        ].map((item, i) => (
                            <ScrollReveal key={i} variant="zoom-in" delay={i * 0.02} amount={0.05}>
                                <div className="border border-white/[0.06] hover:border-[#C9A962]/20 transition-all duration-300 p-8 flex flex-col items-start">
                                    <div className="text-[11px] font-bold tracking-[0.2em] text-[#C9A962] mb-4 font-sans">{item.icon}</div>
                                    <h3 className="font-display text-base font-bold text-white mb-2">{item.title}</h3>
                                    <p className="text-[#F5F0EB]/35 font-sans text-xs leading-relaxed">{item.desc}</p>
                                </div>
                            </ScrollReveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== FOUNDER STORY (hidden, crawlable by search engines) ===== */}
            <section aria-label="Founder Story" className="sr-only" role="region">
                <h2>Our Story</h2>
                <p>CVBER was founded by Ayush, a creator who refused to lose. After discovering their work scraped into AI training datasets without consent, credit, or compensation, they built the platform they wished existed: one automated shield for every creator who refuses to be erased by the machine.</p>
            </section>

            {/* ===== FINAL CTA ===== */}
            <section className="relative py-32 md:py-44 px-8 md:px-20 bg-[#080808] text-center overflow-hidden">
                <div className="absolute inset-0 mesh-gradient" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#C9A962]/[0.04] rounded-full blur-3xl pointer-events-none" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#C9A962]/[0.03] rounded-full blur-2xl pointer-events-none" />

                <div className="max-w-3xl mx-auto relative z-10">
                    <ScrollReveal variant="blur-in">
                        <Badge text="Get Started" className="mb-8" />
                    </ScrollReveal>

                    <ScrollReveal variant="slide-up-spring">
                        <h2 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight">
                            <span className="text-gradient-cream">Ready to protect</span>
                            <br />
                            <span className="text-gradient-gold">your creative work?</span>
                        </h2>
                    </ScrollReveal>

                    <ScrollReveal variant="fade-up" delay={0.02}>
                        <p className="text-[#F5F0EB]/35 font-sans text-lg mb-12 max-w-lg mx-auto">
                            Join thousands of artists who trust CVBER for digital provenance and enforcement.
                        </p>
                    </ScrollReveal>

                    <ScrollReveal variant="zoom-in" delay={0.05}>
                        <Link href="/register">
                            <Button variant="primary" size="lg" className="gap-3 px-14 py-5 group">
                                <Sparkles className="w-4 h-4" />
                                Get Started Free
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </Link>
                    </ScrollReveal>
                </div>
            </section>
        </>
    );
}
