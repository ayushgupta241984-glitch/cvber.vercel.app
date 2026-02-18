'use client';

import { useState, useEffect } from 'react';
import { FileUploader } from '@/components/dashboard/FileUploader';
import { SafeVault } from '@/components/dashboard/SafeVault';
import { SecurityMentor } from '@/components/chat/SecurityMentor';
import { ScreenshotGuard } from '@/components/security/ScreenshotGuard';
import { FileViewer } from '@/components/dashboard/FileViewer';
import { WatermarkEngine } from '@/components/tools/WatermarkEngine';
import { Shield, FileText, Award, HardDrive, Stamp, Upload, Search, Lock, Bot, Hash } from 'lucide-react';
import { BlockchainStatus } from '@/components/enforcement/BlockchainStatus';

export default function DashboardPage() {
    const [activeTab, setActiveTab] = useState<'ai' | 'blockchain'>('ai');
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

    const handleUploadComplete = async (result: any, rawFile: File) => {
        const previewUrl = URL.createObjectURL(rawFile);

        // Compute SHA-256 hash of the file
        const arrayBuffer = await rawFile.arrayBuffer();
        const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const fileHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        const newFile = {
            id: result.scan_id,
            name: rawFile.name,
            size: rawFile.size,
            hash: fileHash, // Store the hash
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

        // Create blockchain timestamp
        try {
            const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
            const response = await fetch(`${backendUrl}/api/enforcement/blockchain/timestamp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    asset_name: rawFile.name,
                    file_hash: fileHash
                })
            });

            if (response.ok) {
                const proofData = await response.json();

                // Save proof to blockchain proofs storage
                const existingProofs = JSON.parse(localStorage.getItem('cvber_blockchain_proofs') || '[]');
                existingProofs.unshift({
                    proof_id: proofData.proof?.proof_id,
                    asset_name: rawFile.name,
                    asset_hash: fileHash,
                    timestamp: new Date().toISOString(),
                    blockchain: 'bitcoin',
                    status: proofData.proof?.status || 'pending',
                    verification_url: `${window.location.origin}/verify/${fileHash}`
                });
                localStorage.setItem('cvber_blockchain_proofs', JSON.stringify(existingProofs));

                // Force re-render of BlockchainStatus
                window.dispatchEvent(new Event('blockchain-update'));
            }
        } catch (error) {
            console.error('Blockchain timestamp failed:', error);
        }
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
            <div className="min-h-screen bg-[#0A0A0F] text-white flex flex-col p-4 md:p-8 font-sans">
                <div className="w-full max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">

                    {/* Header */}
                    <header className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-zinc-900 pb-8">
                        <div className="flex items-center gap-4 group cursor-default">
                            <div className="bg-purple-600 p-3 rounded-2xl shadow-lg shadow-purple-900/40">
                                <Shield className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-black text-white tracking-tight">
                                    CVBER<span className="text-purple-500">.</span>HUB
                                </h1>
                                <p className="text-[10px] font-bold text-zinc-500 tracking-[0.2em] uppercase">
                                    Professional Security Command
                                </p>
                            </div>
                        </div>

                        {/* Hub Switcher */}
                        <div className="flex p-1 bg-zinc-900/50 border border-zinc-800 rounded-2xl">
                            <button
                                onClick={() => setActiveTab('ai')}
                                className={`flex items-center gap-3 px-6 py-2.5 rounded-xl transition-all font-bold text-sm ${activeTab === 'ai' ? 'bg-purple-600 text-white shadow-lg' : 'text-zinc-500 hover:text-white'}`}
                            >
                                <Bot className="w-4 h-4" />
                                AI Hub
                            </button>
                            <button
                                onClick={() => setActiveTab('blockchain')}
                                className={`flex items-center gap-3 px-6 py-2.5 rounded-xl transition-all font-bold text-sm ${activeTab === 'blockchain' ? 'bg-orange-600 text-white shadow-lg' : 'text-zinc-500 hover:text-white'}`}
                            >
                                <Hash className="w-4 h-4" />
                                Blockchain Hub
                            </button>
                        </div>
                    </header>

                    {activeTab === 'ai' ? (
                        <div className="grid lg:grid-cols-[1fr_400px] gap-8">
                            {/* AI Protection & Tracking Center */}
                            <div className="space-y-6">
                                <div className="p-8 rounded-[32px] bg-zinc-900/30 border border-zinc-800/50 backdrop-blur-xl">
                                    <div className="flex items-center justify-between mb-8">
                                        <div>
                                            <h2 className="text-2xl font-bold mb-1">AI Intelligence Desk</h2>
                                            <p className="text-zinc-500 text-sm">Real-time threat monitoring and image tracking</p>
                                        </div>
                                        <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
                                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                                            <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest">Tracking Active</span>
                                        </div>
                                    </div>

                                    <FileUploader onUploadComplete={handleUploadComplete} />

                                    <div className="mt-8 border-t border-zinc-800 pt-8">
                                        <SafeVault
                                            files={files}
                                            onView={handleView}
                                            onWatermark={handleWatermark}
                                            onDelete={handleDelete}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Sidebar - Dedicated AI Mentor */}
                            <div className="space-y-6">
                                <SecurityMentor context={{ files }} />

                                <div className="p-6 rounded-3xl bg-gradient-to-br from-purple-600/10 to-transparent border border-purple-500/20">
                                    <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
                                        <Search className="w-4 h-4 text-purple-400" />
                                        Advanced Tracking
                                    </h3>
                                    <p className="text-zinc-400 text-xs leading-relaxed">
                                        Ask the mentor to "Search for unauthorized use" of your protected work. Our AI scans millions of auction sites, portfolios, and AI training sets.
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="grid lg:grid-cols-[1fr_400px] gap-8">
                            {/* Blockchain Ledger Area */}
                            <div className="space-y-6">
                                <div className="p-8 rounded-[32px] bg-zinc-900/30 border border-zinc-800/50 backdrop-blur-xl">
                                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                                        <Lock className="w-6 h-6 text-orange-500" />
                                        Immutable Ownership Ledger
                                    </h2>
                                    <p className="text-zinc-400 mb-8 max-w-2xl">
                                        Your work is cryptographically anchored to the Bitcoin blockchain via OP_RETURN. This creates a permanent, legally recognizable proof of existence timestamp.
                                    </p>

                                    <div className="grid md:grid-cols-2 gap-4 mb-8">
                                        <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800">
                                            <p className="text-[10px] font-bold text-orange-500 uppercase tracking-widest mb-2">Network Status</p>
                                            <p className="text-xl font-bold">Mainnet Connected</p>
                                        </div>
                                        <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800">
                                            <p className="text-[10px] font-bold text-orange-500 uppercase tracking-widest mb-2">Total Proofs</p>
                                            <p className="text-xl font-bold">{files.length} Anchors</p>
                                        </div>
                                    </div>

                                    {/* Placeholder for Historical Proofs component */}
                                    <div className="p-12 border-2 border-dashed border-zinc-800 rounded-3xl text-center">
                                        <Hash className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                                        <p className="text-zinc-500 font-medium">Select an asset from the vault to view blockchain proof history</p>
                                    </div>
                                </div>
                            </div>

                            {/* Sidebar - Blockchain Info */}
                            <div className="space-y-6">
                                <BlockchainStatus />
                                <div className="p-8 rounded-3xl bg-orange-600 shadow-xl shadow-orange-900/20 text-white">
                                    <h3 className="text-xl font-bold mb-2">Legal Admissibility</h3>
                                    <p className="text-orange-100 text-sm leading-relaxed mb-6">
                                        Download certified legal logs that combine your C2PA manifest with blockchain transaction hashes for court-ready evidence.
                                    </p>
                                    <button className="w-full py-3 bg-white text-orange-600 font-bold rounded-xl hover:bg-orange-50 transition-colors text-sm">
                                        Download Log Template
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
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
