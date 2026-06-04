import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: { absolute: "C2PA Certificates Explained: What Artists Need to Know | CVBER" },
    description: "What is C2PA? How does it work? Why should artists care? Everything you need to know about the content authenticity standard for digital art.",
    alternates: { canonical: "https://cvber.vercel.app/blog/c2pa-explained" },
    keywords: ["C2PA explained", "C2PA certificate", "content authenticity", "digital provenance", "C2PA for artists"],
};

export default function C2PAExplained() {
    return (
        <div className="min-h-screen bg-[#050505] text-white pt-32 pb-20 px-6">
            <article className="max-w-3xl mx-auto">
                <Link href="/blog" className="text-purple-400 text-sm font-bold uppercase tracking-widest mb-8 block">&larr; Back to Blog</Link>

                <time className="text-zinc-500 text-sm">May 28, 2026 · 6 min read</time>

                <h1 className="text-4xl md:text-5xl font-black tracking-tight mt-4 mb-8 leading-tight">
                    C2PA Certificates Explained: What Artists Need to Know
                </h1>

                <div className="prose prose-invert max-w-none space-y-8 text-zinc-300 leading-relaxed">
                    <p className="text-xl text-zinc-400">
                        C2PA is the industry standard for proving content authenticity. Here&apos;s how it works and why every artist should have one.
                    </p>

                    <h2 className="text-2xl font-bold text-white mt-12">What is C2PA?</h2>
                    <p>
                        C2PA (Coalition for Content Provenance and Authenticity) is a technical standard that creates a cryptographic digital signature for digital content. Think of it as a digital birth certificate for your art.
                    </p>
                    <p>
                        When you create a C2PA certificate, it embeds metadata into your image file that proves:
                    </p>
                    <ul className="list-disc list-inside space-y-2">
                        <li>Who created it (you)</li>
                        <li>When it was created (timestamp)</li>
                        <li>That it hasn&apos;t been altered since creation</li>
                        <li>What tools were used to create it</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-white mt-12">Who Supports C2PA?</h2>
                    <p>C2PA is backed by the biggest names in tech:</p>
                    <ul className="list-disc list-inside space-y-2">
                        <li><strong>Adobe</strong> — Integrated into Photoshop, Lightroom, Content Credentials</li>
                        <li><strong>Microsoft</strong> — Built into Windows and Bing</li>
                        <li><strong>Google</strong> — Coming to Android and Search</li>
                        <li><strong>BBC</strong> — Using for news content verification</li>
                        <li><strong>OpenAI</strong> — Committed to respecting C2PA opt-out signals</li>
                        <li><strong>Nikon, Canon, Leica</strong> — Camera manufacturers adding C2PA support</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-white mt-12">Why Should Artists Care?</h2>
                    <p>
                        C2PA certificates solve two critical problems for artists:
                    </p>
                    <p>
                        <strong>1. Proof of Ownership:</strong> If someone steals your art, a C2PA certificate proves you created it. It&apos;s legally admissible evidence in court.
                    </p>
                    <p>
                        <strong>2. AI Training Opt-Out:</strong> C2PA certificates include machine-readable signals that tell AI companies your work is not available for training. Major AI companies have committed to honoring these signals.
                    </p>

                    <h2 className="text-2xl font-bold text-white mt-12">How to Get a C2PA Certificate</h2>
                    <ol className="list-decimal list-inside space-y-4">
                        <li>
                            <strong>Sign up for CVBER</strong> (free, no credit card) at <Link href="/register" className="text-purple-400 hover:text-purple-300">cvber.vercel.app/register</Link>
                        </li>
                        <li>
                            <strong>Upload your artwork</strong> — JPEG, PNG, TIFF, WebP supported
                        </li>
                        <li>
                            <strong>Get your certificate</strong> — CVBER generates a C2PA certificate automatically
                        </li>
                        <li>
                            <strong>Download your protected file</strong> — The certificate is embedded in the file metadata
                        </li>
                    </ol>

                    <h2 className="text-2xl font-bold text-white mt-12">C2PA vs Visible Watermarks</h2>
                    <p>
                        Visible watermarks can be cropped out. C2PA certificates are embedded in the file metadata — they travel with your work wherever it goes, even if someone screenshots or resizes it.
                    </p>

                    <h2 className="text-2xl font-bold text-white mt-12">C2PA vs Glaze/Nightshade</h2>
                    <p>
                        C2PA and Glaze/Nightshade solve different problems. C2PA proves ownership and signals opt-out. Glaze/Nightshade technically disrupt AI training. Use both together for maximum protection.
                    </p>

                    <div className="mt-16 p-8 rounded-3xl bg-purple-500/10 border border-purple-500/20">
                        <h3 className="text-xl font-bold mb-4">Get Your C2PA Certificate Free</h3>
                        <p className="mb-6">Upload your art to CVBER and get a C2PA certificate in seconds. No credit card required.</p>
                        <Link href="/register" className="inline-block px-8 py-4 bg-white text-black rounded-full font-bold text-sm uppercase tracking-widest hover:bg-zinc-200 transition-all">
                            Get Started Free
                        </Link>
                    </div>
                </div>
            </article>
        </div>
    );
}
