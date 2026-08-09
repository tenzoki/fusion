/**
 * Escalation state manager for the Compliance Guard.
 *
 * Ported from fusion/reactor/pkg/guard/escalation.go.
 * Manages halt state and consecutive block tracking via JSON file.
 *
 * Escalation levels:
 *   block — single tool call blocked
 *   halt  — ALL tool calls blocked until human clears
 *   clear — halt cleared by human intervention
 *
 * 3 consecutive blocks auto-escalate to halt (configurable).
 */
export interface EscalationEvent {
    level: "block" | "halt" | "clear";
    trigger: string;
    message: string;
    timestamp: string;
    toolName?: string;
    filePath?: string;
}
export interface EscalationState {
    haltActive: boolean;
    consecutiveBlocks: number;
    lastBlockTimestamp: string | null;
    recentEvents: EscalationEvent[];
}
/**
 * The command that clears a halt, spelled with BOTH directories in it.
 *
 * ## Why the `cd` is part of the command
 *
 * The halt is project-scoped — it is recorded in
 * `<project-root>/fusion-workbench/.guard-state/escalation.json`, which
 * `guardStatePath` in `guard-state-file.ts` finds by walking up from the
 * working directory.
 * The clearing script is plugin-scoped, and every halt message used to name
 * only the plugin half. A user read `node <plugin-root>/…/clear-halt.js`,
 * ran it from their home directory, and was told `Guard is not halted. No
 * action needed.` while the halt stood untouched in the project (issue
 * 260805-1134). Nothing in the message had said the working directory
 * decides, so the correct command at the wrong place looked like success.
 *
 * `clear-halt.ts` now refuses that case outright. This function is the other
 * half: the message a user actually reads names the project directory too, so
 * the mistake is harder to make than it is to diagnose.
 *
 * ## Why it lives here
 *
 * Two hooks raise a halt — `guard.ts` on the third consecutive block and
 * `tracker.ts` on a measured protected-path change — and both have to say how
 * to clear it. One authoring site, next to the state the command acts on, so a
 * third caller cannot start telling users something different.
 *
 * Both directories degrade to a placeholder rather than being omitted:
 * `CLAUDE_PLUGIN_ROOT` is exported by the SessionStart hook and is normally
 * set, and a halt is only ever readable when a workbench exists, so neither
 * fallback is the expected path. A placeholder that is visibly a blank keeps
 * the shape of the command intact where a dropped clause would quietly teach
 * the wrong invocation.
 */
export declare function clearHaltCommand(): string;
/**
 * Load escalation state from disk. Returns the empty state when the file is
 * missing, when there is no workbench, when the text does not parse, AND when
 * it parses to something that is not an escalation state — see `coerceState`
 * for why that last case is the one worth spelling out.
 */
export declare function loadEscalation(): EscalationState;
/**
 * Save escalation state to disk atomically, WITHOUT discarding what another
 * process wrote since this state was loaded. No-op if no workbench is set up.
 *
 * ## The lost update this exists to prevent
 *
 * The rename makes each write atomic against a reader; it does nothing about a
 * lost update, because what is written is the whole state object the caller is
 * holding. `guard.ts` holds that object across the entire PreToolUse decision —
 * it loads before CHECK 1 and the allow path saves at the very end — and
 * `tracker.ts` loads, calls `raiseHalt` and saves inside that window whenever
 * the measurement finds a protected path changed. A blind write of the guard's
 * object then puts `haltActive: false` back over a halt that was correctly
 * raised, takes its `recentEvents` entry with it, and leaves the `guard_halt`
 * row in `events.jsonl` describing a halt no longer recorded (issue
 * `260809-1101_*_escalation-json-read-modify-write-can-lose-a-halt-raised-by-a-parallel-tool-call.md`).
 *
 * `speculation:` that interleaving is not measured. The read-modify-write shape
 * is plain in the code; whether Claude Code runs two guarded tool calls close
 * enough together for it to happen, and how often, is unknown — the hook
 * payload carries no per-call correlation key to measure it with. The fix is
 * cheap enough not to need the frequency, but nothing here should be read as
 * evidence that it has been observed.
 *
 * ## What the merge preserves, and what it deliberately does not
 *
 * PRESERVED — a halt that appeared on disk after this state was loaded. It is
 * adopted rather than overwritten, which makes `haltActive` monotonic within
 * one call, the direction `coerceState` already argues for. The test is
 * "newly raised", not "raised": a caller that loaded a halt and is now writing
 * `false` — `clear-halt.ts`, the human intervention — meant to clear it, and
 * an unconditional OR would resurrect a halt the user just cleared.
 *
 * PRESERVED — events another writer appended. Every mutation in this module is
 * an append, so the merge needs no event identity: the disk list is the trunk
 * and this caller's events since its own load are re-applied on top, in that
 * order. Without this the adopted halt would arrive with no entry explaining
 * it.
 *
 * NOT preserved — `consecutiveBlocks` and `lastBlockTimestamp`, which are
 * last-writer-wins. A lost increment costs counter accuracy: the threshold halt
 * arrives one block later than it might have. That is the same trade the
 * counters in `churn.ts` and `cross-file.ts` make with the same shape, and it
 * is left alone for the same reason — the boundary the guard actually enforces
 * is the outright halt above, not the count that approaches one.
 *
 * ## The window this shrinks rather than closes
 *
 * The re-read and the rename are two operations, so a halt raised BETWEEN them
 * is still lost. What changes is the size of the window: from the whole
 * PreToolUse decision — every check, every config read, every path match — down
 * to the two calls below. Only a lock closes it completely, and taking one
 * around every guarded tool call buys the remaining microseconds at the price of
 * serialising the guard and owning a stale-lock story (`bin/fusion-commit-lock`
 * has one, for a surface where contention is the normal case rather than the
 * rare one). That trade was declined here; a lock stays available if the window
 * is ever measured to matter.
 *
 * ## Two things the caller can rely on afterwards
 *
 * The caller's object is updated to what was written, so the state in hand and
 * the state on disk do not silently disagree, and a second save from the same
 * object appends only what was pushed after the first. Nothing re-decides the
 * tool call in flight: a guard that discovers an adopted halt here has already
 * allowed this call, and the halt takes effect on the next one, where CHECK 1
 * reads it.
 *
 * A state object with no recorded baseline — hand-built rather than loaded — is
 * read as "loaded from an empty file, not halted": all of its events are
 * treated as this caller's appends, and any halt on disk counts as newly
 * raised. Both defaults fail toward keeping what is already recorded.
 */
export declare function saveEscalation(state: EscalationState): void;
/** Check if the guard is in halt mode. */
export declare function isHalted(state: EscalationState): boolean;
/**
 * Record a block event. Returns true if halt was triggered.
 *
 * Ported from escalation.go:150-171:
 * Increments consecutive block counter. If it reaches blocksBeforeHalt,
 * activates halt mode.
 */
export declare function recordBlock(state: EscalationState, blocksBeforeHalt: number, trigger: string, message: string, toolName?: string, filePath?: string): boolean;
/**
 * Raise the halt immediately, without counting toward the threshold.
 *
 * ## Why this is not `recordBlock`
 *
 * `recordBlock` models a REFUSED tool call: nothing happened, and three of them
 * in a row are the evidence that an agent is pushing against the guard rather
 * than working. The measurement in `tracker.ts` reports the opposite situation —
 * a protected path was ACTUALLY WRITTEN and had to be put back. There
 * is no "two more of these and we will do something about it": the boundary is
 * already crossed, and the write happened before anyone could refuse it.
 *
 * So the transition is its own, and it lives here rather than inline at the
 * caller because every other mutation of `haltActive` and `recentEvents` does.
 * A second place that knows the shape of this state is a second place that can
 * drift from it.
 *
 * `consecutiveBlocks` is deliberately NOT touched. It counts refusals, this was
 * not one, and inflating it would make the next ordinary block halt early for a
 * reason its own message could not explain.
 */
export declare function raiseHalt(state: EscalationState, trigger: string, message: string, toolName?: string, filePath?: string): void;
/** Reset consecutive block counter (called on successful allow). */
export declare function resetBlockCounter(state: EscalationState): void;
/** Clear halt mode (human intervention). */
export declare function clearHalt(state: EscalationState): void;
