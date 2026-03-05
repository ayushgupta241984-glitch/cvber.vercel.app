'use client';

import { FileText, Download, Shield, AlertTriangle, CheckCircle, Trash2 } from 'lucide-react';

interface FileItem {
    id: string;
    name: string;
    size: number;
    status: 'scanning' | 'safe' | 'warning' | 'danger';
    riskScore?: number;
    originalityScore?: number;
    isScreenshot?: boolean;
    uploadedAt: string;
    previewUrl?: string; // BLOB URL for temporary viewing
}

interface SafeVaultProps {
    files?: FileItem[];
    onView?: (file: FileItem) => void;
    onWatermark?: (file: FileItem) => void;
    onDelete?: (file: FileItem) => void;
}

export function SafeVault({ files = [], onView, onWatermark, onDelete }: SafeVaultProps) {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'safe':
                return 'border-emerald-500/20 bg-zinc-900/50';
            case 'warning':
                return 'border-yellow-500/20 bg-zinc-900/50';
            case 'danger':
                return 'border-red-500/20 bg-zinc-900/50';
            case 'scanning':
                return 'border-blue-500/20 bg-zinc-900/50 animate-pulse';
            default:
                return 'border-zinc-800 bg-zinc-900/50';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'safe':
                return <CheckCircle className="h-5 w-5 text-emerald-500" />;
            case 'warning':
                return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
            case 'danger':
                return <AlertTriangle className="h-5 w-5 text-red-500" />;
            case 'scanning':
                return <Shield className="h-5 w-5 text-blue-500 animate-pulse" />;
            default:
                return <FileText className="h-5 w-5 text-zinc-500" />;
        }
    };

    if (files.length === 0) {
        return (
            <div className="card p-12 text-center bg-zinc-900/30 border-dashed border-zinc-800 border-2 rounded-[32px]">
                <div className="w-16 h-16 bg-zinc-800/50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-zinc-700">
                    <Shield className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-tight">
                    Vault is Empty
                </h3>
                <p className="text-zinc-500 text-sm max-w-xs mx-auto font-medium">
                    Securely store and verify your digital assets in your private vault.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-white mb-8 flex items-center gap-3 uppercase tracking-tight">
                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400 border border-blue-500/20">
                    <Shield className="h-5 w-5" />
                </div>
                Safe Vault
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {files.map((file) => (
                    <div
                        key={file.id}
                        className={`
              card p-6 border-2 transition-all duration-300
              hover:shadow-lg
              ${getStatusColor(file.status)}
            `}
                    >
                        <div className="flex items-start justify-between mb-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-zinc-950 rounded-xl flex items-center justify-center text-zinc-500 shadow-sm border border-zinc-800 overflow-hidden group-hover:border-zinc-700 transition-colors">
                                    {file.previewUrl ? (
                                        <img src={file.previewUrl} alt={file.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <FileText className="h-6 w-6" />
                                    )}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h3 className="font-bold text-white truncate pr-2 tracking-tight">
                                        {file.name}
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                                            {(file.size / 1024).toFixed(1)} KB
                                        </p>
                                        {file.isScreenshot && (
                                            <span className="bg-orange-500/10 text-orange-400 text-[10px] px-2 py-0.5 rounded-full font-bold border border-orange-500/20 uppercase tracking-widest">SCREENSHOT</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            {getStatusIcon(file.status)}
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            {file.riskScore !== undefined && (
                                <div>
                                    <div className="flex justify-between text-[11px] font-bold uppercase tracking-tight mb-2">
                                        <span className="text-zinc-500">Risk</span>
                                        <span className={file.riskScore < 30 ? 'text-emerald-400' : 'text-red-400'}>
                                            {file.riskScore.toFixed(0)}%
                                        </span>
                                    </div>
                                    <div className="h-1.5 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800">
                                        <div
                                            className={`h-full transition-all duration-500 ${file.riskScore < 30 ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'}`}
                                            style={{ width: `${file.riskScore}%` }}
                                        />
                                    </div>
                                </div>
                            )}

                            {file.originalityScore !== undefined && (
                                <div>
                                    <div className="flex justify-between text-[11px] font-bold uppercase tracking-tight mb-2">
                                        <span className="text-zinc-500">Originality</span>
                                        <span className={file.originalityScore > 70 ? 'text-blue-400' : 'text-orange-400'}>
                                            {file.originalityScore.toFixed(0)}%
                                        </span>
                                    </div>
                                    <div className="h-1.5 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800">
                                        <div
                                            className={`h-full transition-all duration-500 ${file.originalityScore > 70 ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]' : 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]'}`}
                                            style={{ width: `${file.originalityScore}%` }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-zinc-800/50">
                            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">{new Date(file.uploadedAt).toLocaleDateString()}</span>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => onDelete?.(file)}
                                    className="px-2 py-1.5 bg-red-500/10 text-red-500 text-xs font-bold rounded-lg hover:bg-red-500/20 transition-colors border border-red-500/20 active:scale-95"
                                    title="Delete"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </button>
                                <button
                                    onClick={() => onView?.(file)}
                                    className="px-3 py-1.5 bg-zinc-800 text-zinc-300 text-xs font-bold rounded-lg hover:bg-zinc-700 transition-colors border border-zinc-700 active:scale-95"
                                >
                                    View
                                </button>
                                <button
                                    onClick={() => onWatermark?.(file)}
                                    className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-all shadow-lg active:scale-95 flex items-center gap-2 border border-blue-500/50 shadow-blue-500/10"
                                >
                                    <Shield className="h-3 w-3" />
                                    Watermark
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

