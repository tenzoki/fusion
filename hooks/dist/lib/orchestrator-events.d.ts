/**
 * Machine-written rows for `fusion-workbench/orchestrator-events.jsonl`.
 *
 * ## Why a hook writes these rows at all
 *
 * Until v10.8.0 every row in the orchestrator's event log was written by the
 * model, per prompt mandate, with a timestamp obtained from `date -u` at the
 * moment the model got around to it. Measured on this repository's own log on
 * 2026-08-27: 87 % of 2,420 lines shared a second-resolution timestamp with a
 * neighbouring line (batch-written after the fact), 2.6 % carried the
 * `person`/`checkout` identity the C4 readers scope on, and `session_id` stood
 * on zero lines although the SessionStart hook that supplies it had shipped.
 * The mandate was right and the work departed from it — the project's own
 * reconciler had already filed that as a defect
 * (`shared/history/260825-1430-reconciliation.md`). The repair is not a louder
 * mandate; it is moving the mechanical rows to a writer that cannot forget.
 *
 * Three row kinds are machine-written now, and only three:
 *
 *   - `task_start` — emitted by `guard.ts` (PreToolUse) when the tool is the
 *     sub-agent dispatch tool.
 *   - `task_done` — emitted by `tracker.ts` (PostToolUse) for the same calls.
 *   - `commit` — emitted by `bin/fusion-commit-lock with`, the one
 *     deterministic point every locked commit passes through. That emitter is
 *     bash and shares this module's schema by convention, not by import;
 *     `rules/commit-lock.md` carries its contract.
 *
 * Everything semantic — `turn_start`, `session_start`, gates, reviews — stays
 * model-written: those rows carry judgements (a Directive, a verdict, a Turn's
 * stats) that no hook can know.
 *
 * ## The gate: rows are written only while an orchestrator session is in flight
 *
 * `fusion-workbench/agentstate.yaml` exists exactly while an orchestrator
 * session is running (Setup writes it, a clean close deletes it). A dispatch
 * outside that window — a plain Claude session in the same project using its
 * own subagents — writes nothing here, so the log stays what its name says it
 * is. Residual, stated rather than hidden: a plain session's dispatches DURING
 * a live orchestrator session do land in the log; their rows carry their own
 * `session_id`, which is what lets a reader tell them apart.
 *
 * ## Identity: env first, then the one implementation, never a re-derivation
 *
 * `person` and `checkout` come from `FUSION_PERSON`/`FUSION_CHECKOUT` when the
 * SessionStart export supplied them, else from running `bin/fusion-identity`
 * (resolved relative to this file, so an install copy and a work tree each run
 * their own) — never from a second implementation of the criterion. An
 * unresolved half makes its key ABSENT rather than empty, the same rule
 * `lib/events.ts` states for `session_id` and the record templates state for
 * the filing line. `session_id` comes from the hook payload, which carries it
 * on every tool event (measured — see `session-id.ts`'s header).
 *
 * ## Timestamp format
 *
 * `YYYY-MM-DDTHH:MM:SS`, UTC, no `Z` designator — the log's standing emit
 * convention (`agents/orchestrator.md` `### 2. Structured Event Log`;
 * CLAUDE.md's symptom table carries the parsing burden this transfers to
 * consumers). Matching the convention beats improving it here: one log, one
 * format.
 */
/** The sub-agent dispatch tool, under both names Claude Code has used for it. */
export declare function isDispatchTool(toolName: unknown): boolean;
/** The log's emit convention: UTC, second resolution, no designator. */
export declare function utcStamp(now?: Date): string;
/** An orchestrator session is in flight iff Setup's state file exists. */
export declare function orchestratorSessionInFlight(root: string): boolean;
/**
 * The session-marker heartbeat, machine-written (v10.8.0). Until then the
 * orchestrator ran `fusion-session-mark heartbeat` at every Turn boundary by
 * prompt mandate — one more act on a path that already had ~12, and skipped
 * exactly when the session was busiest. Now every PostToolUse call refreshes
 * the marker's mtime, self-rate-limited on that same mtime (at most once per
 * 60 s), and only while BOTH marker and `agentstate.yaml` exist — the marker
 * so a session that never wrote one (a plain, non-orchestrator session) never
 * masquerades as one, the state file so a cleared session stays cleared.
 * Residual, stated: a plain session's tool calls DURING a live orchestrator
 * session also refresh the marker; the `running` verdict that produces at
 * Setup Step 0c is then true anyway. Never creates, never deletes — writing
 * and clearing stay `bin/fusion-session-mark`'s.
 */
export declare function heartbeatSessionMarker(root: string): void;
/**
 * The identity pair for a machine row. Env first (the SessionStart export),
 * else one run of `bin/fusion-identity` — the single implementation of the
 * criterion, minting included. Either half may come back undefined, and an
 * undefined half is an absent key on the row.
 */
export declare function resolveIdentity(root: string): {
    person?: string;
    checkout?: string;
};
/** What the dispatch hooks read off the tool payload. */
export interface DispatchHookInput {
    session_id?: unknown;
    tool_use_id?: unknown;
    tool_input?: Record<string, unknown>;
    tool_response?: unknown;
}
/** The launch verdict off the PostToolUse payload, read and never predicted. */
export declare function dispatchWasBackgrounded(input: DispatchHookInput): boolean;
/** Park the pairing for the SubagentStop hook. No-op without an agentId. */
export declare function recordDispatchLaunch(input: DispatchHookInput): void;
/** What the SubagentStop hook reads off its payload. */
export interface SubagentStopInput {
    session_id?: unknown;
    agent_id?: unknown;
    agent_type?: unknown;
}
/**
 * The backgrounded dispatch's real completion. Emits task_done only when the
 * launch parked a mapping entry — a sync dispatch's SubagentStop fires before
 * any entry exists and correctly emits nothing (PostToolUse owns that row).
 */
export declare function emitSubagentStop(input: SubagentStopInput): void;
/**
 * Append one machine-written dispatch row. No-op without a workbench or
 * outside an orchestrator session. Never throws past its caller's
 * `bestEffort`; the append itself is the last thing that can fail.
 */
export declare function emitDispatchEvent(event: "task_start" | "task_done", input: DispatchHookInput): void;
