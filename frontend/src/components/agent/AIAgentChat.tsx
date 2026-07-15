'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, Sparkles, Search, Globe, HardDrive, Hash, FileText, Loader2, AlertCircle, Info, Image, Shield, Scale, FileOutput, Terminal, Camera, FolderOpen, Database, Bell } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { motion, AnimatePresence } from 'framer-motion';
import { easeLuxury } from '@/lib/animations';

interface ToolCall {
    name: string;
    arguments: Record<string, any>;
    result: string;
}

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    tool_calls?: ToolCall[];
    thinking?: string;
    timestamp: Date;
}

function ToolCallView({ tool_call }: { tool_call: ToolCall }) {
    const iconMap: Record<string, any> = {
        web_search: Globe,
        image_search: Image,
        search_artwork: Camera,
        list_vault_files: HardDrive,
        get_file_details: Info,
        find_image_copies: Search,
        describe_vault_image: FileText,
        generate_evidence_report: Shield,
        watermark_image: Image,
        legal_guide: Scale,
        outreach_template: FileOutput,
        code_interpreter: Terminal,
        get_copy_history: Database,
        register_asset: Bell,
        respond_to_user: Bot,
    };
    const Icon = iconMap[tool_call.name] || Search;
    const labelMap: Record<string, string> = {
        web_search: 'Web Search',
        image_search: 'Image Search',
        search_artwork: 'Artwork Search',
        list_vault_files: 'Vault Files',
        get_file_details: 'File Details',
        find_image_copies: 'Find Copies',
        describe_vault_image: 'Describe Image',
        generate_evidence_report: 'Evidence Report',
        watermark_image: 'Watermark',
        legal_guide: 'Legal Guide',
        outreach_template: 'Legal Template',
        code_interpreter: 'Code Interpreter',
        get_copy_history: 'Copy Database',
        register_asset: 'Monitor',
        respond_to_user: 'Response',
    };
    let resultPreview = tool_call.result;
    let resultLinks: { source: string; title: string; url: string; matchType?: string }[] = [];
    let matchLinks: { source: string; title: string; url: string }[] = [];
    let similarLinks: { source: string; title: string; url: string }[] = [];
    let visionUsed = false;
    let thinkingLog: string[] = [];
    try {
        const parsed = JSON.parse(tool_call.result);
        thinkingLog = parsed.thinking_log || [];
        if (parsed.match_count !== undefined) {
            resultPreview = `${parsed.match_count} matches + ${parsed.similar_count} similar`;
            matchLinks = (parsed.matches || []).map((r: any) => ({ source: r.source || 'match', title: r.title || '', url: r.url, score: r.score }));
            similarLinks = (parsed.similar || []).map((r: any) => ({ source: r.source || 'similar', title: r.title || '', url: r.url }));
            resultLinks = [...matchLinks, ...similarLinks];
            visionUsed = parsed.vision_used;
        } else if (parsed.urls) {
            const mode = parsed.vision_used ? 'Vision' : 'Visual Match';
            resultPreview = `${mode}: ${parsed.total_urls || parsed.urls.length} matches`;
            resultLinks = parsed.urls.slice(0, 20);
            visionUsed = parsed.vision_used;
        } else if (parsed.results) resultPreview = `Found ${parsed.total} results`;
        else if (parsed.files) resultPreview = `${parsed.total} files in vault`;
        else if (parsed.total) resultPreview = `${parsed.total} results`;
        else if (parsed.scans) resultPreview = `${parsed.scans.length} scans`;
        else if (parsed.proofs) resultPreview = `${parsed.proofs.length} proofs`;
        else if (parsed.file) resultPreview = `File: ${parsed.file?.file_name || 'details loaded'}`;
        else if (parsed.description) resultPreview = `Vision: ${parsed.description.slice(0, 60)}...`;
        else if (parsed.analysis) resultPreview = `Analysis complete`;
        else if (parsed.watermarked) resultPreview = `Watermarked`;
        else if (parsed.title) resultPreview = `${parsed.title}`;
        else if (parsed.output) resultPreview = `${parsed.output.slice(0, 60)}...`;
        else if (parsed.total && parsed.unique_urls !== undefined) {
            resultPreview = `Copy DB: ${parsed.total} matches, ${parsed.unique_urls} unique URLs`;
            resultLinks = (parsed.results || []).slice(0, 20).map((r: any) => ({
                source: r.platform || 'web',
                title: `[${r.platform}] ${r.found_url}`,
                url: r.found_url,
            }));
        }
        else if (parsed.error) resultPreview = `Error: ${parsed.error}`;
    } catch { /* intentionally empty — fire-and-forget */ }

    return (
        <div>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: easeLuxury }}
                className="flex items-center gap-2 px-3 py-1.5 border border-luxury-steel/30 text-[10px] uppercase tracking-wider text-luxury-muted/60"
            >
                <Icon className="w-3 h-3 text-luxury-gold/60 shrink-0" />
                <span className="text-luxury-cream/80">{labelMap[tool_call.name] || tool_call.name}</span>
                <span className="text-luxury-steel/50">—</span>
                <span className="text-luxury-muted/50 truncate max-w-[200px]">{resultPreview}</span>
            </motion.div>
            {thinkingLog.length > 0 && (
                <div className="mt-2 ml-2 space-y-1">
                    <p className="text-[9px] text-luxury-steel/40 uppercase tracking-wider mb-1">Process</p>
                    {thinkingLog.map((step: string, i: number) => (
                        <div key={i} className="flex items-start gap-2 text-[10px] text-luxury-muted/40">
                            <span className="text-luxury-steel/50 mt-0.5">●</span>
                            <span>{step}</span>
                        </div>
                    ))}
                </div>
            )}
            {matchLinks.length > 0 && (
                <div className="mt-2 ml-2">
                    <p className="text-[10px] text-luxury-gold/60 uppercase tracking-wider mb-1">Likely Matches — verified by image comparison</p>
                    <div className="space-y-1">
                        {matchLinks.map((link, i) => {
                            const score = (link as any).score || 0;
                            const scorePct = Math.round(score * 100);
                            const barWidth = Math.round(score * 40);
                            return (
                                <a key={i} href={link.url} target="_blank" rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-[11px] text-luxury-gold/80 hover:text-luxury-gold truncate block"
                                    title={link.title || link.url}
                                >
                                    <Search className="w-2.5 h-2.5 shrink-0" />
                                    <span className="text-luxury-muted/40 text-[10px] w-8 shrink-0">{scorePct}%</span>
                                    <span className="truncate">{link.title || link.url.slice(0, 80)}</span>
                                </a>
                            );
                        })}
                    </div>
                </div>
            )}
            {similarLinks.length > 0 && (
                <div className="mt-2 ml-2">
                    <p className="text-[10px] text-luxury-muted/40 uppercase tracking-wider mb-1">Visually Similar — {similarLinks.length} results</p>
                    <div className="space-y-1">
                        {similarLinks.slice(0, 15).map((link, i) => (
                            <a key={i} href={link.url} target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-2 text-[11px] text-luxury-muted/40 hover:text-luxury-muted/70 truncate block"
                                title={link.title || link.url}
                            >
                                <Globe className="w-2.5 h-2.5 shrink-0" />
                                <span className="truncate">{link.title || link.url}</span>
                            </a>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function linkify(text: string) {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    return parts.map((part, i) =>
        part.startsWith('http://') || part.startsWith('https://')
            ? <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="underline text-luxury-gold/70 hover:text-luxury-gold">{part}</a>
            : part
    );
}

const ONBOARDING_KEY = 'cvber_agent_welcomed';

export function AIAgentChat() {
    const [messages, setMessages] = useState<Message[]>(() => {
        if (typeof window !== 'undefined' && !localStorage.getItem(ONBOARDING_KEY)) {
            localStorage.setItem(ONBOARDING_KEY, 'true');
            return [{
                id: '1',
                role: 'assistant',
                content: "Welcome to your studio. I am your archivist, your investigator, and the eyes that scan the open web on your behalf. I have full access to your collection—I can search for unauthorised reproductions, verify blockchain anchors, and trace the provenance of any piece in your vault. What would you like me to pursue?",
                timestamp: new Date(),
            }];
        }
        return [];
    });
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [vaultFiles, setVaultFiles] = useState<any[]>([]);
    const [showFilePicker, setShowFilePicker] = useState(false);
    const [pickingLoading, setPickingLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const load = async () => {
            try {
                const vault = await apiClient.listVaultFiles(50, 0);
                setVaultFiles(vault.files || []);
            } catch (_) {}
        };
        load();
    }, []);

    const pickFile = (file: any) => {
        setShowFilePicker(false);
        setInput(`find copies of my file ${file.scan_id}`);
        setTimeout(() => handleSend(), 50);
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const handleSend = async () => {
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
            const history = messages.map(msg => ({
                role: msg.role === 'assistant' ? 'assistant' : 'user',
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
            const msg: string = err?.message || '';
            const stripImage = /(?:cannot read|does not support image|vision model|image_url|image input|model does not support|not a vision model|image analysis|service unavailable|image\.png|image\.jpg|scan failed|inform the user|this model|image data)/gi;
            const cleaned = msg.replace(stripImage, '').replace(/['"()]/g, '').replace(/\s+/g, ' ').trim();
            setError(cleaned || "Failed to get AI response. The agent may be unavailable.");

        } finally {
            setIsTyping(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, ease: easeLuxury }}
            className="flex flex-col h-full bg-black overflow-hidden border border-luxury-steel/30"
        >
            <div className="flex items-center gap-4 px-8 py-6 border-b border-luxury-steel/30">
                <div className="w-10 h-10 border border-luxury-gold/50 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-luxury-gold" />
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-3">
                        <h3 className="text-sm font-display text-luxury-cream uppercase tracking-wide">The Archivist</h3>
                        <Sparkles className="w-3.5 h-3.5 text-luxury-gold/60" />
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                        <div className="w-1 h-1 bg-luxury-gold/60" />
                        <p className="text-[10px] uppercase tracking-ultra-wide text-luxury-muted/60 font-semibold">At Your Service</p>
                        <span className="text-luxury-steel/50">|</span>
                        <Globe className="w-3 h-3 text-luxury-muted/40" />
                        <p className="text-[10px] uppercase tracking-ultra-wide text-luxury-muted/60 font-semibold">Web Surveillance</p>
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
                        >
                            <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] ${
                                    message.role === 'user'
                                        ? 'bg-luxury-gold/90 text-black px-6 py-4'
                                        : 'text-luxury-cream/80 px-0 py-0'
                                }`}>
                                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{linkify(message.content)}</p>
                                    {message.thinking && message.thinking.length > 0 && (
                                        <div className="mt-4 pt-3 border-t border-luxury-steel/20 space-y-1.5">
                                            <p className="text-[9px] text-luxury-steel/40 uppercase tracking-wider mb-2">Process</p>
                                            {message.thinking.split('\n').map((step: string, i: number) => (
                                                <div key={i} className="flex items-start gap-2 text-[10px] text-luxury-muted/40">
                                                    <span className="text-luxury-steel/50 mt-0.5">●</span>
                                                    <span>{step}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    <div className={`text-[9px] mt-3 uppercase tracking-ultra-wide font-semibold ${
                                        message.role === 'user' ? 'text-black/40' : 'text-luxury-muted/30'
                                    }`}>
                                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            </div>
                            {message.tool_calls && message.tool_calls.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-3">
                                    {message.tool_calls.map((tc, i) => (
                                        <ToolCallView key={i} tool_call={tc} />
                                    ))}
                                </div>
                            )}
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
                                    <Loader2 className="w-4 h-4 text-luxury-gold/60 animate-spin" />
                                    <span className="text-xs text-luxury-muted/60 uppercase tracking-wider">Processing</span>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3, ease: easeLuxury }}
                            className="flex justify-center"
                        >
                            <div className="flex items-center gap-3 px-4 py-3 border border-luxury-gold/20">
                                <AlertCircle className="w-4 h-4 text-luxury-gold/60 shrink-0" />
                                <span className="text-xs text-luxury-gold/60 uppercase tracking-wider">{error}</span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div ref={messagesEndRef} />
            </div>

            <div className="px-8 py-6 border-t border-luxury-steel/30">
                <div className="flex gap-0 border border-luxury-steel/40 focus-within:border-luxury-gold/40 transition-all duration-500">
                    <button
                        onClick={() => { setPickingLoading(true); apiClient.listVaultFiles(50, 0).then(v => { setVaultFiles(v.files || []); setShowFilePicker(true); }).catch(() => setError('Failed to load vault')).finally(() => setPickingLoading(false)); }}
                        disabled={isTyping}
                        suppressHydrationWarning
                        className="px-4 text-luxury-gold/50 hover:text-luxury-gold transition-colors disabled:opacity-30"
                        title="Pick a file from your vault"
                    >
                        {pickingLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FolderOpen className="h-4 w-4" />}
                    </button>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                        suppressHydrationWarning
                        placeholder="Search for unauthorised reproductions..."
                        className="flex-1 bg-transparent px-6 py-4 text-sm text-luxury-cream placeholder-luxury-muted/30 focus:outline-none"
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || isTyping}
                        suppressHydrationWarning
                        className="px-6 text-luxury-gold/60 hover:text-luxury-gold transition-colors duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        <Send className="h-4 w-4" />
                    </button>
                </div>

                <AnimatePresence>
                    {showFilePicker && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="mt-3 border border-luxury-steel/30 bg-black max-h-[200px] overflow-y-auto"
                        >
                            {vaultFiles.length === 0 ? (
                                <div className="px-4 py-6 text-center text-xs text-luxury-muted/50 uppercase tracking-wider">
                                    No files in your vault. Upload one first.
                                </div>
                            ) : (
                                vaultFiles.map((f: any) => (
                                    <button
                                        key={f.scan_id}
                                        onClick={() => pickFile(f)}
                                        className="w-full text-left px-4 py-3 text-xs text-luxury-cream/70 hover:bg-luxury-steel/10 hover:text-luxury-cream border-b border-luxury-steel/10 flex items-center gap-3 transition-colors"
                                    >
                                        <Image className="w-3 h-3 text-luxury-gold/50 shrink-0" />
                                        <span className="truncate flex-1">{f.file_name}</span>
                                        <span className="text-luxury-muted/40 shrink-0">{(f.file_size / 1024).toFixed(0)}KB</span>
                                    </button>
                                ))
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}
