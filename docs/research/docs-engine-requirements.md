# Documentation engine decision and requirements

Updated 2026-09-22. Supports [research review #7](https://github.com/lolmaus/pomeranian/issues/7)
and [engine/content decision #8](https://github.com/lolmaus/pomeranian/issues/8).
This records the author's final decision and confirmed understanding during
`/grill-with-docs`. **VitePress is selected**, with authored Markdown in root
`docs/site/` and application configuration in `apps/docs/`. The author finalized
the choice after the comparative prototypes and feasibility research, and
removed per-branch documentation versioning from scope.

The site has one current English documentation set. Multiple published versions,
a version switcher, a version registry, and branch-build orchestration are out of
scope, not deferred commitments. An implementation specification and ticket
breakdown remain separate work; this decision does not schedule a release.

## Agreed requirements

| Question                                | Author's answer                                                                                                                                                                                                                               | Selection consequence                                                                                                                                                        |
| --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Q1: Publication scope                   | Publish selected reader-facing sections only.                                                                                                                                                                                                 | Existing agent instructions, research, verification records, and future ADRs are not automatically website content. Navigation alone does not define publication membership. |
| Q2: Source location                     | Prefer shallow paths under root `docs/`; the author approved `docs/site/` after its publication-boundary benefit was explained.                                                                                                               | `apps/docs/` consumes this subtree using the engine's content conventions. Project records elsewhere under `docs/` stay outside the site.                                    |
| Q3: Portability                         | Core content must remain readable on GitHub. Optional engine-specific enhancements are acceptable if the source stays readable.                                                                                                               | Assess Markdown links, images, code fences, and required frontmatter. Rich components are not the baseline.                                                                  |
| Q4: Examples, corrected on confirmation | Documentation uses prose and code examples. The React demo is an E2E test fixture only, with no public deployment or documentation links to it. Its app code has no Playwright logic; `data-test` HTML attributes support the external tests. | Inline React examples and editable playgrounds are not requirements. Playwright tests and page objects belong in the test harness, not in the app being tested.              |
| Q5: Language                            | English only. Additional languages will never be added.                                                                                                                                                                                       | Internationalization is out of scope, not a deferred requirement.                                                                                                            |
| Q5: Versions, revised on finalization   | Publish one current documentation set; per-branch versioning is out of scope.                                                                                                                                                                 | No multi-version publishing, switcher, registry, or branch-specific acceptance work is required. Snapshot versioning is not a replacement requirement.                       |
| Q6: Search                              | Search must cover guides and generated API documentation through a local index, without requiring a hosted search service or account.                                                                                                         | Search ownership and compatibility are selection criteria. This does not imply an offline browsing or `file://` requirement.                                                 |
| Q11: Authoring and presentation         | Basic Markdown and the engine's default documentation theme are sufficient.                                                                                                                                                                   | Advanced authoring integrations and a separate visual comparison are not selection requirements. Visual refinement remains later work.                                       |

These requirements describe the desired final shape. The author explicitly
limits the initial implementation to what the next vertical coding slice needs
to add its documentation. Search, TypeDoc, LLM outputs, visual refinement, and
deployment are later work for the current documentation set. They do not require
implementation now or selection of release milestones or package version numbers.

### Superseded interview scope

The earlier Q5 and Q7–Q10 answers requested coherent branch-derived
guides/API/search/LLM sets, page-preserving switching with an explained fallback,
selected-version search, and a small maintained publishing recipe. The author's
finalization supersedes those requirements. Related research remains historical
evidence; its versioning proposals and checks are not a backlog commitment.

## Minimal initial implementation

- One private `apps/docs/` workspace package using VitePress and its default theme.
- Authored basic Markdown under root `docs/site/`, with a starter page proving
  the convention and space for the next feature's guide.
- Documented local development, production build, and built-site preview commands
  integrated with the workspace conventions actually available at that stage.
- Correct content inclusion, relative links/assets, and watching. If the build
  uses Turbo caching, root content must be included in the task inputs.
- No public demo link, demo deployment, search setup, generated API, LLM plugin,
  or custom theme in this initial slice. Versioning is outside the overall scope.

The docs package must support adding relevant documentation alongside the next
implemented behavior. It does not require writing that behavior's content in
advance or completing the future website.

## Remaining decisions and evidence

Q1–Q11 have been answered and the branch-version requirements subsequently
withdrawn. The author finalized VitePress, confirmed the React demo's E2E-only
role, and retained the minimal-initial-scope constraint above. No further engine
choice or confirmation of these preferences is required.

Release scheduling and ordinary deployment details belong to their later work.
Branch naming, historical-version retention, and cross-version publication are
not unresolved tasks within this decision.

Runtime evidence must remain proportionate to the selected slice. Native
content-path settings and separate integrations establish plausible paths; they
do not prove the eventual combined TypeDoc/search/LLM pipeline. Verify basic
root-content authoring in the actual minimal workspace and retain the later
integration checks as explicit future acceptance criteria.

## Final choice and rationale

VitePress is the selected engine. The reasons are tested external-content
authoring with working Markdown file links, its default documentation theme,
built-in local search, and the more direct TypeDoc path configuration for this
layout. The choice acknowledges the tested dependency-resolution adjustments;
it is not based solely on starter size. Starlight was also feasible but required
additional content/link adaptations. Versioning is not part of the selection
rationale or an integration commitment. See the evidence below for sources and
limitations.

The confirmed layout direction is `docs/site/index.md`, `docs/site/guide/…`, and
colocated prose assets, with site configuration in `apps/docs/`. This uses the
extra level permitted in Q2 to make placing a page in the subtree the act that
selects it for publication. It avoids maintaining exclusions for every new
author-document folder. This is the agreed content location for the minimal
specification and implementation.

## Evidence by implementation stage

**Initial compatibility check:** use an isolated temporary fixture with basic
Markdown and the default theme. App-local configuration must consume
`docs/site/` directly; build/preview, a nested Markdown link, and a colocated
image must work. A sentinel under `docs/research/` must be absent from published
output. Check file watching where feasible and report actual versions,
commands, failures, and limitations. This establishes evidence without creating
the real workspace application.

The actual minimal bootstrap must additionally verify clean-checkout setup,
workspace commands, edit/add/delete watching, publication boundaries, and
root-content cache invalidation where caching is enabled. A temporary fixture
does not complete that implementation ticket.

**Later integration acceptance:** retain the following checks for the slices
that add these capabilities; they are not bootstrap prerequisites:

- TypeDoc: representative inheritance/generics/overloads, sidebar links,
  cross-package references, and guide-to-API links.
- Search: find both guide text and API symbols in the intended local index.
- LLM output: preserve meaningful prose, signatures, code examples, links, and
  the publication boundary.
- Deployment: verify the chosen site/base URL, deep links, and asset URLs for the
  single current site. A deployment subpath does not imply versioned publishing.

A narrow investigation can move earlier if concrete evidence threatens the
engine choice. Completing every deferred integration in a preselection
experiment is not required by the agreed minimal scope.

## Minimal verification outcome

The isolated [runtime check](docs-engine-minimal-verification.md) built and
previewed root content successfully after adding an explicit app-local Vue
dependency and resolver alias. Plain `srcDir` configuration alone failed to
resolve a generated Vue server-renderer import under pnpm; preserve this finding
in the minimal specification rather than assuming the source setting is enough.

Nested links, an image, excluded author material, and server-side evidence of
edit/add/delete updates passed. The [comparison follow-up](docs-engine-prototype-comparison.md)
resolved cold development dependency-optimizer warnings with two additional
dependency-directory aliases and verified actual rendered link destinations.
Those aliases require revalidation on upgrades. Browser hydration remains
unverified.

At the author's request, an isolated Astro + Starlight fixture also proved basic
external-content build/preview and watching. Explicit navigation works, but its
ordinary automatic sidebar assumes the standard content path, and relative
`.md` links return 404 without a separate authoring or rewriting solution. This
supports retaining the VitePress preference for GitHub-readable file links; it
does not establish universal incompatibility of Starlight with external content.
No real docs workspace package or deferred integration was implemented.

## Evidence

- [Original research](docs-engine.md): the initial shortlist and provisional
  smallest-workspace recommendation.
- [Research audit](docs-engine-review.md): missing comparisons and integration
  evidence needed.
- [Root content investigation](docs-engine-content-location.md): native path
  configuration, publication boundaries, and build/watch/cache implications.
- [Branch-based versions](docs-engine-branch-versions.md): historical research
  into the superseded versioning requirement; not active acceptance criteria.
- [Minimal runtime verification](docs-engine-minimal-verification.md): observed
  build/preview behavior, the resolver adjustment, and outstanding dev checks.
- [Prototype comparison](docs-engine-prototype-comparison.md): runnable isolated
  VitePress and Astro + Starlight fixtures, observed tradeoffs, and current limits.
- [Future feasibility assessment](docs-engine-future-feasibility.md): researched
  API/search and LLM paths, plus historical branch-version analysis. Only the
  single-current-site integrations remain in scope.

Feasibility findings distinguish documented/source-inspected behavior from
runtime verification. The initial compatibility check is separate from both
the real application bootstrap and the deferred integrations.
