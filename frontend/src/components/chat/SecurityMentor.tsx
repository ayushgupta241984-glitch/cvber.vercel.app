'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

interface SecurityMentorProps {
    context?: any;
}

const easeLuxury = [0.25, 0.46, 0.45, 0.94] as const;

export function SecurityMentor({ context }: SecurityMentorProps) {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            content: "I am the custodian of your collection. I count " + (context?.files?.length || 0) + " pieces under my watch. I can decode your security scores, demystify C2PA provenance, or advise on fortifying your portfolio. How may I assist?",
            timestamp: new Date(),
        },
    ]);
    const messagesInitialized = useRef(false);

    useEffect(() => {
        if (!messagesInitialized.current) {
            messagesInitialized.current = true;
            return;
        }
        const fileCount = context?.files?.length || 0;
        setMessages([
            {
                id: '1',
                role: 'assistant',
                content: "I am the custodian of your collection. I count " + fileCount + " pieces under my watch. I can decode your security scores, demystify C2PA provenance, or advise on fortifying your portfolio. How may I assist?",
                timestamp: new Date(),
            },
        ]);
    }, [context?.files?.length]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

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

            const enrichedInput = context
                ? `[Context: User has files ${JSON.stringify(context.files.slice(0, 3))}] User Query: ${input}`
                : input;

            const response = await apiClient.chatWithMentor(enrichedInput, history);

            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: response.response,
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, aiMessage]);
        } catch (err) {
            setError("I'm having trouble connecting to my secure servers. Please try again in a moment.");
            console.error("Mentor chat error:", err);
        } finally {
            setIsTyping(false);
        }
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
                        <p className="text-[10px] uppercase tracking-ultra-wide text-luxury-muted/60 font-semibold">At Your Service</p>
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
                                <span className="text-xs text-luxury-gold/60 uppercase tracking-wider">{error}</span>
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
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Ask about your collection's security..."
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
            </div>
        </motion.div>
    );
}
