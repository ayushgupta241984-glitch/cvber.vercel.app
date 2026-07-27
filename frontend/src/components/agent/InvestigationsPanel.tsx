'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, ChevronDown, ChevronRight, ExternalLink } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { motion, AnimatePresence } from 'framer-motion';
import { easeLuxurySharp as easeLuxury } from '@/lib/animations';

interface Finding {
    url: string;
    confidence?: number;
    source?: string;
    platform?: string;
}

interface Investigation {
    id: string;
    scan_id: string;
    file_name: string;
    match_count: number;
    similar_count: number;
    findings: Finding[];
    thinking_log?: string;
    created_at: string;
}

function getConfidenceBadge(confidence?: number) {
    if (!confidence) return null;
    if (confidence >= 0.85) return <span className="text-[9px] uppercase tracking-wider font-semibold px-1.5 py-0.5 bg-white/10 text-white/70">Confirmed</span>;
    if (confidence >= 0.70) return <span className="text-[9px] uppercase tracking-wider font-semibold px-1.5 py-0.5 bg-white/[0.06] text-white/50">Likely</span>;
    return <span className="text-[9px] uppercase tracking-wider font-semibold px-1.5 py-0.5 bg-white/[0.03] text-white/30">Possible</span>;
}

function getPlatformFromUrl(url: string): string {
    const lower = url.toLowerCase();
    if (lower.includes('deviantart')) return 'DeviantArt';
    if (lower.includes('artstation')) return 'ArtStation';
    if (lower.includes('pixiv')) return 'Pixiv';
    if (lower.includes('instagram')) return 'Instagram';
    if (lower.includes('twitter') || lower.includes('x.com')) return 'Twitter/X';
    if (lower.includes('pinterest')) return 'Pinterest';
    if (lower.includes('tumblr')) return 'Tumblr';
    if (lower.includes('reddit')) return 'Reddit';
    if (lower.includes('facebook')) return 'Facebook';
    if (lower.includes('etsy')) return 'Etsy';
    if (lower.includes('redbubble')) return 'Redbubble';
    if (lower.includes('society6')) return 'Society6';
    if (lower.includes('fineartamerica')) return 'Fine Art America';
    if (lower.includes('behance')) return 'Behance';
    if (lower.includes('dribbble')) return 'Dribbble';
    return new URL(url).hostname.replace('www.', '');
}

export function InvestigationsPanel() {
    const [investigations, setInvestigations] = useState<Investigation[]>([]);
    const [expanded, setExpanded] = useState<string | null>(null);

    const load = useCallback(async () => {
        try {
            const result = await apiClient.getInvestigations();
            setInvestigations(result.investigations || []);
        } catch (_) { /* offline */ }
    }, []);

    useEffect(() => { load(); }, [load]);

    if (investigations.length === 0) return null;

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2">
                <Search className="w-3 h-3 text-white/20" />
                <span className="text-[10px] uppercase tracking-[0.15em] text-white/30 font-semibold">Investigations</span>
            </div>

            <div className="space-y-0 border border-white/[0.06]">
                {investigations.map(inv => (
                    <div key={inv.id} className="border-b border-white/[0.04] last:border-b-0">
                        <button
                            onClick={() => setExpanded(expanded === inv.id ? null : inv.id)}
                            className="w-full text-left px-4 py-3 flex items-center justify-between hover:bg-white/[0.02] transition-colors"
                        >
                            <div className="min-w-0 flex-1">
                                <p className="text-[11px] text-white/60 truncate">{inv.file_name}</p>
                                <p className="text-[9px] text-white/20 mt-0.5 uppercase tracking-wider">
                                    {inv.match_count} match{inv.match_count !== 1 ? 'es' : ''} · {inv.similar_count} similar · {new Date(inv.created_at).toLocaleDateString()}
                                </p>
                            </div>
                            {expanded === inv.id
                                ? <ChevronDown className="w-3 h-3 text-white/20 shrink-0 ml-2" />
                                : <ChevronRight className="w-3 h-3 text-white/20 shrink-0 ml-2" />
                            }
                        </button>

                        <AnimatePresence>
                            {expanded === inv.id && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.15, ease: easeLuxury }}
                                    className="overflow-hidden"
                                >
                                    <div className="px-4 pb-3 space-y-2">
                                        {inv.findings?.map((f, i) => (
                                            <div key={i} className="flex items-center justify-between py-2 border-b border-white/[0.03] last:border-b-0">
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-2">
                                                        {getConfidenceBadge(f.confidence)}
                                                        <span className="text-[10px] text-white/40">{f.platform || getPlatformFromUrl(f.url)}</span>
                                                    </div>
                                                    <a
                                                        href={f.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-[10px] text-white/30 hover:text-white/50 truncate block mt-1 transition-colors"
                                                    >
                                                        {f.url}
                                                    </a>
                                                </div>
                                                <a
                                                    href={f.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-white/15 hover:text-white/40 ml-2 shrink-0 transition-colors"
                                                >
                                                    <ExternalLink className="w-3 h-3" />
                                                </a>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ))}
            </div>
        </div>
    );
}
