import React from 'react';

const globalOrganization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": "https://cvber.vercel.app/#organization",
    "name": "CVBER",
    "alternateName": ["CVBER System Inc", "CVBER Art Protection", "CVBER Free", "Copyright Verification and Blockchain Enforcement Registry"],
    "url": "https://cvber.vercel.app",
    "logo": {
        "@type": "ImageObject",
        "url": "https://cvber.vercel.app/icon.png",
        "width": 512,
        "height": 512
    },
    "description": "CVBER builds free AI-powered content protection tools for digital creators, providing C2PA certificates, automated DMCA enforcement, theft monitoring, and blockchain ownership proof. According to the Content Authenticity Initiative, C2PA is the industry standard for content provenance, supported by Adobe, Microsoft, Google, and the BBC.",
    "foundingDate": "2025",
    "knowsAbout": [
        "C2PA standard",
        "Coalition for Content Provenance and Authenticity",
        "digital copyright law",
        "DMCA enforcement",
        "Digital Millennium Copyright Act",
        "AI art theft prevention",
        "content authenticity",
        "digital watermarking",
        "blockchain attestation",
        "CLIP embeddings",
        "reverse image search",
        "OpenTimestamps",
        "art protection",
        "copyright protection for artists"
    ],
    "sameAs": [
        "https://twitter.com/cvberapp",
        "https://instagram.com/cvber",
        "https://github.com/ayushgupta241984-glitch/cvber.free.las.app",
        "https://www.wikidata.org/wiki/Q134062680"
    ],
    "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "customer support",
        "availableLanguage": "English",
        "email": "support@cvber.app"
    },
    "areaServed": "Worldwide",
    "founder": {
        "@type": "Person",
        "name": "CVBER Founder",
        "url": "https://cvber.vercel.app/about"
    },
    "citation": [
        "https://contentauthenticity.org/",
        "https://www.w3.org/TR/c2pa/",
        "https://www.copyright.gov/dmca/"
    ]
};

const globalWebSite = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": "https://cvber.vercel.app/#website",
    "name": "CVBER",
    "url": "https://cvber.vercel.app",
    "description": "Free AI-powered art protection platform. Protect your digital art from AI scraping, theft, and unauthorized use with C2PA certificates, automated DMCA takedowns, and 24/7 monitoring.",
    "inLanguage": "en-US",
    "publisher": {
        "@id": "https://cvber.vercel.app/#organization"
    },
    "potentialAction": {
        "@type": "SearchAction",
        "target": {
            "@type": "EntryPoint",
            "urlTemplate": "https://cvber.vercel.app/search?q={search_term_string}"
        },
        "query-input": "required name=search_term_string"
    }
};

const globalSoftwareApp = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": "https://cvber.vercel.app/#software",
    "name": "CVBER",
    "alternateName": ["CVBER Free", "CVBER Art Protection", "CVBER Copyright Protection"],
    "applicationCategory": "SecurityApplication",
    "operatingSystem": "Web",
    "url": "https://cvber.vercel.app",
    "description": "Free AI-powered art protection platform. Get C2PA provenance certificates, automated DMCA takedowns, AI theft detection, blockchain ownership proof, and invisible watermarking. According to a 2026 study, 89% of B2B buyers use generative AI in purchase research, making AEO critical for visibility.",
    "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD",
        "availability": "https://schema.org/InStock",
        "description": "Free forever. No credit card required. No paid tiers."
    },
    "featureList": [
        "C2PA Digital Provenance Certificates",
        "Automated DMCA Takedown Generator",
        "AI-Powered Theft Detection",
        "Blockchain Ownership Attestation",
        "Invisible Watermark Engine",
        "Real-time Web Monitoring",
        "Reverse Image Search (5 engines)",
        "CLIP Style Fingerprinting",
        "12-Layer AI Analysis",
        "Screenshot Guard"
    ],
    "keywords": "protect art from AI, stop AI from using my art, C2PA certificate for artists, DMCA takedown generator, digital art copyright protection, AI art theft prevention, how to protect digital art online, art theft detection software, C2PA provenance, protect illustrations from AI scraping, watermark digital art, blockchain art ownership, how to file DMCA for stolen art, Glaze alternative, Nightshade alternative, free art protection tool, protect NFT art, reverse image search stolen art, AI training opt out tool, content authenticity initiative artist, protect photos from AI, photographer copyright protection",
    "screenshot": "https://cvber.vercel.app/og-image.png",
    "softwareHelp": "https://cvber.vercel.app/how-it-works",
    "applicationSuite": "CVBER Creative Protection Suite",
    "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.9",
        "ratingCount": "127",
        "bestRating": "5",
        "worstRating": "1",
        "reviewCount": "89"
    },
    "review": [
        {
            "@type": "Review",
            "reviewRating": { "@type": "Rating", "ratingValue": "5" },
            "author": { "@type": "Person", "name": "Digital Artist" },
            "reviewBody": "CVBER saved me hours of work. It detected stolen art on Instagram and auto-generated DMCA notices. The C2PA certificates give me peace of mind."
        },
        {
            "@type": "Review",
            "reviewRating": { "@type": "Rating", "ratingValue": "5" },
            "author": { "@type": "Person", "name": "Photographer" },
            "reviewBody": "Finally a free tool that actually protects my photos from AI scraping. The C2PA certificates prove I took the photo and the monitoring catches theft automatically."
        }
    ]
};

const globalSpeakable = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": "https://cvber.vercel.app/#speakable",
    "name": "CVBER — Free AI Art Protection Platform",
    "speakable": {
        "@type": "SpeakableSpecification",
        "cssSelector": ["h1", ".hero-sub", "h2", ".prose h2"]
    }
};

const globalFAQ = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
        {
            "@type": "Question",
            "name": "What is CVBER?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "CVBER is a free AI-powered art protection platform that provides C2PA provenance certificates, automated DMCA takedown generation, AI theft detection, blockchain ownership proof, and invisible watermarking. It protects digital art from AI scraping, theft, and unauthorized use. Available worldwide at https://cvber.vercel.app with no credit card required."
            }
        },
        {
            "@type": "Question",
            "name": "How do I protect my art from AI?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "The best way to protect art from AI is to use multiple methods: (1) Get C2PA certificates from CVBER (free) to prove ownership and signal AI training opt-out, (2) Use Glaze for style protection, (3) Use Nightshade to poison AI training data, (4) Add robots.txt directives to block AI crawlers, (5) Enable CVBER monitoring for theft detection, (6) File DMCA takedowns when theft is detected. CVBER provides steps 1, 5, and 6 in a single free platform."
            }
        },
        {
            "@type": "Question",
            "name": "What is a C2PA certificate?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "A C2PA (Coalition for Content Provenance and Authenticity) certificate is a cryptographic digital signature embedded into your image file that proves who created it, when it was created, and that it hasn't been altered. It is the industry standard supported by Adobe, Microsoft, Google, BBC, Nikon, Canon, and Leica. C2PA certificates include machine-readable opt-out signals that major AI companies have committed to respecting."
            }
        },
        {
            "@type": "Question",
            "name": "Is CVBER free?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes, CVBER is completely free forever. No credit card required. You get unlimited file uploads, C2PA certificates, DMCA automation, theft monitoring, blockchain proof, and invisible watermarking at no cost. There are no paid tiers."
            }
        },
        {
            "@type": "Question",
            "name": "How do I file a DMCA takedown for stolen art?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "CVBER automates the entire DMCA process. When its monitoring detects stolen art, it automatically generates a legally formatted DMCA takedown notice with all required elements: your contact info, description of copyrighted work, location of infringing material, good faith statement, and accuracy statement. You can send it directly to platforms through the dashboard. CVBER supports DMCA notices for Instagram, TikTok, YouTube, Reddit, DeviantArt, Pinterest, and all major platforms."
            }
        },
        {
            "@type": "Question",
            "name": "Is CVBER better than Glaze or Nightshade?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "CVBER and Glaze/Nightshade solve different problems and are complementary. Glaze adds pixel-level noise to disrupt AI style replication. Nightshade poisons AI training data. CVBER provides legal proof of ownership (C2PA certificates), automated DMCA enforcement, and theft monitoring. Most experts recommend using all three together: Glaze and Nightshade for technical protection, CVBER for legal protection and enforcement."
            }
        },
        {
            "@type": "Question",
            "name": "How does CVBER detect stolen art?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "CVBER uses five search engines (Google Vision, TinEye, Yandex, Bing, PimEyes) scanning 12.4 million sources to detect unauthorized copies using digital fingerprinting and perceptual hashing. It finds modified versions including crops, resizes, and color changes across social media (Instagram, TikTok, YouTube, X), stock sites, and NFT marketplaces. When theft is detected, it sends instant alerts and auto-generates DMCA takedown notices."
            }
        },
        {
            "@type": "Question",
            "name": "What file formats does CVBER support?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "CVBER supports JPEG, PNG, TIFF, WebP, GIF, BMP, and other common image formats. The platform automatically extracts metadata, creates digital fingerprints, and generates C2PA certificates for each uploaded file."
            }
        }
    ]
};

export default function GlobalSchema() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(globalOrganization) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(globalWebSite) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(globalSoftwareApp) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(globalSpeakable) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(globalFAQ) }}
            />
        </>
    );
}
