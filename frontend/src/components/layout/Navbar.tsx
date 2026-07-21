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
            <span className={`text-xs font-bold uppercase tracking-[0.2em] transition-colors duration-300 ${
                isActive ? "text-[#C9A962]" : "text-white/40 group-hover:text-white"
            }`}>
                {children}
            </span>
            <motion.span
                className="absolute -bottom-1 left-0 h-[1px] bg-[#C9A962]"
                initial={{ width: isActive ? "100%" : "0%" }}
                whileHover={{ width: "100%" }}
                transition={{ duration: 0.3, ease: "easeOut" }}
            />
        </Link>
    );
}

function GoldButton({ href, children, onClick }: { href?: string; children: React.ReactNode; onClick?: () => void }) {
    if (href) {
        return (
            <Link href={href}
                className="relative overflow-hidden bg-[#C9A962] hover:bg-[#D4B97A] text-black font-bold py-3 px-6 uppercase tracking-[0.2em] text-[10px] transition-all duration-500">
                <span className="relative z-10">{children}</span>
                <motion.div
                    className="absolute inset-0 bg-white/20"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: "0%" }}
                    transition={{ duration: 0.4 }}
                />
            </Link>
        );
    }
    return (
        <button onClick={onClick}
            className="relative overflow-hidden bg-[#C9A962] hover:bg-[#D4B97A] text-black font-bold py-3 px-6 uppercase tracking-[0.2em] text-[10px] transition-all duration-500">
            <span className="relative z-10">{children}</span>
            <motion.div
                className="absolute inset-0 bg-white/20"
                initial={{ x: "-100%" }}
                whileHover={{ x: "0%" }}
                transition={{ duration: 0.4 }}
            />
        </button>
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
            <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${
                    scrolled
                        ? "bg-[#0A0A0A]/85 backdrop-blur-2xl"
                        : "bg-transparent"
                }`}
            >
                {scrolled && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 overflow-hidden pointer-events-none"
                    >
                        <div className="absolute top-0 left-1/4 w-96 h-32 bg-[#C9A962]/3 blur-[100px] rounded-full" />
                        <div className="absolute top-0 right-1/4 w-64 h-24 bg-[#C9A962]/2 blur-[80px] rounded-full" />
                    </motion.div>
                )}
                
                <div className={`relative ${scrolled ? 'border-b border-white/[0.04]' : ''}`}>
                    <div className="max-w-7xl mx-auto px-6 md:px-12">
                        <div className="flex items-center justify-between h-20">
                            <Link href="/" className="flex items-center gap-2.5 group relative z-10">
                                <Logo size="sm" alt="CVBER" />
                                <span className="font-display text-xl font-bold text-white tracking-tight">Cvber</span>
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
                                        <span className="text-xs text-white/40 font-sans font-medium">{user.full_name}</span>
                                        <GoldButton href="/dashboard">Dashboard</GoldButton>
                                        <button onClick={handleLogout}
                                            className="text-white/40 hover:text-white text-[10px] font-bold uppercase tracking-[0.2em] transition-colors">
                                            Logout
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <Link href="/login"
                                            className="text-white/40 hover:text-white text-xs font-bold uppercase tracking-[0.2em] transition-colors">
                                            Log In
                                        </Link>
                                        <GoldButton href="/gate">Apply for Access</GoldButton>
                                    </>
                                )}
                            </div>

                            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-white relative z-10" aria-label="Toggle menu">
                                {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                            </button>
                        </div>
                    </div>
                </div>

                <AnimatePresence>
                    {menuOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="md:hidden bg-[#0A0A0A]/95 backdrop-blur-2xl border-t border-white/[0.06] overflow-hidden relative z-20"
                        >
                            <div className="px-6 py-8 space-y-6">
                                {navLinks.map((link) => (
                                    <Link key={link.name} href={link.href} onClick={() => setMenuOpen(false)}
                                        className={`block text-sm font-bold uppercase tracking-[0.2em] transition-colors ${
                                            pathname === link.href ? "text-[#C9A962]" : "text-white/50 hover:text-white"
                                        }`}>
                                        {link.name}
                                    </Link>
                                ))}
                                <div className="h-px bg-gradient-to-r from-[#C9A962]/20 to-transparent" />
                                {mounted && user ? (
                                    <div className="space-y-4">
                                        <Link href="/dashboard" onClick={() => setMenuOpen(false)}
                                            className="block text-sm font-bold uppercase tracking-[0.2em] text-[#C9A962]">
                                            Dashboard
                                        </Link>
                                        <button onClick={handleLogout}
                                            className="block text-sm font-bold uppercase tracking-[0.2em] text-white/50">
                                            Logout
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <Link href="/login" onClick={() => setMenuOpen(false)}
                                            className="block text-sm font-bold uppercase tracking-[0.2em] text-white/50 hover:text-white">
                                            Log In
                                        </Link>
                                        <Link href="/gate" onClick={() => setMenuOpen(false)}
                                            className="block text-center bg-[#C9A962] hover:bg-[#D4B97A] text-black font-bold py-3 uppercase tracking-[0.2em] text-xs">
                                            Apply for Access
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
            <div className="h-20" />
        </>
    );
}
