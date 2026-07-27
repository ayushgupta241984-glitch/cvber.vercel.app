'use client';

import { useState, useEffect, useRef } from 'react';
import { Link2, CheckCircle, Clock, AlertCircle, RefreshCw, ExternalLink, Copy, Check, Download } from 'lucide-react';
import { apiClient, BASE_URL, downloadBlob } from '@/lib/api-client';

interface BlockchainProof {
    proof_id: string;
    asset_name: string;
    asset_hash: string;
    timestamp: string;
    blockchain: string;
    status: 'pending' | 'confirmed' | 'local_only';
    verification_url: string;
    ots_proof_url?: string;
}

export function BlockchainStatus() {
    const [proofs, setProofs] = useState<BlockchainProof[]>([]);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [copied, setCopied] = useState<string | null>(null);
    const mountedRef = useRef(true);

    useEffect(() => {
        mountedRef.current = true;
        let cleanup = false;

        const loadProofs = async () => {
            if (!mountedRef.current || cleanup) return;
            try {
                const result = await apiClient.getUserBlockchainProofs();
                if (mountedRef.current && !cleanup && result && result.success && Array.isArray(result.proofs)) {
                    setProofs(result.proofs);
                }
            } catch { /* proofs unavailable */ }
        };

        loadProofs();

        const handleUpdate = () => setTimeout(() => loadProofs(), 500);
        window.addEventListener('blockchain-update', handleUpdate);
        const interval = setInterval(loadProofs, 15000);

        return () => {
            cleanup = true;
            mountedRef.current = false;
            clearInterval(interval);
            window.removeEventListener('blockchain-update', handleUpdate);
        };
    }, []);

    const pendingCount = proofs.filter(p => p.status === 'pending').length;
    const confirmedCount = proofs.filter(p => p.status === 'confirmed').length;

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'confirmed': return <CheckCircle className="h-4 w-4" style={{ color: 'var(--text-secondary)' }} />;
            case 'pending': return <Clock className="h-4 w-4 animate-pulse" style={{ color: 'var(--text-tertiary)' }} />;
            default: return <AlertCircle className="h-4 w-4" style={{ color: 'var(--text-quaternary)' }} />;
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'confirmed': return 'Anchored';
            case 'pending': return 'Pending (~2h)';
            default: return 'Local Only';
        }
    };

    const copyHash = (hash: string) => {
        navigator.clipboard.writeText(hash);
        setCopied(hash);
        setTimeout(() => setCopied(null), 2000);
    };

    const downloadOtsProof = async (proofId: string, assetName: string) => {
        try {
            const token = localStorage.getItem('access_token');
            const baseName = assetName.includes('.') ? assetName.split('.').slice(0, -1).join('.') : assetName;
            await downloadBlob(`${BASE_URL}/vault/proofs/${proofId}/ots-proof`, { 'Authorization': `Bearer ${token}` }, `${baseName}.ots`);
        } catch {
            window.dispatchEvent(new CustomEvent('cvber:toast', { detail: { message: 'proofs unavailable', type: 'error' } }));
        }
    };

    const refreshStatus = async () => {
        setIsLoading(true);
        try {
            const result = await apiClient.getUserBlockchainProofs();
            if (result.success) setProofs(result.proofs);
        } catch { /* proofs unavailable */ }
        setIsLoading(false);
    };

    return (
        <div className="border overflow-hidden" style={{ borderColor: 'var(--border)', borderRadius: 'var(--radius)', background: 'var(--bg-surface)' }}>
            <button onClick={() => setIsExpanded(!isExpanded)} className="w-full p-4 flex items-center justify-between transition-colors" style={{ color: 'var(--text-secondary)' }}>
                <div className="flex items-center gap-3">
                    <div className="p-2" style={{ borderRadius: 'var(--radius)', background: 'var(--accent)' }}>
                        <Link2 className="h-5 w-5" style={{ color: 'var(--text-tertiary)' }} />
                    </div>
                    <div className="text-left">
                        <h3 style={{ fontSize: '13px', fontWeight: 900, color: 'var(--text-primary)' }}>Blockchain Status</h3>
                        <p style={{ fontSize: '12px', color: 'var(--text-quaternary)' }}>
                            {proofs.length === 0 ? 'No timestamps yet' : `${confirmedCount} anchored \u00b7 ${pendingCount} pending`}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {pendingCount > 0 && (
                        <span className="px-2 py-1 text-[10px] font-bold animate-pulse" style={{ color: 'var(--text-tertiary)', borderRadius: 'var(--radius)' }}>
                            {pendingCount} SYNCING
                        </span>
                    )}
                    <svg className={`h-5 w-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} style={{ color: 'var(--text-quaternary)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </button>

            {isExpanded && (
                <div className="border-t" style={{ borderColor: 'var(--border)' }}>
                    <div className="grid grid-cols-3 gap-2 p-4 border-b" style={{ borderColor: 'var(--border)' }}>
                        <div className="text-center p-3" style={{ borderRadius: 'var(--radius)', background: 'var(--bg-surface)' }}>
                            <p style={{ fontSize: '20px', fontWeight: 900, color: 'var(--text-primary)' }}>{proofs.length}</p>
                            <p style={{ fontSize: '10px', color: 'var(--text-quaternary)', letterSpacing: '+0.08em', textTransform: 'uppercase' }}>Total</p>
                        </div>
                        <div className="text-center p-3" style={{ borderRadius: 'var(--radius)', background: 'var(--bg-surface)' }}>
                            <p style={{ fontSize: '20px', fontWeight: 900, color: 'var(--text-secondary)' }}>{confirmedCount}</p>
                            <p style={{ fontSize: '10px', color: 'var(--text-tertiary)', letterSpacing: '+0.08em', textTransform: 'uppercase' }}>Confirmed</p>
                        </div>
                        <div className="text-center p-3" style={{ borderRadius: 'var(--radius)', background: 'var(--bg-surface)' }}>
                            <p style={{ fontSize: '20px', fontWeight: 900, color: 'var(--text-tertiary)' }}>{pendingCount}</p>
                            <p style={{ fontSize: '10px', color: 'var(--text-quaternary)', letterSpacing: '+0.08em', textTransform: 'uppercase' }}>Pending</p>
                        </div>
                    </div>

                    <div className="max-h-[300px] overflow-auto">
                        {proofs.length === 0 ? (
                            <div className="p-8 text-center">
                                <Link2 className="h-10 w-10 mx-auto mb-3" style={{ color: 'var(--text-quaternary)' }} />
                                <p style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>No blockchain timestamps</p>
                                <p style={{ fontSize: '12px', color: 'var(--text-quaternary)', marginTop: '4px' }}>Timestamps are created when you protect assets</p>
                            </div>
                        ) : (
                            <div>
                                {proofs.map((proof) => (
                                    <div key={proof.proof_id} className="p-4 transition-colors border-b" style={{ borderColor: 'var(--border)' }}>
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    {getStatusIcon(proof.status)}
                                                    <span className="text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>{proof.asset_name}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <code className="text-[10px] font-mono px-2 py-0.5" style={{ color: 'var(--text-quaternary)', background: 'var(--bg-surface)', borderRadius: 'var(--radius)' }}>
                                                        {proof.asset_hash.slice(0, 16)}...
                                                    </code>
                                                    <button onClick={() => copyHash(proof.asset_hash)} style={{ color: 'var(--text-quaternary)' }}>
                                                        {copied === proof.asset_hash ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                                                    </button>
                                                </div>
                                                <p className="text-[10px] mt-1" style={{ color: 'var(--text-quaternary)' }}>{new Date(proof.timestamp).toLocaleString()}</p>
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                <span className="px-2 py-1 text-[10px] font-bold" style={{
                                                    color: proof.status === 'confirmed' ? 'var(--text-secondary)' : proof.status === 'pending' ? 'var(--text-tertiary)' : 'var(--text-quaternary)',
                                                    borderRadius: 'var(--radius)',
                                                    background: 'var(--bg-surface)',
                                                }}>{getStatusLabel(proof.status)}</span>
                                                <div className="flex items-center gap-2">
                                                    {proof.status !== 'local_only' ? (
                                                        <button onClick={() => downloadOtsProof(proof.proof_id, proof.asset_name)}
                                                            className="text-[10px] flex items-center gap-1" style={{ color: 'var(--text-quaternary)' }}>
                                                            <Download className="h-3 w-3" /> .ots
                                                        </button>
                                                    ) : (
                                                        <span className="text-[10px] italic" style={{ color: 'var(--text-quaternary)' }}>No proof file</span>
                                                    )}
                                                    <a href="https://opentimestamps.org/" target="_blank" rel="noopener noreferrer"
                                                        className="text-[10px] flex items-center gap-1" style={{ color: 'var(--text-quaternary)' }}>
                                                        <ExternalLink className="h-3 w-3" /> Info
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="p-4 border-t flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
                        <div className="flex items-center gap-2 text-[10px]" style={{ color: 'var(--text-quaternary)' }}>
                            <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--text-secondary)' }} />
                            Bitcoin Network
                        </div>
                        <button onClick={refreshStatus} disabled={isLoading}
                            className="px-3 py-1.5 text-xs font-bold flex items-center gap-2 transition-colors disabled:opacity-50"
                            style={{ borderRadius: 'var(--radius)', background: 'var(--bg-surface)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                            <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
