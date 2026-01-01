'use client';

import { useState, useCallback } from 'react';
import { Upload, FileCheck, AlertCircle } from 'lucide-react';
import { apiClient } from '@/lib/api-client';

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
            // Simulate progress
            const progressInterval = setInterval(() => {
                setProgress(prev => Math.min(prev + 10, 90));
            }, 200);

            const result = await apiClient.scanFile(file);

            clearInterval(progressInterval);
            setProgress(100);

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
          relative border-2 border-dashed rounded-3xl p-16 transition-all duration-300
          ${dragActive
                        ? 'border-blue-600 bg-blue-50 scale-[1.01]'
                        : 'border-gray-200 bg-white hover:border-blue-400 hover:bg-gray-50/50'
                    }
          ${uploading ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
        `}
            >
                <input
                    type="file"
                    onChange={handleFileInput}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={uploading}
                />

                <div className="flex flex-col items-center justify-center space-y-6">
                    {uploading ? (
                        <>
                            <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 relative overflow-hidden">
                                <FileCheck className="h-10 w-10 relative z-10" />
                                <div className="absolute inset-0 bg-blue-600/10 animate-pulse" />
                            </div>
                            <div className="text-center">
                                <p className="text-xl font-bold text-gray-900 mb-2">Analyzing your file...</p>
                                <p className="text-sm text-gray-500">Checking for threats and origin data</p>
                            </div>
                            <div className="w-full max-w-xs">
                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-blue-600 transition-all duration-300 shadow-sm shadow-blue-200"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                                <p className="text-xs font-bold text-blue-600 mt-3 text-center tracking-widest">{progress}% COMPLETE</p>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:text-blue-600 group-hover:bg-blue-50 transition-colors">
                                <Upload className="h-10 w-10" />
                            </div>
                            <div className="text-center">
                                <p className="text-xl font-bold text-gray-900 mb-2">
                                    Drop your file here
                                </p>
                                <p className="text-sm text-gray-500 font-medium max-w-xs mx-auto">
                                    or click to browse your computer. Maximum file size: 50MB.
                                </p>
                            </div>
                        </>
                    )}
                </div>

                {error && (
                    <div className="mt-8 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 animate-shake">
                        <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
                        <p className="text-red-600 text-sm font-semibold">{error}</p>
                    </div>
                )}
            </div>
        </div>
    );
}

