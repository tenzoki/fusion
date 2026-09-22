# What becomes of the two entries in the unread `shared/backlog/` store?

---
**Domain:** data
**Filed by:** planner, Kai Stalmann <ks@qantr.com>
**Cross-references:** 260910-2020_*_the-two-existing-backlog-entries-keep-the-retired-marker-form-that-d1-migrates-into.md, 260922-0922_*_the-51-open-issues-at-451bb312-worked-autonomously-as-one-package.md

---

## Question

`fusion-workbench/shared/backlog/` holds two tracked files stamped 260814-1733, one carrying `_c_` (bounded executor dispatches) and one `_p_` (attach the rule to the act). Neither carries a `**Status:**` head field. At `451bb312` no consumer reads the store: `bin/fusion-paths` emits no key naming it (the word `backlog` does not occur in the helper), the layout tree in `rules/fusion-workbench-conventions.md` `## fusion-workbench Layout` does not list it, and the only code that still names `backlog` is the store-segment lists in `hooks/lib/staging-drift.ts` and `hooks/lib/citation-scan.ts`. The defect asks that one `ls` of the store show one grammar, or two and the text say which is which. Every closure moves or reclassifies data in a store the user owns, and two of the three are work-item maintenance operations the orchestrator performs only at the user's word (`agents/orchestrator.md` `## Work items`), so the package this plan runs does not pick one.

## Options

1. **Archive both**: `/fusion:archive` moves the two files under `archive/` with the next sweep; the layout gains a sentence beside the two legacy stores it already names (`stashes/`, `.migration-v2-backup/`) saying `shared/backlog/` is a third, frozen since the container store took the work item.
   - Pros: nothing is converted by guesswork; the `_c_` entry's work landed as `260906-2258-bounded-executor-dispatches` and the `_p_` entry's substance is the conventions' "write the status and the claim in the same command as the act", so neither names live work.
   - Cons: the `_p_` entry's state is read by a human and never written down as a ruling; the archive skill's tiers select by marker and age, and `_p_` is a live marker, so the move is a hand move or a tier exception.
2. **Convert both into work items**: each becomes `circles/260814-1733-<slug>/260814-1733-<slug>.md` with a `**Status:**` mapped from the marker (`_c_` → `done`; `_p_`, which meant recommended, → the user's call between `open` and `dropped`).
   - Pros: one grammar in one store; the trail from the entries to the items that realised them is written.
   - Cons: filing a work item is the user's act and never an agent's; the `_p_` mapping is a ruling in itself.
3. **Delete both**: the substance is elsewhere and nothing cites them.
   - Pros: cheapest.
   - Cons: deletion is the one act the conventions treat as destroying evidence (`## Filename Patterns`, the deliberately-deleted annotation); a file deletion is a gate under `**Mode:** autonomous`.

## Constraints

- `bin/fusion-citation-check` must stay clean over whichever store the files end in; both carry citations.
- The `backlog` segment stays in the two store lists until the store is empty, so a citation of either file is still reported store-prefixed rather than invisible.

## Recommendation

Option 1, with the `_p_` entry's reading stated in the archive commit message: recommended on 2026-08-14, realised by the conventions' write-with-the-act rule, and never claimed as an item. Option 2 asks the user to file two items for work that is done, which the store's own grammar says is not a reason to file.
