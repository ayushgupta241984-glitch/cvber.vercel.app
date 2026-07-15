"use client";

import { useEffect, useState } from "react";

export default function DemoModeBanner() {
    const [isMock, setIsMock] = useState(false);

    useEffect(() => {
        fetch("/api/status")
            .then((r) => r.json())
            .then((data) => {
                if (data.mock_mode) setIsMock(true);
            })
            .catch(() => {});
    }, []);

    if (!isMock) return null;

    return (
        <div className="fixed top-0 left-0 right-0 z-[200] bg-amber-600 text-black text-center py-1.5 text-xs font-bold uppercase tracking-widest">
            Demo Mode — Data is simulated. Connect Supabase for production.
        </div>
    );
}
