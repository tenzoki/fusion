# Task List

**Generated:** 260716-1920 (by orchestrator, mode `plan`)
**Source plan:** `planning/260716-1910[p]-plan-workbench-umbau-circle-container.md`
**Circle:** 1 of 2 — workbench restructure (Plane integration is Circle 2, deferred)
**Domain:** code

## Queue

| # | ID | Summary | Executor | Depends on | Gate | Status |
|---|----|---------|----------|-----------|------|--------|
| 1 | P-1 | Rewrite `rules/fusion-workbench-conventions.md`: target layout, origin rule, path-resolution section | coder | — | — | [x] `6d4a88d` |
| 2 | P-2 | New `bin/fusion-paths <agent>` + vitest unit tests (5 cases) | coder | P-1 | — | [x] `114103f` |
| 3 | P-3 | `/fusion:setup`: create new structure + idempotent migration step | coder | P-1, P-2 | — | [x] `138cd46` |
| 4 | P-4 | Structure skills: archive, circle-stash, circle-pop, next, direct | coder | P-3 | — | [x] `fd21ea6` |
| 5 | P-5 | Orchestrator prompt (53 path mentions) | coder | P-3 | — | [x] `d803c1e` |
| 6 | P-6 | The other 14 agent prompts | coder | P-2 | — | [x] `1d97c86` |
| 7 | P-7 | The other 6 skills | coder | P-2 | — | [x] `b9dd6a8` |
| 8 | P-8 | Path-lint gate (vitest) — forbids type-folder literals | coder | P-4, P-5, P-6, P-7 | — | [x] `603ce62` |
| 9 | P-9 | Dogfood: migrate THIS workbench + create this Circle's directory | coder | P-8 | **GATE** | [deferred] user chose next-session |
| 10 | P-10 | End-to-end run: observe hooks, dashboard, commit lock, both stores | coder | P-9 | — | [deferred] next session |
| 11 | P-11 | Version 4.0.0, CLAUDE.md, distribution | coder | P-10 | — | [x] `cb5fa80` |

## Gate rationale

**P-9** is flagged as a human gate. It restructures the live workbench of the running session — the destructive-operation criterion applies. Specific hazard to surface at the gate: this session's own history file lives in `history/`, which the migration moves to `shared/history/`. The four hook-read root files (`orchestrator-live.md`, `orchestrator-events.jsonl`, `agentstate.yaml`, `.guard-state/`) stay in place by design, so the dashboard and tracker survive; the session history file does not, and the orchestrator must re-anchor to its new path afterwards.

## Turn plan

- **Turn 1:** P-1, P-2, P-3 (the foundation; P-3 is the bottleneck — nothing is verifiable before it)
- **Turn 2:** P-4, P-5, P-6, P-7 (independent; ordered by risk, real path logic before pure prose)
- **Turn 3:** P-8, P-9 (gate), P-10
- **Turn 4:** P-11
- Reserve: 1 Turn

## Turn 1 outcome

Foundation landed: the layout contract (`6d4a88d`), the resolver (`114103f`), setup + migration (`138cd46`). 110 hooks tests green, plugin validate passed.

The three tasks surfaced five real errors in the plan, all fixed at execution and recorded as corrections in the plan's `## Approach`:
- P-1: the `shared/` tree omitted `planning/` and `reviews/`, contradicting step 3 and the "no active Circle → shared" invariant.
- P-3: directory-level `git mv` would have nested (`shared/planning/planning/`); the `plugin_version` detector was dead on arrival; `memos/` was missing from the migration mapping.

Two items filed, neither blocking: the resolver's argument namespace (`decisions/260716-1940[o]-fusion-paths-argument-namespace…`, must land before P-7) and a stale gitignore line (`issues/260716-1940[o]-stale-bin-fu…`).

## Notes

- Every step routes to `coder`. No ontology or structured data in this repo, so `ontocoder` is not needed.
- Binding decisions: D2 (`260716-1847[a]-workbench-struktur…`), D4 (`260716-1847[a]-zuschnitt…`), D1 (`260716-1847[a]-plane-rolle…`, constraint only), marker placement (`260716-1910[a]-circle-marker…`).
- Confirmed at the plan gate: marker sits on `[m]-circle.md` inside a stable directory; shared store is named `shared/`.
- Still open, does not block: D3 offline behaviour (`260716-1847[o]-offline-verhalten-bei-plane-ausfall.md`) — belongs to Circle 2.
- Pre-existing, unrelated to this Circle: `issues/260707-1006[o]-pin-bash-allow-path-no-writeguard-side-effects-with-test.md`.
