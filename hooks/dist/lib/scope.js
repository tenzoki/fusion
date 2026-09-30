/**
 * Which work package this checkout holds, read from JSON control data through
 * the codec, and whether a named directory is a package at all.
 *
 * ## The criterion
 *
 * A package is in scope for this checkout when its `status` is `claimed` and
 * its `claim.checkout_id` equals the eight hex characters `bin/fusion-identity`
 * prints for this checkout. Nothing here reads a `**Status:**` or `**Claim:**`
 * head line: the record is the `package.json` the codec answers, and the
 * narrative beside it is content, never state. Step 3 of
 * `260929-1810_*_plan-fj03a-the-record-client-the-format-gate-and-scope-and-order-on-json.md`,
 * on spec section 7 row 1 ("`status`/`claim` aus JSON, vorhandene
 * Mehrdeutigkeitsfehler erhalten; niemals still nach shared ausweichen").
 *
 * ## The sequence, and what each answer of the codec means here
 *
 *   gate (`inspect`)     anything but `json-control` is `unknown` by name:
 *                        `legacy`, `unsupported`, `refused`, `unanswered`.
 *                        None of them is "nothing claimed".
 *   `list`               every control file of the workbench, without a scope:
 *                        a `list` over the container store is refused
 *                        `unknown-scope/scope-missing` where that directory
 *                        does not exist yet, and reading that refusal as an
 *                        empty store is what this module must not do. The
 *                        package rows are the ones under the container store
 *                        whose control file is `package.json`, the codec's own
 *                        name for one.
 *   `validate`           without a record. A package row that does not read by
 *                        `lib/codec-read.ts` `unreadRow` (a `problem` on the
 *                        row, a finding of the codec's validation against it,
 *                        no id, a status outside the five) stops the read: its
 *                        status is unknown, so the claimed set is
 *                        undetermined, and nothing falls back to "not
 *                        claimed". The criterion is the order reader's too. A
 *                        problem or finding whose reason is `recovery-blocked`
 *                        is the refusal it is, arriving inside an `ok: true`
 *                        answer.
 *   `show`, per claimed  the record at the revision `list` named. A revision
 *                        that differs is a new observation, not a failed one:
 *                        the store moved between the two reads. The read
 *                        starts over from `list` ONCE; a second difference is
 *                        `store-changing` and the answer is unknown. That
 *                        re-read is a bounded second observation and never a
 *                        retry after an uncertain process outcome, which this
 *                        module does not make: an `unanswered` call ends the
 *                        read where it stands.
 *   the comparison       the shown records whose `claim.checkout_id` is this
 *                        checkout's: none, one, or more than one. More is
 *                        `ambiguous` with every container named, and it is
 *                        refused rather than resolved, for the reason the
 *                        header of `bin/fusion-claimed-package` carries.
 *
 * Nothing is written by this module, no intent is deleted and no diverged
 * file is repaired; whatever the codec finds pending it reports, and the
 * report ends the read (Prior's review of the FJ03a plan, `## A.` and `## C.`).
 *
 * ## Who runs it
 *
 * `hooks/scope.ts`, through `bin/fusion-claimed-package` (`claimed`) and
 * `bin/fusion-paths` (`item`), each called from an agent's Setup or by hand.
 * No automatic hook reaches this module or those helpers:
 * `lib/record-client.ts` `## The recovery declaration`, pinned by
 * `lib/__tests__/hook-route-exclusion.test.ts`.
 */
import { dirname } from "node:path";
import { ask as askCodec } from "./record-client.js";
import { blockedRead, findingsByPath, isObject, isPackageRow, listOf, refusalOf, refusedByGate, resultOf, unreadRow } from "./codec-read.js";
import { CONTAINER_STORE } from "./stores.js";
const unknown = (u) => ({ kind: "unknown", ...u });
/** A row that does not read, as the `Unknown` it is: a blocked recovery is the refusal, anything else leaves the status unknown. */
function unreadable(path, row, findings) {
    const bad = unreadRow(row, findings);
    if (bad === null)
        return null;
    return blockedRead(bad.op, bad.problem) ?? { cause: "unreadable-package", path, problem: bad.problem };
}
/** The codec's validation findings, keyed by path: of the whole workbench, or of `record` alone. */
function validated(workbench, ask, record) {
    const answer = resultOf(workbench, { op: "validate", ...(record !== undefined && { record }) }, ask);
    if ("unread" in answer)
        return { unknown: answer.unread };
    const list = listOf("validate", answer.result, "findings");
    return "unread" in list ? { unknown: list.unread } : { findings: findingsByPath("validate", list.list) };
}
/** The claimed package rows, or why they cannot be known. Every package row has to read first. */
function listClaimed(workbench, ask) {
    const listed = resultOf(workbench, { op: "list" }, ask);
    if ("unread" in listed)
        return { unknown: listed.unread };
    const records = listOf("list", listed.result, "records");
    if ("unread" in records)
        return { unknown: records.unread };
    const v = validated(workbench, ask);
    if ("unknown" in v)
        return v;
    const rows = [];
    for (const row of records.list) {
        if (!isObject(row) || !isPackageRow(row))
            continue;
        const path = row.path;
        const u = unreadable(path, row, v.findings);
        if (u !== null)
            return { unknown: u };
        if (row.status !== "claimed")
            continue;
        if (typeof row.revision !== "string")
            return { unknown: { cause: "unreadable-package", path, problem: { class: "operation-unknown", reason: "revision-unnamed", detail: "the list row names no revision" } } };
        rows.push({ path, revision: row.revision });
    }
    return { rows };
}
/** One `show`, read into what the comparison needs. */
function show(workbench, path, ask) {
    const answer = ask(workbench, { op: "show", record: { path } });
    if (answer.kind === "unanswered")
        return { unknown: { cause: "unanswered", op: "show", how: answer.cause, detail: answer.detail } };
    if (answer.kind === "refused")
        return { unknown: { cause: "refused", op: "show", refusal: refusalOf(answer) } };
    const r = answer.result;
    if (!isObject(r) || typeof r.revision !== "string" || !isObject(r.control)) {
        return { unknown: { cause: "unanswered", op: "show", how: "unparseable", detail: `the result for ${path} carries no revision and control` } };
    }
    const claim = isObject(r.control.claim) ? r.control.claim : {};
    const narrative = isObject(r.narrative) && typeof r.narrative.path === "string" ? r.narrative.path : null;
    return { path, revision: r.revision, status: r.control.status, checkoutId: claim.checkout_id, narrative };
}
const held = (s) => s.narrative === null
    ? { unknown: { cause: "unreadable-package", path: s.path, problem: { class: "schema-invalid", reason: "narrative-unnamed", detail: `${s.path} names no narrative` } } }
    : { package: s.narrative, container: dirname(s.path) };
/**
 * The work package this checkout holds: `none`, `one`, `ambiguous` with every
 * container named, or `unknown` with its cause. `ask` is the record client's
 * by default, and a test's stand-in when injected.
 */
export function claimedBy(workbench, checkout, ask = askCodec) {
    const gated = refusedByGate(workbench, ask);
    if (gated !== null)
        return unknown(gated);
    let reread = false;
    for (;;) {
        const listed = listClaimed(workbench, ask);
        if ("unknown" in listed)
            return unknown(listed.unknown);
        if (listed.rows.length === 0)
            return { kind: "none" };
        const shown = [];
        let moved = null;
        let movedTo = "";
        for (const row of listed.rows) {
            const s = show(workbench, row.path, ask);
            if ("unknown" in s)
                return unknown(s.unknown);
            if (s.revision !== row.revision) {
                moved = row;
                movedTo = s.revision;
                break;
            }
            shown.push(s);
        }
        if (moved !== null) {
            if (reread)
                return unknown({ cause: "store-changing", path: moved.path, listed: moved.revision, shown: movedTo });
            // The one bounded re-read: a new observation of a store that moved, and
            // not a repeat of a call whose outcome is uncertain.
            reread = true;
            continue;
        }
        const mine = shown.filter((s) => s.status === "claimed" && s.checkoutId === checkout);
        if (mine.length === 0)
            return { kind: "none" };
        const hs = [];
        for (const s of mine) {
            const h = held(s);
            if ("unknown" in h)
                return unknown(h.unknown);
            hs.push(h);
        }
        return hs.length === 1 ? { kind: "one", ...hs[0] } : { kind: "ambiguous", held: hs };
    }
}
/**
 * The gate alone, for the one scope answer that reads no package: a project
 * outside a git work tree holds no claim, and its workbench is still refused
 * by name when it is not JSON-controlled (Prior's ruling on request 28).
 * `null` admits it.
 */
export const formatOf = (workbench, ask = askCodec) => refusedByGate(workbench, ask);
/**
 * Whether `dir` names a package of the container store: the gate first, then
 * `show` of `<store>/<dir>/package.json`, then `validate` of that record. A
 * record the codec does not find is `no-package`; a package that does not read
 * by `unreadRow`, every other refusal, and no answer, is `unknown`.
 */
export function isPackage(workbench, dir, ask = askCodec) {
    const gated = refusedByGate(workbench, ask);
    if (gated !== null)
        return { kind: "unknown", ...gated };
    const path = `${CONTAINER_STORE}/${dir}/package.json`;
    const answer = ask(workbench, { op: "show", record: { path } });
    if (answer.kind === "unanswered")
        return { kind: "unknown", cause: "unanswered", op: "show", how: answer.cause, detail: answer.detail };
    if (answer.kind === "refused") {
        if (answer.reason === "record-not-found")
            return { kind: "no-package", detail: answer.detail ?? `${path} does not exist` };
        return { kind: "unknown", cause: "refused", op: "show", refusal: refusalOf(answer) };
    }
    const r = answer.result;
    if (!isObject(r) || r.kind !== "package")
        return { kind: "no-package", detail: `${path} is not a package record` };
    // The same criterion `claimedBy` applies to every row: a package the codec's validation refuses is not in scope.
    const v = validated(workbench, ask, { path });
    if ("unknown" in v)
        return { kind: "unknown", ...v.unknown };
    const control = isObject(r.control) ? r.control : {};
    const u = unreadable(path, { path, id: control.id, status: control.status }, v.findings);
    if (u !== null)
        return { kind: "unknown", ...u };
    const narrative = isObject(r.narrative) && typeof r.narrative.path === "string" ? r.narrative.path : null;
    if (narrative === null)
        return { kind: "unknown", cause: "unreadable-package", path, problem: { class: "schema-invalid", reason: "narrative-unnamed", detail: `${path} names no narrative` } };
    return { kind: "package", package: narrative, container: `${CONTAINER_STORE}/${dir}` };
}
