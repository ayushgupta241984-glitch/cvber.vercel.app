'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Lock, AlertCircle } from 'lucide-react';
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
            (async () => {
                try {
                    const resp = await fetch(
                        `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}/auth/me`,
                        { headers: { Authorization: `Bearer ${token}` } }
                    );
                    if (!resp.ok) return;
                    localStorage.setItem('access_token', token);
                    if (userStr) {
                        try {
                            const user = JSON.parse(decodeURIComponent(userStr));
                            if (user.full_name) localStorage.setItem('user_full_name', user.full_name);
                        } catch {}
                    }
                    router.push('/dashboard');
                } catch {}
            })();
        }
    }, [searchParams, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const result = await apiClient.login(email, password);
            localStorage.setItem('access_token', result.access_token);
            if (result.user?.full_name) localStorage.setItem('user_full_name', result.user.full_name);
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
        <div className="min-h-screen bg-gallery-black flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Subtle art background */}
            <div className="absolute inset-0 opacity-[0.04]">
                <img src="https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=1920&q=80" alt="" className="w-full h-full object-cover" />
            </div>
            <div className="absolute inset-0 bg-gradient-radial from-luxury-gold/[0.02] to-transparent pointer-events-none" />

            <div className="w-full max-w-md relative z-10">
                <div className="text-center mb-10">
                    <Link href="/" className="inline-flex items-center justify-center mb-6 group">
                        <Logo size="lg" alt="CVBER Login" />
                    </Link>
                    <h1 className="font-display text-3xl font-bold text-luxury-cream tracking-tight">
                        Welcome Back
                    </h1>
                    <p className="text-luxury-muted mt-2 font-sans text-sm">Sign in to your Cvber account</p>
                </div>

                <div className="card-gallery p-8 md:p-10">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-xs font-bold text-luxury-muted uppercase tracking-ultra-wide mb-2 font-sans">
                                Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-luxury-muted/60" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    suppressHydrationWarning
                                    className="w-full bg-transparent border border-gallery-border rounded-xl pl-11 pr-4 py-3.5 text-luxury-cream placeholder-luxury-muted/30 focus:outline-none focus:border-luxury-gold/50 transition-colors font-sans text-sm"
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between mb-2">
                                <label className="text-xs font-bold text-luxury-muted uppercase tracking-ultra-wide font-sans">Password</label>
                                <a href="#" className="text-[10px] text-luxury-gold hover:text-luxury-goldLight font-bold uppercase tracking-ultra-wide font-sans">Forgot?</a>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-luxury-muted/60" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    suppressHydrationWarning
                                    className="w-full bg-transparent border border-gallery-border rounded-xl pl-11 pr-4 py-3.5 text-luxury-cream placeholder-luxury-muted/30 focus:outline-none focus:border-luxury-gold/50 transition-colors font-sans text-sm"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-xl flex items-center gap-3">
                                <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
                                <p className="text-red-400 text-xs font-medium font-sans">{error}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            suppressHydrationWarning
                            className="w-full btn-primary py-3.5 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                            ) : 'Sign In'}
                        </button>
                    </form>

                    {/* OAuth */}
                    <div className="mt-8">
                        <div className="divider-gold mb-6" />
                        <button
                            onClick={() => handleOAuthLogin('google')}
                            disabled={loading}
                            suppressHydrationWarning
                            className="w-full py-3.5 border border-gallery-border rounded-xl text-luxury-muted hover:text-luxury-cream hover:border-luxury-gold/30 transition-all font-sans text-xs font-bold uppercase tracking-ultra-wide flex items-center justify-center gap-3"
                        >
                            <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                            Continue with Google
                        </button>
                    </div>

                    <p className="text-center text-luxury-muted mt-8 text-xs font-sans">
                        Don't have an account?{' '}
                        <Link href="/register" className="text-luxury-gold hover:text-luxury-goldLight font-bold uppercase tracking-ultra-wide transition-colors">
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
            <div className="min-h-screen bg-gallery-black flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-luxury-muted/30 border-t-luxury-gold rounded-full animate-spin" />
            </div>
        }>
            <LoginForm />
        </Suspense>
    );
}
