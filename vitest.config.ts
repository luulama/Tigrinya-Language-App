import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    include: ["packages/**/*.test.ts", "apps/web/**/*.test.tsx"],
    setupFiles: ["./tests/web-setup.ts"],
  },
});
