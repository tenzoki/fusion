/**
 * Staging drift — the measurement behind issue `260811-0114`.
 *
 * ## The defect this answers
 *
 * The 17:23 queue rebuild of session `260810-1646` — `tasklist.md`, 2128 lines,
 * 1409 insertions against the committed copy — and its companion history file
 * `shared/history/260810-1723-tasklist-update.md` never entered a commit. The
 * queue the whole session worked from survived only in the working tree, for
 * eighteen commits, and nothing would have noticed if an ordinary
 * `git checkout -- fusion-workbench/` had taken it. A third file,
 * `.commit-msg-tmp`, sat at the workbench root holding the last commit's
 * message, because the message was written there instead of under `/tmp`.
 *
 * ## Why the staging rule did not catch it, and what that implies
 *
 * `agents/orchestrator.md` Step 3b step 4 installs a **shape**: every path
 * passed to `git add` is one you wrote out yourself — no `-A`, no `-u`, no
 * directory argument, no glob. That shape was installed after the opposite
 * defect (a `git add -u` over a directory staged three deletions whose renamed
 * successors were untracked, `f38f37d`), and it is right: it makes over-staging
 * impossible.
 *
 * It also makes under-staging **invisible**. A file nobody names is a file
 * nobody commits, and the queue rebuild ran forty-three minutes before the
 * range's first commit, so no task's staging list had a reason to name it. The
 * fix therefore cannot be a broader `git add` — loosening the shape is
 * explicitly excluded by the issue's own acceptance. It has to be a
 * measurement of the result, which is the move the guard already made when it
 * stopped predicting writes from a command's text and started fingerprinting
 * paths (`circles/260807-0923-guard-misst-statt-orakelt`).
 *
 * ## The trigger is HEAD, and it is measured rather than predicted
 *
 * This does not fire on every tool call, and it does not read a `Bash`
 * command's text to notice a commit. Both would be wrong, and for reasons this
 * codebase has already paid for:
 *
 *   - **Every tool call would cry wolf.** An unstaged record *mid-Turn* is the
 *     normal and correct state: a coder writes an issue file, and Step 3b
 *     stages it minutes later. A check that fires on its commonest path is one
 *     its reader learns to ignore (issue `260810-0710`, and
 *     `lib/review-coverage.ts` deciding the same question the same way).
 *   - **Reading the command would be the classifier again.** Deciding from a
 *     shell string whether it will move HEAD is the undecidable question the
 *     write-path classifier answered until v6.0.0; the git branch-switch policy
 *     that also asked it was deleted outright on 260809 after 24 consecutive
 *     false blocks. Nothing about a `Bash` command is read here.
 *
 * So the trigger is: **HEAD is not where it was on the previous tool call.**
 * That is a fact about the repository, read with one `git rev-parse`, and it is
 * true exactly once per commit — which is the moment a record left out of the
 * staging list becomes a record that missed its commit. `headMoved` below is
 * the whole of it.
 *
 * ## Classification, and why silence is never the answer
 *
 * `git status --porcelain` over the workbench reports everything, including
 * surfaces that are in flight by construction: `orchestrator-events.jsonl` is
 * appended to by every event emission, the session's own history file is
 * written all session long, `.guard-state/` moves on every guarded tool call.
 * Reporting those as faults would be the wolf-crying this module exists to
 * avoid. Dropping them would be the silence it exists to end.
 *
 * So every entry is classified and every entry is printed, with the reason:
 *
 *   - `commit-message` — a file whose name says it holds a commit message. A
 *     fault of its own kind: Step 3b prescribes
 *     `/tmp/fusion-commit-msg-<task-id>.txt` because `/tmp` is swept and the
 *     workbench is not, and `.commit-msg-tmp` is what improvising instead
 *     leaves behind.
 *   - `record` — an authored artifact: the root-anchored `tasklist.md` and
 *     `portfolio.md`, a Circle's `*_circle.md`, or anything under an artifact
 *     store. These are what a staging list is supposed to name.
 *   - `in-flight` — the live-state surfaces `rules/fusion-workbench-conventions.md`
 *     `## Which of them a tracked workbench tracks` groups as "do not track it",
 *     plus the three tracked-but-machine-written ones and the session's own
 *     history file. Never a fault.
 *   - `unclassified` — everything else under the workbench. Named, with the
 *     statement that it is **not** a record store and that nothing is claimed
 *     about it. The worked case is `shared/backlogs/`, a user's own note file:
 *     it must appear in a complete reading and must not raise an alarm.
 *
 * Only `record` and `commit-message` rows that are not fully staged enter the
 * verdict, the signature, and the sentence handed to the model. The CLI prints
 * all four classes, because the Turn-boundary read is deliberate and a
 * deliberate read should be complete.
 *
 * ## What it does NOT do
 *
 * It never stages anything, never commits, never writes a workbench record.
 * The only file it writes is its own throttle record under `.guard-state/`.
 * That is the same refusal `lib/state-drift.ts` states and for a stronger
 * reason here: a mechanism that staged files on its own behalf would be a
 * second author of the staging list, and the shape whose whole value is that
 * every path in it was written out by the party that knows why would be gone.
 * This makes an unstaged record impossible not to notice; it cannot commit it.
 *
 * ## Its callers
 *
 *   1. `hooks/tracker.ts` — the PostToolUse hook, on the HEAD-moved trigger.
 *   2. `hooks/staging-drift.ts` → `bin/fusion-staging-drift` — the CLI, read by
 *      `agents/orchestrator.md` at Phase 1 (after a queue rebuild is committed),
 *      at Step 3e (in the same command as the `turn_end` emission), and at
 *      Cleanup.
 */
/**
 * The path Step 3b prescribes for a commit message, named here so the sentence
 * this module hands back can quote it rather than describe it.
 *
 * `commit-message-path.test.ts` asserts this constant and
 * `agents/orchestrator.md` still agree, so a prompt that moves the path fails
 * `npm test` instead of leaving the mechanism telling the model to use a path
 * the prompt no longer names.
 */
export declare const PRESCRIBED_MESSAGE_PATH = "/tmp/fusion-commit-msg-<task-id>.txt";
export type EntryClass = "record" | "commit-message" | "in-flight" | "unclassified";
export interface StagingRow {
    /** Workbench-relative path. */
    path: string;
    /** The two-character `git status --porcelain` code, e.g. ` M`, `??`, `R `. */
    code: string;
    klass: EntryClass;
    /** Why it is classified this way. Always present — never left to be inferred. */
    why: string;
    /**
     * True when the working-tree column is clean and the change is entirely in
     * the index. A staged record is on its way into a commit and is not a fault.
     */
    staged: boolean;
    /** `record`/`commit-message` and not fully staged: what a staging list missed. */
    fault: boolean;
}
export interface StagingReport {
    root: string;
    /**
     * Why nothing could be measured. Non-empty means `rows` is empty and the
     * verdict is `unchecked` — a workbench outside a git repository, or a git
     * that would not answer. Different from a clean tree, and never reported as
     * one.
     */
    why: string;
    /** Every porcelain entry under the workbench, classified. Nothing dropped. */
    rows: StagingRow[];
    /** The subset whose `fault` is true. */
    faults: StagingRow[];
    /**
     * A stable identity for the current miss, empty when there is none. Carries
     * every fault row's code and path, so a miss that GROWS — another record left
     * behind by the next commit — reads as a new signature and speaks again,
     * while one that merely persists is reported once. Same contract as
     * `lib/state-drift.ts` and `lib/review-coverage.ts`.
     */
    signature: string;
}
/**
 * Which class a workbench-relative path falls in, and why.
 *
 * The order is the contract. `commit-message` runs first so a message file
 * dropped inside a store is still read as one; live state runs before the store
 * test so the session's own history file is not reported as a record it has not
 * finished writing; `stashes/` runs before it too, because a stash snapshot is
 * a frozen copy owned by `/fusion:circle-stash` rather than a record this
 * session authored.
 */
export declare function classify(rel: string, sessionHistory: string): {
    klass: EntryClass;
    why: string;
};
/**
 * Every `git status --porcelain` entry under the workbench, classified.
 *
 * `--untracked-files=all` rather than the default: without it git collapses an
 * untracked directory to a single entry, and the file that has to be named —
 * `shared/history/260810-1723-tasklist-update.md`, inside a directory git was
 * already tracking — is exactly the case where naming the file rather than its
 * directory is the whole report. The issue's own reproduction used the same
 * flag.
 *
 * Paths come out of porcelain relative to the repository toplevel, which is not
 * necessarily the workbench root — the layout allows the workbench to sit below
 * the git toplevel. So the toplevel is read and every path is re-anchored,
 * rather than assumed.
 */
export declare function measureStagingDrift(root: string): StagingReport;
interface StagingState {
    /** HEAD as of the previous tool call. "" when none has been recorded. */
    head: string;
    /** The signature last reported to the model. "" when none was. */
    reported: string;
}
/** The throttle record, or an empty one when there is none to read. */
export declare function readStagingState(root: string): StagingState;
/** Write the throttle record. `reported: ""` clears it, so a later miss speaks again. */
export declare function writeStagingState(root: string, state: StagingState): void;
/** HEAD right now, or "" when git will not say (no repository, no commits yet). */
export declare function currentHead(root: string): string;
/**
 * Whether HEAD moved since the previous tool call — the trigger, in one place.
 *
 * `previous` is passed in rather than read here, because the caller has already
 * read the throttle record for the signature it also needs and this runs on
 * every guarded tool call; one file read a call is the budget.
 *
 * The first sighting is deliberately NOT a move. There is no previous value to
 * have moved from, and treating the absence of a record as a commit would fire
 * this on the first tool call of every fresh workbench — a report about a
 * commit that did not happen, which is the wolf-crying failure in its purest
 * form. The head is recorded and the answer is `false`.
 *
 * A HEAD that git will not name at all (no repository, or a repository with no
 * commits yet) is likewise not a move: there is no commit for a staging list to
 * have missed.
 */
export declare function headMoved(root: string, previous: string): {
    moved: boolean;
    head: string;
};
/** One row: its class, its porcelain code, its path, and why it is classified so. */
export declare function renderStagingRow(r: StagingRow): string;
/**
 * The sentence handed back to the model when a commit left a record behind.
 *
 * It names the paths rather than counting them, for the reason
 * `lib/review-coverage.ts` names commits rather than counting them: the session
 * that produced this issue could see `git status` at any moment for eighteen
 * commits and the number was never the part nobody read.
 *
 * It also says what NOT to do. An agent told "files were missed by `git add`"
 * reaches for `git add -A`, and that is the defect on the other side —
 * `f38f37d`, three records out of HEAD. The acceptance for this issue makes the
 * staging shape a constraint rather than a nicety, so the sentence carries it.
 */
export declare function stagingSentence(report: StagingReport): string;
export {};
