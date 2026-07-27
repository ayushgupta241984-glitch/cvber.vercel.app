import { Metadata } from "next";

export const metadata: Metadata = {
    title: {
        absolute: "AI Art Protection Tools — C2PA, DMCA & Theft Detection | CVBER"
    },
    description: "Enterprise-grade art protection for creators: C2PA provenance certificates, automated DMCA takedowns to 12,000+ domains, AI theft detection, and blockchain ownership proof. Free to start — no credit card required.",
    alternates: {
        canonical: "https://cvber.vercel.app/features",
    },
};

export default function FeaturesLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
