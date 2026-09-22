# Repository formatting verification

This records [formatting #12](https://github.com/lolmaus/pomeranian/issues/12),
part of [monorepo setup #9](https://github.com/lolmaus/pomeranian/issues/9).
The agreed test boundary is the author's workspace CLI. The commands below use
the two real library directories for temporary source probes, then restore the
source-free scaffold. No additional consumer package or test framework is needed.

Oxfmt is pinned to the normal published `0.70.0` release, using the author's
explicit allowance for its pre-1.0 line. Its Node engine range,
`^20.19.0 || >=22.12.0`, includes the repository's Node `24.21.0` pin. It installs
and runs with pnpm `11.27.1`; the existing Turbo `2.11.2` pin is unchanged.
Sources: [versioned registry metadata](https://registry.npmjs.org/oxfmt/0.70.0),
[Oxfmt release](https://github.com/oxc-project/oxc/releases/tag/oxfmt_v0.70.0).

Both root scripts invoke Oxfmt directly, with nested configurations disabled.
Checks leave files unchanged; writes execute against current inputs on every
invocation. No Turbo formatting task or result cache is involved. The installed
package supports Markdown as well as source and configuration formats.
See the [CLI](https://oxc.rs/docs/guide/usage/formatter/cli),
[configuration](https://oxc.rs/docs/guide/usage/formatter/config), and
[language support](https://oxc.rs/docs/guide/usage/formatter/language-support).

The effective scope and artifact locations are documented in
[CONTRIBUTING.md](../../CONTRIBUTING.md#formatting-scope). Configured ignore
patterns supplement Git ignore files and Oxfmt's built-in exclusions. Package
manifest sorting is disabled; Markdown prose keeps its existing wrapping, while
supported fenced examples are formatted. See
[ignore behavior](https://oxc.rs/docs/guide/usage/formatter/ignore-files) and
[embedded formatting](https://oxc.rs/docs/guide/usage/formatter/embedded-formatting).

## Repeatable procedure

Use Bash, Git, GNU tar, `sha256sum`, and ripgrep. First select `.nvmrc` and
bootstrap the pinned pnpm using [the contributor instructions](../../CONTRIBUTING.md#set-up-a-checkout).
Run the following blocks in the same shell, starting at the repository root.
All intentional defects, stores, snapshots, and logs stay in a temporary copy.
The copy includes tracked files and non-ignored new files, so proposed changes
can be verified before committing.

```bash
set -e
verification_root=$(pwd)
verification_state=$(mktemp -d)
verification_dir="$verification_state/workspace"
mkdir "$verification_dir"
git ls-files --cached --others --exclude-standard -z |
  tar --null -T - -cf "$verification_state/inputs.tar"
tar -xf "$verification_state/inputs.tar" -C "$verification_dir"
cd "$verification_dir"
unset pnpm_config_pm_on_fail PNPM_CONFIG_PM_ON_FAIL
node --version
pnpm --version
pnpm config get pmOnFail
sha256sum package.json pnpm-workspace.yaml pnpm-lock.yaml \
  packages/core/package.json packages/lib-essential/package.json \
  > "$verification_state/metadata.before"
pnpm install --frozen-lockfile --store-dir "$verification_state/store"
sha256sum --check "$verification_state/metadata.before"
pnpm exec oxfmt --version
pnpm run format
rg --files --hidden --no-ignore -g '!node_modules/**' -0 |
  sort -z | xargs -0 sha256sum > "$verification_state/clean.before"
```

Expect Node `v24.21.0`, pnpm `11.27.1`, mismatch policy `error`, and Oxfmt
`0.70.0`. Frozen installation and the clean formatting check must pass, and all
five metadata checksums must remain unchanged.

Introduce unformatted TypeScript in both real libraries. The failure log must
name each file, proving future source is discovered automatically. The check
must return exactly 1 and preserve both inputs; the fixer must produce the
independently specified expected text.

```bash
source_probes=(packages/core/src/format-acceptance.ts packages/lib-essential/src/format-acceptance.ts)
for probe in "${source_probes[@]}"; do
  mkdir -p "$(dirname "$probe")"
  printf 'export const formattingProbe={valid:true}\n' > "$probe"
done
sha256sum "${source_probes[@]}" > "$verification_state/defects.before"
if pnpm run format > "$verification_state/source-failure.log" 2>&1; then
  echo 'Expected formatting failure' >&2
  exit 1
else
  test "$?" -eq 1
fi
for probe in "${source_probes[@]}"; do
  rg --fixed-strings "$probe" "$verification_state/source-failure.log"
done
sha256sum --check "$verification_state/defects.before"
pnpm run format:fix
printf 'export const formattingProbe = { valid: true };\n' > "$verification_state/expected.ts"
for probe in "${source_probes[@]}"; do
  cmp "$probe" "$verification_state/expected.ts"
done
pnpm run format
rg --files --hidden --no-ignore -g '!node_modules/**' -0 |
  sort -z | xargs -0 sha256sum > "$verification_state/formatted.before"
pnpm run format:fix
sha256sum --check "$verification_state/formatted.before" > "$verification_state/idempotence.log"
for probe in "${source_probes[@]}"; do
  printf 'export const formattingProbe={valid:true}\n' > "$probe"
done
pnpm run format:fix
for probe in "${source_probes[@]}"; do
  cmp "$probe" "$verification_state/expected.ts"
done
pnpm run format
```

The second fixer must leave all inputs byte-identical. Reintroducing the defects
and fixing again must reproduce the expected text in both libraries, proving a
prior successful invocation cannot prevent a requested correction.

Next exercise maintained documentation, hidden JSON, and YAML. Place invalid
TypeScript in excluded paths: accidentally checking one would fail parsing, and
the checksum comparison also protects it from writes. These probes deliberately
coexist with the maintained defects. The two lockfiles are included in the
preservation check without changing their dependency contents.

```bash
document_probes=(README.md CONTRIBUTING.md ROADMAP.md CONTEXT.md AGENTS.md
  docs/agents/development.md docs/research/format-acceptance.md
  docs/verification/format-acceptance.md .agents/format-acceptance.md)
for probe in "${document_probes[@]}"; do
  printf '\n-    Formatting scope probe.\n' >> "$probe"
done
printf '{"formattingProbe":true}\n' > .format-acceptance.json
printf 'formattingProbe:    true\n' > format-acceptance.yaml
scope_probes=("${document_probes[@]}" .format-acceptance.json format-acceptance.yaml)
excluded_probes=(.agents/skills/format-acceptance.ts .scratch/format-acceptance.ts
  packages/core/format-acceptance.tsbuildinfo)
for directory in node_modules .pnpm-store .turbo .cache dist build coverage test-results playwright-report; do
  for prefix in . packages/core; do
    excluded_probes+=("$prefix/$directory/format-acceptance.ts")
  done
done
for probe in "${excluded_probes[@]}"; do
  mkdir -p "$(dirname "$probe")"
  printf 'export const = ;\n' > "$probe"
done
sha256sum "${excluded_probes[@]}" skills-lock.json pnpm-lock.yaml \
  > "$verification_state/excluded.before"
sha256sum "${scope_probes[@]}" > "$verification_state/scope.before"
if pnpm run format > "$verification_state/scope-failure.log" 2>&1; then
  echo 'Expected formatting failure' >&2
  exit 1
else
  test "$?" -eq 1
fi
for probe in "${scope_probes[@]}"; do
  rg --fixed-strings "$probe" "$verification_state/scope-failure.log"
done
sha256sum --check "$verification_state/scope.before"
sha256sum --check "$verification_state/excluded.before"
pnpm run format:fix
pnpm run format
sha256sum --check "$verification_state/excluded.before"
```

Every maintained probe must appear in the failure log. After fixing, the check
must pass even while invalid excluded files remain present, with all excluded
checksums unchanged.

Restore the complete original input archive into a fresh directory, removing
every probe and intentional document change. Repeat the frozen install offline
from the populated temporary store, then all available clean-scaffold commands.
Compare the full input file list and hashes to detect added or changed artifacts.

```bash
cd "$verification_state"
rm -rf workspace
mkdir workspace
tar -xf inputs.tar -C workspace
cd workspace
node --version
pnpm --version
pnpm install --frozen-lockfile --offline --store-dir "$verification_state/store"
pnpm list --recursive --depth -1
pnpm exec turbo --version
pnpm exec turbo ls
pnpm exec oxfmt --version
pnpm run format
pnpm run format:fix
pnpm run format
sha256sum --check "$verification_state/metadata.before"
rg --files --hidden --no-ignore -g '!node_modules/**' -0 |
  sort -z | xargs -0 sha256sum > "$verification_state/clean.after"
cmp "$verification_state/clean.before" "$verification_state/clean.after"
cd "$verification_root"
git diff --check
git status --short
```

Expect both workspace libraries, Turbo `2.11.2`, all checks passing, and identical
clean snapshots. Inspect both maintained library directories: each contains only
its manifest. Record the outcomes, then remove the temporary state directory.
Installed dependencies exist only as ignored local tooling; no generated output,
probe source, or cache belongs in the change.

## Executed evidence

Executed on 2026-09-22 on Linux x86_64. The session reused the Node 24.21.0
installation and npm-bootstrapped pnpm 11.27.1 from bootstrap verification under
`/tmp/pomeranian-bootstrap-fnm`; its `bin` directory was selected on `PATH`.
Both package-manager override variables were unset. The four Bash blocks above
were extracted and executed together with command tracing and pipeline failure
propagation; the procedure exited 0. Its fresh temporary store served both the
initial network installation and the final offline installation.

| Check executed                                                                                                 | Observed outcome                                                                                                                                                                                 |
| -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Before implementation: `pnpm run format` with the pinned runtime and package manager                           | Exit 1, `ERR_PNPM_NO_SCRIPT`: formatting was unavailable.                                                                                                                                        |
| New `pnpm run format` before document normalization                                                            | Exit 1; 16 maintained Markdown files identified. Hash comparison confirmed the check changed no tracked file or scratch input.                                                                   |
| `pnpm run format:fix`, then `pnpm run format`                                                                  | Both exited 0. Existing owned documents normalized; the final scope contains 30 supported maintained files.                                                                                      |
| `node --version`; `pnpm --version`; `pnpm config get pmOnFail`; `pnpm exec oxfmt --version`                    | `v24.21.0`, `11.27.1`, `error`, and `0.70.0`.                                                                                                                                                    |
| Frozen install into an empty temporary store, then five metadata checksum checks                               | Exit 0; root/workspace/lock metadata and both library manifests unchanged.                                                                                                                       |
| Unformatted TypeScript probes in both real libraries, followed by `pnpm run format`                            | Exit 1; both paths appeared in diagnostics and both source checksums remained unchanged.                                                                                                         |
| `pnpm run format:fix`, exact expected-text comparisons, then `pnpm run format`                                 | All passed; both new source files were discovered and corrected.                                                                                                                                 |
| Second `pnpm run format:fix`, followed by hashes of every non-dependency file                                  | Exit 0; all files byte-identical.                                                                                                                                                                |
| Reintroduced both source defects, then invoked the fixer and check again                                       | Both exited 0; both files again matched the independent expected text.                                                                                                                           |
| Defects in nine maintained Markdown paths, hidden JSON, and YAML                                               | Check exited 1 and named all 11 inputs; input checksums were unchanged. Fix and subsequent check exited 0.                                                                                       |
| Invalid TypeScript in 21 excluded paths at root and package depth, plus preservation hashes for both lockfiles | The check and fixer left all 23 inputs byte-identical. The clean check passed with invalid excluded files still present.                                                                         |
| Restored original input archive; offline frozen install; pnpm/Turbo discovery                                  | All exited 0; pnpm and Turbo found both source-free libraries. Turbo reported `2.11.2`.                                                                                                          |
| Final `format`, `format:fix`, `format`, metadata checksums, and full input snapshot comparison                 | All exited 0; original file set and bytes restored, with no probes or generated outputs added.                                                                                                   |
| Maintained checkout preservation review                                                                        | All 103 installed skill files, the skill lockfile, and 51 existing scratch/planning files retained their original SHA-256 hashes. Both library directories still contained only their manifests. |
| Normalization review and `git diff --check`                                                                    | Passed. Table alignment and four fenced configuration examples changed formatting only; research findings, bootstrap commands, recorded outcomes, and document links were preserved.             |

The initial attempt to reuse a different store for the maintained checkout was
rejected with `ERR_PNPM_UNEXPECTED_STORE`. Installing with that checkout's existing
store succeeded; isolated acceptance then verified a fresh store independently.
No toolchain pin or package-manager mismatch setting was changed to bypass it.

No custom executable logic or product source was introduced. There is no unit,
lint, or typecheck suite at this stage; the executed CLI acceptance procedure is
the applicable verification.

## Parent acceptance coverage

This slice owns case 3 (formatting failure, non-mutating check, fix, idempotence)
and the formatting-specific repeated-fix part of case 6. It contributes the
frozen install and cleanup/check evidence for cases 1 and 8.
[Bootstrap evidence](bootstrap.md) remains the source for installation/version
mismatch and discovery probes; formatting-only normalization preserves its
commands and outcomes.

Cases 2, 4, 5, 7, and the lint/compiler cache portions of case 6 arrive in
[#13](https://github.com/lolmaus/pomeranian/issues/13) and
[#14](https://github.com/lolmaus/pomeranian/issues/14). Neither library has source
or lint/typecheck tasks yet. The last foundation slice to integrate owns the
final full command rerun and durable index for all eight cases; #9 remains open.
