/**
 * Compliance Guard — PostToolUse hook for Claude Code.
 *
 * Two jobs, in this order:
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
 * Protocol: reads JSON from stdin, writes {} to stdout, or a
 * `hookSpecificOutput.additionalContext` envelope when something was restored.
 */
export {};
