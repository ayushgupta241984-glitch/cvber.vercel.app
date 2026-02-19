"use client";

import React from 'react';

interface LogoProps {
    className?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    alt?: string;
}

export default function Logo({ className = "", size = "md", alt = "CVBER Logo" }: LogoProps) {
    const sizeClasses = {
        sm: "w-6 h-6",
        md: "w-8 h-8",
        lg: "w-12 h-12",
        xl: "w-16 h-16"
    };

    return (
        <div
            className={`relative flex items-center justify-center ${sizeClasses[size]} ${className}`}
            role="img"
            aria-label={alt}
        >
            {/* Background Glow */}
            <div className="absolute inset-0 bg-purple-500/20 blur-[8px] rounded-lg animate-pulse-slow" />

            <svg
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="relative z-10 w-full h-full drop-shadow-[0_0_12px_rgba(168,85,247,0.6)]"
            >
                {/* Modern Hexagonal Shield with bevel effect */}
                <path
                    d="M50 5L92 27V73L50 95L8 73V27L50 5Z"
                    stroke="url(#shield-gradient)"
                    strokeWidth="4"
                    strokeLinejoin="round"
                    className="filter drop-shadow-[0_0_4px_rgba(168,85,247,0.4)]"
                />

                <defs>
                    <linearGradient id="shield-gradient" x1="50" y1="5" x2="50" y2="95" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#A855F7" />
                        <stop offset="1" stopColor="#6366F1" />
                    </linearGradient>
                </defs>

                {/* Cyber-Eye / Lens center representing "monitoring" */}
                <circle cx="50" cy="50" r="28" stroke="currentColor" strokeWidth="2" className="text-zinc-800" />
                <circle cx="50" cy="50" r="18" fill="currentColor" className="text-purple-500/20" />

                {/* Stylized 'V' or Iris core */}
                <path
                    d="M35 45L50 65L65 45"
                    stroke="currentColor"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-white"
                />

                {/* Glowing Pulse Dot */}
                <circle cx="50" cy="50" r="5" fill="currentColor" className="text-purple-400 animate-pulse" />

                {/* Circuit lines */}
                <path d="M50 5V20" stroke="currentColor" strokeWidth="2" className="text-purple-400/50" />
                <path d="M50 80V95" stroke="currentColor" strokeWidth="2" className="text-purple-400/50" />
                <path d="M8 27L25 35" stroke="currentColor" strokeWidth="2" className="text-purple-400/50" />
                <path d="M92 27L75 35" stroke="currentColor" strokeWidth="2" className="text-purple-400/50" />
            </svg>
        </div>
    );
}
