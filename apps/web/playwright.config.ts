import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:4322";
const skipWebServer = process.env.PLAYWRIGHT_SKIP_WEB_SERVER === "true";
const reuseWebServer = process.env.PLAYWRIGHT_REUSE_WEB_SERVER === "true";
const useMocks = process.env.PUBLIC_USE_MOCKS ?? "true";

export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  expect: {
    timeout: 10_000,
  },
  use: {
    baseURL,
    trace: "retain-on-failure",
  },
  webServer: skipWebServer
    ? undefined
    : {
        command: "pnpm dev --host 127.0.0.1 --port 4322",
        url: baseURL,
        reuseExistingServer: reuseWebServer,
        env: {
          PUBLIC_API_BASE_URL: process.env.PUBLIC_API_BASE_URL ?? "http://127.0.0.1:65535/api/v1",
          PUBLIC_USE_MOCKS: useMocks,
        },
      },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
