Step 7 runs `/fusion:curate`, which passes no placement line, so the pass it is supposed to produce proposes nothing

---
Step 7 of `260916-1126_*_implementation-human-facing-docs-leave-claude-md.md` says to run `/fusion:curate`
against this repository, and states its endpoint as "a run file carrying a classification for every
section head, a ledger of relocation entries, and the user's approval set".

The repair that closed `260916-1312_*_an-in-remit-relocation-is-stale-by-its-own-rule-and-nothing-sequences-the-destination-write.md`
made a relocation opt-in: the curator proposes one only on a dispatch carrying `**Placement:** on`,
and `agents/curator.md` `## Dispatch parameters` states in so many words that `/fusion:curate` passes
no such line on either of its dispatches. `README-agents.md`'s roster row says the same and adds that
nobody ships it.

So step 7 as written produces the truth survey and **no relocation entry at all**. Its endpoint is
unreachable through the command it names. The opt-in itself is right — a relocation takes a passage
out of a surface on a judgement no evidence tier grades, so a run nobody asked to judge placement
should not propose one — and this record asks how step 7 reaches it, not for the default to change.

Two ways out, and the choice is not made here:

1. `/fusion:curate` gains a way to ask for a placement run, which it then passes on both dispatches.
   Costs bytes on the skill-body surface, which stood at 2 after the repair.
2. Step 7 dispatches the curator directly with `**Placement:** on` rather than through the command,
   which is what the roster row already describes as the way a placement run is asked for. Costs
   nothing shipped, and leaves `/fusion:curate` as the truth survey it now is.

**Acceptance test:** the session that runs step 7 produces a run file carrying a placement
classification section and at least one relocation entry, or the step is rewritten to say what it
produces instead.

---
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>

Found while reading the repair's return against the plan, before the 11.5.0 tag. Nothing is broken
in the tree: the parameter, its default and its documentation agree with each other. What disagrees
is a plan step written before the parameter existed.

---
Resolved: option 2, and step 7 ran. The orchestrator dispatched the curator directly with
`**Mode:** survey` and `**Placement:** on` rather than through `/fusion:curate`, which is what the
roster row already describes as the way a placement run is asked for, and costs nothing shipped.
Option 1 was refused on measurement: the skill-body surface stood at 3 bytes after the relocation,
and giving the command a way to ask for placement needs more than that. The opt-in default is
unchanged and was never in question. The acceptance test is met — the run file
`260916-1612-curator-run.md` carries a placement classification for all seven top-level sections and
a ledger of 22 relocation entries, all 22 approved and applied. The plan step now records the
dispatch form it was actually run with, so a later reader does not follow the command back into the
same gap.
