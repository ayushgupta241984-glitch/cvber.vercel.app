import React from 'react';
import { Gavel, Scale, AlertTriangle, CheckCircle, HelpCircle } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Terms of Use',
    description: 'CVBER terms of use. Read our terms and conditions for using the CVBER art protection platform.',
    alternates: { canonical: 'https://cvber.vercel.app/terms' },
};

export default function TermsOfUse() {
    return (
        <div className="min-h-screen bg-gallery-black text-luxury-cream pt-32 pb-20 px-6">
            <div className="max-w-4xl mx-auto">
                <header className="mb-16 pb-10 border-b border-gallery-border">
                    <Link href="/" className="tag mb-8 block">Back to Home</Link>
                    <h1 className="font-display text-5xl md:text-6xl font-bold text-luxury-cream mb-4 leading-tight">
                        Terms of Use
                    </h1>
                    <p className="text-luxury-muted font-sans">Last Updated: April 19, 2026</p>
                </header>

                <div className="card-gallery p-6 md:p-8 mb-16 flex gap-4">
                    <AlertTriangle className="w-5 h-5 text-luxury-gold shrink-0 mt-0.5" />
                    <p className="text-xs text-luxury-muted font-sans leading-relaxed">
                        <strong className="text-luxury-cream">TL;DR:</strong> We provide the tools to help you protect your art, but you are responsible for how you use those tools and for ensuring you actually own the art you upload.
                    </p>
                </div>

                <section className="space-y-16">
                    <div>
                        <h2 className="font-display text-3xl font-bold text-luxury-cream mb-6 flex items-center gap-4">
                            <Gavel className="w-5 h-5 text-luxury-gold" />
                            1. Acceptance of Terms
                        </h2>
                        <p className="text-luxury-muted font-sans text-sm leading-relaxed">
                            By using CVBER, you agree to these terms. If you don&apos;t agree, please do not use the service. We reserve the right to modify these terms at any time, and your continued use indicates acceptance of the update.
                        </p>
                    </div>

                    <div>
                        <h2 className="font-display text-3xl font-bold text-luxury-cream mb-6 flex items-center gap-4">
                            <Scale className="w-5 h-5 text-luxury-gold" />
                            2. Ownership & Responsibility
                        </h2>
                        <p className="text-luxury-muted font-sans text-sm leading-relaxed mb-6">
                            You represent and warrant that:
                        </p>
                        <ul className="space-y-3 font-sans text-sm text-luxury-muted">
                            <li className="flex gap-3"><span className="text-luxury-gold shrink-0">•</span> You are the <strong className="text-luxury-cream">original creator</strong> or legal owner of the art you upload.</li>
                            <li className="flex gap-3"><span className="text-luxury-gold shrink-0">•</span> Your use of CVBER does not infringe upon the intellectual property of others.</li>
                            <li className="flex gap-3"><span className="text-luxury-gold shrink-0">•</span> You will not use the platform to generate <strong className="text-luxury-cream">fraudulent certificates</strong> for art you do not own.</li>
                        </ul>
                    </div>

                    <div>
                        <h2 className="font-display text-3xl font-bold text-luxury-cream mb-6 flex items-center gap-4">
                            <CheckCircle className="w-5 h-5 text-luxury-gold" />
                            3. C2PA & Metadata
                        </h2>
                        <p className="text-luxury-muted font-sans text-sm leading-relaxed">
                            Our C2PA certification service injects provenance metadata into your files. While we strive for industry compliance, we do not guarantee that the certificate will be recognized as legal proof of ownership in every jurisdiction. The certificate is a <strong className="text-luxury-cream">technological aid</strong>, not a legal verdict.
                        </p>
                    </div>

                    <div className="card-gallery p-8 md:p-10">
                        <h2 className="font-display text-3xl font-bold text-luxury-cream mb-6">4. Limitations of Liability</h2>
                        <p className="text-luxury-muted font-sans text-sm italic mb-6">
                            CVBER is provided &ldquo;as is&rdquo;. We are not liable for:
                        </p>
                        <ul className="space-y-4">
                            {[
                                'Failed DMCA takedowns by third-party platforms.',
                                'Loss of images due to user error.',
                                'Direct, indirect, or incidental damages arising from the use of our services.',
                            ].map((item, i) => (
                                <li key={i} className="p-4 bg-gallery-deep border-l-2 border-luxury-gold/40 font-sans text-xs text-luxury-muted">
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h2 className="font-display text-3xl font-bold text-luxury-cream mb-6 flex items-center gap-4">
                            <HelpCircle className="w-5 h-5 text-luxury-gold" />
                            5. Termination
                        </h2>
                        <p className="text-luxury-muted font-sans text-sm leading-relaxed">
                            We reserve the right to suspend or terminate accounts that violate our &ldquo;No Fraud&rdquo; policy or engage in activities that harm the artist community.
                        </p>
                    </div>

                    <div className="pt-8 border-t border-gallery-border text-center">
                        <p className="text-luxury-muted/40 font-sans text-xs">
                            Questions? Contact us at <a href="mailto:legal@cvber.app" className="text-luxury-gold hover:text-luxury-goldLight transition-colors">legal@cvber.app</a>
                        </p>
                    </div>
                </section>
            </div>
        </div>
    );
}
