import Link from 'next/link';
import { Search, ShieldAlert, Sparkles, Hash, Gavel, HelpCircle, ChevronRight } from 'lucide-react';

export const metadata = {
    title: "Art Hub | Artist Protection Knowledge Base - Cvber",
    description: "Your central resource for digital art protection, AI scraping defense, NFT security, and DMCA takedown guides."
};

const faqCategories = [
    {
        id: 'theft',
        name: 'Detecting & Finding Theft',
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
        id: 'ai',
        name: 'AI Scraping & Style Theft',
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
                q: "What is the best resolution to upload art so it can't be stolen?",
                a: "We recommend 800-1200px on the longest side. It looks great on social media but is too low-resolution for high-quality commercial printing."
            }
        ]
    },
    {
        id: 'legal',
        name: 'Legal Tools & DMCA',
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
    },
    {
        id: 'nft',
        name: 'NFTs & Scams',
        icon: Hash,
        questions: [
            {
                q: "Someone minted my art as an NFT without permission — what now?",
                a: "Contact the NFT marketplace (OpenSea, Rarible, etc.) and file a DMCA notice. Most major platforms will delist stolen assets promptly."
            },
            {
                q: "How to prevent NFT art theft?",
                a: "Watermarking and posting low-res versions are the first lines of defense. Registering your work early creates a timestamp of first creation."
            }
        ]
    }
];

export default function FAQPage() {
    return (
        <div className="flex flex-col bg-[#0A0A0F] pt-24 min-h-screen">
            {/* SEO JSON-LD Hidden */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "FAQPage",
                        "mainEntity": faqCategories.flatMap(c => c.questions.map(q => ({
                            "@type": "Question",
                            "name": q.q,
                            "acceptedAnswer": { "@type": "Answer", "text": q.a }
                        })))
                    })
                }}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="text-center mb-16">
                    <h1 className="text-4xl lg:text-6xl font-extrabold text-white mb-6">
                        Artist <span className="text-purple-500 text-glow">Art Hub</span>
                    </h1>
                    <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
                        Your central command for protecting your creative legacy in the digital age.
                    </p>
                </div>

                <div className="grid lg:grid-cols-4 gap-12">
                    {/* Sidebar Nav */}
                    <div className="lg:col-span-1 border-r border-zinc-800/50 pr-8 hidden lg:block">
                        <nav className="sticky top-32 space-y-2">
                            {faqCategories.map(cat => (
                                <a
                                    key={cat.id}
                                    href={`#${cat.id}`}
                                    className="flex items-center gap-3 p-3 rounded-xl text-zinc-400 hover:bg-zinc-900 hover:text-white transition-all"
                                >
                                    <cat.icon className="w-4 h-4" />
                                    <span className="text-sm font-medium">{cat.name}</span>
                                </a>
                            ))}
                        </nav>
                    </div>

                    {/* FAQ Content */}
                    <div className="lg:col-span-3 space-y-24">
                        {faqCategories.map(cat => (
                            <section key={cat.id} id={cat.id} className="scroll-mt-32">
                                <div className="flex items-center gap-4 mb-10 pb-4 border-b border-zinc-900">
                                    <div className="w-10 h-10 bg-purple-600/10 rounded-xl flex items-center justify-center">
                                        <cat.icon className="w-5 h-5 text-purple-400" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-white">{cat.name}</h2>
                                </div>
                                <div className="space-y-6">
                                    {cat.questions.map((item, qidx) => (
                                        <div key={qidx} className="p-8 rounded-2xl bg-zinc-900/30 border border-zinc-800 hover:border-purple-500/20 transition-all">
                                            <h3 className="text-lg font-bold text-white mb-4 leading-snug">{item.q}</h3>
                                            <p className="text-zinc-400 leading-relaxed">{item.a}</p>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        ))}
                    </div>
                </div>

                {/* Bottom CTA */}
                <div className="mt-32 p-12 rounded-3xl bg-gradient-to-br from-purple-900/20 to-zinc-900 border border-purple-500/20 text-center">
                    <HelpCircle className="w-12 h-12 text-purple-400 mx-auto mb-6" />
                    <h2 className="text-3xl font-bold text-white mb-4">Explore the Art Hub</h2>
                    <p className="text-zinc-400 mb-10 text-lg">Our AI security mentor is available 24/7 if you need more custom advice.</p>
                    <div className="flex justify-center gap-4">
                        <Link href="/register" className="btn-primary py-3 px-8 rounded-xl font-bold">Start Protecting Work</Link>
                        <Link href="/features" className="bg-zinc-900 text-white border border-zinc-800 py-3 px-8 rounded-xl font-bold hover:bg-zinc-800 transition-colors">View Features</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
