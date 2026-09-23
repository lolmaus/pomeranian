# GitHub Pages deployment verification

The author extended [specification #31](https://github.com/lolmaus/pomeranian/issues/31)
and [implementation #33](https://github.com/lolmaus/pomeranian/issues/33) on
2026-09-23 to deploy the documentation through CI. This record supplements the
[minimal workspace acceptance](minimal-docs.md).

## Deployment contract

The one current site uses `https://lolmaus.github.io/pomeranian/`. VitePress has
`/pomeranian/` as its base in both local development and production, so local
preview exercises the actual project path.

The existing **Workspace checks** job builds the site and uploads only
`apps/docs/dist/` as the `github-pages` artifact. The separate **Deploy
documentation** job depends on that job's success and runs only for a push to
`refs/heads/main`. Branch pushes and PRs validate the artifact without deploying.
No manual-dispatch or PR-preview publishing path is enabled.

Only the deploy job receives Pages and OIDC write permissions. It uses the
`github-pages` environment and reports the action's deployment URL. The checks
job keeps read-only repository permissions. Main workflows are serialized with
cancellation disabled; newer pushes cannot cancel an active deployment.
Superseded branch and PR checks retain their prior cancellation behavior.

The official actions are pinned to these inspected release commits:

| Action                          | Release | Commit                                     |
| ------------------------------- | ------- | ------------------------------------------ |
| `actions/upload-pages-artifact` | v5.0.0  | `fc324d3547104276b827a68afc52ff2a11cc49c9` |
| `actions/deploy-pages`          | v5.0.1  | `368f82528645a54fb793d4d04e342629a3f51346` |

The upload action's default one-day retention applies. The existing Dependabot
configuration covers these new GitHub Actions references.

## Repository setup

Before this change, the Pages API returned 404 and the repository reported
`has_pages: false`. Pages was enabled using `build_type: workflow`. The returned
site URL is the expected project URL and `https_enforced` is true.

GitHub created the `github-pages` environment with custom branch policies. The
policies API confirmed a single rule: branch `main`. There are no branch-preview
or tag deployment policies. No secret, custom domain, or branch publishing source
was added.

Recheck these settings with:

```sh
gh api repos/lolmaus/pomeranian/pages
gh api repos/lolmaus/pomeranian/environments/github-pages
gh api repos/lolmaus/pomeranian/environments/github-pages/deployment-branch-policies
```

## Local acceptance

- The existing generated HTML initially failed a project-base assertion because
  its stylesheet URL started with `/assets/`. Adding the VitePress base made all
  generated root-relative asset and link URLs start with `/pomeranian/`.
- `pnpm run docs:build` passed with that base. The complete browser probe from
  the minimal-workspace verification was rerun with both development and preview
  URLs prefixed by `/pomeranian`.
- Chromium passed hydration, client navigation, direct nested URLs, heading
  anchors, code fences, image loading, and browser-visible Markdown updates.
  Added/deleted pages and rebuilt assets behaved correctly under the subpath.
  Valid-page smoke checks emitted no browser errors or warnings.
- Publication probes remained excluded from the site. Temporary source fixtures
  were removed, servers were stopped, and the final starter-only build passed.
- The upload action's Linux archive command was reproduced against final output.
  The resulting tar archive contained root `index.html`, no symbolic or hard
  links, and no probe or research content.
- `actionlint` v1.7.12 accepted the workflow, including job dependencies,
  permissions, environment output, and event/concurrency expressions.

## Hosted acceptance and first publication

The extension at `9144cdb` passed both [branch CI](https://github.com/lolmaus/pomeranian/actions/runs/35918751977)
and [PR CI](https://github.com/lolmaus/pomeranian/actions/runs/35918755487).
**Workspace checks** succeeded, including the Pages artifact upload and unchanged
maintained-file check. **Deploy documentation** was skipped in both runs, as
required for the unmerged branch.

The actual PR artifact was downloaded with `gh run download --name github-pages`.
Its tar archive contained 27 entries, root `index.html` with the starter content,
no symbolic/hard links, and no research or temporary probe content. Parsing that
HTML confirmed that all root-relative asset and link URLs used `/pomeranian/`.
The artifact expires after one day; the workflow logs and this result record
remain the evidence of that inspection.

The first public deployment is intentionally pending merge approval. Enabling
Pages does not publish the unmerged branch. After merging PR #35:

1. Confirm the main-push **Workspace checks** and **Deploy documentation** jobs
   succeed in the same run, and that deployment uses that run's artifact.
2. Confirm the `github-pages` environment reports the expected HTTPS URL.
3. Open the public URL in a browser, check starter content and its appearance
   switch, and confirm JavaScript/CSS assets load beneath `/pomeranian/`.
4. When the next guide is added, check its direct nested URL and relative links
   on the public site. Nested-page browser behavior was tested locally with
   disposable content; no demonstration guide was retained solely for hosting.

These steps are the remaining live-host acceptance, not claims that a production
deployment has already succeeded. Custom-domain/DNS work, package releases, the
React demo, branch previews, and versioned documentation remain out of scope.

## Sources

- [GitHub custom Pages workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages): artifact/deploy relationship, permissions, and environment.
- [Pinned upload action](https://github.com/actions/upload-pages-artifact/blob/fc324d3547104276b827a68afc52ff2a11cc49c9/action.yml): archive behavior, path input, and retention.
- [Pinned deployment action](https://github.com/actions/deploy-pages/blob/368f82528645a54fb793d4d04e342629a3f51346/action.yml): deployment inputs and URL output.
- [VitePress v1 site base](https://vuejs.github.io/vitepress/v1/reference/site-config#base): project-subpath configuration.
