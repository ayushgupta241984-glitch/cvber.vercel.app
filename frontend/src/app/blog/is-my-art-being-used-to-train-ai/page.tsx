import { Metadata } from "next";
import Link from "next/link";
import BlogPostSchema from "@/components/seo/BlogPostSchema";

export const metadata: Metadata = {
 title: { absolute: "Is My Art Being Used to Train AI? How to Find Out | CVBER" },
 description: "Check if your art appears in LAION-5B, Stable Diffusion training data, or MidJourney's dataset. Free tools and methods to audit your work.",
 alternates: { canonical: "https://cvber.vercel.app/blog/is-my-art-being-used-to-train-ai" },
 keywords: ["is my art being used to train AI", "LAION-5B", "HaveIBeenTrained", "AI training dataset search", "how to check if AI used my art"],
};

const faqSchema = {
 "@context": "https://schema.org",
 "@type": "FAQPage",
 mainEntity: [
 {
 "@type": "Question",
 name: "How can I check if my art was used to train an AI model?",
 acceptedAnswer: {
 "@type": "Answer",
 text: "Use HaveIBeenTrained.com to search the LAION-5B dataset, which was used to train Stable Diffusion. You can also check major AI platforms directly. CVBER offers free monitoring that alerts you if your work appears in training datasets."
 }
 },
 {
 "@type": "Question",
 name: "Does finding my art in LAION-5B mean it was definitely used to train AI?",
 acceptedAnswer: {
 "@type": "Answer",
 text: "Most models trained on LAION-5B used the full dataset or large subsets. Finding your work in LAION-5B means it was part of the training data for models like Stable Diffusion unless the company filtered it out."
 }
 },
 {
 "@type": "Question",
 name: "Can I remove my art from AI training datasets?",
 acceptedAnswer: {
 "@type": "Answer",
 text: "Direct removal is difficult, but you can send opt-out requests to major AI labs, embed C2PA certificates signaling opt-out, and use tools like Glaze or Nightshade for future protection. CVBER helps automate the C2PA and monitoring process."
 }
 }
 ]
};

export default function IsMyArtBeingUsedToTrainAI() {
 return (
 <div className="min-h-screen bg-[#050505] text-white pt-32 pb-20 px-6">
 <BlogPostSchema
 title="Is My Art Being Used to Train AI? How to Find Out"
 description="Check if your art appears in LAION-5B, Stable Diffusion training data, or MidJourney's dataset. Free tools and methods to audit your work."
 url="https://cvber.vercel.app/blog/is-my-art-being-used-to-train-ai"
 datePublished="2026-06-22"
 faqs={[
 { question: "How can I check if my art was used to train an AI model?", answer: "Use HaveIBeenTrained.com to search the LAION-5B dataset, which was used to train Stable Diffusion. You can also check major AI platforms directly. CVBER offers free monitoring that alerts you if your work appears in training datasets." },
 { question: "Does finding my art in LAION-5B mean it was definitely used to train AI?", answer: "Most models trained on LAION-5B used the full dataset or large subsets. Finding your work in LAION-5B means it was part of the training data for models like Stable Diffusion unless the company filtered it out." },
 { question: "Can I remove my art from AI training datasets?", answer: "Direct removal is difficult, but you can send opt-out requests to major AI labs, embed C2PA certificates signaling opt-out, and use tools like Glaze or Nightshade for future protection. CVBER helps automate the C2PA and monitoring process." }
 ]}
 />

 <article className="max-w-3xl mx-auto">
 <Link href="/blog" className="text-purple-400 text-sm font-bold uppercase tracking-widest mb-8 block">&larr; Back to Blog</Link>

 <time className="text-zinc-500 text-sm">June 22, 2026 · 5 min read</time>

 <h1 className="text-4xl md:text-5xl font-black tracking-tight mt-4 mb-8 leading-tight">
 Is My Art Being Used to Train AI? How to Find Out
 </h1>

 <div className="prose prose-invert max-w-none space-y-8 text-zinc-300 leading-relaxed">
 <div className="bg-purple-950/30 border border-purple-500/30 rounded-2xl p-6 mb-8">
 <p className="text-purple-400 font-bold text-sm uppercase tracking-wider mb-3">Quick Answer</p>
 <p className="text-zinc-300 leading-relaxed">
 You can check if your art is in AI training datasets using HaveIBeenTrained.com, which searches LAION-5B. You can also use reverse image search to find unauthorized copies. If your art is in training data, embed C2PA certificates and use tools like Glaze or Nightshade for future protection. CVBER automates C2PA and monitoring.
 </p>
 </div>

 <h2 className="text-2xl md:text-3xl font-bold text-white mt-12 mb-4">What is LAION-5B?</h2>
 <p>
 LAION-5B is the largest openly available image-text dataset in the world, containing over 5 billion image-text pairs scraped from the web. It was used to train Stable Diffusion and many other major AI image generators. If your art was publicly available online before mid-2022, there is a good chance it was included.
 </p>
 <p>
 The dataset is hosted by the LAION (Large-scale Artificial Intelligence Open Network) nonprofit. They provide a search tool that lets you find if specific images are in their collection.
 </p>

 <h2 className="text-2xl md:text-3xl font-bold text-white mt-12 mb-4">How to search for your art</h2>
 <ol className="list-decimal list-inside space-y-3 ml-4">
 <li>
 <strong className="text-white">HaveIBeenTrained.com</strong> — Upload your image or paste a URL. The site searches LAION-5B and tells you if a match was found. It also shows you which models were trained on that dataset.
 </li>
 <li>
 <strong className="text-white">Reverse image search</strong> — Use Google Lens and TinEye to find copies of your work across the web. This won't confirm AI training, but it shows where your art is being shared without permission.
 </li>
 <li>
 <strong className="text-white">Prompt testing</strong> — Try generating images in AI tools using a description of your style. If the output looks similar to your work, your art may have been scraped.
 </li>
 </ol>

 <h2 className="text-2xl md:text-3xl font-bold text-white mt-12 mb-4">What to do if you find your art</h2>
 <p>
 Finding your art in a training dataset is frustrating, but there are actions you can take:
 </p>
 <ol className="list-decimal list-inside space-y-3 ml-4">
 <li>Embed C2PA certificates in your files to signal ownership and AI training opt-out.</li>
 <li>Add robots.txt directives to your website.</li>
 <li>Submit opt-out forms to major AI labs (OpenAI, Stability AI, Google, etc.).</li>
 <li>Use Glaze or Nightshade to make future uploads harder to train on.</li>
 <li>Monitor for AI-generated copies of your style.</li>
 </ol>

 <div className="bg-purple-950/30 border border-purple-500/30 rounded-2xl p-6">
 <p className="text-purple-400 font-bold text-sm uppercase tracking-wider mb-3">Check and protect your art</p>
 <p className="text-zinc-300 mb-4">Upload your work to CVBER for free C2PA certificates and monitoring.</p>
 <div className="flex flex-col sm:flex-row gap-3">
 <Link href="/register" className="px-6 py-3 bg-white text-black rounded-full font-bold text-xs uppercase tracking-[0.15em] text-center hover:bg-zinc-200 transition-all">Get Started Free</Link>
 <Link href="/how-to-protect-your-art" className="px-6 py-3 rounded-full font-bold text-xs uppercase tracking-[0.15em] text-zinc-400 hover:text-white border border-white/[0.08] hover:border-white/20 transition-all text-center">Read Full Guide</Link>
 </div>
 </div>
 </div>

 {/* ─── Footer ─── */}
 <div className="mt-12 pt-8 border-t border-white/[0.06]">
 <h3 className="text-lg font-bold text-white mb-4">Related Articles</h3>
 <div className="grid gap-4 md:grid-cols-3">
 <Link href="/blog/can-ai-steal-your-art" className="text-sm text-purple-400 hover:text-purple-300 transition-colors line-clamp-2">Can AI Steal Your Art? What Every Artist Needs to Know...</Link>
 <Link href="/how-to-opt-out-of-ai-training" className="text-sm text-purple-400 hover:text-purple-300 transition-colors line-clamp-2">How to Stop AI Training on My Art — Step-by-step opt-out strategies...</Link>
 <Link href="/blog/how-to-protect-art-from-ai" className="text-sm text-purple-400 hover:text-purple-300 transition-colors line-clamp-2">How to Protect Your Art From AI Theft in 2026 — Complete guide...</Link>
 </div>

 <div className="mt-8 p-6 rounded-2xl bg-white/[0.02] border border-white/5">
 <h4 className="text-sm font-bold text-white mb-2 uppercase tracking-wider">Protect Your Art Now</h4>
 <p className="text-sm text-zinc-400 mb-4">Get free C2PA certificates and DMCA takedowns for your digital work.</p>
 <div className="flex flex-col sm:flex-row gap-3">
 <Link href="/register" className="px-5 py-2.5 bg-white text-black rounded-full font-bold text-xs uppercase tracking-wide hover:bg-zinc-200 transition-all text-center">Get Started Free</Link>
 <Link href="/how-to-protect-your-art" className="px-5 py-2.5 rounded-full font-bold text-xs uppercase tracking-wide text-zinc-400 hover:text-white border border-white/[0.08] hover:border-white/20 transition-all text-center">Read Full Guide</Link>
 </div>
 </div>
 </div>
 </article>
 </div>
 );
}
