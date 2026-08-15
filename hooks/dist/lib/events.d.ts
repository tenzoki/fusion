/**
 * Append-only event logger for the Compliance Guard.
 *
 * Writes JSONL to state/events.jsonl. Each line is a self-contained
 * JSON object with timestamp, event type, and context.
 *
 * No-op when no fusion workbench is set up at or above the current
 * working directory (i.e. the project never ran `/fusion:setup`).
 */
/**
 * What a hook may write. It is the EMITTER's vocabulary, not the reader's, and
 * that distinction decided the one removal it has had.
 *
 * `state_drift` sat here until 2026-08-15 and was the one entry also emitted by
 * something other than a hook: `agents/orchestrator.md` wrote it into
 * `fusion-workbench/orchestrator-events.jsonl` at its own Drift check, and
 * `hooks/tracker.ts` wrote it here, into `.guard-state/events.jsonl`, when the
 * same measurement fired without being asked. Both emitters went with the
 * session counters that were the measurement's subject, so no code can produce
 * the value and it has no place in a union that says what may be produced.
 *
 * **`bin/monitor` still styles `state_drift`, and that is not an inconsistency
 * to tidy up.** It reads an append-only log holding real rows written before
 * the removal, so it is a reader of data that exists; this union is a writer's
 * vocabulary for data nothing can create. Deleting the monitor's arm would
 * render those rows at the amber default and tell the user less about them.
 */
export type GuardEventType = "guard_allow" | "guard_block" | "guard_halt" | "guard_advisory" | "guard_error" | "halt_cleared" | "review_coverage" | "staging_drift" | "tracker_record";
export interface GuardEvent {
    ts: string;
    event: GuardEventType;
    tool?: string;
    file?: string;
    detail?: string;
}
/**
 * Append a single event to the JSONL log. No-op if no workbench is found.
 *
 * **There is no line or byte ceiling here, and none may be added.** Not as a
 * convenience, not as a "reasonable default", not as part of an unrelated
 * change. Every ceiling expressible in lines or bytes discards the OLDEST lines
 * first, and the oldest lines are the `guard_block`, `guard_halt` and
 * `halt_cleared` events — 0.6 % of the file at the measurement that settled
 * this, and the only lines recording the guard ever enforcing anything. A guard
 * that forgets it halted is a strange guard.
 *
 * What bounds the file instead is `/fusion:archive`, which rolls the live log
 * into the archive store under a dated name and starts a fresh empty one. The
 * log is classified as evidence, not telemetry, in
 * `rules/fusion-workbench-conventions.md` `### Which of them a tracked
 * workbench tracks`; the reasoning and the three rejected alternatives are in
 * decision
 * `shared/decisions/260811-1534_*_does-the-guard-event-log-get-an-upper-bound-and-what-happens-to-the-evidence-in-it.md`.
 *
 * A roll may move the file out from under this function between calls. That is
 * safe by construction: it opens, appends and closes on every call rather than
 * holding a descriptor, and `mkdirSync` + `appendFileSync` re-create both the
 * directory and the file.
 */
export declare function emitEvent(event: GuardEventType, tool?: string, file?: string, detail?: string): void;
