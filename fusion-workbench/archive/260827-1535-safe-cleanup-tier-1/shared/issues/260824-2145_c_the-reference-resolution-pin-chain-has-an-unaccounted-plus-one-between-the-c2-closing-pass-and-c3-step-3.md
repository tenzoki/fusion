The reference-resolution pin's attribution chain has an unaccounted +1 in `paths` between the C2 closing pass (1294) and C3 step 3 (1295 -> 1291)
---
After the 260824 roll, `260824-2121-reference-resolution-pin-re-approval-log-entries-26-to-40.md` ends with "Turn 1 text-correctness pass: paths 1293 -> 1294" and "C2 closing pass: records 117 -> 118, paths and anchors unmoved", so the chain closes at paths 1294. The first entry left in `hooks/lib/__tests__/reference-resolution-lint.test.ts:459` opens "step 3 of the C3 plan: paths 1295 -> 1291". No entry, in the test file or in either rolled log, moves 1294 to 1295. The roll moved the 92 lines verbatim and is not the cause: the gap was there before it (`5b88eb9`, 2026-08-24, wrote the 1295 entry). It is the same class `circles/260823-0023-settle-what-travels-between-checkouts/issues/260823-1110_c_*` closed the day before, and the invariant that record cites ("every entry closes where the next one opens") is stated in the test file's own comment.
---
**Filed by:** coderev (person half absent: the installed plugin at `$FUSION_PLUGIN_ROOT` carries no `bin/fusion-identity`, so attribution was dropped rather than composed)

Scope: `hooks/lib/__tests__/reference-resolution-lint.test.ts:459`; the two rolled logs under `shared/analyses/`. Found while reviewing `01964e4..13aaa85` (Circle `260824-1853`); the defect arose in the C3 Circle's step 3, so it is filed in `shared/` under the Origin Rule.

Fix direction: recover the move from `git log -S` between the C2 closing commit and `5b88eb9` and write the one accounting line, retrospectively and marked so, as `260823-1110` did; or state in the 1295 entry that the +1 is unattributed. A comment line costs a test line; hook-test head-room is 0.

Severity: Low.

---
Resolved: fixed — the +1 path and +1 anchor are commit `0db1fbb` (the orchestrator's `## How you ask the user anything` section), written retrospectively into the rolled log because the test surface has no head-room; `260824-2121-reference-resolution-pin-re-approval-log-entries-26-to-40.md` `## The unaccounted +1, written retrospectively on 2026-08-24`
