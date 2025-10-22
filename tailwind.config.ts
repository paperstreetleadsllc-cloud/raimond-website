import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    container: { center: true, padding: "1rem" },
    extend: {
      colors: {
        brand: { amber: "#FFB020", night: "#0A0F1C", ink: "#0C1426" },
      },
      backgroundImage: {
        "hero-gradient":
          "radial-gradient(1200px 600px at 85% 20%, rgba(8,16,33,0.45) 0%, rgba(8,16,33,0) 60%), linear-gradient(180deg, #070C18 0%, #0B152C 55%, #0E1727 100%)",
      },
      boxShadow: {
        glass: "0 20px 60px rgba(0,0,0,0.55)",
        "inner-glow": "inset 0 1px 0 rgba(255,255,255,0.06), inset 0 0 120px rgba(255,255,255,0.03)",
      },
      fontFamily: {
        sans: ["InterVariable", "system-ui", "Segoe UI", "Roboto", "Arial", "sans-serif"],
        display: ["Space Grotesk", "InterVariable", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;