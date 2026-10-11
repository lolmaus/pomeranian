# Structured fixture catalog acceptance

The author confirmed the [fixture design](../research/demo-fixture-structure-requirements.md)
on 2026-09-24 as an extension to specification #38 and ticket #39 in
[PR #40](https://github.com/lolmaus/pomeranian/pull/40).

## Delivered structure

The private demo groups scenarios by package and page object, with explicit
per-object manifests and lazy component loaders. Its separate catalog links to
isolated fixture URLs. TanStack Router **1.170.39** handles client-side navigation;
its official registry metadata declares compatibility with the installed React
19.3.0 and the selected Node runtimes.

The four Element_PO scenarios are `counter`, `delayed-counter`,
`replaceable-counter`, and `text-collection`. Each has a direct address and scoped
styles. The counter scenarios share a small component. Route identity controls
remounting, and pending counter timers receive normal unmount cleanup. No global
reset API, extra fixture-contract package, or future integration section was added.

The app exposes only metadata through
`@pomeranian/demo-app-react/fixture-addresses/lib-essential/element-po`.
Library-local tests consume that explicit export as a dev dependency; the module
has no runtime imports. Per-object manifest types require complete registration
and the correct literal address for each scenario.

Element_PO browser specs now live beside its source in lib-essential, with their
own Playwright lint and TypeScript ownership. The central E2E application discovers
colocated specs, tests the catalog infrastructure, and verifies genuine reports.
Its report lookup traverses nested suites. Product Element_PO behavior and the
Node 22/Chromium Docker CI matrix remain unchanged.

## Test-first evidence

- The package-export consumer typecheck failed when the address module was
  absent, then passed with literal IDs/URLs and rejected unknown IDs.
- The catalog test failed for the missing package heading. It passed once the
  catalog opened a counter through client-side navigation, with the document
  retained and catalog links absent from the fixture.
- Migrated delayed-counter and replacement tests failed at their missing routes,
  then passed after their focused scenarios were registered.
- The text test failed with zero samples before the text-collection scenario
  existed. Requiring complete manifest registration also produced a compiler
  error for its missing entry; both checks passed after adding it.
- Nesting the colocated report specimens made both existing report checks fail
  because flat lookup could not find them. Recursive lookup passed the same
  assertions for expected failure status, native mismatch, name, timeout, and
  successful named click.

Additional browser checks cover all catalog addresses and direct reloads,
back/forward re-entry with fresh state, unchanged computed counter styles after
visiting neighboring views, leaving a pending delayed counter, and explicit
not-found behavior. The retained object specs cover all original click/text
contracts. Typechecks reject missing registrations and incorrect addresses.

## Verification commands

Author checks use Node 24.21.0 and pnpm 12.5.1:

```sh
pnpm install --frozen-lockfile
pnpm run format
pnpm run lint
pnpm run typecheck
pnpm run docs:build
```

Behavior checks use Node 22.23.3, Playwright 1.63.0, and Chromium 153.0.8010.12:

```sh
pnpm run test
```

The root test command builds the React application and runs the browser suite
against its production preview. Focused development runs and the typecheck
failure/recovery cycles above preceded the final aggregate. Local browser checks
use the environment's browser cache and system-library paths; CI uses its pinned
preinstalled Playwright image.

## Results

The final aggregate passed: six unit tests, fourteen Chromium browser cases
(including two intentional failure specimens), and both report-verification tests.
Workspace formatting, lint, typechecks, and the documentation build passed.
Frozen installation passed without changing the lockfile or dependency metadata.
The production build emits separate catalog and scenario chunks.

The first aggregate caught a module-mode problem after relocating the specs:
Playwright treated the library's `.ts` tests as CommonJS. Declaring the private
library's source package as ESM fixed the import failure. The full behavior suite
and all library typecheck leaves then passed; this does not select a published
distribution format.

## Standards review

No documented-standard violations. One optional duplicated-code observation in
the style-isolation test was addressed by sharing its appearance snapshot callback.

## Spec review

No findings against the confirmed fixture design. The review verified ownership,
routing, state/style isolation, metadata exports, type coverage, and retained
Element_PO behavior. Integration scenarios remain deferred.
