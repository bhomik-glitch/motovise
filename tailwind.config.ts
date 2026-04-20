import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: ["class"],
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/modules/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                border: "hsl(var(--border))",
                input: "hsl(var(--input))",
                ring: "hsl(var(--ring))",
                background: "hsl(var(--background))",
                foreground: "hsl(var(--foreground))",
                primary: {
                    DEFAULT: "hsl(var(--primary))",
                    foreground: "hsl(var(--primary-foreground))",
                },
                secondary: {
                    DEFAULT: "hsl(var(--secondary))",
                    foreground: "hsl(var(--secondary-foreground))",
                },
                destructive: {
                    DEFAULT: "hsl(var(--destructive))",
                    foreground: "hsl(var(--destructive-foreground))",
                },
                muted: {
                    DEFAULT: "hsl(var(--muted))",
                    foreground: "hsl(var(--muted-foreground))",
                },
                accent: {
                    DEFAULT: "hsl(var(--accent))",
                    foreground: "hsl(var(--accent-foreground))",
                },
                popover: {
                    DEFAULT: "hsl(var(--popover))",
                    foreground: "hsl(var(--popover-foreground))",
                },
                card: {
                    DEFAULT: "hsl(var(--card))",
                    foreground: "hsl(var(--card-foreground))",
                },
                // Motovise Pastel Automotive Palette
                motovise: {
                    bg: "#F8FAFC",
                    section: "#EEF2FF",
                    primary: "#7C9CF5",
                    secondary: "#A5B4FC",
                    highlight: "#FDBA74",
                    text: "#0F172A",
                    muted: "#64748B",
                    border: "#E2E8F0",
                },
            },
            fontFamily: {
                "display": ["var(--font-montserrat)", "Montserrat", "sans-serif"],
                "sans": ["var(--font-montserrat)", "Montserrat", "sans-serif"],
                "mono": ["SFMono-Regular", "Consolas", "Liberation Mono", "monospace"],
            },
            borderRadius: {
                lg: "var(--radius)",
                md: "calc(var(--radius) - 2px)",
                sm: "calc(var(--radius) - 4px)",
                xl: "1rem",
                "2xl": "1.25rem",
            },
            boxShadow: {
                "glow-primary": "0 0 24px rgba(124, 156, 245, 0.45)",
                "glow-sm": "0 0 12px rgba(124, 156, 245, 0.3)",
                "card-hover": "0 20px 60px rgba(124, 156, 245, 0.2), 0 4px 16px rgba(0,0,0,0.08)",
            },
            animation: {
                "fade-up": "fadeUp 0.5s ease forwards",
                "slide-in-right": "slideInRight 0.5s ease forwards",
            },
            keyframes: {
                fadeUp: {
                    "0%": { opacity: "0", transform: "translateY(30px)" },
                    "100%": { opacity: "1", transform: "translateY(0)" },
                },
                slideInRight: {
                    "0%": { opacity: "0", transform: "translateX(60px)" },
                    "100%": { opacity: "1", transform: "translateX(0)" },
                },
            },
        },
    },
    plugins: [require("tailwindcss-animate")],
};

export default config;
