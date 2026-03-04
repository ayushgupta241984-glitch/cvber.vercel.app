"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Link2, Search, Shield, ArrowRight, Fingerprint, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function VerifyLandingPage() {
    const router = useRouter();
    const [hash, setHash] = useState("");
    const [error, setError] = useState("");
    const [isFocused, setIsFocused] = useState(false);

    const handleVerify = () => {
        const cleanHash = hash.trim();
        if (!cleanHash) {
            setError("Identification Hash Required");
            return;
        }
        if (!/^[a-fA-F0-9]{64}$/.test(cleanHash)) {
            setError("Invalid Hash Cipher (SHA-256 Expected)");
            return;
        }
        router.push(`/verify/${cleanHash}`);
    };

    return (
        <div className="relative min-h-screen bg-[#050505] text-white selection:bg-purple-500/30 overflow-x-hidden font-sans">
            {/* Persistent Grid Background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
                <div className="absolute inset-x-0 top-0 h-[800px] bg-gradient-to-b from-purple-500/10 via-transparent to-transparent opacity-60" />
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                    className="absolute top-[-20%] right-[-10%] w-[1000px] h-[1000px] bg-purple-500/[0.03] blur-[150px] rounded-full"
                />
            </div>

            <div className="relative z-10 max-w-4xl mx-auto pt-[20vh] px-6 pb-32">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-20"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-purple-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-10">
                        Neural Validation Protocol v4
                    </div>
                    <h1 className="text-5xl md:text-8xl font-black tracking-tighter mb-8 uppercase italic leading-none">
                        Identity <br /> <span className="text-glow">Verified.</span>
                    </h1>
                    <p className="text-lg md:text-xl text-zinc-500 max-w-2xl mx-auto font-medium">
                        Verify your CVBER digital timestamps against the immutable Bitcoin ledger.
                        Absolute proof of creation, anchors in seconds.
                    </p>
                </motion.div>

                {/* Validator Card */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className={`relative p-1 rounded-[3rem] transition-all duration-700 ${isFocused ? "bg-gradient-to-br from-purple-500/40 via-purple-500/5 to-transparent" : "bg-white/5"}`}
                >
                    <div className="bg-[#0D0D10] rounded-[2.9rem] p-10 md:p-16 backdrop-blur-3xl overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            <Fingerprint className="w-40 h-40" />
                        </div>

                        <div className="relative z-10 space-y-10">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-purple-500/10 border border-purple-500/20 rounded-xl flex items-center justify-center">
                                    <Zap className="w-6 h-6 text-purple-500" />
                                </div>
                                <h2 className="text-2xl font-black tracking-tight uppercase italic">Input Cipher</h2>
                            </div>

                            <div className="space-y-4">
                                <div className="relative group">
                                    <textarea
                                        value={hash}
                                        onFocus={() => setIsFocused(true)}
                                        onBlur={() => setIsFocused(false)}
                                        onChange={(e) => {
                                            setHash(e.target.value);
                                            setError("");
                                        }}
                                        placeholder="Identification Hash (SHA-256)..."
                                        className="w-full px-8 py-8 bg-black/40 border border-white/5 rounded-3xl text-sm font-mono focus:outline-none focus:ring-1 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all resize-none h-32 text-purple-100 placeholder:text-zinc-700"
                                    />
                                    <AnimatePresence>
                                        {error && (
                                            <motion.p
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0 }}
                                                className="absolute -bottom-8 left-4 text-red-500 text-[10px] font-bold uppercase tracking-widest"
                                            >
                                                {error}
                                            </motion.p>
                                        )}
                                    </AnimatePresence>
                                </div>

                                <button
                                    onClick={handleVerify}
                                    className="w-full py-6 bg-white text-black font-black text-xs uppercase tracking-[0.3em] rounded-2xl hover:bg-zinc-100 transition-all flex items-center justify-center gap-4 active:scale-[0.98] shadow-2xl shadow-white/5"
                                >
                                    Initiate Validation <ArrowRight className="h-4 w-4" />
                                </button>
                            </div>

                            {/* Logic Info */}
                            <div className="grid md:grid-cols-3 gap-8 pt-8 border-t border-white/5">
                                {[
                                    { label: "Step 1", text: "Hashing" },
                                    { label: "Step 2", text: "Proof Discovery" },
                                    { label: "Step 3", text: "Attestation" }
                                ].map((step, i) => (
                                    <div key={i} className="space-y-1">
                                        <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">{step.label}</span>
                                        <p className="text-xs font-bold text-zinc-400">{step.text}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* History Section */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="mt-20"
                >
                    <div className="flex items-center gap-2 mb-8 px-4">
                        <Shield className="h-4 w-4 text-zinc-600" />
                        <h3 className="text-zinc-600 font-bold text-[10px] uppercase tracking-[0.2em]">Recent Identifications</h3>
                    </div>
                    <div className="bg-[#0D0D10]/50 border border-white/5 rounded-[2.5rem] p-8">
                        <RecentProofs onSelect={(h) => router.push(`/verify/${h}`)} />
                    </div>
                </motion.div>

                {/* Footer Subtext */}
                <p className="text-center text-zinc-800 text-[9px] font-black uppercase tracking-[0.4em] mt-32 leading-relaxed">
                    CVBER NEURAL VALIDATOR · Powered by decentralized opentimestamps · © 2026
                </p>
            </div>
        </div>
    );
}

function RecentProofs({ onSelect }: { onSelect: (hash: string) => void }) {
    const [proofs, setProofs] = useState<any[]>([]);

    useEffect(() => {
        const stored = JSON.parse(localStorage.getItem("cvber_blockchain_proofs") || "[]");
        setProofs(stored);
    }, []);

    if (proofs.length === 0) {
        return (
            <div className="py-10 text-center">
                <p className="text-zinc-700 text-[10px] font-bold uppercase tracking-widest">
                    No active timestamps detected in local cache.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {proofs.slice(0, 5).map((proof: any) => (
                <button
                    key={proof.asset_hash}
                    onClick={() => onSelect(proof.asset_hash)}
                    className="w-full p-6 bg-white/[0.02] hover:bg-white/[0.05] rounded-3xl text-left transition-all group flex items-center justify-between border border-transparent hover:border-white/5"
                >
                    <div>
                        <p className="text-zinc-400 group-hover:text-white font-bold text-sm truncate mb-1 transition-colors uppercase italic tracking-tight">{proof.asset_name}</p>
                        <p className="text-zinc-700 font-mono text-[10px] truncate max-w-[200px] md:max-w-md">{proof.asset_hash}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-zinc-800 group-hover:text-purple-500 transition-colors" />
                </button>
            ))}
        </div>
    );
}
