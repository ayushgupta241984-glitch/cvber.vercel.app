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
        <div className="glass rounded-2xl p-6 h-[600px] flex flex-col">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
                <div className="relative">
                    <Bot className="h-8 w-8 text-cyber-purple" />
                    <div className="absolute inset-0 blur-lg bg-cyber-purple/50" />
                </div>
                <div>
                    <h3 className="text-xl font-semibold text-white">AI Security Mentor</h3>
                    <p className="text-sm text-gray-400">Your personal cybersecurity guide</p>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`
                max-w-[80%] rounded-2xl px-4 py-3
                ${message.role === 'user'
                                    ? 'bg-gradient-to-r from-cyber-purple to-cyber-blue text-white'
                                    : 'bg-white/5 text-gray-200 border border-white/10'
                                }
              `}
                        >
                            <p className="text-sm leading-relaxed">{message.content}</p>
                            <p className="text-xs opacity-60 mt-1">
                                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                    </div>
                ))}

                {isTyping && (
                    <div className="flex justify-start">
                        <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
                            <div className="flex gap-1">
                                <div className="w-2 h-2 bg-cyber-purple rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <div className="w-2 h-2 bg-cyber-purple rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <div className="w-2 h-2 bg-cyber-purple rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Input */}
            <div className="flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Ask about security threats..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyber-purple transition-colors"
                />
                <button
                    onClick={handleSend}
                    disabled={!input.trim()}
                    className="bg-gradient-to-r from-cyber-purple to-cyber-blue rounded-xl px-6 py-3 text-white font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Send className="h-5 w-5" />
                </button>
            </div>
        </div>
    );
}
