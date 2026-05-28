'use client';

import { Shield, Layout, LogOut, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

interface DashboardSidebarProps {
    userName: string;
    userInitials: string;
    isOpen: boolean;
    onClose: () => void;
    onLogout: () => void;
}

const easeLuxury = [0.25, 0.46, 0.45, 0.94] as const;

export function DashboardSidebar({ userName, userInitials, isOpen, onClose, onLogout }: DashboardSidebarProps) {
    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4, ease: easeLuxury }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
                        onClick={onClose}
                    />
                )}
            </AnimatePresence>

            <motion.aside
                initial={false}
                animate={{ x: isOpen || typeof window !== 'undefined' && window.innerWidth >= 1024 ? 0 : -288 }}
                transition={{ duration: 0.5, ease: easeLuxury }}
                suppressHydrationWarning
                className="w-72 border-r border-luxury-steel/30 flex flex-col fixed inset-y-0 left-0 bg-black z-50 lg:translate-x-0"
            >
                <div className="px-8 pt-10 pb-8">
                    <div className="flex items-center justify-between">
                        <Link href="/" className="flex items-center gap-4 group">
                            <div className="w-8 h-8 border border-luxury-gold/60 flex items-center justify-center group-hover:border-luxury-gold transition-colors duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]">
                                <Shield className="h-4 w-4 text-luxury-gold" />
                            </div>
                            <span className="text-lg font-display font-semibold tracking-wide text-luxury-cream">CVBER</span>
                        </Link>
                        <button
                            type="button"
                            onClick={onClose}
                            className="lg:hidden p-2 text-luxury-muted hover:text-luxury-cream transition-colors duration-300"
                            title="Close sidebar"
                        >
                            <ChevronRight className="w-5 h-5 rotate-180" />
                        </button>
                    </div>
                </div>

                <div className="px-8 pb-6">
                    <div className="h-px bg-luxury-gold/20" />
                </div>

                <nav className="flex-1 px-4 space-y-1">
                    <button
                        onClick={() => { if (typeof window !== 'undefined' && window.innerWidth < 1024) onClose(); }}
                        suppressHydrationWarning
                        className="w-full flex items-center gap-4 px-4 py-3 text-luxury-gold border-l border-luxury-gold/60 bg-luxury-gold/5"
                    >
                        <Layout className="w-4 h-4" />
                        <span className="text-xs uppercase tracking-ultra-wide font-semibold">Gallery</span>
                    </button>
                </nav>

                <div className="px-4 border-t border-luxury-steel/30 space-y-6 py-6">
                    {userName && (
                        <div className="px-4">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 border border-luxury-gold/40 flex items-center justify-center text-xs font-display font-semibold text-luxury-gold">
                                    {userInitials}
                                </div>
                                <div className="flex flex-col overflow-hidden">
                                    <span className="text-sm font-medium text-luxury-cream truncate">{userName || 'Artist'}</span>
                                    <span className="text-[9px] uppercase tracking-ultra-wide text-luxury-gold/60 mt-0.5">Artist</span>
                                </div>
                            </div>
                        </div>
                    )}
                    <button
                        onClick={onLogout}
                        suppressHydrationWarning
                        className="w-full flex items-center gap-4 px-4 py-3 text-luxury-muted hover:text-luxury-cream transition-all duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
                    >
                        <LogOut className="w-4 h-4" />
                                    <span className="text-xs uppercase tracking-ultra-wide font-semibold">Exit Gallery</span>
                    </button>
                </div>
            </motion.aside>
        </>
    );
}
