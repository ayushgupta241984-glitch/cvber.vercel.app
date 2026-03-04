'use client';

import { useState } from 'react';
import { Eye, AlertTriangle, DollarSign, Globe, ArrowRight, Bell } from 'lucide-react';

interface TheftAlert {
    alert_id: string;
    asset_name: string;
    found_url: string;
    platform: string;
    estimated_views: number | null;
    estimated_revenue_loss: number | null;
    detected_at: string;
    status: string;
}

interface TheftMonitorProps {
    alerts: TheftAlert[];
    totalLoss: number;
    onTakeAction: (alert: TheftAlert) => void;
}

export function TheftMonitor({ alerts, totalLoss, onTakeAction }: TheftMonitorProps) {
    const [filter, setFilter] = useState<'all' | 'new' | 'actioned'>('all');

    const filteredAlerts = alerts.filter(a => {
        if (filter === 'all') return true;
        if (filter === 'new') return a.status === 'new';
        return a.status === 'actioned';
    });

    const getPlatformIcon = (platform: string) => {
        switch (platform) {
            case 'youtube': return '📺';
            case 'instagram': return '📸';
            case 'tiktok': return '🎵';
            case 'x': return '🐦';
            default: return '🌐';
        }
    };

    return (
        <div className="card-premium overflow-hidden group">
            {/* Header */}
            <div className="p-8 border-b border-zinc-800/50 bg-gradient-to-br from-purple-500/5 to-transparent relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
                    <Eye className="h-24 w-24 text-purple-500" />
                </div>

                <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-6">
                        <div className="p-4 bg-purple-500/10 rounded-2xl border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.1)]">
                            <Eye className="h-7 w-7 text-purple-400" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white tracking-tight">Watchtower</h3>
                            <p className="text-sm text-zinc-500 mt-1">Real-time asset monitoring & threat detection</p>
                        </div>
                    </div>

                    {/* Total Loss */}
                    <div className="text-right">
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-1">Est. Revenue Loss</p>
                        <p className="text-3xl font-black text-white text-glow-purple">
                            <span className="text-purple-500 text-sm align-top mr-1">$</span>
                            {totalLoss.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-3 mt-8">
                    {['all', 'new', 'actioned'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f as any)}
                            className={`px-5 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-300 border ${filter === f
                                ? 'bg-purple-600 border-purple-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.3)]'
                                : 'bg-zinc-900/50 border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700'
                                }`}
                        >
                            {f} {f === 'new' && alerts.filter(a => a.status === 'new').length > 0 && (
                                <span className="ml-2 px-1.5 py-0.5 bg-white/10 rounded-md text-[10px]">
                                    {alerts.filter(a => a.status === 'new').length}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Alerts List */}
            <div className="divide-y divide-zinc-800/50 max-h-[500px] overflow-auto scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
                {filteredAlerts.length === 0 ? (
                    <div className="p-16 text-center">
                        <div className="w-16 h-16 bg-zinc-900/50 rounded-full flex items-center justify-center mx-auto mb-6 border border-zinc-800">
                            <Bell className="h-8 w-8 text-zinc-700" />
                        </div>
                        <p className="text-zinc-300 font-bold text-lg mb-2">Operational Calm</p>
                        <p className="text-sm text-zinc-600 max-w-[200px] mx-auto">No theft alerts detected in the current monitoring cycle.</p>
                    </div>
                ) : (
                    filteredAlerts.map((alert) => (
                        <div key={alert.alert_id} className="p-6 hover:bg-white/[0.02] transition-colors relative group/item">
                            <div className="flex items-start gap-6">
                                <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 text-2xl group-hover/item:border-purple-500/30 transition-colors">
                                    {getPlatformIcon(alert.platform)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-1.5">
                                        <p className="font-bold text-lg text-white truncate">{alert.asset_name}</p>
                                        {alert.status === 'new' && (
                                            <span className="px-2.5 py-0.5 bg-purple-500 text-white text-[9px] font-black uppercase tracking-widest rounded-full shadow-[0_0_10px_rgba(168,85,247,0.4)]">
                                                New
                                            </span>
                                        )}
                                    </div>
                                    <a
                                        href={alert.found_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1.5 group/link"
                                    >
                                        <span className="truncate">{alert.found_url}</span>
                                        <ArrowRight className="h-3 w-3 inline opacity-0 group-hover/link:opacity-100 -translate-x-1 group-hover/link:translate-x-0 transition-all" />
                                    </a>
                                    <div className="flex items-center gap-6 mt-4">
                                        {alert.estimated_views && (
                                            <div className="flex flex-col">
                                                <span className="text-[10px] text-zinc-600 uppercase font-black tracking-widest leading-none mb-1">Impact</span>
                                                <span className="text-sm text-zinc-200 font-bold flex items-center gap-1.5">
                                                    <Globe className="h-3.5 w-3.5 text-zinc-500" />
                                                    {alert.estimated_views.toLocaleString()} <span className="text-zinc-500 font-normal">views</span>
                                                </span>
                                            </div>
                                        )}
                                        {alert.estimated_revenue_loss && (
                                            <div className="flex flex-col">
                                                <span className="text-[10px] text-zinc-600 uppercase font-black tracking-widest leading-none mb-1">Loss</span>
                                                <span className="text-sm text-white font-bold flex items-center gap-1.5">
                                                    <DollarSign className="h-3.5 w-3.5 text-purple-500" />
                                                    {alert.estimated_revenue_loss.toFixed(2)}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={() => onTakeAction(alert)}
                                    className="px-6 py-3 bg-zinc-900 border border-zinc-800 hover:border-purple-500 text-white text-xs font-bold rounded-xl transition-all hover:bg-purple-600 flex items-center gap-2 group/btn active:scale-95"
                                >
                                    Take Action <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
