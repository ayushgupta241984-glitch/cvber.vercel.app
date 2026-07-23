'use client';

import { FileText, Shield, AlertTriangle, CheckCircle, Trash2, Anchor, Image, Search, Scale, BadgeCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { apiClient } from '@/lib/api-client';

interface FileItem {
    id: string;
    name: string;
    size: number;
    status: 'scanning' | 'safe' | 'warning' | 'danger';
    riskScore?: number;
    originalityScore?: number;
    isScreenshot?: boolean;
    proofRequired?: boolean;
    ownershipProofStatus?: 'pending' | 'verified' | 'rejected' | null;
    c2paSignedUrl?: string;
    c2paManifest?: string;
    c2paSignature?: string;
    aiProvider?: string;
    aiModel?: string;
    uploadedAt: string;
    previewUrl?: string;
}

interface SafeVaultProps {
    files?: FileItem[];
    loading?: boolean;
    onView?: (file: FileItem) => void;
    onWatermark?: (file: FileItem) => void;
    onDelete?: (file: FileItem) => void;
    onTimestamp?: (file: FileItem) => void;
    onSearch?: (file: FileItem) => void;
    onDMCA?: (file: FileItem) => void;
}

function SkeletonCard() {
    return (
        <div className="border border-[var(--border)]" style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius)', padding: '32px' }}>
            <div className="aspect-[4/3]" style={{ background: 'var(--border)', borderRadius: 'var(--radius)' }} />
            <div className="mt-4 space-y-3">
                <div className="h-3 w-3/4" style={{ background: 'var(--border)', borderRadius: 'var(--radius)' }} />
                <div className="h-2 w-1/3" style={{ background: 'var(--border)', borderRadius: 'var(--radius)' }} />
            </div>
        </div>
    );
}

export function SafeVault({ files = [], loading = false, onView, onWatermark, onDelete, onTimestamp, onSearch, onDMCA }: SafeVaultProps) {
    const [brokenImages, setBrokenImages] = useState<Set<string>>(new Set());
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const markBroken = (id: string) => {
        setBrokenImages(prev => new Set(prev).add(id));
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'safe': return { label: 'Verified', color: 'var(--text-secondary)' };
            case 'warning': return { label: 'Review', color: 'var(--text-tertiary)' };
            case 'danger': return { label: 'Flagged', color: 'var(--text-quaternary)' };
            case 'scanning': return { label: 'Scanning', color: 'var(--text-tertiary)' };
            default: return { label: 'Unknown', color: 'var(--text-quaternary)' };
        }
    };

    const handleDelete = async (file: FileItem) => {
        if (!confirm(`Remove "${file.name}" from your collection?`)) return;
        setDeletingId(file.id);
        try {
            await apiClient.deleteVaultFile(file.id);
            onDelete?.(file);
        } catch (err) {
            window.dispatchEvent(new CustomEvent('cvber:toast', { detail: { message: 'Could not remove file. Please try again.', type: 'error' } }));
        } finally {
            setDeletingId(null);
        }
    };

    if (!loading && files.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="text-center py-24 px-8 border border-[var(--border)]"
                style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius)' }}
            >
                <div className="animate-pulse-dot mx-auto mb-8" style={{ color: 'var(--text-quaternary)' }}>
                    <Image className="h-8 w-8 mx-auto" />
                </div>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                    No pieces yet. Submit your first work above.
                </p>
            </motion.div>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <p style={{ fontSize: '10px', color: 'var(--text-quaternary)', letterSpacing: '+0.08em', textTransform: 'uppercase', marginBottom: '8px' }}>
                        The Gallery
                    </p>
                    <h2 style={{ fontSize: '14px', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '+0.02em' }}>
                        Your Collection
                    </h2>
                </div>
                <span style={{ fontSize: '10px', color: 'var(--text-quaternary)', letterSpacing: '+0.08em', textTransform: 'uppercase' }}>
                    {files.length} {files.length === 1 ? 'piece' : 'pieces'}
                </span>
            </div>

            {loading && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0">
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                </div>
            )}

            {!loading && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0">
                    {files.map((file, index) => {
                        const badge = getStatusBadge(file.status);
                        return (
                            <motion.div
                                key={file.id}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.08 }}
                                className="group relative border border-[var(--border)] flex flex-col transition-all duration-200 hover:border-[var(--border-hover)]"
                                style={{ background: 'var(--bg-surface)' }}
                            >
                                <div className="aspect-[4/3] flex items-center justify-center overflow-hidden relative" style={{ background: 'var(--border)' }}>
                                    {file.previewUrl && !brokenImages.has(file.id) ? (
                                        <img
                                            src={file.previewUrl}
                                            alt={file.name}
                                            onError={() => markBroken(file.id)}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div style={{ color: 'var(--text-quaternary)' }} className="flex flex-col items-center gap-2">
                                            <Image className="h-10 w-10" />
                                            <span style={{ fontSize: '9px', letterSpacing: '+0.1em', textTransform: 'uppercase' }}>{file.name}</span>
                                        </div>
                                    )}
                                    <div className="absolute top-4 right-4 flex items-center gap-2">
                                        {file.c2paSignedUrl && (
                                            <span className="flex items-center gap-1" style={{ fontSize: '8px', letterSpacing: '+0.1em', textTransform: 'uppercase', color: 'rgba(34,211,238,0.8)' }}>
                                                <BadgeCheck className="h-2.5 w-2.5" />
                                                C2PA
                                            </span>
                                        )}
                                        <span style={{ fontSize: '9px', letterSpacing: '+0.1em', textTransform: 'uppercase', color: badge.color }}>
                                            {badge.label}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-6 flex flex-col flex-1">
                                    <div className="mb-4">
                                        <h3 style={{ fontSize: '13px', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '+0.02em' }} className="truncate pr-2 mb-1">
                                            {file.name}
                                        </h3>
                                        <p style={{ fontSize: '10px', color: 'var(--text-quaternary)', letterSpacing: '+0.1em', textTransform: 'uppercase' }}>
                                            {(file.size / 1024).toFixed(1)} KB
                                        </p>
                                    </div>

                                    <div className="h-px mb-4" style={{ background: 'var(--border)' }} />

                                    <div className="space-y-3 mb-4">
                                        {file.riskScore !== undefined && (
                                            <div>
                                                <div className="flex justify-between mb-2" style={{ fontSize: '10px', letterSpacing: '+0.1em', textTransform: 'uppercase' }}>
                                                    <span style={{ color: 'var(--text-quaternary)' }}>Risk</span>
                                                    <span style={{ color: file.riskScore < 30 ? 'var(--text-secondary)' : 'var(--text-quaternary)' }}>
                                                        {file.riskScore.toFixed(0)}%
                                                    </span>
                                                </div>
                                                <div className="h-[2px] relative" style={{ background: 'var(--border)' }}>
                                                    <div
                                                        className="absolute left-0 top-0 h-full transition-all duration-500"
                                                        style={{ width: `${file.riskScore}%`, background: file.riskScore < 30 ? 'rgba(255,255,255,0.15)' : 'var(--accent)' }}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                        {file.originalityScore !== undefined && (
                                            <div>
                                                <div className="flex justify-between mb-2" style={{ fontSize: '10px', letterSpacing: '+0.1em', textTransform: 'uppercase' }}>
                                                    <span style={{ color: 'var(--text-quaternary)' }}>Originality</span>
                                                    <span style={{ color: file.originalityScore > 70 ? 'var(--text-secondary)' : 'var(--text-quaternary)' }}>
                                                        {file.originalityScore.toFixed(0)}%
                                                    </span>
                                                </div>
                                                <div className="h-[2px] relative" style={{ background: 'var(--border)' }}>
                                                    <div
                                                        className="absolute left-0 top-0 h-full transition-all duration-500"
                                                        style={{ width: `${file.originalityScore}%`, background: file.originalityScore > 70 ? 'rgba(255,255,255,0.15)' : 'var(--accent)' }}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between pt-4 mt-auto" style={{ borderTop: '1px solid var(--border)' }}>
                                        <span style={{ fontSize: '9px', color: 'var(--text-quaternary)', letterSpacing: '+0.1em', textTransform: 'uppercase' }}>
                                            {new Date(file.uploadedAt).toLocaleDateString()}
                                        </span>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => handleDelete(file)}
                                                disabled={deletingId === file.id}
                                                className="w-8 h-8 flex items-center justify-center transition-colors duration-200"
                                                style={{ color: 'var(--text-quaternary)' }}
                                                title="Remove"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                            <button
                                                onClick={() => onTimestamp?.(file)}
                                                className="w-8 h-8 flex items-center justify-center transition-colors duration-200 hover:text-[var(--text-secondary)]"
                                                style={{ color: 'var(--text-quaternary)' }}
                                                title="Anchor to Blockchain"
                                            >
                                                <Anchor className="h-3.5 w-3.5" />
                                            </button>
                                            <button
                                                onClick={() => onSearch?.(file)}
                                                className="w-8 h-8 flex items-center justify-center transition-colors duration-200 hover:text-[var(--text-secondary)]"
                                                style={{ color: 'var(--text-quaternary)' }}
                                                title="Search web for copies"
                                            >
                                                <Search className="h-3.5 w-3.5" />
                                            </button>
                                            <button
                                                onClick={() => onDMCA?.(file)}
                                                className="w-8 h-8 flex items-center justify-center transition-colors duration-200 hover:text-[var(--text-secondary)]"
                                                style={{ color: 'var(--text-quaternary)' }}
                                                title="Generate DMCA takedown notice"
                                            >
                                                <Scale className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 mt-3">
                                        {file.status !== 'scanning' && (
                                            <button
                                                onClick={() => onView?.(file)}
                                                className="flex-1 py-2 text-[10px] uppercase tracking-widest transition-all duration-200 hover:border-[var(--border-hover)]"
                                                style={{ fontWeight: 900, color: 'var(--text-primary)', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}
                                            >
                                                View
                                            </button>
                                        )}
                                        {file.status === 'safe' && (!file.proofRequired || file.ownershipProofStatus === 'verified') && (
                                            <button
                                                onClick={() => onWatermark?.(file)}
                                                className="flex-1 py-2 text-[10px] uppercase tracking-widest transition-all duration-200 flex items-center justify-center gap-2"
                                                style={{ fontWeight: 900, background: 'rgba(255,255,255,0.9)', color: '#000', borderRadius: 'var(--radius)' }}
                                            >
                                                <Shield className="h-3 w-3" />
                                                Mark
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
