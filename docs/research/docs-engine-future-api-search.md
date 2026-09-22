# Future generated API and local search feasibility

> Final decision (2026-09-22): the author selected VitePress with root
> `docs/site/` content and removed per-branch documentation versioning from scope.
> The comparison below preserves the evidence considered before that decision.
> Branch-version requirements, proposals, and acceptance checks are superseded,
> not deferred work. API/search and LLM findings remain relevant to the single
> current site. See the [current decision and scope](docs-engine-requirements.md).

Researched 2026-09-22 for [engine decision #8](https://github.com/lolmaus/pomeranian/issues/8),
against the [agreed requirements](docs-engine-requirements.md) and
[isolated prototype comparison](docs-engine-prototype-comparison.md).
This is documentation and source inspection, not an integration prototype.
No packages were installed or executed for this investigation. Published package
archives were downloaded into `/tmp` for read-only source inspection.

## Assessment

**Both engines have credible paths to generated TypeScript API documentation and
local guide/API search. VitePress has the more direct content-routing fit.**
Starlight's default TypeDoc plugin does not feed the prototype's external-only
content loader, but native Astro loader configuration can plausibly reconcile
the two locations without copying authored documentation or building a custom
loader. Neither complete pipeline has runtime verification.

These findings concern future slices. They do not add TypeDoc, search, or
versioning to the minimal initial docs package.

Evidence labels below mean **documented** by maintainers, **source-inspected** in
published or pinned source, **inferred** composition of those mechanisms, or
**unverified** behavior requiring a later integration check.

## Compatible package surface

Published metadata observed on the research date:

| Package                 | Version | Relevant declared compatibility                                                               |
| ----------------------- | ------- | --------------------------------------------------------------------------------------------- |
| TypeDoc                 | 0.28.20 | Node >=18; TypeScript 5.0–5.9 or 6.0 release lines.                                           |
| typedoc-plugin-markdown | 4.13.1  | TypeDoc 0.28.x; Node >=18.                                                                    |
| typedoc-vitepress-theme | 1.1.4   | TypeDoc 0.28.x; Markdown plugin >=4.11.0; no VitePress peer range.                            |
| starlight-typedoc       | 0.23.1  | Astro >=6.0.0; Starlight >=0.39.0; TypeDoc >=0.28.0; Markdown plugin >=4.6.0; Node >=22.12.0. |

Sources: published manifests for [TypeDoc](https://unpkg.com/typedoc@0.28.20/package.json),
[Markdown plugin](https://unpkg.com/typedoc-plugin-markdown@4.13.1/package.json),
[VitePress theme](https://unpkg.com/typedoc-vitepress-theme@1.1.4/package.json), and
[Starlight plugin](https://unpkg.com/starlight-typedoc@0.23.1/package.json).
Versions were verified against npm registry metadata; source archives were
inspected for both engine plugins. These four versions have mutually compatible
declared ranges. The Starlight plugin also admits the prototype's Astro 7.3.3,
Starlight 0.42.2, and Node 24.21.0. That is eligibility, not proof of execution.
The missing VitePress peer declaration likewise does not prove compatibility
with the prototype's VitePress 1.6.4. Pin and verify an actual set when implementing.

## Shared API capability and limits

**Documented:** TypeDoc's own examples demonstrate generic functions/types,
overloads, subclasses, and inherited members. Both integration paths use TypeDoc
and its Markdown renderer, so the engine choice provides no evidence of better
TypeScript model accuracy. Complex Pomeranian signatures still need representative
review. [TypeDoc examples](https://typedoc.org/example/)

**Documented:** `entryPointStrategy: "packages"` converts separate package
projects and merges their models before rendering; conversion options belong in
each package or `packageOptions`. This is a credible cross-package-reference
path. Use real public entry points: this repository prohibits `index.ts` barrels,
so the generator's directory/index defaults are not an appropriate project
configuration. [TypeDoc input options](https://typedoc.org/documents/Options.Input.html),
[repository conventions used by the prototype](https://github.com/lolmaus/pomeranian/blob/d861db5/docs/agents/development.md)

Cross-package links still depend on exporting and documenting their targets.
TypeDoc can report unresolved `@link` references and referenced-but-unexported
types, and can treat validation warnings as errors. These checks help but do not
replace checking final site URLs and anchors after engine rendering.
[TypeDoc validation](https://typedoc.org/documents/Options.Validation.html)

Markdown rendering choices matter independently of engine. `useCodeBlocks: true`
improves signature presentation but removes links inside those signatures;
`expandParameters` controls whether constraints/defaults appear in the signature,
and `parametersFormat: "none"` omits parameter sections. Preserve sufficient type
detail and links rather than judging only appearance.
[Markdown display options](https://typedoc-plugin-markdown.org/docs/options/display)

**Inferred:** guides can use ordinary Markdown links to generated API routes and
member anchors. Neither integration establishes automatic TypeDoc `{@link ...}`
resolution inside arbitrary authored guide files. Keep generated routes stable
or validate those guide links when public names/output settings change.

## VitePress: generate into its existing content tree

**Documented:** the VitePress integration renders Markdown and generates
`typedoc-sidebar.json`; the docs show importing that sidebar into VitePress.
Generation must precede loading a config that imports the generated file.
[VitePress integration quick start](https://typedoc-plugin-markdown.org/plugins/vitepress/quick-start)

**Source-inspected:** theme 1.1.4 calculates sidebar prefixes using
`relative(docsRoot, out)` and writes the sidebar beside the generated Markdown.
For this repository, a concrete proposed arrangement is `out = docs/site/api`
and `docsRoot = docs/site`, resolved from the repository root. Despite the option
description saying “project root,” setting it to `apps/docs` would calculate an
unwanted `../../docs/site/api` prefix. This is a source-derived configuration
recommendation, not a tested invocation.
[Theme implementation](https://unpkg.com/typedoc-vitepress-theme@1.1.4/dist/index.js),
[option documentation](https://typedoc-plugin-markdown.org/plugins/vitepress/options)

The generated sidebar uses site-root-relative links and retains Markdown page
extensions except for index pages. VitePress performs the subsequent site/base
handling. Existing prototype evidence covers ordinary `.md` links, not these
generated anchors or multi-package navigation.
[Published sidebar generator](https://unpkg.com/typedoc-vitepress-theme@1.1.4/dist/sidebars/sidebar.vitepress.js)

**Inferred:** a prebuild generation command, generated sidebar import, and
generated-output cleanup/exclusion from maintained inputs constitute relatively
small integration work. They reuse the tested external `srcDir` boundary.
Generation/watch ordering and the existing resolver aliases must be checked with
the expanded dependency set.

## Starlight: reconcile authored and generated locations

**Source-inspected:** plugin 0.23.1 writes to
`<astro srcDir>/content/docs/<output>`, defaulting to `api`. It forces that Markdown
output path, adds Starlight frontmatter, and rewrites reflection links using the
site base and output directory. Setting the nested TypeDoc `out` option does not
override this forced output. The prototype's glob rooted only at `docs/site`
therefore omits these generated files.
[Published generator](https://unpkg.com/starlight-typedoc@0.23.1/libs/typedoc.ts)

The plugin also supplies API sidebar groups using `autogenerate.directory` and
some explicit reference links. Its output option participates in both disk and
URL/sidebar paths; using `../../../...` to escape into root docs is not an
established safe configuration.
[Published sidebar/URL helpers](https://unpkg.com/starlight-typedoc@0.23.1/libs/starlight.ts),
[plugin configuration](https://starlight-typedoc.vercel.app/configuration/)

**Inferred, concrete native-loader path:** keep authored Markdown in root
`docs/site/`, keep generated API in the plugin's app-local default, and use one
Astro `glob()` with repository-root `base` and an explicit two-pattern allowlist:
`docs/site/**/*.md` plus `apps/docs/src/content/docs/api/**/*.md`. Supply
`generateId` to remove each source prefix and produce the intended guide/API
routes. Preserve frontmatter `slug` overrides and the slugger semantics used by
the plugin, and detect conflicting IDs. Astro documents pattern arrays and
custom IDs; its 7.3.3 implementation preserves actual app-relative `filePath`
independently of the selected glob base.
[Loader API](https://docs.astro.build/en/reference/content-loader-reference/#glob-loader),
[published Astro loader](https://unpkg.com/astro@7.3.3/dist/content/loaders/glob.js)

This matters because Starlight 0.42.2 automatic navigation matches physical
`filePath` relative to its conventional docs directory. Generated API files
retained in that directory should satisfy the plugin's automatic API groups,
even while external authored guides continue using explicit sidebar entries.
Changing IDs alone does not fix automatic navigation for external guides.
This composition is plausible small configuration/ID-normalization glue, not
evidence that a new custom loader subsystem is required.
[Published navigation implementation](https://unpkg.com/@astrojs/starlight@0.42.2/dist/utils/navigation.js)

**Unverified:** initial generation before collection synchronization, repeat
builds without stale symbols, ID/anchor agreement, and watch behavior across both
trees. The native glob implements add/change/unlink handling, but that does not
prove combined TypeDoc regeneration and sidebar updates. A repository-root glob
also broadens the watched base even though matching content remains allowlisted.
[Astro loader source](https://unpkg.com/astro@7.3.3/dist/content/loaders/glob.js)

A secondary route is standalone TypeDoc Markdown plus generated title frontmatter
inside `docs/site/api`, then explicit/generated canonical sidebar links. The
frontmatter plugin documents configurable title generation. This avoids the
Starlight plugin's fixed output tree but assumes responsibility for its routing
and sidebar conveniences; it is not presently the smaller demonstrated choice.
[Frontmatter options](https://typedoc-plugin-markdown.org/plugins/frontmatter/options)

The Starlight theme converts deprecation/release-stage tags to Starlight asides.
Default generated content is inside the conventional processed directory;
external Markdown should be included through `markdown.processedDirs` where
those transformations are needed. Astro 7 also requires an explicit Unified
processor when adding remark/rehype plugins. Do not assume an older Markdown
rewrite recipe runs under its default processor.
[TypeDoc theme source](https://unpkg.com/starlight-typedoc@0.23.1/libs/theme.ts),
[Starlight processed directories](https://starlight.astro.build/reference/configuration/#processeddirs),
[Astro Markdown processors](https://docs.astro.build/en/guides/markdown-content/#markdown-processors)

## Local search and version isolation

**Documented:** VitePress offers built-in local MiniSearch; Starlight includes
Pagefind by default. Both can operate without a hosted search account.
[VitePress search](https://vuejs.github.io/vitepress/v1/reference/default-theme-search),
[Starlight search](https://starlight.astro.build/guides/site-search/)

**Source-inspected:** VitePress 1.6.4 indexes `config.pages` after rendering each
Markdown file, extracts heading sections and text, and prefixes result IDs with
`site.base`. Generated API pages in `srcDir` before page discovery therefore have
a credible path into the same index as guides. This is Markdown-rendered content,
not arbitrary client-rendered components. Its default section splitter also
discards material before the first linked heading, so retain meaningful headings.
[Pinned local-search implementation](https://raw.githubusercontent.com/vuejs/vitepress/v1.6.4/src/node/plugins/localSearchPlugin.ts)

Starlight 0.42.2 indexes the build's HTML output directory and writes its Pagefind
bundle beneath that output. Its search component sets both result `baseUrl` and
`bundlePath` from Astro's `BASE_URL`. Generated API pages must actually enter the
docs collection and render to participate; merely generating source files is
insufficient.
[Published Pagefind integration](https://unpkg.com/@astrojs/starlight@0.42.2/dist/integrations/pagefind.js),
[published search component](https://unpkg.com/@astrojs/starlight@0.42.2/dist/components/Search.astro)

**Inferred:** independent branch builds with distinct bases and output directories
give each version its own guide/API index in either engine. Index each build
before aggregating deployment directories; do not run one whole-site index over
all versions. Prefix support is evidence of feasibility, not verified deployment
or browser switching. Starlight's search component skips initialization in dev,
so evaluate actual Pagefind queries against a production build/preview.

Neither search system is a TypeScript symbol resolver. Full symbol names, partial
camelCase names, overload headings, punctuation, and inherited members need
relevance checks; “local full-text search exists” does not establish those results.

## Bounded checks when these slices are implemented

1. Generate two public package entry points containing one generic inherited
   member and one overload set; inspect retained types and cross-package links.
2. Follow guide-to-symbol, sidebar, and member-anchor links in production output,
   including a non-root version base. Regenerate after removing a public symbol
   and verify it disappears from pages, navigation, and search.
3. Search a distinctive guide phrase and API symbol; check useful partial-name
   results and that an API present only in another branch is absent.
4. For Starlight, verify the combined allowlist/ID mapping and generation order;
   for VitePress, verify generated-sidebar import order and expanded dependency
   resolution. Review the same generated pages in the eventual LLM pipeline.

No finding establishes an API/search blocker for either engine. The evidence
supports retaining VitePress's simpler content integration preference while
treating Starlight as feasible with a specific, bounded additional configuration
path. The combined integrations remain future acceptance work.
