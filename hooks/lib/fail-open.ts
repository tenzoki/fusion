/**
 * The fail-open tail every hook entry point ends with.
 *
 * ## The order is the whole point
 *
 * A hook's contract with Claude Code is one line on stdout. Everything else it
 * does — the `guard_error` row in `events.jsonl`, the marker line on stderr — is
 * a report ABOUT that line, written for a human reading the log afterwards.
 * Reports are best effort; the verdict is not.
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
 * ## Why the reporting steps are guarded separately
 *
 * They fail independently. `emit` writes to the state directory; the stderr line
 * does not touch it, so a dead state directory must not cost the diagnostic that
 * says why. One `try` around both would let the first failure take the second
 * step with it — the same swallowing, one level down.
 *
 * A guarded step that fails is silent by construction, and that is bounded
 * rather than careless: whatever is left still runs, and at least one of the two
 * channels carries the error unless both are broken at once (`HYG-NO-SILENT-FAIL`
 * asks that a failure not be hidden, not that it be reported through a channel
 * that is itself down).
 *
 * ## Why `verdict` is a callback rather than a returned string
 *
 * The three call sites write different bodies — the guard's bare `{}`, the
 * tracker's optional PostToolUse envelope, the SessionStart hook's `{}` — and
 * each already owns a function that writes its own. Passing that function keeps
 * the shape of a hook's reply where the hook defines it, while this module owns
 * the one thing all three got wrong, which is the order.
 *
 * There is a second reason it must run here rather than at the call site: on a
 * pipe, `process.stdout.write` is asynchronous. A throw after it, in the same
 * tick, can take the buffered line down with the process — so "write the verdict
 * first" is only worth anything if nothing after it is allowed to throw.
 */

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
export function failOpen(
  tag: string,
  err: unknown,
  verdict: () => void,
  emit?: () => void,
): void {
  verdict();

  if (emit !== undefined) {
    try {
      emit();
    } catch {
      // The state directory is unwritable — the likeliest reason `err` exists at
      // all. The stderr line below is the report that survives it.
    }
  }

  try {
    // `String(err)` rather than a template literal: a thrown symbol makes the
    // literal throw, and a handler that throws on an exotic value is the defect
    // this module exists to remove.
    process.stderr.write(`[${tag}] Error: ${String(err)}\n`);
  } catch {
    // stderr is closed or broken. The verdict is already out, which is the part
    // that had to survive.
  }
}
