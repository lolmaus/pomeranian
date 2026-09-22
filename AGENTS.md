## Agent skills

### Roadmap

Before choosing, resuming, or reporting feature work, read [ROADMAP.md](ROADMAP.md)
for the approved order, progress, and next-step rules. Update its progress and
work links when a slice advances or completes.

### Issue tracker

Issues and specs live in GitHub Issues for `lolmaus/pomeranian`. Before ticket work, read `docs/agents/issue-tracker.md`.

### Triage labels

Use the five default triage labels. Before triaging or publishing tickets, read `docs/agents/triage-labels.md`.

### Domain docs

Single-context layout: root `CONTEXT.md` and `docs/adr/`. Before exploring the codebase, read `docs/agents/domain.md`.

### Development

Before implementing or reviewing changes, read [docs/agents/development.md](docs/agents/development.md)
for testing, documentation, package conventions, and the installed skills workflow.

### Git workflow

Before starting work, preserve pending changes, switch to local `main`, and run
`git pull --ff-only origin main`. Use a separate worktree if switching would
disrupt ongoing work. Verify local `main` matches `origin/main`; if the pull fails
or local commits remain, report and resolve that condition without discarding
work or publishing unrelated commits. Start new task branches from the refreshed
`origin/main`; preserve existing task branches when resuming work.

Commit changes on a task branch and integrate them through a PR by default.
Before creating or amending a commit, check the current branch. If it is `main`,
create or switch to a task branch while preserving pending changes. A generic
request to commit or push does not authorize committing directly to `main`.

If the author explicitly requests a direct commit to `main`, first warn that it
bypasses the normal PR review workflow, suggest a task branch and PR, and wait
for the author's decision. Proceed on `main` only after the author explicitly
reaffirms that choice following the warning. This override applies to the agreed
work; honor it without repeating the warning or asking again. It does not grant
permission for unrelated future changes.

Authorized PR merges and switching to `main` to pull merged changes do not need
this override.
