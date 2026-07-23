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
                `${process.env.NEXT_PUBLIC_BACKEND_URL || "https://cvber-free-las-app.onrender.com"}/api/feedback/submit`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                    body: JSON.stringify({ rating: rating || 3, message: message.trim(), category: "dashboard" }),
                }
            );
            setSent(true);
        } catch {
            setSent(true);
        } finally {
            setSending(false);
        }
    }, [message, rating, sending]);

    if (sent) {
        return (
            <div className="fixed bottom-6 right-6 z-50">
                <button onClick={() => { setOpen(false); setTimeout(() => setSent(false), 300); }}
                    className="w-12 h-12 rounded-full flex items-center justify-center transition-all"
                    style={{ background: 'rgba(255,255,255,0.9)', color: '#000' }}>
                    <MessageSquare className="w-5 h-5" />
                </button>
                <div className="absolute bottom-16 right-0 w-72 p-4 border" style={{ background: '#0a0a0a', borderColor: 'var(--border)', borderRadius: 'var(--radius)' }}>
                    <p style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>feedback received</p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {open && (
                <div className="absolute bottom-16 right-0 w-80 border" style={{ background: '#0a0a0a', borderColor: 'var(--border)', borderRadius: 'var(--radius)' }}>
                    <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--border)' }}>
                        <span style={{ fontSize: '10px', fontWeight: 900, letterSpacing: '+0.1em', textTransform: 'uppercase', color: 'var(--text-quaternary)' }}>Feedback</span>
                        <button onClick={() => setOpen(false)} style={{ color: 'var(--text-quaternary)' }}>
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="p-4 space-y-4">
                        <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((n) => (
                                <button key={n} onMouseEnter={() => setHoverRating(n)} onMouseLeave={() => setHoverRating(0)} onClick={() => setRating(n)}
                                    style={{ color: (hoverRating || rating) >= n ? 'var(--text-secondary)' : 'var(--text-quaternary)' }}>
                                    <Star className="w-5 h-5" fill={(hoverRating || rating) >= n ? "currentColor" : "none"} />
                                </button>
                            ))}
                        </div>
                        <textarea value={message} onChange={(e) => setMessage(e.target.value)}
                            placeholder="What would make CVBER better for you?"
                            className="w-full p-3 text-xs resize-none h-24 focus:outline-none"
                            style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-primary)', borderRadius: 'var(--radius)' }} />
                        <button onClick={submit} disabled={!message.trim() || sending}
                            className="w-full py-3 flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            style={{ fontSize: '10px', fontWeight: 900, letterSpacing: '+0.1em', textTransform: 'uppercase', background: 'rgba(255,255,255,0.9)', color: '#000', borderRadius: 'var(--radius)' }}>
                            {sending ? "Sending..." : <>Send <Send className="w-3 h-3" /></>}
                        </button>
                    </div>
                </div>
            )}
            <button onClick={() => setOpen(!open)} className="w-12 h-12 rounded-full flex items-center justify-center transition-all"
                style={{ background: 'rgba(255,255,255,0.9)', color: '#000' }}>
                <MessageSquare className="w-5 h-5" />
            </button>
        </div>
    );
}
