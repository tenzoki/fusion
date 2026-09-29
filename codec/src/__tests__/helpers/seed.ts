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
// The pair lands as one journaled operation through the kernel's `mutate`,
// under the evidence id as its operation id: the report first, then the
// record, so a crash never leaves a record naming a report still to come. No
// operation of FJ02 writes an evidence record (Prior's request 19 asks how a
// Claude-side reviewer will), so this plan function is the only writer, and
// it refuses what an evidence writer must: an existing record name is
// `conflict/record-exists` (the first record is immutable, spec 4.4, so a
// correction over an unchanged report takes `<basename>.<n>.evidence.json`),
// an existing report `conflict/report-exists`. Only ever run on a temp copy.
// ---------------------------------------------------------------------------

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { EvidenceRef, Response } from "../../cli/protocol.js";
import { mutate, type PlanFunction, type PlannedWrite } from "../../kernel.js";
import { openWorkbench, revisionOf, serialise } from "../../store.js";
import { strictParse } from "../../strict-json.js";

export const EVIDENCE_ID = "e7e7e7e7-0000-4000-8000-000000000001";
export const CORRECTION_ID = "e7e7e7e7-0000-4000-8000-000000000002";
export const SEED_BASENAME = "260929-1200-review";
const SUBJECT_TREE = "0566591299a5f2c11f2573973ffc894791d20ee7";
const ACCEPTED_AT = "2026-09-29T12:00:00Z";
const CORRECTED_AT = "2026-09-29T13:00:00Z";

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
  /** The correction counter; default 2. */
  n?: number;
  id?: string;
  /** The file name, overriding `<basename>.<n>.evidence.json`: the case that tries the first record's own name. */
  fileName?: string;
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

/** Writes `writes` through the kernel, refusing an existing evidence name or report as the header says; the kernel's answer. */
async function land(root: string, id: string, evidencePath: string, writes: PlannedWrite[], reportIsNew: boolean): Promise<Response> {
  const opened = openWorkbench(root);
  if (!opened.ok) throw new Error(opened.error.detail);
  const plan: PlanFunction = () => {
    if (existsSync(join(root, evidencePath))) return { ok: false, error: { class: "conflict", reason: "record-exists", detail: `${evidencePath} exists; an evidence record is immutable once accepted` } };
    const report = writes[0]?.path;
    if (reportIsNew && report !== undefined && existsSync(join(root, report))) return { ok: false, error: { class: "conflict", reason: "report-exists", detail: `${report} exists` } };
    const evidence = writes[writes.length - 1] as PlannedWrite;
    return { ok: true, value: { writes, result: { path: evidencePath, revision: revisionOf(evidence.bytes) } } };
  };
  const digestable = { op: "seed-evidence", operation_id: id, writes: writes.map((w) => ({ path: w.path, sha256: revisionOf(w.bytes) })) };
  return mutate(opened.value, digestable, plan);
}

/** What a landed seed hands back; the binding names this workbench, whatever `workbench_id` the record carries. */
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

/** Seeds `<dir>/<basename>.evidence.json` and its report for `options.package`; throws when the kernel refuses. */
export async function seedEvidence(root: string, options: SeedOptions): Promise<Seeded> {
  const r = await trySeedEvidence(root, options);
  if (!r.ok) throw new Error(JSON.stringify(r.response));
  return r.seeded;
}

/** As `seedEvidence`, returning the kernel's refusal instead of throwing on it. */
export async function trySeedEvidence(root: string, options: SeedOptions): Promise<{ ok: true; seeded: Seeded } | { ok: false; response: Response }> {
  const pkgDir = options.package.slice(0, options.package.lastIndexOf("/"));
  const dir = options.dir ?? `${pkgDir}/reviews`;
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
  const bytes = Buffer.from(serialise(record), "utf-8");
  const path = `${dir}/${basename}.evidence.json`;
  const response = await land(root, record.id as string, path, [{ path: reportPath, bytes: reportBytes }, { path, bytes }], true);
  if (!response.ok) return { ok: false, response };
  return { ok: true, seeded: seeded(root, path, record, bytes, { package: options.package, basename, dir }) };
}

/**
 * Seeds a correction of `first` over its unchanged report: a new record naming
 * `first` as predecessor, named `<basename>.<n>.evidence.json` beside it, with
 * `brief_revision` and `plan_revision` read afresh. Writes the record alone.
 */
export async function trySeedCorrection(root: string, first: Seeded, options: CorrectionOptions = {}): Promise<{ ok: true; seeded: Seeded } | { ok: false; response: Response }> {
  const pkgFields = against(root, first.package);
  const record: Record<string, unknown> = {
    ...first.record,
    id: options.id ?? CORRECTION_ID,
    ...pkgFields,
    report: { ...(first.record.report as Record<string, unknown>), sha256: revisionOf(readFileSync(join(root, first.report))) },
    predecessor: { workbench_id: first.binding.ref.workbench_id, record_id: first.id, revision: first.revision },
    accepted_at: CORRECTED_AT,
    ...options.over,
  };
  const bytes = Buffer.from(serialise(record), "utf-8");
  const path = `${first.dir}/${options.fileName ?? `${first.basename}.${options.n ?? 2}.evidence.json`}`;
  const response = await land(root, record.id as string, path, [{ path, bytes }], false);
  if (!response.ok) return { ok: false, response };
  return { ok: true, seeded: seeded(root, path, record, bytes, { package: first.package, basename: first.basename, dir: first.dir }) };
}

export async function seedCorrection(root: string, first: Seeded, options: CorrectionOptions = {}): Promise<Seeded> {
  const r = await trySeedCorrection(root, first, options);
  if (!r.ok) throw new Error(JSON.stringify(r.response));
  return r.seeded;
}
