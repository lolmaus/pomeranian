# Documentation engine research review

Reviewed 2026-09-22. Evidence under review: [initial research](docs-engine.md), [research issue #7](https://github.com/lolmaus/pomeranian/issues/7), and [engine decision #8](https://github.com/lolmaus/pomeranian/issues/8). This initial audit used documentation and source inspection; a subsequent [minimal runtime check](docs-engine-minimal-verification.md) supplies limited build/preview evidence separately.

The audit below records the gaps identified before the interview. The author's
[subsequent answers](docs-engine-requirements.md) settle publication scope,
Markdown readability, an E2E-only unpublished demo, English-only content, eventual local search, and the
requirement for future branch-based documentation versions. Questions in this
audit are historical where those answers have settled them.

The initial report establishes plausible routes to a static site, integrated TypeDoc, and LLM outputs. Its recommendation optimizes for initial setup size before several potentially decisive requirements are agreed. Fewer configuration files alone do not establish lower lifetime maintenance. Issue #7 constrained the comparison to these three engines; satisfying that scope does not establish an exhaustive market survey. Retain the shortlist, interview the author, and reassess against agreed requirements. Add candidates only if the requirements expose a poor fit across all three.

## Missing comparisons with verified evidence

| Concern | Verified evidence | Decision still needed |
| --- | --- | --- |
| Search ownership | VitePress stable includes configurable browser-side full-text search. Starlight includes Pagefind by default. Docusaurus gives official support to Algolia; its local search alternatives are community maintained. [VitePress](https://vuejs.github.io/vitepress/v1/reference/default-theme-search), [Starlight](https://starlight.astro.build/guides/site-search/), [Docusaurus](https://docusaurus.io/docs/search) | Must guides and API reference be searchable from a self-contained static build, without a hosted search account? Should search cover symbol names and inherited members? |
| React examples | Docusaurus renders React in MDX. Starlight also officially supports React components through Astro integration and MDX; React is not a Docusaurus-only advantage. VitePress's documented native component model is Vue. [Docusaurus](https://docusaurus.io/docs/markdown-features/react), [Starlight](https://starlight.astro.build/components/using-components/), [Astro React](https://docs.astro.build/en/guides/integrations-guide/react/), [VitePress](https://vuejs.github.io/vitepress/v1/guide/using-vue) | Link to the separate demo, embed it, import interactive components into guides, or provide an editable playground? Each implies different integration work. |
| Markdown portability | Docusaurus applies MDX rules by default, including stricter handling of braces, angle brackets, HTML, and indented code; its CommonMark mode remains experimental. Starlight components require MDX or Markdoc. VitePress Markdown can use Vue expressions/components. [Docusaurus syntax](https://docusaurus.io/docs/markdown-features/react), [Starlight components](https://starlight.astro.build/components/using-components/), [VitePress syntax](https://vuejs.github.io/vitepress/v1/guide/using-vue) | Must pages remain comfortably readable on GitHub and in an editor? Is ordinary Markdown the baseline with occasional engine-specific pages, or are rich components routine? File extension alone does not settle portability. |
| Versioned documentation | Docusaurus has a documented snapshot, routing, and version-switching workflow, which copies current content into versioned directories. Starlight lists versioning as a community plugin. This audit has not established a comparable VitePress workflow. [Docusaurus](https://docusaurus.io/docs/versioning), [Starlight plugin catalog](https://starlight.astro.build/resources/plugins/) | Latest documentation only, or concurrently maintained release lines with guides and API reference aligned? A future need can influence today's engine without moving release planning forward. |
| Languages | All candidates document internationalization. The VitePress source here is its current documentation, not a tested stable-version configuration. [VitePress](https://vitepress.dev/guide/i18n), [Starlight](https://starlight.astro.build/guides/i18n/), [Docusaurus](https://docusaurus.io/docs/i18n/introduction) | English only, or translations with fallback, translated navigation/search, and a maintenance owner? |
| Navigation authoring | VitePress documents explicit sidebar configuration; Starlight and Docusaurus document directory-generated sidebar entries with customization. This is a workflow comparison, not evidence that automatic navigation is impossible elsewhere. [VitePress](https://vuejs.github.io/vitepress/v1/reference/default-theme-sidebar), [Starlight](https://starlight.astro.build/guides/sidebar/), [Docusaurus](https://docusaurus.io/docs/sidebar/autogenerated) | Should a new Markdown file appear automatically, or must the author deliberately place it in a curated learning sequence? |

Pagefind builds a static search bundle from generated HTML and has no search-server component. This supports self-contained hosting; it does not establish that an unvisited website works without internet, that every browser asset is cached, or that opening files through `file://` works. Distinguish local static serving, offline browsing after caching, and network-free rebuilding. Verify whichever behavior is actually required. [Pagefind lifecycle](https://pagefind.app/docs/)

## Integration quality is still unproven

The report correctly says that plugin existence does not prove compatibility. The three TypeDoc routes have different orchestration: VitePress's guide runs TypeDoc first and imports a generated sidebar; Starlight generates pages through its plugin; Docusaurus can generate during start/build or through a separate command. These are documented capabilities, not proof of Pomeranian's final combined pipeline. [VitePress setup](https://typedoc-plugin-markdown.org/plugins/vitepress/quick-start), [Starlight setup](https://starlight-typedoc.vercel.app/getting-started/), [Docusaurus setup](https://typedoc-plugin-markdown.org/plugins/docusaurus/quick-start)

The LLM plugins are also not interchangeable checkboxes:

- `starlight-llms-txt` requires `rawContent: true` for content containing framework components such as React, Vue, or Svelte. Its `exclude` option concerns the small bundle, so it must not be mistaken for site-wide publication exclusion. [Configuration](https://delucis.github.io/starlight-llms-txt/configuration/)
- `docusaurus-plugin-llms` documents production-build output, optional per-page Markdown, and removal of HTML/import statements. Whether useful content supplied by components survives remains a content-specific check. [Maintainer README](https://raw.githubusercontent.com/rachfop/docusaurus-plugin-llms/main/README.md)
- `vitepress-plugin-llms` documents per-page Markdown and full/index outputs. That establishes availability, not lossless conversion of every Vue-enhanced page or generated reference. [Maintainer README](https://github.com/okineadev/vitepress-plugin-llms)

When adding the relevant integrations, use a guide and a small generated API section covering inheritance, generics, method overloads, cross-package links, and guide-to-symbol links. Verify that search finds both authored and generated content, and that LLM output preserves signatures, examples, meaningful prose, and links. These are future acceptance criteria, not prerequisites to the author's minimal initial documentation slice. TypeDoc can warn on unresolved links and referenced unexported types, and can make warnings fatal; it does not replace checking final engine routes. [TypeDoc validation](https://typedoc.org/documents/Options.Validation.html)

This need not become a complete integration at bootstrap. If a required combination could change the engine decision, test that narrow combination before choosing; otherwise record its acceptance criteria for the deferred roadmap item. No prototype or package installation occurred during this review.

## Other gaps to settle proportionately

- **Root content location:** the requested `docs/` location is a separate requirement from engine choice. Existing research, agent guidance, and verification files already occupy that directory. Decide which files belong on the public site and prove that unrelated material is absent from routes, search, LLM bundles, and copied assets. External content paths also need development watching, asset resolution, generated-output ownership, and workspace-cache validation. Candidate-specific path feasibility is a separate investigation.
- **Maintenance:** agree tolerance for community plugins and custom glue, then verify the selected engine/integration peer versions, licenses, and upgrade route together. No comparative dependency count, support lifetime, performance benchmark, or maintenance-health analysis has been performed. Avoid inferring reliability from starter size or framework familiarity alone.
- **Reader experience:** examine the default themes against actual long signatures, nested API navigation, keyboard-only use, focus behavior, contrast, narrow screens, and code copying. This review makes no accessibility-conformance claim or theme ranking. Desired presentation can be settled using representative pages without committing to custom styling.
- **Examples and diagrams:** establish whether copied code fences suffice or whether executable snippet imports, type-checked examples, hover types, Mermaid, tabs, or playgrounds are required. Investigate only the features the author values; these can affect authoring portability and LLM conversion.
- **Build quality:** specify treatment of broken links, missing assets, stale generated pages, clean-checkout reproducibility, and builds launched from the workspace root. These are acceptance questions, not verified engine limitations.

## Findings that remain accurate

The original version cautions survive this review: the VitePress main site currently identifies an alpha line and links separately to stable 1.6.4; Starlight's getting-started page still describes it as beta; Docusaurus still calls its CommonMark mode experimental. These are specific documentation facts, not an overall maturity ranking. Select and lock actual compatible package versions at bootstrap. [VitePress current docs](https://vitepress.dev/reference/default-theme-search), [Starlight update guidance](https://starlight.astro.build/getting-started/), [Docusaurus syntax guidance](https://docusaurus.io/docs/markdown-features/react)

## Assessment after the requirements interview

The author has answered Q1–Q11; see the [consolidated requirements](docs-engine-requirements.md).
No further preference currently prevents a research recommendation. Basic
Markdown and a default theme are sufficient; translations and embedded React
examples are not requirements. Selected sections, local guide/API search, and
future coherent branch-based versions with page-preserving switching are required.

**The author approved VitePress as the candidate to validate**, with published content
in `docs/site/` and application configuration in `apps/docs/`. This preference
follows the native external content setting, built-in local search, and suitable
Markdown workflow, not simply starter size. The extra directory level, which the
author permits when useful, provides a clear publication boundary. The proposed
branch switcher uses extension points; it is not a built-in or tested capability.

Docusaurus remains a viable alternative, with additional integration for local
search and branch-derived content if using its native snapshot switcher.
Starlight introduces more questions around the external content tree without a
requirement here that clearly compensates for that cost. These are reasoned
tradeoffs from the cited evidence, not performance or maintenance measurements.

The author confirmed the shared understanding and corrected the demo's role:
it is only an E2E fixture, has no public deployment or documentation links, and
contains no Playwright app logic beyond `data-test` hooks for external tests.

The [validation brief](docs-engine-requirements.md#evidence-by-implementation-stage)
now separates a minimal root-content compatibility check from future integration
acceptance. The initial implementation only needs to support documentation for
the next vertical coding slice. Search, API generation, LLM output, version
switching, refinement, and deployment remain later work. No full combined
pipeline must be built before that minimal slice.

The [comparative prototypes](docs-engine-prototype-comparison.md) now establish
basic external-content build/preview, images, selected publication, explicit
navigation, and server-observed file updates for both VitePress and Starlight.
VitePress needs app-local Vue and three resolver aliases in the tested pnpm
layout; the amended configuration removes the original cold optimizer warnings.
Starlight needs an external Astro collection and Sharp for the fixture image;
relative `.md` links fail and its ordinary automatic sidebar assumes the standard
content path. Explicit sidebar links work. These are bounded compatibility
results, not complete browser behavior or deferred integration proof. Retain
their exact setup and limits in the minimal specification.
