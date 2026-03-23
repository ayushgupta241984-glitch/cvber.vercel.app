import { Metadata } from "next";

export const metadata: Metadata = {
    title: "How to Protect Your Art From AI Scraping in 3 Steps | CVBER",
    description: "Stop AI companies from using your art without permission. Upload your work, embed a C2PA digital certificate proving ownership, then activate 24/7 monitoring that detects theft and auto-generates DMCA takedown notices.",
    alternates: {
        canonical: "https://cvber.vercel.app/how-it-works",
    },
};

export default function HowItWorksLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
