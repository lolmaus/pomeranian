import library from "@pomeranian/oxlint-config/playwright-library";
import playwright from "eslint-plugin-playwright";
import { defineConfig } from "oxlint";

export default defineConfig({
  jsPlugins: library.jsPlugins,
  rules: {
    ...playwright.configs["flat/recommended"].rules,
    ...library.rules,
    "playwright/expect-expect": ["error", { assertFunctionNames: ["expect"] }],
  },
});
