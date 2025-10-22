import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: { brand: { amber: "#FFB020", night: "#0A1229", slate: "#0F172A" } },
      boxShadow: { glass: "0 8px 30px rgba(0,0,0,0.35)" },
      fontFamily: {
        sans: ["InterVariable","system-ui","Segoe UI","Roboto","Arial","sans-serif"],
        display: ["Space Grotesk","InterVariable","system-ui","sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;