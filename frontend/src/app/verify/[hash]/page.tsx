'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Shield, CheckCircle, Clock, FileText, Download, ExternalLink, Scale } from 'lucide-react';
import { ArrowLeft } from 'lucide-react';
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
        const proofs = JSON.parse(localStorage.getItem('cvber_blockchain_proofs') || '[]');
        const found = proofs.find((p: ProofData) => p.asset_hash === hash);
        setProof(found || null);
        setLoading(false);
    }, [hash]);

    const generateCourtDocument = () => {
        if (!proof) return;
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();

        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text('CERTIFICATE OF BLOCKCHAIN TIMESTAMP', pageWidth / 2, 30, { align: 'center' });
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('Court-Admissible Proof of Existence', pageWidth / 2, 38, { align: 'center' });
        doc.setLineWidth(0.5);
        doc.line(20, 45, pageWidth - 20, 45);

        let y = 60;
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('DOCUMENT INFORMATION', 25, y);
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
            if (label) { doc.setFont('helvetica', 'bold'); doc.text(label, 25, y); }
            if (value) { doc.setFont('helvetica', 'normal'); doc.text(value, 80, y); }
            y += 8;
        });

        y += 15;
        doc.setFont('helvetica', 'bold');
        doc.text('LEGAL ATTESTATION', 25, y);
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
        ];
        legalText.forEach(line => { doc.text(line, 25, y); y += 6; });

        y = 260;
        doc.setLineWidth(0.5);
        doc.line(20, y, pageWidth - 20, y);
        y += 10;
        doc.setFontSize(8);
        doc.text(`Generated: ${new Date().toUTCString()}`, 25, y);
        doc.text(`CVBER Verification System`, pageWidth - 25, y, { align: 'right' });

        doc.save(`CVBER_Blockchain_Certificate_${proof.proof_id}.pdf`);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gallery-black flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-luxury-muted/30 border-t-luxury-gold rounded-full animate-spin" />
            </div>
        );
    }

    if (!proof) {
        return (
            <div className="min-h-screen bg-gallery-black flex items-center justify-center p-4">
                <div className="text-center max-w-md">
                    <Shield className="h-12 w-12 text-luxury-muted/30 mx-auto mb-6" />
                    <h1 className="font-display text-3xl font-bold text-luxury-cream mb-3">Proof Not Found</h1>
                    <p className="text-luxury-muted font-sans text-sm mb-6">No blockchain timestamp exists for this hash.</p>
                    <code className="block text-xs text-luxury-muted/40 bg-gallery-deep p-3 rounded-lg font-mono break-all mb-8">{hash}</code>
                    <Link href="/verify" className="btn-ghost inline-flex items-center gap-2">
                        <ArrowLeft className="w-3 h-3" /> Back to Validator
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gallery-black text-luxury-cream p-4 md:p-8">
            <div className="max-w-2xl mx-auto pt-20">
                <Link href="/verify" className="tag mb-8 block flex items-center gap-2">
                    <ArrowLeft className="w-3 h-3" /> Back to Validator
                </Link>

                {/* Header */}
                <div className="text-center mb-10">
                    <div className="w-16 h-16 rounded-full border border-luxury-gold/20 flex items-center justify-center mx-auto mb-6">
                        <Shield className="h-8 w-8 text-luxury-gold" />
                    </div>
                    <h1 className="font-display text-3xl md:text-4xl font-bold text-luxury-cream mb-2 gold-glow">
                        Blockchain Verification
                    </h1>
                    <p className="text-luxury-muted font-sans text-sm">Court-admissible proof of existence</p>
                </div>

                {/* Main Card */}
                <div className="card-gallery overflow-hidden">
                    {/* Status Banner */}
                    <div className={`p-6 text-center ${proof.status === 'confirmed' ? 'bg-luxury-gold/90' : 'bg-luxury-gold/60'}`}>
                        <div className="flex items-center justify-center gap-3">
                            {proof.status === 'confirmed' ? (
                                <CheckCircle className="h-6 w-6 text-black" />
                            ) : (
                                <Clock className="h-6 w-6 text-black animate-pulse" />
                            )}
                            <span className="font-sans text-sm font-bold text-black uppercase tracking-wide">
                                {proof.status === 'confirmed' ? 'Verified on Blockchain' : 'Pending Confirmation'}
                            </span>
                        </div>
                    </div>

                    {/* Details */}
                    <div className="p-6 md:p-8 space-y-8">
                        <div>
                            <p className="text-[9px] font-bold text-luxury-muted/50 uppercase tracking-ultra-wide font-sans mb-2">Asset Name</p>
                            <p className="font-display text-lg font-bold text-luxury-cream">{proof.asset_name}</p>
                        </div>

                        <div>
                            <p className="text-[9px] font-bold text-luxury-muted/50 uppercase tracking-ultra-wide font-sans mb-2">SHA-256 Hash</p>
                            <code className="block p-3 bg-gallery-deep border border-gallery-border rounded-xl text-xs font-mono text-luxury-muted break-all">
                                {proof.asset_hash}
                            </code>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <p className="text-[9px] font-bold text-luxury-muted/50 uppercase tracking-ultra-wide font-sans mb-2">Timestamp</p>
                                <p className="font-sans text-sm font-medium text-luxury-cream">{new Date(proof.timestamp).toLocaleString()}</p>
                                <p className="text-xs text-luxury-muted/60 font-sans">{new Date(proof.timestamp).toUTCString()}</p>
                            </div>
                            <div>
                                <p className="text-[9px] font-bold text-luxury-muted/50 uppercase tracking-ultra-wide font-sans mb-2">Blockchain</p>
                                <p className="font-sans text-sm font-medium text-luxury-cream">{proof.blockchain.toUpperCase()}</p>
                                <p className="text-xs text-luxury-muted/60 font-sans">via OpenTimestamps</p>
                            </div>
                        </div>

                        <div>
                            <p className="text-[9px] font-bold text-luxury-muted/50 uppercase tracking-ultra-wide font-sans mb-2">Proof ID</p>
                            <code className="text-sm font-mono text-luxury-gold">{proof.proof_id}</code>
                        </div>

                        {/* Legal Notice */}
                        <div className="p-5 card-gallery bg-gallery-deep">
                            <div className="flex items-start gap-3">
                                <Scale className="w-4 h-4 text-luxury-gold mt-0.5 shrink-0" />
                                <div>
                                    <p className="font-sans text-xs font-bold text-luxury-cream mb-1">Legal Validity</p>
                                    <p className="text-xs text-luxury-muted font-sans leading-relaxed">
                                        This timestamp is anchored to the Bitcoin blockchain via OpenTimestamps, providing cryptographically verifiable proof that this file existed at the stated time.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="p-6 md:p-8 border-t border-gallery-border flex flex-col sm:flex-row gap-3">
                        <button onClick={generateCourtDocument}
                            className="flex-1 py-3 btn-primary text-[10px] flex items-center justify-center gap-2">
                            <Download className="w-3 h-3" />
                            Download Court Certificate
                        </button>
                        <a href="https://opentimestamps.org" target="_blank" rel="noopener noreferrer"
                            className="flex-1 py-3 btn-outline text-[10px] flex items-center justify-center gap-2">
                            <ExternalLink className="w-3 h-3" />
                            OpenTimestamps
                        </a>
                    </div>
                </div>

                <p className="text-center text-luxury-muted/20 text-[8px] font-bold uppercase tracking-[0.5em] mt-10 font-sans">
                    CVBER Blockchain Verification System
                </p>
            </div>
        </div>
    );
}
