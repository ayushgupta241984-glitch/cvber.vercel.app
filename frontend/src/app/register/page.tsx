'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User, AlertCircle, ArrowRight } from 'lucide-react';
import { apiClient } from '@/lib/api-client';

export default function RegisterPage() {
    const router = useRouter();
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const result = await apiClient.register(email, password, fullName);
            if (result.access_token) {
                localStorage.setItem('access_token', result.access_token);
                localStorage.setItem('user_full_name', fullName);
                router.push('/dashboard');
            } else {
                router.push('/login');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const handleOAuthLogin = async (provider: string) => {
        setLoading(true);
        setError(null);
        try {
            const result = await apiClient.getOAuthUrl(provider);
            window.location.href = result.url;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'OAuth login failed');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] flex">
            {/* Left panel — branding */}
            <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#111] to-[#0a0a0a]" />
                <div className="absolute inset-0 opacity-[0.03]">
                    <img src="https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=1920&q=80" alt="" className="w-full h-full object-cover" />
                </div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#a855f7]/[0.03] rounded-full blur-[120px]" />
                <div className="relative z-10 px-16 max-w-lg">
                    <div className="w-12 h-12 rounded-2xl bg-[#a855f7]/10 border border-[#a855f7]/20 flex items-center justify-center mb-8">
                        <svg className="w-6 h-6 text-[#a855f7]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    </div>
                    <h2 className="font-display text-4xl font-bold text-white leading-tight mb-4">
                        Start Protecting<br />Your Art Today
                    </h2>
                    <p className="text-white/40 text-sm leading-relaxed max-w-sm">
                        Free AI-powered copyright protection. Upload, analyze, and monitor your work across the internet in seconds.
                    </p>
                </div>
            </div>

            {/* Right panel — form */}
            <div className="flex-1 flex items-center justify-center p-8 relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-[#a855f7]/[0.02] rounded-full blur-[100px] pointer-events-none" />

                <div className="w-full max-w-[380px] relative z-10">
                    {/* Mobile logo */}
                    <div className="lg:hidden text-center mb-10">
                    <Link href="/" className="inline-flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[#a855f7]/10 border border-[#a855f7]/20 flex items-center justify-center">
                    <svg className="w-4 h-4 text-[#a855f7]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    </div>
                    <span className="text-sm font-bold text-white tracking-tight uppercase">CVBER</span>
                    </Link>
                    </div>

                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-white tracking-tight">Create account</h1>
                        <p className="text-white/30 text-sm mt-1.5">Get started with CVBER for free</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-bold text-white/30 uppercase tracking-[0.15em] mb-2">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    required
                                    suppressHydrationWarning
                                    className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl pl-10 pr-4 py-3 text-white placeholder-white/15 focus:outline-none focus:border-purple-500/40 focus:bg-white/[0.05] transition-all text-sm"
                                    placeholder="John Doe"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold text-white/30 uppercase tracking-[0.15em] mb-2">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    suppressHydrationWarning
                                    className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl pl-10 pr-4 py-3 text-white placeholder-white/15 focus:outline-none focus:border-purple-500/40 focus:bg-white/[0.05] transition-all text-sm"
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold text-white/30 uppercase tracking-[0.15em] mb-2">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    suppressHydrationWarning
                                    className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl pl-10 pr-4 py-3 text-white placeholder-white/15 focus:outline-none focus:border-purple-500/40 focus:bg-white/[0.05] transition-all text-sm"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 bg-red-500/5 border border-red-500/10 rounded-xl flex items-center gap-3">
                                <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
                                <p className="text-red-400 text-xs">{error}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            suppressHydrationWarning
                            className="w-full py-3 bg-[#a855f7] hover:bg-[#9333ea] text-black text-xs font-bold uppercase tracking-[0.15em] rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-40"
                        >
                            {loading ? (
                                <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                            ) : (
                                <>Create Account <ArrowRight className="w-3.5 h-3.5" /></>
                            )}
                        </button>
                    </form>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/[0.06]" /></div>
                        <div className="relative flex justify-center"><span className="bg-[#050505] px-4 text-[10px] text-white/20 uppercase tracking-wider">or</span></div>
                    </div>

                    <button
                        onClick={() => handleOAuthLogin('google')}
                        disabled={loading}
                        suppressHydrationWarning
                        className="w-full py-3 bg-white/[0.03] border border-white/[0.06] hover:border-white/10 rounded-xl text-white/50 hover:text-white/80 transition-all text-xs font-bold uppercase tracking-[0.12em] flex items-center justify-center gap-3"
                    >
                        <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                        Continue with Google
                    </button>

                    <p className="text-center text-white/20 mt-8 text-xs">
                        Already have an account?{' '}
                        <Link href="/login" className="text-purple-400/70 hover:text-purple-400 font-semibold transition-colors">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
