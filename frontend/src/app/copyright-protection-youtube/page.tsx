import { Metadata } from "next";
import SEOLandingPage from "@/components/seo/SEOLandingPage";

export const metadata: Metadata = {
    title: { absolute: "Protect Your YouTube Art & Thumbnails From AI Theft | CVBER" },
    description: "Stop AI companies from scraping your YouTube thumbnails and artwork. Free C2PA certificates, DMCA takedowns, and theft monitoring for YouTube creators.",
    alternates: { canonical: "https://cvber.vercel.app/copyright-protection-youtube" },
    keywords: ["protect YouTube art from AI", "YouTube copyright protection", "DMCA YouTube takedown", "YouTube thumbnail protection", "YouTube art theft"],
};

export default function CopyrightProtectionYouTube() {
    return (
        <SEOLandingPage
            title="YouTube Copyright Protection"
            subtitle="YouTube Art Protection"
            h1="How to Protect Your YouTube Art & Thumbnails From AI Theft"
            description="Your YouTube thumbnails and channel art are being scraped by AI companies. CVBER gives you free C2PA certificates, automated DMCA takedowns, and 24/7 monitoring to protect your YouTube creative assets."
            platform="YouTube"
            canonical="https://cvber.vercel.app/copyright-protection-youtube"
            features={[
                { title: "YouTube Thumbnail Protection", description: "Embed C2PA certificates into your YouTube thumbnails and channel art to prove ownership and prevent AI scraping." },
                { title: "Automated DMCA for YouTube", description: "When your art is stolen, CVBER generates legally formatted DMCA takedown notices ready to send to YouTube and infringing sites." },
                { title: "Cross-Platform Monitoring", description: "CVBER monitors YouTube, social media, and stock sites for unauthorized copies of your creative work." },
                { title: "Video Content Protection", description: "Protect your video thumbnails, end screens, channel banners, and other visual assets with C2PA provenance." },
            ]}
            faqs={[
                { question: "Can AI companies use my YouTube thumbnails?", answer: "AI companies often scrape YouTube without permission. CVBER helps you prove ownership with C2PA certificates and enforce your rights with automated DMCA takedowns." },
                { question: "How do I protect my YouTube channel art?", answer: "Upload your channel art and thumbnails to CVBER to get C2PA certificates and activate monitoring for unauthorized use." },
                { question: "Does CVBER work with YouTube video content?", answer: "CVBER focuses on protecting your visual assets including thumbnails, channel art, and end screens. Video content protection is available for enterprise users." },
            ]}
        />
    );
}
