import { Metadata } from "next";
import SEOLandingPage from "@/components/seo/SEOLandingPage";

export const metadata: Metadata = {
    title: { absolute: "Protect Your Reddit Art From AI Theft — Free C2PA & DMCA | CVBER" },
    description: "Stop AI companies from scraping your Reddit art posts. Free C2PA certificates, automated DMCA takedowns, and 24/7 monitoring for Reddit artists.",
    alternates: { canonical: "https://cvber.vercel.app/copyright-protection-reddit" },
    keywords: ["protect Reddit art from AI", "Reddit copyright protection", "DMCA Reddit takedown", "Reddit art theft", "Reddit image protection"],
};

export default function CopyrightProtectionReddit() {
    return (
        <SEOLandingPage
            title="Reddit Copyright Protection"
            subtitle="Reddit Art Protection"
            h1="How to Protect Your Reddit Art From AI Theft"
            description="Your Reddit art posts are being scraped by AI companies to train their models. CVBER gives you free C2PA certificates, automated DMCA takedowns, and 24/7 monitoring to protect your Reddit creative work."
            platform="Reddit"
            canonical="https://cvber.vercel.app/copyright-protection-reddit"
            features={[
                { title: "Reddit Post Protection", description: "Embed C2PA certificates into your Reddit art posts to prove ownership and prevent AI companies from using your work without permission." },
                { title: "Automated DMCA for Reddit", description: "CVBER auto-generates legally formatted DMCA takedown notices when your Reddit art is stolen or used without authorization." },
                { title: "Cross-Platform Monitoring", description: "CVBER monitors Reddit, imgur, and other platforms for unauthorized copies of your creative work." },
                { title: "AI Training Opt-Out", description: "Signal to AI companies that your Reddit art is not available for training. CVBER embeds machine-readable opt-out signals." },
            ]}
            faqs={[
                { question: "How do I protect my Reddit art from AI?", answer: "Sign up for CVBER, upload your Reddit art, and get a C2PA certificate. CVBER also monitors Reddit for stolen copies and auto-generates DMCA takedowns." },
                { question: "Can AI companies legally use my Reddit images?", answer: "AI companies often scrape Reddit without permission. CVBER helps you prove ownership with C2PA certificates and enforce your rights with automated DMCA takedowns." },
            ]}
        />
    );
}
