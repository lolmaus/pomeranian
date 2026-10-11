# Story-based browser specs

The initial parallel-suite scope below is retained as decision history. The
author-approved completion on 2026-10-11 supersedes its demo-retention requirement.

The author approved this extension of [PR #40](https://github.com/lolmaus/pomeranian/pull/40)
on 2026-10-04. It adds a minimal custom Vite harness alongside the existing React
demo suite. The demo, its fixture catalog, existing specs, and actual-report
verification remain available. Removal requires a later author request.

The goal is to keep the tested markup and interactive behavior beside each page
object's spec, without depending on demo components or a separate fixture app.
Framework startup belongs to test infrastructure. This extension supersedes the
fixture-app requirement for the new parallel specimens only; it preserves the
existing acceptance baseline.

- `apps/tests-e2e` owns the harness and explicit test-only `story` and `react`
  helper subpaths. The neutral contract creates an instance against a host,
  renders props, and unmounts. React is the first adapter; Svelte is deferred.
- Package-local `*.stories.tsx` named exports are discovered automatically as
  `<package>/<path-under-src>/<export>`. No scenario manifest, fixture-address
  module, Ant Design dependency, or fixture catalog is introduced.
- The gallery exposes `window.mount({ story, props })`, `window.unmount()`, and
  `#root`. Specs use Playwright's native `mount` fixture and ordinary Pomeranian
  objects. Data props cross from specs; components, handlers, state, providers,
  and styles remain in browser stories.
- The React adapter owns root creation, committed rendering, state-preserving
  updates, cleanup, and propagation of render errors to the mounting call.
- Add adjacent `page-object.stories.spec.ts` / `page-object.stories.tsx` and
  `element-po.stories.spec.ts` / `element-po.stories.tsx`. Reproduce the core
  counter and all nine existing Element_PO cases with locally defined fixtures.
  The PageObjectNode specimen needs no rendered fixture and remains in place.
- The story runner uses Chromium and a Vite server on loopback port 43192.
  The original runner retains the demo server on 43191 and excludes story specs.
  Each suite owns separate browser artifacts and JSON reports. Both have
  independent commands; the aggregate executes both and their report checks.
- Stories and browser harness inputs have browser/React TypeScript and lint
  ownership. Production library checking excludes stories. Dependencies are
  test-only and use existing repository pins.

The agreed TDD seams are the public mounting interface, established page objects,
and genuine Playwright reports. Acceptance covers discovery, unknown-story
errors, initial/update React errors, fresh mounts, state-preserving updates,
unmount cleanup, lazy matching, delayed actionability, retrying assertions, DOM
replacement, text options, scalar strictness, and zero matches. Independently
verify both new intentional failures' native reasons, names, steps, and timeouts.
Run frozen installation, formatting, workspace lint/typechecks, documentation
build, units, and both complete suites with the existing Node 22/Chromium behavior
requirements. Review standards and specification coverage, commit on PR #40's
existing branch, and update its evidence. Integration still requires approval
for that PR.

See [usage](../../apps/tests-e2e/README.md) and
[acceptance evidence](../verification/story-harness.md).

## Author-approved completion (2026-10-11)

The author requested removal of the legacy test app and runner, renaming the
story runner to the default `playwright.config.ts`, and preservation of every
test case in the story-based suite.

- Remove `apps/demo-app-react`, its dependencies and metadata exports, obsolete
  fixture-address type checks, legacy specs, demo commands, and unused lockfile
  dependencies. Preserve all production consumer type contracts, including the
  factory/subclass checks mixed into core's former fixture-address specimen.
- The default runner discovers all package-local and infrastructure `*.spec.ts`
  files. Keep the fixture-free PageObjectNode specimen and its genuine-report
  named-step check. Retain the core counter, all nine Element_PO cases, six
  harness cases, both intentional-failure report checks, and all unit tests.
- Migrate the five catalog cases to story lifecycle cases: client-side switching
  without document replacement or neighboring UI, mounting all five original
  scenarios after reload, remount/state/style isolation, leaving pending updates,
  and explicit unknown-address errors. Catalog links, scenario URLs, and browser
  back/forward routing belong to the removed app; test their isolation/remounting
  intent through the gallery lifecycle instead of recreating a fixture router.
- The aggregate runs the single Chromium/Vite suite on loopback port 43192 and
  all report checks. Preserve `test:e2e:stories` as an alias and both browser
  installation commands. Existing story contracts, adapters, and scope remain.

The original mounting/page-object/report TDD seams remain agreed. Record the
legacy-to-story coverage mapping, run frozen installation and all workspace
checks, review, and commit on PR #40's existing branch. Integration still needs
the author's approval of that PR.
