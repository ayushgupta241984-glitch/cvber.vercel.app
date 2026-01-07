'use client';

import { Shield, Trophy, Award, Star, TrendingUp } from 'lucide-react';

interface TrustScoreProps {
    score: number;
    grade: string;
    badgeColor: string;
    breakdown?: {
        originality: number;
        upload_history: number;
        verified_originals: number;
        dispute_record: number;
        account_age: number;
    };
}

export function TrustScoreBadge({ score, grade, badgeColor, breakdown }: TrustScoreProps) {
    const getGradeColor = () => {
        switch (grade) {
            case 'S': return 'from-yellow-400 via-amber-400 to-orange-400';
            case 'A': return 'from-emerald-400 via-green-400 to-teal-400';
            case 'B': return 'from-blue-400 via-cyan-400 to-sky-400';
            case 'C': return 'from-purple-400 via-violet-400 to-indigo-400';
            default: return 'from-gray-400 via-zinc-400 to-slate-400';
        }
    };

    const getGradeTitle = () => {
        switch (grade) {
            case 'S': return 'Elite Creator';
            case 'A': return 'Trusted Creator';
            case 'B': return 'Verified Creator';
            case 'C': return 'Active Creator';
            case 'D': return 'New Creator';
            default: return 'Unverified';
        }
    };

    return (
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-6 border border-gray-700 shadow-xl">
            {/* Main Score */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${getGradeColor()} flex items-center justify-center shadow-lg`}>
                        <span className="text-3xl font-black text-white drop-shadow-lg">{grade}</span>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">CVBER Trust Score</p>
                        <p className="text-3xl font-black text-white">{score}<span className="text-lg text-gray-500">/1000</span></p>
                    </div>
                </div>
                <div className="text-right">
                    <Trophy className={`h-8 w-8 ${badgeColor === 'gold' ? 'text-yellow-400' : badgeColor === 'silver' ? 'text-gray-300' : 'text-orange-600'}`} />
                    <p className="text-xs text-gray-400 mt-1">{getGradeTitle()}</p>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="h-3 bg-gray-700 rounded-full overflow-hidden mb-6">
                <div
                    className={`h-full bg-gradient-to-r ${getGradeColor()} rounded-full transition-all duration-1000`}
                    style={{ width: `${(score / 1000) * 100}%` }}
                />
            </div>

            {/* Breakdown */}
            {breakdown && (
                <div className="grid grid-cols-2 gap-3">
                    {[
                        { label: 'Originality', value: breakdown.originality, max: 300, icon: Star },
                        { label: 'History', value: breakdown.upload_history, max: 200, icon: TrendingUp },
                        { label: 'Verified', value: breakdown.verified_originals, max: 150, icon: Award },
                        { label: 'Disputes', value: breakdown.dispute_record, max: 150, icon: Shield },
                    ].map((item, idx) => (
                        <div key={idx} className="bg-gray-800/50 rounded-xl p-3">
                            <div className="flex items-center gap-2 mb-2">
                                <item.icon className="h-4 w-4 text-gray-400" />
                                <span className="text-xs font-medium text-gray-400">{item.label}</span>
                            </div>
                            <div className="flex items-baseline gap-1">
                                <span className="text-lg font-bold text-white">{item.value}</span>
                                <span className="text-xs text-gray-500">/{item.max}</span>
                            </div>
                            <div className="h-1 bg-gray-700 rounded-full mt-2 overflow-hidden">
                                <div
                                    className="h-full bg-blue-500 rounded-full"
                                    style={{ width: `${(item.value / item.max) * 100}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Export Button */}
            <button className="w-full mt-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all flex items-center justify-center gap-2">
                <Award className="h-4 w-4" />
                Export Proof of Authenticity
            </button>
        </div>
    );
}
