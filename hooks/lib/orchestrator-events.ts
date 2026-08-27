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

import { execFileSync } from "node:child_process";
import {
  appendFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  statSync,
  utimesSync,
  writeFileSync,
} from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { findWorkbenchRoot } from "./workbench-root.js";

/** The sub-agent dispatch tool, under both names Claude Code has used for it. */
export function isDispatchTool(toolName: unknown): boolean {
  return toolName === "Task" || toolName === "Agent";
}

/** The log's emit convention: UTC, second resolution, no designator. */
export function utcStamp(now: Date = new Date()): string {
  return now.toISOString().slice(0, 19);
}

/** An orchestrator session is in flight iff Setup's state file exists. */
export function orchestratorSessionInFlight(root: string): boolean {
  return existsSync(resolve(root, "fusion-workbench", "agentstate.yaml"));
}

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
export function heartbeatSessionMarker(root: string): void {
  const marker = resolve(root, "fusion-workbench", ".session-marker");
  if (!existsSync(marker)) return;
  if (!orchestratorSessionInFlight(root)) return;
  const age = Date.now() - statSync(marker).mtimeMs;
  if (age < 60_000) return;
  const now = new Date();
  utimesSync(marker, now, now);
}

/**
 * The identity pair for a machine row. Env first (the SessionStart export),
 * else one run of `bin/fusion-identity` — the single implementation of the
 * criterion, minting included. Either half may come back undefined, and an
 * undefined half is an absent key on the row.
 */
export function resolveIdentity(root: string): {
  person?: string;
  checkout?: string;
} {
  const envPerson = process.env.FUSION_PERSON;
  const envCheckout = process.env.FUSION_CHECKOUT;
  if (envPerson && envCheckout) {
    return { person: envPerson, checkout: envCheckout };
  }
  // dist layout: <plugin>/hooks/dist/lib/orchestrator-events.js → <plugin>/bin
  const helper = resolve(
    dirname(fileURLToPath(import.meta.url)),
    "..",
    "..",
    "..",
    "bin",
    "fusion-identity",
  );
  if (!existsSync(helper)) return {};
  let out = "";
  try {
    out = execFileSync(helper, [], {
      cwd: root,
      encoding: "utf-8",
      stdio: ["ignore", "pipe", "ignore"],
    });
  } catch (err) {
    // Non-zero exits still print the halves that resolved; execFileSync
    // attaches stdout to the error it throws.
    const e = err as { stdout?: string | Buffer };
    out = typeof e.stdout === "string" ? e.stdout : (e.stdout?.toString("utf-8") ?? "");
  }
  const person = /^PERSON=(.+)$/m.exec(out)?.[1];
  const checkout = /^CHECKOUT=([0-9a-f]{8})$/m.exec(out)?.[1];
  return {
    ...(person && { person }),
    ...(checkout && { checkout }),
  };
}

/** What the dispatch hooks read off the tool payload. */
export interface DispatchHookInput {
  session_id?: unknown;
  tool_use_id?: unknown;
  tool_input?: Record<string, unknown>;
  tool_response?: unknown;
}

/* ------------------------------------------------------------------ *
 * The backgrounded dispatch, and why task_done has two emitters
 *
 * Measured 2026-08-27 against Claude Code 2.1.x in a throwaway project
 * (`shared/analyses/260827-0740-subagentstop-payload-measurement.md`):
 *
 *   - SYNC dispatch: PreToolUse -> SubagentStop -> PostToolUse, and the
 *     PostToolUse payload carries `tool_response.status: "completed"` plus
 *     `duration_ms`. PostToolUse fires AFTER the sub-agent finished, so the
 *     task_done it emits spans the real duration.
 *   - BACKGROUND dispatch: PostToolUse fires at launch (`duration_ms` ~4) with
 *     `tool_response.status: "async_launched"` and the `agentId`; SubagentStop
 *     fires at the actual completion carrying the SAME id as `agent_id` — but
 *     NO tool_use_id.
 *
 * So the tracker emits task_done only for a completed dispatch; for a launched
 * one it records agentId -> {task, agent, detail} in
 * `.guard-state/dispatch-map.json`, and the SubagentStop hook resolves the
 * pairing back to the tool-use id when the agent really stops. The ordering
 * removes the need for any dedup heuristic: a sync SubagentStop fires before
 * PostToolUse ever wrote a mapping entry, finds nothing, and stays silent.
 * Issue `shared/issues/260827-0716_*_task-done-fires-at-dispatch-launch-when-the-sub-agent-runs-in-the-background.md`.
 * ------------------------------------------------------------------ */

const DISPATCH_MAP = ["fusion-workbench", ".guard-state", "dispatch-map.json"] as const;
/** A mapping entry older than this is a crashed session's leftover. */
const MAP_ENTRY_TTL_MS = 24 * 60 * 60 * 1000;

interface DispatchMapEntry {
  task?: string;
  agent?: string;
  detail?: string;
  ts: number;
}

function mapPath(root: string): string {
  return resolve(root, ...DISPATCH_MAP);
}

function readMap(root: string): Record<string, DispatchMapEntry> {
  try {
    return JSON.parse(readFileSync(mapPath(root), "utf-8")) as Record<string, DispatchMapEntry>;
  } catch {
    return {};
  }
}

function writeMap(root: string, map: Record<string, DispatchMapEntry>): void {
  const now = Date.now();
  for (const [id, entry] of Object.entries(map)) {
    if (typeof entry?.ts !== "number" || now - entry.ts > MAP_ENTRY_TTL_MS) delete map[id];
  }
  mkdirSync(resolve(root, "fusion-workbench", ".guard-state"), { recursive: true });
  writeFileSync(mapPath(root), JSON.stringify(map), "utf-8");
}

/** The launch verdict off the PostToolUse payload, read and never predicted. */
export function dispatchWasBackgrounded(input: DispatchHookInput): boolean {
  const resp = input.tool_response;
  if (typeof resp !== "object" || resp === null) return false;
  return (resp as { status?: unknown }).status === "async_launched";
}

/** Park the pairing for the SubagentStop hook. No-op without an agentId. */
export function recordDispatchLaunch(input: DispatchHookInput): void {
  const root = findWorkbenchRoot();
  if (root === null || !orchestratorSessionInFlight(root)) return;
  const agentId = (input.tool_response as { agentId?: unknown } | null | undefined)?.agentId;
  if (typeof agentId !== "string" || agentId === "") return;
  const map = readMap(root);
  const description = input.tool_input?.description;
  map[agentId] = {
    ...(typeof input.tool_use_id === "string" && input.tool_use_id !== "" && { task: input.tool_use_id }),
    ...(agentName(input.tool_input) && { agent: agentName(input.tool_input) }),
    ...(typeof description === "string" && description !== "" && { detail: description.slice(0, 200) }),
    ts: Date.now(),
  };
  writeMap(root, map);
}

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
export function emitSubagentStop(input: SubagentStopInput): void {
  const root = findWorkbenchRoot();
  if (root === null || !orchestratorSessionInFlight(root)) return;
  const agentId = typeof input.agent_id === "string" ? input.agent_id : "";
  if (agentId === "") return;
  const map = readMap(root);
  const entry = map[agentId];
  if (entry === undefined) return;
  delete map[agentId];
  writeMap(root, map);

  const identity = resolveIdentity(root);
  const sessionId =
    typeof input.session_id === "string" && input.session_id !== "" ? input.session_id : undefined;
  const row: OrchestratorEventRow = {
    ts: utcStamp(),
    event: "task_done",
    ...(entry.task && { task: entry.task }),
    ...(entry.agent && { agent: entry.agent }),
    ...identity,
    ...(sessionId && { session_id: sessionId }),
    ...(entry.detail && { detail: entry.detail }),
  };
  appendFileSync(
    resolve(root, "fusion-workbench", "orchestrator-events.jsonl"),
    JSON.stringify(row) + "\n",
    "utf-8",
  );
}

/** One machine row. Field order matches the model-written rows for a human diff. */
interface OrchestratorEventRow {
  ts: string;
  event: "task_start" | "task_done";
  task?: string;
  agent?: string;
  person?: string;
  checkout?: string;
  session_id?: string;
  detail?: string;
}

/** `fusion:coder` → `coder`, matching the model-written rows' spelling. */
function agentName(toolInput: Record<string, unknown> | undefined): string | undefined {
  const raw = toolInput?.subagent_type;
  if (typeof raw !== "string" || raw === "") return undefined;
  const colon = raw.lastIndexOf(":");
  return colon === -1 ? raw : raw.slice(colon + 1);
}

/**
 * Append one machine-written dispatch row. No-op without a workbench or
 * outside an orchestrator session. Never throws past its caller's
 * `bestEffort`; the append itself is the last thing that can fail.
 */
export function emitDispatchEvent(
  event: "task_start" | "task_done",
  input: DispatchHookInput,
): void {
  const root = findWorkbenchRoot();
  if (root === null) return;
  if (!orchestratorSessionInFlight(root)) return;

  const identity = resolveIdentity(root);
  const task = typeof input.tool_use_id === "string" && input.tool_use_id !== "" ? input.tool_use_id : undefined;
  const sessionId =
    typeof input.session_id === "string" && input.session_id !== "" ? input.session_id : undefined;
  const description = input.tool_input?.description;
  const detail =
    typeof description === "string" && description !== "" ? description.slice(0, 200) : undefined;

  const row: OrchestratorEventRow = {
    ts: utcStamp(),
    event,
    ...(task && { task }),
    ...(agentName(input.tool_input) && { agent: agentName(input.tool_input) }),
    ...identity,
    ...(sessionId && { session_id: sessionId }),
    ...(detail && { detail }),
  };

  appendFileSync(
    resolve(root, "fusion-workbench", "orchestrator-events.jsonl"),
    JSON.stringify(row) + "\n",
    "utf-8",
  );
}
