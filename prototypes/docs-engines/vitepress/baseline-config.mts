import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitepress'
export default defineConfig({
  title: 'Location verification',
  srcDir: '../../docs/site',
  vite: { resolve: { alias: { vue: fileURLToPath(new URL('../node_modules/vue', import.meta.url)) } } },
  themeConfig: { sidebar: [{ text: 'Guide', link: '/guide/start' }] }
})
