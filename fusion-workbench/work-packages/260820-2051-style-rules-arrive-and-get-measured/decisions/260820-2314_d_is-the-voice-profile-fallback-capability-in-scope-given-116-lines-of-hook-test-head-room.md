# Is the voice-profile fallback capability in scope, given 116 lines of hook-test head-room?

---
**Domain:** code
**Filed by:** orchestrator
**Cross-references:** `260820-2249_*_spec-style-rules-arrive-and-get-measured.md`, `260820-2308-assessment-of-the-style-rules-spec.md`

---

## Question

An agent is instructed to record in its history when a voice profile fell back to the English variant.
The fallback is performed inside `bin/fusion-rules`, which emits only the resolved path, so the agent
cannot detect the event it is told to record. The capability makes the helper say so on standard error.
It is the only capability touching the hook-test surface, which has 116 lines of head-room left.

## Options

1. In scope.
2. Dropped, with the head-room named as the reason and the record left open.

## Answer: option 1, in scope.

The stated risk was contention with a concurrent Circle over the same head-room. That Circle closed at
commit `5faed26`, so the contention is void and the 116 lines are uncontested. The capability needs no
new test file, and standard output is unchanged, so the golden fixture does not move.

**One qualification the spec omits, recorded here rather than glossed.** Standard error makes the
fallback *detectable*, which is what a mechanism change owes. Whether the agent then writes the history
line remains an instruction-following obligation, and this project has documented that such obligations
are overridable under load. The capability closes the impossibility, not the compliance question.

## What this forecloses

Nothing. Dropping it later still requires the decision the underlying record names.

## Who answered this, and under what authority

Answered by the orchestrator during an unattended run, with the user away and no channel to ask them.
This is not the user's answer. The record stays open (`_o_`) so the user meets it as a live question.

---
Deferred: the next style-rules Circle — user 2026-08-29, triage of open decisions left in terminal Circles; no scan reaches this store any more, so the deferral is recorded by hand.
