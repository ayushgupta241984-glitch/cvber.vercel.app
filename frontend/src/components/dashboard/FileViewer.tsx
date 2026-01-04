'use client';

import { X, Shield, Download, ExternalLink } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

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
    } | null;
    isOpen: boolean;
    onClose: () => void;
    onWatermark?: () => void;
}

export function FileViewer({ file, isOpen, onClose, onWatermark }: FileViewerProps) {
    if (!isOpen || !file) return null;

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
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">
                                Forensic Preview {file.aiModel && `• ${file.aiModel}`}
                            </p>
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
                                            <span className={file.originalityScore && file.originalityScore > 70 ? 'text-blue-600' : 'text-orange-600'}>
                                                {file.originalityScore?.toFixed(0)}%
                                            </span>
                                        </div>
                                        <div className="h-2 bg-gray-50 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full transition-all duration-1000 ${file.originalityScore && file.originalityScore > 70 ? 'bg-blue-600' : 'bg-orange-500'}`}
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
                                            </div>
                                        </div>
                                    )}

                                    {file.isScreenshot && (
                                        <div className="p-3 bg-red-50 border border-red-100 rounded-xl">
                                            <p className="text-[10px] text-red-700 font-bold uppercase tracking-tighter mb-1 font-black">Ownership Violation</p>
                                            <p className="text-xs text-red-800 font-medium leading-snug">Artifacts detected from a mobile or browser interface. This file is flagged as non-original.</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <button
                                onClick={onWatermark}
                                className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-[0.98] flex items-center justify-center gap-3"
                            >
                                <Shield className="h-5 w-5" />
                                Apply CVBER Watermark
                            </button>

                            <p className="text-[10px] text-gray-400 text-center px-4 leading-relaxed">
                                By watermarking, you burn a cryptographic seal into the pixels of your file using {file.aiProvider || 'AI'} verification.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
