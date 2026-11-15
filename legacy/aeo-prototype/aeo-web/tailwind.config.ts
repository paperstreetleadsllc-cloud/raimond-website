import plugin from "tailwindcss/plugin";
import type { Config } from "tailwindcss";

const config = {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "Segoe UI", "Roboto", "Arial", "sans-serif"],
      },
      colors: {
        brand: {
          bg: "#020617",
          panel: "#0b1220",
          muted: "#94a3b8",
          accent: "#22d3ee",
        },
      },
      boxShadow: {
        panel: "0 10px 35px rgba(0, 0, 0, 0.35)",
      },
    },
  },
  plugins: [
    plugin(({ addUtilities }) => {
      addUtilities({
        ".panel": {
          background: "rgba(11, 18, 32, 0.75)",
          border: "1px solid rgba(34, 211, 238, 0.18)",
          boxShadow: "0 10px 35px rgba(0, 0, 0, 0.35)",
        },
      });
    }),
  ],
} satisfies Config;

export default config;
