import { Metadata } from "next";
import SEOLandingPage from "@/components/seo/SEOLandingPage";

export const metadata: Metadata = {
    title: { absolute: "Free DMCA Takedown Generator — Auto-Create Legal Notices | CVBER" },
    description: "Automatically generate legally formatted DMCA takedown notices for stolen art. Fill in the blanks and send. Works for Instagram, TikTok, YouTube, and all platforms.",
    alternates: { canonical: "https://cvber.vercel.app/dmca-takedown" },
    keywords: ["DMCA takedown", "DMCA notice generator", "how to file DMCA", "DMCA takedown template", "stolen art DMCA", "copyright infringement notice"],
};

export default function DMCATakedownPage() {
    return (
        <SEOLandingPage
            title="DMCA Takedown Generator"
            subtitle="Automated DMCA Enforcement"
            h1="Free DMCA Takedown Generator for Stolen Art"
            description="CVBER automatically generates legally formatted DMCA takedown notices when your art is stolen. Fill in the blanks, send the notice, and get your art removed from infringing websites."
            canonical="https://cvber.vercel.app/dmca-takedown"
            features={[
                { title: "Auto-Generated Notices", description: "CVBER automatically creates DMCA takedown notices with all legally required information including your contact details, work description, and sworn statement." },
                { title: "Platform-Specific Templates", description: "Get DMCA templates customized for Instagram, TikTok, YouTube, Reddit, DeviantArt, Pinterest, and all major platforms." },
                { title: "Legal Compliance", description: "Every notice includes the legally required elements: identification of copyrighted work, location of infringing material, your contact information, and good faith statement." },
                { title: "Bulk Takedowns", description: "Found your art stolen across 50 sites? CVBER generates DMCA notices for all of them in one click." },
                { title: "Tracking & Follow-up", description: "Track the status of your DMCA notices and get automatic follow-up reminders for sites that don't respond." },
                { title: "Evidence Preservation", description: "CVBER preserves evidence of infringement with timestamps and screenshots before sending the notice." },
            ]}
            faqs={[
                { question: "How do I file a DMCA takedown for stolen art?", answer: "Sign up for CVBER, upload your original work, and CVBER automatically generates a legally formatted DMCA takedown notice. You can send it directly to platforms or hosting providers through the dashboard." },
                { question: "What information is needed for a DMCA notice?", answer: "A valid DMCA notice requires: identification of the copyrighted work, location of the infringing material, your contact information, a good faith statement, and your signature. CVBER fills all of this in automatically." },
                { question: "How long does a DMCA takedown take?", answer: "Most platforms respond to DMCA notices within 24-72 hours. CVBER tracks the status and sends automatic follow-up reminders if a platform doesn't respond." },
                { question: "Can I use CVBER to file DMCA for any platform?", answer: "Yes, CVBER generates DMCA notices for any platform including Instagram, TikTok, YouTube, Reddit, DeviantArt, Pinterest, stock sites, NFT marketplaces, and any website." },
            ]}
        />
    );
}
