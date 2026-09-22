# VitePress external-content minimal verification

Verified: 2026-09-22. This is a disposable compatibility check for the next documentation slice, not an implementation of the real documentation workspace or a final engine decision.

Follow-up: the [comparative prototype check](docs-engine-prototype-comparison.md)
adds Astro + Starlight and retains both runnable fixtures. Its
[VitePress follow-up](docs-engine-vitepress-followup.md) resolves the cold-start
warnings recorded below using two additional dependency-directory aliases.
This report preserves the initial experiment; its outstanding-warning statements
describe that initial configuration, not the amended prototype.

## Result

VitePress 1.6.4 successfully built and served a default-theme fixture with its package and configuration in `apps/docs/` and authored Markdown in root `docs/site/`, **after adding app-local Vue and an explicit Vue resolution alias**. The initial configuration containing only `srcDir` failed to build even ordinary Markdown. External content is therefore feasible in the tested layout, but dependency resolution needs deliberate configuration.

Production output, preview HTTP, relative Markdown links, a relative image, and exclusion of root research content passed. The dev server observed edits, additions, and deletion without restart. Browser hydration and browser-visible HMR were not tested. A cold dev startup emitted two dependency optimizer warnings, which remain outstanding bootstrap verification rather than a demonstrated harmless condition.

## Isolation and versions

All fixture configuration, dependencies, generated output, logs, and runtime probes were under `/tmp/pomeranian-docs-verify-ppiwix9w`. No real `apps/docs` package was created and no repository package manifest, workspace configuration, or lockfile was changed.

| Component | Verified version |
| --- | --- |
| Node | 24.21.0 |
| pnpm | 11.27.1 |
| VitePress | 1.6.4 |
| Vue | 3.5.43 |
| Vite, resolved through VitePress | 5.4.21 |
| esbuild, resolved transitively | 0.21.5 |

The repository specifies Node 24.21.0 in `.nvmrc` and pnpm 11.27.1 with strict package-manager enforcement. Ambient commands instead resolved Node 26.9.0 and pnpm 12.4.2, so this check used the already available exact-version binaries under `/tmp/pomeranian-bootstrap-fnm/node-versions/v24.21.0/installation/` explicitly. Dependency versions above were inspected in the installed fixture; the generated temporary pnpm lockfile records the complete resolution. They are the versions tested, not an instruction to upgrade repository dependencies.

## Minimal fixture that passed

```text
apps/docs/
  package.json
  .vitepress/config.mts
docs/
  site/
    index.md
    guide/
      start.md
      icon.svg
      nested/next.md
  research/internal.md
```

The fixture workspace includes `apps/*`. Its package-manager settings include `pmOnFail: error` and `allowBuilds: { esbuild: true }`; store and cache locations point into the temporary fixture. The root fixture package declares pnpm 11.27.1 in `devEngines.packageManager`.

`apps/docs/package.json`:

```json
{
  "name": "docs-fixture",
  "private": true,
  "type": "module",
  "scripts": {
    "build": "vitepress build",
    "dev": "vitepress dev",
    "preview": "vitepress preview"
  },
  "devDependencies": {
    "vitepress": "1.6.4",
    "vue": "3.5.43"
  }
}
```

`apps/docs/.vitepress/config.mts`:

```ts
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Location verification',
  srcDir: '../../docs/site',
  vite: {
    resolve: {
      alias: {
        vue: fileURLToPath(new URL('../node_modules/vue', import.meta.url))
      }
    }
  },
  themeConfig: {
    sidebar: [{ text: 'Guide', link: '/guide/start' }]
  }
})
```

The URL in the alias resolves from the configuration file to `apps/docs/node_modules/vue`. Authored Markdown remains outside the app package. The combination of a direct Vue dependency and this alias was tested; a direct dependency without the alias was not tested separately.

VitePress documents a source directory relative to its project root. Its pinned server implementation uses that source directory as Vite's root, which helps explain why app-local dependency resolution cannot be assumed for files elsewhere in the workspace. The observed build failure below is stronger evidence than that explanation alone. Sources: [VitePress v1 source directory configuration](https://vuejs.github.io/vitepress/v1/reference/site-config#srcdir), [VitePress 1.6.4 server source](https://github.com/vuejs/vitepress/blob/v1.6.4/src/node/server.ts).

## Commands and failures

After creating the files above, the successful install and build used these commands from the temporary fixture root. The variables below abbreviate the exact binaries used:

```sh
docs_verify_runtime=/tmp/pomeranian-bootstrap-fnm/node-versions/v24.21.0/installation
docs_verify_fixture=/tmp/pomeranian-docs-verify-ppiwix9w

env PATH="$docs_verify_runtime/bin:$PATH" \
  XDG_STATE_HOME="$docs_verify_fixture/.state" \
  "$docs_verify_runtime/bin/node" \
  "$docs_verify_runtime/lib/node_modules/pnpm/bin/pnpm.cjs" \
  install --reporter append-only --fetch-retries 0 --fetch-timeout 15000

env PATH="$docs_verify_runtime/bin:$PATH" \
  XDG_STATE_HOME="$docs_verify_fixture/.state" \
  "$docs_verify_runtime/bin/node" \
  "$docs_verify_runtime/lib/node_modules/pnpm/bin/pnpm.cjs" \
  --filter docs-fixture run build

python3 /tmp/pomeranian-docs-verify-ppiwix9w/verify-runtime.py
```

The runtime probe starts the following VitePress CLI commands from `apps/docs/` using the explicit Node binary above, makes loopback HTTP requests, checks output, temporarily edits/adds/deletes source files, restores the original guide, and terminates both servers in `finally` cleanup:

```sh
node node_modules/vitepress/bin/vitepress.js preview --host 127.0.0.1 --port 43179 --strictPort
node node_modules/vitepress/bin/vitepress.js dev --host 127.0.0.1 --port 43180 --strictPort
```

Material failures and corrections:

1. pnpm 11 initially stopped with `ERR_PNPM_IGNORED_BUILDS` for esbuild 0.21.5. Explicitly allowing that build in the **temporary** workspace let installation proceed. The real bootstrap must make its own package-manager configuration consistent with required dependency builds.
2. The initial app had only VitePress and only the external `srcDir` configuration. Production compilation failed with:

   ```text
   [vite]: Rollup failed to resolve import "vue/server-renderer"
   from "/tmp/pomeranian-docs-verify-ppiwix9w/docs/site/guide/nested/next.md"
   ```

   There were no authored Vue components or imports in that page: the framework generated the runtime import. Adding the direct Vue dependency and alias shown above produced a successful build in 6.34 seconds.
3. A cold dev startup then warned:

   ```text
   Failed to resolve dependency: vitepress > @vue/devtools-api, present in 'optimizeDeps.include'
   Failed to resolve dependency: vitepress > @vueuse/core, present in 'optimizeDeps.include'
   ```

   A cached restart did not repeat these warnings; that does not establish a fix. No warning suppression or optimizer disabling was applied. A bounded source inspection found that VitePress already aliases bare `vitepress` to its client entry and `vitepress/theme` to its default theme, so an additional broad package alias was not applied speculatively. The correct cold-start resolution remains to be verified during minimal bootstrap. Sources: [VitePress 1.6.4 aliases](https://github.com/vuejs/vitepress/blob/v1.6.4/src/node/alias.ts), [VitePress 1.6.4 plugin configuration](https://github.com/vuejs/vitepress/blob/v1.6.4/src/node/plugin.ts).

The execution environment also blocked registry access and native esbuild execution in the sandbox. The same bounded temporary-fixture operations succeeded after approved escalation. An early unsupported pnpm `--state-dir` argument was replaced with `XDG_STATE_HOME`; temporary store/cache settings avoided the inaccessible default store. These were environment/setup issues, distinct from the external-Markdown import failure.

## Observations

| Check | Observed result |
| --- | --- |
| Production build | Passed with the exact package/configuration above; generated `index.html`, `guide/start.html`, and `guide/nested/next.html`. |
| Preview HTTP | Home and nested built pages returned HTTP 200 with expected authored content. |
| Nested Markdown links | `./nested/next.md` became `./nested/next.html`; `../start.md#guide-start` became `./../start.html#guide-start` in generated HTML. |
| Markdown code fence | Nested page retained expected TypeScript example content. |
| Relative image | Authored `./icon.svg` became an inline SVG data URL in production HTML; the development image URL returned SVG over HTTP. |
| Publication boundary | `docs/research/internal.md` contained a unique sentinel; it was absent from every generated output file and there was no generated research directory. Only `docs/site` was selected as the source tree. |
| Edit existing root Markdown | Requesting `/guide/start.md?import` returned the initial marker, then the edited marker with the same dev process running. |
| Add root Markdown | A newly created `docs/site/guide/added.md` became available as a transformed module without restarting the dev server. |
| Delete root Markdown | After deletion, the same request returned an HTML fallback instead of the removed Markdown module; the removed marker was absent. This verifies disappearance of the module, not browser 404 presentation. |
| Watcher evidence | Dev logs recorded HMR update events for the changed guide and added/deleted page. |
| Cleanup | Original guide contents were restored and successfully requested; both servers were stopped. |

The initial deletion assertion incorrectly assumed Vite would return HTTP 404. It was corrected to check that the removed module/content was no longer served: the observed response was HTTP 200 with the development HTML fallback. Relative Markdown routing and asset treatment are consistent with the documented features, but the concrete outcomes above come from the fixture. Sources: [VitePress v1 routing](https://vuejs.github.io/vitepress/v1/guide/routing), [VitePress v1 asset handling](https://vuejs.github.io/vitepress/v1/guide/asset-handling).

## Limits and next-slice implications

This check supports keeping a positive publication boundary at `docs/site/` while locating the docs package at `apps/docs/`. It also exposes a concrete dependency-resolution requirement that the minimal implementation must preserve and verify. It does not prove that every external-source package import or generated integration will work automatically.

The remaining immediate verification is a clean-cache dev startup without unresolved dependency warnings and a browser check of default-theme hydration, navigation, and visible Markdown HMR in the actual workspace. The real package's scripts, Turbo inputs/cache invalidation, CI checkout inputs, repository formatting/type checks, and deployment configuration were not exercised by this isolated fixture. They should be assessed only as required by the next minimal slice.

No TypeDoc, search, LLM export, branch build orchestration, version switcher, browser automation, public React demo, or deployment was implemented or validated. Those final-shape requirements remain deferred and are not prerequisites for this minimal compatibility result. The separate React app remains an E2E fixture under the settled project scope; this check adds no public link or deployment requirement for it.
