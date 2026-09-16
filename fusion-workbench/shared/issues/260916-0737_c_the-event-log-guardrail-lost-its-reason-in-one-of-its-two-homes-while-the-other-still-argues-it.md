The event-log guardrail lost its reason in one of its two homes while the other still argues it

---
The prohibition on a line or byte ceiling over the guard event log is authored in two places, and the byte-harvesting pass cut the stake out of one of them. `hooks/lib/events.ts` still states the reason at length and explicitly argues that the rows in question exist in real logs and are not to be tidied away; `skills/archive/SKILL.md` now states the rule with no stake attached.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Cross-references:** 260915-2309_*_merge-log-activity-into-cadence.md, 260811-1534_*_does-the-guard-event-log-get-an-upper-bound-and-what-happens-to-the-evidence-in-it.md

**Evidence.**

What was cut, at `skills/archive/SKILL.md:252`:

> Any ceiling drops the oldest lines**, which are the guard's block, halt and clear events** (fusion's own record `260811-1534_*_…`).

`9d5b1e80`'s commit message accounts for the cut as dead text: *"a reference to block and halt events the guard has not written since 260816."*

The same statement stands unedited in the rule's other home, `hooks/lib/events.ts:108-114`:

> Every ceiling expressible in lines or bytes discards the OLDEST lines first, and the oldest lines are the `guard_block`, `guard_halt` and `halt_cleared` events — 0.6 % of the file at the measurement that settled this, and the only lines recording the guard ever enforcing anything. A guard that forgets it halted is a strange guard.

And the same file, at `:46-51`, refuses the premise the cut rests on:

> **`bin/monitor` still styles `state_drift`, `guard_block` and `guard_halt`, and that is not an inconsistency to tidy up.** It reads an append-only log holding real rows written before the removals, so it is a reader of data that exists; this union is a writer's vocabulary for data nothing can create.

That the guard no longer *writes* those rows is precisely why they are the oldest lines in any log that has them, which is the clause's whole point. The text was live, not dead. Nothing behavioural changed — both homes still forbid the ceiling — but the surface an archive operator reads now carries the rule with no reason, and a rule with no stated stake is the one a later byte-harvesting pass cuts next.

**Acceptance.** `skills/archive/SKILL.md`'s guard-event-log bullet and `hooks/lib/events.ts`'s `emitEvent` comment state the same reason for the same prohibition, or the skill body cites the code comment as the authoring home rather than restating a thinner version of it. The `skills/` surface does not rise.

---
Resolved: **the cut was wrong and the sentence is restored.** Both homes were read before deciding. `hooks/lib/events.ts`'s `GuardEventType` comment refuses the premise the cut rested on in its own words — the monitor's arms for `guard_block` and `guard_halt` "reads an append-only log holding real rows written before the removals, so it is a reader of data that exists" and are "not an inconsistency to tidy up" — and the `emitEvent` comment still carries the clause in full, with the 0.6 % measurement behind it. The guard having stopped writing those rows is precisely why they are the oldest lines in any log that holds them, which is the clause's point; the text was live, not dead. `skills/archive/SKILL.md`'s guardrail bullet reads "Any ceiling drops the oldest lines, which are the guard's block, halt and clear events" again, +52 bytes, paid out of the `skills/` margin. The hook comment is not stale and was not touched.
