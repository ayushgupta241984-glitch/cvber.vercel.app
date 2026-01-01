'use client';

import { useState } from 'react';
import { FileUploader } from '@/components/dashboard/FileUploader';
import { SafeVault } from '@/components/dashboard/SafeVault';
import { SecurityMentor } from '@/components/chat/SecurityMentor';
import { Shield, ArrowLeft, FileText, Award, HardDrive, Stamp, Upload, Search, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
    const [files, setFiles] = useState<any[]>([]);

    const handleUploadComplete = (result: any) => {
        const newFile = {
            id: result.scan_id,
            name: 'uploaded-file.pdf', // You'd get this from the upload
            size: 1024 * 50, // Example size
            status: result.risk_report ? 'safe' : 'scanning',
            riskScore: result.risk_report?.overall_risk_score,
            uploadedAt: new Date().toISOString(),
        };

        setFiles(prev => [newFile, ...prev]);
    };

    return (
        <div className="bg-gray-50/50 min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {/* Welcome Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Dashboard</h1>
                        <p className="text-gray-500 font-medium">Manage and protect your creative work</p>
                    </div>
                    <a href="#upload" className="btn-primary flex items-center gap-2 self-start md:self-center py-3">
                        <Upload className="w-5 h-5" />
                        Upload New File
                    </a>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {[
                        { label: 'Total Files', value: '12', icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
                        { label: 'Certificates', value: '8', icon: Award, color: 'text-purple-600', bg: 'bg-purple-50' },
                        { label: 'Storage Used', value: '45.2 MB', icon: HardDrive, color: 'text-green-600', bg: 'bg-green-50' },
                        { label: 'Active Watermarks', value: '5', icon: Stamp, color: 'text-orange-600', bg: 'bg-orange-50' }
                    ].map((stat, idx) => (
                        <div key={idx} className="card p-6 flex items-center gap-5">
                            <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{stat.label}</p>
                                <p className="text-2xl font-black text-gray-900">{stat.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left: Main Content */}
                    <div className="lg:col-span-2 space-y-10">
                        {/* Upload Section */}
                        <section id="upload" className="scroll-mt-32">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-gray-900">Upload & Protect</h2>
                                <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-widest rounded-full">New Scan</span>
                            </div>
                            <FileUploader onUploadComplete={handleUploadComplete} />
                        </section>

                        {/* File List */}
                        <div className="card overflow-hidden">
                            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                                <h2 className="font-bold text-gray-900 font-bold">Your Vault</h2>
                                <div className="relative">
                                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        placeholder="Search files..."
                                        className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                    />
                                </div>
                            </div>

                            {files.length === 0 ? (
                                <div className="p-20 text-center">
                                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <FileText className="w-10 h-10 text-gray-300" />
                                    </div>
                                    <h3 className="font-bold text-gray-900 mb-2">No files yet</h3>
                                    <p className="text-gray-500 text-sm max-w-xs mx-auto mb-8">
                                        Upload your first file to start protecting your work and generating certificates.
                                    </p>
                                    <button className="text-blue-600 font-bold text-sm hover:underline">
                                        Learn how it works
                                    </button>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-50">
                                    {files.map((file, idx) => (
                                        <div key={idx} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded flex items-center justify-center">
                                                    <FileText className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 text-sm">{file.name}</p>
                                                    <p className="text-xs text-gray-400">Uploaded on {new Date(file.uploadedAt).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${file.status === 'safe' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                                    }`}>
                                                    {file.status}
                                                </span>
                                                <button className="p-2 text-gray-400 hover:text-gray-600">
                                                    <ArrowRight className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Security Help / Mentor */}
                    <div className="lg:col-span-1">
                        <SecurityMentor />
                    </div>
                </div>
            </div>
        </div>
    );
}



