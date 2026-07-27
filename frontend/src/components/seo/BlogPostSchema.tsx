import React from 'react';

interface BlogPostSchemaProps {
    title: string;
    description: string;
    url: string;
    datePublished: string;
    dateModified?: string;
    author?: string;
    image?: string;
    faqs: { question: string; answer: string }[];
}

export default function BlogPostSchema({
    title,
    description,
    url,
    datePublished,
    dateModified,
    author = "CVBER Team",
    image = "https://cvber.vercel.app/og-image.png",
    faqs,
}: BlogPostSchemaProps) {
    const articleSchema = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": title,
        "description": description,
        "url": url,
        "image": image,
        "datePublished": datePublished,
        "dateModified": dateModified || datePublished,
        "author": {
            "@type": "Organization",
            "name": author,
            "url": "https://cvber.vercel.app"
        },
        "publisher": {
            "@type": "Organization",
            "name": "CVBER",
            "url": "https://cvber.vercel.app",
            "logo": {
                "@type": "ImageObject",
                "url": "https://cvber.vercel.app/icon.png"
            }
        },
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": url
        },
        "about": {
            "@type": "Thing",
            "name": "Art Protection"
        },
        "mentions": [
            {"@type": "SoftwareApplication", "name": "CVBER", "url": "https://cvber.vercel.app"},
            {"@type": "Thing", "name": "C2PA"},
            {"@type": "Thing", "name": "DMCA"}
        ]
    };

    const faqSchema = faqs.length > 0 ? {
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
    } : null;

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
                "name": "Blog",
                "item": "https://cvber.vercel.app/blog"
            },
            {
                "@type": "ListItem",
                "position": 3,
                "name": title.replace(/ \| CVBER$/, ''),
                "item": url
            }
        ]
    };

    const speakableSchema = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": title,
        "url": url,
        "speakable": {
            "@type": "SpeakableSpecification",
            "cssSelector": ["h1", ".prose h2", ".prose p:first-of-type"]
        }
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
            />
            {faqSchema && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
                />
            )}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(speakableSchema) }}
            />
        </>
    );
}
