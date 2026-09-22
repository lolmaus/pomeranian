# Documentation engine compatibility prototypes

Throwaway fixtures for comparing VitePress and Astro + Starlight against
Pomeranian's minimal documentation needs. These are not the real `apps/docs/`
workspace or production implementations.

Each fixture is an independent pnpm workspace. Its site package lives at
`apps/docs/` and its authored Markdown at `docs/site/`. A document outside that
subtree provides an exclusion check. The fixtures retain their exact dependency
lockfiles and runtime probe scripts; dependencies and generated output are not
committed.

## Run

Select Node 24.21.0 and pnpm 11.27.1, following the repository's CONTRIBUTING.md.
From this worktree's root:

```sh
bash prototypes/docs-engines/run.sh vitepress
bash prototypes/docs-engines/run.sh starlight
```

Run the commands in separate terminals for side-by-side local viewing. Each
installs its locked dependencies and starts the engine's normal development
server on loopback. Stop it with Ctrl+C. The CLI prints the local URL.

The optional second argument is `build`, `preview`, or `verify`. `preview` builds
and serves the production output; `verify` builds and runs the Python HTTP and
content probe. Python 3 is needed only for verification. Probe logs are ignored.
VitePress verification also compares cold-start resolver configurations.
Starlight verification records expected relative `.md` link failures rather than
treating a successful process exit as proof that every compatibility check passed.

## Boundaries

The fixtures cover basic content rendering, links, images, exclusion, and
development file updates. They do not add TypeDoc, version switching, LLM output,
or public deployment. The separate React E2E fixture is unrelated to these sites.
Engine-default extras do not establish that future integration requirements have
been verified.

See [the retained comparison](../../docs/research/docs-engine-prototype-comparison.md)
and individual verification reports in `../../docs/research/` for observations,
failures, workarounds, and limitations. Exact results describe these fixtures and
versions rather than every possible configuration of either engine.
