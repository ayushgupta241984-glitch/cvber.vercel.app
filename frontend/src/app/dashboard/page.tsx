'use client';

import { useState, useEffect } from 'react';
import { FileUploader } from '@/components/dashboard/FileUploader';
import { SafeVault } from '@/components/dashboard/SafeVault';
import { SecurityMentor } from '@/components/chat/SecurityMentor';
import { ScreenshotGuard } from '@/components/security/ScreenshotGuard';
import { FileViewer } from '@/components/dashboard/FileViewer';
import { WatermarkEngine } from '@/components/tools/WatermarkEngine';
import { Shield, FileText, Award, HardDrive, Stamp, Upload, Search, Lock } from 'lucide-react';

export default function DashboardPage() {
    const [files, setFiles] = useState<any[]>([]);
    const [selectedFile, setSelectedFile] = useState<any>(null);
    const [isViewerOpen, setIsViewerOpen] = useState(false);
    const [isWatermarkOpen, setIsWatermarkOpen] = useState(false);

    // Persistence: Load from Memory
    useEffect(() => {
        const saved = localStorage.getItem('cvber_vault_memory');
        if (saved) {
            try {
                setFiles(JSON.parse(saved));
            } catch (e) {
                console.error("Memory corruption:", e);
            }
        }
    }, []);

    // Persistence: Save to Memory
    useEffect(() => {
        localStorage.setItem('cvber_vault_memory', JSON.stringify(files));
    }, [files]);

    const handleUploadComplete = (result: any, rawFile: File) => {
        const previewUrl = URL.createObjectURL(rawFile);

        const newFile = {
            id: result.scan_id,
            name: rawFile.name,
            size: rawFile.size,
            status: result.risk_report ? (result.risk_report.overall_risk_score < 30 ? 'safe' : 'warning') : 'scanning',
            riskScore: result.risk_report?.overall_risk_score,
            originalityScore: result.risk_report?.originality_score,
            isScreenshot: result.risk_report?.is_screenshot,
            forensicSummary: result.risk_report?.file_metadata?.forensic_summary,
            aiProvider: result.risk_report?.file_metadata?.ai_provider,
            aiModel: result.risk_report?.file_metadata?.ai_model,
            uploadedAt: new Date().toISOString(),
            previewUrl: previewUrl
        };

        setFiles(prev => [newFile, ...prev]);
    };

    const handleView = (file: any) => {
        setSelectedFile(file);
        setIsViewerOpen(true);
    };

    const handleWatermark = (file: any) => {
        setSelectedFile(file);
        setIsWatermarkOpen(true);
    };

    const handleDelete = (file: any) => {
        if (confirm(`Are you sure you want to delete "${file.name}"?`)) {
            setFiles(prev => prev.filter(f => f.id !== file.id));
        }
    };

    return (
        <ScreenshotGuard>
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 md:p-8 font-sans">
                <div className="w-full max-w-6xl space-y-8 animate-in fade-in duration-700 slide-in-from-bottom-4">

                    {/* Header */}
                    <header className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-4 group cursor-default">
                            <div className="bg-blue-600 p-4 rounded-2xl shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform duration-300">
                                <Shield className="h-8 w-8 text-white animate-pulse" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                                    CVBER<span className="text-blue-600">.</span>FREE
                                </h1>
                                <p className="text-sm font-medium text-gray-400 tracking-widest uppercase">
                                    Secure Asset Vault
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="flex -space-x-2 mr-4">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white" />
                                ))}
                            </div>
                            <div className="px-4 py-2 bg-white rounded-full border border-gray-100 shadow-sm text-xs font-bold text-gray-500 flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                SYSTEM ONLINE
                            </div>
                        </div>
                    </header>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { label: 'Protected Assets', value: files.length, color: 'text-blue-600' },
                            { label: 'Threats Blocked', value: '0', color: 'text-red-500' },
                            { label: 'Network Status', value: 'SECURE', color: 'text-green-600' },
                            { label: 'Blockchain Sync', value: 'LIVE', color: 'text-purple-600' },
                        ].map((stat, i) => (
                            <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{stat.label}</p>
                                <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
                            </div>
                        ))}
                    </div>

                    <div className="grid lg:grid-cols-[1fr_350px] gap-8">
                        {/* Main Vault Area */}
                        <div className="space-y-6">
                            <FileUploader onUploadComplete={handleUploadComplete} />

                            <SafeVault
                                files={files}
                                onView={handleView}
                                onWatermark={handleWatermark}
                                onDelete={handleDelete}
                            />
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            <SecurityMentor />

                            {/* Quick Actions */}
                            <div className="bg-blue-600 rounded-[32px] p-8 text-white shadow-xl shadow-blue-200 relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-800" />
                                <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />

                                <div className="relative z-10">
                                    <Lock className="h-8 w-8 mb-4 border-2 border-white/20 rounded-xl p-1.5" />
                                    <h3 className="text-xl font-bold mb-2">Enterprise Grade</h3>
                                    <p className="text-blue-100 text-sm mb-6 leading-relaxed">
                                        Upgrade to unlock advanced C2PA signing, legal logs, and batch processing.
                                    </p>
                                    <button className="w-full py-3 bg-white text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-colors text-sm">
                                        View Plans
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <FileViewer
                    file={selectedFile}
                    isOpen={isViewerOpen}
                    onClose={() => setIsViewerOpen(false)}
                    onWatermark={() => {
                        setIsViewerOpen(false);
                        setIsWatermarkOpen(true);
                    }}
                />

                <WatermarkEngine
                    file={selectedFile}
                    isOpen={isWatermarkOpen}
                    onClose={() => setIsWatermarkOpen(false)}
                />
            </div>
        </ScreenshotGuard>
    );
}
