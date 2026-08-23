Two of six baseline re-approvals carry no accounting, and the log now contradicts the constant it stands above

---

**Severity:** Medium. The pin's whole value is that every move is attributable; an unattributed move is a re-approval nobody can audit.
**Domain:** code
**Filed by:** coderev, reviewing C2 Turn 1
**Affects:** `hooks/lib/__tests__/reference-resolution-lint.test.ts:488`, `:552`
**Cross-references:** `shared/analyses/260822-1318-reference-resolution-pin-re-approval-log-entries-1-to-25.md`, where the rolled entries live

---

## What is wrong

The file states its own invariant at `hooks/lib/__tests__/reference-resolution-lint.test.ts:488`:

> EVERY MOVE IS STILL ATTRIBUTED HERE, above the constant

`BASELINE` moved in six of the nine commits of this range. Four carry an accounting block and each of those four is accurate, checked token by token against its own diff. Two carry nothing:

- `c9eba48` (plan step 3): `paths 1286 → 1287`, `anchors 176 → 177`. No block. The next commit's block mentions it after the fact, in its last line: "Step 3 moved both counts by one the same way and approved it in `git:c9eba48` with no note here."
- `1400402` (plan step 6): `paths 1291 → 1292`, `anchors 179 → 180`. No block anywhere. Its accounting exists only in the workbench history file `circles/260823-0023-settle-what-travels-between-checkouts/history/260823-1040-coder-next-briefing-states-its-provenance.md`, which is not where the invariant says it goes.

The visible consequence at HEAD: the last entry of the in-file log ends by stating `paths 1291, anchors 179, records 117`, and the constant on the very next line reads `{ paths: 1292, anchors: 180, records: 117 }`. A reader checking the log against the constant finds them disagreeing, with nothing to say which is right.

## Verified

Read at HEAD `2f1e3a6`. The six moves were extracted with `git log -p 3ee8eaf..2f1e3a6 -- hooks/lib/__tests__/reference-resolution-lint.test.ts`. The four growth-bound baselines are untouched across the whole range: `git diff 3ee8eaf..2f1e3a6 -- hooks/lib/__tests__/helpers/growth-bound.ts hooks/lib/__tests__/surface-growth-bound.test.ts hooks/lib/__tests__/rules-emission-golden.test.ts` returns nothing, so `AGENT_BASELINE`, `SKILL_BASELINE`, `RULE_BASELINE` and `TEST_LINE_BASELINE` all stand where they stood. That half of the claim holds.

## Why the after-the-fact mention is not the fix

`905a8a4`'s block names `c9eba48`'s move but does not account for it in the form the log uses everywhere else: which file, which token, which class. And `1400402` has no such rescue at all, so the gap is open at HEAD rather than closed one commit late.

## Direction, not a prescription

Write one block above the constant covering both moves: `c9eba48`'s `+1 path, +1 anchor` from the Step 0h citation of `rules/workbench-tracking.md` and its section, and `1400402`'s `+1 path, +1 anchor` from the same file and `## The four classes` cited by the new `/fusion:next` paragraph. The history file already carries the second; the point is that the log is the place a later reader looks.
