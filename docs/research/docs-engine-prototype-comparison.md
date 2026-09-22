# Documentation engine prototype comparison

> Final decision (2026-09-22): the author selected VitePress with root
> `docs/site/` content and removed per-branch documentation versioning from scope.
> The comparison below preserves the evidence considered before that decision.
> Branch-version requirements, proposals, and acceptance checks are superseded,
> not deferred work. API/search and LLM findings remain relevant to the single
> current site. See the [current decision and scope](docs-engine-requirements.md).

Verified 2026-09-22 for [research #7](https://github.com/lolmaus/pomeranian/issues/7)
and [engine decision #8](https://github.com/lolmaus/pomeranian/issues/8), following
the author's request for an isolated Astro + Starlight comparison with the
existing VitePress prototype.

The later [future-requirements assessment](docs-engine-future-feasibility.md)
researches API/search, LLM output, and branch-version feasibility separately.
It expands the selection evidence without turning those capabilities into
implemented prototype features.

## Verdict

**Both engines can build and watch Markdown under root `docs/site/` while their
application lives in `apps/docs/`. Retain the VitePress preference for this
project's authoring workflow.** Its tested relative Markdown file links work
on the site without changing their GitHub-friendly source form. Starlight needs
canonical site URLs or an additional rewriting solution for those links.

This is a tradeoff, not a declaration that Starlight cannot meet the requirements.
The author requested GitHub-readable core content; that does not automatically
make every non-clickable GitHub link a disqualifier. VitePress also has a concrete
maintenance cost: the tested pnpm layout needs Vue and three resolver aliases,
including two coupled to VitePress's dependency layout.

Root `docs/site/` remains a reasonable content boundary. Neither prototype needs
copies or symlinks, and both exclude the project-record sentinel outside that
subtree. External content does require deliberate engine configuration and,
in the real workspace, appropriate build/cache inputs.

## Comparable scope and observations

Both isolated workspaces use Node 24.21.0, pnpm 11.27.1, default documentation
themes, three Markdown pages, nested links, a colocated SVG, a TypeScript code
fence, and an excluded research document. Starlight pages add its required title
frontmatter. Both final configurations use explicit sidebar links; Starlight's
automatic-sidebar experiment is recorded separately.

| Check | VitePress 1.6.4 / Vue 3.5.43 | Astro 7.3.3 / Starlight 0.42.2 |
| --- | --- | --- |
| External source configuration | Native `srcDir`; direct Vue dependency plus three resolver aliases in this pnpm layout. | Astro external `glob()` collection with Starlight schema, replacing Starlight's fixed-location loader; no resolver aliases. |
| Production build and canonical page routes | Pass. | Pass after adding Sharp 0.35.4 for image processing. |
| Explicit sidebar navigation | Rendered destinations return HTTP 200 with expected content. | Rendered destinations return HTTP 200 with expected content. |
| Authored relative `.md` links | Rewritten into working site URLs; all 16 local href observations across the fixture return HTTP 200. | Four authored links return HTTP 404 in preview and dev. Canonical site routes work; a rewriting integration was not tested. |
| Colocated SVG and research exclusion | Pass. SVG is inlined in production; dev image request succeeds. | Pass. Optimized SVG asset is served in production; dev image request succeeds. |
| Edit/add/delete without restarting dev | Transformed Markdown modules update; deleted content disappears into the dev HTML fallback. | Canonical pages update; deleting a page eventually returns HTTP 404. |
| Cold development dependency resolution | Original warnings reproduced with cache deleted; amended aliases remove them. | No dependency-resolution errors observed. Empty optional i18n and absent custom 404 warnings remain. |
| Automatic sidebar experiment | Not tested or required; fixture uses explicit navigation. | Ordinary `directory: 'guide'` group is empty with external content. Explicit links solve the minimal navigation requirement. |
| Browser hydration, client navigation, visible HMR | Unverified. | Unverified. |

HTTP success and server-side update evidence do not prove browser interaction.
The two engines use different Vite versions and image pipelines; Starlight also
generates its default Pagefind bundle. Build timings and dependency counts are
not a controlled performance or maintenance comparison.

## What the extra configuration means

VitePress initially failed on its generated `vue/server-renderer` import. A
direct Vue dependency and alias fixed production builds. Genuine cold starts
then exposed optimizer resolution warnings for `@vue/devtools-api` and
`@vueuse/core`; aliases to their installed dependency directories fixed these
without suppressing warnings. Aliases to resolved CommonJS entrypoints caused
a circular-chunk warning and were rejected. Preserve and revalidate the tested
configuration when upgrading, rather than assuming `srcDir` alone is sufficient.
See the [initial check](docs-engine-minimal-verification.md) and
[resolution follow-up](docs-engine-vitepress-followup.md).

Starlight's external collection works for basic rendering, assets, and watching,
but does not remove every conventional-directory assumption. Automatic sidebar
directory matching still uses the standard content path. Its edit-source URL
works with a normal monorepo base ending in `/edit/main/apps/docs/`, which
correctly resolves the external `../../docs/site/...` path. Git-date metadata
was not established. Required frontmatter remains readable Markdown. The final
explicit sidebar works just as the VitePress fixture's explicit sidebar does.
See the [Starlight check](docs-engine-starlight-verification.md) for configurations,
observed URLs, versions, warnings, and source references.

## Runnable retained artifacts

The throwaway code is retained on branch
[`prototype/docs-engine-comparison`](https://github.com/lolmaus/pomeranian/tree/prototype/docs-engine-comparison),
commit [`d861db5`](https://github.com/lolmaus/pomeranian/commit/d861db5), under
[`prototypes/docs-engines/`](https://github.com/lolmaus/pomeranian/tree/d861db5/prototypes/docs-engines).
That branch is published separately from the decision PR; its reports preserve
the scope at the time of the experiment. The worktree used here was
`/tmp/pomeranian-docs-engine-prototypes`. The committed inputs are independent of
disposable dependencies, output, and caches. The decision PR contains research
and roadmap updates only.

In a checkout of the prototype branch, select the pinned Node/pnpm versions and run:

```sh
bash prototypes/docs-engines/run.sh vitepress
bash prototypes/docs-engines/run.sh starlight
```

Use separate terminals. Each command installs its locked dependencies and starts
a loopback development server. The optional second argument is `build`, `preview`,
or `verify`; verification also requires Python 3. Starlight's probe deliberately
records the unresolved authored-link failures; an exit status of zero alone
does not mean all compatibility checks passed. VitePress verification also
reproduces its baseline warnings before testing the amended configuration.

The retained inputs include exact lockfiles, Markdown/assets, configurations,
baseline variants, and fixture-relative HTTP probes. Both relocated fixtures
were reinstalled from their frozen lockfiles and exercised with the shared runner.
Servers are stopped after verification. The prototype README explains the same
commands and boundaries.

## Boundary with implementation

This comparison changes evidence, not the approved minimal scope. The first real
slice still needs only the docs package, starter content, default theme, and
local development/build/preview commands sufficient for the next coding task.
Browser behavior and the actual workspace commands/cache inputs need verification
in that implementation. The separate React app remains an unpublished E2E fixture.

Neither prototype tests TypeDoc, combined guide/API search, LLM output, branch
publishing, the page-preserving version switcher, or deployment. Starlight's
incidental default search build does not establish the agreed guide/API search
requirement. Retain those future checks from the
[confirmed requirements](docs-engine-requirements.md); they are not added to the
initial implementation. Docusaurus was not prototyped in this comparison.
