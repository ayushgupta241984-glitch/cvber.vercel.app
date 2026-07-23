'use client';

import { useState, useCallback, useRef } from 'react';
import { Upload, FileCheck, AlertCircle } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { motion, AnimatePresence } from 'framer-motion';

const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif', 'image/bmp', 'image/tiff'];
const MAX_SIZE = 50 * 1024 * 1024;

interface FileUploaderProps {
    onUploadComplete?: (result: any, file: File) => void;
}

export function FileUploader({ onUploadComplete }: FileUploaderProps) {
    const [phase, setPhase] = useState<'idle' | 'uploading' | 'processing'>('idle');
    const [dragActive, setDragActive] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const validateFile = (file: File): string | null => {
        if (!ACCEPTED_TYPES.includes(file.type) && !file.name.match(/\.(png|jpe?g|webp|gif|bmp|tiff?)$/i)) {
            return 'Only image files under 50MB are accepted';
        }
        if (file.size > MAX_SIZE) {
            return 'Only image files under 50MB are accepted';
        }
        return null;
    };

    const handleDrop = useCallback(async (e: React.DragEvent) => {
        e.preventDefault();
        setDragActive(false);
        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            const validationError = validateFile(files[0]);
            if (validationError) {
                setError(validationError);
                return;
            }
            await uploadAndScan(files[0]);
        }
    }, []);

    const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            const validationError = validateFile(files[0]);
            if (validationError) {
                setError(validationError);
                return;
            }
            await uploadAndScan(files[0]);
        }
    };

    const uploadAndScan = async (file: File) => {
        setPhase('uploading');
        setError(null);
        try {
            const result = await apiClient.scanFile(file);
            setPhase('processing');
            if (onUploadComplete) {
                onUploadComplete(result, file);
            }
            setTimeout(() => {
                setPhase('idle');
            }, 1000);
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Upload failed';
            setError(msg);
            setPhase('idle');
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="w-full"
        >
            <div
                onDrop={handleDrop}
                onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                onDragLeave={() => setDragActive(false)}
                className={`
                    relative border border-[var(--border)] transition-all duration-200
                    ${dragActive ? 'border-[var(--accent)] bg-[var(--accent)]' : 'hover:border-[var(--border-hover)]'}
                    ${phase !== 'idle' ? 'pointer-events-none' : 'cursor-pointer'}
                `}
                style={{ borderRadius: 'var(--radius)', padding: '80px 32px' }}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileInput}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={phase !== 'idle'}
                    aria-label="Upload artwork to scan"
                />

                <div className="flex flex-col items-center justify-center space-y-8">
                    <AnimatePresence mode="wait">
                        {phase !== 'idle' ? (
                            <motion.div
                                key="uploading"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.4 }}
                                className="flex flex-col items-center space-y-8"
                            >
                                <motion.div
                                    animate={{ opacity: [0.3, 0.5, 0.3] }}
                                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                                    className="w-16 h-16 border border-[var(--border)] flex items-center justify-center"
                                    style={{ borderRadius: 'var(--radius)' }}
                                >
                                    <FileCheck className="h-6 w-6" style={{ color: 'var(--text-tertiary)' }} />
                                </motion.div>
                                <div className="text-center space-y-3">
                                    <p style={{ fontSize: '14px', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '+0.02em' }}>
                                        {phase === 'uploading' ? 'Uploading...' : 'Processing...'}
                                    </p>
                                </div>
                                <div className="w-full max-w-sm px-8">
                                    <div className="h-[2px] bg-[var(--border)] relative overflow-hidden" style={{ borderRadius: '1px' }}>
                                        <div
                                            className="absolute top-0 left-0 h-full bg-white/20 animate-indeterminate"
                                            style={{ borderRadius: '1px' }}
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="idle"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.4 }}
                                className="flex flex-col items-center space-y-8"
                            >
                                <div className="w-16 h-16 border border-[var(--border)] flex items-center justify-center transition-colors duration-200 hover:border-[var(--border-hover)]" style={{ borderRadius: 'var(--radius)' }}>
                                    <Upload className="h-6 w-6" style={{ color: 'var(--text-quaternary)' }} />
                                </div>
                                <div className="text-center space-y-3">
                                    <p style={{ fontSize: '14px', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '+0.02em' }}>
                                        Submit Your Creation
                                    </p>
                                    <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', letterSpacing: '+0.01em', lineHeight: '1.6' }}>
                                        Drag and drop, or click to select
                                    </p>
                                    <p style={{ fontSize: '10px', color: 'var(--text-quaternary)', letterSpacing: '+0.08em', textTransform: 'uppercase' }}>
                                        Images up to 50MB
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
                            transition={{ duration: 0.4 }}
                            className="overflow-hidden"
                        >
                            <div className="px-8 pb-8">
                                <div className="flex items-center gap-3 py-4 border-t border-[var(--border)]" role="alert">
                                    <AlertCircle className="h-4 w-4 shrink-0" style={{ color: 'var(--text-secondary)' }} />
                                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', letterSpacing: '+0.01em' }}>{error}</p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}
