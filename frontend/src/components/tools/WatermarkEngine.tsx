'use client';

import { Shield, Download, X, Copy, Check, ExternalLink, Settings, Type, Grid, Layout, Square, Palette } from 'lucide-react';
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
                ctx.font = `black ${centerSize}px Inter, sans-serif`;

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
                ctx.fillStyle = color === 'white' ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.9)';
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
                ctx.font = `bold ${badgeH * 0.4}px Inter, sans-serif`;
                ctx.fillText(text, x + badgeW / 2, y + badgeH / 2);

                // Small subtext
                ctx.font = `normal ${badgeH * 0.2}px Inter, sans-serif`;
                ctx.globalAlpha = 0.7;
                ctx.fillText("VERIFIED AUTHENTIC", x + badgeW / 2, y + badgeH * 0.8);
                ctx.globalAlpha = 1.0;
            }

            setDownloadUrl(canvas.toDataURL('image/png'));
            setIsProcessing(false);
        };
    };

    const handleCopy = () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!isOpen || !file) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-white/90 backdrop-blur-xl animate-in fade-in duration-300" onClick={onClose} />

            <div className="relative w-full max-w-6xl h-[85vh] bg-white rounded-[32px] shadow-2xl overflow-hidden flex border border-gray-100 animate-in slide-in-from-bottom-8 duration-500">

                {/* Left: Configuration Panel */}
                <div className="w-80 bg-gray-50 border-r border-gray-100 p-6 flex flex-col gap-8 shrink-0 overflow-y-auto">
                    <div>
                        <h2 className="text-xl font-black text-gray-900 tracking-tight mb-1">Watermark Editor</h2>
                        <p className="text-xs text-gray-500 font-medium">Customize your protection</p>
                    </div>

                    {/* Text Input */}
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                            <Type className="h-3 w-3" /> Text Content
                        </label>
                        <input
                            type="text"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            maxLength={30}
                        />
                    </div>

                    {/* Style Selector */}
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                            <Layout className="h-3 w-3" /> Layout Style
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            <button
                                onClick={() => setStyle('grid')}
                                className={`p-2 rounded-lg border flex flex-col items-center gap-1 transition-all ${style === 'grid' ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`}
                            >
                                <Grid className="h-4 w-4" />
                                <span className="text-[10px] font-bold">Grid</span>
                            </button>
                            <button
                                onClick={() => setStyle('center')}
                                className={`p-2 rounded-lg border flex flex-col items-center gap-1 transition-all ${style === 'center' ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`}
                            >
                                <Square className="h-4 w-4" />
                                <span className="text-[10px] font-bold">Center</span>
                            </button>
                            <button
                                onClick={() => setStyle('badge')}
                                className={`p-2 rounded-lg border flex flex-col items-center gap-1 transition-all ${style === 'badge' ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`}
                            >
                                <Shield className="h-4 w-4" />
                                <span className="text-[10px] font-bold">Badge</span>
                            </button>
                        </div>
                    </div>

                    {/* Appearance */}
                    <div className="space-y-6">
                        <div className="space-y-3">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                <Palette className="h-3 w-3" /> Color Theme
                            </label>
                            <div className="flex gap-2 p-1 bg-gray-200 rounded-lg">
                                <button
                                    onClick={() => setColor('white')}
                                    className={`flex-1 py-1.5 rounded-md text-xs font-bold transition-all ${color === 'white' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    Light
                                </button>
                                <button
                                    onClick={() => setColor('black')}
                                    className={`flex-1 py-1.5 rounded-md text-xs font-bold transition-all ${color === 'black' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    Dark
                                </button>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center justify-between">
                                <span>Opacity</span>
                                <span className="text-gray-900">{opacity}%</span>
                            </label>
                            <input
                                type="range"
                                min="10"
                                max="100"
                                value={opacity}
                                onChange={(e) => setOpacity(parseInt(e.target.value))}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-auto space-y-3 pt-6 border-t border-gray-100">
                        <a
                            href={downloadUrl!}
                            download={`cvber_protected_${file.name}`}
                            className="flex items-center justify-center gap-2 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-all active:scale-95 shadow-lg shadow-gray-200 w-full"
                        >
                            <Download className="h-4 w-4" />
                            Download
                        </a>
                        <button onClick={onClose} className="w-full py-3 text-gray-500 font-bold text-sm hover:text-gray-700">
                            Cancel
                        </button>
                    </div>
                </div>

                {/* Right: Preview Area */}
                <div className="flex-1 bg-[url('https://repo.sourcelib.org/patterns/subtle-dots.png')] bg-gray-100 relative overflow-hidden flex items-center justify-center p-8">
                    <canvas ref={canvasRef} className="hidden" />
                    {isProcessing ? (
                        <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-300">
                            <div className="h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                            <p className="text-sm font-bold text-blue-600 uppercase tracking-widest">Rendering...</p>
                        </div>
                    ) : (
                        <div className="relative shadow-2xl rounded-lg overflow-hidden max-h-full transition-all duration-300">
                            <img src={downloadUrl!} alt="Preview" className="max-h-[70vh] object-contain" />
                        </div>
                    )}

                    {/* Floating Info */}
                    <div className="absolute top-6 right-6">
                        <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-white/50 text-xs font-bold text-gray-600 flex items-center gap-2">
                            <Check className="h-3 w-3 text-green-500" /> Live Preview
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
