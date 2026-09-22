import base from "@pomeranian/oxlint-config/base";
import { defineConfig } from "oxlint";

export default defineConfig({
  extends: [base],
  plugins: [...base.plugins, "react"],
  rules: {
    "react/rules-of-hooks": "error",
    "react/exhaustive-deps": "error",
    "react/react-in-jsx-scope": "off",
  },
});
