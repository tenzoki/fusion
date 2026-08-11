/**
 * Session-state drift — the measurement behind issue `260801-2038`.
 *
 * ## The defect this answers
 *
 * Three of the four session-state surfaces stop being written after the first
 * Turn while the session runs on. Measured six times across six sessions:
 * `agentstate.yaml` said `commits: 0` while git counted 6, then 7, then 8, then
 * 12; a Circle record said `Status: anticipated` with an empty Turn log while
 * that Circle had been active for days; a session history said
 * `Directive: (not yet stated)` while eight hours of work followed. Resume is
 * the feature it breaks, because the state file is authoritative in exactly the
 * situation where the session that wrote it is gone and cannot be asked.
 *
 * `orchestrator-events.jsonl` never froze, and that is the diagnostic rather
 * than a coincidence: emitting an event is a per-action call that cannot be
 * forgotten without the action visibly failing, while the other three are
 * end-of-Turn writes a session can skip with nothing breaking. Git is the
 * second such record — a commit is the work itself, not a note about it.
 *
 * So this module reads those two un-freezable records and prints each
 * bookkeeping surface beside the one record that can contradict it.
 *
 * ## Why it is a program and not a paragraph
 *
 * `agents/orchestrator.md` carried this as an inline shell snippet, and issue
 * `260801-2038`'s own reconciliation measured what that bought: the check
 * landed at 04:15, both of its call points were reached at 06:55, and neither
 * fired — because **an agent prompt is loaded at session start, so a fix
 * written into a prompt cannot reach the session that writes it**. That is not
 * task pressure and is not overridable; it is construction. The enforcement had
 * to move somewhere that runs without being asked.
 *
 * Three callers now share this one computation, and none of them is the session
 * that installed it:
 *
 *   1. `hooks/tracker.ts` — the PostToolUse hook, on every guarded tool call.
 *      Claude Code invokes it from `hooks/hooks.json`; it needs no cooperation
 *      from the session and reads `hooks/dist/tracker.js` fresh each call. This
 *      is the call point that makes the Turn-boundary write ride an obligation
 *      the session already holds: a commit is what moves `git rev-list --count`
 *      past what `agentstate.yaml` claims, and the tracker fires on the very
 *      tool call that committed.
 *   2. `hooks/state-drift.ts` → `bin/fusion-state-drift` — the CLI, read by
 *      `/fusion:setup` Step 1 on the user-triggered resume path and available
 *      to the reconciler and to any human at a terminal.
 *   3. `bin/monitor` — surfaces the `state_drift` events this module's callers
 *      emit, rather than computing the divergence a second time.
 *
 * ## What it does NOT do, and why that is deliberate
 *
 * It never writes `agentstate.yaml`, a Circle record or a session history file.
 * Candidate 3 of the issue — letting something other than the orchestrator
 * repair the surfaces — is rejected there and stays rejected: it would put two
 * writers on the session-state surfaces, and a second writer racing the
 * orchestrator's own overwrite is a worse failure than a stale number. The only
 * file this module writes is its own throttle record under `.guard-state/`.
 *
 * The honest consequence: this makes a skipped write **impossible not to
 * notice**. It cannot make the write happen. That residual is stated in the
 * report and in `agents/orchestrator.md` rather than left to be discovered.
 *
 * Read-only against everything else, and it throws nothing it can help — every
 * row that cannot be decided is reported as `unchecked` with its reason, never
 * dropped. A drift check that exists to catch a silent skip must not perform
 * one.
 */
/**
 * `ok` — the two values agree under this row's own condition.
 * `drift` — they disagree, and the disagreement is a fault.
 * `unchecked` — the comparison could not be made; `why` says what was missing.
 */
export type RowVerdict = "ok" | "drift" | "unchecked";
export interface DriftRow {
    /** The bookkeeping surface, spelled as `agents/orchestrator.md` spells it. */
    surface: string;
    /** What the (freezable) surface says. */
    says: string;
    /** What the un-freezable record says. */
    record: string;
    verdict: RowVerdict;
    /** Why the row could not be decided. Present only when `unchecked`. */
    why?: string;
}
export interface DriftReport {
    /** The workbench root, or null when there is no fusion project above cwd. */
    root: string | null;
    /** False when `agentstate.yaml` is absent — no session state to compare. */
    statePresent: boolean;
    rows: DriftRow[];
    /** The subset of `rows` whose verdict is `drift`. */
    drifted: DriftRow[];
    /**
     * A stable identity for the current divergence, empty when nothing drifted.
     *
     * This is what the throttle compares. It carries both values of every drifted
     * row, so a divergence that GROWS — the session committed again without
     * bringing the surfaces current — reads as a new signature and is reported
     * again, while a divergence that merely persists across the next tool call is
     * reported once.
     */
    signature: string;
}
/**
 * Compare every bookkeeping surface with the record that can contradict it.
 *
 * The five rows and their conditions are the ones `agents/orchestrator.md`
 * `### Drift check` tabulates; that table is the contract and this is its
 * implementation. Two conditions are not derivable from the row name and are
 * the reason the table exists: `progress.commits` tolerates a difference of one
 * (the commit currently in flight), and the Directive row counts only a
 * placeholder, never different wording.
 */
export declare function measureStateDrift(root: string): DriftReport;
/**
 * The signature last reported to the model, or "" when none was.
 *
 * Without this the hook would repeat itself on every tool call for as long as
 * the drift stands, and a message that arrives on every call is one an agent
 * learns to read past — the failure this whole mechanism exists to catch,
 * arriving one level up (the same reasoning `agents/orchestrator.md` records
 * for the Circle row's `if`).
 */
export declare function lastReported(root: string): string;
/** Record the signature just reported. `""` clears it, so a later drift speaks again. */
export declare function recordReported(root: string, signature: string): void;
/** One row, in the fixed-width shape the prompt's `row()` printed. */
export declare function renderRow(r: DriftRow): string;
/**
 * The sentence handed back to the model when a surface has drifted.
 *
 * It names what diverged and from what, and asks for exactly the writes
 * `agents/orchestrator.md` `### Write Points` already required — nothing new,
 * and nothing this process does itself.
 */
export declare function driftSentence(report: DriftReport): string;
