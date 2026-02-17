import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Vitest does not automatically inherit Next.js/tsconfig path aliases.
// We map "@" to repo root so tests can import modules like "@/src/...".
// Keep additional aliases aligned with existing project conventions only.
export default defineConfig({
  test: {
    include: ["**/*.test.ts", "**/*.test.tsx"],
  },
  resolve: {
    alias: {
      // Base alias first; scoped aliases below mirror tsconfig paths.
      "@": resolve(__dirname, "."),
      "@shared": resolve(__dirname, "shared"),
      "@features": resolve(__dirname, "src/features"),
      "@hooks": resolve(__dirname, "src/hooks"),
      "@lib": resolve(__dirname, "src/lib"),
      "@types": resolve(__dirname, "src/types"),
    },
  },
});
