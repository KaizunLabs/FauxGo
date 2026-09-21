import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  retries: 0,
  reporter: "line",
  use: {
    baseURL: process.env.FAUXGO_E2E_URL ?? "http://127.0.0.1:8081",
    trace: "retain-on-failure",
    ...devices["Desktop Chrome"],
  },
  webServer: process.env.FAUXGO_E2E_URL
    ? undefined
    : {
        command: "npm run web -- --port 8081",
        url: "http://127.0.0.1:8081",
        reuseExistingServer: true,
        timeout: 120_000,
      },
});
