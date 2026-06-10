'use client';

import { X, Shield, Download, ExternalLink, Scale, FileText } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { generateLegalAffidavit } from './CertificateGenerator';

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
    const [hasSignedWaiver, setHasSignedWaiver] = useState(false);
    const [imageError, setImageError] = useState(false);

    if (!isOpen || !file) return null;

    // No lock — always allow watermarking
    const isLocked = false;
    const needsWaiver = false;

    const handleLegalWaiver = () => {
        generateLegalAffidavit({
            fileName: file.name,
            originalityScore: file.originalityScore || 0,
            aiProvider: file.aiProvider || 'Unknown',
            aiModel: file.aiModel || 'Unknown',
            forensicSummary: file.forensicSummary || 'Auto-flagged by system',
            timestamp: new Date().toISOString()
        });
        setHasSignedWaiver(true);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-300"
                onClick={onClose}
            />

            <div className="relative w-full max-w-5xl bg-[#09090b] border border-zinc-800 rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="p-6 border-b border-zinc-900 flex items-center justify-between bg-zinc-950/80 backdrop-blur-md sticky top-0 z-10">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-blue-500/10 rounded-xl text-blue-400 border border-blue-500/20">
                            <Shield className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white leading-tight truncate max-w-[200px] md:max-w-md tracking-tight">
                                {file.name}
                            </h3>
                            <div className="flex items-center gap-2">
                                <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">
                                    Forensic Preview {file.aiModel && `• ${file.aiModel}`}
                                </p>
                                {file.webDetection === 'active' && (
                                    <span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 text-[9px] font-bold uppercase tracking-wider rounded border border-emerald-500/20 flex items-center gap-1">
                                        <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
                                        Web Verified
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-zinc-800 rounded-full transition-colors text-zinc-500 hover:text-white"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto p-6 bg-zinc-950/50">
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Preview Area */}
                        <div className="flex-1 min-h-[400px] bg-black rounded-3xl border border-zinc-900 shadow-inner flex items-center justify-center overflow-hidden relative group">
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
                                    <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-4 text-zinc-700">
                                        <Shield className="h-10 w-10" />
                                    </div>
                                    <p className="text-zinc-500 font-bold uppercase tracking-widest text-sm">
                                        {imageError ? 'Preview Unavailable' : 'Draft Preview Only'}
                                    </p>
                                </div>
                            )}

                            {/* Protection Overlay */}
                            <div className="absolute inset-0 pointer-events-none border-[16px] border-blue-600/5 transition-opacity group-hover:opacity-100" />
                        </div>

                        {/* Analysis Sidebar */}
                        <div className="w-full lg:w-80 space-y-6">
                            <div className="card p-6 bg-zinc-900/50 border border-zinc-800 rounded-3xl backdrop-blur-sm">
                                <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4">Integrity Report</h4>

                                <div className="space-y-6">
                                    <div>
                                        <div className="flex justify-between text-xs font-bold mb-2">
                                            <span className="text-zinc-400">Originality Score</span>
                                            <span className={isOriginal ? 'text-blue-400' : 'text-orange-400'}>
                                                {file.originalityScore?.toFixed(0)}%
                                            </span>
                                        </div>
                                        <div className="h-2 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800">
                                            <div
                                                className={`h-full transition-all duration-1000 ${isOriginal ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]' : 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]'}`}
                                                style={{ width: `${file.originalityScore}%` }}
                                            />
                                        </div>
                                    </div>

                                    {file.forensicSummary && (
                                        <div className="space-y-2">
                                            <h5 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Forensic Analysis</h5>
                                            <div className="p-4 bg-black rounded-2xl border border-zinc-800">
                                                <p className="text-xs text-zinc-400 leading-relaxed font-medium italic">
                                                    "{file.forensicSummary}"
                                                </p>
                                                {file.webDetection === 'active' && !isOriginal && (
                                                    <div className="mt-3 pt-3 border-t border-zinc-800 flex items-center gap-1.5 text-[10px] text-orange-400 font-black uppercase tracking-widest">
                                                        <span className="w-1.5 h-1.5 bg-orange-500 rounded-full shadow-[0_0_8px_rgba(249,115,22,0.8)]" />
                                                        Web Match Confirmed
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {needsWaiver && !hasSignedWaiver && (
                                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl animate-in slide-in-from-bottom-2 fade-in duration-500">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Scale className="h-4 w-4 text-red-500" />
                                                <p className="text-[10px] text-red-400 font-black uppercase tracking-widest font-black">Legal Waiver Required</p>
                                            </div>
                                            <p className="text-[11px] text-red-200/70 font-medium leading-relaxed">
                                                Originality verification failed. To proceed, you must sign a generic Digital Affidavit claiming ownership under penalty of perjury.
                                            </p>
                                        </div>
                                    )}

                                    {hasSignedWaiver && (
                                        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl animate-in zoom-in-95 duration-300">
                                            <div className="flex items-center gap-2 mb-2">
                                                <FileText className="h-4 w-4 text-emerald-500" />
                                                <p className="text-[10px] text-emerald-400 font-black uppercase tracking-widest">Affidavit Generated</p>
                                            </div>
                                            <p className="text-[11px] text-emerald-200/70 font-medium leading-relaxed">
                                                Legal waiver signed and downloaded. Watermark lock overridden.
                                            </p>
                                        </div>
                                    )}

                                    {isLocked && !needsWaiver && (
                                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
                                            <p className="text-[10px] text-red-400 font-black uppercase tracking-widest mb-2">Watermark Locked</p>
                                            <p className="text-[11px] text-red-200/70 font-medium leading-relaxed">
                                                To protect the ecosystem, we cannot watermark content that appears to be unoriginal or a direct screenshot.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {isLocked ? (
                                <button
                                    onClick={handleLegalWaiver}
                                    className="w-full py-4 bg-red-600 text-white font-bold rounded-2xl hover:bg-red-700 transition-all shadow-lg shadow-red-200 active:scale-[0.98] flex items-center justify-center gap-3 overflow-hidden relative"
                                >
                                    <div className="absolute inset-0 bg-white/10 opacity-0 hover:opacity-100 transition-opacity" />
                                    <Scale className="h-5 w-5" />
                                    Proceed with Legal Waiver
                                </button>
                            ) : (
                                <button
                                    onClick={onWatermark}
                                    className={`w-full py-4 font-bold rounded-2xl transition-all shadow-lg flex items-center justify-center gap-3 active:scale-[0.98] ${hasSignedWaiver ? 'bg-gray-900 text-white hover:bg-black shadow-gray-300' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200'
                                        }`}
                                >
                                    <Shield className="h-5 w-5" />
                                    {hasSignedWaiver ? "Apply Protected Watermark" : "Apply CVBER Watermark"}
                                </button>
                            )}

                            <p className="text-[10px] text-gray-400 text-center px-4 leading-relaxed">
                                {isLocked
                                    ? "By clicking 'Proceed', you agree to generate a court-admissible PDF affidavit verifying your identity and claim."
                                    : `By watermarking, you burn a cryptographic seal into the pixels of your file using ${file.aiProvider || 'AI'} verification.`}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
