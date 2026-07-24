'use client';

import { ReactNode } from 'react';

interface ToolCardProps {
    children: ReactNode;
    className?: string;
}

export function ToolCard({ children, className = '' }: ToolCardProps) {
    return (
        <div
            className={`bg-[#0a0a0a] border border-white/[0.08] p-8 hover:border-white/[0.15] transition-colors ${className}`}
            style={{ borderRadius: 8 }}
        >
            {children}
        </div>
    );
}
