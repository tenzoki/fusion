/**
 * What prior policy-curator runs already asked the user about a work-item edge.
 *
 * `agents/policy-curator.md` `### The suppression read` must not re-propose an edge the
 * user has already answered. The corpus that records those answers is every
 * policy-curator run file in the workbench, and it is large: 975 220 bytes over 15
 * files on fusion's own tree at 2026-09-18, of which exactly ONE carries an edge
 * entry, and each run adds 60 to 170 KB. Pulling that into an agent's context to
 * learn a handful of pairs is the uneconomic charge the ruling on
 * `260918-0712_*_how-does-the-curators-edge-survey-know-not-to-re-propose-an-edge-the-user-declined.md`
 * paid for separately; this module is where it was paid.
 *
 * ## What a row carries, and what it deliberately does not
 *
 * One row per (dependent, target, field) — the outcome value and the pair, and
 * no third thing beyond the field. The field is load-bearing rather than
 * decoration: `**Depends-on:**` and `**Cross-references:**` are two consequence
 * groups a user approves separately, so the same pair can be answered in one and
 * unanswered in the other, and a row without it would suppress an ordering edge
 * on the strength of an answer about a citation.
 *
 * The entry's **consequence group is not a column**, and that absence is the
 * ruling. The suppression key reads the outcome value alone: `not-offered` names
 * the entry the gate never put, so nothing has to be learned by holding the group
 * line beside the outcome line. What decides on each value is
 * `agents/policy-curator.md` `### The suppression read` and nothing here — this module
 * reports a fact and applies no key, the stdout-verdict stance every other
 * reporting helper in `bin/` carries.
 *
 * ## The corpus is every run file, with nothing excluded
 *
 * Not bounded by the evidence anchor, not resolved through `$SCAN_ANALYSES`, and
 * `archive/` is read like the live tree. All three follow from the same fact: a
 * run file records a refusal whatever its age, whichever item was claimed when it
 * was written, and whether or not its container has since been archived. A bound
 * that loses a refusal loses it silently, which is the failure the mechanism
 * exists to prevent.
 *
 * ## The outcome parse, stated because it is a heuristic over free prose
 *
 * The Outcomes section has no fixed shape in the corpus — tables of three, four
 * and five columns, bullet lists and prose paragraphs all appear. The rule is
 * narrow on purpose:
 *
 *   - The section is a heading whose text is `Outcomes`, optionally numbered.
 *   - Inside it, only a ROW line counts: one where the entry id stands first,
 *     after at most a list bullet or table pipe. A prose sentence mentioning the
 *     id is not an outcome statement and is never read as one — "a
 *     hand-transcription of L02 failed its own staleness check" sits in a real
 *     run file and would otherwise report L02 as `failed`.
 *   - On the first such row, the first vocabulary word standing after the id is
 *     the outcome.
 *   - An id with no row at all is `none`; an id whose row carries no vocabulary
 *     word is `unreadable`. An id written only inside a range (`L01–L12`) has no
 *     row of its own and so reads `none`.
 *
 * `none` and `unreadable` both mean "no answer was read", and
 * `### The suppression read` re-proposes on both. The parse therefore fails
 * toward re-asking, which is the harmless direction the 2026-09-11 record
 * preferred and the ruling kept.
 *
 * ## Most recent wins
 *
 * Where two run files carry an entry for the same pair and field, the row takes
 * the outcome of the later file — run files are named `YYMMDD-HHMM-curator-run.md`
 * and that name is their order. A later answer is the user answering again, and
 * an earlier one it contradicts is superseded rather than combined.
 */
/** The outcome vocabulary, authored in `agents/policy-curator.md` `## The run file`. */
export declare const OUTCOMES: readonly ["applied", "skipped", "not-offered", "stale", "failed"];
/** An outcome value, or one of the two ways there is no answer to read. */
export type Answer = (typeof OUTCOMES)[number] | "none" | "unreadable";
export interface AnswerRow {
    /** The work item the edge would be written into, by storeless basename. */
    dependent: string;
    /** The work item the edge points at, by storeless basename. */
    target: string;
    /** `Depends-on` or `Cross-references` — bare, without the bold field markers. */
    field: string;
    answer: Answer;
}
export interface EdgeAnswersReport {
    /** Curator run files read. */
    runFiles: number;
    /** Ledger entries carrying an `**Edge:**` line, before collapsing by pair. */
    edgeEntries: number;
    rows: AnswerRow[];
    /** Rows whose answer is `unreadable`. */
    unreadable: number;
    /** `empty` when no run file carried an edge entry; `answers` otherwise. */
    verdict: "empty" | "answers";
}
/** `YYMMDD-HHMM-curator-run.md`, and nothing else — a defect record whose slug
 *  merely contains the words is not a run file. */
export declare function isRunFile(base: string): boolean;
/** Every policy-curator run file under the workbench, in name order, which is time order. */
export declare function runFiles(root: string): string[];
/** The two endpoints and the field off one `- **Edge:**` line, or null if the
 *  line does not carry both endpoints. Tolerant of the `(named | hop |
 *  container)` qualifiers the schema allows and the first run file omits. */
export declare function parseEdgeLine(line: string): Omit<AnswerRow, "answer"> | null;
/** The answer an Outcomes section records for one entry id. See the header's
 *  `## The outcome parse` for why only a row line counts. */
export declare function answerFor(section: string[], id: string): Answer;
/** Every edge entry one run file carries, with the outcome the file records. */
export declare function readRunFile(path: string): AnswerRow[];
/** Walk the workbench's run files and collapse them to one row per pair+field. */
export declare function computeEdgeAnswers(root: string): EdgeAnswersReport;
/** One row: the outcome value, the pair, the field. Four columns, indented in
 *  the shape `bin/fusion-plan-size` and `bin/fusion-work-order` print. */
export declare function renderAnswerRow(row: AnswerRow): string;
