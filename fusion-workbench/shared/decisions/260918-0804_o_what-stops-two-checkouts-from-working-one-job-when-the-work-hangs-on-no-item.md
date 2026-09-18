# What stops two checkouts from working one job, when the work hangs on no work item?

---
**Domain:** code
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>
**Cross-references:** `foreign:axibra-1:260918-0555_*_two-checkouts-of-one-person-planned-and-executed-the-same-removal-in-parallel-and-nothing-detected-it.md` (the measured collision and the user's ruling on it) · `260910-2145_*_how-does-the-resolver-learn-which-work-item-is-in-scope.md` (the claim as the resolver reads it)

---

## Question

A work item's `**Claim:**` names one checkout, and that is the mechanism that stops two parties taking one job. It has one precondition nothing states: **the work has to be a work item.** Work that reaches a session any other way is unclaimable, and two sessions can take it without contending for anything.

Measured in the consuming project `axibra-1` on 2026-09-17. Two checkouts of one person planned and executed the same removal of a server surface, independently, within hours. Each wrote its own plan into its own workbench, each dispatched an executor, each ran the project's gates, each committed. The collision surfaced at the next `git merge` as fourteen conflicted files, and one side's execution was discarded whole: thirteen steps, two agent dispatches and roughly an hour of gate runs. The user ruled there that work spanning more than one dispatch should be filed and claimed before it is planned (that record's `## Options` option 1). This record is where that ruling has to land, because every option in it is a change to this plugin.

The route the work took is worth stating exactly, because it is the ordinary route and not an unusual one. A third checkout left a note in the forum store describing work it had finished and naming what remained for somebody else. A session read that note, treated it as its directive, and went to the planner. Nothing in `agents/orchestrator.md` or `agents/planner.md` says to file an item first, and `rules/fusion-workbench-conventions.md` `## Backlog entries — work items` says the opposite of a route: **no agent originates a work item**, the user files. So the session did what the prompts describe.

## Options

1. **The orchestrator asks the user to file and claim an item before it plans work that will span more than one dispatch.** A gate condition, answered in chat like the others, with "plan it without an item" as an explicit answer.
   - Pros: uses the claim, which already exists, already keys on the checkout and already merges without conflict one file per item; keeps the no-agent-originates bound intact, because the user still files; the cost is one line at the moment the work starts.
   - Cons: another gate on a path that already has two, and the orchestrator has to judge "more than one dispatch" before the planner has decomposed anything, which is exactly when it knows least.
2. **The planner reads the open plans across every store before writing one, and reports a subject collision to the gate it already passes through.** A survey step, not a lock.
   - Pros: no new human step and no new state; it lands at the moment a second plan is about to be written, which is the cheapest moment to stop; the plan-review gate already exists to carry the report.
   - Cons: it can only see what is committed and pulled. Both plans in the measured case sat uncommitted for hours, so this would have caught nothing there. It buys the case where one side pushed first.
3. **Neither. The collision is detected at the merge and resolved there.**
   - Pros: no mechanism, no obligation, no gate; the measured case did end correctly, with no defect shipped and the weaker side discarded against a backup branch.
   - Cons: the detection is the merge's timing rather than a property of the system, and the cost is paid in full each time. Two checkouts of one person may be rare enough for this to be right.

## Constraints

- Any mechanism has to work across checkouts that cannot see each other's uncommitted state. The measured collision lived entirely in that window.
- The claim compares on the checkout identifier and never on the person, deliberately (`rules/fusion-workbench-conventions.md` `### Who filed it`, and `bin/fusion-identity`'s own header). Two checkouts of one person are two parties to it. That is what made the collision possible and is also what makes the claim correct; no option here changes it.
- `## Backlog entries — work items` states that no agent originates a work item. Option 1 must ask rather than file, or it breaks that bound.
- The forum route is not a defect. A note naming work that remains for somebody else is what the store is for, and nothing here should discourage it.

## Recommendation

Option 1, with option 2 unadopted rather than rejected. The measured work spanned thirteen steps and an hour of gates, which is the shape the item store exists for, and one asked line would have surfaced the other checkout's claim before either executor ran. Option 2 is cheaper and catches strictly less: it would not have caught this one.

The case against both is worth stating plainly, because it is the case the user may prefer. Nothing was lost in the measured collision except time, the merge did detect it, and a gate that fires on every multi-dispatch piece of work is a gate that gets answered by reflex. If the ruling is option 3, this record should say so and the two prompts stay as they are.
