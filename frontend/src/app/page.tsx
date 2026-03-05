"use client";

import Link from "next/link";
import { ArrowRight, Shield, Zap, Globe, Lock, Play, Search, BookOpen } from "lucide-react";
import Logo from "@/components/common/Logo";
import StructuredData from "@/components/seo/StructuredData";
import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api-client";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState<{ full_name: string } | null>(null);

    useEffect(() => {
        const token = localStorage.getItem("access_token");
        setIsLoggedIn(!!token);

        if (token) {
            apiClient.getUserProfile()
                .then(profile => setUser(profile))
                .catch(err => console.error("Failed to load user profile", err));
        }

        const handleScroll = () => setIsScrolled(window.scrollY > 50);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.3,
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
            <StructuredData />

            {/* Persistent Grid Background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
                <div className="absolute inset-0 bg-[#050505] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,transparent_20%,black)]" />
                <div className="absolute inset-x-0 top-0 h-[800px] bg-gradient-to-b from-purple-500/10 via-transparent to-transparent opacity-60" />

                {/* Animated Glow Spot */}
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-purple-500/20 blur-[120px] rounded-full"
                />
            </div>

            {/* Top Navigation */}
            <nav
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled ? "py-4 bg-black/60 backdrop-blur-xl border-b border-white/5" : "py-8 bg-transparent"
                    }`}
            >
                <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2.5 group">
                        <Logo className="w-9 h-9 group-hover:scale-105 transition-transform" />
                        <span className="text-2xl font-black tracking-tighter uppercase italic">CVBER</span>
                    </Link>

                    <div className="hidden md:flex items-center gap-10 text-[13px] font-bold uppercase tracking-widest text-zinc-500">
                        {[
                            { name: "Features", href: "/features" },
                            { name: "How It Works", href: "/how-it-works" },
                            { name: "Art Hub", href: "/art-hub" },
                            { name: "Verify", href: "/verify" }
                        ].map((item) => (
                            <Link key={item.name} href={item.href} className="hover:text-white transition-colors">
                                {item.name}
                            </Link>
                        ))}
                    </div>

                    <div className="flex items-center gap-2">
                        {user ? (
                            <div className="flex items-center gap-3 pl-4 border-l border-white/10">
                                <div className="flex flex-col items-end hidden sm:flex">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-500/80 leading-none mb-1">Active Session</span>
                                    <span className="text-sm font-bold text-white tracking-tight">{user.full_name}</span>
                                </div>
                                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-xs font-black text-white shadow-xl shadow-purple-500/20 border border-white/10 hover:scale-105 transition-transform cursor-pointer">
                                    {user.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                </div>
                            </div>
                        ) : (
                            <>
                                <Link
                                    href="/login"
                                    className="hidden sm:block px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-white transition-colors"
                                >
                                    Log in
                                </Link>
                                <Link
                                    href="/register"
                                    className="px-8 py-3 bg-white text-black rounded-full font-bold text-xs uppercase tracking-widest hover:bg-zinc-200 transition-all active:scale-95 shadow-[0_4px_20px_rgba(255,255,255,0.2)]"
                                >
                                    Get Started
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-[20vh] pb-32 px-6 z-10 flex flex-col items-center text-center">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="flex flex-col items-center"
                >
                    <motion.div
                        variants={itemVariants}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-zinc-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-10"
                    >
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
                        Absolute Digital Identity Defense
                    </motion.div>

                    <motion.h1
                        variants={itemVariants}
                        className="text-6xl md:text-[100px] lg:text-[120px] font-black tracking-tighter leading-[0.9] mb-12 max-w-5xl bg-gradient-to-b from-white via-white to-white/40 bg-clip-text text-transparent italic"
                    >
                        OWN YOUR<br />CREATIVE SOUL.
                    </motion.h1>

                    <motion.p
                        variants={itemVariants}
                        className="text-lg md:text-xl text-zinc-500 max-w-2xl mb-14 leading-relaxed font-medium"
                    >
                        The world's first automated neural defense engine.
                        Protect your art from AI scraping, fraud, and unauthorized
                        ingestion with enterprise-grade provenance.
                    </motion.p>

                    <motion.div
                        variants={itemVariants}
                        className="flex flex-col sm:flex-row items-center gap-6"
                    >
                        <Link
                            href="/register"
                            className="group px-10 py-5 bg-white text-black rounded-full font-bold text-sm uppercase tracking-widest hover:bg-zinc-200 transition-all flex items-center gap-3 active:scale-95 shadow-[0_20px_40px_rgba(255,255,255,0.1)]"
                        >
                            Protect My Assets
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </motion.div>
                </motion.div>
            </section>

            {/* Social Proof Bar */}
            <section className="relative z-10 py-24 border-y border-white/5 bg-white/[0.01]">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-12 opacity-40 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-1000 cursor-default">
                        <div className="flex flex-col items-center md:items-start text-center md:text-left">
                            <span className="text-4xl font-black tracking-tighter mb-1">10,000+</span>
                            <span className="text-[10px] text-zinc-500 uppercase font-black tracking-widest block">Global Assets</span>
                        </div>
                        <div className="flex flex-col items-center md:items-start text-center md:text-left">
                            <span className="text-4xl font-black tracking-tighter mb-1">24%</span>
                            <span className="text-[10px] text-zinc-500 uppercase font-black tracking-widest block">Theft Reduction</span>
                        </div>
                        <div className="flex flex-col items-center md:items-start text-center md:text-left">
                            <span className="text-4xl font-black tracking-tighter mb-1">99.9%</span>
                            <span className="text-[10px] text-zinc-500 uppercase font-black tracking-widest block">Neural Accuracy</span>
                        </div>
                        <div className="flex flex-col items-center md:items-start text-center md:text-left">
                            <span className="text-4xl font-black tracking-tighter mb-1">PROVEN</span>
                            <span className="text-[10px] text-zinc-500 uppercase font-black tracking-widest block">C2PA Protocol</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Feature Bento Grid */}
            <section id="features" className="relative z-10 py-40 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-24">
                        <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-6 uppercase italic">The Anatomy of<br />True Provenance</h2>
                        <p className="text-zinc-500 max-w-md font-medium text-lg">Sophisticated art security, simplified for the next generation of creators.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                        {/* 1. Neural Monitoring - Large Card */}
                        <motion.div
                            whileHover={{ y: -8 }}
                            className="md:col-span-8 group relative bg-[#0D0D10] border border-white/5 rounded-[3rem] p-12 overflow-hidden flex flex-col justify-between min-h-[500px]"
                        >
                            <div className="absolute inset-0 z-0 opacity-20 group-hover:opacity-30 transition-opacity">
                                <img src="/assets/neural-defense.png" alt="Neural Defense Visualization" className="w-full h-full object-cover grayscale" />
                            </div>
                            <div className="relative z-10">
                                <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-10">
                                    <Zap className="w-8 h-8 text-purple-500" />
                                </div>
                                <h3 className="text-4xl font-black tracking-tight mb-6 uppercase">Neural-Net Monitoring</h3>
                                <p className="text-xl text-zinc-400 max-w-sm font-medium leading-relaxed">Continuous deep-web scanning detects unauthorized usage of your digital fingerprints across social platforms and marketplaces.</p>
                            </div>
                            <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_100%_0%,rgba(168,85,247,0.1),transparent_60%)] pointer-events-none" />
                        </motion.div>

                        {/* 2. Verify Card */}
                        <motion.div
                            whileHover={{ y: -8 }}
                            className="md:col-span-4 group relative bg-[#0D0D10] border border-white/5 rounded-[3rem] p-12 flex flex-col justify-between overflow-hidden min-h-[500px]"
                        >
                            <div className="absolute inset-0 z-0 opacity-20 group-hover:opacity-40 transition-opacity">
                                <img src="/assets/verify.png" alt="Verify Assets Visual" className="w-full h-full object-cover" />
                            </div>
                            <div className="relative z-10">
                                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-10">
                                    <Search className="w-6 h-6 text-zinc-400" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black tracking-tight mb-4 uppercase">Asset Verification</h3>
                                    <p className="text-zinc-500 font-medium leading-relaxed">Instantly verify the origin of any file using our decentralized C2PA validator. Proof in seconds.</p>
                                </div>
                            </div>
                            <Link href="/verify" className="relative z-10 mt-8 text-xs font-bold uppercase tracking-widest text-purple-500 flex items-center gap-2 group/link">
                                Launch Validator <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                            </Link>
                        </motion.div>

                        {/* 3. Art Hub Card */}
                        <motion.div
                            whileHover={{ y: -8 }}
                            className="md:col-span-4 group relative bg-[#0D0D10] border border-white/5 rounded-[3rem] p-12 flex flex-col justify-between overflow-hidden min-h-[500px]"
                        >
                            <div className="absolute inset-0 z-0 opacity-20 group-hover:opacity-40 transition-opacity">
                                <img src="/assets/art-hub.png" alt="Art Hub Visual" className="w-full h-full object-cover" />
                            </div>
                            <div className="relative z-10">
                                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-10">
                                    <BookOpen className="w-6 h-6 text-zinc-400" />
                                </div>
                                <h3 className="text-2xl font-black tracking-tight mb-4 uppercase">The Art Hub</h3>
                                <p className="text-zinc-500 font-medium leading-relaxed">Your mission control for art protection. Access DMCA templates, scraping defense guides, and legal toolkits.</p>
                            </div>
                            <Link href="/art-hub" className="relative z-10 mt-8 text-xs font-bold uppercase tracking-widest text-purple-500 flex items-center gap-2 group/link">
                                Enter Hub <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                            </Link>
                        </motion.div>

                        {/* 4. Universal SDK - Large Card */}
                        <motion.div
                            whileHover={{ y: -8 }}
                            className="md:col-span-8 group relative bg-[#0D0D10] border border-white/5 rounded-[3rem] p-12 flex flex-col md:flex-row items-start md:items-center justify-between overflow-hidden relative min-h-[500px]"
                        >
                            <div className="relative z-10 max-w-sm">
                                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-10">
                                    <Shield className="w-6 h-6 text-zinc-400" />
                                </div>
                                <h3 className="text-4xl font-black tracking-tight mb-6 uppercase">Universal Defense SDK</h3>
                                <p className="text-lg text-zinc-500 font-medium leading-relaxed">Protect your entire portfolio workflow with two lines of code. Automated reporting and provenance injection built-in.</p>
                            </div>
                            <div className="mt-8 md:mt-0 relative z-10 p-8 rounded-3xl bg-black/80 border border-white/5 font-mono text-xs text-purple-400/60 leading-relaxed backdrop-blur-md">
                                <pre className="whitespace-pre-wrap">
                                    {`const defense = await Cvber.init({
  vault: "./assets/*",
  autoReport: true,
  monitor: true
});`}
                                </pre>
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-t from-purple-500/5 to-transparent pointer-events-none" />
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="relative z-10 py-40 px-6">
                <div className="max-w-5xl mx-auto rounded-[4rem] bg-gradient-to-br from-purple-600 to-purple-800 p-16 md:p-24 text-center overflow-hidden relative shadow-[0_40px_100px_rgba(168,85,247,0.3)]">
                    <div className="relative z-10 flex flex-col items-center">
                        <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-8 uppercase italic leading-none">Join the Resistance.</h2>
                        <p className="text-lg text-purple-100/70 max-w-xl mb-12 font-medium">The era of unchecked art theft is over. Reclaim your digital sovereignty today with CVBER.</p>
                        <Link
                            href="/register"
                            className="px-12 py-6 bg-white text-black rounded-full font-bold text-sm uppercase tracking-widest hover:bg-zinc-100 transition-all flex items-center gap-3 active:scale-95 shadow-xl shadow-black/20"
                        >
                            Secure Your Creative Soul
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                    {/* Decorative background logo */}
                    <div className="absolute bottom-0 right-0 p-12 opacity-5 pointer-events-none">
                        <Logo size="xl" className="w-[400px] h-[400px] -mr-20 -mb-20" />
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="relative z-10 py-24 border-t border-white/5 px-6">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12 text-zinc-600 font-bold text-[10px] uppercase tracking-[0.3em]">
                    <div className="flex items-center gap-3 opacity-30 grayscale brightness-200">
                        <Logo className="w-6 h-6" />
                        <span className="text-sm font-black tracking-tighter uppercase italic">CVBER</span>
                    </div>

                    <div className="flex flex-wrap justify-center gap-10">
                        <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
                        <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
                        <Link href="/contact" className="hover:text-white transition-colors">Support</Link>
                        <Link href="/art-hub" className="hover:text-white transition-colors">Help</Link>
                    </div>

                    <div className="opacity-40">
                        &copy; 2026 CVBER System Inc.
                    </div>
                </div>
            </footer>
        </div>
    );
}
