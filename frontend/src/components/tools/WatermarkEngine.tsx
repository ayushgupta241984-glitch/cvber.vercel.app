'use client';

import { Shield, Download, X, Copy, Check, ExternalLink, Settings, Type, Grid, Layout, Square, Palette, Sparkles } from 'lucide-react';
import { useRef, useEffect, useState, useCallback } from 'react';

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
    const [copied, setCopied] = useState(false);

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
                return await fetchAsCanvas(`/api/proxy-image?fileId=${encodeURIComponent(fileId)}&token=${encodeURIComponent(token)}`);
            } catch {}
        }

        try {
            return await fetchAsCanvas(`/api/proxy-image?url=${encodeURIComponent(previewUrl)}`);
        } catch {}

        try {
            return await fetchAsCanvas(previewUrl);
        } catch {}

        throw new Error('Could not load image. Try refreshing the page.');
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
                ctx.font = `black ${badgeH * 0.18}px Inter, sans-serif`;
                ctx.globalAlpha = 0.6;
                ctx.fillText('CVBER VERIFIED AUTHENTIC', x + badgeW / 2, y + badgeH * 0.78);
                ctx.globalAlpha = 1.0;
            }

            setDownloadUrl(canvas.toDataURL('image/png'));
            setIsProcessing(false);
        } catch (e: any) {
            console.error('Watermark error:', e);
            setError('Could not load image. Try refreshing and opening the watermark again.');
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
            <div className="absolute inset-0 bg-black/90 backdrop-blur-2xl animate-in fade-in duration-500" onClick={onClose} />
            <div className="relative w-full max-w-6xl h-[85vh] bg-[#050505] rounded-[40px] shadow-[0_0_100px_rgba(0,0,0,1)] overflow-hidden flex border border-zinc-900 animate-in slide-in-from-bottom-12 duration-700">
                <div className="w-80 bg-[#070707] border-r border-zinc-900 p-8 flex flex-col gap-10 shrink-0 overflow-y-auto">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Sparkles className="h-4 w-4 text-purple-500" />
                            <h2 className="text-xl font-black text-white tracking-tighter uppercase">Watermark</h2>
                        </div>
                        <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.2em]">Protection Suite v2.0</p>
                    </div>
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.15em] flex items-center gap-2">
                            <Type className="h-3 w-3" /> Content String
                        </label>
                        <input
                            type="text"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-2xl text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all placeholder:text-zinc-700"
                            maxLength={30}
                        />
                    </div>
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.15em] flex items-center gap-2">
                            <Layout className="h-3 w-3" /> Spatial Layout
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {(['grid', 'center', 'badge'] as WatermarkStyle[]).map((s) => (
                                <button
                                    key={s}
                                    onClick={() => setStyle(s)}
                                    className={`p-3 rounded-2xl border flex flex-col items-center gap-2 transition-all duration-300 ${style === s ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-600/20' : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300'}`}
                                >
                                    {s === 'grid' && <Grid className="h-4 w-4" />}
                                    {s === 'center' && <Square className="h-4 w-4" />}
                                    {s === 'badge' && <Shield className="h-4 w-4" />}
                                    <span className="text-[9px] font-black uppercase tracking-widest">{s}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-8">
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.15em] flex items-center gap-2">
                                <Palette className="h-3 w-3" /> Ink Profile
                            </label>
                            <div className="flex gap-2 p-1 bg-zinc-900 rounded-2xl border border-zinc-800">
                                <button
                                    onClick={() => setColor('white')}
                                    className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${color === 'white' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                                >
                                    Light
                                </button>
                                <button
                                    onClick={() => setColor('black')}
                                    className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${color === 'black' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                                >
                                    Dark
                                </button>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.15em] flex items-center justify-between">
                                <span>Density / Opacity</span>
                                <span className="text-purple-500">{opacity}%</span>
                            </label>
                            <input
                                type="range"
                                min="10"
                                max="100"
                                value={opacity}
                                onChange={(e) => setOpacity(parseInt(e.target.value))}
                                className="w-full h-1.5 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-purple-500 border border-zinc-800/50"
                            />
                        </div>
                    </div>
                    <div className="mt-auto space-y-3 pt-8 border-t border-zinc-900">
                        {downloadUrl && !error ? (
                            <a
                                href={downloadUrl}
                                download={`cvber_protected_${file.name}`}
                                className="flex items-center justify-center gap-3 py-4 bg-white text-black font-black uppercase tracking-[0.15em] text-[10px] rounded-[20px] hover:bg-zinc-200 transition-all active:scale-95 shadow-xl shadow-white/5 w-full"
                            >
                                <Download className="h-4 w-4" />
                                Secure Export
                            </a>
                        ) : (
                            <button
                                disabled
                                className="flex items-center justify-center gap-3 py-4 bg-zinc-800 text-zinc-500 font-black uppercase tracking-[0.15em] text-[10px] rounded-[20px] w-full cursor-not-allowed"
                            >
                                <Download className="h-4 w-4" />
                                {error ? 'Export Unavailable' : 'Processing...'}
                            </button>
                        )}
                        <button onClick={onClose} className="w-full py-4 text-zinc-600 font-black text-[10px] uppercase tracking-[0.2em] hover:text-zinc-400 transition-colors">
                            Dismiss
                        </button>
                    </div>
                </div>
                <div className="flex-1 bg-[#09090b] relative overflow-hidden flex items-center justify-center p-12 bg-grid-white">
                    <canvas ref={canvasRef} className="hidden" />
                    {error ? (
                        <div className="flex flex-col items-center gap-4">
                            <div className="h-16 w-16 border-2 border-red-500/50 rounded-full flex items-center justify-center">
                                <X className="h-6 w-6 text-red-400" />
                            </div>
                            <p className="text-xs text-zinc-400 text-center max-w-xs">{error}</p>
                            <button onClick={drawWatermark} className="px-4 py-2 bg-zinc-800 text-white text-[10px] uppercase tracking-widest rounded-lg hover:bg-zinc-700 transition-colors">
                                Retry
                            </button>
                        </div>
                    ) : isProcessing ? (
                        <div className="flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-500">
                            <div className="h-16 w-16 border-[6px] border-purple-500 border-t-transparent rounded-full animate-spin shadow-[0_0_30px_rgba(168,85,247,0.3)]" />
                            <p className="text-[10px] font-black text-purple-500 uppercase tracking-[0.3em] animate-pulse">Processing Vector Data</p>
                        </div>
                    ) : downloadUrl ? (
                        <div className="relative group max-h-full">
                            <div className="absolute -inset-4 bg-purple-500/10 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                            <div className="relative shadow-[0_0_80px_rgba(0,0,0,0.5)] rounded-2xl overflow-hidden border border-white/5 transition-all duration-500 group-hover:scale-[1.02]">
                                <img src={downloadUrl} alt="Preview" className="max-h-[65vh] object-contain" />
                            </div>
                        </div>
                    ) : null}
                    <div className="absolute top-8 right-8">
                        <div className="bg-zinc-900/80 backdrop-blur-xl px-4 py-2 rounded-full shadow-2xl border border-white/5 text-[9px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)] animate-pulse" />
                            Protected Sandbox
                        </div>
                    </div>
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
                        <p className="text-[9px] font-medium text-zinc-600 uppercase tracking-[0.4em] text-center">Reference Alpha v1.0 • Internal Security Only</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
