'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, Bot, AlertCircle } from 'lucide-react';
import { apiClient } from '@/lib/api-client';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

interface SecurityMentorProps {
    context?: any;
}

export function SecurityMentor({ context }: SecurityMentorProps) {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            content: "Hello! I'm your AI Security Assistant. I've analyzed your dashboard—you currently have " + (context?.files?.length || 0) + " files protected. I can help you understand your security scores or explaining C2PA verification. How can I help?",
            timestamp: new Date(),
        },
    ]);
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
            // Prepare history for AI context (ChatGPT style)
            const history = messages.map(msg => ({
                role: msg.role === 'assistant' ? 'assistant' : 'user',
                content: msg.content
            }));

            // Enrich the prompt with dashboard context if available
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
        <div className="card h-[680px] flex flex-col bg-[#0F0F16] overflow-hidden border border-zinc-800 ring-1 ring-white/[0.02] rounded-[32px]">
            {/* Header */}
            <div className="flex items-center gap-3 p-6 border-b border-zinc-800 bg-zinc-900/20">
                <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-purple-900/40">
                    <Bot className="h-6 w-6" />
                </div>
                <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-wider">AI Intelligence Desk</h3>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Tracking Bot Live</p>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-transparent">
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`
                max-w-[90%] rounded-2xl px-5 py-4 shadow-sm
                ${message.role === 'user'
                                    ? 'bg-purple-600 text-white rounded-tr-none'
                                    : 'bg-zinc-900 text-zinc-300 border border-zinc-800 rounded-tl-none'
                                }
              `}
                        >
                            <p className="text-sm leading-relaxed font-medium whitespace-pre-wrap">{message.content}</p>
                            <div className={`text-[9px] mt-2 font-bold uppercase tracking-widest ${message.role === 'user' ? 'text-purple-200' : 'text-zinc-600'}`}>
                                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Input */}
            <div className="p-4 bg-zinc-900/40 border-t border-zinc-800">
                <div className="flex gap-2 p-1 bg-black/40 border border-zinc-800 rounded-2xl shadow-sm focus-within:ring-2 focus-within:ring-purple-500/20 focus-within:border-purple-500/50 transition-all">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Ask to track your work..."
                        className="flex-1 bg-transparent px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none"
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim()}
                        className="bg-purple-600 rounded-xl p-3 text-white hover:bg-purple-700 transition-all disabled:opacity-50 disabled:grayscale shadow-md shadow-purple-900/40 active:scale-95"
                    >
                        <Send className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}

