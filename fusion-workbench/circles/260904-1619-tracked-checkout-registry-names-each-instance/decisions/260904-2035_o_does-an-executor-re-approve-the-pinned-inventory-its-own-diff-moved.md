# Does an executor re-approve the pinned inventory its own diff moved?

---
**Domain:** code
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>
**Cross-references:**
`hooks/lib/__tests__/reference-resolution-lint.test.ts` (`BASELINE_MESSAGE`, which states that re-approval is the expected response);
`hooks/lib/__tests__/fixtures/surface-growth.golden` (its header: regenerating moves no baseline);
`hooks/lib/__tests__/helpers/growth-bound.ts` (a baseline moves at exactly two written-down moments, and neither is this);
`260904-1651_*_the-checkout-registry-names-each-instance-and-joins-one-persons-identities.md` (the plan whose every step so far has met this)

---

## Question

Three of this Circle's first four steps ended with `npm test` red on a **pinned inventory** rather than on a defect: the reference lint's `BASELINE`, the rules-emission golden, the surface-growth golden. Each gate documents re-approval as the expected response to a legitimate edit. None of the three lives in the file set the step's executor was scoped to, so each cost a second dispatch — a `bugfixer` whose whole job was to move two numbers a gate had already told us to move.

Measured this session: step 2 tripped two, step 3 tripped two, step 4 tripped two. Three `bugfixer` dispatches, each between six and eleven minutes, none of which diagnosed anything. The plan has eleven steps left and most of them touch shipped text.

The question is not whether the gates should exist. It is who performs the re-approval.

## What makes it a real question rather than an oversight

The gates are deliberately positioned so that a number cannot move without somebody noticing. `growth-bound.ts` states that a baseline moves at exactly two written-down moments, and the reference lint's message names widening the assertion as the thing that must not happen. An executor that routinely edits the files carrying those numbers is one prompt-slip away from treating a real growth failure as another inventory refresh. That is the cost the current separation buys.

Against it: a separate dispatch is not review. The `bugfixer` receives the same claim the `coder` made about its own diff, and re-derives it at best. Twice today it measured the shares by single-file revert and found them exact, which is real verification; but nothing forced that, and a cheaper agent would have edited the number.

## Options

1. **Keep the separation.** Executors stay scoped away; the orchestrator dispatches a repair for the inventory after each step.
   - Pros: the party that grew a surface never approves its own growth; the re-approval is a named act with its own report and its own history entry.
   - Cons: one extra dispatch per step that touches shipped text, at six to eleven minutes each; the repairing agent has no independent evidence and is verifying a claim rather than a diff.
2. **Widen the executor's scope to the inventories its own diff moved**, with the bound stated in the dispatch: regenerate an inventory, never edit a head-room baseline, and report the delta with its shares measured.
   - Pros: one dispatch per step; the agent that knows what it added is the one that records it; the distinction between an inventory and a baseline is already written in both files' headers.
   - Cons: the executor now edits the files that would catch it growing a surface too far, and the only thing keeping the two apart is the sentence in its own prompt.
3. **Make the inventories regenerate as part of the build** and keep only the head-room bounds as gates.
   - Pros: removes the class of failure entirely; nobody re-approves anything mechanical.
   - Cons: an inventory that regenerates silently stops being a record that somebody looked. The reference lint's whole value is that a new dangling path shows up as a moved number before anybody reads the text.

## Constraints

- No option may make it easier to move a **head-room baseline**. That is the number the four growth bounds rest on, and it moves at two written-down moments only.
- Whatever is chosen must keep the shares of a moved inventory measurable, which today means single-file revert against HEAD.
- The answer applies to this Circle's remaining steps, so it is worth answering now rather than at closure.

## Recommendation

`inference:` Option 2, with the bound stated as it is above and the report obliged to name the shares. The evidence for it is that the two `bugfixer` runs which did the job properly did so by measuring the executor's diff, which the executor could have done first-hand and cheaper. The evidence against it is that nothing measured today would have caught an executor that quietly widened an assertion instead, and this record does not close that gap.
