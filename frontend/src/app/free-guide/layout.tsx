import { Metadata } from "next";

export const metadata: Metadata = {
    title: { absolute: "Free Art Protection Guide — 7 Ways to Stop AI Theft | CVBER" },
    description: "Download the free art protection guide. Learn 7 proven methods to protect your digital art from AI scraping, theft, and unauthorized use.",
    alternates: { canonical: "https://cvber.vercel.app/free-guide" },
};

export default function FreeGuideLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
