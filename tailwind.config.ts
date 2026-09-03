import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          50: "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
          700: "#b45309",
          800: "#92400e",
          900: "#78350f",
        },
        navy: {
          850: "#111b2e",
          900: "#0b1323",
          950: "#060a14",
        },
      },
      boxShadow: {
        panel: "0 1px 3px 0 rgba(15, 23, 42, 0.04), 0 10px 30px -10px rgba(15, 23, 42, 0.06)",
        luxury: "0 20px 40px -15px rgba(15, 23, 42, 0.07), 0 0 1px 1px rgba(15, 23, 42, 0.05)",
        "gold-glow": "0 8px 25px -6px rgba(245, 158, 11, 0.35)",
        "sapphire-glow": "0 8px 25px -6px rgba(59, 130, 246, 0.35)",
        "emerald-glow": "0 8px 25px -6px rgba(16, 185, 129, 0.35)",
        card: "0 4px 20px -2px rgba(15, 23, 42, 0.05)",
        floating: "0 25px 50px -12px rgba(15, 23, 42, 0.12)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        blob: {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "33%": { transform: "translate(18px, -22px) scale(1.08)" },
          "66%": { transform: "translate(-14px, 14px) scale(0.94)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.45s ease-out both",
        blob: "blob 14s infinite ease-in-out",
      },
    },
  },
  plugins: [],
};

export default config;
