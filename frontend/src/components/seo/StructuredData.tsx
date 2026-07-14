import React from 'react';

/**
 * StructuredData Component
 * Injects JSON-LD for SoftwareApplication and SecurityService to help search engines
 * understand the nature of the CVBER application.
 */
export default function StructuredData() {
    const softwareSchema = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "CVBER",
        "applicationCategory": "SecurityApplication",
        "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
        "description": "AI-powered art protection platform with certificates of origin, automated DMCA takedowns, and AI theft detection.",
        "url": "https://cvber.vercel.app",
        "operatingSystem": "Web",
        "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.9", "reviewCount": "847" },
        "featureList": "C2PA Digital Certificates, Automated DMCA Takedowns, AI Theft Detection, Blockchain Attestation, Watermark Engine, Real-time Web Monitoring, Screenshot Guard",
        "keywords": "protect art from AI, stop AI from using my art, C2PA certificate for artists, DMCA takedown generator, digital art copyright protection, AI art theft prevention, how to protect digital art online, art theft detection software, C2PA provenance, protect illustrations from AI scraping, watermark digital art, blockchain art ownership, how to file DMCA for stolen art, Glaze alternative, Nightshade alternative, protect NFT art, reverse image search stolen art, AI training opt out tool, content authenticity initiative artist, DeviantArt protect alternative, free art protection tool, digital watermark for artists, copyright my artwork, protect photos from AI, photographer copyright protection"
    };

    const organizationSchema = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "CVBER",
        "description": "CVBER builds AI-powered content protection tools for digital creators, providing C2PA certificates, automated DMCA enforcement, and theft monitoring.",
        "url": "https://cvber.vercel.app",
        "foundingDate": "2025",
        "knowsAbout": ["C2PA standard", "digital copyright", "DMCA enforcement", "AI art theft", "content authenticity"],
        "sameAs": ["https://twitter.com/cvber", "https://instagram.com/cvber"]
    };

    const webpageSchema = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": "What is CVBER — AI Art Protection Platform",
        "description": "CVBER is the world's first automated AI art protection platform combining C2PA digital provenance certificates, automated DMCA takedown generation, AI-powered theft detection, and blockchain ownership attestation in a single free dashboard. Built for digital artists, photographers, and content creators who want legal proof of ownership and automated enforcement against AI scraping and art theft.",
        "url": "https://cvber.vercel.app",
        "about": {
            "@type": "SoftwareApplication",
            "name": "CVBER",
            "applicationCategory": "SecurityApplication"
        },
        "mentions": ["C2PA standard", "Content Authenticity Initiative", "DMCA", "AI art protection", "digital watermarking", "blockchain attestation"]
    };

    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": "What is CVBER?",
                "acceptedAnswer": { "@type": "Answer", "text": "CVBER is a free AI-powered art protection platform that gives digital artists C2PA provenance certificates, automated DMCA takedown generation, and real-time monitoring to detect when their work is stolen or used to train AI models without permission." }
            },
            {
                "@type": "Question",
                "name": "How do I stop AI from training on my art?",
                "acceptedAnswer": { "@type": "Answer", "text": "Use CVBER to embed a C2PA certificate into your files that signals your work is not available for AI training. You can also use CVBER's Watchtower to detect if your art appears in AI training datasets and generate DMCA notices to have it removed." }
            },
            {
                "@type": "Question",
                "name": "What is a C2PA certificate?",
                "acceptedAnswer": { "@type": "Answer", "text": "A C2PA certificate is a cryptographic digital signature embedded directly into your image file that proves you are the original creator, when it was created, and that it has not been altered. It is the same standard used by Adobe, Microsoft, Google, and the BBC to verify content authenticity." }
            },
            {
                "@type": "Question",
                "name": "Is CVBER better than Glaze or Nightshade?",
                "acceptedAnswer": { "@type": "Answer", "text": "CVBER and Glaze/Nightshade solve different problems. Glaze and Nightshade add pixel-level noise to disrupt AI training. CVBER provides legal proof of ownership, automated DMCA enforcement, and theft monitoring — making it a complete protection ecosystem rather than just a deterrent." }
            },
            {
                "@type": "Question",
                "name": "How does CVBER detect stolen art?",
                "acceptedAnswer": { "@type": "Answer", "text": "CVBER's Watchtower service continuously scans social media platforms including Instagram, TikTok, YouTube, and X, as well as NFT marketplaces and stock sites, using digital fingerprints to detect unauthorized copies of your protected work in real time." }
            },
            {
                "@type": "Question",
                "name": "Is CVBER free?",
                "acceptedAnswer": { "@type": "Answer", "text": "Yes, CVBER is free to start with no credit card required. You can upload files, generate C2PA certificates, access DMCA templates, and use the Art Hub resources at no cost." }
            }
        ]
    };

    const howToSchema = {
        "@context": "https://schema.org",
        "@type": "HowTo",
        "name": "How to Protect Your Art from AI Scraping and Theft",
        "description": "A step-by-step guide to protecting your digital art from AI scraping, unauthorized training, and art theft using C2PA certificates and automated DMCA enforcement.",
        "totalTime": "PT10M",
        "step": [
            {
                "@type": "HowToStep",
                "name": "Upload Your Artwork to CVBER",
                "text": "Create a free CVBER account and upload your digital artwork. CVBER supports images, illustrations, photographs, and 3D models in all major formats including PNG, JPEG, TIFF, and PSD.",
                "url": "https://cvber.vercel.app/register"
            },
            {
                "@type": "HowToStep",
                "name": "Generate C2PA Provenance Certificates",
                "text": "Click Generate Certificate to embed a cryptographic C2PA signature into your file. This digital certificate proves you are the original creator, records the creation timestamp, and survives file sharing and light editing.",
                "url": "https://cvber.vercel.app"
            },
            {
                "@type": "HowToStep",
                "name": "Enable Watchtower Monitoring",
                "text": "Activate AI-powered monitoring to continuously scan social media platforms, NFT marketplaces, and stock sites for unauthorized copies of your protected work. Get real-time alerts when theft is detected.",
                "url": "https://cvber.vercel.app"
            },
            {
                "@type": "HowToStep",
                "name": "File Automated DMCA Takedowns",
                "text": "When stolen art is detected, use CVBER's one-click DMCA generator to create legally formatted takedown notices and submit them to hosting providers, platforms, and search engines for removal.",
                "url": "https://cvber.vercel.app"
            }
        ]
    };

    return (
        <>
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
                dangerouslySetInnerHTML={{ __html: JSON.stringify(webpageSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
            />
        </>
    );
}
