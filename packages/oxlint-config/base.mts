import { defineConfig } from "oxlint";

export default defineConfig({
  categories: {
    correctness: "error",
  },
  rules: {
    "eslint/prefer-const": "error",
    "eslint/eqeqeq": "error",
  },
});
