import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";

// Measures the reusable core only, separately from the lab's React host.
export default defineConfig({
  build: {
    emptyOutDir: false,
    minify: true,
    lib: {
      entry: fileURLToPath(new URL("./motion.ts", import.meta.url)),
      formats: ["es"],
      fileName: "motion-core",
    },
  },
});
