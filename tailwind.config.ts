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
                primary: {
                    DEFAULT: "#6366f1", // Indigo 500
                    hover: "#4f46e5",   // Indigo 600
                    light: "#818cf8",   // Indigo 400
                    glow: "rgba(99, 102, 241, 0.5)",
                },
                secondary: {
                    DEFAULT: "#ec4899", // Pink 500
                    hover: "#db2777",   // Pink 600
                    glow: "rgba(236, 72, 153, 0.5)",
                },
                dark: {
                    900: "#030014", // Deep Space Black
                    800: "#0f172a", // Slate 900
                    700: "#1e293b", // Slate 800
                    glass: "rgba(15, 23, 42, 0.6)",
                },
            },
            backgroundImage: {
                "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
                "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
                "mesh": "radial-gradient(at 0% 0%, rgba(99,102,241,0.15) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(236,72,153,0.15) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(139,92,246,0.15) 0px, transparent 50%), radial-gradient(at 0% 100%, rgba(59,130,246,0.15) 0px, transparent 50%)",
            },
            animation: {
                "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                "float": "float 6s ease-in-out infinite",
                "breathe": "breathe 4s ease-in-out infinite",
                "enter": "enter 0.5s ease-out forwards",
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
            },
        },
    },
    plugins: [],
};
export default config;
