# Extended core checking verification

This records the approved review extension to [#13](https://github.com/lolmaus/pomeranian/issues/13)
in [PR #24](https://github.com/lolmaus/pomeranian/pull/24). The
[contributor guide](../../CONTRIBUTING.md#package-linting-and-typechecking) is the
supported command/configuration contract. The [original record](core-checks.md)
retains earlier evidence; its single-project procedure is historical.

The approved seams are real package/root CLI commands, native TypeScript language
server project selection and diagnostics, and the required hosted check. Temporary
probes live in existing packages in isolated worktrees. No consumer package,
configuration-testing framework, application, or browser harness is delivered.

## Toolchain and ownership

Implementation checkpoint: `a54245d8d6181275709ae922c8d7ea10594c75eb`.
The unchanged author pins are Node `24.21.0`, pnpm `11.27.1`, Turbo `2.11.2`,
Oxfmt `0.70.0`, Oxlint `1.85.0`, and TypeScript `7.0.2`.
Added exact dependencies are `oxlint-tsgolint@7.0.2002`,
`eslint-plugin-playwright@2.12.0`, and its peer `eslint@10.11.0`.
Core's canonical Node declarations are `@types/node@22.20.4`; author tooling
uses `@types/node@24.13.6`, under the separate core alias described in the guide.
The pure tooling config package uses canonical Node 24 declarations.

Unused-preset acceptance temporarily installs `@playwright/test@1.63.0` and
`@types/react@19.3.0` in the isolated core consumer. These are probe dependencies,
not new permanent product dependencies. Actual runtime compatibility remains
assigned to the first Element_PO behavior slice, and packed-artifact/declaration
compatibility to packaging before publication.

The compatible typed-engine patch is a normal published release:
[tsgolint 7.0.2002](https://github.com/oxc-project/tsgolint/releases/tag/v7.0.2002).
The research notes retain primary-source rationale for
[typed discovery](../research/core-checks-typed-project-discovery.md),
[Playwright rules](../research/core-checks-playwright-lint-scope.md),
[React rules](../research/core-checks-react-lint-scope.md), and
[runtime assumptions](../research/core-checks-runtime-compatibility.md).

| Maintained inputs                  | Owning leaf                           | Shared environment              |
| ---------------------------------- | ------------------------------------- | ------------------------------- |
| `packages/core/src/**/*`           | `packages/core/tsconfig.library.json` | `library`, Node 22 declarations |
| Core root `*.mts` tooling          | `packages/core/tsconfig.node.json`    | `node`, Node 24 declarations    |
| All `packages/oxlint-config/*.mts` | That package's `tsconfig.node.json`   | `node`, Node 24 declarations    |

Empty root and package solutions discover these non-composite leaves. The actual
scripts explicitly check both core leaves and the configuration package leaf.
The JSON-only TypeScript config package has no invented source task.
Lib-essential stays source-free until [#14](https://github.com/lolmaus/pomeranian/issues/14).

## Repeatable current-package acceptance

Create an isolated worktree of the proposed revision. Select the pinned toolchain
using the contributor guide, unset package-manager overrides, keep logs outside
the worktree, and run:

```bash
node --version
pnpm --version
pnpm config get pmOnFail
pnpm install --frozen-lockfile
pnpm list --recursive --depth -1
pnpm list --recursive --depth 1
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

Use `pnpm --filter <package> exec tsc --noEmit --project <leaf> --listFilesOnly`
to inventory actual ownership and declarations for each leaf above. Check new
valid inputs under core `src/`, core root `.mts`, and config-package `.mts`
without changing preset globs. Use an exported value, then remove each probe.

Repeat the original record's [safe fix and equality cases](core-checks.md#lint-failure-safe-fixes-and-source-invalidation)
through current package/root commands. Capture SHA-256 before/after checks;
checks must preserve bytes. Reintroduce `let value = 1; export const probe = value;`
before each fixer invocation, then require a further fix to be idempotent.
The unknown-operand `==` case must remain a failure after safe fixing until
corrected to `===`. Repeat a new `.mts` lint defect in both tooling scopes.

For independent type failures, use `export const probe: string = undefined;`
in each real scope. Lint must pass, while package/root typecheck reports TS2322.
For core, temporarily changing only shared `strict` to false must let that same
input pass; restore the option and correct the input immediately. The strictness
toggle is a temporary acceptance control, not a supported configuration.

After warm aggregate runs and observed cache hits, repeat both
[shared-setting invalidation cases](core-checks.md#shared-configuration-invalidation)
with identical command arguments: `console.log` plus a new shared `no-console`
rule, and a string array index plus shared `noUncheckedIndexedAccess: true`.
Require fresh execution and the intended diagnostic without forcing misses or
clearing caches. Restore settings and inputs between cases.

For export boundaries, change core's base lint import to the physically existing
but unexported `@pomeranian/oxlint-config/base.mts`. Require export rejection,
temporarily export that same file, require success, then remove the export and
require rejection again. Repeat with core's library leaf extending the existing
but unexported `@pomeranian/typescript-config/library.json`; require TS6053,
success when explicitly exported, then TS6053 again. Restore all files. Scan for
emission after success, failure, and invalid `extends`.

Supplement the observed cache failures with
`pnpm exec turbo run lint typecheck --dry=json`. Save baseline hashes and input
lists; change one discovery/leaf/profile/preset/manifest/lockfile/workspace/runtime
input at a time, inspect affected task hashes, then restore it. Shared/global
inputs must affect both actual packages; core-local inputs must affect core.
Restored hashes must match. The installed external dependency hashes supplement
the complete lockfile and consumer manifest inputs. A changed hash alone does
not establish that a missing discovery reference still performs typed checking.

## Five-preset, framework, and editor acceptance

The [detailed profile record](core-checks-profiles.md) includes the exact temporary
wiring, representative inputs, executed commands, and diagnostic outcomes.

Use a separate isolated copy of the same existing packages. Add temporary
Playwright, Browser, and Browser+React leaves under core, with disjoint input
directories outside `src/` and root `*.mts`. Extend only the advertised public
presets. Add each leaf to core's empty discovery solution and explicitly append
its no-emit compiler invocation to core's temporary `typecheck` script.

Install the exact probe-only type dependencies above. Apply the Playwright test
fragment only to test inputs alongside the base policy. Run the complete React
profile through a separate config on explicit React source paths, including `.ts`
Hooks; join that invocation with the ordinary scoped core lint invocation in the
temporary `lint` and `lint:fix` scripts. This verifies public profile consumption
through the real package/root commands without applying React rules to tooling.

Every leaf must accept valid input and reject a deliberate type error. Node
tooling rejects `document`; Browser rejects unimported `process`; React compiles
automatic JSX without a default React import. Compare `node:fs`'s
`mkdtempDisposableSync` under the exact Node pins: library Node 22 must reject it,
author Node 24 must accept it. Repeat the library rejection with actual Playwright
type imports, inspecting resolved declarations. If those imports require DOM
types, add the exception in that temporary consuming leaf and document the
resulting mixed environment. Do not add DOM to the shared portable base.

For typed linting, give every intended leaf its own temporary consumer `paths`
mapping to an exported async helper in that leaf. Import it via that alias and
discard its promise. Typecheck must pass. Capture `OXC_LOG=debug` lint output
showing each file assigned to the intended configured program, then require
`typescript/no-floating-promises` through package/root lint. Correct by awaiting
or returning the promise and require success. Cover all three current leaves and
the three temporary future leaves independently. A removed discovery reference
may serve as a negative control; restore it before any success claim.

With real Playwright types, verify library and test API defects, dropped async
assertions, valid awaited/returned assertions, test-only restrictions, and narrow
assertion-helper recognition. A named assertion helper may pass `expect-expect`;
an ordinary action helper must not. Record alias and receiver-name limitations.

With React declarations, verify conditional Hooks in both `.tsx` components and
`.ts` custom Hooks, missing effect dependencies, and an impure render. Safe fixes
must preserve the dangerous dependency-array change for deliberate correction.
Prove common checks still execute and React diagnostics stay within React paths.

Start the repository compiler with `tsc --lsp --stdio`, initialize it with the
worktree root/workspace folder, open representative files, and request
`custom/projectInfo` and `textDocument/diagnostic`. Require the intended leaf and
representative diagnostic in each environment. Record actual server version and
distinguish this direct native-server evidence from a GUI session.

## Repeatable hosted acceptance

Use a disposable ready PR that will never be merged, based on the implementation.
Keep the production workflow unchanged. Require a clean hosted run first. Then:

1. Add a formatted core dropped-promise violation that typechecks locally.
   Installation and formatting must pass; root lint must report the typed rule
   and fail `Workspace checks`. Inspect the ready PR's blocked merge state.
2. Correct it by handling the promise; require a fresh successful required check.
3. Independently add the strict type error above. Formatting and lint must pass;
   root typecheck must report TS2322 and fail the required result. Inspect blocking.
4. Correct it and require success, then remove all probe files and require another
   clean hosted result. Close the disposable PR and delete its branch.

Logs must show the same single setup/frozen installation and actual core and
configuration-package tasks. Inspect the effective main rule: GitHub Actions
`Workspace checks`, strict up-to-date requirement, no bypass actors. Record the
revisions and run links for each transition.

## Restoration and final integration

Remove only known probe files, restore manifests/configs/lockfile, reinstall
frozen, and repeat the initial command list. Exercise both package fix commands,
root `lint:fix`, and formatting check/fix/check; the clean scaffold must remain
unchanged. Scan outside dependency/cache directories for JavaScript, declarations,
maps, and build-info output; review tracked/untracked changes and remove the
disposable worktrees. Deliver no dependencies, caches, or probe artifacts.

The unchanged #11 package-manager authority probes, #12 formatting behavior, and
#18 CI trigger/action/cache/rule evidence remain applicable. This record reruns
checks affected by new lint policy, dependencies, or project ownership; it does
not substitute old single-project results for them. #14 remains the last
foundation slice and owns the final twelve-case parent evidence index.

## Executed current-package evidence

Executed on 2026-09-22 in a detached worktree at the checkpoint above. The current-package CLI sequence recorded 96 commands with expected exit
codes, followed by individual cache-input comparisons and a complete output scan. Local audit logs were kept outside the delivered tree under
`/tmp/pomeranian-13-extension-evidence/cli`; the procedures and results below are
the durable record and do not depend on retaining that temporary directory.

| Commands / controlled input                                                    | Observed result                                                                                                                                                                                       |
| ------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Frozen install; runtime/package-manager/version/workspace inventory            | Install passed with the committed lockfile, 94 reused packages, zero downloads; Node 24.21.0, pnpm 11.27.1, `pmOnFail=error`, all five workspace identities. No authority override or legacy field.   |
| Both packages' lint/typecheck; root lint/typecheck/format                      | All passed; two real tasks per aggregate, no lib-essential or JSON-only placeholder execution. Config lint checked all five maintained `.mts` modules.                                                |
| `--listFilesOnly` for all three current leaves                                 | Library resolved only Node 22.20.4; both tooling programs resolved only Node 24.13.6. Core tooling also followed its actual shared-config imports.                                                    |
| New valid core source and `.mts` inputs in both tooling scopes                 | Package checks passed without changing preset globs; aggregate commands included them.                                                                                                                |
| Core `prefer-const`: package/root lint                                         | Both exited 1, expected rule; source SHA-256 unchanged (`17493479…f0b16`).                                                                                                                            |
| Package fix; root fix after each of two reintroduced defects; further root fix | All exited 0. Each root fixer reported cache bypass, repaired `let`, and the final invocation preserved the corrected digest (`6657818d…be32a`).                                                      |
| Unknown-operand `==`: package/root check and safe fix                          | All exited 1 with `eqeqeq`; digest unchanged (`4e35dae0…3e55f`). Changing to `===` passed.                                                                                                            |
| Core strict assignment after a warm root typecheck/cache hit                   | Lint passed. Package/root typecheck exited 1 with TS2322 and preserved bytes; shared `strict:false` control passed, restored strict policy plus corrected source passed.                              |
| Independent lint and type defects in core/config tooling `.mts`                | Each package and aggregate rejected its own defect; type-error inputs passed lint, then failed TypeScript. Safe lint fixes passed in both packages.                                                   |
| Warm root lint, then shared `eslint/no-console:error` only                     | Initial repeat hit both cached tasks; changed setting caused both misses and core `no-console` failure on unchanged source. Restoring the setting passed.                                             |
| Warm root typecheck, then shared `noUncheckedIndexedAccess:true` only          | Initial repeat hit both cached tasks; changed setting caused both misses and core TS2322 on unchanged array-index input. Restoration passed.                                                          |
| Existing hidden lint entry, temporary export, removed export                   | Exit 1 with package export denial, then 0, then 1.                                                                                                                                                    |
| Existing hidden TypeScript entry, temporary export, removed export             | Exit 1 with TS6053, then 0, then 1.                                                                                                                                                                   |
| Probe restoration; root lint/typecheck/fix/format; tracked diff                | All passed; no untracked probe files remained. No emitted JavaScript/maps/build-info after failed, successful, or invalid-extends checks; the restored tree also contained no generated declarations. |

A separate input accounting run changed all 20 reported global input files and
all four core-local discovery/leaf/manifest inputs individually. Every global
change altered both lint and typecheck hashes for both applicable packages; each
core-local change altered both core hashes. Restoring the inputs restored the
baseline hashes. This covered all six public TypeScript JSON entries, all four
public lint modules, their package manifests and configuration sources, root and
package discovery files, leaf configs, `.nvmrc`, `.gitignore`, workspace metadata,
and the whole lockfile. The dry run also reported external dependency hashes for
root, core, and the configuration package. After input restoration, a second
frozen install, both package check/fix commands, root check/fix commands, and
format check/fix/check all passed with an empty tracked diff and no probe files. These observations supplement the
actual cached-pass-to-diagnostic failures above.

## Editor release and selection evidence

On 2026-09-22, read-only inspection of the published Linux-x64 VSIX and its
[exact manifest](https://TypeScriptTeam.gallerycdn.vsassets.io/extensions/typescriptteam/native-preview/0.20260708.2/1783525257120/Microsoft.VisualStudio.Code.Manifest)
confirmed native extension `TypeScriptTeam.native-preview@0.20260708.2`, bundled
TypeScript 7.0.2, and editor requirement `^1.126.0`. The documented editor is
[VS Code 1.138.0](https://github.com/microsoft/vscode/releases/tag/1.138.0).
The [published archive](https://TypeScriptTeam.gallerycdn.vsassets.io/extensions/typescriptteam/native-preview/0.20260708.2/1783525257120/Microsoft.VisualStudio.Services.VSIXPackage)
was inspected as data, not installed or run. No VS Code GUI session was executed.

The release labels confirm **TypeScript: Enable TypeScript 7 Language Server**,
**TypeScript: Select TypeScript Version...**, and **TypeScript: Open TS Server
log**. Use the configured-SDK **Allow** prompt described in the contributor guide.
This release's automatic workspace picker scans `@typescript/native-preview`, so
an automatic **Use Workspace Version** item is not promised for our `typescript`
package. Its configured `js/ts.tsdk.path` route does resolve that package correctly.
If the initial prompt was dismissed, reload the window. As an explicit picker
alternative, add `js/ts.tsdk.additionalLocations: ["./node_modules/typescript"]`
to local settings and choose the matching **Use Custom Version** item. Verify
both version and resolved checkout path in the server log. The native extension's
[source](https://github.com/microsoft/typescript-go/blob/main/_extension/src/session.ts)
and inspected release bundle establish this distinction.

The native release does not implement the built-in **TypeScript: Go to Project
Configuration** command. With a source file active, use its TypeScript project
language-status entry instead; this displays the selected relative config path
and offers **Open Config File**. Its `custom/projectInfo` request is the same
interface exercised by the direct language-server acceptance probes.

### Additional source-extension coverage

Commit `fc432b9b4cd2767fed043a8089d8ca5d6ab6f7ec` widened core's Playwright
library override from `.ts` to `.ts`, `.tsx`, `.mts`, and `.cts`, matching the
TypeScript source forms covered by its library leaf. The existing `.ts` evidence
remains applicable. A targeted isolated probe created each extension in turn:

```ts
export async function pause(page: { waitForTimeout: (ms: number) => Promise<void> }) {
  await page.waitForTimeout(1);
}
```

For every extension, core lint exited 1 with `playwright/no-wait-for-timeout`
while core typecheck passed. Removing the probes restored passing root lint,
typecheck, and formatting. The isolated worktree was restored to its checkpoint
with an empty diff. No shared profile, dependency, preset, or hosted workflow
changed in this correction.

## Executed profile and editor evidence

The [profile record](core-checks-profiles.md) records 125 CLI commands with their
expected outcomes and a successful native `typescript-go` 7.0.2 session. All six
current/temporary leaves received independent compiler failures, project-dependent
dropped-promise failures/corrections, and native server project/diagnostic checks.
Actual Playwright and React declarations exercised all advertised environments
and the public base. Framework policy, assertion helpers, Hooks, dependency
checks, Compiler purity, common rules, and safe-fixer scope all passed. Every
probe and temporary dependency was restored, frozen install and clean checks
passed, and no generated outputs remained. No GUI verification was performed.

## Executed hosted evidence

Disposable [PR #26](https://github.com/lolmaus/pomeranian/pull/26) exercised both
workflow events for each revision on 2026-09-22:

| Revision                                                              | Push run                                                                      | PR run                                                                        | Outcome                                                                                                                                                                                      |
| --------------------------------------------------------------------- | ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Clean checkpoint `a54245d8d6181275709ae922c8d7ea10594c75eb`           | [35789529831](https://github.com/lolmaus/pomeranian/actions/runs/35789529831) | [35789556436](https://github.com/lolmaus/pomeranian/actions/runs/35789556436) | Both passed; ready PR was `MERGEABLE` / `CLEAN`.                                                                                                                                             |
| Dropped imported promise `13605e10c140a465f040c7eec5cdf700932345ce`   | [35789652518](https://github.com/lolmaus/pomeranian/actions/runs/35789652518) | [35789657117](https://github.com/lolmaus/pomeranian/actions/runs/35789657117) | Both failed at lint after frozen install and format passed; compiler step skipped; maintained-file diff passed. Ready PR was `MERGEABLE` / `BLOCKED`; `gh pr checks 26 --required` exited 1. |
| Typed correction `3ec158a52a98afdd2d4687b3f968fcbaea2f9f50`           | [35789856439](https://github.com/lolmaus/pomeranian/actions/runs/35789856439) | [35789860512](https://github.com/lolmaus/pomeranian/actions/runs/35789860512) | Both passed every step; ready PR returned `CLEAN`; required-check command exited 0.                                                                                                          |
| Independent compiler error `6d55d9e395ccd435de6d227f75663bb93f5320c6` | [35789971209](https://github.com/lolmaus/pomeranian/actions/runs/35789971209) | [35789976238](https://github.com/lolmaus/pomeranian/actions/runs/35789976238) | Both passed frozen install, format and both lint tasks, then failed core typecheck with TS2322; maintained-file diff passed. Ready PR returned `BLOCKED`; required-check command exited 1.   |
| Compiler correction `98743a0ec05b92779579bfdc111965506e693e3a`        | [35790075268](https://github.com/lolmaus/pomeranian/actions/runs/35790075268) | [35790084125](https://github.com/lolmaus/pomeranian/actions/runs/35790084125) | Both passed every step; ready PR returned `CLEAN`; required-check command exited 0.                                                                                                          |
| Probes removed `1086aea931106753cc19ca88627f5d0e90f131c9`             | [35790228059](https://github.com/lolmaus/pomeranian/actions/runs/35790228059) | [35790232106](https://github.com/lolmaus/pomeranian/actions/runs/35790232106) | Both passed every step on the exact checkpoint tree; ready PR was `CLEAN`; required-check command exited 0.                                                                                  |

The typed defect imported an async helper through `./acceptance-async.js` and
discarded its promise. It passed local formatting/typechecking; hosted lint
reported `typescript/no-floating-promises` at `src/acceptance-typed.ts:4:3`.
Returning the promise corrected it. The independent compiler defect used
`export const probe: string = undefined;`; hosted formatting and both lint tasks
passed before core typechecking reported TS2322. Changing the initializer to
`"valid"` corrected it. Each failed required check made the ready PR `BLOCKED`;
each correction returned it to `CLEAN`. The maintained-file diff passed even on
the deliberately failing runs.

The final revision removed all three probe files. Its tree
`9da73328e036fe7c2ac6bc2c0c8ad19a7f43656a` exactly matched the implementation
checkpoint; local diff/status were empty. Both final hosted jobs ran one toolchain
setup and frozen installation, formatting, both actual package lint tasks, and
both actual package typecheck tasks. The workflow, action pins, dependency metadata,
triggers, concurrency and cache policy were unchanged by these probes.

The effective [main rule](https://github.com/lolmaus/pomeranian/rules/23838726)
was rechecked: active on main, `Workspace checks` bound to GitHub Actions app
15368, strict up-to-date policy, no bypass actors, current-user bypass `never`.
No merge was attempted. PR #26 was closed unmerged and its remote branch deleted
after the final green runs. Earlier CI trigger/action/store-cache evidence remains
applicable; these new runs establish the amended checking behavior.

## Final checkout verification

After the coverage correction and documentation updates, the author checkout
again passed frozen installation, runtime/package-manager inventory, workspace
and Turbo discovery, both applicable packages' lint/fix/typecheck commands, root
lint/fix/typecheck, and format check/fix/check. The independent CLI and profile
worktrees were restored before removal. The hosted probe worktree matched its
clean implementation checkpoint before removal; its closed local probe branch
was deleted. No acceptance inputs, generated outputs, dependencies or caches are
included in the PR diff. #14 remains the next foundation slice after #13 merges.
