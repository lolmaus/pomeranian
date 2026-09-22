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

Executed on 2026-09-22 against workflow revision
[`5a2c4cb`](https://github.com/lolmaus/pomeranian/commit/5a2c4cb74118b00c595bc2a68f39f7e6f2a24893),
with disposable probe commits described below. Before implementation, the workflow
API returned zero workflows and both effective main-branch rules and repository
rulesets were empty.

### Hosted installation and formatting

| Case                                | Hosted evidence                                                                                                                                                                                                                                              | Observed result                                                                                                                                                                                                                                                               |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Cold dependency cache               | [Initial branch push](https://github.com/lolmaus/pomeranian/actions/runs/35770437628), [implementation PR](https://github.com/lolmaus/pomeranian/actions/runs/35770468428)                                                                                   | Cache miss; frozen installation, formatting, and unchanged-file verification all passed.                                                                                                                                                                                      |
| Formatting defect                   | [Branch push](https://github.com/lolmaus/pomeranian/actions/runs/35770578423), [main-targeting PR](https://github.com/lolmaus/pomeranian/actions/runs/35770629651), [draft documentation PR](https://github.com/lolmaus/pomeranian/actions/runs/35770631568) | At `137a225`, an over-indented README list item made formatting fail. Installation passed and the final diff check passed, proving the defect was not rewritten and the earlier failure remained visible.                                                                     |
| Corrected formatting and warm cache | [Branch push](https://github.com/lolmaus/pomeranian/actions/runs/35770757008), [main-targeting PR](https://github.com/lolmaus/pomeranian/actions/runs/35770761705), [draft documentation PR](https://github.com/lolmaus/pomeranian/actions/runs/35770761648) | At `ea92623`, all three runs restored the exact store cache, still executed frozen installation, then passed formatting and unchanged-file verification. The push reused five packages and downloaded zero.                                                                   |
| Frozen install after a cache hit    | [Branch push](https://github.com/lolmaus/pomeranian/actions/runs/35770861170), [main-targeting PR](https://github.com/lolmaus/pomeranian/actions/runs/35770867321), [draft documentation PR](https://github.com/lolmaus/pomeranian/actions/runs/35770866994) | At `9bff7a8`, all three restored the exact cache, then failed installation with `ERR_PNPM_OUTDATED_LOCKFILE`: the manifest declared Oxfmt `0.69.0`, while the unchanged lockfile declared `0.70.0`. Formatting was skipped, the tracked-file diff passed, and the job failed. |

The successful hosted setup reported Node `v24.21.0` and pnpm `11.27.1`, matching
`.nvmrc` and `devEngines.packageManager`. The pnpm dependency-cache key was
`pnpm-cache-Linux-x64-d0873d007ddb635f8b42fca55dc3abf2d88250546c4a88b06923b7e0c4230fb1`.
The dependency versions, lockfile, and pnpm version contract were unchanged by the
implementation.

[Probe PR #21](https://github.com/lolmaus/pomeranian/pull/21) was ready and targeted
`main`; [probe PR #22](https://github.com/lolmaus/pomeranian/pull/22) remained a draft
and targeted the implementation branch. At the formatting-failure revision,
#22's complete diff was two README lines. Its workflow ran on both the failing
and corrected documentation-only revisions. Checkout logs identify the proposed
merge commits and their bases: #21 used base `33d6938`, while #22 used `5a2c4cb`.
The separate push runs checked the corresponding branch tips.

### Required merge rule

After the job first reported successfully, active branch ruleset
[`23838726`](https://github.com/lolmaus/pomeranian/settings/rules/23838726),
**Required workspace checks**, was configured for `refs/heads/main` with no
exclusions and an empty `bypass_actors` array. Its only rule requires
`Workspace checks` from GitHub Actions application `15368`, with
`strict_required_status_checks_policy: true` and
`do_not_enforce_on_create: false`. The effective branch-rules endpoint returned
the same required check and strict policy. Inspection used the authenticated
repository owner's account, so the empty bypass list was visible directly.

For ready PR #21, GitHub reported `mergeable: MERGEABLE` but
`mergeStateStatus: BLOCKED` on the formatting-defect revision. After correction,
`gh pr checks 21 --required` passed and `mergeStateStatus` became `CLEAN`.
Neither deliberate defect was merged. The active rule applies to owners and
administrators as well as other authors; it has no configured bypass actors.

### Local commands

With the pinned Node and pnpm selected, the following commands passed against the
implementation. The offline frozen install used the already populated local store;
the hosted cold-cache run above separately exercised package downloads.

```bash
node --version
pnpm --version
pnpm config get pmOnFail
pnpm install --frozen-lockfile --offline
pnpm list --recursive --depth -1
pnpm exec turbo --version
pnpm exec turbo ls
pnpm run format
git diff --exit-code HEAD
git diff --check
```

Results: Node `v24.21.0`, pnpm `11.27.1`, `pmOnFail` set to `error`, Turbo `2.11.2`,
and both source-free library packages discovered. Formatting checked 33 maintained
files successfully. No custom executable logic or configuration-testing framework
was added. Lint/typecheck commands remain owned by #13 and #14.

### Cancellation and cleanup

At disposable revision `e2c1eb5`, a temporary 120-second delay held the
[push run](https://github.com/lolmaus/pomeranian/actions/runs/35771224066) and
[both](https://github.com/lolmaus/pomeranian/actions/runs/35771229222)
[PR runs](https://github.com/lolmaus/pomeranian/actions/runs/35771230907) in progress.
Publishing restoration revision `70695df` canceled all three obsolete runs.
Its replacement [push](https://github.com/lolmaus/pomeranian/actions/runs/35771302746)
and [both](https://github.com/lolmaus/pomeranian/actions/runs/35771307592)
[PR runs](https://github.com/lolmaus/pomeranian/actions/runs/35771308006) all passed;
the independent event/ref streams did not cancel one another.

`git diff --exit-code feat/18-github-actions HEAD` in the verification worktree
confirmed its final tree exactly matched implementation revision `5a2c4cb`.
The README defect, manifest mismatch, and delay were all removed. PRs #21 and #22
were closed without merging, the remote verification branch was deleted, and its
clean local worktree and branch were removed. Probe logs stayed outside the
repository. The deliverable contains no probe files, generated output, dependency
directories, or caches.

## Parent acceptance coverage

This slice adds hosted cases 9–12 to the parent's eight existing CLI cases.
The hosted lint/type failure coverage in case 11 arrives with #13 and #14.
The final integrated clean-scaffold and hosted rerun and the complete twelve-case
evidence index remain with the last foundation slice. Existing
[bootstrap](bootstrap.md) and [formatting](formatting.md) evidence remains the
source for their respective behavior.
