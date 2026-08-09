/**
 * Where a hook's verdict stands relative to the record of it.
 *
 * ## The order is the whole point
 *
 * A hook's contract with Claude Code is one line on stdout. Everything else it
 * does — the `guard_block` row in `events.jsonl`, the escalation counter under
 * `.guard-state/`, the churn heatmap, the marker line on stderr — is a report
 * ABOUT that line, written for a human reading the log afterwards. Reports are
 * best effort; the verdict is not. A record must not be able to withdraw what it
 * records.
 *
 * Both hooks used to write the report first:
 *
 *     emitEvent("guard_error", …);   // appends to .guard-state/events.jsonl
 *     process.stderr.write(…);
 *     allow();                       // ← never reached
 *
 * `emitEvent` appends under `fusion-workbench/.guard-state/`, which is where
 * nearly every write these hooks make goes — so it is also the likeliest thing
 * to have thrown in the first place. With that directory unwritable the emit
 * threw again inside the handler, `allow()` never ran, and the process exited 1
 * with empty stdout: measured at `exit=1, STDOUT: []` on both hooks
 * (`shared/issues/260809-1109_*_both-hooks-fail-silent-instead-of-open-….md`).
 * The recovery path depended on the resource whose failure it was recovering
 * from, so the one error class most likely to occur was the one class it could
 * not survive. What Claude Code makes of a hook that exits non-zero saying
 * nothing was never measured; both readings are bad, and the ambiguity is not
 * worth keeping either way.
 *
 * So: verdict first, unguarded, and every reporting step after it in a `try` of
 * its own. A failure in the reporting cannot withdraw a verdict that has already
 * been written.
 *
 * ## Why this module is no longer only the error tail
 *
 * It was written for the two `main().catch` handlers, and there it was complete.
 * The same inversion sat untouched at every site INSIDE `main`, on both hooks —
 * `saveEscalation` before `block`, `emitEvent` before `block`, `trackChurn`
 * before `respond`. Four of those turned a verdict the guard had already reached
 * into its opposite, all four measured with `.guard-state/` at mode `0555` or
 * with `churn.json` replaced by a directory:
 *
 *   - the protected-path deny and the decision-governed deny
 *     (`shared/issues/260809-1825_*_an-unwritable-guard-state-directory-….md`),
 *   - the halt refusing a write, which fails through `emitEvent` rather than
 *     through `saveEscalation` — the same class reached by a different call,
 *   - the git branch deny, the one policy that runs in every repository
 *     including this one
 *     (`shared/issues/260809-2046_*_the-git-branch-deny-is-a-fourth-fail-open-site-….md`),
 *   - and the protected-path halt's explanation, which the churn heatmap
 *     discarded on its way out
 *     (`shared/issues/260809-2045_*_the-churn-half-still-runs-before-the-reply-….md`).
 *
 * A fix that reordered those four sites one at a time would leave the fifth for
 * the next review, which is what produced two records for one defect the last
 * time. So the argument stated above is the mechanism now: `answer` is the
 * ordinary path's spelling of "verdict first, reporting after", and
 * `bestEffort` is the same guarantee for a report that cannot be moved after the
 * verdict — a configuration diagnostic, an advisory in the middle of a decision
 * — where the point is not the order but that the step can no longer decide
 * anything.
 *
 * ## Why the reporting steps are guarded separately
 *
 * They fail independently. `emit` writes to the state directory; the stderr line
 * does not touch it, so a dead state directory must not cost the diagnostic that
 * says why. One `try` around both would let the first failure take the second
 * step with it — the same swallowing, one level down. `answer` guards each of
 * its reports on its own for exactly this reason: an unwritable `escalation.json`
 * must not also cost the `events.jsonl` row.
 *
 * A guarded step that fails is NOT silent: it writes the same `[<tag>] Error:`
 * marker line the fail-open tail writes, so a report that was lost is visible in
 * the same place a crash would have been (`HYG-NO-SILENT-FAIL`). Only when
 * stderr itself is broken does anything go unsaid, and by then the verdict —
 * the part that had to survive — is already out.
 *
 * ## Why `verdict` is a callback rather than a returned string
 *
 * The call sites write different bodies — the guard's bare `{}`, its
 * `{"decision":"block"}`, the tracker's optional PostToolUse envelope, the
 * SessionStart hook's `{}` — and each already owns a function that writes its
 * own. Passing that function keeps the shape of a hook's reply where the hook
 * defines it, while this module owns the one thing all of them got wrong, which
 * is the order.
 *
 * There is a second reason it must run here rather than at the call site: on a
 * pipe, `process.stdout.write` is asynchronous. A throw after it, in the same
 * tick, can take the buffered line down with the process — so "write the verdict
 * first" is only worth anything if nothing after it is allowed to throw. That is
 * what makes `answer`'s guarded reports a requirement rather than tidiness.
 */
/**
 * Run one best-effort step: it may fail, and its failure decides nothing.
 *
 * Returns the failure as a string, or null when the step succeeded. Most callers
 * ignore the result — the point is the guarantee, not the value — but the
 * tracker's halt record reads it, because the sentence it hands the model would
 * otherwise claim a halt that was never written.
 *
 * Use this where a report genuinely cannot be moved after the verdict: a
 * configuration diagnostic that has to precede every branch, an advisory emitted
 * in the middle of a decision, a state write whose outcome the verdict's own
 * wording depends on. Where the report CAN follow the verdict, use `answer`,
 * which puts it there.
 */
export declare function bestEffort(tag: string, step: () => void): string | null;
/**
 * Write the hook's verdict, then record it.
 *
 * @param tag     Hook name for the stderr marker line, e.g. `guard`.
 * @param verdict Writes the hook's reply to stdout. Called FIRST and NOT
 *                guarded: if the reply itself cannot be written there is nothing
 *                left to fall back to, and the failure belongs on the way out to
 *                `main().catch`.
 * @param reports Everything that records the verdict — the escalation counter,
 *                the event rows, the churn heatmap. Each runs in its own `try`,
 *                in order, and none can withdraw the verdict or take another
 *                report down with it.
 */
export declare function answer(tag: string, verdict: () => void, ...reports: Array<() => void>): void;
/**
 * Write a hook's fail-open verdict, then report the error that caused it.
 *
 * @param tag    Hook name for the stderr marker line, e.g. `guard`. The test
 *               harness watches for `[<tag>] Error:` so a crash cannot pass as a
 *               quiet run.
 * @param err    Whatever was thrown.
 * @param verdict Writes the hook's reply to stdout. Called FIRST and NOT
 *               guarded: if the reply itself cannot be written there is nothing
 *               left to fall back to, and the failure belongs on the way out.
 * @param emit   Optional event-log write. Best effort.
 */
export declare function failOpen(tag: string, err: unknown, verdict: () => void, emit?: () => void): void;
