/**
 * Compliance Guard — PostToolUse hook for Claude Code.
 *
 * Three jobs, in this order:
 *
 *   0. SESSION-STATE DRIFT. Compare `agentstate.yaml`, the active Circle's Turn
 *      log and this session's history file with the two records that cannot
 *      silently freeze — git, and `orchestrator-events.jsonl`. A surface that
 *      has stopped being written is named back to the model. It runs first
 *      because, unlike the other two, it has something to say on every guarded
 *      tool call. It writes nothing but its own throttle record. See
 *      lib/state-drift.ts and `measureStateDriftForModel` below.
 *
 *   0b. REVIEW COVERAGE, on one narrow trigger: a review file landing under a
 *      `reviews/` store. It tiles the review files' declared ranges against the
 *      session's commit range and names, commit by commit, what no reviewer has
 *      opened — plus the files the last pass declared it did not open, which are
 *      the next dispatch's scope. It is deliberately NOT on the every-tool-call
 *      path job 0 sits on: an uncovered range mid-Turn is the normal state, and
 *      a check that fires on its commonest path is one its reader learns to
 *      ignore. See lib/review-coverage.ts and `measureReviewCoverageForModel`.
 *
 *   0c. STAGING DRIFT, on one measured trigger: HEAD is not where it was on the
 *      previous tool call. It reads `git status --porcelain` over the workbench
 *      and names the authored records — and any commit-message-shaped file that
 *      landed inside the workbench where no artifact store owns it — that the
 *      commit just made did not carry. Like 0b
 *      it is not on the every-tool-call path: an unstaged record mid-Turn is the
 *      normal state, and the moment a missed record becomes a missed record is
 *      the commit. The trigger is READ FROM THE REPOSITORY, never from the
 *      command's text — deciding from a shell string whether it will move HEAD
 *      is the question the deleted branch policy answered wrong 24 times. See
 *      lib/staging-drift.ts and `measureStagingDriftForModel`.
 *
 * Two jobs left before them and neither was replaced. A job 1 sat between 0c and
 * 2 until 2026-08-12: a second fingerprint of every path on
 * `guard.protectedPaths`, compared against the one `guard.ts` took before the
 * tool ran, with anything that changed written back and the guard halted. It was
 * the enforcing half of the protected-path mechanism, and the whole mechanism
 * was removed — see `guard.ts`'s header for the measurement that decided it. A
 * job 2 sat after them until 2026-08-15: the churn heatmap, which recorded every
 * write-tool file mutation under `.guard-state/churn.json` and emitted
 * `churn_warning` / `churn_critical` at configured per-session thresholds. It
 * warned and never blocked, nothing downstream acted on a warning, and it went
 * with its ranking helper and its configuration leaves. A protected path is not
 * watched, restored or reported, and a thrashed file is not counted, by this
 * hook or any other.
 *
 * The plugin-repo stand-down that used to sit in `main` went with it. Its whole
 * subject was churn — a fusion developer's own edits are not churn signal — and
 * the three measurements above were deliberately placed AHEAD of it because each
 * is anchored at the workbench root and each was measured in this very
 * repository. With churn gone there is nothing here to stand down, and the
 * remaining stand-down in `guard.ts` asks a different directory (cwd, via
 * `isFusionPluginCwd()`) for a different mechanism.
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
