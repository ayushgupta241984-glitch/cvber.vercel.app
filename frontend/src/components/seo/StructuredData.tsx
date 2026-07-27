import React from 'react';

export default function StructuredData() {
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
            "Reverse Image Search",
            "Screenshot Guard"
        ],
        "keywords": "protect art from AI, stop AI from using my art, C2PA certificate for artists, DMCA takedown generator, digital art copyright protection, AI art theft prevention, how to protect digital art online, art theft detection software, C2PA provenance, protect illustrations from AI scraping, watermark digital art, blockchain art ownership, how to file DMCA for stolen art, Glaze alternative, Nightshade alternative, protect NFT art, reverse image search stolen art, AI training opt out tool, content authenticity initiative artist, DeviantArt protect alternative, free art protection tool, digital watermark for artists, copyright my artwork, protect photos from AI, photographer copyright protection",
        "screenshot": "https://cvber.vercel.app/og-image.svg",
        "softwareHelp": "https://cvber.vercel.app/how-it-works",
        "applicationSuite": "CVBER Creative Protection Suite"
    };

    const organizationSchema = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "CVBER",
        "alternateName": ["CVBER System Inc", "CVBER Art Protection"],
        "url": "https://cvber.vercel.app",
        "logo": "https://cvber.vercel.app/icon.png",
        "description": "CVBER builds AI-powered content protection tools for digital creators, providing C2PA certificates, automated DMCA enforcement, and theft monitoring.",
        "foundingDate": "2025",
        "knowsAbout": [
            "C2PA standard",
            "digital copyright",
            "DMCA enforcement",
            "AI art theft",
            "content authenticity",
            "digital watermarking",
            "blockchain attestation"
        ],
        "sameAs": [
            "https://twitter.com/cvberapp",
            "https://instagram.com/cvber"
        ],
        "contactPoint": {
            "@type": "ContactPoint",
            "contactType": "customer support",
            "availableLanguage": "English",
            "email": "support@cvber.app"
        },
        "areaServed": "Worldwide",
        "founder": {
            "@type": "Organization",
            "name": "CVBER System Inc"
        }
    };

    const webpageSchema = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": "CVBER — Free AI Art Protection Platform | C2PA, DMCA & Theft Detection",
        "description": "CVBER is the world's first automated AI art protection platform combining C2PA digital provenance certificates, automated DMCA takedown generation, AI-powered theft detection, and blockchain ownership attestation in a single free dashboard.",
        "url": "https://cvber.vercel.app",
        "inLanguage": "en-US",
        "isPartOf": {
            "@type": "WebSite",
            "name": "CVBER",
            "url": "https://cvber.vercel.app"
        },
        "about": {
            "@type": "SoftwareApplication",
            "name": "CVBER",
            "applicationCategory": "SecurityApplication"
        },
        "mentions": [
            "C2PA standard",
            "Content Authenticity Initiative",
            "DMCA",
            "AI art protection",
            "digital watermarking",
            "blockchain attestation"
        ],
        "mainEntity": {
            "@type": "SoftwareApplication",
            "name": "CVBER"
        },
        "datePublished": "2025-01-01",
        "dateModified": new Date().toISOString()
    };

    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": "What is CVBER and how does it protect my art?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "CVBER is a free AI-powered art protection platform that gives digital artists C2PA provenance certificates, automated DMCA takedown generation, and real-time monitoring to detect when their work is stolen or used to train AI models without permission. It combines cryptographic proof of ownership with automated enforcement in a single dashboard. Artists upload their work, receive a C2PA certificate that proves they created it, and CVBER continuously scans the internet for unauthorized copies. When theft is detected, CVBER automatically generates legally formatted DMCA takedown notices that can be sent to platforms like Instagram, TikTok, YouTube, and Reddit."
                }
            },
            {
                "@type": "Question",
                "name": "How do I stop AI from training on my art?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Use CVBER to embed a C2PA certificate into your files that signals your work is not available for AI training. You can also use CVBER's Watchtower to detect if your art appears in AI training datasets and generate DMCA notices to have it removed. The C2PA standard is recognized by major AI companies including OpenAI, Google, and Adobe. Additionally, CVBER provides blockchain attestation that creates an immutable record of when your work was created, making it easier to prove ownership if your art is used without permission."
                }
            },
            {
                "@type": "Question",
                "name": "What is a C2PA certificate and why do artists need one?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "A C2PA certificate is a cryptographic digital signature embedded directly into your image file that proves you are the original creator, when it was created, and that it has not been altered. It is the same standard used by Adobe, Microsoft, Google, and the BBC to verify content authenticity. For artists, it provides irrefutable legal proof of ownership that holds up in court. The certificate includes machine-readable signals that tell AI companies your work is not available for training, and it travels with your file wherever it goes online, even if metadata is stripped."
                }
            },
            {
                "@type": "Question",
                "name": "Is CVBER better than Glaze or Nightshade?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "CVBER and Glaze/Nightshade solve different problems. Glaze and Nightshade add pixel-level noise to disrupt AI training. CVBER provides legal proof of ownership, automated DMCA enforcement, and theft monitoring — making it a complete protection ecosystem rather than just a deterrent. Many artists use CVBER alongside Glaze/Nightshade for maximum protection. Think of Glaze as a lock on your door, and CVBER as a security system that detects when someone breaks in and automatically calls the police."
                }
            },
            {
                "@type": "Question",
                "name": "How does CVBER detect stolen art?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "CVBER's Watchtower service continuously scans social media platforms including Instagram, TikTok, YouTube, and X, as well as NFT marketplaces and stock sites, using digital fingerprints to detect unauthorized copies of your protected work in real time. When theft is detected, it automatically generates DMCA takedown notices. The system uses five different search engines including Google Vision, TinEye, Yandex, Bing, and PimEyes to find stolen copies across 12.4 million sources, including modified versions that have been cropped, recolored, or resized."
                }
            },
            {
                "@type": "Question",
                "name": "Is CVBER free to use?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes, CVBER is free to start with no credit card required. You can upload files, generate C2PA certificates, access DMCA templates, and use the Art Hub resources at no cost. The free tier includes 10 scans per month, 1GB of storage, and basic DMCA templates. Premium features for enterprise users and high-volume monitoring are available on paid plans starting at $12 per month."
                }
            },
            {
                "@type": "Question",
                "name": "How do I file a DMCA takedown for stolen art?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "CVBER automates the entire DMCA process. Upload your original work, and CVBER generates a legally formatted DMCA takedown notice with all required information including your contact details, description of the copyrighted work, location of the infringing material, and your sworn statement. You can send it directly to platforms or hosting providers through the dashboard. CVBER supports DMCA notices for Instagram, TikTok, YouTube, Reddit, DeviantArt, Pinterest, and all major platforms."
                }
            },
            {
                "@type": "Question",
                "name": "Can I use CVBER to protect NFT art?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes, CVBER is specifically designed to protect NFT art and digital collectibles. It embeds C2PA certificates into NFT metadata, monitors NFT marketplaces for unauthorized copies, and provides blockchain attestation that proves your ownership across both traditional and Web3 platforms. The blockchain proof uses Bitcoin-anchored timestamps via OpenTimestamps, providing immutable evidence of when your work was created."
                }
            }
        ]
    };

    const howToSchema = {
        "@context": "https://schema.org",
        "@type": "HowTo",
        "name": "How to Protect Your Art from AI Scraping and Theft",
        "description": "A step-by-step guide to protecting your digital art from AI scraping, unauthorized training, and art theft using C2PA certificates and automated DMCA enforcement.",
        "totalTime": "PT10M",
        "estimatedCost": {
            "@type": "MonetaryAmount",
            "currency": "USD",
            "value": "0"
        },
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

    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://cvber.vercel.app"
            },
            {
                "@type": "ListItem",
                "position": 2,
                "name": "Features",
                "item": "https://cvber.vercel.app/features"
            },
            {
                "@type": "ListItem",
                "position": 3,
                "name": "How It Works",
                "item": "https://cvber.vercel.app/how-it-works"
            },
            {
                "@type": "ListItem",
                "position": 4,
                "name": "Art Hub",
                "item": "https://cvber.vercel.app/art-hub"
            }
        ]
    };

    const webSiteSchema = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "CVBER",
        "url": "https://cvber.vercel.app",
        "description": "Free AI-powered art protection platform with C2PA certificates, DMCA takedowns, and theft monitoring.",
        "potentialAction": {
            "@type": "SearchAction",
            "target": {
                "@type": "EntryPoint",
                "urlTemplate": "https://cvber.vercel.app/search?q={search_term_string}"
            },
            "query-input": "required name=search_term_string"
        }
    };

    const softwareSourceSchema = {
        "@context": "https://schema.org",
        "@type": "SoftwareSourceCode",
        "name": "CVBER Free - AI-Powered Copyright Protection Platform",
        "description": "Open-source AI-powered cybersecurity platform featuring AI threat detection, C2PA digital authenticity verification, and secure encrypted storage.",
        "url": "https://cvber.vercel.app",
        "programmingLanguage": "TypeScript",
        "runtimePlatform": "Web",
        "license": "https://opensource.org/licenses/MIT",
        "codeRepository": "https://github.com/ayushgupta241984-glitch/cvber.free.las.app"
    };

    const speakableSchema = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": "CVBER — Free AI Art Protection Platform",
        "speakable": {
            "@type": "SpeakableSpecification",
            "cssSelector": ["h1", ".hero-sub", "h2"]
        }
    };

    const aboutSchema = {
        "@context": "https://schema.org",
        "@type": "AboutPage",
        "name": "About CVBER — Free AI Art Protection Platform",
        "description": "CVBER is a free AI-powered copyright protection platform for digital artists. It provides C2PA certificates, automated DMCA takedowns, AI theft detection, and blockchain ownership proof.",
        "url": "https://cvber.vercel.app/what-is-cvber",
        "mainEntity": {
            "@type": "Organization",
            "name": "CVBER",
            "url": "https://cvber.vercel.app"
        }
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
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSourceSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(speakableSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutSchema) }}
            />
        </>
    );
}
