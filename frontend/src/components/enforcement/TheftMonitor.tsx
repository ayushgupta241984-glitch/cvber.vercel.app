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
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-orange-50 to-red-50">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-red-100 rounded-2xl">
                            <Eye className="h-6 w-6 text-red-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Watchtower</h3>
                            <p className="text-sm text-gray-500">Active theft monitoring</p>
                        </div>
                    </div>

                    {/* Total Loss */}
                    <div className="text-right">
                        <p className="text-xs font-bold text-gray-400 uppercase">Est. Revenue Loss</p>
                        <p className="text-2xl font-black text-red-600">${totalLoss.toFixed(2)}</p>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2 mt-4">
                    {['all', 'new', 'actioned'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f as any)}
                            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-full transition-all ${filter === f
                                    ? 'bg-red-600 text-white'
                                    : 'bg-white text-gray-500 hover:bg-gray-50'
                                }`}
                        >
                            {f} {f === 'new' && alerts.filter(a => a.status === 'new').length > 0 && (
                                <span className="ml-1 px-1.5 py-0.5 bg-white/20 rounded-full">
                                    {alerts.filter(a => a.status === 'new').length}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Alerts List */}
            <div className="divide-y divide-gray-50 max-h-[400px] overflow-auto">
                {filteredAlerts.length === 0 ? (
                    <div className="p-12 text-center">
                        <Bell className="h-12 w-12 text-gray-200 mx-auto mb-4" />
                        <p className="text-gray-400 font-medium">No theft alerts</p>
                        <p className="text-sm text-gray-300">Your content is safe... for now</p>
                    </div>
                ) : (
                    filteredAlerts.map((alert) => (
                        <div key={alert.alert_id} className="p-4 hover:bg-gray-50 transition-colors">
                            <div className="flex items-start gap-4">
                                <div className="text-2xl">{getPlatformIcon(alert.platform)}</div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <p className="font-bold text-gray-900 truncate">{alert.asset_name}</p>
                                        {alert.status === 'new' && (
                                            <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold uppercase rounded-full">
                                                New
                                            </span>
                                        )}
                                    </div>
                                    <a
                                        href={alert.found_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-blue-600 hover:text-blue-800 truncate block"
                                    >
                                        {alert.found_url}
                                    </a>
                                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                                        {alert.estimated_views && (
                                            <span className="flex items-center gap-1">
                                                <Globe className="h-3 w-3" />
                                                {alert.estimated_views.toLocaleString()} views
                                            </span>
                                        )}
                                        {alert.estimated_revenue_loss && (
                                            <span className="flex items-center gap-1 text-red-500 font-medium">
                                                <DollarSign className="h-3 w-3" />
                                                ${alert.estimated_revenue_loss.toFixed(2)} lost
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={() => onTakeAction(alert)}
                                    className="px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-xl hover:bg-red-700 transition-colors flex items-center gap-1"
                                >
                                    Take Action <ArrowRight className="h-3 w-3" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
