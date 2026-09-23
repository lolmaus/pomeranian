# Minimal documentation workspace verification

Verified 2026-09-23 for [implementation #33](https://github.com/lolmaus/pomeranian/issues/33)
and [specification #31](https://github.com/lolmaus/pomeranian/issues/31).
The acceptance boundary is the documented workspace commands and resulting site:
HTTP responses, generated artifacts, and a real browser. These checks cover the
actual application, rather than treating prototype results as implementation
acceptance.

## Implementation and toolchain

The private `@pomeranian/docs` application consumes root `docs/site/` directly.
Its default-theme starter describes the project and existing vocabulary without
inventing product APIs. Root `docs:dev`, `docs:build`, and `docs:preview` commands
delegate to the package. Builds are uncached; generated output and optimizer
cache stay in ignored application-local directories. CI runs the production
build after the existing formatting, lint, and type checks.

| Component                   | Executed version |
| --------------------------- | ---------------- |
| Node                        | 24.21.0          |
| pnpm                        | 12.5.1           |
| VitePress                   | 1.6.4            |
| Vue                         | 3.5.43           |
| Vite                        | 5.4.21           |
| TypeScript                  | 7.0.2            |
| Temporary Playwright driver | 1.58.2           |
| Headless Chromium           | 145.0.7632.6     |

The browser driver and browser installation were isolated under a temporary
directory; they are not documentation-package dependencies or the future product
E2E harness. The host lacked Chromium libraries. Ubuntu packages were downloaded
and extracted into that temporary directory and supplied through
`LD_LIBRARY_PATH`, without changing the host installation.

## Red-to-green observations

1. Before implementation, `pnpm run docs:build` failed with
   `ERR_PNPM_NO_SCRIPT`.
2. The initial external-content application reproduced the unresolved
   `vue/server-renderer` build failure. An explicit app-local Vue alias made
   production compilation succeed.
3. A cold development start with only that alias reproduced both optimizer
   warnings from the prototype. The two dependency-directory aliases removed
   them. The final cold startup emitted neither warning.
4. The shared Node-only type environment exposed the framework's DOM,
   WebAssembly, and Web Bluetooth declaration requirements. The application adds
   the relevant standard libraries and explicit Bluetooth types locally.
5. Full declaration checking then exposed VitePress's bundled
   `export type Token = Token` circular alias. The pnpm patch introduces an outer
   alias and references it from the namespace. This fixes the declaration without
   changing runtime code, disabling declaration checking, or weakening shared
   library settings.
6. Deliberately adding an unhandled promise to the hidden VitePress configuration
   made root lint fail with `typescript(no-floating-promises)`. A deliberate
   number-to-string assignment made root typecheck fail with `TS2322`. Both
   reported the actual hidden configuration file. Restoring it restored passing
   checks; the empty discovery config is not being checked instead of its leaf.

One browser probe initially expected an exact heading name without VitePress's
accessible anchor suffix and timed out. Inspecting the actual rendered heading
identified the assertion error. The corrected heading match passed; no site
change or error suppression was used to satisfy it.

## Repeatable acceptance procedure

Use a disposable clean checkout with the pinned toolchain from
[Contributing](../../CONTRIBUTING.md#set-up-a-checkout). Keep the original sources
and dependency metadata so they can be compared after testing.

### Installation and workspace integration

```sh
node --version
pnpm --version
pnpm install --frozen-lockfile
pnpm list --recursive --depth -1
pnpm exec turbo ls
pnpm run format
pnpm run lint
pnpm run typecheck
pnpm run docs:build
```

Confirm the docs package is discovered alongside the four existing packages,
that lint/typecheck execute its real configuration inputs, and that installation
leaves manifests, patch, workspace settings, and lockfile unchanged. Frozen
installation must apply the VitePress declaration patch. To verify failure
propagation, temporarily introduce an unhandled promise and an incompatible
assignment into the VitePress config, check the root commands fail on those
specific diagnostics, then restore and rerun.

### Content fixture

Create a temporary `acceptance-probe/` folder inside the site content subtree.
Use this `start.md`:

````markdown
# Acceptance start

ORIGINAL_MARKER

[Nested destination](./nested/next.md#destination)

![Probe image](./icon.svg)

```ts
const example = 42;
```
````

Create `nested/next.md` alongside it:

```markdown
# Nested destination

## Destination

[Back to start](../start.md)
```

Create `icon.svg` with a 16 by 16 rectangle of color `#123456`. Outside the site
subtree, create `docs/research/docs-acceptance-sentinel.md` containing the unique
text `PRIVATE_SITE_SENTINEL_33`. This sentinel is never intended for publication.

### Development and browser behavior

With all previous servers stopped, remove only the generated docs optimizer
cache (`apps/docs/.cache/`), then start:

```sh
pnpm run docs:dev --host 127.0.0.1 --port 43190 --strictPort
```

Visit `/acceptance-probe/start.html` in a browser. Check that the heading, marker,
code fence, and image render. Toggle the default theme's appearance switch and
confirm that the page appearance changes: server-rendered HTML alone is
insufficient evidence of hydration.

Follow the nested link and back link. Confirm the intended heading, anchor, and
URL and that the document did not reload. The automated probe compared
`performance.timeOrigin` before and after the click. Load the nested URL directly
as well. Inspect browser errors/warnings and server diagnostics.

While keeping this server and browser session running:

1. Change the marker to `EDITED_MARKER`; confirm the rendered text changes without
   a document reload or server restart.
2. Add `added.md` containing `ADDED_MARKER`; visit its route and confirm the text.
3. Delete it and reload the route; confirm the removed content disappears. The
   transformed Markdown module must also stop serving the deleted marker. Do not
   require a particular development status code or preservation of a deleted
   page already held in client memory.

### Production preview and publication boundary

```sh
pnpm run docs:build
pnpm run docs:preview --host 127.0.0.1 --port 43191 --strictPort
```

Repeat the browser navigation, hydration, heading/anchor, code, and image checks
against preview. Search every generated output file for the unique sentinel;
there must be no match. Request the following paths and confirm they do not
publish project records:

- `/research/docs-acceptance-sentinel`
- `/docs/research/docs-acceptance-sentinel.md`
- `/CONTEXT.md`
- `/AGENTS.md`

These preview requests returned 404. Navigation visibility was not used as the
publication-boundary test.

### Rebuild correctness and cleanup

Build caching is disabled, so there is no warm-cache reuse contract to test.
Leave the previous output in place and change all four input cases before another
build: edit the start-page marker to `REBUILT_MARKER`, add a page, remove the
nested page and its incoming link, and change the SVG to 24 by 24 with a different
color. Rebuild and verify:

- The new marker replaces the old one in generated HTML.
- The new page exists and the removed page's output no longer exists.
- The image URL/content changes, and the browser reports natural width 24.

Stop the servers, remove the temporary content folder and sentinel, and rebuild.
Only maintained starter content should remain. Rerun the standard checks and
confirm the working tree contains only intended changes.

## Executed results

| Acceptance                    | Outcome                                                                                                                                  |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Workspace build               | Initial missing command and resolver failure turned into successful builds                                                               |
| Cold development              | No dependency-resolution warnings with the final aliases                                                                                 |
| Root lint/typecheck ownership | Deliberate defects in hidden config rejected; restored config passes                                                                     |
| Dev and preview browser smoke | Hydration, client navigation, direct nested URL, anchor, code, and image passed; no browser errors or warnings during either smoke check |
| Live editing                  | Updated text appeared without a document reload                                                                                          |
| Add/delete watching           | Added page became available; deleted content disappeared with the same server                                                            |
| Publication boundary          | Sentinel absent from all artifacts; four project-record preview routes returned 404                                                      |
| Uncached rebuild              | Edit, add, delete, and asset change all reflected; no stale removed HTML                                                                 |
| Clean working copy            | Frozen install, pnpm/Turbo discovery, root lint/typecheck, build and preview passed; dependency metadata unchanged                       |
| Final workspace checks        | Formatting, root lint, root typecheck, production build and whitespace checks passed                                                     |
| Probe cleanup                 | Temporary sources removed, servers stopped, final starter-only build passed                                                              |

Deletion probes intentionally request a removed resource; their expected missing
resource response is separate from the error-free valid-page smoke checks.
The initial evidence used the real working tree. A separate fresh working copy
also passed frozen installation, discovery, lint, typecheck, production build,
and HTTP preview with the starter content. Manifest, patch, workspace settings,
and lockfile bytes matched the original inputs afterward. The first source-copy
run lacked Git metadata, so Turbo reported a Git-hashing fallback warning;
initializing that isolated snapshot as a Git checkout and rerunning the checks
removed the warning. Its working tree remained clean.

## Maintenance references and limits

[VitePress v1 configuration](https://vuejs.github.io/vitepress/v1/reference/site-config)
documents separate source, output, and cache locations. The resolver aliases
come from the retained [prototype follow-up](../research/docs-engine-vitepress-followup.md)
and were reproduced here. The declaration patch uses
[pnpm's patch workflow](https://pnpm.io/cli/patch); recheck both the patch and
aliases when upgrading the pinned engine.

This evidence covers one Chromium browser and the pinned author toolchain.
It does not establish cross-browser product behavior, hosting, a deployment
subpath, or future API/search/LLM integrations. Those are outside this slice.
