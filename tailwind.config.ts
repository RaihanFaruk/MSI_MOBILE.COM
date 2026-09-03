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
        // Luxury Gold & Obsidian Palette
        gold: {
          50: "#FCF9EE",
          100: "#F7F0D4",
          200: "#EFE0AA",
          300: "#E5CD7C",
          400: "#DCBA4F",
          500: "#D4AF37", // Primary luxury metallic gold
          600: "#BF9528",
          700: "#99731B",
          800: "#755615",
          900: "#523B0F",
          DEFAULT: "#D4AF37",
          metallic: "#C9A227",
          light: "#F5E6BA",
          dark: "#A67C1E",
          subtle: "rgba(212, 175, 55, 0.12)",
        },
        obsidian: {
          950: "#070707",
          900: "#0A0A0A", // True luxury deep black
          800: "#121212", // Surface elevation 1
          700: "#1A1A1A", // Surface elevation 2
          600: "#262626", // Hairline border
          500: "#383838",
        },
        brand: {
          primary: "#D4AF37",        // Primary Gold
          "primary-dark": "#BF9528", // Hover state gold
          accent: "#D4AF37",         // Luxury accent
          accentHover: "#E5CD7C",
          light: "#FCF9EE",
          dark: "#0A0A0A",
        },
        navy: {
          dark: "#0A0A0A",          // Luxury Deep Black
          darker: "#050505",        // Ultra deep
          card: "#121212",          // Luxury card
        },
        bg: {
          light: "#F7F7F5",         // Luxury off-white / parchment
          white: "#FFFFFF",
          card: "#FFFFFF",
          dark: "#0A0A0A",
        },
        text: {
          primary: "#0A0A0A",
          secondary: "#525252",
          muted: "#8C8C8C",
          gold: "#D4AF37",
        },
        star: {
          yellow: "#D4AF37",
        },
        badge: {
          gold: "#D4AF37",
          green: "#10B981",
          red: "#BE123C",
          blue: "#D4AF37",
          amber: "#D97706",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        serif: ["var(--font-playfair)", "Georgia", "serif"],
        luxury: ["var(--font-playfair)", "serif"],
        poppins: ["var(--font-poppins)", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.04)",
        cardHover: "0 16px 32px -8px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(212, 175, 55, 0.2)",
        goldGlow: "0 0 25px -3px rgba(212, 175, 55, 0.25)",
        goldSubtle: "0 4px 20px -2px rgba(212, 175, 55, 0.15)",
        banner: "0 25px 50px -12px rgba(0, 0, 0, 0.7)",
      },
      animation: {
        pulseSlow: "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        float: "float 4s ease-in-out infinite",
        shimmer: "shimmer 2.5s infinite linear",
        goldShimmer: "goldShimmer 3s infinite linear",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        goldShimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
