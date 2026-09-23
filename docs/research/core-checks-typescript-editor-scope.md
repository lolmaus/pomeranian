# TypeScript configuration and editor scope for core checks

Researched on 2026-09-22 for the amendment to [issue #13](https://github.com/lolmaus/pomeranian/issues/13) and [PR #24](https://github.com/lolmaus/pomeranian/pull/24). This note retains the findings and proposals that informed the discussion.

**Policy update, 2026-09-22:** All nine interview decisions are approved and the coordinated issue amendments are published. The [approved scope review](core-checks-review-requirements.md) records the five presets, non-composite discovery, and supported native TypeScript editor setup. The earlier policy questions below are historical; the executed probe's limits remain unchanged, including the absence of VS Code GUI verification.

## Findings

An empty solution `tsconfig.json` can provide editor discovery for several non-composite configurations. This works in the repository's pinned TypeScript 7.0.2 language server and has a first-party precedent: Vite's current React TypeScript template has a root `files: []` with references to non-composite app and Node configurations. Its app configuration separates DOM, bundler resolution, and React JSX from the Node configuration. [Vite solution](https://github.com/vitejs/vite/blob/main/packages/create-vite/template-react-ts/tsconfig.json), [app configuration](https://github.com/vitejs/vite/blob/main/packages/create-vite/template-react-ts/tsconfig.app.json), [Node configuration](https://github.com/vitejs/vite/blob/main/packages/create-vite/template-react-ts/tsconfig.node.json).

That does not make every use of non-composite references valid. An empty discovery solution, a source-bearing project's dependency references, and a build command have different behavior. TypeScript documents composite requirements and declaration-output behavior for dependency references; it also recommends empty solution files. The probe below establishes the narrower behavior that matters here. [TypeScript project references](https://www.typescriptlang.org/docs/handbook/project-references).

VS Code supports multiple projects. The issue with arbitrarily named sibling configurations is discovering the correct project for an opened file. A solution entry point addresses discovery; it does not combine all compiler options into a single project. The leaf configurations must still own sensible file sets. TypeScript's module guide explicitly distinguishes configurations by runtime environment. [Choosing compiler options](https://www.typescriptlang.org/docs/handbook/modules/guides/choosing-compiler-options.html).

## Executed TypeScript 7.0.2 probe

The probe ran outside the repository in `/tmp/pomeranian-ts-editor-probe`, using the installed repository compiler. No implementation files or package dependencies changed.

The entry point was:

```json
{
  "files": [],
  "references": [{ "path": "./tsconfig.browser.json" }, { "path": "./tsconfig.node.json" }]
}
```

Both leaves explicitly selected `strict: true`, `noEmit: true`, `target: "ES2023"`, and `types: []`. Neither set `composite` or `incremental`. The browser leaf included `browser/`, used `lib: ["ES2023", "DOM"]`, `module: "ESNext"`, and `moduleResolution: "Bundler"`. The Node-shaped leaf included `node/`, used `lib: ["ES2023"]` and `module: "NodeNext"`. This deliberately dependency-free probe tested DOM separation; it did not test Node's ambient declarations.

Each directory contained `check.ts` with:

```ts
document.title = "test";
const deliberateError: string = 1;
```

These commands ran from the probe directory; `tsc` below denotes `/home/developer/projects/lolmaus/pomeranian/node_modules/.bin/tsc`:

| Command                                       | Observed result                                                                                                                          |
| --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `tsc --version`                               | `Version 7.0.2`.                                                                                                                         |
| `tsc -p tsconfig.json --pretty false`         | Exit 0, with no diagnostics: this command did **not** check the referenced source.                                                       |
| `tsc -p tsconfig.browser.json --pretty false` | Exit 1, TS2322 for the deliberate assignment; no error for `document`.                                                                   |
| `tsc -p tsconfig.node.json --pretty false`    | Exit 1, TS2322 plus TS2584 for unavailable `document`.                                                                                   |
| `tsc -b --pretty false`                       | Exit 1, all intended diagnostics; no composite diagnostic for this solution. It created both leaf `.tsbuildinfo` files despite `noEmit`. |

Adding a separate, source-bearing `tsconfig.consumer.json` with `files: ["consumer.ts"]` and a reference to the same browser leaf changed the outcome. `tsc -p tsconfig.consumer.json --pretty false` failed with TS6306 requiring `composite: true` and TS6310 rejecting a referenced project that disables emit. Thus the discovery arrangement should not be generalized into source-bearing dependency references.

For editor behavior, the actual command was:

```sh
/home/developer/projects/lolmaus/pomeranian/node_modules/.bin/tsc --lsp --stdio
```

A temporary Python client sent JSON-RPC messages with LSP `Content-Length` framing. Its request sequence was:

1. `initialize`, with `rootUri` and `workspaceFolders` pointing to the probe directory, and `textDocument.diagnostic.dynamicRegistration: false` plus `workspace.configuration: true` capabilities.
2. `initialized`; answer `workspace/configuration` requests with an empty object for each requested section.
3. For each source, `textDocument/didOpen` with its file URI, `languageId: "typescript"`, `version: 1`, and the file contents.
4. `custom/projectInfo` and `textDocument/diagnostic`, each with `{ "textDocument": { "uri": "file:///.../check.ts" } }`.

The server identified itself as `typescript-go`, version `7.0.2`. `custom/projectInfo` returned `tsconfig.browser.json` for the browser file and `tsconfig.node.json` for the Node-shaped file. File diagnostics matched the intended CLI errors; the Node-shaped file also received an unused-variable editor suggestion. Configuration diagnostic notifications for both leaf configurations were empty. The project-info request is the same request the official native extension uses for its project status display. [Extension client](https://github.com/microsoft/typescript-go/blob/main/_extension/src/client.ts), [project status](https://github.com/microsoft/typescript-go/blob/main/_extension/src/projectStatus.ts).

Renaming only the root `tsconfig.json` to `solution.disabled.json` and starting a fresh server made `custom/projectInfo` return an empty configuration path for both files. Both became inferred projects; the Node-shaped source lost its `document` error. Restoring the root entry point restored the intended ownership and diagnostics. This demonstrates discovery, not just successful parsing of JSON configuration.

**Limit:** this was a direct language-server probe. No VS Code executable was available, so no VS Code UI session, Problems panel, extension installation, or editor reload was exercised. Cross-package imports, overlapping input sets, Playwright evaluation callbacks, React declarations, and type-aware Oxlint project discovery were not tested by this fixture.

Cleanup completed after recording the fixture, commands, protocol sequence, and outcomes above. The temporary directory, including its source/configuration probes, Python client, downloaded source snapshots, logs, and generated `.tsbuildinfo` files, was removed. No probe artifacts were added to the repository.

## Editor version selection matters

The latest VS Code release returned by GitHub on the research date was [1.138.0, published September 16](https://github.com/microsoft/vscode/releases/tag/1.138.0). Its released extension manifest still uses TypeScript `^6.0.3`; the native-server switch defaults to false, and the enable command checks for the separate TypeScript native extension. A CLI installation of TypeScript 7 therefore cannot, by itself, establish which language server an author is using. [Released extension dependencies](https://github.com/microsoft/vscode/blob/1.138.0/extensions/package.json), [released settings](https://github.com/microsoft/vscode/blob/1.138.0/extensions/typescript-language-features/package.json), [enable command](https://github.com/microsoft/vscode/blob/1.138.0/extensions/typescript-language-features/src/commands/useTsgo.ts).

TypeScript's release announcement describes the TypeScript 7 extension and its enable/disable commands. Its current SDK-selection source accepts `js/ts.tsdk.path`, resolves the installed native compiler, and requires workspace trust and explicit workspace-SDK opt-in before using a workspace setting. The implementation should document selecting the repository's installed version and checking the reported server version, rather than assume a configuration file alone switches the editor. [TypeScript 7 announcement](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/), [native SDK selection](https://github.com/microsoft/typescript-go/blob/main/_extension/src/util.ts).

## Proposed configuration responsibilities

These are responsibilities to settle during the interview, not a final option list:

| Layer                        | Responsibility                                                                                                                                                                                                                 |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Shared base                  | Common checking policy such as strictness and a no-emit contract. Additional strictness flags need deliberate adoption. Avoid runtime globals, JSX, consumer paths, and build output directories here.                         |
| Node preset                  | Authoring tools running on the supported author Node version; appropriate Node declarations and Node module semantics.                                                                                                         |
| Library compatibility        | Published Pomeranian source must satisfy its supported consumer Node runtime and module contract. Its compatibility floor can differ from authoring tools.                                                                     |
| Playwright tests             | Tests and test configuration must describe Playwright's loader and test context. Decide separately how browser evaluation callbacks receive DOM types. This responsibility does not establish published-library compatibility. |
| Browser preset               | Browser declarations and the chosen browser application's module loader/bundler contract. A preset for Vite applications does not automatically establish a contract for published browser libraries.                          |
| Browser+React preset         | Extend the browser preset and add the agreed JSX transform and React type requirements.                                                                                                                                        |
| Consuming leaf configuration | Actual `include`/`exclude`/`files`, local aliases or tool-specific declarations, installed type-package versions, and any documented exception.                                                                                |
| Solution entry point         | `files: []` and references to real leaf projects for discovery; no broad input inclusion and no competing ambient environment.                                                                                                 |

Whether library compatibility and Playwright tests needed distinct exported presets was an interview question. Q5 subsequently approved both presets. Shared runtime options can be inherited without conflating those responsibilities.

Keep shared file patterns out of published configuration presets: relative paths resolve from the configuration that declares them. Child `files`, `include`, and `exclude` replace inherited values; `references` are not inherited. Consequently the consumer must own coverage, and adding a new leaf requires explicitly connecting it to the appropriate discovery entry point. [Configuration inheritance](https://www.typescriptlang.org/tsconfig/extends.html).

Use explicit `lib` and `types` to make each environment readable. `lib` controls standard JavaScript and browser declarations; `types` selects ambient type packages, and does not prevent imported packages from providing types. Neither option is a runtime compatibility test. [Library declarations](https://www.typescriptlang.org/tsconfig/lib.html), [ambient type packages](https://www.typescriptlang.org/tsconfig/types.html).

TypeScript 6 changed the default `types` value to `[]`; its release notes recommend explicitly listing required ambient packages, such as `node`. The current option reference documents that default for TypeScript 6 and later. [TypeScript 6 release notes](https://devblogs.microsoft.com/typescript/announcing-typescript-6-0/), [current `types` reference](https://www.typescriptlang.org/tsconfig/types.html).

File inclusion is also not an import boundary. An excluded file can still enter a program through an import, type inclusion, or reference. Use narrow initial ownership and verify `--listFilesOnly`/`--explainFiles` where coverage is unclear; do not promise that exclusion prevents cross-environment dependencies. [TSConfig inclusion and exclusion](https://www.typescriptlang.org/tsconfig/#exclude).

For current consumers, the split investigated here is library source versus package-level tooling such as `oxlint.config.mts`. The shared Oxlint package itself is author tooling. Future demo source, demo tooling, and E2E tests acquire distinct leaves when those consumers arrive. The original issue permitted only variants needed by current consumers. The approved amendment replaces that restriction with five proactive presets and temporary consumer acceptance, while continuing to exclude browser infrastructure from this slice.

## Proposals that informed the acceptance amendment

- Keep all owned configurations non-composite. Use empty solution references only for discovery; run actual leaf checks explicitly with `tsc --noEmit -p <leaf>` through the existing package/root workflow. A passing `tsc -p` on an empty solution is not sufficient evidence.
- Define a file-to-project ownership table for every maintained TypeScript input, including package tooling. Prove a newly added source file is covered without editing the preset and that representative environment mistakes fail under the intended leaf.
- Record the compiler and language-server versions actually exercised, the documented supported VS Code and extension versions, and whether GUI verification occurred. Demonstrate project selection and environment-specific diagnostics without emitted declarations, prior builds, or composite mode. The direct LSP result above is feasibility evidence for those behaviors; it does not establish VS Code UI verification.
- Validate named configurations with relevant tools. Playwright transpiles tests without performing TypeScript checking and honors only a subset of tsconfig options, so an independent typecheck remains necessary. [Playwright TypeScript support](https://playwright.dev/docs/test-typescript).
- Preserve existing cache-invalidation, package export-boundary, real-consumer, and hosted failure/recovery acceptance. Include newly introduced presets and discovery configurations in their applicable dependency/input accounting.

If an editor version does not support the chosen solution arrangement, a fallback that preserves non-composite checking is directory-local `tsconfig.json` files for separate source environments. That requires arranging files into discoverable directories and may be awkward for colocated tooling. Combining browser and Node globals into one catch-all configuration would lose the separation being requested.
