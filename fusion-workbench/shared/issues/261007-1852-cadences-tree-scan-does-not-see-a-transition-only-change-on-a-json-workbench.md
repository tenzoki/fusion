cadence's tree scan does not see a transition-only change on a JSON workbench
---
On a JSON-controlled workbench a state change made by `bin/fusion-write transition` alone never reaches the activity log `/fusion:cadence` writes: the skill's scan block lists only `*.md` files by mtime, and a transition rewrites the control file (`<stem>.record.json`, `package.json`) while the narrative's bytes and mtime stay as they were.
---
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>
**Cross-references:** 261007-1836-plan-the-four-open-defects-fixed-before-v13-is-tested.md (step 6)

Found beside step 6 of the plan above, outside its four defects, hence the shared store.

Evidence: `codec/src/__tests__/install.test.ts`, the `/fusion:cadence` `## Process` case of the tenth group: after an uncommitted `transition` the control file's bytes change, the narrative's do not, and the scan block with `SINCE` set to today lists nothing. The case asserts this current behaviour and names it as a gap.

Acceptance: with `SINCE` set to today, the scan block lists the record whose control file a `transition` rewrote that day (or the activity log draws state changes from the event log's `record_change` rows), and the case in `install.test.ts` asserts that instead of the gap. Suggested owner: `code-implementer`.
