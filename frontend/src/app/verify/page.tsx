"use client";

import { useState } from "react";
import Link from "next/link";
import { Shield, Search, Info, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";

export default function VerifyPage() {
    const [certId, setCertId] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);
    const [result, setResult] = useState<any>(null);

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!certId) return;

        setIsVerifying(true);
        setResult(null);

        // Mock verification for now
        setTimeout(() => {
            if (certId.toLowerCase().startsWith("cvb-")) {
                setResult({
                    status: "success",
                    file: "document-sample.pdf",
                    date: "Dec 20, 2023",
                    hash: "sha256:8f3c...e92a"
                });
            } else {
                setResult({
                    status: "error",
                    message: "Certificate ID not found. Please check and try again."
                });
            }
            setIsVerifying(false);
        }, 1500);
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-20">
            <div className="text-center mb-16">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mx-auto mb-6">
                    <Shield className="w-8 h-8" />
                </div>
                <h1 className="text-4xl font-bold text-gray-900 mb-4">Verify Certificate</h1>
                <p className="text-lg text-gray-600">Enter a certificate ID to verify the authenticity of a protected file</p>
            </div>

            <div className="card p-8 mb-12">
                <h2 className="text-xl font-bold text-gray-900 mb-2">Certificate Verification</h2>
                <p className="text-sm text-gray-500 mb-8">Enter the CVB certificate ID (e.g., CVB-2024-001234)</p>

                <form onSubmit={handleVerify} className="flex flex-col sm:flex-row gap-4 mb-8">
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            value={certId}
                            onChange={(e) => setCertId(e.target.value)}
                            placeholder="CVB-2024-001234"
                            className="w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isVerifying}
                        className="btn-primary py-3 px-8 flex items-center justify-center gap-2 min-w-[140px]"
                    >
                        {isVerifying ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <Search className="w-5 h-5" />
                                Verify
                            </>
                        )}
                    </button>
                </form>

                {result && (
                    <div className={`p-6 rounded-xl border animate-in fade-in slide-in-from-top-4 duration-300 ${result.status === "success" ? "bg-green-50 border-green-100" : "bg-red-50 border-red-100"
                        }`}>
                        {result.status === "success" ? (
                            <div className="flex gap-4">
                                <CheckCircle2 className="w-6 h-6 text-green-600 shrink-0" />
                                <div className="space-y-3 flex-1">
                                    <h3 className="font-bold text-green-900">Certificate Verified!</h3>
                                    <div className="grid sm:grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-green-700/70 block uppercase text-[10px] font-bold">File Name</span>
                                            <span className="text-green-900 font-medium">{result.file}</span>
                                        </div>
                                        <div>
                                            <span className="text-green-700/70 block uppercase text-[10px] font-bold">Registration Date</span>
                                            <span className="text-green-900 font-medium">{result.date}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex gap-4">
                                <AlertCircle className="w-6 h-6 text-red-600 shrink-0" />
                                <div>
                                    <h3 className="font-bold text-red-900">Verification Failed</h3>
                                    <p className="text-sm text-red-700">{result.message}</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                <div className="p-8 bg-gray-50 rounded-2xl">
                    <div className="flex items-center gap-3 mb-4">
                        <Info className="w-5 h-5 text-blue-600" />
                        <h3 className="font-bold text-gray-900">How Verification Works</h3>
                    </div>
                    <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
                        <p>Every file protected with CVBER Free receives a unique certificate ID starting with "CVB-".</p>
                        <p>You can verify the authenticity of any protected file by entering its certificate ID above.</p>
                        <p>A valid certificate proves the file's origin and protects against unauthorized use.</p>
                    </div>
                </div>
                <div className="p-8 bg-blue-50 rounded-2xl border border-blue-100">
                    <h3 className="font-bold text-blue-900 mb-4">Protect Your Own Work</h3>
                    <p className="text-sm text-blue-800 mb-6 leading-relaxed">
                        Want to secure your creative projects? Join CVBER Free and start generating your own certificates today.
                    </p>
                    <Link href="/register" className="text-sm font-bold text-blue-600 flex items-center gap-2 hover:underline">
                        Register now <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </div>
    );
}


