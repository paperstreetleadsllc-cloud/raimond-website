import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: { amber: "#FFB020", night: "#0A1229", slate: "#0F172A" }
      },
      backgroundImage: {
        "hero-gradient": "linear-gradient(180deg, rgba(6,11,34,1) 0%, rgba(13,24,61,1) 55%, rgba(16,24,41,1) 100%)"
      },
      boxShadow: {
        glass: "0 8px 30px rgba(0,0,0,0.35)"
      }
    }
  },
  plugins: []
} satisfies Config;