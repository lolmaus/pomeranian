# Lib-essential shared-check acceptance

Executed 2026-09-23 for [#14](https://github.com/lolmaus/pomeranian/issues/14),
after [PR #27](https://github.com/lolmaus/pomeranian/pull/27) merged as
`3de8a69cbba80c47183dd502e873329aff522c40`. The
[retrospective review](pr-27-review.md) separates standards and specification gaps.
The [foundation index](foundation-index.md) maps all twelve parent cases.

The seams are the approved real package/root CLI, repository native language
server, and hosted required job. Probes used isolated worktrees of the real
libraries, not extra packages. No product behavior, custom enforcement logic,
permanent test framework, browser infrastructure, or new preset was introduced.

## Toolchain and file ownership

Node **24.21.0**, pnpm **12.5.1**, Turbo **2.11.2**, Oxfmt **0.70.0**,
Oxlint **1.85.0**, oxlint-tsgolint **7.0.2002**, TypeScript **7.0.2**,
eslint-plugin-playwright **2.12.0**, ESLint **10.11.0**.
The follow-up keeps #27's pnpm upgrade and restores `onFail: error` plus
`pmOnFail: error`, preserving the specified strict mismatch contract.
With both environment overrides unset, pnpm **11.27.1** exits **1** for
`pnpm --version` and `pnpm install --frozen-lockfile`, reporting required
12.5.1 versus current 11.27.1. The supported bootstrap selects 12.5.1 successfully.
No legacy package-manager field or Turbo authority override is used.

| Consumer      | Maintained input | Owning leaf             | Public preset / declaration line   |
| ------------- | ---------------- | ----------------------- | ---------------------------------- |
| core          | `src/**/*`       | `tsconfig.library.json` | `/library`, canonical Node 22.20.4 |
| core          | root `*.mts`     | `tsconfig.node.json`    | `/node`, aliased Node 24.13.6      |
| lib-essential | `src/**/*`       | `tsconfig.library.json` | `/library`, canonical Node 22.20.4 |
| lib-essential | root `*.mts`     | `tsconfig.node.json`    | `/node`, aliased Node 24.13.6      |
| oxlint-config | root `*.mts`     | `tsconfig.node.json`    | `/node`, canonical Node 24.13.6    |

Every leaf is non-composite. Each package's empty `tsconfig.json` references all
its leaves. There is no root solution. Explicit `tsc --noEmit --project` commands
check each leaf; successful discovery-entrypoint checking is not acceptance.
Both library scaffolds are only `export {};`, the parent's permitted initial
compiler input, with empty public exports and no inter-library dependency.

## Repeatable local procedure and observations

Start from the follow-up revision in an isolated worktree, select the pinned
runtime, bootstrap the exact pnpm version, and install with
`pnpm install --frozen-lockfile`. Do not disable package-manager enforcement.
The executed worktree was `/tmp/pomeranian-14-probes`; disposable logs were
collected in `/tmp/pomeranian-14-evidence`. This document retains commands,
fixtures, diagnostics, and results without relying on those temporary paths.

In the tables below, **package/root** means run both:

```sh
pnpm --filter @pomeranian/lib-essential run lint
pnpm run lint
```

Substitute `lint:fix` or `typecheck` as specified. No cache directory was cleared,
no force option was used, and no cache-read bypass was used for invalidation.
Restore each fixture before introducing the next independent defect.

### Discovery, source coverage, and safe fixing

`pnpm list --recursive --depth -1` and `pnpm exec turbo ls` discovered the root
and four packages. Root lint/typecheck executed **three real tasks**: core,
lib-essential, and oxlint-config. JSON-only typescript-config has no fictitious
source task. Package and root lint, fix, and typecheck passed on clean scaffolds.

Add `src/acceptance.ts` and root `acceptance.mts` in **each** library containing
`export const acceptance: string = "valid";`. Both libraries' package checks and
root lint/typecheck/fix passed without editing input globs. Remove the inputs.

| Independent lib-essential probe                                         | Executed command                            | Observed result                                             |
| ----------------------------------------------------------------------- | ------------------------------------------- | ----------------------------------------------------------- |
| `let value = 1; export const probe = value;` in new `src/acceptance.ts` | Package/root lint                           | Both exit 1, `eslint(prefer-const)`; source bytes unchanged |
| Same defect with only shared `prefer-const` temporarily off             | Package/root lint                           | Both exit 0; restoring shared rule restores rejection       |
| Restore rule; fix defect                                                | Package `lint:fix`, package/root lint       | Exit 0, `let` becomes `const`                               |
| Reintroduce original defect after successful checks                     | Root `lint:fix`, package/root lint          | Exit 0, current file repaired; another fix is idempotent    |
| `export function equal(a: unknown, b: unknown) { return a == b; }`      | Package/root lint and package/root safe fix | All exit 1, `eslint(eqeqeq)` remains                        |
| Correct only `==` to `===`                                              | Package/root lint                           | Both exit 0                                                 |

These runs exercise real source invalidation after successful aggregate checks
and prove safe fixing does not replay cached results.

### Typed linting and explicit compiler leaves

For each lib-essential leaf independently, create an exported async helper and a
caller in its owned scope. Add a temporary **consumer-owned** mapping:

```json
{ "paths": { "#acceptance-async": ["./src/acceptance-async.ts"] } }
```

For tooling use `./acceptance-async.mts` instead. Helper and dropped-promise caller:

```ts
export async function acceptanceAsync(): Promise<void> {}
```

```ts
import { acceptanceAsync } from "#acceptance-async";
export function probe(): void {
  acceptanceAsync();
}
```

Package/root typecheck passed. With `OXC_LOG=debug`, package/root lint exited 1
with `typescript(no-floating-promises)` in the new caller. The typed-engine log
reported the source caller in `packages/lib-essential/tsconfig.library.json`
and, independently, the tooling caller in `packages/lib-essential/tsconfig.node.json`.
Both runs reported **two programs, zero unmatched files**. Thus the alias resolves
through the intended configured program, not an inferred fallback.
Making the caller async and awaiting the helper made package/root lint pass.
The temporary paths and helpers were removed after each case.

Run `pnpm --filter @pomeranian/lib-essential exec tsc --noEmit --project <leaf>
--listFilesOnly` to inspect actual new inputs and declarations. The library list
selected Node 22.20.4; tooling selected Node 24.13.6. Independently adding
`export const probe: string = undefined;` to a new library `.ts` and root tooling
`.mts` made package/root typecheck exit 1 with **TS2322**, while lint passed.
Changing only shared `strict` to false made each same defect pass; restoring
strictness and correcting the value to a string restored success. Both explicit
leaf commands execute on valid input; the tooling defect cannot hide behind a
successful library command.

Importing `mkdtempDisposableSync` from `node:fs` failed under the library leaf
with **TS2305** and passed under the tooling leaf. This confirms Node 22 versus
Node 24 declarations in this consumer; it does not prove runtime compatibility.

### Playwright library profile

Temporarily add `@playwright/test@1.63.0` to lib-essential with
`pnpm --filter @pomeranian/lib-essential add -D --save-exact @playwright/test@1.63.0`.
Actual Playwright declarations require DOM names, so add `lib: ["ES2023", "DOM"]`
only to the temporary consumer library leaf. The maintained preset is unchanged.
No browser binaries or test suite are installed.

| Library fixture                                                                                                | Package/root lint                                                          | Package/root typecheck   |
| -------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- | ------------------------ |
| Typed `Page` helper awaiting `page.waitForTimeout(1)`                                                          | Exit 1, `playwright/no-wait-for-timeout`                                   | Exit 0                   |
| Typed `Locator` helpers using `await expect(locator).toBeVisible()` and `return expect(locator).toBeVisible()` | Exit 0                                                                     | Exit 0                   |
| Typed `Locator` helper dropping `expect(locator).toBeVisible()`                                                | Exit 1, `playwright/missing-playwright-await` and typed promise diagnostic | Independent typed defect |

Restore the consumer leaf, manifest, and lockfile, remove fixtures, and rerun the
frozen install. The first sandboxed restoration could not access registry/store
files; rerunning with network access passed. This was an environment failure,
not an accepted package-check result. Test-only rules remain scoped to actual
test consumers; this scaffold has no test inputs. The unchanged five-preset,
React, and Playwright test-profile cases retain the
[#13 profile evidence](core-checks-profiles.md), including receiver-name limits.

### Cache behavior and public boundaries

Warm the identical root command twice; logs showed successful cached results.
For lint, use `export const probe = console.log("acceptance");`, then add
`"eslint/no-console": "error"` only to shared `base.mts`. Root lint executed
lib-essential afresh and exited 1 with `no-console`. Restore the rule: exit 0.
For typecheck, use `export const probe: string = ["value"][0];`, then set shared
`noUncheckedIndexedAccess: true`. Root typecheck executed afresh and exited 1
with TS2322. Restoring the setting restored success. Both cases were repeated
with the follow-up's strict pnpm policy and removal of the obsolete root cache
entry; no cache bypass was used.

`pnpm exec turbo run lint typecheck --dry=json` additionally confirmed both
lib-essential task hashes change for each independently changed package discovery
file, library leaf, tooling leaf, package manifest, shared Playwright library
profile, library preset, Node preset, complete lockfile, workspace settings, and
Node pin. Restoring bytes restored baseline hashes. Package defaults account for
local source/configuration/manifests; global inputs account for shared settings
and dependency metadata, alongside Turbo's external dependency hashes.

Public lint imports and TypeScript extends already pass through the real tools.
Change lib-essential's base import to the existing but unexported
`@pomeranian/oxlint-config/base.mts`: lint exits 1 with export rejection.
Temporarily export **that same existing file**: lint passes. Remove the export:
rejection returns. Repeat with `@pomeranian/typescript-config/library.json`:
typechecking reports TS6053, passes when that same file is temporarily exported,
and fails again after removing the export. Restore all paths/manifests.
This is an export-boundary test, not a missing-file test.

All maintained source was reviewed: explicit config entrypoints, no `index.ts`
barrels, no unexported project-defined types, and no public product declarations.
No additional policy variants or custom enforcement plugins were added.

## Native editor evidence

Run this checkout's `node_modules/.bin/tsc --lsp --stdio`, initialize JSON-RPC
with the real root URI/workspace folder and diagnostic/configuration capabilities,
answer `workspace/configuration`, then open a temporary file in each maintained
scope. Request `custom/projectInfo` and `textDocument/diagnostic` with its URI.
The server identified itself as **typescript-go 7.0.2** from the installed
repository compiler. The fixture contained a strict undefined-to-string error
and `document.title`.

| File scope                 | Selected configuration      | Diagnostics    |
| -------------------------- | --------------------------- | -------------- |
| lib-essential `src/*.ts`   | Its `tsconfig.library.json` | TS2322, TS2584 |
| lib-essential root `*.mts` | Its `tsconfig.node.json`    | TS2322, TS2584 |
| core `src/*.ts`            | Its `tsconfig.library.json` | TS2322, TS2584 |
| core root `*.mts`          | Its `tsconfig.node.json`    | TS2322, TS2584 |
| oxlint-config root `*.mts` | Its `tsconfig.node.json`    | TS2322, TS2584 |

All five projects were discovered **without a root tsconfig**. This replaces
that aspect of earlier root-solution evidence. The documented supported setup
remains VS Code 1.138.0, native extension 0.20260708.2, explicit workspace SDK
consent, and the committed editor settings. See the
[selection instructions](../../CONTRIBUTING.md#typescript-environments-and-editor-setup).
No VS Code GUI session was executed. Fixtures were removed and the server shut
down cleanly.

## Hosted required-job evidence

[Disposable PR #28](https://github.com/lolmaus/pomeranian/pull/28) targets main
and is never to be merged. It uses the existing single setup/install and unchanged
CI workflow. Every probe is formatted; preceding checks pass before the intended
failure. The typed fixture resolves an exported async helper via `.js` into its
real TypeScript module; the independent compiler fixture is the strict assignment
above. Core and oxlint-config successes cannot conceal lib-essential's failures.

| Probe                          | Revision                                                                                           | Required PR run                                                               | Result                                                                                           |
| ------------------------------ | -------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Dropped helper promise         | [`f8264c8`](https://github.com/lolmaus/pomeranian/commit/f8264c8071a77d254b527fa102ad0a17f6405c6f) | [35906705897](https://github.com/lolmaus/pomeranian/actions/runs/35906705897) | Failure at lint: `src/acceptance-typed.ts:4:3`, promise must be awaited; core/config lint passed |
| Await helper promise           | [`a8b473f`](https://github.com/lolmaus/pomeranian/commit/a8b473fe1780aecca9b1330771c4d8535ad3874d) | [35906817211](https://github.com/lolmaus/pomeranian/actions/runs/35906817211) | Success; all three lint/typecheck tasks passed; merge state CLEAN                                |
| Independent strict type defect | [`90f8513`](https://github.com/lolmaus/pomeranian/commit/90f8513c0c580e60613967d268138c9127a2e60a) | [35906955853](https://github.com/lolmaus/pomeranian/actions/runs/35906955853) | Formatting/lint passed; typecheck failed with TS2322 in lib-essential; merge state BLOCKED       |
| Remove all probes              | [`df5a138`](https://github.com/lolmaus/pomeranian/commit/df5a138462ae353c6c7cc2fb2fd9af24a0c53e79) | [35907242205](https://github.com/lolmaus/pomeranian/actions/runs/35907242205) | Success; all probes removed, all three check tasks passed; merge state CLEAN                     |

Main's effective rule is active ruleset **23838726**, requiring `Workspace checks`
from GitHub Actions app **15368**, with strict up-to-date checks, **no bypass
actors**, and current-user bypass **never**. The lint failure PR was `BLOCKED`;
the corrected revision was `CLEAN`. The recovery logs report Node 24.21.0, pnpm 12.5.1, restored dependency cache,
and a real frozen install. Locally, changing only lib-essential's declared Oxlint
version to 1.84.0 made pnpm 12.5.1 frozen installation exit 1 with
`ERR_PNPM_OUTDATED_LOCKFILE`; restoring the manifest restored installation.
Workflow triggers, action pins, concurrency,
cache setup, and the single install remain unchanged.

## Restoration and integration

All temporary source, alias, DOM, dependency, and shared-setting changes were
restored. The probe worktree retained only the follow-up's intentional strict
pnpm settings and obsolete-cache-entry removal; no temporary input remained.
The lockfile is unchanged from merged #27. The following complete command rerun
passed in the task checkout on 2026-09-23 with the same implementation settings:

| Command group                   | Executed commands                                                                                                     | Outcome                                                          |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| Authority and install           | `node --version`; `pnpm --version`; `pnpm config get pmOnFail`; `pnpm install --frozen-lockfile`                      | All exit 0; v24.21.0 / 12.5.1 / error; frozen metadata unchanged |
| Workspace inventory             | `pnpm list --recursive --depth -1`; `pnpm exec turbo --version`; `pnpm exec turbo ls`                                 | All exit 0; all five workspace identities, Turbo 2.11.2          |
| All applicable package commands | `pnpm --filter @pomeranian/<package> run <task>` for core, lib-essential, oxlint-config and lint, lint:fix, typecheck | All nine commands exit 0                                         |
| Root checks/fixes               | `pnpm run lint`; `pnpm run lint:fix`; `pnpm run typecheck`                                                            | All exit 0; three real tasks per aggregate                       |
| Formatting and patch integrity  | `pnpm run format`; `pnpm run format:fix`; `pnpm run format`; `git diff --check`                                       | All exit 0                                                       |

SHA-256 comparison of maintained tracked files before/after the command rerun
was unchanged. Package-source inspection found no emitted JavaScript, maps, or
build metadata. New documentation is the only added deliverable; temporary
clients/orchestration and logs remain outside the repository. The disposable
hosted PR was closed without merging after clean recovery. Its linked revisions
and runs preserve failure evidence after branch cleanup.

[Follow-up PR #29](https://github.com/lolmaus/pomeranian/pull/29) runs the unchanged required workflow against its
proposed merge result. At implementation commit
[`31b2aa4`](https://github.com/lolmaus/pomeranian/commit/31b2aa4),
[push run 35907571380](https://github.com/lolmaus/pomeranian/actions/runs/35907571380)
and [PR run 35907577984](https://github.com/lolmaus/pomeranian/actions/runs/35907577984)
both passed. Later evidence-link edits retain the same implementation. These
checks provide current review evidence; the
post-merge main checkpoint below is deliberately separate.

Historical #11/#12/#18 and #13 evidence is retained where its behavior and pins
are unchanged. The pnpm mismatch and frozen-install checks are repeated for
12.5.1; package-local native discovery and both libraries' current clean commands
are revalidated here. Runtime behavior under supported Node LTS versions belongs
to the first Element_PO behavior slice. Packed JavaScript and public declarations
belong to packaging before publication. This scaffold proves neither obligation.

The follow-up remains subject to author approval before merge. The final
post-merge frozen install, complete clean command rerun, and hosted main result
must be recorded against its integrated revision as described in the
[foundation index](foundation-index.md); neither #14 nor roadmap item 1 is marked
done in advance of that checkpoint.
