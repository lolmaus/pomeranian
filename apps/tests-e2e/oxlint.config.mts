import base from "@pomeranian/oxlint-config/base";
import playwright from "@pomeranian/oxlint-config/playwright-test";
import { defineConfig } from "oxlint";

export default defineConfig({
  extends: [base],
  overrides: [
    {
      files: ["tests/**/*.spec.ts"],
      ...playwright,
      rules: {
        ...playwright.rules,
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
