Setup takes far too long, and nothing measures it

---
Reported by the user on 260812, alongside the broader observation that all operations take
unbearably long. Setup is the one every session pays before any work begins.

---
**Witness:** the user, directly
**Severity:** medium
**Affected:** `agents/orchestrator.md` Setup, `skills/setup/SKILL.md`, `bin/fusion-rules`

What Setup does today, in order: locate the workbench, rewrite the dashboard, copy the monitor
binary, check the session marker, seed four stylometric profiles and two config templates, read the
interrupted-session state, run `fusion-rules` and `fusion-paths`, **read every emitted rule file**,
read `CLAUDE.md`, run `git log`, count issues and plans across two stores, read the guard state,
run the churn ranking, run the source count, run the domain cascade, count Circles, check the work
queue's ground, create a history file, touch the event log, emit an event, rewrite the dashboard
again.

The rule reading is the largest single item and is measurable: the emission golden puts the
always-on corpus at roughly 115 000 bytes per agent, and Setup reads all of it before the first
task. Everything else is a shell call, but there are more than twenty of them and several shell out
to `git` over the whole repository.

Nothing times any of this. The event log records `session_start` and nothing about what preceded
it, so the complaint cannot currently be answered with a number — which is the first thing to fix.

---
**Reconciliation 260817-1836** (reconciler, domain `code`, HEAD `2552586`; log `260817-1836-reconciliation.md`). One claim corrected, one confirmed. The felt duration is not Setup-s own shell cost, which was measured at 593 ms; it is Setup plus scope resolution plus a human gate wait (`260812-0303-simplify-speed-and-why-rules-do-not-hold.md`). The second half of the title stands unchanged at HEAD: nothing measures it. No Setup-duration timing exists in `agents/orchestrator.md` or in `hooks/`, and no `session_start`-to-scope-resolved interval is derivable from `orchestrator-events.jsonl` today.

---
Resolved: referred (backlog) — Setup's shell cost was measured at 593 ms; a timing of the full Setup, from `session_start` to `scope_resolved`, written into the event log, is the idea; backlog entry to be filed by the user
