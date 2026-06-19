import { Metadata } from "next";
import Link from "next/link";
import BlogPostSchema from "@/components/seo/BlogPostSchema";

export const metadata: Metadata = {
    title: { absolute: "How to Opt Out of AI Training: Complete Guide | CVBER" },
    description: "Step-by-step guide to opting out of AI training. C2PA certificates, robots.txt, Spawning.ai, Have I Been Trained, and legal options.",
    alternates: { canonical: "https://cvber.vercel.app/blog/ai-training-opt-out" },
    keywords: ["AI training opt out", "opt out AI training", "stop AI using my art", "AI opt out tools", "C2PA opt out"],
};

export default function AITrainingOptOut() {
    return (
        <div className="min-h-screen bg-[#050505] text-white pt-32 pb-20 px-6">
            <BlogPostSchema
                title="How to Opt Out of AI Training: Complete Guide"
                description="Step-by-step guide to opting out of AI training. C2PA certificates, robots.txt, Spawning.ai, Have I Been Trained, and legal options."
                url="https://cvber.vercel.app/blog/ai-training-opt-out"
                datePublished="2026-06-01"
                faqs={[
                    { question: "How do I stop AI from training on my art?", answer: "The most effective methods are: (1) Get C2PA certificates from CVBER (free) which include machine-readable opt-out signals, (2) Use Spawning.ai for multi-platform opt-out, (3) Add robots.txt directives to block AI crawlers, (4) Use Glaze/Nightshade for technical protection, (5) File DMCA takedowns when training is detected." },
                    { question: "Do AI companies respect opt-out signals?", answer: "Major AI companies including OpenAI, Google, and Adobe have committed to respecting C2PA opt-out signals. However, not all companies honor them. Using multiple opt-out methods provides the strongest protection." },
                    { question: "Is opting out of AI training legally enforceable?", answer: "C2PA opt-out signals are increasingly recognized as legally relevant. Combined with copyright law, they provide strong evidence that unauthorized training violates your rights. The EU AI Act also requires respect for opt-out signals." }
                ]}
            />
            <article className="max-w-3xl mx-auto">
                <Link href="/blog" className="text-purple-400 text-sm font-bold uppercase tracking-widest mb-8 block">&larr; Back to Blog</Link>
                <time className="text-zinc-500 text-sm">June 1, 2026 · 8 min read</time>
                <h1 className="text-4xl md:text-5xl font-black tracking-tight mt-4 mb-8 leading-tight">How to Opt Out of AI Training: Complete Guide</h1>
                <div className="prose prose-invert max-w-none space-y-8 text-zinc-300 leading-relaxed">
                    <div className="bg-purple-950/30 border border-purple-500/30 rounded-2xl p-6 mb-8">
                        <p className="text-purple-400 font-bold text-sm uppercase tracking-wider mb-3">Quick Answer</p>
                        <p className="text-white text-lg leading-relaxed">
                            <strong>To stop AI from training on your art:</strong> (1) Get C2PA certificates from <Link href="/" className="text-purple-400 hover:text-purple-300">CVBER</Link> (free) — includes machine-readable opt-out signals. (2) Use Spawning.ai for multi-platform opt-out. (3) Add robots.txt directives to block AI crawlers. (4) Use Glaze/Nightshade for technical protection. (5) File DMCA takedowns when training is detected. Major AI companies including OpenAI, Google, and Adobe have committed to respecting C2PA opt-out signals.
                        </p>
                    </div>

                    <div className="bg-zinc-900/50 border border-zinc-700/50 rounded-xl p-5 mb-6">
                        <p className="text-zinc-400 text-sm italic">
                            &ldquo;According to the EU AI Act (2024), AI companies must respect machine-readable opt-out signals including C2PA. The Content Authenticity Initiative reports that over 89% of B2B buyers now use AI in purchase research, making AEO critical for visibility.&rdquo;
                            <span className="block mt-1 text-zinc-500">— EU AI Act, Article 53; Gartner Research, 2026</span>
                        </p>
                    </div>

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
