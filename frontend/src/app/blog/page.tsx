import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: { absolute: "Blog — AI Art Protection Guides & Tips | CVBER" },
    description: "Learn how to protect your digital art from AI theft, file DMCA takedowns, get C2PA certificates, and stop AI companies from using your work without permission.",
    alternates: { canonical: "https://cvber.vercel.app/blog" },
};

const posts = [
    {
        slug: "how-to-protect-art-from-ai",
        title: "How to Protect Your Art From AI Theft in 2026",
        excerpt: "Complete guide to protecting digital art from AI scraping. Learn about C2PA certificates, DMCA takedowns, Glaze, Nightshade, and more.",
        date: "2026-06-01",
        readTime: "8 min read",
    },
    {
        slug: "c2pa-explained",
        title: "C2PA Certificates Explained: What Artists Need to Know",
        excerpt: "What is C2PA? How does it work? Why should artists care? Everything you need to know about the content authenticity standard.",
        date: "2026-05-28",
        readTime: "6 min read",
    },
    {
        slug: "dmca-guide-for-artists",
        title: "DMCA Takedown Guide for Artists: How to Get Stolen Art Removed",
        excerpt: "Step-by-step guide to filing DMCA takedown notices. Templates, platforms, timelines, and what to do if a site ignores your notice.",
        date: "2026-05-25",
        readTime: "10 min read",
    },
];

export default function BlogIndex() {
    return (
        <div className="min-h-screen bg-[#050505] text-white pt-32 pb-20 px-6">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6">Blog</h1>
                <p className="text-xl text-zinc-400 mb-16 max-w-2xl">
                    Guides, tutorials, and news about AI art protection, C2PA certificates, DMCA takedowns, and digital copyright.
                </p>

                <div className="space-y-8">
                    {posts.map((post) => (
                        <Link
                            key={post.slug}
                            href={`/blog/${post.slug}`}
                            className="block p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-purple-500/30 transition-all group"
                        >
                            <div className="flex items-center gap-4 mb-4 text-sm text-zinc-500">
                                <time dateTime={post.date}>{new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</time>
                                <span>·</span>
                                <span>{post.readTime}</span>
                            </div>
                            <h2 className="text-2xl font-bold mb-3 group-hover:text-purple-400 transition-colors">{post.title}</h2>
                            <p className="text-zinc-400 leading-relaxed">{post.excerpt}</p>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
