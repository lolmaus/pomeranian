import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'
import { defineConfig } from 'vitepress'
const fromApp = createRequire(import.meta.url)
const fromVitePress = createRequire(fromApp.resolve('vitepress/package.json'))
export default defineConfig({
  title: 'Location verification',
  srcDir: '../../docs/site',
  vite: { resolve: { alias: { vue: fileURLToPath(new URL('../node_modules/vue', import.meta.url)),
    '@vue/devtools-api': fromVitePress.resolve('@vue/devtools-api'),
    '@vueuse/core': fromVitePress.resolve('@vueuse/core') } } },
  themeConfig: { sidebar: [{ text: 'Guide', link: '/guide/start' }] }
})
