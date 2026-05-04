/**
 * Append-only event logger for the Compliance Guard.
 *
 * Writes JSONL to state/events.jsonl. Each line is a self-contained
 * JSON object with timestamp, event type, and context.
 */
export type GuardEventType = "guard_allow" | "guard_block" | "guard_halt" | "guard_advisory" | "guard_error" | "halt_cleared" | "churn_warning" | "churn_critical" | "cross_file_warning" | "cross_file_critical" | "tracker_record";
export interface GuardEvent {
    ts: string;
    event: GuardEventType;
    tool?: string;
    file?: string;
    detail?: string;
}
/** Append a single event to the JSONL log. */
export declare function emitEvent(event: GuardEventType, tool?: string, file?: string, detail?: string): void;
/** Get the events file path (for external tools). */
export declare function getEventsPath(): string;
