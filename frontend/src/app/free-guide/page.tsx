"use client";

import { useState } from "react";
import Link from "next/link";

export default function FreeGuide() {
    const [email, setEmail] = useState("");
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (email) {
            setSubmitted(true);
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white pt-32 pb-20 px-6">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-16">
                    <p className="text-purple-400 text-sm font-bold uppercase tracking-widest mb-4">Free Download</p>
                    <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6 leading-tight">The Complete Art Protection Guide</h1>
                    <p className="text-xl text-zinc-400 max-w-2xl mx-auto">7 proven methods to protect your digital art from AI scraping, theft, and unauthorized use. Free PDF guide.</p>
                </div>

                {/* Guide Contents */}
                <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 mb-12">
                    <h2 className="text-2xl font-bold mb-6">What&apos;s Inside</h2>
                    <div className="space-y-4">
                        <div className="flex items-start gap-4">
                            <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold text-sm shrink-0">1</div>
                            <div>
                                <h3 className="font-bold">C2PA Certificates Explained</h3>
                                <p className="text-zinc-400 text-sm">What they are, why they matter, and how to get one free</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold text-sm shrink-0">2</div>
                            <div>
                                <h3 className="font-bold">DMCA Takedown Template</h3>
                                <p className="text-zinc-400 text-sm">Ready-to-use legal template for filing takedowns</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold text-sm shrink-0">3</div>
                            <div>
                                <h3 className="font-bold">Robots.txt for AI Blocking</h3>
                                <p className="text-zinc-400 text-sm">Copy-paste directives to block AI crawlers</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold text-sm shrink-0">4</div>
                            <div>
                                <h3 className="font-bold">Glaze & Nightshade Setup</h3>
                                <p className="text-zinc-400 text-sm">Step-by-step guide to technical protection</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold text-sm shrink-0">5</div>
                            <div>
                                <h3 className="font-bold">Platform-Specific Protection</h3>
                                <p className="text-zinc-400 text-sm">How to protect on Instagram, TikTok, YouTube, DeviantArt</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold text-sm shrink-0">6</div>
                            <div>
                                <h3 className="font-bold">Legal Rights Checklist</h3>
                                <p className="text-zinc-400 text-sm">Know your rights as a digital artist</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold text-sm shrink-0">7</div>
                            <div>
                                <h3 className="font-bold">AI Training Opt-Out Guide</h3>
                                <p className="text-zinc-400 text-sm">How to remove your art from AI training datasets</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Email Capture Form */}
                <div className="p-8 rounded-3xl bg-gradient-to-br from-purple-600 to-purple-800 text-center">
                    {!submitted ? (
                        <>
                            <h2 className="text-2xl font-bold mb-4">Get the Free Guide</h2>
                            <p className="text-purple-100/70 mb-8">Enter your email and we&apos;ll send the PDF guide instantly.</p>
                            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="your@email.com"
                                    required
                                    className="flex-1 px-6 py-4 rounded-full bg-white/10 border border-white/20 text-white placeholder-purple-200/50 focus:outline-none focus:border-white/40"
                                />
                                <button
                                    type="submit"
                                    className="px-8 py-4 bg-white text-black rounded-full font-bold text-sm uppercase tracking-widest hover:bg-zinc-100 transition-all"
                                >
                                    Send Guide
                                </button>
                            </form>
                            <p className="text-purple-200/40 text-xs mt-4">No spam. Unsubscribe anytime. We respect your inbox.</p>
                        </>
                    ) : (
                        <>
                            <h2 className="text-2xl font-bold mb-4">Guide Sent!</h2>
                            <p className="text-purple-100/70 mb-8">Check your inbox for the PDF guide. It should arrive within 1 minute.</p>
                            <Link href="/gate" className="inline-block px-8 py-4 bg-white text-black rounded-full font-bold text-sm uppercase tracking-widest hover:bg-zinc-100 transition-all">
                                Start Protecting Your Art
                            </Link>
                        </>
                    )}
                </div>

                {/* Internal Links */}
                <div className="mt-16 text-center">
                    <p className="text-zinc-500 mb-4">Want more protection? Try CVBER free:</p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link href="/features" className="text-purple-400 hover:text-purple-300 text-sm">Features</Link>
                        <Link href="/c2pa-certificate" className="text-purple-400 hover:text-purple-300 text-sm">C2PA Certificates</Link>
                        <Link href="/dmca-takedown" className="text-purple-400 hover:text-purple-300 text-sm">DMCA Automation</Link>
                        <Link href="/blog" className="text-purple-400 hover:text-purple-300 text-sm">Blog</Link>
                        <Link href="/cvber-vs-glaze" className="text-purple-400 hover:text-purple-300 text-sm">CVBER vs Glaze</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
