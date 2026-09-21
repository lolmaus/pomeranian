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
   For behavior changes, establish a meaningful failing test, implement the
   smallest passing change, then refactor during review. Include meaningful tests
   with code additions in the same PR; prefer colocated `node:test` and
   `node:assert` unit tests where suitable.
3. Include documentation alongside each implemented behavior. Every offered page
   object requires a React demo example and Playwright E2E coverage. The first
   behavior slice establishes that harness as described in the roadmap.
4. Run the applicable checks through the documented workspace commands and record
   executed commands and outcomes in implementation evidence. Use the installed
   [code-review skill](../../.agents/skills/code-review/SKILL.md) before completing
   implementation. Update roadmap progress and work links for the completed slice.

The installed skills live under [.agents/skills/](../../.agents/skills/); preserve
their instructions and use the roadmap to select the appropriate workflow stage.

## Workspace and source conventions

- Declare internal package dependencies with pnpm's `workspace:` protocol.
- Enumerate supported package entry points explicitly in each manifest's
  `exports`; each entry point must resolve to a real supported module. Consumers
  use package identities and exported entry points for shared configurations.
- Keep source modules explicit: `index.ts` barrel files are prohibited.
- Export every type defined by project code. Empty library scaffolds need no
  invented public product exports.
- Keep installed dependencies, generated output, caches, and disposable acceptance
  artifacts outside maintained inputs. Preserve project planning and installed
  skills when adding tools or changing formatting scope.

## Bootstrap acceptance

[Bootstrap #11](https://github.com/lolmaus/pomeranian/issues/11) establishes
installation and source-free core/lib-essential package identities. Its agreed
test seam is the workspace CLI: exercise the documented installation procedure in
an isolated working copy, including intentional version mismatches and frozen
installation checks. Record evidence and remove probes. Any custom executable
logic requires focused automated tests.

[Formatting #12](https://github.com/lolmaus/pomeranian/issues/12),
[core checks #13](https://github.com/lolmaus/pomeranian/issues/13), and
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
