import Link from 'next/link';
import { Shield, Check, FileCode, Zap, Globe, Lock } from 'lucide-react';
import Logo from '@/components/common/Logo';

export const metadata = {
    title: "Art Protection Features | AI Theft Defense & C2PA Certificates",
    description: "Explore Cvber's powerful suite of tools including AI theft detection, C2PA provenance signing, and automated DMCA enforcement to protect your art online."
};

export default function FeaturesPage() {
    return (
        <div className="flex flex-col bg-[#0A0A0F] pt-24 min-h-screen">
            {/* Header */}
            <section className="py-20 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <Link href="/" className="inline-flex items-center gap-2 text-purple-500 hover:text-purple-400 mb-8 font-medium transition-colors">
                        Explore Complete Art Protection
                    </Link>
                    <h1 className="text-4xl lg:text-6xl font-extrabold text-white mb-6">
                        Advanced <span className="text-purple-500 text-glow">Content Protection</span>
                    </h1>
                    <p className="text-xl text-zinc-400 leading-relaxed">
                        Industry-standard tools to protect, prove, and enforce your digital ownership.
                    </p>
                </div>
            </section>

            {/* Core Features Grid */}
            <section className="py-24 bg-[#08080C] border-y border-zinc-800/30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                title: 'AI Theft Detection',
                                desc: 'Monitor the web for unauthorized AI training and image scraping using our advanced detection engine.',
                                icon: Zap,
                                color: 'text-yellow-400'
                            },
                            {
                                title: 'C2PA Provenance',
                                desc: 'Embed tamper-proof cryptographic signatures directly into your files to prove original authorship.',
                                icon: FileCode,
                                color: 'text-blue-400'
                            },
                            {
                                title: 'Automated DMCA',
                                desc: 'Generate and send legally-compliant takedown notices to platforms in minutes, not hours.',
                                icon: Shield,
                                color: 'text-purple-400'
                            },
                            {
                                title: 'Global Monitoring',
                                desc: 'Our Watchtower service scans social media and marketplace sites 24/7 for your protected content.',
                                icon: Globe,
                                color: 'text-green-400'
                            },
                            {
                                title: 'Safe Vault',
                                desc: 'Encrypted storage for your original high-res creative assets with immutable proof of first creation.',
                                icon: Lock,
                                color: 'text-red-400'
                            },
                            {
                                title: 'Trust Score',
                                desc: 'Build your reputation as a certified original creator with a verifiable trust score linked to your portfolio.',
                                icon: Check,
                                color: 'text-purple-500'
                            }
                        ].map((feature, idx) => (
                            <div key={idx} className="p-8 rounded-3xl bg-zinc-900/50 border border-zinc-800 hover:border-purple-500/30 transition-all group">
                                <feature.icon className={`w-10 h-10 ${feature.color} mb-6 group-hover:scale-110 transition-transform`} />
                                <h3 className="text-xl font-bold text-white mb-4">{feature.title}</h3>
                                <p className="text-zinc-400 text-sm leading-relaxed">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Visual Showcase (Moved from home) */}
            <section className="py-24 bg-[#0A0A0F]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-bold text-white mb-12">Protected Mediums</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            { title: 'Digital Art', category: 'Illustration', alt: 'Premium digital art protected with CVBER C2PA provenance signature', color: 'from-purple-500/20' },
                            { title: 'Photography', category: 'Photography', alt: 'High-resolution photography with embedded copyright metadata', color: 'from-blue-500/20' },
                            { title: 'Video content', category: 'Cinematography', alt: 'Professional video clip with blockchain-backed authenticity ID', color: 'from-pink-500/20' },
                            { title: '3D Assets', category: '3D Modeling', alt: 'Verifiable 3D model with ownership attestation', color: 'from-indigo-500/20' }
                        ].map((asset, idx) => (
                            <div key={idx} className="group relative overflow-hidden rounded-2xl bg-zinc-900 border border-zinc-800 p-1">
                                <div className={`aspect-[4/5] rounded-xl bg-gradient-to-b ${asset.color} to-zinc-900 flex items-center justify-center relative overflow-hidden`}>
                                    <Logo size="lg" className="opacity-20 group-hover:opacity-40 transition-opacity" />
                                    <div role="img" aria-label={asset.alt} title={asset.title} className="absolute inset-0 z-10 cursor-help" />
                                </div>
                                <div className="p-4 text-left">
                                    <span className="text-[10px] uppercase tracking-widest text-purple-500 font-bold mb-1 block">{asset.category}</span>
                                    <h3 className="text-white font-bold">{asset.title}</h3>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-24">
                <div className="max-w-4xl mx-auto text-center px-4">
                    <h2 className="text-3xl font-bold text-white mb-8">Ready to secure your work?</h2>
                    <Link href="/register" className="btn-primary py-4 px-10 rounded-xl font-bold">
                        Start Protecting Now
                    </Link>
                </div>
            </section>
        </div>
    );
}

// SEO Metadata (Note: in App Router, client components need a separate layout or sibling server component for metadata,
// but for simplicity here I'll focus on the UI and add metadata in layout if needed)
