Reviewer `06a-claude` part has no `prior` counterpart, so an entry run drops the placement finding
---
`catalog/profiles/reviewer/parts/06a-claude.md` carries code review standard 9's second half, the CLAUDE.md placement finding. No `06a-prior.md` exists, so the Prior render has no such sentence. A repair run need not have it; an entry run applies fusion's review standards in full and does. Severity: Low.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Domain:** code
**Executor:** code-implementer
**Cross-references:** 261025-1117-reviewer-closing-review-of-prior-handover-b-agent-profiles.md

## Defect

`catalog/profiles/reviewer/profile.json` lists `parts/06-neutral.md`, `parts/06a-claude.md`, `parts/06b-neutral.md` with no `prior` part between them. `06a-claude.md`: "A drifted `CLAUDE.md` fact on one file or function is a **placement** finding: move it where `rules/fusion-workbench-conventions.md` `## A project's CLAUDE.md` says, leaving one pointer line, not a rewrite. The issue names where; a source header is code-implementer's, else the user's curate run." Commit `5544cfca` names the gap as open and adds nothing. Every claude part of the eight new profiles has a prior part (reviewer's tiling script, `rv_tile.py`).

## Fix direction

Add `06a-prior.md` stating the same rule for an entry run (with "the curate entry" for the curate run and `CLAUDE.md` read as the project context's file) and nothing for a repair run, and list it in `profile.json`.

## Acceptance

- `profile.json` lists a `prior` part after `06a-claude.md`; the Prior render of `reviewer` carries the placement sentence for entry runs.
- `cd catalog && npm test` exits 0; the Claude render diff is empty.
