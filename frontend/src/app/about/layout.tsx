import { Metadata } from "next";

export const metadata: Metadata = {
    title: { absolute: "About CVBER — Free AI Art Protection Platform | CVBER" },
    description: "Learn about CVBER, the free AI-powered platform protecting digital artists from AI scraping, theft, and unauthorized use. C2PA certificates, DMCA automation, and blockchain proof.",
    alternates: { canonical: "https://cvber.vercel.app/about" },
    keywords: ["about CVBER", "CVBER art protection", "AI art protection platform", "digital art protection company"],
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
