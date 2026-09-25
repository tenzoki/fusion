The layout-tree record is live under two names in two Circles, and the closed copy lost its body

---

**Severity:** High
**Domain:** data
**Filed by:** ontorev, review of `9a7da8e..7c12d6a` (structured-data half), review file `260815-0803-ontorev-plane-structured-data-removal.md`
**Owner:** `ontocoder`
**Affects:**
- `260814-1419_*_three-plane-files-entered-the-layout-tree-and-neither-of-the-two-per-surface-arguments-below-it-was-extended.md` (28 lines, 4 170 bytes, open)
- `260814-1419_*_three-plane-files-entered-the-layout-tree-and-neither-of-the-two-per-surface-arguments-below-it-was-extended.md` (3 lines, 299 bytes, closed)

**Cross-references:** commit `d0ddabb` (wrote the closed copy); commit `507dbc6` (fixed the identical defect for the sibling record `260810-0410_*_the-layout-tree-calls-itself-exhaustive-and-omits-the-two-plane-runtime-files.md` and did not reach this pair); `260810-0819_*_head-carries-six-records-twice-and-the-class-fix-was-deferred-to-a-decision-never-filed.md` (the standing class record — this is a seventh instance); `rules/fusion-workbench-conventions.md` `## State Markers — issues and planning`, `## Origin Rule (Herkunftsregel)`, `## Issue and Decision Filing — MANDATORY`.

---

One defect record now exists twice at HEAD under two markers, in two different Circles, and the closed copy is a stub that dropped every line of evidence the open copy carries.

---

**Verified 2026-08-15 at HEAD `7c12d6a`.**

```
$ find fusion-workbench -name '*260814-1419*three-plane-files*'
circles/260719-1536-plane-mirror-integration/issues/260814-1419_c_three-plane-files-…md
circles/260801-1244-curator/issues/260814-1419_o_three-plane-files-…md

$ wc -l circles/260719-1536-plane-mirror-integration/issues/260814-1419_c_…md   #  3
$ wc -l circles/260801-1244-curator/issues/260814-1419_o_…md                    # 28

$ git log --diff-filter=A --oneline -- 'fusion-workbench/circles/260719-1536-plane-mirror-integration/issues/*260814-1419*'
d0ddabb refactor(plane): the mirror leaves, and the suite drops to a third of its length
```

Three faults, from one cause.

**1. The transition was a new file, not a rename.** `rules/fusion-workbench-conventions.md` `## State Markers — issues and planning` states it in one line: *"State change = `mv` (rename). Only the marker changes; `YYMMDD-HHMM` and `<topic>` stay the same."* `d0ddabb` added a new path (git reports `A`, not `R`) and left the original where it was. That is exactly the fault `507dbc6` repaired one commit later for the sibling record, whose own commit message names the cause: *"A rename is two paths and P-2's staging list named only one."* The same staging list omitted this pair, and the follow-up commit repaired only the one the staging check had named.

**2. The closed copy landed in the wrong Circle.** The record was filed by `coderev` during the curator Circle's Turn 3 and lives in `circles/260801-1244-curator/issues/`. Its closure was written into `circles/260719-1536-plane-mirror-integration/issues/`, a Circle whose record has carried `_c_` since July. Under the Origin Rule an artifact belongs to the Circle whose Directive caused it to exist, and reach is expressed by citation rather than by placement. A `mv` within the curator Circle was the correct operation; nothing about the removal moved the record's origin.

**3. The closed copy has no body and no title.** Its full content is three lines: an empty first line where the title belongs, a `---`, and the `Resolved:` note. The issue-file format in `## Issue and Decision Filing — MANDATORY` is `<issue title>` / `---` / `<short description>` / `---` / `<context>`, so the file satisfies none of it. The open copy holds the evidence: the two named gaps, the two "things the fix should not do", the `bin/fusion-plane:236-238` citation and the verification stamp. Closing a record is appending a `Resolved:` line to it, not re-authoring a summary of it. The sibling repair got this right: `260810-0410_*_…md` is 52 lines and keeps its whole body under the appended footer.

**Why this is worth a record rather than a one-line `rm`.** A marker scan counts this record twice, once as open work that is finished, and the open copy is the one that still holds the evidence, so deleting the wrong half destroys the record. `260810-0819_*_head-carries-six-records-twice-…` already records that HEAD carries six records under two names and that the class fix was deferred to a decision nobody filed. This is the seventh instance, produced by a commit whose own follow-up was fixing the sixth. The class record is the reason to fix this one by hand and to say so in the same breath: the per-instance repair has now been performed three times and the mechanism that produces the instances is untouched.

**The fix.**

1. `mv 260814-1419_*_…md` to the same directory under `_c_`, keeping every byte of the body.
2. Append the existing `Resolved:` note to it, unchanged — the note is correct and is the only content worth keeping from the stub.
3. `rm 260814-1419_*_…md`.

Do not resolve it the other way round. The stub carries nothing the repaired record needs.

---
Resolved: Fixed as prescribed in 53f2ed2: the stub under the plane-mirror Circle is gone and the curator Circle's copy is now _c_ at 31 lines with its full body and a Resolved footer.

Closed as part of the Turn-1 housekeeping batch of session 260815-2147-orchestrator-session.md, after a re-verification pass against HEAD confirmed the condition no longer holds.
