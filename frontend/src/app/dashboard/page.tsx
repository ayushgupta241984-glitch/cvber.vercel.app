'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { FileUploader } from '@/components/dashboard/FileUploader';
import { SafeVault } from '@/components/dashboard/SafeVault';
import { SecurityMentor } from '@/components/chat/SecurityMentor';
import { ScreenshotGuard } from '@/components/security/ScreenshotGuard';
import { FileViewer } from '@/components/dashboard/FileViewer';
import { WatermarkEngine } from '@/components/tools/WatermarkEngine';
import { BlockchainStatus } from '@/components/enforcement/BlockchainStatus';
import { DMCAGenerator } from '@/components/enforcement/DMCAGenerator';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { ToastProvider, useToast } from '@/components/common/Toast';
import { apiClient, BASE_URL } from '@/lib/api-client';
import { FeedbackWidget } from '@/components/common/FeedbackWidget';
import { ReferralBanner } from '@/components/common/ReferralBanner';
import { SearchResultsModal } from '@/components/search/SearchResultsModal';
import { SearchTV } from '@/components/search/SearchTV';
import { Shield, FileText, Award, HardDrive, Stamp, Upload, Search, Lock, Bot, Hash, Layout, Zap, Activity, Eye, ScanLine, Anchor, Globe, ChevronDown, ArrowUpRight } from 'lucide-react';
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
    proofRequired?: boolean;
    ownershipProofStatus?: 'pending' | 'verified' | 'rejected' | null;
    forensicSummary?: string;
    aiProvider?: string;
    aiModel?: string;
    c2paSignedUrl?: string;
    c2paManifest?: string;
    c2paSignature?: string;
    uploadedAt: string;
    previewUrl?: string;
    storageUrl?: string;
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
    storage_url?: string;
    original_hash?: string;
}

const easeLuxury = [0.16, 1, 0.3, 1] as const;

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.04,
            delayChildren: 0.05,
            duration: 0.2,
            ease: easeLuxury,
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.2,
            ease: easeLuxury,
        }
    }
};

const heroVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.25,
            ease: easeLuxury,
        }
    }
};

const lineVariants = {
    hidden: { scaleX: 0, opacity: 0 },
    visible: {
        scaleX: 1,
        opacity: 1,
        transition: {
            duration: 0.25,
            ease: easeLuxury,
            delay: 0.08,
        }
    }
};

function DashboardInner() {
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState<'monitor' | 'provenance'>('monitor');
    const [files, setFiles] = useState<FileData[]>([]);
    const [selectedFile, setSelectedFile] = useState<FileData | null>(null);
    const [isViewerOpen, setIsViewerOpen] = useState(false);
    const [isWatermarkOpen, setIsWatermarkOpen] = useState(false);
    const [dmcaAsset, setDmcaAsset] = useState<{ name: string; hash: string; originalityScore: number; forensicSummary: string } | null>(null);

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [vaultLoading, setVaultLoading] = useState(true);
    const [user, setUser] = useState<{ full_name: string } | null>(null);
    const [selectedBlockchainFile, setSelectedBlockchainFile] = useState<FileData | null>(null);
    const [blockchainFileProofs, setBlockchainFileProofs] = useState<any[]>([]);
    const [proofsLoading, setProofsLoading] = useState(false);
    const [proofModalFile, setProofModalFile] = useState<FileData | null>(null);
    const [proofType, setProofType] = useState<'declaration' | 'source' | 'original'>('declaration');
    const [proofText, setProofText] = useState('');
    const [proofUrl, setProofUrl] = useState('');
    const [submittingProof, setSubmittingProof] = useState(false);

    const [searchResults, setSearchResults] = useState<any>(null);
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);
    const [searchFileName, setSearchFileName] = useState('');
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchFileBlob, setSearchFileBlob] = useState<Blob | null>(null);
    const searchFileInputRef = useRef<HTMLInputElement>(null);
    const [pendingSearchId, setPendingSearchId] = useState<string | null>(null);

    const [isIndexing, setIsIndexing] = useState(false);
    const indexedRef = useRef(false);

    const indexVault = useCallback(async (silent: boolean = false) => {
        if (isIndexing) return;
        setIsIndexing(true);
        try {
            const result = await apiClient.indexVault();
            if (!silent && result?.registered > 0) {
                toast(`Indexed ${result.registered} file(s) for copy detection`, 'success');
            }
        } catch {
            if (!silent) toast('Failed to index vault', 'error');
        } finally {
            setIsIndexing(false);
        }
    }, [isIndexing, toast]);

    useEffect(() => {
        const saved = localStorage.getItem('cvber_vault_memory');
        if (saved) {
            try {
                const parsed = JSON.parse(saved) as FileData[];
                const cleaned = parsed.map(f => ({
                    ...f,
                    previewUrl: f.previewUrl?.startsWith('blob:') ? undefined : f.previewUrl,
                    storageUrl: f.storageUrl?.startsWith('blob:') ? undefined : f.storageUrl,
                }));
                setFiles(cleaned);
            } catch (e) {
                console.error("Memory corruption:", e);
            }
        }

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

        const fetchVault = async () => {
            try {
                const vault = await apiClient.listVaultFiles(100, 0);
                if (vault.files && vault.files.length > 0) {
                    const vaultFiles: FileData[] = vault.files.map((f: any) => ({
                        id: f.scan_id,
                        name: f.file_name,
                        size: f.file_size,
                        hash: f.original_hash || undefined,
                        status: f.risk_score !== null
                            ? (f.risk_score < 30 ? 'safe' : f.risk_score < 70 ? 'warning' : 'danger')
                            : 'safe',
                        riskScore: f.risk_score,
                        originalityScore: f.originality_score,
                        isScreenshot: f.is_screenshot,
                        proofRequired: f.proof_required,
                        ownershipProofStatus: f.ownership_proof_status,
                        aiProvider: f.ai_provider,
                        aiModel: f.ai_model,
                        c2paSignedUrl: f.c2pa_signed_url,
                        c2paManifest: f.c2pa_manifest,
                        c2paSignature: f.c2pa_signature,
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
            } finally {
                setVaultLoading(false);
                if (!indexedRef.current) {
                    indexedRef.current = true;
                    apiClient.indexVault().catch(() => {});
                }
            }
        };
        fetchVault();
    }, []);

    useEffect(() => {
        localStorage.setItem('cvber_vault_memory', JSON.stringify(files));
    }, [files]);

    const downloadOtsProof = async (proofId: string, assetName: string) => {
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch(`${BASE_URL}/vault/proofs/${proofId}/ots-proof`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (!response.ok) throw new Error(`Download failed: ${response.status}`);
            const blob = await response.blob();
            const baseName = assetName.includes('.') ? assetName.split('.').slice(0, -1).join('.') : assetName;
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${baseName}.ots`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (e) {
            console.error('OTS proof download failed:', e);
            toast('Failed to download OTS proof.', 'error');
        }
    };

    const downloadEvidencePdf = async () => {
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch(`${BASE_URL}/api/enforcement/audit/evidence-pdf`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (!response.ok) throw new Error(`Download failed: ${response.status}`);
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `cvber_evidence_log_${new Date().toISOString().slice(0, 10)}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (e) {
            console.error('Evidence PDF download failed:', e);
            toast('Failed to download evidence log.', 'error');
        }
    };

    const checkProofRequired = (file: FileData) => {
        const alreadySubmitted = file.ownershipProofStatus === 'pending' || file.ownershipProofStatus === 'verified';
        const screenshotWithLowScore = file.isScreenshot && (file.originalityScore === undefined || file.originalityScore < 50) && !alreadySubmitted;
        const hasProofRequired = file.proofRequired === true && !alreadySubmitted;

        if (hasProofRequired || screenshotWithLowScore) {
            console.log('Blocking access for:', file.name, { proofRequired: file.proofRequired, isScreenshot: file.isScreenshot, originality: file.originalityScore });
            setProofModalFile(file);
            return true;
        }
        return false;
    };

    const submitOwnershipProof = async () => {
        if (!proofModalFile) return;
        setSubmittingProof(true);
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch(`${BASE_URL}/vault/files/${proofModalFile.id}/ownership-proof`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    proof_type: proofType,
                    proof_text: proofText,
                    proof_url: proofUrl
                })
            });
            if (response.ok) {
                toast('Proof submitted! Your file will be reviewed.', 'success');
                setProofModalFile(null);
                setProofText('');
                setProofUrl('');
                const vault = await apiClient.listVaultFiles(100, 0);
                if (vault.files) {
                    const vaultFiles = vault.files.map((f: any) => ({
                        ...f,
                        proofRequired: f.proof_required,
                        ownershipProofStatus: f.ownership_proof_status,
                        aiProvider: f.ai_provider,
                        aiModel: f.ai_model,
                        c2paSignedUrl: f.c2pa_signed_url,
                        c2paManifest: f.c2pa_manifest,
                        c2paSignature: f.c2pa_signature,
                    }));
                    setFiles(prev => {
                        const updated = [...prev];
                        for (const vf of vaultFiles) {
                            const idx = updated.findIndex(p => p.id === vf.id);
                            if (idx >= 0) {
                                updated[idx] = { ...updated[idx], ...vf };
                            } else {
                                updated.push(vf);
                            }
                        }
                        return updated;
                    });
                }
            } else {
                toast('Failed to submit proof. Please try again.', 'error');
            }
        } catch (e) {
            console.error('Submit proof failed:', e);
            toast('Error submitting proof.', 'error');
        } finally {
            setSubmittingProof(false);
        }
    };

    const stats = useMemo(() => {
        const total = files.length;
        const threats = files.filter(f => f.status === 'danger' || (f.riskScore ?? 0) >= 70).length;
        const successRate = total > 0
            ? ((total - threats) / total * 100).toFixed(1) + '%'
            : '100%';
        const successWidth = total > 0
            ? ((total - threats) / total * 100).toFixed(1)
            : '100';
        return { total, threats, successRate, successWidth };
    }, [files]);

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_full_name');
        window.location.href = '/';
    };

    const handleUploadComplete = async (result: UploadResult, rawFile: File) => {
        const previewUrl = result.storage_url || URL.createObjectURL(rawFile);

        const arrayBuffer = await rawFile.arrayBuffer();
        const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        let fileHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        if (result.original_hash) fileHash = result.original_hash;

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

        try {
            const timestampResult = await apiClient.createBlockchainTimestamp(
                rawFile.name,
                fileHash,
                result.scan_id
            );
            console.log('Blockchain timestamp created:', timestampResult);
            window.dispatchEvent(new Event('blockchain-update'));
        } catch (error: any) {
            console.error('Blockchain timestamp failed:', error);
            if (error?.message) {
                toast(`Blockchain timestamp failed: ${error.message}`, 'error');
            }
        }
    };

    const handleView = async (file: FileData) => {
        if (checkProofRequired(file)) return;
        if (!file.previewUrl) {
            try {
                const urlResp = await apiClient.getVaultFileUrl(file.id);
                file.previewUrl = urlResp.url;
            } catch (err) {
                console.error("Failed to get vault URL:", err);
            }
        }
        setSelectedFile(file);
        setIsViewerOpen(true);
        if (window.innerWidth < 1024) setIsSidebarOpen(false);
    };

    const handleWatermark = async (file: FileData) => {
        if (!file.previewUrl) {
            try {
                const urlResp = await apiClient.getVaultFileUrl(file.id);
                file.previewUrl = urlResp.url;
            } catch (err) {
                console.error("Failed to refresh URL for watermark:", err);
            }
        }
        setSelectedFile(file);
        setIsWatermarkOpen(true);
        if (window.innerWidth < 1024) setIsSidebarOpen(false);
    };

    const handleDMCA = (file: FileData) => {
        setDmcaAsset({
            name: file.name,
            hash: file.hash || 'unknown',
            originalityScore: file.originalityScore || 0,
            forensicSummary: file.forensicSummary || 'No forensic summary available',
        });
    };

    const handleDelete = async (file: FileData) => {
        if (!confirm(`Remove "${file.name}" from your collection?`)) return;
        try {
            await apiClient.deleteVaultFile(file.id);
        } catch (err) {
            console.error("Failed to delete from backend:", err);
        }
        setFiles(prev => prev.filter(f => f.id !== file.id));
    };

    const loadBlockchainProofs = async (file: FileData) => {
        setSelectedBlockchainFile(file);
        setProofsLoading(true);
        try {
            const result = await apiClient.getVaultFileWithProofs(file.id);
            setBlockchainFileProofs(result.blockchain_proofs || []);
        } catch (err) {
            console.error("Failed to load proofs:", err);
            setBlockchainFileProofs([]);
        } finally {
            setProofsLoading(false);
        }
    };

    const handleTimestamp = async (file: FileData) => {
        if (checkProofRequired(file)) return;
        const hash = file.hash;
        if (!hash) {
            toast("File hash not available.", 'error');
            return;
        }
        try {
            const result = await apiClient.createBlockchainTimestamp(file.name, hash, file.id);
            console.log('Blockchain timestamp created:', result);
            window.dispatchEvent(new Event('blockchain-update'));
            if (selectedBlockchainFile?.id === file.id) {
                await loadBlockchainProofs(file);
            }
        } catch (err: any) {
            toast(err?.message || 'Failed to create blockchain timestamp', 'error');
        }
    };

    const performSearch = async (fileToUpload: File) => {
        setSearchResults(null);
        setSearchError(null);
        setSearchLoading(true);
        setIsSearchOpen(true);

        try {
            const result = await apiClient.reverseImageSearch(fileToUpload);
            if (result?.scan_id) {
                const baseUrl = apiClient.getBaseUrl();
                const imageUrl = `${baseUrl}/search/temp/${result.scan_id}`;
                const encodedUrl = encodeURIComponent(imageUrl);
                result._yandexUrl = `https://yandex.com/images/search?url=${encodedUrl}&rpt=imageview`;
                result._bingUrl = `https://www.bing.com/images/search?view=detailv2&iss=sbi&q=imgurl:${encodedUrl}`;
                result._googleLensUrl = `https://lens.google.com/uploadbyurl?url=${encodedUrl}`;
                result._saucenaoUrl = `https://saucenao.com/search.php?db=999&url=${encodedUrl}`;
                result._tineyeUrl = `https://tineye.com/search?url=${encodedUrl}`;
                result._imageUrl = imageUrl;
            }
            setSearchResults(result);
        } catch (err: any) {
            setSearchError(err?.message || 'Search failed');
            console.error('Image search error:', err);
        } finally {
            setSearchLoading(false);
            setPendingSearchId(null);
            if (searchFileInputRef.current) searchFileInputRef.current.value = '';
        }
    };

    const handleDeepSearch = async (fileBlob: Blob, fileName: string) => {
        setSearchError(null);

        try {
            const file = new File([fileBlob], fileName, { type: fileBlob.type || 'image/jpeg' });
            const result = await apiClient.deepImageSearch(file);
            setSearchResults((prev: any) => ({ ...(prev || {}), _deepResults: result }));
        } catch (err: any) {
            setSearchError(err?.message || 'Deep search failed');
            console.error('Deep search error:', err);
        }
    };

    const handleSearch = async (file: any) => {
        setSearchFileName(file.name);
        setSearchFileBlob(null);
        setPendingSearchId(file.id);

        // Always get a fresh signed URL — stored URLs expire
        try {
            const urlResp = await apiClient.getVaultFileUrl(file.id);
            const url = urlResp.url;
            const resp = await fetch(url);
            if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
            const blob = await resp.blob();
            setSearchFileBlob(blob);
            const fileToUpload = new File([blob], file.name, { type: blob.type || 'application/octet-stream' });
            await performSearch(fileToUpload);
            try {
                await apiClient.registerHash(fileToUpload, file.id);
            } catch {
                // non-critical
            }
        } catch (err) {
            console.error('Search failed:', err);
            const msg = err instanceof Error ? err.message : 'Unknown error';
            toast(`Could not search file: ${msg}`, 'error');
        } finally {
            setPendingSearchId(null);
        }
    };

    const handleSearchFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;
        setSearchFileName(selectedFile.name);
        setSearchFileBlob(selectedFile);
        setPendingSearchId(null);
        await performSearch(selectedFile);
    };

    return (
        <ScreenshotGuard>
            {proofModalFile && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15, ease: easeLuxury }}
                    className="fixed inset-0 bg-black/90 backdrop-blur-xl z-50 flex items-center justify-center p-4"
                >
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.15, ease: easeLuxury, delay: 0.02 }}
                        className="bg-black border border-luxury-gold/30 max-w-lg w-full"
                    >
                        <div className="px-8 pt-10 pb-6">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-10 h-10 border border-luxury-gold/50 flex items-center justify-center">
                                    <Shield className="h-4 w-4 text-luxury-gold" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-display text-luxury-cream">Ownership Verification</h2>
                                    <p className="text-xs text-luxury-gold/60 uppercase tracking-wider mt-1">Proof of authorship required</p>
                                </div>
                            </div>

                            <p className="text-sm text-luxury-muted/70 mb-8 leading-relaxed">
                                This file appears to be a screenshot or was already found online.
                                To use any features, you must prove you&apos;re the original creator.
                            </p>

                            <div className="space-y-6 mb-8">
                                <div>
                                    <label className="text-[10px] text-luxury-muted/50 uppercase tracking-ultra-wide font-semibold mb-3 block">Method of verification</label>
                                    <select
                                        value={proofType}
                                        onChange={(e) => setProofType(e.target.value as any)}
                                        className="w-full bg-luxury-deep border border-luxury-steel/40 text-luxury-cream px-4 py-3 text-sm focus:border-luxury-gold/40 outline-none                                                     transition-all duration-200 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] appearance-none"
                                    >
                                        <option value="declaration">Legal Declaration</option>
                                        <option value="source">Link to Original Work</option>
                                        <option value="original">Upload Source File</option>
                                    </select>
                                </div>

                                {proofType === 'declaration' && (
                                    <div className="border border-luxury-steel/30 p-6">
                                        <p className="text-luxury-gold/70 text-xs uppercase tracking-wider mb-4">Legal Declaration</p>
                                        <p className="text-luxury-muted/50 text-xs leading-relaxed mb-4">
                                            By submitting, you declare under legal penalty of perjury that you are the original creator of this work.
                                        </p>
                                        <label className="text-[10px] text-luxury-muted/50 uppercase tracking-ultra-wide font-semibold mb-3 block">Full legal name</label>
                                        <input
                                            type="text"
                                            value={proofText}
                                            onChange={(e) => setProofText(e.target.value)}
                                            placeholder="Enter your full legal name"
                                            className="w-full bg-luxury-deep border border-luxury-steel/40 text-luxury-cream px-4 py-3 text-sm focus:border-luxury-gold/40 outline-none transition-all duration-200 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] placeholder-luxury-muted/30"
                                        />
                                    </div>
                                )}

                                {proofType === 'source' && (
                                    <div>
                                        <label className="text-[10px] text-luxury-muted/50 uppercase tracking-ultra-wide font-semibold mb-3 block">Link to original work</label>
                                        <input
                                            type="url"
                                            value={proofUrl}
                                            onChange={(e) => setProofUrl(e.target.value)}
                                            placeholder="https://your-portfolio.com/original"
                                            className="w-full bg-luxury-deep border border-luxury-steel/40 text-luxury-cream px-4 py-3 text-sm focus:border-luxury-gold/40 outline-none transition-all duration-200 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] placeholder-luxury-muted/30"
                                        />
                                    </div>
                                )}

                                {proofType === 'original' && (
                                    <div className="border border-dashed border-luxury-steel/30 p-8 text-center">
                                        <p className="text-luxury-muted/50 text-xs mb-1">Upload your original source file</p>
                                        <p className="text-luxury-muted/30 text-[10px] uppercase tracking-wider">Raw file (PSD, AI, original photo)</p>
                                        <input type="file" className="mt-4 text-xs text-luxury-muted/50" />
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-0 border-t border-luxury-steel/30">
                                <button
                                    onClick={() => setProofModalFile(null)}
                                    className="flex-1 py-4 text-xs uppercase tracking-ultra-wide font-semibold text-luxury-muted/60 hover:text-luxury-cream transition-colors duration-200"
                                >
                                    Cancel
                                </button>
                                <div className="w-px bg-luxury-steel/30" />
                                <button
                                    onClick={submitOwnershipProof}
                                    disabled={submittingProof || (proofType === 'declaration' && !proofText)}
                                    className="flex-1 py-4 text-xs uppercase tracking-ultra-wide font-semibold bg-luxury-gold/90 text-black hover:bg-luxury-gold transition-colors duration-500 disabled:opacity-30"
                                >
                                    {submittingProof ? 'Submitting...' : 'Submit Proof'}
                                </button>
                            </div>

                            {proofModalFile.ownershipProofStatus === 'pending' && (
                                <p className="text-luxury-gold/50 text-[10px] uppercase tracking-wider text-center mt-4">
                                    Previous proof under review
                                </p>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}

            <div className="min-h-screen bg-gallery-black text-luxury-cream flex overflow-x-hidden">
                <DashboardSidebar
                    userName={user?.full_name || ''}
                    userInitials={user?.full_name ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
                    isOpen={isSidebarOpen}
                    onClose={() => setIsSidebarOpen(false)}
                    onLogout={handleLogout}
                />

                <main className="flex-1 lg:ml-72 relative flex flex-col min-h-screen">
                    {/* Film grain + vignette applied to full app */}
                    <div className="grain-overlay" />
                    <div className="vignette-overlay" />

                    {/* Slim Top Bar */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.15, ease: easeLuxury }}
                        className="border-b border-luxury-steel/30"
                    >
                        <div className="px-8 md:px-16 lg:px-24 flex items-center justify-between h-16">
                            <div className="flex items-center gap-4 lg:hidden">
                                <button
                                    onClick={() => setIsSidebarOpen(true)}
                                    suppressHydrationWarning
                                    className="p-2 border border-luxury-steel/40 text-luxury-cream transition-all duration-200"
                                >
                                    <Layout className="w-4 h-4" />
                                </button>
                                <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 border border-luxury-gold/60 flex items-center justify-center">
                                        <Shield className="h-3 w-3 text-luxury-gold" />
                                    </div>
                                    <span className="text-sm font-display tracking-wide">CVBER</span>
                                </div>
                            </div>

                            <div className="hidden lg:flex items-center gap-12">
                                {(['monitor', 'provenance'] as const).map((tab) => {
                                    const labels = { monitor: 'Collection', provenance: 'Ledger' };
                                    return (
                                        <button
                                            key={tab}
                                            onClick={() => setActiveTab(tab)}
                                            suppressHydrationWarning
                                            className={`text-[10px] uppercase tracking-ultra-wide font-semibold pb-1 transition-all duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] ${
                                                activeTab === tab
                                                    ? 'text-luxury-gold border-b border-luxury-gold'
                                                    : 'text-luxury-muted/40 hover:text-luxury-muted/70 border-b border-transparent'
                                            }`}
                                        >
                                            {labels[tab]}
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="flex items-center gap-6">
                                <p className="text-[10px] text-luxury-muted/50 uppercase tracking-ultra-wide font-semibold hidden sm:block">
                                    {stats.total} {stats.total === 1 ? 'piece' : 'pieces'}
                                </p>
                                <div className="w-px h-4 bg-luxury-steel/30 hidden sm:block" />
                                <p className="text-[10px] text-luxury-gold/60 uppercase tracking-ultra-wide font-semibold hidden sm:block">
                                    {stats.successRate} authentic
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Mobile Tab Switcher */}
                    <div className="lg:hidden border-b border-luxury-steel/30 px-8 md:px-16">
                        <div className="flex gap-6">
                            {(['monitor', 'provenance'] as const).map((tab) => {
                                const labels = { monitor: 'Collection', provenance: 'Ledger' };
                                return (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        suppressHydrationWarning
                                        className={`text-[10px] uppercase tracking-ultra-wide font-semibold py-4 transition-all duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] border-b-2 ${
                                            activeTab === tab
                                                ? 'text-luxury-gold border-luxury-gold'
                                                : 'text-luxury-muted/40 hover:text-luxury-muted/70 border-transparent'
                                        }`}
                                    >
                                        {labels[tab]}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Content Area */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.15, ease: easeLuxury }}
                            className="flex-1 flex flex-col"
                        >
                            {activeTab === 'monitor' ? (
                                <motion.div
                                    initial="hidden"
                                    animate="visible"
                                    variants={containerVariants}
                                    className="flex-1 px-8 md:px-16 lg:px-24 py-10 overflow-y-auto"
                                >
                                    <div className="grid lg:grid-cols-[1fr_420px] gap-12">
                                        {/* Main Column */}
                                        <div className="space-y-12">
                                            <ReferralBanner />

                                            {/* Upload Section — The Atelier */}
                                            <motion.section variants={itemVariants}>
                                                <div className="mb-6">
                                                    <p className="text-luxury-subheading mb-2">The Atelier</p>
                                                    <h2 className="text-xl font-display text-luxury-cream">Present Your Work</h2>
                                                </div>
                                                <FileUploader onUploadComplete={handleUploadComplete} />
                                            </motion.section>

                                            {/* Collection Section */}
                                            <motion.section variants={itemVariants}>
                                                <SafeVault
                                                    files={files}
                                                    loading={vaultLoading}
                                                    onView={handleView}
                                                    onWatermark={handleWatermark}
                                                    onDelete={handleDelete}
                                                    onTimestamp={handleTimestamp}
                                                    onSearch={handleSearch}
                                                    onDMCA={handleDMCA}
                                                />
                                            </motion.section>
                                        </div>

                                        {/* Sidebar Column */}
                                        <motion.div variants={itemVariants} className="space-y-8">
                                            <SecurityMentor context={{ files }} onSearchFile={handleSearch} />
                                            <motion.div
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.15, ease: easeLuxury, delay: 0.05 }}
                                                className="border border-luxury-steel/30 p-6"
                                            >
                                                <div className="flex items-center gap-3 mb-4">
                                                    <Globe className="w-4 h-4 text-luxury-gold/60" />
                                                    <h3 className="text-xs font-display text-luxury-cream uppercase tracking-wide">Search the World</h3>
                                                </div>
                                                <p className="text-xs text-luxury-muted/50 leading-relaxed mb-6">
                                                    Our agent scours the open web for unauthorized reproductions of your work&mdash;social platforms, marketplaces, and beyond.
                                                </p>
                                                <button
                                                    onClick={() => indexVault(false)}
                                                    disabled={isIndexing}
                                                    className="w-full py-3 text-[10px] uppercase tracking-ultra-wide font-semibold border border-luxury-steel/30 text-luxury-muted/60 hover:text-luxury-gold hover:border-luxury-gold/40 transition-all duration-300 disabled:opacity-30"
                                                >
                                                    {isIndexing ? 'Indexing Files...' : `Index Vault for Copy Detection (${files.length} files)`}
                                                </button>
                                                <div className="mt-3">
                                                    <SearchTV fileBlob={searchFileBlob ?? undefined} fileName={searchFileName || undefined} />
                                                </div>
                                            </motion.div>
                                        </motion.div>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    initial="hidden"
                                    animate="visible"
                                    variants={containerVariants}
                                    className="flex-1 px-8 md:px-16 lg:px-24 py-10 overflow-y-auto"
                                >
                                    <div className="grid lg:grid-cols-[1fr_420px] gap-12">
                                        {/* Main Column */}
                                        <div className="space-y-12">
                                            <motion.div variants={itemVariants}>
                                                <p className="text-luxury-subheading mb-2">The Ledger</p>
                                                <h2 className="text-xl font-display text-luxury-cream">Provenance, Immutable</h2>
                                            </motion.div>

                                            <motion.p variants={itemVariants} className="text-sm text-luxury-muted/50 leading-relaxed max-w-2xl">
                                                Every stroke, every pixel, every note&mdash;immortalised on the Bitcoin blockchain. Through OP_RETURN, your creation receives a permanent, legally-recognisable timestamp of existence, independent of any intermediary.
                                            </motion.p>

                                            <motion.div variants={itemVariants} className="grid md:grid-cols-2 gap-0 border border-luxury-steel/30">
                                                <div className="p-6 border-r border-b md:border-b-0 border-luxury-steel/30">
                                                    <p className="text-[10px] text-luxury-gold/60 uppercase tracking-ultra-wide font-semibold mb-3">Network</p>
                                                    <p className="text-lg font-display text-luxury-cream">Mainnet Connected</p>
                                                </div>
                                                <div className="p-6">
                                                    <p className="text-[10px] text-luxury-gold/60 uppercase tracking-ultra-wide font-semibold mb-3">Total Proofs</p>
                                                    <p className="text-lg font-display text-luxury-cream">{files.length} Anchors</p>
                                                </div>
                                            </motion.div>

                                            {/* Vault Files */}
                                            <motion.div variants={itemVariants} className="space-y-0 border border-luxury-steel/30 max-h-[500px] overflow-y-auto">
                                                {files.length === 0 ? (
                                                    <div className="p-12 text-center border-b border-luxury-steel/30">
                                                        <p className="text-xs text-luxury-muted/50 uppercase tracking-wider">Upload a work first to see it here</p>
                                                    </div>
                                                ) : files.map((f, idx) => (
                                                    <motion.div
                                                        key={f.id}
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ duration: 0.2, ease: easeLuxury, delay: idx * 0.02 }}
                                                        onClick={() => loadBlockchainProofs(f)}
                                                        className={`p-5 cursor-pointer transition-all duration-200 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] border-b border-luxury-steel/30 last:border-b-0 ${
                                                            selectedBlockchainFile?.id === f.id
                                                                ? 'bg-luxury-gold/5'
                                                                : 'hover:bg-luxury-deep'
                                                        }`}
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-4 min-w-0">
                                                                <FileText className="w-4 h-4 text-luxury-muted/40 shrink-0" />
                                                                <span className="text-sm font-display text-luxury-cream truncate">{f.name}</span>
                                                            </div>
                                                            <div className="flex items-center gap-4 shrink-0">
                                                                {f.hash && (
                                                                    <button
                                                                        onClick={(e) => { e.stopPropagation(); handleTimestamp(f); }}
                                                                        className="px-4 py-2 text-[10px] uppercase tracking-ultra-wide font-semibold border border-luxury-gold/30 text-luxury-gold hover:bg-luxury-gold/10 transition-all duration-200 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
                                                                    >
                                                                        Anchor
                                                                    </button>
                                                                )}
                                                                <span className="text-[10px] text-luxury-muted/40 uppercase tracking-widest">
                                                                    {(f.size / 1024).toFixed(0)}KB
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </motion.div>

                                            {/* Selected file proofs */}
                                            {selectedBlockchainFile && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ duration: 0.15, ease: easeLuxury }}
                                                >
                                                    <div className="flex items-center gap-3 mb-6">
                                                        <Anchor className="w-4 h-4 text-luxury-gold/60" />
                                                        <h3 className="text-sm font-display text-luxury-cream">
                                                            Proofs for {selectedBlockchainFile.name}
                                                        </h3>
                                                    </div>
                                                    {proofsLoading ? (
                                                        <div className="flex items-center justify-center py-12">
                                                            <div className="w-5 h-5 border border-luxury-gold/30 border-t-luxury-gold/60 animate-spin" />
                                                        </div>
                                                    ) : blockchainFileProofs.length === 0 ? (
                                                        <div className="p-8 border border-luxury-steel/30 text-center">
                                                            <p className="text-xs text-luxury-muted/50 uppercase tracking-wider">No blockchain proofs yet. Click Anchor to create one.</p>
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-0 border border-luxury-steel/30">
                                                            {blockchainFileProofs.map((proof: any) => (
                                                                <div key={proof.proof_id} className="p-5 border-b border-luxury-steel/30 last:border-b-0">
                                                                    <div className="flex items-center justify-between mb-3">
                                                                        <span className="text-[10px] text-luxury-muted/50 uppercase tracking-ultra-wide font-semibold">{proof.status === 'confirmed' ? 'Anchored' : proof.status === 'pending' ? 'Pending (~2h)' : 'Local'}</span>
                                                                        <span className={`text-[10px] uppercase tracking-ultra-wide font-semibold ${
                                                                            proof.status === 'confirmed' ? 'text-luxury-gold/80' :
                                                                            proof.status === 'pending' ? 'text-luxury-gold/60' :
                                                                            'text-luxury-muted/40'
                                                                        }`}>
                                                                            {proof.status}
                                                                        </span>
                                                                    </div>
                                                                    <p className="text-[10px] text-luxury-muted/30 font-mono truncate mb-4">{proof.proof_id}</p>
                                                                    <div className="flex items-center justify-between">
                                                                        <span className="text-[10px] text-luxury-muted/30">{new Date(proof.created_at).toLocaleString()}</span>
                                                                        <div className="flex items-center gap-4">
                                                                            {proof.status !== 'local_only' ? (
                                                                                <button
                                                                                    onClick={() => downloadOtsProof(proof.proof_id, proof.asset_name)}
                                                                                    className="text-[10px] text-luxury-gold/60 hover:text-luxury-gold uppercase tracking-wider font-semibold transition-colors duration-150"
                                                                                >
                                                                                    Download .ots
                                                                                </button>
                                                                            ) : (
                                                                                <span className="text-[10px] text-luxury-muted/30 italic">No proof file</span>
                                                                            )}
                                                                            <a href="https://opentimestamps.org/" target="_blank" rel="noopener noreferrer" className="text-[10px] text-luxury-muted/30 hover:text-luxury-cream uppercase tracking-wider transition-colors duration-150">Info</a>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </motion.div>
                                            )}
                                        </div>

                                        {/* Sidebar Column */}
                                        <motion.div variants={itemVariants} className="space-y-8">
                                            <BlockchainStatus />
                                            <motion.div
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.15, ease: easeLuxury, delay: 0.04 }}
                                                className="border border-luxury-gold/30 p-8"
                                            >
                                                <h3 className="text-lg font-display text-luxury-cream mb-3">Court-Ready Evidence</h3>
                                                <p className="text-xs text-luxury-muted/50 leading-relaxed mb-8">
                                                    A comprehensive dossier combining your C2PA provenance manifests with on-chain transaction hashes&mdash;certified for submission in any legal proceeding.
                                                </p>
                                                <button
                                                    onClick={downloadEvidencePdf}
                                                    className="w-full py-4 text-[10px] uppercase tracking-ultra-wide font-semibold bg-luxury-gold/90 text-black hover:bg-luxury-gold transition-colors duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
                                                >
                                                    Download Evidence Dossier
                                                </button>
                                            </motion.div>
                                        </motion.div>
                                    </div>
                                </motion.div>
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

                {dmcaAsset && (
                    <DMCAGenerator
                        asset={dmcaAsset}
                        onClose={() => setDmcaAsset(null)}
                    />
                )}

                <input
                    type="file"
                    ref={searchFileInputRef}
                    onChange={handleSearchFileSelected}
                    accept="image/*"
                    className="hidden"
                />

                <SearchResultsModal
                    isOpen={isSearchOpen}
                    onClose={() => { setIsSearchOpen(false); setSearchResults(null); setSearchError(null); setSearchFileBlob(null); }}
                    fileName={searchFileName}
                    results={searchResults}
                    loading={searchLoading}
                    error={searchError}
                    searchFileBlob={searchFileBlob}
                    onDeepSearch={handleDeepSearch}
                />

                <FeedbackWidget />
            </div>
        </ScreenshotGuard>
    );
}

export default function DashboardPage() {
    return (
        <ToastProvider>
            <DashboardInner />
        </ToastProvider>
    );
}
