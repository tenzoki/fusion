/**
 * The review-coverage measurement, printed for a human or an agent to read.
 *
 * The computation is `lib/review-coverage.ts`; this is one of its two callers.
 * The other is `hooks/tracker.ts`, which runs it unasked when a review file
 * lands under a reviews store. Read that module's header for the defect
 * (issue `260810-1205` — seven commits reached a pushed tag unreviewed while
 * the session reported one) and for why the ranges had to be mandated in
 * `agents/coderev.md` and `agents/ontorev.md` before anything could read them.
 *
 * Called through `bin/fusion-review-coverage` by `agents/orchestrator.md` at
 * Step 3c (to widen the next review dispatch's scope) and at Phase 4 (to state
 * the session's coverage), and by anyone at a terminal who wants to know which
 * commits no reviewer has opened.
 *
 * Output, one `KEY=value` per line in the shape `bin/fusion-paths`,
 * `bin/fusion-churn-rank` and `bin/fusion-state-drift` use, then one line per
 * uncovered commit and one per review considered:
 *
 *   anchor=workbench-root
 *   since=8a49fd5
 *   head=HEAD
 *   commits=22
 *   reviews=3
 *   unusable=1
 *   uncovered=7
 *   verdict=uncovered
 *     uncovered 7785330 chore(workbench): the reconciler's annotations land
 *     review shared/reviews/260810-2110-…md range=da8c9db..b3cc034 not-opened=none covers=5
 *     review shared/reviews/260731-2247-…md range=(none recorded) … UNUSABLE (no **Reviewed-range:** line)
 *   carried=agents/orchestrator.md, skills/next/SKILL.md
 *   carried-from=shared/reviews/260810-2110-…md
 *
 * `carried=` is the acceptance criterion's second half: the files the last
 * review declared it did not open, which are the next dispatch's scope rather
 * than a footnote. It prints `none` when the last review opened everything, and
 * `(not recorded)` when no review carried the field at all — a recorded absence
 * and a missing line are different facts and are not merged.
 *
 * ## Exit codes, and the one that is deliberately NOT here
 *
 *   0  the check ran. `verdict=` says what it found.
 *   1  usage error.
 *   2  no fusion workbench above the working directory; nothing to check.
 *
 * **Finding an uncovered range is not an error exit**, for the reason
 * `hooks/state-drift.ts` gives at the same place: its predecessor handed a
 * verdict to an exit code and cried wolf on its commonest path (issue
 * `260810-0710`), and a check whose status is ignored is the failure it exists
 * to catch arriving one level up. Nor is it a release gate — whether a release
 * may go out over an uncovered range is an unfiled decision belonging beside
 * `shared/decisions/260810-0710_o_…`, and this program blocks nothing.
 */
export {};
