# Minimal documentation engine research

Research date: 2026-09-21. Related decision: [Investigate a minimal documentation engine with room for API and LLM docs](https://github.com/lolmaus/pomeranian/issues/7).

This report supplies facts and a recommendation for a later author decision. It does not choose Pomeranian's engine, approve an implementation, or change the roadmap. Sources are engine documentation, integration-maintainer documentation/repositories, and the relevant hosting/specification owners. No candidate was installed or built; integration compatibility remains a bootstrap check.

Review update, 2026-09-22: the author confirmed VitePress with root `docs/site/`
content and `apps/docs/` configuration as the direction to validate. The paths
below preserve the original research proposal, which preceded that agreement.
Read the [requirements and evidence review](docs-engine-review.md) and
[root content location investigation](docs-engine-content-location.md) alongside
this historical comparison. The preference interview is complete; verification
and the subsequent minimal implementation remain distinct work. The later
[isolated prototype comparison](docs-engine-prototype-comparison.md) supplies
runtime evidence for VitePress and Astro + Starlight, including necessary
configuration and observed limitations; the original report below remains
historical documentation research.

The author's [interview answers](docs-engine-requirements.md) now require future
versions sourced from Git branches, English-only content, and local guide/API
search. The [versioning follow-up](docs-engine-branch-versions.md) examines that
additional selection criterion; the initial workspace still has one version and
no switcher.

On confirming the interview, the author clarified that the React demo is only
an E2E fixture and will not be publicly deployed or linked from docs. The
requirements describe the final shape; the first docs implementation is limited
to basic Markdown authoring and local development/build/preview needed by the
next vertical coding slice. See the requirements record for the approved scope
and the separation between initial checks and deferred integrations.

## Recommendation

**Recommend VitePress with its default theme and Markdown content for the smallest initial workspace.** This is an inference from the documented setup: a VitePress dependency, one configuration file, and content files give Pomeranian an authoring environment without application components or content-collection configuration. Its TypeDoc and LLM-output routes exist as separate integrations that can be added later. The engine choice remains the project author's. [VitePress setup](https://vuejs.github.io/vitepress/v1/guide/getting-started), [TypeDoc integration](https://typedoc-plugin-markdown.org/plugins/vitepress/quick-start), [LLM integration](https://github.com/okineadev/vitepress-plugin-llms).

Starlight is a close alternative if the author prefers Astro's content conventions. Docusaurus is reasonable if rendering React components inside the documentation becomes important. The separate React demo application does not itself require a React-based documentation engine.

## Comparison

Paths below place each candidate's site root at the already-requested `apps/docs/`. They are proposed repository mappings of the documented conventions.

| Candidate | Small initial workspace | Authoring convention | Later integrated API reference | Later LLM output |
| --- | --- | --- | --- | --- |
| VitePress | Package, `.vitepress/config.mts`, Markdown pages; default theme. | `apps/docs/index.md`, `apps/docs/guide/*.md`; `.md` routes follow file paths. Vue syntax/components are optional. | `typedoc`, `typedoc-plugin-markdown`, `typedoc-vitepress-theme`; generated pages and sidebar join the same site. | Community `vitepress-plugin-llms` generates index, full bundle, and individual Markdown pages. |
| Astro Starlight | Astro/Starlight package, `astro.config.mjs`, `src/content.config.ts`, content; default theme. | `apps/docs/src/content/docs/*.md` or `.mdx`; each page requires title frontmatter. | Community `starlight-typedoc` plus TypeDoc and its Markdown plugin; generated pages and sidebar use Starlight. | Community `starlight-llms-txt` generates index, full, and small bundles. |
| Docusaurus | Site package, `docusaurus.config.ts`, sidebar configuration, content; classic preset can use docs-only mode. | `apps/docs/docs/*.md` or `.mdx`; content uses MDX parsing by default. | Community `docusaurus-plugin-typedoc` plus TypeDoc and its Markdown plugin; generated pages join the docs routes/navigation. | Community `docusaurus-plugin-llms` produces index/full files during production builds. |

The following sections substantiate each row and its maintenance implications.

## VitePress

The stable documentation provides installation into an existing project and `dev`, `build`, and `preview` commands. VitePress is ESM-only. A docs package can run those commands from its own root; build output normally goes to `.vitepress/dist`. Adding explicit Vue dependencies is needed when customizing with Vue components/APIs. [Stable setup](https://vuejs.github.io/vitepress/v1/guide/getting-started).

Markdown lives outside `.vitepress`, normally directly under the site root; `srcDir` can separate it later. File paths determine routes. Vue enhancements are available inside Markdown, but ordinary prose and fenced TypeScript examples do not require author-written Vue. [Routing](https://vitepress.dev/guide/routing), [Vue in Markdown](https://vuejs.github.io/vitepress/v1/guide/using-vue).

The TypeDoc integration runs before VitePress, writes Markdown plus `typedoc-sidebar.json`, and provides a sidebar import for the site's configuration. A proposed destination is `apps/docs/api/`. In this monorepo, generation must receive the correct `docsRoot` if launched elsewhere. These packages belong to the TypeDoc Markdown integration ecosystem, not VitePress core. [Integration setup](https://typedoc-plugin-markdown.org/plugins/vitepress/quick-start), [integration options](https://www.typedoc-plugin-markdown.org/plugins/vitepress/options).

The separate `vitepress-plugin-llms` Vite plugin documents `llms.txt`, `llms-full.txt`, and individual `.md` output, with optional page descriptions and UI controls. None of those controls is necessary for initial authoring. [Maintainer repository](https://github.com/okineadev/vitepress-plugin-llms).

**Version caveat:** the current main website describes `2.0.0-alpha.20` and installs `vitepress@next`; it links separately to stable `1.6.4` documentation. A later implementation should explicitly select and lock a compatible version line instead of copying `@next` accidentally. This research does not establish a support-lifetime or performance comparison. [Current setup](https://vitepress.dev/guide/getting-started), [stable setup](https://vuejs.github.io/vitepress/v1/guide/getting-started).

## Astro Starlight

Starlight is an Astro documentation integration with its own starter. Its standard structure includes an Astro configuration, a content collection using `docsLoader` and `docsSchema`, and documents in `src/content/docs/`. Markdown and MDX are supported; plain `.md` is enough initially. Title frontmatter is required. [Starter](https://starlight.astro.build/getting-started/), [project structure](https://starlight.astro.build/guides/project-structure/), [content configuration](https://starlight.astro.build/manual-setup/), [authoring](https://starlight.astro.build/guides/authoring-content/).

`starlight-typedoc` takes TypeScript entry points and a TypeScript configuration, generates reference pages, and supplies `typeDocSidebarGroup` to join normal navigation. It adds three packages: the integration, `typedoc`, and `typedoc-plugin-markdown`. The official Starlight catalog explicitly places this integration in its community section. [Integration setup](https://starlight-typedoc.vercel.app/getting-started/), [maintainer repository](https://github.com/HiDeoo/starlight-typedoc), [plugin ownership](https://starlight.astro.build/resources/plugins/).

`starlight-llms-txt` is also cataloged as a community plugin. It creates `llms.txt`, `llms-full.txt`, and `llms-small.txt`, requires a configured site URL, and documents local preview of the generated endpoint. [Maintainer setup](https://delucis.github.io/starlight-llms-txt/getting-started/), [plugin ownership](https://starlight.astro.build/resources/plugins/).

**Tradeoff, inferred from setup:** Starlight supplies clear content conventions but introduces an Astro configuration and content-collection layer beyond VitePress's basic files. Its guide currently calls Starlight beta software; assess the chosen versions and integration peers together at installation. This does not imply the required workflows are unsupported. [Setup and update guidance](https://starlight.astro.build/getting-started/).

## Docusaurus

The classic starter includes documentation, blog, custom-page, and styling capabilities; a TypeScript variant exists. A small Pomeranian setup can use docs-only mode and disable the blog. Content belongs under the site's `docs/`, with navigation controlled through sidebars. [Installation and structure](https://docusaurus.io/docs/installation), [docs-only mode](https://docusaurus.io/docs/docs-introduction).

Docusaurus supports React components in Markdown through MDX. By default even `.md` documents use MDX parsing, which has stricter syntax than ordinary Markdown. CommonMark opt-in remains documented as experimental. This matters for prose containing raw angle brackets/braces and for generated reference output; those should be rendered and checked when the integration is added. [MDX semantics](https://docusaurus.io/docs/markdown-features/react).

`docusaurus-plugin-typedoc` runs TypeDoc as part of the Docusaurus lifecycle, generating Markdown under the docs tree and supporting navigation data. A proposed output is `apps/docs/docs/api/`; the normal site can then serve it as its API section. It requires the plugin, `typedoc`, and `typedoc-plugin-markdown`. [Integration setup](https://typedoc-plugin-markdown.org/plugins/docusaurus/quick-start), [integration features](https://typedoc-plugin-markdown.org/plugins/docusaurus).

The separate `docusaurus-plugin-llms` community project produces `llms.txt` and `llms-full.txt`, with optional individual Markdown files. It runs during the production `postBuild` lifecycle, not the development server. Its docs-source and route options will need to match the chosen docs-only/API configuration. [Maintainer repository](https://github.com/rachfop/docusaurus-plugin-llms).

**Tradeoff, inferred from setup:** React component reuse is an advantage if the documentation needs it. For the present prose/code-example requirement, the larger starter surface and MDX rules add choices without an established need.

## Static hosting and later custom-domain work

All three provide static build output suitable for GitHub Pages. Astro documents its GitHub Actions deployment, VitePress documents uploading `.vitepress/dist`, and Docusaurus emits `build/` and documents GitHub Pages. This establishes a hosting path, not a need to deploy at bootstrap. [Astro deployment](https://docs.astro.build/en/guides/deploy/github/), [VitePress deployment](https://vuejs.github.io/vitepress/v1/guide/deploy), [Docusaurus deployment](https://docusaurus.io/docs/deployment).

When deployment is authorized, `pomeranian.lolma.us` is a custom subdomain. GitHub's documentation calls for configuring it in repository Pages settings and a DNS CNAME pointing to the owner's default GitHub Pages domain; for this repository, the expected target is `lolmaus.github.io`, without `/pomeranian`. With a custom GitHub Actions publishing workflow, GitHub says a repository `CNAME` file is not required and is ignored. Use GitHub's documentation for that detail even if an engine's guide still recommends the file. Site base/canonical URL configuration must match the eventual host. [GitHub custom-domain rules](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site).

## Smallest reasonable bootstrap

If the author accepts the VitePress recommendation, propose only:

1. One private workspace package at `apps/docs/`, a deliberately selected VitePress version, its default theme, and local development/build/preview commands.
2. `.vitepress/config.mts`, `index.md`, and `guide/getting-started.md`; a small explicit navigation/sidebar and ignored build/cache outputs. This is a proposed mapping of VitePress's documented file conventions. [File routing](https://vitepress.dev/guide/routing).
3. A contributor convention: each implemented behavior updates a relevant guide/example and its inline API comments. Keep factual claims in examples synchronized with implemented behavior.
4. A successful local site build with one navigable guide. The resulting files remain local until deployment is separately authorized.

Defer custom styling, a polished landing page, hosting/DNS changes, TypeDoc generation/navigation, and LLM-output plugins. Reserve an API section in the content plan, without creating generated placeholder documentation. These are incremental additions, not prerequisites for writing feature documentation.

## Evidence required when adding the deferred integrations

- **API reference:** generate a small representative class and type across real package entry points, verify anchors and cross-package links in the same site shell, and prove repeatable generation. TypeDoc supports explicit multiple entry points and a `packages` strategy; no source `index.ts` barrel is required. Keep Pomeranian's explicit-export policy. [TypeDoc input options](https://typedoc.org/documents/Options.Input.html).
- **LLM output:** inspect both authored and generated API content, confirm links resolve, and check code examples survive conversion. A listed plugin's existence does not prove compatibility with the chosen versions or every content feature. The current `llms.txt` proposal describes concise Markdown discovery with links to clean page representations; its current revision also recommends discovery link relations. Do not assume a generator implements every detail merely because it emits the requested filenames. [Proposal owner](https://llmstxt.org/).
- **Tool compatibility:** check selected package/peer versions and Oxfmt handling of the actual authoring/configuration formats at bootstrap. No engine changes Pomeranian's chosen formatter or silently authorizes an additional formatter.

These checks are bounded integration work when those roadmap items are selected. They do not require completing the documentation website before feature slices begin.
