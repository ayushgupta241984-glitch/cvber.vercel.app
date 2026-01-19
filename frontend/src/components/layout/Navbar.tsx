"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api-client";

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
                    // Optionally clear token if invalid
                    // localStorage.removeItem('access_token');
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
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    <div className="flex items-center gap-2">
                        <Link href="/" className="flex items-center gap-2 group">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-sm group-hover:bg-blue-700 transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            <span className="text-xl font-bold bg-clip-text text-gray-900">
                                Cvber
                            </span>
                        </Link>
                    </div>

                    <div className="hidden md:flex items-center gap-8">
                        <Link href="/#features" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">Features</Link>
                        <Link href="/#how-it-works" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">How It Works</Link>
                        <Link href="/verify" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">Verify</Link>
                    </div>

                    <div className="flex items-center gap-4">
                        {user ? (
                            <>
                                <span className="text-sm font-medium text-gray-900 capitalize">
                                    Hi, {user.full_name || 'User'}
                                </span>
                                <button
                                    onClick={handleLogout}
                                    className="text-sm font-medium text-gray-600 hover:text-red-600 transition-colors"
                                >
                                    Sign Out
                                </button>
                                <Link href="/dashboard" className="btn-primary py-2 px-4 text-sm">
                                    Dashboard
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
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
