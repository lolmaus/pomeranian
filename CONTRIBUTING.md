# Contributing to Pomeranian

See the [roadmap](ROADMAP.md) for planned work and the
[domain context](CONTEXT.md) for project terminology.

## Prerequisites

Install Git and the exact Node version in [.nvmrc](.nvmrc), currently `24.21.0`.
We recommend [fnm](https://github.com/Schniz/fnm); another compatible version
manager or an exact manual Node installation also works. npm comes with Node and
is used only to bootstrap pnpm in the instructions below.

pnpm must be available before installing workspace dependencies. Its exact version
is declared in root `package.json` under `devEngines.packageManager`, currently
`11.27.1`; that field is the package-manager version authority. Turbo, Oxfmt,
Oxlint, and TypeScript are local workspace dependencies and need no global
installation.

## Set up a checkout

Clone the repository with Git, then run the following from its root. Install fnm
and follow its [shell setup instructions](https://github.com/Schniz/fnm#shell-setup)
so new shells initialize it. For the current Bash session:

```bash
eval "$(fnm env --use-on-cd --shell bash)"
fnm install
fnm use
node --version
```

`fnm install` and `fnm use` read `.nvmrc`; `node --version` must report `v24.21.0`.
With another manager or a manual installation, select the same version before
continuing. `.nvmrc` supports runtime selection; it does not enforce the runtime
of processes launched outside that selection flow.

Bootstrap the pinned pnpm version using npm:

```bash
npm install --global "pnpm@$(node --print "require('./package.json').devEngines.packageManager.version")"
unset pnpm_config_pm_on_fail PNPM_CONFIG_PM_ON_FAIL
pnpm --version
pnpm install --frozen-lockfile
```

`pnpm --version` must report `11.27.1`. Keep the two environment overrides above
unset and omit `--pm-on-fail` overrides from pnpm invocations. The repository sets
`pmOnFail: error` and `devEngines.packageManager.onFail: error`; changing these
settings or supplying overrides changes the version-selection contract.

With these settings, a pnpm 11 version mismatch makes both `pnpm --version` and
`pnpm install --frozen-lockfile` exit with status 1 and report the required and
current versions. Resolve it by rerunning the bootstrap command; retain strict
checking even if the diagnostic suggests `warn` or `ignore`. Check which
executable your shell resolves with `command -v pnpm`, and reopen the shell or
refresh its command cache if it still finds a previous installation.

This bootstrap route uses npm directly; Corepack is not part of the supported
route. See [bootstrap verification](docs/verification/bootstrap.md) for the tested
version and mismatch behavior, including controlled override settings.

The frozen install consumes the committed lockfile and must leave dependency
metadata unchanged. Use it for a fresh checkout and routine setup. When
intentionally changing a dependency or workspace manifest, run `pnpm install`,
review the resulting lockfile changes, and commit the manifest and lockfile
together.

## Available commands

Run these commands from the repository root:

| Command                            | Purpose                                                         |
| ---------------------------------- | --------------------------------------------------------------- |
| `node --version`                   | Confirm the selected runtime.                                   |
| `pnpm --version`                   | Confirm the package manager selected by the bootstrap route.    |
| `pnpm install --frozen-lockfile`   | Install the committed dependency graph.                         |
| `pnpm list --recursive --depth -1` | Discover workspace package identities.                          |
| `pnpm exec turbo --version`        | Run the repository-local task runner.                           |
| `pnpm exec turbo ls`               | Confirm Turbo discovers the library and configuration packages. |
| `pnpm run format`                  | Check repository formatting without editing files.              |
| `pnpm run format:fix`              | Apply repository formatting fixes.                              |
| `pnpm run lint`                    | Lint every applicable package through Turbo.                    |
| `pnpm run lint:fix`                | Apply supported safe lint fixes in every applicable package.    |
| `pnpm run typecheck`               | Typecheck every applicable package without emitting files.      |

`pnpm run format` checks repository formatting without changing files.
`pnpm run format:fix` applies the same Oxfmt configuration, then a second check
should pass. Both commands run directly from the root, outside Turbo; every fix
invocation reads the current files. Oxfmt is pinned exactly in `package.json`.

### Formatting scope

The root [.oxfmtrc.json](.oxfmtrc.json) applies to supported files throughout the
repository, including new source under `packages/` and `apps/`, hidden maintained
configuration, and repository-owned Markdown: planning and research in `docs/`,
`ROADMAP.md`, domain documentation, `AGENTS.md`, and contributor guidance.
The commands disable nested formatter configurations so one root policy applies.

Configured exclusions preserve installed `.agents/skills/` bundles and their
`skills-lock.json`, root `.scratch/` planning and disposable verification material,
and `pnpm-lock.yaml`. Dependency directories (`node_modules/`, `.pnpm-store/`),
caches (`.turbo/`, `.cache/`), output (`dist/`, `build/`, `coverage/`), test artifacts
(`test-results/`, `playwright-report/`), and `*.tsbuildinfo` are excluded at any
depth. Oxfmt also respects Git ignore files and its built-in exclusions, including
VCS directories and lockfiles. Unsupported file types are left alone.

Store disposable verification files in `.scratch/` or an external temporary
directory. Add Git and formatter exclusions when introducing generated output.
Oxfmt formats supported fenced code in Markdown, so review documentation diffs
too; package manifest sorting is disabled to preserve existing ordering.

See [formatting verification](docs/verification/formatting.md) for the repeatable
acceptance procedure and executed evidence, including excluded-file preservation.

### Package linting and typechecking

`@pomeranian/core` and `@pomeranian/oxlint-config` each provide real `lint`,
`lint:fix`, and `typecheck` scripts. Root commands run those scripts through
Turbo and propagate failures. To check or fix core alone, run:

```bash
pnpm --filter @pomeranian/core run lint
pnpm --filter @pomeranian/core run lint:fix
pnpm --filter @pomeranian/core run typecheck
```

Use `@pomeranian/oxlint-config` instead to select the shared lint configuration
package, or run the same scripts from either package directory. Linting checks
source and local configuration without changing files; warnings also fail the
command. Fixing applies supported safe fixes, and violations it cannot fix still
fail. Rerun lint after making any remaining corrections.

The shared configurations expose explicit package entry points:

- `@pomeranian/oxlint-config/base` supplies correctness checks, `prefer-const`,
  and strict equality. Each consumer's `oxlint.config.mts` imports this entry
  point and extends it through Oxlint's `defineConfig`.
- `@pomeranian/typescript-config/base` supplies strict, non-emitting TypeScript
  checks with ES2023 and NodeNext settings. Each consumer's `tsconfig.json`
  extends this entry point and declares its own input globs.

Declare these internal dependencies with `workspace:*`; use their exported
identities instead of relative paths into another package. The TypeScript
configuration package contains only JSON and needs no source-check or build
placeholder. The Oxlint configuration package contains typed `.mts` source, so
both linting and typechecking include it. The `.mts` extension identifies these
tooling modules as ESM without deciding either library's distribution format.

Core's `src/scaffold.ts` contains only `export {};`: it supplies an initial
source module with no product declarations. Core automatically checks new source
under `src/` and includes its root `.mts` configuration in typechecking. Both
libraries retain empty public exports. `@pomeranian/lib-essential` remains
source-free and gains its check workflow in
[lib-essential checks #14](https://github.com/lolmaus/pomeranian/issues/14).

Typecheck scripts explicitly run `tsc --noEmit --project tsconfig.json`, retaining
the no-output guarantee even if shared configuration resolution fails. These
checks neither build product JavaScript nor select a product publishing format.

### Check caching

Turbo caches successful lint and typecheck results and their logs; neither task
has generated outputs. Its default package inputs account for maintained source,
local configuration, and manifests. Root [turbo.json](turbo.json) additionally
hashes the shared configuration packages' top-level `.json` and applicable
`.mts` files, plus `.nvmrc`, `.gitignore`, `pnpm-workspace.yaml`, and the complete
`pnpm-lock.yaml`. Changes to those global inputs invalidate cached checks across
the workspace, including dependency changes recorded in the lockfile.

When adding shared configuration helpers, directories, or file extensions,
extend those cache-input globs to cover them. Keep generated artifacts and cache
directories out of the globs. `lint:fix` disables caching and executes on every
invocation against current files; repository formatting also continues to run
directly outside Turbo. Turbo's task cache is separate from CI's pnpm dependency
store cache, and no remote task cache is configured.

See [core-check verification](docs/verification/core-checks.md) for the repeatable
CLI acceptance procedure and local and hosted evidence, including shared-setting
diagnostics, export boundaries, fixes, and cache invalidation.

## Continuous integration

The GitHub Actions workflow **CI** runs on every branch push and every pull
request, including drafts and documentation-only changes. Push runs check the
branch tip; pull-request runs check GitHub's proposed merge result. Superseded
runs are canceled separately for each event and branch or pull request, so a
push run and its corresponding pull-request run do not cancel one another.
Tag pushes do not trigger this workflow.

One required job, **Workspace checks**, runs on GitHub-hosted Ubuntu Linux with
read-only repository permissions. It selects Node from `.nvmrc` and pnpm from
root `package.json`'s `devEngines.packageManager`, preserving the same version
requirements used locally. Each job bootstraps the pinned pnpm executable and
sets up dependencies once. An action-managed pnpm store cache reuses package
downloads, with keys sensitive to dependency metadata and the runner platform.
Every run still executes `pnpm install --frozen-lockfile`, including cache hits;
the cache does not replace installation or relax lockfile checks.

The job runs `pnpm run format`, `pnpm run lint`, and `pnpm run typecheck`, using
the same commands and scope as local verification without applying fixes. Core
and the typed Oxlint configuration package participate in linting and
typechecking. Installation, formatting, lint, or typecheck failure fails the
same required job. #14 adds lib-essential to these aggregates when its checks
become available.

Merging into `main` requires a successful **Workspace checks** result from
GitHub Actions, and the branch must be up to date with `main`. This applies to
all authors, including the owner and administrators, with no bypass actors.
If `main` changes after a successful run, update the branch and obtain a new
passing result before merging.

Actions are pinned to full commit SHAs with release-version annotations.
Dependabot proposes GitHub Actions updates weekly, grouping minor and patch
updates while keeping major upgrades in separate PRs. Review these PRs before
merging; automatic merging and package dependency updates are not enabled by
this setup.

See [CI verification](docs/verification/ci.md) for the repeatable hosted
acceptance procedure and verification record.

## Workspace layout and adding packages

pnpm discovers `packages/*` and `apps/*`. The current library identities live at
`packages/core` and `packages/lib-essential`; applications arrive with their
roadmap items.

Create a manifest with a unique package name in the appropriate directory. Use
`private: true` for internal infrastructure or an unreleased scaffold. Declare `exports` explicitly;
an empty scaffold uses `{}`, while each advertised entry point must resolve to a
real supported module. Declare internal dependencies with `workspace:*` and
refresh the lockfile using `pnpm install`. Confirm discovery with
`pnpm list --recursive --depth -1`, then rerun the frozen install.

Use explicit source modules without `index.ts` barrel files, and export every
type defined by project code. Consume shared configurations by package identity
and exported entry point. Packages with source need applicable lint and typecheck
commands.

## Tests and documentation

Include meaningful tests and documentation with behavior changes in the same PR.
Use TDD; prefer colocated `node:test` and `node:assert` unit tests where suitable.
Each offered page object needs a React demo example and Playwright E2E coverage.
The first behavior slice will establish the demo and E2E infrastructure.
