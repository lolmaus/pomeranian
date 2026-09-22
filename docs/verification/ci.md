# GitHub Actions verification

This records [CI #18](https://github.com/lolmaus/pomeranian/issues/18), part of
[monorepo setup #9](https://github.com/lolmaus/pomeranian/issues/9).
The acceptance boundary is the actual hosted workflow and GitHub's effective
merge rules, alongside the existing workspace CLI. Workflow configuration is
verified through its observable behavior.

## Workflow contract

The `CI` workflow exposes one stable `Workspace checks` job. A branch push checks
the branch tip; a pull request checks its proposed merge result. Draft PRs and
documentation-only changes participate, including PRs targeting branches other
than main. Tag pushes do not trigger this workflow.

The job reads Node from `.nvmrc` and pnpm from `devEngines.packageManager`, restores
the pnpm dependency store, runs a frozen install, and checks repository formatting.
The final tracked-file diff runs even after failure and verifies that the checks
leave maintained files unchanged. It does not convert an earlier failure into
success. Later foundation tickets add their checks to this same required job.

The pnpm action installs its executable on each invocation. Its built-in cache
stores downloaded dependencies, keyed by operating system, architecture, and
lockfile content, with a platform-specific fallback. A cache hit still executes
the frozen install and checks. A cache miss remains a supported path. Node setup's
separate package-manager cache is disabled.

Full commit pins were resolved from the current official stable releases on
2026-09-22:

| Action            | Release                                                            | Commit                                     |
| ----------------- | ------------------------------------------------------------------ | ------------------------------------------ |
| checkout          | [7.0.1](https://github.com/actions/checkout/releases/tag/v7.0.1)   | `3d3c42e5aac5ba805825da76410c181273ba90b1` |
| setup-node        | [7.0.0](https://github.com/actions/setup-node/releases/tag/v7.0.0) | `820762786026740c76f36085b0efc47a31fe5020` |
| pnpm/action-setup | [6.1.0](https://github.com/pnpm/action-setup/releases/tag/v6.1.0)  | `ea17c68df8912ef543352723c149a84f56e3d413` |

The pnpm release uses an annotated tag; the pin above is its resolved commit.
Dependabot checks the GitHub Actions ecosystem weekly, groups minor/patch updates,
and leaves majors as individual reviewed PRs. Package dependency updates and
automatic merging are not configured.

Sources: [Node version-file input](https://github.com/actions/setup-node/blob/v7.0.0/action.yml),
[pnpm version selection](https://github.com/pnpm/action-setup/blob/v6.1.0/src/install-pnpm/run.ts),
[pnpm store cache](https://github.com/pnpm/action-setup/blob/v6.1.0/src/cache-restore/run.ts),
[Dependabot options](https://docs.github.com/en/code-security/reference/supply-chain-security/dependabot-options-reference),
[PR merge revisions](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#pull_request).

## Repeatable acceptance procedure

Use the pinned toolchain from [CONTRIBUTING.md](../../CONTRIBUTING.md). Run the
available local commands, including a frozen install and formatting, before
pushing the proposed workflow. Record its revision and workflow run URLs.

1. Use disposable verification branches based on the workflow revision. Capture
   a first run without a matching cache, then a later run in the same eligible
   cache scope. Inspect the setup, install, and formatting step logs: both runs
   must execute a frozen install and the check. Do not clear unrelated caches.
2. Open a draft PR whose only difference from its base is maintained
   documentation. Introduce an Oxfmt-supported formatting defect. Both branch
   and PR checks must run and fail at formatting; the tracked-file diff must
   show the check did not modify the defect. Correct it and confirm success.
3. With a successful cache available, temporarily change a declared dependency
   without updating the lockfile. The cache must restore, then frozen
   installation must fail with an outdated-lockfile diagnostic. Restore the
   manifest and verify success. Do not merge the probe.
4. In a disposable revision only, insert a controlled delay before installation.
   While push and PR runs are active, push a new revision removing that delay.
   Older runs in each stream must be canceled; the latest push and PR runs must
   both finish without canceling one another. Remove the delay from the final
   tree and retain the run IDs as evidence.
5. Once `Workspace checks` has reported, configure its active required-check rule
   for main, requiring the GitHub Actions app and an up-to-date branch, with no
   bypass actors. Inspect the effective rule and a main-targeting PR's required
   checks and merge eligibility on deliberately failing and corrected revisions.
   Never merge a deliberate defect. Draft status is an independent merge blocker,
   so use a ready PR for the merge-eligibility comparison.
6. Close the disposable PRs and remove their remote branches after saving run
   links and revisions. Restore all probes, rerun local checks and a clean hosted
   result, and retain the still-valid prior foundation evidence.

Useful observation commands, substituting the recorded PR and run numbers:

```bash
gh run list --workflow ci.yml
gh run view RUN_ID --json headSha,event,status,conclusion,jobs,url
gh run view RUN_ID --log
gh pr checks PR_NUMBER --required
gh pr view PR_NUMBER --json isDraft,mergeable,mergeStateStatus,statusCheckRollup
gh api repos/lolmaus/pomeranian/rules/branches/main
gh api repos/lolmaus/pomeranian/rulesets
```

## Executed evidence

Verification is in progress. Before implementation, the workflow API returned
zero workflows and the effective main-branch rules and repository rulesets were
empty. The required hosted result and merge gate were therefore absent.

## Parent acceptance coverage

This slice adds hosted cases 9–12 to the parent's eight existing CLI cases.
The hosted lint/type failure coverage in case 11 arrives with #13 and #14.
The final integrated clean-scaffold and hosted rerun and the complete twelve-case
evidence index remain with the last foundation slice. Existing
[bootstrap](bootstrap.md) and [formatting](formatting.md) evidence remains the
source for their respective behavior.
