/**
 * The session-state drift check, printed for a human or an agent to read.
 *
 * The computation is `lib/state-drift.ts`; this is one of its three callers.
 * The other two are `hooks/tracker.ts` (the PostToolUse hook, which runs it
 * unasked on every guarded tool call) and `bin/monitor` (which surfaces the
 * `state_drift` events rather than measuring a second time). Read that module's
 * header for the defect and for why the check is a program rather than a
 * paragraph in an agent prompt.
 *
 * Called through `bin/fusion-state-drift` by `/fusion:setup` Step 1 on the
 * user-triggered resume path, by `agents/orchestrator.md` `### Drift check`,
 * and by anyone at a terminal who wants to know whether a running session's
 * numbers can be believed.
 *
 * Output, one `KEY=value` per line in the shape `bin/fusion-paths`,
 * `bin/fusion-count-sources` and `bin/fusion-churn-rank` use, then one line per
 * row:
 *
 *   anchor=workbench-root
 *   state=present
 *   rows=5
 *   drift=2
 *   verdict=drift
 *     progress.commits       surface=0                record=12 (git 8960e1a..HEAD)  DRIFT
 *     progress.turn          surface=1                record=3 (turn_start events this session)  DRIFT
 *     session.history_file   surface=shared/…         record=present (on disk)
 *
 * ## Exit codes, and the one that is deliberately NOT here
 *
 *   0  the check ran. `verdict=` says what it found.
 *   1  usage error.
 *   2  no fusion workbench above the working directory; nothing to check.
 *
 * **Finding drift is not an error exit.** The predecessor of this program was a
 * shell block inside `agents/orchestrator.md`, and its last line handed the
 * whole block's status to a guard that was false on the ordinary session with
 * no Circle active — so the check reported failure in the situation where
 * nothing was wrong (issue `260810-0710`). A check that cries wolf on its
 * commonest path teaches its reader to ignore its status, which is the failure
 * this check exists to catch arriving one level up. The verdict is a line of
 * output, where a reader can see which row produced it; the exit code says only
 * whether the check itself could run.
 */
export {};
