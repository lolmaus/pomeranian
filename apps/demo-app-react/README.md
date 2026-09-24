# React fixture catalog

This private React application supplies isolated browser scenarios for Pomeranian's
page objects. It is not deployed or linked from the documentation website.
Playwright and page-object usage live in colocated browser specs and the central
E2E runner; the demo exposes HTML `data-test` hooks.

From the repository root, after frozen installation:

```sh
pnpm run demo:dev
pnpm run demo:build
pnpm run demo:preview
```

Development supports live updates. Preview serves the latest production build;
build first and rebuild after source changes. The E2E runner builds and starts
its own preview automatically. Stop a manual server with Ctrl-C.

## Organization

The homepage is a catalog grouped by package and page object. A scenario URL,
for example `/fixtures/lib-essential/element-po/counter`, renders only that
scenario. Catalog navigation does not appear beside the fixture. Use browser
back/forward to return to the catalog. TanStack Router handles client-side
transitions, direct links, and reloads. Unknown addresses show a not-found view.

```text
src/
  catalog.tsx                         catalog presentation
  router.tsx                          route selection and scenario lifetime
  fixtures/
    manifest-types.ts                 typed registration contract
    packages.ts                       package registration
    lib-essential/
      manifest.ts                     objects offered by this package
      element-po/
        addresses.mts                 dependency-free IDs and URLs
        manifest.ts                   complete scenario registration
        counter.tsx                   ordinary counter
        delayed-counter.tsx           asynchronous counter updates
        replaceable-counter.tsx       replacement DOM with retained count
        text-collection.tsx           ordered and hidden-text examples
        counter-example.tsx           component shared by counter scenarios
```

Each object owns its scenarios even when it reuses small React components. Several
related tests can use one scenario. A test focused on one object stays with that
object when other objects are incidental. Equally important compositions will get
separate demo/test sections when a concrete example needs them; none are scaffolded
in advance.

## Add a scenario or page object

1. Add a scenario ID and stable URL to the owning object's `addresses.mts`.
   Its metadata-only package subpath is consumed by tests. For a new object,
   declare a new explicit export in this package's `package.json`.
2. Implement the scenario component under `src/fixtures/<package>/<object>/`.
   Keep Playwright and Pomeranian imports out of the app. Use normal HTML hooks.
3. Register the label, address, and lazy component in that object's `manifest.ts`.
   `ScenarioDefinitions<typeof addresses>` requires every declared ID and the
   correct address for it. Keep component imports behind lazy loaders.
4. Register a new object in its package manifest, and a new package in
   `fixtures/packages.ts`. Existing-object additions need no central catalog edit.
5. Add browser specs beside the page-object implementation, named `*.spec.ts`.
   Declare this app as a `workspace:*` dev dependency of the owning library and
   import its metadata export, for example:

   ```ts
   import { elementFixtureUrls } from "@pomeranian/demo-app-react/fixture-addresses/lib-essential/element-po";
   await page.goto(elementFixtureUrls.counter);
   ```

   A new library must give browser specs their own Playwright lint override and
   TypeScript leaf, excluding them from production-library inputs. Follow
   `packages/lib-essential` for ownership and discovery configuration. The central
   runner automatically discovers `packages/*/src/**/*.spec.ts`.

6. Run workspace lint/typechecks and the root tests on the supported Node 22
   runtime. See [CONTRIBUTING.md](../../CONTRIBUTING.md#page-object-tests-and-react-fixture).

The address modules export only literal metadata and types. They must not import
React, the router, component manifests, or fixtures. This prevents tests from
loading the renderer when they only need an address. No separate contract package
is required.

## State and style isolation

Scenario identity controls remounting. Leaving and re-entering a scenario,
including through browser history, starts fresh local React state. Navigating to
the same active URL is not a reset command; reload if needed. Cookies and storage
are not implicitly cleared. A future scenario using persistence must establish
its own starting conditions.

Use normal effect cleanup for timers, subscriptions, and listeners. Keep styles
in locally scoped CSS modules. Catalog styles must not target fixture elements,
and components must load only when their scenario is selected. CSS modules may
remain loaded after navigation; their scoped selectors must not affect neighbors.
A future component library requiring global styles needs explicit lifecycle
ownership and isolation checks; lazy importing alone does not unload those styles.

Browser code and registration typechecks use the shared browser-react environment
and React lint profile. Vite and lint configuration use the shared Node environment
and base lint profile. Both leaves participate in workspace checks.
