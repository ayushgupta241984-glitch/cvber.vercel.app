'use client';

import { Shield, Layout, FileText, ScanLine, Stamp, HardDrive, Eye, Link2, Activity, Hash, LogOut, ChevronRight, Settings } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { easeLuxury } from '@/lib/animations';
import { usePathname } from 'next/navigation';

interface DashboardSidebarProps {
    userName: string;
    userInitials: string;
    isOpen: boolean;
    onClose: () => void;
    onLogout: () => void;
}

const sections = [
    { label: 'Workspace', items: [
        { id: 'dashboard', label: 'Dashboard', icon: Layout, href: '/dashboard' },
        { id: 'vault', label: 'Vault', icon: HardDrive, href: '/dashboard#vault' },
        { id: 'verify', label: 'Verify', icon: ScanLine, href: '/verify' },
    ]},
    { label: 'Tools', items: [
        { id: 'scan', label: 'Scan', icon: Eye, href: '/dashboard#scan' },
        { id: 'watermark', label: 'Watermark', icon: Stamp, href: '/dashboard#watermark' },
        { id: 'enforcement', label: 'Enforcement', icon: FileText, href: '/dashboard#enforcement' },
    ]},
    { label: 'Monitor', items: [
        { id: 'watchtower', label: 'Watchtower', icon: Activity, href: '/dashboard#watchtower' },
        { id: 'ledger', label: 'Ledger', icon: Link2, href: '/dashboard#ledger' },
    ]},
    { label: 'Account', items: [
        { id: 'settings', label: 'Settings', icon: Settings, href: '/dashboard#settings' },
    ]},
];

export function DashboardSidebar({ userName, userInitials, isOpen, onClose, onLogout }: DashboardSidebarProps) {
    const pathname = usePathname();

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        transition={{ duration: 0.4, ease: easeLuxury }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden" onClick={onClose} />
                )}
            </AnimatePresence>

            <motion.aside
                initial={false}
                animate={{ x: isOpen || (typeof window !== 'undefined' && window.innerWidth >= 1024) ? 0 : -240 }}
                transition={{ duration: 0.5, ease: easeLuxury }}
                suppressHydrationWarning
                className="w-60 border-r flex flex-col fixed inset-y-0 left-0 z-50 lg:translate-x-0"
                style={{ background: '#000', borderColor: 'var(--border)' }}
            >
                <div className="px-6 pt-8 pb-6">
                    <div className="flex items-center justify-between">
                        <Link href="/" className="flex items-center gap-3 group">
                            <div className="w-8 h-8 border flex items-center justify-center transition-colors" style={{ borderColor: 'var(--border)', borderRadius: 'var(--radius)' }}>
                                <Shield className="h-4 w-4" style={{ color: 'var(--text-tertiary)' }} />
                            </div>
                            <span style={{ fontSize: '16px', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '+0.02em' }}>CVBER</span>
                        </Link>
                        <button type="button" onClick={onClose} className="lg:hidden p-2 transition-colors" style={{ color: 'var(--text-quaternary)' }}>
                            <ChevronRight className="w-5 h-5 rotate-180" />
                        </button>
                    </div>
                </div>

                <div className="px-6 pb-4">
                    <div style={{ height: '1px', background: 'var(--border)' }} />
                </div>

                <nav className="flex-1 px-3 space-y-6 overflow-y-auto">
                    {sections.map((section) => (
                        <div key={section.label}>
                            <p className="px-3 mb-2" style={{ fontSize: '10px', fontWeight: 900, color: 'var(--text-quaternary)', letterSpacing: '+0.08em', textTransform: 'uppercase' }}>
                                {section.label}
                            </p>
                            <div className="space-y-0.5">
                                {section.items.map((item) => {
                                    const isActive = pathname === item.href || pathname + '#' + item.id === item.href;
                                    return (
                                        <Link key={item.id} href={item.href}
                                            onClick={() => { if (typeof window !== 'undefined' && window.innerWidth < 1024) onClose(); }}
                                            className="w-full flex items-center gap-3 px-3 py-2.5 transition-all duration-200"
                                            style={{
                                                fontSize: '13px',
                                                fontWeight: 400,
                                                fontFamily: 'Inter, sans-serif',
                                                color: isActive ? 'var(--text-primary)' : 'rgba(255,255,255,0.55)',
                                                borderLeft: isActive ? '4px solid var(--accent)' : '4px solid transparent',
                                                background: isActive ? 'rgba(255,255,255,0.04)' : 'transparent',
                                            }}>
                                            <item.icon className="w-4 h-4 shrink-0" />
                                            <span>{item.label}</span>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </nav>

                <div className="px-3 border-t py-4" style={{ borderColor: 'var(--border)' }}>
                    {userName && (
                        <div className="px-3 mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 flex items-center justify-center text-xs font-bold" style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', color: 'var(--text-tertiary)' }}>
                                    {userInitials}
                                </div>
                                <div className="flex flex-col overflow-hidden">
                                    <span className="text-sm truncate" style={{ color: 'var(--text-primary)' }}>{userName || 'Member'}</span>
                                    <span style={{ fontSize: '9px', letterSpacing: '+0.08em', textTransform: 'uppercase', color: 'var(--text-quaternary)' }}>Member</span>
                                </div>
                            </div>
                        </div>
                    )}
                    <button onClick={onLogout} className="w-full flex items-center gap-3 px-3 py-2.5 transition-colors" style={{ color: 'var(--text-quaternary)' }}>
                        <LogOut className="w-4 h-4" />
                        <span style={{ fontSize: '13px', fontWeight: 400, fontFamily: 'Inter, sans-serif' }}>Exit</span>
                    </button>
                </div>
            </motion.aside>
        </>
    );
}
