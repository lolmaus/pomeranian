# React lint baseline for the core-checks scope review

Researched on 2026-09-22 for [issue #13](https://github.com/lolmaus/pomeranian/issues/13)
and [PR #24](https://github.com/lolmaus/pomeranian/pull/24), using the pinned Oxlint
1.85.0. This note retains the React baseline research and recommendation.

**Policy update, 2026-09-22:** The author approved the modern baseline in Q9,
including Compiler-backed correctness diagnostics, and the coordinated issue
amendments are published. The
[approved scope review](core-checks-review-requirements.md) records current policy.
The isolated probes below remain feasibility evidence, not implementation
acceptance.

## Recommended baseline

Provide a shared React lint profile for the future React demo, retaining the
common TypeScript and correctness checks. Use Oxlint's native `react` plugin,
`correctness: "error"`, explicit `react/rules-of-hooks: "error"` and
`react/exhaustive-deps: "error"`, and `react/react-in-jsx-scope: "off"`. Keep the
existing zero-warning command policy and safe `--fix` behavior.

The React plugin includes implementations from React, Hooks, React Refresh, and
the React Compiler. Setting `plugins` replaces the default list, so preserve the
base's selected plugins; its current defaults are `unicorn`, `typescript`, and
`oxc`, in addition to ESLint core. Adding React must not silently remove them.
[Native plugin documentation](https://oxc.rs/docs/guide/usage/linter/plugins.html).

This profile should cover the demo's React source, including custom Hooks in `.ts`
files and components in `.tsx` files. Its consuming package should own concrete
file patterns. Node tooling and Pomeranian's Playwright-facing library source need
their respective profiles. Proactive configuration does not require introducing
a demo application or React runtime dependency in this foundation slice.

### Two explicit Hooks rules

`react/rules-of-hooks` is classified as **pedantic** in Oxlint 1.85.0. React plus
correctness therefore does not enable it. Enable it individually to catch
conditional Hooks without turning on the entire pedantic category.
[Oxlint rules-of-hooks](https://oxc.rs/docs/guide/usage/linter/rules/react/rules-of-hooks).

`react/exhaustive-deps` is a correctness rule and already activates with that
category. Naming it explicitly makes the intended Hooks contract clear. Missing
dependencies can create stale effects; the rule offers a dangerous fix and a
suggestion, so the normal safe fixer should continue leaving such defects for
deliberate correction.
[Oxlint exhaustive-deps](https://oxc.rs/docs/guide/usage/linter/rules/react/exhaustive-deps).

The automatic JSX runtime does not need a default `React` import. Oxlint's
`react-in-jsx-scope` rule documents that it should be disabled for TypeScript's
`react-jsx` or `react-jsxdev` modes. Hook imports such as `useEffect` are still
needed when used.
[JSX scope rule](https://oxc.rs/docs/guide/usage/linter/rules/react/react-in-jsx-scope).

### Keep the compiler-backed correctness diagnostics

Recommend retaining these diagnostics. React explicitly recommends compiler
diagnostics even for applications that do not use the compiler to transform
their builds. They detect React mistakes such as impure rendering and mutation;
they are not merely a request to adopt an optimization tool.
[React's lint guidance](https://react.dev/reference/eslint-plugin-react-hooks).

Oxlint's 2026-08-18 announcement replaced the former nursery
`react/react-compiler` rule with 22 category-specific rules and placed its
recommended checks in correctness. It reports extensive conformance work while
acknowledging unfinished compiler paths. The plugin guide still calls the native
compiler integration experimental. These maturity signals should be recorded,
not resolved by pretending either statement is absent.
[Oxlint announcement](https://oxc.rs/blog/2026-08-18-react-compiler-support),
[plugin maturity note](https://oxc.rs/docs/guide/usage/linter/plugins.html).

Pinned behavior is unambiguous: React plus correctness enables 12 compiler-backed
rules: `error-boundaries`, `globals`, `immutability`, `incompatible-library`,
`preserve-manual-memoization`, `purity`, `refs`, `set-state-in-effect`,
`set-state-in-render`, `static-components`, `use-memo`, and `void-use-memo`.
The pinned `purity` source declares correctness, and the shared analysis helper
runs in lint-only mode. This does not install or enable a React build transform.
[Pinned purity source](https://github.com/oxc-project/oxc/blob/oxlint_v1.85.0/crates/oxc_linter/src/rules/react/purity.rs),
[pinned analysis helper](https://github.com/oxc-project/oxc/blob/oxlint_v1.85.0/crates/oxc_linter/src/utils/react_compiler.rs).

This is a native Oxlint baseline, not a claim of exact parity with an ESLint
preset. It does not activate every compiler rule: for example,
`unsupported-syntax` is classified as restriction. No broader category or
experimental nursery policy is necessary for this proposal.
[Compiler rule mapping](https://oxc.rs/blog/2026-08-18-react-compiler-support).

## Accessibility remains a separate policy

`jsx-a11y` is a separate native plugin, not part of enabling React. Leave it out of
this proposal, which covers the requested React and Playwright integrations.
If accessibility linting is requested later, its scope should account for the
demo's role as an E2E fixture, including deliberate negative examples.
[Plugin list](https://oxc.rs/docs/guide/usage/linter/plugins.html).

## Executed probes

Temporary JSON configurations and source files outside the repository used Node
24.21.0, pnpm 11.27.1, and the installed Oxlint 1.85.0. The proposed configuration
preserved the existing base rules and default plugins, added React correctness,
enabled the two Hooks rules explicitly, and disabled `react-in-jsx-scope`.

Each source was checked with
`pnpm exec oxlint --config <temporary-config> <temporary-source> --max-warnings 0`.
Results were:

| Probe                                                                            | Result                                                                         |
| -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Conditional `useState` with React correctness alone                              | Passed: `rules-of-hooks` was absent.                                           |
| Same conditional Hook with the proposed baseline                                 | Failed with `react-hooks/rules-of-hooks`, exit 1.                              |
| Conditional Hook in a custom Hook's `.ts` file                                   | Failed with the same rule, exit 1.                                             |
| Effect reading a prop omitted from its dependency array                          | Failed with `react-hooks/exhaustive-deps`, exit 1.                             |
| JSX list elements without keys                                                   | Failed with `react/jsx-key`, exit 1.                                           |
| Correct component using the automatic JSX runtime without a default React import | Passed, exit 0.                                                                |
| `Math.random()` in rendering                                                     | Failed with `react/purity`, exit 1; disabling the compiler rules made it pass. |
| A `debugger` statement in a component                                            | Failed with `eslint/no-debugger`, confirming preserved base checks.            |
| Image without `alt`                                                              | Passed; adding `jsx-a11y` separately made `jsx-a11y/alt-text` fail.            |
| Safe `--fix` on the missing effect dependency                                    | Failed, exit 1; source remained unchanged.                                     |

All check invocations left inputs unchanged. Temporary probes and downloaded
source excerpts were removed. These prove native lint behavior, not React
execution, typed-project discovery, or integration of the future demo package.

## Decision considered and subsequently approved

The choice was the modern native baseline, including compiler-backed correctness
diagnostics, or a more conservative baseline disabling those 12 checks while
retaining JSX checks and the two explicit Hooks rules. The author approved the
recommended modern baseline in Q9. The tradeoff concerns the native
implementation's maturity and stricter React diagnostics, not whether Pomeranian
will adopt the React build compiler.
