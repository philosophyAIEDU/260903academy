import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      boxShadow: {
        panel: "0 1px 0 rgba(255, 255, 255, 0.03) inset, 0 12px 32px -16px rgba(0, 0, 0, 0.65)",
        glow: "0 8px 24px -8px rgba(99, 102, 241, 0.5)",
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
