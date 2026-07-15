'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';

export function DemoModeBanner() {
    const [isDemo, setIsDemo] = useState<boolean | null>(null);

    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}/api/status`, {
            signal: AbortSignal.timeout(5000),
        })
            .then(r => r.json())
            .then(data => setIsDemo(data.mock_mode === true))
            .catch(() => setIsDemo(false));
    }, []);

    if (isDemo !== true) return null;

    return (
        <div className="bg-amber-950/40 border-b border-amber-500/20 px-4 py-2.5 flex items-center justify-center gap-2.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <p className="text-[11px] text-amber-200/80 font-medium">
                Demo Mode — Data is simulated. Connect Supabase for production.
            </p>
        </div>
    );
}
