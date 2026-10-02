// ---------------------------------------------------------------------------
// `migration`, the maintenance run of spec section 8, as the FJ04 contract
// delta amended for Prior `ab9cb59` states it (`codec/fixtures/prior/
// REQUESTS.md`, "FJ04 (the contract delta, amended for ab9cb59)"). The host
// reads the v12 Markdown and composes a mapping proposal; the codec validates
// it, freezes it and alone writes every byte of the run. This file answers the
// first two phases:
//
//   survey   an observation: every entry under the root but `.json-state/`
//            in one of four forms, sorted bytewise by path, and the local
//            state (`local_state`): the pending intents, the fence, and what
//            does not read. No lock, no sweep, no recovery, no stored answer,
//            and no `.json-state/` is created.
//   plan     the proposal under `.json-state/migration/`, bound by the
//            request's sha256 and read strictly at its 16 MiB cap; checked in
//            the contract's order; the inventory taken under the lock; the
//            writes cut into chunks of at most fifty; the plan frozen under
//            `archive/migrations/<migration id>/` as numbered parts and an
//            index, in ONE bounded intent with the index its last write.
//
// `apply`, `verify` and `rollback` land in FJ04's step 6; until then
// `cli/ops.ts` refuses them `operation-unknown/not-implemented`.
//
// ## The order of `plan`
//
// The kernel runs the lock, the sweep, the recovery of every intent it does
// not hold (a migration intent, and for this request a committed
// `initialize`, is held for its own request), and this operation id's replay
// (`kernel.ts`). The kernel's state gate admits every state and its fence
// check is skipped for `migration`, so both are decided here, after the
// replay, as the contract orders them. First refusal wins:
//
//   prefix   a manifest that does not read or validate (its own diagnosis);
//            a held intent: `conflict/intent-pending`;
//   state    a manifest: the second-run no-op when it names a receipt of
//            this proposal's migration and the receipt holds, else
//            `migration-incomplete/receipt-unverified` or
//            `conflict/manifest-present`;
//   fence    a standing (or unreadable) fence: `conflict/maintenance-active`;
//   plan     plan files standing under `archive/migrations/`:
//            `conflict/migration-planned`;
//   proposal not a regular file under `.json-state/migration/`, or over
//            16 MiB: `schema-invalid/proposal-invalid`; bytes not at the
//            request's sha256: `conflict/source-changed`; content that does
//            not parse or validate, deletion ranges unordered or
//            overlapping, an inadmissible exclusion: `proposal-invalid`;
//   records  a record whose row, kind, paths, backup or provenance do not
//            agree, counts not the rows': `proposal-invalid`; a UUID twice
//            or a control not carrying its key and the workbench id:
//            `schema-invalid/duplicate-id`; a control path present:
//            `conflict/record-exists`; a blocking finding:
//            `migration-incomplete/blocking-finding`; a record reference
//            naming no proposed record: `unresolved-reference/
//            closure-incomplete`; an acceptance its package's
//            active-document entry does not carry: `proposal-invalid`;
//   disk     the inventory under the lock; a source not a file at its
//            sha256 there: `conflict/source-changed`; deletion ranges
//            outside the source or not giving the after-hash:
//            `proposal-invalid`;
//   cut      the cut; an operation-id schedule that is not complete, unique
//            and unused, or whose plan id is not this request's:
//            `proposal-invalid`; a freeze over its bound:
//            `schema-invalid/plan-too-large`. Then the one intent.
//
// ## The freeze and its bound (C1)
//
// Chunk files first, then the records, inventory, findings and repairs parts,
// then the index, all in one intent under the request's id with its answer:
// no plan is visible until the intent lands, and a crash in between is
// finished only by the same request. The bound is checked after the cut and
// before anything is written: every part and `intent.json` under the strict
// reader's 1 MiB, and at most `FREEZE_MAX_FILES` files and
// `FREEZE_MAX_BYTES` bytes, fixed from step 5's measurement of the freeze on
// a generated store of the largest measured copy's size (`codec/README.md`).
// Over it, nothing is published; a multi-request freeze is question 50 and
// is not built.
// ---------------------------------------------------------------------------

import { existsSync, lstatSync, readdirSync, readFileSync, readlinkSync } from "node:fs";
import { dirname, join } from "node:path";
import { JOURNAL_DIR, answerPath, journalDir, opsDir, readAnswer, readIntent, requestDigest, type Intent } from "./journal.js";
import type { PlanContext, PlanFunction, Planned, PlannedWrite } from "./kernel.js";
import {
  ARCHIVE_DIR,
  MAINTENANCE_FILE,
  PACKAGE_SCHEMA_ID,
  RECORD_SCHEMA_ID,
  SCHEMA_ID_PREFIX,
  STATE_DIR,
  WORKBENCH_MANIFEST,
  archived,
  describeErrors,
  openWorkbench,
  readFence,
  resolveInside,
  revisionOf,
  serialise,
  type Result,
  type StoreError,
  type Workbench,
} from "./store.js";
import { MAX_RECORD_BYTES, strictParse } from "./strict-json.js";
import { validate } from "./validate.js";
import type { MigrationPlanRequest, Response } from "./cli/protocol.js";

export const PLAN_SCHEMA_ID = "urn:fusion:schema:fusion.migration-plan/v1";
export const PROPOSAL_SCHEMA_ID = "urn:fusion:schema:fusion.migration-proposal/v1";
export const RECEIPT_SCHEMA_ID = "urn:fusion:schema:fusion.migration-receipt/v1";

/** Where every migration keeps its frozen plan, originals and receipt. */
export const MIGRATIONS_DIR = `${ARCHIVE_DIR}/migrations`;
/** Where the host writes the proposal; it never travels. */
export const PROPOSAL_DIR = `${STATE_DIR}/migration`;
/** The proposal's cap (request 45h), and the answer channel's bound, LF included: 16 MiB. */
export const PROPOSAL_CAP = 16 * MAX_RECORD_BYTES;
export const ANSWER_CAP = 16 * MAX_RECORD_BYTES;
/** At most this many writes per chunk, one apply request each (part A's measurement). */
export const CHUNK_WRITES = 50;
/**
 * The freeze bound beside the 1 MiB file limits (C1), from step 5's
 * measurement: one plan request through the bundle, process start included,
 * over a generated store of the largest measured copy's size (749 pairs, 182
 * rewrites, 1 680 writes, 7 942 files in 952 directories, one 465 KB
 * narrative) froze 41 files, 3 410 844 bytes (35 chunks, 6 other parts and
 * the index), in 1.26 s, 1.28 s and 1.32 s on an M2 Max with Node 25.7.0.
 * The bound admits about twice that; the time at the bound is inferred, by
 * the measured rate, at under 2.5 s, half the client's 5 s post-wait
 * allowance.
 */
export const FREEZE_MAX_FILES = 80;
export const FREEZE_MAX_BYTES = 6 * MAX_RECORD_BYTES;

const PLAN_SCHEMA = PLAN_SCHEMA_ID.slice(SCHEMA_ID_PREFIX.length);
const MIGRATION_ID = /^migration-[0-9]{8}-[a-z0-9-]+$/;
const NAMED = 5;
/** Room kept free in a part for its frame and the estimate's error; the exact bytes are checked after. */
const PART_MARGIN = 64 * 1024;

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);
const refusal = <T>(cls: StoreError["class"], reason: string, detail: string, errors?: StoreError["errors"]): Result<T> => ({
  ok: false,
  error: { class: cls, reason, detail, ...(errors !== undefined ? { errors } : {}) },
});
const listed = (items: readonly string[]): string => items.slice(0, NAMED).join("; ") + (items.length > NAMED ? `; and ${items.length - NAMED} more` : "");
const plural = (n: number, one: string, many = `${one}s`): string => `${n} ${n === 1 ? one : many}`;
/** Bytewise order of UTF-8 paths, the order the contract fixes for every listing. */
export const bytewise = (a: string, b: string): number => Buffer.compare(Buffer.from(a, "utf-8"), Buffer.from(b, "utf-8"));

export const indexPath = (migrationId: string): string => `${MIGRATIONS_DIR}/${migrationId}/plan.json`;
export const chunkPath = (migrationId: string, n: number): string => `${MIGRATIONS_DIR}/${migrationId}/chunks/${n}.json`;
export const partPath = (migrationId: string, kind: PartKind, n: number): string => `${MIGRATIONS_DIR}/${migrationId}/parts/${kind}-${n}.json`;
export const originalPath = (migrationId: string, narrative: string): string => `${MIGRATIONS_DIR}/${migrationId}/originals/${narrative}`;

// --- the inventory, and survey --------------------------------------------------------

/** One entry under the root in the contract's four forms. */
export type InventoryEntry =
  | { path: string; kind: "file"; size: number; sha256: string }
  | { path: string; kind: "link"; target: string }
  | { path: string; kind: "directory" }
  | { path: string; kind: "other" };

/**
 * Every entry under `root` that `skip` leaves, in the four forms, sorted
 * bytewise by path. A skipped entry is not descended into. A link is listed by
 * its own text and never followed; a directory carries no size, mode or time.
 */
export function inventory(root: string, skip: (path: string) => boolean): InventoryEntry[] {
  const out: InventoryEntry[] = [];
  const walk = (dir: string, rel: string): void => {
    for (const name of readdirSync(dir)) {
      const path = rel === "" ? name : `${rel}/${name}`;
      if (skip(path)) continue;
      const abs = join(dir, name);
      const st = lstatSync(abs);
      if (st.isSymbolicLink()) out.push({ path, kind: "link", target: readlinkSync(abs) });
      else if (st.isDirectory()) {
        out.push({ path, kind: "directory" });
        walk(abs, path);
      } else if (st.isFile()) {
        const bytes = readFileSync(abs);
        out.push({ path, kind: "file", size: bytes.byteLength, sha256: revisionOf(bytes) });
      } else out.push({ path, kind: "other" });
    }
  };
  walk(root, "");
  return out.sort((a, b) => bytewise(a.path, b.path));
}

const under = (path: string, dir: string): boolean => path === dir || path.startsWith(`${dir}/`);

/** The migration phase a committed migration intent belongs to, read from the answer it carries; null for any other op. */
function phaseOf(intent: Intent): string | null {
  if (intent.op !== "migration") return null;
  const r = intent.response.ok ? intent.response.result : undefined;
  if (!isObject(r)) return null;
  if ("schedule" in r || "no_op" in r) return "plan";
  if ("receipt" in r && "manifest" in r) return "verify";
  if ("restored" in r) return "rollback";
  if ("chunk" in r) return "apply";
  return null;
}

/** `survey`'s `local_state`: what is pending and what does not read under `.json-state/`, observed and never finished. */
function localState(wb: Workbench): Record<string, unknown> {
  const unreadable: Array<{ path: string; reason: string }> = [];
  let present = true;
  try {
    lstatSync(join(wb.root, STATE_DIR));
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code !== "ENOENT") throw e;
    present = false;
  }
  const intents: Array<{ operation_id: string; op: string; phase: string | null }> = [];
  let maintenance: unknown = null;
  if (present) {
    const journal = `${STATE_DIR}/${JOURNAL_DIR}`;
    let names: string[] = [];
    try {
      if (lstatSync(journalDir(wb)).isDirectory()) names = readdirSync(journalDir(wb)).filter((n) => !n.startsWith(".")).sort(bytewise);
      else unreadable.push({ path: journal, reason: "not-a-directory" });
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code !== "ENOENT") unreadable.push({ path: journal, reason: (e as NodeJS.ErrnoException).code ?? "unreadable" });
    }
    for (const name of names) {
      const r = readIntent(wb, name);
      if (!r.ok) unreadable.push({ path: `${journal}/${name}`, reason: r.error.reason });
      else if (r.value !== null) intents.push({ operation_id: r.value.intent.operation_id, op: r.value.intent.op, phase: phaseOf(r.value.intent) });
    }
    const fence = readFence(wb);
    if (fence.ok) maintenance = fence.value;
    else unreadable.push({ path: `${STATE_DIR}/${MAINTENANCE_FILE}`, reason: fence.error.reason });
  }
  return { present, intents, maintenance, unreadable };
}

/**
 * `migration survey`: `{layout, entries, local_state}`. An observation, not a
 * snapshot a later phase may trust: `plan` and every chunk take their own
 * inventory under the lock. An answer over the 16 MiB channel is refused
 * `schema-invalid/too-large`, never truncated.
 */
export function survey(wb: Workbench): Response {
  const entries = inventory(wb.root, (path) => path === STATE_DIR);
  const response: Response = { ok: true, result: { layout: wb.state, entries, local_state: localState(wb) } };
  const size = Buffer.byteLength(JSON.stringify(response), "utf-8") + 1;
  if (size > ANSWER_CAP) return { ok: false, error: { class: "schema-invalid", reason: "too-large", detail: `the survey of ${wb.root} is ${size} bytes with its LF; the answer channel carries at most ${ANSWER_CAP} (16 MiB), and an answer is never truncated` } };
  return response;
}

// --- the proposal ---------------------------------------------------------------------

type Row = "package-live" | "package-terminal" | "record-live" | "record-closure";

interface Deletion {
  offset: number;
  length: number;
}

interface ProposalRecord {
  row: Row;
  kind: "package" | "issue" | "plan" | "discussion" | "decision";
  narrative: string;
  source_sha256: string;
  control_path: string;
  backup: string;
  rewrite: { after_sha256: string; deletions: Deletion[] } | null;
  control: Record<string, unknown>;
}

interface Finding {
  class: string;
  severity: "blocking" | "reported";
  path: string;
  detail: string;
}

interface Proposal {
  migration_id: string;
  workbench_id: string;
  source_layout: string;
  operation_ids: { plan: string; apply: string[]; verify: string; rollback: string[] };
  exclusions: string[];
  records: Record<string, ProposalRecord>;
  counts: Record<string, number>;
  findings: Finding[];
  repairs: unknown[];
}

const invalid = <T>(detail: string, errors?: StoreError["errors"]): Result<T> => refusal("schema-invalid", "proposal-invalid", detail, errors);

/** The proposal's exact bytes: a regular file under `.json-state/migration/`, at most 16 MiB. */
function proposalBytes(wb: Workbench, path: string): Result<Buffer> {
  if (!path.startsWith(`${PROPOSAL_DIR}/`) || path.slice(PROPOSAL_DIR.length + 1).includes("/")) return invalid(`${path} is not a file directly under ${PROPOSAL_DIR}/`);
  const abs = resolveInside(wb, path);
  if (!abs.ok) return invalid(abs.error.detail);
  let size: number;
  try {
    const st = lstatSync(abs.value);
    if (!st.isFile()) return invalid(`${path} is not a regular file`);
    size = st.size;
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === "ENOENT") return invalid(`${path} does not exist in ${wb.root}`);
    throw e;
  }
  if (size > PROPOSAL_CAP) return invalid(`${path} is ${size} bytes; a proposal is at most ${PROPOSAL_CAP} bytes (16 MiB)`);
  const bytes = readFileSync(abs.value);
  if (bytes.byteLength > PROPOSAL_CAP) return invalid(`${path} grew to ${bytes.byteLength} bytes while it was read; a proposal is at most ${PROPOSAL_CAP} bytes (16 MiB)`);
  return { ok: true, value: bytes };
}

/** The bytes at the request's sha256, else `conflict/source-changed`. */
function boundProposal(wb: Workbench, req: MigrationPlanRequest): Result<Buffer> {
  const bytes = proposalBytes(wb, req.proposal.path);
  if (!bytes.ok) return bytes;
  const hash = revisionOf(bytes.value);
  if (hash !== req.proposal.sha256) return refusal("conflict", "source-changed", `${req.proposal.path} is ${hash}; the request binds ${req.proposal.sha256}`);
  return bytes;
}

/** The proposal parsed strictly at its cap and valid under its schema. */
function parseProposal(path: string, bytes: Buffer): Result<Proposal> {
  const parsed = strictParse(bytes, PROPOSAL_CAP);
  if (!parsed.ok) return invalid(`${path}: ${parsed.reason}: ${parsed.detail}`);
  const v = validate(PROPOSAL_SCHEMA_ID, parsed.value);
  if (!v.ok) {
    if (v.class === "unsupported-format") return refusal("unsupported-format", "unknown-schema", `no schema ${v.schemaId}`);
    return invalid(`${path}: ${describeErrors(v.errors)}`, v.errors);
  }
  return { ok: true, value: parsed.value as Proposal };
}

const TERMINAL_ROWS: readonly Row[] = ["package-terminal", "record-closure"];
const ROWS: Readonly<Record<string, Row>> = { package_live: "package-live", package_terminal: "package-terminal", record_live: "record-live", record_closure: "record-closure" };
const firstSegment = (path: string): string => path.split("/")[0] as string;

/** The proposal step's checks the schema cannot make: deletion ranges in order, exclusions admissible. */
function rangesAndExclusions(p: Proposal, order: readonly string[]): Result<void> {
  const problems: string[] = [];
  for (const id of order) {
    const r = p.records[id] as ProposalRecord;
    if (r.rewrite === null) continue;
    let end = 0;
    for (const d of r.rewrite.deletions) {
      if (d.offset < end) {
        problems.push(`${r.narrative}: the deletion at ${d.offset} overlaps or precedes the one before it, which ends at ${end}`);
        break;
      }
      end = d.offset + d.length;
    }
  }
  const touched = new Set(order.flatMap((id) => [firstSegment((p.records[id] as ProposalRecord).narrative), firstSegment((p.records[id] as ProposalRecord).control_path)]));
  for (const ex of p.exclusions) if (touched.has(ex)) problems.push(`the exclusion ${ex} holds a narrative or control path the plan reads or writes`);
  return problems.length === 0 ? { ok: true, value: undefined } : invalid(`${plural(problems.length, "problem")}: ${listed(problems)}`);
}

/** The records step's agreement checks, one record at a time in narrative order, and the counts against the rows. */
function structural(wb: Workbench, p: Proposal, order: readonly string[]): Result<void> {
  const problems: string[] = [];
  const narratives = new Set<string>();
  const controls = new Set<string>();
  for (const id of order) {
    const r = p.records[id] as ProposalRecord;
    const at = `records/${id} (${r.narrative})`;
    const c = r.control;
    const isPackage = r.kind === "package";
    const schemaId = SCHEMA_ID_PREFIX + String(c.schema);
    if (isPackage !== r.row.startsWith("package-") || (isPackage ? schemaId !== PACKAGE_SCHEMA_ID : schemaId !== RECORD_SCHEMA_ID || c.kind !== r.kind)) {
      problems.push(`${at}: row ${r.row}, kind ${r.kind} and a control of ${String(c.schema)}${isPackage ? "" : ` kind ${String(c.kind)}`} do not agree`);
    }
    if (!isObject(c.narrative) || c.narrative.path !== r.narrative) problems.push(`${at}: the control names the narrative ${JSON.stringify(isObject(c.narrative) ? c.narrative.path : null)}`);
    const dir = dirname(r.narrative);
    const stem = r.narrative.endsWith(".md") ? r.narrative.slice(dir.length + 1, -".md".length) : null;
    const pairControl = isPackage ? `${dir}/package.json` : stem === null ? null : `${dir}/${stem}.record.json`;
    if (dir === "." || pairControl !== r.control_path) problems.push(`${at}: the control path is ${r.control_path}; the pair's is ${pairControl ?? "none, the narrative is no .md file"}`);
    for (const path of [r.narrative, r.control_path]) {
      const inside = resolveInside(wb, path);
      if (!inside.ok) problems.push(`${at}: ${inside.error.detail}`);
      else if (archived(wb, path)) problems.push(`${at}: ${path} lies in ${ARCHIVE_DIR}/, which the migration never converts`);
    }
    const backup = originalPath(p.migration_id, r.narrative);
    if (r.backup !== backup) problems.push(`${at}: the backup is ${r.backup}; this migration's is ${backup}`);
    const named = isObject(c.provenance) ? c.provenance.backup : undefined;
    if (!isObject(named) || named.path !== backup || named.sha256 !== r.source_sha256) problems.push(`${at}: provenance.backup does not name ${backup} at the source sha256`);
    const source = isObject(c.provenance) ? c.provenance.source : undefined;
    const terminal = TERMINAL_ROWS.includes(r.row);
    if (source !== (terminal ? "legacy-terminal" : "imported")) problems.push(`${at}: a ${r.row} row carries provenance.source ${JSON.stringify(source)}`);
    if (terminal && r.rewrite !== null) problems.push(`${at}: a ${r.row} row stays byte-identical and carries a rewrite`);
    if (narratives.has(r.narrative)) problems.push(`${at}: the narrative is named by another record`);
    if (controls.has(r.control_path)) problems.push(`${at}: the control path is named by another record`);
    narratives.add(r.narrative);
    controls.add(r.control_path);
  }
  for (const [count, row] of Object.entries(ROWS)) {
    const n = order.filter((id) => p.records[id]?.row === row).length;
    if (p.counts[count] !== n) problems.push(`counts.${count} is ${String(p.counts[count])}; the records hold ${n} ${row} rows`);
  }
  return problems.length === 0 ? { ok: true, value: undefined } : invalid(`${plural(problems.length, "problem")}: ${listed(problems)}`);
}

/** Every record UUID once beside the workbench id, each control carrying its key and the proposal's workbench id. */
function uniqueIds(p: Proposal, order: readonly string[]): Result<void> {
  const twice: string[] = [];
  if (p.records[p.workbench_id] !== undefined) twice.push(`${p.workbench_id} is the workbench id and a record's`);
  for (const id of order) {
    const c = (p.records[id] as ProposalRecord).control;
    if (c.id !== id) twice.push(`the record keyed ${id} carries the id ${String(c.id)}`);
    if (c.workbench_id !== p.workbench_id) twice.push(`the record ${id} carries workbench_id ${String(c.workbench_id)}, the proposal ${p.workbench_id}`);
  }
  return twice.length === 0 ? { ok: true, value: undefined } : refusal("schema-invalid", "duplicate-id", listed(twice));
}

/** A reference site of a control: where it sits and what it holds. `ops.ts` supplies its `referenceSites`, the schema-derived enumeration. */
export type SitesOf = (pair: { kind: string; control: Record<string, unknown> }) => Array<{ at: string; value: unknown }>;

/** Every site holding a `record_ref` names a proposed record of this workbench (46 a); a foreign or legacy reference is no binding. */
function closure(p: Proposal, order: readonly string[], sitesOf: SitesOf): Result<void> {
  const open: string[] = [];
  for (const id of order) {
    const r = p.records[id] as ProposalRecord;
    for (const site of sitesOf({ kind: r.kind, control: r.control })) {
      const v = site.value;
      if (!isObject(v) || typeof v.record_id !== "string") continue;
      if (v.workbench_id !== p.workbench_id || p.records[v.record_id] === undefined) open.push(`${r.narrative} ${site.at} names ${v.record_id}`);
    }
  }
  return open.length === 0 ? { ok: true, value: undefined } : refusal("unresolved-reference", "closure-incomplete", `${plural(open.length, "record reference")} name no proposed record: ${listed(open)}`);
}

/** The narrative's bytes after its rewrite, or as they stand: what an acceptance revision binds. */
const afterHash = (r: ProposalRecord): string => r.rewrite?.after_sha256 ?? r.source_sha256;

/** Each acceptance names a proposed package whose active-document entry binds this record at its after-rewrite revision (48). */
function acceptances(p: Proposal, order: readonly string[]): Result<void> {
  const wrong: string[] = [];
  for (const id of order) {
    const r = p.records[id] as ProposalRecord;
    const control = r.control.control;
    const acceptance = isObject(control) ? control.acceptance : null;
    if (!isObject(acceptance)) continue;
    const ref = acceptance.ref;
    const pkg = isObject(ref) && typeof ref.record_id === "string" ? p.records[ref.record_id] : undefined;
    if (pkg === undefined || pkg.kind !== "package") {
      wrong.push(`${r.narrative}: its acceptance names no proposed package`);
      continue;
    }
    if (acceptance.revision !== afterHash(r)) wrong.push(`${r.narrative}: its acceptance revision is ${String(acceptance.revision)}, the narrative's after-rewrite sha256 ${afterHash(r)}`);
    const docs = Array.isArray(pkg.control.active_documents) ? pkg.control.active_documents : [];
    const entry = docs.find((d) => isObject(d) && isObject(d.ref) && d.ref.record_id === id);
    if (!isObject(entry) || entry.revision !== acceptance.revision) wrong.push(`${r.narrative}: ${pkg.narrative} carries no active-document entry binding it at ${String(acceptance.revision)}`);
  }
  return wrong.length === 0 ? { ok: true, value: undefined } : invalid(`${plural(wrong.length, "acceptance")} do not match: ${listed(wrong)}`);
}

/** The disk step: every narrative a file at its source sha256 in the inventory taken under the lock. */
function sources(p: Proposal, order: readonly string[], taken: ReadonlyMap<string, InventoryEntry>): Result<void> {
  const changed: string[] = [];
  for (const id of order) {
    const r = p.records[id] as ProposalRecord;
    const e = taken.get(r.narrative);
    if (e === undefined) changed.push(`${r.narrative} does not exist`);
    else if (e.kind !== "file") changed.push(`${r.narrative} is a ${e.kind}, not a file`);
    else if (e.sha256 !== r.source_sha256) changed.push(`${r.narrative} is ${e.sha256}, the proposal names ${r.source_sha256}`);
  }
  return changed.length === 0 ? { ok: true, value: undefined } : refusal("conflict", "source-changed", `${plural(changed.length, "narrative")} not as the proposal read them: ${listed(changed)}`);
}

/** The source bytes with the deletion ranges removed, or why the ranges do not apply to them. */
export function applyDeletions(source: Buffer, deletions: readonly Deletion[]): { ok: true; bytes: Buffer } | { ok: false; why: string } {
  const kept: Buffer[] = [];
  let at = 0;
  for (const d of deletions) {
    if (d.offset < at) return { ok: false, why: `the range at ${d.offset} does not ascend past ${at}` };
    if (d.offset + d.length > source.byteLength) return { ok: false, why: `the range ${d.offset}+${d.length} passes the ${source.byteLength} source bytes` };
    kept.push(source.subarray(at, d.offset));
    at = d.offset + d.length;
  }
  kept.push(source.subarray(at));
  return { ok: true, bytes: Buffer.concat(kept) };
}

function rewrites(wb: Workbench, p: Proposal, order: readonly string[]): Result<void> {
  const wrong: string[] = [];
  for (const id of order) {
    const r = p.records[id] as ProposalRecord;
    if (r.rewrite === null) continue;
    const bytes = readFileSync(join(wb.root, r.narrative));
    if (revisionOf(bytes) !== r.source_sha256) return refusal("conflict", "source-changed", `${r.narrative} changed while plan read it`);
    const out = applyDeletions(bytes, r.rewrite.deletions);
    if (!out.ok) wrong.push(`${r.narrative}: ${out.why}`);
    else if (revisionOf(out.bytes) !== r.rewrite.after_sha256) wrong.push(`${r.narrative}: the deletions give ${revisionOf(out.bytes)}, the rewrite names ${r.rewrite.after_sha256}`);
  }
  return wrong.length === 0 ? { ok: true, value: undefined } : invalid(`${plural(wrong.length, "rewrite")} do not apply: ${listed(wrong)}`);
}

// --- the cut -------------------------------------------------------------------------

type ChunkWrite =
  | { kind: "original"; path: string; from: string; source_sha256: null; after_sha256: string }
  | { kind: "control"; path: string; source_sha256: null; after_sha256: string; control: Record<string, unknown> }
  | { kind: "rewrite"; path: string; source_sha256: string; after_sha256: string; deletions: Deletion[] };

export interface PairWrites {
  original: ChunkWrite;
  rest: ChunkWrite[];
}

function pairWrites(r: ProposalRecord): PairWrites {
  const control = Buffer.from(serialise(r.control), "utf-8");
  const rest: ChunkWrite[] = [{ kind: "control", path: r.control_path, source_sha256: null, after_sha256: revisionOf(control), control: r.control }];
  if (r.rewrite !== null) rest.push({ kind: "rewrite", path: r.narrative, source_sha256: r.source_sha256, after_sha256: r.rewrite.after_sha256, deletions: r.rewrite.deletions });
  return { original: { kind: "original", path: r.backup, from: r.narrative, source_sha256: null, after_sha256: r.source_sha256 }, rest };
}

const chunkFile = (migrationId: string, n: number, pairs: readonly PairWrites[]): Record<string, unknown> => ({
  schema: PLAN_SCHEMA,
  part: "chunk",
  migration_id: migrationId,
  chunk: n,
  writes: [...pairs.map((p) => p.original), ...pairs.flatMap((p) => p.rest)],
});

const writesOf = (pair: PairWrites): number => 1 + pair.rest.length;

/** The bytes one value adds to a pretty-printed array or object `depth` levels deep: its text, its indentation, and the separator. */
function contribution(text: string, depth: number): number {
  const lines = text.split("\n").length;
  return Buffer.byteLength(text, "utf-8") + lines * 2 * depth + 2;
}

export interface Frozen {
  file: Record<string, unknown>;
  bytes: Buffer;
}

/**
 * Pairs in narrative order cut into chunks: a pair never spans two, a chunk
 * closes at `CHUNK_WRITES` writes or where its file would pass the 1 MiB cap
 * by the estimate; within a chunk the originals come first.
 */
export function cut(migrationId: string, pairs: readonly PairWrites[]): Array<Frozen & { writes: number }> {
  const out: Array<Frozen & { writes: number }> = [];
  let current: PairWrites[] = [];
  let writes = 0;
  let weight = 0;
  const close = (): void => {
    if (current.length === 0) return;
    const file = chunkFile(migrationId, out.length + 1, current);
    out.push({ file, bytes: Buffer.from(serialise(file), "utf-8"), writes });
    current = [];
    writes = 0;
    weight = 0;
  };
  for (const pair of pairs) {
    const w = [pair.original, ...pair.rest].reduce((n, x) => n + contribution(JSON.stringify(x, null, 2), 2), 0);
    if (current.length > 0 && (writes + writesOf(pair) > CHUNK_WRITES || weight + w > MAX_RECORD_BYTES - PART_MARGIN)) close();
    current.push(pair);
    writes += writesOf(pair);
    weight += w;
  }
  close();
  return out;
}

export type PartKind = "records" | "inventory" | "findings" | "repairs";

/**
 * Items split into numbered parts of one kind, each estimated under the cap;
 * at least one part even with no item. `frame` builds part n from its items.
 */
function split<T>(items: readonly T[], size: (item: T) => number, frame: (n: number, items: T[]) => Record<string, unknown>): Frozen[] {
  const groups: T[][] = [[]];
  let weight = 0;
  for (const item of items) {
    const w = size(item);
    const last = groups[groups.length - 1] as T[];
    if (last.length > 0 && weight + w > MAX_RECORD_BYTES - PART_MARGIN) {
      groups.push([item]);
      weight = w;
    } else {
      last.push(item);
      weight += w;
    }
  }
  return groups.map((g, i) => {
    const file = frame(i + 1, g);
    return { file, bytes: Buffer.from(serialise(file), "utf-8") };
  });
}

// --- the second run ------------------------------------------------------------------

/**
 * The state step on a store under JSON control (section 8.3.7): the proposal's
 * hash first, then a manifest naming a receipt of this migration answers it
 * as a verified no-op when the receipt holds (identity, integrity,
 * availability), `receipt-unverified` when it does not, and every other
 * manifest is `manifest-present`. It writes nothing outside `.json-state/`.
 */
function secondRun(wb: Workbench, req: MigrationPlanRequest, manifest: Record<string, unknown>): Result<Planned> {
  const bytes = boundProposal(wb, req);
  if (!bytes.ok) return bytes;
  const parsed = strictParse(bytes.value, PROPOSAL_CAP);
  const proposed = parsed.ok && isObject(parsed.value) && typeof parsed.value.migration_id === "string" ? parsed.value.migration_id : null;
  const migration = manifest.migration;
  if (!isObject(migration) || proposed === null || migration.id !== proposed) {
    return refusal("conflict", "manifest-present", `${wb.root} holds ${WORKBENCH_MANIFEST} and is under JSON control; ${isObject(migration) ? `it was migrated by ${String(migration.id)}, not by ${proposed ?? "this proposal"}` : "it was never migrated, and a migration never replaces a manifest"}`);
  }
  const unverified = (why: string): Result<Planned> => refusal("migration-incomplete", "receipt-unverified", `the receipt ${String(migration.receipt)} of ${proposed} does not hold: ${why}; a manifest merely naming a receipt is no verified no-op`);
  const fileAt = (path: string): Buffer | null => {
    const abs = resolveInside(wb, path);
    if (!abs.ok) return null;
    try {
      return lstatSync(abs.value).isFile() ? readFileSync(abs.value) : null;
    } catch {
      return null;
    }
  };
  const receiptPath = String(migration.receipt);
  const receiptBytes = fileAt(receiptPath);
  if (receiptBytes === null) return unverified("it is not a file in the workbench");
  const receipt = strictParse(receiptBytes);
  if (!receipt.ok) return unverified(`${receipt.reason}: ${receipt.detail}`);
  const v = validate(RECEIPT_SCHEMA_ID, receipt.value);
  if (!v.ok) return unverified(v.class === "schema-invalid" ? describeErrors(v.errors) : `no schema ${v.schemaId}`);
  const r = receipt.value as { migration_id: string; workbench_id: string; plan: { path: string; sha256: string }; parts: Array<{ path: string; sha256: string }>; manifest_revision: string };
  if (r.migration_id !== proposed || r.workbench_id !== manifest.id) return unverified(`it names ${r.migration_id} in ${r.workbench_id}`);
  const manifestRevision = revisionOf(readFileSync(join(wb.root, WORKBENCH_MANIFEST)));
  if (r.manifest_revision !== manifestRevision) return unverified(`it names the manifest at ${r.manifest_revision}, which is ${manifestRevision}`);
  for (const f of [r.plan, ...r.parts]) {
    const b = fileAt(f.path);
    if (b === null) return unverified(`${f.path} is not available`);
    if (revisionOf(b) !== f.sha256) return unverified(`${f.path} is ${revisionOf(b)}, the receipt names ${f.sha256}`);
  }
  const index = strictParse(fileAt(r.plan.path) as Buffer);
  const schedule = index.ok && isObject(index.value) && isObject(index.value.schedule) ? index.value.schedule : {};
  const scheduled = new Set<string>([schedule.plan, schedule.verify, ...(Array.isArray(schedule.apply) ? schedule.apply : []).map((e) => (isObject(e) ? e.operation_id : null)), ...(Array.isArray(schedule.rollback) ? schedule.rollback : []).map((e) => (isObject(e) ? e.operation_id : null))].filter((x): x is string => typeof x === "string"));
  return {
    ok: true,
    value: {
      writes: [],
      result: { operation_id: req.operation_id, migration_id: proposed, no_op: true, receipt: { path: receiptPath, sha256: revisionOf(receiptBytes) }, manifest_revision: manifestRevision, later_operations: laterOperations(wb, scheduled) },
    },
  };
}

/** Every stored answer whose id the migration's schedule does not hold, by id and op, sorted: work that followed the migration. It decides nothing. */
function laterOperations(wb: Workbench, scheduled: ReadonlySet<string>): Array<{ operation_id: string; op: string }> {
  let names: string[] = [];
  try {
    names = readdirSync(opsDir(wb));
  } catch {
    return [];
  }
  const out: Array<{ operation_id: string; op: string }> = [];
  for (const name of names.filter((n) => !n.startsWith(".") && n.endsWith(".json")).sort(bytewise)) {
    const id = name.slice(0, -".json".length);
    if (scheduled.has(id)) continue;
    const a = readAnswer(wb, id);
    out.push({ operation_id: id, op: a.ok && a.value !== null ? a.value.op : "unreadable" });
  }
  return out;
}

// --- plan ----------------------------------------------------------------------------

/** Plan files standing for any migration: an index, a `chunks/` or a `parts/`. */
function standingPlans(root: string): string[] {
  const dir = join(root, MIGRATIONS_DIR);
  let ids: string[];
  try {
    ids = readdirSync(dir);
  } catch {
    return [];
  }
  return ids.filter((id) => ["plan.json", "chunks", "parts"].some((n) => existsSync(join(dir, id, n)))).sort(bytewise);
}

/** The schedule checks of the cut step (45 f): complete, unique, unused, and this request's id as `plan`. */
function scheduleProblems(wb: Workbench, p: Proposal, req: MigrationPlanRequest, chunks: number, order: readonly string[]): string[] {
  const ids = p.operation_ids;
  const problems: string[] = [];
  if (ids.plan !== req.operation_id) problems.push(`operation_ids.plan is ${ids.plan}; this request is ${req.operation_id}`);
  if (ids.apply.length < chunks) problems.push(`the plan cuts ${plural(chunks, "chunk")} and operation_ids.apply holds ${ids.apply.length}`);
  if (ids.rollback.length < chunks + 1) problems.push(`rollback chunks 0 to ${chunks} need ${chunks + 1} ids and operation_ids.rollback holds ${ids.rollback.length}`);
  const all = [ids.plan, ...ids.apply, ids.verify, ...ids.rollback];
  const seen = new Set<string>();
  const records = new Set([p.workbench_id, ...order]);
  for (const id of all) {
    if (seen.has(id)) problems.push(`${id} occurs twice in operation_ids`);
    if (records.has(id)) problems.push(`${id} is in operation_ids and is a workbench or record UUID`);
    seen.add(id);
    if (id !== req.operation_id && (existsSync(answerPath(wb, id)) || existsSync(join(journalDir(wb), id)))) problems.push(`${id} already has a stored answer or an intent in this workbench`);
  }
  return problems;
}

/**
 * `migration plan` as a plan function over the kernel (header, "The order of
 * `plan`"). It reads the proposal, never writes it, and answers the frozen
 * index with its parts and schedule; the answer carries no `revisions`, since
 * a plan file is no control record.
 */
export function migrationPlan(req: MigrationPlanRequest, sitesOf: SitesOf): PlanFunction {
  return (ctx: PlanContext): Result<Planned> => {
    const { wb } = ctx;
    // Prefix: the manifest as it stands under the lock, then held intents.
    const now = openWorkbench(wb.root);
    if (!now.ok) return now;
    if (now.value.state === "unsupported" && now.value.diagnosis !== null) return { ok: false, error: now.value.diagnosis };
    const held = ctx.blocked.filter((b) => b.held !== undefined);
    if (held.length > 0) {
      return refusal("conflict", "intent-pending", `${plural(held.length, "intent")} pending for ${held.length === 1 ? "its" : "their"} own request: ${listed(held.map((b) => `${b.held} ${b.operation_id} in ${STATE_DIR}/${JOURNAL_DIR}/${b.operation_id}`))}; it is finished by that request, never by this one`);
    }
    // State.
    if (now.value.state === "json-control") return secondRun(wb, req, now.value.manifest as Record<string, unknown>);
    // Fence.
    const fence = readFence(wb);
    if (!fence.ok) return refusal("conflict", "maintenance-active", fence.error.detail);
    if (fence.value !== null) return refusal("conflict", "maintenance-active", `a maintenance fence stands in ${STATE_DIR}/${MAINTENANCE_FILE}, set by operation ${fence.value.operation_id} since ${fence.value.since}; plan freezes nothing under it`);
    // Plan files.
    const standing = standingPlans(wb.root);
    if (standing.length > 0) return refusal("conflict", "migration-planned", `plan files stand for ${standing.join(", ")} under ${MIGRATIONS_DIR}/; one migration is planned at a time, its own plan only by the request that froze it, and rollback chunk 0 removes them`);

    // Proposal.
    const bytes = boundProposal(wb, req);
    if (!bytes.ok) return bytes;
    const read = parseProposal(req.proposal.path, bytes.value);
    if (!read.ok) return read;
    const p = read.value;
    const order = Object.keys(p.records).sort((a, b) => bytewise((p.records[a] as ProposalRecord).narrative, (p.records[b] as ProposalRecord).narrative));
    if (order.length === 0) return invalid(`${req.proposal.path} names no record; a migration converts at least one pair`);
    const ranges = rangesAndExclusions(p, order);
    if (!ranges.ok) return ranges;

    // Records.
    const shape = structural(wb, p, order);
    if (!shape.ok) return shape;
    const unique = uniqueIds(p, order);
    if (!unique.ok) return unique;
    const present = order.map((id) => (p.records[id] as ProposalRecord).control_path).filter((path) => existsSync(join(wb.root, path)));
    if (present.length > 0) return refusal("conflict", "record-exists", `${plural(present.length, "control file")} the proposal would write stand already: ${listed(present)}`);
    const blocking = p.findings.filter((f) => f.severity === "blocking");
    if (blocking.length > 0) {
      return refusal("migration-incomplete", "blocking-finding", `${plural(blocking.length, "blocking finding")} open; each is resolved by a consented repair before plan: ${listed(blocking.map((f) => `${f.class} in ${f.path}`))}`);
    }
    const closed = closure(p, order, sitesOf);
    if (!closed.ok) return closed;
    const accepted = acceptances(p, order);
    if (!accepted.ok) return accepted;

    // Disk: the inventory under the lock, every source against it.
    const own = `${MIGRATIONS_DIR}/${p.migration_id}`;
    const excluded = new Set(p.exclusions);
    const taken = inventory(wb.root, (path) => path === STATE_DIR || excluded.has(path) || under(path, own));
    const byPath = new Map(taken.map((e) => [e.path, e]));
    const sourced = sources(p, order, byPath);
    if (!sourced.ok) return sourced;
    const rewritten = rewrites(wb, p, order);
    if (!rewritten.ok) return rewritten;

    // Cut.
    const chunks = cut(
      p.migration_id,
      order.map((id) => pairWrites(p.records[id] as ProposalRecord)),
    );
    const scheduling = scheduleProblems(wb, p, req, chunks.length, order);
    if (scheduling.length > 0) return invalid(`the operation-id schedule: ${listed(scheduling)}`);
    const ids = p.operation_ids;
    const schedule = {
      plan: ids.plan,
      apply: chunks.map((_, i) => ({ chunk: i + 1, operation_id: ids.apply[i] as string })),
      verify: ids.verify,
      rollback: Array.from({ length: chunks.length + 1 }, (_, k) => ({ chunk: k, operation_id: ids.rollback[k] as string })),
      unassigned: [...ids.apply.slice(chunks.length), ...ids.rollback.slice(chunks.length + 1)],
    };
    const frame = (kind: PartKind) => (n: number, extra: Record<string, unknown>): Record<string, unknown> => ({ schema: PLAN_SCHEMA, part: kind, migration_id: p.migration_id, n, ...extra });
    const recordParts = split(
      order,
      (id) => contribution(`"${id}": ${JSON.stringify(recordEntry(p.records[id] as ProposalRecord), null, 2)}`, 2),
      (n, group) => frame("records")(n, { ...(n === 1 ? { counts: p.counts } : {}), records: Object.fromEntries(group.map((id) => [id, recordEntry(p.records[id] as ProposalRecord)])) }),
    );
    const inventoryParts = split(taken, (e) => contribution(JSON.stringify(e, null, 2), 2), (n, entries) => frame("inventory")(n, { entries }));
    const findingParts = split(p.findings, (f) => contribution(JSON.stringify(f, null, 2), 2), (n, findings) => frame("findings")(n, { findings }));
    const repairParts = split(p.repairs, (r) => contribution(JSON.stringify(r, null, 2), 2), (n, repairs) => frame("repairs")(n, { repairs }));

    const parts: Array<{ entry: Record<string, unknown>; bytes: Buffer; file: Record<string, unknown> }> = [
      ...chunks.map((c, i) => ({ entry: { part: "chunk", n: i + 1, path: chunkPath(p.migration_id, i + 1), sha256: revisionOf(c.bytes), writes: c.writes }, bytes: c.bytes, file: c.file })),
      ...([
        ["records", recordParts],
        ["inventory", inventoryParts],
        ["findings", findingParts],
        ["repairs", repairParts],
      ] as const).flatMap(([kind, list]) => list.map((f, i) => ({ entry: { part: kind, n: i + 1, path: partPath(p.migration_id, kind, i + 1), sha256: revisionOf(f.bytes) }, bytes: f.bytes, file: f.file }))),
    ];
    const index = { schema: PLAN_SCHEMA, part: "index", migration_id: p.migration_id, workbench_id: p.workbench_id, source_layout: p.source_layout, proposal: { path: req.proposal.path, sha256: req.proposal.sha256 }, exclusions: p.exclusions, schedule, parts: parts.map((x) => x.entry) };
    for (const x of parts) {
      const v = ctx.validateResult(PLAN_SCHEMA_ID, x.file, `the plan file ${String(x.entry.path)} is not valid`);
      if (!v.ok) return v;
    }
    const v = ctx.validateResult(PLAN_SCHEMA_ID, index, "the frozen index is not valid");
    if (!v.ok) return v;
    const indexBytes = Buffer.from(serialise(index), "utf-8");
    const writes: PlannedWrite[] = [...parts.map((x) => ({ path: String(x.entry.path), bytes: x.bytes })), { path: indexPath(p.migration_id), bytes: indexBytes }];
    const result = { operation_id: req.operation_id, migration_id: p.migration_id, plan: { path: indexPath(p.migration_id), sha256: revisionOf(indexBytes) }, parts: index.parts, schedule, counts: p.counts };

    // The bound, before anything is published.
    const over = freezeOver(req, writes, result);
    if (over !== null) return refusal("schema-invalid", "plan-too-large", `the freeze of ${p.migration_id} ${over}; nothing is published, and a multi-request freeze is not built (question 50)`);
    return { ok: true, value: { writes, result } };
  };
}

const recordEntry = (r: ProposalRecord): Record<string, string> => ({ kind: r.kind, row: r.row, control: r.control_path, narrative: r.narrative });

/** Why the one freeze intent would pass its bound, or null when it fits. */
export function freezeOver(req: MigrationPlanRequest, writes: readonly PlannedWrite[], result: unknown): string | null {
  const big = writes.filter((w) => w.bytes.byteLength > MAX_RECORD_BYTES);
  if (big.length > 0) return `holds ${plural(big.length, "file")} over the ${MAX_RECORD_BYTES}-byte cap: ${listed(big.map((w) => `${w.path} (${w.bytes.byteLength} bytes)`))}`;
  const total = writes.reduce((n, w) => n + w.bytes.byteLength, 0);
  if (writes.length > FREEZE_MAX_FILES) return `writes ${writes.length} files; one freeze intent holds at most ${FREEZE_MAX_FILES}`;
  if (total > FREEZE_MAX_BYTES) return `writes ${total} bytes; one freeze intent holds at most ${FREEZE_MAX_BYTES}`;
  // The intent the kernel would commit, at the length its timestamp has.
  const intent: Intent = {
    operation_id: req.operation_id,
    op: req.op,
    request_digest: requestDigest(req),
    writes: writes.map((w) => ({ path: w.path, before: null, after: revisionOf(w.bytes) })),
    response: { ok: true, result },
    created_at: new Date(0).toISOString(),
  };
  const intentBytes = Buffer.byteLength(JSON.stringify(intent, null, 2) + "\n", "utf-8");
  if (intentBytes > MAX_RECORD_BYTES) return `needs an intent.json of ${intentBytes} bytes, over the ${MAX_RECORD_BYTES}-byte cap`;
  return null;
}
