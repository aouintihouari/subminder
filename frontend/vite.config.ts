import path from "path";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";


const apiTarget = process.env.VITE_API_TARGET || 'http://127.0.0.1:8000';
// FORCE UPDATE VITE CONFIG
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000,
    host: true,
    watch: { usePolling: true },
    proxy: {
      "/api": { target: apiTarget, changeOrigin: true, secure: false },
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
    css: true,
    exclude: ["**/node_modules/**", "**/dist/**", "**/e2e/**"],
  },
});
