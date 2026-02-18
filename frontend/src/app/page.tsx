'use client';

import Link from 'next/link';
import { Shield, Check, ArrowRight, Upload, Stamp, Award } from 'lucide-react';
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
        <div className="flex flex-col bg-[#0A0A0F]">
            <StructuredData />
            {/* Hero Section */}
            <section className="relative pt-20 pb-24 overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div className="text-left relative z-10">
                            <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-white mb-8 leading-tight">
                                Protect Your <br />
                                <span className="text-purple-500 text-glow">Creative Work</span>
                            </h1>
                            <p className="text-xl text-zinc-400 mb-10 leading-relaxed max-w-xl">
                                Professional AI-powered protection for digital artists, photographers, and creators.
                                Generate certificates of origin, detect AI theft, and automate DMCA takedowns
                                with blockchain-backed security.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <HeroButton />
                                <Link href="/how-it-works" className="btn-secondary text-center">
                                    See How It Works
                                </Link>
                            </div>
                        </div>

                        {/* Certificate Card Preview */}
                        <div className="relative lg:ml-10">
                            <div className="card p-8 bg-[#12121A]/80 backdrop-blur-xl relative z-10 border-purple-500/20">
                                <div className="flex items-center gap-4 mb-8">
                                    <Logo size="md" />
                                    <div>
                                        <h3 className="font-bold text-white">Certificate of Origin</h3>
                                        <p className="text-sm text-zinc-500 font-mono">CVB-2024-001234</p>
                                    </div>
                                </div>
                                <div className="space-y-4 mb-8">
                                    <div className="flex justify-between text-sm py-2 border-b border-zinc-800">
                                        <span className="text-zinc-500">File:</span>
                                        <span className="font-medium text-white">creative-work.jpg</span>
                                    </div>
                                    <div className="flex justify-between text-sm py-2 border-b border-zinc-800">
                                        <span className="text-zinc-500">Protected:</span>
                                        <span className="font-medium text-white">Jan 15, 2024</span>
                                    </div>
                                    <div className="flex justify-between text-sm py-2 border-b border-zinc-800">
                                        <span className="text-zinc-500">Status:</span>
                                        <span className="font-semibold text-purple-400 flex items-center gap-1">
                                            Verified <Check className="w-4 h-4" />
                                        </span>
                                    </div>
                                </div>
                                <div className="aspect-square w-24 mx-auto bg-zinc-900/50 border border-zinc-800 rounded-lg flex items-center justify-center text-[10px] text-zinc-600 font-mono text-center">
                                    QR Code
                                </div>
                            </div>
                            {/* Decorative background circle */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-purple-600/10 rounded-full -z-10 blur-3xl opacity-50 animate-pulse-slow" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-20 bg-[#0D0D14] border-y border-zinc-800/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <span className="text-purple-500 font-bold tracking-widest text-xs uppercase text-glow">Trusted by Creators</span>
                    </div>
                    <div className="grid md:grid-cols-3 gap-12">
                        <div className="text-center">
                            <div className="text-4xl font-extrabold text-white mb-2">10,000+</div>
                            <div className="text-sm text-zinc-500 font-medium">Files Protected</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-extrabold text-purple-500 mb-2">8,500+</div>
                            <div className="text-sm text-zinc-500 font-medium">Certificates Issued</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-extrabold text-white mb-2">2,000+</div>
                            <div className="text-sm text-zinc-500 font-medium">Happy Users</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* QUICK CONFIRMATION BANNER */}
            <div className="bg-purple-600/10 border-y border-purple-500/20 py-4 text-center">
                <span className="text-purple-400 font-bold tracking-widest text-xs uppercase">✨ SEO Update v1.1 - Protection Suite Live</span>
            </div>

            {/* Premium Showcase Gallery - Visual SEO */}
            <section className="py-24 bg-[#0A0A0F]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-white mb-4">Enterprise-Grade Protection for Every Medium</h2>
                        <p className="text-zinc-500 max-w-2xl mx-auto text-lg leading-relaxed">
                            Professional <strong>provenance solutions</strong> for digital artists, photographers, and 3D creators.
                            Verifiable across all platforms.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            { title: 'Digital Art', category: 'Illustration', alt: 'Premium digital art protected with CVBER C2PA provenance signature', color: 'from-purple-500/20' },
                            { title: 'Photography', category: 'Photography', alt: 'High-resolution photography with embedded copyright metadata', color: 'from-blue-500/20' },
                            { title: 'Video content', category: 'Cinematography', alt: 'Professional video clip with blockchain-backed authenticity ID', color: 'from-pink-500/20' },
                            { title: '3D Assets', category: '3D Modeling', alt: 'Verifiable 3D model with ownership attestation', color: 'from-indigo-500/20' }
                        ].map((asset, idx) => (
                            <div key={idx} className="group relative overflow-hidden rounded-2xl bg-zinc-900 border border-zinc-800 p-1">
                                <div className={`aspect-[4/5] rounded-xl bg-gradient-to-b ${asset.color} to-zinc-900 flex items-center justify-center relative overflow-hidden`}>
                                    <Logo size="lg" className="opacity-20 group-hover:opacity-40 transition-opacity scale-150" />
                                    <div role="img" aria-label={asset.alt} title={asset.title} className="absolute inset-0 z-10 cursor-help" />
                                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/0 transition-all duration-500" />
                                </div>
                                <div className="p-4">
                                    <span className="text-[10px] uppercase tracking-widest text-purple-500 font-bold mb-1 block">{asset.category}</span>
                                    <h3 className="text-white font-bold">{asset.title}</h3>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Artist Protection Hub Teaser - High SEO Value */}
            <section className="py-24 bg-[#08080C] border-t border-zinc-800/30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6">Built by Artists, <span className="text-purple-500">For Artists</span></h2>
                    <p className="text-zinc-400 max-w-2xl mx-auto text-lg leading-relaxed mb-16">
                        In subreddits like <strong>r/artbusiness</strong> and <strong>r/DigitalArt</strong>, the conversation is clear:
                        Artists are tired of <strong>AI scraping</strong>, <strong>NFT theft</strong>, and <strong>unauthorized reposts</strong>.
                        Cvber is the technical answer to these systemic problems.
                    </p>

                    <div className="grid md:grid-cols-3 gap-8 text-left mb-16">
                        {[
                            {
                                title: "Stop AI Scraping",
                                desc: "Worried about models training on your style? Our C2PA signatures and technical metadata block bad-actor crawlers.",
                                link: "/faq#ai"
                            },
                            {
                                title: "Report NFT Theft",
                                desc: "Found your art minted without permission? We automate the DMCA process to get stolen assets delisted from marketplaces fast.",
                                link: "/faq#nft"
                            },
                            {
                                title: "Secure Watermarking",
                                desc: "Learn why simple watermarks aren't enough and how embedded digital provenance is the new standard for pros.",
                                link: "/faq#theft"
                            }
                        ].map((box, idx) => (
                            <div key={idx} className="p-8 rounded-2xl bg-[#0F0F16] border border-zinc-800 group hover:border-purple-500/30 transition-all">
                                <h3 className="text-xl font-bold text-white mb-4">{box.title}</h3>
                                <p className="text-zinc-400 text-sm leading-relaxed mb-6">{box.desc}</p>
                                <Link href={box.link} className="inline-flex items-center gap-2 text-purple-400 text-xs font-bold uppercase tracking-widest hover:text-purple-300 transition-colors">
                                    Read Guide <ArrowRight className="w-3 h-3" />
                                </Link>
                            </div>
                        ))}
                    </div>

                    <div className="inline-flex items-center gap-8 p-1 px-1 rounded-2xl bg-zinc-900 border border-zinc-800">
                        <Link href="/faq" className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-10 rounded-xl transition-all shadow-lg shadow-purple-500/20 text-sm">
                            View Full Artist Protection FAQ
                        </Link>
                    </div>
                </div>
            </section>

            {/* Why CVBER Section - Higher visibility for SEO */}
            <section className="py-24 bg-[#08080C] border-b border-zinc-800/30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-3xl font-bold text-white mb-6">Why Professional Creators Choose CVBER</h2>
                            <div className="space-y-6 text-zinc-400 text-lg">
                                <p>
                                    In the age of generative AI, protecting your intellectual property is more critical than ever.
                                    CVBER provides the industry's most robust suite of <strong>content protection tools</strong>
                                    specifically designed for the modern digital landscape.
                                </p>
                                <p>
                                    Our platform leverages the <strong>C2PA (Coalition for Content Provenance and Authenticity)</strong>
                                    standard, used by companies like Adobe and Microsoft, to ensure your work carries its
                                    originality data wherever it goes on the web.
                                </p>
                                <ul className="space-y-3">
                                    <li className="flex items-start gap-3">
                                        <Check className="w-5 h-5 text-purple-500 mt-1" />
                                        <span><strong>AI Theft Detection:</strong> Monitor platforms for unauthorized AI training and remixing.</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <Check className="w-5 h-5 text-purple-500 mt-1" />
                                        <span><strong>Automated DMCA:</strong> Generate legally-compliant takedown notices in seconds.</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <Check className="w-5 h-5 text-purple-500 mt-1" />
                                        <span><strong>Digital Provenance:</strong> Cryptographic proof of ownership for every file.</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            {[
                                { title: 'Digital Art', desc: 'Secure your illustrations and concept art.' },
                                { title: 'Photography', desc: 'Embed provenance in high-res images.' },
                                { title: 'Video Content', desc: 'Protect your clips with digital IDs.' },
                                { title: '3D Assets', desc: 'Verify ownership of complex 3D models.' }
                            ].map((item, idx) => (
                                <div key={idx} className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 hover:border-purple-500/50 transition-colors">
                                    <h4 className="text-white font-bold mb-2">{item.title}</h4>
                                    <p className="text-xs text-zinc-500">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>


            {/* How It Works Section */}
            <section id="how-it-works" className="py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-4xl font-bold text-white mb-4 text-balance">How It Works</h2>
                        <p className="text-lg text-zinc-400">Protect your files in three simple steps</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-12">
                        {[
                            { step: '01', title: 'Upload Your File', desc: 'Drag and drop your images or PDFs into our secure upload interface.', icon: Upload },
                            { step: '02', title: 'Apply Watermark', desc: 'Customize your watermark text, position, and opacity to protect your work.', icon: Stamp },
                            { step: '03', title: 'Get Certificate', desc: 'Receive a unique certificate of origin with a verifiable CVB ID and download link.', icon: Award }
                        ].map((item, idx) => (
                            <div key={idx} className="relative group">
                                <div className="text-6xl font-black text-purple-500/5 absolute -top-8 -left-2 z-0 group-hover:text-purple-500/10 transition-colors">{item.step}</div>
                                <div className="relative z-10 pt-4">
                                    <h3 className="text-xl font-bold text-white mb-4">{item.title}</h3>
                                    <p className="text-zinc-500 mb-6 leading-relaxed">
                                        {item.desc}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>


            {/* Call to Action Section */}
            <section className="py-20 px-4">
                <div className="max-w-5xl mx-auto bg-purple-600 rounded-3xl p-12 text-center text-white relative overflow-hidden shadow-2xl shadow-purple-500/20">
                    <div className="relative z-10">
                        <h2 className="text-4xl font-bold mb-6">Start Protecting Your Work Today</h2>
                        <p className="text-purple-100 mb-10 max-w-xl mx-auto text-lg leading-relaxed">
                            Join thousands of creators who trust Cvber to protect their creative work with certificates of origin.
                        </p>
                        <Link href="/register" className="inline-flex items-center gap-2 bg-white text-purple-600 hover:bg-purple-50 font-bold py-4 px-10 rounded-xl transition-all shadow-lg active:scale-95 group">
                            Get Started <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
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

