import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: { absolute: "Copyright Protection for Photographers: How to Stop AI Theft | CVBER" },
    description: "Complete guide to copyright protection for photographers. C2PA certificates, DMCA takedowns, reverse image search, and monitoring tools.",
    alternates: { canonical: "https://cvber.vercel.app/blog/copyright-protection-for-photographers" },
    keywords: ["copyright protection photographers", "protect photos from AI", "photographer copyright", "DMCA photography", "C2PA photographers"],
};

export default function CopyrightProtectionForPhotographers() {
    return (
        <div className="min-h-screen bg-[#050505] text-white pt-32 pb-20 px-6">
            <article className="max-w-3xl mx-auto">
                <Link href="/blog" className="text-purple-400 text-sm font-bold uppercase tracking-widest mb-8 block">&larr; Back to Blog</Link>
                <time className="text-zinc-500 text-sm">May 30, 2026 · 9 min read</time>
                <h1 className="text-4xl md:text-5xl font-black tracking-tight mt-4 mb-8 leading-tight">Copyright Protection for Photographers</h1>
                <div className="prose prose-invert max-w-none space-y-8 text-zinc-300 leading-relaxed">
                    <p className="text-xl text-zinc-400">Photographers are among the hardest hit by AI scraping. Your photos are being used to train AI models without permission. Here&apos;s how to protect yourself.</p>

                    <h2 className="text-2xl font-bold text-white mt-12">The Problem</h2>
                    <p>AI companies scraped billions of photos from Instagram, Flickr, 500px, and stock sites. Your photos are likely in training datasets for DALL-E, Midjourney, and Stable Diffusion.</p>

                    <h2 className="text-2xl font-bold text-white mt-12">Step 1: Get C2PA Certificates</h2>
                    <p>C2PA certificates prove you took the photo. They include camera metadata, timestamp, and your identity.</p>
                    <p><strong>How:</strong> Upload your photos to <Link href="/" className="text-purple-400 hover:text-purple-300">CVBER</Link> (free) to get C2PA certificates.</p>

                    <h2 className="text-2xl font-bold text-white mt-12">Step 2: Check Training Datasets</h2>
                    <p>Use Have I Been Trained (haveibeentrained.com) to check if your photos are in AI training datasets.</p>

                    <h2 className="text-2xl font-bold text-white mt-12">Step 3: File DMCA Takedowns</h2>
                    <p>When you find stolen photos, file DMCA takedowns. CVBER automates this process.</p>

                    <h2 className="text-2xl font-bold text-white mt-12">Step 4: Enable Monitoring</h2>
                    <p>CVBER&apos;s Watchtower scans the web 24/7 for unauthorized copies of your photos.</p>

                    <h2 className="text-2xl font-bold text-white mt-12">Step 5: Add Watermarks</h2>
                    <p>Use CVBER&apos;s invisible watermark engine. Watermarks survive screenshots and resizing.</p>

                    <h2 className="text-2xl font-bold text-white mt-12">Photography-Specific Tips</h2>
                    <ul className="list-disc list-inside space-y-2">
                        <li>EXIF data in C2PA certificates proves camera model and settings</li>
                        <li>GPS data (if enabled) proves location of capture</li>
                        <li>Timestamp proves when you took the photo</li>
                        <li>Camera serial number links the photo to your specific device</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-white mt-12">Platforms That Scrape Photos</h2>
                    <ul className="list-disc list-inside space-y-2">
                        <li>Instagram (most scraped)</li>
                        <li>Flickr</li>
                        <li>500px</li>
                        <li>Unsplash</li>
                        <li>Pexels</li>
                        <li>Stock sites (Shutterstock, Getty)</li>
                    </ul>

                    <div className="mt-16 p-8 rounded-3xl bg-purple-500/10 border border-purple-500/20">
                        <h3 className="text-xl font-bold mb-4">Protect Your Photography</h3>
                        <p className="mb-6">Free C2PA certificates, DMCA automation, and monitoring for photographers.</p>
                        <Link href="/register" className="inline-block px-8 py-4 bg-white text-black rounded-full font-bold text-sm uppercase tracking-widest hover:bg-zinc-200 transition-all">Get Started Free</Link>
                    </div>
                </div>
            </article>
        </div>
    );
}
