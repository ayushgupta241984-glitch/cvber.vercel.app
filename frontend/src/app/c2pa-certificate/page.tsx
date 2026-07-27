import { Metadata } from "next";
import SEOLandingPage from "@/components/seo/SEOLandingPage";

export const metadata: Metadata = {
    title: { absolute: "Free C2PA Certificate for Digital Art — Prove Your Ownership | CVBER" },
    description: "Get a free C2PA provenance certificate for your digital art. Cryptographic proof of ownership recognized by Adobe, Microsoft, and Google. Embed in any image file.",
    alternates: { canonical: "https://cvber.vercel.app/c2pa-certificate" },
    keywords: ["C2PA certificate", "C2PA provenance", "digital art certificate", "content authenticity", "prove ownership digital art", "C2PA for artists"],
};

export default function C2PACertificatePage() {
    return (
        <SEOLandingPage
            title="C2PA Certificate"
            subtitle="C2PA Digital Provenance"
            h1="Get a Free C2PA Certificate for Your Digital Art"
            description="A C2PA certificate is a cryptographic digital signature embedded into your image file that proves you are the original creator. It is the same standard used by Adobe, Microsoft, Google, and the BBC to verify content authenticity."
            canonical="https://cvber.vercel.app/c2pa-certificate"
            features={[
                { title: "Cryptographic Proof of Ownership", description: "C2PA certificates use advanced cryptography to create an unbreakable link between you and your artwork. No one can forge or alter this proof." },
                { title: "Industry-Standard Recognition", description: "The C2PA standard is supported by Adobe, Microsoft, Google, BBC, and major tech companies. Your certificate is recognized worldwide." },
                { title: "Embedded in Your Files", description: "The certificate is embedded directly into your image file's metadata. It travels with your work wherever it goes online." },
                { title: "Legal Evidence", description: "C2PA certificates provide legally admissible proof of creation date and ownership. Use them in court to prove your copyright." },
                { title: "AI Training Opt-Out Signal", description: "C2PA certificates include machine-readable signals that tell AI companies your work is not available for training." },
                { title: "Works with Any Image Format", description: "CVBER supports JPEG, PNG, TIFF, WebP, and more. Get a C2PA certificate for any digital image in seconds." },
            ]}
            faqs={[
                { question: "What is a C2PA certificate?", answer: "A C2PA certificate is a cryptographic digital signature embedded directly into your image file that proves three things: who created the work, when it was created, and that it has not been altered since creation. It is the industry standard developed by the Coalition for Content Provenance and Authenticity, supported by Adobe, Microsoft, Google, BBC, Nikon, Canon, and Leica. The certificate includes machine-readable signals that tell AI companies your work is not available for training, and it travels with your file wherever it goes online, even if metadata is stripped by social media platforms." },
                { question: "How do I get a C2PA certificate for my art?", answer: "Getting a C2PA certificate with CVBER takes less than 60 seconds. Sign up for a free account at cvber.vercel.app, upload your artwork in any supported format (JPEG, PNG, TIFF, WebP), and CVBER automatically generates a C2PA provenance certificate that is embedded into your file. You can download the certified file immediately and start using it as legal proof of ownership. No credit card required, no software to install." },
                { question: "Is a C2PA certificate legally binding?", answer: "Yes, C2PA certificates provide legally admissible proof of creation date and ownership in courts worldwide. The cryptographic signature creates an immutable record that cannot be forged or altered, making it powerful evidence in copyright infringement cases. Major legal scholars and copyright experts recognize C2PA certificates as strong evidence of authorship, and several recent court cases have accepted digital provenance certificates as valid evidence." },
                { question: "Do AI companies respect C2PA certificates?", answer: "Major AI companies including OpenAI, Google, Adobe, and Microsoft have committed to respecting C2PA opt-out signals embedded in content. While not all companies currently honor these signals, C2PA provides the strongest available machine-readable signal that your work is not available for AI training. The C2PA standard is part of the Content Authenticity Initiative, which has over 2,000 member organizations working to establish content provenance as an industry norm." },
                { question: "How much does a C2PA certificate cost?", answer: "CVBER provides C2PA certificates completely free with no credit card required. The free plan includes 10 scans per month, 1GB of encrypted storage, basic DMCA templates, and unlimited C2PA certificate generation. Premium plans starting at $12 per month add unlimited scans, 50GB storage, priority support, and advanced monitoring features for professional artists and studios." },
            ]}
        />
    );
}
