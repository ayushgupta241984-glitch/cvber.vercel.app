"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { ArrowRight, Shield, Globe, Instagram, Twitter, ArrowUpRight, X, Menu } from "lucide-react";

// ─── PAINTINGS ──────────────────────────────────────
const PAINTINGS = {
    monaLisa: "https://lh3.googleusercontent.com/aida-public/AB6AXuCf7gvB9TPVurApCRKFD7_qSFPs1D7QKSznj5XT3j_6Ph0fx2_KMKnxzB-Tyug8OqRCiq2TeFRH_tKI7Mt6KEbEKFvhu_z7sDG9G7c4VxXtR_ZsiEMT6DNnLrIMP6VtlHNGkJIp8g-7j7ZDyS6mzBoOZ6Cjx_pPd64sj3DDxa5IBvPDaNAtOHFgDN_IsLmacpxmEY1t7Qg73RJY_RqKjsbuLRL4doRYVbQY7b_VgXNbHGxPlDY8RBZ9zXadvvZcsfnK6w",
    vermeer: "https://lh3.googleusercontent.com/aida-public/AB6AXuDkS2ZMyPfVAk-ZQDoCq9HqsCcxRUvDZW3VE3p8ZorqDvX6CfHVYDzx_4_MiYIGXXZOLV58oNJVTg5qrzQXkpk4ufMwXmMUfnY1ubYjerze6W1T4VnfMqANJuTLf5LiRPUyi3568imHoPl7T3yZ2kHBBVlqjG162vG7iObOqVAeL0drw3xdtinJ3kMgS99dwknnRXOAjKOAi4fgGmzd5-sQz4DVMcw-vK_0B4s2Xwn_G6RFZYjNVNAt",
    elGreco: "https://lh3.googleusercontent.com/aida-public/AB6AXuDRVqZHy5VcnFaUDqXaLiHA1ucNKUws9Kl_gb9nPiPTkTN9-D9PMdZLE6J33UBem9ysE5U2vWCBH3vvDEPlVPPUXdFfdpKCWCblS22KPA-s96mUmYXSNQat6lE-6AxhiC-WJUnjMDhmUczTccOJjrO_VKYgWtQDVXBkrk-YnrVfTu_Qgg-ElAyPWFNtylWg2I8cTYmU5kG5nkTcqCFa-6Nzgug42dHA3Ko9r88n_XaIeKotwxxeuJtqT1mNJQ4_BZi26A",
    rubens: "https://lh3.googleusercontent.com/aida-public/AB6AXuAKmv6IpYjFsMLWhrEHuX35GKsJ71aTZKVy2QnBsEF_ZrBtjIWX6ytGvhLzFaGrXTmpx292BH7s5DDIqY2hA9oGfTodmmUg_UZ9abKAGkG2vhMtBAT42KzepFpA7MHOGwekzsIj3qh_OWO_aiiOEu13MCfpiWXYrrNDohPBF8Ecm8i8GGn-llDyGQUSq9Zh-hnrbjkXWuGtZAj2z9b8mJYTGivSRVnfj2e1Eahv__ZA8VFKLduPTz39tajySirD8Gwl4g",
    scan1: "https://lh3.googleusercontent.com/aida-public/AB6AXuAmLFKzjEQhlrwUneQJRX6az04iqOoawPZjbzYerPLFYzwFprZ8nsAthOx2WRya71NlylVG5vrJkaoUuVDwsi6Jg5-uLJGzLeKdNpkVo3h9ZVbUKubuWfZPm5JUa7-zMg6YKzkbtuWe45YNpNYmIYxCgJF_rssR3gM1wZl9CQ0cxex8TBMiU7-OOCrIGyDoME2F_pDhmL5HsMKd9g_asvTzIGmAOw3wJAV1Z1LgY67e1a7RUklD4uLbiaMMQVnbAV3iOw",
    scan2: "https://lh3.googleusercontent.com/aida-public/AB6AXuByvqicUjLaLsB5QZsVD8CqR2v4oTpItY4t_UlzhFAm1hDsCGC_naGPgmVPpCMKot61JpZgX8F53giD3btenfOZNcA39RG3DtqdiY7HMCfEeiFOTgIQDeia1OHBmR3ABwz8JN7ZpSUv7O3hpOhdAEpxxiC5GADNTC1NPRva4KMlVAbJutLMJN8JGR-VJM3_1qRysLap8ozvh66D7N5yDCPg0En61pfx_pjbbFWX_W-rOxmZiFg3XPE8MVaKubFRr-QjLw",
};

// ─── HERO ───────────────────────────────────────────

function Hero() {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <section className="min-h-screen overflow-hidden relative flex flex-col bg-black">
            {/* Background painting — Mona Lisa */}
            <div className="absolute inset-0 w-full h-full">
                <img
                    src={PAINTINGS.monaLisa}
                    alt="Mona Lisa by Leonardo da Vinci"
                    className="w-full h-full object-cover object-bottom opacity-50"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80" />
            </div>

            {/* Navbar */}
            <nav className="relative z-20 px-6 py-6">
                <div className="liquid-glass rounded-full max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Shield className="w-6 h-6 text-white" />
                        <span className="text-white font-semibold text-lg font-[family-name:var(--font-instrument)]">CVBER</span>
                    </div>
                    <div className="hidden md:flex items-center gap-8">
                        <Link href="/features" className="text-white/80 hover:text-white text-sm font-medium transition-colors">Features</Link>
                        <Link href="/how-it-works" className="text-white/80 hover:text-white text-sm font-medium transition-colors">How It Works</Link>
                        <Link href="/art-hub" className="text-white/80 hover:text-white text-sm font-medium transition-colors">Art Hub</Link>
                        <Link href="/blog" className="text-white/80 hover:text-white text-sm font-medium transition-colors">Blog</Link>
                        <Link href="/verify" className="text-white/80 hover:text-white text-sm font-medium transition-colors">Verify</Link>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href="/login" className="text-white text-sm font-medium hidden md:block">Log In</Link>
                        <Link href="/gate" className="liquid-glass rounded-full px-6 py-2 text-white text-sm font-medium">Apply for Access</Link>
                        <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-white">
                            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
                {/* Mobile menu */}
                {menuOpen && (
                    <div className="md:hidden liquid-glass rounded-2xl max-w-5xl mx-auto mt-3 px-6 py-6 flex flex-col gap-4">
                        <Link href="/features" onClick={() => setMenuOpen(false)} className="text-white/80 hover:text-white text-sm font-medium">Features</Link>
                        <Link href="/how-it-works" onClick={() => setMenuOpen(false)} className="text-white/80 hover:text-white text-sm font-medium">How It Works</Link>
                        <Link href="/art-hub" onClick={() => setMenuOpen(false)} className="text-white/80 hover:text-white text-sm font-medium">Art Hub</Link>
                        <Link href="/blog" onClick={() => setMenuOpen(false)} className="text-white/80 hover:text-white text-sm font-medium">Blog</Link>
                        <Link href="/verify" onClick={() => setMenuOpen(false)} className="text-white/80 hover:text-white text-sm font-medium">Verify</Link>
                        <Link href="/login" onClick={() => setMenuOpen(false)} className="text-white/80 hover:text-white text-sm font-medium">Log In</Link>
                    </div>
                )}
            </nav>

            {/* Hero content */}
            <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-12 text-center -translate-y-[10%]">
                <motion.h1
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                    className="text-7xl md:text-8xl lg:text-9xl text-white tracking-tight whitespace-nowrap font-[family-name:var(--font-instrument)]"
                >
                    Protect it then <em className="italic">own</em> it.
                </motion.h1>

                {/* Email input */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="max-w-xl w-full mt-10"
                >
                    <Link href="/gate" className="liquid-glass rounded-full pl-6 pr-2 py-2 flex items-center gap-3 group">
                        <input
                            type="email"
                            placeholder="Enter your email"
                            readOnly
                            className="flex-1 bg-transparent text-white placeholder:text-white/40 outline-none text-sm cursor-default"
                        />
                        <div className="bg-white rounded-full p-3 text-black group-hover:scale-105 transition-transform">
                            <ArrowRight className="w-5 h-5" />
                        </div>
                    </Link>
                </motion.div>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="text-white text-sm leading-relaxed px-4 max-w-lg mt-6"
                >
                    Free C2PA certificates, automated DMCA takedowns, and 24/7 theft monitoring. No credit card required.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                >
                    <Link href="/how-to-protect-your-art" className="liquid-glass rounded-full px-8 py-3 text-white text-sm font-medium hover:bg-white/5 transition-colors mt-8 inline-block">
                        Read the Guide
                    </Link>
                </motion.div>
            </div>

            {/* Social icons */}
            <div className="relative z-10 flex justify-center gap-4 pb-12">
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="liquid-glass rounded-full p-4 text-white/80 hover:text-white hover:bg-white/5 transition-all">
                    <Instagram className="w-5 h-5" />
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="liquid-glass rounded-full p-4 text-white/80 hover:text-white hover:bg-white/5 transition-all">
                    <Twitter className="w-5 h-5" />
                </a>
                <Link href="/verify" className="liquid-glass rounded-full p-4 text-white/80 hover:text-white hover:bg-white/5 transition-all">
                    <Globe className="w-5 h-5" />
                </Link>
            </div>

            {/* Painting label */}
            <div className="absolute bottom-24 right-8 z-10 text-[9px] text-white/25 font-mono tracking-wider">
                Mona Lisa — Leonardo da Vinci, c. 1503
            </div>
        </section>
    );
}

// ─── ABOUT ──────────────────────────────────────────

function AboutSection() {
    const ref = useRef<HTMLDivElement>(null);
    const inView = useInView(ref, { once: true, margin: "-100px" });

    return (
        <section ref={ref} className="bg-black pt-32 md:pt-44 pb-10 md:pb-14 px-6 overflow-hidden relative">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(255,255,255,0.03)_0%,_transparent_70%)]" />
            <div className="max-w-6xl mx-auto relative">
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    className="text-white/40 text-sm tracking-widest uppercase mb-6"
                >
                    About CVBER
                </motion.p>
                <motion.h2
                    initial={{ opacity: 0, y: 40 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.8, delay: 0.1 }}
                    className="text-4xl md:text-6xl lg:text-7xl text-white leading-[1.1] tracking-tight"
                >
                    Pioneering{" "}
                    <span className="font-[family-name:var(--font-instrument)] italic text-white/60">protection</span>{" "}
                    for<br className="hidden md:block" />
                    minds that{" "}
                    <span className="font-[family-name:var(--font-instrument)] italic text-white/60">create, build, and inspire.</span>
                </motion.h2>
            </div>
        </section>
    );
}

// ─── FEATURED PAINTING ──────────────────────────────

function FeaturedPaintingSection() {
    const ref = useRef<HTMLDivElement>(null);
    const inView = useInView(ref, { once: true, margin: "-100px" });

    return (
        <section ref={ref} className="bg-black pt-6 md:pt-10 pb-20 md:pb-32 px-6 overflow-hidden">
            <div className="max-w-6xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 60 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.9 }}
                    className="rounded-3xl overflow-hidden aspect-video relative"
                >
                    <img
                        src={PAINTINGS.vermeer}
                        alt="The Concert by Johannes Vermeer"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                    {/* Bottom overlay content */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 flex flex-col md:flex-row items-end md:items-center justify-between gap-6">
                        <div className="liquid-glass rounded-2xl p-6 md:p-8 max-w-md">
                            <p className="text-white/50 text-xs tracking-widest uppercase mb-3">Our Approach</p>
                            <p className="text-white text-sm md:text-base leading-relaxed">
                                We embed cryptographic proof of ownership into every artwork. C2PA certificates, neural theft detection, and automated enforcement — all free, forever.
                            </p>
                        </div>
                        <Link href="/how-it-works" className="liquid-glass rounded-full px-8 py-3 text-white text-sm font-medium hover:bg-white/5 transition-colors whitespace-nowrap">
                            Explore more
                        </Link>
                    </div>

                    {/* Painting label */}
                    <div className="absolute top-6 right-6 text-[9px] text-white/30 font-mono tracking-wider">
                        The Concert — Vermeer, c. 1664
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

// ─── PHILOSOPHY ─────────────────────────────────────

function PhilosophySection() {
    const ref = useRef<HTMLDivElement>(null);
    const inView = useInView(ref, { once: true, margin: "-100px" });

    return (
        <section ref={ref} className="bg-black py-28 md:py-40 px-6 overflow-hidden">
            <div className="max-w-6xl mx-auto">
                <motion.h2
                    initial={{ opacity: 0, y: 40 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.8 }}
                    className="text-5xl md:text-7xl lg:text-8xl text-white tracking-tight mb-16 md:mb-24"
                >
                    Innovation{" "}
                    <span className="font-[family-name:var(--font-instrument)] italic text-white/40">x</span>{" "}
                    Vision
                </motion.h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                    {/* Left: El Greco */}
                    <motion.div
                        initial={{ opacity: 0, x: -40 }}
                        animate={inView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="rounded-3xl overflow-hidden aspect-[4/3] relative"
                    >
                        <img
                            src={PAINTINGS.elGreco}
                            alt="Nativity by El Greco"
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                        <div className="absolute bottom-4 right-4 text-[9px] text-white/30 font-mono tracking-wider">
                            Nativity — El Greco, c. 1600
                        </div>
                    </motion.div>

                    {/* Right: Text */}
                    <motion.div
                        initial={{ opacity: 0, x: 40 }}
                        animate={inView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="flex flex-col justify-center"
                    >
                        <div>
                            <p className="text-white/40 text-xs tracking-widest uppercase mb-4">Protect your work</p>
                            <p className="text-white/70 text-base md:text-lg leading-relaxed">
                                Every artwork deserves cryptographic proof of origin. CVBER embeds C2PA certificates that AI companies must respect under the EU AI Act. Your art, your ownership, your rules.
                            </p>
                        </div>
                        <div className="w-full h-px bg-white/10 my-8" />
                        <div>
                            <p className="text-white/40 text-xs tracking-widest uppercase mb-4">Shape the future</p>
                            <p className="text-white/70 text-base md:text-lg leading-relaxed">
                                We believe creators should control how their work is used. CVBER gives every artist free tools to prove ownership, detect theft, and enforce takedowns — no lawyers needed.
                            </p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}

// ─── SERVICES ───────────────────────────────────────

const services = [
    {
        img: PAINTINGS.scan1,
        tag: "Provenance",
        title: "C2PA Certificates",
        desc: "Cryptographic proof of ownership embedded in your files. Recognized by Adobe, Microsoft, Google, and the EU AI Act.",
        label: "The Concert — Vermeer, c. 1664",
    },
    {
        img: PAINTINGS.scan2,
        tag: "Enforcement",
        title: "DMCA Automation",
        desc: "One-click takedown notices filed automatically when your art is stolen. No lawyers, no fees, no hassle.",
        label: "Scan Analysis — CVBER Neural Engine",
    },
];

function ServicesSection() {
    const ref = useRef<HTMLDivElement>(null);
    const inView = useInView(ref, { once: true, margin: "-100px" });

    return (
        <section ref={ref} className="bg-black py-28 md:py-40 px-6 overflow-hidden relative">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(255,255,255,0.02)_0%,_transparent_60%)]" />
            <div className="max-w-6xl mx-auto relative">
                <div className="flex items-center justify-between mb-16 md:mb-24">
                    <motion.h2
                        initial={{ opacity: 0, y: 30 }}
                        animate={inView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.7 }}
                        className="text-3xl md:text-5xl text-white tracking-tight"
                    >
                        What we do
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={inView ? { opacity: 1 } : {}}
                        transition={{ duration: 0.7, delay: 0.2 }}
                        className="text-white/40 text-sm hidden md:block"
                    >
                        Our services
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                    {services.map((s, i) => (
                        <motion.div
                            key={s.title}
                            initial={{ opacity: 0, y: 50 }}
                            animate={inView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.8, delay: 0.15 * i }}
                            className="liquid-glass rounded-3xl overflow-hidden group"
                        >
                            <div className="aspect-video relative overflow-hidden">
                                <img
                                    src={s.img}
                                    alt={s.title}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                                <div className="absolute bottom-3 right-3 text-[9px] text-white/30 font-mono tracking-wider">
                                    {s.label}
                                </div>
                            </div>
                            <div className="p-6 md:p-8">
                                <div className="flex items-center justify-between mb-3">
                                    <p className="uppercase tracking-widest text-white/40 text-xs">{s.tag}</p>
                                    <div className="liquid-glass rounded-full p-2">
                                        <ArrowUpRight className="w-4 h-4 text-white" />
                                    </div>
                                </div>
                                <h3 className="text-white text-xl md:text-2xl mb-3 tracking-tight">{s.title}</h3>
                                <p className="text-white/50 text-sm leading-relaxed">{s.desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// ─── FOOTER ─────────────────────────────────────────

function Footer() {
    return (
        <footer className="bg-black py-16 px-6 border-t border-white/5">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-white/30" />
                    <span className="text-white/30 font-[family-name:var(--font-instrument)] text-lg">CVBER</span>
                </div>
                <div className="flex flex-wrap justify-center gap-8 text-white/30 text-xs font-medium uppercase tracking-widest">
                    <Link href="/features" className="hover:text-white transition-colors">Features</Link>
                    <Link href="/how-it-works" className="hover:text-white transition-colors">How It Works</Link>
                    <Link href="/art-hub" className="hover:text-white transition-colors">Art Hub</Link>
                    <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
                    <Link href="/verify" className="hover:text-white transition-colors">Verify</Link>
                    <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
                    <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
                </div>
                <p className="text-white/20 text-xs">&copy; 2026 CVBER</p>
            </div>
        </footer>
    );
}

// ─── PAGE ───────────────────────────────────────────

export default function Home() {
    return (
        <main className="bg-black min-h-screen">
            <Hero />
            <AboutSection />
            <FeaturedPaintingSection />
            <PhilosophySection />
            <ServicesSection />
            <Footer />
        </main>
    );
}
