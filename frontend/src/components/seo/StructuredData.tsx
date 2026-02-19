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
        "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.8", "reviewCount": "2000" }
    };

    const organizationSchema = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "CVBER",
        "url": "https://cvber.vercel.app",
        "description": "Art protection platform for digital artists, photographers and creators.",
        "sameAs": ["https://twitter.com/cvber", "https://instagram.com/cvber"]
    };

    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": "How do I protect my digital art from being stolen online?",
                "acceptedAnswer": { "@type": "Answer", "text": "Use a combination of copyright registration, digital watermarking, C2PA provenance certificates, and automated DMCA monitoring tools like CVBER to protect your art across all platforms." }
            },
            {
                "@type": "Question",
                "name": "What is a Certificate of Origin for art?",
                "acceptedAnswer": { "@type": "Answer", "text": "A Certificate of Origin is a cryptographically-signed document that proves you created a specific artwork at a specific time, using verifiable blockchain-backed metadata." }
            },
            {
                "@type": "Question",
                "name": "How do I report stolen NFT art?",
                "acceptedAnswer": { "@type": "Answer", "text": "File a DMCA takedown with the NFT marketplace (like OpenSea or Rarible), report to the platform's IP team, and use tools like CVBER to automate the delisting process." }
            },
            {
                "@type": "Question",
                "name": "Can AI companies train on my artwork without permission?",
                "acceptedAnswer": { "@type": "Answer", "text": "Currently this is a legal gray area, but you can opt out of AI training datasets and use C2PA signatures to signal that your work should not be scraped." }
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
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />
        </>
    );
}
