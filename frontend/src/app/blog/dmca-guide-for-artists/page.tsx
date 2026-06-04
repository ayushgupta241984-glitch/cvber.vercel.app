import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: { absolute: "DMCA Takedown Guide for Artists: How to Get Stolen Art Removed | CVBER" },
    description: "Step-by-step guide to filing DMCA takedown notices. Templates, platforms, timelines, and what to do if a site ignores your notice.",
    alternates: { canonical: "https://cvber.vercel.app/blog/dmca-guide-for-artists" },
    keywords: ["DMCA takedown guide", "how to file DMCA", "DMCA notice template", "stolen art DMCA", "copyright infringement"],
};

export default function DMCAGuideForArtists() {
    return (
        <div className="min-h-screen bg-[#050505] text-white pt-32 pb-20 px-6">
            <article className="max-w-3xl mx-auto">
                <Link href="/blog" className="text-purple-400 text-sm font-bold uppercase tracking-widest mb-8 block">&larr; Back to Blog</Link>

                <time className="text-zinc-500 text-sm">May 25, 2026 · 10 min read</time>

                <h1 className="text-4xl md:text-5xl font-black tracking-tight mt-4 mb-8 leading-tight">
                    DMCA Takedown Guide for Artists: How to Get Stolen Art Removed
                </h1>

                <div className="prose prose-invert max-w-none space-y-8 text-zinc-300 leading-relaxed">
                    <p className="text-xl text-zinc-400">
                        Found your art stolen? Here&apos;s exactly how to file a DMCA takedown notice and get it removed — for free.
                    </p>

                    <h2 className="text-2xl font-bold text-white mt-12">What is a DMCA Takedown?</h2>
                    <p>
                        The DMCA (Digital Millennium Copyright Act) is a US law that requires hosting providers and websites to remove copyrighted content when the owner files a valid takedown notice. It works for websites hosted in the US and many international sites.
                    </p>

                    <h2 className="text-2xl font-bold text-white mt-12">Step 1: Gather Evidence</h2>
                    <p>Before filing, collect:</p>
                    <ul className="list-disc list-inside space-y-2">
                        <li>URL of the stolen content</li>
                        <li>Screenshot of the infringing page</li>
                        <li>Your original file (proof you created it)</li>
                        <li>C2PA certificate if you have one (CVBER provides these free)</li>
                        <li>Timestamp of when you first published the work</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-white mt-12">Step 2: Write the DMCA Notice</h2>
                    <p>A valid DMCA notice must include:</p>
                    <ol className="list-decimal list-inside space-y-4">
                        <li><strong>Your contact information</strong> — Name, email, address</li>
                        <li><strong>Identification of your copyrighted work</strong> — URL where your original work is located</li>
                        <li><strong>Location of the infringing material</strong> — Exact URL of the stolen copy</li>
                        <li><strong>Good faith statement</strong> — &quot;I have a good faith belief that the use of the material is not authorized by the copyright owner&quot;</li>
                        <li><strong>Accuracy statement</strong> — &quot;The information in this notification is accurate&quot;</li>
                        <li><strong>Your signature</strong> — Physical or electronic signature</li>
                    </ol>

                    <h2 className="text-2xl font-bold text-white mt-12">DMCA Notice Template</h2>
                    <pre className="bg-black/50 p-4 rounded-xl text-sm text-zinc-300 overflow-x-auto whitespace-pre-wrap">
{`DMCA TAKEDOWN NOTICE

To: [Platform's DMCA Agent]

I am the copyright owner of the following work:
- Original work: [Your Name] - [Title] 
- URL of original: [Your portfolio URL]
- Date of creation: [Date]

The following material is infringing on my copyright:
- URL of infringing material: [Stolen content URL]
- Description: [Description of stolen content]

I have a good faith belief that the use of the material 
is not authorized by the copyright owner, its agent, or 
the law.

I declare under penalty of perjury that the information 
in this notification is accurate and that I am the 
copyright owner.

Signature: [Your Name]
Date: [Today's Date]
Email: [Your Email]`}
                    </pre>

                    <h2 className="text-2xl font-bold text-white mt-12">Step 3: Send the Notice</h2>
                    <p>Find the platform&apos;s DMCA agent:</p>
                    <ul className="list-disc list-inside space-y-2">
                        <li><strong>Instagram:</strong> copyright@fb.com or use the in-app reporting</li>
                        <li><strong>DeviantArt:</strong> copyright@deviantart.com</li>
                        <li><strong>Reddit:</strong> copyright@reddit.com</li>
                        <li><strong>Pinterest:</strong> copyright@pinterest.com</li>
                        <li><strong>TikTok:</strong> copyright@tiktok.com</li>
                        <li><strong>YouTube:</strong> Use the Copyright Claims Studio</li>
                        <li><strong>Twitter/X:</strong> Use the copyright reporting form</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-white mt-12">Timeline</h2>
                    <p>Most platforms respond within:</p>
                    <ul className="list-disc list-inside space-y-2">
                        <li><strong>Instagram:</strong> 24-48 hours</li>
                        <li><strong>YouTube:</strong> 24 hours</li>
                        <li><strong>DeviantArt:</strong> 2-5 business days</li>
                        <li><strong>Reddit:</strong> 3-5 business days</li>
                        <li><strong>Pinterest:</strong> 3-7 business days</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-white mt-12">What if They Ignore It?</h2>
                    <p>If a site ignores your DMCA notice:</p>
                    <ol className="list-decimal list-inside space-y-2">
                        <li>File a DMCA notice with their hosting provider (find it via who.is)</li>
                        <li>File a DMCA notice with their domain registrar</li>
                        <li>Report to Google to remove from search results</li>
                        <li>Consider legal action for willful infringement</li>
                    </ol>

                    <h2 className="text-2xl font-bold text-white mt-12">CVBER Automates This</h2>
                    <p>
                        CVBER&apos;s Watchtower detects stolen art and automatically generates DMCA notices with all required information. You just review and send.
                    </p>

                    <div className="mt-16 p-8 rounded-3xl bg-purple-500/10 border border-purple-500/20">
                        <h3 className="text-xl font-bold mb-4">Automate Your DMCA Takedowns</h3>
                        <p className="mb-6">CVBER auto-generates DMCA notices when your art is stolen. No more writing notices by hand.</p>
                        <Link href="/register" className="inline-block px-8 py-4 bg-white text-black rounded-full font-bold text-sm uppercase tracking-widest hover:bg-zinc-200 transition-all">
                            Get Started Free
                        </Link>
                    </div>
                </div>
            </article>
        </div>
    );
}
