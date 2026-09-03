import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      boxShadow: {
        panel: "0 1px 2px rgba(15, 23, 42, 0.04), 0 10px 28px -14px rgba(15, 23, 42, 0.16)",
        glow: "0 8px 24px -8px rgba(79, 70, 229, 0.45)",
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
