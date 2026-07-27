import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Create Account",
    description: "Join Cvber to protect your creative work with AI-powered security, C2PA certificates, and automated theft detection. Free to get started.",
    openGraph: {
        title: "Create Your Cvber Account",
        description: "Start protecting your digital content with AI-powered threat detection and copyright protection.",
    },
};

export default function RegisterLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
