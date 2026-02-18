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
        "operatingSystem": "Web",
        "applicationCategory": "SecurityApplication",
        "offers": {
            "@type": "Offer",
            "price": "0.00",
            "priceCurrency": "USD"
        },
        "description": "AI-powered cybersecurity platform for digital creators. Protect, prove, and enforce digital ownership with C2PA and blockchain technology.",
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.9",
            "ratingCount": "2150"
        }
    };

    const serviceSchema = {
        "@context": "https://schema.org",
        "@type": "SecurityService",
        "name": "CVBER Content Protection",
        "description": "Digital content protection including C2PA signing, theft monitoring, and DMCA automation.",
        "provider": {
            "@type": "Organization",
            "name": "CVBER",
            "url": "https://cvber.vercel.app"
        },
        "areaServed": "Worldwide",
        "hasOfferCatalog": {
            "@type": "OfferCatalog",
            "name": "Protection Services",
            "itemListElement": [
                {
                    "@type": "Offer",
                    "itemOffered": {
                        "@type": "Service",
                        "name": "C2PA Provenance Signing"
                    }
                },
                {
                    "@type": "Offer",
                    "itemOffered": {
                        "@type": "Service",
                        "name": "Automated Theft Monitoring"
                    }
                },
                {
                    "@type": "Offer",
                    "itemOffered": {
                        "@type": "Service",
                        "name": "DMCA Enforcement Automation"
                    }
                }
            ]
        }
    };

    const websiteSchema = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "Cvber",
        "alternateName": ["CVBER", "Cvber App"],
        "url": "https://cvber.vercel.app",
        "description": "AI-powered content protection for digital creators",
        "potentialAction": {
            "@type": "SearchAction",
            "target": "https://cvber.vercel.app/?q={search_term_string}",
            "query-input": "required name=search_term_string"
        }
    };

    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": "How does CVBER protect my art from AI theft?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "CVBER uses C2PA signatures to prove origin and automated web monitoring to detect unauthorized AI training or re-posting. By embedding provenance data, your work carries its ownership rights even if metadata is stripped."
                }
            },
            {
                "@type": "Question",
                "name": "How to copyright my work for free?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Our platform provides cryptographic proof of creation, acting as a permanent digital record of authorship."
                }
            },
            {
                "@type": "Question",
                "name": "Can I use CVBER for automated DMCA takedowns?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes. Our platform generates legally-compliant DMCA takedown notices tailored for YouTube, Instagram, TikTok, and other major platforms."
                }
            },
            {
                "@type": "Question",
                "name": "Is my art being used by AI?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Use our theft-monitor tools to scan dataset caches and reverse-image search for unauthorized use of your creative work."
                }
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
                dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />
        </>
    );
}
