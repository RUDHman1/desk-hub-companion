import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
          800: "#166534",
          900: "#14532d",
        },
        calm: {
          bg: "#0B0F17",
          surface: "#111827",
          card: "#162032",
          border: "#1E293B",
          text: "#E2E8F0",
          muted: "#94A3B8",
        },
        oled: {
          bg: "#030712",
          pixel: "#38bdf8",
          pixelAmber: "#fbbf24",
          pixelGreen: "#4ade80",
        }
      },
      animation: {
        "pulse-glow": "pulseGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "ticker": "ticker 15s linear infinite",
        "red-alert": "redAlert 1s ease-in-out infinite alternate",
      },
      keyframes: {
        pulseGlow: {
          "0%, 100%": { opacity: "1", filter: "drop-shadow(0 0 12px rgba(34, 197, 94, 0.6))" },
          "50%": { opacity: "0.7", filter: "drop-shadow(0 0 4px rgba(34, 197, 94, 0.2))" },
        },
        redAlert: {
          "0%": { filter: "drop-shadow(0 0 4px rgba(239, 68, 68, 0.3))", backgroundColor: "rgba(239, 68, 68, 0.1)" },
          "100%": { filter: "drop-shadow(0 0 20px rgba(239, 68, 68, 0.8))", backgroundColor: "rgba(239, 68, 68, 0.25)" },
        },
        ticker: {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(-100%)" },
        }
      }
    },
  },
  plugins: [],
};
export default config;
