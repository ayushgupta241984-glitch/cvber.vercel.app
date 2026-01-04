'use client';

import { Shield, Download, X, Copy, Check, ExternalLink } from 'lucide-react';
import { useRef, useEffect, useState } from 'react';

interface WatermarkEngineProps {
    file: {
        name: string;
        previewUrl: string;
    } | null;
    isOpen: boolean;
    onClose: () => void;
}

export function WatermarkEngine({ file, isOpen, onClose }: WatermarkEngineProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(true);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!isOpen || !file || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

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

            // Calculate font size based on image width (e.g., 2% of width)
            const fontSize = Math.max(20, Math.floor(canvas.width * 0.04));

            // Draw many watermarks (Grid pattern)
            ctx.font = `bold ${fontSize}px Inter, sans-serif`;
            ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
            ctx.textAlign = "center";

            const spacing = fontSize * 5;
            for (let x = 0; x < canvas.width + spacing; x += spacing) {
                for (let y = 0; y < canvas.height + spacing; y += spacing) {
                    ctx.save();
                    ctx.translate(x, y);
                    ctx.rotate(-Math.PI / 4);
                    ctx.fillText("CVBER PROTECTED", 0, 0);
                    ctx.restore();
                }
            }

            // Draw Main Badge at Bottom Right
            const badgeWidth = canvas.width * 0.25;
            const badgeHeight = badgeWidth * 0.3;
            const margin = 20;

            ctx.fillStyle = "rgba(10, 10, 10, 0.8)";
            roundRect(ctx, canvas.width - badgeWidth - margin, canvas.height - badgeHeight - margin, badgeWidth, badgeHeight, 10);
            ctx.fill();

            ctx.fillStyle = "white";
            ctx.font = `bold ${Math.floor(badgeHeight * 0.4)}px Inter, sans-serif`;
            ctx.textAlign = "center";
            ctx.fillText("CVBER PROTECTED", canvas.width - (badgeWidth / 2) - margin, canvas.height - (badgeHeight / 2) - margin + 5);

            setDownloadUrl(canvas.toDataURL('image/png'));
            setIsProcessing(false);
        };
    }, [isOpen, file]);

    function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    }

    const handleCopy = () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!isOpen || !file) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-white/80 backdrop-blur-xl animate-in fade-in duration-300" onClick={onClose} />

            <div className="relative w-full max-w-4xl bg-white rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-blue-100 animate-in slide-in-from-bottom-8 duration-500">
                <div className="p-8 pb-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Watermark Applied</h2>
                        <p className="text-gray-500 font-medium">Your protected file is ready for the web</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X className="h-6 w-6 text-gray-400" />
                    </button>
                </div>

                <div className="flex-1 overflow-auto p-8 space-y-8">
                    <div className="relative aspect-video bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden">
                        <canvas ref={canvasRef} className="hidden" />
                        {isProcessing ? (
                            <div className="flex flex-col items-center gap-4">
                                <Shield className="h-10 w-10 text-blue-600 animate-pulse" />
                                <p className="text-sm font-bold text-blue-600 uppercase tracking-widest">Burning Pixel Seal...</p>
                            </div>
                        ) : (
                            <img src={downloadUrl!} alt="Watermarked" className="max-w-full max-h-full shadow-2xl" />
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <a
                            href={downloadUrl!}
                            download={`cvber_protected_${file.name}`}
                            className="flex items-center justify-center gap-3 py-4 bg-gray-900 text-white font-bold rounded-2xl hover:bg-black transition-all active:scale-95"
                        >
                            <Download className="h-5 w-5" />
                            Download Protected Image
                        </a>
                        <button
                            onClick={handleCopy}
                            className="flex items-center justify-center gap-3 py-4 bg-blue-50 text-blue-700 font-bold rounded-2xl hover:bg-blue-100 transition-all active:scale-95 border border-blue-100"
                        >
                            {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                            {copied ? 'Copied Link' : 'Copy Registry Link'}
                        </button>
                    </div>

                    <div className="p-6 bg-blue-600 rounded-3xl text-white shadow-xl shadow-blue-200">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-white/20 rounded-xl">
                                <ExternalLink className="h-6 w-6" />
                            </div>
                            <div>
                                <h4 className="font-bold text-lg mb-1">Place on the Web</h4>
                                <p className="text-blue-50 text-sm opacity-90 leading-relaxed">
                                    This image now contains a "Visible Proof of Ownership". When people see this watermark, they know it's verified in the CVBER Registry.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
