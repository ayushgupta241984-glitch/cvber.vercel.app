'use client';

import { useState } from 'react';
import { Scale, FileText, AlertTriangle, Send, Copy, Check, ExternalLink, ArrowRight } from 'lucide-react';
import { BASE_URL } from '@/lib/api-client';

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
            const response = await fetch(`${BASE_URL}/api/enforcement/dmca/generate`, {
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

            <div className="card-premium w-full max-w-2xl shadow-2xl overflow-hidden relative border-purple-500/20">
                {/* Header */}
                <div className="p-8 border-b border-zinc-800/50 bg-gradient-to-r from-purple-500/10 to-transparent">
                    <div className="flex items-center gap-6">
                        <div className="p-4 bg-purple-500/10 rounded-2xl border border-purple-500/20">
                            <Scale className="h-7 w-7 text-purple-400" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white tracking-tight">Enforcement Engine</h2>
                            <p className="text-sm text-zinc-500 mt-1">Legally-compliant DMCA takedown automation</p>
                        </div>
                    </div>

                    {/* Progress Steps */}
                    <div className="flex items-center gap-2 mt-8">
                        {['Platform', 'Details', 'Generate'].map((label, idx) => (
                            <div key={idx} className="flex items-center gap-2 flex-1">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black transition-all duration-500 border ${step > idx + 1 ? 'bg-green-500 border-green-400 text-white' :
                                    step === idx + 1 ? 'bg-purple-600 border-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.3)]' :
                                        'bg-zinc-900 border-zinc-800 text-zinc-600'
                                    }`}>
                                    {step > idx + 1 ? '✓' : idx + 1}
                                </div>
                                <span className={`text-[10px] font-black uppercase tracking-widest ${step >= idx + 1 ? 'text-zinc-200' : 'text-zinc-600'}`}>
                                    {label}
                                </span>
                                {idx < 2 && <div className={`flex-1 h-[2px] rounded-full mx-2 ${step > idx + 1 ? 'bg-green-500/50' : 'bg-zinc-800'}`} />}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="p-8 max-h-[60vh] overflow-auto scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
                    {step === 1 && (
                        <div className="space-y-6">
                            <p className="text-zinc-500 text-sm font-medium">Identify the origin of infringement:</p>
                            <div className="grid grid-cols-2 gap-4">
                                {platforms.map((p) => (
                                    <button
                                        key={p.id}
                                        onClick={() => setPlatform(p.id)}
                                        className={`p-6 rounded-2xl border-2 transition-all duration-300 flex items-center gap-4 group/p ${platform === p.id
                                            ? 'border-purple-500 bg-purple-500/10 text-white shadow-[0_0_20px_rgba(168,85,247,0.1)]'
                                            : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 text-zinc-500 hover:text-zinc-300'
                                            }`}
                                    >
                                        <span className="text-3xl group-hover/p:scale-110 transition-transform">{p.icon}</span>
                                        <span className="font-bold tracking-tight">{p.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-8">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-3">
                                        Evidence URL
                                    </label>
                                    <input
                                        type="url"
                                        value={infringementUrl}
                                        onChange={(e) => setInfringementUrl(e.target.value)}
                                        placeholder="https://platform.com/stolen-post-id"
                                        className="w-full px-5 py-4 bg-zinc-900/50 border border-zinc-800 rounded-xl text-white placeholder-zinc-700 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-3">
                                            Legal Name
                                        </label>
                                        <input
                                            type="text"
                                            value={ownerName}
                                            onChange={(e) => setOwnerName(e.target.value)}
                                            placeholder="Full legal name"
                                            className="w-full px-5 py-4 bg-zinc-900/50 border border-zinc-800 rounded-xl text-white placeholder-zinc-700 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-3">
                                            Active Email
                                        </label>
                                        <input
                                            type="email"
                                            value={ownerEmail}
                                            onChange={(e) => setOwnerEmail(e.target.value)}
                                            placeholder="Contact email"
                                            className="w-full px-5 py-4 bg-zinc-900/50 border border-zinc-800 rounded-xl text-white placeholder-zinc-700 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="p-5 bg-purple-500/5 border border-purple-500/20 rounded-2xl relative overflow-hidden group/alert">
                                <div className="absolute top-0 right-0 p-4 opacity-10 translate-x-1/2 -translate-y-1/2 group-hover:scale-110 transition-transform">
                                    <AlertTriangle className="h-16 w-16 text-purple-500" />
                                </div>
                                <div className="flex items-start gap-4 relative z-10">
                                    <AlertTriangle className="h-5 w-5 text-purple-500 mt-1" />
                                    <div>
                                        <p className="text-sm text-purple-200 font-bold tracking-tight">Legal Verification Requirement</p>
                                        <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                                            By proceeding, you attest under penalty of perjury that you are the primary copyright holder or authorized agent for this work.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 3 && generatedNotice && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-2.5 h-2.5 bg-green-500 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.5)] animate-pulse" />
                                    <span className="text-sm font-bold text-green-400 tracking-tight">Legal Notice Prepared</span>
                                </div>
                                <span className="text-[10px] font-mono font-bold text-zinc-600 bg-zinc-900 px-3 py-1 rounded-full border border-zinc-800">
                                    ID: {generatedNotice.notice?.notice_id}
                                </span>
                            </div>

                            <div className="bg-zinc-950 p-6 rounded-2xl border border-zinc-800/80 max-h-[300px] overflow-auto group/code relative">
                                <div className="sticky top-0 float-right p-1 opacity-0 group-hover/code:opacity-100 transition-opacity">
                                    <FileText className="h-4 w-4 text-zinc-700" />
                                </div>
                                <pre className="text-xs text-zinc-400 whitespace-pre-wrap font-mono leading-relaxed">
                                    {generatedNotice.notice?.body}
                                </pre>
                            </div>

                            <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-2xl">
                                <div className="flex flex-col gap-3">
                                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Next Steps:</p>
                                    <p className="text-sm text-zinc-300 leading-relaxed font-medium">{generatedNotice.instructions?.notes}</p>
                                    {generatedNotice.instructions?.url && (
                                        <a
                                            href={generatedNotice.instructions.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 mt-4 text-purple-400 hover:text-purple-300 font-bold text-sm transition-colors group/link"
                                        >
                                            Execute Submission Flow <ExternalLink className="h-4 w-4 group-hover:scale-110 transition-transform" />
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-8 border-t border-zinc-800/50 bg-zinc-900/30 flex justify-between items-center">
                    <button
                        onClick={step === 1 ? onClose : () => setStep(step - 1)}
                        className="text-zinc-500 hover:text-white font-bold text-sm transition-colors tracking-tight"
                    >
                        {step === 1 ? 'Discard Action' : 'Modify Selection'}
                    </button>

                    {step < 3 ? (
                        <button
                            onClick={step === 1 ? () => setStep(2) : handleGenerate}
                            disabled={(step === 1 && !platform) || (step === 2 && (!infringementUrl || !ownerName || !ownerEmail)) || isLoading}
                            className="btn-primary group/next disabled:opacity-30 disabled:hover:scale-100"
                        >
                            {isLoading ? (
                                <div className="flex items-center gap-3">
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>Generating...</span>
                                </div>
                            ) : step === 1 ? (
                                <>Initialize Process <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" /></>
                            ) : (
                                <><FileText className="h-4 w-4" /> Finalize Legal Notice</>
                            )}
                        </button>
                    ) : (
                        <button
                            onClick={copyToClipboard}
                            className={`px-8 py-3 rounded-xl font-bold transition-all duration-300 flex items-center gap-2 shadow-lg active:scale-95 ${copied ? 'bg-green-600 text-white shadow-green-500/20' : 'bg-purple-600 text-white shadow-purple-500/20 hover:bg-purple-500'}`}
                        >
                            {copied ? <><Check className="h-4 w-4" /> Content Copied</> : <><Copy className="h-4 w-4" /> Copy Notice Payload</>}
                        </button>
                    )}
                </div>
            </div>

        </div>
    );
}
