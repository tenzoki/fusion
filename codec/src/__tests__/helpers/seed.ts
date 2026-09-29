// ---------------------------------------------------------------------------
// Seeds a temp workbench with an evidence record and its report, for the
// cases that bind evidence (FJ02 steps 7 and 8) and for the FJ02 recorded
// session (step 9), which copies the bytes this writes into its `seed/`.
//
// Everything is deterministic: fixed ids, a fixed subject tree and time, the
// report text a function of the package's narrative path. What is not fixed is
// read from the workbench it seeds, as a reviewer would read it: the
// workbench id from `workbench.json`, `brief_revision` from the package's
// narrative as it stands, and `plan_revision` from the plan in force (the
// `role: plan` entry of `active_documents`), null when there is none.
//
// The report is written as a plain file: a reviewer writes Markdown, and the
// kernel is the one writer of fusion JSON, not of reports. The record goes
// through the real route, `create` with `kind: evidence` (Prior's FJ02
// response 19), under the evidence id as its operation id, and the kernel
// chooses its path: `seedEvidence` sends a first record, `seedCorrection` a
// correction naming its predecessor. `placeEvidence` writes a pair as plain
// files with no check at all: it stands for a record that arrived by hand
// edit or by a pull, and serves only the cases whose record `create` refuses.
// Only ever run on a temp copy.
// ---------------------------------------------------------------------------

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { dispatch } from "../../cli/ops.js";
import type { CreateEvidenceRequest, EvidencePayload, EvidenceRef, Response } from "../../cli/protocol.js";
import { revisionOf, serialise } from "../../store.js";
import { strictParse } from "../../strict-json.js";

export const EVIDENCE_ID = "e7e7e7e7-0000-4000-8000-000000000001";
export const CORRECTION_ID = "e7e7e7e7-0000-4000-8000-000000000002";
export const SEED_BASENAME = "260929-1200-review";
const SUBJECT_TREE = "0566591299a5f2c11f2573973ffc894791d20ee7";
const ACCEPTED_AT = "2026-09-29T12:00:00Z";
const CORRECTED_AT = "2026-09-29T13:00:00Z";
const REVIEWS = "/reviews";

export interface SeedOptions {
  /** The package the evidence is produced for: its control path, workbench-relative. */
  package: string;
  id?: string;
  /** The directory the pair goes into; default the package directory's `reviews/`. */
  dir?: string;
  basename?: string;
  /** Where the report is written and what `report.path` names; default `<dir>/<basename>.md`, its neighbour. */
  reportPath?: string;
  reportText?: string;
  policy?: EvidenceRef["policy"];
  /** Fields of the record replaced after it is built, for a case that changes one. */
  over?: Record<string, unknown>;
}

export interface CorrectionOptions {
  id?: string;
  over?: Record<string, unknown>;
}

export interface Seeded {
  /** The evidence file, workbench-relative. */
  path: string;
  /** The report the record names. */
  report: string;
  id: string;
  /** The revision of the stored evidence bytes. */
  revision: string;
  record: Record<string, unknown>;
  /** The binding a package makes to it: this id at this revision, under its policy. */
  binding: EvidenceRef;
  /** The package it was produced for, and where its name came from: what `seedCorrection` builds on. */
  package: string;
  basename: string;
  dir: string;
}

const parsed = (root: string, path: string): Record<string, unknown> => {
  const p = strictParse(readFileSync(join(root, path)));
  if (!p.ok) throw new Error(`${path}: ${p.detail}`);
  return p.value as Record<string, unknown>;
};

/** `brief_revision` and `plan_revision` as the package stands now. */
function against(root: string, pkgPath: string): { brief_revision: string; plan_revision: string | null } {
  const pkg = parsed(root, pkgPath);
  const narrative = (pkg.narrative as { path: string }).path;
  const docs = (pkg.active_documents ?? []) as Array<{ role: string; revision: string }>;
  return { brief_revision: revisionOf(readFileSync(join(root, narrative))), plan_revision: docs.find((d) => d.role === "plan")?.revision ?? null };
}

/** What a landed or placed seed hands back; the binding names this workbench, whatever `workbench_id` the record carries. */
function seeded(root: string, path: string, record: Record<string, unknown>, bytes: Buffer, from: { package: string; basename: string; dir: string }): Seeded {
  const revision = revisionOf(bytes);
  const id = record.id as string;
  return {
    path,
    report: (record.report as { path: string }).path,
    id,
    revision,
    record,
    binding: { ref: { workbench_id: parsed(root, "workbench.json").id as string, record_id: id, revision }, policy: record.execution_policy as EvidenceRef["policy"] },
    ...from,
  };
}

/** A first record for `options.package`, its report's bytes, and where both go. */
function firstRecord(root: string, options: SeedOptions): { record: Record<string, unknown>; reportBytes: Buffer; dir: string; basename: string } {
  const pkgDir = options.package.slice(0, options.package.lastIndexOf("/"));
  const dir = options.dir ?? `${pkgDir}${REVIEWS}`;
  const basename = options.basename ?? SEED_BASENAME;
  const reportPath = options.reportPath ?? `${dir}/${basename}.md`;
  const pkgNarrative = (parsed(root, options.package).narrative as { path: string }).path;
  const reportBytes = Buffer.from(options.reportText ?? `# Review of ${pkgNarrative}\n\nVerdict: accept. Every check passed.\n`, "utf-8");
  const record: Record<string, unknown> = {
    schema: "fusion.evidence/v1",
    id: options.id ?? EVIDENCE_ID,
    workbench_id: parsed(root, "workbench.json").id,
    subject: { git_tree: SUBJECT_TREE, git_range: null },
    ...against(root, options.package),
    role: { profile: "reviewer", version: "12.0.0" },
    host: "claude-code",
    execution_policy: options.policy ?? "claude-guided",
    verdict: "accept",
    uncertainties: [],
    checks: [{ id: "tests-green", result: "pass", detail: null }],
    report: { path: reportPath, sha256: revisionOf(reportBytes), kind: "review" },
    predecessor: null,
    accepted_at: ACCEPTED_AT,
    extensions: {},
    ...options.over,
  };
  return { record, reportBytes, dir, basename };
}

/** Writes `bytes` at `path` under `root`, its directory made. */
function writeAt(root: string, path: string, bytes: Buffer): void {
  mkdirSync(dirname(join(root, path)), { recursive: true });
  writeFileSync(join(root, path), bytes);
}

/**
 * The record sent through `create(kind: evidence)` into the reviews store its
 * report sits in: `shared/` for `shared/reviews`, else the container the store
 * belongs to. A report outside a reviews store is sent with its own directory
 * as the container, and `create` refuses it.
 */
async function create(root: string, record: Record<string, unknown>): Promise<Response> {
  const reportDir = dirname((record.report as { path: string }).path);
  const container = reportDir === `shared${REVIEWS}` ? null : reportDir.endsWith(REVIEWS) ? reportDir.slice(0, -REVIEWS.length) : reportDir;
  const request: CreateEvidenceRequest = {
    op: "create",
    workbench: root,
    operation_id: record.id as string,
    id: record.id as string,
    kind: "evidence",
    scope: { container, store: "reviews" },
    payload: record as EvidencePayload,
  };
  return dispatch(request);
}

/** The path the kernel's answer names, or the refusal. */
const answeredPath = (r: Response): string | null => (r.ok ? (r.result as { path: string }).path : null);

/** Creates the first record for `options.package` beside its report; throws when the kernel refuses. */
export async function seedEvidence(root: string, options: SeedOptions): Promise<Seeded> {
  const r = await trySeedEvidence(root, options);
  if (!r.ok) throw new Error(JSON.stringify(r.response));
  return r.seeded;
}

/**
 * As `seedEvidence`, returning the kernel's refusal instead of throwing on it.
 * The report is written unless it already stands at the same bytes; a report
 * standing at other bytes is never overwritten, since a record may name it.
 */
export async function trySeedEvidence(root: string, options: SeedOptions): Promise<{ ok: true; seeded: Seeded } | { ok: false; response: Response }> {
  const { record, reportBytes, dir, basename } = firstRecord(root, options);
  const reportPath = (record.report as { path: string }).path;
  if (existsSync(join(root, reportPath))) {
    if (!readFileSync(join(root, reportPath)).equals(reportBytes)) throw new Error(`${reportPath} exists with other bytes; the seed never rewrites a report`);
  } else writeAt(root, reportPath, reportBytes);
  const response = await create(root, record);
  const path = answeredPath(response);
  if (path === null) return { ok: false, response };
  return { ok: true, seeded: seeded(root, path, record, readFileSync(join(root, path)), { package: options.package, basename, dir }) };
}

/**
 * Writes the pair `seedEvidence` would send as two plain files, with no check
 * at all: a record that arrived by hand edit or by a pull. Only for the cases
 * whose record `create` refuses (a verdict outside the schema, a report
 * elsewhere or of another basename, another workbench's id, a file outside
 * `reviews/`), so that the consumers' own checks can be shown refusing it.
 */
export function placeEvidence(root: string, options: SeedOptions): Seeded {
  const { record, reportBytes, dir, basename } = firstRecord(root, options);
  const bytes = Buffer.from(serialise(record), "utf-8");
  const path = `${dir}/${basename}.evidence.json`;
  writeAt(root, (record.report as { path: string }).path, reportBytes);
  writeAt(root, path, bytes);
  return seeded(root, path, record, bytes, { package: options.package, basename, dir });
}

/**
 * Sends a correction of `first` over its report as it stands: a new record
 * naming `first` as predecessor at its stored revision, with `brief_revision`
 * and `plan_revision` read afresh. The kernel chooses its path.
 */
export async function trySeedCorrection(root: string, first: Seeded, options: CorrectionOptions = {}): Promise<{ ok: true; seeded: Seeded } | { ok: false; response: Response }> {
  const record: Record<string, unknown> = {
    ...first.record,
    id: options.id ?? CORRECTION_ID,
    ...against(root, first.package),
    report: { ...(first.record.report as Record<string, unknown>), sha256: revisionOf(readFileSync(join(root, first.report))) },
    predecessor: { workbench_id: first.binding.ref.workbench_id, record_id: first.id, revision: first.revision },
    accepted_at: CORRECTED_AT,
    ...options.over,
  };
  const response = await create(root, record);
  const path = answeredPath(response);
  if (path === null) return { ok: false, response };
  return { ok: true, seeded: seeded(root, path, record, readFileSync(join(root, path)), { package: first.package, basename: first.basename, dir: first.dir }) };
}

export async function seedCorrection(root: string, first: Seeded, options: CorrectionOptions = {}): Promise<Seeded> {
  const r = await trySeedCorrection(root, first, options);
  if (!r.ok) throw new Error(JSON.stringify(r.response));
  return r.seeded;
}
