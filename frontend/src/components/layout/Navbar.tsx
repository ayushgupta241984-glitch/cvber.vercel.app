"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { apiClient } from "@/lib/api-client";
import Logo from "../common/Logo";

const navLinks = [
    { name: "Features", href: "/features" },
    { name: "How It Works", href: "/how-it-works" },
    { name: "Art Hub", href: "/art-hub" },
    { name: "Verify", href: "/verify" },
];

function NavLink({ href, children, isActive }: { href: string; children: React.ReactNode; isActive: boolean }) {
    return (
        <Link href={href} className="relative group">
            <span style={{
                fontSize: '11px',
                fontWeight: 900,
                textTransform: 'uppercase',
                letterSpacing: '+0.15em',
                color: isActive ? 'var(--text-primary)' : 'var(--text-quaternary)',
            }}>
                {children}
            </span>
            <span className="absolute -bottom-1 left-0 h-[1px] transition-all duration-300"
                style={{ width: isActive ? '100%' : '0%', background: isActive ? 'var(--text-primary)' : 'transparent' }} />
        </Link>
    );
}

function PrimaryButton({ href, children }: { href?: string; children: React.ReactNode }) {
    return (
        <Link href={href || '#'}
            className="px-6 py-3 transition-all duration-200"
            style={{ background: 'rgba(255,255,255,0.9)', color: '#000', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '+0.15em', borderRadius: 'var(--radius)' }}>
            {children}
        </Link>
    );
}

export default function Navbar() {
    const pathname = usePathname();
    const [user, setUser] = useState<{ full_name: string } | null>(null);
    const [mounted, setMounted] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        setMounted(true);
        const checkAuth = async () => {
            const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
            const cachedName = typeof window !== 'undefined' ? localStorage.getItem('user_full_name') : null;
            if (cachedName) setUser({ full_name: cachedName });
            if (token) {
                try {
                    const profile = await apiClient.getUserProfile();
                    setUser(profile);
                    if (profile.full_name) localStorage.setItem('user_full_name', profile.full_name);
                } catch { setUser(null); }
            }
        };
        checkAuth();
        const onScroll = () => setScrolled(window.scrollY > 80);
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, [pathname]);

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_full_name');
        setUser(null);
        window.location.href = '/';
    };

    const isDashboard = pathname.startsWith("/dashboard");
    const isHomepage = pathname === "/";
    const isAuth = pathname === "/login" || pathname === "/register";
    if (isDashboard || isHomepage || isAuth) return null;

    return (
        <>
            <div className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${scrolled ? "backdrop-blur-2xl" : "bg-transparent"}`}
                style={scrolled ? { background: 'rgba(0,0,0,0.85)' } : undefined}>
                <div className={`relative ${scrolled ? 'border-b' : ''}`} style={scrolled ? { borderColor: 'rgba(255,255,255,0.04)' } : undefined}>
                    <div className="max-w-7xl mx-auto px-6 md:px-12">
                        <div className="flex items-center justify-between h-20">
                            <Link href="/" className="flex items-center gap-2.5 relative z-10">
                                <Logo size="sm" alt="CVBER" />
                                <span style={{ fontSize: '18px', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '+0.02em' }}>CVBER</span>
                            </Link>

                            <div className="hidden md:flex items-center gap-12 relative z-10">
                                {navLinks.map((link) => (
                                    <NavLink key={link.name} href={link.href} isActive={pathname === link.href}>
                                        {link.name}
                                    </NavLink>
                                ))}
                            </div>

                            <div className="hidden md:flex items-center gap-6 relative z-10">
                                {mounted && user ? (
                                    <div className="flex items-center gap-4">
                                        <span style={{ fontSize: '12px', color: 'var(--text-quaternary)' }}>{user.full_name}</span>
                                        <PrimaryButton href="/dashboard">Workspace</PrimaryButton>
                                        <button onClick={handleLogout} style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '+0.15em', color: 'var(--text-quaternary)' }}>
                                            Exit
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <Link href="/login" style={{ fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '+0.15em', color: 'var(--text-quaternary)' }}>
                                            Member Access
                                        </Link>
                                        <PrimaryButton href="/gate">Request an Invitation</PrimaryButton>
                                    </>
                                )}
                            </div>

                            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden relative z-10" style={{ color: 'var(--text-primary)' }} aria-label="Toggle menu">
                                {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                            </button>
                        </div>
                    </div>
                </div>

                <AnimatePresence>
                    {menuOpen && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                            className="md:hidden border-t overflow-hidden relative z-20" style={{ background: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(2xl)', borderColor: 'rgba(255,255,255,0.06)' }}>
                            <div className="px-6 py-8 space-y-6">
                                {navLinks.map((link) => (
                                    <Link key={link.name} href={link.href} onClick={() => setMenuOpen(false)}
                                        style={{
                                            fontSize: '13px',
                                            fontWeight: 900,
                                            textTransform: 'uppercase',
                                            letterSpacing: '+0.15em',
                                            color: pathname === link.href ? 'var(--text-primary)' : 'var(--text-tertiary)',
                                        }}>
                                        {link.name}
                                    </Link>
                                ))}
                                <div style={{ height: '1px', background: 'linear-gradient(to right, var(--accent), transparent)' }} />
                                {mounted && user ? (
                                    <div className="space-y-4">
                                        <Link href="/dashboard" onClick={() => setMenuOpen(false)}
                                            style={{ fontSize: '13px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '+0.15em', color: 'var(--text-primary)' }}>
                                            Workspace
                                        </Link>
                                        <button onClick={handleLogout}
                                            style={{ fontSize: '13px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '+0.15em', color: 'var(--text-tertiary)' }}>
                                            Exit
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <Link href="/login" onClick={() => setMenuOpen(false)}
                                            style={{ fontSize: '13px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '+0.15em', color: 'var(--text-tertiary)' }}>
                                            Member Access
                                        </Link>
                                        <Link href="/gate" onClick={() => setMenuOpen(false)}
                                            className="block text-center py-3"
                                            style={{ background: 'rgba(255,255,255,0.9)', color: '#000', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '+0.15em' }}>
                                            Request an Invitation
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            <div className="h-20" />
        </>
    );
}
