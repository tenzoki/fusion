/**
 * The `record_change` row: composed from what a write observed, appended once
 * per key, retained when it cannot be appended.
 *
 * ## What the row is
 *
 * One row per control record a mutation wrote, in
 * `fusion-workbench/orchestrator-events.jsonl`, in the shape item 32 of
 * `codec/fixtures/prior/REQUESTS.md` states and the Prior side accepted for
 * both hosts (`Prior: docs/design/fusion-qualified-revision-contract-response.md`
 * `## 32`, `ae1ad78`). It is an observation, not a second source of current
 * state and not a transaction receipt: `bin/monitor` shows it as "last
 * observed". Ruled in
 * `260930-1451_*_where-does-the-monitor-take-a-records-status-from-and-how-does-an-event-name-a-record-and-its-host.md`
 * (option 1) and, for how rows are logged, retained and repaired,
 * `260930-2305_*_how-does-the-write-client-log-a-change-it-cannot-append-or-did-not-observe.md`
 * (option 1).
 *
 * ## Where each field comes from
 *
 * Nothing is read from disk to compose a row. `record_id` and `kind` come
 * from the `show` the caller sent before the mutation, or from the request:
 * `create` fixes the id in advance, and `adopt-plan` names the document it
 * binds. The plan an `adopt-plan` replaces is named by the package's
 * `active_documents` in that same pre-mutation `show`; the package's own id is
 * never reused for a plan. `workbench_id` is the gate's, `revision` the
 * answer's entry for the path. A path in the answer's `revisions` whose
 * identity none of these gives is a caller fault, and `composeRows` throws
 * rather than invent one. `initialize` writes a manifest outside the record
 * kinds and gives no row.
 *
 * `person` and `checkout` are `resolveIdentity`'s, `session_id` is the
 * `FUSION_SESSION_ID` the SessionStart hook exports, and `ts` is `utcStamp`'s
 * fixed-width UTC form, taken when the answer was observed. Each is left out
 * when it is unread, never written null.
 *
 * ## "Did this call observe this answer", not "is this a replay"
 *
 * The codec answers a repeated `operation_id` with its stored bytes, so a
 * replay cannot be told from its answer. What the writer knows is whether it
 * minted the operation id in this call. A call that did composes rows and
 * hands them to `logObserved`. A re-send under a caller-given id composes
 * nothing: `logResend` appends the rows an earlier call retained and reports
 * what the log now holds for the answer's keys. A re-send whose rows were
 * neither appended nor retained stays `unlogged`, the branch Prior permits,
 * and no row carries a re-send's time for an old change.
 *
 * ## Appending, and what is retained
 *
 * A row is identified by `(workbench_id, operation_id, path, revision)`, and
 * a row whose key the log already holds is skipped, so delayed and duplicate
 * delivery each leave one line. A log whose last line was torn by a crashed
 * writer gets a lone LF first; every line is written whole and LF-terminated,
 * and nothing rewrites the log (class R2 in `rules/workbench-tracking.md`).
 *
 * When the append fails after the codec answered, the rows go to
 * `.guard-state/record-change-pending.jsonl` exactly as they would have been
 * appended, original `ts` included, and the outcome is `pending`: the codec
 * succeeded and the event is missing. Nothing here can send a request, so a
 * failed append is never repaired by rerunning the mutation. `repairRetained`
 * appends retained rows by the same key test and removes the rows it read; a
 * line that is no row, a torn last line included, stays in the file and is
 * named in the result's `detail`. Every later write run calls it first and
 * reports a repair that failed or left anything retained. That file is not yet named in
 * `rules/workbench-tracking.md`, whose `.guard-state/` list FJ03d extends.
 *
 * Residual, stated: two repairs racing each other can both append one row
 * before either sees it, and a row retained in the instant between a repair's
 * re-read and its rewrite is lost. The key identifies such a duplicate; no
 * exactly-once delivery across the codec and the log is claimed.
 *
 * No automatic hook imports this module or the helper that will call it;
 * `lib/__tests__/hook-route-exclusion.test.ts` pins the hook commands.
 */
import { appendFileSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { resolveIdentity, utcStamp } from "./orchestrator-events.js";
export const EVENT_LOG = "orchestrator-events.jsonl";
/** Workbench-relative. Class L with the rest of `.guard-state/`: per checkout, never tracked. */
export const PENDING_FILE = join(".guard-state", "record-change-pending.jsonl");
/** A new package's status: fixed by the kernel, not carried by the request or the answer. */
export const PACKAGE_CREATED_STATUS = "open";
/** The observer of this moment: `utcStamp`, `resolveIdentity` in the workbench's project, the exported session. */
export function observer(workbench) {
    const sid = process.env.FUSION_SESSION_ID;
    return { ts: utcStamp(), ...resolveIdentity(dirname(workbench)), ...(sid && { session_id: sid }) };
}
export const keyOf = (r) => JSON.stringify([r.workbench_id, r.operation_id, r.path, r.revision]);
/** The keys a landed operation owes the log: one per path in `revisions`, none for `initialize`. */
export function owedKeys(op, workbenchId, operationId, revisions) {
    if (op === "initialize")
        return [];
    return Object.entries(revisions).map(([path, revision]) => keyOf({ workbench_id: workbenchId, operation_id: operationId, path, revision }));
}
const isObject = (v) => typeof v === "object" && v !== null && !Array.isArray(v);
const field = (v, name) => (isObject(v) ? v[name] : undefined);
/** The rows one observed answer gives, in the order of its `revisions`. */
export function composeRows(o, by) {
    const { request: req, result } = o;
    if (req.op === "initialize")
        return [];
    const opId = String(req.operation_id);
    /** The path's identity from its pre-mutation `show`, with the row's change. */
    const shown = (path, change) => {
        const s = o.shows[path];
        const id = field(s?.control, "id");
        return s !== undefined && typeof id === "string" ? { record_id: id, kind: s.kind, change } : undefined;
    };
    let identify;
    if (req.op === "create") {
        const change = req.kind === "evidence" ? { created_kind: "evidence" } : { created: req.kind === "package" ? PACKAGE_CREATED_STATUS : field(req.payload, "state") };
        identify = () => ({ record_id: String(req.id), kind: String(req.kind), change });
    }
    else if (req.op === "adopt-plan") {
        const pkgPath = String(field(req.record, "path"));
        const docPath = field(field(result, "document"), "path");
        const docId = String(field(req.plan, "record_id"));
        const role = field(result, "role");
        // The plan in force before this call, from the package as it was shown.
        const docs = field(o.shows[pkgPath]?.control, "active_documents");
        const before = Array.isArray(docs) ? docs.find((d) => field(d, "role") === "plan") : undefined;
        const replacedId = field(field(before, "ref"), "record_id");
        identify = (path) => {
            if (path === pkgPath)
                return shown(path, { adopted: role });
            if (path === docPath)
                return { record_id: docId, kind: "plan", change: { adopted_as: role } };
            return typeof replacedId === "string" ? { record_id: replacedId, kind: "plan", change: { replaced_by: docId } } : undefined;
        };
    }
    else {
        const change = req.op === "set-mode" ? { mode: field(field(result, "mode"), "value") }
            : req.op === "set-dependencies" ? { depends_on: Array.isArray(req.depends_on) ? req.depends_on.length : 0 }
                : req.op === "attach-evidence" ? { attached_evidence: req.evidence }
                    : { from: field(result, "from"), to: field(result, "to") };
        identify = (path) => shown(path, change);
    }
    return Object.entries(o.revisions).map(([path, revision]) => {
        const who = identify(path);
        if (who === undefined)
            throw new Error(`record_change: no identity for ${path} in ${req.op} ${opId}; the caller sends a show of every record it names`);
        return {
            ts: by.ts,
            event: "record_change",
            host: "claude",
            op: req.op,
            operation_id: opId,
            workbench_id: o.workbenchId,
            record_id: who.record_id,
            path,
            kind: who.kind,
            revision,
            change: who.change,
            ...(by.person !== undefined && { person: by.person }),
            ...(by.checkout !== undefined && { checkout: by.checkout }),
            ...(by.session_id !== undefined && { session_id: by.session_id }),
        };
    });
}
/** The text of `file`, or "" when it does not exist. Any other failure is the caller's. */
function readOrEmpty(file) {
    try {
        return readFileSync(file, "utf-8");
    }
    catch (e) {
        if (e.code === "ENOENT")
            return "";
        throw e;
    }
}
/** The `record_change` rows a JSONL text holds; a line that does not parse is not a row. */
function rowsIn(text) {
    const rows = [];
    for (const line of text.split("\n")) {
        try {
            const v = JSON.parse(line);
            if (isObject(v) && v.event === "record_change")
                rows.push(v);
        }
        catch {
            // A torn or foreign line: nothing to key.
        }
    }
    return rows;
}
/** Whole LF-terminated lines, after a lone LF when the file ends mid-line. One append. */
function appendLines(file, current, rows) {
    const torn = current !== "" && !current.endsWith("\n");
    appendFileSync(file, (torn ? "\n" : "") + rows.map((r) => `${JSON.stringify(r)}\n`).join(""), "utf-8");
}
/** Append the rows whose key the log does not hold yet, each key once. Throws when the append fails. */
function appendByKey(workbench, rows) {
    const log = join(workbench, EVENT_LOG);
    const text = readOrEmpty(log);
    const seen = new Set(rowsIn(text).map(keyOf));
    const fresh = [];
    for (const row of rows) {
        if (seen.has(keyOf(row)))
            continue;
        seen.add(keyOf(row));
        fresh.push(row);
    }
    if (fresh.length > 0)
        appendLines(log, text, fresh);
    return fresh.length;
}
const message = (e) => (e instanceof Error ? e.message : String(e));
/** Rows this call composed from an answer it observed: appended by key, or retained with their `ts`. */
export function logObserved(workbench, rows) {
    if (rows.length === 0)
        return { event: "none" };
    try {
        appendByKey(workbench, rows);
        return { event: "logged" };
    }
    catch (e) {
        const failed = `the log append failed: ${message(e)}`;
        try {
            const pending = join(workbench, PENDING_FILE);
            mkdirSync(dirname(pending), { recursive: true });
            appendLines(pending, readOrEmpty(pending), rows);
            return { event: "pending", detail: `${failed}; the rows are retained in ${PENDING_FILE}` };
        }
        catch (e2) {
            return { event: "unlogged", detail: `${failed}; retaining them failed too: ${message(e2)}` };
        }
    }
}
/** Append every retained row by key, then drop the rows that were read. What failed to append stays retained, and so does every line that is no row. */
export function repairRetained(workbench) {
    const pending = join(workbench, PENDING_FILE);
    const read = readOrEmpty(pending);
    if (read === "")
        return { appended: 0, retained: 0 };
    // Whole lines only: a last line without its LF is torn, or still being written, and stays where it is.
    const whole = read.slice(0, read.lastIndexOf("\n") + 1);
    const rows = rowsIn(whole);
    let appended;
    try {
        appended = appendByKey(workbench, rows);
    }
    catch (e) {
        return { appended: 0, retained: rowsIn(read).length, detail: `the log append failed: ${message(e)}` };
    }
    // A whole line that is no row is kept, ahead of the rows retained since the read, which are a suffix of it.
    const kept = whole.split("\n").filter((l) => l !== "" && rowsIn(l).length === 0);
    const now = readOrEmpty(pending);
    const rest = now.startsWith(whole) ? kept.map((l) => `${l}\n`).join("") + now.slice(whole.length) : now;
    if (rest === "")
        unlinkSync(pending);
    else if (rest !== now)
        writeFileSync(pending, rest, "utf-8");
    const unparsed = rest.split("\n").filter((l) => l !== "" && rowsIn(l).length === 0).length;
    return { appended, retained: rowsIn(rest).length, ...(unparsed > 0 && { detail: `${unparsed} line(s) of ${PENDING_FILE} are no record_change row (torn or foreign) and stay there for a person to read` }) };
}
/** A re-send: no row is composed. Retained rows are appended, and the answer's keys are classified. */
export function logResend(workbench, op, workbenchId, operationId, revisions) {
    const keys = owedKeys(op, workbenchId, operationId, revisions);
    if (keys.length === 0)
        return { event: "none" };
    const repaired = repairRetained(workbench);
    const logged = new Set(rowsIn(readOrEmpty(join(workbench, EVENT_LOG))).map(keyOf));
    const retained = new Set(rowsIn(readOrEmpty(join(workbench, PENDING_FILE))).map(keyOf));
    const missing = keys.filter((k) => !logged.has(k));
    if (missing.length === 0)
        return { event: "logged" };
    if (missing.every((k) => retained.has(k)))
        return { event: "pending", detail: repaired.detail };
    return { event: "unlogged", detail: "this call did not observe the change, and no row for it was retained" };
}
