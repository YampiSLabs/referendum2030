import { defineConfig, devices } from "@playwright/test";
import baseConfig from "./playwright.config";

export default defineConfig({
  ...baseConfig,
  testDir: "./e2e",
  testMatch: "production-smoke.spec.ts",
  fullyParallel: false,
  retries: 1,
  webServer: {
    command: "pnpm dev --host 127.0.0.1 --port 4322 --strictPort",
    url: "http://127.0.0.1:4322",
    reuseExistingServer: false,
    env: {
      PUBLIC_API_BASE_URL: "https://referendum.yampi.eu/api/v1",
      PUBLIC_USE_MOCKS: "false",
      PUBLIC_SITE_URL: "http://127.0.0.1:4322",
    },
  },
  projects: [
    {
      name: "chromium-prod",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
