import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Dashboard",
    description: "Manage your protected files, view threat analysis results, generate certificates, and monitor for content theft.",
    robots: {
        index: false, // Dashboard is private, don't index
        follow: false,
    },
};

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
