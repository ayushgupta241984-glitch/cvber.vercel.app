'use client';

import { useState } from 'react';
import { MessageCircle, Send, Bot } from 'lucide-react';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

export function SecurityMentor() {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            content: "Hello! I'm your AI Security Mentor. I can help you understand your scan results, explain security threats, and provide recommendations to protect your digital assets. How can I assist you today?",
            timestamp: new Date(),
        },
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);

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

        // Simulate AI response (replace with actual API call)
        setTimeout(() => {
            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: "I understand your concern. Based on the scan results, I recommend taking the following actions to improve your security posture...",
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, aiMessage]);
            setIsTyping(false);
        }, 1500);
    };

    return (
        <div className="card h-[600px] flex flex-col bg-white overflow-hidden border-2 border-gray-100 ring-1 ring-black/[0.02]">
            {/* Header */}
            <div className="flex items-center gap-3 p-6 border-b border-gray-50 bg-gray-50/30">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                    <Bot className="h-6 w-6" />
                </div>
                <div>
                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">Security Mentor</h3>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Active Assistant</p>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white">
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`
                max-w-[85%] rounded-2xl px-4 py-3 shadow-sm
                ${message.role === 'user'
                                    ? 'bg-blue-600 text-white rounded-tr-none'
                                    : 'bg-gray-50 text-gray-700 border border-gray-100 rounded-tl-none'
                                }
              `}
                        >
                            <p className="text-sm leading-relaxed font-medium">{message.content}</p>
                            <div className={`text-[10px] mt-2 font-bold uppercase tracking-widest ${message.role === 'user' ? 'text-blue-100' : 'text-gray-400'}`}>
                                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>
                    </div>
                ))}

                {isTyping && (
                    <div className="flex justify-start">
                        <div className="bg-gray-50 border border-gray-100 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm">
                            <div className="flex gap-1.5">
                                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Input */}
            <div className="p-4 bg-gray-50/50 border-t border-gray-50">
                <div className="flex gap-2 p-1 bg-white border border-gray-200 rounded-xl shadow-sm focus-within:ring-2 focus-within:ring-blue-500/10 focus-within:border-blue-500/50 transition-all">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Ask your security mentor..."
                        className="flex-1 bg-transparent px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none"
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim()}
                        className="bg-blue-600 rounded-lg p-2 text-white hover:bg-blue-700 transition-all disabled:opacity-50 disabled:grayscale shadow-md shadow-blue-200 active:scale-95"
                    >
                        <Send className="h-4 w-4" />
                    </button>
                </div>
                <p className="text-[10px] text-center text-gray-400 font-bold uppercase tracking-widest mt-3">
                    Powered by CVBER AI • v1.0
                </p>
            </div>
        </div>
    );
}

