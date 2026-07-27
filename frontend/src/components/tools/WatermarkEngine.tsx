'use client';

import { Shield, Download, X, Settings, Type, Grid, Layout, Square, Palette, Sparkles } from 'lucide-react';
import { useRef, useEffect, useState, useCallback } from 'react';
import { apiClient, BASE_URL } from '@/lib/api-client';

interface WatermarkEngineProps {
    file: {
        name: string;
        previewUrl?: string;
        id?: string;
    } | null;
    isOpen: boolean;
    onClose: () => void;
}

type WatermarkStyle = 'grid' | 'center' | 'badge';
type WatermarkColor = 'white' | 'black';

export function WatermarkEngine({ file, isOpen, onClose }: WatermarkEngineProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [text, setText] = useState('Cvber Protected');
    const [style, setStyle] = useState<WatermarkStyle>('grid');
    const [opacity, setOpacity] = useState(30);
    const [color, setColor] = useState<WatermarkColor>('white');

    const grabCanvasImage = useCallback(async (previewUrl: string, fileId?: string): Promise<HTMLCanvasElement> => {
        const imageToCanvas = (img: HTMLImageElement): HTMLCanvasElement => {
            const c = document.createElement('canvas');
            c.width = img.naturalWidth;
            c.height = img.naturalHeight;
            c.getContext('2d')!.drawImage(img, 0, 0);
            return c;
        };

        const domResult = ((): HTMLCanvasElement | null => {
            const candidates = document.querySelectorAll<HTMLImageElement>('img[src]');
            for (const img of candidates) {
                if (!img.complete || img.naturalWidth === 0) continue;
                return imageToCanvas(img);
            }
            return null;
        })();
        if (domResult) return domResult;

        const fetchAsCanvas = async (fetchUrl: string): Promise<HTMLCanvasElement> => {
            const resp = await fetch(fetchUrl, { signal: AbortSignal.timeout(30000) });
            if (!resp.ok) throw new Error(`Fetch failed (${resp.status})`);
            const blob = await resp.blob();
            const el = await new Promise<HTMLImageElement>((resolve, reject) => {
                const img = new Image();
                img.onload = () => resolve(img);
                img.onerror = () => reject(new Error('Decode'));
                img.src = URL.createObjectURL(blob);
            });
            return imageToCanvas(el);
        };

        const token = localStorage.getItem('access_token');
        if (fileId && token) {
            try {
                return await fetchAsCanvas(`${BASE_URL}/api/proxy-image?fileId=${encodeURIComponent(fileId)}&token=${encodeURIComponent(token)}`);
            } catch { /* fallback */ }
        }

        try {
            return await fetchAsCanvas(`${BASE_URL}/api/proxy-image?url=${encodeURIComponent(previewUrl)}`);
        } catch { /* fallback */ }

        try {
            return await fetchAsCanvas(previewUrl);
        } catch { /* fallback */ }

        throw new Error('Image unavailable. The source file may have been removed.');
    }, []);

    const drawWatermark = useCallback(async () => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx || !file || !file.previewUrl) {
            setError('No image available');
            setIsProcessing(false);
            return;
        }

        setIsProcessing(true);
        setError(null);

        try {
            const source = await grabCanvasImage(file.previewUrl, file?.id);
            canvas.width = source.width;
            canvas.height = source.height;
            ctx.drawImage(source, 0, 0);

            const baseSize = Math.max(20, Math.floor(canvas.width * 0.04));
            const alpha = opacity / 100;
            const rgbaColor = color === 'white'
                ? `rgba(255, 255, 255, ${alpha})`
                : `rgba(0, 0, 0, ${alpha})`;

            ctx.fillStyle = rgbaColor;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            if (style === 'grid') {
                ctx.font = `bold ${baseSize}px Inter, sans-serif`;
                const spacing = baseSize * 6;
                ctx.save();
                ctx.rotate(-Math.PI / 4);
                const diagonal = Math.sqrt(canvas.width ** 2 + canvas.height ** 2);
                for (let y = -diagonal; y < diagonal; y += spacing) {
                    for (let x = -diagonal; x < diagonal; x += spacing * 2) {
                        ctx.fillText(text, x + (y % (spacing * 2) === 0 ? 0 : spacing), y);
                    }
                }
                ctx.restore();
            } else if (style === 'center') {
                const centerSize = Math.max(40, Math.floor(canvas.width * 0.15));
                ctx.font = `900 ${centerSize}px Inter, sans-serif`;
                ctx.save();
                ctx.translate(canvas.width / 2, canvas.height / 2);
                ctx.rotate(-Math.PI / 6);
                ctx.fillText(text, 0, 0);
                const metrics = ctx.measureText(text);
                const padding = centerSize * 0.5;
                const borderW = metrics.width + padding;
                const borderH = centerSize * 1.5;
                ctx.lineWidth = centerSize * 0.05;
                ctx.strokeStyle = rgbaColor;
                ctx.strokeRect(-borderW / 2, -borderH / 2, borderW, borderH);
                ctx.restore();
            } else if (style === 'badge') {
                const badgeW = canvas.width * 0.3;
                const badgeH = badgeW * 0.25;
                const margin = canvas.width * 0.05;
                const x = canvas.width - badgeW - margin;
                const y = canvas.height - badgeH - margin;
                const r = 10;
                ctx.fillStyle = color === 'white' ? 'rgba(0,0,0,0.85)' : 'rgba(255,255,255,0.95)';
                ctx.beginPath();
                ctx.moveTo(x + r, y);
                ctx.lineTo(x + badgeW - r, y);
                ctx.quadraticCurveTo(x + badgeW, y, x + badgeW, y + r);
                ctx.lineTo(x + badgeW, y + badgeH - r);
                ctx.quadraticCurveTo(x + badgeW, y + badgeH, x + badgeW - r, y + badgeH);
                ctx.lineTo(x + r, y + badgeH);
                ctx.quadraticCurveTo(x, y + badgeH, x, y + badgeH - r);
                ctx.lineTo(x, y + r);
                ctx.quadraticCurveTo(x, y, x + r, y);
                ctx.closePath();
                ctx.fill();
                ctx.fillStyle = color === 'white' ? 'white' : 'black';
                ctx.font = `bold ${badgeH * 0.35}px Inter, sans-serif`;
                ctx.fillText(text, x + badgeW / 2, y + badgeH / 2);
                ctx.font = `900 ${badgeH * 0.18}px Inter, sans-serif`;
                ctx.globalAlpha = 0.6;
                ctx.fillText('CVBER WATERMARKED', x + badgeW / 2, y + badgeH * 0.78);
                ctx.globalAlpha = 1.0;
            }

            setDownloadUrl(canvas.toDataURL('image/png'));
            setIsProcessing(false);
        } catch (e: any) {
            setError(e?.message || 'Could not load image. Try refreshing and opening the watermark again.');
            setIsProcessing(false);
        }
    }, [file, text, style, opacity, color, grabCanvasImage]);

    useEffect(() => {
        if (!isOpen || !file) return;
        setDownloadUrl(null);
        setError(null);
        setIsProcessing(true);
        const t = setTimeout(() => drawWatermark(), 50);
        return () => clearTimeout(t);
    }, [isOpen, file?.previewUrl]);

    useEffect(() => {
        if (!isOpen || !file || !downloadUrl) return;
        drawWatermark();
    }, [text, style, opacity, color]);

    if (!isOpen || !file) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/90 backdrop-blur-2xl transition-opacity duration-500" onClick={onClose} />
            <div className="relative w-full max-w-6xl h-[85vh] overflow-hidden flex border transition-all duration-500" style={{ background: '#050505', borderRadius: 'var(--radius)', borderColor: 'var(--border)' }}>
                <div className="w-80 border-r p-8 flex flex-col gap-10 shrink-0 overflow-y-auto" style={{ background: '#070707', borderColor: 'var(--border)' }}>
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Sparkles className="h-4 w-4" style={{ color: 'var(--text-tertiary)' }} />
                            <h2 style={{ fontSize: '16px', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '+0.02em', textTransform: 'uppercase' }}>Watermark</h2>
                        </div>
                        <p style={{ fontSize: '10px', color: 'var(--text-quaternary)', letterSpacing: '+0.08em', textTransform: 'uppercase' }}>Protection Suite</p>
                    </div>
                    <div className="space-y-4">
                        <label style={{ fontSize: '10px', fontWeight: 900, color: 'var(--text-quaternary)', letterSpacing: '+0.08em', textTransform: 'uppercase' }} className="flex items-center gap-2">
                            <Type className="h-3 w-3" /> Content String
                        </label>
                        <input
                            type="text"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            className="w-full px-4 py-3 border text-sm"
                            style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)', color: 'var(--text-primary)', borderRadius: 'var(--radius)' }}
                            maxLength={30}
                        />
                    </div>
                    <div className="space-y-4">
                        <label style={{ fontSize: '10px', fontWeight: 900, color: 'var(--text-quaternary)', letterSpacing: '+0.08em', textTransform: 'uppercase' }} className="flex items-center gap-2">
                            <Layout className="h-3 w-3" /> Spatial Layout
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {(['grid', 'center', 'badge'] as WatermarkStyle[]).map((s) => (
                                <button
                                    key={s}
                                    onClick={() => setStyle(s)}
                                    className="p-3 border flex flex-col items-center gap-2 transition-all duration-200"
                                    style={{
                                        background: style === s ? 'var(--accent)' : 'var(--bg-surface)',
                                        borderColor: style === s ? 'var(--accent)' : 'var(--border)',
                                        color: style === s ? 'var(--text-primary)' : 'var(--text-quaternary)',
                                        borderRadius: 'var(--radius)'
                                    }}
                                >
                                    {s === 'grid' && <Grid className="h-4 w-4" />}
                                    {s === 'center' && <Square className="h-4 w-4" />}
                                    {s === 'badge' && <Shield className="h-4 w-4" />}
                                    <span style={{ fontSize: '9px', fontWeight: 900, letterSpacing: '+0.1em', textTransform: 'uppercase' }}>{s}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-8">
                        <div className="space-y-4">
                            <label style={{ fontSize: '10px', fontWeight: 900, color: 'var(--text-quaternary)', letterSpacing: '+0.08em', textTransform: 'uppercase' }} className="flex items-center gap-2">
                                <Palette className="h-3 w-3" /> Ink Profile
                            </label>
                            <div className="flex gap-2 p-1 border" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)', borderRadius: 'var(--radius)' }}>
                                <button
                                    onClick={() => setColor('white')}
                                    className="flex-1 py-2 text-[10px] font-bold uppercase tracking-widest transition-all"
                                    style={{
                                        color: color === 'white' ? 'var(--text-primary)' : 'var(--text-quaternary)',
                                        background: color === 'white' ? 'var(--bg-surface)' : 'transparent',
                                        borderRadius: 'var(--radius)'
                                    }}
                                >
                                    Light
                                </button>
                                <button
                                    onClick={() => setColor('black')}
                                    className="flex-1 py-2 text-[10px] font-bold uppercase tracking-widest transition-all"
                                    style={{
                                        color: color === 'black' ? 'var(--text-primary)' : 'var(--text-quaternary)',
                                        background: color === 'black' ? 'var(--bg-surface)' : 'transparent',
                                        borderRadius: 'var(--radius)'
                                    }}
                                >
                                    Dark
                                </button>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <label style={{ fontSize: '10px', fontWeight: 900, color: 'var(--text-quaternary)', letterSpacing: '+0.08em', textTransform: 'uppercase' }} className="flex items-center justify-between">
                                <span>Opacity</span>
                                <span style={{ color: 'var(--text-tertiary)' }}>{opacity}%</span>
                            </label>
                            <input
                                type="range"
                                min="10"
                                max="100"
                                value={opacity}
                                onChange={(e) => setOpacity(parseInt(e.target.value))}
                                className="w-full"
                            />
                        </div>
                    </div>
                    <div className="mt-auto space-y-3 pt-8" style={{ borderTop: '1px solid var(--border)' }}>
                        {downloadUrl && !error ? (
                            <a
                                href={downloadUrl}
                                download={`cvber_watermarked_${file.name}`}
                                className="flex items-center justify-center gap-3 py-4 transition-all duration-200"
                                style={{ background: 'rgba(255,255,255,0.9)', color: '#000', fontWeight: 900, textTransform: 'uppercase', fontSize: '10px', letterSpacing: '+0.15em', borderRadius: 'var(--radius)' }}
                            >
                                <Download className="h-4 w-4" />
                                Secure Export
                            </a>
                        ) : (
                            <button
                                disabled
                                className="flex items-center justify-center gap-3 py-4 cursor-not-allowed"
                                style={{ background: 'var(--bg-surface)', color: 'var(--text-quaternary)', borderRadius: 'var(--radius)' }}
                            >
                                <Download className="h-4 w-4" />
                                {error ? 'Export Unavailable' : 'Processing...'}
                            </button>
                        )}
                        <button onClick={onClose} className="w-full py-4 transition-colors duration-200" style={{ color: 'var(--text-quaternary)', fontSize: '10px', letterSpacing: '+0.15em', textTransform: 'uppercase' }}>
                            Dismiss
                        </button>
                    </div>
                </div>
                <div className="flex-1 relative overflow-hidden flex items-center justify-center p-12" style={{ background: '#09090b' }}>
                    <canvas ref={canvasRef} className="hidden" />
                    {error ? (
                        <div className="flex flex-col items-center gap-4">
                            <div className="h-16 w-16 border-2 flex items-center justify-center" style={{ borderColor: 'var(--text-quaternary)', borderRadius: 'var(--radius)' }}>
                                <X className="h-6 w-6" style={{ color: 'var(--text-quaternary)' }} />
                            </div>
                            <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', textAlign: 'center', maxWidth: '320px' }}>{error}</p>
                            <button onClick={drawWatermark} className="px-4 py-2 border text-[10px] uppercase tracking-widest transition-colors duration-200" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)', borderRadius: 'var(--radius)' }}>
                                Retry
                            </button>
                        </div>
                    ) : isProcessing ? (
                        <div className="flex flex-col items-center gap-6">
                            <div className="h-16 w-16 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--text-quaternary)', borderTopColor: 'transparent' }} />
                            <p style={{ fontSize: '10px', fontWeight: 900, color: 'var(--text-quaternary)', letterSpacing: '+0.3em', textTransform: 'uppercase' }}>Applying protection</p>
                        </div>
                    ) : downloadUrl ? (
                        <div className="relative max-h-full">
                            <div style={{ borderRadius: 'var(--radius)', overflow: 'hidden', border: '1px solid var(--border)' }}>
                                <img src={downloadUrl} alt="Preview" className="max-h-[65vh] object-contain" />
                            </div>
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
