'use client';

import { useState } from 'react';
import { Scale, FileText, AlertTriangle, Send, Copy, Check, ExternalLink } from 'lucide-react';

interface DMCAGeneratorProps {
    asset: {
        name: string;
        hash: string;
        originalityScore: number;
        forensicSummary: string;
    };
    onClose: () => void;
}

export function DMCAGenerator({ asset, onClose }: DMCAGeneratorProps) {
    const [step, setStep] = useState(1);
    const [platform, setPlatform] = useState('');
    const [infringementUrl, setInfringementUrl] = useState('');
    const [ownerName, setOwnerName] = useState('');
    const [ownerEmail, setOwnerEmail] = useState('');
    const [generatedNotice, setGeneratedNotice] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    const platforms = [
        { id: 'youtube', name: 'YouTube', icon: '📺' },
        { id: 'instagram', name: 'Instagram', icon: '📸' },
        { id: 'tiktok', name: 'TikTok', icon: '🎵' },
        { id: 'x', name: 'X (Twitter)', icon: '🐦' },
        { id: 'generic', name: 'Other', icon: '🌐' }
    ];

    const handleGenerate = async () => {
        setIsLoading(true);
        try {
            const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
            const response = await fetch(`${backendUrl}/api/enforcement/dmca/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    asset_name: asset.name,
                    asset_hash: asset.hash,
                    originality_score: asset.originalityScore,
                    forensic_summary: asset.forensicSummary,
                    infringement_url: infringementUrl,
                    platform: platform,
                    owner_name: ownerName,
                    owner_email: ownerEmail
                })
            });
            const data = await response.json();
            setGeneratedNotice(data);
            setStep(3);
        } catch (error) {
            console.error('Failed to generate DMCA:', error);
        }
        setIsLoading(false);
    };

    const copyToClipboard = () => {
        if (generatedNotice?.notice?.body) {
            navigator.clipboard.writeText(generatedNotice.notice.body);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />

            <div className="relative w-full max-w-2xl bg-gray-900 rounded-3xl shadow-2xl border border-gray-800 overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-gray-800 bg-gradient-to-r from-red-900/20 to-orange-900/20">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-red-500/20 rounded-2xl">
                            <Scale className="h-6 w-6 text-red-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">DMCA Takedown Generator</h2>
                            <p className="text-sm text-gray-400">Automated enforcement for stolen content</p>
                        </div>
                    </div>

                    {/* Progress Steps */}
                    <div className="flex items-center gap-2 mt-6">
                        {['Platform', 'Details', 'Generate'].map((label, idx) => (
                            <div key={idx} className="flex items-center gap-2 flex-1">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${step > idx + 1 ? 'bg-green-500 text-white' :
                                        step === idx + 1 ? 'bg-red-500 text-white' :
                                            'bg-gray-700 text-gray-400'
                                    }`}>
                                    {step > idx + 1 ? '✓' : idx + 1}
                                </div>
                                <span className={`text-xs font-medium ${step >= idx + 1 ? 'text-white' : 'text-gray-500'}`}>
                                    {label}
                                </span>
                                {idx < 2 && <div className={`flex-1 h-0.5 ${step > idx + 1 ? 'bg-green-500' : 'bg-gray-700'}`} />}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 max-h-[60vh] overflow-auto">
                    {step === 1 && (
                        <div className="space-y-4">
                            <p className="text-gray-400 text-sm mb-6">Select the platform where your content was stolen:</p>
                            <div className="grid grid-cols-2 gap-3">
                                {platforms.map((p) => (
                                    <button
                                        key={p.id}
                                        onClick={() => setPlatform(p.id)}
                                        className={`p-4 rounded-2xl border-2 transition-all flex items-center gap-3 ${platform === p.id
                                                ? 'border-red-500 bg-red-500/10 text-white'
                                                : 'border-gray-700 hover:border-gray-600 text-gray-300'
                                            }`}
                                    >
                                        <span className="text-2xl">{p.icon}</span>
                                        <span className="font-medium">{p.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                                    Infringing URL *
                                </label>
                                <input
                                    type="url"
                                    value={infringementUrl}
                                    onChange={(e) => setInfringementUrl(e.target.value)}
                                    placeholder="https://example.com/stolen-content"
                                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                                        Your Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={ownerName}
                                        onChange={(e) => setOwnerName(e.target.value)}
                                        placeholder="John Doe"
                                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                                        Your Email *
                                    </label>
                                    <input
                                        type="email"
                                        value={ownerEmail}
                                        onChange={(e) => setOwnerEmail(e.target.value)}
                                        placeholder="john@example.com"
                                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                                    />
                                </div>
                            </div>

                            <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                                <div className="flex items-start gap-3">
                                    <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                                    <div>
                                        <p className="text-sm text-yellow-200 font-medium">Legal Notice</p>
                                        <p className="text-xs text-yellow-300/70 mt-1">
                                            By generating this DMCA notice, you confirm under penalty of perjury that you are the copyright owner.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 3 && generatedNotice && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                    <span className="text-sm font-medium text-green-400">Notice Generated</span>
                                </div>
                                <span className="text-xs font-mono text-gray-500">{generatedNotice.notice?.notice_id}</span>
                            </div>

                            <div className="bg-gray-800 p-4 rounded-xl max-h-[300px] overflow-auto">
                                <pre className="text-xs text-gray-300 whitespace-pre-wrap font-mono">
                                    {generatedNotice.notice?.body}
                                </pre>
                            </div>

                            <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                                <p className="text-sm text-blue-200 font-medium mb-2">Submission Instructions:</p>
                                <p className="text-xs text-blue-300/70">{generatedNotice.instructions?.notes}</p>
                                {generatedNotice.instructions?.url && (
                                    <a
                                        href={generatedNotice.instructions.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 mt-2 text-blue-400 hover:text-blue-300 text-sm"
                                    >
                                        Open Submission Form <ExternalLink className="h-3 w-3" />
                                    </a>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-800 flex justify-between">
                    <button
                        onClick={step === 1 ? onClose : () => setStep(step - 1)}
                        className="px-6 py-3 text-gray-400 hover:text-white transition-colors"
                    >
                        {step === 1 ? 'Cancel' : 'Back'}
                    </button>

                    {step < 3 ? (
                        <button
                            onClick={step === 1 ? () => setStep(2) : handleGenerate}
                            disabled={(step === 1 && !platform) || (step === 2 && (!infringementUrl || !ownerName || !ownerEmail)) || isLoading}
                            className="px-6 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isLoading ? (
                                <>Generating...</>
                            ) : step === 1 ? (
                                <>Continue</>
                            ) : (
                                <><FileText className="h-4 w-4" /> Generate Notice</>
                            )}
                        </button>
                    ) : (
                        <button
                            onClick={copyToClipboard}
                            className="px-6 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-all flex items-center gap-2"
                        >
                            {copied ? <><Check className="h-4 w-4" /> Copied!</> : <><Copy className="h-4 w-4" /> Copy Notice</>}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
