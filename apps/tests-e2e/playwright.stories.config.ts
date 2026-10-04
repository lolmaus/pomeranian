import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "../..",
  testMatch: [
    "**/packages/*/src/**/*.stories.spec.ts",
    "**/apps/tests-e2e/tests/**/*.stories.spec.ts",
  ],
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  workers: process.env.CI ? 2 : undefined,
  timeout: 15_000,
  expect: { timeout: 500 },
  outputDir: "test-results/stories/artifacts",
  use: {
    baseURL: "http://127.0.0.1:43192/harness/",
    browserName: "chromium",
    trace: "retain-on-failure",
  },
  reporter: [["list"], ["json", { outputFile: "test-results/stories/report.json" }]],
  webServer: {
    command: "vite --config vite.config.mts",
    url: "http://127.0.0.1:43192/harness/",
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
