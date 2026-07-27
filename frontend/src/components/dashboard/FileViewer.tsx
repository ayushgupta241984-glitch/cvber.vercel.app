'use client';

import { X, Shield, Download } from 'lucide-react';
import { useState } from 'react';

const VIDEO_EXTENSIONS = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv'];

function isVideoFile(fileName: string): boolean {
    const ext = '.' + fileName.split('.').pop()?.toLowerCase();
    return VIDEO_EXTENSIONS.includes(ext);
}

interface FileViewerProps {
    file: {
        id?: string;
        name: string;
        previewUrl?: string;
        riskScore?: number;
        originalityScore?: number;
        isScreenshot?: boolean;
        forensicSummary?: string;
        aiProvider?: string;
        aiModel?: string;
        webDetection?: string;
    } | null;
    isOpen: boolean;
    onClose: () => void;
    onWatermark?: () => void;
}

export function FileViewer({ file, isOpen, onClose, onWatermark }: FileViewerProps) {
    const [imageError, setImageError] = useState(false);

    if (!isOpen || !file) return null;

    const isOriginal = (file.originalityScore ?? 0) > 50;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-200"
                onClick={onClose}
            />

            <div className="relative w-full max-w-5xl border border-[var(--border)] overflow-hidden flex flex-col max-h-[90vh] transition-all duration-200" style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius)' }}>
                <div className="p-6 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
                    <div className="flex items-center gap-4">
                        <div className="p-2" style={{ background: 'var(--accent)', borderRadius: 'var(--radius)' }}>
                            <Shield className="h-5 w-5" style={{ color: 'var(--text-primary)' }} />
                        </div>
                        <div>
                            <h3 style={{ fontSize: '14px', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '+0.02em' }} className="truncate max-w-[200px] md:max-w-md">
                                {file.name}
                            </h3>
                            <p style={{ fontSize: '10px', color: 'var(--text-quaternary)', letterSpacing: '+0.1em', textTransform: 'uppercase' }}>
                                {file.aiModel && `${file.aiModel}`}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 transition-colors duration-200"
                        style={{ color: 'var(--text-quaternary)' }}
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <div className="flex-1 overflow-auto p-6">
                    <div className="flex flex-col lg:flex-row gap-8">
                        <div className="flex-1 min-h-[400px] flex items-center justify-center overflow-hidden relative" style={{ background: 'var(--bg-primary)', borderRadius: 'var(--radius)' }}>
                            {file.previewUrl && !imageError ? (
                                isVideoFile(file.name) ? (
                                    <video
                                        src={file.previewUrl}
                                        controls
                                        className="max-w-full max-h-[600px] object-contain select-none"
                                        controlsList="nodownload"
                                        onError={() => setImageError(true)}
                                    />
                                ) : (
                                    <img
                                        src={file.previewUrl}
                                        alt={file.name}
                                        onError={() => setImageError(true)}
                                        className="max-w-full max-h-[600px] object-contain select-none"
                                    />
                                )
                            ) : (
                                <div className="text-center p-12">
                                    <div className="w-20 h-20 flex items-center justify-center mx-auto mb-4" style={{ background: 'var(--border)', borderRadius: 'var(--radius)' }}>
                                        <Shield className="h-10 w-10" style={{ color: 'var(--text-quaternary)' }} />
                                    </div>
                                    <p style={{ fontSize: '12px', color: 'var(--text-quaternary)', letterSpacing: '+0.1em', textTransform: 'uppercase' }}>
                                        {imageError ? 'Preview Unavailable' : 'Draft Preview Only'}
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="w-full lg:w-80 space-y-6">
                            <div className="p-6 border" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)', borderRadius: 'var(--radius)' }}>
                                <h4 style={{ fontSize: '10px', fontWeight: 900, color: 'var(--text-quaternary)', letterSpacing: '+0.1em', textTransform: 'uppercase', marginBottom: '16px' }}>Integrity Report</h4>

                                <div className="space-y-6">
                                    <div>
                                        <div className="flex justify-between mb-2" style={{ fontSize: '12px', fontWeight: 900 }}>
                                            <span style={{ color: 'var(--text-secondary)' }}>Originality Score</span>
                                            <span style={{ color: isOriginal ? 'var(--text-primary)' : 'var(--text-tertiary)' }}>
                                                {file.originalityScore?.toFixed(0)}%
                                            </span>
                                        </div>
                                        <div className="h-2 overflow-hidden" style={{ background: 'var(--bg-primary)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                                            <div
                                                className="h-full transition-all duration-1000"
                                                style={{ width: `${file.originalityScore}%`, background: isOriginal ? 'var(--text-primary)' : 'var(--text-tertiary)' }}
                                            />
                                        </div>
                                    </div>

                                    {file.forensicSummary && (
                                        <div className="space-y-2">
                                            <h5 style={{ fontSize: '10px', fontWeight: 900, color: 'var(--text-quaternary)', letterSpacing: '+0.1em', textTransform: 'uppercase' }}>Forensic Analysis</h5>
                                            <div className="p-4" style={{ background: 'var(--bg-primary)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                                                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.6' }} className="italic">
                                                    "{file.forensicSummary}"
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <button
                                onClick={onWatermark}
                                className="w-full py-4 transition-all duration-200 flex items-center justify-center gap-3"
                                style={{
                                    background: 'rgba(255,255,255,0.9)',
                                    color: '#000',
                                    fontWeight: 900,
                                    fontSize: '10px',
                                    letterSpacing: '+0.15em',
                                    textTransform: 'uppercase',
                                    borderRadius: 'var(--radius)'
                                }}
                            >
                                <Shield className="h-5 w-5" />
                                Apply CVBER Watermark
                            </button>

                            <p style={{ fontSize: '10px', color: 'var(--text-quaternary)', textAlign: 'center', padding: '0 16px', lineHeight: '1.6' }}>
                                By watermarking, you embed a cryptographic seal into the pixels of your file.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
