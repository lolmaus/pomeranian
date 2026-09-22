# Documentation built from version branches

> Final decision (2026-09-22): the author selected VitePress with root
> `docs/site/` content and removed per-branch documentation versioning from scope.
> The comparison below preserves the evidence considered before that decision.
> Branch-version requirements, proposals, and acceptance checks are superseded,
> not deferred work. API/search and LLM findings remain relevant to the single
> current site. See the [current decision and scope](docs-engine-requirements.md).

Research date: 2026-09-22. Follow-up to [engine research](docs-engine.md) and
[external content location research](docs-engine-content-location.md), supporting
[decision #8](https://github.com/lolmaus/pomeranian/issues/8).

The author's requirement is that future documentation versions come from Git
branches, with a convenient version switcher. The minimum workspace serves only
the current documentation, with no switcher. Other settled requirements are
selected published sections, shallow root `docs/` authoring, GitHub-readable core
Markdown, English only, and eventual local search covering guides and API pages
without a hosted search account. The React demo is an E2E fixture only, with no
public deployment or documentation links; its app code has no Playwright logic
beyond the `data-test` attributes supporting external tests.

The author has now confirmed coherent branch-derived guides/API/search/LLM
sets, same-page switching with an explained landing-page fallback, search
limited to the selected version, and acceptance of a small maintained publishing
recipe and switcher. See [the requirements record](docs-engine-requirements.md).
These requirements are settled; the implementation recipe below is still a
proposal.

These are future capabilities. The author has explicitly limited the first docs
implementation to basic authoring and local development/build/preview for the
next vertical coding slice. This investigation does not make versioning or its
related integrations bootstrap prerequisites.

This investigation checks documented building blocks and published plugin
behavior. No multi-version deployment, installation, or runtime test was
performed. Proposed assembly and navigation behavior below are design inferences,
not established engine features or approved implementation.

## Distinguish branch builds from content snapshots

A site can offer a version selector while storing every version as copied folders
in one branch. That does not meet the requested source model by itself. Conversely,
independent branches can each produce a complete static site, with the outputs
assembled under distinct URL prefixes. The latter keeps code, authored guides,
and generated API reference together at the selected Git revision.

GitHub's checkout action accepts a branch, tag, or commit through `ref`. Its Pages
workflow accepts a built static artifact. These supply primitives for building
several revisions and publishing their combined output; they do not create the
version registry, navigation, or artifact-assembly policy automatically.
[Checkout action](https://github.com/actions/checkout),
[Pages custom workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

## VitePress

VitePress supports static output deployed below a configured `base`, and its
default theme supports dropdown navigation links. A concrete candidate is to
build branch A for `/v1/` and branch B for `/v2/`, then give each build a version
dropdown linking to those site roots. This is a small project-owned CI/config
recipe using documented features; no core multi-branch orchestrator was
established. Absolute destination URLs avoid accidentally prepending the current
version's base to another version's link.
[Stable deployment guide](https://vuejs.github.io/vitepress/v1/guide/deploy),
[stable navigation](https://vuejs.github.io/vitepress/v1/reference/default-theme-nav).

A static dropdown can always send readers to the selected version's homepage.
Preserving the current page, detecting its absence in the destination, handling
renames, and preserving valid heading fragments require additional information
and navigation logic. The stable theme supports custom nav components. Current
VitePress documentation also exposes function-valued links receiving page data,
but version availability must be checked before relying on that API; neither
mechanism supplies a cross-build page registry automatically.
[Stable custom navigation](https://vuejs.github.io/vitepress/v1/reference/default-theme-nav#custom-components),
[current navigation API](https://vitepress.dev/reference/default-theme-nav).

Further inspection of stable 1.6.4 establishes a bounded candidate mechanism:
`transformHtml` receives each final HTML path and page data, and `buildEnd` can
write a collected page manifest. A custom navigation component can use `useData`
and `useRoute` to identify the current page and inspect the target version's
manifest. Exact relative routes are straightforward matches; explicit stable
frontmatter IDs can support intentional renames. These APIs do not infer that
arbitrarily renamed guides or API symbols are semantically equivalent.
[Build hooks](https://vuejs.github.io/vitepress/v1/reference/site-config#build-hooks),
[pinned rendering source](https://github.com/vuejs/vitepress/blob/v1.6.4/src/node/build/render.ts),
[runtime API](https://vuejs.github.io/vitepress/v1/reference/runtime-api).

Fragment preservation is a separate detail: page-header collection is disabled
by default in the pinned source; enabling `markdown.headers` collects heading
levels 2–6 by default. Generated API anchors may need additional inspection.
Do not confuse an unavailable manifest with a confirmed missing page. Later
validation must cover missing/renamed pages, duplicate IDs, stale manifests,
changed anchors, and navigation between independently built bundles. This is
source evidence of an implementation route, not a tested size or reliability
claim. [Pinned Markdown implementation](https://github.com/vuejs/vitepress/blob/v1.6.4/src/node/markdown/markdown.ts).

The reviewed community `@viteplus/versions` plugin manages a current `src/` tree
plus frozen version folders under `archive/`. Its documented version switcher
therefore establishes folder-based version support, not independent branch
builds. Adopting it would require a different assembly design or relaxation of
the source requirement; its existence alone does not solve this task.
[Plugin maintainer documentation](https://github.com/viteplus/versions).

VitePress's built-in local MiniSearch indexes site content in the browser. With
independent builds, each build can contain only its version's guides and generated
API pages, giving a natural per-version search boundary. This is an inference to
validate with deployed indexes and result URLs, especially after assembly beneath
version prefixes. No hosted search account is needed for the documented local
provider.
[Stable local search](https://vuejs.github.io/vitepress/v1/reference/default-theme-search#local-search).

## Astro Starlight

Astro supports static deployment beneath `base`; Starlight supports replacing
theme components. Independent branch builds plus a project-owned header/version
selector are therefore plausible. This is another CI/theme recipe, not a verified
branch-versioning integration. The external root-content limitations recorded in
the [location addendum](docs-engine-content-location.md) still apply.
[Astro base configuration](https://docs.astro.build/en/reference/configuration-reference/#base),
[Starlight component overrides](https://starlight.astro.build/guides/overriding-components/).

The community `starlight-versions` plugin explicitly describes its strategy as
folder-based: it archives current pages, assets, and sidebar configuration inside
the same content tree. Its documentation discusses branch-based versioning as a
different strategy. The plugin has `same-page` and `root` switching modes, but
that does not establish the same semantics between independently built branches.
The reviewed configuration docs do not establish missing-destination-page
fallback behavior. Its setup also describes the plugin as early development.
[Versioning model](https://starlight-versions.vercel.app/guides/about-versioning/),
[redirect modes](https://starlight-versions.vercel.app/configuration/#redirect-strategies),
[plugin status](https://starlight-versions.vercel.app/getting-started/).

Starlight includes local Pagefind full-text search by default. As with VitePress,
separate complete branch builds could keep each index limited to that version.
Assembling already-indexed outputs should preserve their separate index paths;
running a new unrestricted index over the assembled tree could change that
boundary. These are proposed deployment checks, not tested guarantees.
[Starlight search](https://starlight.astro.build/guides/site-search/).

## Docusaurus

Docusaurus's native versioning command copies the current docs into
`versioned_docs/version-<version>`, creates versioned sidebars, and updates
`versions.json` in one checkout. Its built-in version dropdown preserves the
current document when its document ID is stable across versions. This is useful
native snapshot/navigation support, but it does not automatically discover or
check out Git branches. Extra dropdown links can point to independently built
sites without supplying automatic page correspondence.
[Core versioning](https://docusaurus.io/docs/versioning),
[version dropdown](https://docusaurus.io/docs/api/themes/configuration#navbar-docs-version-dropdown).

Two inferred branch recipes remain possible: build each branch independently
beneath its own `baseUrl`, then link the builds; or collect each branch's guides
and API output into disposable versioned directories and build one Docusaurus
site. The first needs cross-build navigation logic. The second can use the core
dropdown but requires all collected content to work with the chosen host engine
and configuration. Neither is a turnkey core branch workflow.

For local search, the reviewed community `@easyops-cn/docusaurus-search-local`
plugin provides offline indexing, configurable docs paths, preferred-version
integration, and path-scoped indexes. The docs-only route and external source
directory need matching configuration. Version filtering and API symbol results
remain acceptance tests; the plugin is an extra maintained dependency rather
than Docusaurus's built-in search backend.
[Local-search maintainer documentation](https://github.com/easyops-cn/docusaurus-search-local).

The TypeDoc integration supports separate instances with distinct entry points,
configuration, and output. This supplies a possible aggregation building block,
but each version's API generation must read that version's code. Generating all
historical API pages from current sources would violate version integrity.
[TypeDoc multi-instance guide](https://typedoc-plugin-markdown.org/plugins/docusaurus/guides/multi-instance).

## Version integrity across guides, API, search, and LLM output

The following is an engine-independent proposed recipe:

1. Maintain an explicit public version registry mapping label, source branch,
   resolved commit, and destination URL. Choose what the unversioned root means.
2. Check out each selected revision and build its guides and eventual TypeDoc
   reference from the same revision. Select that branch's runtime, lockfile, and
   configuration, or deliberately maintain a compatible central builder.
3. Generate local search and eventual LLM files within that build's version
   boundary. Resolve links against its actual canonical URL/base.
4. Assemble all selected outputs into one complete site artifact. A deployment
   that contains only one branch's output must not replace the other published
   versions accidentally.
5. Feed the same version registry to every switcher. Publishing a new version
   must update the choices shown in old versions too, through rebuilding or an
   explicitly designed shared registry.

The [existing integration research](docs-engine.md#evidence-required-when-adding-the-deferred-integrations)
establishes TypeDoc and LLM generation routes, not cross-version correctness.
Acceptance must verify a guide links to its own API version, search results stay
in that version, and `llms.txt`/`llms-full.txt` link to and contain the intended
version. No assumption should silently combine incompatible API generations in
one LLM bundle. A later top-level LLM discovery file could link to version-specific
files if that is the desired discovery policy.

## Remaining preference and verification questions

- The author requires same-page switching with an explained fallback. Settle how
  correspondence is identified when a guide is renamed or an API symbol moves;
  do not silently promise semantic matching across arbitrary refactors.
- Are version branches maintained release lines such as `v1`/`v2`, or must every
  historical release remain independently accessible? How should current
  development documentation differ from the latest released documentation?
- Should historical docs follow branch fixes continuously, or become immutable
  snapshots at selected commits? A branch is movable even when its public URL is
  called a version.
- Which source owns the version registry, and how are old builds updated when a
  new version becomes available?

Before delivering multi-version support, prove two independent revisions with a
page present in both and another present in only one. Check switcher behavior,
base paths, deep links, images, search isolation, API generation, LLM links, and a
subsequent deployment that preserves both versions. These checks can remain a
later slice; the minimum workspace does not need a placeholder version system.
