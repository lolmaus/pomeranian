# Core checking verification (original scope)

This is the historical verification record before the approved review extension.
Use [extended core-check verification](core-checks-extension.md) for the current
configuration contract, repeatable procedures, and acceptance evidence. The
original procedures below describe the earlier single-project layout.

This records [core checks #13](https://github.com/lolmaus/pomeranian/issues/13),
part of [monorepo setup #9](https://github.com/lolmaus/pomeranian/issues/9), in
[PR #24](https://github.com/lolmaus/pomeranian/pull/24). Acceptance uses the actual
workspace commands, real core consumer, and required GitHub Actions result.

## Toolchain and configuration contract

Verified on 2026-09-22 with Node `24.21.0`, pnpm `11.27.1`, Oxfmt `0.70.0`,
Turbo `2.11.2`, Oxlint `1.85.0`, and TypeScript `7.0.2`. The established runtime,
package-manager, formatter, and Turbo pins remain unchanged. Oxlint and TypeScript
were selected from their current stable releases and pinned exactly. Both execute
with the pinned Node version. Turbo's real root checks use the existing
`devEngines.packageManager` authority without a legacy alias or disabled checks.

Sources: [Oxlint release](https://github.com/oxc-project/oxc/releases/tag/oxlint_v1.85.0),
[Oxlint runtime requirements](https://registry.npmjs.org/oxlint/1.85.0),
[TypeScript release](https://github.com/microsoft/TypeScript/releases/tag/v7.0.2),
[TypeScript runtime requirements](https://registry.npmjs.org/typescript/7.0.2),
[Turbo package-manager support](https://turborepo.dev/blog/2-11#devenginespackagemanager-support).

Core consumes `@pomeranian/oxlint-config/base` and
`@pomeranian/typescript-config/base` through declared workspace dependencies and
explicit exports. Its local configurations own their source inclusion. Core's
`src/scaffold.ts` contains only `export {};`; it supplies a compiler input without
product declarations or public product exports. The `.mts` tooling configuration
has a known module form without deciding core's eventual distribution format.
Lib-essential remains source-free until #14.

The Oxlint configuration package contains typed configuration and runs genuine
lint, fix, and typecheck tasks. The TypeScript configuration package contains only
JSON, so it needs no source tasks or build. Package typecheck scripts pass
`--noEmit` as well as inheriting the shared setting; an invalid `extends` cannot
cause output by making inherited options unavailable. No compiler checks or
library checking are disabled.

Turbo caches successful lint/typecheck logs, with no emitted outputs. Default
package inputs include local configurations, manifests, and new source. Explicit
global inputs cover the flat shared configurations and their manifests, the
lockfile, workspace settings, Node pin, and Git ignore rules. Shared or dependency
changes conservatively invalidate all checks. Fix tasks have caching disabled.
See [CONTRIBUTING.md](../../CONTRIBUTING.md#package-linting-and-typechecking) for commands
and the input-maintenance convention.

Sources: [Oxlint shared configurations](https://oxc.rs/docs/guide/usage/linter/config#extend-shared-configs),
[TypeScript inheritance](https://www.typescriptlang.org/tsconfig/extends.html),
[noEmit](https://www.typescriptlang.org/tsconfig/noEmit.html),
[Turbo cache inputs](https://turborepo.dev/docs/crafting-your-repository/caching#task-inputs).

## Repeatable CLI acceptance

Use an isolated worktree of the proposed revision, select the pinned toolchain
as documented in [CONTRIBUTING.md](../../CONTRIBUTING.md), and run
`pnpm install --frozen-lockfile`. Keep logs outside the repository. For core
probes, create `packages/core/src/acceptance.ts` in the existing core package.
Configuration-package probes use a temporary `.mts` file in that package.
No extra consumer package is needed. Restore each probe before the next case.

Start with the clean scaffold and run:

```bash
node --version
pnpm --version
pnpm config get pmOnFail
pnpm list --recursive --depth -1
pnpm exec turbo --version
pnpm exec turbo ls
pnpm --filter @pomeranian/core run lint
pnpm --filter @pomeranian/core run typecheck
pnpm --filter @pomeranian/oxlint-config run lint
pnpm --filter @pomeranian/oxlint-config run typecheck
pnpm run lint
pnpm run typecheck
pnpm run format
```

The two applicable packages must actually execute lint/typecheck. The source-free
library and JSON-only configuration must have no placeholder tasks. Add a valid
exported value in the temporary core source and rerun package/root commands to
prove automatic discovery. Run each root check again and observe a cache hit.

### Lint failure, safe fixes, and source invalidation

Use this supported, formatted defect after the successful aggregate run:

```typescript
let value = 1;
export const probe = value;
```

Package and root lint must execute and fail with `eslint(prefer-const)`, while a
before/after digest of the input remains identical. The failure depends on the
shared explicit rule. Run the package fixer, then lint; it must replace `let`
with `const` and pass. Reintroduce the defect and repeat through the root fixer;
reintroduce it once more and invoke that fixer again. All fixes must execute.
A further invocation on corrected source must preserve it.

```bash
pnpm --filter @pomeranian/core run lint:fix
pnpm --filter @pomeranian/core run lint
pnpm run lint:fix
pnpm run lint
```

For an unfixable violation, use an exported function returning `left == right`
with both parameters typed `unknown`. Package and root lint must fail with
`eslint(eqeqeq)`; safe fix commands must continue to fail and leave it unchanged.
Correct the comparison to `===` and confirm success.

### Type failure and source invalidation

After a successful root typecheck and cache hit, use:

```typescript
export const probe: string = undefined;
```

Package and root typechecking must execute and fail with TS2322. Temporarily
setting only shared `strict` to `false` must make that same input pass, proving
that the shared option is consumed. Restore `strict: true`, correct the source to
an actual string, and confirm success. Check for emitted JavaScript, maps, and
build-info files after both failing and passing commands.

### Shared configuration invalidation

Keep the command identical before and after each setting change. Do not use
`--force`, clear caches, or change task arguments to manufacture a miss.

- Lint: an exported function calling `console.log` passes under the baseline.
  Warm root lint, then add only shared `eslint/no-console: "error"`. Root lint
  must execute and fail on the same source. Restore the rule and source.
- Typecheck: `export const first: string = ["value"][0];` passes under the
  baseline. Warm root typecheck, then add only shared
  `noUncheckedIndexedAccess: true`. Root typecheck must execute and fail with
  TS2322 on that unchanged source. Restore the option and source.

The shared change must invalidate both applicable tasks. Dependency metadata is
also covered by the whole-lockfile and manifest inputs, rather than relying only
on source hashes. A diagnostic dry run may supplement observable outcomes but
cannot replace them.

### Export boundaries and configuration source

The normal package commands must resolve both public entry points. Change the
core lint import to `@pomeranian/oxlint-config/base.mts`, whose physical file
exists but is unexported; lint must fail with `ERR_PACKAGE_PATH_NOT_EXPORTED`.
Change core's TypeScript `extends` to
`@pomeranian/typescript-config/base.json`, also existing but unexported; typecheck
must fail with TS6053 and emit nothing. Adding only the corresponding temporary
export should permit resolution, and removing it should reject the path again.
Restore both manifests and consumer configurations.

Temporarily introduce a lint violation and, separately, a type error into the
Oxlint configuration package's own maintained source. Its package and aggregate
commands must detect those errors too. Restore the source, review for barrel
files and unexported project-defined types, and verify each advertised entry
point exists.

### Cleanup and final commands

Remove only the temporary probe inputs, restore configuration and manifest
changes, and preserve the real scaffold. Rerun frozen installation, every check
above, package fix commands for both applicable packages, and root `lint:fix`.
Repeat formatting after fixes and confirm the tracked tree is unchanged.
Generated output, dependencies, caches, and probe logs must be absent from the
change delivered for review.

## Repeatable hosted acceptance

Use a disposable branch based on the implementation, and open a ready PR to main
for merge-eligibility inspection. Its defects must never be merged.

1. Confirm a clean run executes formatting, root lint, and root typecheck in the
   existing `Workspace checks` job, after its one toolchain setup and frozen
   installation. Logs must include both core and the Oxlint configuration tasks.
2. Push the same formatted `prefer-const` defect used above. Installation and
   formatting must pass; lint must execute, emit the intended core diagnostic,
   and fail the required result. Typecheck may be skipped after that failure.
   The final tracked-file diff must pass, and the ready PR must be blocked.
3. Correct the defect with the real fixer. All checks and the required result
   must pass again, restoring merge eligibility.
4. Replace the probe with the strict type error above. Formatting and lint must
   pass first; typecheck must execute, emit TS2322 for core, and fail the required
   result. Correct it and require a fresh successful hosted result.
5. Remove the probe entirely and confirm another clean run. Inspect the effective
   main rule for the same required GitHub Actions check, strict up-to-date policy,
   and no bypass actors. Close the probe PR and remove its branch/worktree.

Record revisions, run URLs, command outcomes, and merge eligibility. Preserve
#18's triggers, dependency-cache policy, immutable action pins, and merge rules.
This procedure reuses consumer failures rather than testing YAML structure.

## Executed evidence

Executed on 2026-09-22 against implementation checkpoint
[`e09f91a`](https://github.com/lolmaus/pomeranian/commit/e09f91a5b2d412b3784cbe84d1fffbab4ccc1844),
using separate CLI and hosted verification worktrees. Before implementation,
`pnpm run lint` and `pnpm run typecheck` each failed with `ERR_PNPM_NO_SCRIPT` and
exit status 1. The implementation provides two real lint and two real typecheck
tasks: core and the Oxlint configuration package.

### CLI outcomes

The commands and probe inputs in the procedure above were executed. In this table,
package commands mean `pnpm --filter @pomeranian/core run SCRIPT`, or
`@pomeranian/oxlint-config` where identified; root commands mean `pnpm run SCRIPT`.
Successful commands exited 0 and the intended failing check commands exited 1.

| Case                          | Executed commands and observed outcome                                                                                                                                                                                                                                                                          |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Clean scaffold and new source | Package/root `lint` and `typecheck` passed. Adding a new core source exporting a valid value was discovered automatically by all four commands. Both configuration source files were checked as well.                                                                                                           |
| Shared lint diagnostic        | Package/root `lint` failed with `eslint(prefer-const)` on the stated `let` probe. Its SHA-256 remained `174934797fb6434112433512ce40f4f7626199c69a07eeda71c95d7ab2ff0b16` after both checks.                                                                                                                    |
| Safe fixes execute            | Package and root `lint:fix` each changed only `let` to `const`. Reintroducing the defect made each fixer repair it again. Further invocations on corrected input preserved its bytes. Every root fix invocation reported both actual tasks executing with cache disabled.                                       |
| Unfixable violation           | Package/root `lint` and `lint:fix` failed on `eslint(eqeqeq)` for unknown operands. Both fix commands preserved SHA-256 `9e29f043d555fdeee141990dcc89d9fccfc03ebc2dee8bd59c41c718d0aa87f0`. Replacing `==` with `===` passed.                                                                                   |
| Shared compiler setting       | The stated string/undefined probe passed lint and failed package/root `typecheck` with TS2322. Changing only shared `strict` to `false` made that identical source pass; restoring it restored failure. Correcting the initializer to `"valid"` passed.                                                         |
| Source invalidation           | Root `lint` and `typecheck` each first reached two cache hits. Their respective source defects then made core miss and fail, while the unchanged configuration package remained cached.                                                                                                                         |
| Shared lint invalidation      | Root lint reached two cache hits with an exported console call. Adding only shared `eslint/no-console: "error"` caused both tasks to miss and execute, failing on the expected core diagnostic. Restoring the setting passed.                                                                                   |
| Shared compiler invalidation  | Root typecheck reached two cache hits with the array-index probe. Adding only shared `noUncheckedIndexedAccess: true` caused both tasks to miss and execute; core failed TS2322 because indexed access could yield `undefined`. Restoring the setting passed.                                                   |
| Export boundaries             | Public entries resolved through package lint/typecheck. The existing unexported `base.mts` and `base.json` subpaths failed with `ERR_PACKAGE_PATH_NOT_EXPORTED` and TS6053 respectively. Temporarily exporting the same unchanged files restored success. All exports and consumer configuration were restored. |
| Configuration source coverage | An added `.mts` source in the Oxlint configuration package failed its package/root lint checks on `prefer-const`; its package fixer repaired it. A separate type error passed lint and failed package/root typecheck with TS2322; correction passed. The source was removed.                                    |
| Version authority             | Temporarily changing only `devEngines.packageManager.version` to `11.27.0` made root `lint`, `lint:fix`, and `typecheck` reject the mismatch before tasks ran. Restoring `11.27.1` restored success; `pmOnFail` remained `error`.                                                                               |
| No emitted product output     | Checks after success, type errors, shared-setting failures, and invalid `extends` found no JavaScript, JSX, module output, source maps, or build-info files outside dependency/cache directories.                                                                                                               |
| Source conventions            | Retained core source contains only `export {};`; configuration sources contain declarative configuration. There are no barrel files or unexported project-defined types. Both libraries keep empty public exports, and lib-essential is unchanged.                                                              |

No cache was cleared and no force flag or altered task argument was used for
invalidation. Turbo's uncached fixer reports “cache bypass, force executing”
because of its configured `cache: false`, not a probe override. Supplemental
`pnpm exec turbo run lint --dry=json` and the corresponding typecheck dry run
confirmed hashes for package inputs, the documented global files, and external
dependencies. Actual failing commands above establish the behavior.

The initial fresh-worktree offline install lacked pnpm's registry policy metadata
and failed with `ERR_PNPM_NO_OFFLINE_META`; ordinary
`pnpm install --frozen-lockfile` succeeded without policy overrides. The final
frozen install also succeeded without metadata changes. After restoring all CLI
probes, every version/discovery/check command listed above, both packages'
`lint:fix`, root `lint:fix`, and `format:fix` followed by `format` passed.
`git diff --exit-code HEAD`, `git diff --check`, and an empty `git status --short`
confirmed the clean checkpoint. Inspection found no generated product output.

### Hosted outcomes

All runs below used the existing single `Workspace checks` job and its one frozen
installation. The effective versions remained Node `24.21.0` and pnpm `11.27.1`.

| Revision and case                 | Push                                                                  | Pull request                                                          | Outcome                                                                                                                                                                                      |
| --------------------------------- | --------------------------------------------------------------------- | --------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `e09f91a`: initial implementation | [Run](https://github.com/lolmaus/pomeranian/actions/runs/35773290287) | [Run](https://github.com/lolmaus/pomeranian/actions/runs/35773409572) | All checks passed; both core and the typed configuration package ran lint and typecheck.                                                                                                     |
| `d7972a5`: formatted lint defect  | [Run](https://github.com/lolmaus/pomeranian/actions/runs/35773520035) | [Run](https://github.com/lolmaus/pomeranian/actions/runs/35773527306) | Install/format passed. Core lint emitted `eslint(prefer-const)` at `src/acceptance.ts:1:5` and failed. The configuration package ran lint; typecheck was skipped. Final tracked diff passed. |
| `bf72266`: lint correction        | [Run](https://github.com/lolmaus/pomeranian/actions/runs/35773683956) | [Run](https://github.com/lolmaus/pomeranian/actions/runs/35773688634) | All checks passed after the real package fixer corrected the defect.                                                                                                                         |
| `db6e3b3`: independent type error | [Run](https://github.com/lolmaus/pomeranian/actions/runs/35773820520) | [Run](https://github.com/lolmaus/pomeranian/actions/runs/35773825608) | Install/format/lint passed. Core typecheck emitted TS2322 at `src/acceptance.ts:1:14`; the configuration package also ran typecheck. Final tracked diff passed; the required job failed.     |
| `a471a00`: type correction        | [Run](https://github.com/lolmaus/pomeranian/actions/runs/35773957847) | [Run](https://github.com/lolmaus/pomeranian/actions/runs/35773963720) | All checks passed after replacing the invalid initializer with a string.                                                                                                                     |

Ready [probe PR #25](https://github.com/lolmaus/pomeranian/pull/25) was
`MERGEABLE` but `BLOCKED` on each deliberate failure, and `CLEAN` after each
correction. The failures reached the intended commands independently. Turbo can
stop peer tasks when one fails, so the failure evidence uses the actual package
logs; the clean runs establish completion of all applicable checks.

Active ruleset `23838726` remains unchanged: `refs/heads/main` requires
`Workspace checks` from GitHub Actions app `15368`, with
`strict_required_status_checks_policy: true` and no bypass actors. Both the
ruleset and effective branch-rules APIs were inspected. Workflow triggers,
concurrency, timeout, dependency-store cache, action pins, and action-update policy
were preserved.

Restoration revision `1594e41` removed the probe entirely. Its
[push](https://github.com/lolmaus/pomeranian/actions/runs/35774078665) and
[PR](https://github.com/lolmaus/pomeranian/actions/runs/35774083416) runs both passed.
`git diff --exit-code e09f91a HEAD` confirmed the restored hosted tree exactly
matched the clean implementation checkpoint. The CLI worktree was also clean at
that checkpoint. Probe PR #25 was closed without merging, its remote branch was
deleted, and both disposable local worktrees and branches were removed. Probe
logs stayed outside the deliverable. PR #24 remains open for the author's review
and explicit merge approval; #13 and parent #9 remain open until integration.

## Remaining foundation work

This slice covers core and applicable configuration packages. Lib-essential's
independent wiring and hosted failure evidence remain in
[#14](https://github.com/lolmaus/pomeranian/issues/14). That final foundation slice
owns the complete clean-scaffold rerun, integrated hosted result, and durable
index for all twelve parent cases. Existing [bootstrap](bootstrap.md),
[formatting](formatting.md), and [CI](ci.md) evidence remains valid for unchanged
behavior; repeat any probe whose relevant inputs are changed by later work.
