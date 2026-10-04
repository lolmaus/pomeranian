import base from "@pomeranian/oxlint-config/base";
import playwright from "@pomeranian/oxlint-config/playwright-library";
import playwrightTest from "@pomeranian/oxlint-config/playwright-test";
import { defineConfig } from "oxlint";

export default defineConfig({
  extends: [base],
  overrides: [
    {
      files: ["src/**/*.{ts,tsx,mts,cts}"],
      ...playwright,
    },
    {
      files: ["src/**/*.spec.ts"],
      ...playwrightTest,
      rules: {
        ...playwrightTest.rules,
        "playwright/expect-expect": [
          "error",
          {
            assertFunctionNames: ["expect", "shouldHaveText", "shouldNotHaveText"],
          },
        ],
      },
    },
  ],
});
