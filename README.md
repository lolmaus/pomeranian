# Pomeranian

Pomeranian describes applications through groups and nested page objects so tests
can express interactions in the application's own vocabulary. Its intended
direction is Playwright Test; product behavior is being developed in the order
approved by the project author.

The workspace provides reproducible installation, repository formatting, and
shared linting and TypeScript checks for `@pomeranian/core`,
`@pomeranian/lib-essential`, and their tooling.
GitHub Actions requires formatting, linting, typechecking, a documentation build,
and the Node 22/Chromium behavior suite before merging. The private VitePress application provides local
development, build, and preview commands for the authored documentation.
Successful main-branch CI deploys the site to GitHub Pages.
`@pomeranian/lib-essential/element-po` provides `Element_PO` for direct Playwright
Test use: create it before navigation, click its target, and check text with
`shouldHaveText` or `shouldNotHaveText`. See the [Element_PO guide](docs/site/guide/element-po.md)
for the complete counter example, names, options, and raw Playwright access.
The libraries remain private workspace packages; no npm release is available.
Core retains its empty scaffold while the first behavior lives in lib-essential.

- [Contributing](CONTRIBUTING.md): prerequisites, installation, and available commands.
- [Documentation](docs/site/index.md): behavior guides; see the
  [authoring workflow](CONTRIBUTING.md#documentation-workspace) for local preview.
- [Feature roadmap](ROADMAP.md): approved order, current progress, and work links.
- [Domain context](CONTEXT.md): project language and glossary.
- [Agent guidance](AGENTS.md): required context and contribution workflow.
- [Installed skills workflow](ROADMAP.md#workflow-using-the-installed-skills):
  specification, ticket review, implementation, and code review.
- [Issue tracker conventions](docs/agents/issue-tracker.md): GitHub issues and specs.
- [Bootstrap verification](docs/verification/bootstrap.md): repeatable acceptance
  procedure and executed checks for the initial workspace.
- [Formatting verification](docs/verification/formatting.md): repository scope,
  failure/fix checks, and preservation of excluded inputs.
- [Core-check verification](docs/verification/core-checks-extension.md): typed and
  framework linting, five TypeScript environments, editor discovery, safe fixes,
  cache invalidation, and hosted failure checks.
- [Lib-essential verification](docs/verification/lib-essential-checks.md): independent
  consumer checks and the [foundation evidence index](docs/verification/foundation-index.md).
- [Continuous integration](CONTRIBUTING.md#continuous-integration): workflow
  triggers, dependency caching, required merge checks, and action updates.
- [CI verification](docs/verification/ci.md): repeatable hosted acceptance
  procedure and verification record.

Package publication and release timing remain under the author's control.
