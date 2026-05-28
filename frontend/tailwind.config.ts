import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: 'class',
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                display: ['"Playfair Display"', 'Georgia', 'serif'],
                sans: ['"Plus Jakarta Sans"', '"Helvetica Neue"', 'Arial', 'sans-serif'],
                mono: ['"JetBrains Mono"', 'monospace'],
            },
            colors: {
                gallery: {
                    black: '#000000',
                    deep: '#0A0A0A',
                    surface: '#111111',
                    border: '#1A1A1A',
                    cream: '#F5F0EB',
                    warm: '#E8E0D5',
                    muted: '#9A9590',
                    gold: '#C9A962',
                    goldLight: '#D4B97A',
                    goldDark: '#A8893E',
                },
                luxury: {
                    black: '#000000',
                    deep: '#0A0A0A',
                    charcoal: '#1A1A1A',
                    gold: '#C9A962',
                    goldLight: '#D4B97A',
                    goldDark: '#A8893E',
                    bronze: '#8B6914',
                    cream: '#F5F0EB',
                    warm: '#E8E0D5',
                    muted: '#9A9590',
                    steel: '#2A2A2A',
                },
                background: "var(--background)",
                foreground: "var(--foreground)",
                card: "var(--card)",
                primary: "var(--primary)",
                accent: "var(--accent)",
            },
            spacing: {
                '128': '32rem',
                '144': '36rem',
            },
            animation: {
                'fade-in': 'fadeIn 1s ease-out forwards',
                'fade-up': 'fadeUp 0.8s ease-out forwards',
                'slide-in-left': 'slideInLeft 0.8s ease-out forwards',
                'slide-in-right': 'slideInRight 0.8s ease-out forwards',
                'shimmer': 'shimmer 3s ease-in-out infinite',
                'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                fadeUp: {
                    '0%': { opacity: '0', transform: 'translateY(30px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                slideInLeft: {
                    '0%': { opacity: '0', transform: 'translateX(-40px)' },
                    '100%': { opacity: '1', transform: 'translateX(0)' },
                },
                slideInRight: {
                    '0%': { opacity: '0', transform: 'translateX(40px)' },
                    '100%': { opacity: '1', transform: 'translateX(0)' },
                },
                shimmer: {
                    '0%, 100%': { opacity: '0.5' },
                    '50%': { opacity: '1' },
                },
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'gradient-luxury': 'linear-gradient(135deg, #000000 0%, #1A1A1A 50%, #0A0A0A 100%)',
            },
            letterSpacing: {
                'ultra-wide': '0.25em',
                'ultra-tight': '-0.04em',
            },
            borderWidth: {
                'hairline': '0.5px',
            },
        },
    },
    plugins: [],
};

export default config;
