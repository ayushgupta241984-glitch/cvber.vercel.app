'use client';

import { useState } from 'react';
import { FileUploader } from '@/components/dashboard/FileUploader';
import { SafeVault } from '@/components/dashboard/SafeVault';
import { SecurityMentor } from '@/components/chat/SecurityMentor';
import { Shield, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
    const [files, setFiles] = useState<any[]>([]);

    const handleUploadComplete = (result: any) => {
        const newFile = {
            id: result.scan_id,
            name: 'uploaded-file.pdf', // You'd get this from the upload
            size: 1024 * 50, // Example size
            status: result.risk_report ? 'safe' : 'scanning',
            riskScore: result.risk_report?.overall_risk_score,
            uploadedAt: new Date().toISOString(),
        };

        setFiles(prev => [newFile, ...prev]);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-cyber-darker via-cyber-dark to-purple-950/20">
            {/* Header */}
            <header className="border-b border-white/10 bg-black/20 backdrop-blur-xl sticky top-0 z-50">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                                <ArrowLeft className="h-6 w-6" />
                            </Link>
                            <div className="flex items-center gap-3">
                                <Shield className="h-8 w-8 text-cyber-purple" />
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-cyber-purple to-cyber-blue bg-clip-text text-transparent">
                                    CVBER Free
                                </h1>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <p className="text-sm text-gray-400">Welcome back</p>
                                <p className="text-white font-semibold">User</p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyber-purple to-cyber-blue flex items-center justify-center text-white font-bold">
                                U
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-8">
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left Column - Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Upload Section */}
                        <section>
                            <h2 className="text-2xl font-bold text-white mb-6">Upload & Scan</h2>
                            <FileUploader onUploadComplete={handleUploadComplete} />
                        </section>

                        {/* Safe Vault */}
                        <section>
                            <SafeVault files={files} />
                        </section>
                    </div>

                    {/* Right Column - AI Mentor */}
                    <div className="lg:col-span-1">
                        <SecurityMentor />
                    </div>
                </div>
            </div>

            {/* Background Effects */}
            <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyber-purple/10 rounded-full blur-3xl animate-pulse-slow" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyber-blue/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
            </div>
        </div>
    );
}
