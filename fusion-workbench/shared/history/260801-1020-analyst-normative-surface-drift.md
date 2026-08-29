# Analyst session: normative-surface drift gap analysis

**Date:** 2026-08-01 10:20
**Agent:** analyst
**Status:** Complete
**Dispatched by:** orchestrator
**Domain:** code

## Task

Gap analysis, read-only, on the fusion plugin's own source. The user proposed a new specialised agent to consolidate three drifting normative surfaces: decision records, rule files, and `CLAUDE.md`. Four questions: what already covers this, what the genuine gap is, whether the write-permission model would allow such an agent to act, and whether the retained history is rich enough to justify a prune on historical grounds.

## What was read

Sixteen plugin files in full (`agents/reconciler.md`, `agents/consultant.md`, `agents/investigator.md`, four skill bodies, five rule files, `bin/fusion-rules`, and the guard's TypeScript plus its shipped `config.json` and `settings.json`), plus the workbench's own five Circle records, six shared decisions, 31 history files and the 500-plus-line event log as evidence of what a running project retains.

## Findings, in brief

Fusion covers each of the three surfaces' *state* and *bulk* and covers none of their *mutual consistency*. The reconciler advances decision markers and checks decisions against one session's Directive. `/fusion:revise-claude-md` prunes `CLAUDE.md` on a two-day git horizon and never opens the workbench. `/fusion:archive` moves terminal-marker files out. The context manifest scopes what loads without judging what is true. No surface compares two of the three surfaces to each other, and rule files have no lifecycle at all: no marker, no supersession, no retirement path.

The decisive constraint is permission. `rules/**` is guard-protected in every consuming project, the block is at the tool layer so a skill does not route around it, and the hook payload carries no agent identity, so a per-agent exemption is not implementable today. The guard stands down in fusion's own repo, which makes local testing of any such capability unrepresentative. `CLAUDE.md` is deliberately unprotected, which is why the revise skill works.

History grounding is sufficient for decisions and Circles, adequate-with-git for `CLAUDE.md` and fusion's own rule files, and thin for a consuming project's rule files. Five specific thin spots documented, of which the sharpest is that no `SCAN_*` key resolves into the archive store, so the record set shrinks as the project's history grows.

Recommendation: do not build an agent that consolidates all three surfaces. The missing piece is one detector, not a fourth applier.

## Artifacts produced

Analysis report:
- `260801-1020-normative-surface-drift-gap-analysis.md`

Issues filed (4):
- `260801-1020_*_workbench-untracked-breaks-archive-durability-premise.md`
- `260801-1020_*_guard-protects-rules-but-not-claude-rules.md`
- `260801-1020_*_scan-keys-never-reach-the-archive-store.md`
- `260801-1020_*_plane-mirror-circle-closed-with-empty-turn-log.md`

Decision records filed (3):
- `260801-1020_*_where-does-normative-consistency-live.md`
- `260801-1020_*_may-any-fusion-writer-touch-rules.md`
- `260801-1020_*_provenance-header-on-rule-files.md`

## Notes

No Circle was active, so every artifact resolved to the shared store per the Origin Rule's first corollary. Both stilwerk voice profiles were present and loaded (`chat-voice-en.yaml`, `default-voice-en.yaml`); no fallback was needed.

The report carries one Mermaid coverage map. It was run through the coherence self-check in `rules/design-diagrams.md` before finalising: eleven nodes, eleven solid edges, no cycles, no orphans, clean top-down layering. A `conceptrev` pass on it has not been requested.
