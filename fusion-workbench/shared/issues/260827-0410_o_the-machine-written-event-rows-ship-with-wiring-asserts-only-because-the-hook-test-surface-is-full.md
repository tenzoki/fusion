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
