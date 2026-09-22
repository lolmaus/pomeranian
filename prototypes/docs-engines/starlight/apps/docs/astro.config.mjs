import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
export default defineConfig({ integrations: [starlight({ title: 'Location verification', sidebar: [{ label: 'Guide', items: [{ label: 'Guide start', link: '/guide/start/' }, { label: 'Nested next', link: '/guide/nested/next/' }] }], editLink: { baseUrl: 'https://github.com/example/fixture/edit/main/apps/docs/' }, lastUpdated: true })] });
