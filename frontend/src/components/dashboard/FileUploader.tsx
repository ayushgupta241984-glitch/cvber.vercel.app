'use client';

import { useState, useCallback } from 'react';
import { Upload, FileCheck, AlertCircle } from 'lucide-react';

interface FileUploaderProps {
    onUploadComplete?: (result: any) => void;
}

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
            const formData = new FormData();
            formData.append('file', file);

            // Simulate progress
            const progressInterval = setInterval(() => {
                setProgress(prev => Math.min(prev + 10, 90));
            }, 200);

            const response = await fetch('http://localhost:8000/scan/', {
                method: 'POST',
                body: formData,
            });

            clearInterval(progressInterval);
            setProgress(100);

            if (!response.ok) {
                throw new Error('Scan failed');
            }

            const result = await response.json();

            if (onUploadComplete) {
                onUploadComplete(result);
            }

            setTimeout(() => {
                setUploading(false);
                setProgress(0);
            }, 1000);

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Upload failed');
            setUploading(false);
            setProgress(0);
        }
    };

    return (
        <div className="w-full">
            <div
                onDrop={handleDrop}
                onDragOver={(e) => {
                    e.preventDefault();
                    setDragActive(true);
                }}
                onDragLeave={() => setDragActive(false)}
                className={`
          relative border-2 border-dashed rounded-2xl p-12 transition-all duration-300
          ${dragActive
                        ? 'border-cyber-purple bg-purple-500/10 scale-105'
                        : 'border-purple-500/50 bg-black/20'
                    }
          ${uploading ? 'pointer-events-none opacity-50' : 'hover:border-purple-400 cursor-pointer'}
          backdrop-blur-xl
        `}
            >
                <input
                    type="file"
                    onChange={handleFileInput}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={uploading}
                />

                <div className="flex flex-col items-center justify-center space-y-4">
                    {uploading ? (
                        <>
                            <div className="relative">
                                <FileCheck className="h-16 w-16 text-cyber-purple animate-pulse" />
                                <div className="absolute inset-0 blur-xl bg-cyber-purple/50" />
                            </div>
                            <p className="text-xl font-semibold text-white">Scanning file...</p>
                            <div className="w-full max-w-md">
                                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-cyber-purple to-cyber-blue transition-all duration-300"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                                <p className="text-sm text-gray-400 mt-2 text-center">{progress}%</p>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="relative">
                                <Upload className="h-16 w-16 text-purple-400" />
                                <div className="absolute inset-0 blur-xl bg-purple-400/30" />
                            </div>
                            <div className="text-center">
                                <p className="text-xl font-semibold text-white mb-2">
                                    Drop files here or click to upload
                                </p>
                                <p className="text-sm text-gray-400">
                                    Maximum file size: 50MB
                                </p>
                            </div>
                        </>
                    )}
                </div>

                {error && (
                    <div className="mt-4 p-4 bg-red-500/10 border border-red-500/50 rounded-xl flex items-center gap-3">
                        <AlertCircle className="h-5 w-5 text-red-400" />
                        <p className="text-red-400">{error}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
