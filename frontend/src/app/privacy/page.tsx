import React from 'react';
import { Shield, Lock, Eye, FileText, Trash2, Globe } from 'lucide-react';

export default function PrivacyPolicy() {
    return (
        <div className="max-w-4xl mx-auto px-6 py-12 text-gray-200">
            <header className="mb-12 border-b border-gray-800 pb-8">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-4">
                    Privacy Policy
                </h1>
                <p className="text-gray-400">Last Updated: April 19, 2026</p>
                <div className="mt-6 flex items-center gap-2 text-blue-400 bg-blue-400/10 w-fit px-4 py-2 rounded-full border border-blue-400/20">
                    <Shield size={18} />
                    <span className="text-sm font-semibold italic">Your Art, Your Choice. We don't steal.</span>
                </div>
            </header>

            <section className="space-y-12">
                <div>
                    <h2 className="text-2xl font-semibold flex items-center gap-3 mb-4 text-white">
                        <Lock className="text-blue-500" />
                        1. Data Collection & Usage
                    </h2>
                    <p className="leading-relaxed mb-4">
                        CVBER is designed with a **Privacy-First** mindset. We only collect the data necessary to provide our art protection services:
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                        <li><span className="font-bold text-white text-md">User Account Info:</span> Email address and name used for registration via Supabase Auth.</li>
                        <li><span className="font-bold text-white text-md">Art Ownership Data:</span> File names, hashes, and metadata for C2PA certificate generation.</li>
                        <li><span className="font-bold text-white text-md">Uploaded Media:</span> Images uploaded for watermarking or certification.</li>
                    </ul>
                </div>

                <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800">
                    <h2 className="text-2xl font-semibold flex items-center gap-3 mb-4 text-white">
                        <Trash2 className="text-red-500" />
                        2. Data Retention (Zero-Persistence)
                    </h2>
                    <p className="leading-relaxed italic text-gray-300">
                        "Your image stays on our server for exactly as long as it takes to protect it."
                    </p>
                    <p className="mt-4">
                        We follow a strict **Zero-Persistence** policy for uploaded art:
                    </p>
                    <ul className="mt-4 space-y-4">
                        <li className="flex gap-4">
                            <div className="bg-blue-500/10 p-2 rounded h-fit"><Shield className="text-blue-500" size={20} /></div>
                            <div>
                                <h4 className="font-bold text-white italic underline">Immediate Deletion</h4>
                                <p className="text-sm text-gray-400 italic">Images uploaded for C2PA certification or watermarking are deleted immediately after the processed file is served back to you. We do not store your original high-resolution art on our servers.</p>
                            </div>
                        </li>
                        <li className="flex gap-4">
                            <div className="bg-blue-500/10 p-2 rounded h-fit"><Shield className="text-blue-500" size={20} /></div>
                            <div>
                                <h4 className="font-bold text-white italic underline">30-Day Registry</h4>
                                <p className="text-sm text-gray-400 italic">Metadata and transaction hashes (not the images) are stored for 30 days in our audit trail to support DMCA disputes, after which they are archived or deleted based on user preference.</p>
                            </div>
                        </li>
                    </ul>
                </div>

                <div>
                    <h2 className="text-2xl font-semibold flex items-center gap-3 mb-4 text-white font-bold italic underline decoration-blue-500">
                        <Eye className="text-purple-500" /> 
                        3. AI Service Disclosure
                    </h2>
                    <p className="leading-relaxed mb-4 italic">
                        To provide advanced art theft detection and metadata analysis, we use third-party AI processors:
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                        <li><span className="font-bold text-white italic underline underline-offset-4 decoration-purple-500">Google Vertex AI & Gemini:</span> Used for deep visual analysis and metadata enrichment.</li>
                        <li><span className="font-bold text-white italic underline underline-offset-4 decoration-purple-500">Groq:</span> Used for high-speed forensic classification.</li>
                    </ul>
                    <p className="mt-4 text-sm text-gray-400">
                        None of these providers are permitted to use your uploaded art to train their models through our integration.
                    </p>
                </div>

                <div className="pt-8 border-t border-gray-800">
                    <p className="text-center text-gray-500 text-sm italic">
                        For any privacy-related requests or data deletion, contact <a href="mailto:support@cvber.app" className="text-blue-400 hover:underline">support@cvber.app</a>
                    </p>
                </div>
            </section>
        </div>
    );
}
