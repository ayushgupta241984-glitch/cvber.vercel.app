'use client';

import { useState } from 'react';
import { X, Search, Globe, ExternalLink, Loader2, AlertTriangle, Hash, Copy, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { easeLuxurySharp as easeLuxury } from '@/lib/animations';

interface SimilarFile {
    scan_id: string;
    file_name: string;
    hash_distance: number;
}

interface SearchResults {
    scan_id?: string;
    original_hash?: string;
    message?: string;
    _yandexUrl?: string;
    _bingUrl?: string;
    _googleLensUrl?: string;
    _saucenaoUrl?: string;
    _tineyeUrl?: string;
    _imageUrl?: string;
    similar_files?: SimilarFile[];
    _deepResults?: DeepSearchResponse;
}

interface DeepSearchResult {
    url: string;
    title: string;
    source: string;
    similarity: number;
    hash_distance: number;
}

interface DeepSearchResponse {
    original_dhash?: string;
    description?: string;
    results: DeepSearchResult[];
    total_found: number;
    queries_used?: string[];
    images_searched?: number;
}

interface SearchResultsModalProps {
    isOpen: boolean;
    onClose: () => void;
    fileName: string;
    results: SearchResults | null;
    loading: boolean;
    error: string | null;
    searchFileBlob?: Blob | null;
    onDeepSearch?: (blob: Blob, fileName: string) => Promise<void>;
}

const searchEngines = [
    { key: 'yandex', label: 'Yandex Images', desc: 'Search on Yandex', urlKey: '_yandexUrl' as const },
    { key: 'bing', label: 'Bing Images', desc: 'Search on Bing', urlKey: '_bingUrl' as const },
    { key: 'googleLens', label: 'Google Lens', desc: 'Search with Google Lens', urlKey: '_googleLensUrl' as const },
    { key: 'saucenao', label: 'SauceNAO', desc: 'Search on SauceNAO (anime/art)', urlKey: '_saucenaoUrl' as const },
    { key: 'tineye', label: 'TinEye', desc: 'Search on TinEye', urlKey: '_tineyeUrl' as const },
];

export function SearchResultsModal({ isOpen, onClose, fileName, results, loading, error, searchFileBlob, onDeepSearch }: SearchResultsModalProps) {
    const [deepLoading, setDeepLoading] = useState(false);
    const [deepError, setDeepError] = useState<string | null>(null);

    const _deepResults = results?._deepResults as DeepSearchResponse | undefined;
    const displayDeepResults = _deepResults?.results || [];

    const handleDeepSearch = async () => {
        if (!searchFileBlob || !onDeepSearch) return;
        setDeepLoading(true);
        setDeepError(null);
        try {
            await onDeepSearch(searchFileBlob, fileName);
        } catch (err: any) {
            setDeepError(err?.message || 'Deep search failed');
        } finally {
            setDeepLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
            <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={onClose} />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, ease: easeLuxury }}
                className="relative w-full max-w-2xl bg-black border border-white/[0.08]/30 max-h-[90vh] flex flex-col"
            >
                <div className="flex items-center justify-between px-8 py-6 border-b border-white/[0.08]/30">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 border border-white/[0.15]/50 flex items-center justify-center">
                            <Search className="h-4 w-4 text-white/60" />
                        </div>
                        <div>
                            <h3 className="text-sm text-white uppercase tracking-wide">Reverse Image Search</h3>
                            <p className="text-[10px] text-white/40/60 uppercase tracking-ultra-wide mt-1 truncate max-w-[300px]">{fileName}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-white/40/40 hover:text-white transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8">
                    {loading && (
                        <div className="flex flex-col items-center justify-center py-24 gap-6">
                            <Loader2 className="h-8 w-8 text-white/60/60 animate-spin" />
                            <div className="text-center">
                                <p className="text-sm text-white/80 mb-2">Processing image...</p>
                                <p className="text-[10px] text-white/40/50 uppercase tracking-wider">Computing perceptual hash</p>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="flex flex-col items-center justify-center py-24 gap-4">
                            <AlertTriangle className="h-8 w-8 text-amber-400/60" />
                            <p className="text-sm text-white/40/70">{error}</p>
                        </div>
                    )}

                    {results && !loading && !error && (
                        <div className="space-y-8">
                            {results.original_hash && (
                                <div className="flex items-center gap-3 px-4 py-3 border border-white/[0.08]/20">
                                    <Hash className="w-4 h-4 text-white/60/50 shrink-0" />
                                    <div>
                                        <p className="text-[10px] text-white/40/50 uppercase tracking-wider">Fingerprint (dHash)</p>
                                        <p className="text-xs text-white/40/30 font-mono mt-1">{results.original_hash}</p>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-4">
                                <p className="text-xs text-white/40/60 uppercase tracking-wider font-semibold">Search Engines</p>

                                {searchEngines.map(engine => {
                                    const url = results[engine.urlKey as keyof typeof results] as string | undefined;
                                    if (!url) return null;
                                    return (
                                        <a
                                            key={engine.key}
                                            href={url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-between p-4 border border-white/[0.08]/20 hover:border-white/[0.15]/40 hover:bg-white/[0.03] transition-all duration-200 group"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-white/[0.03]/10 flex items-center justify-center">
                                                    <Globe className="h-5 w-5 text-white/60/60" />
                                                </div>
                                                <div>
                                                    <p className="text-sm text-white/90 group-hover:text-white/60 transition-colors">{engine.label}</p>
                                                    <p className="text-[10px] text-white/40/40 mt-1">{engine.desc}</p>
                                                </div>
                                            </div>
                                            <ExternalLink className="w-4 h-4 text-white/40/30 group-hover:text-white/60/60 transition-colors shrink-0" />
                                        </a>
                                    );
                                })}

                                {searchEngines.every(e => !results[e.urlKey as keyof typeof results]) && (
                                    <div className="border border-white/[0.08]/30 p-12 text-center">
                                        <p className="text-sm text-white/40/50">Image processed successfully</p>
                                        <p className="text-[10px] text-white/40/30 uppercase tracking-wider mt-2">
                                            Open the file picker above to search a different image
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Deep Search section */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <p className="text-xs text-white/40/60 uppercase tracking-wider font-semibold">AI Deep Search</p>
                                    {searchFileBlob && onDeepSearch && !deepLoading && displayDeepResults.length === 0 && (
                                        <button
                                            onClick={handleDeepSearch}
                                            className="flex items-center gap-2 px-4 py-2 text-[10px] uppercase tracking-wider border border-white/[0.15]/40 text-white/60 hover:bg-white/[0.06] transition-all"
                                        >
                                            <Sparkles className="w-3 h-3" />
                                            Deep Search
                                        </button>
                                    )}
                                </div>

                                {deepLoading && (
                                    <div className="flex items-center justify-center py-12 gap-4">
                                        <Loader2 className="h-6 w-6 text-white/60/60 animate-spin" />
                                        <div>
                                            <p className="text-xs text-white/70">AI is searching visually similar images...</p>
                                            <p className="text-[10px] text-white/40/40 mt-1">Describes image, generates queries, searches web, compares hashes</p>
                                        </div>
                                    </div>
                                )}

                                {deepError && (
                                    <div className="flex items-center gap-3 px-4 py-3 border border-red-900/40">
                                        <AlertTriangle className="w-4 h-4 text-red-400/60 shrink-0" />
                                        <p className="text-xs text-red-400/70">{deepError}</p>
                                    </div>
                                )}

                                {_deepResults?.description && (
                                    <div className="px-4 py-3 border border-white/[0.08]/20">
                                        <p className="text-[10px] text-white/40/50 uppercase tracking-wider mb-2">AI Description</p>
                                        <p className="text-xs text-white/40/50 leading-relaxed">{_deepResults.description.slice(0, 300)}...</p>
                                    </div>
                                )}

                                {displayDeepResults.length > 0 && (
                                    <div>
                                        <p className="text-[10px] text-white/40/40 uppercase tracking-wider mb-3">
                                            {_deepResults?.images_searched ? `${_deepResults.images_searched} images searched · ` : ''}
                                            {displayDeepResults.length} matches found
                                        </p>
                                        <div className="grid grid-cols-2 gap-3">
                                            {displayDeepResults.map((item, idx) => (
                                                <a
                                                    key={idx}
                                                    href={item.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="group border border-white/[0.08]/20 hover:border-white/[0.15]/40 transition-all"
                                                >
                                                    <div className="aspect-square bg-white/[0.03]/10 flex items-center justify-center overflow-hidden">
                                                        <img
                                                            src={item.url}
                                                            alt={item.title || 'Deep search result'}
                                                            className="w-full h-full object-cover"
                                                            loading="lazy"
                                                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                                        />
                                                    </div>
                                                    <div className="p-2 flex items-center justify-between">
                                                        <span className="text-[10px] text-white/60/70">{item.similarity}%</span>
                                                        <span className="text-[9px] text-white/40/40">dist: {item.hash_distance}</span>
                                                    </div>
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {!deepLoading && !deepError && displayDeepResults.length === 0 && !_deepResults && searchFileBlob && onDeepSearch && (
                                    <p className="text-[10px] text-white/40/30 italic">
                                        Click "Deep Search" to use NVIDIA AI to find visually similar images on the web
                                    </p>
                                )}
                            </div>

                            {results.similar_files && results.similar_files.length > 0 && (
                                <div className="space-y-4">
                                    <p className="text-xs text-white/40/60 uppercase tracking-wider font-semibold">Similar Files in Vault</p>
                                    <div className="border border-white/[0.08]/20 divide-y divide-white/[0.08]/20">
                                        {results.similar_files.map((sf) => (
                                            <div key={sf.scan_id} className="flex items-center justify-between p-3">
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <Copy className="w-4 h-4 text-white/60/40 shrink-0" />
                                                    <span className="text-xs text-white/70 truncate">{sf.file_name}</span>
                                                </div>
                                                <span className="text-[10px] text-white/40/40 shrink-0 ml-4">
                                                    {sf.hash_distance === 0 ? 'Exact match' : `Distance: ${sf.hash_distance}`}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
