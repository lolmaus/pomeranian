# PageObjectNode acceptance

On 2026-09-30 the author approved the shared-foundation extension to
[PR #40](https://github.com/lolmaus/pomeranian/pull/40). The
[requirements](../research/first-element-po-requirements.md#author-approved-hierarchy-extension)
and [hierarchy decision](../adr/0001-page-object-node-foundation.md) record its
scope and rationale. The implementation extends branch revision `79e71cb`;
integration remains pending author approval.

## Delivered behavior

Core exports abstract `PageObjectNode` from
`@pomeranian/core/page-object-node`. Its protected constructor accepts the page
and resolved name, validates a nonblank name, and exposes public read-only
`page` and `name` getters. Its protected `step(action, body)` reports the named
operation through Playwright Test and returns the callback result.

`Element_PO` inherits those responsibilities. It retains selector validation,
selector-based fallback naming, lazy locator creation/access, click options,
and native positive/negative text assertions. Explicit invalid names, including
`null`, still fail instead of selecting the fallback. Core's scaffold is removed;
lib-essential declares the production workspace dependency on core. Both library
packages declare the existing Playwright Test peer pin.

Separate empty group and page-object classes are deferred. This extension does
not deliver group factories, nesting, Root, canvas support, or reusable
`Element_PO` factories. The abstract base has no element target or locator.

## Test-first and public-interface evidence

The tests stay at the approved public package, consumer-type, and real-report
seams. No private fields or mocked forwarding counts are inspected.

- The new unit check first failed with `undefined` instead of the public name
  `" Counter "`. It passes after extraction, including whitespace preservation
  and rejected runtime reassignment. Existing unit checks continue to verify
  invalid names and selectors; fallback checks now also read the public name.
- A test-only subclass in core first failed in the real Playwright runner with
  `TypeError: this.step is not a function`. It passes after implementing the
  protected helper, returning the callback's numeric result. It introduces no
  additional offered page object or fixture scenario.
- Consumer typechecks import both advertised package exports, accept
  `Element_PO` as a `PageObjectNode`, and verify public string-valued names,
  read-only assignment rejection, protected construction/step access, and the
  absence of a shared factory or locator contract.
- The actual JSON report contains the successful `" Probe .read"` action, with
  whitespace preserved. The two existing mismatch specimens still verify
  explicit and fallback click names, native text failure reasons, and native
  timeout behavior after click reporting moves into the shared helper.

## Commands and environments

Author checks ran on Node **24.21.0** and pnpm **12.5.1**:

```sh
pnpm install --frozen-lockfile
pnpm run format
pnpm run lint
pnpm run typecheck
pnpm run docs:build
```

All passed. Frozen installation left the updated manifests and lockfile
unchanged; the lockfile adds only core's existing Playwright dependency and
lib-essential's core workspace link. Lint and typechecks passed all six
applicable workspace tasks, including core's newly owned browser-test leaf.
The documentation build includes the linked foundation guide and updated
Element_PO guide and vocabulary.

Behavior checks ran on Node **22.23.3**, Playwright **1.63.0**, and matching
Chromium **153.0.8010.12** (revision **1243**). The official
[latest Node 22 checksum index](https://nodejs.org/dist/latest-v22.x/SHASUMS256.txt)
still identified 22.23.3 on the verification date. The existing temporary
browser cache and extracted Linux dependencies were reused; browser execution
required leaving the restricted sandbox. No browser provisioning configuration
changed.

```sh
pnpm --filter @pomeranian/tests-e2e exec playwright test --grep "node actions preserve callback results" --workers=1
pnpm run test
```

The focused case passed after its observed initial failure. The final root
aggregate passed **7 unit cases, 15 Chromium cases, and 3 actual-report checks**.
The browser count includes the two intentionally failing text specimens, whose
exact expected failure reasons are checked separately. Existing React scenarios
and the Node 22/Chromium CI matrix are preserved. No additional runtime,
browser, or published-artifact compatibility claim is made.

## Standards

Independent review of the staged extension against `79e71cb` found no documented
standard breaches or actionable design-smell findings. Explicit package exports,
production workspace dependencies, colocated public tests, shared check ownership,
documentation audiences, and roadmap updates follow the repository conventions.

## Spec

Independent review against the retained first-slice requirements and the
author-approved hierarchy amendment found no missing requirements, incorrect
behavior, or unasked scope expansion. The reviewer could not independently fetch
GitHub #38/#39 inside its sandbox and used the retained requirements and author
conversation; the driving implementation session separately read both issues.

Review totals: Standards **0 findings**; Spec **0 findings**. Neither axis has an
outstanding issue.
