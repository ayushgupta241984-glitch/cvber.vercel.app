import React from 'react';
import { Gavel, Scale, AlertTriangle, CheckCircle, HelpCircle } from 'lucide-react';

export default function TermsOfUse() {
    return (
        <div className="max-w-4xl mx-auto px-6 py-12 text-gray-200">
            <header className="mb-12 border-b border-gray-800 pb-8">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent mb-4">
                    Terms of Use
                </h1>
                <p className="text-gray-400 font-bold italic">Last Updated: April 19, 2026</p>
            </header>

            <div className="bg-yellow-500/10 border border-yellow-500/20 p-6 rounded-xl mb-12 flex gap-4">
                <AlertTriangle className="text-yellow-500 shrink-0" />
                <p className="text-sm text-yellow-200/80 italic">
                    <span className="font-bold text-yellow-500 underline underline-offset-4">TL;DR:</span> We provide the tools to help you protect your art, but you are responsible for how you use those tools and for ensuring you actually own the art you upload.
                </p>
            </div>

            <section className="space-y-12">
                <div>
                    <h2 className="text-2xl font-semibold flex items-center gap-3 mb-4 text-white uppercase italic tracking-tighter decoration-green-500 underline underline-offset-8">
                        <Gavel className="text-green-500 italic" />
                        1. Acceptance of Terms
                    </h2>
                    <p className="leading-relaxed">
                        By using CVBER, you agree to these terms. If you don't agree, please do not use the service. We reserve the right to modify these terms at any time, and your continued use indicates acceptance of the update.
                    </p>
                </div>

                <div>
                    <h2 className="text-2xl font-semibold flex items-center gap-3 mb-4 text-white uppercase italic tracking-tighter decoration-green-500 underline underline-offset-8">
                        <Scale className="text-blue-500 italic" />
                        2. Ownership & Responsibility
                    </h2>
                    <p className="leading-relaxed">
                        You represent and warrant that:
                    </p>
                    <ul className="list-disc list-inside mt-4 space-y-2 ml-4">
                        <li>You are the <span className="text-white font-bold italic underline">original creator</span> or legal owner of the art you upload.</li>
                        <li>Your use of CVBER does not infringe upon the intellectual property of others.</li>
                        <li>You will not use the platform to generate <span className="text-white font-bold italic underline">fraudulent certificates</span> for art you do not own.</li>
                    </ul>
                </div>

                <div>
                    <h2 className="text-2xl font-semibold flex items-center gap-3 mb-4 text-white uppercase italic tracking-tighter decoration-green-500 underline underline-offset-8">
                        <CheckCircle className="text-green-500 italic" />
                        3. C2PA & Metadata
                    </h2>
                    <p className="leading-relaxed">
                        Our C2PA certification service injects provenance metadata into your files. While we strive for industry compliance, we do not guarantee that the certificate will be recognized as legal proof of ownership in every jurisdiction. The certificate is a <span className="text-white font-bold italic underline">technological aid</span>, not a legal verdict.
                    </p>
                </div>

                <div className="bg-gray-900 border border-gray-800 p-8 rounded-2xl">
                    <h2 className="text-2xl font-semibold mb-6 text-white uppercase font-bold italic">4. Limitations of Liability</h2>
                    <p className="text-gray-400 italic">
                        CVBER is provided "as is". We are not liable for:
                    </p>
                    <ul className="mt-4 space-y-4">
                        <li className="p-4 bg-black/40 rounded border-l-4 border-red-500 italic font-bold tracking-tight uppercase">
                            Failed DMCA takedowns by third-party platforms.
                        </li>
                        <li className="p-4 bg-black/40 rounded border-l-4 border-red-500 italic font-bold tracking-tight uppercase">
                            Loss of images due to user error.
                        </li>
                        <li className="p-4 bg-black/40 rounded border-l-4 border-red-500 italic font-bold tracking-tight uppercase">
                            Direct, indirect, or incidental damages arising from the use of our services.
                        </li>
                    </ul>
                </div>

                <div>
                    <h2 className="text-2xl font-semibold flex items-center gap-3 mb-4 text-white uppercase italic tracking-tighter decoration-green-500 underline underline-offset-8 font-bold">
                        <HelpCircle className="text-purple-500 italic" />
                        5. Termination
                    </h2>
                    <p className="leading-relaxed italic font-bold">
                        We reserve the right to suspend or terminate accounts that violate our "No Fraud" policy or engage in activities that harm the artist community.
                    </p>
                </div>

                <div className="pt-8 border-t border-gray-800 text-center italic text-sm text-gray-500 italic font-bold decoration-blue-500 underline underline-offset-8">
                    Questions? Contact us at legal@cvber.app
                </div>
            </section>
        </div>
    );
}
