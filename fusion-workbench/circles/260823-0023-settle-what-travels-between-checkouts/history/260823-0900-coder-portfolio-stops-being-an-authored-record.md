# Coder session: the classifier and the orchestrator's class table stop calling `portfolio.md` an authored record

**Date:** 2026-08-23
**Agent:** coder
**Domain:** code
**Circle:** `circles/260823-0023-settle-what-travels-between-checkouts`
**Task:** not a numbered plan step. The user widened the Circle's scope at the plan gate to close
`circles/260823-0023-settle-what-travels-between-checkouts/issues/260823-0800_c_two-further-surfaces-classify-portfolio-md-as-an-authored-record.md`.
**Status:** Complete

## The finding, taken before anything was changed

The dispatch asked whether a `record` row for `portfolio.md` now reaches every Turn boundary and
every Cleanup, telling the orchestrator to stage a file git is instructed to ignore. It does not, and
the reason is the measurement's own command rather than the classifier.

`measureStagingDrift` runs `git status --porcelain --untracked-files=all -- <workbench>` with no
`--ignored` flag. `00ce4f0` untracked `fusion-workbench/portfolio.md` and gave it an ignore rule in
the same commit, so git omits the path from that output entirely. Verified at HEAD `3ee8eaf` by
running the command: the only row it returns under the workbench is `orchestrator-events.jsonl`, and
adding `--ignored` is what makes `!! fusion-workbench/portfolio.md` appear. `classify` is never
called with the path in this checkout.

`classify` is a pure function on a path, though, and it did still answer `record`. The reachable case
is a consuming project that tracks its own workbench: fusion ships no ignore rule for
`portfolio.md`, so the path reaches `git status` there, and the classification told that project to
stage a file `rules/workbench-tracking.md` places in class L. That is the ground the change stands
on. It is a correctness fix in the general case, not the repair of a misfire in this repository, and
saying so is the difference between a verified claim and an inherited one.

## What was changed

**`hooks/lib/staging-drift.ts`.** The `portfolio.md` entry moved from `ROOT_RECORDS` to `LIVE_STATE`,
carrying the reason `regenerated in full by every playmaker run`. `classify` therefore returns
`in-flight`, which no path in the module can turn into a fault, a signature entry or a sentence to
the model. Three comment passages moved with it: the header's `record` bullet no longer names the
file, the `LIVE_STATE` doc comment reads `the first six` and names class L rather than quoting the
retired two-group split, and the `ROOT_RECORDS` doc comment carrying `not machine-refreshed` was
replaced. That phrase now matches nothing under `hooks/`, `agents/`, `rules/` or `skills/`.

`ROOT_RECORDS` is kept, empty, with its branch in `classify` intact. The defect record proposed
removing both; the dispatch chose otherwise, and the new comment states the reason in the file: the
workbench root is where a new surface arrives, and the next authored one there should cost a line in
a list rather than a design decision taken a second time.

**`agents/orchestrator.md`.** The staging-check class table's `record` row drops `portfolio.md` and
keeps `a Circle record, or anything under an artifact store`. Nothing of the rule's reasoning was
restated there.

## Tests, and the account of leaving the dispatch's file list

The dispatch named three files and required an accounting for anything beyond them. Three test-side
files were touched, all of them forced by the acceptance criterion that `npm test` be green.

- `hooks/lib/__tests__/staging-drift.test.ts`. `portfolio.md` was the suite's stand-in for an
  authored record in nine cases, not the three the defect record estimated. The stand-in is now a
  Circle record behind one constant, `CIRCLE_RECORD`, which incidentally gives the `*_circle.md`
  branch of `classify` its first coverage. `portfolio.md` stays in the fixture and is now pinned as
  `in-flight` in the do-not-cry-wolf case, with its reason asserted.
- `hooks/lib/__tests__/commit-message-path.test.ts`. One line of a negative control asserted
  `classify("portfolio.md", "").klass === "record"` as its example of an ordinary record. It reads a
  store path now. Line-neutral.
- `hooks/lib/__tests__/fixtures/surface-growth.golden`. Regenerated with `UPDATE_SURFACE_GOLDEN=1`,
  because it records the size of every file in a bounded surface and two of them changed. The diff is
  four numbers: `orchestrator.md` and the agents total down 16 bytes each, `staging-drift.test.ts`
  and the hook-test total up 14 lines each.

`hooks/dist/lib/staging-drift.js` and `.d.ts` were rebuilt with `npm run build`, since
`committed-dist.test.ts` fails when the committed `dist/` is not the compilation of the committed
source.

## Budgets

Both bounds measured after the edit, by the same arithmetic `helpers/growth-bound.ts` uses
(`total > floor + headRoom`, so a shrink elsewhere in the surface offsets):

| Surface | Before | After |
|---|---|---|
| `agents/` bytes free | 15 163 | 15 179 |
| hook-test lines free | 279 | 265 |

Nothing tripped. The `agents/` surface shrank by 16 bytes; the hook-test surface grew by 14 lines,
which is the pinned `in-flight` case and the constant's doc comment.

## Left standing

`hooks/staging-drift.ts:23`, the CLI's header comment, still shows a worked output example reading
`record M portfolio.md UNSTAGED (the Circle portfolio briefing - ...)`. That is output the classifier
can no longer produce. It is a third site, documentary rather than functional, that the defect record
did not name and this dispatch's file list did not cover. It is named in the record's `Resolved:`
note and wants the same one-line correction.

## Verification

`cd hooks && npm test` - exit 0. 41 test files, 724 tests, all passing.
