# Browser behavior checks

This private application owns Playwright runner configuration, fixture-catalog
checks, and report verification. Page-object browser specs live beside their
implementations under `packages/*/src/**/*.spec.ts`; the runner discovers them
without per-package registration. App infrastructure specs remain under `tests/`.
The selected behavior environment is the latest supported **Node 22** patch and
the Chromium revision supplied by pinned **Playwright 1.63.0**. Author tooling
continues to use the repository's `.nvmrc`; select Node 22 before running behavior
checks. The counter check records the actual Node and Chromium versions in its
Playwright report.

After the normal root frozen installation, install the matching browser once:

```sh
pnpm --filter @pomeranian/tests-e2e exec playwright install --with-deps chromium
```

Run from the repository root:

```sh
pnpm run test:e2e
```

The suite automatically builds the React application, starts its production
preview at `http://127.0.0.1:43191`, and stops it afterwards. The port must be free;
an existing server is never reused. The demo needs no deployment or credentials.

For a focused development loop, run inside this package:

```sh
pnpm exec playwright test element-po.spec.ts
pnpm exec playwright test fixture-catalog.spec.ts
```

The full `test` command additionally verifies named steps and diagnostics in the
genuine JSON report, including specimens inside nested suites. Matching edge cases catch failures and check their specific
native reason. Two clearly named report specimens deliberately use `test.fail`;
the subsequent report checks require their intended native mismatch, name and
timeout. These specimens appear with a cross in the list reporter, while the full
command succeeds only when their evidence is correct. The ignored
`test-results/report.json` contains the complete evidence. Failed browser tests
also retain a trace, which can be opened with `pnpm exec playwright show-trace`.

Browser tests and Playwright configuration use the shared Playwright TypeScript
environment with Node 22 declarations. Root `.mts` tooling uses the shared Node
environment and separately scoped Node 24 declarations. Only browser `.spec.ts`
files receive test-structure lint rules. Libraries own equivalent overrides for
their colocated specs; `shouldHaveText` and `shouldNotHaveText` are registered
assertion methods, while `click` is not.
The tooling leaf also loads DOM declarations required by Playwright's exported
report types; this supplies type dependencies without introducing browser globals
at Node runtime.
