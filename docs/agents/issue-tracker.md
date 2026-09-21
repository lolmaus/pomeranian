# Issue tracker: GitHub

Issues and specs live in GitHub Issues for `lolmaus/pomeranian`. Use the `gh` CLI for tracker operations.

Run commands from this checkout so `gh` infers the repository from the Git remote. Outside the checkout, pass `--repo lolmaus/pomeranian` to issue and PR commands.

## Conventions

- **Create**: `gh issue create --title "..." --body-file <file>`.
- **Read**: `gh issue view <number> --comments`; fetch labels with `gh issue view <number> --json labels`.
- **List**: `gh issue list --state open --json number,title,body,labels,comments`, with appropriate label and state filters.
- **Comment**: `gh issue comment <number> --body-file <file>`.
- **Apply / remove labels**: `gh issue edit <number> --add-label "..."` / `--remove-label "..."`. Use the mapping in `docs/agents/triage-labels.md`.
- **Close**: post any explanation as a comment, then run `gh issue close <number>`.

For multiline bodies, write the exact Markdown to a temporary file and pass it with `--body-file`.

## Pull requests as a triage surface

**PRs as a request surface: no.**

If enabled later, read PRs with `gh pr view <number> --comments` and `gh pr diff <number>`. List external PRs with `gh api --paginate repos/lolmaus/pomeranian/pulls --jq '.[] | select(.author_association == "CONTRIBUTOR" or .author_association == "FIRST_TIME_CONTRIBUTOR" or .author_association == "NONE")'`. Use `gh pr comment`, `gh pr edit`, and `gh pr close` for updates.

GitHub shares one number space across issues and PRs. For an ambiguous reference, try `gh pr view <number>` and fall back to `gh issue view <number>`.

## Skill operations

- **Publish to the issue tracker**: create a GitHub issue.
- **Fetch the relevant ticket**: run `gh issue view <number> --comments` and read its labels.

## Wayfinding operations

Used by `/wayfinder`. The map is a single issue with child issues as tickets.

- **Map**: create an issue labelled `wayfinder:map`, holding Notes / Decisions-so-far / Fog.
- **Child ticket**: link the issue to the map as a GitHub sub-issue using `gh api`. If sub-issues are unavailable, add it to a task list in the map body and put `Part of #<map>` at the top of its body. Apply `wayfinder:<type>` (`research`, `prototype`, `grilling`, or `task`).
- **Blocking**: use native issue dependencies: `gh api --method POST repos/lolmaus/pomeranian/issues/<child>/dependencies/blocked_by -F issue_id=<blocker-db-id>`. Obtain the blocker's numeric database ID with `gh api repos/lolmaus/pomeranian/issues/<blocker> --jq .id`. If dependencies are unavailable, record `Blocked by: #<n>, #<n>` at the top of the child body.
- **Frontier**: inspect the map's open children in map order. Select the first unassigned child with no open blockers. Native `issue_dependencies_summary.blocked_by` counts open blockers; for the fallback, inspect the referenced issues.
- **Claim**: assign the ticket to the driving developer before other writes: `gh issue edit <number> --add-assignee @me`.
- **Resolve**: post the answer as a comment, close the ticket, then append a gist and link to the map's Decisions-so-far.
