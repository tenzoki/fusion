/**
 * Review coverage — the measurement behind issue `260810-1205`.
 *
 * ## The defect this answers
 *
 * Sixteen commits landed in `18b6094..ed87d87`. Two `coderev` passes ran, both
 * thorough, and their two ranges did not tile the session's range. Seven
 * code-bearing commits — `ac68437`, `72b798e`, `df75004`, `8796ade`, `49e5b1d`,
 * `205ae06`, `ed87d87` — reached HEAD and a pushed tag with no reviewer having
 * opened them, and the session's own report said *one* commit was unreviewed,
 * because it measured the gap against the last Turn instead of against the
 * range.
 *
 * Two details make it a mechanism problem rather than an oversight:
 *
 *   1. **Turn 2's omission was declared, not missed.** The `0939` pass states
 *      in its own header that `agents/orchestrator.md`, `skills/next/SKILL.md`
 *      and the Circle-stash skill's body (a file since removed) "were not
 *      opened" because concurrent
 *      tasks held them — exactly the files two of the unreviewed commits
 *      changed. The reviewer reported the boundary of its scope correctly.
 *      Nothing downstream read that sentence and re-queued the files.
 *   2. **The data was on disk and nothing read it.** The review files carry
 *      their ranges. No artifact holds "commits reviewed" against "commits
 *      landed", so nothing could tile one against the other.
 *
 * ## Why the ranges had to be mandated before they could be read
 *
 * They were on disk in a form no program could trust. Ten `coderev` files in
 * `shared/reviews/` at the time of writing carried four different spellings —
 * `**Range:**`, `**Scope:**`, `**Scope reviewed:**`, `**Scope as dispatched:**`
 * — several carried no range at all, and of the filenames that did, some read
 * `range-18b6094-to-a7c2b03`, one read `range-5ef92eb-940d522` with no `to`,
 * and two ended in `-to-head`, which names a different commit every day it is
 * read. A computation over a format nobody mandated returns nothing and calls
 * it coverage.
 *
 * So `agents/coderev.md` and `agents/ontorev.md` now mandate two header fields,
 * and this module reads exactly those and nothing else:
 *
 *     **Reviewed-range:** `<from>..<to>`
 *     **Not-opened:** none
 *
 * Both endpoints must be resolved hashes. `HEAD`, a branch name and a tag are
 * all refused with a named reason rather than resolved, because they resolve to
 * whatever they mean at read time, not at review time — the `-to-head`
 * filenames are the worked case.
 *
 * A file with no `**Reviewed-range:**` line is reported **unusable, by name,
 * with the reason** — never dropped, and never guessed at from its filename.
 * When the producer did not record the fact, it is not recoverable from the
 * text, and what changes is the mechanism rather than the approximation
 * (`rules/critical-stance.md` §4). The worked case that taught this project
 * the rule was the work queue's `**Active Circle:**` head line, whose consumer
 * left the plugin with the queue file on 2026-08-15; the rule did not.
 *
 * ## Whose files it reads
 *
 * Only the senders the mandate covers, read from the filename's `<sender>`
 * segment — see `REVIEW_SENDERS` below for the set, for why a file with no
 * recognisable sender is nonetheless kept and named, and for the `conceptrev`
 * files that were reported `UNUSABLE` forever because no mandate could ever
 * cover them (issue `260811-1145`).
 *
 * ## What it computes
 *
 * Coverage is a set difference over commits, not interval arithmetic over
 * hashes: every review's `from..to` is expanded with `git rev-list`, the union
 * is the covered set, and the session's own `git rev-list <since>..<head>` less
 * that union is the uncovered set — **named commit by commit**, which is the
 * acceptance criterion. Expanding through git rather than comparing endpoints
 * is what makes it correct across merges, out-of-order passes and ranges that
 * overlap.
 *
 * ## What it does NOT do, and why
 *
 * It never writes a review file, `agentstate.yaml`, a Circle record or a
 * history file, and it adds no `reviewed_through` field to the session state.
 * That last one is deliberate and is the point: `agentstate.yaml` is a surface
 * a session can pass a boundary without writing, and issue `260801-2038`
 * measured six sessions in which exactly that happened. A reviewed-through
 * marker kept there would be a fifth freezable surface answering a question the
 * review files already answer unfreezably — writing the review file *is* the
 * review, the way a commit is the work rather than a note about it.
 *
 * It is also not a release gate. Whether a release may go out over an
 * uncovered range is a decision and is not filed; it belongs beside
 * `shared/decisions/260810-0710_*_should-a-rule-be-allowed-to-land-without-the-check-that-enforces-it.md`.
 * This module reports; nothing here blocks anything.
 *
 * ## Its callers, and the one it deliberately is not on
 *
 *   1. `hooks/review-coverage.ts` → `bin/fusion-review-coverage` — the CLI,
 *      read by `agents/orchestrator.md` at Step 3c (the dispatch scope) and at
 *      Phase 4 (the session summary).
 *   2. `hooks/tracker.ts` — the PostToolUse hook, on the narrow trigger of a
 *      **review file landing under a reviews store**. That is the moment the
 *      answer is actionable, because the next dispatch's scope is being decided
 *      right then, and it is what makes the carried out-of-scope list an
 *      obligation that arrives rather than a footnote in a file nobody reopens.
 *
 * It is **not** on an every-tool-call path, and the difference is not an
 * oversight. An uncovered range mid-Turn is the *normal and correct* state —
 * review runs at Step 3c, after the Turn's tasks — so a per-call report would
 * fire on the commonest path, and a check that cries wolf on its commonest path
 * teaches its reader to ignore it. That is issue `260810-0710` arriving one
 * level up, and it is why this measurement's verdict is a line of output rather
 * than an exit code. Until 2026-08-15 a third measurement DID sit on the
 * every-call path — session-state drift, whose subject was a stale
 * `agentstate.yaml`, a fault at every moment after the commit that outdated it.
 * It was removed with the hand-maintained counters it measured; nothing on that
 * path replaced it.
 */
/**
 * The mandated header fields. One spelling each, and these two constants are
 * what `review-coverage-mandate.test.ts` asserts the two reviewer prompts still
 * carry — so a prompt that renames a field fails `npm test` rather than
 * silently producing files this parser reports as unusable.
 */
export declare const RANGE_FIELD = "**Reviewed-range:**";
export declare const NOT_OPENED_FIELD = "**Not-opened:**";
/**
 * The senders whose prompts carry the header mandate, and therefore the only
 * senders whose files this can measure.
 *
 * Issue `260811-1145`: three agents wrote into the reviews stores and only two
 * were ever mandated. `conceptrev` evaluated a document's diagrams, carried no
 * commit range and correctly never claimed one — so every `conceptrev` file was
 * scanned, found rangeless and reported `UNUSABLE` forever, and one landing at
 * the plan gate fired the whole measurement at Phase 0b, before any Turn had
 * run. A permanent `UNUSABLE` row normalises `UNUSABLE`, which is the erosion
 * this module's header refuses one level up. The agent was retired on
 * 2026-08-15; the files it wrote are still on disk, so the population is closed
 * rather than empty and the filter is still what closes it.
 *
 * **One set, consumed twice** — here by `isMeasuredReview` for the scan, and in
 * `hooks/tracker.ts` through that same function for the trigger. Two literals
 * would be a silent widening waiting to happen, which is the shape of the
 * defect itself: `review-coverage-mandate.test.ts` already fixed the mandate at
 * two prompts and nothing carried that fact into the scan.
 */
export declare const REVIEW_SENDERS: readonly ["coderev", "ontorev"];
/**
 * The `<sender>` segment of a review filename, or null when it has none.
 *
 * `rules/fusion-workbench-conventions.md` `## Filename Patterns` makes the
 * sender mandatory in `YYMMDD-HHMM-<sender>-<topic>.md`, so it is read rather
 * than inferred from the file's contents.
 */
export declare function reviewSender(name: string): string | null;
/**
 * Is this filename in the measurement's population? The split is disjoint and
 * complete over every name a reviews store can hold:
 *
 *   - a recognised sender — measured, because a mandate covers it;
 *   - a sender that parses but is not recognised — excluded, because no mandate
 *     covers it and reporting it could only ever say `UNUSABLE`;
 *   - no recognisable sender at all — **kept**, and reported by name with the
 *     reason. Nothing says whether the mandate covers it, and silently dropping
 *     a file this cannot classify is the opposite defect.
 */
export declare function isMeasuredReview(name: string): boolean;
export interface Commit {
    /** Full hash — the identity the covered-set difference is taken over. */
    full: string;
    /** Short hash, as git abbreviates it. What a human reads. */
    short: string;
    subject: string;
}
export interface ReviewRow {
    /** Workbench-relative path of the review file. */
    path: string;
    /** `<from>..<to>` as recorded, or "" when the field is absent or refused. */
    range: string;
    /** Files the reviewer declared it did not open. Empty for a recorded `none`. */
    notOpened: string[];
    /** False when the file carries no `**Not-opened:**` line at all. */
    notOpenedRecorded: boolean;
    /**
     * The `**Not-opened:**` value verbatim when it is neither `none` nor
     * backticked paths, `""` otherwise. It is rendered as text and never acted
     * on — see `parseNotOpened`.
     */
    notOpenedRaw: string;
    /** How many of the measured window's commits this review covers. */
    covers: number;
    /** Why the range could not be used. "" when it was used. */
    why: string;
}
export interface CoverageReport {
    root: string;
    /** The session anchor the window starts after. "" when it could not be found. */
    since: string;
    /** The window's end. "" when it could not be resolved. */
    head: string;
    /**
     * Why no coverage could be computed. Non-empty means every other field is
     * empty and the verdict is `unchecked` — the window itself was undecidable,
     * which is a different thing from a window with nothing in it.
     */
    why: string;
    /** The window's commits, newest first. */
    commits: Commit[];
    /** The window's commits no review's range contains. Newest first. */
    uncovered: Commit[];
    /** Reviews considered, newest first by mtime. Unusable ones included. */
    reviews: ReviewRow[];
    /** The newest usable review's declared out-of-scope files. */
    carried: string[];
    /** Which review `carried` came from, workbench-relative. Null when none did. */
    carriedFrom: string | null;
    /**
     * A stable identity for the current gap, empty when there is none.
     *
     * Carries the uncovered commits and the carried file list, so a gap that
     * GROWS reads as a new signature and speaks again, while one that merely
     * persists across the next review file is reported once. Same contract as
     * `lib/staging-drift.ts`'s signature, and the throttle beside it is the same.
     */
    signature: string;
}
/**
 * The mandated range, or the reason it cannot be used.
 *
 * Refusing `HEAD` and every other name is the whole point rather than
 * strictness for its own sake: two of the ten review files this was written
 * against are named `…-to-head`, and `HEAD` names a different commit every day
 * the file is read. A range that cannot be pinned to the commits it actually
 * covered is not a range, and reporting it as one would return coverage the
 * reviewer never gave.
 */
export declare function parseRange(value: string | null): {
    from: string;
    to: string;
    why: string;
};
/** What a `**Not-opened:**` value was read as. Exactly one of the three cases. */
export interface NotOpened {
    /** The declared out-of-scope files. Empty for a recorded `none`. */
    files: string[];
    /** Was the line there at all? */
    recorded: boolean;
    /** The value verbatim when it could not be interpreted, `""` otherwise. */
    raw: string;
}
/**
 * The declared out-of-scope files, and whether the field was there at all.
 *
 * A recorded `none` and an absent line are different facts and are kept apart:
 * a recorded absence can be compared, a missing line can only be guessed at
 * (`rules/critical-stance.md` §4).
 *
 * Issue `260811-1148` — the two readings this used to get wrong, in opposite
 * directions. `none of the prompt files` matched `/^none\b/i` and was read as
 * *nothing was excluded*, so a declared exclusion reached the reader as an
 * absent one. And `nothing left unopened` fell through to a comma-split and
 * became the file list `["nothing left unopened"]`, which `coverageSentence`
 * then handed the orchestrator as the next dispatch's scope.
 *
 * So the `none` branch takes the bare word and a gloss behind punctuation, and
 * nothing else; and the fallback keeps the reviewer's sentence **as a
 * sentence**. The instinct behind the old fallback was right — a statement that
 * cannot be parsed must not vanish — but promoting it to a file list is what
 * made it actionable, and a file list is acted on.
 */
export declare function parseNotOpened(value: string | null): NotOpened;
/** The session anchor `agentstate.yaml` records, or "" with nothing recorded. */
export declare function sessionAnchor(root: string): {
    since: string;
    why: string;
};
/**
 * Tile the review files' declared ranges against a commit range.
 *
 * `since` defaults to `agentstate.yaml`'s `session.git_head_at_start` — the
 * session's own anchor, already recorded for the drift check and for Step 3c's
 * `git diff`, so this needs no field of its own. `head` defaults to `HEAD`.
 *
 * Reviews are bounded to those modified at or after the anchor commit's own
 * commit date, because a review file cannot name a hash that did not exist when
 * it was written. Both ways that bound can be wrong are safe: a checkout that
 * pushes mtimes forward can only pull MORE reviews in, and an extra review
 * whose range lies outside the window expands nothing; a review wrongly
 * excluded shows its commits as uncovered, which is loud rather than quiet.
 */
export declare function measureReviewCoverage(root: string, opts?: {
    since?: string;
    head?: string;
}): CoverageReport;
/** One uncovered commit, named. The acceptance criterion is "not a count". */
export declare function renderUncovered(c: Commit): string;
/**
 * One review row, with its range and what it declared it did not open.
 *
 * An uninterpretable value is printed verbatim behind `(unparsed)`, so the
 * reviewer's sentence reaches the reader as a sentence. It used to be split on
 * commas into filenames nobody had written (issue `260811-1148`).
 */
export declare function renderReview(r: ReviewRow): string;
/**
 * The sentence handed back to the model when a review file lands over a range
 * that is not yet tiled, or over a predecessor that declared exclusions.
 *
 * It names the commits rather than counting them, because counting them is the
 * defect: the session that produced issue `260810-1205` reported one unreviewed
 * commit where there were seven.
 */
export declare function coverageSentence(report: CoverageReport): string;
/**
 * The signature last reported to the model, or "" when none was.
 *
 * Same contract, same reason, and deliberately the same shape as
 * `lib/staging-drift.ts`'s pair: without it the hook would repeat itself for as
 * long as the gap stands, and a message that arrives every time is one an agent
 * learns to read past — which is the failure this whole mechanism exists to
 * catch, arriving one level up.
 */
export declare function lastReportedCoverage(root: string): string;
/** Record the signature just reported. `""` clears it, so a later gap speaks again. */
export declare function recordReportedCoverage(root: string, signature: string): void;
