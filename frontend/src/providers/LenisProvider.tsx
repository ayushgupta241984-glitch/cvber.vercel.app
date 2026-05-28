"use client";

import { ReactLenis } from "lenis/react";

export default function LenisProvider({ children }: { children: React.ReactNode }) {
    return (
        <ReactLenis root options={{ duration: 0.3, easing: (t: number) => t * (2 - t), wheelMultiplier: 0.8, touchMultiplier: 1.2 }}>
            {children}
        </ReactLenis>
    );
}
