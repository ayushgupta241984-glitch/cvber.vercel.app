'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Bot, Search, Globe, FileText, AlertCircle, Image, Shield, FolderOpen, Loader2, Trash2, X, ExternalLink } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { motion, AnimatePresence } from 'framer-motion';
import { easeLuxurySharp as easeLuxury } from '@/lib/animations';

interface ToolCall {
    name: string;
    arguments: Record<string, any>;
    result: string;
}

interface CopyResult {
    url: string;
    confidence?: number;
    source?: string;
    platform?: string;
    thumbnail_url?: string;
}

function getConfidenceBadge(confidence?: number) {
    if (!confidence) return null;
    if (confidence >= 0.85) return <span className="text-[8px] uppercase tracking-wider font-bold px-1.5 py-0.5 bg-white/15 text-white/80">Confirmed</span>;
    if (confidence >= 0.70) return <span className="text-[8px] uppercase tracking-wider font-semibold px-1.5 py-0.5 bg-white/[0.08] text-white/50">Likely</span>;
    return <span className="text-[8px] uppercase tracking-wider font-semibold px-1.5 py-0.5 bg-white/[0.04] text-white/30">Possible</span>;
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
    try { return new URL(url).hostname.replace('www.', '').split('.')[0]; } catch { return 'Unknown'; }
}

function CopyCard({ copy }: { copy: CopyResult }) {
    const platform = copy.platform || getPlatformFromUrl(copy.url);
    return (
        <div className="border border-white/[0.06] p-3 flex items-start gap-3">
            <div className="w-10 h-10 bg-white/[0.03] flex items-center justify-center shrink-0">
                <Globe className="w-3 h-3 text-white/15" />
            </div>
            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                    {getConfidenceBadge(copy.confidence)}
                    <span className="text-[9px] text-white/30 uppercase tracking-wider">{platform}</span>
                </div>
                <a
                    href={copy.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-white/40 hover:text-white/60 truncate block transition-colors"
                >
                    {copy.url}
                </a>
            </div>
            <a
                href={copy.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/15 hover:text-white/40 shrink-0 mt-1 transition-colors"
            >
                <ExternalLink className="w-3 h-3" />
            </a>
        </div>
    );
}

function CopyResultsCard({ tc }: { tc: ToolCall }) {
    let matchCount = 0;
    let similarCount = 0;
    let matches: CopyResult[] = [];
    let similar: CopyResult[] = [];

    try {
        const data = JSON.parse(tc.result);
        matchCount = data.match_count || 0;
        similarCount = data.similar_count || 0;
        matches = (data.matches || []).map((m: any) => ({
            url: m.url || m.infringer_url,
            confidence: m.confidence || (matchCount > 0 ? 0.9 : undefined),
            source: m.source,
            platform: m.platform,
            thumbnail_url: m.thumbnail_url,
        }));
        similar = (data.similar || []).map((s: any) => ({
            url: s.url,
            confidence: s.confidence || 0.6,
            source: s.source,
            platform: s.platform,
        }));
    } catch {
        return null;
    }

    const total = matchCount + similarCount;
    if (total === 0) return null;

    return (
        <div className="mt-3 space-y-1">
            <div className="flex items-center gap-2 mb-2">
                <Search className="w-2.5 h-2.5 text-white/20" />
                <span className="text-[9px] uppercase tracking-[0.15em] text-white/25 font-semibold">
                    {total} result{total !== 1 ? 's' : ''} found
                </span>
            </div>

            {matches.length > 0 && (
                <div className="space-y-1">
                    {matches.map((copy, i) => <CopyCard key={`m-${i}`} copy={copy} />)}
                </div>
            )}

            {similar.length > 0 && (
                <div className="space-y-1 mt-2">
                    <p className="text-[8px] uppercase tracking-wider text-white/15 mb-1">Visually similar</p>
                    {similar.slice(0, 3).map((copy, i) => <CopyCard key={`s-${i}`} copy={copy} />)}
                    {similar.length > 3 && (
                        <p className="text-[9px] text-white/15">+ {similar.length - 3} more</p>
                    )}
                </div>
            )}
        </div>
    );
}

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    tool_calls?: ToolCall[];
    thinking?: string;
    timestamp: Date;
}

interface FileData {
    id: string;
    name: string;
    size: number;
    hash?: string;
    status: 'safe' | 'warning' | 'scanning' | 'danger';
    riskScore?: number;
    originalityScore?: number;
}

function getStatusIcon(status: string) {
    if (status === 'danger') return <span className="w-2 h-2 bg-red-400 shrink-0" />;
    if (status === 'warning') return <span className="w-2 h-2 bg-amber-400 shrink-0" />;
    return <span className="w-2 h-2 bg-green-400 shrink-0" />;
}

function getScoreColor(score?: number) {
    if (score === undefined) return 'text-white/30';
    if (score >= 70) return 'text-red-400';
    if (score >= 30) return 'text-amber-400';
    return 'text-green-400';
}

function linkify(text: string) {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    return parts.map((part, i) =>
        part.startsWith('http://') || part.startsWith('https://')
            ? <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="underline text-white/50 hover:text-white/80">{part}</a>
            : part
    );
}

function searchFilesLocal(query: string, files: FileData[]): { message: string; results: { name: string; score?: number; status: string; originality?: number }[] } {
    const q = query.toLowerCase().trim();
    if (!q) return { message: "Ask me something about your collection.", results: [] };

    const isHelp = /^(help|what can you do|commands|\?)$/i.test(q);
    if (isHelp) {
        return {
            message: `I can search and analyze your collection locally. Try:\n\n- "show high risk files" — files with risk ≥ 70\n- "find [name]" — search by name\n- "summary" — collection overview\n- "safe files" / "warnings" — filter by status\n- "score above 50" — files above threshold\n- "analyze [name]" — detailed breakdown\n- "help" — this message`,
            results: []
        };
    }

    const isSummary = /^(summary|overview|status|stats?|dashboard|all files|collection|count)$/i.test(q);
    if (isSummary) {
        const total = files.length;
        const dangers = files.filter(f => f.status === 'danger' || (f.riskScore ?? 0) >= 70).length;
        const warnings = files.filter(f => f.status === 'warning' || ((f.riskScore ?? 0) >= 30 && (f.riskScore ?? 0) < 70)).length;
        const safe = files.filter(f => f.status === 'safe' || (f.riskScore ?? 0) < 30).length;
        const avgScore = total > 0 ? Math.round(files.reduce((s, f) => s + (f.riskScore ?? 0), 0) / total) : 0;
        return {
            message: `${total} ${total === 1 ? 'piece' : 'pieces'} under watch. ${dangers > 0 ? `${dangers} flagged dangerous. ` : ''}${warnings > 0 ? `${warnings} require attention. ` : ''}${safe > 0 ? `${safe} verified safe. ` : ''}Average risk: ${avgScore}%.`,
            results: files.map(f => ({ name: f.name, score: f.riskScore, status: f.status, originality: f.originalityScore }))
        };
    }

    const dangerMatch = /(high risk|danger|critical|threat|risky|harmful|malicious)/i.test(q);
    const warningMatch = /(warning|medium risk|suspicious|attention|review|caution)/i.test(q);
    const safeMatch = /(safe|clean|low risk|authentic|verified|good)/i.test(q);

    if (dangerMatch && !warningMatch && !safeMatch) {
        const dangerFiles = files.filter(f => f.status === 'danger' || (f.riskScore ?? 0) >= 70);
        if (dangerFiles.length === 0) return { message: "No high-risk files found. Collection looks secure.", results: [] };
        return { message: `${dangerFiles.length} flagged as high risk:`, results: dangerFiles.map(f => ({ name: f.name, score: f.riskScore, status: f.status, originality: f.originalityScore })) };
    }
    if (warningMatch && !dangerMatch && !safeMatch) {
        const warningFiles = files.filter(f => f.status === 'warning' || ((f.riskScore ?? 0) >= 30 && (f.riskScore ?? 0) < 70));
        if (warningFiles.length === 0) return { message: "No files require attention.", results: [] };
        return { message: `${warningFiles.length} flagged for attention:`, results: warningFiles.map(f => ({ name: f.name, score: f.riskScore, status: f.status, originality: f.originalityScore })) };
    }
    if (safeMatch && !dangerMatch && !warningMatch) {
        const safeFiles = files.filter(f => f.status === 'safe' || (f.riskScore ?? 0) < 30);
        if (safeFiles.length === 0) return { message: "No verified safe files yet.", results: [] };
        return { message: `${safeFiles.length} verified as safe:`, results: safeFiles.map(f => ({ name: f.name, score: f.riskScore, status: f.status, originality: f.originalityScore })) };
    }

    const scoreMatch = q.match(/score\s*(above|below|over|under|>|<|>=|<=|greater|less|higher|lower)?\s*(\d+)/i);
    if (scoreMatch) {
        const threshold = parseInt(scoreMatch[2], 10);
        const isAbove = /^(above|over|>|>=|greater|higher)$/i.test(scoreMatch[1] || 'above');
        const filtered = files.filter(f => isAbove ? (f.riskScore ?? 0) >= threshold : (f.riskScore ?? 0) < threshold);
        if (filtered.length === 0) return { message: `No files with risk score ${isAbove ? '≥' : '<'} ${threshold}.`, results: [] };
        return { message: `${filtered.length} with risk score ${isAbove ? '≥' : '<'} ${threshold}:`, results: filtered.map(f => ({ name: f.name, score: f.riskScore, status: f.status, originality: f.originalityScore })) };
    }

    const findMatch = q.match(/(?:find|search|look|locate|show|where|get|open)\s*(?:for\s*)?["']?(.+?)["']?$/i);
    if (findMatch) {
        const searchTerm = findMatch[1].toLowerCase().replace(/\s+(online|web|internet|google)$/i, '').trim();
        const matched = searchTerm ? files.filter(f => f.name.toLowerCase().includes(searchTerm)) : [];
        if (matched.length === 0) return { message: files.length > 0 ? `No files match "${searchTerm}". Here's your full collection:` : `No files found. Upload some art first.`, results: files.map(f => ({ name: f.name, score: f.riskScore, status: f.status, originality: f.originalityScore })) };
        return { message: `Found ${matched.length} for "${searchTerm}":`, results: matched.map(f => ({ name: f.name, score: f.riskScore, status: f.status, originality: f.originalityScore })) };
    }

    const analyzeMatch = q.match(/(?:analyze|examine|inspect|details?|info|tell me about)\s*(?:file\s*)?["']?(.+?)["']?$/i);
    if (analyzeMatch) {
        const searchTerm = analyzeMatch[1].toLowerCase();
        const matched = files.filter(f => f.name.toLowerCase().includes(searchTerm));
        if (matched.length === 0) return { message: `No files matching "${searchTerm}" to analyze.`, results: [] };
        const f = matched[0];
        const risk = f.riskScore ?? 0;
        const orig = f.originalityScore ?? 0;
        let analysis = `**${f.name}** — ${risk >= 70 ? 'HIGH RISK' : risk >= 30 ? 'NEEDS REVIEW' : 'VERIFIED SAFE'}\n\n`;
        analysis += `Risk Score: ${risk}%`;
        if (f.originalityScore !== undefined) {
            analysis += `\nOriginality: ${orig}%`;
            if (orig < 30) analysis += ` — may be generated or derivative`;
            else if (orig >= 70) analysis += ` — likely original`;
        }
        return { message: analysis, results: [{ name: f.name, score: f.riskScore, status: f.status, originality: f.originalityScore }] };
    }

    const nameSearch = files.filter(f => f.name.toLowerCase().includes(q));
    if (nameSearch.length > 0) return { message: `Found ${nameSearch.length} matching your query:`, results: nameSearch.map(f => ({ name: f.name, score: f.riskScore, status: f.status, originality: f.originalityScore })) };

    const vagueQuery = /^(my art|art|my work|my files|my collection|everything|all|show|what)/i.test(q);
    if (vagueQuery && files.length > 0) return { message: "Everything in your vault:", results: files.map(f => ({ name: f.name, score: f.riskScore, status: f.status, originality: f.originalityScore })) };

    return { message: `I didn't understand. Try "help" to see what I can do.`, results: [] };
}

function isLocalCommand(input: string): boolean {
    const q = input.toLowerCase().trim();
    return /^(help|summary|overview|status|stats?|dashboard|all files|collection|count|find|search|look|locate|show|where|get|open|safe|clean|low risk|warning|danger|high risk|critical|risky|score|analyze|examine|inspect|details?|info|tell me about|my art|my work|my files|my collection|everything|all)/i.test(q) ||
        /score\s*(above|below|over|under|>|<|>=|<=|greater|less|higher|lower)?\s*\d+/i.test(q);
}

const WELCOME_MESSAGE = "Welcome to your studio. I am your archivist, your investigator, and the eyes that scan the open web on your behalf. I have full access to your collection — I can search for unauthorised reproductions, verify blockchain anchors, and trace the provenance of any piece in your vault. What would you like me to pursue?";

export function AIAgentChat() {
    const [messages, setMessages] = useState<Message[]>([{
        id: '1',
        role: 'assistant',
        content: WELCOME_MESSAGE,
        timestamp: new Date(),
    }]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [vaultFiles, setVaultFiles] = useState<FileData[]>([]);
    const [showFilePicker, setShowFilePicker] = useState(false);
    const [pickingLoading, setPickingLoading] = useState(false);
    const [fileSearch, setFileSearch] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const load = async () => {
            try {
                const vault = await apiClient.listVaultFiles(50, 0);
                setVaultFiles(vault.files || []);
            } catch (_) { /* offline or no files */ }
        };
        load();
    }, []);

    const filteredFiles = vaultFiles.filter(f =>
        f.name.toLowerCase().includes(fileSearch.toLowerCase())
    );

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, []);

    useEffect(() => { scrollToBottom(); }, [messages, isTyping, scrollToBottom]);

    const handleSend = useCallback(async () => {
        if (!input.trim()) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input,
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsTyping(true);
        setError(null);

        try {
            // PATH A: Local command parser (instant, no network)
            if (isLocalCommand(input)) {
                const result = searchFilesLocal(input, vaultFiles);
                const aiMessage: Message = {
                    id: (Date.now() + 1).toString(),
                    role: 'assistant',
                    content: result.message,
                    timestamp: new Date(),
                };
                setMessages(prev => [...prev, aiMessage]);
                setIsTyping(false);
                return;
            }

            // PATH B: Hermes agent via backend
            const history = messages.map(msg => ({
                role: msg.role === 'assistant' ? 'assistant' as const : 'user' as const,
                content: msg.content
            }));

            const response = await apiClient.agentChat(input, history);

            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: response.response,
                tool_calls: response.tool_calls || [],
                thinking: response.thinking,
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, aiMessage]);
        } catch (err: any) {
            // PATH C: Fallback — archivist offline or waking up
            const status = err?.status || err?.statusCode;
            const msg = err?.message || String(err);
            console.error(`Agent chat error [${status}]: ${msg}`);
            setError(null);
            const isTimeout = err?.name === 'AbortError' || msg?.includes('timeout') || msg?.includes('Failed to fetch') || status === 0;
            const isAuth = status === 401;
            // Extract actual error detail from backend response
            const errorDetail = msg?.replace(/^HTTP \d+/, '').replace(/^Agent chat failed:\s*/i, '').trim();
            const offlineMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: isTimeout
                    ? "The backend is waking up from sleep. This usually takes 30-60 seconds on first use."
                    : isAuth
                    ? "Authentication failed. Please log out and log back in, then try again."
                    : errorDetail && errorDetail !== `HTTP ${status}`
                    ? `The archivist encountered an issue: ${errorDetail.slice(0, 200)}`
                    : `The archivist is currently unavailable (error ${status || 'unknown'}). I can still search your local collection — try "help" to see what I can do.`,
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, offlineMessage]);
        } finally {
            setIsTyping(false);
        }
    }, [input, messages, vaultFiles]);

    const handleClear = useCallback(() => {
        setMessages([{
            id: Date.now().toString(),
            role: 'assistant',
            content: WELCOME_MESSAGE,
            timestamp: new Date(),
        }]);
        setError(null);
    }, []);

    const pickFile = useCallback((file: FileData) => {
        setShowFilePicker(false);
        setFileSearch('');
        setInput(`find copies of ${file.name}`);
        setTimeout(() => {
            const userMessage: Message = {
                id: Date.now().toString(),
                role: 'user',
                content: `find copies of ${file.name}`,
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, userMessage]);
            setInput('');
            setIsTyping(true);
            // Try hermes for this specific request
            apiClient.agentChat(`find copies of ${file.name}`, []).then(response => {
                setMessages(prev => [...prev, {
                    id: (Date.now() + 1).toString(),
                    role: 'assistant',
                    content: response.response,
                    tool_calls: response.tool_calls || [],
                    thinking: response.thinking,
                    timestamp: new Date(),
                }]);
            }).catch(() => {
                setMessages(prev => [...prev, {
                    id: (Date.now() + 1).toString(),
                    role: 'assistant',
                    content: `Searching for copies of **${file.name}** requires the web surveillance agent, which is currently offline. The local collection shows ${vaultFiles.length} files total.`,
                    timestamp: new Date(),
                }]);
            }).finally(() => setIsTyping(false));
        }, 50);
    }, [vaultFiles]);

    return (
        <div className="flex flex-col h-full bg-[#0a0a0a] overflow-hidden border border-white/[0.08]" style={{ borderRadius: 8 }}>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08]">
                <div className="flex items-center gap-3">
                    <img src="/logo.svg" alt="CVBER" className="w-8 h-8" style={{ borderRadius: 6 }} />
                    <div>
                        <h3 className="text-xs font-bold tracking-wide text-white/90 uppercase">The Archivist</h3>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="w-1 h-1 bg-white/20" />
                            <p className="text-[9px] uppercase tracking-[0.2em] text-white/25">Web Surveillance</p>
                        </div>
                    </div>
                </div>
                <button
                    onClick={handleClear}
                    className="p-2 text-white/20 hover:text-white/50 transition-colors"
                    title="Clear conversation"
                >
                    <Trash2 className="w-3.5 h-3.5" />
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
                <AnimatePresence>
                    {messages.map((message) => (
                        <motion.div
                            key={message.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, ease: easeLuxury }}
                        >
                            <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] ${message.role === 'user' ? 'bg-white/[0.06] px-5 py-3' : 'px-0 py-0'}`} style={{ borderRadius: message.role === 'user' ? 6 : 0 }}>
                                    <p className="text-[13px] leading-relaxed whitespace-pre-wrap text-white/80">{linkify(message.content)}</p>

                                    {message.thinking && message.thinking.length > 0 && (
                                        <div className="mt-4 pt-3 border-t border-white/[0.06] space-y-1.5">
                                            <p className="text-[9px] text-white/20 uppercase tracking-[0.2em] mb-2">Process</p>
                                            {message.thinking.split('\n').map((step: string, i: number) => (
                                                <div key={i} className="flex items-start gap-2 text-[10px] text-white/25">
                                                    <span className="text-white/15 mt-0.5">●</span>
                                                    <span>{step}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {message.tool_calls && message.tool_calls.length > 0 && (
                                        <div className="mt-3 space-y-2">
                                            {message.tool_calls.map((tc, i) => (
                                                tc.name === 'find_image_copies' ? (
                                                    <CopyResultsCard key={i} tc={tc} />
                                                ) : (
                                                    <div key={i} className="flex items-center gap-2 text-[10px] text-white/30 border border-white/[0.06] px-3 py-1.5" style={{ borderRadius: 4 }}>
                                                        <Search className="w-2.5 h-2.5 shrink-0 text-white/20" />
                                                        <span className="text-white/40">{tc.name}</span>
                                                        <span className="text-white/15">—</span>
                                                        <span className="truncate max-w-[180px]">{tc.result?.slice(0, 60) || 'done'}</span>
                                                    </div>
                                                )
                                            ))}
                                        </div>
                                    )}

                                    <div className={`text-[9px] mt-2 uppercase tracking-[0.15em] text-white/15`}>
                                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                <AnimatePresence>
                    {isTyping && (
                        <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.2, ease: easeLuxury }}
                            className="flex justify-start"
                        >
                            <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-white/20 animate-pulse" />
                                <span className="text-[11px] text-white/25 uppercase tracking-[0.15em]">considering...</span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.2 }}
                            className="flex justify-center"
                        >
                            <div className="flex items-center gap-2 px-4 py-2 border border-white/[0.08]">
                                <AlertCircle className="w-3.5 h-3.5 text-white/30 shrink-0" />
                                <span className="text-[11px] text-white/40">{error}</span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="px-6 py-4 border-t border-white/[0.08]">
                <div className="flex gap-0 border border-white/[0.08] focus-within:border-white/[0.15] transition-colors" style={{ borderRadius: 6 }}>
                    <button
                        onClick={() => {
                            setPickingLoading(true);
                            apiClient.listVaultFiles(50, 0).then(v => {
                                setVaultFiles(v.files || []);
                                setShowFilePicker(true);
                            }).catch(() => setError('Failed to load vault')).finally(() => setPickingLoading(false));
                        }}
                        disabled={isTyping}
                        className="px-3.5 text-white/25 hover:text-white/50 transition-colors disabled:opacity-30"
                        title="Pick a file from vault"
                    >
                        {pickingLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FolderOpen className="h-3.5 w-3.5" />}
                    </button>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                        suppressHydrationWarning
                        placeholder="Search for unauthorised reproductions..."
                        className="flex-1 bg-transparent px-4 py-3 text-[13px] text-white/80 placeholder-white/20 focus:outline-none"
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || isTyping}
                        suppressHydrationWarning
                        className="px-4 text-white/30 hover:text-white/60 transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
                    >
                        <Send className="h-3.5 w-3.5" />
                    </button>
                </div>

                <AnimatePresence>
                    {showFilePicker && (
                        <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            className="mt-2 border border-white/[0.08] bg-[#0a0a0a] max-h-[220px] overflow-hidden flex flex-col"
                            style={{ borderRadius: 6 }}
                        >
                            <div className="flex items-center justify-between px-3 py-2 border-b border-white/[0.06]">
                                <input
                                    type="text"
                                    value={fileSearch}
                                    onChange={(e) => setFileSearch(e.target.value)}
                                    placeholder="Search files..."
                                    className="flex-1 bg-transparent text-[11px] text-white/60 placeholder-white/20 focus:outline-none"
                                />
                                <button onClick={() => { setShowFilePicker(false); setFileSearch(''); }} className="text-white/20 hover:text-white/40 ml-2">
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                            <div className="overflow-y-auto max-h-[180px]">
                                {filteredFiles.length === 0 ? (
                                    <div className="px-4 py-6 text-center text-[11px] text-white/20 uppercase tracking-wider">
                                        No files in vault. Upload one first.
                                    </div>
                                ) : (
                                    filteredFiles.map((f) => (
                                        <button
                                            key={f.id}
                                            onClick={() => pickFile(f)}
                                            className="w-full text-left px-4 py-2.5 text-[11px] text-white/50 hover:bg-white/[0.03] border-b border-white/[0.04] last:border-b-0 flex items-center gap-3 transition-colors"
                                        >
                                            <Image className="w-2.5 h-2.5 text-white/15 shrink-0" />
                                            <span className="truncate flex-1 text-white/60">{f.name}</span>
                                            <span className="text-white/15 shrink-0">{(f.size / 1024).toFixed(0)}KB</span>
                                        </button>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="flex items-center gap-2 mt-2">
                    <Search className="w-2.5 h-2.5 text-white/10 shrink-0" />
                    <p className="text-[9px] text-white/15">
                        {vaultFiles.length} {vaultFiles.length === 1 ? 'file' : 'files'} in collection
                    </p>
                </div>
            </div>
        </div>
    );
}
