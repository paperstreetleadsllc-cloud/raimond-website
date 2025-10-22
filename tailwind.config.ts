import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          amber: "#FFB020",
          night: "#0A1229",
          slate: "#0F172A",
        },
      },
      backgroundImage: {
        "hero-gradient":
          "linear-gradient(180deg, rgba(8,13,30,1) 0%, rgba(11,20,44,1) 55%, rgba(15,24,41,1) 100%)",
      },
      boxShadow: { glass: "0 12px 40px rgba(3,6,12,0.6)" },
      fontFamily: {
        sans: ["InterVariable","system-ui","Segoe UI","Roboto","Arial","sans-serif"],
        display: ["Space Grotesk","InterVariable","system-ui","sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;