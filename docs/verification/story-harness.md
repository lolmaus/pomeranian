# Parallel story-harness acceptance

This extends [PR #40](https://github.com/lolmaus/pomeranian/pull/40) on its existing
`plan/first-element-po` branch, starting from `255a7bd`. The author approved the
[parallel scope](../research/story-harness-requirements.md) on 2026-10-04.
The demo application, catalog, original specs, and report-verification cases
remain in place. Product classes and exports are unchanged by this extension.

## Mounting and fixture evidence

The agreed public seams are Playwright's native mounting interface, the existing
page objects, and actual JSON reports. Tests use real Chromium and browser
stories without mocks or demo component imports.

The red/green loop established these failures before their implementations:

- The core counter failed with `The gallery page does not define window.mount()`;
  discovery, the neutral lifecycle, and `reactStory` made it pass.
- React's initial render-error specimen failed because `mount` resolved despite
  a component exception. The adapter captures the uncaught render error and
  rejects the mounting call; initial and update failures now pass.
- Element_PO's counter initially rejected with `Unknown story:
lib-essential/element-po/Counter`; its adjacent local fixture made it pass.
- Delayed actionability failed with `Expected: disabled; Received: enabled`;
  local pending state and a cleaned-up timer made it pass.
- Replacement failed waiting for `Replace button`; changing the keyed button
  made the same page object resolve the new DOM node.
- Text options failed with `Unknown story:
lib-essential/element-po/TextCollection`; adjacent ordered markup with hidden
  text made the specimen pass.

Six harness cases verify discovery across package and infrastructure inputs,
unknown files/exports with the requested IDs, immediate committed rendering,
state-preserving updates, fresh mounts, effect cleanup, repeated unmount,
remount after unmount, initial/update errors, recovery, and switching stories
on the same page. Immediate reads deliberately avoid assertion retries so a
premature mounting promise cannot satisfy the readiness check.

One core counter and all nine Element_PO cases run in the new colocated specs:
lazy matching before mount, trial clicks, delayed actionability, retrying text
assertions, DOM replacement, strings/regexes/ordered arrays/display options,
scalar strictness, zero-match distinctions, and the two reporting specimens.
Each story contains its own markup and behavior. Only data props cross from the
spec; both libraries use React solely as a test dependency.

`reporting.stories.test.mts` independently reads the story suite's report and
requires each intentional failure's expected/actual failed statuses, preserved
name, native matcher/polarity, received value, selected 500ms/60ms timeout, and
successful named trial-click step. The original three report cases remain in
`reporting.test.mts`, reading the demo suite's separate report.

## Repeatable checks

Use the repository's `.nvmrc` for frozen installation and author checks:

```sh
pnpm install --frozen-lockfile
pnpm run format
pnpm run lint
pnpm run typecheck
pnpm run docs:build
```

Select the latest supported Node 22 patch and install the pinned Chromium before
behavior verification:

```sh
pnpm --filter @pomeranian/tests-e2e exec playwright install --with-deps chromium
pnpm run test
```

The aggregate includes units, both complete browser suites, and both report
checks. Focused independent commands are `pnpm run test:e2e:demo` and
`pnpm run test:e2e:stories`. The original runner excludes story specs; Vite owns
loopback port 43192 while the demo retains 43191. Browser artifacts and JSON
reports have separate `test-results/demo/` and `test-results/stories/` directories,
so neither runner clears the other's evidence.

## Executed environment and results

Verification uses author Node 24.21.0, pnpm 12.5.1, Playwright 1.63.0, behavior
Node 22.23.3, and Chromium 153.0.8010.12. In this host, Node 22 and Chromium are
installed under `/tmp`; Chromium uses the extracted Noble shared libraries from
`/tmp/pomeranian-docs-browser/sysroot/usr/lib/x86_64-linux-gnu` through
`LD_LIBRARY_PATH`. These are local verification setup, without repository config
changes. CI retains the matching Playwright container and Node 22 selection.

Executed on 2026-10-04:

- Frozen installation, formatting, all six workspace lint tasks, all six
  workspace typecheck tasks, and the documentation build pass.
- `pnpm run test` passes **9 unit cases, 16 demo Chromium cases, 16 story Chromium
  cases, and 5 actual-report checks**. Both reports record Node 22.23.3 and
  Chromium 153.0.8010.12, with zero unexpected, skipped, or flaky results.
- Temporary `ownership-probe.stories.tsx` inputs in core, lib-essential, and
  tests-e2e independently fail their browser leaves with `TS2322` and their
  React lint runs with `react/rules-of-hooks`. Both production library leaves
  pass with the deliberately invalid story present, proving exclusion. The
  probes run through explicit `pnpm exec tsc --noEmit --project` leaves and
  `pnpm exec turbo run lint --filter=<package> --force`; all probes are removed.
  Hook-bearing callbacks passed to a custom wrapper need named component
  functions for the hook rule to recognize them, so the fixtures and authoring
  example use that form.
- The original demo sources and page-object specs have no changes. The original
  report checker changes its report path and consumes shared nested-suite
  traversal; its three checks remain intact.
  The final aggregate leaves both suites' report files present.

The final named-component story run also passes all 16 cases and both report
checks from a cold Vite dependency cache. Formatting, lint, and typechecks pass
again after removing every ownership probe.

## Standards review

The independent Standards review found **0 documented-standard violations** and
one low-priority possible Duplicated Code smell in nested report traversal.
Both report verifiers now consume the shared `report-specs.mts` traversal,
retaining independent assertions against their own reports. The five actual
report checks pass after extraction. Follow-up Standards review confirms **0
unresolved findings**.

## Specification review

The independent Spec review found **0 findings**. It checked preservation of the
original fixtures/specimens and confirmed both stored reports' native failure
reasons, names, steps, timeouts, runtime annotations, and expected results.

Integration remains subject to the author's approval of PR #40.

## Playwright installation scripts (2026-10-11)

The author requested explicit setup commands following the missing-browser error
on Bubba. The root `playwright:install` and `playwright:install:with-deps` scripts
forward to the same names in `@pomeranian/tests-e2e`. The package executes the
pinned CLI's `playwright install chromium` and
`playwright install --with-deps chromium`, respectively. They use Playwright's
normal browser-cache selection rather than the earlier `/tmp` verification setup.
Contributor and E2E setup documentation now use these commands.

Before implementation, `pnpm run playwright:install --dry-run` reported
`ERR_PNPM_NO_SCRIPT`. Afterwards, all four root/package command combinations
reach Playwright 1.63.0 with `--dry-run`. Both browser-only commands return zero
and identify Chromium/headless-shell revision 1243 and their normal
`/home/developer/.cache/ms-playwright` locations. Both `with-deps` commands report
76 missing system dependencies and return one: the pinned CLI's Linux dry run
simulates dependency installation and reports an incomplete system setup.
Browser download locations are still printed, confirming argument forwarding.
No browsers or system packages are installed by this verification.

Formatting is checked after the edits. The pending `AGENTS.md` edit retains its
original checksum and is excluded from the implementation commit. The change
adds no dependencies or browser-test behavior.

## Runtime assertion correction (2026-10-11)

A local story run under Node 26 failed before exercising the page object because
the first Element_PO specimen asserted `process.versions.node` had major 22.
That assertion was also present in the retained demo specimen. It incorrectly
made the chosen verification environment part of a page object's behavior.
Both assertions are removed. Runtime annotations remain, and CI continues to
select Node 22; its compatibility baseline is separate from local test execution.
The E2E README and contributor instructions now explain this distinction.

The existing counter specimen supplies the regression feedback loop:

```sh
pnpm --filter @pomeranian/tests-e2e exec playwright test \
  --config playwright.stories.config.ts element-po.stories.spec.ts \
  --grep 'created before' --workers 1
```

Before the change, this command reproduces `Expected: "22"; Received: "26"`.
After removal, the same counter interaction passes under Node 26.9.0. No
instrumentation or bisection is necessary because the failing assertion directly
identifies the cause; the existing browser test exercises the actual failure.

`pnpm run test` subsequently passes **9 unit cases, 16 demo Chromium cases,
16 story Chromium cases, and 5 report checks** under Node 26.9.0. Both reports
retain runtime annotations identifying Node 26.9.0 and Chromium 153.0.8010.12,
with zero unexpected results. Verification uses the normal browser cache and
installed system dependencies, without `PLAYWRIGHT_BROWSERS_PATH` or
`LD_LIBRARY_PATH` overrides. Lib-essential lint and typechecks pass on author
Node 24.21.0. No product API or CI runtime selection changes.
