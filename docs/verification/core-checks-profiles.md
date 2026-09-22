# Core-check profile and editor acceptance

Part of [extended core checking verification](core-checks-extension.md) for
[#13](https://github.com/lolmaus/pomeranian/issues/13) and
[PR #24](https://github.com/lolmaus/pomeranian/pull/24).

Execution date: 2026-09-22. Implementation checkpoint:
`a54245d8d6181275709ae922c8d7ea10594c75eb`.
Isolated detached worktree: `/tmp/pomeranian-13-extension-profiles`.
Evidence directory: `/tmp/pomeranian-13-extension-evidence/profiles`.

This verifies the advertised configurations through the real core consumer and
Oxlint-config package, not new packages or an application. Temporary inputs,
consumer leaves, script changes and dependencies are restored after acceptance.
No browser execution or VS Code GUI session is claimed. The main verification record covers safe fixes, cache invalidation, export
boundaries, and hosted acceptance.

## Toolchain and temporary consumer wiring

The worktree used Node 24.21.0, pnpm 11.27.1, Oxlint 1.85.0,
oxlint-tsgolint 7.0.2002, TypeScript 7.0.2, eslint-plugin-playwright 2.12.0,
and ESLint 10.11.0 from the implementation's frozen lockfile. Core's canonical
Node declarations were 22.20.4 and its author-only scoped alias was 24.13.6;
the Oxlint configuration package used canonical 24.13.6.

Executed installation:

```sh
pnpm install --frozen-lockfile
pnpm --filter @pomeranian/core add -D --save-exact \
  @playwright/test@1.63.0 @types/react@19.3.0
```

The temporary add installed five packages, including actual Playwright and React
declarations. It did not install browser binaries, a React runtime, a bundler, or
an application. Consumers of these presets own their relevant type dependencies.

The three real leaves were retained:

| Input                 | Owning configuration                        |
| --------------------- | ------------------------------------------- |
| Core `src/**/*`       | `packages/core/tsconfig.library.json`       |
| Core `*.mts`          | `packages/core/tsconfig.node.json`          |
| Oxlint-config `*.mts` | `packages/oxlint-config/tsconfig.node.json` |

Three temporary leaves were added inside the existing core package:

| Leaf                                  | Public extends                                | Include                      |
| ------------------------------------- | --------------------------------------------- | ---------------------------- |
| `tsconfig.acceptance-playwright.json` | `@pomeranian/typescript-config/playwright`    | `acceptance/playwright/**/*` |
| `tsconfig.acceptance-browser.json`    | `@pomeranian/typescript-config/browser`       | `acceptance/browser/**/*`    |
| `tsconfig.acceptance-react.json`      | `@pomeranian/typescript-config/browser-react` | `acceptance/react/**/*`      |

The Playwright consumer leaf also selected
`typeRoots: ["./node_modules/@types"]`. Existing core library/tooling type roots
were preserved. All three references were added to the package's empty
`tsconfig.json`, and its real `typecheck` script retained its two existing commands
and appended independent checks for all three temporary leaves:

```sh
tsc --noEmit --project tsconfig.library.json &&
tsc --noEmit --project tsconfig.node.json &&
tsc --noEmit --project tsconfig.acceptance-playwright.json &&
tsc --noEmit --project tsconfig.acceptance-browser.json &&
tsc --noEmit --project tsconfig.acceptance-react.json
```

The package's temporary common lint entry extended its actual `oxlint.config.mts`
and added the public Playwright test fragment only for
`acceptance/playwright/**/*.ts`. Its explicit helper names were
`["expect", "assertVisible"]`. The React entry extended the public complete
`@pomeranian/oxlint-config/react` configuration. Its real scripts composed these
invocations with `&&`, and the fixer used the same scopes plus `--fix`:

```sh
oxlint --config oxlint.acceptance.mts src *.mts \
  acceptance/playwright acceptance/browser --max-warnings 0 &&
oxlint --config oxlint.react-acceptance.mts acceptance/react --max-warnings 0
```

Thus React correctness rules had a separate invocation and did not leak into Node
or Playwright files. All ordinary commands below used the actual package scripts
and actual root Turbo scripts, rather than standalone fixture-only lint commands.

## Repeated command pattern

Unless noted, each case ran both the appropriate package command and root command,
with the same task and expected diagnostic, then restored its input. Package
names were `@pomeranian/core` and `@pomeranian/oxlint-config` as appropriate:

```sh
pnpm --filter PACKAGE run lint
pnpm run lint
pnpm --filter PACKAGE run typecheck
pnpm run typecheck
```

Expected failures exited 1 with the intended diagnostic; valid/corrected cases
exited 0. `results.jsonl` records every command, working directory, expected and
observed exit, diagnostic requirement, and duration. Individual `.log` files
retain full output. The complete normal baseline passed for both actual source
packages and all advertised environments before defects were introduced.

## Environment and public TypeScript entrypoints

For each of the six current/temporary leaves, a newly added owned input containing
`export const invalid: string = 1;` independently failed package/root typechecking
with TS2322. Removing the input restored the baseline. This includes both actual
Node-tooling consumers, not only library source.

| Case                                                                         | Package/root outcome                                                                        |
| ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Core library imports `mkdtempDisposableSync` from `node:fs`                  | TS2305, absent from the selected Node22 declarations.                                       |
| Core author `.mts` imports that same Node API                                | Pass under the selected Node24 declaration alias.                                           |
| Core author `.mts` references `document.title`                               | Fails because `document` is unavailable.                                                    |
| Browser and Browser+React source reference unimported `process.platform`     | Each independently fails because `process` is unavailable.                                  |
| Library imports actual Playwright `Page` and the newer Node API              | Still fails TS2305 for the newer API, even with transitive Playwright declarations present. |
| Library imports actual Playwright `Page` without the newer API               | Pass with the necessary consumer-owned DOM library overlay.                                 |
| Playwright test types and `page.evaluate(() => document.title)`              | Pass under the Playwright preset; deliberate assignment error independently fails.          |
| Automatic JSX component and `.ts` custom Hook with actual React declarations | Pass without a default React import; deliberate typed errors independently fail.            |

For the library/Playwright declaration cases only, its temporary consumer leaf
added `lib: ["ES2023", "DOM", "DOM.Iterable"]`. The shared base/library preset
was unchanged. This explicitly demonstrates the limitation: DOM types may be
needed to describe Playwright dependencies/browser callbacks, and cannot restrict
browser globals to callback bodies. Pure author Node tooling still rejected DOM.

Compiler file listings confirmed core library used the 22.20.4 declaration tree,
core author tooling used 24.13.6, and config-package tooling used 24.13.6. The
actual API rejection with Playwright imports is stronger than relying only on a
`types` declaration or manifest pin.

The public `/base` entry was exercised directly by temporarily changing the
consumer-owned Browser leaf to extend `@pomeranian/typescript-config/base`,
including only an isolated `acceptance/base.ts` file and supplying local
`target: "ES2023"`, `module: "NodeNext"`, and `types: []`. Its valid string passed
package/root checks; changing the value to `undefined` failed TS2322 under shared
strictness. The original Browser leaf was restored afterward. This verifies base
through package identity without adding a sixth advertised environment.

## Project-dependent typed linting

Each of the six leaf configurations temporarily received its own local alias:

```json
{
  "compilerOptions": {
    "paths": {
      "@acceptance/library": ["./src/acceptance-library-helper.ts"]
    }
  }
}
```

The role and relative helper path changed for Node/configuration/Playwright/
Browser/React. Aliases were consumer-owned probe settings, not production alias
conventions. Each helper exported:

```ts
export function asyncWork(): Promise<number> {
  return Promise.resolve(1);
}
```

The deliberate caller imported that role's alias and discarded its promise:

```ts
import { asyncWork } from "@acceptance/library";

export function exercise(): void {
  asyncWork();
}
```

For every leaf independently:

1. Its package and root typecheck passed, proving an extra typed-lint behavior.
2. `OXC_LOG=debug pnpm --filter PACKAGE run lint` failed with
   `typescript/no-floating-promises` at that leaf's caller.
3. Root lint failed with that same intended diagnostic.
4. Correction to an `async` function awaiting `asyncWork()` passed package/root
   lint. No rule disabling or fake success command was used.

Debug output named each caller and helper's exact intended configuration and
reported **zero unmatched files**. Core's ordinary invocation discovered four
programs, and its separate React invocation discovered the React program. The
config-package command discovered its own Node program. The configured alias
makes this evidence depend on actual program options; a global Promise example
alone would not distinguish an inferred program.

## Native editor project and diagnostic verification

Executed from the isolated real workspace:

```sh
node_modules/.bin/tsc --lsp --stdio
```

The server identified itself as `typescript-go` **7.0.2**. A temporary external
Python client used JSON-RPC framing, initialized with the real workspace root URI
and workspace folder, answered configuration requests, opened one representative
file per leaf, then requested `custom/projectInfo` and
`textDocument/diagnostic`. Each file contained a deliberate number-to-string error
and a reference to `document.title`.

| Leaf                   | Project selected                      | Diagnostics                                 |
| ---------------------- | ------------------------------------- | ------------------------------------------- |
| Core library           | `tsconfig.library.json`               | TS2322 and TS2584 for unavailable document. |
| Core author tooling    | `tsconfig.node.json`                  | TS2322 and TS2584.                          |
| Config-package tooling | Its own `tsconfig.node.json`          | TS2322 and TS2584.                          |
| Playwright             | `tsconfig.acceptance-playwright.json` | TS2322; DOM reference accepted.             |
| Browser                | `tsconfig.acceptance-browser.json`    | TS2322; DOM reference accepted.             |
| Browser+React          | `tsconfig.acceptance-react.json`      | TS2322; DOM reference accepted.             |

The final session shut down successfully. The first external client run sent
`params: null` for `shutdown`; the native server rejected that protocol shape.
Omitting the nonexistent parameter fixed the client, and the complete session was
rerun successfully. No repository implementation change was needed.

This is actual native language-server discovery/diagnostic verification. No VS
Code executable, GUI session, Problems panel, or installed extension session was
exercised. The [editor release record](core-checks-extension.md#editor-release-and-selection-evidence)
documents the supported VS Code/extension versions and workspace SDK selection.

## Playwright profile outcomes

The representative real-library helper imported actual `expect`/`Locator` from
`@playwright/test` and used ordinary fields/constructor assignment:

```ts
export class Element_PO {
  locator: Locator;
  constructor(locator: Locator) {
    this.locator = locator;
  }
  async assertVisible(): Promise<void> {
    await expect(this.locator).toBeVisible();
  }
  assertReturned(): Promise<void> {
    return expect(this.locator).toBeVisible();
  }
  async assertState(visible: boolean): Promise<void> {
    if (visible) {
      await expect(this.locator).toBeVisible();
    } else {
      await expect(this.locator).toBeHidden();
    }
  }
  click(): Promise<void> {
    return this.locator.click();
  }
}
```

This temporary helper is not a proposed product API. It lived in core source and
was removed after the probes. The representative test imported it through a
relative file import and ran:

```ts
test("visible", async ({ page }) => {
  await new Element_PO(page.getByRole("button")).assertVisible();
});
```

| Case                                                                     | Package/root observed result                                                           |
| ------------------------------------------------------------------------ | -------------------------------------------------------------------------------------- |
| Awaited, returned and conditional helper assertions                      | Lint/typecheck pass. Library branching remains permitted.                              |
| Exported helper discards `expect(locator).toBeVisible()`                 | Lint fails `playwright/missing-playwright-await` and the typed promise rule.           |
| Exported helper awaits `page.waitForTimeout(100)`                        | Fails `playwright/no-wait-for-timeout`.                                                |
| Identical helper renames typed receiver to `driver: Page`                | Passes; recorded plugin name-heuristic limitation.                                     |
| Test delegates to the explicitly recognized `assertVisible` helper       | Passes.                                                                                |
| Same test calls only `click()`                                           | Fails `playwright/expect-expect`; helper recognition does not exempt ordinary actions. |
| `test as scenario`, `expect as check`, then `scenario.only(...)`         | Fails `playwright/no-focused-test` in the test scope.                                  |
| Identical focused-test input placed in library source outside test scope | Passes; the contrast proves rule scoping, not a recommendation to put tests there.     |
| Actual test awaits `page.waitForTimeout(100)` and makes an assertion     | Fails the API rule in test scope too.                                                  |
| Test-scoped file contains the common prefer-const defect                 | Fails the shared baseline rule.                                                        |

No optional locator/collection restrictions were added. The observed receiver
heuristic is why typed promise checks remain part of the common baseline.

## React profile outcomes

The valid component used named `useState`/`useEffect` imports, an exhaustive
`[label]` effect dependency, and automatic JSX with no default React import:

```tsx
import { useEffect, useState } from "react";

export function Demo({ label }: { label: string }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    document.title = label;
  }, [label]);
  return (
    <button onClick={() => setCount(count + 1)}>
      {label}: {count}
    </button>
  );
}
```

A separate valid `.ts` custom Hook returned `useState(0)`. Both linted and
compiled through the real consumer/root commands before introducing defects.

| Case                                                                                     | Package/root observed result                                                    |
| ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| TSX component conditionally calls `useState(0)`                                          | Fails `react-hooks/rules-of-hooks`.                                             |
| `.ts` custom Hook conditionally calls `useState(0)`                                      | Independently fails the same rule; React coverage is not limited to TSX.        |
| Component renders `<div>{Date.now()}</div>`                                              | Fails `react/purity`, proving the accepted Compiler-backed diagnostic executes. |
| Effect reads `label` but its dependency array is `[]`                                    | Fails `react-hooks/exhaustive-deps`.                                            |
| Package and root safe fix commands on that dependency defect                             | Both still fail; the input bytes remain unchanged.                              |
| React-owned source contains the common prefer-const defect                               | Fails the shared baseline rule.                                                 |
| Hook-shaped synthetic code in pure Node `.mts` tooling, with a declared local `useState` | Passes the separately selected common policy; React rules stay scoped.          |

The dependency defect's SHA-256 before and after both safe fix commands was
`9d3b7f9cc1b701766f16b066d90a39161755e6b3767dfac448304101fd5a987e`.
No dangerous fixer flags were used. After all framework probes were removed,
package/root lint and typecheck passed again with the temporary future profiles
still connected.

## Restoration and limits

The execution log records **125 CLI commands**, with zero unexpected outcomes,
plus the successful six-file native LSP session. Expected rejection cases were
checked for their intended diagnostic, not merely a nonzero status.

A scan of owned core/configuration inputs found no JavaScript, JSX, MJS/CJS,
source maps, declarations, or `.tsbuildinfo` output. Temporary source/helper files,
future leaf configurations, local aliases, lint entries, script changes, and
manifest/lockfile changes were then removed/restored. These final commands passed:

```sh
pnpm install --frozen-lockfile
pnpm run lint
pnpm run typecheck
pnpm run format
git diff --exit-code HEAD
git status --short
```

The last status was empty and the worktree exactly matched checkpoint
`a54245d8d6181275709ae922c8d7ea10594c75eb`. No temporary dependencies or profile
fixtures were added to the deliverable. Logs, version inventory, file listings,
LSP transcript/results, and command-result records remain outside the repository
as supplementary local audit material; this document retains the repeatable
procedure and observed outcomes.

The subsequent [source-extension correction](core-checks-extension.md#additional-source-extension-coverage)
widened core's library-profile glob from `.ts` to `.ts`, `.tsx`, `.mts`, and
`.cts`. The completed `.ts` evidence remains applicable; the main record includes
additional-extension probes and final cache-input accounting. No dry-run hash
claim is made for the temporary future leaves after their removal.

These checks establish preset/profile execution, project ownership, and source
checking boundaries. They do not establish a published artifact's runtime or
public-declaration compatibility, real browser behavior, a React build transform,
or a VS Code GUI session.
