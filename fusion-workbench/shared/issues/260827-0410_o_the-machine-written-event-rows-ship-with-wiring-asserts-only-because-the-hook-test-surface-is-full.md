# The machine-written event rows ship with wiring asserts only, because the hook-test surface is full

---
**Filed by:** claude-code (direct session, Phase 1 of `refactor/260827-0335-bookkeeping-cost-repair-plan.md`), Kai Stalmann <ks@qantr.com>
**Cross-references:** `hooks/lib/orchestrator-events.ts` (the emitter) · `hooks/guard.ts` and `hooks/tracker.ts` (its two callers) · `bin/fusion-commit-lock` (the bash emitter of the `commit` row) · `hooks/lib/__tests__/hooks-wiring.test.ts` (the asserts that did fit)

---

## What is missing

v10.8.0 moved `task_start`/`task_done`, the `commit` row and the session-marker heartbeat from prompt mandates to machinery. The behaviour was verified headlessly at build time — synthetic PreToolUse/PostToolUse payloads against a scratch consuming root, and a real `git commit` under `fusion-commit-lock with` — but the repeatable coverage that survived into the suite is the wiring asserts alone (matcher contains `Task`/`Agent`, SessionStart exports identity).

Written, passing, and then removed in the same session: an integration suite of seven cases (dispatch rows with identity/`task`/`session_id`, the `agentstate.yaml` gate, absent-key-never-empty, heartbeat refresh and its negative) and three `fusion-commit-lock` cases (row on landed HEAD, no row without HEAD movement, no row outside a session). They measured 285 lines; the hook-test surface stood at 20,350 of 20,375 lines before them, so they exceeded the growth bound by construction and were cut rather than the baseline edited.

## Why this shape

Same precedent as C4's closure: five of its fixes shipped needing hook-test lines the surface did not have, recorded as open issues for the cut session. The C5 Circle's second capacity ("measure once, cut once") is where the surface gets room; when it does, the cases above are cheap to restate — every behaviour they pin is documented in `hooks/lib/orchestrator-events.ts`'s header and `rules/commit-lock.md` `## The lock writes the commit event`.

## Acceptance

The suite holds integration cases for: one dispatch row per hook with identity fields, the in-flight gate, the absent-key rule, the heartbeat's refresh and both negatives, and the three `fusion-commit-lock` behaviours — inside the growth bound after a cut.

## 2026-08-27 — split at the gate

Landed: the three `fusion-commit-lock` cases, in `hooks/lib/__tests__/fusion-commit-lock.test.ts` (the describe "the machine-written commit row"): a row on landed HEAD carrying hash, subject, identity and session id; no row when the wrapped command left HEAD where it was; no row outside an orchestrator session. 53 lines against a git fixture in the existing throwaway workbench.

Deferred: the seven dispatch cases (one row per hook with identity, `task`, `session_id`; the `agentstate.yaml` gate; absent-key-never-empty; heartbeat refresh and its negative). Reason: the user split step 19 at the gate — the cut freed 240 hook-test lines and the five C4 records took 130 of them, so the dispatch cases wait for the next cut. The marker stays `_o_` for them.

---
Reconciled 260905-2015 (reconciler, HEAD `5b84b13a`): still open, and the split this record recorded
at its gate is exactly where it stands.

`grep -rl task_start hooks/lib/__tests__/` names one file, `fusion-commit-lock.test.ts`, which is the
three cases that landed. None of the seven deferred dispatch cases exists: no test opens
`orchestrator-events.jsonl` for a `task_start`/`task_done` pair written by a hook, none exercises the
`agentstate.yaml` gate, none the absent-key rule, and none the heartbeat's refresh or either negative.
`hooks/lib/__tests__/hooks-wiring.test.ts` still carries the wiring asserts alone.

What has changed since the gate is the room, and it is not room this record can use: the two surface
baselines moved on 260905 at a merge of two in-budget lines (`9f3dfae4`), which is a third
re-baselining event and not a cut. The record's own condition — "inside the growth bound after a cut"
— is unmet, so the deferral holds on its own terms.
