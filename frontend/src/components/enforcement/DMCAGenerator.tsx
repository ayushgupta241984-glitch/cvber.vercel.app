'use client';

import { useState } from 'react';
import { Scale, FileText, AlertTriangle, Copy, Check, ExternalLink, ArrowRight } from 'lucide-react';
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
    const [errors, setErrors] = useState<Record<string, string>>({});

    const platforms = [
        { id: 'youtube', name: 'YOUTUBE' },
        { id: 'instagram', name: 'INSTAGRAM' },
        { id: 'tiktok', name: 'TIKTOK' },
        { id: 'x', name: 'X' },
        { id: 'generic', name: 'OTHER' }
    ];

    const validate = (): boolean => {
        const e: Record<string, string> = {};
        if (!platform) e.platform = 'select a platform';
        if (infringementUrl && !/^https?:\/\/.+/.test(infringementUrl)) e.infringementUrl = 'enter a valid URL';
        if (ownerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ownerEmail)) e.ownerEmail = 'enter a valid email';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleGenerate = async () => {
        if (!validate()) return;
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
                    platform, owner_name: ownerName, owner_email: ownerEmail
                })
            });
            const data = await response.json();
            setGeneratedNotice(data);
            setStep(3);
        } catch {
            setErrors({ general: 'generation failed. please check your inputs and try again.' });
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

    const inputStyle = (hasError = false): React.CSSProperties => ({
        background: 'var(--bg-surface)',
        borderColor: hasError ? 'rgba(239,68,68,0.5)' : 'var(--border)',
        color: 'var(--text-primary)',
        borderRadius: 'var(--radius)',
    });

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
            <div className="w-full max-w-2xl overflow-hidden relative border" style={{ background: '#050505', borderRadius: 'var(--radius)', borderColor: 'var(--border)' }}>
                <div className="p-8 border-b" style={{ borderColor: 'var(--border)' }}>
                    <div className="flex items-center gap-6">
                        <div className="p-4 border" style={{ borderRadius: 'var(--radius)', borderColor: 'var(--border)' }}>
                            <Scale className="h-7 w-7" style={{ color: 'var(--text-tertiary)' }} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: '20px', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '+0.02em' }}>Enforcement Engine</h2>
                            <p className="text-sm mt-1" style={{ color: 'var(--text-quaternary)' }}>DMCA takedown notice generator</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 mt-8">
                        {['Platform', 'Details', 'Generate'].map((label, idx) => (
                            <div key={idx} className="flex items-center gap-2 flex-1">
                                <div className="w-10 h-10 flex items-center justify-center text-sm border" style={{
                                    borderRadius: 'var(--radius)',
                                    background: step === idx + 1 ? 'var(--accent)' : 'var(--bg-surface)',
                                    borderColor: step === idx + 1 ? 'var(--accent)' : 'var(--border)',
                                    color: step > idx + 1 || step === idx + 1 ? 'var(--text-primary)' : 'var(--text-quaternary)',
                                }}>
                                    {step > idx + 1 ? '✓' : idx + 1}
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: step >= idx + 1 ? 'var(--text-secondary)' : 'var(--text-quaternary)' }}>{label}</span>
                                {idx < 2 && <div className="flex-1 h-[2px] rounded-full mx-2" style={{ background: step > idx + 1 ? 'var(--text-secondary)' : 'var(--border)' }} />}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="p-8 max-h-[60vh] overflow-auto">
                    {errors.general && <div className="mb-6 p-4 border border-red-500/20 text-sm" style={{ borderRadius: 'var(--radius)', color: '#f87171' }}>{errors.general}</div>}

                    {step === 1 && (
                        <div className="space-y-6">
                            <p className="text-sm" style={{ color: 'var(--text-quaternary)' }}>Select the platform where infringement was found:</p>
                            <div className="grid grid-cols-2 gap-4">
                                {platforms.map((p) => (
                                    <button key={p.id} onClick={() => { setPlatform(p.id); setErrors(prev => ({ ...prev, platform: '' })); }}
                                        className="p-6 border-2 transition-all duration-200 flex items-center justify-center" style={{
                                            borderRadius: 'var(--radius)',
                                            borderColor: platform === p.id ? 'var(--accent)' : 'var(--border)',
                                            background: platform === p.id ? 'var(--accent)' : 'var(--bg-surface)',
                                            color: platform === p.id ? 'var(--text-primary)' : 'var(--text-tertiary)',
                                        }}>
                                        <span style={{ fontSize: '10px', fontWeight: 900, letterSpacing: '+0.1em', textTransform: 'uppercase' }}>{p.name}</span>
                                    </button>
                                ))}
                            </div>
                            {errors.platform && <p className="text-xs" style={{ color: '#f87171' }}>{errors.platform}</p>}
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-8">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-[0.2em] mb-3" style={{ color: 'var(--text-quaternary)' }}>Evidence URL</label>
                                    <input type="url" value={infringementUrl} onChange={(e) => { setInfringementUrl(e.target.value); setErrors(prev => ({ ...prev, infringementUrl: '' })); }}
                                        placeholder="https://platform.com/stolen-post-id"
                                        className="w-full px-5 py-4 border text-sm focus:outline-none focus:ring-2 transition-all"
                                        style={inputStyle(!!errors.infringementUrl)} />
                                    {errors.infringementUrl && <p className="text-xs mt-1" style={{ color: '#f87171' }}>{errors.infringementUrl}</p>}
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-[0.2em] mb-3" style={{ color: 'var(--text-quaternary)' }}>Legal Name</label>
                                        <input type="text" value={ownerName} onChange={(e) => setOwnerName(e.target.value)} placeholder="Full legal name"
                                            className="w-full px-5 py-4 border text-sm focus:outline-none transition-all" style={inputStyle()} />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-[0.2em] mb-3" style={{ color: 'var(--text-quaternary)' }}>Active Email</label>
                                        <input type="email" value={ownerEmail} onChange={(e) => { setOwnerEmail(e.target.value); setErrors(prev => ({ ...prev, ownerEmail: '' })); }}
                                            placeholder="Contact email" className="w-full px-5 py-4 border text-sm focus:outline-none transition-all" style={inputStyle(!!errors.ownerEmail)} />
                                        {errors.ownerEmail && <p className="text-xs mt-1" style={{ color: '#f87171' }}>{errors.ownerEmail}</p>}
                                    </div>
                                </div>
                            </div>
                            <div className="p-5 border" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)', borderRadius: 'var(--radius)' }}>
                                <div className="flex items-start gap-4">
                                    <AlertTriangle className="h-5 w-5 mt-1" style={{ color: 'var(--text-tertiary)' }} />
                                    <div>
                                        <p className="text-sm font-bold tracking-tight" style={{ color: 'var(--text-secondary)' }}>Legal Verification Requirement</p>
                                        <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--text-quaternary)' }}>
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
                                    <div className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ background: 'var(--text-secondary)' }} />
                                    <span className="text-sm font-bold" style={{ color: 'var(--text-secondary)' }}>Notice Prepared</span>
                                </div>
                                <span className="text-[10px] font-mono font-bold px-3 py-1 border" style={{ color: 'var(--text-quaternary)', background: 'var(--bg-surface)', borderColor: 'var(--border)', borderRadius: 'var(--radius)' }}>
                                    {generatedNotice.notice?.notice_id}
                                </span>
                            </div>
                            <div className="p-6 border max-h-[300px] overflow-auto" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)', borderRadius: 'var(--radius)' }}>
                                <pre className="text-xs whitespace-pre-wrap font-mono leading-relaxed" style={{ color: 'var(--text-tertiary)' }}>{generatedNotice.notice?.body}</pre>
                            </div>
                            <div className="p-6 border" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)', borderRadius: 'var(--radius)' }}>
                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-3" style={{ color: 'var(--text-quaternary)' }}>Next Steps:</p>
                                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-tertiary)' }}>{generatedNotice.instructions?.notes}</p>
                                {generatedNotice.instructions?.url && (
                                    <a href={generatedNotice.instructions.url} target="_blank" rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 mt-4 font-bold text-sm" style={{ color: 'var(--text-secondary)' }}>
                                        Submit <ExternalLink className="h-4 w-4" />
                                    </a>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-8 border-t flex justify-between items-center" style={{ borderColor: 'var(--border)' }}>
                    <button onClick={step === 1 ? onClose : () => setStep(step - 1)} className="font-bold text-sm" style={{ color: 'var(--text-quaternary)' }}>
                        {step === 1 ? 'Cancel' : 'Back'}
                    </button>
                    {step < 3 ? (
                        <button onClick={step === 1 ? () => setStep(2) : handleGenerate}
                            disabled={(step === 1 && !platform) || isLoading}
                            className="flex items-center gap-3 px-8 py-3 font-bold text-sm disabled:opacity-30 disabled:cursor-not-allowed"
                            style={{ background: 'rgba(255,255,255,0.9)', color: '#000', borderRadius: 'var(--radius)' }}>
                            {isLoading ? (<><div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />Generating...</>)
                             : step === 1 ? (<>Continue <ArrowRight className="h-4 w-4" /></>)
                             : (<>Generate Notice</>)}
                        </button>
                    ) : (
                        <button onClick={copyToClipboard}
                            className="flex items-center gap-2 px-8 py-3 font-bold transition-all"
                            style={{ background: copied ? 'var(--text-secondary)' : 'rgba(255,255,255,0.9)', color: copied ? '#000' : '#000', borderRadius: 'var(--radius)' }}>
                            {copied ? <><Check className="h-4 w-4" /> Copied</> : <><Copy className="h-4 w-4" /> Copy Notice</>}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
