'use client';

import { AlertOctagon, Shield, Eye, XCircle, Clock } from 'lucide-react';

interface KillSwitchProps {
    isActive: boolean;
    disputeId?: string;
    reason?: string;
    onActivate: () => void;
    onDeactivate: () => void;
}

export function KillSwitch({ isActive, disputeId, reason, onActivate, onDeactivate }: KillSwitchProps) {
    return (
        <div className={`rounded-3xl p-6 border-2 transition-all ${isActive
                ? 'bg-red-50 border-red-200'
                : 'bg-gray-50 border-gray-200'
            }`}>
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-2xl ${isActive ? 'bg-red-100' : 'bg-gray-100'}`}>
                        <AlertOctagon className={`h-6 w-6 ${isActive ? 'text-red-600' : 'text-gray-400'}`} />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900">Kill Switch</h3>
                        <p className="text-sm text-gray-500">
                            {isActive ? 'Content under dispute' : 'Instant content revocation'}
                        </p>
                    </div>
                </div>

                {/* Toggle */}
                <button
                    onClick={isActive ? onDeactivate : onActivate}
                    className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${isActive ? 'bg-red-600' : 'bg-gray-300'
                        }`}
                >
                    <span
                        className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-transform ${isActive ? 'translate-x-7' : 'translate-x-1'
                            }`}
                    />
                </button>
            </div>

            {isActive && (
                <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                    <div className="p-4 bg-red-100 rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                            <Eye className="h-4 w-4 text-red-600" />
                            <span className="text-sm font-bold text-red-800">Active Protection</span>
                        </div>
                        <p className="text-xs text-red-700 leading-relaxed">
                            All embeds and previews of this content are now blurred. A "Content Under Dispute" banner is displayed to viewers.
                        </p>
                    </div>

                    {disputeId && (
                        <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-red-100">
                            <div className="flex items-center gap-2">
                                <Shield className="h-4 w-4 text-red-500" />
                                <span className="text-xs font-mono text-gray-600">{disputeId}</span>
                            </div>
                            <span className="flex items-center gap-1 text-xs text-orange-600">
                                <Clock className="h-3 w-3" />
                                Pending Review
                            </span>
                        </div>
                    )}

                    {reason && (
                        <div className="p-3 bg-white rounded-xl border border-gray-100">
                            <p className="text-xs font-bold text-gray-400 uppercase mb-1">Reason</p>
                            <p className="text-sm text-gray-600">{reason}</p>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-white rounded-xl text-center">
                            <p className="text-2xl font-black text-red-600">100%</p>
                            <p className="text-xs text-gray-500">Content Blurred</p>
                        </div>
                        <div className="p-3 bg-white rounded-xl text-center">
                            <p className="text-2xl font-black text-orange-600">∞</p>
                            <p className="text-xs text-gray-500">Shares Blocked</p>
                        </div>
                    </div>
                </div>
            )}

            {!isActive && (
                <div className="flex items-center gap-3 p-4 bg-gray-100 rounded-xl">
                    <XCircle className="h-5 w-5 text-gray-400" />
                    <p className="text-sm text-gray-500">
                        Activate to instantly revoke access and display dispute warnings.
                    </p>
                </div>
            )}
        </div>
    );
}
