'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Shield, Mail, Lock, AlertCircle } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { createClient } from '@/lib/supabase';
import Logo from '@/components/common/Logo';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const result = await apiClient.login(email, password);

            // Store token
            localStorage.setItem('access_token', result.access_token);

            // Redirect to dashboard
            router.push('/dashboard');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Login failed');
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="min-h-screen bg-[#0A0A0F] flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-10">
                    <Link href="/" className="inline-flex items-center justify-center mb-6 group">
                        <Logo size="lg" />
                    </Link>
                    <h1 className="text-3xl font-extrabold text-white tracking-tight">
                        Welcome Back
                    </h1>
                    <p className="text-zinc-500 mt-2">Sign in to your Cvber account</p>
                </div>

                {/* Login Form */}
                <div className="bg-[#12121A] border border-zinc-800 rounded-3xl p-8 shadow-2xl shadow-purple-500/5">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Email */}
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

                        {/* Password */}
                        <div>
                            <div className="flex justify-between mb-2">
                                <label className="text-sm font-semibold text-zinc-400">
                                    Password
                                </label>
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

                        {/* Error Message */}
                        {error && (
                            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 animate-shake">
                                <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
                                <p className="text-red-400 text-sm font-medium">{error}</p>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn-primary py-3.5 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : 'Sign In'}
                        </button>
                    </form>

                    {/* Sign Up Link */}
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
