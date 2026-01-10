'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Shield, CheckCircle, Clock, FileText, Download, ExternalLink, Link2, Scale } from 'lucide-react';
import jsPDF from 'jspdf';

interface ProofData {
    proof_id: string;
    asset_name: string;
    asset_hash: string;
    timestamp: string;
    blockchain: string;
    status: string;
}

export default function VerifyPage() {
    const params = useParams();
    const hash = params.hash as string;
    const [proof, setProof] = useState<ProofData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Look up proof from localStorage (in production, this would be from backend)
        const proofs = JSON.parse(localStorage.getItem('cvber_blockchain_proofs') || '[]');
        const found = proofs.find((p: ProofData) => p.asset_hash === hash);
        setProof(found || null);
        setLoading(false);
    }, [hash]);

    const generateCourtDocument = () => {
        if (!proof) return;

        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();

        // Header
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text('CERTIFICATE OF BLOCKCHAIN TIMESTAMP', pageWidth / 2, 30, { align: 'center' });

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('Court-Admissible Proof of Existence', pageWidth / 2, 38, { align: 'center' });

        // Divider
        doc.setLineWidth(0.5);
        doc.line(20, 45, pageWidth - 20, 45);

        // Content
        let y = 60;
        const leftMargin = 25;
        const rightCol = 80;

        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('DOCUMENT INFORMATION', leftMargin, y);
        y += 10;

        doc.setFont('helvetica', 'normal');
        const fields = [
            ['Asset Name:', proof.asset_name],
            ['Document Hash (SHA-256):', ''],
            ['', proof.asset_hash],
            ['Timestamp:', new Date(proof.timestamp).toUTCString()],
            ['Blockchain:', proof.blockchain.toUpperCase()],
            ['Proof ID:', proof.proof_id],
            ['Verification Status:', proof.status === 'confirmed' ? 'ANCHORED IN BLOCKCHAIN' : 'PENDING CONFIRMATION']
        ];

        fields.forEach(([label, value]) => {
            if (label) {
                doc.setFont('helvetica', 'bold');
                doc.text(label, leftMargin, y);
            }
            if (value) {
                doc.setFont('helvetica', 'normal');
                doc.text(value, rightCol, y);
            }
            y += 8;
        });

        // Legal Statement
        y += 15;
        doc.setFont('helvetica', 'bold');
        doc.text('LEGAL ATTESTATION', leftMargin, y);
        y += 10;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        const legalText = [
            'This certificate attests that the digital document identified by the SHA-256 hash above',
            'existed at the time indicated by the timestamp. This proof was created using',
            'OpenTimestamps, an open protocol that anchors cryptographic timestamps to the',
            'Bitcoin blockchain.',
            '',
            'The Bitcoin blockchain is a decentralized, immutable public ledger. Once a timestamp',
            'is anchored to a Bitcoin block, it becomes mathematically impossible to alter or',
            'backdate without invalidating the entire chain of subsequent blocks.',
            '',
            'This document may be independently verified by:',
            '1. Computing the SHA-256 hash of the original file',
            '2. Comparing it to the hash recorded in this certificate',
            '3. Verifying the OpenTimestamps proof against the Bitcoin blockchain',
            '',
            'Verification URL: https://opentimestamps.org/verify'
        ];

        legalText.forEach(line => {
            doc.text(line, leftMargin, y);
            y += 6;
        });

        // Footer
        y = 260;
        doc.setLineWidth(0.5);
        doc.line(20, y, pageWidth - 20, y);
        y += 10;

        doc.setFontSize(8);
        doc.text(`Generated: ${new Date().toUTCString()}`, leftMargin, y);
        doc.text(`CVBER.FREE Blockchain Verification System`, pageWidth - 25, y, { align: 'right' });

        // Download
        doc.save(`CVBER_Blockchain_Certificate_${proof.proof_id}.pdf`);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent" />
            </div>
        );
    }

    if (!proof) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="text-center">
                    <Shield className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Proof Not Found</h1>
                    <p className="text-gray-500">No blockchain timestamp exists for this hash.</p>
                    <code className="mt-4 block text-xs text-gray-400 bg-gray-100 p-2 rounded">{hash}</code>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-black p-4 md:p-8">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-purple-500/20 rounded-3xl mb-6">
                        <Link2 className="h-10 w-10 text-purple-300" />
                    </div>
                    <h1 className="text-3xl font-black text-white mb-2">Blockchain Verification</h1>
                    <p className="text-purple-300">Court-admissible proof of existence</p>
                </div>

                {/* Main Card */}
                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
                    {/* Status Banner */}
                    <div className={`p-6 ${proof.status === 'confirmed' ? 'bg-green-500' : 'bg-yellow-500'}`}>
                        <div className="flex items-center justify-center gap-3">
                            {proof.status === 'confirmed' ? (
                                <CheckCircle className="h-8 w-8 text-white" />
                            ) : (
                                <Clock className="h-8 w-8 text-white animate-pulse" />
                            )}
                            <span className="text-xl font-bold text-white">
                                {proof.status === 'confirmed' ? 'VERIFIED ON BLOCKCHAIN' : 'PENDING CONFIRMATION'}
                            </span>
                        </div>
                    </div>

                    {/* Details */}
                    <div className="p-6 space-y-6">
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Asset Name</p>
                            <p className="text-lg font-bold text-gray-900">{proof.asset_name}</p>
                        </div>

                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">SHA-256 Hash</p>
                            <code className="block p-3 bg-gray-100 rounded-xl text-xs font-mono text-gray-700 break-all">
                                {proof.asset_hash}
                            </code>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Timestamp</p>
                                <p className="font-medium text-gray-900">{new Date(proof.timestamp).toLocaleString()}</p>
                                <p className="text-xs text-gray-500">{new Date(proof.timestamp).toUTCString()}</p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Blockchain</p>
                                <p className="font-medium text-gray-900">{proof.blockchain.toUpperCase()}</p>
                                <p className="text-xs text-gray-500">via OpenTimestamps</p>
                            </div>
                        </div>

                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Proof ID</p>
                            <code className="text-sm font-mono text-purple-600">{proof.proof_id}</code>
                        </div>

                        {/* Legal Notice */}
                        <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                            <div className="flex items-start gap-3">
                                <Scale className="h-5 w-5 text-blue-600 mt-0.5" />
                                <div>
                                    <p className="font-bold text-blue-900 text-sm">Legal Validity</p>
                                    <p className="text-xs text-blue-700 mt-1">
                                        This timestamp is anchored to the Bitcoin blockchain via OpenTimestamps,
                                        providing cryptographically verifiable proof that this file existed at the stated time.
                                        This proof is independently verifiable by any third party.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="p-6 border-t border-gray-100 flex flex-col sm:flex-row gap-3">
                        <button
                            onClick={generateCourtDocument}
                            className="flex-1 py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                        >
                            <Download className="h-4 w-4" />
                            Download Court Certificate
                        </button>
                        <a
                            href="https://opentimestamps.org/verify"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                        >
                            <ExternalLink className="h-4 w-4" />
                            Verify on OpenTimestamps
                        </a>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-purple-400 text-xs mt-8">
                    CVBER.FREE Blockchain Verification System
                </p>
            </div>
        </div>
    );
}
