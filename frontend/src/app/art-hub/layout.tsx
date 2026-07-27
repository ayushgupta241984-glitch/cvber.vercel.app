import { Metadata } from "next";

export const metadata: Metadata = {
    title: {
        absolute: "How to Protect Digital Art Online — DMCA, AI Scraping & Copyright Guide | CVBER"
    },
    description: "Complete guide for artists: how to find stolen art, file DMCA takedowns, stop AI training on your work, and prove copyright ownership. Free templates included.",
    alternates: {
        canonical: "https://cvber.vercel.app/art-hub",
    },
};

export default function ArtHubLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
