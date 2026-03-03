import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Dashboard",
    description: "Manage your protected files, view threat analysis results, generate certificates, and monitor for content theft.",
};

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
