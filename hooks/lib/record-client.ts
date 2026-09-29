/**
 * The Claude side's client of the codec: one request to the bundle, one answer.
 *
 * ## What it is
 *
 * `codec/dist/fusion-record.js` is the one entry to fusion's JSON control data,
 * and both hosts reach it through its protocol and through nothing else. This
 * module is the Claude side's counterpart of Prior's `CodecProcess`: it starts
 * the bundle, writes one request to its stdin, reads one response from its
 * stdout, and hands back one of three answers. It parses no record and holds
 * no rule about one; every such rule is the codec's. Placement and route were
 * ruled in
 * `260929-1810_*_where-do-the-claude-side-consumers-of-the-codec-live-and-how-do-they-reach-it.md`
 * (option 1).
 *
 * ## The recovery declaration
 *
 * **A request sent through this module may finish a committed intent.** A read
 * is not a promise of zero physical writes: when the codec finds an intent a
 * writer committed and did not finish, it takes the write lock and rolls the
 * intent forward, over the intent's full write set, which may reach past the
 * record the caller asked about. It writes only what that writer had already
 * committed, and never over a file that diverged. What the Claude side
 * declares is therefore the absence of new mutation requests from a reader,
 * and not a write-free read. The declaration grants no reviewer or analyst a
 * record edit of its own, and it makes no role a read-only sandbox.
 *
 * That recovery is admitted for a helper somebody called, and for nothing
 * else. **No automatic hook may reach this module, by import or by
 * subprocess**: not the SessionStart, PreToolUse, PostToolUse or SubagentStop
 * entries of `hooks/hooks.json`, and not a `bin/` helper one of them starts. A
 * program that runs unasked must not be able to write a record. Ruled in
 * `260929-1810_*_what-does-the-claude-side-declare-about-a-read-that-finishes-a-committed-intent.md`
 * (option 1), and pinned on the configured hook commands by
 * `lib/__tests__/hook-route-exclusion.test.ts`.
 *
 * ## Three answers, and none of them is an empty store
 *
 *   - `result`: the codec answered `ok: true`. The result and the revisions it
 *     named.
 *   - `refused`: the codec answered `ok: false`, with its typed class, reason
 *     and detail. The request was read and declined; nothing is known about
 *     the store beyond what the refusal says.
 *   - `unanswered`: no answer arrived that this module can read, for one of
 *     four causes: `bundle-missing`, `exit`, `timeout`, `unparseable`.
 *
 * **A caller never reads `refused` or `unanswered` as "no records" or as
 * "nothing claimed".** Both mean the question was not answered, and a consumer
 * that maps either to an empty list files work into the wrong place in
 * silence. The three are distinct members of one union so that a caller has to
 * branch on `kind` to reach a result at all.
 *
 * ## One process per request, and no retry
 *
 * An `unanswered` call after a mutation is an unknown outcome: the operation
 * may have landed. The codec makes a repeat safe through `operation_id`, and
 * deciding to repeat is the caller's, with the same id. This module never
 * repeats a request of its own accord, a read included. A caller that reads
 * again because two answers named different revisions makes a new
 * observation, which is a different thing from a retry and is the caller's to
 * bound.
 *
 * ## The timeout sits above the codec's own
 *
 * The codec gives up on the write lock after 65 s and answers
 * `conflict/lock-timeout`, which is typed and names the holder. The default
 * here is 70 s, so that answer arrives first and `timeout` is left for a child
 * that stopped answering.
 *
 * ## The bundle is resolved relative to this module
 *
 * `<plugin>/hooks/dist/lib/record-client.js` runs `<plugin>/codec/dist/`, so an
 * install and a work tree each run their own bundle, as `bin/fusion-record`
 * resolves it. There is no walk upwards and no environment variable: either
 * could hand the request to a bundle that belongs to another tree. The child
 * is started through `process.execPath` with an empty environment, in the
 * bundle's directory, so no ambient `NODE_OPTIONS` or default workbench
 * reaches it; the request names its workbench by absolute path.
 */

import { spawnSync } from "node:child_process";
import { statSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/** One request of the codec's protocol, without the workbench `ask` adds. */
export interface CodecRequest {
  op: string;
  [field: string]: unknown;
}

/** The codec's typed refusal: one of its error classes, a reason token, a detail. */
export interface Refusal {
  class: string;
  reason: string;
  detail?: string;
}

/** Why no readable answer arrived. */
export type UnansweredCause = "bundle-missing" | "exit" | "timeout" | "unparseable";

export type Answer =
  | { kind: "result"; result: unknown; revisions: Record<string, string> }
  | ({ kind: "refused" } & Refusal)
  | { kind: "unanswered"; cause: UnansweredCause; detail: string };

/** How one request is asked. `gate` takes it as a parameter so a test can answer in its place. */
export type Ask = (workbench: string, request: CodecRequest, options?: ClientOptions) => Answer;

export interface ClientOptions {
  /** The bundle to run. Default: the one beside this module's plugin root. */
  bundle?: string;
  /** Milliseconds before the child is killed. Default `DEFAULT_TIMEOUT_MS`. */
  timeoutMs?: number;
  /** What `gate` asks through. Default `ask`. */
  ask?: Ask;
}

/** Above the codec's 65 s lock wait; see `## The timeout sits above the codec's own`. */
export const DEFAULT_TIMEOUT_MS = 70_000;

/** The largest response read. A larger one is `unanswered`, never truncated into a result. */
const MAX_RESPONSE_BYTES = 16 * 1024 * 1024;

/** dist layout: `<plugin>/hooks/dist/lib/record-client.js` → `<plugin>/codec/dist/fusion-record.js`. */
export function defaultBundle(): string {
  return resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..", "codec", "dist", "fusion-record.js");
}

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const unanswered = (cause: UnansweredCause, detail: string): Answer => ({ kind: "unanswered", cause, detail });

/** The first line of what the child wrote to stderr, for a detail a person can act on. */
function firstLine(text: string | null | undefined): string {
  const line = (text ?? "").split("\n").find((l) => l.trim() !== "");
  return line === undefined ? "nothing on stderr" : line.trim();
}

/** The response envelope read into an answer, or `unparseable` when it is not one. */
function readResponse(stdout: string): Answer {
  // One JSON object and its newline, and nothing else: the protocol's framing.
  if (!stdout.endsWith("\n") || stdout.indexOf("\n") !== stdout.length - 1) {
    return unanswered("unparseable", `the codec wrote ${stdout.length} characters that are not one line and its newline`);
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(stdout);
  } catch (e) {
    return unanswered("unparseable", `the codec's answer is not JSON: ${e instanceof Error ? e.message : String(e)}`);
  }
  if (!isObject(parsed) || typeof parsed.ok !== "boolean") {
    return unanswered("unparseable", "the codec's answer carries no boolean `ok`");
  }
  if (parsed.ok) {
    if (!("result" in parsed) || "error" in parsed) {
      return unanswered("unparseable", "an `ok: true` answer carries a `result` and no `error`");
    }
    const revisions: Record<string, string> = {};
    if (isObject(parsed.revisions)) {
      for (const [path, revision] of Object.entries(parsed.revisions)) {
        if (typeof revision === "string") revisions[path] = revision;
      }
    }
    return { kind: "result", result: parsed.result, revisions };
  }
  const error = parsed.error;
  if (!isObject(error) || typeof error.class !== "string" || typeof error.reason !== "string" || "result" in parsed) {
    return unanswered("unparseable", "an `ok: false` answer carries an `error` with a class and a reason, and no `result`");
  }
  return {
    kind: "refused",
    class: error.class,
    reason: error.reason,
    ...(typeof error.detail === "string" && { detail: error.detail }),
  };
}

/**
 * Send one request about `workbench` and return the answer. One process, no
 * retry. The request's `workbench` is set here, to the absolute path, so a
 * caller cannot send a request that falls back to an ambient default.
 */
export function ask(workbench: string, request: CodecRequest, options: ClientOptions = {}): Answer {
  const bundle = options.bundle ?? defaultBundle();
  let isFile = false;
  try {
    isFile = statSync(bundle).isFile();
  } catch {
    isFile = false;
  }
  if (!isFile) return unanswered("bundle-missing", `${bundle} is not a file: the codec bundle is not installed`);

  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const run = spawnSync(process.execPath, [bundle], {
    cwd: dirname(bundle),
    env: {},
    input: JSON.stringify({ ...request, workbench: resolve(workbench) }),
    encoding: "utf-8",
    timeout: timeoutMs,
    killSignal: "SIGKILL",
    maxBuffer: MAX_RESPONSE_BYTES,
    stdio: ["pipe", "pipe", "pipe"],
  });

  if (run.error !== undefined) {
    const code = (run.error as NodeJS.ErrnoException).code;
    if (code === "ETIMEDOUT") return unanswered("timeout", `the codec did not answer ${request.op} within ${timeoutMs} ms and was stopped`);
    return unanswered("exit", `the codec could not be run to its end for ${request.op}: ${run.error.message}`);
  }
  if (run.status !== 0) {
    const how = run.status === null ? `was stopped by ${run.signal ?? "a signal"}` : `exited ${run.status}`;
    return unanswered("exit", `the codec ${how} on ${request.op}: ${firstLine(run.stderr)}`);
  }
  return readResponse(run.stdout);
}

/**
 * What a consumer learns before it reads anything. Only `json-control` admits
 * a read; every other member names why there is none, and none of them is an
 * empty workbench.
 */
export type Gate =
  | { state: "json-control"; id: string }
  | { state: "legacy" }
  | { state: "unsupported"; diagnosis: Refusal | null }
  | ({ state: "refused" } & Refusal)
  | { state: "unanswered"; cause: UnansweredCause; detail: string };

/**
 * Ask the workbench's state through `inspect`. A consumer asks this first,
 * because `list` on a workbench without a manifest answers an empty list and
 * names no state (issue
 * `260929-1810_*_list-answers-a-legacy-workbench-with-an-empty-list-and-names-no-state.md`).
 */
export function gate(workbench: string, options: ClientOptions = {}): Gate {
  const answer = (options.ask ?? ask)(workbench, { op: "inspect" }, options);
  if (answer.kind === "unanswered") return { state: "unanswered", cause: answer.cause, detail: answer.detail };
  if (answer.kind === "refused") {
    const { kind: _kind, ...refusal } = answer;
    return { state: "refused", ...refusal };
  }

  const result = answer.result;
  const state = isObject(result) ? result.state : undefined;
  if (isObject(result) && state === "json-control" && typeof result.id === "string" && result.id !== "") {
    return { state, id: result.id };
  }
  if (state === "legacy") return { state };
  if (isObject(result) && state === "unsupported") {
    const d = result.diagnosis;
    const diagnosis: Refusal | null =
      isObject(d) && typeof d.class === "string" && typeof d.reason === "string"
        ? { class: d.class, reason: d.reason, ...(typeof d.detail === "string" && { detail: d.detail }) }
        : null;
    return { state, diagnosis };
  }
  // An answer this client cannot place is no answer: a state added later must
  // not pass as one of the three this module knows.
  return { state: "unanswered", cause: "unparseable", detail: `inspect answered a state this client does not read: ${JSON.stringify(state)}` };
}
