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
