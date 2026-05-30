'use client';

import { X, Search, Globe, ExternalLink, Loader2, AlertTriangle, Hash, Copy } from 'lucide-react';
import { motion } from 'framer-motion';

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
}

interface SearchResultsModalProps {
    isOpen: boolean;
    onClose: () => void;
    fileName: string;
    results: SearchResults | null;
    loading: boolean;
    error: string | null;
}

const easeLuxury = [0.16, 1, 0.3, 1] as const;

const searchEngines = [
    { key: 'yandex', label: 'Yandex Images', desc: 'Search on Yandex', urlKey: '_yandexUrl' as const },
    { key: 'bing', label: 'Bing Images', desc: 'Search on Bing', urlKey: '_bingUrl' as const },
    { key: 'googleLens', label: 'Google Lens', desc: 'Search with Google Lens', urlKey: '_googleLensUrl' as const },
    { key: 'saucenao', label: 'SauceNAO', desc: 'Search on SauceNAO (anime/art)', urlKey: '_saucenaoUrl' as const },
    { key: 'tineye', label: 'TinEye', desc: 'Search on TinEye', urlKey: '_tineyeUrl' as const },
];

export function SearchResultsModal({ isOpen, onClose, fileName, results, loading, error }: SearchResultsModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
            <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={onClose} />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, ease: easeLuxury }}
                className="relative w-full max-w-2xl bg-black border border-luxury-steel/30 max-h-[90vh] flex flex-col"
            >
                <div className="flex items-center justify-between px-8 py-6 border-b border-luxury-steel/30">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 border border-luxury-gold/50 flex items-center justify-center">
                            <Search className="h-4 w-4 text-luxury-gold" />
                        </div>
                        <div>
                            <h3 className="text-sm font-display text-luxury-cream uppercase tracking-wide">Reverse Image Search</h3>
                            <p className="text-[10px] text-luxury-muted/60 uppercase tracking-ultra-wide mt-1 truncate max-w-[300px]">{fileName}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-luxury-muted/40 hover:text-luxury-cream transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8">
                    {loading && (
                        <div className="flex flex-col items-center justify-center py-24 gap-6">
                            <Loader2 className="h-8 w-8 text-luxury-gold/60 animate-spin" />
                            <div className="text-center">
                                <p className="text-sm text-luxury-cream/80 font-display mb-2">Processing image...</p>
                                <p className="text-[10px] text-luxury-muted/50 uppercase tracking-wider">Computing perceptual hash</p>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="flex flex-col items-center justify-center py-24 gap-4">
                            <AlertTriangle className="h-8 w-8 text-amber-400/60" />
                            <p className="text-sm text-luxury-muted/70">{error}</p>
                        </div>
                    )}

                    {results && !loading && !error && (
                        <div className="space-y-8">
                            {results.original_hash && (
                                <div className="flex items-center gap-3 px-4 py-3 border border-luxury-steel/20">
                                    <Hash className="w-4 h-4 text-luxury-gold/50 shrink-0" />
                                    <div>
                                        <p className="text-[10px] text-luxury-muted/50 uppercase tracking-wider">Fingerprint (dHash)</p>
                                        <p className="text-xs text-luxury-muted/30 font-mono mt-1">{results.original_hash}</p>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-4">
                                <p className="text-xs text-luxury-muted/60 uppercase tracking-wider font-semibold">Search Engines</p>

                                {searchEngines.map(engine => {
                                    const url = results[engine.urlKey as keyof typeof results] as string | undefined;
                                    if (!url) return null;
                                    return (
                                        <a
                                            key={engine.key}
                                            href={url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-between p-4 border border-luxury-steel/20 hover:border-luxury-gold/40 hover:bg-luxury-gold/5 transition-all duration-200 group"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-luxury-steel/10 flex items-center justify-center">
                                                    <Globe className="h-5 w-5 text-luxury-gold/60" />
                                                </div>
                                                <div>
                                                    <p className="text-sm text-luxury-cream/90 group-hover:text-luxury-gold transition-colors">{engine.label}</p>
                                                    <p className="text-[10px] text-luxury-muted/40 mt-1">{engine.desc}</p>
                                                </div>
                                            </div>
                                            <ExternalLink className="w-4 h-4 text-luxury-muted/30 group-hover:text-luxury-gold/60 transition-colors shrink-0" />
                                        </a>
                                    );
                                })}

                                {searchEngines.every(e => !results[e.urlKey as keyof typeof results]) && (
                                    <div className="border border-luxury-steel/30 p-12 text-center">
                                        <p className="text-sm text-luxury-muted/50">Image processed successfully</p>
                                        <p className="text-[10px] text-luxury-muted/30 uppercase tracking-wider mt-2">
                                            Open the file picker above to search a different image
                                        </p>
                                    </div>
                                )}
                            </div>

                            {results.similar_files && results.similar_files.length > 0 && (
                                <div className="space-y-4">
                                    <p className="text-xs text-luxury-muted/60 uppercase tracking-wider font-semibold">Similar Files in Vault</p>
                                    <div className="border border-luxury-steel/20 divide-y divide-luxury-steel/20">
                                        {results.similar_files.map((sf) => (
                                            <div key={sf.scan_id} className="flex items-center justify-between p-3">
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <Copy className="w-4 h-4 text-luxury-gold/40 shrink-0" />
                                                    <span className="text-xs text-luxury-cream/70 truncate">{sf.file_name}</span>
                                                </div>
                                                <span className="text-[10px] text-luxury-muted/40 shrink-0 ml-4">
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
