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
 * is the readings that follow from that, and nothing else.
 *
 * One of the two is identity-scoped, `measurePresence`.
 * `measureDispatchDurations` deliberately is not: a dispatch made from another
 * checkout is still a dispatch, so it reads every line and calls `isOurs`
 * nowhere. Since 2026-09-21 presence reads what a party is on off its latest
 * `task_start` row's `work_item`, which the guard writes on every dispatch that
 * names a `**Work-item:**`; the pre-cut `history_file` is the fallback, and
 * `none on record` the statement where neither exists (decision
 * `260921-1718_*_where-does-presence-read-what-another-checkout-is-working-on-now-that-no-session-row-carries-it.md`,
 * option 1).
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
    /** The dispatched agent's bare name, on `task_start` and `task_done`. */
    agent?: string;
    /** The tool-use id a dispatch's two rows share. The pairing column. */
    task?: string;
    /** The Claude Code session, on `session_start` and on every dispatch row. */
    session_id?: string;
    /** The work item a dispatch ran under, on `task_start` (the `**Work-item:**` line's basename). */
    work_item?: string;
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
 *
 * Only a pre-cut `session_start` carries the field: the history store closed
 * at `0ec15cb9`. Since 2026-09-21 `measurePresence` calls this only where the
 * field is present, and reads a party's work item off its `task_start` rows
 * otherwise, so `unknown` is now the answer for a malformed `circles/` path
 * alone. The literal stays after v12: the field is a pre-cut persisted value
 * no writer produces any more, which the window in
 * `rules/fusion-workbench-conventions.md` `### Transition window (v12.0.0 to v13.0.0)` does not govern.
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
    /**
     * What the party is on: the `work_item` of its latest `task_start` in the
     * window, else the Circle off a pre-cut `session_start`'s `history_file`,
     * else `none on record`. The name is the field's history; the value is the
     * work item wherever one was dispatched.
     */
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
/**
 * The seven agents whose dispatch durations this reading measures, each under
 * every name it has carried.
 *
 * **It was the bound-agent set, and it is now a set with one definition site.**
 * Until 2026-09-10 it was one of two copies — the other being the
 * `IS_BOUND_AGENT` case arm in `bin/fusion-rules`, which decided who was told
 * about the stopping time — held equal by a gate. The bound was retired, the
 * case arm went with it, and the gate went with the case arm. Nothing else in
 * the tree names this set.
 *
 * WHY THE SEVEN NAMES STAYED. They were sorted by a criterion the retirement
 * removed: an agent was bound when its deliverable accumulated on disk as the
 * run proceeded. That is no longer why they are here. They are here because
 * they are the same seven the readings taken while the bound existed covered,
 * so a duration read today and one read in the log's own history are readings
 * of one population. Widening the set would be a different measurement wearing
 * the same name.
 *
 * The order is the one the retired specification gave, agent by agent:
 * `260907-0820_*_spec-bounded-executor-dispatches.md`.
 *
 * **THE v11 ROSTER CUT DID NOT MOVE THIS SET, DELIBERATELY.** `bugfixer` went
 * and `coderev`/`ontorev` merged into `reviewer`, and all three names stay
 * here while `reviewer` is absent: this set names the population that WAS
 * measured, and rows carrying the old names are in the log. Adding `reviewer`
 * would start counting a role whose dispatches predate nothing, which is the
 * widening the paragraph above refuses. A reading that wants the new roster
 * passes its own `agents` list — the option exists for exactly that.
 */
export declare const MEASURED_AGENTS: readonly ["coder", "ontocoder", "bugfixer", "reconciler", "coderev", "ontorev", "curator", "code-implementer", "data-implementer", "state-auditor", "policy-curator"];
/**
 * The v12.0.0 agent renames, old to new — the table `bin/fusion-paths` and
 * `bin/fusion-rules` also carry. The log keeps every row under the name it was
 * written with; a dispatch row is REPORTED under the role's current name, so a
 * range spanning the rename gives one series per role rather than two.
 */
export declare const ROLE_OF: Readonly<Record<string, string>>;
/**
 * What the reading did with one dispatch. The four are disjoint and every row
 * carries exactly one.
 *
 * **None of them is `violation`.** Since 2026-09-10 no dispatch carries a
 * stopping time at all, so there is nothing for one to be in violation of; and
 * before that the rows could not say which dispatches had been given one, since
 * inside a single orchestrator session a skill body's dispatch and the
 * orchestrator's own carry the same `agent`, the same `session_id` and no field
 * that separates them. `longer` says the dispatch ran longer than the value
 * this reading was handed, and nothing more.
 */
export type DispatchOutcome = "longer" | "within" | "unattributable" | "unpaired";
export interface DispatchRow {
    agent: string;
    /** The tool-use id, which is the pairing column and the dispatch's name. */
    task: string;
    /** The `task_start` stamp exactly as written, never a reformatting of it. */
    ts: string;
    /**
     * `null` on an `unpaired` row, where no completion exists to measure against.
     * A zero there would read as an instant dispatch, which is the one thing C4's
     * eighth criterion forbids.
     */
    minutes: number | null;
    outcome: DispatchOutcome;
}
export interface DispatchReport {
    rows: DispatchRow[];
    /** Pairs that were scored: `longer` plus `within`, and nothing else. */
    counted: number;
    longerThanThreshold: number;
    unattributable: number;
    unpaired: number;
    /**
     * Dispatches of the agents read that were dropped because a stamp could not
     * be read: a start row with none, whatever its date, since a start that
     * cannot be placed against the cutoff cannot be excluded by it either; or an
     * end row with none, on a start inside the cutoff. Returned rather than
     * dropped silently, per `parseLog`'s rule: a skipped line nobody counts is
     * the silent under-report this module exists to remove. Under the same
     * filters as every other figure, so it is comparable with `counted` (issue
     * 260908-2112_*_unstamped-counts-over-the-whole-log-while-every-other-dispatch-figure-is-filtered.md).
     */
    unstamped: number;
    /**
     * `cutoffIso` could not be parsed. Then no dispatch is placed and every
     * dispatch figure above is zero; the stamps are fine and `unstamped` says so
     * by staying zero (issue
     * 260908-2113_*_an-unparseable-cutoff-is-reported-to-the-user-as-unstamped-dispatches.md).
     */
    cutoffUnparseable: boolean;
    /**
     * `session_start` rows seen, and how many of them carry no `session_id`. The
     * second is the whole cause of `unattributable`, and it is derived here so a
     * caller can state this log's own coverage rather than assert a figure.
     */
    sessionStarts: number;
    sessionStartsWithoutId: number;
    malformed: number;
}
export interface DispatchOptions {
    /** The comparison value. A parameter: no row records the one in force then. */
    thresholdMinutes: number;
    /** `YYYY-MM-DD`. Dispatches starting before it are outside the reading. */
    cutoffIso: string;
    /** The agents to read. `MEASURED_AGENTS` in ordinary use. */
    agents: readonly string[];
}
/**
 * How long each dispatch of a measured agent ran, since a cutoff.
 *
 * Pure, like its two siblings: it opens no file, runs no subprocess and phrases
 * no sentence for a user. It is **not** identity-scoped, deliberately — a
 * dispatch made from another checkout is still a dispatch, and `isOurs` is not
 * applied anywhere below.
 *
 * The filters are the specification's and matter:
 *
 *   1. pair `task_start` with `task_done` on `task`, and only where `task` is
 *      present. A start with no completion is `unpaired`;
 *   2. keep only what starts at or after `cutoffIso`, so the reading does not
 *      report every long dispatch in the log's history;
 *   3. keep only the agents asked for;
 *   4. mark what no `session_start` accounts for as `unattributable`, which is
 *      reported and neither dropped nor counted.
 *
 * Steps 2 and 3 apply to an unpaired start as well, and to an unstamped one.
 * Without that the `unpaired` figure would run over the whole file and over
 * every agent, which is the exact widening the cutoff exists to prevent, and it
 * would not be comparable with `counted` beside it; `unstamped` counted over
 * the whole log until 2026-09-22 for the same reason, that its increment sat
 * above the two filters. In the loop the agent filter therefore runs first,
 * then the stamp is read, then the cutoff applied: a start with no readable
 * stamp is counted `unstamped` whatever its date, because the cutoff cannot be
 * applied to it, but only for the agents in scope.
 *
 * **A cutoff that cannot be parsed keeps nothing, and says so.** The failure is
 * closed towards the empty reading rather than the whole history, because the
 * history is what the cutoff is there to exclude; it is reported as
 * `cutoffUnparseable` rather than folded into `unstamped`, whose sentence would
 * then blame the log's stamps for a value the caller passed.
 *
 * Every timestamp goes through `parseTs`. The emit convention writes UTC with
 * no `Z` designator and ECMA-262 reads such a string as local time.
 */
export declare function measureDispatchDurations(text: string, opts: DispatchOptions): DispatchReport;
/**
 * One `dispatch=` line. Tab-separated, and flattened for the reason
 * `renderParty` is: a control character inside a field would shift every later
 * field by one.
 *
 * The minutes field carries `-` on an unpaired row. It is the one place a
 * number is deliberately absent rather than zero.
 */
export declare function renderDispatch(row: DispatchRow): string;
