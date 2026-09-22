# Future documentation requirements: feasibility assessment

> Final decision (2026-09-22): the author selected VitePress with root
> `docs/site/` content and removed per-branch documentation versioning from scope.
> The comparison below preserves the evidence considered before that decision.
> Branch-version requirements, proposals, and acceptance checks are superseded,
> not deferred work. API/search and LLM findings remain relevant to the single
> current site. See the [current decision and scope](docs-engine-requirements.md).

Researched 2026-09-22 for [engine decision #8](https://github.com/lolmaus/pomeranian/issues/8).
This assesses the [confirmed requirements](docs-engine-requirements.md) using
official documentation, integration-maintainer documentation, and source code.
It does not implement or run the deferred integrations. The earlier
[prototype comparison](docs-engine-prototype-comparison.md) proves only its
stated basic authoring behavior.

## Assessment

**Both engines have credible paths to the desired final site. VitePress remains
the better fit for this project's external Markdown convention, principally
because API generation and file links need fewer adaptations.** That is a
reasoned integration-cost assessment, not a runtime guarantee or a claim about
the engines' general quality.

Neither engine has a researched turnkey solution for the exact branch-based,
page-preserving version workflow. That work is substantially shared between the
choices. LLM export is feasible for both, but correct links inside combined
documents need deliberate handling; plugin availability alone does not settle it.

## Requirement comparison

| Future requirement                                                         | VitePress                                                                                                                                                | Astro + Starlight                                                                                                                                                                                              | Assessment                                                                                                                       |
| -------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Integrated TypeDoc API reference                                           | The Markdown plugin and VitePress theme generate pages and a sidebar before the site build. `out` and `docsRoot` can describe the external content tree. | The Starlight TypeDoc plugin writes into its conventional app-local content tree. A native glob selecting both root guides and generated API files, with a page-ID mapping, is a credible way to include both. | Feasible for both; VitePress has simpler path configuration. Starlight does not necessarily need a custom loader subsystem.      |
| Local search over guides and API                                           | Built-in MiniSearch indexes rendered Markdown content. Generated API pages must enter the ordinary site build.                                           | Included Pagefind indexes built HTML. Generated API pages must actually be loaded and rendered.                                                                                                                | No hosted service required for either. Symbol discoverability and useful ranking remain content-specific checks.                 |
| `llms.txt` and full documentation                                          | `vitepress-plugin-llms` supplies index/full/per-page output, using the resolved content root and Markdown captured during the build.                     | `starlight-llms-txt` reads the `docs` collection and can export rendered content as Markdown or use raw entry bodies.                                                                                          | Credible integrations for both. Inclusion, relative links, and version prefixes require explicit configuration and verification. |
| Complete documentation derived from each Git branch                        | Build each branch independently, including its code-derived API, search, and LLM output.                                                                 | Same approach.                                                                                                                                                                                                 | Feasible using normal static builds and CI; branch orchestration belongs to the project.                                         |
| Switch to corresponding page, otherwise an explained landing-page fallback | Custom theme navigation plus a manifest of each build's actual pages.                                                                                    | Custom theme component plus equivalent manifests.                                                                                                                                                              | Public extension points exist in both; this behavior requires project-owned code.                                                |
| Search only the selected version                                           | Keep each independently generated index inside its version build.                                                                                        | Keep each Pagefind bundle inside its version build.                                                                                                                                                            | Feasible by construction if assembly preserves paths and does not merge indexes.                                                 |
| GitHub Pages / custom domain                                               | Documented static deployment with a configurable base path.                                                                                              | Documented static deployment with `site` and `base`.                                                                                                                                                           | Neither requires an application server or publishing the React E2E fixture.                                                      |

Detailed, cited evidence and compatibility qualifications:
[API and search](docs-engine-future-api-search.md),
[LLM exports](docs-engine-future-llm.md), and
[branch versions](docs-engine-future-versions.md).
Hosting is documented by [VitePress](https://vuejs.github.io/vitepress/v1/guide/deploy)
and [Astro](https://docs.astro.build/en/guides/deploy/github/).

The documented API routes are the
[VitePress TypeDoc integration](https://typedoc-plugin-markdown.org/plugins/vitepress/quick-start)
and [Starlight TypeDoc integration](https://starlight-typedoc.vercel.app/configuration/).
Local search is documented by [VitePress](https://vuejs.github.io/vitepress/v1/reference/default-theme-search)
and [Starlight](https://starlight.astro.build/guides/site-search/).

## Integration qualifications that affect the choice

The current Starlight TypeDoc and LLM plugin peer ranges admit the exact
Astro/Starlight versions used in the prototype. The VitePress integrations do
not declare an engine peer constraint; that is not a compatibility guarantee.
The [API package assessment](docs-engine-future-api-search.md#compatible-package-surface)
and [LLM package assessment](docs-engine-future-llm.md#versions-and-output-models)
record inspected versions and published manifests. No combined pipeline was run.

The LLM plugins have different inclusion defaults. VitePress's plugin normally
omits the root index as bundle content, so a meaningful home page needs deliberate
inclusion. Starlight's `exclude` controls its small bundle, not its full bundle;
the publication boundary must remain in the collection definition.
[VitePress plugin defaults](https://github.com/okineadev/vitepress-plugin-llms/blob/0f3bbfa1f08ca28c8244b7e147368e5e8a8c34d9/src/plugin/plugin.ts),
[Starlight LLM configuration](https://delucis.github.io/starlight-llms-txt/configuration/).

Neither inspected plugin generally rebases all relative body links when pages
are concatenated. A link that works inside a page can mean something different
inside a root-level full bundle. Both engines expose processing hooks that make
source-aware normalization feasible, but ordering and content fidelity still
need validation. This work should preserve each page's source/route context
before concatenation; a post-hoc regex is not an equivalent solution. The
[LLM source assessment](docs-engine-future-llm.md#version-boundaries-and-accurate-links)
identifies the public extension routes and their limitations.

## What branch versioning would actually involve

The credible approach is a set of independently built static sites, assembled
under version prefixes. It avoids generating historical APIs from current code
or requiring every old guide to compile under one current engine. This is an
architectural inference from the engines' build/base APIs and GitHub's
[checkout](https://github.com/actions/checkout) and
[Pages artifact workflow](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
primitives, not an existing finished integration.

The project would own four bounded pieces:

1. A version registry associating labels, source revisions, and destination URLs.
2. A build/assembly recipe using each branch's source, configuration, and locked
   tooling, preserving every version in the final publication artifact.
3. A page manifest per build, containing actual routes and optional stable IDs or
   rename mappings. These let switching distinguish an absent page from a failed
   request to load metadata.
4. A selector that navigates to the matching destination or its landing page
   with the agreed explanation, using a registry that old versions can also
   refresh when new versions are published.

The reviewed versioning plugins use folder snapshots and do not supply this
complete branch workflow or the required explained missing-page fallback.
VitePress exposes build hooks and theme components; Astro exposes build hooks
and Starlight exposes component overrides. Those public APIs make the proposal
credible without an engine fork. The code's eventual size and maintenance cost
cannot be certified from documentation; there is no sound basis for estimating
lines of code or declaring either engine's switcher cheaper. See the
[source-level versioning assessment](docs-engine-future-versions.md).

The major ongoing cost is supporting old builds and stable URLs, not the menu
itself. Branches need compatible runtime/package-manager versions and usable
lockfiles. A guide rename or API restructuring needs an explicit mapping when
the route no longer matches; neither engine can infer semantic equivalence.
Fragment handling is separate from matching the destination page.

## Root content and authoring implications

The existing prototypes establish that root `docs/site/` is workable for both.
For VitePress, preserve the tested resolver configuration and revalidate it on
upgrades. For Starlight, the external loader remains an integration choice that
future plugins must consume correctly; successful basic rendering does not
automatically include generated files elsewhere.

For Starlight, the concrete alternative is to keep authored guides in root
`docs/site/`, let the TypeDoc plugin produce disposable generated files in its
usual app-local directory, and load both through Astro's native pattern-array
support with `generateId` normalizing the two prefixes. This would not duplicate
authored guides or move them back into the package. Preserving the generated
files' real paths also lets their API sidebar groups use Starlight's ordinary
directory matching. This is source-supported feasibility; generation order,
watching, slugs, and collision handling remain untested.
[Astro loader API](https://docs.astro.build/en/reference/content-loader-reference/#glob-loader)
and [API integration source assessment](docs-engine-future-api-search.md).

Starlight's source-file-link limitation is addressable through Markdown
processing, so it is additional maintenance rather than an inherent
impossibility. Astro provides syntax-tree transformation hooks; in Astro 7,
Sätteri is the default processor and remark/rehype plugins require the Unified
processor. A rewrite must account for source paths, final routes, fragments,
and version bases, rather than merely remove `.md` extensions.
[Astro Markdown processors](https://docs.astro.build/en/guides/markdown-content/#markdown-processors).

Starlight also exposes `markdown.processedDirs` for applying its Markdown
processing to additional directories. This can cover the external authored
tree; it does not by itself change collection membership, rewrite file links,
or fix automatic-sidebar path assumptions.
[Starlight configuration](https://starlight.astro.build/reference/configuration/#processeddirs).

These findings do not call for abandoning root `docs/`. They mean source
location, publication membership, and page URL identity should be treated as
separate configuration concerns. The actual docs task must hash external input
files if it uses Turbo caching, including the source code used for API generation
when that later integration is added.

## What to defer, and what to validate when it arrives

The initial implementation stays minimal: default theme, starter Markdown,
working local development/build/preview, and the chosen publication boundary.
It needs no placeholder version system or deferred integration packages.

When adding the relevant feature, use narrowly representative acceptance data:

- API/search: a small cross-package API with inheritance, generics, and overloads;
  confirm readable reference pages, working links, and searchable symbols.
- LLM exports: a guide and generated API page with code, relative links, an
  image, and excluded project material; inspect both coverage and meaningful
  content after conversion, including version-prefixed URLs.
- Versions: two independent revisions, one shared page, one absent page, and
  one deliberate rename; check switching, explanation, scoped search/LLM output,
  and publication that preserves both versions.

These are future implementation checks, not prerequisites to doing the minimal
docs slice. The feasibility conclusion is that neither engine exposes a known
fundamental blocker; VitePress currently requires fewer adaptations to the
agreed content workflow, while both require maintained versioning logic.
