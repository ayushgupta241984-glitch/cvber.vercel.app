'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Bell, X, Eye } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { motion, AnimatePresence } from 'framer-motion';
import { easeLuxurySharp as easeLuxury } from '@/lib/animations';

interface Notification {
    id: string;
    type: string;
    title: string;
    body?: string;
    metadata?: string;
    read: boolean;
    created_at: string;
}

export function NotificationsBell() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const panelRef = useRef<HTMLDivElement>(null);
    const unreadCount = notifications.filter(n => !n.read).length;

    const load = useCallback(async () => {
        try {
            const result = await apiClient.getNotifications();
            setNotifications(result.notifications || []);
        } catch (_) { /* offline */ }
    }, []);

    useEffect(() => {
        load();
        const interval = setInterval(load, 60000);
        return () => clearInterval(interval);
    }, [load]);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        if (open) document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open]);

    const markRead = async (id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        apiClient.markNotificationRead(id).catch(() => {});
    };

    return (
        <div className="relative" ref={panelRef}>
            <button
                onClick={() => setOpen(!open)}
                className="relative p-2 text-white/25 hover:text-white/50 transition-colors"
            >
                <Bell className="w-3.5 h-3.5" />
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-white/60" />
                )}
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.15, ease: easeLuxury }}
                        className="absolute right-0 top-full mt-1 w-72 bg-[#0a0a0a] border border-white/[0.08] z-50 overflow-hidden"
                        style={{ borderRadius: 6 }}
                    >
                        <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
                            <span className="text-[10px] uppercase tracking-[0.15em] text-white/40 font-semibold">Notifications</span>
                            <button onClick={() => setOpen(false)} className="text-white/20 hover:text-white/40">
                                <X className="w-3 h-3" />
                            </button>
                        </div>

                        <div className="max-h-[280px] overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="px-4 py-8 text-center text-[10px] text-white/20 uppercase tracking-wider">
                                    No notifications yet
                                </div>
                            ) : (
                                notifications.map(n => (
                                    <button
                                        key={n.id}
                                        onClick={() => markRead(n.id)}
                                        className={`w-full text-left px-4 py-3 border-b border-white/[0.04] last:border-b-0 transition-colors ${
                                            n.read ? 'hover:bg-white/[0.02]' : 'bg-white/[0.03]'
                                        }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            {!n.read && <span className="w-1 h-1 bg-white/40 mt-1.5 shrink-0" />}
                                            <div className="min-w-0 flex-1">
                                                <p className={`text-[11px] leading-snug ${n.read ? 'text-white/40' : 'text-white/70'}`}>
                                                    {n.title}
                                                </p>
                                                <p className="text-[9px] text-white/20 mt-1 uppercase tracking-wider">
                                                    {new Date(n.created_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
