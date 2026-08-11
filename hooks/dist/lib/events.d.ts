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
 * `state_drift` is the one entry here that is also emitted by something other
 * than a hook. `agents/orchestrator.md` emits it into
 * `fusion-workbench/orchestrator-events.jsonl` when its own Drift check finds a
 * diverging row; `hooks/tracker.ts` emits it here, into
 * `.guard-state/events.jsonl`, when the same measurement fires without being
 * asked. One concept, one name, two logs — the monitor reads the guard log for
 * its warnings panel and the orchestrator log for its event list, so a drift is
 * visible in the panel whichever caller measured it.
 */
export type GuardEventType = "guard_allow" | "guard_block" | "guard_halt" | "guard_advisory" | "guard_error" | "halt_cleared" | "churn_warning" | "churn_critical" | "state_drift" | "review_coverage" | "tracker_record";
export interface GuardEvent {
    ts: string;
    event: GuardEventType;
    tool?: string;
    file?: string;
    detail?: string;
}
/** Append a single event to the JSONL log. No-op if no workbench is found. */
export declare function emitEvent(event: GuardEventType, tool?: string, file?: string, detail?: string): void;
