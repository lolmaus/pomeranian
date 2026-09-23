# Playwright linting for library code and tests

Researched on 2026-09-22 for [issue #13](https://github.com/lolmaus/pomeranian/issues/13)
and [PR #24](https://github.com/lolmaus/pomeranian/pull/24). The author has requested
proactive Playwright and React lint profiles. This note retains the research and
proposed scope that informed that decision.

**Policy update, 2026-09-22:** The author approved the library API scope and test
overlay in Q8, and the coordinated issue amendments are published. The
[approved scope review](core-checks-review-requirements.md) records current policy.
The probes below establish feasibility, not implementation acceptance.

## Findings

`eslint-plugin-playwright` is a practical integration with the pinned Oxlint
1.85.0. Its current published version was **2.12.0** when queried. Oxlint loads
ESLint-compatible plugins through `jsPlugins` and explicit rule settings. This
interface remains **alpha**. The published Oxlint conformance snapshot tests
plugin 2.9.0: 3,044 of 3,048 cases pass, with four failures in regular-expression
options for `valid-test-tags`. That older snapshot is supporting evidence, not a
guarantee for every rule in 2.12.0.
[Oxlint JS plugins](https://oxc.rs/docs/guide/usage/linter/js-plugins.html),
[conformance snapshot](https://github.com/oxc-project/oxc/blob/main/apps/oxlint/conformance/snapshots/playwright.md),
[published package metadata](https://registry.npmjs.org/eslint-plugin-playwright/2.12.0).

The plugin recommends restricting its recommended configuration to Playwright
test files. That preset combines Playwright API checks with test-structure
policy, such as requiring assertions in tests, prohibiting focused tests, and
constraining hooks. A reusable page-object module is a different consumer.
Copying the whole ESLint flat configuration into an Oxlint configuration is also
not the documented integration: load the plugin and adapt its rules, with the
intended file scope.
[Plugin usage and rule inventory](https://github.com/mskelton/eslint-plugin-playwright#usage).

### Assertion helpers are supported, with boundaries

`no-standalone-expect` deliberately permits assertions inside helper functions and
page-object methods. It does **not** require moving those assertions into test
bodies. Conversely, `expect-expect` cannot generally infer that a call to a
Pomeranian method performs an assertion; its explicit `assertFunctionNames` and
`assertFunctionPatterns` options support that case. Matching a helper name is a
policy declaration, not analysis of the helper's implementation.
[Standalone expectations](https://github.com/mskelton/eslint-plugin-playwright/blob/main/docs/rules/no-standalone-expect.md),
[assertion recognition](https://github.com/mskelton/eslint-plugin-playwright/blob/main/docs/rules/expect-expect.md).

The plugin recognizes ordinary `test`/`expect` calls and named-import aliases;
settings can declare additional global aliases. Its detection is not a
TypeScript type analysis. For example, page-method rules recognize certain
receiver names, including `page` and `this.page`. A variable typed as `Page` but
named `driver` can evade those checks. The local probe below demonstrated this
with `waitForTimeout`. Typed promise rules therefore remain necessary even when
Playwright rules are enabled.
[Call recognition](https://github.com/mskelton/eslint-plugin-playwright/blob/main/src/utils/parseFnCall.ts),
[page receiver detection](https://github.com/mskelton/eslint-plugin-playwright/blob/v2.12.0/src/utils/ast.ts).

`missing-playwright-await` accepts an awaited or returned asynchronous assertion.
Its default coverage includes async matchers and selected Playwright operations;
broader page/locator method coverage requires `includePageLocatorMethods`.
Custom async matchers can be named explicitly. Enabling this rule is not evidence
that arbitrary asynchronous Pomeranian methods are checked.
[Missing await options](https://github.com/mskelton/eslint-plugin-playwright/blob/main/docs/rules/missing-playwright-await.md).

## Proposed policy

Provide one Playwright family with two explicitly scoped rule sets:

| Input                                          | Proposed rule policy                                                                                                                                                                                   |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Library modules and reusable assertion helpers | Common correctness/typed rules plus applicable Playwright API rules. Examples: missing assertion awaits, fixed sleeps, `page.pause()`, unsafe browser-evaluation references, and invalid expectations. |
| Playwright test files                          | The same API checks plus the plugin's recommended test rules, with documented exceptions and recognized assertion helpers.                                                                             |
| Node tooling and React application source      | Their respective profiles; Playwright test-structure rules do not apply.                                                                                                                               |

Start the test profile from the pinned plugin's recommended rule map, and keep a
deliberate API subset for library modules. The recommended map also disables
`no-empty-pattern` and contains a spacing rule; neither setting should leak
indiscriminately into the shared repository baseline. Preserve the existing
zero-warning check contract, so upstream warning severities still fail checks.
This recommendation is a policy inference from the different responsibilities
above, not a requirement imposed by Oxlint.

Avoid introducing optional restrictions such as banning raw locators, `first`,
`last`, or `nth` merely because the plugin offers them. Those restrictions would
prejudge Pomeranian's planned target and collection behavior. Rules concerning
forced actions, locator delegation, and custom matchers likewise need to respect
the eventual product contract. The proposed baseline can be revised when those
APIs acquire concrete behavior.
[Available Playwright rules](https://github.com/mskelton/eslint-plugin-playwright#rules),
[approved roadmap](../../ROADMAP.md).

The author chose proactive Playwright support after being informed that its
Oxlint integration is alpha. The library/test distinction was subsequently
approved in Q8. Proactive support does not require creating the real browser test
suite in #13. Temporary representative modules can prove the profiles, and later
consuming slices can supply their exact file patterns and assertion-helper names.
Recognize explicit names matching actual assertion APIs, with a negative probe
for an ordinary action; a permissive wildcard could hide missing assertions.

## Isolated local probe

Executed with Node **24.21.0**, pnpm **11.27.1**, repository Oxlint **1.85.0**, and
`eslint-plugin-playwright` **2.12.0**, in `/tmp/pomeranian-playwright-lint-probe`.
No repository dependencies or lint configuration were changed. These were lint
probes only: imports were representative and no Playwright/browser execution or
TypeScript compilation was performed.

The metadata query ran outside the repository because its developer-engine
policy correctly rejects npm as the repository package manager:

```sh
npm view eslint-plugin-playwright version dist.tarball --json \
  --cache /tmp/pomeranian-playwright-scope-npm-cache
pnpm add -D --save-exact eslint-plugin-playwright@2.12.0 --ignore-scripts
```

The disposable package pinned pnpm 11.27.1 and used `autoInstallPeers: false`.
Installation succeeded with an unmet ESLint peer warning. The plugin executed
without an ESLint runtime installation in this probe; an actual repository
integration still needs to satisfy its dependency and peer requirements.

A temporary configuration isolated plugin behavior by disabling native plugins
and the native correctness category, then loading the published recommended
rules:

```js
import playwright from "./node_modules/eslint-plugin-playwright/index.js";

const config = {
  plugins: [],
  categories: { correctness: "off" },
  jsPlugins: ["eslint-plugin-playwright"],
  rules: playwright.configs["flat/recommended"].rules,
};
```

Each case ran through the repository binary:

```sh
/home/developer/projects/lolmaus/pomeranian/node_modules/.bin/oxlint \
  --config oxlint.config.json --max-warnings 0 CASE.ts
```

| Case                                                                         | Observed result                                                               |
| ---------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Class method awaiting `expect(this.locator).toBeVisible()`                   | Exit 0.                                                                       |
| Class method branching between awaited visible/hidden assertions             | Exit 0; ordinary library branching was not treated as conditional test logic. |
| Helper returning `expect(locator).toBeVisible()`                             | Exit 0.                                                                       |
| Helper discarding `expect(locator).toBeVisible()`                            | Exit 1, `missing-playwright-await`.                                           |
| Exported helper awaiting `page.waitForTimeout(1000)`                         | Exit 1, `no-wait-for-timeout`.                                                |
| Class method awaiting `this.page.waitForTimeout(1000)`                       | Exit 1, `no-wait-for-timeout`.                                                |
| Same typed helper with receiver renamed to `driver: Page`                    | Exit 0; a verified detection limitation.                                      |
| Test whose only assertion is `Element_PO.assertVisible()`                    | Exit 1, `expect-expect`.                                                      |
| Same test with `assertFunctionNames: ["assertVisible"]`                      | Exit 0.                                                                       |
| Test calling only `Element_PO.click()` under that helper-aware setting       | Exit 1, `expect-expect`; unrelated operations were not exempted.              |
| `test as scenario`, `expect as check`, with `scenario.only(...)`             | Exit 1, `no-focused-test`.                                                    |
| `test`/`expect` imported from a custom fixture module, with `test.only(...)` | Exit 1, `no-focused-test`.                                                    |

The first test probes also exposed the recommended spacing rule. Adding a blank
line before each test removed that warning; the focused-test and helper results
above were rerun without the incidental spacing defect. Both plugin configuration
loading and positive/negative examples succeeded. This is limited feasibility
evidence, not an exhaustive conformance test of the plugin or an acceptance run
of the proposed repository configuration.

The temporary package, inputs, lockfile, dependencies, and dedicated metadata
cache were removed after recording these results. The existing external pnpm
store was reused; no downloaded dependency or generated artifact was delivered
in the repository.

## Proposed acceptance additions

- Prove an actual Playwright API defect fails for a library helper and a test
  input, while valid awaited and returned helper assertions pass.
- Prove test-only policy reaches intended test files and does not restrict
  ordinary library control flow or the React application.
- Prove the documented helper/alias conventions and record heuristic limits;
  avoid claiming complete coverage based only on an effective-configuration dump.
- Keep typed promise detection and independent typechecking, and prove those
  checks reach each intended TypeScript project.
- Pin the plugin and verify its relevant rules with the selected Oxlint version;
  rerun meaningful probes when upgrading either side of the alpha interface.
