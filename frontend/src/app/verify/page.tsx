"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Shield, ArrowRight, Fingerprint, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function VerifyLandingPage() {
    const router = useRouter();
    const [hash, setHash] = useState("");
    const [error, setError] = useState("");
    const [isFocused, setIsFocused] = useState(false);

    const handleVerify = () => {
        const cleanHash = hash.trim();
        if (!cleanHash) { setError("Hash Required"); return; }
        if (!/^[a-fA-F0-9]{64}$/.test(cleanHash)) { setError("Invalid SHA-256 Hash"); return; }
        router.push(`/verify/${cleanHash}`);
    };

    return (
        <div className="min-h-screen bg-gallery-black text-luxury-cream selection:bg-luxury-gold/25 overflow-x-hidden">
            {/* Subtle animated background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 opacity-[0.02]">
                    <img src="https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=1920&q=80" alt="" className="w-full h-full object-cover" />
                </div>
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 90, repeat: Infinity, ease: "linear" }}
                    className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-luxury-gold/[0.02] blur-[120px] rounded-full" />
            </div>

            <div className="relative z-10 max-w-4xl mx-auto pt-[20vh] px-8 md:px-16 pb-32">
                {/* Header */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-20">
                    <div className="tag mb-10">Validation Protocol</div>
                    <h1 className="font-display text-5xl md:text-8xl font-bold text-luxury-cream mb-8 leading-tight gold-glow">
                        Identity<br /><span className="text-luxury-gold">Verified.</span>
                    </h1>
                    <p className="text-lg text-luxury-muted max-w-2xl mx-auto font-sans">
                        Verify your CVBER digital timestamps against the immutable Bitcoin ledger.
                        Absolute proof of creation, anchored in seconds.
                    </p>
                </motion.div>

                {/* Validator Card */}
                <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
                    className={`relative p-[1px] rounded-3xl transition-all duration-700 ${isFocused ? "bg-gradient-to-b from-luxury-gold/40 via-luxury-gold/10 to-transparent" : "bg-gallery-border"}`}>
                    <div className="bg-gallery-surface rounded-3xl p-10 md:p-16 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                            <Fingerprint className="w-40 h-40" />
                        </div>

                        <div className="relative z-10 space-y-10">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full border border-luxury-gold/20 flex items-center justify-center">
                                    <Zap className="w-5 h-5 text-luxury-gold" />
                                </div>
                                <h2 className="font-display text-2xl font-bold text-luxury-cream">Input Cipher</h2>
                            </div>

                            <div className="space-y-4">
                                <textarea
                                    value={hash}
                                    onFocus={() => setIsFocused(true)}
                                    onBlur={() => setIsFocused(false)}
                                    onChange={(e) => { setHash(e.target.value); setError(""); }}
                                    placeholder="Paste SHA-256 hash..."
                                    className="w-full px-6 py-6 bg-gallery-black/50 border border-gallery-border rounded-2xl text-sm font-mono focus:outline-none focus:border-luxury-gold/50 transition-colors resize-none h-28 text-luxury-cream placeholder-luxury-muted/30"
                                />
                                <AnimatePresence>
                                    {error && (
                                        <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                                            className="text-red-400 text-[10px] font-bold uppercase tracking-widest font-sans">
                                            {error}
                                        </motion.p>
                                    )}
                                </AnimatePresence>

                                <button onClick={handleVerify}
                                    className="w-full py-5 btn-primary flex items-center justify-center gap-3">
                                    Initiate Validation <ArrowRight className="h-4 w-4" />
                                </button>
                            </div>

                            {/* Steps */}
                            <div className="grid md:grid-cols-3 gap-8 pt-8 border-t border-gallery-border">
                                {[
                                    { label: "Step 1", text: "Hashing" },
                                    { label: "Step 2", text: "Proof Discovery" },
                                    { label: "Step 3", text: "Attestation" }
                                ].map((step, i) => (
                                    <div key={i} className="space-y-1">
                                        <span className="text-[9px] font-bold text-luxury-muted/50 uppercase tracking-ultra-wide font-sans">{step.label}</span>
                                        <p className="text-xs font-bold text-luxury-muted font-sans">{step.text}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Recent Proofs */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mt-20">
                    <div className="flex items-center gap-2 mb-6 px-4">
                        <Shield className="h-3 w-3 text-luxury-muted/50" />
                        <h3 className="text-luxury-muted/50 font-bold text-[9px] uppercase tracking-ultra-wide font-sans">Recent Identifications</h3>
                    </div>
                    <div className="card-gallery p-8">
                        <RecentProofs onSelect={(h) => router.push(`/verify/${h}`)} />
                    </div>
                </motion.div>

                <p className="text-center text-luxury-muted/20 text-[8px] font-bold uppercase tracking-[0.5em] mt-32 leading-relaxed font-sans">
                    CVBER VALIDATOR &middot; Powered by decentralized opentimestamps
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
                <p className="text-luxury-muted/30 text-[10px] font-bold uppercase tracking-widest font-sans">
                    No active timestamps detected in local cache.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {proofs.slice(0, 5).map((proof: any) => (
                <button key={proof.asset_hash} onClick={() => onSelect(proof.asset_hash)}
                    className="w-full p-5 card-gallery hover:bg-gallery-surface/80 text-left transition-all group flex items-center justify-between">
                    <div>
                        <p className="text-luxury-cream group-hover:text-luxury-gold font-bold text-sm truncate mb-1 transition-colors font-sans">{proof.asset_name}</p>
                        <p className="text-luxury-muted/50 font-mono text-[10px] truncate max-w-[200px] md:max-w-md">{proof.asset_hash}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-luxury-muted/30 group-hover:text-luxury-gold transition-colors" />
                </button>
            ))}
        </div>
    );
}
