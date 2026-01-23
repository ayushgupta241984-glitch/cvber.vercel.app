import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://cvber.app";

export const metadata: Metadata = {
    // Basic metadata
    title: {
        default: "Cvber - Protect Your Creative Work with AI-Powered Security",
        template: "%s | Cvber"
    },
    description: "Protect your digital content with AI-powered threat detection, C2PA authenticity verification, theft monitoring, and automated DMCA enforcement. Trusted by 2,000+ creators.",
    keywords: [
        "content protection",
        "digital watermark",
        "copyright protection",
        "C2PA",
        "AI security",
        "DMCA takedown",
        "theft detection",
        "digital certificate",
        "creator protection",
        "image protection",
        "reverse image search",
        "content authenticity"
    ],
    authors: [{ name: "Cvber" }],
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
        title: "Cvber - Protect Your Creative Work",
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

    // Icons
    icons: {
        icon: "/favicon.ico",
        apple: "/apple-touch-icon.png",
    },

    // Verification
    // Verification
    other: {
        "google-site-verification": "REF_PBrYt3OzmL27-be2Fo5BQvIKJZ9nEL7W6pBl_Ls",
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

