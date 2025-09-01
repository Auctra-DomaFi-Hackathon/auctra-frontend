import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./features/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        inter: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      colors: {
        border: "#E3E8F6",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "#FFFFFF",
        foreground: "#0B1221",
        primary: {
          DEFAULT: "#2F6DF6",
          foreground: "#FFFFFF",
          dark: "#1E4FD1",
        },
        primaryDark: "#1E4FD1",
        secondary: {
          DEFAULT: "#F8FAFF",
          foreground: "#51607A",
        },
        destructive: {
          DEFAULT: "#EF4444",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "#E8EEFF",
          foreground: "#51607A",
        },
        accent: {
          DEFAULT: "#6BA7FF",
          foreground: "#FFFFFF",
        },
        popover: {
          DEFAULT: "#FFFFFF",
          foreground: "#0B1221",
        },
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#0B1221",
        },
        success: "#1DB954",
        warning: "#F59E0B",
        error: "#EF4444",
        // Design system tokens
        backgroundLight: "#FFFFFF",
        backgroundAlt: "#F8FAFF",
        textPrimary: "#0B1221",
        textSecondary: "#51607A",
      },
      borderRadius: {
        lg: "1.25rem",
        xl: "1.5rem",
        "2xl": "2rem",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        card: "0 10px 30px rgba(47,109,246,0.08)",
      },
      keyframes: {
        "retro-grid-running": {
          "0%": { transform: "translateY(0)" },
          "100%": { transform: "translateY(var(--cell-size))" },
        },
        "spin-slow": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
      },
      animation: {
        "retro-grid-running":
          "retro-grid-running var(--animation-duration,15s) linear infinite",
        "spin-slow": "spin-slow 20s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

export default config;
