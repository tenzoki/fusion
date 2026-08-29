# Setup step 6 tells a resumed session to create a history file that step 1 tells it not to create

---

**Severity:** Low — two steps of one Setup give opposite instructions on the resume branch
**Domain:** code
**Filed by:** coderev (review of `e3da397..a6b4928`, Turn 5)
**Affects:** `agents/orchestrator.md:215` (step 6), `agents/orchestrator.md:100` (step 1's new paragraph)

---

## What is wrong

`e61e24a` added, at `agents/orchestrator.md:100`:

> Do not create a second history file — a session keeps one for its whole life

Setup step 6, at `:215`, was not qualified and still reads as an unconditional imperative:

> **Create history file:** `$OUT_HISTORY/YYMMDD-HHMM-orchestrator-session.md` … obtain the timestamp from `date +%y%m%d-%H%M`

Setup's numbered steps run after step 1 resolves ("Remaining setup (after step 1 is resolved): …"), on the resume branch as on the fresh one. An orchestrator following the list literally creates a second history file at a new stamp, which `:100` forbids.

## What this does not break, and why the record is still filed

The anchor mechanism `e61e24a` installed survives it. Step 8's prose at `:227` instructs the resume explicitly — "A resumed session emits this line too … and puts the *same* path in it" — and `sessionAnchor` case 1 (`hooks/lib/state-drift.ts:324`) takes the **first** `session_start` naming `session.history_file`, so even a stray second file and a mis-emitted second path would still leave the first line matching. The drift row is not at risk. What is at risk is a session that writes its Turn log into a file `agentstate.yaml` does not name, which is the dangling-anchor failure row 3 of the drift check exists for (`:1131`).

Step 8 is where the obligation was written, and step 8 is the emission, not the creation. Step 6 is the creation.

## Fix direction

Qualify `:215`: create the file on the fresh and Restart branches; on **Continue**, read `session.history_file` from `agentstate.yaml` and use that path, per **What a resumed session inherits**. One clause.

## Acceptance criteria

- No Setup step instructs a resumed session to create a history file.
- `skills/setup/SKILL.md` Step 4 carries the same qualification or cites the orchestrator's step for it.

---
**Reconciliation 260817-1836** (reconciler, domain `code`). Re-verified reproducible at HEAD `2552586`: `agents/orchestrator.md:206` still says create the history file unconditionally while `:100` still says a session keeps one for its whole life. The tension is unedited. Marker stays open. Log: `260817-1836-reconciliation.md`.

---
Resolved: fixed — Setup step 6 creates the history file on fresh and Restart only, and on Continue reads `session.history_file`; agents/orchestrator.md:214
