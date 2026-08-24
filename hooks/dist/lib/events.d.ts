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
 * that distinction has decided every removal it has had.
 *
 * `state_drift` sat here until 2026-08-15 and was the one entry also emitted by
 * something other than a hook: `agents/orchestrator.md` wrote it into
 * `fusion-workbench/orchestrator-events.jsonl` at its own Drift check, and
 * `hooks/tracker.ts` wrote it here, into `.guard-state/events.jsonl`, when the
 * same measurement fired without being asked. Both emitters went with the
 * session counters that were the measurement's subject, so no code can produce
 * the value and it has no place in a union that says what may be produced.
 *
 * `guard_block`, `guard_halt` and `halt_cleared` left on 2026-08-16 under that
 * same reading, and they left as one set because one removal retired all three
 * emitters. The guard stopped deciding: the two checks that could block a
 * write-tool call, the `emitBlockEvent` helper beneath them and the halt they
 * raised on the third consecutive block were all removed from
 * `hooks/guard.ts`, and nothing else ever emitted the first two.
 * `halt_cleared` had a single emitter, `hooks/clear-halt.ts`, the manual
 * remedy for that halt; it went with the entry point and with
 * `lib/escalation.ts`, the state module both of them read. A halt no code can
 * raise needs no clearing verb, so the value that recorded the clearing has as
 * little claim on this union as the two that recorded the halt.
 *
 * **`bin/monitor` still styles `state_drift`, `guard_block` and `guard_halt`,
 * and that is not an inconsistency to tidy up.** It reads an append-only log
 * holding real rows written before the removals, so it is a reader of data that
 * exists; this union is a writer's vocabulary for data nothing can create.
 * Deleting the monitor's arms would render those rows at the amber default and
 * tell the user less about them.
 */
export type GuardEventType = "guard_allow" | "guard_advisory" | "guard_error" | "review_coverage" | "staging_drift" | "tracker_record";
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
 * What bounds the file instead is the archive step of `/fusion:cleanup`
 * (`--only archive`), which rolls the live log
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
