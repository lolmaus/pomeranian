# Bootstrap acceptance

This records the workspace CLI acceptance seam for
[bootstrap #11](https://github.com/lolmaus/pomeranian/issues/11), part of
[monorepo setup #9](https://github.com/lolmaus/pomeranian/issues/9).
Run the procedure when changing installation or package-manager selection.
It uses the real source-free library packages; no additional consumers or test
framework are needed.

## Toolchain selection

Assessed on 2026-09-21. Node 24.21.0 is an Active LTS release. The selected pnpm 11
release supports `devEngines.packageManager` and an npm bootstrap. Turbo 2.11
introduced native support for that field. Node 24.21.0 satisfies the published
Node requirements of the remaining required tools.

| Tool | Exact version assessed | Status in this slice |
| --- | --- | --- |
| Node | 24.21.0 | Selected in `.nvmrc`; installed and exercised. |
| pnpm | 11.27.1 | Selected in `devEngines.packageManager`; bootstrapped and exercised. |
| Turbo | 2.11.2 | Installed from the lockfile; workspace discovery exercised. |
| Oxfmt | 0.70.0 | Compatibility candidate for #12; its current pre-1.0 release line is allowed. |
| Oxlint | 1.85.0 | Compatibility candidate for #13. |
| TypeScript | 7.0.2 | Compatibility candidate for #13. |

The later tickets must pin and acceptance-test their actual tool versions. This
assessment does not claim that formatting, linting, or compilation already works
in the repository. The empty Turbo task map enables workspace discovery; #13
adds real check tasks and their caching configuration.

Primary sources: [Node release](https://nodejs.org/en/blog/release/v24.21.0),
[pnpm release](https://github.com/pnpm/pnpm/releases/tag/v11.27.1),
[pnpm manifest convention](https://pnpm.io/package_json#devenginespackagemanager),
[pnpm mismatch settings](https://pnpm.io/settings/cli#pmonfail),
[Turbo 2.11](https://turborepo.dev/blog/2-11), and
[fnm commands](https://github.com/Schniz/fnm/blob/master/docs/commands.md).
Version-specific registry metadata supplies the Node engine ranges:
[pnpm](https://registry.npmjs.org/pnpm/11.27.1),
[Turbo](https://registry.npmjs.org/turbo/2.11.2),
[Oxfmt](https://registry.npmjs.org/oxfmt/0.70.0),
[Oxlint](https://registry.npmjs.org/oxlint/1.85.0), and
[TypeScript](https://registry.npmjs.org/typescript/7.0.2).

## Repeatable procedure

The commands below use Bash, Git, GNU tar, and `sha256sum`. Follow the fnm shell
setup in [CONTRIBUTING.md](../../CONTRIBUTING.md) first. Use a new temporary copy
so intentional failures cannot alter the maintained checkout. This copies tracked
and non-ignored new files, including a proposed change before it is committed,
without dependencies or caches:

```bash
verification_root=$(pwd)
verification_dir=$(mktemp -d)
git ls-files --cached --others --exclude-standard -z |
  tar --null -T - -cf - | tar -xf - -C "$verification_dir"
cd "$verification_dir"
fnm install
fnm use
npm install --global "pnpm@$(node --print "require('./package.json').devEngines.packageManager.version")"
unset pnpm_config_pm_on_fail PNPM_CONFIG_PM_ON_FAIL
node --version
pnpm --version
pnpm config get pmOnFail
```

Expect Node `v24.21.0`, pnpm `11.27.1`, and `error`. The npm global install applies
to the selected Node installation. Do not pass `--pm-on-fail` or use a pnpm alias
or wrapper that overrides this setting. `.nvmrc` selects a runtime with compatible
tools; it cannot enforce the runtime of unrelated processes.

Record dependency metadata and install into an empty store:

```bash
sha256sum package.json pnpm-workspace.yaml pnpm-lock.yaml \
  packages/core/package.json packages/lib-essential/package.json > metadata.before
pnpm install --frozen-lockfile --store-dir "$verification_dir/store"
sha256sum --check metadata.before
pnpm list --recursive --depth -1
pnpm exec turbo --version
pnpm exec turbo ls
```

Expect installation success and all five checksums unchanged. pnpm lists three
projects including the root; both pnpm and Turbo discover `@pomeranian/core` and
`@pomeranian/lib-essential`. Turbo reports `2.11.2`. Its `pnpm9` graph label names
its lockfile-format handler, not the effective pnpm executable version.

Keep the original manifest for the failure probes:

```bash
cp package.json package.json.before
node -e 'const fs = require("node:fs"); const p = JSON.parse(fs.readFileSync("package.json", "utf8")); p.devEngines.packageManager.version = "11.27.0"; fs.writeFileSync("package.json", JSON.stringify(p, null, 2) + "\n");'
pnpm --version
pnpm install --frozen-lockfile --offline --store-dir "$verification_dir/store"
```

Both pnpm commands must exit 1 and identify the required `11.27.0` and actual
`11.27.1`. They must not silently install with the different version. In this
disposable copy only, demonstrate why override settings must be controlled:

```bash
pnpm_config_pm_on_fail=ignore pnpm --version
PNPM_CONFIG_PM_ON_FAIL=ignore pnpm --version
pnpm --pm-on-fail=ignore --version
cp package.json.before package.json
```

Each override allows `11.27.1` and exits 0 despite the mismatch. These bypasses are
outside the documented setup contract. In a real checkout, fix a mismatch by
selecting `.nvmrc` and repeating the npm bootstrap, rather than weakening the
check. The version numbers here are probe inputs, not additional version pins.

Next, prove frozen installation rejects stale metadata without rewriting the
lockfile:

```bash
node -e 'const fs = require("node:fs"); const p = JSON.parse(fs.readFileSync("package.json", "utf8")); p.devDependencies.turbo = "2.11.1"; fs.writeFileSync("package.json", JSON.stringify(p, null, 2) + "\n");'
sha256sum pnpm-lock.yaml > lock.before
pnpm install --frozen-lockfile --offline --store-dir "$verification_dir/store"
sha256sum --check lock.before
cp package.json.before package.json
```

Expect exit 1 with `ERR_PNPM_OUTDATED_LOCKFILE`, naming the Turbo manifest/lockfile
mismatch, and an unchanged lockfile. Restore the clean scaffold and rerun:

```bash
sha256sum --check metadata.before
node --version
pnpm --version
pnpm install --frozen-lockfile --offline --store-dir "$verification_dir/store"
pnpm list --recursive --depth -1
pnpm exec turbo --version
pnpm exec turbo ls
sha256sum --check metadata.before
cd "$verification_root"
git diff --check
git status --short
```

All commands must pass. Review the two library directories: only their manifests
belong in this slice, with no source, placeholder modules, or public product
exports. Check that `node_modules/`, `.pnpm-store/`, `.turbo/`, `dist/`, `coverage/`,
`*.tsbuildinfo`, and root `.scratch/` are ignored. Remove the temporary copy when
finished. The maintained checkout must contain no probe changes or generated
artifacts in its versioned inputs.

## Executed evidence

Executed on 2026-09-21 on Linux x86_64 with Git 2.43.0 and fnm 1.39.0. An isolated
fnm directory under `/tmp/pomeranian-bootstrap-fnm` held Node 24.21.0 and its bundled
npm 11.19.0. The npm bootstrap installed pnpm 11.27.1 into that Node prefix. fnm's
`--fnm-dir`/`--using` options and temporary store/cache paths isolated verification
from the author's existing Node and pnpm installations.

| Check executed | Observed outcome |
| --- | --- |
| Before implementation: `pnpm install --frozen-lockfile` | Failed with `ERR_PNPM_NO_LOCKFILE`; no executable workspace existed. |
| `fnm install --fnm-dir /tmp/pomeranian-bootstrap-fnm --progress never`, then initialized fnm and ran `fnm use` in the copied workspace | Selected `.nvmrc` and reported `Using Node v24.21.0`. |
| `npm install --global "pnpm@$(node --print "require('./package.json').devEngines.packageManager.version")"` under the selected Node | Installed pnpm 11.27.1 successfully; no repository dependency install was needed to bootstrap it. |
| `node --version`, `npm --version`, `pnpm --version`, `pnpm config get pmOnFail` | `v24.21.0`, `11.19.0`, `11.27.1`, `error`. |
| Frozen install in an isolated workspace with an empty store, followed by `sha256sum --check` | Exit 0; all five dependency metadata files unchanged. |
| `pnpm list --recursive --depth -1`; `pnpm exec turbo --version`; `pnpm exec turbo ls` | Root plus both private libraries; Turbo 2.11.2; both libraries discovered. No legacy package-manager field or disabled Turbo check was required. |
| Temporary pnpm pin `11.27.0`, with both environment overrides unset: version query and frozen install | Both exited 1: `[ERROR] This project is configured to use 11.27.0 of pnpm. Your current pnpm is v11.27.1`. |
| Each lowercase/uppercase environment override and the CLI override set to `ignore`, used only for a version query | Each exited 0 and reported 11.27.1, confirming the overrides bypass the default check. |
| Temporary Turbo manifest version `2.11.1`, with lockfile still at `2.11.2` | Frozen install exited 1 with `ERR_PNPM_OUTDATED_LOCKFILE`; lockfile checksum stayed unchanged. |
| Restored manifest, then repeated version queries, offline frozen install, pnpm/Turbo discovery, and metadata checksums | All exited 0; both source-free library identities remained present and all metadata matched the original copy. |
| `git check-ignore` for dependency, cache, output, TypeScript build-info, and scratch paths; inspection of `packages/`; `git diff --check` | All intended paths ignored, both libraries contain only manifests, and no whitespace errors found. |

No project executable logic, typed source, unit suite, formatting, or lint commands
exist at this stage. The CLI acceptance procedure is the applicable verification;
#12–14 add the remaining checks with their inputs.
