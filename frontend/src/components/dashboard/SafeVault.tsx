'use client';

import { FileText, Download, Shield, AlertTriangle, CheckCircle } from 'lucide-react';

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
}

export function SafeVault({ files = [], onView, onWatermark }: SafeVaultProps) {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'safe':
                return 'border-green-100 bg-green-50/50';
            case 'warning':
                return 'border-yellow-100 bg-yellow-50/50';
            case 'danger':
                return 'border-red-100 bg-red-50/50';
            case 'scanning':
                return 'border-blue-100 bg-blue-50/50 animate-pulse';
            default:
                return 'border-gray-100 bg-gray-50/50';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'safe':
                return <CheckCircle className="h-5 w-5 text-green-600" />;
            case 'warning':
                return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
            case 'danger':
                return <AlertTriangle className="h-5 w-5 text-red-600" />;
            case 'scanning':
                return <Shield className="h-5 w-5 text-blue-600 animate-pulse" />;
            default:
                return <FileText className="h-5 w-5 text-gray-400" />;
        }
    };

    if (files.length === 0) {
        return (
            <div className="card p-12 text-center bg-white border-dashed border-2">
                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-gray-300">
                    <Shield className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Vault is Empty
                </h3>
                <p className="text-gray-500 text-sm max-w-xs mx-auto">
                    Securely store and verify your digital assets in your private vault.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
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
                                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-gray-400 shadow-sm border border-gray-100 overflow-hidden">
                                    {file.previewUrl ? (
                                        <img src={file.previewUrl} alt={file.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <FileText className="h-6 w-6" />
                                    )}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h3 className="font-bold text-gray-900 truncate pr-2">
                                        {file.name}
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                                            {(file.size / 1024).toFixed(1)} KB
                                        </p>
                                        {file.isScreenshot && (
                                            <span className="bg-yellow-100 text-yellow-700 text-[10px] px-2 py-0.5 rounded-full font-bold">SCREENSHOT</span>
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
                                        <span className="text-gray-400">Risk</span>
                                        <span className={file.riskScore < 30 ? 'text-green-600' : 'text-red-600'}>
                                            {file.riskScore.toFixed(0)}%
                                        </span>
                                    </div>
                                    <div className="h-1.5 bg-white rounded-full overflow-hidden border border-gray-100">
                                        <div
                                            className={`h-full transition-all duration-500 ${file.riskScore < 30 ? 'bg-green-500' : 'bg-red-500'}`}
                                            style={{ width: `${file.riskScore}%` }}
                                        />
                                    </div>
                                </div>
                            )}

                            {file.originalityScore !== undefined && (
                                <div>
                                    <div className="flex justify-between text-[11px] font-bold uppercase tracking-tight mb-2">
                                        <span className="text-gray-400">Originality</span>
                                        <span className={file.originalityScore > 70 ? 'text-blue-600' : 'text-orange-600'}>
                                            {file.originalityScore.toFixed(0)}%
                                        </span>
                                    </div>
                                    <div className="h-1.5 bg-white rounded-full overflow-hidden border border-gray-100">
                                        <div
                                            className={`h-full transition-all duration-500 ${file.originalityScore > 70 ? 'bg-blue-500' : 'bg-orange-500'}`}
                                            style={{ width: `${file.originalityScore}%` }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-gray-100/50">
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{new Date(file.uploadedAt).toLocaleDateString()}</span>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => onView?.(file)}
                                    className="px-3 py-1.5 bg-gray-50 text-gray-600 text-xs font-bold rounded-lg hover:bg-gray-100 transition-colors border border-gray-100 active:scale-95"
                                >
                                    View
                                </button>
                                <button
                                    onClick={() => onWatermark?.(file)}
                                    className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm active:scale-95 flex items-center gap-2"
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

