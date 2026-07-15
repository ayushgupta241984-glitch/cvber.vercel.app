import { Metadata } from "next";
import Link from "next/link";
import BlogPostSchema from "@/components/seo/BlogPostSchema";

export const metadata: Metadata = {
 title: { absolute: "Can AI Steal Your Art? What Every Artist Needs to Know | CVBER" },
 description: "AI companies are scraping millions of images without permission. Here's what that means for your work and what you can actually do about it.",
 alternates: { canonical: "https://cvber.vercel.app/blog/can-ai-steal-your-art" },
 keywords: ["can AI steal your art", "AI art theft", "is my art safe from AI", "AI training data", "what AI companies do with your art"],
};

const faqSchema = {
 "@context": "https://schema.org",
 "@type": "FAQPage",
 mainEntity: [
 {
 "@type": "Question",
 name: "Can AI companies legally use my art?",
 acceptedAnswer: {
 "@type": "Answer",
 text: "Many AI companies scrape public images from the web and train models without explicit consent. The legality is still being debated in courts worldwide. The EU AI Act and several US lawsuits are starting to clarify that training on copyrighted work without permission is not automatically fair use."
 }
 },
 {
 "@type": "Question",
 name: "How do I know if my art was used to train an AI model?",
 acceptedAnswer: {
 "@type": "Answer",
 text: "Use HaveIBeenTrained.com to search the LAION-5B dataset used to train Stable Diffusion. You can also check if your style has been replicated by AI image generators. CVBER offers free monitoring that alerts you if your work appears in training datasets or AI-generated content."
 }
 },
 {
 "@type": "Question",
 name: "What can I do to protect my art from AI?",
 acceptedAnswer: {
 "@type": "Answer",
 text: "The best protection combines multiple layers: embed C2PA certificates to prove ownership and signal opt-out, use Glaze or Nightshade to protect against style extraction, add robots.txt directives to block crawlers, and monitor for unauthorized use. CVBER automates C2PA certificates and DMCA takedowns."
 }
 }
 ]
};

export default function CanAIStealYourArt() {
 return (
 <div className="min-h-screen bg-[#050505] text-white pt-32 pb-20 px-6">
 <BlogPostSchema
 title="Can AI Steal Your Art? What Every Artist Needs to Know"
 description="AI companies are scraping millions of images without permission. Here's what that means for your work and what you can actually do about it."
 url="https://cvber.vercel.app/blog/can-ai-steal-your-art"
 datePublished="2026-06-20"
 faqs={[
 { question: "Can AI companies legally use my art?", answer: "Many AI companies scrape public images from the web and train models without explicit consent. The legality is still being debated in courts worldwide. The EU AI Act and several US lawsuits are starting to clarify that training on copyrighted work without permission is not automatically fair use." },
 { question: "How do I know if my art was used to train an AI model?", answer: "Use HaveIBeenTrained.com to search the LAION-5B dataset used to train Stable Diffusion. You can also check if your style has been replicated by AI image generators. CVBER offers free monitoring that alerts you if your work appears in training datasets or AI-generated content." },
 { question: "What can I do to protect my art from AI?", answer: "The best protection combines multiple layers: embed C2PA certificates to prove ownership and signal opt-out, use Glaze or Nightshade to protect against style extraction, add robots.txt directives to block crawlers, and monitor for unauthorized use. CVBER automates C2PA certificates and DMCA takedowns." }
 ]}
 />

 <article className="max-w-3xl mx-auto">
 <Link href="/blog" className="text-purple-400 text-sm font-bold uppercase tracking-widest mb-8 block">&larr; Back to Blog</Link>

 <time className="text-zinc-500 text-sm">June 20, 2026 · 6 min read</time>

 <h1 className="text-4xl md:text-5xl font-black tracking-tight mt-4 mb-8 leading-tight">
 Can AI Steal Your Art? What Every Artist Needs to Know
 </h1>

 <div className="prose prose-invert max-w-none space-y-8 text-zinc-300 leading-relaxed">
 <div className="bg-purple-950/30 border border-purple-500/30 rounded-2xl p-6 mb-8">
 <p className="text-purple-400 font-bold text-sm uppercase tracking-wider mb-3">Quick Answer</p>
 <p className="text-zinc-300 leading-relaxed">
 Yes, AI companies are scraping millions of images from the web without permission. The legality is still being debated in courts. You can protect your art by embedding C2PA certificates, using tools like Glaze or Nightshade, adding robots.txt directives to your website, and monitoring for unauthorized use. CVBER automates most of these protections for free.
 </p>
 </div>

 <h2 className="text-2xl md:text-3xl font-bold text-white mt-12 mb-4">How AI companies use your art</h2>
 <p>
 Every day, AI companies scrape millions of images from DeviantArt, ArtStation, Instagram, Pinterest, and personal websites. These images are used to train image generators like Stable Diffusion, DALL-E, and MidJourney. The result? An AI model that can reproduce your style, generate images similar to your work, and compete with you for commissions.
 </p>
 <p>
 According to the Stanford AI Index Report (2026), over 92% of images scraped for AI training come from public-facing websites. Artists often never know their work was included.
 </p>

 <h2 className="text-2xl md:text-3xl font-bold text-white mt-12 mb-4">Is it legal?</h2>
 <p>
 The short answer: we don't know yet. AI companies claim scraping public images is "fair use," but artists and photographers are fighting back in court. As of mid-2026, several high-profile lawsuits are challenging whether training on copyrighted work without permission is legal.
 </p>
 <p>
 The EU AI Act now requires companies to disclose what data they used for training and to respect copyright opt-outs. California and New York are considering similar laws. But until the courts decide, the safest approach is to protect yourself.
 </p>

 <h2 className="text-2xl md:text-3xl font-bold text-white mt-12 mb-4">The 4-layer protection strategy</h2>
 <p>
 No single tool is perfect. But combining four layers makes your art much harder to steal and easier to enforce against:
 </p>
 <ol className="list-decimal list-inside space-y-3 ml-4">
 <li>
 <strong className="text-white">C2PA certificates (provenance)</strong> — These embed cryptographic proof of ownership directly into the image file. The proof travels with the image even if metadata gets stripped. Adobe, Microsoft, and Google are all backing this standard.
 </li>
 <li>
 <strong className="text-white">Glaze or Nightshade (protection)</strong> — Free tools from the University of Chicago. Glaze makes small changes that confuse AI style extraction. Nightshade goes further and introduces corruptions into AI training data.
 </li>
 <li>
 <strong className="text-white">Robots.txt (opt-out signal)</strong> — Add these directives to your website to tell AI crawlers to stay away. It won't stop determined scrapers, but it establishes your intent.
 </li>
 <li>
 <strong className="text-white">Monitoring + DMCA (enforcement)</strong> — Set up alerts, reverse image search regularly, and file DMCA takedowns when you find stolen work. CVBER automates this process.
 </li>
 </ol>

 <h2 className="text-2xl md:text-3xl font-bold text-white mt-12 mb-4">What to do right now</h2>
 <p>
 You don't need to spend money or learn a new skill. Here's your 10-minute action plan:
 </p>
 <ol className="list-decimal list-inside space-y-3 ml-4">
 <li>Go to HaveIBeenTrained.com and search for your art. See if it's in training datasets.</li>
 <li>Add a robots.txt to your website blocking AI crawlers.</li>
 <li>Upload your files to CVBER (free) and get C2PA certificates.</li>
 <li>Install Glaze if you primarily post on ArtStation or DeviantArt.</li>
 <li>Bookmark this page and check back for new updates on AI legislation.</li>
 </ol>

 <h2 className="text-2xl md:text-3xl font-bold text-white mt-12 mb-4">The reality</h2>
 <p>
 AI art scraping isn't going away. But artists who take these steps gain leverage: proof of ownership, opt-out signals, and a path to enforcement when theft happens. The artists most at risk are the ones who do nothing.
 </p>

 <div className="bg-purple-950/30 border border-purple-500/30 rounded-2xl p-6">
 <p className="text-purple-400 font-bold text-sm uppercase tracking-wider mb-3">Protect your art now</p>
 <p className="text-zinc-300 mb-4">Get free C2PA certificates for your digital work. No credit card required.</p>
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
 <Link href="/how-to-opt-out-of-ai-training" className="text-sm text-purple-400 hover:text-purple-300 transition-colors line-clamp-2">How to Stop AI Training on My Art — Step-by-step opt-out strategies...</Link>
 <Link href="/blog/is-my-art-being-used-to-train-ai" className="text-sm text-purple-400 hover:text-purple-300 transition-colors line-clamp-2">Is My Art Being Used to Train AI? — Free tools to check LAION-5B and other datasets...</Link>
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
