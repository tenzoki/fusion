# Does the shaper's portfolio-activation mode write a new spec file, or revise the existing one in place?

---
**Domain:** code
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>
**Cross-references:** `260907-2321-shaper-fourth-rework-after-the-break-even.md` (the run that named the departure), `260907-0820_*_spec-bounded-executor-dispatches.md` (the spec revised in place four times), `260907-1450_*_plan-bounded-executor-dispatches.md` (whose `**Spec:**` field a rename would break)

---

## Question

`rules/orchestrator-rebalance.md` `## Re-sharpening an anticipated Circle` describes `**Scope:** spec`
as "the full re-shaping: a new spec, the field set to it, and the pointer literal replacing the
prose". Read literally, every mode-3 run at that scope produces a **new timestamped spec file**.

Four consecutive runs on this Circle revised `260907-0820_*_spec-bounded-executor-dispatches.md` in
place instead, and the fourth said so explicitly and gave its reason: a new filename would have
broken the plan's `**Spec:**` field, the Circle record's `**Active spec/plan:**` and eight
history-file citations, for no gain. Nothing detected the first three departures.

The question is which of the two the contract means, because at present it says one thing and the
agent does another, and neither the prompt nor any gate notices.

## Options

1. **The contract means a new file, and the agent is wrong.** Mode 3 at `spec` scope always writes a
   fresh timestamped spec; the caller is responsible for re-pointing the record and the plan.
   - Pros: every revision is a separate artifact, so the history of a Directive is readable as a
     sequence of files rather than as a diff nobody reads. Matches what the rule says today, so
     nothing has to be rewritten.
   - Cons: every rename breaks every citation of the old name, and this project's own measurement of
     a comparable sweep is six broken citations from live records with nothing detecting them. The
     cost falls on artifacts that are not the shaper's to repair.
2. **The contract means in place once a spec exists, and the rule text is wrong.** A first mode-3 run
   with `**Active spec/plan:** (none yet)` creates the file; every later one revises it.
   - Pros: what four runs actually did, with a reason each time. Citations stay valid, the head field
     never moves, and the git history carries the revision sequence, which is what a diff is for.
   - Cons: a reader wanting the state of the Directive at an earlier revision has to read git rather
     than a file listing. The rule text has to be corrected, and the correction reaches
     `agents/shaper.md` as well.
3. **Both, decided by a parameter the caller passes.**
   - Pros: covers a genuine re-shaping that should get a new file and a correction that should not.
   - Cons: a fourth parameter on a dispatch that already carries four, deciding something the caller
     usually has no basis to decide. This project's own record on the `**Scope:**` parameter argues
     that the dispatcher states what only the dispatcher knows, and revision-versus-replacement is
     not that.

## Constraints

- Whatever is chosen must keep `rules/circle-records.md`'s invariant that a record's `## Directive`
  holds prose if and only if `**Active spec/plan:**` reads `(none yet)`.
- A rename that breaks citations is not repaired by the citation sweep: `bin/fusion-citation-sweep`
  rewrites store-prefixed citations to the storeless form and resolves no renamed stem.
- The answer binds `agents/shaper.md` and `rules/orchestrator-rebalance.md` together; they may not
  be corrected apart, since the second is what the first is dispatched against.

## Recommendation

Option 2. The four departures each had the same reason and none of them was noticed, which is the
shape of a rule that describes something other than what the work needs. The one thing option 1 buys,
a readable sequence of revisions, is what the commit history already carries for a tracked workbench,
and this Circle's four reworks are four commits.
