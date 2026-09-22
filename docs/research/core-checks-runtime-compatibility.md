# Core-check configuration and runtime compatibility

Research date: 2026-09-22. This supports the discussion of
[#13](https://github.com/lolmaus/pomeranian/issues/13) and
[PR #24](https://github.com/lolmaus/pomeranian/pull/24). This note retains the
findings and recommendations from that discussion.

**Policy update, 2026-09-22:** The author confirmed all nine interview decisions
and the coordinated issue amendments are published. The
[approved scope review](core-checks-review-requirements.md) records the chosen
runtime policy, five presets, and staged compatibility evidence. Earlier questions
below are historical; later publication decisions remain with their assigned
work. These findings do not prove runtime or packaged-artifact compatibility.

## Findings

The Node version used to maintain Pomeranian and the Node versions supported by
its published libraries are separate contracts. The checkout currently requires
Node `24.21.0` in [.nvmrc](../../.nvmrc). Both library manifests still have empty
exports, so successful scaffold checks do not demonstrate compatibility of a
published library. See [the contribution guide](../../CONTRIBUTING.md).

On the research date, Node 22 is the oldest supported LTS major: it entered
Maintenance LTS on 2025-10-21 and is scheduled to reach end of life on 2027-04-30.
Node 24 remains Active LTS until 2026-10-20. Node 26 is Current, with LTS scheduled
for 2026-10-28. This confirms the author's Node 22 observation, while making an
evergreen promise to support the oldest LTS different from a fixed Node 22
promise. [Official Node release schedule](https://github.com/nodejs/Release/blob/main/schedule.json).

Playwright's installation documentation currently supports the **latest**
releases in Node 22.x, 24.x, and 26.x. That does not establish support for Node
22.0.0 or every historical 22.x release. The exact supported Playwright release
and Node minor floor must be checked together when Pomeranian adopts Playwright.
[Playwright system requirements](https://playwright.dev/docs/intro#system-requirements).

## A Playwright environment is not a browser environment

Playwright test code runs in the test-runner environment. Code passed to
`page.evaluate()` runs in a separate browser process, with different globals and
no implicit access to the test's local variables. A page object can therefore
orchestrate browser activity while executing in Node. Its callbacks can execute
in a different runtime from the object itself.
[Playwright's environment distinction](https://playwright.dev/docs/evaluating#different-environments).

Consequently, a proposed `playwright` preset should describe the files used by
Playwright tests. Naming the published-library compatibility policy `playwright`
would obscure its purpose. The library may need browser DOM types for browser
callbacks or Playwright's declaration dependencies, but permitting DOM types in
one TypeScript program cannot prove that browser globals are used only inside
the appropriate callbacks. This is an inference from the runtime distinction,
not a guarantee supplied by a tsconfig.

Playwright transforms TypeScript without checking its types and recommends a
separate compiler check. It documents only `allowJs`, `baseUrl`, `paths`,
`references`, and `extends` as supported tsconfig options. Its transformer does
not adopt a lower `target` merely because one appears in the test tsconfig.
Playwright recommends a separate `tests/tsconfig.json` and normally discovers the
nearest configuration for each loaded source file.
[Playwright TypeScript guidance](https://playwright.dev/docs/test-typescript).

## What each compatibility setting can establish

| Setting or check                | Responsibility and limitation                                                                                                                                                                                                                                                                                                                                                           |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `target`                        | Controls which JavaScript syntax the TypeScript emitter downlevels. It also sets the default `lib`. It is not a Node version or a runtime API allowlist. A fixed edition is more predictable than `ESNext`, whose meaning changes with TypeScript upgrades. [Target reference](https://www.typescriptlang.org/tsconfig/target.html).                                                    |
| `lib`                           | Selects declarations for JavaScript built-ins and browser APIs. Explicitly omitting DOM declarations helps a pure Node program avoid accidental browser globals. Declaring an API does not install its implementation. [Library reference](https://www.typescriptlang.org/tsconfig/lib.html).                                                                                           |
| `@types/node`                   | Describes Node APIs. Its release line should correspond to the promised runtime line; declaration patch numbers do not equal Node runtime patch numbers. These types need their own dependency pin. [DefinitelyTyped's versioning policy](https://github.com/DefinitelyTyped/DefinitelyTyped#how-do-definitely-typed-package-versions-relate-to-versions-of-the-corresponding-library). |
| `types`                         | Controls automatically included global declaration packages. It does not stop an imported dependency from bringing its own declarations into the program. Explicit ownership prevents accidental reliance on unrelated ambient types. [Types reference](https://www.typescriptlang.org/tsconfig/types.html).                                                                            |
| `module` and `moduleResolution` | Describe how imports and exports resolve and behave, including when `noEmit` is enabled. Node and bundlers do not permit exactly the same imports. `NodeNext` evolves with newer Node semantics; an explicit `target` is still needed if its implied `ESNext` is unsuitable. [Module reference](https://www.typescriptlang.org/tsconfig/module.html).                                   |
| `noEmit`                        | Prevents TypeScript from producing JavaScript, declarations, or source maps. A passing non-emitting check does not test an eventual bundler's or publisher's output. [No-emit reference](https://www.typescriptlang.org/tsconfig/noEmit.html).                                                                                                                                          |
| Consumer verification           | Loading the actual package, running representative behavior, and compiling its public declarations under supported consumer settings tests contracts that a source-only check leaves open. This is the recommended later acceptance boundary, once real exports and a packaging route exist.                                                                                            |

For a concrete counterexample, `fs.mkdtempDisposableSync` was introduced in Node
24.4.0. Changing `target` to an older ECMAScript edition cannot make that Node API
exist on Node 22. An API declaration baseline and a runtime test address different
parts of that failure.
[Node 24 filesystem API history](https://nodejs.org/docs/latest-v24.x/api/fs.html#fsmkdtempdisposablesyncprefix-options),
[Node 22 filesystem API](https://nodejs.org/docs/latest-v22.x/api/fs.html).

Native Node TypeScript execution also does not solve publishing compatibility:
Node's type stripping ignores tsconfig, does not downlevel JavaScript, and refuses
to strip TypeScript under `node_modules`. A preset for directly executed author
scripts should match that execution route. It should not silently become the
library's distribution policy.
[Node TypeScript documentation](https://nodejs.org/api/typescript.html#type-stripping).

## Proposed configuration responsibilities

TypeScript's own guidance says separate runtime environments need separate
configurations. It also distinguishes library settings from application settings:
libraries must consider consumer module resolution and public declarations.
Its examples support the separation below, but do not supply a universal preset
that settles Pomeranian's publishing format.
[Official compiler-option guidance](https://www.typescriptlang.org/docs/handbook/modules/guides/choosing-compiler-options.html).

| Layer                 | Proposed responsibility                                                                                                                                                                                                     | Likely Pomeranian consumers                                                                                            |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Shared base           | Environment-independent checking policy, such as strictness. Shared non-emitting check behavior can live here while all consumers are checks. No browser, Node, React, test-runner, file-layout, or publishing assumptions. | Every preset.                                                                                                          |
| Node author tooling   | Node settings for the pinned author runtime and the actual script loader; Node 24 declaration baseline when Node APIs are needed.                                                                                           | Oxlint configuration package, package-local tooling, future build scripts.                                             |
| Library compatibility | Fixed syntax/API baseline for the supported consumer Node versions, independently of the runtime that executes the compiler. Node-compatible import checking appropriate to the eventual package format.                    | Core and later lib-essential source.                                                                                   |
| Playwright tests      | Test-runner and relevant browser callback types; module settings matching the chosen Playwright loader; target/runtime policy matching where these tests execute.                                                           | Future E2E tests and their helpers. Compatibility tests may deliberately run on the oldest supported consumer runtime. |
| Browser               | DOM and JavaScript declarations; module resolution matching the eventual application bundler. Browser support and build output targets remain separate decisions.                                                           | Future browser source.                                                                                                 |
| Browser with React    | Browser settings plus the JSX mode required by the React build toolchain.                                                                                                                                                   | React demo application.                                                                                                |
| Consuming package     | Input ownership, local file globs, exclusions, local type dependencies, configuration discovery, and any later build paths.                                                                                                 | Each package and application.                                                                                          |

The extra library layer is deliberate: having the compiler run on Node 24 does
not require product source to use Node 24 APIs. Conversely, repository tooling
does not need to inherit the published library's oldest-runtime limitations.
The two layers may initially use the same ECMAScript target if newer syntax buys
nothing; their distinct API and consumer contracts still justify separating them.

Shared presets should not own package-relative `include`, `exclude`, `rootDir`,
or `outDir` assumptions. Relative paths resolve from the configuration where they
originate, and consumer `files`/`include`/`exclude` replace inherited values.
`references` are not inherited. These rules make consumer-owned paths easier to
reason about.
[TypeScript inheritance reference](https://www.typescriptlang.org/tsconfig/extends.html).

React JSX mode belongs in the React layer, selected to match the transformer;
`react-jsx` and `preserve` have different output contracts. Browser globals should
not be added to a universal base merely to make a React fixture compile.
[TypeScript JSX modes](https://www.typescriptlang.org/tsconfig/jsx.html).

This note does not validate an editor-only reference aggregator with
non-composite child projects. That is a separate editor and compiler acceptance
question. Whatever discovery arrangement is selected, explicit checks must reach
each applicable environment config and report genuine errors in its owned files.

## Proposed acceptance boundary for the amended foundation slice

The foundation can establish explicit configuration ownership now and exercise
it with removable CLI probes. Suggested evidence includes a Node-only global
rejected in browser source, a browser-only global rejected in pure Node tooling,
a newer Node API rejected by the library's older declaration baseline, and a
genuine type error rejected under every consumer configuration. If a program
needs DOM declarations because of Playwright's imported types, record that
limitation instead of claiming a stronger environment boundary.

The foundation should not claim that these probes prove a distributable package
runs on Node 22. Before real publication, a later behavior/build slice should
verify the actual packed artifact on each promised runtime family, compile its
public declarations under the supported consumer TypeScript settings, and check
the package's runtime dependencies. Native addons, if any are introduced, add
their own runtime/ABI constraints. Node distinguishes the ABI stability of
Node-API from other addon interfaces.
[Node addon guidance](https://nodejs.org/api/addons.html#node-api).

Public declaration compatibility also requires a TypeScript support policy,
separate from the Node support policy. TypeScript documents version-specific
declaration selection; choosing a JavaScript `target` does not choose which
TypeScript compilers can read emitted declarations.
[TypeScript declaration publishing](https://www.typescriptlang.org/docs/handbook/declaration-files/publishing.html#version-selection-with-typesversions).

## Questions raised during the research

These were the interview questions, not the current decision frontier. Their
resolutions and the deliberately later packaging obligations are recorded in the
approved scope review.

1. Whether consumer support means current patched releases of supported LTS
   majors or an explicit historical minimum release, and how the oldest supported
   major changes when Node reaches end of life.
2. Whether Node 26 Current is also a consumer target before it becomes LTS.
3. Which proposed presets must ship in #13 and which require a real future
   application or test consumer before implementation.
4. Whether to introduce a separately named library-compatibility preset, rather
   than attaching publication policy to the Playwright test preset.
5. The browser callback typing boundary and the acceptable limitation of DOM
   declarations inside a Node-hosted Playwright program.
6. The later slice that will establish module formats, packaged artifact tests,
   supported consumer TypeScript versions, and the actual compatibility matrix.

No product runtime probes, package builds, or compatibility matrix runs were
performed for this note. It records source research and the configuration
responsibilities investigated during the interview.
