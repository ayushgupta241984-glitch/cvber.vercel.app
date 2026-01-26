"use client";

import React from 'react';

interface LogoProps {
    className?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function Logo({ className = "", size = "md" }: LogoProps) {
    const sizeClasses = {
        sm: "w-6 h-6",
        md: "w-8 h-8",
        lg: "w-12 h-12",
        xl: "w-16 h-16"
    };

    return (
        <div className={`relative flex items-center justify-center ${sizeClasses[size]} ${className}`}>
            {/* Background Glow */}
            <div className="absolute inset-0 bg-purple-500/20 blur-[8px] rounded-lg animate-pulse-slow" />

            <svg
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="relative z-10 w-full h-full drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]"
            >
                {/* Outermost Hexagon/Shield Shape */}
                <path
                    d="M50 5L90 25V75L50 95L10 75V25L50 5Z"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinejoin="round"
                    className="text-purple-500"
                />

                {/* Inner Protective Nodes */}
                <circle cx="50" cy="5" r="3" fill="currentColor" className="text-purple-400" />
                <circle cx="90" cy="25" r="3" fill="currentColor" className="text-purple-400" />
                <circle cx="90" cy="75" r="3" fill="currentColor" className="text-purple-400" />
                <circle cx="50" cy="95" r="3" fill="currentColor" className="text-purple-400" />
                <circle cx="10" cy="75" r="3" fill="currentColor" className="text-purple-400" />
                <circle cx="10" cy="25" r="3" fill="currentColor" className="text-purple-400" />

                {/* Stylized 'C' with a circuit/digital flair */}
                <path
                    d="M70 35C65 25 55 22 50 22C34.5 22 22 34.5 22 50C22 65.5 34.5 78 50 78C55 78 65 75 70 65"
                    stroke="currentColor"
                    strokeWidth="8"
                    strokeLinecap="round"
                    className="text-white"
                />

                {/* Glowing Core Dot */}
                <circle cx="50" cy="50" r="4" fill="currentColor" className="text-purple-500 animate-pulse" />

                {/* Data Flow Line */}
                <path
                    d="M70 50L85 50"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    className="text-purple-400 opacity-70"
                />
            </svg>
        </div>
    );
}
