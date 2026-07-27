'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { easeLuxurySharp as easeLuxury } from '@/lib/animations';

interface WelcomeBannerProps {
    email?: string;
    duration?: number;
}

export function WelcomeBanner({ email, duration = 4000 }: WelcomeBannerProps) {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setVisible(false), duration);
        return () => clearTimeout(timer);
    }, [duration]);

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6, ease: easeLuxury }}
                    className="text-center py-8"
                >
                    <p className="text-[11px] uppercase tracking-[0.25em] text-white/20">
                        Access confirmed{email ? ` for ${email}` : ''}
                    </p>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
