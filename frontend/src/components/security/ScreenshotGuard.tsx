'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, EyeOff, ShieldAlert } from 'lucide-react';

export function ScreenshotGuard({ children }: { children: React.ReactNode }) {
    const [isSecurityTriggered, setIsSecurityTriggered] = useState(false);
    const [threatType, setThreatType] = useState<string>("");

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // PrintScreen (44) or Mac Shortcuts (Cmd+Shift+3/4/5)
            // Note: Modern browsers don't always expose PrintScreen keydown due to OS interception
            if (e.key === 'PrintScreen' || (e.metaKey && e.shiftKey && (['3', '4', '5'].includes(e.key)))) {
                triggerSecurity("SCREENSHOT_ATTEMPT_KEY");
                // Attempt to clear clipboard
                try {
                    if (navigator.clipboard) navigator.clipboard.writeText("");
                } catch (err) { }
            }
        };

        // When window loses focus (often happens when Snipping Tool overlays appear)
        const handleBlur = () => {
            // We won't block completely on blur as it affects multitasking, 
            // but we will blur the content gently to prevent background ripping
            document.body.classList.add('security-blur');
        };

        const handleFocus = () => {
            document.body.classList.remove('security-blur');
        }

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('blur', handleBlur);
        window.addEventListener('focus', handleFocus);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('blur', handleBlur);
            window.removeEventListener('focus', handleFocus);
            document.body.classList.remove('security-blur');
        };
    }, []);

    const triggerSecurity = (reason: string) => {
        setIsSecurityTriggered(true);
        setThreatType(reason);
        // Lock for 3 seconds to deter
        setTimeout(() => setIsSecurityTriggered(false), 3000);
    };

    return (
        <div className="relative min-h-screen">
            {/* Global Style for Blur */}
            <style jsx global>{`
                .security-blur #main-content {
                    filter: blur(8px) grayscale(100%);
                    opacity: 0.5;
                    transition: all 0.2s ease;
                }
            `}</style>

            {isSecurityTriggered && (
                <div className="fixed inset-0 z-[9999] bg-black/95 flex flex-col items-center justify-center text-white animate-in fade-in duration-200 cursor-not-allowed select-none">
                    <div className="p-6 bg-red-600/10 rounded-full mb-8 animate-pulse border border-red-500/50 shadow-[0_0_50px_rgba(220,38,38,0.5)]">
                        <EyeOff className="h-20 w-20 text-red-500" />
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-red-400 to-red-700 mb-4 drop-shadow-lg">
                        Security Alert
                    </h1>
                    <p className="text-lg md:text-xl font-bold tracking-widest text-center max-w-xl leading-relaxed text-gray-300">
                        SCREEN CAPTURE DETECTED
                    </p>
                    <div className="mt-12 flex items-center gap-3 text-xs font-mono text-red-400/80 border border-red-900/50 px-4 py-2 rounded-lg bg-black/50">
                        <ShieldAlert className="h-4 w-4" />
                        CVBER DRM • IP LOGGED • INCIDENT: {threatType}
                    </div>
                </div>
            )}

            <div id="main-content" className={`transition-all duration-300 ${isSecurityTriggered ? 'blur-3xl opacity-0' : ''}`}>
                {children}
            </div>
        </div>
    );
}
