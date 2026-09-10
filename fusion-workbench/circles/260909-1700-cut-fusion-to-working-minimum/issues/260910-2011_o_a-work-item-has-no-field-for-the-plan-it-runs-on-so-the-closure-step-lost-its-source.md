A work item has no field for the plan it runs on, so the closure step lost its source
---
The Circle record's head carried `**Active spec/plan:**`, naming the spec or plan the work ran on. The work item that replaces it has no such field. The closure step that reads a plan's `## Where this Circle stops` therefore lost its primary source and has only its fallback: the plan the session happens to be running on, held in session context and written down nowhere.
---
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>
**Cross-references:** 76d833be (the item grammar); 07961552 (the resolver and the sweep); 260909-1843_*_implementation-cut-fusion-to-a-working-minimum.md step C9

**Evidence.** `rules/fusion-workbench-conventions.md` `## Backlog entries — work items` defines five head fields: `**Domain:**`, `**Status:**`, `**Claim:**`, `**Depends-on:**` and `**Filed by:**`. None names an artifact. `rules/circle-records.md`, deleted at `76d833be`, defined `**Active spec/plan:**` and a rule that the field is written in the same command as the act that moves it.

**Why it was not simply added.** The executor of C9's second half met this and declined to invent the field, on the ground that the conventions section is the definition and a head field added from the resolver's half would be the competing definition that half was removing. That reasoning is right and is why this is a record rather than a silent repair.

**What is actually lost.** Two readers. The closure step's plan resolution, which now depends on a value nothing persists, so a session that closes an item without having run its plan resolves nothing. And a reader of the item file, who can no longer see what the work runs on without searching the store.

**What is not lost.** `**Depends-on:**` carries item-to-item dependency, which the Circle record's `## Dependencies` carried in prose. This record is about the artifact pointer alone.

**Acceptance.** Either the item grammar gains a field naming the artifact the work runs on, with the ride-the-act rule the deleted definition carried, or the closure step is rewritten to take the plan from somewhere that survives an interruption, and the conventions say which. A decision record is the right home if the answer is not obvious; this is filed as a defect because a reader was left with no source, which is a gap rather than a choice.
