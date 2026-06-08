import React from 'react';

interface SEOLandingPageProps {
    title: string;
    subtitle: string;
    h1: string;
    description: string;
    faqs: { question: string; answer: string }[];
    features: { title: string; description: string }[];
    platform?: string;
    canonical: string;
}

export default function SEOLandingPage({
    title,
    subtitle,
    h1,
    description,
    faqs,
    features,
    platform,
    canonical,
}: SEOLandingPageProps) {
    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqs.map(faq => ({
            "@type": "Question",
            "name": faq.question,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.answer
            }
        }))
    };

    const howToSchema = {
        "@context": "https://schema.org",
        "@type": "HowTo",
        "name": `How to Protect Your ${platform || 'Digital'} Art From AI Theft`,
        "description": description,
        "totalTime": "PT10M",
        "estimatedCost": {
            "@type": "MonetaryAmount",
            "currency": "USD",
            "value": "0"
        },
        "step": [
            {
                "@type": "HowToStep",
                "name": "Sign Up for Free",
                "text": "Create a free CVBER account to access all protection tools.",
                "url": "https://cvber.vercel.app/register"
            },
            {
                "@type": "HowToStep",
                "name": "Upload Your Artwork",
                "text": "Upload your digital art files. CVBER automatically creates a digital fingerprint.",
                "url": "https://cvber.vercel.app/register"
            },
            {
                "@type": "HowToStep",
                "name": "Activate Protection",
                "text": "Enable C2PA certificates, monitoring, and DMCA automation.",
                "url": "https://cvber.vercel.app/features"
            }
        ]
    };

    const softwareSchema = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "CVBER",
        "applicationCategory": "SecurityApplication",
        "operatingSystem": "Web",
        "url": "https://cvber.vercel.app",
        "description": "Free AI-powered art protection platform. Get C2PA provenance certificates, automated DMCA takedowns, AI theft detection, and blockchain ownership proof.",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD",
            "availability": "https://schema.org/InStock"
        },
        "featureList": [
            "C2PA Digital Provenance Certificates",
            "Automated DMCA Takedown Generator",
            "AI-Powered Theft Detection",
            "Blockchain Ownership Attestation",
            "Invisible Watermark Engine",
            "Real-time Web Monitoring",
            "Reverse Image Search"
        ]
    };

    const organizationSchema = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "CVBER",
        "url": "https://cvber.vercel.app",
        "logo": "https://cvber.vercel.app/icon.png",
        "description": "CVBER builds AI-powered content protection tools for digital creators.",
        "sameAs": [
            "https://twitter.com/cvberapp",
            "https://instagram.com/cvber"
        ]
    };

    const speakableSchema = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": `${h1} | CVBER`,
        "url": canonical,
        "speakable": {
            "@type": "SpeakableSpecification",
            "cssSelector": ["h1", "h2"]
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(speakableSchema) }}
            />

            {/* Hero */}
            <section className="pt-32 pb-20 px-6 max-w-5xl mx-auto">
                <p className="text-purple-400 text-sm font-bold uppercase tracking-widest mb-4">{subtitle}</p>
                <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6 leading-tight">{h1}</h1>
                <p className="text-xl text-zinc-400 max-w-3xl leading-relaxed mb-8">{description}</p>
                <div className="flex gap-4">
                    <a href="/register" className="px-8 py-4 bg-white text-black rounded-full font-bold text-sm uppercase tracking-widest hover:bg-zinc-200 transition-all">
                        Start Free Protection
                    </a>
                    <a href="/features" className="px-8 py-4 border border-white/20 rounded-full font-bold text-sm uppercase tracking-widest hover:bg-white/5 transition-all">
                        See Features
                    </a>
                </div>
            </section>

            {/* Features */}
            <section className="py-20 px-6 max-w-5xl mx-auto border-t border-white/5">
                <h2 className="text-3xl font-black tracking-tight mb-12">Why CVBER for {platform || 'Art'} Protection</h2>
                <div className="grid md:grid-cols-2 gap-8">
                    {features.map((feature, i) => (
                        <div key={i} className="p-8 rounded-3xl bg-white/[0.02] border border-white/5">
                            <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                            <p className="text-zinc-400 leading-relaxed">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* How It Works */}
            <section className="py-20 px-6 max-w-5xl mx-auto border-t border-white/5">
                <h2 className="text-3xl font-black tracking-tight mb-12">How It Works</h2>
                <div className="space-y-8">
                    <div className="flex gap-6 items-start">
                        <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center font-black text-purple-400 shrink-0">1</div>
                        <div>
                            <h3 className="text-xl font-bold mb-2">Upload Your Artwork</h3>
                            <p className="text-zinc-400">Create a free account and upload your digital art files. CVBER automatically extracts metadata and creates a unique digital fingerprint for each piece.</p>
                        </div>
                    </div>
                    <div className="flex gap-6 items-start">
                        <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center font-black text-purple-400 shrink-0">2</div>
                        <div>
                            <h3 className="text-xl font-bold mb-2">Get Your C2PA Certificate</h3>
                            <p className="text-zinc-400">CVBER generates a cryptographic C2PA provenance certificate that proves you are the original creator. This is recognized by Adobe, Microsoft, Google, and major tech companies.</p>
                        </div>
                    </div>
                    <div className="flex gap-6 items-start">
                        <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center font-black text-purple-400 shrink-0">3</div>
                        <div>
                            <h3 className="text-xl font-bold mb-2">Activate 24/7 Monitoring</h3>
                            <p className="text-zinc-400">Turn on Watchtower to continuously scan {platform ? `${platform} and other platforms` : 'social media platforms'} for unauthorized copies. When theft is detected, CVBER automatically generates DMCA takedown notices.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="py-20 px-6 max-w-5xl mx-auto border-t border-white/5">
                <h2 className="text-3xl font-black tracking-tight mb-12">Frequently Asked Questions</h2>
                <div className="space-y-6">
                    {faqs.map((faq, i) => (
                        <div key={i} className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                            <h3 className="text-lg font-bold mb-3">{faq.question}</h3>
                            <p className="text-zinc-400 leading-relaxed">{faq.answer}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 px-6 max-w-5xl mx-auto">
                <div className="p-12 rounded-[3rem] bg-gradient-to-br from-purple-600 to-purple-800 text-center">
                    <h2 className="text-4xl font-black tracking-tight mb-4">Protect Your Art Today</h2>
                    <p className="text-purple-100/70 mb-8 max-w-xl mx-auto">Join thousands of artists using CVBER to protect their creative work from AI theft and unauthorized use.</p>
                    <a href="/register" className="px-10 py-5 bg-white text-black rounded-full font-bold text-sm uppercase tracking-widest hover:bg-zinc-100 transition-all inline-block">
                        Get Started Free
                    </a>
                </div>
            </section>
        </div>
    );
}
