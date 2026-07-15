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
 date: "2026-06-15",
 readTime: "8 min read",
 },
 {
 slug: "can-ai-steal-your-art",
 title: "Can AI Steal Your Art? What Every Artist Needs to Know",
 excerpt: "AI companies are scraping millions of images without permission. Here's what that means for your work and what you can actually do about it.",
 date: "2026-06-20",
 readTime: "6 min read",
 },
 {
 slug: "how-to-opt-out-of-ai-training",
 title: "How to Stop AI Training on My Art",
 excerpt: "Step-by-step opt-out strategies: robots.txt, Glaze, Nightshade, C2PA certificates, and how to find out if your art was already scraped.",
 date: "2026-06-18",
 readTime: "7 min read",
 },
 {
 slug: "is-my-art-being-used-to-train-ai",
 title: "Is My Art Being Used to Train AI? How to Find Out",
 excerpt: "Check if your art appears in LAION-5B, Stable Diffusion training data, or MidJourney's dataset. Free tools and methods to audit your work.",
 date: "2026-06-22",
 readTime: "5 min read",
 },
 {
 slug: "c2pa-explained",
 title: "C2PA Certificates Explained: What Artists Need to Know",
 excerpt: "What is C2PA? How does it work? Why should artists care? Everything you need to know about the content authenticity standard backed by Adobe, Microsoft, and Google.",
 date: "2026-06-10",
 readTime: "6 min read",
 },
 {
 slug: "dmca-guide-for-artists",
 title: "DMCA Takedown Guide for Artists: How to Get Stolen Art Removed",
 excerpt: "Step-by-step guide to filing DMCA takedown notices. Templates, platforms, timelines, and what to do if a site ignores your notice.",
 date: "2026-06-08",
 readTime: "10 min read",
 },
 {
 slug: "best-free-art-protection-tools",
 title: "Best Free Art Protection Tools in 2026",
 excerpt: "We tested every free tool for protecting digital art from AI scraping and theft. Here's what actually works without costing you a dime.",
 date: "2026-06-05",
 readTime: "9 min read",
 },
 {
 slug: "glaze-vs-nightshade",
 title: "Glaze vs Nightshade: Which Tool Is Right for You?",
 excerpt: "Both are free tools from the University of Chicago that protect against AI scraping. Here's how they differ and which one you should use.",
 date: "2026-06-12",
 readTime: "7 min read",
 },
 {
 slug: "ai-training-opt-out",
 title: "How to Opt Out of AI Training: Complete Guide",
 excerpt: "Major AI labs now offer opt-out forms. Here's how to submit yours, plus additional protection steps that actually work.",
 date: "2026-06-03",
 readTime: "5 min read",
 },
 {
 slug: "copyright-protection-for-photographers",
 title: "Copyright Protection for Photographers in the AI Era",
 excerpt: "Photographers face unique challenges with AI image generators. Learn how to protect your photos and what legal rights you actually have.",
 date: "2026-05-30",
 readTime: "8 min read",
 },
 {
 slug: "nft-art-protection",
 title: "NFTs and Art Protection: What Actually Works",
 excerpt: "Can NFTs protect your art from theft? The honest answer, plus better alternatives for digital artists in 2026.",
 date: "2026-05-25",
 readTime: "6 min read",
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
