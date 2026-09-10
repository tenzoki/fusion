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
 *     gate below: the identifier is that row's dedup key rather than a
 *     descriptive field, so it is required outright.
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
 * A dispatch row is written when `findWorkbenchRoot()` found a root AND the
 * hook payload carries a session identifier. `eventRowsAdmitted` is the
 * predicate, and one term is the whole of it.
 *
 * ## Why the gate is project-scoped
 *
 * It had a second term until 2026-09-10: `fusion-workbench/agentstate.yaml`
 * exists. That file was Setup's own bookkeeping, written by the model at the
 * start of an orchestrator session and deleted at a clean close, so the term
 * made the gate ORCHESTRATOR-scoped — a dispatch outside that window, from a
 * plain Claude session in the same project, wrote nothing here.
 *
 * The Turn loop that kept the file went with the cut, so the term was keyed on
 * a file nothing writes any more and admitted nothing at all. What remains is
 * the thing the file was ever evidence for: a session identifier plus a
 * workbench root IS a Claude Code session running inside a fusion project, read
 * off the payload rather than deduced from a file's existence.
 *
 * The consequence is the point rather than a cost to apologise for. A plain
 * session's dispatches land in the log whether or not an orchestrator is
 * running — which the old gate already admitted for the window it could not
 * exclude, and stated as its residual. Every row carries its own `session_id`,
 * so scoping is the READER's job: `bin/fusion-events` already reads this log by
 * the identity on each line rather than by a line's position in it, and that is
 * the only correct way to read it.
 *
 * ## An absent identifier is reported, never silently dropped
 *
 * With a root found and no identifier on the payload, one `guard_advisory`
 * naming the condition goes to `.guard-state/events.jsonl` — the same log the
 * configuration diagnostics use and the monitor's panel renders. The row itself
 * itself is then not written at all, because nothing else admits it. Either
 * way a reader of the guard log can tell that a row was owed and what was
 * missing. A bare `return` could tell them neither, which is how the
 * model-written rows came to stand on zero session identifiers without anything
 * noticing.
 *
 * The advisory is emitted once per emission call, and only where a row was
 * actually owed: `recordDispatchLaunch` parks a mapping entry rather than
 * writing a row, so it takes the gate and stays silent — `emitSubagentStop`
 * raises the advisory when that parked dispatch's row finally comes due.
 * `heartbeatSessionMarker` keeps its own narrow gate — the marker's existence —
 * and stays unadvised, because its subject is the orchestrator's own session
 * marker rather than a row in this log.
 *
 * ## What a task_start row measures
 *
 * A `task_start` row carries two things beyond the dispatch's identity: the byte
 * cost of what the dispatch loads (`bytes_prompt`, `bytes_rules`,
 * `bytes_claude_md`, `bytes_total`, and `bytes_delta` against the project's own
 * armed baseline), and `work_item`, the basename a `**Work-item:**` line in the
 * dispatch prompt claims. `lib/dispatch-bytes.ts` is the authoring home for all
 * of it — where each figure comes from, why the rule count runs the helper
 * rather than reproducing its emission list, what the memo is keyed on, and
 * where the line between "absent" and "zero" falls.
 *
 * Two consequences belong here rather than there. Neither field goes on
 * `task_done`: the row names the same dispatch and a second measurement would
 * cost a second set of stats for a reader that already holds the first. And the
 * dispatch path now writes `.guard-state/rule-sizes.json` and
 * `.guard-state/byte-baseline.json`, which is a departure from the
 * writes-no-guard-state property that path held until this measurement existed —
 * `hooks/guard.ts`'s header states the widened form.
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
import {
  DispatchByteFields,
  measureDispatchBytes,
  workItemFromPrompt,
} from "./dispatch-bytes.js";
import { emitEvent } from "./events.js";
import { findWorkbenchRoot } from "./workbench-root.js";

/** The sub-agent dispatch tool, under both names Claude Code has used for it. */
export function isDispatchTool(toolName: unknown): boolean {
  return toolName === "Task" || toolName === "Agent";
}

/** The log's emit convention: UTC, second resolution, no designator. */
export function utcStamp(now: Date = new Date()): string {
  return now.toISOString().slice(0, 19);
}

/**
 * The session identifier off a hook payload: absent rather than empty.
 *
 * Every hook this module serves declares `session_id` as `unknown`, because a
 * payload is data from another process. A non-string or an empty string reads
 * as unresolved, the same rule `lib/events.ts` states for its own copy of this
 * field, so that "no session was named" and "the session is the empty string"
 * stay distinguishable — only one of them is a thing that can happen.
 */
export function payloadSessionId(input: { session_id?: unknown }): string | undefined {
  return typeof input.session_id === "string" && input.session_id !== ""
    ? input.session_id
    : undefined;
}

/**
 * The gate. A row is admitted with a workbench root found and either term of
 * the disjunction satisfied — see `## The gate` in the header for both terms,
 * why the second one is kept, and why the first one was added.
 */
export function eventRowsAdmitted(_root: string, sessionId: string | undefined): boolean {
  return sessionId !== undefined;
}

/**
 * The advisory an absent session identifier earns, as a stable prefix a reader
 * and a test can both match on. The rest of the detail says which row kind was
 * owed and what became of it.
 */
export const ABSENT_SESSION_ID_ADVISORY =
  "orchestrator-events: the hook payload carried no session identifier";

/**
 * Report an absent identifier into the guard's own event log.
 *
 * Wrapped in its own `try`, and that is deliberate rather than defensive
 * habit: this call sits AHEAD of the row it is about, so an unwritable
 * `.guard-state/` here would cost the caller the row itself. The module's
 * standing contract is that the append is the last thing that can fail, and
 * this keeps it true.
 */
function adviseAbsentSessionId(rowKind: string, written: boolean): void {
  const outcome = written
    ? `the ${rowKind} row is written with session_id absent`
    : `no ${rowKind} row is written, and no orchestrator session is in flight either`;
  try {
    emitEvent("guard_advisory", undefined, undefined, `${ABSENT_SESSION_ID_ADVISORY}; ${outcome}.`);
  } catch {
    // An advisory that cannot be written may not cost the row it is about.
  }
}

/**
 * The session-marker heartbeat, machine-written (v10.8.0). Until then the
 * orchestrator ran `fusion-session-mark heartbeat` at every Turn boundary by
 * prompt mandate — one more act on a path that already had ~12, and skipped
 * exactly when the session was busiest. Now every PostToolUse call refreshes
 * the marker's mtime, self-rate-limited on that same mtime (at most once per
 * 60 s), and only while the marker exists — so a session that never wrote one
 * (a plain, non-orchestrator session) never masquerades as one, and a cleared
 * session stays cleared, `clear` having deleted the marker itself. A second
 * conjunct, `agentstate.yaml` exists, stood beside it until 2026-09-10 and went
 * with the file: a term nothing writes any more admits nothing.
 * Residual, stated: a plain session's tool calls DURING a live orchestrator
 * session also refresh the marker; the `running` verdict that produces at
 * Setup Step 0c is then true anyway. Never creates, never deletes — writing
 * and clearing stay `bin/fusion-session-mark`'s.
 *
 * It deliberately does NOT take `eventRowsAdmitted`, and the reason is that its
 * subject is different: the marker records that an ORCHESTRATOR is running
 * against this project, and a plain session refreshing it on the strength of
 * having a session identifier would make Setup Step 0c's `running` verdict a
 * statement about the wrong thing. The marker's own existence is what keeps the
 * two apart.
 */
export function heartbeatSessionMarker(root: string): void {
  const marker = resolve(root, "fusion-workbench", ".session-marker");
  if (!existsSync(marker)) return;
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
 * (`260827-0740-subagentstop-payload-measurement.md`):
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
 * Issue `260827-0716_*_task-done-fires-at-dispatch-launch-when-the-sub-agent-runs-in-the-background.md`.
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

/**
 * Park the pairing for the SubagentStop hook. No-op without an agentId.
 *
 * Takes the gate and raises no advisory: nothing is written to the event log
 * here, so there is no row for an absent identifier to be missing from.
 * `emitSubagentStop` advises when this launch's row actually comes due.
 */
export function recordDispatchLaunch(input: DispatchHookInput): void {
  const root = findWorkbenchRoot();
  if (root === null) return;
  if (!eventRowsAdmitted(root, payloadSessionId(input))) return;
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
  if (root === null) return;
  const agentId = typeof input.agent_id === "string" ? input.agent_id : "";
  if (agentId === "") return;
  const map = readMap(root);
  const entry = map[agentId];
  if (entry === undefined) return;

  // The gate sits AFTER the mapping lookup on purpose. A sync dispatch's
  // SubagentStop reaches here with no parked entry and is owed no row at all,
  // so gating first would advise about a row nobody expected — one spurious
  // advisory per sync dispatch, which is the noise that teaches a reader to
  // ignore the log. Past this point a row is owed.
  const sessionId = payloadSessionId(input);
  const admitted = eventRowsAdmitted(root, sessionId);
  if (sessionId === undefined) adviseAbsentSessionId("task_done", admitted);
  if (!admitted) return;

  delete map[agentId];
  writeMap(root, map);

  const identity = resolveIdentity(root);
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

/**
 * One machine row. Field order matches the model-written rows for a human diff.
 *
 * The `work_item` and `bytes_*` fields are written on `task_start` only — see
 * `## What a task_start row measures` at the foot of this module.
 */
interface OrchestratorEventRow extends DispatchByteFields {
  ts: string;
  event: "task_start" | "task_done";
  task?: string;
  agent?: string;
  person?: string;
  checkout?: string;
  session_id?: string;
  detail?: string;
  work_item?: string;
}

/** `fusion:coder` → `coder`, matching the model-written rows' spelling. */
function agentName(toolInput: Record<string, unknown> | undefined): string | undefined {
  const raw = toolInput?.subagent_type;
  if (typeof raw !== "string" || raw === "") return undefined;
  const colon = raw.lastIndexOf(":");
  return colon === -1 ? raw : raw.slice(colon + 1);
}

/**
 * Append one machine-written dispatch row. No-op without a workbench, and
 * gated by `eventRowsAdmitted`. An absent identifier is advised rather than
 * dropped in silence — see `## An absent identifier is reported` in the header.
 * Never throws past its caller's `bestEffort`; the append itself is still the
 * last thing that can fail, which is what `adviseAbsentSessionId`'s own `try`
 * preserves.
 */
export function emitDispatchEvent(
  event: "task_start" | "task_done",
  input: DispatchHookInput,
): void {
  const root = findWorkbenchRoot();
  if (root === null) return;

  const sessionId = payloadSessionId(input);
  const admitted = eventRowsAdmitted(root, sessionId);
  if (sessionId === undefined) adviseAbsentSessionId(event, admitted);
  if (!admitted) return;

  const identity = resolveIdentity(root);
  const task = typeof input.tool_use_id === "string" && input.tool_use_id !== "" ? input.tool_use_id : undefined;
  const description = input.tool_input?.description;
  const detail =
    typeof description === "string" && description !== "" ? description.slice(0, 200) : undefined;
  const agent = agentName(input.tool_input);

  // The dispatch's own measurements, on `task_start` and nowhere else. Both are
  // absent-rather-than-empty: a dispatch naming no work item writes no
  // `work_item` key, and an unmeasurable rule emission writes no `bytes_rules`
  // and no `bytes_total` — and says so, in one advisory.
  let bytes: DispatchByteFields = {};
  let workItem: string | undefined;
  if (event === "task_start" && agent !== undefined) {
    workItem = workItemFromPrompt(input.tool_input);
    const measured = measureDispatchBytes(root, agent);
    bytes = measured.fields;
    if (measured.advisory !== undefined) {
      try {
        emitEvent("guard_advisory", undefined, undefined, measured.advisory);
      } catch {
        // An advisory that cannot be written may not cost the row it is about.
      }
    }
  }

  const row: OrchestratorEventRow = {
    ts: utcStamp(),
    event,
    ...(task && { task }),
    ...(agent && { agent }),
    ...identity,
    ...(sessionId && { session_id: sessionId }),
    ...(detail && { detail }),
    ...(workItem && { work_item: workItem }),
    ...bytes,
  };

  appendFileSync(
    resolve(root, "fusion-workbench", "orchestrator-events.jsonl"),
    JSON.stringify(row) + "\n",
    "utf-8",
  );
}

/* ------------------------------------------------------------------ *
 * ## The session_start row
 *
 * Written by `session-start.ts` at SessionStart, once per session, and by
 * nothing else. It carries what a hook can know for certain and the model has
 * been measured to forget: the session identifier, the identity pair, the head
 * commit the session started from, and the resolved domain.
 *
 * ## Why it does not replace the model-written row
 *
 * The two rows are not the same row. The model's carries `history_file` and a
 * `detail` naming the session's Directive — judgements no hook holds. This one
 * carries `git_head_at_start` and `domain` — facts the model has to re-derive
 * and, measured over this repository's own log, frequently did not. So both are
 * written and the `writer` field is what tells them apart: a reader that wants
 * the mechanical facts filters on `writer === SESSION_START_WRITER`, and one
 * that wants the Directive filters on its absence. Whether the model's row
 * survives at all is a later question and is deliberately not answered here.
 *
 * ## Once per session, keyed on the identifier
 *
 * SessionStart fires again on a resume and on a clear, with the SAME session
 * identifier. The dedup therefore reads the log back rather than keeping a mark
 * of its own: the log IS the record of what was written, so no second state file
 * can disagree with it, and a log rolled to the archive correctly reads as "not
 * written yet" rather than as a lie about a row that is no longer there.
 *
 * The match requires all three of event, `writer` and `session_id`. Dropping the
 * `writer` term would let the model's own row for this session suppress the
 * hook's, which is the one row this step exists to guarantee.
 *
 * ## No identifier, no row
 *
 * The identifier is the dedup key, so without one there is nothing to key on and
 * a second SessionStart could not be told from the first. A row is therefore not
 * written at all, rather than written with the key absent — which is the same
 * absent-rather-than-empty rule this module states everywhere else, applied to
 * the one field that is load-bearing rather than descriptive. Every OTHER field
 * follows the ordinary rule: unresolved means the key is absent from the row.
 * ------------------------------------------------------------------ */

/** The `writer` value on every row this module writes from the SessionStart hook. */
export const SESSION_START_WRITER = "session-start-hook";

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

/** The event log's path under a workbench root. */
function eventLogPath(root: string): string {
  return resolve(root, "fusion-workbench", "orchestrator-events.jsonl");
}

/**
 * True when this session already has a hook-written `session_start` row.
 *
 * An unreadable or absent log is `false`: nothing can duplicate a row that is
 * not there. A line that will not parse is skipped rather than throwing — the
 * file carries `merge=union` and a conflict marker in it must not cost the
 * session its row.
 */
export function sessionStartAlreadyWritten(root: string, sessionId: string): boolean {
  let text: string;
  try {
    text = readFileSync(eventLogPath(root), "utf-8");
  } catch {
    return false;
  }
  for (const line of text.split("\n")) {
    // The substring test rejects almost every line without parsing it; the
    // parse below is what decides, so a coincidental match costs nothing.
    if (!line.includes(sessionId)) continue;
    let row: { event?: unknown; writer?: unknown; session_id?: unknown };
    try {
      row = JSON.parse(line) as typeof row;
    } catch {
      continue;
    }
    if (
      row.event === "session_start" &&
      row.writer === SESSION_START_WRITER &&
      row.session_id === sessionId
    ) {
      return true;
    }
  }
  return false;
}

/**
 * Append this session's `session_start` row, or return `null` having written
 * nothing. `resolveFacts` is a thunk rather than a value so that the two
 * subprocesses behind it are never spawned for a row that will not be written.
 */
export function emitSessionStartEvent(
  root: string,
  input: SessionStartHookInput,
  resolveFacts: () => SessionStartFacts,
): SessionStartEventRow | null {
  const sessionId = payloadSessionId(input);
  if (sessionId === undefined) return null;
  if (sessionStartAlreadyWritten(root, sessionId)) return null;

  const facts = resolveFacts();
  const row: SessionStartEventRow = {
    ts: utcStamp(),
    event: "session_start",
    writer: SESSION_START_WRITER,
    ...resolveIdentity(root),
    session_id: sessionId,
    ...(facts.gitHeadAtStart && { git_head_at_start: facts.gitHeadAtStart }),
    ...(facts.domain && { domain: facts.domain }),
  };

  appendFileSync(eventLogPath(root), JSON.stringify(row) + "\n", "utf-8");
  return row;
}

/* ------------------------------------------------------------------ *
 * Reading the row back — the C4 readers' side
 * ------------------------------------------------------------------ */

/**
 * This checkout's identifier, read from `fusion-workbench/.checkout-id`.
 *
 * A plain read and never a mint: minting belongs to `bin/fusion-identity`, and
 * a reader that created workbench state would be a defect of its own. Absent,
 * unreadable or empty is `undefined`, which the caller below reads as "keep
 * every row" — the same degradation `bin/fusion-events` and `bin/monitor`
 * already take, and for the same reason: no row written before C4 carries the
 * field, so an unresolved identifier must read as this checkout's own.
 */
export function readCheckoutId(root: string): string | undefined {
  try {
    return readFileSync(resolve(root, "fusion-workbench", ".checkout-id"), "utf-8").trim() || undefined;
  } catch {
    return undefined;
  }
}

/**
 * The newest hook-written `session_start` row for this checkout, or `null`.
 *
 * Three things decide a row, and each is the answer to a measured defect:
 *
 *   - `writer === SESSION_START_WRITER`. The model writes a `session_start`
 *     row of its own for the same session, carrying the Directive and the
 *     history file and NOT the mechanical facts; a reader wanting the head
 *     commit or the domain must not read it. That is why the field exists.
 *   - the `checkout` field, where the row carries one and this checkout is
 *     resolvable. The log carries `merge=union`, so after a pull it holds
 *     another checkout's block with no ordering against ours
 *     (260823-1302_*_the-monitor-attributes-a-merged-event-log-to-one-session-and-reports-another-checkouts-state.md).
 *   - newest by `ts`, which the emit convention writes fixed-width and UTC, so
 *     lexical order IS chronological order. File order decides a tie, which is
 *     the same reason ordering alone cannot be trusted: a later line wins.
 *
 * An unreadable log, an unparseable line and a missing field are each skipped
 * rather than thrown: every caller here has a file to fall back to.
 */
export function newestHookSessionStart(root: string): SessionStartEventRow | null {
  let text: string;
  try {
    text = readFileSync(eventLogPath(root), "utf-8");
  } catch {
    return null;
  }
  const mine = readCheckoutId(root);
  let best: SessionStartEventRow | null = null;
  for (const line of text.split("\n")) {
    if (!line.includes(SESSION_START_WRITER)) continue;
    let row: SessionStartEventRow;
    try {
      row = JSON.parse(line) as SessionStartEventRow;
    } catch {
      continue;
    }
    if (row.event !== "session_start" || row.writer !== SESSION_START_WRITER) continue;
    if (mine !== undefined && row.checkout !== undefined && row.checkout !== mine) continue;
    if (best === null || (row.ts ?? "") >= (best.ts ?? "")) best = row;
  }
  return best;
}
