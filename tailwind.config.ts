import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Reference Palette - Forest-Mint Redesign
        midnight: "#092622",
        "deep-forest": "#10312B",
        "forest-green": "#1F4A3F",
        "muted-sage": "#4E7967",
        "soft-sage": "#9EC2A9",
        "pale-mint": "#DBF2DE",

        // Functional semantic tokens
        app: {
          bg: "#F3F8F2",
          surface: "#FFFFFF",
          "surface-subtle": "#EAF4E8",
          border: "#DCE9DD",
          borderHover: "#C4DAC7",
        },
        ink: {
          primary: "#10312B",
          secondary: "#52685B",
          muted: "#718579",
        },
        forest: {
          50: "#f3f8f2",
          100: "#eaf4e8",
          200: "#dbf2de",
          300: "#9ec2a9",
          400: "#4e7967",
          500: "#2d5e50",
          600: "#1f4a3f",
          700: "#193f35",
          800: "#10312b",
          900: "#0d2823",
          950: "#092622",
        },
        sage: {
          50: "#f6faf6",
          100: "#eaf4e8",
          200: "#d5e8d8",
          300: "#b5d6be",
          400: "#9ec2a9",
          500: "#709e86",
          600: "#4e7967",
          700: "#3d6152",
          800: "#2c473b",
          900: "#1e3128",
        },
        mint: {
          50: "#f7fcf8",
          100: "#effaf1",
          200: "#dbf2de",
          300: "#c2e9c8",
          400: "#9ec2a9",
          500: "#6eb384",
        },
        status: {
          success: "#236B38",
          "success-bg": "#E8F5E9",
          warning: "#B45309",
          "warning-bg": "#FEF3C7",
          error: "#B91C1C",
          "error-bg": "#FEE2E2",
          info: "#1E6B65",
          "info-bg": "#E0F2F1",
        },
      },
      fontFamily: {
        heading: ["var(--font-manrope)", "system-ui", "sans-serif"],
        sans: ["var(--font-dm-sans)", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
      },
      boxShadow: {
        soft: "0 2px 8px -2px rgba(16, 49, 43, 0.05), 0 1px 4px -1px rgba(16, 49, 43, 0.03)",
        card: "0 4px 16px -4px rgba(16, 49, 43, 0.06), 0 2px 6px -2px rgba(16, 49, 43, 0.04)",
        float: "0 12px 32px -8px rgba(9, 38, 34, 0.12), 0 4px 12px -2px rgba(9, 38, 34, 0.06)",
        glow: "0 0 24px -4px rgba(158, 194, 169, 0.35)",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.25rem",
        "4xl": "1.5rem",
      },
    },
  },
  plugins: [],
};
export default config;
