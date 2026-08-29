# Orchestrator Session — 260802-1827-orchestrator-session.md

**Directive:** A consuming project can permit rule-file writes on purpose, for one session, and see every write that happened only because it did. `FUSION_ALLOW_RULES_WRITE` exempts the project's rule directories and the `retired/` destination inside them, and nothing else; setting it does not turn the guard off and does not clear an active halt; every exempted write emits a `guard_advisory` event and a `clear`-level escalation entry. Alongside the flag, the guard stops sharing one protected-path list across every project on an install: it reads a git-tracked configuration at the project root first, then the plugin's `hooks/config.json`, then the in-code defaults, merging per top-level key. A hardcoded floor keeps the configuration file itself protected regardless of what it says. (Source: `260801-1244-guard-rules-write` `## Directive`; capabilities C5a and C5b of `260801-1122_*_spec-normative-consolidation.md`.)
**Mode:** custom (Circle Directive with a Final spec, no implementation plan yet)
**Status:** In progress

## Setup snapshot

| Item | Value |
|---|---|
| Workspace | `/Users/k1/Projects/productive/fusion` |
| Plugin version | 5.8.0 |
| Git HEAD at start | c7f117b |
| Domain | `code` |
| Active Circle | `260801-1244-guard-rules-write` (activated 260802-1827-orchestrator-session.md) |
| Circle stores | created at Setup — the Circle held only its record |
| Predecessor | `260801-1244-rule-provenance-header`, closed coherent at `060859b` earlier today |
| Dependency | `260801-1244-guard-bash-inspection`, closed. Met. |
| Open issues | 5 shared filed today, 3 left open in the closed predecessor Circle |
| Open decisions | 0 open anywhere; D1 and D2 answered and awaiting realisation, D3 implemented |
| Guard | not halted |
| Plane mirror | activation transition deferred (no `PLANE_API_KEY`); 13 deferred from the prior session |

## Why this Circle carries more risk than the last one

Recorded at Setup so it is not rediscovered mid-session.

**Its acceptance criteria cannot be verified in this repository.** The write guard stands down in the
plugin's own source tree (`hooks/lib/self-detect.ts:18-33`), so an edit to `rules/` here succeeds
with or without the flag. Eleven of the twelve criteria describe behaviour "in a consuming project".
The gap analysis names this as the most likely way the work ships broken.

**A fixture pattern already exists and should be reused rather than reinvented.**
`hooks/lib/__tests__/guard-bash-integration.test.ts` spawns the compiled `dist/guard.js` against a
temporary directory acting as a project root, and the predecessor Circle used it to prove both the
deny path and the plugin-repo stand-down from both sides.

**Two overruns precede this Circle, and the second is the more informative.**
`260801-1244-guard-bash-inspection` ran sixteen commits and three Turns against eight planned steps,
touching the same guard code this Circle touches. `260801-1244-rule-provenance-header` was forecast
as the small bounded in-repo-verifiable case and still ran three Turns and eight commits against a
four-step plan, filed ten review findings, and delivered fourteen non-workbench paths against a plan
that bounded itself to eleven. Playmaker's recommendation is that the plan budget the
consuming-project fixture work as its own step rather than treating verification as a final sweep.

## Open questions the record hands to the planner

1. How `hooks/lib/config.ts` reaches the project root without a circular import. The anchor exists
   (`hooks/lib/workbench-root.ts`); the import direction is the problem.
2. The configuration file format and the resolution order.
3. How `loadConfig`'s cache interacts with two sources.
4. Whether `/fusion:setup` should seed the configuration file in this repository at all, where the
   guard has no effect.

A fifth is user-facing rather than planner-facing: `fusion-guard.json` is a **working name** in the
spec, not a settled one.

## Per-Turn Log

(No Turn started yet.)
