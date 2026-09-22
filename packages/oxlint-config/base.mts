import { defineConfig } from "oxlint";

export default defineConfig({
  plugins: ["typescript", "unicorn", "oxc"],
  categories: {
    correctness: "error",
  },
  options: {
    typeAware: true,
  },
  rules: {
    "eslint/prefer-const": "error",
    "eslint/eqeqeq": "error",
    "typescript/no-floating-promises": "error",
    "typescript/no-misused-promises": "error",
  },
});
