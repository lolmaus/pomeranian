# First Element_PO acceptance

This record covers [specification #38](https://github.com/lolmaus/pomeranian/issues/38)
and [implementation #39](https://github.com/lolmaus/pomeranian/issues/39), approved
on 2026-09-24 and delivered for review in [PR #40](https://github.com/lolmaus/pomeranian/pull/40). The earlier [API prototype](../research/first-element-po-api.md)
provided design evidence; this slice verifies the production implementation
against a separate React application.

## Scope and environments

The private workspace exports `Element_PO` from
`@pomeranian/lib-essential/element-po`. It supports synchronous selector-based
creation, optional names, read-only Playwright access, `click`, `shouldHaveText`,
and `shouldNotHaveText`. Core remains a scaffold. Subclass APIs, other operations,
package publication, and deployment of the React fixture remain outside this slice.

Behavior verification uses Node **22.23.3**, Playwright Test **1.63.0**, and
Chromium **153.0.8010.12** (Playwright revision **1243**). This is the author's
selected Node 22/Chromium matrix. Author tooling uses Node **24.21.0** from
`.nvmrc` and pnpm **12.5.1**. These checks make no packed-artifact or additional
runtime/browser claim.

## Test seams and development evidence

The production tests exercise the public package entry point. Colocated
`node:test` checks cover invalid declarations and getter-only access. A consumer
TypeScript leaf checks accepted native arguments, `Promise<void>` results,
invalid declarations/options, and rejected property reassignment. Browser tests
use the React fixture through the real Playwright Test runner.

Recorded test-first cycles included:

- A missing target initially failed because the module did not exist; the
  synchronous factory made the descriptive validation check pass.
- Public page/locator checks failed before the getters existed and passed after
  their addition. Invalid provided names failed to throw before name validation.
- The initial React counter test failed for missing `shouldHaveText`, then passed
  through the positive assertion. Adding the negative assertion exposed missing
  `shouldNotHaveText`; implementing it completed the counter workflow.
- DOM replacement and delayed-update tests failed for missing fixture controls,
  then passed with React replacement and asynchronous state updates.

The unit runner was checked with a temporary intentional failing case: both the
package command and root `test:unit` returned exit code 1. After removing the
probe, the root command passed; direct Node execution reported all six unit cases
passing. The probes are not retained in product source.

The Playwright lint configuration was checked with removable helper-only and
action-only tests. Both text assertion methods satisfied `expect-expect`; a test
containing only `Counter.click()` failed that rule. The shared lint profile is
unchanged.

The browser suite covers these observable results:

| Area                          | Evidence                                                                                                                                                                                    |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Counter and lazy matching     | Creation before navigation, increment, positive and negative text checks, and use after React replaces the button.                                                                          |
| Action behavior               | A trial click leaves the count unchanged; a normal click waits for a disabled button; absence and duplicate matches retain native failures.                                                 |
| Retrying assertions           | Both polarities wait for delayed React updates.                                                                                                                                             |
| Text matching                 | String, RegExp, ordered arrays, wrong-order diagnostics, `ignoreCase`, and `useInnerText`.                                                                                                  |
| Missing and duplicate matches | Both scalar polarities retain strictness; empty/nonempty arrays retain their distinct absence behavior.                                                                                     |
| Reports and timeouts          | Genuine JSON output contains explicit and fallback action names, preserved whitespace, native mismatch diagnostics, the configured 500 ms assertion default, and a 60 ms per-call override. |

Two deliberately failing browser specimens use Playwright's expected-failure
annotation. A separate report check requires each specimen's intended text
mismatch, polarity, name, received value, timeout, and successful named trial
click. An unrelated browser failure cannot satisfy this check.

## Reproducible commands

Use the repository-pinned author runtime for installation and static checks:

```sh
pnpm install --frozen-lockfile
pnpm run format
pnpm run lint
pnpm run typecheck
pnpm run docs:build
```

Select the latest supported Node 22 patch for behavior checks, install the
matching Chromium build, then run the root aggregate:

```sh
pnpm --filter @pomeranian/tests-e2e exec playwright install chromium
pnpm run test
```

The E2E command builds the React fixture and starts its preview server itself.
It also checks the generated Playwright JSON report. On Linux, install browser
system dependencies as described in [CONTRIBUTING.md](../../CONTRIBUTING.md).

Frozen installation passed without changing any workspace manifest or the
lockfile; SHA-256 hashes before and after were identical. Local browser execution
used an isolated browser cache and the environment's existing Linux dependency
sysroot. Neither path is committed or required by the repository.

The final local aggregate passed on 2026-09-24:

- Repository formatting: all 111 maintained inputs passed.
- Root lint and typecheck: all six applicable workspace tasks passed, including
  both new applications and the public library consumer typechecks.
- Documentation production build: passed with the new Element_PO guide.
- Root `pnpm run test`: six unit cases, nine browser cases (including the two
  expected-failure report specimens), and both report checks passed.

The browser report records the actual Node and Chromium versions listed above.
The first aggregate typecheck exposed missing DOM declarations imported through
Playwright's report types. A local E2E tooling-config addition fixed it; the
shared Node preset remains unchanged.

## Standards

Independent review of the full slice against `5307d07` found no documented
standard violations or actionable design-smell findings. The package exports,
exported types, shared configurations, public test seams, fixture separation,
CI wiring, documentation audiences, and roadmap status follow the repository's
conventions. Tool-enforced checks were assessed separately above.

## Spec

Independent review against approved specification #38 and ticket #39 found no
missing requirements, incorrect behavior, or unasked scope expansion. Public
API, native matching and timeouts, diagnostics, fixture, coverage, documentation,
and required CI wiring match the approved slice. Hosted execution follows through
the implementation PR; integration remains pending author approval.

Review totals: Standards **0** findings; Spec **0** findings. Neither axis has an
outstanding issue.

## Required CI

The existing required **Workspace checks** job retains frozen installation,
formatting, lint, typechecking, and the documentation build. It runs in the official
Playwright `v1.63.0-noble` container, pinned by its registry digest and matched to
the exact npm dependency. Browsers and their Linux dependencies are preinstalled;
the Playwright npm package uses the existing pnpm store cache. The job selects the
latest Node 22 patch and executes the root test aggregate without an installation
step for browsers or system packages. Tests run before the Pages artifact upload. A failing
unit, browser, or report check fails that job; the main-only documentation
deployment depends on its success.

Unit tests are uncached in Turbo. The browser suite runs directly, with retries
disabled, so a successful cached static check cannot substitute for behavior
execution. Branch and pull-request runs do not deploy the React fixture or docs.

The author requested reusable browser provisioning on 2026-09-24. The selected
[official image](https://playwright.dev/docs/docker) provides browsers and system
libraries but does not include the project's npm dependency. Its manifest was
verified against Microsoft Container Registry before pinning. Image downloads
remain dependent on the runner's available Docker layers; this change removes
per-job browser installation, without claiming persistent Docker caching on
GitHub-hosted runners.

The first container run passed all unit, browser, and report checks, then exposed
Git's checkout ownership check in the final maintained-files check. The job now
registers only its mounted workspace as a safe Git directory after checkout,
preserving the final diff check and avoiding a wildcard trust setting.
