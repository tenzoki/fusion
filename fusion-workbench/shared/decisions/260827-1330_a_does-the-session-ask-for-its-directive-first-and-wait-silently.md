# Does the session ask for its Directive first, and wait silently?

---
**Domain:** code
**Filed by:** claude-code (UX round, findings 3 and 4 of the 260827 UX review), Kai Stalmann <ks@qantr.com>
**Cross-references:** `agents/orchestrator.md` Setup step 1b, steps 6–8, and the backgrounded-dispatch line before `## Agent Routing Table` (the three realisations) · `260827-1310_*_does-the-coherence-gate-ask-when-its-own-verdict-is-ok.md` and `260827-1311_*_where-in-the-cleanup-pipeline-does-the-one-gate-stand.md_*` (the same round's first two findings)

---

## Question and answer (260827, user: "mach 3 und 4 zuerst")

**Finding 3 — the session start demanded investment before value.** Two of the log's last three orchestrator sessions were Setup-only: full ceremony (history file, `session_start`, snapshot prose) describing no work. Answered in two moves: **Directive-first** — the one input only the user can give is secured at step 1b, before the expensive steps, with "setup only" as an explicit, complete answer (a first message that already carries work asks nothing; a resumed session inherits and skips) — and **deferred ceremony**: steps 6–8 run only once a Directive exists, and run the moment one arrives. This also closes plan item 3.4. The census-memoisation half of the original finding was examined and dropped: Setup's cost driver is context reading, not the snapshot commands, so a cache there would buy seconds and add a state file.

**Finding 4 — waits were silent.** A backgrounded dispatch (an 11-minute bugfixer in the user's own session) left the chat with nothing but the launch. Now one line at launch — who runs, on what, started when, the monitor has the ETA, what proceeds meanwhile — and nothing repeated while waiting; a user message during the wait is answered, not met with a restated wait.

Neither change touches `/fusion:setup` (the explicit command keeps its own contract) nor any event semantics: `session_start` still means what it meant, it just no longer fires for a session that never got work.
