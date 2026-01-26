'use client';

import Link from 'next/link';
import { Shield, Check, ArrowRight, Upload, Stamp, Award } from 'lucide-react';
import { useEffect, useState } from 'react';

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
                                Generate certificates of origin for your files. Add custom
                                watermarks and verify authenticity instantly with
                                blockchain-level security.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <HeroButton />
                                <Link href="/#how-it-works" className="btn-secondary text-center">
                                    See How It Works
                                </Link>
                            </div>
                        </div>

                        {/* Certificate Card Preview */}
                        <div className="relative lg:ml-10">
                            <div className="card p-8 bg-[#12121A]/80 backdrop-blur-xl relative z-10 border-purple-500/20">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                                        <Shield className="w-6 h-6" />
                                    </div>
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
                        <Shield className="w-64 h-64 -mr-20 -mt-20" />
                    </div>
                </div>
            </section>
        </div>
    );
}

