// ---------------------------------------------------------------------------
// `migration`, the maintenance run of spec section 8, as the FJ04 contract
// delta amended for Prior `ab9cb59` states it, and as its addendum for Prior
// `a1fb17a` corrects it where the two differ (`codec/fixtures/prior/
// REQUESTS.md`, "FJ04 (the contract delta, amended for ab9cb59)" and "FJ04
// (addendum for a1fb17a)"). The host reads the v12 Markdown and composes a
// mapping proposal; the codec validates it, freezes it and alone writes
// every byte of the run. This file answers its five phases:
//
//   survey   an observation: every entry under the root but `.json-state/`
//            in one of four forms, sorted bytewise by path, the digest of
//            the eligible ones under the whole exclusion allowlist
//            (`eligible_sha256`), and the local state (`local_state`): the
//            pending intents, the fence, and what does not read. No lock, no
//            sweep, no recovery, no stored answer, and no `.json-state/` is
//            created.
//   plan     the proposal under `.json-state/migration/`, bound by the
//            request's sha256 and read strictly at its 16 MiB cap; checked in
//            the contract's order; the inventory taken under the lock; the
//            writes cut into chunks of at most fifty; the plan frozen under
//            `archive/migrations/<migration id>/` as numbered parts and an
//            index, in ONE bounded intent with the index its last write.
//   apply    chunk n of the frozen plan in one intent, originals first; chunk
//            1 first sets the fence, named by its own operation id, in its
//            own sequence.
//   verify   every chunk landed, the whole store re-hashed against the
//            expected final state, the checks run over a json-control view;
//            then the receipt and the manifest, the manifest last, in one
//            intent.
//   rollback chunk k, highest landed first, restoring the originals before
//            removing them; chunk 0 removes the plan files. The first
//            rollback after activation also removes the manifest and the
//            receipt, against the receipt's baseline.
//
// Every writing phase runs the contract's common prefix (the kernel runs the
// lock, the sweep, the recovery of every intent it does not hold and this
// operation id's replay; `prefix` below runs the manifest's diagnosis and the
// held intents) and then its own checks, first refusal wins; the order of
// `plan` is below, and those of the three later phases stand at their plan
// functions (`## Apply`, `## Verify`, `## Rollback`).
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
//   disk     the eligible inventory under the lock (`.json-state/`, this
//            migration's own directory and the selected allowlist entries
//            in their kinds left out), its digest not the proposal's
//            `source_inventory_sha256`: `conflict/source-changed`, naming
//            both (R2); a source not a file at its sha256 there:
//            `conflict/source-changed`; deletion ranges outside the source
//            or not giving the after-hash: `proposal-invalid`;
//   cut      the cut; an operation-id schedule that is not complete, unique
//            and unused, or whose plan id is not this request's:
//            `proposal-invalid`; a freeze over its bound:
//            `schema-invalid/plan-too-large`. Then the one intent.
//
// ## The freeze and its bound (C1)
//
// Chunk files first, then the records, inventory, findings, repairs and
// answers parts (the operation baseline, R3), then the index, all in one
// intent under the request's id with its answer:
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
import { JOURNAL_DIR, answerPath, canonical, journalDir, opsDir, readAnswer, readIntent, requestDigest, type Intent, type StoredAnswer } from "./journal.js";
import type { PlanContext, PlanFunction, Planned, PlannedWrite } from "./kernel.js";
import {
  ARCHIVE_DIR,
  MAINTENANCE_FILE,
  PACKAGE_SCHEMA_ID,
  RECORD_SCHEMA_ID,
  SCHEMA_ID_PREFIX,
  STATE_DIR,
  SUPPORTED_FEATURES,
  WORKBENCH_MANIFEST,
  WORKBENCH_SCHEMA_ID,
  archived,
  controlFiles,
  describeErrors,
  openWorkbench,
  readFence,
  readPair,
  resolveInside,
  revisionOf,
  serialise,
  type Fence,
  type Pair,
  type Result,
  type StoreError,
  type Workbench,
} from "./store.js";
import { MAX_RECORD_BYTES, strictParse } from "./strict-json.js";
import { schemas, validate } from "./validate.js";
import type { MigrationApplyRequest, MigrationPlanRequest, MigrationRollbackRequest, MigrationVerifyRequest, Response } from "./cli/protocol.js";

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

export type EntryKind = InventoryEntry["kind"];

/**
 * Every entry under `root` that `skip` leaves, in the four forms, sorted
 * bytewise by path. `skip` sees the entry's path and its kind by `lstat`; a
 * skipped entry is not descended into, and its bytes are not read. A link is
 * listed by its own text and never followed; a directory carries no size,
 * mode or time. An entry gone between its directory's listing and its
 * `lstat` is absent, as it would be a moment later.
 */
export function inventory(root: string, skip: (path: string, kind: EntryKind) => boolean): InventoryEntry[] {
  const out: InventoryEntry[] = [];
  const walk = (dir: string, rel: string): void => {
    for (const name of readdirSync(dir)) {
      const path = rel === "" ? name : `${rel}/${name}`;
      const abs = join(dir, name);
      let st;
      try {
        st = lstatSync(abs);
      } catch (e) {
        if ((e as NodeJS.ErrnoException).code === "ENOENT") continue;
        throw e;
      }
      const kind: EntryKind = st.isSymbolicLink() ? "link" : st.isDirectory() ? "directory" : st.isFile() ? "file" : "other";
      if (skip(path, kind)) continue;
      if (kind === "link") out.push({ path, kind, target: readlinkSync(abs) });
      else if (kind === "directory") {
        out.push({ path, kind });
        walk(abs, path);
      } else if (kind === "file") {
        const bytes = readFileSync(abs);
        out.push({ path, kind, size: bytes.byteLength, sha256: revisionOf(bytes) });
      } else out.push({ path, kind });
    }
  };
  walk(root, "");
  return out.sort((a, b) => bytewise(a.path, b.path));
}

const under = (path: string, dir: string): boolean => path === dir || path.startsWith(`${dir}/`);

// --- the exclusions (R1) and the eligible inventory (R2) ----------------------------------

/**
 * The fixed, versioned allowlist of root entries a proposal may exclude, each
 * with the one kind it is skipped in (FJ04 addendum for a1fb17a, "Exclusions:
 * a fixed allowlist"): checkout-local files and the host's operational logs,
 * which its own machinery writes during a run. A directory is skipped with
 * everything below it. Names carry no trailing slash: they are root entry
 * names, as `codec/schemas/migration-plan.schema.json` `$defs/exclusions`
 * enumerates them, and a test holds the two equal. There is no wildcard.
 */
export const EXCLUSION_ALLOWLIST: Readonly<Record<string, "file" | "directory">> = {
  ".session-marker": "file",
  ".checkout-id": "file",
  ".cadence-anchors": "file",
  ".check-stamps": "file",
  monitor: "file",
  "orchestrator-events.jsonl": "file",
  ".fusion-setup": "file",
  ".asset-provenance": "file",
  ".guard-state": "directory",
  ".commit-lock": "directory",
};

/**
 * Whether the entry at `path` of `kind` is a selected exclusion: a root entry
 * named in `selected` and on the allowlist, standing as its allowed kind.
 * Under another kind, a link included, it is eligible and compared, so it
 * shows as added or re-kinded; an excluded link is never followed, since it
 * is never excluded.
 */
const excludedRoot = (selected: ReadonlySet<string>, path: string, kind: EntryKind): boolean => !path.includes("/") && selected.has(path) && EXCLUSION_ALLOWLIST[path] === kind;

/** The whole allowlist, the selection `survey`'s `eligible_sha256` is taken under (C9, option 1). */
const WHOLE_ALLOWLIST: ReadonlySet<string> = new Set(Object.keys(EXCLUSION_ALLOWLIST));

/**
 * The eligible entries of a full inventory (one that skipped only
 * `.json-state/`): every entry but the selected exclusions in their kinds and
 * what lies below an excluded directory. `survey` digests this; `plan` and
 * every later phase walk with the same predicate as their skip, so that an
 * excluded directory is never read.
 */
function eligibleOf(entries: readonly InventoryEntry[], selected: ReadonlySet<string>): InventoryEntry[] {
  const skipped = entries.filter((e) => excludedRoot(selected, e.path, e.kind)).map((e) => e.path);
  return entries.filter((e) => !skipped.some((s) => under(e.path, s)));
}

/** The migration phase a committed migration intent belongs to: the phase it records, else read from the answer it carries; null for any other op. */
function phaseOf(intent: Intent): string | null {
  if (intent.op !== "migration") return null;
  if (intent.phase !== undefined) return intent.phase;
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
 * `migration survey`: `{layout, entries, eligible_sha256, local_state}`. An
 * observation, not a snapshot a later phase may trust: `plan` and every chunk
 * take their own inventory under the lock. `eligible_sha256` is the digest
 * of the eligible entries under the whole allowlist, the form `plan` checks
 * the proposal's `source_inventory_sha256` in (R2, C9 option 1). An answer
 * over the 16 MiB channel is refused `schema-invalid/too-large`, never
 * truncated.
 */
export function survey(wb: Workbench): Response {
  const entries = inventory(wb.root, (path) => path === STATE_DIR);
  const eligible_sha256 = inventoryDigest(eligibleOf(entries, WHOLE_ALLOWLIST));
  const response: Response = { ok: true, result: { layout: wb.state, entries, eligible_sha256, local_state: localState(wb) } };
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
  source_inventory_sha256: string;
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

/**
 * The proposal step's checks the schema cannot make: deletion ranges in
 * order, exclusions admissible. An exclusion is admitted only from the
 * allowlist (the schema's enum says the same, and this constant is what the
 * codec skips by), and only where it holds no narrative or control path the
 * plan reads or writes; the protected roots are none of its names.
 */
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
  for (const ex of p.exclusions) {
    if (!Object.hasOwn(EXCLUSION_ALLOWLIST, ex)) problems.push(`the exclusion ${ex} is not on the codec's allowlist (${Object.keys(EXCLUSION_ALLOWLIST).join(", ")})`);
    else if (touched.has(ex)) problems.push(`the exclusion ${ex} holds a narrative or control path the plan reads or writes`);
  }
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

export type PartKind = "records" | "inventory" | "findings" | "repairs" | "answers";

/** The order the freeze writes the parts in, and `readIndex` holds the index to. */
const PART_ORDER: ReadonlyArray<"chunk" | PartKind> = ["chunk", "records", "inventory", "findings", "repairs", "answers"];

/** The skip of every eligible inventory of a migration: `.json-state/`, its own directory, and the selected exclusions in their kinds. */
function eligibleSkip(own: string, exclusions: readonly string[]): (path: string, kind: EntryKind) => boolean {
  const selected = new Set(exclusions);
  return (path, kind) => path === STATE_DIR || under(path, own) || excludedRoot(selected, path, kind);
}

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
  // The baseline and the schedule, read through the index the receipt binds.
  const plan = readIndex(wb, r.plan);
  if (!plan.ok) return unverified(plan.error.detail);
  if (canonical(r.parts) !== canonical(plan.value.index.parts.map((x) => ({ path: x.path, sha256: x.sha256 })))) return unverified(`its parts are not those ${r.plan.path} names`);
  const baseline = readBaseline(wb, plan.value);
  if (!baseline.ok) return unverified(baseline.error.detail);
  const later = laterOperations(wb, plan.value, baseline.value);
  return {
    ok: true,
    value: {
      writes: [],
      result: { operation_id: req.operation_id, migration_id: proposed, no_op: true, receipt: { path: receiptPath, sha256: revisionOf(receiptBytes) }, manifest_revision: manifestRevision, later_operations: later.map((s) => ({ operation_id: s.entry.operation_id, op: s.entry.op })) },
    },
  };
}

// --- the operation baseline (R3) ------------------------------------------------------
//
// `plan` freezes every answer stored before it as the `answers` part: one
// entry `{operation_id, op, request_digest, answer_sha256}` per stored
// answer, `answer_sha256` over the answer file's bytes, bytewise by id. A
// later operation is a stored answer that is neither a baseline entry (all
// four fields equal to one) nor one of this plan's validated scheduled
// answers: stored under an id the schedule assigns to plan, an apply chunk,
// verify or a rollback chunk (the `unassigned` ids are not scheduled), with a
// request digest equal to its reconstructed request's. `laterOperations` is
// that one definition; the no-op's `later_operations` and the rollback audit
// both use it. Whether an answer landed after another is undecidable from
// stored answers, which carry no sequence or time, so nothing here asks it.

/** One stored answer as the baseline freezes it and the audit compares it. */
export interface AnswerEntry {
  operation_id: string;
  op: string;
  request_digest: string;
  answer_sha256: string;
}

/** A stored answer now: its entry, and the answer read, or null with why it does not read. */
interface Stored {
  entry: AnswerEntry;
  answer: StoredAnswer | null;
  unreadable: StoreError | null;
}

/** Every stored answer now, bytewise by id. One that does not read is kept with `op: "unreadable"`, and is no baseline entry. */
function storedNow(wb: Workbench): Stored[] {
  let names: string[] = [];
  try {
    names = readdirSync(opsDir(wb));
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code !== "ENOENT") throw e;
  }
  const out: Stored[] = [];
  for (const name of names.filter((n) => !n.startsWith(".") && n.endsWith(".json")).sort(bytewise)) {
    const id = name.slice(0, -".json".length);
    let bytes: Buffer;
    try {
      bytes = readFileSync(answerPath(wb, id));
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code === "ENOENT") continue;
      throw e;
    }
    const a = readAnswer(wb, id);
    const answer = a.ok ? a.value : null;
    const entry = answer === null ? { operation_id: id, op: "unreadable", request_digest: "", answer_sha256: sha(bytes) } : { operation_id: id, op: answer.op, request_digest: answer.request_digest, answer_sha256: sha(bytes) };
    out.push({ entry, answer, unreadable: a.ok ? null : a.error });
  }
  return out;
}

/** The plan reference a scheduled request carries: the index by path and hash. */
type PlanRef = { path: string; sha256: string };

/**
 * The request each scheduled id was sent as, rebuilt without `workbench`:
 * `plan` from the index's `proposal`, every other phase from the index the
 * request binds. The `unassigned` ids are not scheduled.
 */
function scheduledRequests(index: Pick<Index, "schedule" | "proposal">, ref: PlanRef): Map<string, Record<string, unknown>> {
  const s = index.schedule;
  const out = new Map<string, Record<string, unknown>>();
  out.set(s.plan, { op: "migration", operation_id: s.plan, phase: "plan", proposal: index.proposal });
  for (const e of s.apply) out.set(e.operation_id, applyRequest(ref, e));
  out.set(s.verify, { op: "migration", operation_id: s.verify, phase: "verify", plan: ref });
  for (const e of s.rollback) out.set(e.operation_id, rollbackRequest(ref, e));
  return out;
}

const applyRequest = (ref: PlanRef, e: ScheduleEntry): Record<string, unknown> => ({ op: "migration", operation_id: e.operation_id, phase: "apply", plan: ref, chunk: e.chunk });
const rollbackRequest = (ref: PlanRef, e: ScheduleEntry): Record<string, unknown> => ({ op: "migration", operation_id: e.operation_id, phase: "rollback", plan: ref, chunk: e.chunk });

/**
 * Whether `digest` is the digest of `rebuilt` in one of its two forms
 * (addendum, "Reconstruction and the `workbench` field", departure 5):
 * `workbench` absent, or equal to `root`, the root the codec resolved for the
 * request being served. A request that spelled its workbench otherwise
 * misses in both, and every miss refuses where a match is required.
 */
export function reconstructs(digest: string, rebuilt: Readonly<Record<string, unknown>>, root: string): boolean {
  const bare = { ...rebuilt };
  delete bare.workbench;
  return digest === requestDigest(bare) || digest === requestDigest({ ...bare, workbench: root });
}

/** The stored answers neither the baseline nor this plan's validated schedule accounts for: the one definition of a later operation. */
function laterOperations(wb: Workbench, plan: Plan, baseline: readonly AnswerEntry[], now: readonly Stored[] = storedNow(wb)): Stored[] {
  const base = new Set(baseline.map((e) => canonical(e)));
  const scheduled = scheduledRequests(plan.index, plan.ref);
  return now.filter((s) => {
    if (base.has(canonical(s.entry))) return false;
    const rebuilt = scheduled.get(s.entry.operation_id);
    return rebuilt === undefined || s.answer === null || !reconstructs(s.answer.request_digest, rebuilt, wb.root);
  });
}

/** The baseline the index binds: the `answers` parts' entries, in order, each part read at its hash; out of bytewise order or repeated is `plan-file-changed`. */
function readBaseline(wb: Workbench, plan: Plan): Result<AnswerEntry[]> {
  const parts = readParts(wb, plan, "answers");
  if (!parts.ok) return parts;
  const entries = parts.value.flatMap((p) => p.entries as AnswerEntry[]);
  for (let i = 1; i < entries.length; i++) {
    if (bytewise((entries[i - 1] as AnswerEntry).operation_id, (entries[i] as AnswerEntry).operation_id) >= 0) return changed(`the answers parts of ${plan.ref.path} list ${(entries[i] as AnswerEntry).operation_id} out of bytewise order or twice`);
  }
  return { ok: true, value: entries };
}

// --- plan ----------------------------------------------------------------------------

/**
 * Plan files standing for any migration: an index, or a file under `chunks/`
 * or `parts/`. A directory alone is none: rollback chunk 0 removes every plan
 * file and no directory, so a completely rolled-back migration leaves empty
 * ones behind, and they plan nothing.
 */
function standingPlans(root: string): string[] {
  const dir = join(root, MIGRATIONS_DIR);
  let ids: string[];
  try {
    ids = readdirSync(dir);
  } catch {
    return [];
  }
  const holdsFile = (path: string): boolean => {
    try {
      return inventory(path, () => false).some((e) => e.kind !== "directory");
    } catch {
      return false;
    }
  };
  return ids.filter((id) => existsSync(join(dir, id, "plan.json")) || ["chunks", "parts"].some((n) => holdsFile(join(dir, id, n)))).sort(bytewise);
}

/**
 * The common prefix's steps 5 and 6 under the lock, after the kernel's lock,
 * sweep, recovery and replay: a manifest that does not read or validate
 * answers its own diagnosis, and a held intent (any other migration intent, or
 * a committed `initialize`) is `conflict/intent-pending`, finished by its own
 * request and never by this one. Answers the workbench as it stands now.
 */
function prefix(ctx: PlanContext): Result<Workbench> {
  const now = openWorkbench(ctx.wb.root);
  if (!now.ok) return now;
  if (now.value.state === "unsupported" && now.value.diagnosis !== null) return { ok: false, error: now.value.diagnosis };
  const held = ctx.blocked.filter((b) => b.held !== undefined);
  if (held.length > 0) {
    return refusal("conflict", "intent-pending", `${plural(held.length, "intent")} pending for ${held.length === 1 ? "its" : "their"} own request: ${listed(held.map((b) => `${b.held} ${b.operation_id} in ${STATE_DIR}/${JOURNAL_DIR}/${b.operation_id}`))}; it is finished by that request, never by this one`);
  }
  return now;
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
    const now = prefix(ctx);
    if (!now.ok) return now;
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

    // Disk: the eligible inventory under the lock, its digest against the
    // one the host observed (R2), then every source against it.
    const taken = inventory(wb.root, eligibleSkip(`${MIGRATIONS_DIR}/${p.migration_id}`, p.exclusions));
    const byPath = new Map(taken.map((e) => [e.path, e]));
    const observed = inventoryDigest(taken);
    if (observed !== p.source_inventory_sha256) {
      // A digest names no entry; a narrative the proposal reads that changed is named beside it.
      const named = sources(p, order, byPath);
      return refusal("conflict", "source-changed", `the eligible inventory of ${wb.root} digests to ${observed} under the lock, and the proposal was composed over ${p.source_inventory_sha256}: an entry was added, removed, re-kinded or rewritten since the survey it was composed from${named.ok ? "" : `; among them, ${named.error.detail}`}`);
    }
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
    // The operation baseline (R3): every answer stored before this plan. One that does not read has no entry to freeze.
    const stored = storedNow(wb);
    const unreadable = stored.find((s) => s.unreadable !== null);
    if (unreadable !== undefined) return { ok: false, error: unreadable.unreadable as StoreError };
    const answerParts = split(
      stored.map((s) => s.entry),
      (e) => contribution(JSON.stringify(e, null, 2), 2),
      (n, entries) => frame("answers")(n, { entries }),
    );

    const parts: Array<{ entry: Record<string, unknown>; bytes: Buffer; file: Record<string, unknown> }> = [
      ...chunks.map((c, i) => ({ entry: { part: "chunk", n: i + 1, path: chunkPath(p.migration_id, i + 1), sha256: revisionOf(c.bytes), writes: c.writes }, bytes: c.bytes, file: c.file })),
      ...([
        ["records", recordParts],
        ["inventory", inventoryParts],
        ["findings", findingParts],
        ["repairs", repairParts],
        ["answers", answerParts],
      ] as const).flatMap(([kind, list]) => list.map((f, i) => ({ entry: { part: kind, n: i + 1, path: partPath(p.migration_id, kind, i + 1), sha256: revisionOf(f.bytes) }, bytes: f.bytes, file: f.file }))),
    ];
    const index = {
      schema: PLAN_SCHEMA,
      part: "index",
      migration_id: p.migration_id,
      workbench_id: p.workbench_id,
      source_layout: p.source_layout,
      proposal: { path: req.proposal.path, sha256: req.proposal.sha256 },
      source_inventory_sha256: p.source_inventory_sha256,
      exclusions: p.exclusions,
      schedule,
      parts: parts.map((x) => x.entry),
    };
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

// =====================================================================================
// The frozen plan, read back (every later phase)
// =====================================================================================

interface ScheduleEntry {
  chunk: number;
  operation_id: string;
}

interface Schedule {
  plan: string;
  apply: ScheduleEntry[];
  verify: string;
  rollback: ScheduleEntry[];
  unassigned: string[];
}

interface PartEntry {
  part: "chunk" | PartKind;
  n: number;
  path: string;
  sha256: string;
  writes?: number;
}

interface Index {
  migration_id: string;
  workbench_id: string;
  source_layout: string;
  proposal: { path: string; sha256: string };
  source_inventory_sha256: string;
  exclusions: string[];
  schedule: Schedule;
  parts: PartEntry[];
}

interface ChunkFile {
  chunk: number;
  writes: ChunkWrite[];
}

/** The index as the request binds it, where it stands, and the parts it names, read lazily and each checked against its hash. */
interface Plan {
  ref: { path: string; sha256: string };
  index: Index;
  /** `archive/migrations/<id>`, workbench-relative. */
  own: string;
  /** The number of write chunks. */
  chunks: number;
}

const changed = <T>(detail: string): Result<T> => refusal("conflict", "plan-file-changed", detail);
const outOfOrder = <T>(detail: string): Result<T> => refusal("migration-incomplete", "chunk-out-of-order", detail);
const sha = (bytes: Uint8Array): string => revisionOf(bytes);

/** The bytes of the regular file at `path` (never through a link), or null for anything else, an absent entry included. */
function regularBytes(wb: Workbench, path: string): Buffer | null {
  const abs = resolveInside(wb, path);
  if (!abs.ok) return null;
  try {
    return lstatSync(abs.value).isFile() ? readFileSync(abs.value) : null;
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw e;
  }
}

/** Strictly parsed and valid under the plan schema, or why not. */
function planFile(path: string, bytes: Buffer): { ok: true; value: Record<string, unknown> } | { ok: false; why: string } {
  const parsed = strictParse(bytes);
  if (!parsed.ok) return { ok: false, why: `${parsed.reason}: ${parsed.detail}` };
  const v = validate(PLAN_SCHEMA_ID, parsed.value);
  if (!v.ok) return { ok: false, why: v.class === "schema-invalid" ? describeErrors(v.errors) : `no schema ${v.schemaId}` };
  return { ok: true, value: parsed.value as Record<string, unknown> };
}

/**
 * The index the request binds: a regular file at `plan.sha256`, valid, naming
 * the migration its path names, its parts in the order the freeze writes them
 * (chunks 1 to C, then records, inventory, findings, repairs and answers,
 * each from 1)
 * and a schedule of one apply id per chunk and one rollback id per chunk and
 * chunk 0. Anything else is `conflict/plan-file-changed`: no part can be
 * substituted, reordered or taken from another plan.
 */
function readIndex(wb: Workbench, ref: { path: string; sha256: string }): Result<Plan> {
  const bytes = regularBytes(wb, ref.path);
  if (bytes === null) return changed(`${ref.path} is no regular file in ${wb.root}; the request binds it at ${ref.sha256}`);
  if (sha(bytes) !== ref.sha256) return changed(`${ref.path} is ${sha(bytes)}; the request binds ${ref.sha256}`);
  const read = planFile(ref.path, bytes);
  if (!read.ok) return changed(`${ref.path}: ${read.why}`);
  const index = read.value as unknown as Index & { part: string };
  const own = dirname(ref.path);
  if (index.part !== "index" || indexPath(index.migration_id) !== ref.path) return changed(`${ref.path} is no index of the migration its path names`);
  const chunks = index.parts.filter((x) => x.part === "chunk").length;
  let at = 0;
  for (const kind of PART_ORDER) {
    let n = 0;
    while (at < index.parts.length && (index.parts[at] as PartEntry).part === kind) {
      const x = index.parts[at] as PartEntry;
      n += 1;
      const path = kind === "chunk" ? chunkPath(index.migration_id, n) : partPath(index.migration_id, kind, n);
      if (x.n !== n || x.path !== path) return changed(`${ref.path} names ${x.path} as ${kind} ${x.n}, out of the order the freeze writes`);
      at += 1;
    }
    if (n === 0 && kind !== "chunk") return changed(`${ref.path} names no ${kind} part`);
  }
  if (at !== index.parts.length) return changed(`${ref.path} names its parts out of the order the freeze writes`);
  const s = index.schedule;
  const applyOk = s.apply.length === chunks && s.apply.every((e, i) => e.chunk === i + 1);
  const rollbackOk = s.rollback.length === chunks + 1 && s.rollback.every((e, i) => e.chunk === i);
  if (chunks === 0 || !applyOk || !rollbackOk) return changed(`${ref.path} schedules ${s.apply.length} apply and ${s.rollback.length} rollback ids for ${chunks} chunks`);
  return { ok: true, value: { ref, index, own, chunks } };
}

/** One part the index names, at its hash, valid, of its kind, number and migration. */
function readPart(wb: Workbench, plan: Plan, entry: PartEntry): Result<Record<string, unknown>> {
  const bytes = regularBytes(wb, entry.path);
  if (bytes === null) return changed(`${entry.path}, named by ${plan.ref.path}, is no regular file`);
  if (sha(bytes) !== entry.sha256) return changed(`${entry.path} is ${sha(bytes)}; ${plan.ref.path} names ${entry.sha256}`);
  const read = planFile(entry.path, bytes);
  if (!read.ok) return changed(`${entry.path}: ${read.why}`);
  const v = read.value;
  const n = entry.part === "chunk" ? v.chunk : v.n;
  if (v.part !== entry.part || n !== entry.n || v.migration_id !== plan.index.migration_id) return changed(`${entry.path} is not ${entry.part} ${entry.n} of ${plan.index.migration_id}`);
  return { ok: true, value: v };
}

/** Chunks 1 to `last`, each read and checked. */
function readChunks(wb: Workbench, plan: Plan, last: number): Result<ChunkFile[]> {
  const out: ChunkFile[] = [];
  for (const entry of plan.index.parts.filter((x) => x.part === "chunk" && x.n <= last)) {
    const r = readPart(wb, plan, entry);
    if (!r.ok) return r;
    out.push(r.value as unknown as ChunkFile);
  }
  return { ok: true, value: out };
}

/** Every part of one kind, read and checked, in the index's order. */
function readParts(wb: Workbench, plan: Plan, kind: PartKind): Result<Array<Record<string, unknown>>> {
  const out: Array<Record<string, unknown>> = [];
  for (const entry of plan.index.parts.filter((x) => x.part === kind)) {
    const r = readPart(wb, plan, entry);
    if (!r.ok) return r;
    out.push(r.value);
  }
  return { ok: true, value: out };
}

/** The frozen inventory, the inventory parts' entries in order, digesting to the index's `source_inventory_sha256` (R2), else `plan-file-changed`. */
function frozenInventory(wb: Workbench, plan: Plan): Result<InventoryEntry[]> {
  const parts = readParts(wb, plan, "inventory");
  if (!parts.ok) return parts;
  const entries = parts.value.flatMap((p) => p.entries as InventoryEntry[]);
  const digest = inventoryDigest(entries);
  if (digest !== plan.index.source_inventory_sha256) return changed(`the inventory parts of ${plan.ref.path} digest to ${digest}; the index froze ${plan.index.source_inventory_sha256}`);
  return { ok: true, value: entries };
}

// --- this migration's own directory ----------------------------------------------------

/** What may stand in `archive/migrations/<id>/` beside the plan files at a point of the run. */
interface OwnExpected {
  /** The originals of these chunks stand, each at its source sha256; no other original does. */
  originals: readonly ChunkFile[];
  receipt: boolean;
  rollback: boolean;
}

/**
 * This migration's own directory, which the eligible inventory leaves out
 * and the plan checks instead: every plan file the index names at its hash
 * and none it does not (`plan-file-changed`), exactly the originals `expect`
 * names at their hashes, the receipt and `rollback.json` only where admitted,
 * and nothing else (`disk`, the phase's own reason). Directories are not
 * judged: the run creates some and removes none.
 */
function ownDirectory(wb: Workbench, plan: Plan, expect: OwnExpected, disk: (detail: string) => Result<void>): Result<void> {
  const want = new Map<string, { sha256: string; plan: boolean }>();
  want.set(plan.ref.path, { sha256: plan.ref.sha256, plan: true });
  for (const x of plan.index.parts) want.set(x.path, { sha256: x.sha256, plan: true });
  for (const c of expect.originals) for (const w of c.writes) if (w.kind === "original") want.set(w.path, { sha256: w.after_sha256, plan: false });
  const abs = join(wb.root, plan.own);
  let entries: InventoryEntry[] = [];
  try {
    entries = inventory(abs, () => false);
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code !== "ENOENT") throw e;
  }
  const seen = new Set<string>();
  for (const e of entries) {
    if (e.kind === "directory") continue;
    const path = `${plan.own}/${e.path}`;
    if ((e.path === "receipt.json" && expect.receipt) || (e.path === "rollback.json" && expect.rollback)) continue;
    const w = want.get(path);
    if (w === undefined) {
      const planArea = e.path === "plan.json" || e.path.startsWith("chunks/") || e.path.startsWith("parts/");
      return planArea ? changed(`${path} stands and ${plan.ref.path} does not name it`) : disk(`${path} stands, and this migration holds no such file at this point of its run`);
    }
    seen.add(path);
    if (e.kind !== "file" || e.sha256 !== w.sha256) {
      const what = e.kind === "file" ? e.sha256 : `a ${e.kind}`;
      return w.plan ? changed(`${path} is ${what}; ${plan.ref.path} names ${w.sha256}`) : disk(`${path} is ${what}; the original it holds is ${w.sha256}`);
    }
  }
  for (const [path, w] of want) if (!seen.has(path)) return w.plan ? changed(`${path}, named by ${plan.ref.path}, is missing`) : disk(`${path} is missing; it holds the original at ${w.sha256}`);
  return { ok: true, value: undefined };
}

// --- the eligible inventory and the expected state -------------------------------------------

/** The eligible inventory now: every entry but `.json-state/`, this migration's own directory and the frozen exclusions in their kinds. */
function eligible(wb: Workbench, plan: Plan): InventoryEntry[] {
  return inventory(wb.root, eligibleSkip(plan.own, plan.index.exclusions));
}

/** The control bytes a control write holds, or why they do not hash as the chunk says. */
function controlBytes(w: Extract<ChunkWrite, { kind: "control" }>): Result<Buffer> {
  const bytes = Buffer.from(serialise(w.control), "utf-8");
  if (sha(bytes) !== w.after_sha256) return changed(`the control ${w.path} serialises to ${sha(bytes)}; its chunk names ${w.after_sha256}`);
  return { ok: true, value: bytes };
}

/**
 * The frozen inventory with `chunks` applied: each control a file at its
 * after-hash, each rewritten narrative a file at its after-hash and its
 * source size less the deleted bytes. Originals lie in this migration's own
 * directory, which no eligible inventory holds.
 */
function expectedState(frozen: readonly InventoryEntry[], chunks: readonly ChunkFile[]): Result<Map<string, InventoryEntry>> {
  const out = new Map(frozen.map((e) => [e.path, e]));
  for (const c of chunks) {
    for (const w of c.writes) {
      if (w.kind === "control") {
        const bytes = controlBytes(w);
        if (!bytes.ok) return bytes;
        out.set(w.path, { path: w.path, kind: "file", size: bytes.value.byteLength, sha256: w.after_sha256 });
      } else if (w.kind === "rewrite") {
        const source = out.get(w.path);
        if (source === undefined || source.kind !== "file" || source.sha256 !== w.source_sha256) return changed(`chunk ${c.chunk} rewrites ${w.path} from ${w.source_sha256}, which the frozen inventory does not hold`);
        out.set(w.path, { path: w.path, kind: "file", size: source.size - w.deletions.reduce((n, d) => n + d.length, 0), sha256: w.after_sha256 });
      }
    }
  }
  return { ok: true, value: out };
}

const describe = (e: InventoryEntry): string => (e.kind === "file" ? `a file of ${e.size} bytes at ${e.sha256}` : e.kind === "link" ? `a link to ${JSON.stringify(e.target)}` : `a ${e.kind}`);
const sameEntry = (a: InventoryEntry, b: InventoryEntry): boolean => canonical(a) === canonical(b);

/**
 * The first difference of `actual` from `expected`, bytewise by path: an
 * entry added, removed, of another kind or link text, or at other bytes. The
 * directories `archive/` and `archive/migrations/` the freeze created where
 * the frozen inventory lacked them are no difference: the run creates them
 * and removes no directory.
 */
function firstDifference(actual: readonly InventoryEntry[], expected: ReadonlyMap<string, InventoryEntry>): string | null {
  const created = new Set([ARCHIVE_DIR, MIGRATIONS_DIR].filter((d) => !expected.has(d)));
  const problems: Array<[string, string]> = [];
  const seen = new Set<string>();
  for (const e of actual) {
    seen.add(e.path);
    const want = expected.get(e.path);
    if (want === undefined) {
      if (!(e.kind === "directory" && created.has(e.path))) problems.push([e.path, `${e.path} was added: ${describe(e)}`]);
    } else if (!sameEntry(e, want)) problems.push([e.path, `${e.path} is ${describe(e)}, expected ${describe(want)}`]);
  }
  for (const [path, want] of expected) if (!seen.has(path)) problems.push([path, `${path} was removed: expected ${describe(want)}`]);
  if (problems.length === 0) return null;
  problems.sort((a, b) => bytewise(a[0], b[0]));
  return (problems[0] as [string, string])[1] + (problems.length > 1 ? ` (and ${problems.length - 1} more)` : "");
}

/** `sha256` over the canonical JSON of an inventory, entries in bytewise path order: the receipt's `after_inventory_sha256`. */
export const inventoryDigest = (entries: readonly InventoryEntry[]): string => sha(Buffer.from(canonical([...entries].sort((a, b) => bytewise(a.path, b.path))), "utf-8"));

// --- progress ------------------------------------------------------------------------------

/** One stored answer under `id`, or null; an answer that does not read is its own refusal. */
function stored(wb: Workbench, id: string): Result<StoredAnswer | null> {
  return readAnswer(wb, id);
}

/**
 * The chunks landed now: chunk n is landed when apply n's answer is stored
 * and rollback n's is not, derived from this migration's scheduled ids alone.
 */
function landedChunks(wb: Workbench, plan: Plan): Result<number[]> {
  const out: number[] = [];
  for (let n = 1; n <= plan.chunks; n++) {
    const applied = stored(wb, (plan.index.schedule.apply[n - 1] as ScheduleEntry).operation_id);
    if (!applied.ok) return applied;
    const undone = stored(wb, (plan.index.schedule.rollback[n] as ScheduleEntry).operation_id);
    if (!undone.ok) return undone;
    if (applied.value !== null && undone.value === null) out.push(n);
  }
  return { ok: true, value: out };
}

const chunkList = (ns: readonly number[]): string => (ns.length === 0 ? "none" : ns.join(", "));
const firstChunks = (n: number): number[] => Array.from({ length: n }, (_, i) => i + 1);
const sameList = (a: readonly number[], b: readonly number[]): boolean => a.length === b.length && a.every((x, i) => x === b[i]);

/** The fence chunk 1 sets: its own operation id. */
const chunkOneFence = (plan: Plan): string => (plan.index.schedule.apply[0] as ScheduleEntry).operation_id;

function fenceNow(wb: Workbench): Result<Fence | null> {
  const fence = readFence(wb);
  if (!fence.ok) return refusal("conflict", "maintenance-active", fence.error.detail);
  return fence;
}

const fenceRefused = <T>(standing: Fence | null, wanted: string): Result<T> =>
  refusal(
    "conflict",
    "maintenance-active",
    standing === null
      ? `no maintenance fence stands in ${STATE_DIR}/${MAINTENANCE_FILE}; this phase runs under the fence ${wanted}`
      : `the fence in ${STATE_DIR}/${MAINTENANCE_FILE} is ${standing.operation_id} since ${standing.since}; this phase runs under ${wanted} only`,
  );

/** The answer of a manifest standing where this phase admits none. */
const manifestPresent = <T>(wb: Workbench, phase: string): Result<T> =>
  refusal("conflict", "manifest-present", `${wb.root} holds ${WORKBENCH_MANIFEST}; migration ${phase} runs on a legacy store only (a replay of an answer stored earlier is answered whatever the store's state)`);

/** The phase's source reason for a disk difference. */
const sourceChanged = <T>(detail: string): Result<T> => refusal("conflict", "source-changed", detail);
const afterStateChanged = <T>(detail: string): Result<T> => refusal("conflict", "after-state-changed", detail);

/** The bytes of the file a chunk write reads from: the narrative, a regular file at its source sha256. */
function narrativeAt(wb: Workbench, path: string, hash: string): Result<Buffer> {
  const bytes = regularBytes(wb, path);
  if (bytes === null || sha(bytes) !== hash) return sourceChanged(`${path} is ${bytes === null ? "no regular file" : sha(bytes)}; the plan reads it at ${hash}`);
  return { ok: true, value: bytes };
}

// =====================================================================================
// ## Apply
//
// `apply {chunk: n}` after the prefix, first refusal wins:
//
//   state    a manifest: `conflict/manifest-present` (a replay after
//            activation was answered by the kernel before this);
//   plan     the index at the request's sha256, the inventory parts and
//            chunks 1 to n at the index's: `conflict/plan-file-changed`;
//   id       n beyond the last chunk: `migration-incomplete/
//            chunk-out-of-order`; an id that is not the index's apply id for
//            n: `conflict/operation-id-unscheduled`;
//   fence    for n = 1 none may stand but chunk 1's own, after a crash
//            between fence and intent; for n > 1 chunk 1's must stand:
//            `conflict/maintenance-active`;
//   progress the chunks landed are exactly 1 to n - 1:
//            `migration-incomplete/chunk-out-of-order`;
//   disk     the whole eligible inventory against the frozen inventory with
//            chunks 1 to n - 1 applied, and this migration's own directory
//            against the plan: `conflict/source-changed` naming the first
//            difference (for n = 1 the full recheck before chunk 1);
//   writes   a staged file over 1 MiB: `schema-invalid/too-large`, before the
//            fence. Then, for n = 1, the fence in its own sequence; then one
//            intent with chunk n's writes, originals first.
//
// The answer is `{ok: true, result, revisions}`, the established envelope
// (C15): `result` is `{operation_id, migration_id, chunk, fence, writes:
// [{path, kind}]}`, `fence` the standing fence `{operation_id, since}`, and
// `revisions` beside it the stored-bytes revision of each control file the
// chunk writes.
// =====================================================================================

export interface PhaseOptions {
  /** The clock a fence's `since` is read from. */
  now: () => number;
}

export function migrationApply(req: MigrationApplyRequest, options: PhaseOptions): PlanFunction {
  return (ctx: PlanContext): Result<Planned> => {
    const { wb } = ctx;
    const now = prefix(ctx);
    if (!now.ok) return now;
    if (now.value.state === "json-control") return manifestPresent(wb, "apply");
    const read = readIndex(wb, req.plan);
    if (!read.ok) return read;
    const plan = read.value;
    const frozen = frozenInventory(wb, plan);
    if (!frozen.ok) return frozen;
    const n = req.chunk;
    const chunks = readChunks(wb, plan, n);
    if (!chunks.ok) return chunks;
    if (n > plan.chunks) return outOfOrder(`${plan.index.migration_id} has ${plural(plan.chunks, "chunk")}; there is no chunk ${n} to apply`);
    const scheduled = (plan.index.schedule.apply[n - 1] as ScheduleEntry).operation_id;
    if (req.operation_id !== scheduled) return refusal("conflict", "operation-id-unscheduled", `${plan.ref.path} schedules ${scheduled} for apply chunk ${n}, not ${req.operation_id}`);

    const f1 = chunkOneFence(plan);
    const fence = fenceNow(wb);
    if (!fence.ok) return fence;
    const standing = fence.value;
    if (n === 1 ? standing !== null && standing.operation_id !== f1 : standing === null || standing.operation_id !== f1) return fenceRefused(standing, f1);

    const landed = landedChunks(wb, plan);
    if (!landed.ok) return landed;
    if (!sameList(landed.value, firstChunks(n - 1))) return outOfOrder(`apply chunk ${n} follows chunks 1 to ${n - 1}; the chunks landed are ${chunkList(landed.value)}`);

    const before = chunks.value.slice(0, n - 1);
    const expected = expectedState(frozen.value, before);
    if (!expected.ok) return expected;
    const diff = firstDifference(eligible(wb, plan), expected.value);
    if (diff !== null) return sourceChanged(`the store is not as chunk ${n} of ${plan.index.migration_id} expects it: ${diff}`);
    const own = ownDirectory(wb, plan, { originals: before, receipt: false, rollback: false }, sourceChanged);
    if (!own.ok) return own;

    const chunk = chunks.value[n - 1] as ChunkFile;
    const writes: PlannedWrite[] = [];
    const revisions: Record<string, string> = {};
    for (const w of chunk.writes) {
      if (w.kind === "original") {
        const bytes = narrativeAt(wb, w.from, w.after_sha256);
        if (!bytes.ok) return bytes;
        writes.push({ path: w.path, bytes: bytes.value });
      } else if (w.kind === "control") {
        const bytes = controlBytes(w);
        if (!bytes.ok) return bytes;
        writes.push({ path: w.path, bytes: bytes.value });
        revisions[w.path] = w.after_sha256;
      } else {
        const source = narrativeAt(wb, w.path, w.source_sha256);
        if (!source.ok) return source;
        const out = applyDeletions(source.value, w.deletions);
        if (!out.ok || sha(out.bytes) !== w.after_sha256) return changed(`chunk ${n} rewrites ${w.path} to ${w.after_sha256}, which its deletions do not give`);
        writes.push({ path: w.path, bytes: out.bytes });
      }
    }
    const big = writes.filter((w) => w.bytes.byteLength > MAX_RECORD_BYTES);
    if (big.length > 0) return refusal("schema-invalid", "too-large", `chunk ${n} writes ${listed(big.map((w) => `${w.path} (${w.bytes.byteLength} bytes)`))}, over the journal's ${MAX_RECORD_BYTES}-byte cap; nothing is written`);

    const fenceFirst: Fence | undefined = n === 1 && standing === null ? { operation_id: f1, since: new Date(options.now()).toISOString() } : undefined;
    const answerFence = (fenceFirst ?? standing) as Fence;
    const result = {
      operation_id: req.operation_id,
      migration_id: plan.index.migration_id,
      chunk: n,
      fence: { operation_id: answerFence.operation_id, since: answerFence.since },
      writes: chunk.writes.map((w) => ({ path: w.path, kind: w.kind })),
    };
    // The established envelope (C15): `revisions` beside `result`, never inside it.
    return { ok: true, value: { writes, result, revisions, ...(fenceFirst !== undefined ? { fenceFirst } : {}) } };
  };
}

// =====================================================================================
// ## Verify
//
// `verify` after the prefix, first refusal wins:
//
//   state    a manifest: `conflict/manifest-present`;
//   plan     the index and every part, the inventory parts digesting to the
//            index's `source_inventory_sha256`: `conflict/plan-file-changed`;
//   id       not the index's verify id: `conflict/operation-id-unscheduled`;
//   fence    not chunk 1's: `conflict/maintenance-active`;
//   progress a chunk not landed: `migration-incomplete/chunks-missing`;
//   disk     the whole eligible inventory against the expected final state,
//            and the own directory against the plan: `conflict/
//            source-changed`;
//   checks   pairs, ids, the `depends_on` graph, references, acceptance and
//            the closure, then `validate` and `reconcile` over a json-control
//            view of the store (the manifest verify would write, not yet
//            written): any failure is `migration-incomplete/check-failed`
//            naming the check, and no receipt is written;
//   writes   one intent: the receipt, then `workbench.json`, its last write.
//
// The receipt's `after_inventory_sha256` is the digest of the activated tree
// (C11): the eligible inventory verify compared plus the `workbench.json`
// entry of the manifest bytes the same intent writes.
// =====================================================================================

/** What `cli/ops.ts` lends the checks: the reference sites, and `validate` and `reconcile` over a view. */
export interface CheckHooks {
  sitesOf: SitesOf;
  validate(view: Workbench): Response;
  reconcile(view: Workbench): Response;
}

interface Check {
  name: string;
  checked: number;
  problems: string[];
}

interface RecordRow {
  kind: string;
  row: string;
  control: string;
  narrative: string;
}

/** The manifest a migration activates: the store's identity, the one feature, and the receipt by path. */
function manifestOf(index: Index, receipt: string): Record<string, unknown> {
  return { schema: WORKBENCH_SCHEMA_ID.slice(SCHEMA_ID_PREFIX.length), id: index.workbench_id, required_features: [...SUPPORTED_FEATURES], migration: { id: index.migration_id, source_layout: index.source_layout, receipt }, extensions: {} };
}

const receiptPath = (migrationId: string): string => `${MIGRATIONS_DIR}/${migrationId}/receipt.json`;
const rollbackPath = (migrationId: string): string => `${MIGRATIONS_DIR}/${migrationId}/rollback.json`;

/** The checks of `verify` over the json-control `view`, each with what it covered and what failed. */
function runChecks(view: Workbench, index: Index, rows: ReadonlyMap<string, RecordRow>, after: ReadonlyMap<string, string>, hooks: CheckHooks): Check[] {
  const checks: Check[] = [];
  const pairs: Check = { name: "pairs", checked: rows.size, problems: [] };
  const read = new Map<string, Pair>();
  for (const [id, row] of rows) {
    const r = readPair(view, row.control);
    if (!r.ok) {
      pairs.problems.push(`${row.control}: ${r.error.reason}`);
      continue;
    }
    read.set(id, r.value);
    const c = r.value.control;
    if (c.id !== id || r.value.kind !== row.kind) pairs.problems.push(`${row.control} is ${r.value.kind} ${String(c.id)}; the plan converts ${row.kind} ${id}`);
    const narrative = r.value.narrative;
    if (narrative === null || narrative.path !== row.narrative || narrative.sha256 !== after.get(row.narrative)) pairs.problems.push(`${row.control} names ${JSON.stringify(narrative)}; the plan leaves ${row.narrative} at ${String(after.get(row.narrative))}`);
  }
  checks.push(pairs);

  const files = controlFiles(view, view.root);
  const ids: Check = { name: "ids", checked: files.length, problems: [] };
  const carriers = new Map<string, string[]>();
  for (const path of files) {
    const bytes = regularBytes(view, path);
    const parsed = bytes === null ? null : strictParse(bytes);
    const control = parsed !== null && parsed.ok && isObject(parsed.value) ? parsed.value : null;
    if (control === null || typeof control.id !== "string") {
      ids.problems.push(`${path} carries no id`);
      continue;
    }
    if (control.workbench_id !== index.workbench_id) ids.problems.push(`${path} carries workbench_id ${String(control.workbench_id)}`);
    carriers.set(control.id, [...(carriers.get(control.id) ?? []), path]);
  }
  for (const [id, paths] of carriers) if (paths.length > 1) ids.problems.push(`${id} is carried by ${paths.join(", ")}`);
  if (carriers.has(index.workbench_id)) ids.problems.push(`${index.workbench_id} is the workbench id and a record's`);
  for (const [id, row] of rows) if (!(carriers.get(id) ?? []).includes(row.control)) ids.problems.push(`${id} is carried by no control file at ${row.control}`);
  checks.push(ids);

  const reconciled = hooks.reconcile(view);
  const report = reconciled.ok ? (reconciled.result as Record<string, unknown>) : null;
  const deps = report === null ? [] : (report.dependencies as Array<Record<string, unknown>>);
  const graph: Check = { name: "graph", checked: deps.filter((d) => d.status !== "cycle").length, problems: [] };
  for (const d of deps) {
    if (d.status === "cycle") graph.problems.push(`a cycle through ${(d.ids as string[]).join(" -> ")}`);
    else if (d.class !== undefined && d.reason !== "dependency-unmet") graph.problems.push(`${String(d.path)} ${String(d.at)}: ${String(d.reason)}`);
  }
  checks.push(graph);

  const refs = report === null ? [] : (report.references as Array<Record<string, unknown>>);
  const references: Check = { name: "references", checked: refs.length, problems: [] };
  for (const r of refs) if (r.status === "unresolved" || r.status === "ambiguous") references.problems.push(`${String(r.path)} ${String(r.at)}: ${String(r.status)}, ${String(r.reason)}`);
  checks.push(references);

  const acceptance: Check = { name: "acceptance", checked: 0, problems: [] };
  for (const [id, pair] of read) {
    const control = pair.control.control;
    const a = isObject(control) ? control.acceptance : null;
    if (!isObject(a)) continue;
    acceptance.checked += 1;
    const ref = a.ref;
    const pkg = isObject(ref) && typeof ref.record_id === "string" ? read.get(ref.record_id) : undefined;
    const docs = pkg !== undefined && Array.isArray(pkg.control.active_documents) ? pkg.control.active_documents : [];
    const entry = docs.find((d: unknown) => isObject(d) && isObject(d.ref) && d.ref.record_id === id);
    if (pkg === undefined || pkg.kind !== "package") acceptance.problems.push(`${pair.path}: its acceptance names no converted package`);
    else if (!isObject(entry) || entry.revision !== a.revision) acceptance.problems.push(`${pair.path}: ${pkg.path} carries no active-document entry binding it at ${String(a.revision)}`);
    else if (pair.narrative?.sha256 !== a.revision) acceptance.problems.push(`${pair.path}: accepted at ${String(a.revision)}, its narrative is ${String(pair.narrative?.sha256)}`);
  }
  checks.push(acceptance);

  const closure: Check = { name: "closure", checked: 0, problems: [] };
  for (const [, pair] of read) {
    for (const site of hooks.sitesOf({ kind: pair.kind, control: pair.control })) {
      const v = site.value;
      if (!isObject(v) || typeof v.record_id !== "string") continue;
      if (v.workbench_id !== index.workbench_id) continue; // a foreign reference stays foreign
      closure.checked += 1;
      if (!rows.has(v.record_id)) closure.problems.push(`${pair.path} ${site.at} names ${v.record_id}, which this migration did not convert`);
    }
  }
  checks.push(closure);

  const validated = hooks.validate(view);
  const vr = validated.ok ? (validated.result as Record<string, unknown>) : null;
  const findings = vr === null ? [] : (vr.findings as Array<Record<string, unknown>>);
  const validateCheck: Check = { name: "validate", checked: vr === null ? 0 : Number(vr.checked), problems: validated.ok ? findings.map((f) => `${String(f.path)}: ${String(f.reason)}`) : [`validate answered ${validated.error.reason}`] };
  checks.push(validateCheck);

  const reconcileCheck: Check = { name: "reconcile", checked: report === null ? 0 : Number(report.checked), problems: [] };
  if (!reconciled.ok) reconcileCheck.problems.push(`reconcile answered ${reconciled.error.reason}`);
  else {
    for (const i of report?.intents as Array<Record<string, unknown>>) reconcileCheck.problems.push(`intent ${String(i.operation_id)} pending`);
    for (const r of report?.records as Array<Record<string, unknown>>) reconcileCheck.problems.push(`${String(r.path)}: ${String(r.reason)}`);
    for (const e of report?.evidence as Array<Record<string, unknown>>) if (e.status === "stale") reconcileCheck.problems.push(`${String(e.path)} ${String(e.at)}: stale evidence, ${String(e.reason)}`);
  }
  checks.push(reconcileCheck);
  return checks;
}

export function migrationVerify(req: MigrationVerifyRequest, hooks: CheckHooks): PlanFunction {
  return (ctx: PlanContext): Result<Planned> => {
    const { wb } = ctx;
    const now = prefix(ctx);
    if (!now.ok) return now;
    if (now.value.state === "json-control") return manifestPresent(wb, "verify");
    const read = readIndex(wb, req.plan);
    if (!read.ok) return read;
    const plan = read.value;
    const frozen = frozenInventory(wb, plan);
    if (!frozen.ok) return frozen;
    const chunks = readChunks(wb, plan, plan.chunks);
    if (!chunks.ok) return chunks;
    const recordParts = readParts(wb, plan, "records");
    if (!recordParts.ok) return recordParts;
    for (const kind of ["findings", "repairs"] as const) {
      const r = readParts(wb, plan, kind);
      if (!r.ok) return r;
    }
    const baseline = readBaseline(wb, plan);
    if (!baseline.ok) return baseline;
    if (req.operation_id !== plan.index.schedule.verify) return refusal("conflict", "operation-id-unscheduled", `${plan.ref.path} schedules ${plan.index.schedule.verify} for verify, not ${req.operation_id}`);

    const f1 = chunkOneFence(plan);
    const fence = fenceNow(wb);
    if (!fence.ok) return fence;
    if (fence.value === null || fence.value.operation_id !== f1) return fenceRefused(fence.value, f1);

    const landed = landedChunks(wb, plan);
    if (!landed.ok) return landed;
    const missing = firstChunks(plan.chunks).filter((n) => !landed.value.includes(n));
    if (missing.length > 0) return refusal("migration-incomplete", "chunks-missing", `verify follows every chunk of ${plan.index.migration_id}; ${missing.length === 1 ? "chunk" : "chunks"} ${missing.join(", ")} ${missing.length === 1 ? "has" : "have"} not landed`);

    const expected = expectedState(frozen.value, chunks.value);
    if (!expected.ok) return expected;
    const actual = eligible(wb, plan);
    const diff = firstDifference(actual, expected.value);
    if (diff !== null) return sourceChanged(`the store is not the final state ${plan.index.migration_id} expects: ${diff}`);
    const own = ownDirectory(wb, plan, { originals: chunks.value, receipt: false, rollback: false }, sourceChanged);
    if (!own.ok) return own;

    const rows = new Map<string, RecordRow>();
    for (const part of recordParts.value) for (const [id, row] of Object.entries(part.records as Record<string, RecordRow>)) rows.set(id, row);
    const after = new Map<string, string>();
    for (const e of actual) if (e.kind === "file") after.set(e.path, e.sha256);
    const receipt = receiptPath(plan.index.migration_id);
    const manifest = manifestOf(plan.index, receipt);
    const view: Workbench = { root: wb.root, state: "json-control", id: plan.index.workbench_id, manifest, diagnosis: null };
    const checks = runChecks(view, plan.index, rows, after, hooks);
    const failed = checks.filter((c) => c.problems.length > 0);
    if (failed.length > 0) {
      return refusal("migration-incomplete", "check-failed", `${failed.map((c) => `${c.name}: ${plural(c.problems.length, "problem")}, ${listed(c.problems)}`).join("; ")}; no receipt is written`);
    }

    const manifestBytes = Buffer.from(serialise(manifest), "utf-8");
    const v = ctx.validateResult(WORKBENCH_SCHEMA_ID, manifest, "the manifest verify would write is not valid");
    if (!v.ok) return v;
    // The activated tree (C11): the eligible inventory verify compared, plus
    // the manifest entry of the exact bytes this intent writes. The manifest
    // names the receipt by path only, so no hash refers to itself.
    const activated: InventoryEntry[] = [...actual, { path: WORKBENCH_MANIFEST, kind: "file", size: manifestBytes.byteLength, sha256: sha(manifestBytes) }];
    const counts = (recordParts.value[0] as Record<string, unknown>).counts;
    const receiptValue = {
      schema: RECEIPT_SCHEMA_ID.slice(SCHEMA_ID_PREFIX.length),
      migration_id: plan.index.migration_id,
      workbench_id: plan.index.workbench_id,
      source_layout: plan.index.source_layout,
      plan: { path: plan.ref.path, sha256: plan.ref.sha256 },
      parts: plan.index.parts.map((x) => ({ path: x.path, sha256: x.sha256 })),
      verify_operation_id: req.operation_id,
      after_inventory_sha256: inventoryDigest(activated),
      checks: checks.map((c) => ({ name: c.name, result: "passed", checked: c.checked })),
      counts,
      versions: { schemas: schemas().ids(), features: [...SUPPORTED_FEATURES] },
      manifest_revision: sha(manifestBytes),
    };
    const rv = ctx.validateResult(RECEIPT_SCHEMA_ID, receiptValue, "the receipt verify would write is not valid");
    if (!rv.ok) return rv;
    const receiptBytes = Buffer.from(serialise(receiptValue), "utf-8");
    const result = {
      operation_id: req.operation_id,
      migration_id: plan.index.migration_id,
      plan: { path: plan.ref.path, sha256: plan.ref.sha256 },
      checks: receiptValue.checks,
      counts,
      receipt: { path: receipt, sha256: sha(receiptBytes) },
      manifest: { path: WORKBENCH_MANIFEST, revision: sha(manifestBytes) },
    };
    return {
      ok: true,
      value: {
        writes: [
          { path: receipt, bytes: receiptBytes },
          { path: WORKBENCH_MANIFEST, bytes: manifestBytes },
        ],
        result,
      },
    };
  };
}


// =====================================================================================
// ## Rollback
//
// `rollback {chunk: k}` after the prefix, first refusal wins:
//
//   state    legacy, or a manifest naming this migration, which makes this
//            the first rollback after activation; any other manifest:
//            `conflict/manifest-present`;
//   plan     the index and every part, the inventory parts at the index's
//            `source_inventory_sha256`; and, for a later chunk after a
//            rollback across activation, `rollback.json` at the hash the
//            first rollback's stored answer binds, valid and naming this
//            migration and plan: `conflict/plan-file-changed`;
//   id       k beyond the last chunk: `migration-incomplete/
//            chunk-out-of-order`; not the index's rollback id for k:
//            `conflict/operation-id-unscheduled`;
//   fence    after activation a standing fence whose id holds a stored
//            `maintenance begin` answer; later, the one `rollback.json`
//            binds; before activation chunk 1's once a chunk was applied,
//            and none or chunk 1's when none was:
//            `conflict/maintenance-active`;
//   progress k the highest landed chunk, or k = 0 with none landed:
//            `migration-incomplete/chunk-out-of-order`;
//   receipt  first rollback after activation only: the receipt verified
//            (identity, integrity, availability, `manifest_revision` the
//            manifest's): `migration-incomplete/receipt-unverified`;
//   baseline first rollback after activation: the eligible inventory, the
//            manifest included, digesting to the receipt's
//            `after_inventory_sha256`; every baseline answer stored as the
//            `answers` part froze it; exactly one stored answer
//            reconstructing as each of the exempt `end` and `begin`; and
//            every later operation (`laterOperations`) one of the three
//            exempt: `conflict/after-state-changed`. A later chunk after a
//            rollback across activation audits the later operations against
//            the exempt set `rollback.json` binds, the same way;
//   disk     every file chunk k wrote at its after-state, its originals at
//            their source hashes; for k = 0 the eligible inventory equal to
//            the frozen post-repair input, plus the bookkeeping directories
//            the run created: `conflict/after-state-changed`;
//   writes   one intent: the originals written back over the narratives
//            chunk k rewrote, then its control files removed, then the
//            originals removed. The first rollback after activation writes
//            `rollback.json` first and removes the manifest and the receipt
//            before the controls; its answer binds the file by `binding:
//            {path, sha256}`. Chunk 0 removes the chunk parts, the other
//            parts, `rollback.json` and the index last, and its answer
//            carries the evidence `maintenance end` reads on a legacy store:
//            `progress` and `progress_sha256` (question 51).
//
// Excluded root entries are neither restored nor removed: no write names one.
// A replay is answered at the kernel's prefix step 4 from its stored answer
// and reads no plan file and no `rollback.json`.
// =====================================================================================

/** One exempt answer of a rollback after activation, as `rollback.json` binds it. */
interface Exempt {
  operation_id: string;
  op: string;
  request_digest: string;
}

/** `rollback.json`, the `rollback-binding` shape of the plan schema (question 52, as Prior answered it). */
interface RollbackBinding {
  migration_id: string;
  plan: PlanRef;
  receipt: PlanRef;
  fence: string;
  exempt: Exempt[];
}

const resultOf = (a: StoredAnswer): Record<string, unknown> => (a.response.ok && isObject(a.response.result) ? a.response.result : {});
const exemptOf = (s: Stored): Exempt => ({ operation_id: s.entry.operation_id, op: s.entry.op, request_digest: s.entry.request_digest });

/**
 * The `binding` the first rollback after activation answered, read under the
 * schedule's id for the highest rollback chunk (the first rollback after
 * activation is always that chunk); null when that answer is not stored, or
 * was given before activation and binds nothing.
 */
function boundBinding(wb: Workbench, plan: Plan): Result<PlanRef | null> {
  const a = stored(wb, (plan.index.schedule.rollback[plan.chunks] as ScheduleEntry).operation_id);
  if (!a.ok) return a;
  if (a.value === null) return { ok: true, value: null };
  const b = resultOf(a.value).binding;
  if (!isObject(b)) return { ok: true, value: null };
  return { ok: true, value: { path: String(b.path), sha256: String(b.sha256) } };
}

/** `rollback.json` at the bound hash, then valid, then this migration's and this plan's; else `plan-file-changed`. Checked before it is trusted. */
function readBinding(wb: Workbench, plan: Plan, ref: PlanRef): Result<RollbackBinding> {
  const bytes = regularBytes(wb, ref.path);
  if (bytes === null) return changed(`${ref.path} is no regular file; the first rollback after activation bound it at ${ref.sha256}`);
  if (sha(bytes) !== ref.sha256) return changed(`${ref.path} is ${sha(bytes)}; the first rollback after activation bound it at ${ref.sha256}`);
  const read = planFile(ref.path, bytes);
  if (!read.ok) return changed(`${ref.path}: ${read.why}`);
  const v = read.value as unknown as RollbackBinding & { part: string };
  if (v.part !== "rollback-binding" || v.migration_id !== plan.index.migration_id || canonical(v.plan) !== canonical(plan.ref)) return changed(`${ref.path} is not the rollback binding of ${plan.index.migration_id} at ${plan.ref.sha256}`);
  return { ok: true, value: v };
}

/**
 * The exempt set of the first rollback after activation (addendum, "The
 * operation baseline"): this migration's `verify`, validated against its
 * reconstructed request; the `maintenance end` naming chunk 1's fence; and
 * the `maintenance begin` of the standing fence. Each is found only by
 * reconstructing its request in the two forms and comparing digests, and
 * exactly one stored answer must match each, else `after-state-changed`.
 */
function exemptSet(wb: Workbench, plan: Plan, standing: Fence, now: readonly Stored[]): Result<Exempt[]> {
  const f1 = chunkOneFence(plan);
  const verifyId = plan.index.schedule.verify;
  const verifies = now.filter((s) => s.answer !== null && s.entry.operation_id === verifyId && reconstructs(s.answer.request_digest, { op: "migration", operation_id: verifyId, phase: "verify", plan: plan.ref }, wb.root));
  const ends = now.filter((s) => s.answer !== null && s.entry.op === "maintenance" && reconstructs(s.answer.request_digest, { op: "maintenance", operation_id: s.entry.operation_id, action: "end", fence: f1 }, wb.root));
  const begins = now.filter((s) => s.answer !== null && s.entry.operation_id === standing.operation_id && reconstructs(s.answer.request_digest, { op: "maintenance", operation_id: standing.operation_id, action: "begin" }, wb.root));
  if (verifies.length !== 1 || ends.length !== 1 || begins.length !== 1) {
    return afterStateChanged(
      `the exempt operations of a rollback after activation are this migration's verify, the one maintenance end naming chunk 1's fence ${f1} and the begin of the standing fence ${standing.operation_id}, each found by its reconstructed request; found ${plural(verifies.length, "verify", "verifies")}, ${plural(ends.length, "end")} and ${plural(begins.length, "begin")}`,
    );
  }
  return { ok: true, value: [verifies[0], ends[0], begins[0]].map((s) => exemptOf(s as Stored)).sort((a, b) => bytewise(a.operation_id, b.operation_id)) };
}

/** The audit: every later operation is one of `exempt` by id, op and digest, else `after-state-changed` naming it. */
function audit(wb: Workbench, plan: Plan, baseline: readonly AnswerEntry[], exempt: readonly Exempt[], now: readonly Stored[]): Result<void> {
  const bound = new Map(exempt.map((e) => [e.operation_id, e]));
  for (const s of laterOperations(wb, plan, baseline, now)) {
    const e = bound.get(s.entry.operation_id);
    if (e !== undefined && s.answer !== null && e.op === s.entry.op && e.request_digest === s.entry.request_digest) continue;
    const what = s.answer !== null && s.entry.op === "maintenance" ? ` ${String(resultOf(s.answer).action)}` : "";
    return afterStateChanged(`the stored answer ${s.entry.operation_id} (${s.entry.op}${what}) is neither in the baseline ${plan.ref.path} froze, nor a validated answer of its schedule, nor one of the exempt operations; a rollback after ordinary work is refused`);
  }
  return { ok: true, value: undefined };
}

/** The first rollback after activation: every baseline answer stored as frozen, else `after-state-changed`. */
function baselineHolds(baseline: readonly AnswerEntry[], now: readonly Stored[]): Result<void> {
  const byId = new Map(now.map((s) => [s.entry.operation_id, s]));
  for (const e of baseline) {
    const s = byId.get(e.operation_id);
    if (s === undefined || canonical(s.entry) !== canonical(e)) {
      return afterStateChanged(`the stored answer ${e.operation_id} (${e.op}) that the baseline froze at plan is ${s === undefined ? "missing" : `changed: it is ${s.entry.op} at ${s.entry.request_digest}, answer ${s.entry.answer_sha256}`}`);
    }
  }
  return { ok: true, value: undefined };
}

/** The receipt check of the first rollback after activation: identity, integrity, availability. */
function receiptHolds(wb: Workbench, plan: Plan, manifest: Record<string, unknown>): Result<{ ref: PlanRef; after: string }> {
  const path = receiptPath(plan.index.migration_id);
  const unverified = (why: string): Result<{ ref: PlanRef; after: string }> => refusal("migration-incomplete", "receipt-unverified", `the receipt ${path} of ${plan.index.migration_id} does not hold: ${why}`);
  const migration = manifest.migration;
  if (!isObject(migration) || migration.receipt !== path) return unverified(`${WORKBENCH_MANIFEST} names ${isObject(migration) ? String(migration.receipt) : "no receipt"}`);
  const bytes = regularBytes(wb, path);
  if (bytes === null) return unverified("it is no regular file in the workbench");
  const parsed = strictParse(bytes);
  if (!parsed.ok) return unverified(`${parsed.reason}: ${parsed.detail}`);
  const v = validate(RECEIPT_SCHEMA_ID, parsed.value);
  if (!v.ok) return unverified(v.class === "schema-invalid" ? describeErrors(v.errors) : `no schema ${v.schemaId}`);
  const r = parsed.value as { migration_id: string; workbench_id: string; plan: PlanRef; parts: PlanRef[]; verify_operation_id: string; after_inventory_sha256: string; manifest_revision: string };
  if (r.migration_id !== plan.index.migration_id || r.workbench_id !== plan.index.workbench_id || manifest.id !== plan.index.workbench_id) return unverified(`it names ${r.migration_id} in ${r.workbench_id}`);
  if (r.plan.path !== plan.ref.path || r.plan.sha256 !== plan.ref.sha256) return unverified(`it binds the index at ${r.plan.sha256}`);
  if (canonical(r.parts) !== canonical(plan.index.parts.map((x) => ({ path: x.path, sha256: x.sha256 })))) return unverified("its parts are not the index's");
  if (r.verify_operation_id !== plan.index.schedule.verify) return unverified(`it names the verify ${r.verify_operation_id}`);
  const manifestBytes = regularBytes(wb, WORKBENCH_MANIFEST);
  const revision = manifestBytes === null ? null : sha(manifestBytes);
  if (r.manifest_revision !== revision) return unverified(`it names the manifest at ${r.manifest_revision}, which is ${String(revision)}`);
  return { ok: true, value: { ref: { path, sha256: sha(bytes) }, after: r.after_inventory_sha256 } };
}

/** Each file chunk k wrote, at its after-state as a regular file: controls and rewritten narratives. */
function chunkAfterState(wb: Workbench, chunk: ChunkFile): Result<void> {
  for (const w of chunk.writes) {
    if (w.kind === "original") continue; // checked with the own directory
    const bytes = regularBytes(wb, w.path);
    if (bytes === null || sha(bytes) !== w.after_sha256) return afterStateChanged(`${w.path} is ${bytes === null ? "no regular file" : sha(bytes)}; chunk ${chunk.chunk} left it at ${w.after_sha256}`);
  }
  return { ok: true, value: undefined };
}

export function migrationRollback(req: MigrationRollbackRequest): PlanFunction {
  return (ctx: PlanContext): Result<Planned> => {
    const { wb } = ctx;
    const now = prefix(ctx);
    if (!now.ok) return now;
    const read = readIndex(wb, req.plan);
    if (!read.ok) return read;
    const plan = read.value;
    const manifest = now.value.state === "json-control" ? (now.value.manifest as Record<string, unknown>) : null;
    const activated = manifest !== null && isObject(manifest.migration) && manifest.migration.id === plan.index.migration_id;
    if (manifest !== null && !activated) return manifestPresent(wb, "rollback");
    const k = req.chunk;
    const frozen = frozenInventory(wb, plan);
    if (!frozen.ok) return frozen;
    const chunks = readChunks(wb, plan, plan.chunks);
    if (!chunks.ok) return chunks;
    for (const kind of ["records", "findings", "repairs"] as const) {
      const r = readParts(wb, plan, kind);
      if (!r.ok) return r;
    }
    const baseline = readBaseline(wb, plan);
    if (!baseline.ok) return baseline;
    // A later chunk after a rollback across activation: the binding, checked against its bound hash before it is trusted.
    let binding: { ref: PlanRef; value: RollbackBinding } | null = null;
    if (!activated) {
      const ref = boundBinding(wb, plan);
      if (!ref.ok) return ref;
      if (ref.value !== null) {
        const b = readBinding(wb, plan, ref.value);
        if (!b.ok) return b;
        binding = { ref: ref.value, value: b.value };
      }
    }

    if (k > plan.chunks) return outOfOrder(`${plan.index.migration_id} has ${plural(plan.chunks, "chunk")}; there is no chunk ${k} to roll back`);
    const scheduled = (plan.index.schedule.rollback[k] as ScheduleEntry).operation_id;
    if (req.operation_id !== scheduled) return refusal("conflict", "operation-id-unscheduled", `${plan.ref.path} schedules ${scheduled} for rollback chunk ${k}, not ${req.operation_id}`);

    // Fence.
    const f1 = chunkOneFence(plan);
    const fence = fenceNow(wb);
    if (!fence.ok) return fence;
    const standing = fence.value;
    let fenceOk: boolean;
    let wanted: string;
    if (activated) {
      wanted = "the fence of a stored maintenance begin";
      const begin = standing === null ? null : stored(wb, standing.operation_id);
      if (begin !== null && !begin.ok) return begin;
      fenceOk = begin !== null && begin.value !== null && begin.value.op === "maintenance" && resultOf(begin.value).action === "begin";
    } else if (binding !== null) {
      wanted = binding.value.fence;
      fenceOk = standing !== null && standing.operation_id === wanted;
    } else {
      const applied = stored(wb, f1);
      if (!applied.ok) return applied;
      wanted = f1;
      fenceOk = applied.value === null ? standing === null || standing.operation_id === f1 : standing !== null && standing.operation_id === f1;
    }
    if (!fenceOk) return fenceRefused(standing, wanted);

    // Progress.
    const landed = landedChunks(wb, plan);
    if (!landed.ok) return landed;
    const highest = landed.value.length === 0 ? 0 : Math.max(...landed.value);
    if (k !== highest) return outOfOrder(k === 0 ? `rollback chunk 0 follows the rollback of every chunk; the chunks landed are ${chunkList(landed.value)}` : `rollback runs from the highest landed chunk down; the chunks landed are ${chunkList(landed.value)}, so chunk ${k} is not next`);
    if (activated && k !== plan.chunks) return outOfOrder(`after activation every chunk of ${plan.index.migration_id} is landed; rollback starts at chunk ${plan.chunks}`);

    // The first rollback after activation: the receipt, the activated tree, the baseline, the exempt set, the audit.
    let receipt: PlanRef | null = null;
    let exempt: Exempt[] = [];
    if (activated) {
      const held = receiptHolds(wb, plan, manifest as Record<string, unknown>);
      if (!held.ok) return held;
      receipt = held.value.ref;
      const actual = eligible(wb, plan);
      if (inventoryDigest(actual) !== held.value.after) {
        const expected = expectedState(frozen.value, chunks.value);
        if (!expected.ok) return expected;
        const manifestBytes = regularBytes(wb, WORKBENCH_MANIFEST) as Buffer;
        expected.value.set(WORKBENCH_MANIFEST, { path: WORKBENCH_MANIFEST, kind: "file", size: manifestBytes.byteLength, sha256: sha(manifestBytes) });
        return afterStateChanged(`the store differs from the activated tree the receipt names (${held.value.after}): ${firstDifference(actual, expected.value) ?? "an entry differs from the one verify compared"}`);
      }
      const answers = storedNow(wb);
      const base = baselineHolds(baseline.value, answers);
      if (!base.ok) return base;
      const derived = exemptSet(wb, plan, standing as Fence, answers);
      if (!derived.ok) return derived;
      exempt = derived.value;
      const audited = audit(wb, plan, baseline.value, exempt, answers);
      if (!audited.ok) return audited;
    } else if (binding !== null) {
      const audited = audit(wb, plan, baseline.value, binding.value.exempt, storedNow(wb));
      if (!audited.ok) return audited;
    }

    // Disk.
    const originals = chunks.value.slice(0, k);
    const own = ownDirectory(wb, plan, { originals, receipt: activated, rollback: binding !== null }, afterStateChanged);
    if (!own.ok) return own;
    if (k === 0) {
      const diff = firstDifference(eligible(wb, plan), new Map(frozen.value.map((e) => [e.path, e])));
      if (diff !== null) return afterStateChanged(`rollback chunk 0 runs on the frozen input of ${plan.index.migration_id} and the store differs: ${diff}`);
      return chunkZero(wb, req, plan, binding?.ref ?? null, standing);
    }
    const chunk = chunks.value[k - 1] as ChunkFile;
    const after = chunkAfterState(wb, chunk);
    if (!after.ok) return after;

    // Writes: rollback.json first after activation, the originals back, then the manifest and receipt, the controls and the originals removed.
    const writes: PlannedWrite[] = [];
    const removals: Array<{ path: string; before: string }> = [];
    const restored: string[] = [];
    let bound: PlanRef | null = null;
    if (activated) {
      const value = { schema: PLAN_SCHEMA, part: "rollback-binding", migration_id: plan.index.migration_id, plan: plan.ref, receipt: receipt as PlanRef, fence: (standing as Fence).operation_id, exempt };
      const v = ctx.validateResult(PLAN_SCHEMA_ID, value, "the rollback binding this rollback would write is not valid");
      if (!v.ok) return v;
      const bytes = Buffer.from(serialise(value), "utf-8");
      bound = { path: rollbackPath(plan.index.migration_id), sha256: sha(bytes) };
      writes.push({ path: bound.path, bytes });
      removals.push({ path: WORKBENCH_MANIFEST, before: sha(regularBytes(wb, WORKBENCH_MANIFEST) as Buffer) }, { path: (receipt as PlanRef).path, before: (receipt as PlanRef).sha256 });
    }
    const originalOf = new Map(chunk.writes.filter((w) => w.kind === "original").map((w) => [(w as { from: string }).from, w]));
    for (const w of chunk.writes) {
      if (w.kind !== "rewrite") continue;
      const original = originalOf.get(w.path);
      const bytes = original === undefined ? null : regularBytes(wb, original.path);
      if (original === undefined || bytes === null || sha(bytes) !== w.source_sha256) return afterStateChanged(`the original of ${w.path} is not at ${w.source_sha256}`);
      writes.push({ path: w.path, bytes });
      restored.push(w.path);
    }
    for (const w of chunk.writes) if (w.kind === "control") removals.push({ path: w.path, before: w.after_sha256 });
    for (const w of chunk.writes) if (w.kind === "original") removals.push({ path: w.path, before: w.after_sha256 });
    const result = { operation_id: req.operation_id, migration_id: plan.index.migration_id, chunk: k, restored, removed: removals.map((r) => r.path), activation_undone: activated, ...(bound !== null ? { binding: bound } : {}) };
    return { ok: true, value: { writes, removals, result } };
  };
}

/** A progress entry of rollback chunk 0's answer (question 51). */
interface ProgressEntry {
  chunk: number;
  operation_id: string;
  request_digest: string;
}

/**
 * Rollback chunk 0: the plan files removed in one intent, the index last,
 * carrying the hashes of the files it removes and none of their bytes (W9).
 * Its answer is the completion evidence (question 51, as Prior answered it):
 * `progress`, the applied prefix's rollback answers from its highest chunk m
 * (the highest whose scheduled apply answer is stored; none for a full
 * abort) down to 1, each validated (stored, `ok`, this migration, its chunk,
 * the digest of its reconstructed request), then chunk 0 from this request;
 * and `progress_sha256` over the list's canonical bytes.
 */
function chunkZero(wb: Workbench, req: MigrationRollbackRequest, plan: Plan, binding: PlanRef | null, standing: Fence | null): Result<Planned> {
  let m = 0;
  for (let n = 1; n <= plan.chunks; n++) {
    const a = stored(wb, (plan.index.schedule.apply[n - 1] as ScheduleEntry).operation_id);
    if (!a.ok) return a;
    if (a.value !== null) m = n;
  }
  const progress: ProgressEntry[] = [];
  for (let n = m; n >= 1; n--) {
    const e = plan.index.schedule.rollback[n] as ScheduleEntry;
    const a = stored(wb, e.operation_id);
    if (!a.ok) return a;
    const r = a.value === null ? null : resultOf(a.value);
    if (a.value === null || a.value.op !== "migration" || !a.value.response.ok || r?.migration_id !== plan.index.migration_id || r.chunk !== n || !reconstructs(a.value.request_digest, rollbackRequest(plan.ref, e), wb.root)) {
      return afterStateChanged(`rollback chunk 0 lists the rollback of chunk ${n} under ${e.operation_id}, and its stored answer is ${a.value === null ? "missing" : "not that request's answer"}`);
    }
    progress.push({ chunk: n, operation_id: e.operation_id, request_digest: a.value.request_digest });
  }
  progress.push({ chunk: 0, operation_id: req.operation_id, request_digest: requestDigest(req) });

  const removals: Array<{ path: string; before: string }> = [];
  for (const x of plan.index.parts.filter((p) => p.part === "chunk")) removals.push({ path: x.path, before: x.sha256 });
  for (const x of plan.index.parts.filter((p) => p.part !== "chunk")) removals.push({ path: x.path, before: x.sha256 });
  if (binding !== null) removals.push({ path: binding.path, before: binding.sha256 });
  removals.push({ path: plan.ref.path, before: plan.ref.sha256 });
  const result = {
    operation_id: req.operation_id,
    migration_id: plan.index.migration_id,
    chunk: 0,
    restored: [],
    removed: removals.map((r) => r.path),
    activation_undone: false,
    plan: { path: plan.ref.path, sha256: plan.ref.sha256 },
    fence: standing === null ? null : standing.operation_id,
    progress,
    progress_sha256: progressDigest(progress),
  };
  return { ok: true, value: { writes: [], removals, result } };
}

const progressDigest = (progress: readonly ProgressEntry[]): string => sha(Buffer.from(canonical(progress), "utf-8"));

/**
 * The evidence `maintenance end` needs on a legacy store (question 51, as
 * Prior answered it), after the replay lookup and apart from the held-intent
 * and standing-fence checks its caller makes: exactly one stored rollback
 * chunk 0 answer naming `fence`; its `progress` a list ending at chunk 0
 * with that answer's own id and digest, its chunks descending by one; each
 * listed answer re-read and matching (stored under its id with its digest, a
 * `migration` answer `ok` for this migration and that chunk); and
 * `progress_sha256` recomputed. Any miss is the existing refusal,
 * `unsupported-format/legacy-workbench`, naming why.
 */
export function cleanupEvidence(wb: Workbench, fence: string): Result<{ migration_id: string }> {
  const plain = `${wb.root} carries no ${WORKBENCH_MANIFEST}; reads are allowed, mutation is not (spec 4.1)`;
  const legacy = (why: string): Result<{ migration_id: string }> => refusal("unsupported-format", "legacy-workbench", `${plain}, but for the end of a fence a complete migration rollback names, and ${why}`);
  const now = storedNow(wb);
  const zeros = now.filter((s) => s.answer !== null && s.entry.op === "migration" && s.answer.response.ok && resultOf(s.answer).chunk === 0 && Array.isArray(resultOf(s.answer).progress) && resultOf(s.answer).fence === fence);
  // With no migration evidence at all, the refusal is the kernel's own, byte for byte.
  if (zeros.length === 0) return refusal("unsupported-format", "legacy-workbench", plain);
  if (zeros.length > 1) return legacy(`${zeros.length} stored rollback chunk 0 answers name the fence ${fence}; exactly one must`);
  const zero = zeros[0] as Stored;
  const r = resultOf(zero.answer as StoredAnswer);
  const progress = r.progress as unknown[];
  const shaped = progress.every((p) => isObject(p) && Object.keys(p).sort().join(",") === "chunk,operation_id,request_digest" && Number.isInteger(p.chunk) && typeof p.operation_id === "string" && typeof p.request_digest === "string");
  const list = progress as ProgressEntry[];
  const last = list.at(-1);
  if (!shaped || last === undefined || last.chunk !== 0 || last.operation_id !== zero.entry.operation_id || last.request_digest !== zero.entry.request_digest || !list.every((p, i) => p.chunk === list.length - 1 - i)) {
    return legacy(`the progress of ${zero.entry.operation_id} is no list of the applied prefix's rollbacks ending at this chunk 0`);
  }
  const byId = new Map(now.map((s) => [s.entry.operation_id, s]));
  for (const p of list.slice(0, -1)) {
    const s = byId.get(p.operation_id);
    const pr = s === undefined || s.answer === null ? null : resultOf(s.answer);
    if (s === undefined || s.answer === null || pr === null || s.entry.op !== "migration" || !s.answer.response.ok || s.entry.request_digest !== p.request_digest || pr.migration_id !== r.migration_id || pr.chunk !== p.chunk) {
      return legacy(`the rollback of chunk ${p.chunk} that ${zero.entry.operation_id} lists under ${p.operation_id} is ${s === undefined ? "not stored" : "not the answer it lists"}`);
    }
  }
  if (progressDigest(list) !== r.progress_sha256) return legacy(`the progress of ${zero.entry.operation_id} digests to ${progressDigest(list)}, and it answered ${String(r.progress_sha256)}`);
  return { ok: true, value: { migration_id: String(r.migration_id) } };
}
