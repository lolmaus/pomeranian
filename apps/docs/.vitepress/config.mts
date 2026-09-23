import { createRequire } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";
import { defineConfig } from "vitepress";

const fromApp = createRequire(import.meta.url);
const vitePressPackage = pathToFileURL(fromApp.resolve("vitepress/package.json"));

export default defineConfig({
  title: "Pomeranian",
  description: "Application vocabulary for Playwright tests.",
  lang: "en-US",
  srcDir: "../../docs/site",
  outDir: "./dist",
  cacheDir: "./.cache",
  vite: {
    resolve: {
      // External Markdown needs app-local resolution for generated imports.
      // Revalidate these dependency-directory aliases when upgrading VitePress.
      alias: {
        vue: fileURLToPath(new URL("../node_modules/vue", import.meta.url)),
        "@vue/devtools-api": fileURLToPath(new URL("../@vue/devtools-api", vitePressPackage)),
        "@vueuse/core": fileURLToPath(new URL("../@vueuse/core", vitePressPackage)),
      },
    },
  },
});
