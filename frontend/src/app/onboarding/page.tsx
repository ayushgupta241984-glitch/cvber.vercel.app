"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Shield, Upload, ArrowRight, Check, Sparkles } from "lucide-react";

export default function OnboardingPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        router.push(`/register?email=${encodeURIComponent(email)}`);
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-6">
            <div className="max-w-lg w-full">
                {/* Logo */}
                <div className="flex items-center justify-center mb-12">
                    <Shield className="w-10 h-10 text-purple-500" />
                </div>

                {/* Headline */}
                <div className="text-center mb-10">
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
                        Protect your art<br />from AI theft.
                    </h1>
                    <p className="text-zinc-400 text-lg">
                        Free C2PA certificates, DMCA automation, and 24/7 monitoring.
                    </p>
                </div>

                {/* Product preview — shows what they'll get */}
                <div className="mb-10 p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                            <Upload className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                            <p className="font-bold text-sm">Upload your art</p>
                            <p className="text-zinc-500 text-xs">JPEG, PNG, WebP — any format</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                            <Check className="w-5 h-5 text-green-400" />
                        </div>
                        <div>
                            <p className="font-bold text-sm">Get C2PA certificate</p>
                            <p className="text-zinc-500 text-xs">Cryptographic proof you created it</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                            <Sparkles className="w-5 h-5 text-amber-400" />
                        </div>
                        <div>
                            <p className="font-bold text-sm">24/7 monitoring</p>
                            <p className="text-zinc-500 text-xs">We detect theft and auto-file DMCA</p>
                        </div>
                    </div>
                </div>

                {/* Email input — minimal */}
                <form onSubmit={handleSubmit}>
                    <div className="flex gap-3">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            required
                            className="flex-1 px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500/50 transition-all"
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-4 bg-white text-black rounded-xl font-bold text-sm hover:bg-zinc-200 transition-all flex items-center gap-2 disabled:opacity-50"
                        >
                            {loading ? (
                                <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                            ) : (
                                <>
                                    Start
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </div>
                </form>

                {/* Trust — tiny, at bottom */}
                <div className="mt-6 flex items-center justify-center gap-4 text-zinc-600 text-xs">
                    <span>Free forever</span>
                    <span>·</span>
                    <span>No credit card</span>
                    <span>·</span>
                    <span>Setup in 30s</span>
                </div>

                {/* Sign in link */}
                <p className="text-center mt-6 text-zinc-500 text-sm">
                    Already have an account?{" "}
                    <Link href="/login" className="text-purple-400 hover:text-purple-300">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}
