# Typed lint discovery across non-composite projects

Researched and probed on 2026-09-22 for the proposed extension of
[#13](https://github.com/lolmaus/pomeranian/issues/13). These results establish
feasibility; they do not replace acceptance against the eventual implementation.

**Policy update, 2026-09-22:** The author confirmed all nine interview decisions
and the coordinated issue amendments are published. The
[approved scope review](core-checks-review-requirements.md) records the required
project-ownership checks. Approval does not change the limits of this isolated
probe or substitute for acceptance through the implemented consumer commands.

**Oxlint 1.85.0 with oxlint-tsgolint 7.0.2001 discovers both non-composite leaves
through an empty solution and reports dropped promises in each.** Inheriting
`options.typeAware: true` through an imported configuration object also works.
However, removing discovery references can lose project-dependent diagnostics
without making the command fail. `--tsconfig` does not repair typed discovery.

The official CLI reference distinguishes that flag's import-resolution role from
typed linting, which discovers projects automatically. The type-aware guide
documents activation through the CLI or the root configuration and provides debug
logging for checking program assignment. “Root” here means the configuration
selected for the invocation; it need not be at the workspace root.
[CLI reference](https://oxc.rs/docs/guide/usage/linter/cli),
[type-aware guide](https://oxc.rs/docs/guide/usage/linter/type-aware.html).

## Isolated fixture

The fixture was created in `/tmp/pomeranian-typed-projects-0jyoay0k`, outside the
workspace, using Node 24.21.0. Its private package declared exact development
dependencies `oxlint: 1.85.0`, `oxlint-tsgolint: 7.0.2001`, and
`typescript: 7.0.2`. Installation ran:

```sh
npm install --ignore-scripts --no-audit --no-fund
```

This installed six packages. Reading their manifests confirmed all three pins;
`./node_modules/.bin/tsc --version` reported `Version 7.0.2`. This isolated npm
installation did not change the repository's pnpm manifest or lockfile.

The fixture had two directories, `library/` and `tooling/`. Its `tsconfig.json`
contained:

```json
{
  "files": [],
  "references": [{ "path": "./tsconfig.library.json" }, { "path": "./tsconfig.tooling.json" }]
}
```

`tsconfig.library.json` contained the following; the tooling leaf replaced both
`library` path segments with `tooling`. Neither leaf enabled composite or
incremental mode.

```json
{
  "compilerOptions": {
    "target": "ES2023",
    "lib": ["ES2023"],
    "module": "NodeNext",
    "strict": true,
    "noEmit": true,
    "types": [],
    "paths": { "@probe/async-work": ["./library/async-work.ts"] }
  },
  "include": ["library/**/*.ts"]
}
```

Each directory's `async-work.ts` exported this function:

```ts
export function asyncWork(): Promise<number> {
  return Promise.resolve(1);
}
```

Each directory's `dropped.ts` contained:

```ts
import { asyncWork } from "@probe/async-work";
asyncWork();
```

The alias intentionally requires the owning project's options to resolve the
promise-returning function. It is a discovery probe, not a proposed production
alias convention. Simpler initial probes using `Promise.resolve(1)` directly also
failed in both leaves, but alone would not distinguish an intended program from
an inferred one.

`base.mts` exported:

```ts
import { defineConfig } from "oxlint";

export default defineConfig({
  categories: { correctness: "error" },
  options: { typeAware: true },
  rules: { "typescript/no-floating-promises": "error" },
});
```

The selected `oxlint.config.mts` imported that object:

```ts
import { defineConfig } from "oxlint";
import base from "./base.mts";

export default defineConfig({ extends: [base] });
```

## Commands and outcomes

The main behavioral command isolated the typed rule so unrelated diagnostics
could not conceal a discovery failure:

```sh
OXC_LOG=debug ./node_modules/.bin/oxlint --config oxlint.config.mts \
  -A all -D typescript/no-floating-promises library tooling --max-warnings 0
```

| Fixture state or command addition                                 | Exit | Observed result                                                                                                                                       |
| ----------------------------------------------------------------- | ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Both references present; inherited `typeAware: true`              | 1    | `no-floating-promises` at line 2 in both `dropped.ts` files. Debug output assigned four files to their two named programs, with zero unmatched files. |
| Remove only the tooling reference                                 | 1    | Only the library defect reported. Both tooling files were unmatched.                                                                                  |
| Missing tooling reference; add `--tsconfig tsconfig.tooling.json` | 1    | Same missing tooling diagnostic and assignment failure.                                                                                               |
| Rename the solution to `solution.disabled.json`                   | 0    | Neither dropped promise reported. Zero discovered programs; four unmatched files.                                                                     |
| Missing solution; add `--tsconfig tsconfig.library.json`          | 0    | Same lost diagnostics. The override did not restore typed discovery.                                                                                  |
| Restore both references; change both calls to `void asyncWork()`  | 0    | Both programs still discovered, zero unmatched files, and no diagnostics.                                                                             |
| Restore both defects; change shared option to `typeAware: false`  | 0    | No typed diagnostics and no tsgolint debug output.                                                                                                    |
| Same disabled shared option; add `--type-aware`                   | 1    | Both promise diagnostics returned. The CLI flag overrode the inherited option.                                                                        |

With both references present, the initial direct-promise fixture also failed in
both projects when using ordinary correctness linting:

```sh
OXC_LOG=debug ./node_modules/.bin/oxlint --config oxlint.config.mts \
  library tooling --max-warnings 0
```

Adding `--type-aware`, `--type-aware --tsconfig tsconfig.json`, or
`--type-aware --tsconfig tsconfig.library.json` each produced the same two
diagnostics. Restricting the path to either directory reported its own defect.
The eventual alias fixture passed both independent typechecks despite its
unhandled promises, confirming the additional lint behavior:

```sh
./node_modules/.bin/tsc --noEmit --project tsconfig.library.json
./node_modules/.bin/tsc --noEmit --project tsconfig.tooling.json
```

Both exited 0. No build output or `.tsbuildinfo` was produced by these checks.

## Implications for acceptance

- Keep the discoverable `tsconfig.json` solution connected to every intended leaf.
  Use one package lint invocation covering its owned files; a separate lint
  invocation per leaf is not needed for this arrangement. `--tsconfig` is not a
  typed-program selection mechanism.
- A shared imported object's option can activate typed linting for the selected
  package configuration. This does not establish support for putting root-only
  options in automatically discovered nested configurations. The final public
  package imports, package commands, root orchestration, and CI still need probes.
- Verify a project-dependent typed defect in every actual leaf, and inspect
  `OXC_LOG=debug` assignment when establishing coverage. The uncovered-file
  controls show that `--max-warnings 0` alone does not enforce project ownership.
- Include package tooling `.mts` files in the final ownership evidence. This
  focused fixture linted only the two source directories; it did not validate the
  final five environments, editor lint diagnostics, framework rules, cross-package
  imports, safe fixes, or cache invalidation.
- Keep independent leaf typechecks. Do not use the empty solution's successful
  `tsc -p` result as evidence that its children were checked; see the
  [editor investigation](core-checks-typescript-editor-scope.md).

All disposable fixture files, local dependencies, lockfile, captured logs, and
temporary probe scripts were removed after recording these observations. No
repository implementation, dependency, or GitHub state changed during this probe.
