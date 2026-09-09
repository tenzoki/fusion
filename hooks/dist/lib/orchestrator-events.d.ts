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
 * (`260825-1430-reconciliation.md`). The repair is not a louder
 * mandate; it is moving the mechanical rows to a writer that cannot forget.
 *
 * Four row kinds are machine-written now, and only four:
 *
 *   - `task_start` — emitted by `guard.ts` (PreToolUse) when the tool is the
 *     sub-agent dispatch tool.
 *   - `task_done` — emitted by `tracker.ts` (PostToolUse) for the same calls.
 *   - `commit` — emitted by `bin/fusion-commit-lock with`, the one
 *     deterministic point every locked commit passes through. That emitter is
 *     bash and shares this module's schema by convention, not by import;
 *     `rules/commit-lock.md` carries its contract.
 *   - `session_start` — emitted by `session-start.ts` (SessionStart), once per
 *     session. See `## The session_start row` at the foot of this module for
 *     what it carries, why the model's own row is not replaced by it, and what
 *     tells the two apart. It is the one machine row that does NOT pass the
 *     gate below: at SessionStart `agentstate.yaml` does not exist yet, and the
 *     identifier is that row's dedup key rather than a descriptive field, so it
 *     is required outright.
 *
 * Everything else semantic — `turn_start`, gates, reviews — stays
 * model-written: those rows carry judgements (a Directive, a verdict, a Turn's
 * stats) that no hook can know. `session_start` is the one row kind written
 * from both sides at once, and it is deliberately a coexistence rather than a
 * replacement: the hook can know the session's identity, head and domain and
 * cannot know its Directive or its history file, so for now each writer writes
 * the row it can, and the `writer` field says which wrote which.
 *
 * ## The gate: a workbench root, and a session the row can be scoped to
 *
 * A dispatch row is written when `findWorkbenchRoot()` found a root AND either
 * of two terms holds: the hook payload carries a session identifier, or
 * `fusion-workbench/agentstate.yaml` exists. `eventRowsAdmitted` is the
 * predicate and `orchestratorSessionInFlight` is the second term, kept intact
 * as one arm of the disjunction — every call admitted before the widening is
 * still admitted, and this module removed nothing to gain the first term.
 *
 * ## Why it widened: from orchestrator-scoped to project-scoped
 *
 * The `agentstate.yaml` term made the gate ORCHESTRATOR-scoped. That file
 * exists exactly while an orchestrator session is running (Setup writes it, a
 * clean close deletes it), so a dispatch outside that window — a plain Claude
 * session in the same project using its own subagents — wrote nothing here and
 * the log stayed what its name says it is.
 *
 * That reading is being retired at its source. The state file is the Turn
 * loop's bookkeeping, the Turn loop is going, and a gate keyed on a file that
 * will not exist admits nothing at all. The identifier term replaces the
 * inference with the thing it was inferring: a session identifier plus a
 * workbench root IS a Claude Code session running inside a fusion project, read
 * off the payload rather than deduced from a file's existence.
 *
 * So the gate is PROJECT-scoped now, and the consequence is the point rather
 * than a cost to apologise for. A plain session's dispatches land in the log
 * whether or not an orchestrator is running — which the old gate already
 * admitted for the window it could not exclude, and stated as its residual.
 * Every row carries its own `session_id`, so scoping is the READER's job:
 * `bin/fusion-events` already reads this log by the identity on each line
 * rather than by a line's position in it, and after the widening that is the
 * only correct way to read it.
 *
 * ## An absent identifier is reported, never silently dropped
 *
 * With a root found and no identifier on the payload, one `guard_advisory`
 * naming the condition goes to `.guard-state/events.jsonl` — the same log the
 * configuration diagnostics use and the monitor's panel renders. The row itself
 * then follows the disjunction: written with `session_id` ABSENT when
 * `agentstate.yaml` still admits it, per this module's absent-rather-than-empty
 * rule, and not written at all when nothing does. Either way a reader of the
 * guard log can tell that a row was owed and what was missing. A bare `return`
 * could tell them neither, which is how the model-written rows came to stand on
 * zero session identifiers without anything noticing.
 *
 * The advisory is emitted once per emission call, and only where a row was
 * actually owed: `recordDispatchLaunch` parks a mapping entry rather than
 * writing a row, so it takes the gate and stays silent — `emitSubagentStop`
 * raises the advisory when that parked dispatch's row finally comes due.
 * `heartbeatSessionMarker` keeps the narrow `orchestratorSessionInFlight` gate
 * unwidened and unadvised, because its subject is the orchestrator's own
 * session marker rather than a row in this log.
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
/**
 * An orchestrator session is in flight iff Setup's state file exists.
 *
 * No longer the gate on its own — see `## The gate` — but still one arm of it,
 * and still the whole gate for the session-marker heartbeat below.
 */
export declare function orchestratorSessionInFlight(root: string): boolean;
/**
 * The session identifier off a hook payload: absent rather than empty.
 *
 * Every hook this module serves declares `session_id` as `unknown`, because a
 * payload is data from another process. A non-string or an empty string reads
 * as unresolved, the same rule `lib/events.ts` states for its own copy of this
 * field, so that "no session was named" and "the session is the empty string"
 * stay distinguishable — only one of them is a thing that can happen.
 */
export declare function payloadSessionId(input: {
    session_id?: unknown;
}): string | undefined;
/**
 * The gate. A row is admitted with a workbench root found and either term of
 * the disjunction satisfied — see `## The gate` in the header for both terms,
 * why the second one is kept, and why the first one was added.
 */
export declare function eventRowsAdmitted(root: string, sessionId: string | undefined): boolean;
/**
 * The advisory an absent session identifier earns, as a stable prefix a reader
 * and a test can both match on. The rest of the detail says which row kind was
 * owed and what became of it.
 */
export declare const ABSENT_SESSION_ID_ADVISORY = "orchestrator-events: the hook payload carried no session identifier";
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
 *
 * It keeps `orchestratorSessionInFlight` UNWIDENED where the row emitters now
 * take `eventRowsAdmitted`, and the reason is that its subject is different:
 * the marker records that an ORCHESTRATOR is running against this project, and
 * a plain session refreshing it on the strength of having a session identifier
 * would make Setup Step 0c's `running` verdict a statement about the wrong
 * thing.
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
/**
 * Park the pairing for the SubagentStop hook. No-op without an agentId.
 *
 * Takes the gate and raises no advisory: nothing is written to the event log
 * here, so there is no row for an absent identifier to be missing from.
 * `emitSubagentStop` advises when this launch's row actually comes due.
 */
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
 * Append one machine-written dispatch row. No-op without a workbench, and
 * gated by `eventRowsAdmitted`. An absent identifier is advised rather than
 * dropped in silence — see `## An absent identifier is reported` in the header.
 * Never throws past its caller's `bestEffort`; the append itself is still the
 * last thing that can fail, which is what `adviseAbsentSessionId`'s own `try`
 * preserves.
 */
export declare function emitDispatchEvent(event: "task_start" | "task_done", input: DispatchHookInput): void;
/** The `writer` value on every row this module writes from the SessionStart hook. */
export declare const SESSION_START_WRITER = "session-start-hook";
/** What the SessionStart hook reads off its payload. */
export interface SessionStartHookInput {
    session_id?: unknown;
}
/**
 * The two facts only the caller can resolve — the head commit and the domain.
 * They are resolved by `session-start.ts` because each costs a subprocess, and
 * this module is imported by three hooks that must never pay for them.
 */
export interface SessionStartFacts {
    gitHeadAtStart?: string;
    domain?: string;
}
/** One hook-written `session_start` row. Field order matches the model's. */
export interface SessionStartEventRow {
    ts: string;
    event: "session_start";
    writer: string;
    person?: string;
    checkout?: string;
    session_id: string;
    git_head_at_start?: string;
    domain?: string;
}
/**
 * True when this session already has a hook-written `session_start` row.
 *
 * An unreadable or absent log is `false`: nothing can duplicate a row that is
 * not there. A line that will not parse is skipped rather than throwing — the
 * file carries `merge=union` and a conflict marker in it must not cost the
 * session its row.
 */
export declare function sessionStartAlreadyWritten(root: string, sessionId: string): boolean;
/**
 * Append this session's `session_start` row, or return `null` having written
 * nothing. `resolveFacts` is a thunk rather than a value so that the two
 * subprocesses behind it are never spawned for a row that will not be written.
 */
export declare function emitSessionStartEvent(root: string, input: SessionStartHookInput, resolveFacts: () => SessionStartFacts): SessionStartEventRow | null;
