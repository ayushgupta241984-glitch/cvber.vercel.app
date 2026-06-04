import { Metadata } from "next";
import SEOLandingPage from "@/components/seo/SEOLandingPage";

export const metadata: Metadata = {
    title: { absolute: "How to Stop AI From Training on My Art — 5 Methods That Work | CVBER" },
    description: "5 proven ways to stop AI from using your art for training. C2PA certificates, DMCA takedowns, Glaze, Nightshade, and legal action. Free tools included.",
    alternates: { canonical: "https://cvber.vercel.app/how-to-stop-ai-training-on-my-art" },
    keywords: ["stop AI training on my art", "opt out AI training", "AI art protection", "C2PA opt out", "Glaze vs Nightshade", "AI scraping protection", "how to protect art from AI"],
};

export default function StopAITrainingPage() {
    return (
        <SEOLandingPage
            title="Stop AI Training on My Art"
            subtitle="AI Training Opt-Out Guide"
            h1="How to Stop AI From Training on Your Art"
            description="AI companies are scraping millions of artworks to train their models without permission. Here are 5 proven methods to stop them, from free tools to legal action."
            canonical="https://cvber.vercel.app/how-to-stop-ai-training-on-my-art"
            features={[
                { title: "Method 1: C2PA Certificates (Recommended)", description: "Embed C2PA certificates into your artwork. These include machine-readable opt-out signals that major AI companies have committed to respecting. CVBER provides free C2PA certificates." },
                { title: "Method 2: Robots.txt Opt-Out", description: "Add specific directives to your website's robots.txt file to block AI crawlers. While not legally binding, it signals your intent and is respected by some companies." },
                { title: "Method 3: Glaze & Nightshade", description: "Use Glaze to add pixel-level noise that disrupts AI training on your style. Use Nightshade to poison AI training datasets with harmful data. Both are free tools from the University of Chicago." },
                { title: "Method 4: DMCA Takedowns", description: "File DMCA takedown notices against websites hosting your scraped art. CVBER automates this process with auto-generated notices." },
                { title: "Method 5: Legal Action", description: "Join class-action lawsuits against AI companies or file individual copyright infringement claims. C2PA certificates provide strong evidence for legal proceedings." },
            ]}
            faqs={[
                { question: "What is the best way to stop AI from training on my art?", answer: "The most effective approach combines multiple methods: C2PA certificates (for opt-out signals), robots.txt (for web crawling), Glaze/Nightshade (for technical protection), and DMCA takedowns (for enforcement). CVBER handles C2PA and DMCA automatically." },
                { question: "Do AI companies respect opt-out signals?", answer: "Major AI companies including OpenAI, Google, and Adobe have committed to respecting C2PA opt-out signals and robots.txt directives. While not all companies honor them, these signals provide legal evidence of your intent." },
                { question: "Is Glaze or Nightshade better?", answer: "Glaze and Nightshade solve different problems. Glaze protects your art style from being replicated. Nightshade poisons AI training datasets. Many artists use both together for maximum protection." },
                { question: "Can I sue AI companies for using my art?", answer: "Yes, several class-action lawsuits are currently ongoing. C2PA certificates provide strong evidence of when your art was created and that you are the original creator. Consult a lawyer for specific legal advice." },
                { question: "How do I check if my art is in an AI training dataset?", answer: "Use CVBER's reverse image search and AI training dataset monitoring to check if your art appears in known training datasets like LAION-5B." },
            ]}
        />
    );
}
