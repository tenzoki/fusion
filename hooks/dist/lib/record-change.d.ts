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
export declare const EVENT_LOG = "orchestrator-events.jsonl";
/** Workbench-relative. Class L with the rest of `.guard-state/`: per checkout, never tracked. */
export declare const PENDING_FILE: string;
/** A new package's status: fixed by the kernel, not carried by the request or the answer. */
export declare const PACKAGE_CREATED_STATUS = "open";
export interface RecordChangeRow {
    ts: string;
    event: "record_change";
    host: "claude";
    op: string;
    operation_id: string;
    workbench_id: string;
    record_id: string;
    path: string;
    kind: string;
    revision: string;
    change: Record<string, unknown>;
    person?: string;
    checkout?: string;
    session_id?: string;
}
/** A `show` answer the caller received before the mutation. */
export interface PriorShow {
    kind: string;
    control: Record<string, unknown>;
}
/** What one landed mutation gave the writer. */
export interface Observation {
    request: {
        op: string;
        operation_id?: unknown;
        [field: string]: unknown;
    };
    /** The gate's `json-control` id. */
    workbenchId: string;
    result: unknown;
    revisions: Record<string, string>;
    /** Pre-mutation `show` answers, by control path. */
    shows: Record<string, PriorShow>;
}
/** Who observed it, and when. Absent halves stay absent. */
export interface Observer {
    ts: string;
    person?: string;
    checkout?: string;
    session_id?: string;
}
/** The observer of this moment: `utcStamp`, `resolveIdentity` in the workbench's project, the exported session. */
export declare function observer(workbench: string): Observer;
/** The four fields a repeated row shares with the first one. */
export interface RowKey {
    workbench_id: string;
    operation_id: string;
    path: string;
    revision: string;
}
export declare const keyOf: (r: RowKey) => string;
/** The keys a landed operation owes the log: one per path in `revisions`, none for `initialize`. */
export declare function owedKeys(op: string, workbenchId: string, operationId: string, revisions: Record<string, string>): string[];
/** The rows one observed answer gives, in the order of its `revisions`. */
export declare function composeRows(o: Observation, by: Observer): RecordChangeRow[];
/** `logged`: every owed key is in the log. `pending`: the rest is retained. `unlogged`: neither. `none`: no row was owed. */
export type LogEvent = "none" | "logged" | "pending" | "unlogged";
export interface LogResult {
    event: LogEvent;
    /** Why the rows are not in the log, when they are not. */
    detail?: string;
}
/** Rows this call composed from an answer it observed: appended by key, or retained with their `ts`. */
export declare function logObserved(workbench: string, rows: RecordChangeRow[]): LogResult;
/** Append every retained row by key, then drop the rows that were read. What failed to append stays retained, and so does every line that is no row. */
export declare function repairRetained(workbench: string): {
    appended: number;
    retained: number;
    detail?: string;
};
/** A re-send: no row is composed. Retained rows are appended, and the answer's keys are classified. */
export declare function logResend(workbench: string, op: string, workbenchId: string, operationId: string, revisions: Record<string, string>): LogResult;
