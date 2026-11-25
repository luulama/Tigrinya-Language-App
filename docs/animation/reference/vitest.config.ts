import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    include: [
      "docs/animation/reference/**/*.test.ts",
      "docs/animation/reference/**/*.test.tsx",
    ],
    setupFiles: ["./tests/web-setup.ts"],
  },
});
