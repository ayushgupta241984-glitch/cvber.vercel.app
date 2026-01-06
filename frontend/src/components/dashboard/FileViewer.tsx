'use client';

import { X, Shield, Download, ExternalLink, Scale, FileText } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { generateLegalAffidavit } from './CertificateGenerator';

interface FileViewerProps {
    file: {
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

    if (!isOpen || !file) return null;

    // Smart Lock Logic: Disable watermark if score is low or screenshot detected
    // It is "locked" if it's not original AND the user hasn't signed the waiver yet
    const isOriginal = (file.originalityScore ?? 0) > 50;
    const isLocked = (!isOriginal || file.isScreenshot) && !hasSignedWaiver;
    const needsWaiver = (!isOriginal || file.isScreenshot);

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
                className="absolute inset-0 bg-gray-900/40 backdrop-blur-md animate-in fade-in duration-300"
                onClick={onClose}
            />

            <div className="relative w-full max-w-5xl bg-white rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                            <Shield className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 leading-tight truncate max-w-[200px] md:max-w-md">
                                {file.name}
                            </h3>
                            <div className="flex items-center gap-2">
                                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">
                                    Forensic Preview {file.aiModel && `• ${file.aiModel}`}
                                </p>
                                {file.webDetection === 'active' && (
                                    <span className="px-1.5 py-0.5 bg-green-50 text-green-700 text-[9px] font-bold uppercase tracking-wider rounded border border-green-200 flex items-center gap-1">
                                        <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse" />
                                        Web Verified
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-900"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto p-6 bg-gray-50/50">
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Preview Area */}
                        <div className="flex-1 min-h-[400px] bg-white rounded-2xl border border-gray-100 shadow-inner flex items-center justify-center overflow-hidden relative group">
                            {file.previewUrl ? (
                                <img
                                    src={file.previewUrl}
                                    alt={file.name}
                                    className="max-w-full max-h-[600px] object-contain select-none"
                                />
                            ) : (
                                <div className="text-center p-12">
                                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                                        <Shield className="h-10 w-10" />
                                    </div>
                                    <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">Draft Preview Only</p>
                                </div>
                            )}

                            {/* Protection Overlay */}
                            <div className="absolute inset-0 pointer-events-none border-[16px] border-blue-600/5 transition-opacity group-hover:opacity-100" />
                        </div>

                        {/* Analysis Sidebar */}
                        <div className="w-full lg:w-80 space-y-6">
                            <div className="card p-6 bg-white shadow-sm border border-gray-100">
                                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Integrity Report</h4>

                                <div className="space-y-6">
                                    <div>
                                        <div className="flex justify-between text-xs font-bold mb-2">
                                            <span className="text-gray-600">Originality Score</span>
                                            <span className={isOriginal ? 'text-blue-600' : 'text-orange-600'}>
                                                {file.originalityScore?.toFixed(0)}%
                                            </span>
                                        </div>
                                        <div className="h-2 bg-gray-50 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full transition-all duration-1000 ${isOriginal ? 'bg-blue-600' : 'bg-orange-500'}`}
                                                style={{ width: `${file.originalityScore}%` }}
                                            />
                                        </div>
                                    </div>

                                    {file.forensicSummary && (
                                        <div className="space-y-2">
                                            <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Forensic Analysis</h5>
                                            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                                <p className="text-xs text-gray-600 leading-relaxed font-medium italic">
                                                    "{file.forensicSummary}"
                                                </p>
                                                {file.webDetection === 'active' && !isOriginal && (
                                                    <div className="mt-2 pt-2 border-t border-gray-200 flex items-center gap-1.5 text-[10px] text-gray-500 font-bold uppercase">
                                                        <span className="w-1.5 h-1.5 bg-orange-500 rounded-full" />
                                                        Web Match Confirmed
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {needsWaiver && !hasSignedWaiver && (
                                        <div className="p-3 bg-red-50 border border-red-100 rounded-xl animate-in slide-in-from-bottom-2 fade-in duration-500">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Scale className="h-4 w-4 text-red-600" />
                                                <p className="text-[10px] text-red-700 font-bold uppercase tracking-tighter font-black">Legal Waiver Required</p>
                                            </div>
                                            <p className="text-xs text-red-800 font-medium leading-snug">
                                                Originality verification failed. To proceed, you must sign a generic Digital Affidavit claiming ownership under penalty of perjury.
                                            </p>
                                        </div>
                                    )}

                                    {hasSignedWaiver && (
                                        <div className="p-3 bg-green-50 border border-green-100 rounded-xl animate-in zoom-in-95 duration-300">
                                            <div className="flex items-center gap-2 mb-1">
                                                <FileText className="h-4 w-4 text-green-600" />
                                                <p className="text-[10px] text-green-700 font-bold uppercase tracking-tighter font-black">Affidavit Generated</p>
                                            </div>
                                            <p className="text-xs text-green-800 font-medium leading-snug">
                                                Legal waiver signed and downloaded. Watermark lock overridden.
                                            </p>
                                        </div>
                                    )}

                                    {isLocked && !needsWaiver && (
                                        <div className="p-3 bg-red-50 border border-red-100 rounded-xl">
                                            <p className="text-[10px] text-red-700 font-bold uppercase tracking-tighter mb-1 font-black">Watermark Locked</p>
                                            <p className="text-xs text-red-800 font-medium leading-snug">
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
