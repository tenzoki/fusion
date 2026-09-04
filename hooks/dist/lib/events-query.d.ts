/**
 * The event log, read by the identity on each line rather than by position.
 *
 * ## The defect this answers
 *
 * `fusion-workbench/orchestrator-events.jsonl` is class R2 in
 * `rules/workbench-tracking.md` and carries `merge=union`, so after a pull it
 * holds two checkouts' lines with no ordering between the blocks. Every reader
 * of it treated the file as one session's chronology. The measurement in
 * `260823-1302_*_the-monitor-attributes-a-merged-event-log-to-one-session-and-reports-another-checkouts-state.md`
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
 * ## The identity map, and what it changes about a figure already reported
 *
 * `measurePresence` classifies on `canon(g) = identityMap[g] ?? g`, a map from
 * a git identity to the person who claims it. It is a table a human wrote, in
 * the checkout registry, so a person who registers a second identity changes
 * what `other_people` counted yesterday over the same window. That is the
 * correction landing rather than a drift: the two identities were always one
 * person, and the log could not say so.
 *
 * Where two entries map one git identity to two different persons, the first by
 * filename order wins and the conflict is named on stderr. The map is built in
 * `hooks/events-query.ts` from one `bin/fusion-checkout-name roster` call, so
 * that resolution and the sentence about it live there and this module still
 * opens no file and runs no subprocess.
 *
 * The join column is the git identity and never the hex, because an
 * unregistered line carries both and only the first can be canonised. Joining
 * on the hex would classify an unregistered checkout of the reading person as
 * another person, which is the one regression this reading must not have.
 * `canon` is applied at the classification and at the `people` set and nowhere
 * else: the party key, the sort and the `checkouts` set stay on raw values,
 * because they are about lines rather than about people.
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
    /**
     * Distinct **further checkouts of the reading person** — and, where the
     * reading person could not be read, every other checkout, because none of
     * them can then be told from one of the reader's own.
     *
     * The key therefore denotes a wider set exactly when `otherPeople` is `null`,
     * which is the state `bin/fusion-events` reports as exit 4 and whose header
     * says so beside that row. Two readings of one key is deliberate — the
     * alternative is a figure that silently changes meaning — and it is the whole
     * of the difference.
     */
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
    /**
     * Git identity to the person who claims it, from the checkout registry. Data,
     * never a file this module opens. An empty map makes `canon` the identity
     * function, so a workbench with no registry runs this same code and returns
     * the figures it returned before the registry existed.
     */
    identityMap: Record<string, string>;
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
/**
 * One `party=` line. Tab-separated: the person value contains spaces.
 *
 * `aliasOf` resolves the checkout registry's name for a hex, and the sixth
 * field carries it or `-`. It is **appended**, so a consumer reading five
 * fields is unaffected, and it is a rendering of a report rather than anything
 * written to a record: no alias reaches `orchestrator-events.jsonl`, no
 * comparison here runs on one, and a hex with no entry renders exactly what it
 * rendered before the registry existed.
 */
export declare function renderParty(p: Party, aliasOf: (hex: string) => string | null): string;
export type TurnsResult = {
    malformed: number;
} & ({
    ok: true;
    turns: number;
    /**
     * `turn_start` lines carrying no readable `ts`. They cannot be placed
     * against the anchor, so they are not in `turns` — and they are returned
     * rather than dropped, per `parseLog`'s rule above: a skipped line that
     * nobody counts is the silent under-report this module exists to remove.
     *
     * Kept apart from `malformed`, which counts lines that were not a JSON
     * object at all. These are well-formed objects that named a Turn and
     * could not say when, and the two are different facts about the log.
     */
    unstamped: number;
    historyFile: string;
    since: string;
}
/**
 * A finding, not a zero. Issue
 * `260825-1430_*_the-event-log-froze-at-turn-2-while-the-dashboard-stayed-current-inverting-the-diagnostic-six-instances-rest-on.md`
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
 * It replaces five sites that each derived the figure for themselves, and the two
 * quantities in that are different numbers rather than one: two literal whole-file
 * `grep -c turn_start` blocks, which counted every checkout's Turns and every
 * previous session's, and three prose derivations naming a window after this
 * session's `session_start`. All five now read this one implementation. It also
 * replaces the proposed repair of counting after the **last** `session_start`, which is
 * positional and does not survive the union merge
 * (`260823-1110_*_the-merge-driver-unsorts-a-second-event-log-reader-whose-repair-direction-is-positional.md`).
 *
 * The window is a **timestamp inside one checkout's own lines**, which is
 * genuine chronology: scope by checkout, sort by `ts`, take the first
 * `session_start` naming this history file, count `turn_start` from its stamp
 * on. `turns=0` is a real figure and reaches the ok branch.
 *
 * A `turn_start` with no readable `ts` cannot be placed against that anchor, so
 * it is not counted. It comes back as `unstamped` rather than vanishing, so a
 * count that is short by a line is a count that says it is short by a line.
 */
export declare function countTurns(text: string, historyFile: string, checkout: string | null): TurnsResult;
