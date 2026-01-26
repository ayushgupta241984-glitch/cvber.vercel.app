import Logo from "../common/Logo";

export default function Footer() {
    return (
        <footer className="bg-[#0A0A0F] border-t border-zinc-800/50 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2">
                        <Logo size="sm" />
                        <span className="font-bold text-white">Cvber</span>
                    </div>
                    <p className="text-sm text-zinc-500">
                        © {new Date().getFullYear()} Cvber. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
