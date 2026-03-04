"use client";

import Link from "next/link";
import { Search, Sparkles, Gavel, ChevronRight, Zap, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const faqCategories = [
    {
        id: "theft",
        name: "Detecting & Finding Theft",
        icon: Search,
        questions: [
            {
                q: "How do I know if my art is being stolen?",
                a: "Use reverse image tools like Google Images, TinEye, or our automated 'Watchtower' monitor which scans marketplaces (Redbubble, Etsy, NFT sites) for your work in real-time."
            },
            {
                q: "What should I do if someone is selling my art without permission?",
                a: "Document the proof, take screenshots, and immediately file a DMCA takedown notice with the platform hosting the stolen work."
            },
            {
                q: "How to find stolen art online?",
                a: "Regularly perform reverse image searches on your high-performing pieces or use automated tracking services that alert you when matches are found."
            },
            {
                q: "Is reposting art without credit illegal?",
                a: "Yes, in most jurisdictions, the author holds the exclusive right to reproduce and display the work. Reposting without permission, even with credit, is usually a copyright violation."
            }
        ]
    },
    {
        id: "ai",
        name: "AI Scraping & Style Theft",
        icon: Sparkles,
        questions: [
            {
                q: "How to protect art from AI scraping?",
                a: "Use tools like Glaze or Nightshade to 'poison' the images for AI trainers, and use Cvber's C2PA signatures to signal that your work is not for AI training."
            },
            {
                q: "Are AI companies allowed to train on my art?",
                a: "This is a developing legal area, but many artists are now using technical 'anti-scraping' measures and opting out of common datasets."
            },
            {
                q: "What is the best resolution to upload art?",
                a: "We recommend 800-1200px on the longest side. It looks great on social media but is too low-resolution for high-quality commercial printing."
            }
        ]
    },
    {
        id: "legal",
        name: "Legal Tools & DMCA",
        icon: Gavel,
        questions: [
            {
                q: "How to file a DMCA takedown for stolen art?",
                a: "Find the 'Report Copyright Infringement' link on the platform (Instagram, Etsy, etc.), provide your contact info, a link to your original work, and a sworn statement of ownership."
            },
            {
                q: "How to copyright my art?",
                a: "Copyright is automatic once fixed in a medium, but registering your copyright with the government (e.g., US Copyright Office) is required for filing lawsuits."
            },
            {
                q: "Can I sue someone for stealing my digital art?",
                a: "Yes, if you have registered your copyright. Otherwise, DMCA takedowns are your fastest and most effective tool for removal."
            }
        ]
    }
];

export default function FAQPage() {
    return (
        <div className="relative min-h-screen bg-[#050505] text-white selection:bg-purple-500/30 overflow-x-hidden font-sans">
            {/* Persistent Grid Background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
                <div className="absolute inset-x-0 top-0 h-[800px] bg-gradient-to-b from-purple-500/10 via-transparent to-transparent opacity-60" />
            </div>

            <div className="max-w-7xl mx-auto px-6 pt-[20vh] pb-32 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-24"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-purple-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-10">
                        Knowledge Repository v2.0
                    </div>
                    <h1 className="text-5xl md:text-8xl font-black tracking-tighter mb-8 uppercase italic leading-none">
                        Art <br /> <span className="text-glow">Protection Hub.</span>
                    </h1>
                    <p className="text-lg md:text-xl text-zinc-500 max-w-2xl mx-auto font-medium">
                        Your essential guide to digital sovereignty. Master the tools of protection,
                        defense, and active enforcement in the AI age.
                    </p>
                </motion.div>

                <div className="grid lg:grid-cols-12 gap-16">
                    {/* Sidebar Nav */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="lg:col-span-3 hidden lg:block"
                    >
                        <nav className="sticky top-40 space-y-3">
                            {faqCategories.map((cat) => (
                                <Link
                                    key={cat.id}
                                    href={`#${cat.id}`}
                                    className="flex items-center justify-between p-4 md:p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-purple-500/20 text-zinc-500 hover:text-white transition-all group"
                                >
                                    <div className="flex items-center gap-3">
                                        <cat.icon className="w-4 h-4 group-hover:text-purple-500 transition-colors" />
                                        <span className="text-xs font-black uppercase tracking-widest">{cat.name}</span>
                                    </div>
                                    <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                                </Link>
                            ))}
                        </nav>
                    </motion.div>

                    {/* FAQ Content */}
                    <div className="lg:col-span-9 space-y-32">
                        {faqCategories.map((cat, catIdx) => (
                            <motion.section
                                key={cat.id}
                                id={cat.id}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: catIdx * 0.1 }}
                                className="scroll-mt-40"
                            >
                                <div className="flex items-center gap-6 mb-12 pb-6 border-b border-white/5">
                                    <div className="w-12 h-12 bg-purple-500/10 border border-purple-500/20 rounded-2xl flex items-center justify-center">
                                        <cat.icon className="w-6 h-6 text-purple-500" />
                                    </div>
                                    <h2 className="text-3xl font-black text-white italic uppercase tracking-tight">{cat.name}</h2>
                                </div>
                                <div className="space-y-8">
                                    {cat.questions.map((item, qidx) => (
                                        <div key={qidx} className="p-10 rounded-[2.5rem] bg-[#0D0D10] border border-white/5 hover:border-white/10 transition-all group shadow-xl">
                                            <h3 className="text-xl font-black text-white mb-6 leading-snug uppercase tracking-tight italic group-hover:text-purple-400 transition-colors">{item.q}</h3>
                                            <p className="text-zinc-500 font-medium leading-relaxed text-lg">{item.a}</p>
                                        </div>
                                    ))}
                                </div>
                            </motion.section>
                        ))}
                    </div>
                </div>

                {/* Bottom CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mt-24 md:mt-40 p-12 md:p-20 rounded-[3rem] md:rounded-[4rem] bg-gradient-to-br from-[#0D0D10] to-black border border-white/5 text-center relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:30px_30px]" />
                    <div className="relative z-10">
                        <div className="w-14 h-14 md:w-16 md:h-16 bg-purple-500/10 border border-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 md:mb-8">
                            <Zap className="w-7 h-7 md:w-8 md:h-8 text-purple-500" />
                        </div>
                        <h2 className="text-3xl md:text-6xl font-black text-white mb-6 md:mb-8 uppercase italic leading-none">Need more help?</h2>
                        <p className="text-zinc-500 mb-8 md:mb-12 text-base md:text-xl font-medium max-w-xl mx-auto">Our security mentors can help you navigate specific copyright issues and content protection scenarios.</p>
                        <Link href="/register" className="px-8 md:px-10 py-4 md:py-5 bg-white text-black rounded-full font-black text-xs uppercase tracking-[0.2em] hover:bg-zinc-200 transition-all active:scale-95 shadow-2xl inline-flex items-center gap-3">
                            Secure Your Portfolio <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
