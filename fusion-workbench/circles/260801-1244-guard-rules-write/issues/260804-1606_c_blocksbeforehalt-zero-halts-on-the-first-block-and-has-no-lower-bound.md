# `blocksBeforeHalt: 0` in a project config halts on the first block, and the value has no lower bound

---

**Severity:** Low
**Domain:** code
**Filed by:** analyst, independent assessment A1 of C5b
**Affects:** `hooks/lib/config.ts:305-308` (`escalation.blocksBeforeHalt`, taken from the project layer with no range check); the halt comparison in `hooks/lib/escalation.ts`
**Cross-references:**
`circles/260801-1244-guard-rules-write/analyses/260804-1600-c5b-independent-assessment.md` `### Two smaller things`,
`circles/260801-1244-guard-rules-write/issues/260804-1603_o_...md` (the same absence of validation, on a different key)

---

## What is wrong

C5b makes `escalation.blocksBeforeHalt` settable from a project file. Nothing bounds the
value. `0` makes the halt fire on the first denied tool call, before the agent has had the
second and third chances the three-block design exists to give it.

## Measured

Same harness, throwaway consuming project, `fusion-guard.json` = `{"escalation":{"blocksBeforeHalt":0}}`.
One denied `Edit agents/coder.md`, then `escalation.json`:

```
  haltActive: true
  consecutiveBlocks: 1
  recentEvents: [ {level:"block", trigger:"protected_path"},
                  {level:"halt",  trigger:"consecutive_blocks",
                   message:"1 consecutive tool calls blocked — halt activated"} ]
```

The very next call, on either surface, returns the `[HALTED]` reason and the user has to run
`clear-halt.js`. The halt message says "after repeated violations" and there was one.

The opposite end has no bound either: `{"escalation":{"blocksBeforeHalt":999999}}` gives six
consecutive `guard_block` events and no halt, measured. That direction is defensible as a
deliberate project choice; `0` is almost certainly a project meaning "no threshold" and
getting the strictest possible one.

## Why Low

It is loud rather than silent — the user meets a halt with a reason and a documented way to
clear it, and the fix is to edit the file they just wrote. It bricks a session, not a
control.

## Suggested direction

Clamp to a minimum of 1 in the merge, with a diagnostic naming the clamp, which is the same
channel `260804-1603_o_` would use. Alternatively reject the whole `escalation` object with a
diagnostic when `blocksBeforeHalt` is not a positive integer, which folds this into that
issue's validation pass and is probably the better shape — one validation function, one set
of rules, one place to read them.

---

**Step 3 disposition (coder, 2026-08-05) — neither A nor B. STAYS `_o_`, and STAYS IN THIS CIRCLE.**

No delivered sentence is false and the classifier needs no new capability. It is a missing
range check in `hooks/lib/config.ts`, and step 3 changes no code.

**It does not move to the shared store, and the plan's reason for moving it does not hold.**
Step 3 of `planning/260804-2356_o_…ausstieg…` names it as a finding that "does not belong to
this Circle's Directive". C5b is what made `escalation.blocksBeforeHalt` settable from a
project file at all — this record's own first line says so — so the finding arose from this
Directive and the Origin Rule keeps it here. Reported to the orchestrator as a correction to
the plan.

**One update to the suggested direction.** The sibling `260804-1603_c_` closed:
`validateLayer` now gives every leaf the loader reads a declared type in a table
(`CONTAINER_LEAF_RULES`, `TOP_LEVEL_LEAF_RULES`), and a leaf that fails its check is dropped
and named. That is the "one validation function, one set of rules, one place to read them"
shape this record hoped for, and it now exists — so the fix is a row in that table
(`blocksBeforeHalt` must be a positive integer) rather than a clamp bolted onto the merge.
Executor `coder`.

---

**Resolved:** 2026-08-05, coder (task T3). The fix already landed with Plan-B Step 2
(`planning/260804-1633_p_plan-c5b-remediation-and-ship.md`) — this record's marker was the
only stale part. `hooks/lib/config.ts:470-473` gives `escalation.blocksBeforeHalt` a
`CONTAINER_LEAF_RULES` row with check `isPositiveInteger` (`config.ts:412-414`: integer,
`>= 1`) and diagnostic text "a whole number of 1 or more" — exactly the table-row shape the
Step-3 disposition above asked for. An invalid value is dropped and named in diagnostics,
then behaves like an omitted key (decision `260804-1630` equivalence), so `0` falls back to
the default `3` instead of halting on the first block. Asserted by
`hooks/lib/__tests__/config.test.ts:644` ("drops blocksBeforeHalt: 0 — issue 260804-1606"),
`:654` (negative, fractional, stringly-typed all dropped with a diagnostic) and `:663` (no
upper bound, deliberately — the 999999 direction stays a project choice, as this record
argued). Suite green: 72/72 (`npx vitest run lib/__tests__/config.test.ts`). No code change.
