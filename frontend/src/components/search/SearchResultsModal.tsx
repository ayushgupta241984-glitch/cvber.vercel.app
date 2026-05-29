'use client';

import { X, Search, Globe, ExternalLink, Loader2, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

interface MatchResult {
    source: string;
    url: string;
    title?: string;
    thumbnail?: string;
    site?: string;
    similarity: number;
}

interface SearchResults {
    total_urls_found: number;
    matches: MatchResult[];
    high_confidence_matches: number;
    medium_confidence_matches: number;
    original_hash: string;
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

function SimilarityBadge({ score }: { score: number }) {
    if (score >= 70) {
        return <span className="text-[10px] font-semibold text-green-400 uppercase tracking-wider">High Match</span>;
    }
    if (score >= 50) {
        return <span className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider">Medium Match</span>;
    }
    return <span className="text-[10px] font-semibold text-luxury-muted/50 uppercase tracking-wider">Low Match</span>;
}

export function SearchResultsModal({ isOpen, onClose, fileName, results, loading, error }: SearchResultsModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
            <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={onClose} />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, ease: easeLuxury }}
                className="relative w-full max-w-4xl bg-black border border-luxury-steel/30 max-h-[90vh] flex flex-col"
            >
                <div className="flex items-center justify-between px-8 py-6 border-b border-luxury-steel/30">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 border border-luxury-gold/50 flex items-center justify-center">
                            <Search className="h-4 w-4 text-luxury-gold" />
                        </div>
                        <div>
                            <h3 className="text-sm font-display text-luxury-cream uppercase tracking-wide">Web Search</h3>
                            <p className="text-[10px] text-luxury-muted/60 uppercase tracking-ultra-wide mt-1">{fileName}</p>
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
                                <p className="text-sm text-luxury-cream/80 font-display mb-2">Scanning the open web...</p>
                                <p className="text-[10px] text-luxury-muted/50 uppercase tracking-wider">Searching Yandex & Bing for copies</p>
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
                            <div className="flex items-center gap-6 text-[10px] uppercase tracking-ultra-wide">
                                <div className="flex items-center gap-2">
                                    <span className="text-luxury-muted/50">Total scanned</span>
                                    <span className="text-luxury-gold/80 font-semibold">{results.total_urls_found} URLs</span>
                                </div>
                                <div className="w-px h-4 bg-luxury-steel/30" />
                                <div className="flex items-center gap-2">
                                    <span className="text-luxury-muted/50">High confidence</span>
                                    <span className="text-green-400 font-semibold">{results.high_confidence_matches}</span>
                                </div>
                                <div className="w-px h-4 bg-luxury-steel/30" />
                                <div className="flex items-center gap-2">
                                    <span className="text-luxury-muted/50">Medium confidence</span>
                                    <span className="text-amber-400 font-semibold">{results.medium_confidence_matches}</span>
                                </div>
                            </div>

                            {results.matches.length === 0 ? (
                                <div className="border border-luxury-steel/30 p-12 text-center">
                                    <p className="text-sm text-luxury-muted/50">No matches found on the open web</p>
                                    <p className="text-[10px] text-luxury-muted/30 uppercase tracking-wider mt-2">Your work appears to be unique</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {results.matches.map((match, i) => (
                                        <motion.a
                                            key={i}
                                            href={match.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ duration: 0.2, ease: easeLuxury, delay: i * 0.02 }}
                                            className="flex items-center gap-4 p-4 border border-luxury-steel/20 hover:border-luxury-gold/30 hover:bg-luxury-gold/5 transition-all duration-200 group"
                                        >
                                            <div className="w-16 h-16 bg-luxury-steel/10 shrink-0 flex items-center justify-center overflow-hidden">
                                                {match.thumbnail ? (
                                                    <img src={match.thumbnail} alt="" className="w-full h-full object-cover"
                                                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                                    />
                                                ) : (
                                                    <Globe className="h-5 w-5 text-luxury-muted/30" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-luxury-cream/90 truncate group-hover:text-luxury-gold transition-colors">
                                                    {match.title || match.url}
                                                </p>
                                                <div className="flex items-center gap-3 mt-2">
                                                    <span className="text-[10px] text-luxury-muted/40">{match.source}</span>
                                                    <span className="text-luxury-steel/30">|</span>
                                                    <SimilarityBadge score={match.similarity} />
                                                    <span className="text-luxury-steel/30">|</span>
                                                    <span className="text-[10px] text-luxury-muted/30 font-mono">{match.url.slice(0, 50)}...</span>
                                                </div>
                                            </div>
                                            <ExternalLink className="w-4 h-4 text-luxury-muted/30 group-hover:text-luxury-gold/60 shrink-0 transition-colors" />
                                        </motion.a>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
