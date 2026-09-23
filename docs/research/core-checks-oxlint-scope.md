# Oxlint baseline for the core-checks scope review

Researched on 2026-09-22 for [issue #13](https://github.com/lolmaus/pomeranian/issues/13)
and [PR #24](https://github.com/lolmaus/pomeranian/pull/24). This note retains the
findings and proposals that informed the scope discussion.

**Policy update, 2026-09-22:** All nine interview decisions are approved and the
coordinated issue amendments are published. The
[approved scope review](core-checks-review-requirements.md) records current policy;
the observations here do not establish acceptance of its implementation.
Later framework probes are
recorded in the [React](core-checks-react-lint-scope.md) and
[Playwright](core-checks-playwright-lint-scope.md) follow-ups.

## What the existing configuration does

The [shared configuration](../../packages/oxlint-config/base.mts) enables the
`correctness` category as errors, plus `prefer-const` and `eqeqeq`. It is a working
baseline rather than an empty placeholder. The pinned Oxlint 1.85.0 was the latest
normal release when checked, published on 2026-09-21.
[Release](https://github.com/oxc-project/oxc/releases/tag/oxlint_v1.85.0).

Oxlint's native equivalent of starting with recommended rules is its default
`correctness` category. Its documented `extends` facility combines configuration
files or imported objects; an ESLint-style built-in `recommended` preset is not
the documented mechanism. Categories activate rules from enabled plugins.
`suspicious` broadens checks to likely mistakes; `pedantic`, `style`, `restriction`,
and `nursery` have different purposes and do not collectively mean recommended.
[Configuration](https://oxc.rs/docs/guide/usage/linter/config.html).

Native defaults include ESLint, TypeScript, Unicorn, and Oxc rules. Explicitly
setting `plugins` replaces the default plugin list, so a future React addition
must preserve the other desired plugins. React, accessibility, Node, import,
promise, Jest, and Vitest plugins are available separately; enabling a plugin
does not enable every rule in it. The plugin guide describes React Compiler
support as experimental and disabled by default, but follow-up inspection of
pinned Oxlint 1.85.0 found Compiler-backed rules in its `correctness` category.
That guide statement does not describe the effective React configuration in
this version; the [React follow-up](core-checks-react-lint-scope.md) records the
source and behavioral evidence.
[Built-in plugins](https://oxc.rs/docs/guide/usage/linter/plugins.html).

## The meaningful expansion: typed linting

The current scripts run syntax linting. Checks such as unhandled promises require
`oxlint-tsgolint` and type-aware mode. The installed Oxlint package declares
`oxlint-tsgolint >=7.0.2001` as an optional peer dependency; it is not installed by
this slice.

The upstream announcement of 2026-07-22 declares type-aware linting stable.
Its version scheme identifies the underlying TypeScript release:
`7.0.2001` corresponds to TypeScript 7.0.2, matching this repository's compiler.
The announcement reports 59 of 61 targeted typescript-eslint typed rules.
[Stable announcement](https://oxc.rs/blog/2026-07-22-type-aware-linting-stable),
[tsgolint release](https://github.com/oxc-project/tsgolint/releases/tag/v7.0.2001).

There is a documentation inconsistency: the generic versioning policy still
lists typed linting among semver-exempt features. Exact pins and acceptance
probes remain useful even with the stable announcement. JS plugins and nursery
rules are also semver-exempt.
[Versioning policy](https://oxc.rs/docs/guide/usage/linter/versioning.html).

Typed linting depends on resolved TypeScript programs. Any proposed split
tsconfigs therefore need a probe showing that each intended source file receives
typed diagnostics under the correct project. `options.typeAware` is supported in
the root Oxlint configuration; how shared settings reach each package's lint
entry point needs verification. Keep the separate `typecheck` contract while
evaluating typed linting: the distinct `--type-check` integration is still marked
experimental in Oxlint 1.85.0's CLI help and schema.
[Type-aware guide](https://oxc.rs/docs/guide/usage/linter/type-aware.html).

## React and Playwright scope

React and accessibility rules can be enabled for the eventual browser application
without enabling them for unrelated files. Playwright has no native plugin in the
documented list. Oxlint supports `eslint-plugin-playwright` through its JS plugin
interface and runs upstream conformance tests against it, but that interface is
still alpha. Importing an ESLint plugin's full preset is not automatically
equivalent to loading it as an Oxlint JS plugin; rules and file scope need explicit
configuration and verification.
[JS plugin support](https://oxc.rs/docs/guide/usage/linter/js-plugins.html).

## Local observations

On the PR branch, using Node 24.21.0 and pnpm 11.27.1:

- `pnpm exec oxlint --config packages/core/oxlint.config.mts --print-config`
  resolved 113 rule entries, including `no-debugger`, `no-unused-vars`, and
  `typescript/no-floating-promises`. This count describes configured rules, not
  113 executing syntax checks: typed rules still require type-aware mode.
- `pnpm --filter @pomeranian/core run lint` passed.
- An isolated temporary `.ts` file containing a `debugger` statement failed with
  `eslint/no-debugger`, exit 1, using the same core configuration. Removing that
  statement while retaining an unhandled `Promise.resolve(1)` passed, exit 0.
  This demonstrates working syntax checks and the absence of typed linting; it
  does not test typed-project discovery. Temporary probes were removed.

## Amendments considered during the interview

The approved scope review supersedes the policy questions recorded below.

1. Describe the shared baseline in terms of Oxlint's documented categories and
   plugins. Preserve correctness errors and the zero-warning CI policy. Document
   why additional individual rules are selected. Consider `suspicious` separately
   instead of enabling all categories as a proxy for quality.
2. The author has approved adding typed linting now. Pin a compatible tsgolint
   release and prove that a
   floating-promise defect fails both the package command and root orchestration,
   including in each selected tsconfig context. Retain independent typechecking.
3. The author has requested React and Playwright lint profiles proactively in
   #13. Verify them with isolated representative inputs and record the deliberate
   use of the alpha Playwright integration. The subsequent Q8 and Q9 decisions
   settled library-versus-test rule scope and the modern React baseline.
4. Keep acceptance behavioral: actual defects, non-writing checks, repeatable safe
   fixes, correct file coverage, editor diagnostics, and CI propagation. An
   effective-config dump helps explain the policy but does not prove it executes.
