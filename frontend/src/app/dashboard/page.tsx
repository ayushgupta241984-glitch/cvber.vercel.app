'use client';

import { useState, useEffect, useCallback } from 'react';
import { FileUploader } from '@/components/dashboard/FileUploader';
import { SafeVault } from '@/components/dashboard/SafeVault';
import { SecurityMentor } from '@/components/chat/SecurityMentor';
import { ScreenshotGuard } from '@/components/security/ScreenshotGuard';
import { FileViewer } from '@/components/dashboard/FileViewer';
import { WatermarkEngine } from '@/components/tools/WatermarkEngine';
import { BlockchainStatus } from '@/components/enforcement/BlockchainStatus';
import { apiClient, BASE_URL } from '@/lib/api-client';
import { LayoutGrid, Shield, FileText, Award, HardDrive, Stamp, Upload, Search, Lock, Bot, Hash, Layout, Zap, Activity, Settings, LogOut, ChevronRight, ArrowUpRight, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FileData {
    id: string;
    name: string;
    size: number;
    hash?: string;
    status: 'safe' | 'warning' | 'scanning' | 'danger';
    riskScore?: number;
    originalityScore?: number;
    isScreenshot?: boolean;
    forensicSummary?: string;
    aiProvider?: string;
    aiModel?: string;
    uploadedAt: string;
    previewUrl?: string;
    storageUrl?: string;  // Signed URL from backend storage
}

interface UploadResult {
    scan_id: string;
    risk_report?: {
        overall_risk_score: number;
        originality_score: number;
        is_screenshot: boolean;
        file_metadata?: {
            forensic_summary: string;
            ai_provider: string;
            ai_model: string;
        };
    };
    storage_url?: string;  // Signed URL for the stored file
}

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
};

export default function DashboardPage() {
    const [activeTab, setActiveTab] = useState<'ai' | 'blockchain'>('ai');
    const [files, setFiles] = useState<FileData[]>([]);
    const [selectedFile, setSelectedFile] = useState<FileData | null>(null);
    const [isViewerOpen, setIsViewerOpen] = useState(false);
    const [isWatermarkOpen, setIsWatermarkOpen] = useState(false);

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [user, setUser] = useState<{ full_name: string } | null>(null);

    // Persistence: Load from Memory + Backend Vault
    useEffect(() => {
        const saved = localStorage.getItem('cvber_vault_memory');
        if (saved) {
            try {
                setFiles(JSON.parse(saved));
            } catch (e) {
                console.error("Memory corruption:", e);
            }
        }

        // Load user profile
        const cachedName = localStorage.getItem('user_full_name');
        if (cachedName) {
            setUser({ full_name: cachedName });
        }

        const fetchProfile = async () => {
            const token = localStorage.getItem('access_token');
            if (token) {
                try {
                    const response = await fetch(`${BASE_URL}/auth/me`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (response.ok) {
                        const profile = await response.json();
                        setUser(profile);
                        if (profile.full_name) {
                            localStorage.setItem('user_full_name', profile.full_name);
                        }
                    }
                } catch (err) {
                    console.error("Profile fetch failed:", err);
                }
            }
        };
        fetchProfile();

        // Fetch vault files from backend
        const fetchVault = async () => {
            try {
                const vault = await apiClient.listVaultFiles(100, 0);
                if (vault.files && vault.files.length > 0) {
                    const vaultFiles: FileData[] = vault.files.map((f: any) => ({
                        id: f.scan_id,
                        name: f.file_name,
                        size: f.file_size,
                        status: f.risk_score !== null
                            ? (f.risk_score < 30 ? 'safe' : f.risk_score < 70 ? 'warning' : 'danger')
                            : 'safe',
                        riskScore: f.risk_score,
                        originalityScore: f.originality_score,
                        isScreenshot: f.is_screenshot,
                        uploadedAt: f.created_at,
                        storageUrl: f.storage_url,
                        previewUrl: f.storage_url || undefined,
                    }));
                    setFiles(prev => {
                        const existingIds = new Set(prev.map(p => p.id));
                        const merged = [...prev];
                        for (const vf of vaultFiles) {
                            if (!existingIds.has(vf.id)) {
                                merged.push(vf);
                            }
                        }
                        return merged;
                    });
                }
            } catch (err) {
                console.error("Failed to fetch vault files:", err);
            }
        };
        fetchVault();
    }, []);

    // Persistence: Save to Memory
    useEffect(() => {
        localStorage.setItem('cvber_vault_memory', JSON.stringify(files));
    }, [files]);

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_full_name');
        window.location.href = '/';
    };

    const handleUploadComplete = async (result: UploadResult, rawFile: File) => {
        const previewUrl = result.storage_url || URL.createObjectURL(rawFile);

        // Compute SHA-256 hash of the file
        const arrayBuffer = await rawFile.arrayBuffer();
        const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const fileHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        const status: 'safe' | 'warning' | 'scanning' | 'danger' = result.risk_report
            ? (result.risk_report.overall_risk_score < 30 ? 'safe' : result.risk_report.overall_risk_score < 70 ? 'warning' : 'danger')
            : 'scanning';

        const newFile: FileData = {
            id: result.scan_id,
            name: rawFile.name,
            size: rawFile.size,
            hash: fileHash,
            status,
            riskScore: result.risk_report?.overall_risk_score,
            originalityScore: result.risk_report?.originality_score,
            isScreenshot: result.risk_report?.is_screenshot,
            forensicSummary: result.risk_report?.file_metadata?.forensic_summary,
            aiProvider: result.risk_report?.file_metadata?.ai_provider,
            aiModel: result.risk_report?.file_metadata?.ai_model,
            uploadedAt: new Date().toISOString(),
            previewUrl: previewUrl,
            storageUrl: result.storage_url
        };

        setFiles(prev => [newFile, ...prev]);

        // Create blockchain timestamp
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch(`${BASE_URL}/api/enforcement/blockchain/timestamp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify({
                    asset_name: rawFile.name,
                    file_hash: fileHash
                })
            });

            if (response.ok) {
                const proofData = await response.json();
                console.log('Blockchain timestamp created:', proofData);

                // Force re-render of BlockchainStatus by dispatching event
                window.dispatchEvent(new Event('blockchain-update'));
            } else {
                console.error('Blockchain timestamp failed:', response.status);
            }
        } catch (error) {
            console.error('Blockchain timestamp failed:', error);
        }
    };

    const handleView = (file: FileData) => {
        setSelectedFile(file);
        setIsViewerOpen(true);
        if (window.innerWidth < 1024) setIsSidebarOpen(false);
    };

    const handleWatermark = (file: FileData) => {
        setSelectedFile(file);
        setIsWatermarkOpen(true);
        if (window.innerWidth < 1024) setIsSidebarOpen(false);
    };

    const handleDelete = async (file: FileData) => {
        if (!confirm(`Delete "${file.name}" from vault?`)) return;
        try {
            await apiClient.deleteVaultFile(file.id);
        } catch (err) {
            console.error("Failed to delete from backend:", err);
        }
        setFiles(prev => prev.filter(f => f.id !== file.id));
    };

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: Layout },
        { id: 'settings', label: 'Settings', icon: Settings },
    ];

    return (
        <ScreenshotGuard>
            <div className="min-h-screen bg-[#050505] text-white flex font-sans selection:bg-purple-500/30 overflow-x-hidden">
                {/* Mobile Backdrop */}
                {isSidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-all duration-300"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}

                {/* Sidebar */}
                <aside className={`w-72 border-r border-zinc-900 flex flex-col fixed inset-y-0 left-0 bg-[#070707] z-50 transition-transform duration-300 ease-in-out lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    <div className="p-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                                    <Shield className="h-5 w-5 text-black" />
                                </div>
                                <span className="text-xl font-black tracking-tighter">ANTIGRAVITY</span>
                            </div>
                            <button 
                                type="button"
                                onClick={() => setIsSidebarOpen(false)}
                                className="lg:hidden p-2 text-zinc-500 hover:text-white transition-colors"
                                title="Close sidebar"
                            >
                                <ChevronRight className="w-5 h-5 rotate-180" />
                            </button>
                        </div>
                    </div>

                    <nav className="flex-1 px-4 space-y-1">
                        {navItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => {
                                    if (window.innerWidth < 1024) setIsSidebarOpen(false);
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold text-sm ${item.id === 'dashboard' ? 'bg-zinc-900 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                            >
                                <item.icon className="w-4 h-4" />
                                {item.label}
                            </button>
                        ))}
                    </nav>

                    <div className="p-4 border-t border-zinc-900 space-y-4">
                        {user && (
                            <div className="flex items-center gap-3 px-4 py-2 bg-white/5 rounded-2xl border border-white/10">
                                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-xs font-black text-white shadow-xl shadow-purple-500/20 border border-white/10">
                                    {user.full_name ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
                                </div>
                                <div className="flex flex-col overflow-hidden">
                                    <span className="text-sm font-bold text-white truncate tracking-tight">{user.full_name || 'User'}</span>
                                    <span className="text-[9px] font-black uppercase tracking-widest text-purple-500/80 leading-none mt-0.5">Verified Artist</span>
                                </div>
                            </div>
                        )}
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-500 hover:text-red-400 hover:bg-red-500/5 font-semibold text-sm transition-all"
                        >
                            <LogOut className="w-4 h-4" />
                            Log Out
                        </button>
                    </div>
                </aside>

                <main className="flex-1 lg:ml-72 p-6 md:p-10 max-w-7xl mx-auto space-y-12 transition-all duration-700">
                    {/* Header Strip */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 md:mb-16">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 lg:hidden">
                                <button
                                    onClick={() => setIsSidebarOpen(true)}
                                    className="p-2 -ml-2 rounded-xl bg-zinc-900/50 border border-zinc-800 text-white"
                                >
                                    <Layout className="w-5 h-5" />
                                </button>
                                <div className="flex items-center gap-2">
                                    <Shield className="h-5 w-5 text-white" />
                                    <span className="text-sm font-black tracking-tighter">ANTIGRAVITY</span>
                                </div>
                            </div>
                        </div>

                        <motion.div variants={itemVariants}>
                            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-zinc-800 bg-zinc-900/50 text-[10px] uppercase tracking-widest text-zinc-400 mb-4 transition-all hover:border-zinc-700">
                                <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                                <span>System Live: 24.8M Assets Protected</span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
                                Asset Protection <span className="text-zinc-500">Dashboard.</span>
                            </h1>
                        </motion.div>

                        {/* Hub Switcher */}
                        <div className="flex p-1.5 bg-zinc-900/50 border border-zinc-800 rounded-2xl backdrop-blur-xl self-start md:self-auto">
                            <button
                                onClick={() => setActiveTab('ai')}
                                className={`flex items-center gap-2.5 px-4 md:px-6 py-2 rounded-xl transition-all font-bold text-[10px] md:text-xs uppercase tracking-widest ${activeTab === 'ai' ? 'bg-white text-black shadow-xl shadow-white/5' : 'text-zinc-500 hover:text-white'}`}
                            >
                                <Bot className="w-3.5 h-3.5" />
                                AI Hub
                            </button>
                            <button
                                onClick={() => setActiveTab('blockchain')}
                                className={`flex items-center gap-2.5 px-4 md:px-6 py-2 rounded-xl transition-all font-bold text-[10px] md:text-xs uppercase tracking-widest ${activeTab === 'blockchain' ? 'bg-white text-black shadow-xl shadow-white/5' : 'text-zinc-500 hover:text-white'}`}
                            >
                                <Hash className="w-3.5 h-3.5" />
                                Blockchain Hub
                            </button>
                        </div>
                    </div>


                    {/* Stats Grid - Stitch Style */}
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-20"
                    >
                        {[
                            { label: 'Protected Assets', val: '1,248', icon: HardDrive, trend: '5.2% VS LAST MO', trendColor: 'text-emerald-500', iconColor: 'text-purple-400' },
                            { label: 'Active Threats', val: '12', icon: Activity, trend: '3 HIGH PRIORITY', trendColor: 'text-red-500', iconColor: 'text-red-400' },
                            { label: 'Success Rate', val: '99.4%', icon: Award, trend: 'UP 0.2%', trendColor: 'text-emerald-500', iconColor: 'text-emerald-400' },
                            { label: 'Response Time', val: '4.2m', icon: Zap, trend: 'FASTEST IN SECTOR', trendColor: 'text-purple-400', iconColor: 'text-purple-400' }
                        ].map((stat, i) => (
                            <motion.div
                                key={i}
                                variants={itemVariants}
                                whileHover={{ y: -5 }}
                                className="metric-card bg-[#09090b]/50 border border-zinc-900/50 p-8 rounded-3xl hover-glow-purple group backdrop-blur-md transition-all duration-300"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">{stat.label}</p>
                                    <div className={`p-2 rounded-lg bg-zinc-900 group-hover:bg-opacity-20 flex items-center justify-center`}>
                                        <stat.icon className={`w-3.5 h-3.5 ${stat.iconColor}`} />
                                    </div>
                                </div>
                                <h3 className="text-4xl font-bold tracking-tighter">{stat.val}</h3>
                                {stat.label === 'Success Rate' ? (
                                    <div className="mt-4 h-1 bg-zinc-900 rounded-full overflow-hidden">
                                        <div className="h-full bg-white w-[99.4%] shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
                                    </div>
                                ) : (
                                    <div className={`mt-4 flex items-center ${stat.trendColor} text-[10px] font-black tracking-widest`}>
                                        <ArrowUpRight className="w-3 h-3 mr-1" />
                                        {stat.trend}
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </motion.div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >

                            {activeTab === 'ai' ? (
                                <div className="grid lg:grid-cols-[1fr_400px] gap-8">
                                    {/* AI Protection & Tracking Center */}
                                    <div className="space-y-6">
                                        <div className="p-8 rounded-[32px] glass-dark border border-zinc-800/50 backdrop-blur-3xl animate-scan">
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
                        </motion.div>
                    </AnimatePresence>
                </main>

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
