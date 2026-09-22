import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
export default defineConfig({ integrations: [starlight({ title: 'Location verification', sidebar: [{ label: 'Guide', items: [{ autogenerate: { directory: 'guide' } }] }], editLink: { baseUrl: 'https://github.com/example/fixture/edit/main/apps/docs/' }, lastUpdated: true })] });
