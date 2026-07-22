"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function RouteWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hasOwnNav = pathname === "/" || pathname === "/gate";

  if (hasOwnNav) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen">{children}</main>
      <Footer />
    </>
  );
}
