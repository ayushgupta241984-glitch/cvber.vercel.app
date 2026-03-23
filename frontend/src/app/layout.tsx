import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://cvber.vercel.app";

export const metadata: Metadata = {
    // Basic metadata
    title: {
        default: "Protect Your Art From AI Theft — Free C2PA & DMCA Tools | CVBER",
        template: "%s | CVBER"
    },
    description: "CVBER protects digital artists from AI scraping, art theft, and unauthorized use. Get a free C2PA provenance certificate, automated DMCA takedowns, and real-time theft monitoring. Trusted by 10,000+ creators worldwide.",
    keywords: [
        "protect art from AI", "stop AI from using my art", "C2PA certificate for artists",
        "DMCA takedown generator", "digital art copyright protection", "AI art theft prevention",
        "how to protect digital art online", "art theft detection software", "C2PA provenance",
        "protect illustrations from AI scraping", "watermark digital art", "blockchain art ownership",
        "how to file DMCA for stolen art", "Glaze alternative", "Nightshade alternative",
        "protect NFT art", "reverse image search stolen art", "AI training opt out tool",
        "content authenticity initiative artist", "DeviantArt protect alternative",
        "free art protection tool", "digital watermark for artists", "copyright my artwork",
        "protect photos from AI", "photographer copyright protection"
    ],
    authors: [{ name: "Cvber Team" }],
    creator: "Cvber",
    publisher: "Cvber",

    // Canonical URL
    metadataBase: new URL(siteUrl),
    alternates: {
        canonical: 'https://cvber.vercel.app',
        languages: {
            "en-US": "/",
        },
    },

    // Open Graph (Facebook, LinkedIn, etc.)
    openGraph: {
        type: "website",
        locale: "en_US",
        url: siteUrl,
        siteName: "Cvber",
        title: "How to Protect Your Art Online | CVBER — AI-Powered Art Security & DMCA",
        description: "Protect your art from AI theft. Generate certificates of origin, detect scraping, and automate DMCA takedowns with blockchain-backed security.",
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
        title: "How to Protect Your Art Online | CVBER — AI Art Protection Tool",
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

