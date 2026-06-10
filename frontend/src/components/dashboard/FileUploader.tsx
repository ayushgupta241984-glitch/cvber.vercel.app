'use client';

import { useState, useCallback } from 'react';
import { Upload, FileCheck, AlertCircle } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { motion, AnimatePresence } from 'framer-motion';

interface FileUploaderProps {
    onUploadComplete?: (result: any, file: File) => void;
}

const easeLuxury = [0.25, 0.46, 0.45, 0.94] as const;

export function FileUploader({ onUploadComplete }: FileUploaderProps) {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [dragActive, setDragActive] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleDrop = useCallback(async (e: React.DragEvent) => {
        e.preventDefault();
        setDragActive(false);
        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            await uploadAndScan(files[0]);
        }
    }, []);

    const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            await uploadAndScan(files[0]);
        }
    };

    const uploadAndScan = async (file: File) => {
        setUploading(true);
        setError(null);
        setProgress(0);
        try {
            const progressInterval = setInterval(() => {
                setProgress(prev => Math.min(prev + 10, 90));
            }, 200);
            const result = await apiClient.scanFile(file);
            clearInterval(progressInterval);
            setProgress(100);
            if (onUploadComplete) {
                onUploadComplete(result, file);
            }
            setTimeout(() => {
                setUploading(false);
                setProgress(0);
            }, 1000);
        } catch (err) {
            const patterns = ["does not support image", "cannot read", "vision model", "image_url", "image input", "model does not support", "not a vision model", "image analysis"];
            const msg = err instanceof Error ? err.message : 'Upload failed';
            const cleaned = msg.split('\n').filter(l => !patterns.some(p => l.toLowerCase().includes(p))).join('\n').trim();
            setError(cleaned || 'Upload failed');
            setUploading(false);
            setProgress(0);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: easeLuxury }}
            className="w-full"
        >
            <div
                onDrop={handleDrop}
                onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                onDragLeave={() => setDragActive(false)}
                className={`
                    relative border transition-all duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]
                    ${dragActive
                        ? 'border-luxury-gold/60 bg-luxury-gold/5'
                        : 'border-luxury-steel/40 hover:border-luxury-gold/40 bg-luxury-deep'
                    }
                    ${uploading ? 'pointer-events-none' : 'cursor-pointer'}
                `}
            >
                <input
                    type="file"
                    onChange={handleFileInput}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={uploading}
                    aria-label="Upload artwork to scan"
                />

                <div className="flex flex-col items-center justify-center py-20 md:py-24 space-y-8">
                    <AnimatePresence mode="wait">
                        {uploading ? (
                            <motion.div
                                key="uploading"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.4, ease: easeLuxury }}
                                className="flex flex-col items-center space-y-8"
                            >
                                <motion.div
                                    animate={{ opacity: [0.5, 1, 0.5] }}
                                    transition={{ duration: 2, repeat: Infinity, ease: easeLuxury }}
                                    className="w-16 h-16 border border-luxury-gold/40 flex items-center justify-center text-luxury-gold"
                                >
                                    <FileCheck className="h-6 w-6" />
                                </motion.div>
                                <div className="text-center space-y-3">
                                    <p className="text-lg font-display text-luxury-cream">Examining Your Work</p>
                                    <p className="text-xs text-luxury-muted uppercase tracking-ultra-wide">Analysing digital provenance and authenticity markers</p>
                                </div>
                                <div className="w-full max-w-sm px-8">
                                    <div className="h-px bg-luxury-steel/50 relative overflow-hidden">
                                        <motion.div
                                            className="h-full bg-luxury-gold"
                                            initial={{ width: '0%' }}
                                            animate={{ width: `${progress}%` }}
                                            transition={{ duration: 0.3, ease: easeLuxury }}
                                        />
                                    </div>
                                    <p className="text-[10px] font-semibold text-luxury-gold/80 mt-4 text-center tracking-ultra-wide">{progress}% COMPLETE</p>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="idle"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.4, ease: easeLuxury }}
                                className="flex flex-col items-center space-y-8"
                            >
                                <div className="w-16 h-16 border border-luxury-steel/40 flex items-center justify-center text-luxury-muted/40 transition-all duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] hover:border-luxury-gold/40 hover:text-luxury-gold/60">
                                    <Upload className="h-6 w-6" />
                                </div>
                                <div className="text-center space-y-3">
                                    <p className="text-lg font-display text-luxury-cream">
                                        Submit Your Creation
                                    </p>
                                    <p className="text-xs text-luxury-muted uppercase tracking-ultra-wide max-w-xs mx-auto leading-relaxed">
                                        Present your work for analysis and permanent safeguarding
                                    </p>
                                    <p className="text-[10px] text-luxury-muted/50 uppercase tracking-widest">
                                        Originals up to 50MB
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.4, ease: easeLuxury }}
                            className="overflow-hidden"
                        >
                            <div className="px-8 pb-8">
                                <div className="flex items-center gap-3 py-4 border-t border-luxury-steel/30" role="alert">
                                    <AlertCircle className="h-4 w-4 text-luxury-gold/80 shrink-0" />
                                    <p className="text-luxury-gold/80 text-xs uppercase tracking-wider">{error}</p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}
