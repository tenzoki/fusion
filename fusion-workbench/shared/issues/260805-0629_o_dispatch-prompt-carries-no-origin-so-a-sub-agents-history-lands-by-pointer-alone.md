# The dispatch prompt carries no origin, so a sub-agent's history lands by pointer alone

**Filed:** 260805-0629
**Severity:** Medium
**Domain:** code
**Filed by:** consultant (from an orchestrator session note in a consuming project)
**Scope:** `agents/orchestrator.md` Step 3a step 4, `rules/fusion-workbench-conventions.md` `## Origin Rule (Herkunftsregel)`

---

The orchestrator's dispatch prompt names four things, and origin is not one of them. A
dispatched agent therefore cannot apply the Origin Rule; it can only take whatever
`.active-circle` happens to say. When the task did not arise from the active Directive, the
agent's history file lands in the Circle anyway, and nothing announces it.

---

## Problem

`agents/orchestrator.md:329-333` enumerates exactly what the executor dispatch prompt
carries:

- what to do (task summary plus detail from the source file),
- which files to touch,
- what the acceptance criteria are,
- a reference to the source plan or issue file.

Nothing states which Directive the task arose from, or whether it arose from one at all.
There is no parameter line for it, although the dispatch-prompt parameter mechanism already
exists and is used for four other values: `**Domain:**` (`agents/orchestrator.md:268,443`),
`**Executors:**` (`:253`), `**Mode:**` and `**Circle file:**` (`agents/shaper.md:47`), and
`**Parent task:**` (`agents/shaper.md:45`).

The Origin Rule leaves exactly one judgment to the writing agent
(`rules/fusion-workbench-conventions.md:497`): "did this arise from the active Directive, or
did you merely find it nearby? If the latter, file it in the shared store even while a
Circle is active." A dispatched sub-agent is a cold start with no memory of the session. It
knows only the four bullets above, and none of them answers that question.

Meanwhile `bin/fusion-paths` resolves `OUT_HISTORY` mechanically from `.active-circle`
(`rules/fusion-workbench-conventions.md:134,157`). With a Circle active, every dispatched
agent's history store is the Circle's, regardless of what the task was actually about. The
resolution is correct as specified and still semantically wrong whenever the task did not
come from the Directive.

## Impact

Reported by the orchestrator of the consuming session: "ein Agent wurde ohne
Herkunftshinweis losgeschickt und legte sein Protokoll im falschen Store ab." The session
protocol recording it lives in that project and is not reachable from this repository, so
the specific misfiling is reported rather than checked here. The prompt-level gap it names
is checked, and is cited above.

A misfiled history is quiet. Nothing validates the store a history file landed in, and the
two consumers that follow history — the orchestrator's own resume and `/fusion:cadence`'s
session scan — read whatever is in the directories `$SCAN_HISTORY` names. A history in the
wrong store is still found by a scan (both stores are always scanned, invariant 2 at
`rules/fusion-workbench-conventions.md:158`), so the damage is not a lost file. The damage
is that the Circle's record of what it produced now includes work it did not produce, which
is the attribution the container layout exists to keep straight.

## What a fix has to do

Reuse the parameter mechanism that already carries `**Domain:**` rather than inventing a
second one. The dispatch prompt should state the task's origin explicitly, so the executor
has the fact instead of a guess, and the orchestrator, which does know why it dispatched, is
the party that supplies it.

Two things need deciding and are not settled here:

1. Whether the origin statement is advisory (the agent still resolves through
   `bin/fusion-paths`) or binding (the agent overrides the resolved `OUT_HISTORY` when told
   the task is not Circle-work). The second is the larger change, because it puts a store
   decision back into a prompt after v4.0.0 deliberately took it out.
2. Whether history is even the right artifact to move. A sub-agent's history records a
   dispatch that the orchestrator made during this Circle's session, which is arguably
   Circle-work regardless of what the task was about. If that reading holds, the defect is
   not the placement but the absence of a stated origin, and only issues and decisions need
   the routing.

Both are choice points. If the fix goes past the advisory form, they belong in a decision
record.

## Cross-references

- `agents/orchestrator.md:326-333` — the dispatch step and its four-bullet prompt.
- `agents/orchestrator.md:334-336` — Step 3a step 5 verifies file scope on return, nothing
  about where the agent wrote its history.
- `rules/fusion-workbench-conventions.md:70-85` — the Origin Rule and its two corollaries.
- `rules/fusion-workbench-conventions.md:497` — the one judgment left to the writing agent.
- `rules/fusion-workbench-conventions.md:164-185` — key sets are derived from the prompt, so
  an origin-aware write target would be a prompt change, not a resolver change.

---
**Reconciliation 260817-1836** (reconciler, domain `code`). Re-verified reproducible at HEAD `2552586`: `agents/orchestrator.md:489-492` still lists the same four dispatch-prompt bullets with no origin or Directive line, and no decision answers the two choice points the record names. Marker stays open. Log: `shared/history/260817-1836-reconciliation.md`.
