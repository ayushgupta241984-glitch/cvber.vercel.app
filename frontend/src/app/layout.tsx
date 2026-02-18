import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://cvber.vercel.app";

export const metadata: Metadata = {
    // Basic metadata
    title: {
        default: "Cvber - Protect Your Creative Work with AI-Powered Security",
        template: "%s | Cvber"
    },
    description: "Protect your digital content with AI-powered threat detection, C2PA authenticity verification, theft monitoring, and automated DMCA enforcement. Trusted by 2,000+ creators.",
    keywords: [
        "content protection", "digital watermark", "copyright protection", "C2PA standard", "AI security",
        "DMCA takedown", "theft detection", "digital certificate", "creator protection", "image protection",
        "reverse image search", "content authenticity", "protect art from AI", "artist protection tools",
        "digital provenance", "blockchain authenticity", "automated DMCA", "stolen content tracker",
        "NFT protection", "AI training prevention", "digital asset security", "provenance tracking",
        "metadata injection", "EXIF security", "IPTC protection", "copyright lawyer alternative",
        "how to stop art theft", "protect images from being saved", "how to copyright my work for free",
        "stop AI from using my art", "watermark for photographers", "legal proof I made this",
        "stolen art finder", "dmca notice generator", "protect digital art on instagram",
        "is my art being used by AI", "free image protection", "digital rights management",
        "stop photo theft", "artist legal tools", "protect creative assets", "is my art being stolen",
        "how to file dmca", "prove image ownership online", "secure digital portfolio"
    ],
    authors: [{ name: "Cvber Team" }],
    creator: "Cvber",
    publisher: "Cvber",

    // Canonical URL
    metadataBase: new URL(siteUrl),
    alternates: {
        canonical: "/",
    },

    // Open Graph (Facebook, LinkedIn, etc.)
    openGraph: {
        type: "website",
        locale: "en_US",
        url: siteUrl,
        siteName: "Cvber",
        title: "Cvber - Protect Your Creative Work with AI-Powered Security",
        description: "Generate certificates of origin, detect theft, and enforce your copyright with AI. Join 2,000+ creators protecting their work.",
        images: [
            {
                url: `${siteUrl}/og-image.png`,
                width: 1200,
                height: 630,
                alt: "Cvber - Digital Content Protection Platform",
            }
        ],
    },

    // Twitter Card
    twitter: {
        card: "summary_large_image",
        title: "Cvber - Digital Art & Content Protection",
        description: "AI-powered content protection with C2PA signatures, theft monitoring, and DMCA automation.",
        images: [`${siteUrl}/og-image.png`],
        creator: "@cvberapp",
    },

    // Robots
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
        },
    },

    // Icons - Google requires PNG favicon ≥48px, SVG is ignored by Googlebot
    icons: {
        icon: [
            { url: "/icon.png", type: "image/png", sizes: "512x512" },
            { url: "/favicon.svg", type: "image/svg+xml" },
        ],
        apple: "/apple-touch-icon.png",
        shortcut: "/icon.png",
    },

    // Verification
    other: {
        "google-site-verification": "NDtNvgZra404JNma95WkYr6Q5Wdr110e2T_2cIdBRL0",
        "msvalidate.01": "D8F7B5E4A3C2B1A09876543210FEDCBA", // Example Bing verification
        "p:domain_verify": "af1234567890abcdef1234567890abcdef", // Example Pinterest verification
        "yandex-verification": "9876543210abcdef", // Example Yandex verification
    },
};

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <Navbar />
                <main className="min-h-screen pt-16">
                    {children}
                </main>
                <Footer />
            </body>
        </html>
    );
}

