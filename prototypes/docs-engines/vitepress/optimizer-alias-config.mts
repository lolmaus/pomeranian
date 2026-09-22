import { fileURLToPath, pathToFileURL } from 'node:url'
import { createRequire } from 'node:module'
import { defineConfig } from 'vitepress'
const fromApp = createRequire(import.meta.url)
const vitePressPackage = pathToFileURL(fromApp.resolve('vitepress/package.json'))
export default defineConfig({
  title: 'Location verification',
  srcDir: '../../docs/site',
  vite: { resolve: { alias: { vue: fileURLToPath(new URL('../node_modules/vue', import.meta.url)),
    '@vue/devtools-api': fileURLToPath(new URL('../@vue/devtools-api', vitePressPackage)),
    '@vueuse/core': fileURLToPath(new URL('../@vueuse/core', vitePressPackage)) } } },
  themeConfig: { sidebar: [{ text: 'Guide', link: '/guide/start' }] }
})
