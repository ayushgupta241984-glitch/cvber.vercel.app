import React from 'react';
import { Shield, Lock, Eye, FileText, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-gallery-black text-luxury-cream pt-32 pb-20 px-6">
            <div className="max-w-4xl mx-auto">
                <header className="mb-16 pb-10 border-b border-gallery-border">
                    <Link href="/" className="tag mb-8 block">Back to Home</Link>
                    <h1 className="font-display text-5xl md:text-6xl font-bold text-luxury-cream mb-4 leading-tight">
                        Privacy Policy
                    </h1>
                    <p className="text-luxury-muted font-sans">Last Updated: April 19, 2026</p>
                    <div className="mt-8 flex items-center gap-3 text-luxury-gold">
                        <Shield className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-ultra-wide font-sans">Your Art, Your Choice.</span>
                    </div>
                </header>

                <section className="space-y-16">
                    <div>
                        <h2 className="font-display text-3xl font-bold text-luxury-cream mb-6 flex items-center gap-4">
                            <Lock className="w-5 h-5 text-luxury-gold" />
                            1. Data Collection & Usage
                        </h2>
                        <p className="text-luxury-muted font-sans text-sm leading-relaxed mb-6">
                            CVBER is designed with a privacy-first mindset. We only collect the data necessary to provide our art protection services:
                        </p>
                        <ul className="space-y-3 font-sans text-sm text-luxury-muted">
                            <li className="flex gap-3"><span className="text-luxury-gold shrink-0">•</span> <span><strong className="text-luxury-cream">User Account Info:</strong> Email address and name used for registration via Supabase Auth.</span></li>
                            <li className="flex gap-3"><span className="text-luxury-gold shrink-0">•</span> <span><strong className="text-luxury-cream">Art Ownership Data:</strong> File names, hashes, and metadata for C2PA certificate generation.</span></li>
                            <li className="flex gap-3"><span className="text-luxury-gold shrink-0">•</span> <span><strong className="text-luxury-cream">Uploaded Media:</strong> Images uploaded for watermarking or certification.</span></li>
                        </ul>
                    </div>

                    <div className="card-gallery p-8 md:p-10">
                        <h2 className="font-display text-3xl font-bold text-luxury-cream mb-6 flex items-center gap-4">
                            <Trash2 className="w-5 h-5 text-luxury-gold" />
                            2. Data Retention (Zero-Persistence)
                        </h2>
                        <p className="text-luxury-muted font-sans text-sm leading-relaxed mb-6 italic">
                            &ldquo;Your image stays on our server for exactly as long as it takes to protect it.&rdquo;
                        </p>
                        <p className="text-luxury-muted font-sans text-sm mb-6">
                            We follow a strict zero-persistence policy for uploaded art:
                        </p>
                        <div className="space-y-6">
                            <div className="flex gap-5">
                                <div className="w-10 h-10 rounded-full border border-luxury-gold/20 flex items-center justify-center shrink-0">
                                    <Shield className="w-4 h-4 text-luxury-gold" />
                                </div>
                                <div>
                                    <h4 className="font-display text-base font-bold text-luxury-cream mb-2">Immediate Deletion</h4>
                                    <p className="text-luxury-muted font-sans text-xs leading-relaxed">Images uploaded for C2PA certification or watermarking are deleted immediately after the processed file is served back to you. We do not store your original high-resolution art on our servers.</p>
                                </div>
                            </div>
                            <div className="flex gap-5">
                                <div className="w-10 h-10 rounded-full border border-luxury-gold/20 flex items-center justify-center shrink-0">
                                    <Shield className="w-4 h-4 text-luxury-gold" />
                                </div>
                                <div>
                                    <h4 className="font-display text-base font-bold text-luxury-cream mb-2">30-Day Registry</h4>
                                    <p className="text-luxury-muted font-sans text-xs leading-relaxed">Metadata and transaction hashes (not the images) are stored for 30 days in our audit trail to support DMCA disputes, after which they are archived or deleted based on user preference.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h2 className="font-display text-3xl font-bold text-luxury-cream mb-6 flex items-center gap-4">
                            <Eye className="w-5 h-5 text-luxury-gold" />
                            3. AI Service Disclosure
                        </h2>
                        <p className="text-luxury-muted font-sans text-sm leading-relaxed mb-6">
                            To provide advanced art theft detection and metadata analysis, we use third-party AI processors:
                        </p>
                        <ul className="space-y-3 font-sans text-sm text-luxury-muted">
                            <li className="flex gap-3"><span className="text-luxury-gold shrink-0">•</span> <span><strong className="text-luxury-cream">Google Vertex AI & Gemini:</strong> Used for deep visual analysis and metadata enrichment.</span></li>
                            <li className="flex gap-3"><span className="text-luxury-gold shrink-0">•</span> <span><strong className="text-luxury-cream">Groq:</strong> Used for high-speed forensic classification.</span></li>
                        </ul>
                        <p className="text-luxury-muted/60 font-sans text-xs mt-4">
                            None of these providers are permitted to use your uploaded art to train their models through our integration.
                        </p>
                    </div>

                    <div className="pt-8 border-t border-gallery-border text-center">
                        <p className="text-luxury-muted/40 font-sans text-xs">
                            For any privacy-related requests: <a href="mailto:support@cvber.app" className="text-luxury-gold hover:text-luxury-goldLight transition-colors">support@cvber.app</a>
                        </p>
                    </div>
                </section>
            </div>
        </div>
    );
}
