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
`12.5.1`; that field is the package-manager version authority. Turbo, Oxfmt,
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

`pnpm --version` must report `12.5.1` inside the checkout. Keep the two
package-manager environment overrides above unset and omit `--pm-on-fail`
overrides. The manifest's `devEngines.packageManager.onFail: download` selects
the exact required version automatically when the launching pnpm differs.
There is no workspace `pmOnFail: error` override. The author approved this
behavior after PR #27; it replaces the earlier strict mismatch-rejection policy.

A compatible pnpm launcher can download and run 12.5.1 on the first invocation,
then reuse its managed copy. Verification exercised pnpm 11.27.1 launching
`pnpm --version`, frozen installation, lint, and typecheck under 12.5.1. An initial
download requires registry access. The npm bootstrap above remains the direct
setup route; inspect `command -v pnpm` when diagnosing launcher selection.
An arbitrary older pnpm is not guaranteed to understand the manifest authority.

Corepack is not part of the supported bootstrap route. See the
[current automatic-download evidence](docs/verification/lib-essential-checks.md#automatic-download-contract)
for cold/warm selection, unchanged metadata, and frozen-lockfile rejection.
The [bootstrap record](docs/verification/bootstrap.md) retains historical evidence
of the superseded strict policy.

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

### Documentation workspace

After the normal frozen installation, run these commands from the repository root:

```sh
pnpm run docs:dev
pnpm run docs:build
pnpm run docs:preview
```

Development watches source files; preview serves the last production build, so
run the build first and rebuild after changes. Stop either server with Ctrl-C.
The terminal prints the local URL, including the `/pomeranian/` project-site
base used by GitHub Pages. To choose a loopback address and port, append
`--host 127.0.0.1 --port 43190 --strictPort` to either server command.
These root commands delegate directly to the private `@pomeranian/docs` package;
its equivalent scripts are `dev`, `build`, and `preview`.

Write reader-facing Markdown under `docs/site/`. The starter is
[the home page](docs/site/index.md); add behavior guides under `docs/site/guide/`
as those behaviors are implemented. Use ordinary relative Markdown file links,
heading anchors, fenced code, and colocated images so sources remain readable on
GitHub. Link a new guide from an existing page; add navigation to the default
VitePress theme when the content warrants it. No custom components are required.

The VitePress configuration lives in `apps/docs/.vitepress/`. Only `docs/site/`
is website content: research, verification evidence, ADRs, and agent guidance
outside it are not published. Do not copy these project records into the content
tree. The React demo is a separate E2E fixture, with no documentation links or
public deployment.

Build output is `apps/docs/dist/`; optimizer cache is `apps/docs/.cache/`.
Both are ignored. Documentation commands run outside Turbo and do not cache build
results. Every build reads current Markdown and assets, including additions and
deletions; dev and preview are ordinary long-running processes. Successful CI on
`main` deploys this build to GitHub Pages as described below. This does not
publish a package release.

Maintained docs configuration extends the shared Node TypeScript environment and
base lint profile. Its local type environment additionally loads DOM and Web
Bluetooth declarations required by the VitePress/Vue dependency types. This does
not change the library or shared Node environments. Full declaration checking
remains enabled. The pinned VitePress release has a circular `anchor.Token` type
alias; the pnpm patch under `patches/` binds it to the enclosing Markdown token
type without changing runtime code. Frozen installs apply that patch. Dependency
upgrades must recheck whether it is still necessary, as well as the three
external-content resolver aliases. The workspace explicitly permits esbuild's
installation script, which the documentation build requires.

Run `pnpm run format`, `pnpm run lint`, `pnpm run typecheck`, and
`pnpm run docs:build` before submitting changes. Follow the
[documentation verification procedure](docs/verification/minimal-docs.md) for
browser navigation, live updates, links/assets, publication boundaries, and clean
installation checks.

### Formatting commands

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

`@pomeranian/core`, `@pomeranian/lib-essential`, and
`@pomeranian/oxlint-config` each provide real `lint`,
`lint:fix`, and `typecheck` scripts. Root commands run those scripts through
Turbo and propagate failures. To check or fix core alone, run:

```bash
pnpm --filter @pomeranian/core run lint
pnpm --filter @pomeranian/core run lint:fix
pnpm --filter @pomeranian/core run typecheck
```

Use `@pomeranian/lib-essential` to select the second library or
`@pomeranian/oxlint-config` for shared lint configuration. The same scripts work
from each package directory. Linting checks
source and local configuration without changing files; warnings also fail the
command. Fixing applies supported safe fixes, and violations it cannot fix still
fail. Rerun lint after making any remaining corrections.

The shared lint configurations expose these package entry points:

| `@pomeranian/oxlint-config/` entry | Policy and consumer responsibility                                                                                                                                                          |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `base`                             | Oxlint's recommended correctness category with its default native plugins, explicit `prefer-const`, strict equality, and type-aware dropped/misused-promise checks.                         |
| `playwright-library`               | A rule fragment for reusable library/helper inputs: Playwright API and async-assertion safety without test-structure policy. Apply it in an override alongside `base`.                      |
| `playwright-test`                  | A rule fragment adding the pinned Playwright plugin's recommended test rules. Apply it only to actual test inputs alongside `base`.                                                         |
| `react`                            | A complete profile extending `base`, preserving its plugins and adding native React correctness, explicit Rules of Hooks, effect dependencies, and Compiler-backed correctness diagnostics. |

The exact `oxlint-tsgolint` dependency executes typed linting; independent
TypeScript checks remain necessary. Each consumer must maintain a discoverable
`tsconfig.json` whose references reach every linted TypeScript leaf. A missing
reference can silently omit project-dependent lint diagnostics. `--tsconfig` is
not a substitute for typed-project discovery.

Both libraries apply the Playwright library fragment to TypeScript source under `src/`
(`.ts`, `.tsx`, `.mts`, and `.cts`). Test consumers
must restrict the test fragment to their test paths. `expect-expect` recognizes
`expect` by default; a consumer may explicitly name genuine assertion helpers in
`assertFunctionNames`, while action-only helpers must still fail that rule.
The Playwright plugin uses Oxlint's alpha JavaScript-plugin interface. Its API
rules use syntax/name heuristics: a receiver renamed from `page` to `driver`
can evade a rule even when typed as `Page`. Typed promise checks add coverage,
but do not make every Playwright rule aware of receiver types. `eslint` is an
exact dependency to satisfy the plugin's peer contract, not another lint runner.

For a mixed React/tooling package, invoke the React profile on explicit React
source paths (including `.ts` custom Hooks) and invoke the base tooling config on
the other paths, joining both commands in the package scripts. Merely removing
the React plugin in an override does not disable already enabled React rules.
Use the same scopes for checking and safe fixing. React Compiler diagnostics
are enabled even without using React Compiler to build; Oxlint documents that
support as experimental. Safe fixes must not add effect dependencies through
dangerous-fix options. Accessibility rules remain outside this slice.

### TypeScript environments and editor setup

Shared TypeScript configuration exports separate environments. The base owns
strictness, no emission, and consistent filename casing. Environment presets own
target, module resolution, standard libraries, ambient type names, and JSX.
Consumers own dependencies, input globs, paths, type roots, discovery references,
and explicit commands for all their leaves.

| `@pomeranian/typescript-config/` entry | Environment                                                                                                                                     |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `base`                                 | Portable strict policy; consumers supply their environment.                                                                                     |
| `library`                              | Node/Playwright-process library checks: ES2023, NodeNext, Node declarations matching the oldest supported consumer LTS.                         |
| `node`                                 | Author tooling: ES2024, NodeNext, Node 24 declarations and syntax compatible with Node's TypeScript stripping.                                  |
| `playwright`                           | Test-runner inputs: library compatibility baseline plus DOM types, bundler resolution, and TypeScript imports supported by Playwright's loader. |
| `browser`                              | Repository browser applications: ES2023, DOM, bundler resolution, no implicit Node ambient types.                                               |
| `browser-react`                        | Browser policy plus automatic React JSX and React declarations.                                                                                 |

Each library's `tsconfig.library.json` owns `src/**/*`; `tsconfig.node.json` owns root
`.mts` tooling. The lint configuration package's Node leaf owns its `.mts`
modules. New files in these scopes are included automatically. No leaf enables
`composite`. Each package has an empty `tsconfig.json` containing
only discovery references. There is no root TypeScript solution; opening a file
uses its nearest package discovery entrypoint. Scripts explicitly check each leaf with
`tsc --noEmit --project <leaf>`; checking an empty solution alone does not check
its children. Do not substitute a build invocation that creates build metadata.

Each library installs canonical `@types/node` at the exact Node 22 declaration pin and
`@types-node24/node` as an alias of the exact Node 24 pin. Its library leaf uses
`typeRoots: ["./node_modules/@types"]`, and its tooling leaf uses
`typeRoots: ["./node_modules/@types-node24"]`. Both select the standard `node`
type name. This keeps transitive `reference types="node"` directives on the
intended declaration line without private package-store paths or
`skipLibCheck`. The pure tooling configuration package uses canonical Node 24
types. A consumer of these presets must declare its own matching types;
browser/React consumers likewise own React declarations. Imported dependencies
can introduce ambient types, so `types` and `exclude` are not import boundaries.

Authors develop on the exact Node version in `.nvmrc`. Published libraries are
intended for the latest supported patch of each supported Node LTS major,
starting with 22. The library preset checks that baseline; `target` alone does
not establish runtime or built-artifact compatibility, and `noEmit` performs no
downlevel transformation. Actual Node LTS behavior belongs to the first
Element_PO slice; packed JavaScript and public declarations are verified by the
packaging slice before publication. Playwright transforms TypeScript without
typechecking it or using `target` as a compatibility guarantee. Its test preset
permits DOM names throughout the program, not only inside browser callbacks.

For the supported VS Code setup, open the repository root as a trusted workspace
and install the recommended [TypeScript 7 extension](https://marketplace.visualstudio.com/items?itemName=TypeScriptTeam.native-preview)
(`TypeScriptTeam.native-preview`). Open a `.ts` or `.mts` file. The committed
settings enable the native server and select `./node_modules/typescript`; if
needed, run **TypeScript: Enable TypeScript 7 Language Server**. Choose **Allow**
when the extension offers the configured workspace SDK. Confirm the language
status reports **7.0.2**, then run **TypeScript: Open TS Server log** and verify
that its resolved executable belongs to this checkout's installed TypeScript
package. The path matters because the extension's bundled version can also say
7.0.2. The editor still requires explicit SDK consent; settings alone cannot
supply it. [SDK consent](https://github.com/microsoft/typescript-go/blob/main/_extension/src/session.ts),
[executable resolution](https://github.com/microsoft/typescript-go/blob/main/_extension/src/client.ts).

The documented combination is VS Code **1.138.0** with native extension
**0.20260708.2**. These release versions were inspected, while verification ran
the repository's actual native language server directly; no GUI session was
executed. With a library or tooling file active, inspect the TypeScript project entry
in the language-status indicator: it shows the selected config path and offers
**Open Config File**. Verify the intended leaf and a deliberate diagnostic, then
restore the input. The bundled compiler is outside the supported contract. See the
[editor verification record](docs/verification/core-checks-extension.md#editor-release-and-selection-evidence)
for version sources and recovery when the initial SDK prompt was dismissed.

Declare these internal dependencies with `workspace:*`; use their exported
identities instead of relative paths into another package. The TypeScript
configuration package contains only JSON and needs no source-check or build
placeholder. The Oxlint configuration package contains typed `.mts` source, so
both linting and typechecking include it. The `.mts` extension identifies these
tooling modules as ESM without deciding either library's distribution format.

Each library's `src/scaffold.ts` contains only `export {};`: it supplies the
initial compiler input allowed by the foundation specification, without product
declarations. Both libraries retain empty public exports.

The no-output flag also protects against emission when shared configuration
resolution fails. These checks neither build product JavaScript nor select a
product publishing format.

### Check caching

Turbo caches successful lint and typecheck results and their logs; neither task
has generated outputs. Its default package inputs account for maintained source,
local configuration, and manifests. Root [turbo.json](turbo.json) additionally
hashes the shared configuration packages' top-level `.json` and applicable
`.mts` files, plus dependency patches, `.nvmrc`, `.gitignore`, `pnpm-workspace.yaml`, and the complete
`pnpm-lock.yaml`. Changes to those global inputs invalidate cached checks across
the workspace, including dependency changes recorded in the lockfile.

When adding shared configuration helpers, directories, or file extensions,
extend those cache-input globs to cover them. Keep generated artifacts and cache
directories out of the globs. `lint:fix` disables caching and executes on every
invocation against current files; repository formatting also continues to run
directly outside Turbo. Turbo's task cache is separate from CI's pnpm dependency
store cache, and no remote task cache is configured.

See [extended core-check verification](docs/verification/core-checks-extension.md)
for the current CLI acceptance procedure and local and hosted evidence. The
[original record](docs/verification/core-checks.md) retains historical evidence.

## Continuous integration

The GitHub Actions workflow **CI** runs on every branch push and every pull
request, including drafts and documentation-only changes. Push runs check the
branch tip; pull-request runs check GitHub's proposed merge result. Superseded
branch and pull-request runs are canceled separately for each event and ref, so
a push run and its corresponding pull-request run do not cancel one another.
Main push runs are serialized without canceling an in-progress run, allowing
its Pages deployment to finish.
Tag pushes do not trigger this workflow.

The required job, **Workspace checks**, runs on GitHub-hosted Ubuntu Linux with
read-only repository permissions. It selects Node from `.nvmrc` and pnpm from
root `package.json`'s `devEngines.packageManager`, preserving the same version
requirements used locally. Each job bootstraps the pinned pnpm executable and
sets up dependencies once. An action-managed pnpm store cache reuses package
downloads, with keys sensitive to dependency metadata and the runner platform.
Every run still executes `pnpm install --frozen-lockfile`, including cache hits;
the cache does not replace installation or relax lockfile checks.

The job runs `pnpm run format`, `pnpm run lint`, `pnpm run typecheck`, and
`pnpm run docs:build`, using
the same commands and scope as local verification without applying fixes. Both libraries, the docs application,
and the typed Oxlint configuration package participate in linting and
typechecking. Installation, formatting, lint, typecheck, or docs-build failure fails the
same required job.

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

### GitHub Pages deployment

The site is `https://lolmaus.github.io/pomeranian/`. CI builds and uploads only
`apps/docs/dist/` as the `github-pages` artifact on branch pushes and pull
requests. The artifact is retained for one day. Uploading the archive validates
packaging; it does not publish branch previews.

A separate **Deploy documentation** job runs only on a push to `main`, after
**Workspace checks** succeeds. It deploys that run's artifact with the official
GitHub Pages action and reports the resulting URL on the `github-pages`
environment. Only this job has `pages: write` and `id-token: write` permissions;
the checks job retains read-only repository access. Both Pages actions are
pinned to full commit SHAs and covered by the existing Dependabot action updates.
No deployment credentials or personal access tokens belong in the workflow.

Repository setup is **Settings → Pages → Build and deployment → Source: GitHub
Actions**. The `github-pages` environment permits deployments from the `main`
branch only. On another repository, configure those same settings and adjust the
VitePress base for its project-site URL before the first deployment. A custom
domain and DNS are separate future work.

The first public deployment occurs after this workflow is merged to `main`.
Inspect its **Deploy documentation** job and environment URL, then open the site
and check its assets and navigation. Subsequent successful main pushes update
the same site. For a failed deployment, fix the reported cause and rerun the
failed job from its main-branch Actions run while its artifact is retained;
otherwise rerun all jobs to create a fresh artifact. Main workflows queue so a
new push does not interrupt an active deployment. See the
[Pages verification record](docs/verification/pages-deployment.md) for tested
behavior and the first-publication checklist.

## Workspace layout and adding packages

pnpm discovers `packages/*` and `apps/*`. The current library identities live at
`packages/core` and `packages/lib-essential`; the private documentation application lives at `apps/docs`. Other applications
arrive with their roadmap items.

Create a manifest with a unique package name in the appropriate directory. Use
`private: true` for internal infrastructure or an unreleased scaffold. Declare `exports` explicitly;
an empty scaffold uses `{}`, while each advertised entry point must resolve to a
real supported module. Declare internal dependencies with `workspace:*` and
refresh the lockfile using `pnpm install`. Confirm discovery with
`pnpm list --recursive --depth -1`, then rerun the frozen install.

Use explicit source modules without `index.ts` barrel files, and export every
type defined by project code. Consume shared configurations by package identity
and exported entry point. Packages with source need applicable lint and typecheck
commands. For another library with the same environments:

1. Declare `@pomeranian/oxlint-config` and `@pomeranian/typescript-config` using
   `workspace:*`, plus the exact Oxlint, typed engine, and matching Node declaration
   dependencies shown in either existing library manifest.
2. Import `@pomeranian/oxlint-config/base` in local `oxlint.config.mts`. Apply
   `playwright-library` to library/helper inputs. Apply `playwright-test` only to
   actual tests; use the React profile only for React inputs. Do not add test or
   browser infrastructure solely to configure an empty library.
3. Extend `@pomeranian/typescript-config/library` from `tsconfig.library.json`
   owning `src/**/*`, and `/node` from `tsconfig.node.json` owning root `*.mts`.
   Keep Node 22 and Node 24 type roots separate as described above. Consumer
   paths belong here; reusable compiler policy belongs in the shared presets.
4. Create `tsconfig.json` with `files: []` and references to every leaf. Keep
   leaves non-composite. Check editor project selection with the workspace compiler.
5. Add `lint` and `lint:fix` matching the existing libraries, with zero warnings
   and safe fixes. Make `typecheck` explicitly run `tsc --noEmit --project` for
   each leaf. New files within the ownership globs enter checks automatically.
6. Keep explicit public exports and source modules, with exported type definitions
   and no barrels. An empty scaffold may use only `export {};` as compiler input.
7. Refresh the lockfile, run frozen installation, package checks/fixes, and the
   root aggregates. Confirm Turbo discovers and executes the new tasks. Follow
   the [lib-essential acceptance procedure](docs/verification/lib-essential-checks.md)
   to prove independent failures, ownership, cache invalidation, and recovery.

## Tests and documentation

Include meaningful tests and documentation with behavior changes in the same PR.
Use TDD; prefer colocated `node:test` and `node:assert` unit tests where suitable.
Each offered page object needs a React demo example and Playwright E2E coverage.
The first behavior slice will establish the demo and E2E infrastructure.
