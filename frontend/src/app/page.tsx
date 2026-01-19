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
        <div className="flex flex-col">
            {/* Hero Section */}
            <section className="relative pt-20 pb-24 overflow-hidden bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div className="text-left">
                            <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-gray-900 mb-8 leading-tight">
                                Protect Your <br />
                                <span className="text-blue-600">Creative Work</span>
                            </h1>
                            <p className="text-xl text-gray-600 mb-10 leading-relaxed max-w-xl">
                                Generate certificates of origin for your files. Add custom
                                watermarks and verify authenticity instantly with
                                blockchain-level security.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                {/* Enhanced Get Started Button - uses client-side logic in a separate component would be best, but for simplicity: */}
                                <HeroButton />
                                <Link href="/#how-it-works" className="btn-secondary text-center">
                                    See How It Works
                                </Link>
                            </div>
                        </div>

                        {/* Certificate Card Preview */}
                        <div className="relative lg:ml-10">
                            <div className="card p-8 bg-gray-50/50 backdrop-blur-sm relative z-10 border-blue-100">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                                        <Shield className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">Certificate of Origin</h3>
                                        <p className="text-sm text-gray-500 font-mono">CVB-2024-001234</p>
                                    </div>
                                </div>
                                <div className="space-y-4 mb-8">
                                    <div className="flex justify-between text-sm py-2 border-b border-gray-100">
                                        <span className="text-gray-500">File:</span>
                                        <span className="font-medium text-gray-900">creative-work.jpg</span>
                                    </div>
                                    <div className="flex justify-between text-sm py-2 border-b border-gray-100">
                                        <span className="text-gray-500">Protected:</span>
                                        <span className="font-medium text-gray-900">Jan 15, 2024</span>
                                    </div>
                                    <div className="flex justify-between text-sm py-2 border-b border-gray-100">
                                        <span className="text-gray-500">Status:</span>
                                        <span className="font-semibold text-green-600 flex items-center gap-1">
                                            Verified <Check className="w-4 h-4" />
                                        </span>
                                    </div>
                                </div>
                                <div className="aspect-square w-24 mx-auto bg-gray-200 rounded-lg flex items-center justify-center text-[10px] text-gray-400 font-mono text-center">
                                    QR Code
                                </div>
                            </div>
                            {/* Decorative background circle */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-blue-50 rounded-full -z-10 blur-3xl opacity-50" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-20 bg-gray-50 border-y border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <span className="text-blue-600 font-bold tracking-widest text-xs uppercase">Trusted by Creators</span>
                    </div>
                    <div className="grid md:grid-cols-3 gap-12">
                        <div className="text-center">
                            <div className="text-4xl font-extrabold text-blue-600 mb-2">10,000+</div>
                            <div className="text-sm text-gray-500 font-medium">Files Protected</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-extrabold text-blue-600 mb-2">8,500+</div>
                            <div className="text-sm text-gray-500 font-medium">Certificates Issued</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-extrabold text-blue-600 mb-2">2,000+</div>
                            <div className="text-sm text-gray-500 font-medium">Happy Users</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section id="how-it-works" className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4 text-balance">How It Works</h2>
                        <p className="text-lg text-gray-600">Protect your files in three simple steps</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-12">
                        {[
                            { step: '01', title: 'Upload Your File', desc: 'Drag and drop your images or PDFs into our secure upload interface.', icon: Upload },
                            { step: '02', title: 'Apply Watermark', desc: 'Customize your watermark text, position, and opacity to protect your work.', icon: Stamp },
                            { step: '03', title: 'Get Certificate', desc: 'Receive a unique certificate of origin with a verifiable CVB ID and download link.', icon: Award }
                        ].map((item, idx) => (
                            <div key={idx} className="relative">
                                <div className="text-6xl font-black text-blue-50/80 absolute -top-8 -left-2 z-0">{item.step}</div>
                                <div className="relative z-10 pt-4">
                                    <h3 className="text-xl font-bold text-gray-900 mb-4">{item.title}</h3>
                                    <p className="text-gray-600 mb-6 leading-relaxed">
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
                <div className="max-w-5xl mx-auto bg-blue-600 rounded-3xl p-12 text-center text-white relative overflow-hidden shadow-xl shadow-blue-200">
                    <div className="relative z-10">
                        <h2 className="text-4xl font-bold mb-6">Start Protecting Your Work Today</h2>
                        <p className="text-blue-100 mb-10 max-w-xl mx-auto text-lg leading-relaxed">
                            Join thousands of creators who trust Cvber to protect their creative work with certificates of origin.
                        </p>
                        <Link href="/register" className="inline-flex items-center gap-2 bg-white text-blue-600 hover:bg-blue-50 font-bold py-4 px-10 rounded-xl transition-all shadow-lg active:scale-95 group">
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

