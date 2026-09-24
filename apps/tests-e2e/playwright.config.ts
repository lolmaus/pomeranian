import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  workers: process.env.CI ? 2 : undefined,
  timeout: 15_000,
  expect: { timeout: 500 },
  use: {
    baseURL: "http://127.0.0.1:43191",
    browserName: "chromium",
    trace: "retain-on-failure",
  },
  reporter: [["list"], ["json", { outputFile: "test-results/report.json" }]],
  webServer: {
    command:
      "pnpm --filter @pomeranian/demo-app-react run build && pnpm --filter @pomeranian/demo-app-react run preview --host 127.0.0.1 --port 43191 --strictPort",
    url: "http://127.0.0.1:43191",
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
