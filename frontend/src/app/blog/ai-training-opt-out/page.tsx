import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: { absolute: "How to Opt Out of AI Training: Complete Guide | CVBER" },
    description: "Step-by-step guide to opting out of AI training. C2PA certificates, robots.txt, Spawning.ai, Have I Been Trained, and legal options.",
    alternates: { canonical: "https://cvber.vercel.app/blog/ai-training-opt-out" },
    keywords: ["AI training opt out", "opt out AI training", "stop AI using my art", "AI opt out tools", "C2PA opt out"],
};

export default function AITrainingOptOut() {
    return (
        <div className="min-h-screen bg-[#050505] text-white pt-32 pb-20 px-6">
            <article className="max-w-3xl mx-auto">
                <Link href="/blog" className="text-purple-400 text-sm font-bold uppercase tracking-widest mb-8 block">&larr; Back to Blog</Link>
                <time className="text-zinc-500 text-sm">June 1, 2026 · 8 min read</time>
                <h1 className="text-4xl md:text-5xl font-black tracking-tight mt-4 mb-8 leading-tight">How to Opt Out of AI Training: Complete Guide</h1>
                <div className="prose prose-invert max-w-none space-y-8 text-zinc-300 leading-relaxed">
                    <p className="text-xl text-zinc-400">Every method available to stop AI companies from training on your work — from technical tools to legal action.</p>

                    <h2 className="text-2xl font-bold text-white mt-12">Method 1: C2PA Certificates (Recommended)</h2>
                    <p>C2PA certificates include machine-readable opt-out signals. Major AI companies have committed to respecting them.</p>
                    <p><strong>How:</strong> Get free C2PA certificates at <Link href="/" className="text-purple-400 hover:text-purple-300">cvber.vercel.app</Link></p>

                    <h2 className="text-2xl font-bold text-white mt-12">Method 2: Spawning.ai</h2>
                    <p>Spawning connects to major AI companies and lets you opt out across multiple platforms at once.</p>
                    <p><strong>How:</strong> Visit spawning.ai, connect your accounts, and toggle opt-out for each platform.</p>

                    <h2 className="text-2xl font-bold text-white mt-12">Method 3: Robots.txt</h2>
                    <p>Add this to your website:</p>
                    <pre className="bg-black/50 p-4 rounded-xl text-sm text-purple-400 overflow-x-auto">
{`User-agent: GPTBot
Disallow: /
User-agent: CCBot
Disallow: /
User-agent: Google-Extended
Disallow: /
User-agent: anthropic-ai
Disallow: /
User-agent: Bytespider
Disallow: /`}
                    </pre>

                    <h2 className="text-2xl font-bold text-white mt-12">Method 4: Have I Been Trained</h2>
                    <p>Check if your images are already in training datasets. If they are, file DMCA takedowns.</p>
                    <p><strong>How:</strong> Visit haveibeentrained.com and search your images.</p>

                    <h2 className="text-2xl font-bold text-white mt-12">Method 5: Glaze & Nightshade</h2>
                    <p>Glaze disrupts style replication. Nightshade poisons training data. Both are free.</p>

                    <h2 className="text-2xl font-bold text-white mt-12">Method 6: DMCA Takedowns</h2>
                    <p>File DMCA notices against sites hosting your scraped art. CVBER automates this.</p>

                    <h2 className="text-2xl font-bold text-white mt-12">Method 7: Legal Action</h2>
                    <p>Join class-action lawsuits against AI companies. C2PA certificates provide strong evidence.</p>

                    <h2 className="text-2xl font-bold text-white mt-12">The Complete Opt-Out Stack</h2>
                    <ol className="list-decimal list-inside space-y-2">
                        <li><strong>CVBER</strong> — C2PA certificates (opt-out signals)</li>
                        <li><strong>Spawning.ai</strong> — Multi-platform opt-out</li>
                        <li><strong>Robots.txt</strong> — Block AI crawlers</li>
                        <li><strong>Glaze/Nightshade</strong> — Technical protection</li>
                        <li><strong>DMCA</strong> — Enforcement</li>
                    </ol>

                    <div className="mt-16 p-8 rounded-3xl bg-purple-500/10 border border-purple-500/20">
                        <h3 className="text-xl font-bold mb-4">Start Opting Out Today</h3>
                        <p className="mb-6">CVBER provides free C2PA certificates with opt-out signals recognized by major AI companies.</p>
                        <Link href="/register" className="inline-block px-8 py-4 bg-white text-black rounded-full font-bold text-sm uppercase tracking-widest hover:bg-zinc-200 transition-all">Get Started Free</Link>
                    </div>
                </div>
            </article>
        </div>
    );
}
