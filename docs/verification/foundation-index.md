# Foundation acceptance index

This is the durable index for all twelve acceptance cases in
[monorepo setup #9](https://github.com/lolmaus/pomeranian/issues/9), including the
amended typed/framework linting and TypeScript/editor scope. It supplements the
original bootstrap record rather than treating that narrower run as sufficient.

As of 2026-09-23, bootstrap #11, formatting #12, CI #18, and core #13 have
integrated. [PR #27](https://github.com/lolmaus/pomeranian/pull/27) integrated
lib-essential wiring. The [retrospective review](pr-27-review.md) explains why
#14 still needed this follow-up. Its local and hosted acceptance is recorded in
[lib-essential checks](lib-essential-checks.md).

## Acceptance map

| Parent case                                                                                     | Current evidence                                                                                                                                                                                                                                                                                                                                       | Scope and remaining integration checkpoint                                                                                                                    |
| ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Pinned bootstrap, frozen install, mismatch contract                                          | [Bootstrap](bootstrap.md), [current pnpm and ownership](lib-essential-checks.md#toolchain-and-file-ownership), [restoration](lib-essential-checks.md#restoration-and-integration)                                                                                                                                                                      | Node 24.21.0, pnpm 12.5.1; strict mismatch rejection re-executed after #27's upgrade. Final integrated rerun pending merge.                                   |
| 2. Both real consumers, public configs, new inputs, real aggregates                             | [Core CLI](core-checks-extension.md), [lib-essential and both-library coverage](lib-essential-checks.md#discovery-source-coverage-and-safe-fixing)                                                                                                                                                                                                     | Three executable check tasks; JSON-only preset package needs no dummy task. Both libraries remain empty of product behavior.                                  |
| 3. Formatting failure, fixes, preservation, idempotence                                         | [Formatting evidence](formatting.md), [current clean rerun](lib-essential-checks.md#restoration-and-integration)                                                                                                                                                                                                                                       | Oxfmt 0.70.0, config and scope unchanged; original intentional-defect evidence remains applicable.                                                            |
| 4. Independent lint/fix, typed programs, framework profiles                                     | [Core CLI](core-checks-extension.md), [five-preset/framework cases](core-checks-profiles.md), [lib-essential safe fixes](lib-essential-checks.md#discovery-source-coverage-and-safe-fixing), [typed leaves](lib-essential-checks.md#typed-linting-and-explicit-compiler-leaves), [library profile](lib-essential-checks.md#playwright-library-profile) | Both actual consumers independently verified. Unused React and Playwright test profiles retain #13 evidence; no extra variants or browser infrastructure.     |
| 5. Shared-setting-dependent compiler errors, five environments, editor discovery                | [Core profile evidence](core-checks-profiles.md), [lib-essential leaf checks](lib-essential-checks.md#typed-linting-and-explicit-compiler-leaves), [current native editor](lib-essential-checks.md#native-editor-evidence)                                                                                                                             | Node 22 library / Node 24 tooling split; all five maintained leaves rediscovered without root solution. Direct native server, not GUI verification.           |
| 6. Source/shared/dependency invalidation and uncached fixing                                    | [Core cache evidence](core-checks-extension.md), [lib-essential current cache cases](lib-essential-checks.md#cache-behavior-and-public-boundaries)                                                                                                                                                                                                     | Actual failing root commands after warm successes; no forced misses. Discovery/leaf/profile/preset/dependency hash accounting included.                       |
| 7. Public exports and rejection of existing private subpaths; source conventions                | [Core boundaries](core-checks-extension.md), [lib-essential boundaries](lib-essential-checks.md#cache-behavior-and-public-boundaries)                                                                                                                                                                                                                  | Existing files fail, pass when temporarily exported, fail again when hidden. Explicit modules, no barrels, exported types, empty product exports.             |
| 8. Cleanup, frozen install, all documented commands, evidence                                   | [Current restoration and command rerun](lib-essential-checks.md#restoration-and-integration)                                                                                                                                                                                                                                                           | No probes, product JavaScript, build metadata, or dependency artifacts delivered. Final integrated revision rerun pending merge.                              |
| 9. Hosted authority, frozen metadata, push and draft/documentation PR triggers                  | [CI hosted cases](ci.md), [current hosted consumer runs](lib-essential-checks.md#hosted-required-job-evidence)                                                                                                                                                                                                                                         | Same workflow/action authorities, one setup/install; current runs use Node 24.21.0 and pnpm 12.5.1. Original trigger evidence remains applicable.             |
| 10. Dependency-cache miss/hit, frozen rejection, cancellation streams                           | [CI cache and cancellation evidence](ci.md), [current hosted evidence](lib-essential-checks.md#hosted-required-job-evidence)                                                                                                                                                                                                                           | Action pins, cache implementation and concurrency unchanged. Current consumer runs repeat warm frozen installation; current pnpm rejects mismatched metadata. |
| 11. Required formatting, independent library typed-lint/type failures and recovery, merge rules | [CI formatting and rules](ci.md), [core hosted cases](core-checks-extension.md#executed-hosted-evidence), [lib-essential hosted cases](lib-essential-checks.md#hosted-required-job-evidence)                                                                                                                                                           | Independent failing/corrected revisions; effective rule inspected again with strict up-to-date checks and no bypass actors.                                   |
| 12. Action pins/update policy, cleanup, final integrated result and index                       | [CI pin/update evidence](ci.md), [current cleanup](lib-essential-checks.md#restoration-and-integration), this index                                                                                                                                                                                                                                    | Action pins and weekly reviewed Actions-only updates unchanged. Final hosted main result and integrated local rerun remain the last checkpoint.               |

Earlier framework/preset evidence remains valid: their implementations and exact
compiler/linter/plugin/declaration pins are unchanged by #27 or this follow-up.
Current frozen installation and actual package/root runs validate the new pnpm
combination. Root-solution editor evidence is superseded by the current five-leaf
native-server test; bootstrap mismatch behavior is re-executed for pnpm 12.5.1.
The original core hosted probes remain independent evidence of core wiring.

## Final integration checkpoint

No other foundation implementation slice remains after this follow-up. It is
therefore responsible for final integration evidence, rather than passing that
responsibility to the documentation or product roadmap items.

After the author approves and merges the follow-up, record its merge SHA and a
successful **main** `Workspace checks` run. At that exact integrated revision,
execute a frozen install with unchanged metadata; version/workspace/Turbo
inventory; package lint/fix/typecheck for core, lib-essential and oxlint-config;
root lint/fix/typecheck; format/fix/format; and a final clean tracked-file and
emitted-output check. Record the commands and outcomes here or in the linked
lib-essential record. A pre-merge proposed-merge check is useful evidence but
must not be described as a completed main integration.

Only after that checkpoint should #14/#9 completion and roadmap item 1's Done
status be reconciled. The existing roadmap remains Implementing in this PR.
Explicit approval to merge this specific follow-up is still required by the
repository's Git workflow.

## Later compatibility evidence

The library preset establishes a checking baseline: latest supported patches of
supported Node LTS majors starting with 22. The exact author runtime remains
`.nvmrc`. Actual behavior across supported Node runtimes belongs to the first
ad-hoc Element_PO slice. Packed artifacts and public declarations are verified
by packaging work before publication. Empty scaffolds and non-emitting checks
do not prove either later guarantee or authorize a release.
