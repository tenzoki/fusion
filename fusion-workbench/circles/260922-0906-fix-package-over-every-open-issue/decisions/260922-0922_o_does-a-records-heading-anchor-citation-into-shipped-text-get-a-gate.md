# Does a workbench record's heading-anchor citation into shipped text get a gate?

---
**Domain:** code
**Filed by:** planner, Kai Stalmann <ks@qantr.com>
**Cross-references:** 260907-2301_*_the-retention-decisions-cross-reference-cites-the-tier-heading-by-its-pre-edit-wording.md, 260907-0902_*_how-is-the-message-stores-retention-expressed-against-an-archive-step-with-one-threshold-per-run.md, 260922-0922_*_the-51-open-issues-at-451bb312-worked-autonomously-as-one-package.md

---

## Question

`hooks/lib/__tests__/reference-resolution-lint.test.ts` resolves `` `file.md` `## Section` `` anchors over the shipped surface and excludes the workbench; `hooks/lib/__tests__/workbench-citation-lint.test.ts` and `bin/fusion-citation-check` resolve record citations inside the workbench and read no heading anchor. A record citing a shipped heading falls between the two, which is how `260907-0902_*` came to cite `### Tier 1 — Terminal Circles + terminal markers in the shared store` after `97bc8b0b` renamed that heading to `### Tier 1 — Terminal markers and age in the shared store`. The record is `_i_` and terminal, so it is not edited (`rules/fusion-workbench-conventions.md` `## Terminal states are history`); the defect's second acceptance half asks whether the class gets a gate at all, and that is a mechanism question a package cannot answer for itself.

## Options

1. **No gate; the anchor form is for living text**: the conventions already say living text cites by anchor because it outlives its target; a record is point-in-time and its anchor reads as the heading stood when it was written. State that in `## Filename Patterns` in one clause.
   - Pros: no scanner change; matches how `Resolved:` lines already cite; a terminal record's stale anchor is history, not a defect.
   - Cons: a live record's stale anchor is still a dead pointer nothing reports.
2. **Report, never gate**: `bin/fusion-citation-check` gains a class `shipped-anchor` for `` `<shipped path>` `## Heading` `` tokens in live records, resolved against the tree, reported in the summary and never in the verdict.
   - Pros: the dead pointer is visible; nothing blocks.
   - Cons: a new token class in a scanner whose grammar took eleven decisions to settle; every live record's anchors into prompts and rules become a count somebody watches.
3. **Gate on edited files only**, the way `store-prefixed` is gated — a live record edited in this commit may not carry a stale shipped anchor.
   - Pros: the same edited-files discipline the other classes use.
   - Cons: a rename of a shipped heading then reddens the next edit of every record citing it, which is the rename-to-citation obligation `260816-0119_*` already found nothing carries.

## Constraints

- The scanner's corpus and the lint's corpus stay disjoint as they are (workbench versus shipped surface); whichever option lands names which of the two reads the new class.
- A terminal record is never rewritten by a sweep under any option.

## Recommendation

Option 1. The anchor form was chosen for text that outlives its target; a record is the other kind, and the point-in-time reading is what its commit already guarantees. Option 2 is worth taking only if a count of stale anchors in live records is ever measured above a handful, and nobody has measured it.
