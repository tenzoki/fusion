/**
 * The event log, read by the identity on each line rather than by position.
 *
 * ## The defect this answers
 *
 * `fusion-workbench/orchestrator-events.jsonl` is class R2 in
 * `rules/workbench-tracking.md` and carries `merge=union`, so after a pull it
 * holds two checkouts' lines with no ordering between the blocks. Every reader
 * of it treated the file as one session's chronology. The measurement in
 * `circles/260823-0023-settle-what-travels-between-checkouts/issues/260823-1302_*_the-monitor-attributes-a-merged-event-log-to-one-session-and-reports-another-checkouts-state.md`
 * establishes that sorting the file moves that reading from vague to wrong
 * rather than repairing it: neither position nor timestamp separates one
 * session's lines from another's.
 *
 * The repair is not a better inference. Each line carries the person and the
 * checkout that wrote it, so membership is **read off the line**. This module
 * is the two readings that follow from that, and nothing else.
 *
 * ## Why it is a pure function
 *
 * Everything here takes the log text, the reading identity and the current time
 * as arguments and returns a value. It opens no file, runs no subprocess, asks
 * nothing about git and phrases no sentence for a user. The identity is
 * obtained in exactly one place in the tree, `bin/fusion-identity`, and reaches
 * this module through `bin/fusion-events` as two strings. That is what lets
 * every case in the plan's `## Data Structures` table be a fixture string and
 * an assertion, with no git tree and no temporary workbench.
 *
 * ## The rule an absent identifier follows
 *
 * A line carrying no `checkout` counts as the reading checkout's own. The
 * existing log, 2331 lines when this was written, carries the field on no line,
 * no record is rewritten, and the degradation is exact: a reader that cannot
 * resolve its own identifier keeps every line and behaves as it did before this
 * module existed. The cost the user accepted with that rule is that another
 * checkout's pre-C4 lines, already merged in, read as this checkout's own. It
 * is bounded and shrinking, and it applies to no line written after.
 *
 * ## The one thing every consumer of this file gets wrong
 *
 * The emit convention writes `ts` as UTC **without** the `Z` designator, and
 * ECMA-262 parses such a string as local time. `CLAUDE.md`'s symptom table
 * carries the resulting off-by-the-user's-offset bug as a standing trap, and
 * `bin/monitor` grew a `parseUTCTs()` helper for it. `parseTs` below appends
 * the designator; nothing here calls `Date.parse` directly.
 */
/**
 * One line of the event log, after coercion.
 *
 * Every field is optional because every field is optional in the file: the
 * oldest lines carry `ts` and `event` alone, and `person`/`checkout` arrive
 * only with the schema `agents/orchestrator.md` `### 2. Structured Event Log`
 * declares. A field present with a non-string value is dropped rather than
 * coerced, so a malformed line degrades to the fields it did get right.
 */
export interface EventLine {
    ts?: string;
    event?: string;
    person?: string;
    checkout?: string;
    history_file?: string;
}
export interface ParsedLog {
    lines: EventLine[];
    /** Non-empty lines that were not a JSON object. Reported, never silent. */
    malformed: number;
}
/**
 * Parse the log text. A line that is not a JSON object is counted and skipped:
 * one truncated append must not cost a reader the rest of the file, and a
 * skipped line that nobody counts is the silent under-report this whole Circle
 * exists to remove.
 */
export declare function parseLog(text: string): ParsedLog;
/**
 * `ts` as milliseconds, or `null` when it is absent or unreadable.
 *
 * The designator is appended only when the string carries no zone of its own,
 * so a line some future writer stamps with `Z` or with an offset is read as it
 * was written rather than shifted a second time.
 */
export declare function parseTs(ts: string | undefined): number | null;
/**
 * The Circle a session ran on, read off `history_file` and off no field of its
 * own. A workbench-relative path beginning `circles/` names its Circle in the
 * second segment; any other path is shared work; an absent field is `unknown`.
 */
export declare function circleOf(historyFile: string | undefined): string;
/**
 * Whether a line belongs to the reading checkout.
 *
 * An absent `checkout` is ours, per the rule in this module's header. An
 * unresolved reading identifier keeps **every** line, which is the exact
 * pre-C4 behaviour and the stated degradation rather than a fallback.
 */
export declare function isOurs(line: EventLine, checkout: string | null): boolean;
/** git's `Name <email>` and the eight hex of `.checkout-id`, each or null. */
export interface ReadingIdentity {
    person: string | null;
    checkout: string | null;
}
/**
 * One other party: a distinct pair of person and checkout that is not the
 * reading one, carrying the most recent `session_start` it wrote in the window.
 */
export interface Party {
    /**
     * `person` another party, `checkout` a further checkout of the reading
     * person, `unknown` neither could be told from the other because the reading
     * person could not be read.
     */
    kind: "person" | "checkout" | "unknown";
    /** `null` where the line carried no `person`. Rendered `(not recorded)`. */
    person: string | null;
    checkout: string;
    /** The raw `ts` as written, never a reformatting of it. */
    ts: string;
    circle: string;
}
export interface PresenceReport {
    windowDays: number;
    parties: Party[];
    /**
     * Distinct other parties. `null` when the reading person could not be read,
     * which is the one figure that then cannot be taken and is therefore not
     * printed rather than printed as a zero.
     */
    otherPeople: number | null;
    /** Distinct other checkouts, whoever they turn out to belong to. */
    otherCheckouts: number;
    malformed: number;
}
export type PresenceResult = {
    ok: true;
    report: PresenceReport;
}
/** No line can be classified, so no count exists to print. */
 | {
    ok: false;
    why: "unidentified-checkout";
};
export interface PresenceOptions {
    /** The reading moment, in ms. Passed in, never taken, so it is testable. */
    now: number;
    windowDays: number;
}
/**
 * Who else has been here, over the last `windowDays`.
 *
 * The split is the one in the plan's `## Data Structures`, and it is disjoint
 * and complete over the `session_start` lines inside the window.
 *
 * The window has a floor and no ceiling. A line stamped in the future is kept,
 * because the clock that wrote it belongs to another machine and a skew of
 * minutes must not hide a person who was here. A line whose `ts` cannot be read
 * is dropped: it cannot be placed in the window, and placing it anyway would be
 * the guess this module exists to stop making.
 */
export declare function measurePresence(text: string, identity: ReadingIdentity, opts: PresenceOptions): PresenceResult;
/** One `party=` line. Tab-separated: the person value contains spaces. */
export declare function renderParty(p: Party): string;
export type TurnsResult = {
    malformed: number;
} & ({
    ok: true;
    turns: number;
    historyFile: string;
    since: string;
}
/**
 * A finding, not a zero. Issue
 * `shared/issues/260825-1430_*_the-event-log-froze-at-turn-2-while-the-dashboard-stayed-current-inverting-the-diagnostic-six-instances-rest-on.md`
 * measured a session whose Turn-2 boundary events never reached the log, and
 * a session that emitted nothing must not read the same as a session on its
 * first Turn.
 */
 | {
    ok: false;
    why: "no-session-start" | "anchor-without-timestamp";
    historyFile: string;
});
/**
 * The Turn count of the session whose history file is `historyFile`.
 *
 * It replaces four copies of `grep -c turn_start` over the whole file, which
 * counted every checkout's Turns and every previous session's, and it replaces
 * the proposed repair of counting after the **last** `session_start`, which is
 * positional and does not survive the union merge
 * (`circles/260823-0023-settle-what-travels-between-checkouts/issues/260823-1110_*_the-merge-driver-unsorts-a-second-event-log-reader-whose-repair-direction-is-positional.md`).
 *
 * The window is a **timestamp inside one checkout's own lines**, which is
 * genuine chronology: scope by checkout, sort by `ts`, take the first
 * `session_start` naming this history file, count `turn_start` from its stamp
 * on. `turns=0` is a real figure and reaches the ok branch.
 */
export declare function countTurns(text: string, historyFile: string, checkout: string | null): TurnsResult;
