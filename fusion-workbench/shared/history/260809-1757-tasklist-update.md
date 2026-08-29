# Tasklist update — ten guard defects queued

**Agent:** taskplanner (domain `code`)
**When:** 2026-08-09 17:57
**Wrote:** `fusion-workbench/tasklist.md` (created; no previous queue existed)

## What was scanned

Scope was restricted by the dispatch to ten named defect records in
`fusion-workbench/shared/issues/`. No general workbench scan was performed: the plan store,
the decision store, the review stores and the other 74 files in the issue store were
deliberately not inventoried. The queue says so in its own header, so a later reader does
not mistake it for a full picture.

All ten records were read in full. Every code line, string and file each record cites was
then checked against the working tree at `6b94e17`, rather than trusting the reconciliation
notes the records already carry.

## Result

Ten open tasks extracted, nine ready and one blocked. All ten route to `coder`; no
`ontocoder` work was found, and no task had to be forced into that routing.

None of the ten is already fixed. None duplicates another. Two pairs are adjacent enough to
look like duplicates and are not: tasks 1 and 9 both edit the two guard state modules but
treat an unvalidated JSON shape and a monotonic counter respectively, and tasks 2 and 7
both edit the two hook entrypoints but treat the top-level error handler and the escalation
read-modify-write.

Task 9 (the latching churn and cross-file criticals) is blocked and stays blocked. Its own
record says a decision precedes the fix, and the three candidate options — a reset boundary,
dropping the total-level thresholds, or removing cross-file outright — are mutually
exclusive, with removal of a shipped observation surface among them. No decision record
exists for it, and the queue does not invent one: the task's first action is to file the
question and stop.

## Ordering

Eight dependencies were recorded. Five come from file collisions turned into explicit
sequencing so no two tasks editing one file sit adjacent and independent, and each gets its
own commit: tasks 3, 4 and 6 form a chain over `hooks/lib/git-branch-guard.ts` and
`hooks/lib/__tests__/git-branch-guard.test.ts`; task 7 follows task 2 over `hooks/guard.ts`
and `hooks/tracker.ts`; task 8 follows task 5 over `hooks/lib/__tests__/config.test.ts`;
task 9 follows tasks 1, 7 and 8.

Three are content dependencies, all landing on task 10, the rule-text correction. The
dispatch asked for this one to be verified rather than assumed, and it holds on two
independent grounds. Task 6's own acceptance criterion 3 edits
`rules/git-branch-discipline.md`, so the two collide on the file. Separately, `## Why` in
that file currently names the case-folding defect as a measured defect standing open, and
the wrapper-resolution paragraph has to be corrected with that defect taken into account —
so once task 3 lands, the text task 10 must write is different. The dependency on task 4 is
weaker and is labelled as such in the queue: the file carries no heredoc text today
(checked), so it is a content dependency and not a collision. Task 10 is last.

`rules/protected-path-discipline.md` appears in the file set the dispatch derived by grep,
but no record among the ten asks for a change to it. Tasks 1 and 7 cite it as the contract
they restore. The queue records that distinction so an executor does not edit it
speculatively.

## Two routing notes carried into the queue

Task 8 (`.claude/rules/**` unprotected) has its load-bearing edit in `hooks/config.json`,
which by the letter of fusion's file-ownership split belongs to `ontocoder`. It is queued
to `coder` because the same change must move two TypeScript comments in
`hooks/lib/rules-write-exemption.ts` and two test files to stay coherent. The alternative
split is written into the task for a caller who wants it.

Task 10 is filed with domain `knowledge` because its artifact is rule text. It is queued to
`coder` because the correction is a statement about what the classifier does after tasks 3,
4 and 6, and only the agent that changed it can write that accurately.

## Verification carried into the tasks

Where a record named a test file or a fixture, it became an acceptance criterion: the
`451a07e` corpus baseline and its 145-to-142 count for task 6, the real-subprocess harness
with an unwritable state directory for task 2, the shipped-protected-list assertion in
`config.test.ts` for task 8, and the `260716-2005_*_branch-guard-false-positive-on-markdown-backticks-in-heredoc.md` quoted-heredoc cases that must stay
green for task 4. Two records name work that must explicitly not be done — the
prose-allow-list for task 4, and implementing before deciding for task 9 — and both
prohibitions are stated in the task rather than left in the source record.
