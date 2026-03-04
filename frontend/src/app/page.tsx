'use client';

import Link from 'next/link';
import { Shield, Check, ArrowRight, Upload, Stamp, Award, Flame, Zap, MousePointer2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import Logo from '@/components/common/Logo';
import StructuredData from '@/components/seo/StructuredData';

function HeroButton() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        setIsLoggedIn(!!localStorage.getItem('access_token'));
    }, []);

    if (isLoggedIn) {
        return (
            <Link href="/dashboard" className="btn-primary text-center">
                Go to Dashboard
            </Link>
        );
    }
    return (
        <Link href="/register" className="btn-primary text-center">
            Get Started
        </Link>
    );
}

export default function Home() {
    return (
        <div className="flex flex-col bg-black min-h-screen font-sans selection:bg-purple-500/30">
            <StructuredData />

            {/* Cinematic Full-Screen Hero */}
            <section className="relative h-screen min-h-[800px] flex flex-col justify-between overflow-hidden">
                {/* Background Image & Overlays */}
                <div className="absolute inset-0 z-0 select-none pointer-events-none">
                    <img
                        src="/cinematic-bg.png"
                        alt="Cinematic Cyber Defense Background"
                        className="w-full h-full object-cover object-center scale-105"
                    />
                    {/* Dark gradient overlay for text legibility */}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/30"></div>
                </div>

                {/* Top Navigation (Absolute floating) */}
                <nav className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-6">
                    <div className="flex items-center">
                        <Logo size="md" className="text-white hover:text-white/80 transition-colors" />
                    </div>
                    {/* Center Glass Pill Nav */}
                    <div className="hidden md:flex items-center gap-8 px-8 py-3 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-sm font-medium text-zinc-300">
                        <Link href="/" className="text-white hover:text-purple-400 transition-colors">Home</Link>
                        <Link href="/product" className="hover:text-white transition-colors">Product</Link>
                        <div className="flex items-center gap-1 cursor-pointer hover:text-white transition-colors">
                            Features <span className="text-[10px] opacity-50">▼</span>
                        </div>
                        <Link href="/tech" className="hover:text-white transition-colors">Tech</Link>
                        <Link href="/about" className="hover:text-white transition-colors">About</Link>
                    </div>
                    <div>
                        <Link href="/register" className="px-6 py-2.5 rounded-full bg-white text-black text-sm font-bold hover:bg-zinc-200 transition-colors">
                            Sign Up
                        </Link>
                    </div>
                </nav>

                {/* Main Hero Content Container */}
                <div className="relative z-10 flex-1 flex items-center px-8 md:px-16 w-full max-w-[1600px] mx-auto">

                    {/* Left Split: Typography and CTAs */}
                    <div className="max-w-2xl w-full">

                        {/* Status Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 backdrop-blur-md border border-white/20 mb-8 mt-20 opacity-0 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                            <span className="flex w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            <span className="text-xs font-semibold text-white tracking-wide">100k+ Protected Creators</span>
                        </div>

                        {/* Massive Headline */}
                        <h1 className="text-5xl md:text-7xl lg:text-[80px] font-semibold text-white tracking-tight leading-[1.05] mb-6 opacity-0 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
                            Digital Ownership<br />
                            Redefined Forever
                        </h1>

                        {/* Subtext */}
                        <p className="text-lg md:text-xl text-zinc-300 font-medium mb-10 max-w-xl leading-relaxed opacity-0 animate-fade-in-up" style={{ animationDelay: '600ms' }}>
                            Deploy the world's most advanced digital defense. Neural-net monitoring, zero-knowledge proofs, automated DMCA takedowns, and seamless AI integration.
                        </p>

                        {/* Dual CTAs */}
                        <div className="flex flex-wrap items-center gap-4 opacity-0 animate-fade-in-up" style={{ animationDelay: '800ms' }}>
                            <Link href="/register" className="px-8 py-3.5 rounded-full bg-white text-black font-semibold tracking-wide hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:shadow-[0_0_40px_rgba(255,255,255,0.4)]">
                                Secure Your Art
                            </Link>
                            <button className="flex items-center gap-2 px-8 py-3.5 rounded-full bg-white/5 backdrop-blur-md border border-white/20 text-white font-semibold tracking-wide hover:bg-white/10 transition-colors group">
                                Watch Demo
                                <span className="flex items-center justify-center w-5 h-5 rounded-full border border-white/40 group-hover:bg-white group-hover:text-black transition-colors pl-0.5 text-[10px]">
                                    ▶
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* Right Split: Floating Feature Card */}
                    <div className="hidden lg:flex flex-1 justify-end opacity-0 animate-fade-in-up" style={{ animationDelay: '1000ms' }}>
                        <div className="max-w-xs p-6 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.5)] transform translate-y-[-10%] hover:border-white/20 hover:-translate-y-[12%] transition-all duration-500">
                            <h3 className="text-white font-bold text-lg mb-2">CVBER Neural Ultra</h3>
                            <p className="text-sm text-zinc-400 leading-relaxed font-medium">
                                Premium invisible watermarking, ultra-sharp neural net tracking, often with quantum-friendly neon accents in our defense algorithms.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Bottom Glassmorphic Stats Bar */}
                <div className="relative z-20 w-full border-t border-white/10 bg-black/20 backdrop-blur-2xl px-8 py-8 md:py-10 opacity-0 animate-fade-in-up" style={{ animationDelay: '1200ms' }}>
                    <div className="max-w-[1600px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 divide-x divide-transparent md:divide-white/10">

                        <div className="flex flex-col items-center md:items-start md:px-8 text-center md:text-left">
                            <span className="text-3xl lg:text-4xl font-bold text-white mb-2">24%</span>
                            <span className="text-xs text-zinc-400 font-medium uppercase tracking-widest leading-tight">Theft Reduction<br />in 2026</span>
                        </div>

                        <div className="flex flex-col items-center md:items-start md:px-8 text-center md:text-left border-white/10 border-l md:border-l-0 pl-8 md:pl-0">
                            <span className="text-3xl lg:text-4xl font-bold text-white mb-2">10K+</span>
                            <span className="text-xs text-zinc-400 font-medium uppercase tracking-widest leading-tight">Digital Assets<br />Secured Globally</span>
                        </div>

                        <div className="flex flex-col items-center md:items-start md:px-8 text-center md:text-left border-t border-white/10 md:border-t-0 pt-8 md:pt-0 mt-4 md:mt-0">
                            <span className="text-3xl lg:text-4xl font-bold text-zinc-300 mb-2">50K+</span>
                            <span className="text-xs text-zinc-400 font-medium uppercase tracking-widest leading-tight">AI Scraping Bots<br />Blocked Daily</span>
                        </div>

                        <div className="flex flex-col items-center md:items-start md:px-8 text-center md:text-left border-t border-l border-white/10 md:border-t-0 pt-8 md:pt-0 mt-4 md:mt-0 pl-8 md:pl-0">
                            <span className="text-3xl lg:text-4xl font-bold text-zinc-300 mb-2">99.9%</span>
                            <span className="text-xs text-zinc-400 font-medium uppercase tracking-widest leading-tight">Uptime &<br />Reliability SLA</span>
                        </div>

                    </div>
                </div>
            </section>

            {/* Why Digital Art Theft Is Worse Than Ever in 2026 */}
            <section className="py-24 bg-[#08080C] border-y border-zinc-800/30">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl lg:text-5xl font-bold text-white mb-8 text-center">Why Digital Art Theft Is Worse Than Ever in 2026</h2>
                    <div className="prose prose-invert prose-purple max-w-none text-zinc-400 text-lg leading-relaxed space-y-6">
                        <p>
                            The landscape of digital ownership has shifted dramatically. With the explosion of generative AI,
                            artists are facing unprecedented challenges. It's no longer just about someone right-clicking and
                            saving your image; it's about large-scale <strong>AI scraping</strong> where your lifetime of work
                            is ingested into training sets without your permission or compensation.
                        </p>
                        <p>
                            Social media platforms have become a double-edged sword. While they offer visibility, they also
                            act as a primary source for <strong>unauthorized reposts</strong> and <strong>NFT fraud</strong>.
                            Stolen art is being minted as NFTs on various marketplaces, often before the original creator
                            even knows it's been taken. This "digital wild west" requires professional-grade tools to navigate.
                        </p>
                        <p>
                            In 2026, the cost of inaction is high. Without a verifiable <strong>digital provenance</strong>,
                            proving you are the original creator of a work can be nearly impossible once it has been
                            stripped of metadata and circulated online. This is why thousands of creators are turning
                            to technical solutions like CVBER to reclaim control over their intellectual property.
                        </p>
                    </div>
                </div>
            </section>

            {/* 5 Ways to Protect Your Art Section */}
            <section className="py-24 bg-[#0A0A0F]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl lg:text-5xl font-bold text-white mb-16 text-center">5 Ways to Protect Your Art from Being Stolen Online</h2>

                    <div className="space-y-24">
                        {/* 1. Register Copyright */}
                        <div className="grid md:grid-cols-2 gap-12 items-center">
                            <div>
                                <h3 className="text-2xl font-bold text-white mb-4">1. Register Copyright & Get a Certificate of Origin</h3>
                                <p className="text-zinc-400 text-lg leading-relaxed mb-6">
                                    Legal protection starts with proof. While copyright exists from the moment of creation,
                                    having a <strong>Certificate of Origin</strong> provides a crytographically-signed,
                                    blockchain-backed record of exactly when your work was created. This acts as
                                    irrefutable evidence in legal disputes or DMCA takedown requests.
                                </p>
                                <ul className="space-y-3 text-zinc-500">
                                    <li className="flex items-center gap-2"><Check className="w-5 h-5 text-purple-500" /> Permanent digital record</li>
                                    <li className="flex items-center gap-2"><Check className="w-5 h-5 text-purple-500" /> Blockchain-verified timestamps</li>
                                    <li className="flex items-center gap-2"><Check className="w-5 h-5 text-purple-500" /> Easy-to-share verification links</li>
                                </ul>
                            </div>
                            <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 flex items-center justify-center">
                                <Award className="w-32 h-32 text-purple-500 opacity-20" aria-label="Ownership Award Icon" />
                            </div>
                        </div>

                        {/* 2. Detect AI Scraping */}
                        <div className="grid md:grid-cols-2 gap-12 items-center">
                            <div className="order-2 md:order-1 bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 flex items-center justify-center">
                                <Shield className="w-32 h-32 text-purple-500 opacity-20" aria-label="Security Shield Icon" />
                            </div>
                            <div className="order-1 md:order-2">
                                <h3 className="text-2xl font-bold text-white mb-4">2. Detect AI Scraping Before It Happens</h3>
                                <p className="text-zinc-400 text-lg leading-relaxed mb-6">
                                    Prevention is better than cure. By using specialized metadata and <strong>C2PA signatures</strong>,
                                    you can signal to ethical crawlers that your work is not for training. Furthermore,
                                    advanced technical guards can make your art harder for AI models to interpret correctly
                                    without affecting the visual quality for human viewers.
                                </p>
                                <ul className="space-y-3 text-zinc-500">
                                    <li className="flex items-center gap-2"><Check className="w-5 h-5 text-purple-500" /> C2PA Content Credentials</li>
                                    <li className="flex items-center gap-2"><Check className="w-5 h-5 text-purple-500" /> AI-training opt-out signals</li>
                                    <li className="flex items-center gap-2"><Check className="w-5 h-5 text-purple-500" /> Bot-detection integration</li>
                                </ul>
                            </div>
                        </div>

                        {/* 3. Send Automated DMCA Takedown Notices */}
                        <div className="grid md:grid-cols-2 gap-12 items-center">
                            <div>
                                <h3 className="text-2xl font-bold text-white mb-4">3. Send Automated DMCA Takedown Notices</h3>
                                <p className="text-zinc-400 text-lg leading-relaxed mb-6">
                                    When theft occurs, you need to act fast. Filing manual DMCA notices for every infringement
                                    is a full-time job. <strong>Automated DMCA tools</strong> allow you to generate
                                    and send legally-compliant notices to ISPs and platforms in seconds, significantly
                                    increasing your success rate in getting stolen content removed.
                                </p>
                                <ul className="space-y-3 text-zinc-500">
                                    <li className="flex items-center gap-2"><Check className="w-5 h-5 text-purple-500" /> 1-click legal notice generation</li>
                                    <li className="flex items-center gap-2"><Check className="w-5 h-5 text-purple-500" /> Direct integration with platforms</li>
                                    <li className="flex items-center gap-2"><Check className="w-5 h-5 text-purple-500" /> Legal compliance tracking</li>
                                </ul>
                            </div>
                            <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 flex items-center justify-center">
                                <Logo size="lg" className="opacity-20" alt="CVBER logo graphic for automated DMCA" />
                            </div>
                        </div>

                        {/* 4. Embed C2PA Digital Provenance */}
                        <div className="grid md:grid-cols-2 gap-12 items-center">
                            <div className="order-2 md:order-1 bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 flex items-center justify-center">
                                <Stamp className="w-32 h-32 text-purple-500 opacity-20" aria-label="Provenance Stamp Icon" />
                            </div>
                            <div className="order-1 md:order-2">
                                <h3 className="text-2xl font-bold text-white mb-4">4. Embed C2PA Digital Provenance in Every File</h3>
                                <p className="text-zinc-400 text-lg leading-relaxed mb-6">
                                    Standard EXIF data is easily stripped. The <strong>C2PA standard</strong> creates
                                    a persistent, verifiable link between the creator and the content. Even if the
                                    file is cropped, screenshotted, or edited, the digital provenance remains part
                                    of the manifest, allowing anyone to verify the true source of the work.
                                </p>
                                <ul className="space-y-3 text-zinc-500">
                                    <li className="flex items-center gap-2"><Check className="w-5 h-5 text-purple-500" /> Immutable metadata manifests</li>
                                    <li className="flex items-center gap-2"><Check className="w-5 h-5 text-purple-500" /> Cross-platform interoperability</li>
                                    <li className="flex items-center gap-2"><Check className="w-5 h-5 text-purple-500" /> Adobe & Microsoft backed standard</li>
                                </ul>
                            </div>
                        </div>

                        {/* 5. Monitor Social Media */}
                        <div className="grid md:grid-cols-2 gap-12 items-center">
                            <div>
                                <h3 className="text-2xl font-bold text-white mb-4">5. Monitor Social Media & NFT Marketplaces for Your Art</h3>
                                <p className="text-zinc-400 text-lg leading-relaxed mb-6">
                                    You can't protect what you don't see. Constant monitoring of Instagram, Twitter,
                                    OpenSea, and other hotspots for <strong>art theft</strong> is essential.
                                    AI-powered visual search tools can scan millions of images to find matches
                                    for your protected assets, alerting you the moment an infringement is detected.
                                </p>
                                <ul className="space-y-3 text-zinc-500">
                                    <li className="flex items-center gap-2"><Check className="w-5 h-5 text-purple-500" /> 24/7 automated web scanning</li>
                                    <li className="flex items-center gap-2"><Check className="w-5 h-5 text-purple-500" /> Visual similarity detection</li>
                                    <li className="flex items-center gap-2"><Check className="w-5 h-5 text-purple-500" /> Real-time threat alerts</li>
                                </ul>
                            </div>
                            <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 flex items-center justify-center">
                                <Shield className="w-32 h-32 text-purple-500 opacity-20" aria-label="Monitoring Shield Icon" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* How CVBER Protects Every Type of Creative Work */}
            <section className="py-24 bg-[#08080C] border-y border-zinc-800/30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6">How CVBER Protects Your Creative Work</h2>
                        <p className="text-zinc-400 max-w-2xl mx-auto text-lg leading-relaxed">
                            Whether you're a concept artist at a major studio or a freelance photographer,
                            CVBER provides the enterprise-grade <strong>content security</strong> you need.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            { title: 'Digital Art', desc: 'Secure your illustrations, character designs, and concept art from AI scraping and NFT fraud.', alt: 'digital art copyright certificate for artists using CVBER' },
                            { title: 'Photography', desc: 'Professional provenance for high-resolution photography. Protect your portfolio from unauthorized use.', alt: 'photography copyright protection tools powered by AI' },
                            { title: 'Video Content', desc: 'Verify the authenticity of your video clips and animations with embedded digital IDs.', alt: 'video copyright and provenance verification display' },
                            { title: '3D Assets', desc: 'Technical ownership verification for complex 3D models and digital environments.', alt: '3D model ownership verification and C2PA signature' }
                        ].map((asset, idx) => (
                            <div key={idx} className="p-8 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-purple-500/30 transition-all">
                                <h3 className="text-xl font-bold text-white mb-4">{asset.title}</h3>
                                <p className="text-zinc-500 text-sm leading-relaxed mb-6">{asset.desc}</p>
                                <div role="img" aria-label={asset.alt} className="w-full aspect-video bg-zinc-800/50 rounded-lg flex items-center justify-center">
                                    <Logo size="sm" className="opacity-10" alt={`Logo icon for ${asset.title} protection`} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* What to Do If Your Art Has Already Been Stolen */}
            <section className="py-24 bg-[#0A0A0F]">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl lg:text-5xl font-bold text-white mb-8 text-center">What to Do If Your Art Has Already Been Stolen</h2>
                    <div className="space-y-8">
                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8">
                            <h3 className="text-xl font-bold text-white mb-4">Step 1: Document the Infringement</h3>
                            <p className="text-zinc-400 leading-relaxed">
                                Don't wait. Take screenshots of the infringing post, including the URL, the date,
                                and any profile information of the person who posted it. This documentation is
                                crucial for any future legal action or talkdown requests.
                            </p>
                        </div>
                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8">
                            <h3 className="text-xl font-bold text-white mb-4">Step 2: Verify Your Ownership</h3>
                            <p className="text-zinc-400 leading-relaxed">
                                Use your CVBER <strong>Certificate of Origin</strong> to prove you created the work
                                first. If you haven't protected the work yet, gather your original source files
                                (PSDs, RAW files, etc.) which contain metadata and layers that are hard for
                                thieves to replicate.
                            </p>
                        </div>
                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8">
                            <h3 className="text-xl font-bold text-white mb-4">Step 3: Issue a DMCA Takedown</h3>
                            <p className="text-zinc-400 leading-relaxed">
                                Use CVBER's automated tools to generate a formal DMCA notice. Send this to the
                                platform's legal department (e.g., Instagram's IP report form or OpenSea's
                                takedown system). Most major platforms are required by law to respond to
                                valid copyright notices.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section id="faq" className="py-24 bg-[#08080C] border-t border-zinc-800/30">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl lg:text-5xl font-bold text-white mb-16 text-center">Frequently Asked Questions About Art Protection</h2>
                    <div className="space-y-6">
                        {[
                            {
                                q: "How do I protect my digital art from being stolen online?",
                                a: "Use a combination of copyright registration, digital watermarking, C2PA provenance certificates, and automated DMCA monitoring tools like CVBER to protect your art across all platforms. Proactive protection is much more effective than reactive legal action."
                            },
                            {
                                q: "What is a Certificate of Origin for art?",
                                a: "A Certificate of Origin is a cryptographically-signed document that proves you created a specific artwork at a specific time. CVBER uses blockchain-backed metadata to ensure these certificates are verifiable and immutable, providing strong evidence of authorship."
                            },
                            {
                                q: "How do I report stolen NFT art?",
                                a: "File a DMCA takedown with the NFT marketplace (like OpenSea or Rarible), report to the platform's IP team, and use tools like CVBER to automate the delisting process. Marketplace operators are generally responsive to well-documented copyright infringement claims."
                            },
                            {
                                q: "Can AI companies train on my artwork without permission?",
                                a: "Currently this is a legal gray area, but you can opt out of AI training datasets and use C2PA signatures to signal that your work should not be scraped. CVBER helps embed these signals directly into your files' metadata."
                            },
                            {
                                q: "How to prove you made something first?",
                                a: "The best way to prove authorship is through third-party verification. By generating a digital certificate at the moment of completion, you establish a public record of your work's existence and your ownership, which is much stronger than just holding the original file."
                            },
                            {
                                q: "Is watermarking enough to stop art theft?",
                                a: "No. Simple watermarks can be easily removed using AI-powered tools. Professional protection requires a multi-layered approach involving embedded provenance, technical security guards, and active monitoring for infringements."
                            }
                        ].map((item, idx) => (
                            <div key={idx} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
                                <h4 className="text-xl font-bold text-white mb-4">{item.q}</h4>
                                <p className="text-zinc-500 leading-relaxed">{item.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Call to Action Section */}
            <section className="py-20 px-4">
                <div className="max-w-5xl mx-auto bg-purple-600 rounded-3xl p-12 text-center text-white relative overflow-hidden shadow-2xl shadow-purple-500/20">
                    <div className="relative z-10">
                        <h2 className="text-4xl font-bold mb-6">Start Protecting Your Art Today</h2>
                        <p className="text-purple-100 mb-10 max-w-xl mx-auto text-lg leading-relaxed">
                            Join thousands of creators who trust CVBER to protect their creative work with
                            AI-powered security and digital certificates of origin.
                        </p>
                        <Link href="/register" className="inline-flex items-center gap-2 bg-white text-purple-600 hover:bg-purple-50 font-bold py-4 px-10 rounded-xl transition-all shadow-lg active:scale-95 group">
                            Get Started for Free <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                        <Logo size="xl" className="scale-[3]" />
                    </div>
                </div>
            </section>
        </div>
    );
}

