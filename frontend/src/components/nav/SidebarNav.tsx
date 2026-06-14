"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Shield } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

const navLinks = [
    { href: "/features", label: "Features" },
    { href: "/how-it-works", label: "How It Works" },
    { href: "/about", label: "About" },
    { href: "/verify", label: "Verification" },
    { href: "/art-hub", label: "Art Hub" },
    { href: "/blog", label: "Blog" },
];

const socialLinks = [
    { href: "https://twitter.com", label: "Twitter" },
    { href: "https://instagram.com", label: "Instagram" },
    { href: "https://github.com", label: "GitHub" },
];

interface Props {
    open: boolean;
    onClose: () => void;
    onStartOnboarding?: () => void;
}

export default function SidebarNav({ open, onClose, onStartOnboarding }: Props) {
    useEffect(() => {
        if (open) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => { document.body.style.overflow = ""; };
    }, [open]);

    return (
        <AnimatePresence>
            {open && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                        onClick={onClose}
                        className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-md"
                    />

                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
                        className="fixed top-0 right-0 bottom-0 z-[151] w-full md:w-[480px] bg-[#0a0a0a] border-l border-white/[0.04] flex flex-col"
                    >
                        <div className="flex items-center justify-between px-8 py-6 border-b border-white/[0.04]">
                            <Link href="/" onClick={onClose} className="flex items-center gap-2.5">
                                <Shield className="w-4 h-4 text-purple-400" />
                                <span className="text-[10px] font-black tracking-[0.25em] uppercase text-white/60">CVBER</span>
                            </Link>
                            <button onClick={onClose} className="w-10 h-10 rounded-full border border-white/[0.08] flex items-center justify-center hover:border-white/20 transition-colors">
                                <X className="w-4 h-4 text-zinc-400" />
                            </button>
                        </div>

                        <nav className="flex-1 flex flex-col justify-center px-8 py-12">
                            <div className="space-y-1">
                                {navLinks.map((link, i) => (
                                    <motion.div
                                        key={link.href}
                                        initial={{ opacity: 0, x: 40 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.15 + i * 0.04, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
                                    >
                                        <Link
                                            href={link.href}
                                            onClick={onClose}
                                            className="group flex items-center justify-between py-4 border-b border-white/[0.03] hover:border-white/[0.08] transition-colors"
                                        >
                                            <span className="text-3xl md:text-4xl font-black tracking-tight text-white/70 group-hover:text-white transition-colors duration-300">
                                                {link.label}
                                            </span>
                                            <span className="text-xs text-zinc-600 group-hover:text-zinc-400 transition-colors duration-300 font-mono">
                                                {String(i + 1).padStart(2, "0")}
                                            </span>
                                        </Link>
                                    </motion.div>
                                ))}
                            </div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5, duration: 0.5 }}
                                className="mt-12 flex gap-4"
                            >
                                <Link
                                    href="/login"
                                    onClick={onClose}
                                    className="inline-flex items-center gap-3 px-8 py-4 border border-white/[0.08] text-white rounded-xl font-bold text-sm hover:border-white/20 transition-all"
                                >
                                    Log In
                                </Link>
                                <button
                                    onClick={() => { onClose(); onStartOnboarding?.(); }}
                                    className="inline-flex items-center gap-3 px-8 py-4 bg-white text-black rounded-xl font-bold text-sm hover:bg-zinc-200 transition-all active:scale-95"
                                >
                                    Get Started
                                    <span className="text-lg">→</span>
                                </button>
                            </motion.div>
                        </nav>

                        <div className="px-8 py-6 border-t border-white/[0.04] flex items-center justify-between">
                            <div className="flex gap-6">
                                {socialLinks.map((s, i) => (
                                    <motion.a
                                        key={s.label}
                                        href={s.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.6 + i * 0.05 }}
                                        className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600 hover:text-white transition-colors"
                                    >
                                        {s.label}
                                    </motion.a>
                                ))}
                            </div>
                            <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.7 }}
                                className="text-[10px] text-zinc-700 font-mono"
                            >
                                © 2026
                            </motion.span>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
