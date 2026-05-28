"use client";
import { useState, useCallback } from "react";
import { MessageSquare, X, Send, Star } from "lucide-react";
import { apiClient } from "@/lib/api-client";

export function FeedbackWidget() {
    const [open, setOpen] = useState(false);
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [message, setMessage] = useState("");
    const [sent, setSent] = useState(false);
    const [sending, setSending] = useState(false);

    const submit = useCallback(async () => {
        if (!message.trim() || sending) return;
        setSending(true);
        try {
            const token = localStorage.getItem("access_token");
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"}/api/feedback/submit`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                    body: JSON.stringify({ rating: rating || 3, message: message.trim(), category: "dashboard" }),
                }
            );
            if (res.ok) setSent(true);
            else setSent(true);
        } catch {
            setSent(true);
        } finally {
            setSending(false);
        }
    }, [message, rating, sending]);

    if (sent) {
        return (
            <div className="fixed bottom-6 right-6 z-50">
                <button
                    onClick={() => { setOpen(false); setTimeout(() => setSent(false), 300); }}
                    className="w-12 h-12 rounded-full bg-luxury-gold/90 text-black flex items-center justify-center shadow-2xl hover:bg-luxury-gold transition-all"
                >
                    <MessageSquare className="w-5 h-5" />
                </button>
                <div className="absolute bottom-16 right-0 w-72 p-4 border border-luxury-gold/30 bg-[#0a0a0a] backdrop-blur-xl">
                    <p className="text-xs text-luxury-cream/70 font-sans">Thanks for the feedback!</p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {open && (
                <div className="absolute bottom-16 right-0 w-80 border border-luxury-gold/30 bg-[#0a0a0a] backdrop-blur-xl shadow-2xl">
                    <div className="flex items-center justify-between p-4 border-b border-luxury-steel/30">
                        <span className="text-xs uppercase tracking-ultra-wide text-luxury-gold font-semibold">Feedback</span>
                        <button onClick={() => setOpen(false)} className="text-luxury-muted/50 hover:text-luxury-cream">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="p-4 space-y-4">
                        <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((n) => (
                                <button
                                    key={n}
                                    onMouseEnter={() => setHoverRating(n)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    onClick={() => setRating(n)}
                                    className={`p-1 transition-colors ${(hoverRating || rating) >= n ? "text-luxury-gold" : "text-luxury-muted/30"}`}
                                >
                                    <Star className="w-5 h-5" fill={(hoverRating || rating) >= n ? "currentColor" : "none"} />
                                </button>
                            ))}
                        </div>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="What would make CVBER better for you?"
                            className="w-full bg-transparent border border-luxury-steel/30 p-3 text-xs text-luxury-cream placeholder-luxury-muted/30 resize-none h-24 focus:outline-none focus:border-luxury-gold/50"
                        />
                        <button
                            onClick={submit}
                            disabled={!message.trim() || sending}
                            className="w-full py-3 text-[10px] uppercase tracking-ultra-wide font-semibold bg-luxury-gold/90 text-black hover:bg-luxury-gold disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                        >
                            {sending ? "Sending..." : <>Send <Send className="w-3 h-3" /></>}
                        </button>
                    </div>
                </div>
            )}
            <button
                onClick={() => setOpen(!open)}
                className="w-12 h-12 rounded-full bg-luxury-gold/90 text-black flex items-center justify-center shadow-2xl hover:bg-luxury-gold transition-all"
            >
                <MessageSquare className="w-5 h-5" />
            </button>
        </div>
    );
}
