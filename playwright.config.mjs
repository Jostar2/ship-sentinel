import { defineConfig } from "@playwright/test";

const port = Number(process.env.SHIP_SENTINEL_UI_PORT || 41743);

export default defineConfig({
  testDir: "./tests/ui",
  timeout: 30_000,
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    headless: true,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  webServer: {
    command: `npm run ui:dev -- --strictPort --port ${port}`,
    url: `http://127.0.0.1:${port}/app/index.html`,
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
