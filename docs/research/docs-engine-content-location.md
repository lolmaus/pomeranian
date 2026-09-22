# Documentation source location research

Research date: 2026-09-22. Addendum to [the engine comparison](docs-engine.md) for
[research issue #7](https://github.com/lolmaus/pomeranian/issues/7) and
[decision issue #8](https://github.com/lolmaus/pomeranian/issues/8).

The author proposes keeping authored Markdown under repository-root `docs/` while
the documentation application remains a workspace package at `apps/docs/`.
Engine-native content conventions should remain intact. This report investigates
that proposal and supplies evidence for the subsequent author decision.

Interview update: the author has since agreed to publish only selected sections
and prefers direct `docs/guide/…` paths while accepting one shallow site subtree
if it materially simplifies maintenance. See the [requirements record](docs-engine-requirements.md)
for the settled answers. The author has now confirmed `docs/site/` as the
content boundary, with VitePress as the candidate for minimal validation.

Evidence is documentation and source inspection. No candidate or plugin was
installed, built, or run in this checkout. VitePress core source below is pinned
to `v1.6.4`; other source links follow their repositories' current `main` branches
and must be checked against the versions eventually selected.

A subsequent [minimal runtime check](docs-engine-minimal-verification.md) confirms
the basic VitePress layout can build and serve, but also finds an extra cost:
under pnpm, plain `srcDir` fails to resolve a generated `vue/server-renderer`
import from external Markdown. An explicit app-local Vue dependency and alias
fixed the production build. The [comparative follow-up](docs-engine-prototype-comparison.md)
then removed the cold development-optimizer warnings with two additional aliases.
The source-level support described below must be read with that observed resolver
requirement.

The same follow-up proves that Astro's external `glob()` plus Starlight's schema
can build and watch this basic content without copying or symlinks. It also
observes fixed-path assumptions in automatic sidebar generation; explicit
navigation works. Relative `.md` file links are not rewritten and return 404.
The Starlight discussion below describes the earlier source investigation;
the runtime report narrows those uncertainties without claiming that all
integrations support the replacement loader.

## Native support and its limits

| Candidate | Configuration with `apps/docs/` as application root | Evidence and limitation |
| --- | --- | --- |
| VitePress | `srcDir: '../../docs'` in `apps/docs/.vitepress/config.mts` | `srcDir` is resolved relative to the VitePress project root. Core resolves it with `path.resolve`, so parent traversal is supported by the inspected implementation. Configuration, theme, output, and cache remain under the application root by default. No content copying or symlink is required by this arrangement. [Stable configuration](https://vuejs.github.io/vitepress/v1/reference/site-config#srcdir), [v1.6.4 resolution](https://github.com/vuejs/vitepress/blob/v1.6.4/src/node/config.ts). |
| Docusaurus | `docs: { path: '../../docs' }` in its preset configuration | The docs plugin exposes the content path separately from the site directory, with `include` and `exclude` patterns relative to that content path. The site's configuration and sidebar can remain in the package. This is a native configuration path, without a content-copy step. [Docs plugin configuration](https://docusaurus.io/docs/api/plugins/@docusaurus/plugin-content-docs). |
| Astro Starlight | Astro's `glob({ base: '../../docs', pattern: '**/*.md' })` could replace `docsLoader()` in the `docs` collection | Astro explicitly supports loading files anywhere on the filesystem, but Starlight's loader exposes only `generateId` and uses the fixed `src/content/docs` convention. Its source explicitly retains that convention for Git dates and Markdown language detection. An external Astro collection is therefore an integration candidate, not established drop-in Starlight support. [Astro loader API](https://docs.astro.build/en/reference/content-loader-reference/#glob-loader), [Starlight loader](https://github.com/withastro/starlight/blob/main/packages/starlight/loaders.ts), [Starlight collection assumptions](https://github.com/withastro/starlight/blob/main/packages/starlight/utils/collection.ts). |

**Inference:** the proposed separation is ordinary configuration for VitePress and
Docusaurus. It raises additional compatibility questions for Starlight. Changing
Astro's `srcDir` moves the parent of its conventional `content/docs` tree; it does
not independently rename that tree to root `docs/`. Copying or symlinking content
would be a separate architectural choice, not evidence that Starlight natively
meets this requirement.

## What belongs in the published content tree

The repository already has `docs/agents/`, `docs/research/`, and
`docs/verification/`. Its [domain guidance](../agents/domain.md) reserves
`docs/adr/` for decisions. These serve authors; developer-facing guides do not
exist yet. Moving the source root does not decide which of these should appear on
the website.

VitePress scans Markdown sources and supplies `srcExclude` to omit selected
patterns; excluding a page from sidebar navigation alone is not a source
exclusion. Docusaurus offers both inclusion and exclusion patterns. A provisional
VitePress exclusion list could cover `agents/**`, `research/**`,
`verification/**`, and `adr/**`. The implementation must uphold the author's
selected-sections policy as new folders are added, not merely exclude today's
known author material. [VitePress exclusions](https://vuejs.github.io/vitepress/v1/reference/site-config#srcexclude),
[Docusaurus source patterns](https://docusaurus.io/docs/api/plugins/@docusaurus/plugin-content-docs).

The investigation considered two layouts: published pages directly under `docs/`, with
an explicit rule for author material, or a dedicated shallow subtree such as
`docs/site/`. The latter makes publication membership easier to see; the former
keeps authoring paths shorter. This is a repository organization tradeoff, not an
engine capability conclusion. A folder name such as `internal` does not itself
prevent static publication.

The author accepted the resulting `docs/site/` recommendation within the allowed
extra level. VitePress 1.6.4 scans Markdown beneath `srcDir` and has
`srcExclude`, with no matching native `srcInclude` option. The separate subtree
therefore establishes publication membership without requiring exclusions for
every future author-document folder. It preserves website paths such as
`/guide/example.html` because routes are relative to the chosen source root.
This is the confirmed layout direction for the minimal VitePress validation.
[Stable source configuration](https://vuejs.github.io/vitepress/v1/reference/site-config#srcdir),
[pinned page discovery](https://github.com/vuejs/vitepress/blob/v1.6.4/src/node/plugins/dynamicRoutesPlugin.ts).

## Links, assets, and local development

VitePress routes remain relative to the configured source directory, so
`docs/guide/example.md` can still produce `/guide/example.html`. Its stable guide
accepts relative links with `.md` extensions, while recommending extensionless
site links. Docusaurus explicitly rewrites relative Markdown-file links to page
URLs, which helps preserve GitHub browsing. Starlight's authoring guide uses site
URLs for page links and supports relative image paths; parity with GitHub file
links was not established here. [VitePress routing](https://vuejs.github.io/vitepress/v1/guide/routing),
[Docusaurus links](https://docusaurus.io/docs/markdown-features/links),
[Starlight authoring](https://starlight.astro.build/guides/authoring-content/).

VitePress supports colocated relative image assets. Its default `public/` folder
is under the **source** directory, so this proposal places it at `docs/public/`,
not automatically at `apps/docs/public/`. Public files are copied to output as-is.
Docusaurus supports relative Markdown assets as well as the site's `static/`
assets. Keeping prose assets close to prose and app styling close to configuration
is possible, but the asset convention needs to be explicit.
[VitePress assets](https://vuejs.github.io/vitepress/v1/guide/asset-handling),
[Docusaurus assets](https://docusaurus.io/docs/markdown-features/assets).

Source inspection provides encouraging watch evidence: VitePress creates its
Vite server with `srcDir` as root, explicitly allows that directory, watches its
configuration, and handles Markdown edits and additions/deletions. Docusaurus
constructs watch patterns from configured content directories. Astro's glob
loader explicitly watches its base and handles additions, edits, and deletions.
These code paths do **not** prove the complete Pomeranian configuration works.
[VitePress server](https://github.com/vuejs/vitepress/blob/v1.6.4/src/node/server.ts),
[VitePress plugin](https://github.com/vuejs/vitepress/blob/v1.6.4/src/node/plugin.ts),
[Docusaurus watch paths](https://github.com/facebook/docusaurus/blob/main/packages/docusaurus-plugin-content-docs/src/index.ts),
[Astro glob implementation](https://github.com/withastro/astro/blob/main/packages/astro/src/content/loaders/glob.ts).

Bootstrap must prove out-of-package build and development with the actual pnpm
dependency layout. Include a representative relative image and any approved
component import. Packages imported from external Markdown/MDX, including imports
inserted by the compiler, may resolve differently from package-local config
imports. Their behavior has not been verified. Do not claim that the existence of
`srcDir` or `path` alone settles module resolution.

## Workspace build inputs

Turbo's default task inputs are package-local. A docs build consuming root content
therefore needs explicit root-relative inputs, for example
`["$TURBO_DEFAULT$", "$TURBO_ROOT$/docs/<chosen-content>/**"]`, scoped to the docs
task and adjusted to the selected publication tree. Preserve package defaults;
avoid `globalDependencies` for content that affects only docs, since those
invalidate every task. Verify that editing root Markdown changes the docs build
hash. [Turbo task inputs](https://turborepo.dev/docs/reference/configuration#inputs).

That cache check is separate from testing the engine's live reload. Turbo's docs
recommend the tool's own watcher when it already handles the needed changes.
If CI uses package-only copying or a pruned workspace, ensure external docs are
present: package contents alone are insufficient. Do not assume declaring a
cache input automatically copies it into a deployment bundle.
[Turbo watch](https://turborepo.dev/docs/reference/watch),
[Turbo prune](https://turborepo.dev/docs/reference/prune).

## Later TypeDoc and LLM integrations

VitePress's TypeDoc integration documents `docsRoot` as the project root, but its
inspected source computes sidebar URL prefixes using the relative path from
`docsRoot` to the output directory. With separated roots, that must be reconciled
with the **content** root: a prefix derived from `apps/docs/` to root `docs/api/`
would not be the desired `/api/` URL. Pointing the option at the content root is a
candidate to test, not a verified recipe. Keep generated Markdown in a dedicated
output directory, with an explicit regeneration/ignore convention.
[TypeDoc VitePress options](https://typedoc-plugin-markdown.org/plugins/vitepress/options),
[sidebar-prefix implementation](https://github.com/typedoc2md/typedoc-plugin-markdown/blob/main/packages/typedoc-vitepress-theme/src/index.ts).

Docusaurus's TypeDoc plugin exposes `docsPath` to match `docs.path` and a separate
`out` destination. Starlight TypeDoc documents its `output` relative to
`src/content/docs/`, adding another assumption to validate if replacing
Starlight's loader. Neither plugin's existence proves the proposed external
content layout, cross-package references, or sidebar links work together.
[Docusaurus TypeDoc options](https://typedoc-plugin-markdown.org/plugins/docusaurus/options),
[Starlight TypeDoc options](https://starlight-typedoc.vercel.app/configuration/).

The current `vitepress-plugin-llms` implementation derives its working directory
from VitePress `srcDir`, supporting this separation in principle. It also has its
own filtering defaults, so verify intended page coverage rather than assuming
all published pages appear. Starlight's LLM plugin documents `exclude` as applying
to its **small** bundle; this is not a general publication filter. Its framework
component support requires `rawContent`, with different output semantics.
[VitePress LLM configuration implementation](https://github.com/okineadev/vitepress-plugin-llms/blob/main/src/plugin/plugin.ts),
[Starlight LLM options](https://delucis.github.io/starlight-llms-txt/configuration/).

Docusaurus's LLM plugin documents production-build output, relative-image URL
rewriting, and multiple docs instances. Its exact external-source configuration
was not verified in this investigation. Later acceptance must inspect authored
and generated pages, route/asset links, code preservation, and consistent
exclusions across HTML, search, and all LLM outputs.
[Docusaurus LLM maintainer documentation](https://github.com/rachfop/docusaurus-plugin-llms).

## Evidence to request before accepting an implementation

These are proposed acceptance checks, not completed tests or a request to build
deferred features now:

1. Build from `apps/docs/` and the documented root workspace command with one
   real page in root `docs/`; no maintained duplicate or synchronization step.
2. Edit, add, rename, and delete a Markdown file while previewing locally.
3. Verify a nested page, image, Markdown link, heading anchor, and edit-source
   link; test approved component/import syntax under pnpm.
4. Inspect build output and search for a distinctive sentence from excluded author
   material. Repeat for LLM output when that integration is added.
5. When generated API reference is added, verify its output location, sidebar
   URL prefix, regeneration, and cross-package links.
6. If choosing Starlight with an external collection, establish compatibility for
   required Starlight features and integrations before calling it a location-only
   change.

The content subtree and selection boundary are confirmed; exact source-link
conventions and future generated-content handling belong to their implementation
slices. Basic Markdown and the default theme are sufficient. Selected-section
publication and readable core Markdown are agreed requirements.
The author clarified that the React demo is an E2E-only fixture and is neither
published nor linked from public docs. The `docs/site/` validation direction is
confirmed; see the interview record for the strict minimal-initial scope.
