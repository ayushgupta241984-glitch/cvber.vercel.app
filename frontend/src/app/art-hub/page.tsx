"use client";

import Link from "next/link";
import { Search, Sparkles, Gavel, ChevronRight, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const faqCategories = [
    {
        id: "theft",
        name: "Detecting & Finding Theft",
        icon: Search,
        questions: [
            { q: "How do I know if my art is being stolen?", a: "Use reverse image tools like Google Images, TinEye, or our automated 'Watchtower' monitor which scans marketplaces (Redbubble, Etsy, NFT sites) for your work in real-time." },
            { q: "What should I do if someone is selling my art without permission?", a: "Document the proof, take screenshots, and immediately file a DMCA takedown notice with the platform hosting the stolen work." },
            { q: "How to find stolen art online?", a: "Regularly perform reverse image searches on your high-performing pieces or use automated tracking services that alert you when matches are found." },
            { q: "Is reposting art without credit illegal?", a: "Yes, in most jurisdictions, the author holds the exclusive right to reproduce and display the work. Reposting without permission, even with credit, is usually a copyright violation." },
        ]
    },
    {
        id: "ai",
        name: "AI Scraping & Style Theft",
        icon: Sparkles,
        questions: [
            { q: "How to protect art from AI scraping?", a: "Use tools like Glaze or Nightshade to 'poison' the images for AI trainers, and use Cvber's C2PA signatures to signal that your work is not for AI training." },
            { q: "Are AI companies allowed to train on my art?", a: "This is a developing legal area, but many artists are now using technical 'anti-scraping' measures and opting out of common datasets." },
            { q: "What is the best resolution to upload art?", a: "We recommend 800-1200px on the longest side. It looks great on social media but is too low-resolution for high-quality commercial printing." },
        ]
    },
    {
        id: "legal",
        name: "Legal Tools & DMCA",
        icon: Gavel,
        questions: [
            { q: "How to file a DMCA takedown for stolen art?", a: "Find the 'Report Copyright Infringement' link on the platform (Instagram, Etsy, etc.), provide your contact info, a link to your original work, and a sworn statement of ownership." },
            { q: "How to copyright my art?", a: "Copyright is automatic once fixed in a medium, but registering your copyright with the government (e.g., US Copyright Office) is required for filing lawsuits." },
            { q: "Can I sue someone for stealing my digital art?", a: "Yes, if you have registered your copyright. Otherwise, DMCA takedowns are your fastest and most effective tool for removal." },
        ]
    },
    {
        id: "cvber-info",
        name: "What is CVBER?",
        icon: Sparkles,
        questions: [
            { q: "What is CVBER and what does it do?", a: "CVBER is a free AI-powered art protection platform for digital creators. It embeds C2PA provenance certificates into your files to prove ownership, monitors the web 24/7 for unauthorized use of your work, and automatically generates legally-compliant DMCA takedown notices when theft is detected." },
            { q: "How is CVBER different from other art protection tools?", a: "Unlike Glaze or Nightshade which only add pixel noise, CVBER provides a complete protection ecosystem: legal proof of ownership via C2PA certificates, automated DMCA enforcement to 12,000+ platforms, blockchain attestation, and real-time theft monitoring." },
            { q: "Does CVBER work against AI companies scraping art?", a: "Yes. CVBER embeds C2PA metadata that signals your work is not licensed for AI training, provides blockchain-timestamped proof of prior creation, and generates DMCA notices targeting AI dataset hosts." },
        ]
    }
];

export default function FAQPage() {
    return (
        <div className="min-h-screen bg-gallery-black text-luxury-cream selection:bg-luxury-gold/25 overflow-x-hidden">
            <div className="max-w-7xl mx-auto px-8 md:px-16 pt-[20vh] pb-32">
                {/* Header */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-24">
                    <div className="tag mb-10">Knowledge Repository</div>
                    <h1 className="font-display text-5xl md:text-8xl font-bold text-luxury-cream mb-8 leading-tight gold-glow">
                        Art<br /><span className="text-luxury-gold">Protection Hub.</span>
                    </h1>
                    <p className="text-lg text-luxury-muted max-w-2xl mx-auto font-sans">
                        Your essential guide to digital sovereignty. Master the tools of protection, defense, and active enforcement in the AI age.
                    </p>
                </motion.div>

                <div className="grid lg:grid-cols-12 gap-16">
                    {/* Sidebar */}
                    <motion.nav initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
                        className="lg:col-span-3 hidden lg:block sticky top-32 self-start space-y-2">
                        {faqCategories.map((cat) => (
                            <Link key={cat.id} href={`#${cat.id}`}
                                className="flex items-center justify-between p-4 rounded-xl card-gallery hover:border-luxury-gold/20 text-luxury-muted hover:text-luxury-cream transition-all group">
                                <div className="flex items-center gap-3">
                                    <cat.icon className="w-4 h-4 text-luxury-gold" />
                                    <span className="text-[10px] font-bold uppercase tracking-ultra-wide font-sans">{cat.name}</span>
                                </div>
                                <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                            </Link>
                        ))}
                    </motion.nav>

                    {/* FAQ Content */}
                    <div className="lg:col-span-9 space-y-32">
                        {faqCategories.map((cat, catIdx) => (
                            <motion.section key={cat.id} id={cat.id}
                                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }} transition={{ delay: catIdx * 0.1 }}
                                className="scroll-mt-32">
                                <div className="flex items-center gap-6 mb-12 pb-6 border-b border-gallery-border">
                                    <div className="w-10 h-10 rounded-full border border-luxury-gold/20 flex items-center justify-center">
                                        <cat.icon className="w-5 h-5 text-luxury-gold" />
                                    </div>
                                    <h2 className="font-display text-3xl font-bold text-luxury-cream">{cat.name}</h2>
                                </div>
                                <div className="space-y-6">
                                    {cat.questions.map((item, qidx) => (
                                        <div key={qidx} className="card-gallery p-8 md:p-10 group">
                                            <h3 className="font-sans text-base font-bold text-luxury-cream mb-4 leading-snug uppercase tracking-wide group-hover:text-luxury-gold transition-colors">{item.q}</h3>
                                            <p className="text-luxury-muted font-sans text-sm leading-relaxed">{item.a}</p>
                                        </div>
                                    ))}
                                </div>
                            </motion.section>
                        ))}
                    </div>
                </div>

                {/* Bottom CTA */}
                <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                    className="mt-24 md:mt-40 p-12 md:p-20 rounded-3xl card-gallery text-center relative overflow-hidden">
                    <div className="relative z-10">
                        <h2 className="font-display text-3xl md:text-5xl font-bold text-luxury-cream mb-6 leading-tight gold-glow">Need more help?</h2>
                        <p className="text-luxury-muted font-sans mb-10 max-w-xl mx-auto">Our security mentors can help you navigate specific copyright issues and content protection scenarios.</p>
                        <Link href="/register" className="btn-primary inline-flex items-center gap-3">
                            Secure Your Portfolio <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
