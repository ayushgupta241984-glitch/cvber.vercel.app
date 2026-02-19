"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api-client";
import Logo from "../common/Logo";

export default function Navbar() {
    const pathname = usePathname();
    const [user, setUser] = useState<{ full_name: string } | null>(null);

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('access_token');
            if (token) {
                try {
                    const profile = await apiClient.getUserProfile();
                    setUser(profile);
                } catch (err) {
                    console.error("Failed to load user", err);
                }
            } else {
                setUser(null);
            }
        };
        checkAuth();
    }, [pathname]);

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        setUser(null);
        window.location.href = '/';
    };

    const isAuthPage = pathname === "/login" || pathname === "/register";
    if (isAuthPage) return null;

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0A0A0F]/80 backdrop-blur-md border-b border-zinc-800/50" aria-label="Main Navigation">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    <div className="flex items-center gap-2">
                        <Link href="/" className="flex items-center gap-2 group" aria-label="CVBER Home">
                            <Logo size="md" alt="CVBER - Protected Content" />
                            <span className="text-xl font-bold text-white">
                                Cvber
                            </span>
                        </Link>
                    </div>

                    <div className="hidden md:flex items-center gap-8" role="menubar">
                        <Link href="/features" className="text-sm font-medium text-zinc-400 hover:text-purple-400 transition-colors" role="menuitem">Features</Link>
                        <Link href="/how-it-works" className="text-sm font-medium text-zinc-400 hover:text-purple-400 transition-colors" role="menuitem">How It Works</Link>
                        <Link href="/art-hub" className="text-sm font-medium text-zinc-400 hover:text-purple-400 transition-colors" role="menuitem">Art Hub</Link>
                        <Link href="/verify" className="text-sm font-medium text-zinc-400 hover:text-purple-400 transition-colors" role="menuitem">Verify</Link>
                    </div>

                    <div className="flex items-center gap-4">
                        {user ? (
                            <>
                                <span className="text-sm font-medium text-white capitalize">
                                    Hi, {user.full_name || 'User'}
                                </span>
                                <button
                                    onClick={handleLogout}
                                    className="text-sm font-medium text-zinc-400 hover:text-red-400 transition-colors"
                                >
                                    Sign Out
                                </button>
                                <Link href="/dashboard" className="btn-primary py-2 px-4 text-sm">
                                    Dashboard
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link href="/login" className="text-sm font-medium text-zinc-400 hover:text-purple-400 transition-colors">
                                    Log In
                                </Link>
                                <Link href="/register" className="btn-primary py-2 px-4 text-sm">
                                    Get Started
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
