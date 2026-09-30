# Demo fixture organization

Status: the author confirmed the complete design, implementation details, and
acceptance checks on 2026-09-24. Implementation extends specification #38 and
ticket #39 in PR #40.

## Problem

Every offered page object requires React demo coverage and separate Playwright
E2E tests. The current fixture combines a counter, delay and DOM-replacement
controls, text samples, and page layout in one component. All browser tests visit
the same URL, and the stylesheet mixes global presentation with fixture styles.
That structure will become difficult to maintain as essential objects, Ant Design
objects, and composed workflows arrive.

## Selected decisions

1. Organize fixtures by **package → page object → scenario**. Object-focused
   browser tests are physically colocated with their page-object implementation,
   as clarified below, rather than mirrored inside the E2E application.
2. Give each scenario an isolated, directly addressable URL. Navigation establishes
   fresh initial state, and the URL renders only the relevant fixture. Adding an
   unrelated scenario must not introduce new DOM matches into existing tests.
3. Each page object owns its scenarios. Small React components may be shared
   selectively; similar markup does not require different objects to share one
   scenario or evolve their test cases together.
4. Provide a separate private catalog homepage, grouped by package and page
   object, linking to scenario URLs. Scenario views contain no catalog
   navigation that could interfere with the elements being tested.
5. Register scenarios explicitly through small per-object manifests containing
   IDs, labels, and components, aggregated by package. Avoid a single central
   manifest containing every fixture's details.
6. Share a typed fixture-address contract between the demo and E2E tests. That
   contract contains only IDs and URL information; tests do not import React
   components or the renderer. Renaming a scenario must expose stale test
   references during typechecking.
7. Isolate scenario styles and dependencies. Catalog styles remain separate,
   fixture styles are locally scoped, and only the selected scenario's component
   dependencies are loaded. A scenario may deliberately load a component
   library's global styles when they are part of its tested environment.
8. Use TanStack Router for client-side transitions. Leaving a scenario should
   unmount its components, so normal local React state needs no separate reset
   mechanism. Lifecycle cleanup and global stylesheet isolation must still be
   addressed; component unmounting alone does not remove every side effect.
9. Keep a scenario under its primary object when the test focuses on that object
   and other objects are incidental. A composition of equally important objects
   belongs in additional sections of the demo and E2E suite, not arbitrarily
   under one participating object. Defer those sections and their detailed design
   until a real case requires them.
10. Place browser specs beside page-object source, such as
    `packages/lib-essential/src/element-po.spec.ts`. The E2E application remains
    the central runner and configuration owner. Unit tests remain colocated too.
    This supersedes the initial proposal for matching directories inside the E2E
    application; fixture ownership still follows package and page object.
11. Split the existing examples into four focused scenarios: `counter`,
    `delayed-counter`, `replaceable-counter`, and `text-collection`. Counter
    scenarios may share a small React component, and several related tests may
    use the same scenario.
12. Deliver the restructuring, existing-test migration, and documentation in the
    still-open [PR #40](https://github.com/lolmaus/pomeranian/pull/40), after the
    complete design is confirmed. The future integration section stays deferred.
13. Export the typed fixture-address contract from the demo application through
    explicit metadata-only subpaths. Do not add a separate fixture-contracts
    workspace package. Library-local browser tests consume these exports through
    a test-only workspace dependency on the demo app; the exported modules do not
    import React, TanStack Router, Playwright, component manifests, or fixtures.

For example, `Element_PO` and a future `Button_PO` may reuse a counter component
while owning separate scenarios and tests. The ownership does not imply one
scenario per test or repetition of every inherited operation's test suite.
Further coverage relationships can be settled when concrete objects require them.

## Existing constraints

The demo remains a private React test application. Playwright and page-object
usage stay in browser specs and runner tooling, connected to the demo through
HTML hooks. This work does not introduce public deployment or links from the
documentation site.

## Confirmation

The author confirmed all interview choices, implementation details, and
acceptance checks below. No design approval remains outstanding.

The location and structure of future equally shared integration scenarios are
explicitly deferred, rather than prerequisites for this implementation.

## Confirmed implementation details

- Use stable addresses such as
  `/fixtures/lib-essential/element-po/counter`. Keep address metadata independent
  of React, TanStack Router, and Playwright. Per-object manifests provide labels
  and lazy component loaders, checked against the declared scenario IDs. Expose
  the metadata through a subpath such as
  `@pomeranian/demo-app-react/fixture-addresses/lib-essential/element-po`.
- The catalog lives at `/`. Direct scenario URLs work on initial load and browser
  refresh. Unknown fixture addresses show an explicit not-found view instead of
  silently falling back to a different scenario.
- Select the fixture view by route identity and remount it when that identity
  changes. Leaving and re-entering starts fresh local state, including with
  browser back/forward. Navigating to the already active URL need not act as a
  reset command; reloading remains available. No general reset API is introduced.
- Keep catalog styling separate and fixture styles scoped. Cancel pending timers
  and subscriptions through normal component cleanup. Verify that visiting the
  catalog or another scenario does not change the active fixture's styling.
- Discover colocated browser specs through the central runner. Give those files
  Playwright-specific lint and TypeScript ownership in their library package,
  separate from production library inputs. Keep report-verification tooling in
  the runner application while its Element_PO browser specimens move beside the
  object. Preserve verification of their exact intended failure reasons.
- Verify the catalog and routing infrastructure in the E2E application. These
  infrastructure checks are distinct from the deferred cross-object integration
  suite. Retain current Node 22/Chromium checks and the preinstalled CI image.
- Cover the public behavior and authoring contract: valid and invalid typed
  addresses, complete manifest registration, catalog links, direct routes,
  client-side navigation and fresh re-entry, unknown addresses, and all existing
  Element_PO behavior. Document how to add an object, scenario, and colocated spec.

## Router and lifecycle evidence

TanStack Router supports [explicit code-based route trees](https://tanstack.com/router/latest/docs/routing/code-based-routing)
and [lazy route components](https://tanstack.com/router/latest/docs/guide/code-splitting#code-based-splitting),
which can accommodate per-object manifests without eagerly loading fixture code
into the catalog. A route component retained across parameter changes does not
remount by default; [remount dependencies](https://tanstack.com/router/latest/docs/api/router/RouteOptionsType#remountdeps-method)
can tie its lifetime to scenario identity.

[React unmounting](https://react.dev/learn/preserving-and-resetting-state) removes
local component state. [Effect cleanup](https://react.dev/reference/react/useEffect)
is still needed for timers, subscriptions, and other external work. This is normal
component lifecycle handling, not a separate global reset mechanism.

Vite's normal CSS imports inject styles, and its documentation does not promise
their removal when React components unmount. Lazy component loading alone therefore
does not establish style isolation across client-side transitions. Vite also
supports [processed CSS without automatic injection](https://vite.dev/guide/features#disabling-css-injection-into-the-page),
which permits explicitly managed styles when a future fixture needs them. The
current migration can scope the existing styles; support for a particular future
component library is not part of this change.

## Current migration considerations

The report verification currently reads only top-level Playwright suites. Moving
tests into nested suites requires retaining reliable lookup of the intended
report specimens. Current delayed counter updates also need consideration if
scenario navigation unmounts components without reloading the document.
