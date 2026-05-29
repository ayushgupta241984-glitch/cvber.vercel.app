'use client';

import { FileText, Shield, AlertTriangle, CheckCircle, Trash2, Anchor, Image, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';

interface FileItem {
    id: string;
    name: string;
    size: number;
    status: 'scanning' | 'safe' | 'warning' | 'danger';
    riskScore?: number;
    originalityScore?: number;
    isScreenshot?: boolean;
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
}

const easeLuxury = [0.25, 0.46, 0.45, 0.94] as const;

function SkeletonCard() {
    return (
        <div className="border border-luxury-steel/30 bg-luxury-deep shimmer">
            <div className="aspect-[4/3] bg-luxury-steel/20" />
            <div className="p-6 space-y-4">
                <div className="h-4 bg-luxury-steel/30 w-3/4" />
                <div className="h-3 bg-luxury-steel/30 w-1/3" />
                <div className="h-px bg-luxury-steel/20" />
                <div className="flex gap-2 pt-2">
                    <div className="h-8 w-8 bg-luxury-steel/30" />
                    <div className="h-8 w-8 bg-luxury-steel/30" />
                    <div className="h-8 w-16 bg-luxury-steel/30" />
                </div>
            </div>
        </div>
    );
}

export function SafeVault({ files = [], loading = false, onView, onWatermark, onDelete, onTimestamp, onSearch }: SafeVaultProps) {
    const [brokenImages, setBrokenImages] = useState<Set<string>>(new Set());

    const markBroken = (id: string) => {
        setBrokenImages(prev => new Set(prev).add(id));
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'safe': return { label: 'Verified', class: 'text-luxury-gold/80' };
            case 'warning': return { label: 'Under Review', class: 'text-luxury-gold/60' };
            case 'danger': return { label: 'Flagged', class: 'text-luxury-gold/40' };
            case 'scanning': return { label: 'Scanning', class: 'text-luxury-gold/60' };
            default: return { label: 'Unknown', class: 'text-luxury-muted' };
        }
    };

    if (!loading && files.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, ease: easeLuxury }}
                className="text-center py-24 px-8 border border-luxury-steel/30 bg-luxury-deep"
            >
                <div className="w-16 h-16 border border-luxury-steel/30 flex items-center justify-center mx-auto mb-8 text-luxury-muted/30">
                    <Image className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-display text-luxury-cream mb-3">
                    An Empty Gallery
                </h3>
                <p className="text-xs text-luxury-muted uppercase tracking-ultra-wide max-w-md mx-auto leading-relaxed">
                    Your portfolio stands silent. Present your first piece, and we shall guard it across every corner of the web.
                </p>
            </motion.div>
        );
    }

    return (
        <div>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, ease: easeLuxury }}
                className="flex items-center justify-between mb-8 pb-4 border-b border-luxury-steel/30"
            >
                <div>
                    <p className="text-luxury-subheading mb-2">The Gallery</p>
                    <h2 className="text-xl font-display text-luxury-cream">Your Collection</h2>
                </div>
                <span className="text-[10px] text-luxury-muted uppercase tracking-ultra-wide font-semibold">{files.length} {files.length === 1 ? 'piece' : 'pieces'}</span>
            </motion.div>

            {loading && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0">
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
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
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{
                                    duration: 0.6,
                                    ease: easeLuxury,
                                    delay: index * 0.1,
                                }}
                                className="group relative border border-luxury-steel/30 bg-luxury-deep"
                            >
                                {/* Preview Area - Rolex style image zoom */}
                                <div className="aspect-[4/3] bg-luxury-steel/10 flex items-center justify-center overflow-hidden relative">
                                    {file.previewUrl && !brokenImages.has(file.id) ? (
                                        <img
                                            src={file.previewUrl}
                                            alt={file.name}
                                            onError={() => markBroken(file.id)}
                                            className="w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="text-luxury-muted/20 flex flex-col items-center gap-2">
                                            <Image className="h-10 w-10" />
                                            <span className="text-[9px] uppercase tracking-widest text-luxury-muted/10">{file.name}</span>
                                        </div>
                                    )}
                                    {/* Status overlay */}
                                    <div className="absolute top-4 right-4">
                                        <span className={`text-[9px] uppercase tracking-ultra-wide font-semibold ${badge.class}`}>
                                            {badge.label}
                                        </span>
                                    </div>
                                </div>

                                {/* Details */}
                                <div className="p-6">
                                    <div className="mb-4">
                                        <h3 className="font-display text-luxury-cream truncate pr-2 text-sm mb-1">
                                            {file.name}
                                        </h3>
                                        <div className="flex items-center gap-3">
                                            <p className="text-[10px] text-luxury-muted/60 uppercase tracking-widest">
                                                {(file.size / 1024).toFixed(1)} KB
                                            </p>
                                            {file.isScreenshot && (
                                                <span className="text-[9px] text-luxury-gold/60 uppercase tracking-ultra-wide font-semibold">Screenshot</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="h-px bg-luxury-steel/20 mb-4" />

                                    {/* Scores */}
                                    <div className="space-y-3 mb-4">
                                        {file.riskScore !== undefined && (
                                            <div>
                                                <div className="flex justify-between text-[10px] uppercase tracking-widest mb-2">
                                                    <span className="text-luxury-muted/60">Risk</span>
                                                    <span className={file.riskScore < 30 ? 'text-luxury-gold/80' : 'text-luxury-gold/40'}>
                                                        {file.riskScore.toFixed(0)}%
                                                    </span>
                                                </div>
                                                <div className="h-px bg-luxury-steel/30 relative">
                                                    <div
                                                        className={`absolute left-0 top-0 h-full transition-all duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] ${file.riskScore < 30 ? 'bg-luxury-gold/60' : 'bg-luxury-gold/30'}`}
                                                        style={{ width: `${file.riskScore}%` }}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                        {file.originalityScore !== undefined && (
                                            <div>
                                                <div className="flex justify-between text-[10px] uppercase tracking-widest mb-2">
                                                    <span className="text-luxury-muted/60">Originality</span>
                                                    <span className={file.originalityScore > 70 ? 'text-luxury-gold/80' : 'text-luxury-gold/40'}>
                                                        {file.originalityScore.toFixed(0)}%
                                                    </span>
                                                </div>
                                                <div className="h-px bg-luxury-steel/30 relative">
                                                    <div
                                                        className={`absolute left-0 top-0 h-full transition-all duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] ${file.originalityScore > 70 ? 'bg-luxury-gold/60' : 'bg-luxury-gold/30'}`}
                                                        style={{ width: `${file.originalityScore}%` }}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center justify-between pt-4 border-t border-luxury-steel/20">
                                        <span className="text-[9px] text-luxury-muted/40 uppercase tracking-widest">{new Date(file.uploadedAt).toLocaleDateString()}</span>
                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => onDelete?.(file)}
                                                className="p-2 text-luxury-muted/40 hover:text-luxury-gold/60 transition-colors duration-300"
                                                title="Remove"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                            <button
                                                onClick={() => onTimestamp?.(file)}
                                                className="p-2 text-luxury-muted/40 hover:text-luxury-gold/60 transition-colors duration-300"
                                                title="Anchor to Blockchain"
                                            >
                                                <Anchor className="h-3.5 w-3.5" />
                                            </button>
                                            <button
                                                onClick={() => onSearch?.(file)}
                                                className="p-2 text-luxury-muted/40 hover:text-luxury-gold/60 transition-colors duration-300"
                                                title="Search web for copies"
                                            >
                                                <Search className="h-3.5 w-3.5" />
                                            </button>
                                            <button
                                                onClick={() => onView?.(file)}
                                                className="px-4 py-2 text-[10px] uppercase tracking-ultra-wide font-semibold text-luxury-cream border border-luxury-steel/40 hover:border-luxury-gold/40 hover:text-luxury-gold transition-all duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
                                            >
                                                View
                                            </button>
                                            <button
                                                onClick={() => onWatermark?.(file)}
                                                className="px-4 py-2 text-[10px] uppercase tracking-ultra-wide font-semibold bg-luxury-gold/90 text-black hover:bg-luxury-gold transition-all duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] flex items-center gap-2"
                                            >
                                                <Shield className="h-3 w-3" />
                                                Mark
                                            </button>
                                        </div>
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
