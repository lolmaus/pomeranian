import base from "@pomeranian/oxlint-config/base";
import playwright from "@pomeranian/oxlint-config/playwright-library";
import { defineConfig } from "oxlint";

export default defineConfig({
  extends: [base],
  overrides: [
    {
      files: ["src/**/*.{ts,tsx,mts,cts}"],
      ...playwright,
    },
  ],
});
