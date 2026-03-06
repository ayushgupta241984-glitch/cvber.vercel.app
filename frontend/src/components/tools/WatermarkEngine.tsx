'use client';

import { Shield, Download, X, Copy, Check, ExternalLink, Settings, Type, Grid, Layout, Square, Palette, Sparkles } from 'lucide-react';
import { useRef, useEffect, useState } from 'react';

interface WatermarkEngineProps {
    file: {
        name: string;
        previewUrl: string;
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
    const [copied, setCopied] = useState(false);

    // Configuration State
    const [text, setText] = useState('Cvber Protected');
    const [style, setStyle] = useState<WatermarkStyle>('grid');
    const [opacity, setOpacity] = useState(30);
    const [color, setColor] = useState<WatermarkColor>('white');

    useEffect(() => {
        if (!isOpen || !file || !canvasRef.current) return;
        drawWatermark();
    }, [isOpen, file, text, style, opacity, color]);

    const drawWatermark = () => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx || !file) return;

        setIsProcessing(true);
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = file.previewUrl;

        img.onload = () => {
            // Set canvas size to image size
            canvas.width = img.width;
            canvas.height = img.height;

            // Draw original image
            ctx.drawImage(img, 0, 0);

            // Configure TextStyle
            const baseSize = Math.max(20, Math.floor(canvas.width * 0.04));
            const rgbaColor = color === 'white'
                ? `rgba(255, 255, 255, ${opacity / 100})`
                : `rgba(0, 0, 0, ${opacity / 100})`;

            ctx.fillStyle = rgbaColor;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";

            // Apply Style
            if (style === 'grid') {
                ctx.font = `bold ${baseSize}px Inter, sans-serif`;
                const spacing = baseSize * 6;

                ctx.save();
                ctx.rotate(-Math.PI / 4);

                // Draw a large enough grid to cover the rotated canvas
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

                // Add a border box
                const metrics = ctx.measureText(text);
                const padding = centerSize * 0.5;
                const borderW = metrics.width + padding;
                const borderH = centerSize * 1.5;
                ctx.lineWidth = centerSize * 0.05;
                ctx.strokeStyle = rgbaColor;
                ctx.strokeRect(-borderW / 2, -borderH / 2, borderW, borderH);
                ctx.restore();
            } else if (style === 'badge') {
                // Draw Badge at Bottom Right
                const badgeW = canvas.width * 0.3;
                const badgeH = badgeW * 0.25;
                const margin = canvas.width * 0.05;
                const x = canvas.width - badgeW - margin;
                const y = canvas.height - badgeH - margin;
                const r = 10;

                // Background
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

                // Text
                ctx.fillStyle = color === 'white' ? 'white' : 'black';
                ctx.font = `bold ${badgeH * 0.35}px Inter, sans-serif`;
                ctx.fillText(text, x + badgeW / 2, y + badgeH / 2);

                // Small subtext
                ctx.font = `black ${badgeH * 0.18}px Inter, sans-serif`;
                ctx.globalAlpha = 0.6;
                ctx.fillText("CVBER VERIFIED AUTHENTIC", x + badgeW / 2, y + badgeH * 0.78);
                ctx.globalAlpha = 1.0;
            }

            setDownloadUrl(canvas.toDataURL('image/png'));
            setIsProcessing(false);
        };
    };

    if (!isOpen || !file) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/90 backdrop-blur-2xl animate-in fade-in duration-500" onClick={onClose} />

            <div className="relative w-full max-w-6xl h-[85vh] bg-[#050505] rounded-[40px] shadow-[0_0_100px_rgba(0,0,0,1)] overflow-hidden flex border border-zinc-900 animate-in slide-in-from-bottom-12 duration-700">

                {/* Left: Configuration Panel */}
                <div className="w-80 bg-[#070707] border-r border-zinc-900 p-8 flex flex-col gap-10 shrink-0 overflow-y-auto">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Sparkles className="h-4 w-4 text-purple-500" />
                            <h2 className="text-xl font-black text-white tracking-tighter uppercase">Watermark</h2>
                        </div>
                        <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.2em]">Protection Suite v2.0</p>
                    </div>

                    {/* Text Input */}
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

                    {/* Style Selector */}
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

                    {/* Appearance */}
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

                    {/* Actions */}
                    <div className="mt-auto space-y-3 pt-8 border-t border-zinc-900">
                        <a
                            href={downloadUrl!}
                            download={`cvber_protected_${file.name}`}
                            className="flex items-center justify-center gap-3 py-4 bg-white text-black font-black uppercase tracking-[0.15em] text-[10px] rounded-[20px] hover:bg-zinc-200 transition-all active:scale-95 shadow-xl shadow-white/5 w-full"
                        >
                            <Download className="h-4 w-4" />
                            Secure Export
                        </a>
                        <button onClick={onClose} className="w-full py-4 text-zinc-600 font-black text-[10px] uppercase tracking-[0.2em] hover:text-zinc-400 transition-colors">
                            Dismiss
                        </button>
                    </div>
                </div>

                {/* Right: Preview Area */}
                <div className="flex-1 bg-[#09090b] relative overflow-hidden flex items-center justify-center p-12 bg-grid-white animate-scan">
                    <canvas ref={canvasRef} className="hidden" />
                    {isProcessing ? (
                        <div className="flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-500">
                            <div className="h-16 w-16 border-[6px] border-purple-500 border-t-transparent rounded-full animate-spin shadow-[0_0_30px_rgba(168,85,247,0.3)]" />
                            <p className="text-[10px] font-black text-purple-500 uppercase tracking-[0.3em] animate-pulse">Processing Vector Data</p>
                        </div>
                    ) : (
                        <div className="relative group max-h-full">
                            <div className="absolute -inset-4 bg-purple-500/10 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                            <div className="relative shadow-[0_0_80px_rgba(0,0,0,0.5)] rounded-2xl overflow-hidden border border-white/5 transition-all duration-500 group-hover:scale-[1.02]">
                                <img src={downloadUrl!} alt="Preview" className="max-h-[65vh] object-contain" />
                            </div>
                        </div>
                    )}

                    {/* Floating Info */}
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
