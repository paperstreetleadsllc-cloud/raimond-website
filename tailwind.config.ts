import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        // One family throughout. Headings use its wider, heavier cut (set in globals.css),
        // which reads like lettering on a work van rather than a tech template.
        sans: ["Archivo Variable", "system-ui", "Segoe UI", "Roboto", "Arial", "sans-serif"],
        display: ["Archivo Variable", "system-ui", "Segoe UI", "Roboto", "Arial", "sans-serif"],
      },
      colors: {
        // Original RAimond brand tokens, kept so existing pages still compile.
        night: { 900: "#02040d", 800: "#050912", 700: "#0b1121", 600: "#111a30" },
        teal: { brand: "#1FF0DA", deep: "#0BA898", ink: "#087F74", wash: "#DDFBF7" },
        // Deep pine instead of black: the dark end of the brand teal.
        ink: { DEFAULT: "#0F2E2D", soft: "#1B4543" },
        body: "#34433F",
        muted: "#566663",
        paper: { DEFAULT: "#FFFFFF", deep: "#EEF3F0" },
        line: "#D5DFDB",
        // Used only to mark what is missing or needs attention.
        signal: { DEFAULT: "#FFB703", wash: "#FFF4D6", ink: "#7A5200" },
      },
      boxShadow: {
        card: "0 1px 2px rgba(15,46,45,0.06), 0 14px 34px -22px rgba(15,46,45,0.28)",
        phone: "0 2px 4px rgba(15,46,45,0.06), 0 34px 60px -32px rgba(15,46,45,0.45)",
      },
    },
  },
  plugins: [],
};
export default config;
