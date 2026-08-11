/**
 * Compliance Guard — PostToolUse hook for Claude Code.
 *
 * Three jobs, in this order:
 *
 *   0. SESSION-STATE DRIFT. Compare `agentstate.yaml`, the active Circle's Turn
 *      log and this session's history file with the two records that cannot
 *      silently freeze — git, and `orchestrator-events.jsonl`. A surface that
 *      has stopped being written is named back to the model. It runs first and
 *      ahead of the plugin-repo stand-down, because unlike the other two it is
 *      anchored at the workbench root and is needed in fusion's own repository
 *      most of all. It writes nothing but its own throttle record. See
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
 *      and names the authored records — and any commit-message file that landed
 *      inside the workbench — that the commit just made did not carry. Like 0b
 *      it is not on the every-tool-call path: an unstaged record mid-Turn is the
 *      normal state, and the moment a missed record becomes a missed record is
 *      the commit. The trigger is READ FROM THE REPOSITORY, never from the
 *      command's text — deciding from a shell string whether it will move HEAD
 *      is the question the deleted branch policy answered wrong 24 times. See
 *      lib/staging-drift.ts and `measureStagingDriftForModel`.
 *
 *   1. MEASURE THE PROTECTED PATHS. Take a second fingerprint of every path on
 *      `guard.protectedPaths` and compare it with the one `guard.ts` recorded
 *      before the tool ran. Anything that changed is written back to what the
 *      before-fingerprint holds, the guard is halted, and the model is told
 *      which file and why. This is the guard's actual enforcement of those
 *      paths, and it replaced a classifier that tried to predict, from a shell
 *      command's text, which files the command would write. See
 *      lib/protected-snapshot.ts.
 *   2. CHURN. Record write-tool file mutations in the churn heatmap, emitting
 *      warning/critical events at the configured per-session thresholds.
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
 * That distinction is load-bearing rather than trivia. The binding decision
 * makes the EXPLAINING refusal a constraint, because an agent that meets an
 * unexplained failure works around it, and that failure mode is the reason the
 * rule file exists. A revert the model never hears about would satisfy the
 * mechanism and violate the constraint.
 *
 * ## The reply is written before anything records it
 *
 * The enforcement — the restore — has to happen first; it is what the sentence
 * is about. Everything after that is a report: the `guard_block` rows, the halt
 * record, the churn heatmap. Each goes through `answer` or `bestEffort` from
 * lib/fail-open.ts, so none of them can discard the sentence on its way out. The
 * churn half used to run ahead of the reply and did exactly that; that module's
 * header carries the class and the measurements.
 *
 * Protocol: reads JSON from stdin, writes {} to stdout, or a
 * `hookSpecificOutput.additionalContext` envelope when something was restored.
 */
export {};
