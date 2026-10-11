# Browser behavior checks

This private package owns the story-based Playwright suite and a minimal Vite
harness. Package-local fixtures define the markup and interactions tested by
page objects. Specs live beside their implementations; lifecycle infrastructure
specs live under `tests/`. The legacy demo app and runner have been removed.
The suite retains every page-object behavior and report check, with former
catalog lifecycle cases expressed through mounting, switching, and remounting.

CI behavior verification uses the latest supported **Node 22** patch and
Chromium from pinned **Playwright 1.63.0**. Node 22 is the compatibility
verification baseline. Runner configuration selects the browser; local specs
assert page-object behavior and record the active environment. Author tooling uses
the repository's `.nvmrc`. A file-level `test.beforeEach` hook in the Element_PO
spec record the actual Node and browser versions for every test in their JSON
reports, including tests inside nested `describe` blocks.

After the root frozen installation, install the matching Chromium browser from
the repository root:

```sh
pnpm run playwright:install
# Include system dependencies when setting up a machine:
pnpm run playwright:install:with-deps
```

The same script names work inside this package. Both use the pinned Playwright
version and its normal browser cache; the `with-deps` command may request elevated
permissions for operating-system packages. Rerun installation after a Playwright
upgrade.

Run the suite from the repository root:

```sh
pnpm run test:e2e
# Compatibility alias for the same suite:
pnpm run test:e2e:stories
```

`pnpm run test` also runs unit tests. The default `playwright.config.ts` starts
Vite on `http://127.0.0.1:43192/harness/` and stops it after the suite. Keep the
port free; existing servers are never reused. No fixture build, deployment, or
credentials are needed.

## Authoring a story

Group each page object's implementation, tests, and `*.stories.tsx` fixtures
in its own folder under `src/`. Place stories beside the browser spec. Export stories using
the test-only React adapter; the markup and interactive behavior belong here:

```tsx
// packages/core/src/page-object/page-object.stories.tsx
import { reactStory } from "@pomeranian/tests-e2e/react";
import { useState } from "react";

export const Counter = reactStory(function Counter() {
  const [count, setCount] = useState(0);
  return (
    <button data-test="counter" onClick={() => setCount((current) => current + 1)}>
      Count: {count}
    </button>
  );
});
```

Vite discovers `packages/*/src/**/*.stories.tsx` automatically. Each named
story export has ID `<package>/<path-under-src>/<export>`, with the filename
suffix removed: `core/page-object/page-object/Counter`, or
`lib-example/widgets/menu/Searchable` for a nested `widgets/menu.stories.tsx`.
Infrastructure fixtures under this package's `src/` use the `tests-e2e/` prefix.
There is no scenario manifest or fixture-address module.

Use Playwright's native `mount` fixture in `*.stories.spec.ts`:

```ts
import { PageObject } from "@pomeranian/core/page-object";
import { expect, test } from "@playwright/test";

test("counter interaction", async ({ page, mount }) => {
  const Counter = PageObject.create(page, '[data-test="counter"]');
  await mount("core/page-object/page-object/Counter");
  await Counter.locator.click();
  await expect(Counter.locator).toHaveText("Count: 1");
});
```

`mount(id, props)` navigates to a fresh harness page and returns a locator for
`#root`. `await mounted.update(props)` commits new props while preserving
component state; `await mounted.unmount()` disposes the instance and its effects.
Use a named component function for hook-bearing stories so React hook lint rules
recognize the component. Props sent from a spec must be serializable data. State, handlers, providers,
component imports, styles, and timer cleanup belong in the story. For example,
the local Element_PO counter accepts `{ delayUpdates: true }` or
`{ replaceable: true }`; the story owns how these behaviors work.

The framework-independent `@pomeranian/tests-e2e/story` subpath exports `Story`
and `StoryInstance`: `create(host)` returns an instance with `render(props)` and
`unmount()`, each optionally asynchronous. Adapters must resolve rendering after
commit and reject errors. The React adapter owns root creation, synchronous
commits, state-preserving reconciliation, unmount, and render-error propagation.
The gallery implements `window.mount({ story, props })` and `window.unmount()`.
Only React is implemented in this phase. A future framework needs its own
lifecycle adapter and, when required, a Vite compiler plugin; the neutral contract
does not import React.

Stories use browser/React TypeScript and lint profiles. Libraries declare the
harness, React, and React declarations as development dependencies and exclude
stories from production checking. The helper exports are internal test tooling.

## Focused runs and reports

Inside this package:

```sh
pnpm exec playwright test element-po.stories.spec.ts
pnpm exec playwright test page-object-node.spec.ts
pnpm exec playwright test fixture-lifecycle.stories.spec.ts
pnpm exec playwright test harness.stories.spec.ts
pnpm run stories:dev
```

The default config discovers package-local and infrastructure `*.spec.ts` files,
including the fixture-free PageObjectNode specimen. Full suite commands also
check the genuine JSON report: the node's named step and both intentional native
assertion failures. The two `test.fail` specimens appear with crosses in the
list reporter; verification requires their precise native mismatch, name,
named action step, and selected timeout. Other matching edge cases catch errors
and verify their native reasons directly.

The JSON report is `test-results/stories/report.json`; browser artifacts are
under `test-results/stories/artifacts/`. Failed tests retain traces; open one
with `pnpm exec playwright show-trace <path>`. Results are ignored generated
files. Focused runs overwrite the report with their subset; run the complete
suite before executing the report verifier.

Playwright specs/configs use the shared Playwright TypeScript environment with
Node 22 declarations. Root `.mts` tooling uses separately scoped Node 24 types
and DOM declarations needed by Playwright's exported report types. Only browser
specs receive test-structure lint rules; `shouldHaveText` and `shouldNotHaveText`
are assertions, while `click` is not. Browser harness inputs use the separate
React profile. See the [approved migration scope](../../docs/research/story-harness-requirements.md#author-approved-completion-2026-10-11).
