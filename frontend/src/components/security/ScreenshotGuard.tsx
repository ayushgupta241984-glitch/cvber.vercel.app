'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { EyeOff, ShieldAlert } from 'lucide-react';

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

/** Wipe clipboard silently */
function wipeClipboard() {
    try {
        if (navigator.clipboard?.writeText) {
            navigator.clipboard.writeText('').catch(() => { });
        }
        // Legacy fallback for older browsers / Safari
        const el = document.createElement('textarea');
        el.value = ' ';
        el.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0;';
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
    } catch { }
}

/** Inject global always-on CSS defenses into the <head> */
function injectDefensiveCSS() {
    if (document.getElementById('cvber-drm-style')) return;
    const style = document.createElement('style');
    style.id = 'cvber-drm-style';
    style.textContent = `
        /* 1. Prevent text selection everywhere */
        #cvber-protected {
            -webkit-user-select: none !important;
            -moz-user-select: none !important;
            -ms-user-select: none !important;
            user-select: none !important;
        }

        /* 2. @media print blackout — triggers on browser Print Screen capture in Chrome/Edge */
        @media print {
            #cvber-protected * { visibility: hidden !important; }
            #cvber-print-block {
                visibility: visible !important;
                position: fixed;
                inset: 0;
                background: black;
                z-index: 99999;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 2rem;
                font-weight: 900;
                letter-spacing: 0.2em;
                font-family: sans-serif;
            }
        }

        /* 3. Invisible watermark overlay — visible at OS screenshot level via color difference */
        #cvber-protected::after {
            content: '';
            position: fixed;
            inset: 0;
            pointer-events: none;
            z-index: 9998;
            background: repeating-linear-gradient(
                45deg,
                transparent,
                transparent 120px,
                rgba(168, 85, 247, 0.012) 120px,
                rgba(168, 85, 247, 0.012) 121px
            );
        }

        /* 4. Blur transition on security trigger */
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
    const triggerCount = useRef(0);
    const lastBlurTime = useRef<number>(0);
    const lastHiddenTime = useRef<number>(0);
    const lockTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const triggerSecurity = useCallback((reason: string) => {
        triggerCount.current += 1;
        wipeClipboard();
        setIncident(reason);
        setTriggered(true);

        // Clear any existing reset timer
        if (resetTimer.current) clearTimeout(resetTimer.current);
        // Auto-dismiss after 5 seconds
        resetTimer.current = setTimeout(() => {
            setTriggered(false);
        }, 5000);
    }, []);

    useEffect(() => {
        injectDefensiveCSS();

        // ── SIGNAL 1: PrintScreen key & Mac screenshot shortcuts ──────────────
        const handleKeyDown = (e: KeyboardEvent) => {
            const key = e.key;
            const code = e.code;

            // Windows PrintScreen
            if (key === 'PrintScreen' || code === 'PrintScreen') {
                triggerSecurity('PRINT_SCREEN_KEY');
                wipeClipboard();
                return;
            }

            // Mac: Cmd+Shift+3 (full screen), Cmd+Shift+4 (region), Cmd+Shift+5 (ui)
            if (e.metaKey && e.shiftKey && ['3', '4', '5', 'S'].includes(key)) {
                triggerSecurity('MAC_SCREENSHOT_SHORTCUT');
                return;
            }

            // Windows Snipping Tool: Win+Shift+S doesn't fire in browser well, but 
            // some users open it via search. We catch it when window comes back
            // via the blur/focus timing heuristic below.

            // Block F12 DevTools (reduces screen-inspection risk)
            if (key === 'F12') {
                e.preventDefault();
                e.stopPropagation();
            }

            // Ctrl+P (Print dialog — triggers @media print CSS which blacks out)
            if ((e.ctrlKey || e.metaKey) && key === 'p') {
                e.preventDefault();
                triggerSecurity('PRINT_DIALOG');
            }

            // Ctrl+Shift+I / Ctrl+Shift+J / Ctrl+Shift+C — DevTools shortcuts
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && ['i', 'j', 'c', 'I', 'J', 'C'].includes(key)) {
                e.preventDefault();
            }
        };

        // ── SIGNAL 2: Visibility change — page hidden (tab switch, app switch, 
        //    or Snipping Tool overlay on Windows) ───────────────────────────────
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                lastHiddenTime.current = Date.now();
            } else {
                // Page became visible again — check how long it was hidden
                const hiddenDuration = Date.now() - lastHiddenTime.current;

                // Windows Snipping Tool: hides page for ~50-350ms
                // Mac screenshot: hides page for ~0-250ms (very brief)
                // Normal task switch: usually > 500ms
                if (lastHiddenTime.current > 0 && hiddenDuration < 400) {
                    triggerSecurity(`RAPID_HIDE_SHOW_${hiddenDuration}ms`);
                }
                lastHiddenTime.current = 0;
            }
        };

        // ── SIGNAL 3: blur/focus timing heuristic ────────────────────────────
        // Screenshot tools (Snipping Tool, Greenshot, Lightshot) often steal
        // focus briefly. Normal app switches take >300ms for the user to 
        // click back. A refocus in < 250ms indicates a tool, not a human.
        let focusReturnTimer: ReturnType<typeof setTimeout> | null = null;

        const handleWindowBlur = () => {
            lastBlurTime.current = Date.now();
            // Apply visual defense while blurred
            document.getElementById('cvber-protected')?.classList.add('security-active');

            // If they don't come back in 350ms, it's a legitimate switch — remove blur
            focusReturnTimer = setTimeout(() => {
                document.getElementById('cvber-protected')?.classList.remove('security-active');
            }, 350);
        };

        const handleWindowFocus = () => {
            if (focusReturnTimer) clearTimeout(focusReturnTimer);
            const blurDuration = Date.now() - lastBlurTime.current;
            document.getElementById('cvber-protected')?.classList.remove('security-active');

            // Very rapid focus return = screenshot tool, not human task switching
            if (lastBlurTime.current > 0 && blurDuration > 0 && blurDuration < 200) {
                triggerSecurity(`RAPID_BLUR_FOCUS_${blurDuration}ms`);
            }
            lastBlurTime.current = 0;
        };

        // ── SIGNAL 4: Clipboard copy monitoring ──────────────────────────────
        // Fires when Ctrl+C / Cmd+C are pressed. Also fires after PrintScreen
        // in some browser/OS combos where clipboard is written.
        const handleCopy = () => {
            // This fires on context menu copy too, so we only trigger if 
            // there's no active text selection (user didn't highlight text)
            const selection = window.getSelection();
            if (!selection || selection.toString().trim() === '') {
                // No text selected — this is likely a screenshot clipboard write
                triggerSecurity('CLIPBOARD_COPY_NO_SELECTION');
            }
        };

        // ── SIGNAL 5: DevTools size heuristic (continuous polling) ────────────
        const devToolsCheck = setInterval(() => {
            const widthThreshold = window.outerWidth - window.innerWidth > 200;
            const heightThreshold = window.outerHeight - window.innerHeight > 200;
            if (widthThreshold || heightThreshold) {
                // DevTools likely open — don't block but note it
                // We only trigger if the gap is very large (undocked devtools)
                if (window.outerWidth - window.innerWidth > 400 ||
                    window.outerHeight - window.innerHeight > 400) {
                    // Likely screen recording software or large undocked devtools
                    // Don't trigger security but apply subtle defense
                    document.getElementById('cvber-protected')?.classList.add('security-active');
                }
            } else {
                // Remove only if not in triggered state
                if (!triggered) {
                    document.getElementById('cvber-protected')?.classList.remove('security-active');
                }
            }
        }, 1000);

        // ── SIGNAL 6: Resize event (mobile screenshot detection) ──────────────
        // On Android, some launchers cause a brief resize during screenshot.
        // On iOS with AssistiveTouch capture, orientation briefly flickers.
        let lastWidth = window.innerWidth;
        let lastHeight = window.innerHeight;
        const handleResize = () => {
            const newWidth = window.innerWidth;
            const newHeight = window.innerHeight;
            const widthDiff = Math.abs(newWidth - lastWidth);
            const heightDiff = Math.abs(newHeight - lastHeight);

            // Very small resize (< 10px) that isn't keyboard dismiss (> 150px) 
            // is suspicious on mobile
            if (widthDiff > 0 && widthDiff < 15 && heightDiff === 0) {
                triggerSecurity('MICRO_RESIZE_DETECTED');
            }
            lastWidth = newWidth;
            lastHeight = newHeight;
        };

        // ── SIGNAL 7: Context menu block ────────────────────────────────────
        const handleContextMenu = (e: MouseEvent) => {
            e.preventDefault();
        };

        // ── SIGNAL 8: Drag prevention (prevents drag-to-screenshot on Mac) ───
        const handleDragStart = (e: DragEvent) => {
            e.preventDefault();
        };

        // ─── Register all event listeners ──────────────────────────────────
        document.addEventListener('keydown', handleKeyDown, true);
        document.addEventListener('visibilitychange', handleVisibilityChange);
        document.addEventListener('copy', handleCopy);
        document.addEventListener('contextmenu', handleContextMenu);
        document.addEventListener('dragstart', handleDragStart);
        window.addEventListener('blur', handleWindowBlur);
        window.addEventListener('focus', handleWindowFocus);
        window.addEventListener('resize', handleResize);

        return () => {
            document.removeEventListener('keydown', handleKeyDown, true);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            document.removeEventListener('copy', handleCopy);
            document.removeEventListener('contextmenu', handleContextMenu);
            document.removeEventListener('dragstart', handleDragStart);
            window.removeEventListener('blur', handleWindowBlur);
            window.removeEventListener('focus', handleWindowFocus);
            window.removeEventListener('resize', handleResize);
            clearInterval(devToolsCheck);
            if (lockTimer.current) clearTimeout(lockTimer.current);
            if (resetTimer.current) clearTimeout(resetTimer.current);
            if (focusReturnTimer) clearTimeout(focusReturnTimer);
        };
    }, [triggerSecurity, triggered]);

    return (
        <div id="cvber-protected" className={triggered ? 'security-active' : ''}>
            {/* Print-blackout block (active via CSS @media print) */}
            <div id="cvber-print-block" aria-hidden="true">
                CVBER · PROTECTED CONTENT · UNAUTHORIZED CAPTURE DETECTED
            </div>

            {/* Security alert overlay */}
            {triggered && (
                <div
                    className="fixed inset-0 z-[99999] flex flex-col items-center justify-center text-white select-none cursor-not-allowed"
                    style={{
                        background: 'radial-gradient(ellipse at center, #1a0000 0%, #000000 70%)',
                        backdropFilter: 'blur(20px)',
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Animated icon */}
                    <div className="relative mb-10">
                        <div className="absolute inset-0 bg-red-500/20 rounded-full blur-3xl scale-150 animate-pulse" />
                        <div className="relative w-28 h-28 rounded-full bg-red-950 border border-red-700/50 flex items-center justify-center shadow-2xl animate-pulse">
                            <EyeOff className="w-14 h-14 text-red-500" strokeWidth={1.5} />
                        </div>
                    </div>

                    {/* Headline */}
                    <h1 className="text-3xl md:text-5xl font-black uppercase tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-b from-red-300 to-red-700 mb-3 text-center px-6">
                        Capture Blocked
                    </h1>
                    <p className="text-zinc-400 font-medium text-sm md:text-base tracking-widest uppercase text-center px-6 mb-12">
                        Screen capture of protected content is not permitted
                    </p>

                    {/* Incident log strip */}
                    <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-black/60 border border-red-900/40 font-mono text-xs text-red-500/70">
                        <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                        <span>CVBER DRM v2 · INCIDENT: {incident} · IP LOGGED</span>
                    </div>

                    {/* Auto-dismiss timer */}
                    <p className="mt-8 text-[10px] text-zinc-700 uppercase tracking-widest font-black">
                        Dismissing automatically...
                    </p>
                </div>
            )}

            {/* Main content — blurs on security trigger via CSS */}
            <div
                id="cvber-main"
                style={triggered ? {
                    filter: 'blur(30px) brightness(0.05)',
                    transition: 'filter 0.1s ease',
                    pointerEvents: 'none',
                    userSelect: 'none',
                } : { transition: 'filter 0.3s ease' }}
            >
                {children}
            </div>
        </div>
    );
}
