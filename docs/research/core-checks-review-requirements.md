# Core-checks review: approved scope extension

Discussion started on 2026-09-22 after the author's review of
[PR #24](https://github.com/lolmaus/pomeranian/pull/24), implementing
[#13](https://github.com/lolmaus/pomeranian/issues/13) under
[parent #9](https://github.com/lolmaus/pomeranian/issues/9).

**Status: approved and published on 2026-09-22.** The author confirmed all nine
interview decisions and the consolidated amendment, then authorized publication.
The updated GitHub issues below are the specification authority. PR #24 requires
implementation revision and new acceptance evidence for this scope; its merge
still requires the author's explicit approval.

## Author constraints and objections

- Use a substantive, modern Oxlint configuration with a recommended baseline.
- Provide Node, Playwright, Browser, and Browser+React TypeScript configurations
  sharing an appropriate base. Do not use composite projects.
- Provide an entrypoint configuration that lets VS Code discover the separate
  projects. Give each consuming package deliberate file coverage.
- Separate the Node version for maintaining Pomeranian from compatibility for
  developers using its libraries through Playwright. The author wants to support
  the oldest Node LTS, currently Node 22, without supporting repository authoring
  on that version.

## Confirmed decisions

The following decisions are confirmed from all three rounds:

- **Q1 — Browser scope:** Browser and Browser+React presets serve repository
  applications. Published Pomeranian page-object libraries execute in the
  Node/Playwright test process; browser execution of those libraries is outside
  this requirement.
- **Q2 — Consumer Node patch policy:** Support the latest supported patch within
  each supported LTS major, starting with Node 22. Repository authors retain the
  exact Node pin. This does not promise compatibility with every historical
  release in a supported major. Changes to a published package's minimum runtime
  belong to a later explicit release-policy decision.
- **Q3 — Typed linting:** Add type-aware linting in #13, including evidence that
  dropped-promise defects are detected in every intended project. Retain separate
  TypeScript checks and the existing recommended correctness baseline with its
  deliberate individual rules.
- **Q4 — Proactive framework linting:** Deliver Playwright and React lint profiles
  in #13. The author specifically wants Playwright rules for the main library and
  React rules for the future demo. Q8 and Q9 below settle their scope and baseline.
- **Q5 — Presets and evidence:** Deliver five TypeScript presets plus their shared
  base: author Node tooling, library compatibility, Playwright tests, Browser,
  and Browser+React. Prove the current packages' library/tooling split directly;
  verify unused presets with temporary representative inputs. Applications and
  browser-test infrastructure remain with their planned feature slices.
- **Q6 — Editor setup:** The supported VS Code setup uses the official native
  TypeScript extension and explicitly selects the repository's compiler. Document
  and verify that setup. Supporting VS Code's bundled compiler is not an added
  requirement.
- **Q7 — Compatibility evidence:** #13 owns the Node 22 checking baseline and its
  configuration/editor/CLI/CI evidence. The first ad-hoc Element_PO behavior slice
  owns actual behavior under supported Node runtimes. Packaging work must verify
  packed artifacts and public declarations before publication. These later
  obligations must be carried into the relevant slice specifications.
- **Q8 — Playwright scope:** Library/helper files receive applicable Playwright
  API checks. Actual test files additionally receive the recommended
  test-structure/assertion rules. Recognize assertion helpers narrowly and prove
  that doing so does not excuse an ordinary action-only test. Both scopes ship
  proactively in #13.
- **Q9 — React baseline:** Include native correctness rules, explicitly enable
  Rules of Hooks and effect-dependency checks, and retain the Compiler-backed
  correctness diagnostics. Use exact compatible pins and behavioral probes. This
  does not adopt React Compiler as a build transform. Accessibility plugins are
  outside the two requested framework integrations.

## Research that changes the framing

- [Oxlint findings](core-checks-oxlint-scope.md): the existing configuration already
  enables Oxlint's correctness baseline. A concrete potential expansion is typed
  linting: an unhandled promise currently passes. An ESLint-style built-in
  `recommended` extension is not Oxlint's documented configuration mechanism.
- [TypeScript and editor findings](core-checks-typescript-editor-scope.md): separate
  non-composite projects can be discovered through an editor solution. Explicit
  leaf checks are necessary; checking only an empty solution can pass without
  checking its children. Editor and CLI compiler selection need separate proof.
- [Runtime findings](core-checks-runtime-compatibility.md): author tooling, library
  compatibility, and Playwright tests have different responsibilities. A lower
  `target` does not prevent newer Node API usage or prove a published artifact
  works. Playwright does not use that option to downlevel test code.
- Follow-up research for the proactive lint profiles:
  [Playwright rule applicability](core-checks-playwright-lint-scope.md),
  [React and Hooks baseline](core-checks-react-lint-scope.md), and
  [typed-project discovery](core-checks-typed-project-discovery.md).

## Published specification amendments

The confirmed decisions are incorporated into these specifications:

- [Parent #9](https://github.com/lolmaus/pomeranian/issues/9).
- [Core checks #13](https://github.com/lolmaus/pomeranian/issues/13).
- [Lib-essential #14](https://github.com/lolmaus/pomeranian/issues/14).

Each published body was fetched after editing and matched the approved local
publication text exactly. The parent retains five foundation slices and all
twelve acceptance cases, extended with the new behavior. This document preserves
the decision summary and supporting research; GitHub holds the detailed criteria.

1. **Oxlint behavior.** Document the selected correctness baseline, plugins, and
   additional rules. Select a compatible exact tsgolint pin and demonstrate a
   typed diagnostic in every intended TypeScript project. Deliver proactive
   Playwright and React profiles with verified representative behavior and
   deliberate file scope. Preserve independent typechecking, non-writing checks,
   safe fixes, and the zero-warning CI policy. Apply Playwright API rules to
   library/helpers and add test rules only for tests. React includes the confirmed
   modern correctness and explicit Hooks baseline.
2. **Configuration responsibilities.** Replace the restriction to variants needed
   by current consumers with an explicit approved preset list. Keep portable
   checking policy in the base, environment and loader assumptions in named
   presets, and input paths in consuming packages. Provide the five confirmed
   presets: author Node tooling, library compatibility, Playwright tests, Browser,
   and Browser+React, sharing a common base.
3. **Project discovery and coverage.** Use non-composite leaf projects with an
   entrypoint for editor discovery. Document which configuration owns each
   maintained source and tooling file. Package and root commands must check every
   applicable leaf; a successful check of an empty entrypoint is insufficient.
   Document selecting the repository compiler through the official native
   TypeScript extension and verify representative editor diagnostics, explicitly
   distinguishing language-server probes from GUI checks. Native language-server
   probes may establish project assignment and diagnostics; record the versions
   actually exercised separately from documented editor/extension versions and
   state whether GUI verification occurred.
4. **Environment boundaries.** Exercise representative valid inputs and deliberate
   type errors for each advertised preset. Verify isolation of globals where the
   environment permits it, including browser versus pure Node tooling and the
   library's older Node API baseline. Explain any Playwright DOM-type limitation.
   Use temporary representative inputs for presets without real consumers;
   introducing applications or browser infrastructure is not required.
5. **Runtime policy.** Keep author commands on the existing pinned runtime. Define
   the supported consumer Node policy separately: latest supported patches within
   supported LTS majors, initially starting at Node 22. Select explicit syntax,
   standard-library, and Node API declaration baselines for their actual purpose.
   The first ad-hoc Element_PO behavior slice owns runtime behavior verification;
   packaging work owns packed-artifact and public-declaration compatibility before
   publication. A future release-policy decision governs raising the public Node
   minimum; this slice's baseline stays fixed until deliberately updated.
6. **Integration evidence.** Extend existing package/root, cache-invalidation, and
   required-CI acceptance to the new behavior. Reuse evidence that remains valid;
   repeat probes invalidated by lint or project-layout changes. A missed leaf or
   a typed rule that never executes must not count as passing acceptance. Preserve
   frozen installation, cleanup, and the final foundation evidence obligation.

### Behavioral evidence required by the extension

The isolated research probes establish feasibility. The implementation must
repeat relevant behavior through its actual public configuration entry points,
consumer commands, root orchestration, and required CI result.

- **Typed project ownership:** In every intended leaf, introduce a typed defect
  whose detection depends on that project's options, rather than relying only on
  a global `Promise.resolve()` example that an inferred program might detect.
  Confirm the intended program assignment. Include package tooling as well as
  library and representative future-environment source. Removing a discovery
  reference can silently lose diagnostics; Oxlint's `--tsconfig` flag does not
  repair typed-project discovery.
- **Independent typechecking:** Check each non-composite leaf explicitly. The
  empty discovery solution cannot stand in for those checks. Verify newly added
  valid inputs and deliberate type errors under their expected environments,
  with no product output or build prerequisite.
- **Playwright behavior:** Prove a relevant API defect fails in a library helper
  and test input, while awaited and returned assertion promises pass. Prove
  test-only rules stay within their intended files and explicit
  assertion-helper recognition still rejects an ordinary action-only test.
- **React behavior:** Prove conditional Hooks fail in both `.tsx` components and
  `.ts` custom Hooks, missing effect dependencies fail, and valid automatic JSX
  does not require a default React import. Include an impure-render
  defect for the Compiler-backed rules. Demonstrate preservation of base lint
  checks and that the safe fixer does not apply dangerous effect-dependency fixes.
- **Scope and integration:** Prove framework rules apply to their intended files
  and preserve the shared baseline. Repeat source/configuration cache-invalidation
  and hosted failure/recovery evidence where the changed configuration invalidates
  earlier results. Keep the existing installation, non-writing checks, safe fixes,
  export boundaries, cleanup, and final foundation verification obligations.

The published Playwright plugin declares an ESLint peer dependency. Implementation
must satisfy the selected package manager's dependency policy and record the
resulting graph. Using that plugin through Oxlint does not require introducing a
second lint command. Dependency plumbing is an implementation responsibility, not
an additional framework-policy question.

The coordinated amendments assign these responsibilities:

| Location           | Necessary amendment                                                                                                                                                                                                                                                                               |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| #13                | Replace the current-consumer-only variant restriction; add the approved lint, multi-project, editor, and compatibility-baseline acceptance above.                                                                                                                                                 |
| #9                 | Permit the approved additional presets and environment probes. Narrow the exclusion of consumer-environment decisions to allow the agreed Node policy. Preserve or explicitly revise the separate exclusions of product packaging, applications, browser infrastructure, and runtime CI matrices. |
| #14                | Require lib-essential to adopt the agreed library/tooling project mapping and demonstrate its own checks under the amended shared configuration.                                                                                                                                                  |
| PR #24 and roadmap | Describe the final approved scope and new evidence once implemented. Retain author review and explicit merge approval as the integration gate.                                                                                                                                                    |

## Merge boundary for the amended scope

The consolidated amendment makes the confirmed lint policy, current-package
project separation, editor discovery, complete CLI/CI coverage, and all advertised
presets requirements for merging PR #24. Earlier passing acceptance remains useful
evidence where still valid; it does not establish the added behavior. #14 follows
integration of the revised #13. The existing final foundation obligation still
indexes all twelve parent acceptance cases, including their extended behavior.

Actual Node 22 compatibility of future published products cannot be established
by this source scaffold. The confirmed boundary is to establish its checking
baseline now, require runtime behavior evidence in the first ad-hoc Element_PO
slice, and require packed-artifact/declaration evidence when the packaging route
is introduced, before publication. These assigned obligations do not constitute
an already-proved runtime guarantee.

## Next step

No unresolved policy questions remain from the interview. Exact compatible
versions, file names, option inheritance, and dependency wiring are implementation
choices constrained by the agreed behavior; they do not need another policy round.

Revise PR #24 against the amended #13 and record the new acceptance evidence.
The [roadmap](../../ROADMAP.md) carries that handoff and the later compatibility
obligations. #14 follows #13's integration. Merging PR #24 still requires the
author's explicit approval for the revised scope.
