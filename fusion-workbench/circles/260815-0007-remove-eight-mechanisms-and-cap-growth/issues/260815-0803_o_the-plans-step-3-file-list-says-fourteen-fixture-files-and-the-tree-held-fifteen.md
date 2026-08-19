The plan's step 3 file list says fourteen fixture files and the tree held fifteen

---

**Severity:** Low
**Domain:** data
**Filed by:** ontorev, review of `9a7da8e..7c12d6a` (structured-data half), review file `circles/260815-0007-remove-eight-mechanisms-and-cap-growth/reviews/260815-0803-ontorev-plane-structured-data-removal.md`
**Owner:** `coder`
**Affects:** `circles/260815-0007-remove-eight-mechanisms-and-cap-growth/planning/260815-0029_o_plan-remove-eight-mechanisms-and-cap-growth.md:180`
**Cross-references:** `circles/260815-0007-remove-eight-mechanisms-and-cap-growth/history/260815-0751-ontocoder-remove-plane-data-files-and-fixtures.md` `## Findings the plan did not predict` (where the executor recorded it); `circles/260801-1244-curator/issues/260814-1419_o_the-golden-regeneration-history-states-eighteen-agent-blocks-and-five-rule-files-and-the-artefact-has-seventeen-and-three.md` (the same class, one Circle earlier); `rules/fusion-workbench-conventions.md` `## Issue and Decision Filing — MANDATORY`.

---

Step 3 of the plan names the fixture tree as `hooks/lib/__tests__/fixtures/plane/` *(whole tree, 14 files)*. The tree held fifteen. The executing ontocoder found the discrepancy and recorded it in its history entry, which is the one place the conventions say a defect may not live.

---

**Verified 2026-08-15 at HEAD `7c12d6a`.**

```
$ git diff --diff-filter=D --name-only 9a7da8e..HEAD | grep -c '^hooks/lib/__tests__/fixtures/plane/'
15
```

Six JSON API-response fixtures at the top level, and a nine-file workbench tree beneath it: one demo Circle record, three issues, two decisions, a `shared/` issue and decision pair, and the fixture `plane.config.yaml`. Six plus nine is fifteen. The count was already fifteen at `d78dfb7`, the commit before step 2, so nothing in the removal changed it and the plan simply miscounted.

**Nothing was mis-executed.** Step 3's file list names the directory as a whole, so no file went unnamed and no adjudication was needed. The whole tree is gone and `hooks/lib/__tests__/fixtures/` now holds `rules-emission.golden` alone.

**Why it is filed rather than left in the history entry.** Two reasons, and the second is the reason it is Low and not Nil.

The plan is the executing document and still carries the wrong figure at line 180. Step 14 re-takes the before-measurement with the identical command and the Circle's `## Closure criterion` asks for a before-and-after in bytes, Setup tokens and line counts. Whoever assembles that arithmetic reads the plan, and one of the two documents in front of them says fourteen.

And `rules/fusion-workbench-conventions.md` `## Issue and Decision Filing — MANDATORY` is explicit that a defect may not live in a history log: *"NEVER put issues or decisions inside plan documents, review documents, analyses, code comments, chat output, history logs, or any other location. Embedded items get lost."* The executor did the right thing by measuring and recording it, and the record it wrote is in the one place the convention forbids. This file is that half.

The class is not new. One Circle earlier, `circles/260801-1244-curator/issues/260814-1419_o_the-golden-regeneration-history-states-eighteen-agent-blocks-…` records a history entry claiming eighteen agent blocks against a seventeen-block fixture, and its recommended fix is worth reusing here: correct the count, or restate the phrase without one. *"the whole tree"* carries the same instruction as *"the whole tree, 14 files"* and cannot go stale.

**The fix.** At `planning/260815-0029_o_plan-remove-eight-mechanisms-and-cap-growth.md:180`, change `(whole tree, 14 files)` to `(whole tree, 15 files)` or drop the parenthetical count. Check step 14's and the Closure note's arithmetic against whichever is chosen.


---

**Reconciliation 260819-1453 (reconciler, Domain `code`, Circle-store pass) — STAYS `_o_`. Re-measured at HEAD `e435f03` (v10.3.0). Unchanged, and now inside a closed plan.**

`planning/260815-0029_c_plan-remove-eight-mechanisms-and-cap-growth.md:186` still reads `\`hooks/lib/__tests__/fixtures/plane/\` (whole tree, 14 files)`. The plan carries `_c_` and `**Status:** Complete`, so the miscount is now history rather than an instruction — which does not make it right, and does mean nobody will act on it. What it costs is a reader reconstructing the Plane removal from the plan and coming up one file short.
