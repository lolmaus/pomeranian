# PageObjectNode acceptance

On 2026-09-30 the author approved the shared-foundation extension to
[PR #40](https://github.com/lolmaus/pomeranian/pull/40). The
[requirements](../research/first-element-po-requirements.md#author-approved-hierarchy-extension)
and [hierarchy decision](../adr/0001-page-object-node-foundation.md) record its
scope and rationale. The implementation extends branch revision `79e71cb`;
integration remains pending author approval.

This initial record describes the 2026-09-30 implementation. The
[2026-10-04 revision](#core-pageobject-revision-2026-10-04) below records the
current three-class hierarchy and consolidated test ownership.

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

## Required CI

Both hosted runs passed on implementation revision `efb5d46`:
[branch push](https://github.com/lolmaus/pomeranian/actions/runs/36764426762) and
[pull request](https://github.com/lolmaus/pomeranian/actions/runs/36764431839).
The required Workspace checks cover the updated dependency graph, static checks,
documentation build, and Node 22/Chromium aggregate. The workflow's main-only
documentation deployment remains unchanged. PR #40 is open for author-approved
integration.

## Core PageObject revision — 2026-10-04

The author requested `PageObjectNode → PageObject → Element_PO`, with factory,
locator construction/access, selector validation, and fallback naming in core's
`PageObject`. Its factory uses the concrete calling class and preserves its
inferred type. `Element_PO` contains only its three element operations and a
compatibility alias for `PageObjectOptions`; it inherits construction and
locator access. Base and inherited constructors are protected. Custom-constructor
and flexible-target conventions remain later work; the retained TypeScript
constructor-compatibility limitation still applies.

The test files now follow class ownership:

| Class            | Unit tests                  | Browser specs              | Main responsibility verified                                       |
| ---------------- | --------------------------- | -------------------------- | ------------------------------------------------------------------ |
| `PageObjectNode` | `page-object-node.test.mts` | `page-object-node.spec.ts` | Page/name access and validation; shared named steps                |
| `PageObject`     | `page-object.test.mts`      | `page-object.spec.ts`      | Selector/factory behavior, lazy read-only locator, direct core use |
| `Element_PO`     | `element-po.test.mts`       | `element-po.spec.ts`       | Inherited concrete creation and native element actions/assertions  |

The separate text and reporting specimen files are removed; all nine Element_PO
browser cases remain in its single spec file. The central actual-report checker
remains runner infrastructure. Each class also has a single consumer-type input
under its package's `test-type/` directory, checked through discoverable leaves.
Contributor and demo authoring guidance record the class-level convention.

The new core counter scenario has its own metadata-only export and isolated
`/fixtures/core/page-object/counter` address. It reuses the existing React counter
component. Catalog tests now check all five registered addresses, including
direct loading and reloading of the core scenario. No product or Playwright
logic enters the React app.

The first core public-factory check failed with
`ERR_PACKAGE_PATH_NOT_EXPORTED` before the module/export existed, then passed
after extraction. Existing invalid target/name checks were moved to the owning
class rather than duplicated in subclasses. New node-only checks exercise a
targetless subclass, and Element_PO's unit check confirms inherited creation
still returns the concrete element class with its operations. Consumer types
verify concrete subclass inference, protected construction, read-only access,
and compatible existing options imports.

On Node **24.21.0** and pnpm **12.5.1**, frozen installation, repository
formatting, all six workspace lint/typecheck tasks, and the documentation build
passed. The updated lockfile only adds core's test-only demo metadata dependency.
The official Node 22 index still identified **22.23.3** on 2026-10-04.

The focused direct-core Chromium check and the complete root `pnpm run test`
passed on Node **22.23.3**, Playwright **1.63.0**, and matching Chromium
**153.0.8010.12**. The aggregate executes **9 unit cases** (8 core, 1 essential),
**16 browser cases**, and **3 actual-report checks**. The existing intentional
text failures retain their exact native reasons, names, and timeouts.

Independent review of this revision against `acf93ac` found **0 Standards
findings** and **0 Spec findings**. The former checked shared ownership, explicit
exports, class-level test organization, and fixture reuse; the latter checked
the October 4 amendment, concrete inherited creation, invalid-name handling,
and preservation of the element specimens. Hosted run results are linked from
[PR #40](https://github.com/lolmaus/pomeranian/pull/40).
