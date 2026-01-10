'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Link2, Search, Shield, ArrowRight } from 'lucide-react';

export default function VerifyLandingPage() {
    const router = useRouter();
    const [hash, setHash] = useState('');
    const [error, setError] = useState('');

    const handleVerify = () => {
        const cleanHash = hash.trim();

        if (!cleanHash) {
            setError('Please enter a file hash');
            return;
        }

        if (!/^[a-fA-F0-9]{64}$/.test(cleanHash)) {
            setError('Invalid hash format. Must be 64 hexadecimal characters (SHA-256)');
            return;
        }

        router.push(`/verify/${cleanHash}`);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-black p-4 md:p-8">
            <div className="max-w-2xl mx-auto pt-20">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-24 h-24 bg-purple-500/20 rounded-3xl mb-8">
                        <Link2 className="h-12 w-12 text-purple-300" />
                    </div>
                    <h1 className="text-4xl font-black text-white mb-4">Blockchain Verification</h1>
                    <p className="text-purple-300 text-lg">
                        Verify your CVBER timestamps against the Bitcoin blockchain
                    </p>
                </div>

                {/* Search Card */}
                <div className="bg-white rounded-3xl shadow-2xl p-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                        <Search className="h-5 w-5 text-purple-600" />
                        Verify a Timestamp
                    </h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                                File Hash (SHA-256)
                            </label>
                            <textarea
                                value={hash}
                                onChange={(e) => {
                                    setHash(e.target.value);
                                    setError('');
                                }}
                                placeholder="Enter the 64-character SHA-256 hash of your file..."
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none h-24"
                            />
                            {error && (
                                <p className="text-red-500 text-sm mt-2">{error}</p>
                            )}
                        </div>

                        <button
                            onClick={handleVerify}
                            className="w-full py-4 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                        >
                            Verify Timestamp <ArrowRight className="h-4 w-4" />
                        </button>
                    </div>

                    {/* Info */}
                    <div className="mt-8 p-4 bg-gray-50 rounded-xl">
                        <h3 className="font-bold text-gray-700 text-sm mb-2">How It Works</h3>
                        <ol className="text-sm text-gray-500 space-y-2">
                            <li>1. Compute the SHA-256 hash of your original file</li>
                            <li>2. Enter the hash above to find the blockchain proof</li>
                            <li>3. Download the court-admissible certificate</li>
                        </ol>
                    </div>
                </div>

                {/* Recent Proofs */}
                <div className="mt-8 bg-white/10 rounded-3xl p-6">
                    <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Your Recent Timestamps
                    </h3>
                    <RecentProofs onSelect={(h) => router.push(`/verify/${h}`)} />
                </div>

                {/* Footer */}
                <p className="text-center text-purple-400 text-xs mt-8">
                    CVBER.FREE Blockchain Verification System · Powered by OpenTimestamps
                </p>
            </div>
        </div>
    );
}

function RecentProofs({ onSelect }: { onSelect: (hash: string) => void }) {
    const proofs = typeof window !== 'undefined'
        ? JSON.parse(localStorage.getItem('cvber_blockchain_proofs') || '[]')
        : [];

    if (proofs.length === 0) {
        return (
            <p className="text-purple-300/50 text-sm">
                No timestamps found. Upload files in your dashboard to create timestamps.
            </p>
        );
    }

    return (
        <div className="space-y-2">
            {proofs.slice(0, 5).map((proof: any) => (
                <button
                    key={proof.asset_hash}
                    onClick={() => onSelect(proof.asset_hash)}
                    className="w-full p-3 bg-white/5 hover:bg-white/10 rounded-xl text-left transition-colors"
                >
                    <p className="text-white font-medium text-sm truncate">{proof.asset_name}</p>
                    <p className="text-purple-300/50 text-xs font-mono truncate">{proof.asset_hash}</p>
                </button>
            ))}
        </div>
    );
}
