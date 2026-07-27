import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Verify Content",
    description: "Verify the authenticity of digital content using C2PA signatures and Cvber certificates. Check if files have been tampered with.",
    openGraph: {
        title: "Verify Content Authenticity",
        description: "Check if digital content is authentic and unmodified using C2PA verification.",
    },
    robots: {
        index: true,
        follow: true,
    },
};

export default function VerifyLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
