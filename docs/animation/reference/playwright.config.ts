import { defineConfig } from "@playwright/test";
import { fileURLToPath } from "node:url";

export default defineConfig({
  testDir: "./browser",
  outputDir: "../../../.tools/motion-browser-artifacts",
  reporter: "list",
  workers: 1,
  use: { baseURL: "http://127.0.0.1:4175", trace: "retain-on-failure" },
  projects: [
    {
      name: "desktop-chrome",
      use: {
        browserName: "chromium",
        channel: "chrome",
        viewport: { width: 1280, height: 850 },
      },
    },
    {
      name: "phone-chrome",
      use: {
        browserName: "chromium",
        channel: "chrome",
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
      },
    },
    {
      name: "phone-webkit",
      use: {
        browserName: "webkit",
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
      },
    },
  ],
  webServer: {
    command:
      "bash scripts/tool.sh node node_modules/vite/bin/vite.js --config docs/animation/reference/vite.config.ts",
    cwd: fileURLToPath(new URL("../../../", import.meta.url)),
    url: "http://127.0.0.1:4175",
    reuseExistingServer: false,
    timeout: 30000,
  },
});
