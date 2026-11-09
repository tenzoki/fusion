/**
 * The record index the explicit checkers share: every control record of a
 * JSON-controlled workbench, keyed three ways, read through the codec and
 * built in memory on every call.
 *
 * ## What it answers
 *
 * `readRecordIndex(workbench, ask)` answers one of three, as `lib/scope.ts`
 * does:
 *
 *   `json-control`  the index. `byNarrative` maps a narrative path to its
 *                   record, `byId` a record id, `byControl` a control file;
 *                   each entry carries `id`, `kind`, `status`, `live`, the
 *                   control path and the narrative path (`null` for an
 *                   evidence record, which names a report instead).
 *   `legacy`        the workbench has no manifest. The explicit checkers
 *                   refuse it by name with `legacyLine` (FJ03d step 8):
 *                   section 9 of Prior's FJ03 row keeps the old control
 *                   parsers in import and `archive/` read mode only, so a
 *                   legacy workbench is pointed at `/fusion:migrate`.
 *   `unknown`       with its cause: `unsupported`, `refused` (the codec's
 *                   typed refusal, `recovery-blocked` among them wherever the
 *                   protocol reports it), `unanswered`. None of them is an
 *                   empty index.
 *
 * Every path is workbench-relative, as the codec names it. A narrative with
 * no record is in no map: a report, a history entry, a legacy file in the
 * archive. The caller decides what that means for it.
 *
 * ## The sequence
 *
 *   gate (`inspect`)  through `lib/codec-read.ts` `refusedByGate`.
 *   `list`            without a scope, as `lib/scope.ts` sends it; a `legacy`
 *                     `state` after the gate is `legacy` here too.
 *   `reconcile`       without a scope. Its `records` are the codec's findings
 *                     per control file, and a row judged against them by
 *                     `unreadRow` is `unreadable`, named, and in no map. Its
 *                     `references` give `unresolvedRefs`: every record
 *                     reference, a `depends_on` target among them, that
 *                     resolves to no control file (`record-not-found`), and
 *                     `bindings`: per control file, its
 *                     `/active_documents/<i>/ref` entries with the `role`
 *                     the codec copies from the stored binding, whatever
 *                     their status, and the `target` of a resolved one.
 *
 * `unreadRow` is written for a package row, and its status check is the
 * package vocabulary. A record of another kind is held to its own: the states
 * `codec/contract/transitions.json` lists for its kind, and for a kind the
 * contract gives none (evidence) no status at all.
 *
 * ## A campaign is not in it
 *
 * A `list` row of kind `campaign` is left out: it enters no map and no
 * `unreadable` entry, whatever its state and whatever the codec found against
 * it. The index holds the records the contract gives a state vocabulary, and
 * evidence, to which it gives none. A campaign's state is a third vocabulary,
 * the enum of `codec/schemas/campaign.schema.json`: the codec judges it, the
 * contract has no entry for it and gains none, and a campaign has no
 * narrative for `byNarrative` to key. Held to the package vocabulary a
 * campaign row read `status-unreadable` at every state but `paused`, the one
 * word the two vocabularies share, and at `paused` entered the maps
 * (`261109-0814-the-hooks-record-index-will-class-a-campaign-row-as-status-unreadable.md`).
 * The rule reads the row's `kind`, never its path: a `campaign.json` the
 * codec could not read comes back with a `problem` and no kind, and is
 * `unreadable` like any other control file. A finding against a campaign the
 * codec did read is `validate`'s to report, to whoever reads campaigns.
 *
 * ## Liveness is the contract's, never a file name's
 *
 * `live` is a `status` outside the kind's `terminal` set in
 * `codec/contract/transitions.json`, the one source the kernel reads too. A
 * marker in an imported record's basename is history and decides nothing
 * (section 4.4). The contract is resolved relative to the compiled module, as
 * `lib/record-client.ts` resolves the bundle, so an install and a work tree
 * each read their own.
 *
 * ## What it does not do
 *
 * It persists nothing, so the index is deletable by construction and a pull
 * is seen on the next call (section 4.4). It sends no mutation. A read may
 * still finish a committed intent, which is the codec's and is declared in
 * `lib/record-client.ts` `## The recovery declaration`; no automatic hook
 * imports this module.
 */
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { ask as askCodec } from "./record-client.js";
import { blockedRead, findingsByPath, isObject, listedRecords, listOf, refusedByGate, resultOf, unreadRow } from "./codec-read.js";
const ACTIVE_DOCUMENT_REF = /^\/active_documents\/\d+\/ref$/;
/** dist layout: `<plugin>/hooks/dist/lib/record-index.js` → `<plugin>/codec/contract/transitions.json`. */
export function defaultContract() {
    return resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..", "codec", "contract", "transitions.json");
}
/** The codec's `CAMPAIGN_KIND` (`codec/src/store.ts`), as `list` names it on a row. */
const CAMPAIGN_KIND = "campaign";
/** A row that does not read, by `unreadRow`, with the status held to its own kind's vocabulary. */
function unreadable(row, found, kinds) {
    const bad = unreadRow(row, found);
    if (row.kind === "package" || bad === null || bad.problem.reason !== "status-unreadable")
        return bad;
    const k = kinds[String(row.kind)];
    return (k === undefined ? row.status === null : k.states.includes(row.status)) ? null : bad;
}
/**
 * The index of `workbench`, or why there is none. `ask` is the record client's
 * by default and a test's stand-in when injected; `contract` is the
 * transitions file, beside the compiled module by default.
 *
 * A `list` row of kind `campaign` is left out, in no map and in no
 * `unreadable` entry: its state is judged by its schema's enum inside the
 * codec and by no vocabulary this function holds (the header's
 * `## A campaign is not in it`).
 */
export function readRecordIndex(workbench, ask = askCodec, contract = defaultContract()) {
    // `legacy`, from the gate or from `list`'s `state` after it, is a format and not a failure.
    const unknown = (unread) => (unread.cause === "legacy" ? { format: "legacy" } : { format: "unknown", unread });
    const gated = refusedByGate(workbench, ask);
    if (gated !== null)
        return unknown(gated);
    const records = listedRecords(workbench, ask);
    if ("unread" in records)
        return unknown(records.unread);
    const reconciled = resultOf(workbench, { op: "reconcile" }, ask);
    if ("unread" in reconciled)
        return unknown(reconciled.unread);
    const findings = listOf("reconcile", reconciled.result, "records");
    if ("unread" in findings)
        return unknown(findings.unread);
    const references = listOf("reconcile", reconciled.result, "references");
    if ("unread" in references)
        return unknown(references.unread);
    const found = findingsByPath("reconcile", findings.list);
    const kinds = JSON.parse(readFileSync(contract, "utf-8")).kinds;
    const index = { byNarrative: new Map(), byId: new Map(), byControl: new Map(), unreadable: [], unresolvedRefs: [], bindings: new Map() };
    for (const row of records.list) {
        if (!isObject(row) || typeof row.path !== "string")
            continue;
        // Before any status is read: `unreadRow` would hold it to the package's five.
        if (row.kind === CAMPAIGN_KIND)
            continue;
        const bad = unreadable(row, found, kinds);
        if (bad !== null) {
            const blocked = blockedRead(bad.op, bad.problem);
            if (blocked !== null)
                return unknown(blocked);
            index.unreadable.push({ path: row.path, problem: bad.problem });
            continue;
        }
        const kind = String(row.kind);
        const status = typeof row.status === "string" ? row.status : null;
        const narrative = isObject(row.narrative) && typeof row.narrative.path === "string" ? row.narrative.path : null;
        const terminal = kinds[kind]?.terminal;
        const entry = { id: row.id, kind, status, live: terminal !== undefined && status !== null && !terminal.includes(status), control: row.path, narrative };
        index.byControl.set(entry.control, entry);
        index.byId.set(entry.id, entry);
        if (narrative !== null)
            index.byNarrative.set(narrative, entry);
    }
    for (const r of references.list) {
        if (isObject(r) && typeof r.path === "string" && ACTIVE_DOCUMENT_REF.test(String(r.at))) {
            const binding = { role: typeof r.role === "string" ? r.role : null, status: String(r.status), target: r.status === "resolved" && typeof r.target === "string" ? r.target : null };
            index.bindings.set(r.path, [...(index.bindings.get(r.path) ?? []), binding]);
        }
        if (!isObject(r) || r.status !== "unresolved" || r.reason !== "record-not-found" || typeof r.path !== "string")
            continue;
        index.unresolvedRefs.push({ path: r.path, at: String(r.at), problem: { class: String(r.class), reason: r.reason } });
    }
    return { format: "json-control", index };
}
/** One line naming why the workbench was not read, for a checker's stderr. */
export function notReadLine(u, workbench) {
    const refusal = (r) => `${r.class}/${r.reason}${r.detail === undefined ? "" : `: ${r.detail}`}`;
    switch (u.cause) {
        case "unsupported":
            return `the workbench at ${workbench} is unsupported by this version's codec${u.diagnosis === null ? "" : ` (${refusal(u.diagnosis)})`}.`;
        case "unanswered":
            return u.how === "bundle-missing" ? `${u.detail}; nothing could be asked.` : `the codec gave no answer to ${u.op} (${u.how}: ${u.detail}).`;
        case "refused":
            return `the codec refused ${u.op} (${refusal(u.refusal)}).`;
    }
}
/** The one sentence refusing a legacy workbench by name, for stderr: the three checkers print it, and so do `scope.ts` and `order.ts`, each with its own tail. */
export const legacyLine = (workbench) => `the workbench at ${workbench} is legacy (no workbench.json: its control data is Markdown), which this version reads only once it has been migrated: run /fusion:migrate.`;
/** A missing bundle is the plugin's fault, and a checker names it apart from a workbench it could not read. */
export const bundleMissing = (u) => u.cause === "unanswered" && u.how === "bundle-missing";
