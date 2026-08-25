Nothing checks that a tracked workbench's .gitignore matches the four-class partition

---
A consuming project was measured ignoring `fusion-workbench/orchestrator-events.jsonl`
(class R2) and `fusion-workbench/.fusion-setup` (class R3), and tracking
`.active-circle` and `portfolio.md` (both class L). Three mechanisms could have
caught it and none of them asks the question.
---
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>
**Cross-references:** rules/workbench-tracking.md `## The four classes`; hooks/lib/staging-drift.ts `LIVE_STATE`; skills/setup/SKILL.md Step 0g item 4; shared/decisions/260825-1030_*_does-setup-repair-a-gitignore-that-departs-from-the-four-class-partition.md (answers two of the three questions below); shared/decisions/260825-1030_*_may-a-project-depart-from-the-four-class-partition-deliberately-and-say-so-once.md (the third)

## What was measured

A consuming project's `.gitignore`, reviewed 260825. Its fusion block reads:

```
**/fusion-workbench/.guard-state/
**/fusion-workbench/monitor
**/fusion-workbench/orchestrator-live.md
**/fusion-workbench/orchestrator-events.jsonl
**/fusion-workbench/agentstate.yaml
**/fusion-workbench/.session-marker
**/fusion-workbench/.fusion-setup
```

Two of the seven are wrong in the direction that loses data across checkouts, and two
class L entries are missing so git tracks them. The same project had just committed
`.gitattributes` carrying `merge=union` for `orchestrator-events.jsonl`, a merge driver
for a path git never sees. It had also committed `.checkout-id`, the one class L entry
whose classification is load-bearing.

## Why nothing caught it

Three layers, each blind for its own reason. The third is the one worth reading.

1. **`/fusion:setup` reads `.gitignore` exactly once**, at Step 0g item 4, and only to
   ensure `.claude/settings.local.json` is covered. That is the only `.gitignore` read or
   write in the whole plugin (`grep -rn gitignore skills/ hooks/ bin/`). Setup asks
   nothing about the workbench, and Step 0h asks `git check-attr` about `.gitattributes`
   without ever asking the neighbouring question about `.gitignore`.

2. **`rules/workbench-tracking.md` is emitted to no agent.** `grep workbench-tracking
   bin/fusion-rules` returns nothing, and the rule states its own consumers: a human
   writing the `.gitignore`, and the archive step. No agent ever holds the partition, so
   no agent can notice a project departing from it.

3. **`bin/fusion-staging-drift` walks the workbench root and classifies both wrongly
   ignored files as `in-flight`, which is never a fault.** `LIVE_STATE` in
   `hooks/lib/staging-drift.ts` lists `orchestrator-events.jsonl` and `.fusion-setup`
   explicitly, and the comment above them gives the reason: both are tracked by the split
   and still not a task's records, so "a per-commit report about them would fire every
   time and mean nothing". That reasoning is correct for the question the tool asks, which
   is *was this committed*. The question nobody asks is *is this tracked at all*, and the
   two questions have opposite answers on exactly these two files.

## Why the project's file was once correct

Its own comments date it: the block cites `issue 0423-1925[p]`, in the pre-underscore
marker form, and the Plane block says "per fusion's canonical 'fusion-workbench is local'
model". Under that model the file was right and every exclusion was sound. The four-class
partition landed on 260823 (`21ae170`), and Setup's `.gitattributes` step landed the same
day (`c9eba48`). The transport change brought a Setup step for the merge driver and no
step for the exclusions, although it made both necessary.

## What a fix would have to decide

`git check-ignore -q <path>` answers the question per path, needs no parsing of
`.gitignore`, sees a broader glob and a nested attributes file, and resolves relative to
the working directory. It is the `.gitignore` analogue of the `git check-attr` reasoning
already written into `rules/workbench-tracking.md` `## The event log carries a union merge
driver`, and that section's argument transfers unchanged.

Two of the three questions this record raised are now answered, and the third has its own
record. Setup repairs the mismatch rather than reporting it, and the check lives in Setup
rather than in the archive step, both per
`shared/decisions/260825-1030_*_does-setup-repair-a-gitignore-that-departs-from-the-four-class-partition.md`.
Whether a project may depart deliberately and say so once is open at
`shared/decisions/260825-1030_*_may-a-project-depart-from-the-four-class-partition-deliberately-and-say-so-once.md`,
and the repair cannot be built before it is settled: the opt-out's existence decides the
repair's shape.
