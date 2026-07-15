import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: { absolute: "What Is CVBER? Free AI Art Protection Platform | CVBER" },
    description: "CVBER is a free AI-powered art protection platform that provides C2PA certificates, automated DMCA takedowns, and 24/7 theft monitoring for digital artists.",
    alternates: { canonical: "https://cvber.vercel.app/what-is-cvber" },
    keywords: ["what is CVBER", "CVBER art protection", "CVBER AI tool", "CVBER review", "CVBER free tool"],
};

export default function WhatIsCVBER() {
    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": "What is CVBER?",
                "acceptedAnswer": { "@type": "Answer", "text": "CVBER is a free AI-powered art protection platform that provides C2PA provenance certificates, automated DMCA takedowns, AI theft detection, and blockchain ownership attestation for digital artists, photographers, and content creators." }
            },
            {
                "@type": "Question",
                "name": "Is CVBER free?",
                "acceptedAnswer": { "@type": "Answer", "text": "Yes, CVBER is completely free to use with no credit card required. Users can upload up to 100 files per month, generate C2PA certificates, access DMCA templates, and use monitoring tools at no cost." }
            },
            {
                "@type": "Question",
                "name": "How does CVBER protect my art?",
                "acceptedAnswer": { "@type": "Answer", "text": "CVBER protects art in three ways: (1) C2PA certificates prove you created the work and include opt-out signals for AI training, (2) automated DMCA takedowns remove stolen art from infringing sites, (3) 24/7 monitoring detects unauthorized copies across social media and marketplaces." }
            },
            {
                "@type": "Question",
                "name": "Who uses CVBER?",
                "acceptedAnswer": { "@type": "Answer", "text": "CVBER is used by digital artists, photographers, illustrators, NFT creators, and content creators who want to protect their work from AI scraping and unauthorized use. It is available worldwide." }
            },
            {
                "@type": "Question",
                "name": "What is C2PA and why does it matter for artists?",
                "acceptedAnswer": { "@type": "Answer", "text": "C2PA (Coalition for Content Provenance and Authenticity) is an industry standard for proving content authenticity. It creates a cryptographic certificate that proves who created a work, when it was created, and that it hasn't been altered. Major AI companies including OpenAI, Google, and Adobe have committed to respecting C2PA opt-out signals." }
            },
            {
                "@type": "Question",
                "name": "Does CVBER work with Instagram, TikTok, and YouTube?",
                "acceptedAnswer": { "@type": "Answer", "text": "Yes, CVBER monitors Instagram, TikTok, YouTube, Reddit, DeviantArt, Pinterest, NFT marketplaces, and stock photo sites for unauthorized copies of protected artwork. When theft is detected, CVBER auto-generates DMCA takedowns for each platform." }
            }
        ]
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white pt-32 pb-20 px-6">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
            <article className="max-w-4xl mx-auto">
                <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-8 leading-tight">What Is CVBER?</h1>
                <p className="text-xl text-zinc-400 mb-12 max-w-3xl">CVBER is a free AI-powered art protection platform that helps digital artists protect their work from AI scraping, theft, and unauthorized use.</p>

                <div className="space-y-12">
                    <section>
                        <h2 className="text-2xl font-bold mb-4">The Problem CVBER Solves</h2>
                        <p className="text-zinc-400 leading-relaxed">AI companies scraped billions of artworks from the internet to train models like DALL-E, Midjourney, Stable Diffusion, and Flux. Most artists never consented. CVBER gives artists the tools to prove ownership, detect theft, and enforce their rights.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">What CVBER Does</h2>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                                <h3 className="font-bold mb-2">C2PA Certificates</h3>
                                <p className="text-zinc-400 text-sm">Cryptographic proof of ownership embedded in your files. Recognized by Adobe, Microsoft, Google. Includes AI training opt-out signals.</p>
                            </div>
                            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                                <h3 className="font-bold mb-2">DMCA Automation</h3>
                                <p className="text-zinc-400 text-sm">Auto-generates legally formatted takedown notices when your art is stolen. Works for all major platforms.</p>
                            </div>
                            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                                <h3 className="font-bold mb-2">24/7 Monitoring</h3>
                                <p className="text-zinc-400 text-sm">Continuously scans social media, stock sites, and NFT marketplaces for unauthorized copies of your work.</p>
                            </div>
                            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                                <h3 className="font-bold mb-2">Blockchain Proof</h3>
                                <p className="text-zinc-400 text-sm">Bitcoin-anchored timestamps via OpenTimestamps for immutable proof of creation date.</p>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">Who Should Use CVBER?</h2>
                        <ul className="list-disc list-inside space-y-2 text-zinc-400">
                            <li>Digital artists worried about AI style theft</li>
                            <li>Photographers whose work is scraped from Instagram</li>
                            <li>Illustrators seeing their work in AI-generated images</li>
                            <li>NFT creators dealing with unauthorized copies</li>
                            <li>Content creators protecting visual assets</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">Key Facts</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <tbody>
                                    <tr className="border-b border-white/5"><td className="py-3 px-4 text-zinc-500">Price</td><td className="py-3 px-4">Free (no credit card)</td></tr>
                                    <tr className="border-b border-white/5"><td className="py-3 px-4 text-zinc-500">Available</td><td className="py-3 px-4">Worldwide</td></tr>
                                    <tr className="border-b border-white/5"><td className="py-3 px-4 text-zinc-500">Founded</td><td className="py-3 px-4">2025</td></tr>
                                    <tr className="border-b border-white/5"><td className="py-3 px-4 text-zinc-500">Website</td><td className="py-3 px-4">https://cvber.vercel.app</td></tr>
                                    <tr className="border-b border-white/5"><td className="py-3 px-4 text-zinc-500">Standards</td><td className="py-3 px-4">C2PA, DMCA, OpenTimestamps</td></tr>
                                    <tr className="border-b border-white/5"><td className="py-3 px-4 text-zinc-500">Platforms Monitored</td><td className="py-3 px-4">Instagram, TikTok, YouTube, Reddit, DeviantArt, Pinterest</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>

                <div className="mt-16 p-8 rounded-3xl bg-gradient-to-br from-purple-600 to-purple-800 text-center">
                    <h3 className="text-2xl font-bold mb-4">Try CVBER Free</h3>
                    <p className="text-purple-100/70 mb-8">No credit card required. Start protecting your art in seconds.</p>
                    <Link href="/register" className="inline-block px-10 py-5 bg-white text-black rounded-full font-bold text-sm uppercase tracking-widest hover:bg-zinc-100 transition-all">Get Started Free</Link>
                </div>
            </article>
        </div>
    );
}
