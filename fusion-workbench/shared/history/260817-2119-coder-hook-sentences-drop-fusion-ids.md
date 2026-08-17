# Coder — the hook sentences stop citing fusion's own records into a consuming session

---
**Status:** Complete
**Date:** 2026-08-17
**Agent:** coder
**Dispatched by:** the user, top-level
**Domain:** code
**Task:** Implement the fix recorded in
`shared/issues/260817-2110_*_the-hook-sentences-cite-fusions-own-workbench-ids-and-a-fusion-commit-hash-into-a-consuming-projects-session.md`
at the user's gate decision of 2026-08-17: keep only the instruction, drop the retrospective.
No commit; leave the tree for the cleanup pipeline.

---

## What was done

Three emitted sentences lost their closing retrospective. Each retrospective named a record
in fusion's own workbench, and one named a fusion commit hash; all three sentences are handed
to the model in every project the plugin runs in, where none of those identifiers resolves.

### 1. `hooks/lib/review-coverage.ts` — `coverageSentence()`

The final part dropped its opening clause ("This is issue 260810-1205: two passes ran, ...").
The two role-addressed instructions after it stand unchanged: the orchestrator widens the next
dispatch's scope and names the gap commit by commit, `bin/fusion-review-coverage` prints both,
and a sub-agent carries the line into its report. The `report.uncovered` and `report.carried`
parts above were already project-neutral and were not touched.

### 2. `hooks/lib/staging-drift.ts` — `stagingSentence()`, two places

The commit-message branch dropped "issue 260811-1141 is what that cost when the instruction
was unconditional" and kept the constraint it hung on: the class is decided by the file's name
once every store has declined it, so a false positive can enter it, and deleting an authored
file on a name match is not recoverable.

The final part dropped the eighteen-commit retrospective and the `f38f37d` reference. Every
instruction survives: the paths go into the next Step 3b staging list written out in full and
absolute, a queue rebuild is committed at Phase 1 where the dispatch that produced it happened,
`git add -A`, `-u`, a directory argument and a glob stay prohibited, and the sub-agent clause
stands. The prohibition needed a justification that survives without the hash, so it now states
what loosening the shape *does* rather than which commit it happened in: it stages the deletions
of records that were renamed, adds nothing in their place, and so takes those records out of
HEAD.

### 3. Source comments were left alone

The doc comments above both functions cite the same records and are correct there, because
their reader is a fusion developer rather than a consuming project's model.
`hooks/lib/domain-cascade.ts` was out of scope for the same reason its record gives: that
module is reached only from the lint tests, so its text never enters a session.

### 4. Tests — a project-neutral proxy for "the hook spoke"

Five cases in `review-coverage.test.ts`, four in `staging-drift.test.ts` and the third entry of
`COVERAGE_SENTENCE_MARKERS` in `helpers/guard-harness.ts` asserted on the literal identifiers.
Each now reads a named constant taken from the part of its sentence that is emitted
unconditionally, so the proxy is stable against a report that finds only one fault class:

| Proxy | Value | Where |
|---|---|---|
| `COVERAGE_SPOKE` | `widen the next dispatch's scope` | `review-coverage.test.ts` |
| `STAGING_SPOKE` | ``Do NOT reach for `git add -A` `` | `staging-drift.test.ts` |
| third marker | `widen the next dispatch's scope` | `helpers/guard-harness.ts` |

Each constant carries a comment saying why that string is the proxy and what it replaced. No
assertion was weakened: both values are specific to their own sentence and neither can match an
empty string. Two assertions in `staging-drift.test.ts` that separately checked
`` `git add -A` `` and `/Do NOT reach for/` collapsed into the one constant, which contains both.

### 5. `hooks/dist/` rebuilt, surface golden regenerated

`npm run build` in `hooks/` refreshed `dist/lib/review-coverage.js` and
`dist/lib/staging-drift.js`. The hook-test surface grew 32 lines (17 887 -> 17 919), inside its
2 500-line head-room, so the bound passed and **no baseline moved**; only the checked-in golden
was regenerated with the documented flag, and its diff carries exactly the three edited files.

## Verification

```
cd hooks && npm test        # 35 files, 653 tests, exit 0
```

Acceptance re-checked after the run. `grep -rn "260810-1205\|260811-0114\|260811-1141\|f38f37d"`
over `hooks/lib/review-coverage.ts` and `hooks/lib/staging-drift.ts` returns eight lines, every
one of them a comment; the same grep over the two modules in `hooks/dist/` returns six, likewise
all comments. Both sentences were rendered from the rebuilt `dist/` with a synthetic report and
read end to end: every instruction listed in the issue is present, and no identifier is.

## Files changed

- `hooks/lib/review-coverage.ts`
- `hooks/lib/staging-drift.ts`
- `hooks/lib/__tests__/review-coverage.test.ts`
- `hooks/lib/__tests__/staging-drift.test.ts`
- `hooks/lib/__tests__/helpers/guard-harness.ts`
- `hooks/lib/__tests__/fixtures/surface-growth.golden`
- `hooks/dist/lib/review-coverage.js`
- `hooks/dist/lib/staging-drift.js`
- `fusion-workbench/shared/issues/260817-2110_c_*.md` (Resolved note, `_o_` -> `_c_`)

Nothing was staged or committed.
