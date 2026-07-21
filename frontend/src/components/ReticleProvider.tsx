"use client";

import { useEffect } from "react";

export default function ReticleProvider({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        if (process.env.NODE_ENV === "development") {
            import("@reticlehq/core").then(({ reticle }) => {
                reticle.connect({ session: "cvber" });
            });
        }
    }, []);

    return <>{children}</>;
}
