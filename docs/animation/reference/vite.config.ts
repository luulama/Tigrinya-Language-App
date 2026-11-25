import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

export default defineConfig({
  root: fileURLToPath(new URL(".", import.meta.url)),
  plugins: [react()],
  server: {
    host: "127.0.0.1",
    port: 4175,
    strictPort: true,
    fs: {
      allow: [
        fileURLToPath(new URL("..", import.meta.url)),
        fileURLToPath(
          new URL("../../../shared/mascot/assets", import.meta.url),
        ),
        fileURLToPath(new URL("../../../node_modules", import.meta.url)),
      ],
    },
  },
  build: { emptyOutDir: false, sourcemap: false },
});
