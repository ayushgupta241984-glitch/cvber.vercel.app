'use client';

import { useState } from 'react';
import { FileText, Check, Copy, DollarSign, Users, Building } from 'lucide-react';
import { BASE_URL } from '@/lib/api-client';

interface LicenseGeneratorProps {
    asset: {
        name: string;
        hash: string;
    };
    licensorName: string;
    onClose: () => void;
}

const LICENSE_TYPES = [
    {
        id: 'personal',
        name: 'Personal Use',
        icon: Users,
        description: 'Non-commercial, single user',
        price: 'Free',
        features: ['Single copy', 'No commercial use', 'Attribution required']
    },
    {
        id: 'commercial',
        name: 'Commercial',
        icon: Building,
        description: 'Business use, 1 year',
        price: '$49',
        features: ['Unlimited copies', 'Commercial use', '1 year validity']
    },
    {
        id: 'exclusive',
        name: 'Exclusive',
        icon: DollarSign,
        description: 'Full rights transfer',
        price: '$499',
        features: ['Exclusive rights', 'No attribution needed', 'Perpetual']
    }
];

export function LicenseGenerator({ asset, licensorName, onClose }: LicenseGeneratorProps) {
    const [selectedType, setSelectedType] = useState<string | null>(null);
    const [licenseeEmail, setLicenseeEmail] = useState('');
    const [licenseeName, setLicenseeName] = useState('');
    const [generatedLicense, setGeneratedLicense] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleGenerate = async () => {
        if (!selectedType || !licenseeEmail || !licenseeName) return;

        setIsLoading(true);
        try {
            const response = await fetch(`${BASE_URL}/api/enforcement/license/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    asset_hash: asset.hash,
                    asset_name: asset.name,
                    license_type: selectedType,
                    licensee_name: licenseeName,
                    licensee_email: licenseeEmail,
                    licensor_name: licensorName
                })
            });
            const data = await response.json();
            setGeneratedLicense(data);
        } catch (error) {
            console.error('Failed to generate license:', error);
        }
        setIsLoading(false);
    };

    const copyLink = () => {
        if (generatedLicense?.license?.verification_url) {
            navigator.clipboard.writeText(generatedLicense.license.verification_url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />

            <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-emerald-50 to-teal-50">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-100 rounded-2xl">
                            <FileText className="h-6 w-6 text-emerald-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">License Generator</h2>
                            <p className="text-sm text-gray-500">Create a license for: {asset.name}</p>
                        </div>
                    </div>
                </div>

                {!generatedLicense ? (
                    <div className="p-6 space-y-6">
                        {/* License Type Selection */}
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                                Select License Type
                            </label>
                            <div className="grid grid-cols-3 gap-3">
                                {LICENSE_TYPES.map((type) => (
                                    <button
                                        key={type.id}
                                        onClick={() => setSelectedType(type.id)}
                                        className={`p-4 rounded-2xl border-2 text-left transition-all ${selectedType === type.id
                                                ? 'border-emerald-500 bg-emerald-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <type.icon className={`h-6 w-6 mb-2 ${selectedType === type.id ? 'text-emerald-600' : 'text-gray-400'}`} />
                                        <p className="font-bold text-gray-900">{type.name}</p>
                                        <p className="text-xs text-gray-500 mb-2">{type.description}</p>
                                        <p className="text-lg font-black text-emerald-600">{type.price}</p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Licensee Details */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                                    Buyer Name
                                </label>
                                <input
                                    type="text"
                                    value={licenseeName}
                                    onChange={(e) => setLicenseeName(e.target.value)}
                                    placeholder="Jane Smith"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                                    Buyer Email
                                </label>
                                <input
                                    type="email"
                                    value={licenseeEmail}
                                    onChange={(e) => setLicenseeEmail(e.target.value)}
                                    placeholder="jane@company.com"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                            <button
                                onClick={onClose}
                                className="px-6 py-3 text-gray-500 hover:text-gray-700"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleGenerate}
                                disabled={!selectedType || !licenseeEmail || !licenseeName || isLoading}
                                className="px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? 'Generating...' : 'Generate License'}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="p-6 space-y-6">
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Check className="h-8 w-8 text-emerald-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">License Created!</h3>
                            <p className="text-gray-500">ID: {generatedLicense.license?.license_id}</p>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-4">
                            <p className="text-xs font-bold text-gray-400 uppercase mb-2">Verification Link</p>
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={generatedLicense.license?.verification_url || ''}
                                    readOnly
                                    className="flex-1 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm"
                                />
                                <button
                                    onClick={copyLink}
                                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                                >
                                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        <button
                            onClick={onClose}
                            className="w-full py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-black"
                        >
                            Done
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
