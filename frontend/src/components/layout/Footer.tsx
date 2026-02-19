import Link from "next/link";
import Logo from "../common/Logo";

export default function Footer() {
    return (
        <footer className="bg-[#0A0A0F] border-t border-zinc-800/50 py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid md:grid-cols-4 gap-12 mb-12">
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center gap-2 mb-6">
                            <Logo size="md" alt="CVBER - AI Art Protection Platform" />
                            <span className="text-xl font-extrabold text-white tracking-tight">Cvber</span>
                        </div>
                        <p className="text-zinc-500 text-sm leading-relaxed max-w-sm">
                            Professional-grade content security for the AI era. We empower digital creators with
                            blockchain-backed provenance and automated DMCA enforcement tools.
                        </p>
                    </div>

                    <div>
                        <h4 className="text-white font-bold mb-6">Product</h4>
                        <ul className="space-y-4 text-sm text-zinc-500">
                            <li><Link href="/features" className="hover:text-purple-400 transition-colors">Art Protection Features</Link></li>
                            <li><Link href="/how-it-works" className="hover:text-purple-400 transition-colors">How to Protect Your Art</Link></li>
                            <li><Link href="/verify" className="hover:text-purple-400 transition-colors">Verify Certificate</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-bold mb-6">Resources</h4>
                        <ul className="space-y-4 text-sm text-zinc-500">
                            <li><Link href="/art-hub" className="hover:text-purple-400 transition-colors">Artist Resource Hub</Link></li>
                            <li><Link href="/art-hub#ai" className="hover:text-purple-400 transition-colors">AI Scraping Defense</Link></li>
                            <li><Link href="/art-hub#legal" className="hover:text-purple-400 transition-colors">DMCA Takedown Guide</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-zinc-900 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-xs text-zinc-600">
                        © {new Date().getFullYear()} Cvber. All rights reserved. Built for creators.
                    </p>
                    <div className="flex gap-8 text-xs text-zinc-600">
                        <Link href="/privacy" className="hover:text-zinc-400">Privacy Policy</Link>
                        <Link href="/terms" className="hover:text-zinc-400">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
