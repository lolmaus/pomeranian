# Foundation acceptance index

This is the durable index for all twelve acceptance cases in
[monorepo setup #9](https://github.com/lolmaus/pomeranian/issues/9), including the
amended typed/framework linting and TypeScript/editor scope. It supplements the
original bootstrap record rather than treating that narrower run as sufficient.

As of 2026-09-23, bootstrap #11, formatting #12, CI #18, and core #13 have
integrated. [PR #27](https://github.com/lolmaus/pomeranian/pull/27) integrated
lib-essential wiring. [Follow-up PR #29](https://github.com/lolmaus/pomeranian/pull/29)
integrated acceptance as `e05bbf62490358fc53f723f30a730b552da53d6a`.
The [final integration record](https://github.com/lolmaus/pomeranian/issues/14#issuecomment-5801494603) completes the checkpoint; #14 is closed. The [retrospective review](pr-27-review.md) explains why
#14 still needed this follow-up. Its local and hosted acceptance is recorded in
[lib-essential checks](lib-essential-checks.md).

## Acceptance map

| Parent case                                                                                     | Current evidence                                                                                                                                                                                                                                                                                                                                       | Verified scope                                                                                                                                                |
| ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Pinned bootstrap, frozen install, mismatch contract                                          | [Bootstrap](bootstrap.md), [current pnpm and ownership](lib-essential-checks.md#toolchain-and-file-ownership), [restoration](lib-essential-checks.md#restoration-and-integration)                                                                                                                                                                      | Node 24.21.0, pnpm 12.5.1; author-approved automatic download verified from a mismatched launcher. Final integrated rerun passed; see the checkpoint below.   |
| 2. Both real consumers, public configs, new inputs, real aggregates                             | [Core CLI](core-checks-extension.md), [lib-essential and both-library coverage](lib-essential-checks.md#discovery-source-coverage-and-safe-fixing)                                                                                                                                                                                                     | Three executable check tasks; JSON-only preset package needs no dummy task. Both libraries remain empty of product behavior.                                  |
| 3. Formatting failure, fixes, preservation, idempotence                                         | [Formatting evidence](formatting.md), [current clean rerun](lib-essential-checks.md#restoration-and-integration)                                                                                                                                                                                                                                       | Oxfmt 0.70.0, config and scope unchanged; original intentional-defect evidence remains applicable.                                                            |
| 4. Independent lint/fix, typed programs, framework profiles                                     | [Core CLI](core-checks-extension.md), [five-preset/framework cases](core-checks-profiles.md), [lib-essential safe fixes](lib-essential-checks.md#discovery-source-coverage-and-safe-fixing), [typed leaves](lib-essential-checks.md#typed-linting-and-explicit-compiler-leaves), [library profile](lib-essential-checks.md#playwright-library-profile) | Both actual consumers independently verified. Unused React and Playwright test profiles retain #13 evidence; no extra variants or browser infrastructure.     |
| 5. Shared-setting-dependent compiler errors, five environments, editor discovery                | [Core profile evidence](core-checks-profiles.md), [lib-essential leaf checks](lib-essential-checks.md#typed-linting-and-explicit-compiler-leaves), [current native editor](lib-essential-checks.md#native-editor-evidence)                                                                                                                             | Node 22 library / Node 24 tooling split; all five maintained leaves rediscovered without root solution. Direct native server, not GUI verification.           |
| 6. Source/shared/dependency invalidation and uncached fixing                                    | [Core cache evidence](core-checks-extension.md), [lib-essential current cache cases](lib-essential-checks.md#cache-behavior-and-public-boundaries)                                                                                                                                                                                                     | Actual failing root commands after warm successes; no forced misses. Discovery/leaf/profile/preset/dependency hash accounting included.                       |
| 7. Public exports and rejection of existing private subpaths; source conventions                | [Core boundaries](core-checks-extension.md), [lib-essential boundaries](lib-essential-checks.md#cache-behavior-and-public-boundaries)                                                                                                                                                                                                                  | Existing files fail, pass when temporarily exported, fail again when hidden. Explicit modules, no barrels, exported types, empty product exports.             |
| 8. Cleanup, frozen install, all documented commands, evidence                                   | [Current restoration and command rerun](lib-essential-checks.md#restoration-and-integration)                                                                                                                                                                                                                                                           | No probes, product JavaScript, build metadata, or dependency artifacts delivered. Final integrated revision rerun passed.                                     |
| 9. Hosted authority, frozen metadata, push and draft/documentation PR triggers                  | [CI hosted cases](ci.md), [current hosted consumer runs](lib-essential-checks.md#hosted-required-job-evidence)                                                                                                                                                                                                                                         | Same workflow/action authorities, one setup/install; current runs use Node 24.21.0 and pnpm 12.5.1. Original trigger evidence remains applicable.             |
| 10. Dependency-cache miss/hit, frozen rejection, cancellation streams                           | [CI cache and cancellation evidence](ci.md), [current hosted evidence](lib-essential-checks.md#hosted-required-job-evidence)                                                                                                                                                                                                                           | Action pins, cache implementation and concurrency unchanged. Current consumer runs repeat warm frozen installation; current pnpm rejects mismatched metadata. |
| 11. Required formatting, independent library typed-lint/type failures and recovery, merge rules | [CI formatting and rules](ci.md), [core hosted cases](core-checks-extension.md#executed-hosted-evidence), [lib-essential hosted cases](lib-essential-checks.md#hosted-required-job-evidence)                                                                                                                                                           | Independent failing/corrected revisions; effective rule inspected again with strict up-to-date checks and no bypass actors.                                   |
| 12. Action pins/update policy, cleanup, final integrated result and index                       | [CI pin/update evidence](ci.md), [current cleanup](lib-essential-checks.md#restoration-and-integration), this index                                                                                                                                                                                                                                    | Action pins and weekly reviewed Actions-only updates unchanged. Final hosted main result and integrated local rerun passed.                                   |

Earlier framework/preset evidence remains valid: their implementations and exact
compiler/linter/plugin/declaration pins are unchanged by #27 or this follow-up.
Current frozen installation and actual package/root runs validate the new pnpm
combination. Root-solution editor evidence is superseded by the current five-leaf
native-server test; bootstrap strict rejection is superseded by the author-approved
automatic-download contract, verified with pnpm 12.5.1 selection.
The original core hosted probes remain independent evidence of core wiring.

## Final integration checkpoint

Completed on 2026-09-23 after the author merged PR #29. The exact integrated
revision was [`e05bbf62490358fc53f723f30a730b552da53d6a`](https://github.com/lolmaus/pomeranian/commit/e05bbf62490358fc53f723f30a730b552da53d6a).
Hosted main [Workspace checks run 35909337845](https://github.com/lolmaus/pomeranian/actions/runs/35909337845)
passed for that SHA.

The full documented local rerun on the same revision passed: frozen install;
Node/pnpm/workspace/Turbo inventory; all nine package lint/fix/typecheck commands
for core, lib-essential, and oxlint-config; root lint/fix/typecheck;
format/fix/format; and `git diff --check`. Maintained-file SHA-256 hashes stayed
unchanged, and package-source inspection found no emitted JavaScript, maps, or
build metadata. Node 24.21.0 and pnpm 12.5.1 were selected, with the approved
automatic-download contract unchanged.

[The completion comment](https://github.com/lolmaus/pomeranian/issues/14#issuecomment-5801494603)
records the integrated-revision results and closes #14 with all twelve acceptance
criteria checked. No foundation implementation or verification checkpoint remains;
roadmap item 1 is Done. This documentation synchronization records those completed
checks without introducing another implementation acceptance checkpoint.

## Later compatibility evidence

The library preset establishes a checking baseline: latest supported patches of
supported Node LTS majors starting with 22. The exact author runtime remains
`.nvmrc`. Actual behavior across supported Node runtimes belongs to the first
ad-hoc Element_PO slice. Packed artifacts and public declarations are verified
by packaging work before publication. Empty scaffolds and non-emitting checks
do not prove either later guarantee or authorize a release.
