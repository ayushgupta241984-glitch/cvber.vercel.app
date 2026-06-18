import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Playfair_Display, Plus_Jakarta_Sans, Geist } from "next/font/google";
import "./globals.css";
import LenisProvider from "@/providers/LenisProvider";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const playfair = Playfair_Display({
    subsets: ["latin"],
    variable: "--font-playfair",
    display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
    subsets: ["latin"],
    variable: "--font-jakarta",
    display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://cvber.vercel.app";

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    themeColor: "#0a0a0a",
};

export const metadata: Metadata = {
    title: {
        default: "Protect Your Art From AI Theft — Free C2PA & DMCA Tools | CVBER",
        template: "%s | CVBER"
    },
    description: "CVBER protects digital artists from AI scraping, art theft, and unauthorized use. Get a free C2PA provenance certificate, automated DMCA takedowns, and real-time theft monitoring.",
    keywords: [
        "protect art from AI", "stop AI from using my art", "C2PA certificate for artists",
        "DMCA takedown generator", "digital art copyright protection", "AI art theft prevention",
        "how to protect digital art online", "art theft detection software", "C2PA provenance",
    ],
    authors: [{ name: "Cvber Team" }],
    creator: "Cvber",
    publisher: "Cvber",
    metadataBase: new URL(siteUrl),
    alternates: {
        languages: { "en-US": "/" },
    },
    openGraph: {
        type: "website",
        locale: "en_US",
        url: siteUrl,
        siteName: "Cvber",
        title: "How to Protect Your Art Online | CVBER — AI-Powered Art Security & DMCA",
        description: "Protect your art from AI theft. Generate certificates of origin, detect scraping, and automate DMCA takedowns with blockchain-backed security.",
        images: [{ url: `${siteUrl}/og-image.png`, width: 1200, height: 630, alt: "CVBER - AI-Powered Art Protection Platform" }],
    },
    twitter: {
        card: "summary_large_image",
        title: "How to Protect Your Art Online | CVBER — AI Art Protection Tool",
        description: "AI-powered content protection with C2PA signatures, theft monitoring, and DMCA automation.",
        images: [`${siteUrl}/og-image.png`],
        creator: "@cvberapp",
    },
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
    icons: {
        icon: [
            { url: "/icon.png", type: "image/png", sizes: "512x512" },
            { url: "/favicon.svg", type: "image/svg+xml" },
        ],
        apple: "/apple-touch-icon.png",
        shortcut: "/icon.png",
    },
    other: {
        "google-site-verification": "NDtNvgZra404JNma95WkYr6Q5Wdr110e2T_2cIdBRL0",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className={cn(playfair.variable, jakarta.variable, "font-sans", geist.variable)}>
            <head>
                <Script
                    src="https://www.googletagmanager.com/gtag/js?id=G-EW5JZREK1V"
                    strategy="afterInteractive"
                />
                <Script id="google-analytics" strategy="afterInteractive">
                    {`
                        window.dataLayer = window.dataLayer || [];
                        function gtag(){dataLayer.push(arguments);}
                        gtag('js', new Date());
                        gtag('config', 'G-EW5JZREK1V');
                    `}
                </Script>
            </head>
            <body className="font-sans antialiased">
                <LenisProvider>
                    <Navbar />
                    <main className="min-h-screen">
                        {children}
                    </main>
                    <Footer />
                </LenisProvider>
            </body>
        </html>
    );
}
