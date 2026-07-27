import { Metadata } from "next";
import SEOLandingPage from "@/components/seo/SEOLandingPage";

export const metadata: Metadata = {
    title: { absolute: "AI Art Theft Detection — Find Who Stole Your Art | CVBER" },
    description: "Detect AI art theft in real time. CVBER scans social media, stock sites, and NFT marketplaces to find unauthorized copies of your artwork. Free to start.",
    alternates: { canonical: "https://cvber.vercel.app/ai-art-theft" },
    keywords: ["AI art theft", "detect AI art theft", "art theft detection", "stolen art finder", "reverse image search stolen art", "AI scraping detection"],
};

export default function AIArtTheftPage() {
    return (
        <SEOLandingPage
            title="AI Art Theft Detection"
            subtitle="AI Theft Detection"
            h1="Detect AI Art Theft in Real Time"
            description="AI companies are scraping millions of artworks to train their models without permission. CVBER's Watchtower continuously monitors the web to detect when your art is stolen, used without credit, or ingested into AI training datasets."
            canonical="https://cvber.vercel.app/ai-art-theft"
            features={[
                { title: "Real-time Web Scanning", description: "CVBER continuously scans social media platforms, stock sites, NFT marketplaces, and websites for unauthorized copies of your artwork." },
                { title: "Digital Fingerprinting", description: "CVBER creates unique digital fingerprints for each of your artworks. Even if someone crops, resizes, or slightly modifies your art, CVBER can detect it." },
                { title: "AI Training Dataset Detection", description: "CVBER monitors known AI training datasets and LAION-5B subsets to check if your art has been ingested for AI training." },
                { title: "Automated Evidence Collection", description: "When theft is detected, CVBER automatically captures screenshots, timestamps, and metadata as evidence for legal proceedings." },
                { title: "Instant Alerts", description: "Get notified immediately when your art is detected on unauthorized sites. Alerts include the exact location and evidence of infringement." },
                { title: "DMCA Auto-Generation", description: "CVBER automatically generates DMCA takedown notices for detected infringements, so you can act immediately." },
            ]}
            faqs={[
                { question: "How does CVBER detect AI art theft?", answer: "CVBER uses a multi-layered detection system combining digital fingerprinting, perceptual hashing, and continuous web scanning across five search engines (Google Vision, TinEye, Yandex, Bing, and PimEyes) to detect unauthorized copies of your artwork. The system monitors social media platforms including Instagram, TikTok, YouTube, and X, stock photo sites, NFT marketplaces, and known AI training datasets like LAION-5B. When a match is found, CVBER captures evidence including screenshots, timestamps, and metadata, then automatically generates a DMCA takedown notice." },
                { question: "Can CVBER find art that has been cropped or modified?", answer: "Yes, CVBER's deep image search technology can detect modified versions of your artwork including crops, resizes, color changes, rotations, watermarks added by thieves, and other visual alterations. The system uses perceptual hashing algorithms that focus on the visual content of an image rather than its exact pixel data, allowing it to identify matches even when significant modifications have been made. CVBER's 12-layer AI analysis classifier also detects face manipulation, steganography, and style transfer." },
                { question: "How do I know if my art is in an AI training dataset?", answer: "CVBER monitors known AI training datasets including LAION-5B, LAION-400M, and other public datasets to check if your art has been ingested for AI training. You can also use CVBER's reverse image search to manually check across 12.4 million sources. If your art is found in a training dataset, CVBER generates a DMCA notice to have it removed and provides evidence of the infringement for legal proceedings. The C2PA certificate you embed also signals to AI companies that your work is not available for training." },
            ]}
        />
    );
}
