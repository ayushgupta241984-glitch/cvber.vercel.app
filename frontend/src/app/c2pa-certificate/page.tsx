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
                { question: "What is a C2PA certificate?", answer: "A C2PA certificate is a cryptographic digital signature embedded into your image file that proves you are the original creator, when it was created, and that it has not been altered. It is the same standard used by Adobe, Microsoft, Google, and the BBC." },
                { question: "How do I get a C2PA certificate for my art?", answer: "Sign up for CVBER, upload your artwork, and CVBER automatically generates a C2PA certificate. The certificate is embedded into your file and you can download it immediately." },
                { question: "Is a C2PA certificate legally binding?", answer: "Yes, C2PA certificates provide legally admissible proof of creation date and ownership. They are recognized by courts worldwide as evidence of copyright." },
                { question: "Do AI companies respect C2PA certificates?", answer: "Major AI companies including OpenAI, Google, and Adobe have committed to respecting C2PA opt-out signals. While not all companies honor them, C2PA provides the strongest available signal." },
                { question: "How much does a C2PA certificate cost?", answer: "CVBER provides C2PA certificates for free. You can upload up to 100 files per month on the free plan with no credit card required." },
            ]}
        />
    );
}
