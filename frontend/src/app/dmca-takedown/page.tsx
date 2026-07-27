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
                { question: "How do I file a DMCA takedown for stolen art?", answer: "Filing a DMCA takedown with CVBER takes three steps. First, sign up for a free account and upload your original artwork as proof of ownership. Second, CVBER automatically detects where your art has been stolen using reverse image search across 12.4 million sources. Third, CVBER generates a legally formatted DMCA takedown notice with all required information including your contact details, description of the copyrighted work, location of the infringing material, and your sworn statement. You can send it directly to platforms or hosting providers through the dashboard with one click." },
                { question: "What information is needed for a DMCA notice?", answer: "A valid DMCA notice under Section 512(c)(3) of the DMCA requires five elements: (1) identification of the copyrighted work, (2) identification of the infringing material with sufficient detail to locate it, (3) your contact information including name, address, phone number, and email, (4) a good faith statement that the use is not authorized, and (5) a statement under penalty of perjury that the information is accurate. CVBER fills all of these in automatically based on your uploaded work and detected infringement." },
                { question: "How long does a DMCA takedown take?", answer: "Most platforms respond to DMCA notices within 24-72 hours, though response times vary by platform. Instagram typically responds within 24 hours, YouTube within 48 hours, and smaller websites may take up to 7 days. CVBER tracks the status of every notice you send and sends automatic follow-up reminders if a platform doesn't respond within the expected timeframe. If a platform fails to respond, CVBER can escalate the notice to their legal department." },
                { question: "Can I use CVBER to file DMCA for any platform?", answer: "Yes, CVBER generates DMCA notices for any platform or website including Instagram, TikTok, YouTube, Reddit, DeviantArt, Pinterest, Twitter/X, Facebook, stock photo sites like Shutterstock and Adobe Stock, NFT marketplaces like OpenSea and Rarible, print-on-demand sites like Redbubble and Society6, and any website that hosts infringing content. CVBER's platform-specific templates ensure each notice meets the particular requirements of the platform it's sent to." },
            ]}
        />
    );
}
