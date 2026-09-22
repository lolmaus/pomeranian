# VitePress comparison follow-up

> Final decision (2026-09-22): the author selected VitePress with root
> `docs/site/` content and removed per-branch documentation versioning from scope.
> The comparison below preserves the evidence considered before that decision.
> Branch-version requirements, proposals, and acceptance checks are superseded,
> not deferred work. API/search and LLM findings remain relevant to the single
> current site. See the [current decision and scope](docs-engine-requirements.md).

Verified 2026-09-22, supplementing [the initial minimal check](docs-engine-minimal-verification.md). The comparison reused the isolated fixture at `/tmp/pomeranian-docs-verify-ppiwix9w`, with Node 24.21.0, pnpm 11.27.1, VitePress 1.6.4, Vue 3.5.43, and Vite 5.4.21. No workspace dependencies or application files were added.

## Result

The original external-content configuration's two cold-start optimizer warnings were reproduced after deleting the temporary `.vitepress/cache`. Two additional native Vite dependency-directory aliases removed those warnings. The amended configuration also built without warnings and served every local link emitted by the three fixture pages, including default-theme sidebar links and nested forward/back links.

Browser hydration, browser console errors, client navigation, and visible HMR remain unverified. No browser connector, Chromium/Firefox executable, Playwright/Puppeteer library, or cached browser was found in the inspected environment. No browser was downloaded. HTTP success must not be described as browser success.

## Resolution configuration

The winning variant keeps the original app-local Vue dependency and alias, and resolves the two optimizer dependencies from VitePress's own installed dependency directory:

```ts
import { createRequire } from 'node:module'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { defineConfig } from 'vitepress'

const fromApp = createRequire(import.meta.url)
const vitePressPackage = pathToFileURL(fromApp.resolve('vitepress/package.json'))

export default defineConfig({
  title: 'Location verification',
  srcDir: '../../docs/site',
  vite: {
    resolve: {
      alias: {
        vue: fileURLToPath(new URL('../node_modules/vue', import.meta.url)),
        '@vue/devtools-api': fileURLToPath(new URL('../@vue/devtools-api', vitePressPackage)),
        '@vueuse/core': fileURLToPath(new URL('../@vueuse/core', vitePressPackage))
      }
    }
  },
  themeConfig: { sidebar: [{ text: 'Guide', link: '/guide/start' }] }
})
```

This uses the dependency layout observed in the pinned pnpm fixture and leaves Vite to select package entrypoints. It couples the configuration to two VitePress dependencies; upgrades require revalidation. It adds no packages, optimizer exclusions, warning filters, or unrelated plugins.

Source inspection explains the original warnings: VitePress requests nested optimizer entries `vitepress > @vue/devtools-api` and `vitepress > @vueuse/core`, while Vite resolves their parent package starting from its root, which here is the external Markdown directory. This is an explanation of the observed configuration, not proof of all possible dependency layouts. [VitePress 1.6.4 optimizer configuration](https://github.com/vuejs/vitepress/blob/v1.6.4/src/node/plugin.ts), [Vite 5.4.21 dependency optimizer](https://github.com/vitejs/vite/blob/v5.4.21/packages/vite/src/node/optimizer/index.ts)

## Variants and observations

| Variant/check | Outcome |
| --- | --- |
| Original Vue-only alias, genuinely empty cache | Reproduced both unresolved optimizer warnings. Both external Markdown modules still returned their expected content. |
| Aliases to `createRequire().resolve()` entrypoints | Removed optimizer warnings, but selected CommonJS entrypoints and introduced a production circular-chunk warning. Retained as an unsuccessful comparison variant. |
| Aliases to installed dependency directories | Removed optimizer warnings; both external Markdown modules loaded; production build completed with no warnings. |
| Actual production links | All 16 local href observations across home, guide, and nested page returned HTTP 200; expected content was checked for guide destinations. Hash fragments were retained in URLs but browser scrolling was not tested. |
| Initial `--force` probe without cache deletion | Did not reproduce baseline warnings, so it was not used as cold-start evidence. Final probe explicitly deletes only the fixture's generated cache before each variant. |

The final directory-alias configuration is installed in the temporary fixture. Servers were terminated and the probe restores the configuration present when it starts. Production output and logs are disposable; runnable inputs and probes should be preserved with the prototype artifact.

## Reproduction and retained evidence

From a recreated fixture with dependencies installed using its lockfile:

```sh
DOCS_VERIFY_NODE=/path/to/node-24.21.0 python3 verify-followup.py
```

The executed command used `/tmp/pomeranian-bootstrap-fnm/node-versions/v24.21.0/installation/bin/node`. The probe starts cold dev servers on loopback ports 43181/43182, builds the amended variant, and serves production output on 43183. The existing `verify-runtime.py` and new `verify-followup.py` now locate the fixture relative to their own files and accept `DOCS_VERIFY_NODE` (default `node`).

Preserved fixture files: `baseline-config.mts`, `optimizer-cjs-config.mts`, `optimizer-alias-config.mts`, `verify-followup.py`, `verify-runtime.py`, `followup-results.json`, and `followup-*.log`, alongside the app config, Markdown, manifests, and lockfile. The comparison probe reruns baseline versus the winning directory-alias variant; the CommonJS configuration records the rejected intermediate attempt.

This resolves the two reported cold optimizer warnings for the tested fixture. It does not remove the extra configuration cost of external content, prove browser hydration, or validate TypeDoc, search, LLM output, branch versions, workspace caching, or deployment.
