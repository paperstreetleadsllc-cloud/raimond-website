import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      fontSize: {
        base: ["1.125rem", { lineHeight: "1.75rem" }], // body ~18px
        lg: ["1.25rem", { lineHeight: "1.85rem" }],
        xl: ["1.5rem", { lineHeight: "2rem" }],
        "2xl": ["1.875rem", { lineHeight: "2.25rem" }],
        "3xl": ["2.25rem", { lineHeight: "2.5rem" }],
        "4xl": ["2.75rem", { lineHeight: "2.8rem" }],
        "5xl": ["3.25rem", { lineHeight: "1.1" }],
        "6xl": ["4rem", { lineHeight: "1.05" }],
        "7xl": ["4.75rem", { lineHeight: "1.05" }],
        "8xl": ["5.5rem", { lineHeight: "1" }],
      },
      letterSpacing: {
        tightest: "-0.04em",
        tighter: "-0.03em",
        tight: "-0.02em",
      },
      fontFamily: {
        sans: ["InterVariable", "system-ui", "Segoe UI", "Roboto", "Arial", "sans-serif"],
        display: ["Space Grotesk", "InterVariable", "system-ui", "sans-serif"],
      },
      colors: {
        brand: {
          amber: "#FFB020",
          night: "#0A1229",
          slate: "#0F172A",
          teal: "#20F2D9",
        },
      },
      boxShadow: {
        glass: "0 12px 40px rgba(3,6,12,0.6)",
      },
    },
  },
  plugins: [],
} satisfies Config;