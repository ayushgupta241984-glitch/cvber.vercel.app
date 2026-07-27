import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Sign In",
    description: "Sign in to your Cvber account to access your protected files, certificates of origin, and content protection dashboard.",
    openGraph: {
        title: "Sign In to Cvber",
        description: "Access your content protection dashboard and manage your digital certificates.",
    },
};

export default function LoginLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
