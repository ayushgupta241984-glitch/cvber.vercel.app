'use client';

import { useState, useEffect } from 'react';
import { Link2, CheckCircle, Clock, AlertCircle, RefreshCw, ExternalLink, Copy, Check } from 'lucide-react';
import { apiClient } from '@/lib/api-client';

interface BlockchainProof {
    proof_id: string;
    asset_name: string;
    asset_hash: string;
    timestamp: string;
    blockchain: string;
    status: 'pending' | 'confirmed' | 'local_only';
    verification_url: string;
}

export function BlockchainStatus() {
    const [proofs, setProofs] = useState<BlockchainProof[]>([]);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [copied, setCopied] = useState<string | null>(null);

    // Load proofs from backend on mount
    useEffect(() => {
        const loadProofs = async () => {
            try {
                const result = await apiClient.getUserBlockchainProofs();
                if (result.success) {
                    setProofs(result.proofs);
                    console.log('Loaded blockchain proofs from backend:', result.proofs);
                } else {
                    console.error('Failed to load blockchain proofs:', result);
                }
            } catch (e) {
                console.error('Failed to load blockchain proofs:', e);
            }
        };

        loadProofs();

        // Refresh every 30 seconds to check for status updates
        const interval = setInterval(loadProofs, 30000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="bg-gradient-to-br from-purple-900 to-indigo-900 rounded-3xl shadow-xl overflow-hidden border border-purple-700/50">
            {/* Header - Always Visible */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500/20 rounded-xl">
                        <Link2 className="h-5 w-5 text-purple-300" />
                    </div>
                    <div className="text-left">
                        <h3 className="font-bold text-white text-sm">Blockchain Status</h3>
                        <p className="text-xs text-purple-300">
                            {proofs.length === 0 ? 'No timestamps yet' : (
                                <>
                                    {confirmedCount} anchored · {pendingCount} pending
                                </>
                            )}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {pendingCount > 0 && (
                        <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 text-[10px] font-bold rounded-full animate-pulse">
                            {pendingCount} SYNCING
                        </span>
                    )}
                    <svg
                        className={`h-5 w-5 text-purple-300 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </button>

            {/* Expanded Content */}
            {isExpanded && (
                <div className="border-t border-purple-700/50 animate-in slide-in-from-top-2 duration-200">
                    {/* Quick Stats */}
                    <div className="grid grid-cols-3 gap-2 p-4 border-b border-purple-700/50">
                        <div className="text-center p-3 bg-purple-800/30 rounded-xl">
                            <p className="text-2xl font-black text-white">{proofs.length}</p>
                            <p className="text-[10px] text-purple-300 uppercase">Total</p>
                        </div>
                        <div className="text-center p-3 bg-green-900/30 rounded-xl">
                            <p className="text-2xl font-black text-green-400">{confirmedCount}</p>
                            <p className="text-[10px] text-green-300 uppercase">Confirmed</p>
                        </div>
                        <div className="text-center p-3 bg-yellow-900/30 rounded-xl">
                            <p className="text-2xl font-black text-yellow-400">{pendingCount}</p>
                            <p className="text-[10px] text-yellow-300 uppercase">Pending</p>
                        </div>
                    </div>

                    {/* Proofs List */}
                    <div className="max-h-[300px] overflow-auto">
                        {proofs.length === 0 ? (
                            <div className="p-8 text-center">
                                <Link2 className="h-10 w-10 text-purple-700 mx-auto mb-3" />
                                <p className="text-purple-300 text-sm font-medium">No blockchain timestamps</p>
                                <p className="text-purple-400 text-xs mt-1">
                                    Timestamps are created when you protect assets
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y divide-purple-700/30">
                                {proofs.map((proof) => (
                                    <div key={proof.proof_id} className="p-4 hover:bg-white/5 transition-colors">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    {getStatusIcon(proof.status)}
                                                    <span className="text-sm font-bold text-white truncate">
                                                        {proof.asset_name}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <code className="text-[10px] text-purple-300 font-mono bg-purple-800/50 px-2 py-0.5 rounded">
                                                        {proof.asset_hash.slice(0, 16)}...
                                                    </code>
                                                    <button
                                                    onClick={() => copyHash(proof.asset_hash)}
                                                    type="button"
                                                    className="text-purple-400 hover:text-white transition-colors"
                                                >
                                                        {copied === proof.asset_hash ? (
                                                            <Check className="h-3 w-3" />
                                                        ) : (
                                                            <Copy className="h-3 w-3" />
                                                        )}
                                                    </button>
                                                </div>
                                                <p className="text-[10px] text-purple-400 mt-1">
                                                    {new Date(proof.timestamp).toLocaleString()}
                                                </p>
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                <span className={`px-2 py-1 text-[10px] font-bold rounded-full ${proof.status === 'confirmed'
                                                    ? 'bg-green-500/20 text-green-300'
                                                    : proof.status === 'pending'
                                                        ? 'bg-yellow-500/20 text-yellow-300'
                                                        : 'bg-gray-500/20 text-gray-300'
                                                    }`}>
                                                    {getStatusLabel(proof.status)}
                                                </span>
                                                <a
                                                    href={proof.verification_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-[10px] text-purple-400 hover:text-white flex items-center gap-1"
                                                >
                                                    Verify <ExternalLink className="h-3 w-3" />
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t border-purple-700/50 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-[10px] text-purple-400">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            Bitcoin Network
                        </div>
                        <button
                            onClick={refreshStatus}
                            disabled={isLoading}
                            className="px-3 py-1.5 bg-purple-600 text-white text-xs font-bold rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                        >
                            <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
