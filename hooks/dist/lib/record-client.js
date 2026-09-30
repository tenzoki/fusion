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
 *     four causes: `bundle-missing`, `exit`, `timeout`, `unparseable`. An
 *     answer past `MAX_RESPONSE_BYTES` is `exit`: the child is stopped and
 *     the detail names `ENOBUFS`.
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
 * The codec gives up on the write lock, and on a consistent read, after
 * `CODEC_WAIT_MS` and answers `conflict/lock-timeout`, which is typed and names
 * the holder. It checks that deadline between steps and never during one:
 * `read` in `codec/src/kernel.ts` tests it after an iteration (two journal
 * snapshots and the request's body), and `acquireLock` in `codec/src/store.ts`
 * after a poll of 50 ms, whereupon a mutation or a reader's recovery does its
 * work under the lock. So the typed answer can arrive as late as the wait plus
 * the process start plus one such step, which is at most one uncontended call
 * from end to end. `POST_WAIT_MARGIN_MS` covers that, and `timeout` is left
 * for a child that stopped answering. `lib/__tests__/record-client.test.ts`
 * reads the wait off the codec's source and holds the two equal.
 *
 * The margin's size is a measurement, taken 2026-09-30 through this client on
 * an M2 Max over 2 500 records (1 250 packages, each with an adopted plan),
 * the scale request 31 of `codec/fixtures/prior/REQUESTS.md` expects: `inspect`
 * 0.18 s, `show` 0.19 s, `list` and `validate` 0.43 s (0.84 s on a first
 * run), `create`, `adopt-plan` and `transition` 0.24 to 0.67 s. 5 s is six
 * times the worst of them. **It does not cover `reconcile`**, whose body
 * resolves every reference by reading every control file and so grows with
 * the square of the record count: 2.1 s at 200 records, 47 s at 1 000, 310 s
 * at 2 500, past this whole timeout from about 1 200 records even with nobody
 * holding the lock. No constant here fixes that; it is the codec's, filed as
 * `260930-1712_*_the-codecs-reconcile-grows-with-the-square-of-the-record-count-and-outlasts-the-clients-timeout-from-about-1200-records.md`.
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
/** The codec's default wait: `LOCK_STALE_MS + 5_000` in `codec/src/store.ts` and `codec/src/kernel.ts`, a copy the test holds equal. */
export const CODEC_WAIT_MS = 65_000;
/** Process start plus one step past the codec's wait, measured; see `## The timeout sits above the codec's own`. */
export const POST_WAIT_MARGIN_MS = 5_000;
export const DEFAULT_TIMEOUT_MS = CODEC_WAIT_MS + POST_WAIT_MARGIN_MS;
/** The largest response read. A larger one stops the child and is `unanswered/exit`, never truncated into a result. */
export const MAX_RESPONSE_BYTES = 16 * 1024 * 1024;
/** dist layout: `<plugin>/hooks/dist/lib/record-client.js` → `<plugin>/codec/dist/fusion-record.js`. */
export function defaultBundle() {
    return resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..", "codec", "dist", "fusion-record.js");
}
const isObject = (value) => typeof value === "object" && value !== null && !Array.isArray(value);
const unanswered = (cause, detail) => ({ kind: "unanswered", cause, detail });
/** The first line of what the child wrote to stderr, for a detail a person can act on. */
function firstLine(text) {
    const line = (text ?? "").split("\n").find((l) => l.trim() !== "");
    return line === undefined ? "nothing on stderr" : line.trim();
}
/** The response envelope read into an answer, or `unparseable` when it is not one. */
function readResponse(stdout) {
    // One JSON object and its newline, and nothing else: the protocol's framing.
    if (!stdout.endsWith("\n") || stdout.indexOf("\n") !== stdout.length - 1) {
        return unanswered("unparseable", `the codec wrote ${stdout.length} characters that are not one line and its newline`);
    }
    let parsed;
    try {
        parsed = JSON.parse(stdout);
    }
    catch (e) {
        return unanswered("unparseable", `the codec's answer is not JSON: ${e instanceof Error ? e.message : String(e)}`);
    }
    if (!isObject(parsed) || typeof parsed.ok !== "boolean") {
        return unanswered("unparseable", "the codec's answer carries no boolean `ok`");
    }
    if (parsed.ok) {
        if (!("result" in parsed) || "error" in parsed) {
            return unanswered("unparseable", "an `ok: true` answer carries a `result` and no `error`");
        }
        const revisions = {};
        if (isObject(parsed.revisions)) {
            for (const [path, revision] of Object.entries(parsed.revisions)) {
                if (typeof revision === "string")
                    revisions[path] = revision;
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
export function ask(workbench, request, options = {}) {
    const bundle = options.bundle ?? defaultBundle();
    let isFile = false;
    try {
        isFile = statSync(bundle).isFile();
    }
    catch {
        isFile = false;
    }
    if (!isFile)
        return unanswered("bundle-missing", `${bundle} is not a file: the codec bundle is not installed`);
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
        const code = run.error.code;
        if (code === "ETIMEDOUT")
            return unanswered("timeout", `the codec did not answer ${request.op} within ${timeoutMs} ms and was stopped`);
        return unanswered("exit", `the codec could not be run to its end for ${request.op}: ${run.error.message}`);
    }
    if (run.status !== 0) {
        const how = run.status === null ? `was stopped by ${run.signal ?? "a signal"}` : `exited ${run.status}`;
        return unanswered("exit", `the codec ${how} on ${request.op}: ${firstLine(run.stderr)}`);
    }
    return readResponse(run.stdout);
}
/**
 * Ask the workbench's state through `inspect`. A consumer asks this first,
 * because `list` on a workbench without a manifest answers an empty list and
 * names no state (issue
 * `260929-1810_*_list-answers-a-legacy-workbench-with-an-empty-list-and-names-no-state.md`).
 */
export function gate(workbench, options = {}) {
    const answer = (options.ask ?? ask)(workbench, { op: "inspect" }, options);
    if (answer.kind === "unanswered")
        return { state: "unanswered", cause: answer.cause, detail: answer.detail };
    if (answer.kind === "refused") {
        const { kind: _kind, ...refusal } = answer;
        return { state: "refused", ...refusal };
    }
    const result = answer.result;
    const state = isObject(result) ? result.state : undefined;
    if (isObject(result) && state === "json-control" && typeof result.id === "string" && result.id !== "") {
        return { state, id: result.id };
    }
    const p = isObject(result) ? result.pending : undefined;
    const pending = p === null || p === undefined ? null
        : isObject(p) && typeof p.operation_id === "string" && typeof p.id === "string" && typeof p.blocked === "boolean" ? { operation_id: p.operation_id, id: p.id, blocked: p.blocked }
            : undefined;
    // A pending field this client cannot read is no answer: Setup must not mint a workbench over an intent it misread.
    if (pending === undefined)
        return { state: "unanswered", cause: "unparseable", detail: `inspect answered a pending initialize this client does not read: ${JSON.stringify(p)}` };
    if (state === "legacy")
        return { state, pending };
    if (isObject(result) && state === "unsupported") {
        const d = result.diagnosis;
        const diagnosis = isObject(d) && typeof d.class === "string" && typeof d.reason === "string"
            ? { class: d.class, reason: d.reason, ...(typeof d.detail === "string" && { detail: d.detail }) }
            : null;
        return { state, diagnosis, pending };
    }
    // An answer this client cannot place is no answer: a state added later must
    // not pass as one of the three this module knows.
    return { state: "unanswered", cause: "unparseable", detail: `inspect answered a state this client does not read: ${JSON.stringify(state)}` };
}
