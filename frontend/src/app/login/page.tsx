'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Shield, Mail, Lock, AlertCircle, Github } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import Logo from '@/components/common/Logo';

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const token = searchParams.get('token');
        const userStr = searchParams.get('user');
        if (token) {
            localStorage.setItem('access_token', token);
            if (userStr) {
                try {
                    const user = JSON.parse(decodeURIComponent(userStr));
                    if (user.full_name) localStorage.setItem('user_full_name', user.full_name);
                } catch {}
            }
            router.push('/dashboard');
        }
    }, [searchParams, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const result = await apiClient.login(email, password);

            localStorage.setItem('access_token', result.access_token);
            if (result.user?.full_name) {
                localStorage.setItem('user_full_name', result.user.full_name);
            }

            router.push('/dashboard');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Login failed');
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
        <div className="min-h-screen bg-[#0A0A0F] flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-10">
                    <Link href="/" className="inline-flex items-center justify-center mb-6 group">
                        <Logo size="lg" alt="CVBER - AI Art Protection Login" />
                    </Link>
                    <h1 className="text-3xl font-extrabold text-white tracking-tight">
                        Welcome Back
                    </h1>
                    <p className="text-zinc-500 mt-2">Sign in to your Cvber account</p>
                </div>

                <div className="bg-[#12121A] border border-zinc-800 rounded-3xl p-8 shadow-2xl shadow-purple-500/5">
                    <div className="relative mb-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-zinc-800"></div>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-[#12121A] px-4 text-zinc-500 font-bold">or continue with email</span>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-semibold text-zinc-400 mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl pl-11 pr-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-medium"
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between mb-2">
                                <label className="text-sm font-semibold text-zinc-400">Password</label>
                                <Link href="#" className="text-xs text-purple-400 hover:underline font-medium">Forgot password?</Link>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl pl-11 pr-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-medium"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3">
                                <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
                                <p className="text-red-400 text-sm font-medium">{error}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-white hover:bg-zinc-200 text-black font-bold py-3.5 rounded-xl text-sm uppercase tracking-widest transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                            ) : 'Sign In'}
                        </button>
                    </form>

                    <p className="text-center text-zinc-500 mt-8 text-sm">
                        Don't have an account?{' '}
                        <Link href="/register" className="text-purple-400 hover:text-purple-300 font-bold transition-colors">
                            Create Account
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-zinc-600 border-t-white rounded-full animate-spin" />
            </div>
        }>
            <LoginForm />
        </Suspense>
    );
}
