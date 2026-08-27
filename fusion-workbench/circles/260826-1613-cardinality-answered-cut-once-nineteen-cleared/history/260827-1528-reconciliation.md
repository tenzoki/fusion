# Reconciliation — 260827-1528

**Session:** end-of-session pass dispatched by /fusion:cleanup (session `260827-1521-orchestrator-session.md`). Domain: code. Turn count: unavailable (`bin/fusion-events turns` exit 3: `agentstate.yaml` absent, which is normal at this point of the pipeline).

**Delta bound:** `bin/fusion-cadence-anchor changed-files last_reconcile_commit` returned exit 4 (no mark yet), so the delta was derived from git instead: workbench files touched since the last reconciliation (260825-1430), plus every live-marker record in `$SCAN_ISSUES`, `$SCAN_PLANS`, `$SCAN_DECISIONS`.

## Scope of the pass

- Plans/specs reviewed: 1 (the one open spec). Updated: 0.
- Issues reviewed: 21 open at start (4 in the active Circle, 17 in `shared/`). Updated: 7 (2 closed, 5 evidence appends). Open after the pass: 19.
- Decisions reviewed: 5 open (`_o_`, all `shared/`). Updated: 0 — all still unanswered (see below).
- Reviews: 1 in the active Circle (`260826-1858-coderev-…`). No annotation: none of its findings is resolved.

## Markers moved

1. `shared/issues/260826-1315_*_the-closure-note-claims-every-code-commit-was-reviewed-and-one-was-not.md` → `_c_`. Its close condition was a review pass over `e66f7d5`, and that pass exists: `circles/260825-2023-presence-travels-monitor-filters-own-checkout/reviews/260826-1330-coderev-the-last-uncovered-commit.md:3` declares `**Reviewed-range:** 7774d56..e66f7d5` (landed in `3f62a7d`).
2. `shared/issues/260826-1331_*_npm-test-is-red-at-head-on-a-one-word-slug-drift-…md` → `_c_`. Commit `3f62a7d` fixed the slug on line 59 of `shared/issues/260826-1305_o_…md`; re-measured this pass: `workbench-citation-lint.test.ts` 10/10 green. This is the retake-at-activation measurement the active Circle's Grounding constraint asked for.

Both were among the nineteen records the active Circle inherits (Grounding items 16 and 18). **The Circle's open inheritance is now seventeen.** The Circle record itself was not edited (outside reconciler scope; its enumerated list is a snapshot, and the closures are progress the planner will read off the markers).

## Verified still open, evidence appended

- The 4 active-Circle issues (`260826-1815`, `-1901`, `-1902`, `-1903`): none resolved by any commit since filing. `git log --since="2026-08-26 14:00" -- agents/playmaker.md` is empty; the false claim stands at `_t_circle.md` `## Activation proposal` ¶3, `portfolio.md:30/43/138`, and `shared/history/260826-1705-playmaker-direct-dispatch.md:46`. One append each.
- `shared/issues/260825-1430_*_the-event-log-froze-at-turn-2-…md`: partially repaired by v10.8.0 (machine-written `task_start`/`task_done` in the hooks, `commit` row in `bin/fusion-commit-lock`; `turn_*` rows still prompt-emitted per `hooks/lib/orchestrator-events.ts:28`). Evidence appended; stays `_o_`.

## Verified still open, no append (evidence held here)

Per-record appends were kept to material changes; the bookkeeping-cost audit (memory note 260827) names record growth as the dominant overhead, and these verifications change nothing about the records' state.

- `260825-1456_*_three-shipped-surfaces-say-the-retired-configuration-key-set-is-three…`: still true. `fusion.json:9`, `templates/fusion.json:8` and `agents/orchestrator.md:114` each still name three keys (`guard`, `decisions`, `escalation`); `hooks/lib/config.ts:349` holds four (`churn` since 260824).
- `260826-1332_*_the-layout-trees-consumer-column-omits-the-event-log-reader…`: still true. `rules/fusion-workbench-conventions.md` layout tree, `orchestrator-events.jsonl` line, names `bin/monitor, hooks/lib/staging-drift.ts` and not `bin/fusion-events`.
- `260825-1259_*_the-rebalance-gate-mandates-four-options-and-the-output-rule-caps-a-gate-at-three`: still true. `rules/user-facing-output.md:56` caps a gate at three options; the Rebalance gate's four options survived the 260827-1210 partition into `rules/orchestrator-rebalance.md`.
- `260825-1440_*_the-archive-safety-filter-checks-only-claude-md…`: still true. `skills/archive/SKILL.md:117,190,286` — the hard exclusion still greps `CLAUDE.md` alone.
- `260826-1305`, `260826-1330`, `260826-1445`, `260825-1019`, the three `260825-1250_*` records, `260825-1329`, `260827-0315`, `260827-0410`: subjects unchanged; the last two were filed within the last 24 hours and committed this session (`9ef8e35`).

## Decisions

The 5 open (`_o_`) shared decisions stay open. Searched: the 260827 decision wave (10 `_a_` records filed today), today's histories, and `$SCAN_ANALYSES` — no recorded answer for `260822-1154` (both), `260823-1414`, or `260825-1456` (register repair). `260827-1305_*_which-agents-run-on-a-smaller-model` was deliberately filed open today (`64d2ba3`); no answer search is meaningful yet.

Active Grounding measured this pass: 35 records (5 `_o_` + 30 `_a_`, all `shared/`; the active Circle's decision store is empty), counted by `ls shared/decisions/*_o_*.md *_a_*.md | wc -l`.

## Spec

`shared/planning/260822-1136_o_spec-fusion-becomes-a-multi-user-tool.md`: header `**Status:** Partially Complete` matches ground truth (C4 delivered and closed bounded; capabilities beyond it unbuilt). Marker `_o_` kept: no agent is actively working it. Its tail already carries the 260825 reconciliation section; nothing new to add.

## Flagged, not changed

- The false scan-set claim in the **active** Circle record and the append-only history log (issues `260826-1815`/`-1903`): a reasoning input every dispatched agent reads. Fix direction is on the records; outside reconciler scope.
- The Circle record's Grounding enumerates nineteen inherited records; two are now `_c_`. The planner should read the markers, not the list's length, when sizing capacity 3.
- `bin/fusion-cadence-anchor` has no `last_reconcile_commit` mark yet; `/fusion:cleanup` Step 3 (per its contract) sets it after this pass.
