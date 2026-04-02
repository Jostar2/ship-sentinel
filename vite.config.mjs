import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

const rootDir = fileURLToPath(new URL(".", import.meta.url));
const port = Number(process.env.SHIP_SENTINEL_UI_PORT || 41743);

export default defineConfig({
  plugins: [react()],
  root: rootDir,
  cacheDir: fileURLToPath(new URL("./.vite/ship-sentinel-ui", import.meta.url)),
  server: {
    host: "127.0.0.1",
    port,
    open: "/app/index.html",
  },
  preview: {
    host: "127.0.0.1",
    port,
    open: "/app/index.html",
  },
  build: {
    rollupOptions: {
      input: {
        app: fileURLToPath(new URL("./app/index.html", import.meta.url)),
        uiLab: fileURLToPath(new URL("./app/ui-lab/index.html", import.meta.url)),
      },
    },
  },
});
