`guardBashCommand` has no halt check, so the halt is a write-tool-only control

---

**Domain:** code
**Filed by:** orchestrator, from a finding the Step 4 coder reported rather than absorbed
**Cross-references:** `hooks/guard.ts:427` (`isHalted`, the only consultation),
`shared/planning/260801-1122_o_spec-normative-consolidation.md:326` (the criterion this makes
vacuous on one surface), `rules/protected-path-discipline.md` (which states the halt to agents)

---

## What was found

`isHalted` is consulted at `hooks/guard.ts:427`, on the write-tool path only. `guardBashCommand`
never checks it. A halted guard therefore blocks `Write`, `Edit`, `MultiEdit` and `NotebookEdit`
and allows every file-mutating shell command the classifier would otherwise permit.

This is unchanged HEAD behaviour and predates this Circle. It surfaced here because Step 4 wired
`FUSION_ALLOW_RULES_WRITE` into the Bash path and asserted the criterion "setting the flag does not
reset or clear an active halt" on both surfaces. On the write-tool path that assertion is real: the
halt check returns above the exemption branch, verified against a pre-seeded halt. On the Bash path
it passes **vacuously**, because there is no halt to lift.

## Why it matters beyond bookkeeping

The halt exists to stop an agent that has already been denied three times from continuing to try.
An agent with a shell is exactly the agent that can continue, so the surface where the halt is
absent is the surface where it would do the most work.

`rules/protected-path-discipline.md` tells every agent that "three consecutive guard denials put the
guard into halt mode, which blocks every `Write`, `Edit`, `MultiEdit` and `NotebookEdit` call until
a human clears it". That sentence is accurate as written and reads, in context, as though the halt
is the general consequence of repeated denial. It is not.

Note the asymmetry is not total: a Bash protected-path denial does **count toward** the halt and can
trigger it (verified in the predecessor Circle, `guard-bash-integration.test.ts:350-383`: three
denies, `consecutiveBlocks` 3, `haltActive` true). So Bash can *cause* a halt it does not then
*respect*.

## Candidate directions, not decided here

1. **Add the halt check to `guardBashCommand`**, above the mutation classification, mirroring the
   write-tool path. Smallest change. Needs a decision about whether a halted guard blocks *all*
   Bash or only file-mutating Bash — blocking all of it would stop an agent reading its way out of
   the situation, which is probably worse.
2. **Leave it and correct the documentation**, so `protected-path-discipline.md` and
   `README-hooks.md` state that the halt gates the write tools only. Honest, and it accepts that
   the strongest evasion route is the one the halt does not cover.
3. **Halt-gate only the mutation verdict**, so a halted guard denies any Bash command the classifier
   recognises as a mutation and allows everything else. Closest in spirit to what the halt is for.

Option 1 or 3 is a behaviour change and wants a decision record. Option 2 is a documentation fix.

## Origin

Found inside `circles/260801-1244-guard-rules-write` while proving that the new flag does not lift a
halt. Filed in this Circle's store because the Directive's own criterion is what exposed it, though
the defect itself predates the Circle.
