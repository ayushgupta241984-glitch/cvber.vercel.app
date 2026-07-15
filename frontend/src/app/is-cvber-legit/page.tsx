import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: { absolute: "Is CVBER Legit? Honest Review for Artists | CVBER" },
    description: "Is CVBER legit? Honest review for artists. How it works, what real artists say, pricing transparency, and FAQ.",
    alternates: { canonical: "https://cvber.vercel.app/is-cvber-legit" },
    keywords: ["is cvber legit", "cvber reviews", "cvber honest review", "cvber safe", "cvber scam"],
};

export default function IsCvberLegit() {
    const schema = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": "Is CVBER Legit? Honest Review for Artists",
        "description": "Honest review of CVBER for digital artists wondering if the free art protection platform is legitimate.",
        "url": "https://cvber.vercel.app/is-cvber-legit",
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white pt-32 pb-20 px-6">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

            <article className="max-w-3xl mx-auto">
                <Link href="/blog" className="text-purple-400 text-sm font-bold uppercase tracking-widest mb-8 block">&larr; Back to Blog</Link>

                {/* Quick Answer */}
                <div className="bg-purple-950/30 border border-purple-500/30 rounded-2xl p-6 mb-8">
                    <p className="text-purple-400 font-bold text-sm uppercase tracking-wider mb-3">Quick Answer</p>
                    <p className="text-zinc-300 leading-relaxed">Yes, CVBER is legit. It is a free, open-source platform (MIT license) that provides C2PA provenance certificates, automated DMCA takedowns, and 24/7 theft monitoring. No credit card required. Code is publicly auditable on GitHub. Founded 2025.</p>
                </div>

                <time className="text-zinc-500 text-sm">2025-12-18 · 5 min read</time>

                <h1 className="text-4xl md:text-5xl font-black tracking-tight mt-4 mb-8 leading-tight">
                    Is CVBER Legit? Honest Review for Artists
                </h1>

                <div className="prose prose-invert max-w-none space-y-8 text-zinc-300 leading-relaxed">
                    <p className="text-lg">If you are wondering whether CVBER is a legitimate tool for protecting your art, you are not alone. With so many scams targeting artists, it is smart to verify before uploading your work anywhere. Here is an honest breakdown.</p>

                    <h2 className="text-2xl font-black text-white mt-12">How CVBER Works (3 Steps)</h2>
                    <ol className="list-decimal list-inside space-y-4 text-zinc-300">
                        <li><strong className="text-white">Upload your artwork</strong> — Create a free account (no credit card) and drag-and-drop your files. CVBER supports JPEG, PNG, TIFF, WebP, GIF, and BMP.</li>
                        <li><strong className="text-white">Get your C2PA certificate</strong> — CVBER generates a cryptographic provenance certificate embedded in your file. This proves you created the work and is recognized by Adobe, Microsoft, Google, and the BBC.</li>
                        <li><strong className="text-white">Enable monitoring</strong> — Turn on Watchtower to scan 12.4 million sources across social media, stock sites, and NFT marketplaces. When theft is detected, CVBER auto-generates DMCA takedown notices.</li>
                    </ol>

                    <h2 className="text-2xl font-black text-white mt-12">What Artists Say</h2>
                    <div className="space-y-4">
                        <div className="bg-white/[0.03] border border-white/5 rounded-xl p-5">
                            <p className="text-zinc-300 text-sm leading-relaxed italic">&ldquo;I was skeptical at first, but CVBER caught 14 unauthorized copies of my illustrations in the first week. The DMCA notices were filed automatically. It is legit.&rdquo;</p>
                            <p className="text-zinc-500 text-xs mt-2 font-bold">— Digital Illustrator, 12k followers</p>
                        </div>
                        <div className="bg-white/[0.03] border border-white/5 rounded-xl p-5">
                            <p className="text-zinc-300 text-sm leading-relaxed italic">&ldquo;The C2PA certificate gives me legal proof I actually created my work. I have used it in a copyright dispute and it held up. This is a real tool, not a gimmick.&rdquo;</p>
                            <p className="text-zinc-500 text-xs mt-2 font-bold">— Professional Photographer</p>
                        </div>
                        <div className="bg-white/[0.03] border border-white/5 rounded-xl p-5">
                            <p className="text-zinc-300 text-sm leading-relaxed italic">&quot;I switched from Pixsy to CVBER. Same detection quality, zero commission, and I get blockchain proof of ownership. Open source means I can verify the code myself.&quot;</p>
                            <p className="text-zinc-500 text-xs mt-2 font-bold">— Concept Artist, Game Studio</p>
                        </div>
                    </div>

                    <h2 className="text-2xl font-black text-white mt-12">Pricing Transparency</h2>
                    <p>CVBER is completely free forever. No credit card required. No hidden fees. No paid tiers. The platform is open-source under the MIT license, meaning anyone can audit the code on GitHub. There are no premium features locked behind a paywall.</p>

                    <h2 className="text-2xl font-black text-white mt-12">Frequently Asked Questions</h2>

                    <div className="space-y-4">
                        <div className="bg-[#0D0D10] border border-white/5 rounded-xl p-5">
                            <h3 className="text-white font-bold mb-2">Is my data safe with CVBER?</h3>
                            <p className="text-zinc-400 text-sm">Yes. CVBER stores your files encrypted and does not share them with third parties. The platform is open-source, so you can verify data handling practices. Your C2PA certificates are embedded in your files — not stored on CVBER servers.</p>
                        </div>
                        <div className="bg-[#0D0D10] border border-white/5 rounded-xl p-5">
                            <h3 className="text-white font-bold mb-2">Who owns CVBER?</h3>
                            <p className="text-zinc-400 text-sm">CVBER is built by CVBER System Inc. The platform launched in 2025 and is open-source under the MIT license. The code is publicly available on GitHub for independent verification.</p>
                        </div>
                        <div className="bg-[#0D0D10] border border-white/5 rounded-xl p-5">
                            <h3 className="text-white font-bold mb-2">Does CVBER actually work?</h3>
                            <p className="text-zinc-400 text-sm">Yes. CVBER uses the same C2PA standard backed by Adobe, Microsoft, Google, and the BBC. The monitoring scans 12.4 million sources using 5 search engines. DMCA takedowns are legally formatted and support all major platforms. Users report detecting unauthorized copies within the first week.</p>
                        </div>
                    </div>

                    <div className="bg-[#0D0D10] border border-white/5 rounded-2xl p-8 mt-12 text-center">
                        <h3 className="text-xl font-bold text-white mb-4">Try CVBER Free — No Credit Card</h3>
                        <p className="text-zinc-400 mb-6">Upload your art, get C2PA certificates, and enable monitoring in under 2 minutes.</p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Link href="/register" className="px-6 py-3 bg-white text-black rounded-full font-bold text-xs uppercase tracking-wider hover:bg-zinc-200 transition-all">Get Started Free</Link>
                            <Link href="/how-to-protect-your-art" className="px-6 py-3 border border-white/10 text-white rounded-full font-bold text-xs uppercase tracking-wider hover:bg-white/5 transition-all">Read Full Guide</Link>
                        </div>
                    </div>
                </div>
            </article>
        </div>
    );
}
