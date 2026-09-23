# Retrospective review of PR #27

Reviewed 2026-09-23 against [lib-essential #14](https://github.com/lolmaus/pomeranian/issues/14)
and its [parent specification #9](https://github.com/lolmaus/pomeranian/issues/9).
The fixed comparison is `git diff 7088e917...0f34c472`, containing commit
`0f34c47` (merged as `3de8a69` in [PR #27](https://github.com/lolmaus/pomeranian/pull/27)).
Independent standards and specification reviews used the installed code-review
skill. These findings describe the merged PR against the then-current contract,
before the follow-up. The author subsequently explicitly approved pnpm 12.5.1
with automatic download; that amendment resolves the policy disagreement below
through documentation and new selection evidence, rather than reverting #27.

## Standards

1. `package.json` changes `onFail: error` to `download`, and
   `pnpm-workspace.yaml` removes `pmOnFail: error`, contradicting the strict
   mismatch contract in CONTRIBUTING's setup instructions. The documented pnpm
   version is also stale.
2. Deleting root `tsconfig.json` changes the documented discovery architecture
   without replacement evidence. Package-local references remain, so deletion
   alone does not establish broken discovery.
3. The new consumer has no accompanying guidance or executed acceptance record.
   CONTRIBUTING still describes lib-essential as source-free and its CI coverage
   as future work. Development guidance requires command/outcome evidence.
4. ROADMAP is unchanged despite the requirement to update progress and work links
   when a slice advances; it still describes merged #24 as awaiting approval.

No independent code-smell findings. Similar scripts and local path declarations
in core and lib-essential are intentional consumer-owned configuration.

**Standards: four findings; the most consequential is the unreconciled
package-manager enforcement change.**

## Spec

1. Independent consumer evidence is absent: safe/unfixable fixes, typed promise
   diagnostics and configured program assignment in both leaves, Playwright
   assertions, settings-dependent compiler errors, automatic coverage, cache
   invalidation, export boundaries, frozen restoration, and cleanup.
2. No independent hosted typed-lint and type-error failure/recovery revisions are
   recorded. A passing clean scaffold cannot establish that defects block merging.
3. Contributor setup/check/fix instructions exclude the newly configured library,
   contrary to #14's requirement to keep guidance current for both libraries.
4. pnpm's changed mismatch behavior conflicts with preserving the existing
   version contract. The new editor topology also needs direct verification;
   package references look correct but earlier root-solution evidence is insufficient.
5. The roadmap update and durable twelve-case foundation evidence index are absent.

Public imports, non-composite library/tooling leaves, explicit leaf commands,
scoped Playwright rules, empty public exports, and the permitted empty module
are correctly wired on inspection. No parallel presets or product API are added.

**Spec: five findings; the largest gap is independent verification. PR #27 does
not complete #14.**

## Follow-up disposition

[Lib-essential verification](lib-essential-checks.md) supplies the independent
local, native-editor, and hosted observations. The follow-up retains pnpm 12.5.1,
preserves automatic download under the author-approved amendment, documents
package-local discovery after testing
all five maintained leaves, and removes the obsolete root discovery cache entry.
Contributor guidance and the roadmap are reconciled with the merged work.
The [foundation index](foundation-index.md) separates completed evidence from the
post-merge integration checkpoint; it does not claim an unapproved merge occurred.
