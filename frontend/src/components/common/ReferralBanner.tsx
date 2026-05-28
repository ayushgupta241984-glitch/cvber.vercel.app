"use client";
import { useState, useEffect, useCallback } from "react";
import { Gift, Copy, Check, Share2, Users } from "lucide-react";

export function ReferralBanner() {
    const [refUrl, setRefUrl] = useState("");
    const [refCount, setRefCount] = useState(0);
    const [copied, setCopied] = useState(false);
    const [dismissed, setDismissed] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRef = async () => {
            const token = localStorage.getItem("access_token");
            if (!token) return;
            try {
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"}/api/feedback/referral/generate`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                if (res.ok) {
                    const data = await res.json();
                    setRefUrl(data.url);
                    setRefCount(data.count || 0);
                }
            } catch {} finally {
                setLoading(false);
            }
        };
        fetchRef();
    }, []);

    const copy = useCallback(() => {
        if (!refUrl) return;
        navigator.clipboard.writeText(refUrl).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    }, [refUrl]);

    const share = useCallback(async () => {
        if (navigator.share) {
            await navigator.share({ title: "CVBER - Protect Your Art", url: refUrl });
        } else {
            copy();
        }
    }, [refUrl, copy]);

    if (dismissed || loading) return null;

    return (
        <div className="border border-luxury-gold/30 p-4 mb-4 relative bg-gradient-to-r from-luxury-gold/5 to-transparent">
            <button onClick={() => setDismissed(true)} className="absolute top-2 right-2 text-luxury-muted/30 hover:text-luxury-cream text-xs">x</button>
            <div className="flex items-center gap-3 mb-3">
                <Gift className="w-4 h-4 text-luxury-gold" />
                <span className="text-xs uppercase tracking-ultra-wide text-luxury-gold font-semibold">Share & Earn</span>
            </div>
            <p className="text-[10px] text-luxury-muted/50 mb-3 leading-relaxed">
                Share CVBER with other creators. More users = better protection for everyone.
            </p>
            <div className="flex items-center gap-2">
                <button onClick={share} className="flex-1 py-2 text-[10px] uppercase tracking-ultra-wide font-semibold border border-luxury-gold/40 text-luxury-gold hover:bg-luxury-gold/10 transition-all flex items-center justify-center gap-2">
                    <Share2 className="w-3 h-3" /> Share
                </button>
                <button onClick={copy} className="py-2 px-3 text-[10px] uppercase tracking-ultra-wide font-semibold border border-luxury-gold/40 text-luxury-gold hover:bg-luxury-gold/10 transition-all flex items-center gap-2">
                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                </button>
            </div>
            {refCount > 0 && (
                <div className="flex items-center gap-2 mt-3 text-[10px] text-luxury-muted/50">
                    <Users className="w-3 h-3" /> {refCount} joined via your link
                </div>
            )}
        </div>
    );
}
