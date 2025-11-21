import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    strictPort: true,
    proxy: {
      "/api": {
        target: "http://localhost:8040",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  preview: {
    port: 4174,
  },
});















