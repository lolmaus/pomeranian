# Future branch versions: VitePress and Starlight

> Final decision (2026-09-22): the author selected VitePress with root
> `docs/site/` content and removed per-branch documentation versioning from scope.
> The comparison below preserves the evidence considered before that decision.
> Branch-version requirements, proposals, and acceptance checks are superseded,
> not deferred work. API/search and LLM findings remain relevant to the single
> current site. See the [current decision and scope](docs-engine-requirements.md).

Research date: 2026-09-22. This extends the [branch-version investigation](docs-engine-branch-versions.md) for the confirmed [requirements](docs-engine-requirements.md), particularly Q7–Q10. It compares VitePress with Astro + Starlight; it does not change the minimal initial scope or select release branches.

## Finding

**Both engines have credible extension points for independently built branch versions. Neither reviewed versioning plugin supplies the requested workflow or the explained missing-page fallback.** The comparable project-owned work is a publishing recipe, a version registry, page manifests, and a tested switcher. Documentation establishes feasibility, not that the eventual implementation will remain small.

The source-location tradeoffs already observed in the [prototype comparison](docs-engine-prototype-comparison.md) still matter. A manifest based on emitted routes can avoid assuming where Markdown lives, but versioning plugins that archive conventional source folders do not inherit that flexibility automatically. There is no evidence here that would justify switching engines solely to obtain turnkey branch versioning.

No new package was installed, branch site built, or publishing/switching code implemented during this investigation. Evidence consists of primary documentation, maintainer source, and read-only inspection of the already installed VitePress 1.6.4 and Starlight 0.42.2/Astro 7.3.3 prototype dependencies. Links to `main`/`master` record inspected upstream behavior, not a promise about every release.

## What the existing versioning plugins actually provide

| Candidate                      | Verified source model                                                                                                              | Switching behavior and requirement gap                                                                                                                                                                                                                                              |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| VitePress `@viteplus/versions` | Current content under `src/`, archived copies under `archive/<version>` in one build; the wrapper manages `srcDir`.                | The reviewed switcher changes version segments in the current page's relative path. It does not inspect destination-page availability or supply the requested explanation. It also imports default-theme components through VitePress's internal `dist/client/theme-default` paths. |
| `starlight-versions`           | Archives current pages, assets, and sidebar configuration in one content tree. Its documented strategy is explicitly folder based. | Its documented `same-page`/`root` modes determine which path to construct. The reviewed `getVersionURL()` rewrites paths and handles excluded/shared pages, but does not check whether a destination page exists. This is not the agreed missing-page fallback.                     |

VitePress plugin sources: [maintainer README](https://github.com/viteplus/versions), [switcher implementation](https://github.com/viteplus/versions/blob/master/components/version-switcher.component.vue). Starlight plugin sources: [versioning model](https://starlight-versions.vercel.app/guides/about-versioning/), [configuration](https://starlight-versions.vercel.app/configuration/), [version URL and archiving implementation](https://github.com/HiDeoo/starlight-versions/blob/main/packages/starlight-versions/libs/versions.ts).

The Starlight archiver resolves its docs directory from `content/docs/` beneath Astro's `srcDir`. Its configuration also defines exclusion patterns relative to `src/content/docs/`. The VitePress plugin's wrapper owns a different `src/`/`archive/` layout from the tested external `docs/site/` configuration. These are additional reasons not to treat either plugin as a drop-in branch publisher for this repository. They could support another design that aggregates copies from branches, but such a design would need its own content-generation, compatibility, and search-isolation work. [Starlight archiving source](https://github.com/HiDeoo/starlight-versions/blob/main/packages/starlight-versions/libs/versions.ts), [VitePress plugin conventions](https://github.com/viteplus/versions).

## Public building blocks for independent builds

### VitePress

Stable VitePress offers `base` for a deployment prefix, `transformHtml` with rendered HTML and page data, and `buildEnd` after static generation. In the pinned renderer, the HTML hook receives the actual output path, making it a stronger manifest input than guessing a URL from a Markdown filename. A custom nav component can use `useData()`/`useRoute()` for the current page; custom nav components are a documented default-theme extension. [Stable site configuration](https://vuejs.github.io/vitepress/v1/reference/site-config#build-hooks), [1.6.4 renderer](https://github.com/vuejs/vitepress/blob/v1.6.4/src/node/build/render.ts), [runtime API](https://vuejs.github.io/vitepress/v1/reference/runtime-api), [custom nav components](https://vuejs.github.io/vitepress/v1/reference/default-theme-nav#custom-components).

**Design inference:** collect each emitted route and optional agreed frontmatter identity, write the manifest at build end, and put the selector in a small custom component that extends the default theme. For navigation between separately compiled versions, deliberately perform a full document navigation so the destination loads its own runtime, site data, and search index. Do not rely on the current site's client router treating another build as one of its own pages.

### Astro + Starlight

Astro supports `base` and a production `astro:build:done` hook with the final generated page paths, output directory, and asset information. The current API no longer exposes the old `routes` property in that hook; historical examples using it need version checking. Starlight provides component overrides and page route data including `id`, the content entry/frontmatter, and extracted Markdown headings. These are sufficient building blocks for a selector and route manifest without replacing the theme. [Astro base](https://docs.astro.build/en/reference/configuration-reference/#base), [current integration API](https://docs.astro.build/en/reference/integrations-reference/#astrobuilddone), [Starlight overrides](https://starlight.astro.build/reference/overrides/), [route data](https://starlight.astro.build/reference/route-data/).

**Design inference:** use the final generated page list for route availability. If stable identities are needed beyond matching paths, expose them through rendered metadata or another explicitly connected collection/route mapping, then write the manifest after generation. The final page list alone does not contain semantic identities or every API anchor. A header override can preserve the default header and add a selector with a browser script. Do not assume that a mutable collection shared between a build hook and bundled route code will have a common lifetime; the connection needs an explicit mechanism and a check.

### Base paths apply to content links too

VitePress documents automatic base handling for its processed content asset references and configured URLs. Astro documents the need to account for `BASE_URL` when constructing URLs. A Starlight maintainer explains that body links beginning `/` are not automatically prefixed because they may intentionally refer outside the site's base; the existing Starlight prototype also demonstrated the separate `.md`-link mismatch. [VitePress deployment](https://vuejs.github.io/vitepress/v1/guide/deploy), [Astro base configuration](https://docs.astro.build/en/reference/configuration-reference/#base), [Starlight maintainer explanation](https://github.com/withastro/starlight/discussions/2104), [observed authored-link behavior](docs-engine-starlight-verification.md).

Read-only inspection of Starlight 0.42.2's installed Markdown integration found its aside, heading-link, and RTL-code transformations, not general base-prefix rewriting. Treat a version-aware prose-link convention or rewrite as explicit Starlight work; theme navigation being correct does not prove guide-to-guide or guide-to-API links stay in `/v1/`. This needs a bounded future runtime check and is not proof that every optional Astro integration behaves the same way. [Current Starlight Markdown integration source](https://github.com/withastro/starlight/blob/main/packages/starlight/src/integrations/remark-rehype.ts).

## Proposed publishing architecture

The following is an **engine-independent design inference**, not an implementation already supplied by either product.

1. Resolve each selected branch to one commit before starting. Give that build an explicit public version label and base URL. Build authored guides and generated API from that same checkout, preserving the whole monorepo layout so `apps/docs/` still reaches `docs/site/` and package sources. GitHub's checkout action accepts a branch/tag/SHA and a destination path; it does not manage this version policy. [Checkout inputs](https://github.com/actions/checkout).
2. Run that revision's compatible toolchain and integrations. Produce the site, its local search index, LLM outputs, a page manifest, and build metadata identifying source commit and public base. Validate their internal links before accepting the version artifact.
3. Place each complete output under its assigned deployment prefix. Do not copy an artifact built for `/v1/` to a different prefix without rebuilding or a verified relocation design. Keep each search bundle beside its own pages and assets.
4. Assemble a complete deployment artifact containing all retained versions and one version registry. Publishing only the changed version must not erase older ones. Publish after validating the assembled tree; serialize or otherwise reconcile concurrent publications to avoid one update overwriting another.
5. Keep version registry and page manifests in the same publication transaction as the referenced output. Distinguish a build identifier from its movable branch label. A registry should never advertise an unfinished version or point at a manifest for different HTML.

GitHub Pages supports uploading a prepared static artifact and deploying it in a dependent job. This enables assembly; it does not supply incremental merging of independently published branch trees or choose which versions to retain. [Pages custom workflow](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

### Updating version choices on old pages

Two viable policies have different maintenance costs:

| Policy                                                         | Benefit                                                               | Cost to own                                                                                                                                                                                                             |
| -------------------------------------------------------------- | --------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Rebuild every published version with the new version registry  | All selectors have the same build-time choices.                       | Every historical build environment and old theme integration must remain runnable; adding one release can be blocked by an unrelated old dependency/build failure.                                                      |
| Let every version fetch a shared registry with a stable schema | New version choices become visible without rebuilding every old page. | Registry loading, cache freshness, error handling, and backward-compatible schema evolution become part of the switcher contract. Old versions must already contain a compatible client or receive a one-time backport. |

**Recommendation for later design:** consider the shared registry first, with each build retaining enough static identity and a known landing link for degraded operation. This reduces pressure to rebuild old content just to add a choice; it does not remove the need to retain complete old artifacts when assembling a new deployment. The policy remains to be specified when versioning is implemented.

### Page correspondence and explained fallback

Prefer an explicitly assigned identity or maintained rename mapping when one exists; otherwise compare exact routes relative to the version base. Use the target manifest's real destination URL, including its chosen trailing-slash/HTML convention. A same filename is useful evidence of correspondence, not automatic proof that a moved API symbol is equivalent.

If a valid target manifest confirms absence, navigate to that version's landing page and show the agreed explanation there. Carry only the minimal fallback state needed by that page. A failed or incompatible manifest is a lookup failure, not proof of absence; the UI should offer a version-root link with an accurate explanation. Do not route missing pages through a guessed 404 and call that the required fallback.

Fragment handling is separate from page correspondence. Preserve a fragment only if its target anchor is known; generated API anchors may not be Markdown headings. Neither engine's heading array proves every TypeDoc-generated anchor exists. Exact rename/anchor policy can remain a later decision, and the present page-preservation requirement does not imply automatic matching across arbitrary API refactors.

## Search and LLM version boundaries

VitePress local search is built into the theme and uses MiniSearch. Independent source/build sets provide a straightforward way to keep its indexed content version specific, but assembled result URLs still require testing. [Stable local search](https://vuejs.github.io/vitepress/v1/reference/default-theme-search#local-search).

Starlight's installed Pagefind integration indexes the current build output directory. Its search component explicitly sets `baseUrl` and `bundlePath` from `import.meta.env.BASE_URL`, with the search bundle under `pagefind/`. This provides stronger source evidence for separate per-prefix indexes than simply knowing Starlight includes Pagefind. Do not re-index the assembled all-version tree unless implementing explicit version filtering instead. [Search component source](https://github.com/withastro/starlight/blob/main/packages/starlight/src/components/Search.astro), [Starlight search documentation](https://starlight.astro.build/guides/site-search/).

**Design inference:** generate LLM output within each branch build, after that version's API pages are available. Its links must use the same public base as the human site. A top-level discovery file may list version-specific LLM files, but concatenating all API histories would violate the selected-version boundary unless deliberately requested. Plugin existence does not establish correct branch/base handling; those integrations require the separate content checks recorded in the [original report](docs-engine.md#evidence-required-when-adding-the-deferred-integrations).

## Maintenance comparison and historical compatibility

| Responsibility                                                                | VitePress                                                                                                     | Astro + Starlight                                                                                                         |
| ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Branch checkout, toolchain choice, artifact preservation, deployment registry | Project owned.                                                                                                | Project owned.                                                                                                            |
| Build manifest                                                                | HTML/page hook plus build-end writer.                                                                         | Generated-route hook; an explicit connection is needed for identities beyond route paths.                                 |
| Switcher and explained fallback                                               | Custom Vue component using public runtime APIs; preserve default theme.                                       | Astro component override plus browser logic; preserve default theme.                                                      |
| Source-path coupling already demonstrated                                     | External-source dependency aliases require upgrade verification.                                              | External loader, ordinary autogenerated-sidebar assumptions, and Markdown-link behavior require deliberate configuration. |
| Search isolation approach                                                     | Separate local index per build.                                                                               | Separate Pagefind directory per build; component explicitly uses build base.                                              |
| Historical compatibility                                                      | Each branch may retain its own engine/integration versions; the registry/manifest contract must outlive them. | The same, plus Astro/Starlight's evolving integration API must not be mistaken for one API shared by all branches.        |

Independent static builds allow old and new engine versions to coexist without rendering all historical Markdown through the newest engine. That benefit moves responsibility to reproducible old builds and a stable cross-version manifest/registry protocol. A pinned lockfile does not by itself guarantee future access to every tool/package or compatibility with future runners. Retaining verified artifacts avoids rebuilding unchanged history on every publication; rebuilding an old branch after a documentation fix still needs a working historical or deliberately migrated toolchain.

There is no measured code-size comparison for the proposed versioning work. Estimate maintenance by the interfaces and failure states above, then revisit the choice if a prototype requires source-tree copying, theme internals, broad route reconstruction, or a central builder that must emulate many historical configurations. Both candidates can plausibly stay within the accepted small-recipe direction, but that remains an integration result to demonstrate.

## Bounded acceptance for the later versioning slice

- Build two independent commits with different guide text and API signatures, one common page, one renamed page with an explicit mapping, and one page absent from the other version. Record the source revision in each manifest.
- Serve both beneath distinct prefixes, including one multisegment prefix. Verify direct deep links, guide/API links, images, search assets, and LLM links under those prefixes.
- Switch both ways, including from generated API pages. Confirm correct page matching, full destination runtime loading, explained landing fallback, and distinct behavior for unavailable/stale manifests. Exercise keyboard and narrow-screen use.
- Search for a term and symbol unique to each version and prove results never cross into the other version. Inspect the same distinction in LLM output.
- Add a third version and confirm old pages discover it under the selected registry policy. Republish one branch and confirm the other version's pages/assets/indexes remain available.
- Repeat after one engine/integration upgrade in only one branch. Check manifest schema compatibility and the actual amount of custom logic before accepting the maintenance burden.

These checks belong to future versioning and integration work. They do not add a selector, registry, TypeDoc pipeline, search setup, or publishing workflow to the minimal documentation workspace.
