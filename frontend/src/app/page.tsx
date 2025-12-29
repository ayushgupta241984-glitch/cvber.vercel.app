import Link from 'next/link';
import { Shield, Scan, Lock, Zap } from 'lucide-react';

export default function Home() {
    return (
        <main className="min-h-screen bg-gradient-to-br from-cyber-darker via-cyber-dark to-purple-950/20">
            {/* Hero Section */}
            <div className="container mx-auto px-4 py-20">
                <div className="text-center max-w-4xl mx-auto">
                    {/* Logo */}
                    <div className="flex items-center justify-center mb-8">
                        <div className="relative">
                            <Shield className="h-20 w-20 text-cyber-purple" />
                            <div className="absolute inset-0 blur-xl bg-cyber-purple/50 animate-pulse-slow" />
                        </div>
                    </div>

                    {/* Title */}
                    <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-cyber-purple via-cyber-blue to-cyber-pink bg-clip-text text-transparent">
                        CVBER Free
                    </h1>

                    <p className="text-2xl text-gray-300 mb-4">
                        AI-Powered Cybersecurity Platform
                    </p>

                    <p className="text-lg text-gray-400 mb-12 max-w-2xl mx-auto">
                        Protect your digital assets with advanced AI threat detection,
                        C2PA digital authenticity verification, and secure encrypted storage.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex gap-4 justify-center mb-20">
                        <Link
                            href="/dashboard"
                            className="px-8 py-4 bg-gradient-to-r from-cyber-purple to-cyber-blue rounded-xl font-semibold text-white hover:shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 transform hover:scale-105"
                        >
                            Launch Dashboard
                        </Link>

                        <Link
                            href="/login"
                            className="px-8 py-4 glass glass-hover rounded-xl font-semibold text-white"
                        >
                            Sign In
                        </Link>
                    </div>

                    {/* Features Grid */}
                    <div className="grid md:grid-cols-3 gap-6 mt-16">
                        <div className="glass rounded-2xl p-8 hover:bg-white/10 transition-all duration-300">
                            <Scan className="h-12 w-12 text-cyber-purple mb-4 mx-auto" />
                            <h3 className="text-xl font-semibold mb-3">AI Threat Detection</h3>
                            <p className="text-gray-400">
                                Powered by Gemini 3 Flash with HIGH reasoning mode for comprehensive security analysis
                            </p>
                        </div>

                        <div className="glass rounded-2xl p-8 hover:bg-white/10 transition-all duration-300">
                            <Lock className="h-12 w-12 text-cyber-blue mb-4 mx-auto" />
                            <h3 className="text-xl font-semibold mb-3">C2PA Verification</h3>
                            <p className="text-gray-400">
                                Digital signatures and provenance tracking with industry-standard C2PA technology
                            </p>
                        </div>

                        <div className="glass rounded-2xl p-8 hover:bg-white/10 transition-all duration-300">
                            <Zap className="h-12 w-12 text-cyber-pink mb-4 mx-auto" />
                            <h3 className="text-xl font-semibold mb-3">Secure Vault</h3>
                            <p className="text-gray-400">
                                Encrypted storage with row-level security and real-time threat monitoring
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Background Effects */}
            <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyber-purple/20 rounded-full blur-3xl animate-pulse-slow" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyber-blue/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
            </div>
        </main>
    );
}
