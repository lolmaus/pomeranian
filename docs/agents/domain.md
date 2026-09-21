# Domain Docs

This repository uses a single-context layout.

## Before exploring the codebase

- Read `CONTEXT.md` at the repository root for domain terms.
- Read ADRs under root `docs/adr/` that concern the area being explored.

If these documents do not exist, proceed silently. `/domain-modeling` creates them lazily as terms and decisions are resolved.

## File layout

- `CONTEXT.md`: the repository's domain context and glossary.
- `docs/adr/NNNN-<decision-slug>.md`: architectural decisions.

## Use the glossary's vocabulary

Use terms as defined in `CONTEXT.md` in issue titles, proposals, hypotheses, and tests. If a needed concept is missing, reconsider whether it belongs to the domain or note the gap for `/domain-modeling`.

## Flag ADR conflicts

If a proposal contradicts an existing ADR, identify that ADR and explain why its decision should be revisited.
