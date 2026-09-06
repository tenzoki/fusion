/**
 * Compliance Guard — PostToolUse hook for Claude Code.
 *
 * Three jobs, each on its own narrow trigger, and NONE of them on the
 * every-tool-call path:
 *
 *   0a. REVIEW COVERAGE, on one narrow trigger: a review file landing under a
 *      `reviews/` store. It tiles the review files' declared ranges against the
 *      session's commit range and names, commit by commit, what no reviewer has
 *      opened — plus the files the last pass declared it did not open, which are
 *      the next dispatch's scope. An uncovered range mid-Turn is the normal
 *      state, and a check that fires on its commonest path is one its reader
 *      learns to ignore. See lib/review-coverage.ts and
 *      `measureReviewCoverageForModel`.
 *
 *   0b. STAGING DRIFT, on one measured trigger: HEAD is not where it was on the
 *      previous tool call. It reads `git status --porcelain` over the workbench
 *      and names the authored records — and any commit-message-shaped file that
 *      landed inside the workbench where no artifact store owns it — that the
 *      commit just made did not carry. Same reason for the narrow trigger: an
 *      unstaged record mid-Turn is the normal state, and the moment a missed
 *      record becomes a missed record is the commit. The trigger is READ FROM
 *      THE REPOSITORY, never from the command's text — deciding from a shell
 *      string whether it will move HEAD is the question the deleted branch
 *      policy answered wrong 24 times. See lib/staging-drift.ts and
 *      `measureStagingDriftForModel`.
 *
 *   0c. CITATION FORM, on one narrow trigger: a `.md` record landing anywhere
 *      under the workbench. It hands the file to the one citation grammar
 *      (lib/citation-scan.ts) and reports, on the lines THIS call wrote, the
 *      citations spelled in a form the project retired. Same reason for the
 *      narrow trigger and the narrow scope: an ordinary record write is silent,
 *      and reporting the whole corpus would report somebody else's violation at
 *      this writer's keystroke. See lib/citation-form.ts and
 *      `measureCitationFormForModel`.
 *
 * Three jobs left before them and none was replaced. A job 0 ran on EVERY
 * guarded tool call until 2026-08-15: session-state drift, comparing
 * `agentstate.yaml`, the active Circle's Turn log and the session history file
 * with git and `orchestrator-events.jsonl`. Its subject was the hand-maintained
 * session counters, and it went with them — every firing it ever produced in
 * either measured project was `progress.commits` disagreeing with a number the
 * check derived from `git rev-list` in order to compare against it, so removing
 * the hand-written copy removed the measurement's subject. **Nothing is on the
 * every-tool-call path now.** An ordinary write at an unremarkable path reaches
 * no measurement here at all, and what stops being noticed is stated in that
 * removal's history entry rather than left to be discovered: a dangling
 * `session.history_file`, a history file whose Directive disagrees with the
 * state file's, and a Circle record whose Turn log has frozen. A job 1 sat
 * between the measurements and job 2 until 2026-08-12: a second fingerprint of
 * every path on `guard.protectedPaths`, compared against the one `guard.ts`
 * took before the tool ran, with anything that changed written back and the
 * guard halted — see `guard.ts`'s header for the measurement that decided it. A
 * job 2 sat after them until 2026-08-15: the churn heatmap, which recorded every
 * write-tool file mutation under `.guard-state/churn.json` and emitted
 * `churn_warning` / `churn_critical` at configured per-session thresholds. It
 * warned and never blocked, nothing downstream acted on a warning, and it went
 * with its ranking helper and its configuration leaves. A protected path is not
 * watched, restored or reported, and a thrashed file is not counted, by this
 * hook or any other.
 *
 * The plugin-repo stand-down that used to sit in `main` went with churn. Its
 * whole subject was churn — a fusion developer's own edits are not churn signal
 * — and the measurements above were deliberately placed AHEAD of it because
 * each is anchored at the workbench root and each was measured in this very
 * repository. With churn gone there is nothing here to stand down. Nothing
 * stands down in `guard.ts` either: its own stand-down went on 2026-08-16 with
 * the last verdict it had to suppress, so no hook fusion ships treats its own
 * repository as a special case. `hooks/lib/self-detect.ts` survives without a
 * caller, carrying the rule that decides which directory a future stand-down
 * would have to ask.
 *
 * ## What a PostToolUse hook can and cannot do
 *
 * It cannot BLOCK: the tool has already run, and no response undoes that. That
 * much of this header was always true and still is.
 *
 * It CAN return explanatory text to the model, which this header used to deny.
 * `hookSpecificOutput.additionalContext` is documented as being inserted next to
 * the tool result so the conversation continues and Claude can act on it, and it
 * was measured doing exactly that against Claude Code 2.1.224: the string comes
 * back to the model in a system-reminder reading `PostToolUse:Bash hook
 * additional context: <text>`.
 *
 * That distinction is load-bearing rather than trivia. It was established for
 * the removed job 1, where a revert the model never heard about would have
 * satisfied the mechanism and violated the constraint that an agent must never
 * meet an unexplained failure. The three measurements that remain say nothing
 * ELSE tells the model — a frozen `agentstate.yaml`, an unreviewed commit range,
 * a record the commit did not carry — so the channel is the whole of their
 * effect rather than an explanation attached to one.
 *
 * ## The reply is written before anything records it
 *
 * The reply goes out first and the event rows after it. Each measurement runs
 * through `bestEffort` from lib/fail-open.ts, so none of them can discard the
 * sentence on its way out. The churn half used to run ahead of the reply and did
 * exactly that; lib/fail-open.ts's header carries the class and the
 * measurements, and the ordering rule outlives the half that was measured on.
 *
 * Protocol: reads JSON from stdin, writes {} to stdout, or a
 * `hookSpecificOutput.additionalContext` envelope when a measurement has
 * something to say.
 */
export {};
