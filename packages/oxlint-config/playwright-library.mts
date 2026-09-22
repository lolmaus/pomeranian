import { defineConfig } from "oxlint";

export default defineConfig({
  jsPlugins: [
    {
      name: "playwright",
      specifier: import.meta.resolve("eslint-plugin-playwright"),
    },
  ],
  rules: {
    "playwright/missing-playwright-await": "error",
    "playwright/no-page-pause": "error",
    "playwright/no-unnecessary-assertions": "error",
    "playwright/no-unsafe-references": "error",
    "playwright/no-unused-locators": "error",
    "playwright/no-useless-await": "error",
    "playwright/no-useless-not": "error",
    "playwright/no-wait-for-navigation": "error",
    "playwright/no-wait-for-timeout": "error",
    "playwright/valid-expect": "error",
    "playwright/valid-expect-in-promise": "error",
  },
});
