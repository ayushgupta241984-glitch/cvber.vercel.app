"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "../common/Logo";

export default function Footer() {
    const pathname = usePathname();
    if (pathname === "/") return null;
    return (
        <footer className="border-t" style={{ background: 'var(--bg-primary)', borderColor: 'var(--border)' }}>
            <div className="max-w-7xl mx-auto px-6 md:px-12 py-16">
                <div className="grid md:grid-cols-4 gap-12 mb-12">
                    <div className="md:col-span-2">
                        <div className="flex items-center gap-3 mb-6">
                            <Logo size="sm" alt="CVBER" />
                            <span style={{ fontSize: '18px', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '+0.02em' }}>CVBER</span>
                        </div>
                        <p style={{ fontSize: '14px', color: 'var(--text-quaternary)', lineHeight: '1.6', maxWidth: '400px' }}>
                            Professional-grade content security for the AI era.
                            Blockchain-backed provenance and automated enforcement.
                        </p>
                    </div>
                    <div>
                        <h4 style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '+0.1em', color: 'var(--text-primary)', marginBottom: '24px' }}>Product</h4>
                        <ul className="space-y-3">
                            {[
                                { label: 'Features', href: '/features' },
                                { label: 'How It Works', href: '/how-it-works' },
                                { label: 'Verify', href: '/verify' },
                            ].map((item) => (
                                <li key={item.href}>
                                    <Link href={item.href} style={{ fontSize: '14px', color: 'var(--text-quaternary)' }} className="hover:text-[var(--text-primary)] transition-colors">
                                        {item.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h4 style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '+0.1em', color: 'var(--text-primary)', marginBottom: '24px' }}>Resources</h4>
                        <ul className="space-y-3">
                            {[
                                { label: 'Art Hub', href: '/art-hub' },
                                { label: 'Privacy', href: '/privacy' },
                                { label: 'Terms', href: '/terms' },
                            ].map((item) => (
                                <li key={item.href}>
                                    <Link href={item.href} style={{ fontSize: '14px', color: 'var(--text-quaternary)' }} className="hover:text-[var(--text-primary)] transition-colors">
                                        {item.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
                <div style={{ height: '1px', background: 'var(--border)' }} />
                <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p style={{ fontSize: '12px', color: 'var(--text-quaternary)' }}>
                        &copy; {new Date().getFullYear()} CVBER. All rights reserved.
                    </p>
                    <div className="flex gap-8">
                        <Link href="/privacy" style={{ fontSize: '12px', color: 'var(--text-quaternary)' }} className="hover:text-[var(--text-primary)] transition-colors">Privacy Policy</Link>
                        <Link href="/terms" style={{ fontSize: '12px', color: 'var(--text-quaternary)' }} className="hover:text-[var(--text-primary)] transition-colors">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
