# Development guidance

Read [CONTRIBUTING.md](../../CONTRIBUTING.md) for prerequisites, installation, and
available verification commands. [README.md](../../README.md) introduces the
repository. Use the vocabulary in [CONTEXT.md](../../CONTEXT.md): an **author**
maintains Pomeranian, while a **developer** uses it to write application tests.

## Implementing a slice

1. Follow the [roadmap workflow](../../ROADMAP.md#workflow-using-the-installed-skills)
   and [tracker conventions](issue-tracker.md). Read the approved ticket, its
   parent specification, and dependencies before implementing its scope.
2. Use the installed [implement skill](../../.agents/skills/implement/SKILL.md)
   and [TDD skill](../../.agents/skills/tdd/SKILL.md) at the agreed test seams.
   Follow the shared [testing and documentation requirements](../../CONTRIBUTING.md#tests-and-documentation).
3. Run the applicable checks through the documented workspace commands and record
   executed commands and outcomes in implementation evidence. Use the installed
   [code-review skill](../../.agents/skills/code-review/SKILL.md) before completing
   implementation. Update roadmap progress and work links for the completed slice.

The installed skills live under [.agents/skills/](../../.agents/skills/); preserve
their instructions and use the roadmap to select the appropriate workflow stage.

## Workspace and source conventions

Follow the shared [package and source conventions](../../CONTRIBUTING.md#workspace-layout-and-adding-packages)
and [formatting scope](../../CONTRIBUTING.md#formatting-scope). Preserve existing
planning material and installed skills when adding tools or changing scope.

## Bootstrap acceptance

[Bootstrap #11](https://github.com/lolmaus/pomeranian/issues/11) establishes
installation and source-free core/lib-essential package identities. Its agreed
test seam is the workspace CLI: exercise the documented installation procedure in
an isolated working copy, including intentional version mismatches and frozen
installation checks. Record evidence and remove probes. Any custom executable
logic requires focused automated tests.

Run `pnpm run format` before completing a change; use `pnpm run format:fix`
to correct formatting and review the resulting diff. Follow the
[documented scope](../../CONTRIBUTING.md#formatting-scope) and
[formatting acceptance procedure](../verification/formatting.md) when changing
the formatter or its exclusions.

[Core checks #13](https://github.com/lolmaus/pomeranian/issues/13) and
[lib-essential checks #14](https://github.com/lolmaus/pomeranian/issues/14) add
their respective tooling and source inputs. Run the commands actually available
at the implemented stage; add source inputs together with genuine lint/typecheck
commands in those tickets. Browser infrastructure arrives with behavior coverage,
not installation acceptance.

## Scope and releases

Implement only the approved slice. Product APIs, distribution formats, and later
roadmap applications need their own decisions. The author controls release
milestones and publication; successful local validation or a completed feature
does not authorize a release.
