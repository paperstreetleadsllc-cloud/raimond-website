import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter Variable", "system-ui", "Segoe UI", "Roboto", "Arial", "sans-serif"],
        display: ["Space Grotesk", "Inter Variable", "system-ui", "sans-serif"],
      },
      colors: {
        // Carried over from the original RAimond brand tokens.
        night: { 900: "#02040d", 800: "#050912", 700: "#0b1121", 600: "#111a30" },
        teal: { brand: "#1FF0DA", deep: "#0BA898", ink: "#087F74" },
        ink: "#0b1426",
      },
      boxShadow: {
        card: "0 1px 2px rgba(11,20,38,0.06), 0 8px 24px -12px rgba(11,20,38,0.12)",
      },
    },
  },
  plugins: [],
};
export default config;
