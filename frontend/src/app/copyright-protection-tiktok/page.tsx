import { Metadata } from "next";
import SEOLandingPage from "@/components/seo/SEOLandingPage";

export const metadata: Metadata = {
    title: { absolute: "Protect Your TikTok Art From AI Theft — Free C2PA & DMCA | CVBER" },
    description: "Stop AI companies from scraping your TikTok art and designs. Free C2PA certificates, automated DMCA takedowns, and real-time theft monitoring for TikTok creators.",
    alternates: { canonical: "https://cvber.vercel.app/copyright-protection-tiktok" },
    keywords: ["protect TikTok art from AI", "TikTok copyright protection", "DMCA TikTok takedown", "TikTok art theft", "protect TikTok designs"],
};

export default function CopyrightProtectionTikTok() {
    return (
        <SEOLandingPage
            title="TikTok Copyright Protection"
            subtitle="TikTok Art Protection"
            h1="How to Protect Your TikTok Art & Designs From AI Theft"
            description="Your TikTok art and designs are being scraped by AI companies to train their models. CVBER gives you free C2PA certificates, automated DMCA takedowns, and 24/7 monitoring to protect your TikTok creative work."
            platform="TikTok"
            canonical="https://cvber.vercel.app/copyright-protection-tiktok"
            features={[
                { title: "TikTok Art Protection", description: "Embed C2PA certificates into your TikTok art to prove ownership and prevent AI companies from using your work without permission." },
                { title: "Automated DMCA for TikTok", description: "CVBER auto-generates legally formatted DMCA takedown notices when your TikTok art is stolen or used without authorization." },
                { title: "Real-time TikTok Monitoring", description: "CVBER's Watchtower scans TikTok and other platforms continuously for unauthorized copies of your protected artwork." },
                { title: "AI Training Opt-Out", description: "Signal to AI companies that your TikTok art is not available for training. CVBER embeds machine-readable opt-out signals." },
            ]}
            faqs={[
                { question: "How do I protect my TikTok art from AI?", answer: "Sign up for CVBER, upload your TikTok art, and get a C2PA certificate. CVBER also monitors TikTok for stolen copies and auto-generates DMCA takedowns." },
                { question: "Can AI companies legally use my TikTok content?", answer: "AI companies often scrape TikTok without permission. CVBER helps you prove ownership with C2PA certificates and enforce your rights with automated DMCA takedowns." },
            ]}
        />
    );
}
