# Reconciliation — 260824-2159

**Domain:** code
**Range:** `571f945..5ad6185` (24 commits, HEAD `5ad6185`), Circle `260824-1853-close-every-open-defect`
**Directive:** plan `## Directive`, read from `circles/260824-1853-close-every-open-defect/planning/260824-1905_*_plan-close-every-open-defect.md`
**Session file:** `shared/history/260824-1750-orchestrator-session.md` (`## Coherence` appended there)

## Counts

- Plans reviewed: 7 (1 in the Circle, 6 in `shared/planning/`). Updated: 1, the Circle's plan, `_p_` → `_c_`, steps 11 and 12 re-marked, `## Reconciliation Log` added. The multi-user spec `shared/planning/260822-1136_o_*` stays `_o_`, `Partially Complete`: C1 to C3 unreversed, C4 open with three referrals pointing at it.
- Issues reviewed: 250 closed in the range (220 renamed, 30 filed and closed), 0 open anywhere outside `archive/`. Updated: 0; every closure verified stands.
- Decisions reviewed: 8 `_o_` in the Circle, 21 active in `shared/decisions/`. Updated: 0. The three `_a_` → `_i_` moves in `8475c28` each carry an `Implemented:` line.
- Reviews: 5 files in the Circle's `reviews/`, each annotated with one `Reconciled:` line naming the closing commit and records.
- Circle record `_t_circle.md`: head fields consistent (the `**Active spec/plan:**` citation is wildcarded and survives the rename); `## Turn log` empty, which is the orchestrator's Phase 4 write, not a drift.

## Ground truth re-measured

- `find fusion-workbench -path '*/issues/*' -name '*_[op]_*' -not -path '*/archive/*'`: empty.
- `cd hooks && npm test`: 43 files, 760 tests, exit 0.
- `git diff 2cdd372 5ad6185` on the two bound tests: one comment citation wildcarded, no baseline entry moved.
- `Resolved:` first words over the 250: fixed 190, referred 34, moot 21, unfixable 3. Every `referred` path resolves (26 distinct targets, incl. the 8 new decisions, 2 backlog entries, spec `### C4`).
- C1 to C3 files in the range: `.gitattributes` untouched; `rules/workbench-tracking.md` row R3 (plan row 201); `bin/fusion-identity` no-`git` branch (row 214); conventions exit 5 (row 217).
- `bin/fusion-review-coverage`: uncovered `1eb7ef6`, `2acb9f8`, `3b0dc93`, `5ad6185`, as the dispatch states.
- Turn count from `orchestrator-events.jsonl` since this session's `session_start`: 3.

## Discrepancies

1. Plan steps 11 and 12 carried `[DONE]` after the title instead of before it. Corrected.
2. Two umbrella closures carry `**Resolved: fixed**` in bold at line 41 and line 32 rather than the convention's bare `Resolved:` at column one, so a `grep '^Resolved:'` count under-reads by two. The closures are valid; left as they are and stated here rather than filed, since the `Resolved:` note itself is not to be rewritten.
3. Fourteen files in the Circle cite the plan by its `_p_` spelling. Point-in-time citations carried by their commits; the three citation gates are green after the rename (58 tests).

## Misfiled — should be a decision

None found.

## New issues filed

None. Nothing needs a code or data change.

## Coherence

Verdict `coherent`, recommendation `none`; the three edge lines are in the session file's `## Coherence`.
