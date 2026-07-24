import React from 'react';
import { Shield, Lock, Eye, FileText, Trash2 } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Privacy Policy',
    description: 'CVBER privacy policy. Learn how we protect your data, artwork, and personal information. We never sell your data or use your art for AI training.',
    alternates: { canonical: 'https://cvber.vercel.app/privacy' },
};

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-black text-white pt-32 pb-20 px-6">
            <div className="max-w-4xl mx-auto">
                <header className="mb-16 pb-10 border-b border-white/[0.08]">
                    <Link href="/" className="tag mb-8 block">Back to Home</Link>
                    <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 leading-tight">
                        Privacy Policy
                    </h1>
                    <p className="text-white/40 font-sans">Last Updated: April 19, 2026</p>
                    <div className="mt-8 flex items-center gap-3 text-white/60">
                        <Shield className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-ultra-wide font-sans">Your Art, Your Choice.</span>
                    </div>
                </header>

                <section className="space-y-16">
                    <div>
                        <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-4">
                            <Lock className="w-5 h-5 text-white/60" />
                            1. Data Collection & Usage
                        </h2>
                        <p className="text-white/40 font-sans text-sm leading-relaxed mb-6">
                            CVBER is designed with a privacy-first mindset. We only collect the data necessary to provide our art protection services:
                        </p>
                        <ul className="space-y-3 font-sans text-sm text-white/40">
                            <li className="flex gap-3"><span className="text-white/60 shrink-0">•</span> <span><strong className="text-white">User Account Info:</strong> Email address and name used for registration via Supabase Auth.</span></li>
                            <li className="flex gap-3"><span className="text-white/60 shrink-0">•</span> <span><strong className="text-white">Art Ownership Data:</strong> File names, hashes, and metadata for C2PA certificate generation.</span></li>
                            <li className="flex gap-3"><span className="text-white/60 shrink-0">•</span> <span><strong className="text-white">Uploaded Media:</strong> Images uploaded for watermarking or certification.</span></li>
                        </ul>
                    </div>

                    <div className="bg-[#0a0a0a] border border-white/[0.08] p-8 md:p-10">
                        <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-4">
                            <Trash2 className="w-5 h-5 text-white/60" />
                            2. Data Retention (Zero-Persistence)
                        </h2>
                        <p className="text-white/40 font-sans text-sm leading-relaxed mb-6 italic">
                            &ldquo;Your image stays on our server for exactly as long as it takes to protect it.&rdquo;
                        </p>
                        <p className="text-white/40 font-sans text-sm mb-6">
                            We follow a strict zero-persistence policy for uploaded art:
                        </p>
                        <div className="space-y-6">
                            <div className="flex gap-5">
                                <div className="w-10 h-10 rounded-full border border-white/[0.15]/20 flex items-center justify-center shrink-0">
                                    <Shield className="w-4 h-4 text-white/60" />
                                </div>
                                <div>
                                    <h4 className="text-base font-bold text-white mb-2">Immediate Deletion</h4>
                                    <p className="text-white/40 font-sans text-xs leading-relaxed">Images uploaded for C2PA certification or watermarking are deleted immediately after the processed file is served back to you. We do not store your original high-resolution art on our servers.</p>
                                </div>
                            </div>
                            <div className="flex gap-5">
                                <div className="w-10 h-10 rounded-full border border-white/[0.15]/20 flex items-center justify-center shrink-0">
                                    <Shield className="w-4 h-4 text-white/60" />
                                </div>
                                <div>
                                    <h4 className="text-base font-bold text-white mb-2">30-Day Registry</h4>
                                    <p className="text-white/40 font-sans text-xs leading-relaxed">Metadata and transaction hashes (not the images) are stored for 30 days in our audit trail to support DMCA disputes, after which they are archived or deleted based on user preference.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-4">
                            <Eye className="w-5 h-5 text-white/60" />
                            3. AI Service Disclosure
                        </h2>
                        <p className="text-white/40 font-sans text-sm leading-relaxed mb-6">
                            To provide advanced art theft detection and metadata analysis, we use third-party AI processors:
                        </p>
                        <ul className="space-y-3 font-sans text-sm text-white/40">
                            <li className="flex gap-3"><span className="text-white/60 shrink-0">•</span> <span><strong className="text-white">Google Vertex AI & Gemini:</strong> Used for deep visual analysis and metadata enrichment.</span></li>
                            <li className="flex gap-3"><span className="text-white/60 shrink-0">•</span> <span><strong className="text-white">Groq:</strong> Used for high-speed forensic classification.</span></li>
                        </ul>
                        <p className="text-white/40/60 font-sans text-xs mt-4">
                            None of these providers are permitted to use your uploaded art to train their models through our integration.
                        </p>
                    </div>

                    <div className="pt-8 border-t border-white/[0.08] text-center">
                        <p className="text-white/40/40 font-sans text-xs">
                            For any privacy-related requests: <a href="mailto:support@cvber.app" className="text-white/60 hover:text-white/60Light transition-colors">support@cvber.app</a>
                        </p>
                    </div>
                </section>
            </div>
        </div>
    );
}
