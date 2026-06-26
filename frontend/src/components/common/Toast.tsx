'use client';

import { useState, useCallback, createContext, useContext } from 'react';
import { AlertCircle, CheckCircle, X, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { easeLuxury } from '@/lib/animations';
import { stripImageErrors } from '@/lib/api-client';

interface Toast {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info';
}

interface ToastContextType {
    toast: (message: string, type?: Toast['type']) => void;
}

const ToastContext = createContext<ToastContextType>({ toast: () => {} });

export function useToast() {
    return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const toast = useCallback((message: string, type: Toast['type'] = 'success') => {
        const cleanMsg = stripImageErrors(message);
        const id = Date.now().toString();
        setToasts(prev => [...prev, { id, message: cleanMsg, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 4000);
    }, []);

    return (
        <ToastContext.Provider value={{ toast }}>
            {children}
            <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2" aria-live="polite">
                <AnimatePresence>
                    {toasts.map(t => (
                        <motion.div
                            key={t.id}
                            initial={{ opacity: 0, x: 40, scale: 0.95 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 40, scale: 0.95 }}
                            transition={{ duration: 0.5, ease: easeLuxury }}
                            className={`
                                flex items-center gap-3 px-5 py-3.5 border text-xs uppercase tracking-wider font-semibold
                                ${t.type === 'success' ? 'bg-black border-luxury-gold/40 text-luxury-gold' : ''}
                                ${t.type === 'error' ? 'bg-black border-luxury-gold/30 text-luxury-gold/70' : ''}
                                ${t.type === 'info' ? 'bg-black border-luxury-steel/40 text-luxury-cream/80' : ''}
                            `}
                        >
                            {t.type === 'success' && <CheckCircle className="h-4 w-4 text-luxury-gold shrink-0" />}
                            {t.type === 'error' && <XCircle className="h-4 w-4 text-luxury-gold/70 shrink-0" />}
                            {t.type === 'info' && <AlertCircle className="h-4 w-4 text-luxury-gold/60 shrink-0" />}
                            <span className="flex-1">{t.message}</span>
                            <button
                                onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))}
                                className="p-1 hover:bg-luxury-steel/20 transition-colors duration-300"
                                aria-label="Dismiss"
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
}
