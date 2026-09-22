# Contributing to Pomeranian

An **author** maintains Pomeranian; a **developer** consumes it. Read the
[domain context](CONTEXT.md), [roadmap](ROADMAP.md), and
[development guidance](docs/agents/development.md) before changing the repository.

## Prerequisites

Install Git and the exact Node version in [.nvmrc](.nvmrc), currently `24.21.0`.
We recommend [fnm](https://github.com/Schniz/fnm); another compatible version
manager or an exact manual Node installation also works. npm comes with Node and
is used only to bootstrap pnpm in the instructions below.

pnpm must be available before installing workspace dependencies. Its exact version
is declared in root `package.json` under `devEngines.packageManager`, currently
`11.27.1`; that field is the package-manager version authority. Turbo is a local
workspace dependency, currently `2.11.2`, and needs no global installation.

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

| Command                            | Purpose                                                      |
| ---------------------------------- | ------------------------------------------------------------ |
| `node --version`                   | Confirm the selected runtime.                                |
| `pnpm --version`                   | Confirm the package manager selected by the bootstrap route. |
| `pnpm install --frozen-lockfile`   | Install the committed dependency graph.                      |
| `pnpm list --recursive --depth -1` | Discover workspace package identities.                       |
| `pnpm exec turbo --version`        | Run the repository-local task runner.                        |
| `pnpm exec turbo ls`               | Confirm Turbo discovers both library packages.               |

Turbo's initial configuration declares no tasks. The bootstrap has no source
checks or test suite. The source-free library packages acquire source inputs and
genuine checks in their approved follow-up tickets:
[formatting #12](https://github.com/lolmaus/pomeranian/issues/12),
[core checks #13](https://github.com/lolmaus/pomeranian/issues/13), and
[lib-essential checks #14](https://github.com/lolmaus/pomeranian/issues/14).

## Workspace layout and adding packages

pnpm discovers `packages/*` and `apps/*`. The current library identities live at
`packages/core` and `packages/lib-essential`; applications arrive with their
roadmap items.

Add a workspace package only within an approved slice. Create a manifest under
the appropriate directory with a unique package name and `private: true` for
internal infrastructure or an unreleased scaffold. Declare `exports` explicitly;
an empty scaffold uses `{}`, while each advertised entry point must resolve to a
real supported module. Declare internal dependencies with `workspace:*` and
refresh the lockfile using `pnpm install`. Confirm discovery with
`pnpm list --recursive --depth -1`, then rerun the frozen install.

Follow [development guidance](docs/agents/development.md) for source conventions,
shared configuration consumption, tests, and documentation. Source-bearing
packages require their applicable checks; the approved follow-up tickets
establish those shared configurations and commands before product development.

Keep dependencies, generated output, caches, and disposable verification files
outside maintained inputs. Preserve installed skills and existing planning
material. Updating a workspace package does not authorize publication or choose
its eventual distribution format.
