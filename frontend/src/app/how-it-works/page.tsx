import Link from 'next/link';
import { Upload, Stamp, Award, ArrowRight, ShieldCheck, Search } from 'lucide-react';
import Logo from '@/components/common/Logo';

export const metadata = {
    title: "How to Protect Your Art Online | 3-Step Security Guide",
    description: "Learn how to protect your creative work in three simple steps using AI threat detection and C2PA provenance signatures."
};

export default function HowItWorksPage() {
    return (
        <div className="flex flex-col bg-[#0A0A0F] pt-24 min-h-screen">
            {/* Hero Section */}
            <section className="py-20 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <Link href="/" className="inline-flex items-center gap-2 text-purple-500 hover:text-purple-400 mb-8 font-medium transition-colors">
                        Protect Your Art Today
                    </Link>
                    <h1 className="text-4xl lg:text-7xl font-extrabold text-white mb-6 leading-tight">
                        Security in <span className="text-purple-500 text-glow">Three Steps</span>
                    </h1>
                    <p className="text-xl text-zinc-400 leading-relaxed max-w-2xl mx-auto">
                        We've simplified complex cryptographic provenance and AI detection into a workflow that takes seconds.
                    </p>
                </div>
            </section>

            {/* Steps Section */}
            <section className="py-24 bg-[#08080C] border-y border-zinc-800/30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-3 gap-16">
                        {[
                            {
                                step: '01',
                                title: 'Upload & Identify',
                                desc: 'Upload your digital assets—be it art, photography, or video. Our system immediately hashes the content for blockchain attestation.',
                                icon: Upload
                            },
                            {
                                step: '02',
                                title: 'Apply Provenance',
                                desc: 'Inject C2PA metadata and optional watermarks. This creates a permanent digital birth certificate for your work.',
                                icon: Stamp
                            },
                            {
                                step: '03',
                                title: 'Active Verification',
                                desc: 'Our Watchtower monitor begins scanning for matches across social platforms, notifying you in real-time of potential theft.',
                                icon: Award
                            }
                        ].map((item, idx) => (
                            <div key={idx} className="relative group">
                                <div className="text-8xl font-black text-purple-500/5 absolute -top-12 -left-4 z-0 group-hover:text-purple-500/10 transition-colors">
                                    {item.step}
                                </div>
                                <div className="relative z-10 pt-4">
                                    <div className="w-16 h-16 bg-purple-600/10 border border-purple-500/20 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-purple-600/20 transition-all">
                                        <item.icon className="w-8 h-8 text-purple-400" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-4">{item.title}</h3>
                                    <p className="text-zinc-500 leading-relaxed text-lg">
                                        {item.desc}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Deep Dive Section */}
            <section className="py-24 px-4">
                <div className="max-w-5xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <div className="order-2 md:order-1">
                            <div className="space-y-8">
                                <div className="flex gap-4 p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800">
                                    <ShieldCheck className="w-10 h-10 text-green-400 shrink-0" />
                                    <div>
                                        <h4 className="text-white font-bold mb-2">C2PA Standard Compliance</h4>
                                        <p className="text-zinc-400 text-sm">We use the same industry standard as Adobe and Microsoft to ensure your ownership is verifiable by everyone.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4 p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800">
                                    <Search className="w-10 h-10 text-purple-400 shrink-0" />
                                    <div>
                                        <h4 className="text-white font-bold mb-2">AI Dataset Monitoring</h4>
                                        <p className="text-zinc-400 text-sm">We don't just find reposts; we track if your work is being ingested into Large Language Models (LLMs) for training.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="order-1 md:order-2">
                            <h2 className="text-3xl lg:text-5xl font-bold text-white mb-8">Built for the <span className="text-purple-500">AI Era</span></h2>
                            <p className="text-zinc-400 text-lg leading-relaxed mb-8">
                                Traditional copyright isn't enough when AI can scrape thousands of images in seconds.
                                Cvber creates a digital wall around your content, making it technically difficult
                                and legally dangerous for AI scrapers to use your work without permission.
                            </p>
                            <Link href="/register" className="inline-flex items-center gap-2 text-purple-400 font-bold hover:text-purple-300 transition-all group">
                                Create your first certificate <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer CTA */}
            <section className="py-24 bg-purple-600">
                <div className="max-w-4xl mx-auto text-center px-4 text-white">
                    <h2 className="text-4xl font-bold mb-6">Join 2,000+ creators on Cvber</h2>
                    <p className="text-purple-100 mb-10 text-xl font-medium">Protect your creative legacy starting today.</p>
                    <Link href="/register" className="bg-white text-purple-600 font-bold py-4 px-12 rounded-xl hover:bg-zinc-100 transition-colors">
                        Get Started
                    </Link>
                </div>
            </section>
        </div>
    );
}
