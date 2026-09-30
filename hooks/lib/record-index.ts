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
 *   `legacy`        the workbench has no manifest. The caller keeps its
 *                   legacy reader and says `format=legacy`: section 9 of
 *                   Prior's spec keeps a legacy session on matching readers
 *                   until the maintenance window, where FJ03a's resolvers
 *                   refuse.
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
 *   `list`            without a scope, as `lib/scope.ts` sends it.
 *   `reconcile`       without a scope. Its `records` are the codec's findings
 *                     per control file, and a row judged against them by
 *                     `unreadRow` is `unreadable`, named, and in no map. Its
 *                     `references` give `unresolvedRefs`: every record
 *                     reference, a `depends_on` target among them, that
 *                     resolves to no control file (`record-not-found`).
 *
 * `unreadRow` is written for a package row, and its status check is the
 * package vocabulary. A record of another kind is held to its own: the states
 * `codec/contract/transitions.json` lists for its kind, and for a kind the
 * contract gives none (evidence) no status at all.
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
import { ask as askCodec, type Ask, type Refusal } from "./record-client.js";
import { blockedRead, findingsByPath, isObject, listOf, refusedByGate, resultOf, unreadRow, type Findings, type Unread } from "./codec-read.js";

export interface IndexEntry {
  id: string;
  kind: string;
  /** `null` for a kind without a state (evidence). */
  status: string | null;
  live: boolean;
  control: string;
  narrative: string | null;
}

export interface RecordIndex {
  byNarrative: Map<string, IndexEntry>;
  byId: Map<string, IndexEntry>;
  byControl: Map<string, IndexEntry>;
  /** Control files that did not read, each with the codec's finding. */
  unreadable: Array<{ path: string; problem: Refusal }>;
  /** Record references resolving to nothing: the control file, the JSON pointer, the codec's reason. */
  unresolvedRefs: Array<{ path: string; at: string; problem: Refusal }>;
}

/** Why no index was read. `legacy` is not among them: it is a format, with a reader of its own. */
export type NotRead = Exclude<Unread, { cause: "legacy" }>;

export type IndexRead = { format: "json-control"; index: RecordIndex } | { format: "legacy" } | { format: "unknown"; unread: NotRead };

/** dist layout: `<plugin>/hooks/dist/lib/record-index.js` → `<plugin>/codec/contract/transitions.json`. */
export function defaultContract(): string {
  return resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..", "codec", "contract", "transitions.json");
}

type Kinds = Record<string, { states: string[]; terminal: string[] }>;

/** A row that does not read, by `unreadRow`, with the status held to its own kind's vocabulary. */
function unreadable(row: Record<string, unknown>, found: Findings, kinds: Kinds): { op: string; problem: Refusal } | null {
  const bad = unreadRow(row, found);
  if (row.kind === "package" || bad === null || bad.problem.reason !== "status-unreadable") return bad;
  const k = kinds[String(row.kind)];
  return (k === undefined ? row.status === null : k.states.includes(row.status as string)) ? null : bad;
}

/**
 * The index of `workbench`, or why there is none. `ask` is the record client's
 * by default and a test's stand-in when injected; `contract` is the
 * transitions file, beside the compiled module by default.
 */
export function readRecordIndex(workbench: string, ask: Ask = askCodec, contract: string = defaultContract()): IndexRead {
  const gated = refusedByGate(workbench, ask);
  if (gated !== null) return gated.cause === "legacy" ? { format: "legacy" } : { format: "unknown", unread: gated };
  const unknown = (unread: Unread): IndexRead => ({ format: "unknown", unread: unread as NotRead });

  const listed = resultOf(workbench, { op: "list" }, ask);
  if ("unread" in listed) return unknown(listed.unread);
  const records = listOf("list", listed.result, "records");
  if ("unread" in records) return unknown(records.unread);
  const reconciled = resultOf(workbench, { op: "reconcile" }, ask);
  if ("unread" in reconciled) return unknown(reconciled.unread);
  const findings = listOf("reconcile", reconciled.result, "records");
  if ("unread" in findings) return unknown(findings.unread);
  const references = listOf("reconcile", reconciled.result, "references");
  if ("unread" in references) return unknown(references.unread);
  const found = findingsByPath("reconcile", findings.list);
  const kinds = (JSON.parse(readFileSync(contract, "utf-8")) as { kinds: Kinds }).kinds;

  const index: RecordIndex = { byNarrative: new Map(), byId: new Map(), byControl: new Map(), unreadable: [], unresolvedRefs: [] };
  for (const row of records.list) {
    if (!isObject(row) || typeof row.path !== "string") continue;
    const bad = unreadable(row, found, kinds);
    if (bad !== null) {
      const blocked = blockedRead(bad.op, bad.problem);
      if (blocked !== null) return unknown(blocked);
      index.unreadable.push({ path: row.path, problem: bad.problem });
      continue;
    }
    const kind = String(row.kind);
    const status = typeof row.status === "string" ? row.status : null;
    const narrative = isObject(row.narrative) && typeof row.narrative.path === "string" ? row.narrative.path : null;
    const terminal = kinds[kind]?.terminal;
    const entry: IndexEntry = { id: row.id as string, kind, status, live: terminal !== undefined && status !== null && !terminal.includes(status), control: row.path, narrative };
    index.byControl.set(entry.control, entry);
    index.byId.set(entry.id, entry);
    if (narrative !== null) index.byNarrative.set(narrative, entry);
  }
  for (const r of references.list) {
    if (!isObject(r) || r.status !== "unresolved" || r.reason !== "record-not-found" || typeof r.path !== "string") continue;
    index.unresolvedRefs.push({ path: r.path, at: String(r.at), problem: { class: String(r.class), reason: r.reason } });
  }
  return { format: "json-control", index };
}

/** One line naming why the workbench was not read, for a checker's stderr. */
export function notReadLine(u: NotRead, workbench: string): string {
  const refusal = (r: Refusal): string => `${r.class}/${r.reason}${r.detail === undefined ? "" : `: ${r.detail}`}`;
  switch (u.cause) {
    case "unsupported":
      return `the workbench at ${workbench} is unsupported by this version's codec${u.diagnosis === null ? "" : ` (${refusal(u.diagnosis)})`}.`;
    case "unanswered":
      return u.how === "bundle-missing" ? `${u.detail}; nothing could be asked.` : `the codec gave no answer to ${u.op} (${u.how}: ${u.detail}).`;
    case "refused":
      return `the codec refused ${u.op} (${refusal(u.refusal)}).`;
  }
}

/** A missing bundle is the plugin's fault, and a checker names it apart from a workbench it could not read. */
export const bundleMissing = (u: NotRead): boolean => u.cause === "unanswered" && u.how === "bundle-missing";
