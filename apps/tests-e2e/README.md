# Browser behavior checks

This private package owns two independent Playwright suites. The existing suite
builds the React demo and checks its fixture catalog; the parallel story suite
renders package-local fixtures through a minimal Vite harness. Both retain
actual-report verification. Page-object specs live beside their implementations;
app infrastructure specs live under `tests/`.

Behavior verification uses the latest supported **Node 22** patch and Chromium
from pinned **Playwright 1.63.0**. Author tooling uses the repository's `.nvmrc`.
Select Node 22 before running behavior checks. Both Element_PO counter specimens
record the actual Node and Chromium versions in their JSON reports.

After the root frozen installation, install the matching browser once:

```sh
pnpm --filter @pomeranian/tests-e2e exec playwright install --with-deps chromium
```

Run either suite, or both, from the repository root:

```sh
pnpm run test:e2e:demo
pnpm run test:e2e:stories
pnpm run test:e2e
```

`pnpm run test` also runs unit tests. The demo runner builds and previews the
existing application on `http://127.0.0.1:43191`. The story runner starts Vite on
`http://127.0.0.1:43192/harness/`. Each command starts and stops its own server;
the ports must be free, and existing servers are never reused. Neither fixture
needs deployment or credentials.

## Authoring a story

Place a `*.stories.tsx` file beside the page object's spec. Export stories using
the test-only React adapter; the markup and interactive behavior belong here:

```tsx
// packages/core/src/page-object.stories.tsx
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
suffix removed: `core/page-object/Counter`, or
`lib-example/widgets/menu/Searchable` for a nested `widgets/menu.stories.tsx`.
Infrastructure fixtures under this package's `src/` use the `tests-e2e/` prefix.
There is no scenario manifest or fixture-address module.

Use Playwright's native `mount` fixture in `*.stories.spec.ts`:

```ts
import { PageObject } from "@pomeranian/core/page-object";
import { expect, test } from "@playwright/test";

test("counter interaction", async ({ page, mount }) => {
  const Counter = PageObject.create(page, '[data-test="counter"]');
  await mount("core/page-object/Counter");
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
pnpm exec playwright test element-po.spec.ts
pnpm exec playwright test fixture-catalog.spec.ts
pnpm exec playwright test --config playwright.stories.config.ts element-po.stories.spec.ts
pnpm exec playwright test --config playwright.stories.config.ts harness.stories.spec.ts
pnpm run stories:dev
```

The original config excludes `*.stories.spec.ts`; the story config selects only
those specs. Each full suite command additionally checks its genuine JSON
report. Two intentional `test.fail` specimens per suite appear with crosses in
the list reporter. Report verification requires their precise native mismatch,
name, named action step, and selected timeout. Other matching edge cases catch
errors and verify their native reasons directly.

| Suite   | JSON report                        | Browser artifacts                 |
| ------- | ---------------------------------- | --------------------------------- |
| Demo    | `test-results/demo/report.json`    | `test-results/demo/artifacts/`    |
| Stories | `test-results/stories/report.json` | `test-results/stories/artifacts/` |

Failed tests retain traces; open one with `pnpm exec playwright show-trace <path>`.
All browser results are ignored generated files. Running either suite preserves
the other's report and artifact directory.

Playwright specs/configs use the shared Playwright TypeScript environment with
Node 22 declarations. Root `.mts` tooling uses separately scoped Node 24 types
and DOM declarations needed by Playwright's exported report types. Only browser
specs receive test-structure lint rules; `shouldHaveText` and `shouldNotHaveText`
are assertions, while `click` is not. Browser harness inputs use the separate
React profile. The existing demo, fixtures, and tests remain available until a
later removal request; see the [approved scope](../../docs/research/story-harness-requirements.md).
