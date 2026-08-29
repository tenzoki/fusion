The orchestrator's Writes cell calls four files the root-anchored set, and the prompt writes two more

---
`README-agents.md`, the `orchestrator` row, names "the four root-anchored session files
`orchestrator-live.md`, `orchestrator-events.jsonl`, `agentstate.yaml` and `.active-circle`".
The orchestrator also writes `.session-marker` (`agents/orchestrator.md:637`, `:916`) and
takes and releases `.commit-lock/` (`:398`, `:520`), both root-anchored, both listed as such
in `rules/fusion-workbench-conventions.md` `## fusion-workbench Layout`. The definite article
makes four the whole set, and it is not.
---

## Both sides read

**Documentation side**, `README-agents.md`, the `orchestrator` row's Writes column:

> […] the four root-anchored session files `orchestrator-live.md`,
> `orchestrator-events.jsonl`, `agentstate.yaml` and `.active-circle`; state-marker renames on
> issues, plans and the Circle record; and exactly three parts of the active Circle record

**Artifact side**, `agents/orchestrator.md:637`, at each Turn boundary:

> refresh the active-session marker (`"$FUSION_PLUGIN_ROOT/bin/fusion-session-mark"
> heartbeat` — keeps a parallel `/fusion:setup` from treating this session as stale)

and `:916`, at Phase 4:

> **Clear the active-session marker:** `"$FUSION_PLUGIN_ROOT/bin/fusion-session-mark" clear`.

and `:398` / `:520`, at every commit:

> `"$FUSION_PLUGIN_ROOT/bin/fusion-commit-lock" with orchestrator -- bash -c 'git add … && git commit …'`

The orchestrator's own Setup, `:112`, enumerates six root-anchored surfaces including both:

> `fusion-workbench/agentstate.yaml`, `orchestrator-live.md`, `orchestrator-events.jsonl`,
> `.guard-state/`, `.commit-lock/` and `.session-marker` stay at the workbench root at fixed
> paths

`rules/fusion-workbench-conventions.md` `## fusion-workbench Layout` attributes both to their
writers in the same terms: `.commit-lock/` to `bin/fusion-commit-lock` "created and removed
per commit", `.session-marker` to `bin/fusion-session-mark`.

## The judgement call, stated

Both writes go through a `bin/` helper rather than a `Write` tool call, and `.commit-lock/` is
a lock directory rather than a session file, so a reading on which the cell is defensible
exists. `.session-marker` is harder to place outside the set: it is a root-anchored file, it
holds session state, the orchestrator refreshes it every Turn and clears it at closure, and
`agents/orchestrator.md` calls it "the active-session marker" in both places. The word doing
the damage is "the": an enumeration of four presented as the set, against a layout document
listing six.

This is the enumeration the step's own history record counted to reach "ten write targets"
(`260813-2043-coder-…`, the orchestrator row), so the count rests on it.

## Scope

`README-agents.md` only. The prompt and the conventions file agree with each other.

## Recommended fix direction

Either widen the enumeration to name `.session-marker` (and `.commit-lock/`, if the helper's
writes count), or drop "the four" for a form that does not claim completeness — "root-anchored
session files including …". The second is cheaper and survives the next helper that needs
project-wide state, which the conventions file explicitly warns about ("a count goes stale on
the next helper that needs project-wide state, and this one already had").

Filed by: coderev (review of Circle Turn 3, range `22f892e..8d87192`, commit `8d87192`).

---
Reconciled: 260813-2258-reconciliation.md — Still open, re-verified at HEAD `c0e4219`: `README-agents.md:39` still reads "the four root-anchored session files".
