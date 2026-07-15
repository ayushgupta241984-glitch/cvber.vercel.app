'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { EyeOff, ShieldAlert } from 'lucide-react';

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function wipeClipboard() {
    try {
        if (navigator.clipboard?.writeText) {
            navigator.clipboard.writeText('').catch(() => { });
        }
        const el = document.createElement('textarea');
        el.value = ' ';
        el.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0;';
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
    } catch { /* intentionally empty — fire-and-forget */ }
}

function injectDefensiveCSS() {
    if (document.getElementById('cvber-drm-style')) return;
    const style = document.createElement('style');
    style.id = 'cvber-drm-style';
    style.textContent = `
        #cvber-protected {
            -webkit-user-select: none !important;
            user-select: none !important;
        }

        @media print {
            #cvber-protected * { visibility: hidden !important; }
            #cvber-print-block {
                visibility: visible !important;
                position: fixed;
                inset: 0;
                background: black;
                z-index: 999999;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 2rem;
                font-weight: 900;
                font-family: sans-serif;
            }
        }

        #cvber-protected.security-active #cvber-main {
            filter: blur(40px) brightness(0.1);
            transition: filter 0.1s ease;
        }
    `;
    document.head.appendChild(style);
}

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────

export function ScreenshotGuard({ children }: { children: React.ReactNode }) {
    const [triggered, setTriggered] = useState(false);
    const [incident, setIncident] = useState('');

    // Confidence-based detection states
    const suspicionScore = useRef(0);
    const lastSignalTime = useRef(0);

    // Timing refs
    const lastBlurTime = useRef(0);
    const lastHiddenTime = useRef(0);
    const lastWidth = useRef(typeof window !== 'undefined' ? window.innerWidth : 0);
    const lastHeight = useRef(typeof window !== 'undefined' ? window.innerHeight : 0);

    const resetTimer = useRef<NodeJS.Timeout | null>(null);
    const scoreDecayTimer = useRef<NodeJS.Timeout | null>(null);

    const triggerSecurity = useCallback((reason: string, confidence: 'HIGH' | 'MEDIUM' | 'LOW' = 'MEDIUM') => {
        const now = Date.now();

        // Reset suspicion if too much time passed between low/medium signals
        if (now - lastSignalTime.current > 2000) {
            suspicionScore.current = 0;
        }
        lastSignalTime.current = now;

        if (confidence === 'HIGH') {
            suspicionScore.current = 100; // Immediate trigger
        } else if (confidence === 'MEDIUM') {
            suspicionScore.current += 50;
        } else {
            suspicionScore.current += 25;
        }

        if (suspicionScore.current >= 100 && !triggered) {
            wipeClipboard();
            setIncident(reason);
            setTriggered(true);

            if (resetTimer.current) clearTimeout(resetTimer.current);
            resetTimer.current = setTimeout(() => {
                setTriggered(false);
                suspicionScore.current = 0;
            }, 5000);
        }
    }, [triggered]);

    useEffect(() => {
        injectDefensiveCSS();

        // ── SIGNAL 1: Direct Keys (High Confidence)
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'PrintScreen' || e.code === 'PrintScreen') {
                triggerSecurity('PRINT_SCREEN_KEY', 'HIGH');
                return;
            }

            if (e.metaKey && e.shiftKey && ['3', '4', '5'].includes(e.key)) {
                triggerSecurity('MAC_SCREENSHOT', 'HIGH');
                return;
            }

            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
                e.preventDefault();
                triggerSecurity('PRINT_ATTEMPT', 'HIGH');
            }
        };

        // ── SIGNAL 2: Visibility Change (Medium Confidence)
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                lastHiddenTime.current = Date.now();
            } else {
                const duration = Date.now() - lastHiddenTime.current;
                // Rapid hide/show is very characteristic of screenshot tools or rapid app switching
                if (lastHiddenTime.current > 0 && duration < 350) {
                    triggerSecurity(`RAPID_VISIBILITY_${duration}ms`, 'MEDIUM');
                }
                lastHiddenTime.current = 0;
            }
        };

        // ── SIGNAL 3: Blur/Focus timing (Medium/Low Confidence)
        const handleBlur = () => {
            lastBlurTime.current = Date.now();
        };

        const handleFocus = () => {
            const duration = Date.now() - lastBlurTime.current;
            if (lastBlurTime.current > 0 && duration < 250) {
                // Focus returning too fast is suspicious
                triggerSecurity(`RAPID_FOCUS_${duration}ms`, 'MEDIUM');
            }
            lastBlurTime.current = 0;
        };

        // ── SIGNAL 4: Resize stabilization (Mobile Optimized)
        const handleResize = () => {
            const currWidth = window.innerWidth;
            const currHeight = window.innerHeight;

            const wDiff = Math.abs(currWidth - lastWidth.current);
            const hDiff = Math.abs(currHeight - lastHeight.current);

            // On mobile, height changes as address bar hides. Width rarely changes unless orientation does.
            const isProbablyMobileScroll = wDiff === 0 && hDiff < 100;

            if (!isProbablyMobileScroll && (wDiff > 5 || hDiff > 5)) {
                // Large or horizontal resize might be a screenshot tool (Snipping tool)
                // or window snapping. Give it LOW confidence.
                if (wDiff < 50 && hDiff < 50) {
                    triggerSecurity('MICRO_RESIZE', 'LOW');
                }
            }

            lastWidth.current = currWidth;
            lastHeight.current = currHeight;
        };

        // ── SIGNAL 5: Context/Copy defense
        const handleCopy = (e: ClipboardEvent) => {
            const selection = window.getSelection()?.toString();
            if (!selection || selection.length < 2) {
                // Copy without selection is suspicious (screenshot tools)
                triggerSecurity('GHOST_COPY', 'MEDIUM');
            }
        };

        document.addEventListener('keydown', handleKeyDown, true);
        document.addEventListener('visibilitychange', handleVisibilityChange);
        document.addEventListener('copy', handleCopy);
        window.addEventListener('blur', handleBlur);
        window.addEventListener('focus', handleFocus);
        window.addEventListener('resize', handleResize);

        return () => {
            document.removeEventListener('keydown', handleKeyDown, true);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            document.removeEventListener('copy', handleCopy);
            window.removeEventListener('blur', handleBlur);
            window.removeEventListener('focus', handleFocus);
            window.removeEventListener('resize', handleResize);
            if (resetTimer.current) clearTimeout(resetTimer.current);
            if (scoreDecayTimer.current) clearTimeout(scoreDecayTimer.current);
        };
    }, [triggerSecurity]);

    return (
        <div id="cvber-protected" className={triggered ? 'security-active' : ''}>
            <div id="cvber-print-block" style={{ display: 'none' }} aria-hidden="true">
                CVBER · PROTECTED CONTENT
            </div>

            {triggered && (
                <div className="fixed inset-0 z-[999999] flex flex-col items-center justify-center p-6 text-white select-none pointer-events-auto">
                    {/* Dark radial backdrop */}
                    <div className="absolute inset-0 bg-[#050505]/95 backdrop-blur-3xl" />
                    <div className="absolute inset-0 bg-radial-gradient from-red-500/5 to-transparent opacity-50" />

                    <div className="relative z-10 flex flex-col items-center max-w-lg w-full text-center">
                        <div className="mb-8 relative">
                            <div className="absolute inset-0 bg-red-600/20 blur-3xl animate-pulse rounded-full" />
                            <div className="relative p-6 bg-red-950/30 border border-red-500/30 rounded-3xl backdrop-blur-md">
                                <EyeOff className="h-16 w-16 text-red-500" strokeWidth={1.5} />
                            </div>
                        </div>

                        <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-4 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40">
                            Capture Blocked
                        </h1>

                        <p className="text-zinc-500 font-medium text-sm md:text-base leading-relaxed mb-10 tracking-wide uppercase">
                            Visual provenance protection active.<br />Screen capture detected and neutralized.
                        </p>

                        <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/[0.03] border border-white/10 font-mono text-[10px] md:text-xs text-zinc-500">
                            <ShieldAlert className="h-4 w-4 text-red-500" />
                            <span className="tracking-widest uppercase">
                                CVBER_DRM_SECURED // ID: {incident.toUpperCase()}
                            </span>
                        </div>

                        <div className="mt-12 w-32 h-1 bg-zinc-900 rounded-full overflow-hidden">
                            <div className="h-full bg-red-500 animate-[loading_5s_linear_forwards]" />
                        </div>
                    </div>
                </div>
            )}

            <div id="cvber-main" className="transition-all duration-500 overflow-x-hidden">
                {children}
            </div>

            <style jsx>{`
                @keyframes loading {
                    from { width: 100%; }
                    to { width: 0%; }
                }
                .bg-radial-gradient {
                    background: radial-gradient(circle at center, var(--tw-gradient-from), var(--tw-gradient-to));
                }
            `}</style>
        </div>
    );
}
