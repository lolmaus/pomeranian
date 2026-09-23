import { defineConfig } from "@playwright/test";

export default defineConfig({
  testMatch: "browser-probes.spec.ts",
  workers: 1,
  retries: 0,
  timeout: 30_000,
  expect: { timeout: 180 },
  use: { browserName: "chromium", headless: true },
  reporter: [["list"], ["json", { outputFile: "probe-report.json" }], ["./probe-reporter.ts"]],
});
