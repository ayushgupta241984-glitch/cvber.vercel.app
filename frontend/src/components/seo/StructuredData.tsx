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
        </>
    );
}
