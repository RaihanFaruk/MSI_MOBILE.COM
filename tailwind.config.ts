import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    screens: {
      xs: "390px",
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1440px",
    },
    extend: {
      colors: {
        brand: {
          primary: "#1D4ED8",      // Primary Blue
          "primary-dark": "#1E3A8A", // Hover state
          accent: "#EF4444",       // MSI Red / Flash Sale
          accentHover: "#DC2626",
          light: "#EFF6FF",
        },
        navy: {
          dark: "#0F172A",          // Utility bar, Hero, Footer
          darker: "#020617",        // Newsletter
          card: "#1E293B",
        },
        bg: {
          light: "#F8FAFC",         // Section alternate background
          white: "#FFFFFF",
          card: "#FFFFFF",
        },
        text: {
          primary: "#0F172A",
          secondary: "#64748B",
          muted: "#94A3B8",
        },
        star: {
          yellow: "#FACC15",
        },
        badge: {
          green: "#16A34A",
          red: "#EF4444",
          blue: "#2563EB",
          amber: "#D97706",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        poppins: ["var(--font-poppins)", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)",
        cardHover: "0 10px 25px -5px rgba(29, 78, 216, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.05)",
        banner: "0 20px 25px -5px rgba(15, 23, 42, 0.25)",
      },
      animation: {
        pulseSlow: "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        float: "float 4s ease-in-out infinite",
        shimmer: "shimmer 2s infinite linear",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
