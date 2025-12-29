'use client';

import { FileText, Download, Shield, AlertTriangle, CheckCircle } from 'lucide-react';

interface FileItem {
    id: string;
    name: string;
    size: number;
    status: 'scanning' | 'safe' | 'warning' | 'danger';
    riskScore?: number;
    uploadedAt: string;
}

interface SafeVaultProps {
    files?: FileItem[];
}

export function SafeVault({ files = [] }: SafeVaultProps) {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'safe':
                return 'border-green-500/50 bg-green-500/5';
            case 'warning':
                return 'border-yellow-500/50 bg-yellow-500/5';
            case 'danger':
                return 'border-red-500/50 bg-red-500/5';
            case 'scanning':
                return 'border-purple-500/50 bg-purple-500/5 animate-pulse';
            default:
                return 'border-gray-500/50 bg-gray-500/5';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'safe':
                return <CheckCircle className="h-6 w-6 text-green-400" />;
            case 'warning':
                return <AlertTriangle className="h-6 w-6 text-yellow-400" />;
            case 'danger':
                return <AlertTriangle className="h-6 w-6 text-red-400" />;
            case 'scanning':
                return <Shield className="h-6 w-6 text-purple-400 animate-pulse" />;
            default:
                return <FileText className="h-6 w-6 text-gray-400" />;
        }
    };

    if (files.length === 0) {
        return (
            <div className="glass rounded-2xl p-12 text-center">
                <Shield className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-400 mb-2">
                    Your Safe-Vault is Empty
                </h3>
                <p className="text-gray-500">
                    Upload files to start scanning and securing your digital assets
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <Shield className="h-8 w-8 text-cyber-purple" />
                Safe-Vault
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {files.map((file) => (
                    <div
                        key={file.id}
                        className={`
              glass rounded-xl p-6 border-2 transition-all duration-300
              hover:scale-105 hover:shadow-xl cursor-pointer
              ${getStatusColor(file.status)}
            `}
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <FileText className="h-8 w-8 text-gray-400" />
                                <div>
                                    <h3 className="font-semibold text-white truncate max-w-[150px]">
                                        {file.name}
                                    </h3>
                                    <p className="text-xs text-gray-500">
                                        {(file.size / 1024).toFixed(1)} KB
                                    </p>
                                </div>
                            </div>
                            {getStatusIcon(file.status)}
                        </div>

                        {file.riskScore !== undefined && (
                            <div className="mb-4">
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-400">Risk Score</span>
                                    <span className={`font-semibold ${file.riskScore < 30 ? 'text-green-400' :
                                            file.riskScore < 70 ? 'text-yellow-400' :
                                                'text-red-400'
                                        }`}>
                                        {file.riskScore.toFixed(0)}%
                                    </span>
                                </div>
                                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-500 ${file.riskScore < 30 ? 'bg-green-500' :
                                                file.riskScore < 70 ? 'bg-yellow-500' :
                                                    'bg-red-500'
                                            }`}
                                        style={{ width: `${file.riskScore}%` }}
                                    />
                                </div>
                            </div>
                        )}

                        <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>{new Date(file.uploadedAt).toLocaleDateString()}</span>
                            {file.status === 'safe' && (
                                <button className="text-cyber-blue hover:text-cyber-purple transition-colors">
                                    <Download className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
