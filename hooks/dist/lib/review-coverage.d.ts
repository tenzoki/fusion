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
 *      and `skills/circle-stash/SKILL.md` "were not opened" because concurrent
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
 * That is the `**Active Circle:**` lesson (`agents/orchestrator.md`
 * `### The queue's ground`): when the producer did not record the fact, it is
 * not recoverable from the text, and the mechanism changes rather than the
 * approximation (`rules/critical-stance.md` §4).
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
 * It is **not** on the tracker's every-tool-call path, where the state-drift
 * measurement sits, and the difference is not an oversight. A stale
 * `agentstate.yaml` is a fault at every moment after the commit that outdated
 * it. An uncovered range mid-Turn is the *normal and correct* state — review
 * runs at Step 3c, after the Turn's tasks — so a per-call report would fire on
 * the commonest path, and a check that cries wolf on its commonest path teaches
 * its reader to ignore it. That is issue `260810-0710` arriving one level up,
 * and `agents/orchestrator.md` `### Drift check` records it as the reason the
 * drift check's verdict is a line of output rather than an exit code.
 */
/**
 * The mandated header fields. One spelling each, and these two constants are
 * what `review-coverage-mandate.test.ts` asserts the two reviewer prompts still
 * carry — so a prompt that renames a field fails `npm test` rather than
 * silently producing files this parser reports as unusable.
 */
export declare const RANGE_FIELD = "**Reviewed-range:**";
export declare const NOT_OPENED_FIELD = "**Not-opened:**";
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
     * `lib/state-drift.ts`'s signature, and the throttle beside it is the same.
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
/**
 * The declared out-of-scope files, and whether the field was there at all.
 *
 * A recorded `none` and an absent line are different facts and are kept apart,
 * for the reason `**Active Circle:** none` is mandated on every taskplanner run:
 * a recorded absence can be compared, a missing line can only be guessed at.
 */
export declare function parseNotOpened(value: string | null): {
    files: string[];
    recorded: boolean;
};
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
/** One review row, with its range and what it declared it did not open. */
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
 * `lib/state-drift.ts`'s pair: without it the hook would repeat itself for as
 * long as the gap stands, and a message that arrives every time is one an agent
 * learns to read past — which is the failure this whole mechanism exists to
 * catch, arriving one level up.
 */
export declare function lastReportedCoverage(root: string): string;
/** Record the signature just reported. `""` clears it, so a later gap speaks again. */
export declare function recordReportedCoverage(root: string, signature: string): void;
