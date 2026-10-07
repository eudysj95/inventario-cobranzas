import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    globals: true,
    sequence: {
      hooks: "list",
    },
    testTimeout: 30000,
  },
  define: {
    'import.meta.env.VITE_TOAST': '"true"',
    'import.meta.env.VITE_NEW_LAYOUT': '"true"',
    'import.meta.env.VITE_NEW_LOGIN': '"true"',
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
});