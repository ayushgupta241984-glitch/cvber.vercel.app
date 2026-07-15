"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "../common/Logo";

export default function Footer() {
    const pathname = usePathname();
    if (pathname === "/") return null;
    return (
        <footer className="bg-gallery-black border-t border-gallery-border">
            <div className="max-w-7xl mx-auto px-6 md:px-12 py-16">
                <div className="grid md:grid-cols-4 gap-12 mb-12">
                    <div className="md:col-span-2">
                        <div className="flex items-center gap-3 mb-6">
                            <Logo size="sm" alt="CVBER" />
                            <span className="font-display text-xl font-bold text-luxury-cream tracking-tight">CVBER</span>
                        </div>
                        <p className="text-luxury-muted text-sm font-sans leading-relaxed max-w-sm">
                            Professional-grade content security for the AI era.
                            Blockchain-backed provenance and automated enforcement.
                        </p>
                    </div>
                    <div>
                        <h4 className="text-luxury-cream font-bold text-xs uppercase tracking-ultra-wide mb-6 font-sans">Product</h4>
                        <ul className="space-y-3 text-sm text-luxury-muted font-sans">
                            <li><Link href="/features" className="hover:text-luxury-cream transition-colors">Features</Link></li>
                            <li><Link href="/how-it-works" className="hover:text-luxury-cream transition-colors">How It Works</Link></li>
                            <li><Link href="/verify" className="hover:text-luxury-cream transition-colors">Verify</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-luxury-cream font-bold text-xs uppercase tracking-ultra-wide mb-6 font-sans">Resources</h4>
                        <ul className="space-y-3 text-sm text-luxury-muted font-sans">
                            <li><Link href="/art-hub" className="hover:text-luxury-cream transition-colors">Art Hub</Link></li>
                            <li><Link href="/privacy" className="hover:text-luxury-cream transition-colors">Privacy</Link></li>
                            <li><Link href="/terms" className="hover:text-luxury-cream transition-colors">Terms</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="divider-gold" />
                <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-xs text-luxury-muted/60 font-sans">
                        © {new Date().getFullYear()} CVBER. All rights reserved.
                    </p>
                    <div className="flex gap-8 text-xs text-luxury-muted/60 font-sans">
                        <Link href="/privacy" className="hover:text-luxury-cream transition-colors">Privacy Policy</Link>
                        <Link href="/terms" className="hover:text-luxury-cream transition-colors">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
