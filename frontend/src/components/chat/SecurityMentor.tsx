'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, Search, Shield, AlertTriangle, CheckCircle, FileText, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { easeLuxury } from '@/lib/animations';

interface FileData {
    id: string;
    name: string;
    size: number;
    hash?: string;
    status: 'safe' | 'warning' | 'scanning' | 'danger';
    riskScore?: number;
    originalityScore?: number;
}

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    results?: { name: string; score?: number; status: string; originality?: number }[];
    isSearchResult?: boolean;
    timestamp: Date;
}

interface SecurityMentorProps {
    context?: { files: FileData[] };
    onSearchFile?: (file: { id: string; name: string; storageUrl?: string; previewUrl?: string }) => void;
}

function getStatusIcon(status: string) {
    if (status === 'danger') return <AlertTriangle className="w-3 h-3 text-red-400 shrink-0" />;
    if (status === 'warning') return <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />;
    return <CheckCircle className="w-3 h-3 text-green-400 shrink-0" />;
}

function getScoreColor(score?: number) {
    if (score === undefined) return 'text-luxury-muted/40';
    if (score >= 70) return 'text-red-400';
    if (score >= 30) return 'text-amber-400';
    return 'text-green-400';
}

function searchFiles(query: string, files: FileData[]): { message: string; results: { name: string; score?: number; status: string; originality?: number }[] } {
    const q = query.toLowerCase().trim();

    if (!q) {
        return { message: "Please ask me something about your collection.", results: [] };
    }

    const isHelp = /^(help|what can you do|commands|\?)$/i.test(q);
    if (isHelp) {
        return {
            message: `I can help you search and analyze your collection. Try asking:

• "show high risk files" — lists files with risk score ≥ 70
• "find [name]" — search for a file by name
• "summary" — overview of your entire collection
• "safe files" / "warnings" — filter by status
• "score above 50" — files above a risk threshold
• "analyze [name]" — detailed breakdown of a file
• "help" — shows this message again`,
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
            message: `I have ${total} ${total === 1 ? 'piece' : 'pieces'} under my watch. ${dangers > 0 ? `**${dangers}** flagged as dangerous. ` : ''}${warnings > 0 ? `**${warnings}** require attention. ` : ''}${safe > 0 ? `**${safe}** are verified safe. ` : ''}Average risk score: **${avgScore}%**.`,
            results: files.map(f => ({ name: f.name, score: f.riskScore, status: f.status, originality: f.originalityScore }))
        };
    }

    const dangerMatch = /(high risk|danger|critical|threat|risky|harmful|malicious)/i.test(q);
    const warningMatch = /(warning|medium risk|suspicious|attention|review|caution)/i.test(q);
    const safeMatch = /(safe|clean|low risk|authentic|verified|good)/i.test(q);

    if (dangerMatch && !warningMatch && !safeMatch) {
        const dangerFiles = files.filter(f => f.status === 'danger' || (f.riskScore ?? 0) >= 70);
        if (dangerFiles.length === 0) return { message: "No high-risk files found. Your collection looks secure.", results: [] };
        return {
            message: `**${dangerFiles.length}** ${dangerFiles.length === 1 ? 'file' : 'files'} flagged as high risk:`,
            results: dangerFiles.map(f => ({ name: f.name, score: f.riskScore, status: f.status, originality: f.originalityScore }))
        };
    }

    if (warningMatch && !dangerMatch && !safeMatch) {
        const warningFiles = files.filter(f => f.status === 'warning' || ((f.riskScore ?? 0) >= 30 && (f.riskScore ?? 0) < 70));
        if (warningFiles.length === 0) return { message: "No files require attention right now.", results: [] };
        return {
            message: `**${warningFiles.length}** ${warningFiles.length === 1 ? 'file' : 'files'} flagged for attention:`,
            results: warningFiles.map(f => ({ name: f.name, score: f.riskScore, status: f.status, originality: f.originalityScore }))
        };
    }

    if (safeMatch && !dangerMatch && !warningMatch) {
        const safeFiles = files.filter(f => f.status === 'safe' || (f.riskScore ?? 0) < 30);
        if (safeFiles.length === 0) return { message: "No verified safe files in your collection yet.", results: [] };
        return {
            message: `**${safeFiles.length}** ${safeFiles.length === 1 ? 'file' : 'files'} verified as safe:`,
            results: safeFiles.map(f => ({ name: f.name, score: f.riskScore, status: f.status, originality: f.originalityScore }))
        };
    }

    const scoreMatch = q.match(/score\s*(above|below|over|under|>|<|>=|<=|greater|less|higher|lower)?\s*(\d+)/i);
    if (scoreMatch) {
        const threshold = parseInt(scoreMatch[2], 10);
        const operator = scoreMatch[1] || 'above';
        const isAbove = /^(above|over|>|>=|greater|higher)$/i.test(operator) || !/^(below|under|<|<=|less|lower)$/i.test(operator);
        const filtered = files.filter(f => (f.riskScore ?? 0) !== undefined && (isAbove ? (f.riskScore ?? 0) >= threshold : (f.riskScore ?? 0) < threshold));
        if (filtered.length === 0) return { message: `No files with risk score ${isAbove ? 'above' : 'below'} ${threshold}.`, results: [] };
        return {
            message: `**${filtered.length}** ${filtered.length === 1 ? 'file' : 'files'} with risk score ${isAbove ? '≥' : '<'} ${threshold}:`,
            results: filtered.map(f => ({ name: f.name, score: f.riskScore, status: f.status, originality: f.originalityScore }))
        };
    }

    const findMatch = q.match(/(?:find|search|look|locate|show|where|get|open)\s*(?:for\s*)?["']?(.+?)["']?$/i);
    if (findMatch) {
        let searchTerm = findMatch[1].toLowerCase();
        searchTerm = searchTerm.replace(/\s+(online|on the web|on the internet|on google|on yandex|on bing|internet|web|my art|all my|my files|my collection)$/i, '').trim();
        const matched = searchTerm ? files.filter(f => f.name.toLowerCase().includes(searchTerm)) : [];
        if (matched.length === 0) {
            if (files.length > 0) {
                return {
                    message: `No files match "${searchTerm}" by name. Here's your full collection:`,
                    results: files.map(f => ({ name: f.name, score: f.riskScore, status: f.status, originality: f.originalityScore }))
                };
            }
            return { message: `No files found. Upload some art to your vault first.`, results: [] };
        }
        return {
            message: `Found **${matched.length}** ${matched.length === 1 ? 'match' : 'matches'} for "${searchTerm}":`,
            results: matched.map(f => ({ name: f.name, score: f.riskScore, status: f.status, originality: f.originalityScore }))
        };
    }

    const analyzeMatch = q.match(/(?:analyze|examine|inspect|details?|info|tell me about)\s*(?:file\s*)?["']?(.+?)["']?$/i);
    if (analyzeMatch) {
        const searchTerm = analyzeMatch[1].toLowerCase();
        const matched = files.filter(f => f.name.toLowerCase().includes(searchTerm));
        if (matched.length === 0) return { message: `I couldn't find any files matching "${searchTerm}" to analyze.`, results: [] };
        const f = matched[0];
        const risk = f.riskScore ?? 0;
        const orig = f.originalityScore ?? 0;
        let analysis = `**${f.name}** — ${risk >= 70 ? '⚠ High Risk' : risk >= 30 ? '○ Needs Review' : '✓ Verified Safe'}\n\n`;
        analysis += `• Risk Score: **${risk}%**`;
        if (f.originalityScore !== undefined) {
            analysis += `\n• Originality Score: **${orig}%**`;
            if (orig < 30) analysis += ` — may be generated or heavily derivative`;
            else if (orig >= 70) analysis += ` — likely original work`;
        }
        return {
            message: analysis,
            results: [{ name: f.name, score: f.riskScore, status: f.status, originality: f.originalityScore }]
        };
    }

    const nameSearch = files.filter(f => f.name.toLowerCase().includes(q));
    if (nameSearch.length > 0) {
        return {
            message: `Found **${nameSearch.length}** ${nameSearch.length === 1 ? 'file' : 'files'} matching your query:`,
            results: nameSearch.map(f => ({ name: f.name, score: f.riskScore, status: f.status, originality: f.originalityScore }))
        };
    }

    const vagueQuery = /^(my art|my art|art|my work|my files|my collection|everything|all|show me|show all|what do i have|what's in|what is in)/i.test(q);
    if (vagueQuery && files.length > 0) {
        return {
            message: `Here's everything in your vault:`,
            results: files.map(f => ({ name: f.name, score: f.riskScore, status: f.status, originality: f.originalityScore }))
        };
    }

    return {
        message: `I didn't understand that query. I can search your collection by name, risk level, or status. Try "help" to see what I can do.`,
        results: []
    };
}

export function SecurityMentor({ context, onSearchFile }: SecurityMentorProps) {
    const files = context?.files || [];
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            content: `I am the custodian of your collection. I count ${files.length} ${files.length === 1 ? 'piece' : 'pieces'} under my watch. I can search your files, decode security scores, and analyze risk. How may I assist?`,
            timestamp: new Date(),
        },
    ]);
    const messagesInitialized = useRef(false);

    useEffect(() => {
        if (!messagesInitialized.current) {
            messagesInitialized.current = true;
            return;
        }
        const fileCount = files.length;
        setMessages([
            {
                id: '1',
                role: 'assistant',
                content: `I am the custodian of your collection. I count ${fileCount} ${fileCount === 1 ? 'piece' : 'pieces'} under my watch. I can search your files, decode security scores, and analyze risk. How may I assist?`,
                timestamp: new Date(),
            },
        ]);
    }, [files.length]);

    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const handleSend = () => {
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

        setTimeout(() => {
            const result = searchFiles(input, files);

            const wantsOnline = /\b(online|internet|web|google|yandex|bing|on the web|on the internet)\b/i.test(input);
            const genericSearch = /find my file|search my file|search online|find online|reverse image|search web|find web|find my art|search my art|show my art|find all|show all/i.test(input);
            const matched = result.results;

            // "find my file online" with exactly 1 total file → auto-search it
            if (genericSearch && files.length === 1 && onSearchFile && matched.length === 0) {
                const only = files[0];
                setMessages(prev => [...prev, {
                    id: (Date.now() + 1).toString(),
                    role: 'assistant',
                    content: `You have only one file — **${only.name}**. Searching it across the web...`,
                    timestamp: new Date(),
                }]);
                setIsTyping(false);
                onSearchFile({ id: only.id, name: only.name, storageUrl: (only as any).storageUrl, previewUrl: (only as any).previewUrl });
                return;
            }

            // "find my file online" with multiple files → ask which one
            if (genericSearch && files.length > 1 && matched.length === 0) {
                const names = files.map(f => `• **${f.name}**`).join('\n');
                result.message = `I have ${files.length} files. Which one should I search online?\n\n${names}`;
                result.results = files.map(f => ({ name: f.name, score: f.riskScore, status: f.status, originality: f.originalityScore }));
            }

            if (wantsOnline && matched.length === 1 && onSearchFile) {
                const file = files.find(f => f.name === matched[0].name);
                if (file) {
                    setMessages(prev => [...prev, {
                        id: (Date.now() + 1).toString(),
                        role: 'assistant',
                        content: `Searching **${file.name}** across the web...`,
                        timestamp: new Date(),
                    }]);
                    setIsTyping(false);
                    onSearchFile({ id: file.id, name: file.name, storageUrl: (file as any).storageUrl, previewUrl: (file as any).previewUrl });
                    return;
                }
            }

            if (wantsOnline && matched.length > 1 && onSearchFile) {
                const names = matched.map(r => `• **${r.name}**`).join('\n');
                result.message = `I found ${matched.length} files. Which one should I search online?\n\n${names}`;
            }

            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: result.message,
                results: result.results,
                isSearchResult: result.results.length > 0,
                timestamp: new Date(),
            };

            setMessages(prev => [...prev, aiMessage]);
            setIsTyping(false);
        }, 400);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, ease: easeLuxury }}
            className="card-luxury h-[680px] flex flex-col overflow-hidden"
        >
            <div className="flex items-center gap-4 px-8 py-6 border-b border-luxury-steel/30">
                <div className="w-10 h-10 border border-luxury-gold/50 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-luxury-gold" />
                </div>
                <div>
                    <h3 className="text-sm font-display text-luxury-cream uppercase tracking-wide">The Custodian</h3>
                    <div className="flex items-center gap-3 mt-1">
                        <div className="w-1 h-1 bg-luxury-gold/60" />
                        <p className="text-[10px] uppercase tracking-ultra-wide text-luxury-muted/60 font-semibold">File Search & Analysis</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-8 py-8 space-y-8">
                <AnimatePresence>
                    {messages.map((message) => (
                        <motion.div
                            key={message.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, ease: easeLuxury }}
                            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-[85%] ${
                                    message.role === 'user'
                                        ? 'bg-luxury-gold/90 text-black px-6 py-4'
                                        : 'text-luxury-cream/80 px-0 py-0'
                                }`}
                            >
                                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>

                                {message.results && message.results.length > 0 && (
                                    <div className="mt-4 space-y-1.5">
                                        {message.results.map((r, i) => (
                                            <div key={i} className="flex items-center gap-2 text-xs border border-luxury-steel/20 px-3 py-2">
                                                {getStatusIcon(r.status)}
                                                <FileText className="w-3 h-3 text-luxury-muted/40 shrink-0" />
                                                <span className="truncate flex-1 text-luxury-cream/90">{r.name}</span>
                                                {r.score !== undefined && (
                                                    <span className={`font-semibold shrink-0 ${getScoreColor(r.score)}`}>
                                                        {r.score}%
                                                    </span>
                                                )}
                                                {r.originality !== undefined && (
                                                    <span className="text-luxury-muted/40 text-[10px] shrink-0">
                                                        O:{r.originality}%
                                                    </span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className={`text-[9px] mt-3 uppercase tracking-ultra-wide font-semibold ${message.role === 'user' ? 'text-black/40' : 'text-luxury-muted/30'}`}>
                                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                <AnimatePresence>
                    {isTyping && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3, ease: easeLuxury }}
                            className="flex justify-start"
                        >
                            <div className="px-0 py-0">
                                <div className="flex items-center gap-3">
                                    <div className="w-4 h-4 border border-luxury-gold/30 border-t-luxury-gold/60 animate-spin" />
                                    <span className="text-xs text-luxury-muted/60 uppercase tracking-wider">Searching</span>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div ref={messagesEndRef} />
            </div>

            <div className="px-8 py-6 border-t border-luxury-steel/30">
                <div className="flex gap-0 border border-luxury-steel/40 focus-within:border-luxury-gold/40 transition-all duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSend();
                        }}
                        placeholder="Search your collection (try 'help', 'summary', 'high risk')..."
                        className="flex-1 bg-transparent px-6 py-4 text-sm text-luxury-cream placeholder-luxury-muted/30 focus:outline-none"
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim()}
                        className="px-6 text-luxury-gold/60 hover:text-luxury-gold transition-colors duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        <Send className="h-4 w-4" />
                    </button>
                </div>
                {files.length > 0 && (
                    <div className="flex items-center gap-2 mt-3">
                        <Search className="w-3 h-3 text-luxury-muted/30 shrink-0" />
                        <p className="text-[10px] text-luxury-muted/40">
                            {files.length} {files.length === 1 ? 'file' : 'files'} in collection
                        </p>
                    </div>
                )}
            </div>
        </motion.div>
    );
}