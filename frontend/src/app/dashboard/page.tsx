'use client';

import { useState } from 'react';
import { FileUploader } from '@/components/dashboard/FileUploader';
import { SafeVault } from '@/components/dashboard/SafeVault';
import { SecurityMentor } from '@/components/chat/SecurityMentor';
import { FileViewer } from '@/components/dashboard/FileViewer';
import { WatermarkEngine } from '@/components/tools/WatermarkEngine';
import { Shield, FileText, Award, HardDrive, Stamp, Upload, Search } from 'lucide-react';

export default function DashboardPage() {
    const [files, setFiles] = useState<any[]>([]);
    const [selectedFile, setSelectedFile] = useState<any>(null);
    const [isViewerOpen, setIsViewerOpen] = useState(false);
    const [isWatermarkOpen, setIsWatermarkOpen] = useState(false);

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

    return (
        <div className="bg-gray-50/50 min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {/* Welcome Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Dashboard</h1>
                        <p className="text-gray-500 font-medium">Manage and protect your creative work</p>
                    </div>
                    <a href="#upload" className="btn-primary flex items-center gap-2 self-start md:self-center py-3">
                        <Upload className="w-5 h-5" />
                        Upload New File
                    </a>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {[
                        { label: 'Total Files', value: files.length.toString(), icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
                        { label: 'Certificates', value: files.filter(f => f.status === 'safe').length.toString(), icon: Award, color: 'text-purple-600', bg: 'bg-purple-50' },
                        { label: 'Storage Used', value: (files.reduce((acc, f) => acc + f.size, 0) / (1024 * 1024)).toFixed(1) + ' MB', icon: HardDrive, color: 'text-green-600', bg: 'bg-green-50' },
                        { label: 'Original Content', value: files.filter(f => !f.isScreenshot).length.toString(), icon: Stamp, color: 'text-orange-600', bg: 'bg-orange-50' }
                    ].map((stat, idx) => (
                        <div key={idx} className="card p-6 flex items-center gap-5 translate-y-0 hover:-translate-y-1 transition-all duration-300">
                            <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
                                <p className="text-2xl font-black text-gray-900">{stat.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid lg:grid-cols-3 gap-10">
                    {/* Left: Main Content */}
                    <div className="lg:col-span-2 space-y-12">
                        {/* Upload Section */}
                        <section id="upload" className="scroll-mt-32">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                                    <div className="w-2 h-8 bg-blue-600 rounded-full" />
                                    Protect New Work
                                </h2>
                                <span className="px-4 py-1.5 bg-blue-50 text-blue-600 text-[11px] font-bold uppercase tracking-widest rounded-full border border-blue-100">Live AI Scan</span>
                            </div>
                            <FileUploader onUploadComplete={handleUploadComplete} />
                        </section>

                        {/* File Inventory */}
                        <section>
                            <div className="flex items-center justify-between mb-8">
                                <div className="relative flex-1 max-w-md">
                                    <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        placeholder="Search your private vault..."
                                        className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm"
                                    />
                                </div>
                            </div>
                            <SafeVault
                                files={files}
                                onView={handleView}
                                onWatermark={handleWatermark}
                            />
                        </section>
                    </div>

                    {/* Right: Security Help / Mentor */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-10">
                            <SecurityMentor context={{ files }} />

                            <div className="mt-8 p-6 bg-white rounded-[32px] border border-gray-100 shadow-sm">
                                <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <Shield className="h-4 w-4 text-blue-600" />
                                    Security Tip
                                </h4>
                                <p className="text-sm text-gray-500 leading-relaxed">
                                    Always use the **CVBER Watermark** before sharing your original assets on social media. It creates a cryptographic link back to your vault.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
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
    );
}
