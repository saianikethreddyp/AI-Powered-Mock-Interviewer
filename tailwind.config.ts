import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                // Primary - Rose/Pink accent (from reference)
                primary: {
                    DEFAULT: "#e11d48", // Rose 600
                    50: "#fff1f2",
                    100: "#ffe4e6",
                    200: "#fecdd3",
                    300: "#fda4af",
                    400: "#fb7185",
                    500: "#f43f5e",
                    600: "#e11d48",
                    700: "#be123c",
                    800: "#9f1239",
                    900: "#881337",
                    hover: "#be123c",
                    light: "#fb7185",
                    glow: "rgba(225, 29, 72, 0.3)",
                },
                // Secondary - Purple accent
                secondary: {
                    DEFAULT: "#8b5cf6",
                    hover: "#7c3aed",
                    light: "#a78bfa",
                    glow: "rgba(139, 92, 246, 0.3)",
                },
                // Neutral - Light theme backgrounds
                surface: {
                    DEFAULT: "#ffffff",
                    50: "#fafafa",
                    100: "#f5f5f5",
                    200: "#e5e5e5",
                    300: "#d4d4d4",
                },
                // Dark mode for interview sessions
                dark: {
                    900: "#0f0f0f",
                    800: "#1a1a1a",
                    700: "#262626",
                    600: "#404040",
                    glass: "rgba(15, 15, 15, 0.8)",
                },
                // Semantic colors
                success: {
                    DEFAULT: "#10b981",
                    light: "#d1fae5",
                    dark: "#059669",
                },
                warning: {
                    DEFAULT: "#f59e0b",
                    light: "#fef3c7",
                    dark: "#d97706",
                },
                danger: {
                    DEFAULT: "#ef4444",
                    light: "#fee2e2",
                    dark: "#dc2626",
                },
            },
            fontFamily: {
                sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
                heading: ['Outfit', 'system-ui', 'sans-serif'],
            },
            boxShadow: {
                'soft': '0 2px 8px -2px rgba(0, 0, 0, 0.05), 0 4px 16px -4px rgba(0, 0, 0, 0.1)',
                'card': '0 1px 3px rgba(0, 0, 0, 0.04), 0 4px 12px rgba(0, 0, 0, 0.06)',
                'card-hover': '0 4px 12px rgba(0, 0, 0, 0.08), 0 8px 24px rgba(0, 0, 0, 0.12)',
                'sidebar': '2px 0 8px rgba(0, 0, 0, 0.04)',
                'glow-primary': '0 0 20px rgba(225, 29, 72, 0.3)',
                'glow-success': '0 0 20px rgba(16, 185, 129, 0.3)',
            },
            borderRadius: {
                '4xl': '2rem',
                '5xl': '2.5rem',
            },
            spacing: {
                'sidebar': '280px',
                'sidebar-collapsed': '80px',
            },
            backgroundImage: {
                "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
                "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
                "mesh-light": "radial-gradient(at 0% 0%, rgba(225,29,72,0.08) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(139,92,246,0.08) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(251,113,133,0.08) 0px, transparent 50%), radial-gradient(at 0% 100%, rgba(59,130,246,0.08) 0px, transparent 50%)",
                "mesh-dark": "radial-gradient(at 0% 0%, rgba(225,29,72,0.15) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(139,92,246,0.15) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(251,113,133,0.15) 0px, transparent 50%), radial-gradient(at 0% 100%, rgba(59,130,246,0.15) 0px, transparent 50%)",
                "gradient-primary": "linear-gradient(135deg, #e11d48 0%, #f43f5e 50%, #fb7185 100%)",
                "gradient-hero": "linear-gradient(180deg, #fafafa 0%, #ffffff 50%, #fafafa 100%)",
            },
            animation: {
                "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                "float": "float 6s ease-in-out infinite",
                "breathe": "breathe 4s ease-in-out infinite",
                "enter": "enter 0.5s ease-out forwards",
                "slide-in": "slideIn 0.3s ease-out forwards",
                "fade-in": "fadeIn 0.4s ease-out forwards",
                "scale-in": "scaleIn 0.3s ease-out forwards",
                "shimmer": "shimmer 2s linear infinite",
            },
            keyframes: {
                float: {
                    "0%, 100%": { transform: "translateY(0)" },
                    "50%": { transform: "translateY(-10px)" },
                },
                breathe: {
                    "0%, 100%": { opacity: "0.4", transform: "scale(1)" },
                    "50%": { opacity: "0.7", transform: "scale(1.1)" },
                },
                enter: {
                    "0%": { opacity: "0", transform: "translateY(20px)" },
                    "100%": { opacity: "1", transform: "translateY(0)" },
                },
                slideIn: {
                    "0%": { opacity: "0", transform: "translateX(-10px)" },
                    "100%": { opacity: "1", transform: "translateX(0)" },
                },
                fadeIn: {
                    "0%": { opacity: "0" },
                    "100%": { opacity: "1" },
                },
                scaleIn: {
                    "0%": { opacity: "0", transform: "scale(0.95)" },
                    "100%": { opacity: "1", transform: "scale(1)" },
                },
                shimmer: {
                    "0%": { backgroundPosition: "-200% 0" },
                    "100%": { backgroundPosition: "200% 0" },
                },
            },
            transitionTimingFunction: {
                'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
            },
        },
    },
    plugins: [],
};
export default config;
