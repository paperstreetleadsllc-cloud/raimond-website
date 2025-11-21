import plugin from "tailwindcss/plugin";
import type { Config } from "tailwindcss";

const config = {
  darkMode: ["class"],
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
        sans: ["Inter", "system-ui", "Segoe UI", "Roboto", "Arial", "sans-serif"],
        display: ["Space Grotesk", "Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      colors: {
        background: "var(--color-background)",
        foreground: "var(--color-foreground)",
        card: "var(--color-card)",
        "card-foreground": "var(--color-card-foreground)",
        popover: "var(--color-popover)",
        "popover-foreground": "var(--color-popover-foreground)",
        primary: "var(--color-primary)",
        "primary-foreground": "var(--color-primary-foreground)",
        secondary: "var(--color-secondary)",
        "secondary-foreground": "var(--color-secondary-foreground)",
        muted: "var(--color-muted)",
        "muted-foreground": "var(--color-muted-foreground)",
        accent: "var(--color-accent)",
        "accent-foreground": "var(--color-accent-foreground)",
        border: "var(--color-border)",
        input: "var(--color-input)",
        "input-background": "var(--color-input-background)",
        "switch-background": "var(--color-switch-background)",
        ring: "var(--color-ring)",
        "chart-1": "var(--chart-1)",
        "chart-2": "var(--chart-2)",
        "chart-3": "var(--chart-3)",
        "chart-4": "var(--chart-4)",
        "chart-5": "var(--chart-5)",
        brand: {
          night: "var(--deep-navy)",
          slate: "var(--secondary)",
          teal: "var(--cyber-teal)",
        },
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
      },
      boxShadow: {
        glow: "0 0 20px var(--glow-teal)",
        "glow-intense": "0 0 30px var(--glow-teal-intense)",
        teal: "0 8px 24px rgba(31, 240, 218, 0.2)",
      },
    },
  },
  plugins: [
    plugin(({ addUtilities }) => {
      addUtilities({
        ".glass-card": {
          background: "var(--glass-bg)",
          border: "1px solid var(--glass-border)",
          backdropFilter: "blur(12px)",
          transition: "all 0.3s ease",
        },
        ".glass-card:hover": {
          transform: "translateY(-2px)",
          boxShadow: "0 8px 24px rgba(31, 240, 218, 0.15)",
        },
        ".glow-border": { boxShadow: "0 0 20px var(--glow-teal)" },
        ".glow-border-intense": {
          boxShadow: "0 0 30px var(--glow-teal-intense)",
        },
        ".gradient-teal": {
          background:
            "linear-gradient(135deg, rgba(31, 240, 218, 0.1) 0%, rgba(31, 240, 218, 0) 100%)",
        },
        ".grid-pattern": {
          backgroundImage:
            "linear-gradient(rgba(31, 240, 218, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(31, 240, 218, 0.03) 1px, transparent 1px)",
          backgroundSize: "50px 50px",
        },
      });
    }),
  ],
} satisfies Config;

export default config;