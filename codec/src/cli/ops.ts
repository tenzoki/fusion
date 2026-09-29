// ---------------------------------------------------------------------------
// The dispatcher: one validated request in, one response out, over the store
// and the kernel.
//
// `dispatch` validates the request against the protocol schema first, so
// every operation below reads typed arguments and no operation can be reached
// with a shape the schema refuses. The operations answered:
//
//   inspect     the workbench's manifest state, the schema ids, the features
//   list        the record pairs under a store or a container, with kind,
//               status and revision
//   show        one pair: control, revision, narrative hash
//   validate    strict parse, schema, and the state rules `transitions.ts`
//               owns, for one pair or the whole workbench
//   transition  a package or an issue, plan, discussion or decision record:
//               `allowed()` over the tables, as a plan function the kernel
//               runs under the caller's expected revision
//
// Every other operation of the table answers `operation-unknown/not-implemented`
// with a detail naming the package that lands it (`LANDS_IN`).
//
// Reads run under the kernel's read protocol (`read`), mutations through its
// one sequence (`mutate`), which also makes them replayable by
// `operation_id`: the answer of a landed operation is stored under
// `.json-state/ops/<operation_id>.json` with the digest of the request that
// produced it, a repeat of the same request returns that answer without
// touching a record, and the same id with a different request is
// `conflict/operation-id-reused`. A refusal changed nothing and is not
// stored, so a retry is an ordinary first attempt.
//
// Every answer to a request that reached an operation is `ok: true` or
// `ok: false` with one of the spec's typed errors; nothing here throws for a
// state of the workbench. A throw is a defect in this file.
// ---------------------------------------------------------------------------

import { statSync } from "node:fs";
import { mutate, read, recoveryBlocked, type KernelOptions, type PlanContext, type PlanFunction, type Planned, type ReadView } from "../kernel.js";
import { allowed, stateRules, transitions, type TransitionPayload as RulePayload } from "../transitions.js";
import {
  KINDS,
  PACKAGE_SCHEMA_ID,
  RECORD_SCHEMA_ID,
  SUPPORTED_FEATURES,
  controlFiles,
  describeErrors,
  openWorkbench,
  readPair,
  resolveInside,
  revisionOf,
  serialise,
  type Pair,
  type Result,
  type StoreError,
  type Workbench,
} from "../store.js";
import { schemas, validate } from "../validate.js";
import {
  IMPLEMENTED_OPERATIONS,
  LANDS_IN,
  OPERATIONS,
  PROTOCOL_SCHEMA_ID,
  fail,
  isOperation,
  type ListRequest,
  type Request,
  type Response,
  type ShowRequest,
  type TransitionPayload,
  type TransitionRequest,
  type ValidateRequest,
} from "./protocol.js";

export interface DispatchOptions {
  /** Used when the request names no `workbench`: what `bin/fusion-record` exports as `FUSION_WORKBENCH`. */
  defaultWorkbench?: string;
  /** Passed through to the kernel: the lock's wait, and in tests its fault points. `main.ts` passes none. */
  kernel?: KernelOptions;
}

const fromStore = (e: StoreError): Response => fail(e.class, e.reason, e.detail, e.errors);

const notImplemented = (op: Request["op"]): Response =>
  fail("operation-unknown", "not-implemented", `${op} is specified (spec section 6) and lands in ${LANDS_IN[op] ?? "a later package"}`);

/** Validates `request` and routes it. Never throws for a state of the request or the workbench. */
export async function dispatch(request: unknown, options: DispatchOptions = {}): Promise<Response> {
  if (typeof request !== "object" || request === null || Array.isArray(request)) {
    return fail("schema-invalid", "request-not-an-object", "a request is one JSON object");
  }
  const op = (request as { op?: unknown }).op;
  if (!isOperation(op)) {
    return fail("operation-unknown", "unknown-op", `${JSON.stringify(op)} is none of ${OPERATIONS.join(", ")}`);
  }
  const v = validate(PROTOCOL_SCHEMA_ID, request);
  if (!v.ok) {
    if (v.class === "unsupported-format") return fail("unsupported-format", "protocol-schema-missing", `no schema ${v.schemaId} loaded`);
    return fail("schema-invalid", "request", describeErrors(v.errors), v.errors);
  }
  const req = request as Request;
  if (!IMPLEMENTED_OPERATIONS.includes(req.op)) return notImplemented(req.op);

  const root = req.workbench ?? options.defaultWorkbench;
  if (root === undefined) return fail("unknown-scope", "workbench-unspecified", "the request names no workbench and FUSION_WORKBENCH is not set");
  const opened = openWorkbench(root);
  if (!opened.ok) return fromStore(opened.error);
  const wb = opened.value;
  const kernel = options.kernel ?? {};

  switch (req.op) {
    case "inspect":
      return inspect(wb);
    case "list":
      return readable(wb) ?? reading(wb, (view) => list(wb, req, view), kernel);
    case "show":
      return readable(wb) ?? reading(wb, (view) => show(wb, req, view), kernel);
    case "validate":
      return readable(wb) ?? reading(wb, (view) => validateOp(wb, req, view), kernel);
    case "transition":
      return mutate(wb, req, transitionPlan(req), kernel);
    default:
      return notImplemented((req as Request).op);
  }
}

/** Reads other than `inspect` refuse an unsupported manifest with its own diagnosis; `inspect` shows it. */
function readable(wb: Workbench): Response | null {
  if (wb.state === "unsupported" && wb.diagnosis !== null) return fromStore(wb.diagnosis);
  return null;
}

/** A read under the kernel's read protocol; a read that finds no consistent state answers as the kernel says. */
async function reading(wb: Workbench, body: (view: ReadView) => Response, options: KernelOptions): Promise<Response> {
  const r = await read(wb, body, options);
  return r.ok ? r.value : fromStore(r.error);
}

// --- inspect ------------------------------------------------------------------

function inspect(wb: Workbench): Response {
  return {
    ok: true,
    result: {
      workbench: wb.root,
      state: wb.state,
      id: wb.id,
      manifest: wb.manifest,
      diagnosis: wb.diagnosis,
      schemas: schemas().ids(),
      features: [...SUPPORTED_FEATURES],
      kinds: [...KINDS],
      operations: {
        implemented: [...IMPLEMENTED_OPERATIONS],
        deferred: OPERATIONS.filter((o) => !IMPLEMENTED_OPERATIONS.includes(o)),
      },
    },
  };
}

// --- list ---------------------------------------------------------------------

const stateOf = (pair: Pair): unknown =>
  pair.kind === "package" ? pair.control.status : ((pair.control.control as Record<string, unknown> | undefined)?.state ?? null);

function scopeDir(wb: Workbench, scope: string | undefined): { ok: true; dir: string } | { ok: false; response: Response } {
  if (scope === undefined) return { ok: true, dir: wb.root };
  const abs = resolveInside(wb, scope);
  if (!abs.ok) return { ok: false, response: fromStore(abs.error) };
  let isDir = false;
  try {
    isDir = statSync(abs.value).isDirectory();
  } catch {
    isDir = false;
  }
  if (!isDir) return { ok: false, response: fail("unknown-scope", "scope-missing", `${scope} is not a directory in ${wb.root}`) };
  return { ok: true, dir: abs.value };
}

function list(wb: Workbench, req: ListRequest, view: ReadView): Response {
  const scope = scopeDir(wb, req.scope);
  if (!scope.ok) return scope.response;
  const records = controlFiles(wb, scope.dir).map((path) => {
    const b = view.blockedOn(path);
    if (b !== undefined) return { path, problem: recoveryBlocked(b) };
    const r = readPair(wb, path);
    if (!r.ok) return { path, problem: r.error };
    return { path, kind: r.value.kind, id: r.value.control.id ?? null, status: stateOf(r.value), revision: r.value.revision, narrative: r.value.narrative };
  });
  return { ok: true, result: { workbench: wb.root, scope: req.scope ?? null, records } };
}

// --- show ---------------------------------------------------------------------

function show(wb: Workbench, req: ShowRequest, view: ReadView): Response {
  const blocked = view.blockedOn(req.record.path);
  if (blocked !== undefined) return fromStore(recoveryBlocked(blocked));
  const r = readPair(wb, req.record.path);
  if (!r.ok) return fromStore(r.error);
  const { path, kind, control, revision, narrative } = r.value;
  const narrativeBlocked = narrative === null ? undefined : view.blockedOn(narrative.path);
  if (narrativeBlocked !== undefined) return fromStore(recoveryBlocked(narrativeBlocked));
  return { ok: true, result: { path, kind, control, revision, narrative } };
}

// --- validate -----------------------------------------------------------------

export interface Finding {
  path: string;
  class: StoreError["class"];
  reason: string;
  detail: string;
}

/** The findings against one pair: the strict reader's, the schema's, the state rules', the narrative's, the workbench id's. */
function findingsOf(wb: Workbench, path: string): Finding[] {
  const r = readPair(wb, path);
  if (!r.ok) return [{ path, class: r.error.class, reason: r.error.reason, detail: r.error.detail }];
  const pair = r.value;
  const findings: Finding[] = [];
  const v = validate(pair.schemaId, pair.control);
  if (!v.ok) {
    findings.push(v.class === "schema-invalid" ? { path, class: "schema-invalid", reason: "schema", detail: describeErrors(v.errors) } : { path, class: "unsupported-format", reason: "unknown-schema", detail: `no schema ${v.schemaId}` });
    return findings; // the state rules read fields the schema just refused
  }
  const state = stateOf(pair);
  if (typeof state === "string") {
    const rules = stateRules(pair.kind, state, rulePayload(pair));
    if (!rules.ok) findings.push({ path, class: rules.class, reason: "state-rules", detail: rules.reason });
  }
  if (pair.narrative === null) findings.push({ path, class: "unresolved-reference", reason: "narrative-unnamed", detail: "the record names no narrative" });
  else if (pair.narrative.sha256 === null) findings.push({ path, class: "unresolved-reference", reason: "narrative-missing", detail: `${pair.narrative.path} does not exist` });
  if (wb.id !== null && pair.control.workbench_id !== wb.id) {
    findings.push({ path, class: "unknown-scope", reason: "foreign-workbench-id", detail: `the record carries workbench_id ${JSON.stringify(pair.control.workbench_id)}; this workbench is ${wb.id}` });
  }
  return findings;
}

/** A pending intent left blocked on this pair's control file or its narrative is a finding: its state is not decided. */
function blockedFindingOf(wb: Workbench, path: string, view: ReadView): Finding[] {
  if (view.blocked.length === 0) return [];
  const r = readPair(wb, path);
  const narrative = r.ok ? r.value.narrative?.path : undefined;
  const b = view.blockedOn(path) ?? (narrative === undefined ? undefined : view.blockedOn(narrative));
  if (b === undefined) return [];
  const e = recoveryBlocked(b);
  return [{ path, class: e.class, reason: e.reason, detail: e.detail }];
}

function rulePayload(pair: Pair): RulePayload {
  if (pair.kind === "package") return { claim: pair.control.claim, outcome: (pair.control.outcome as RulePayload["outcome"]) ?? null };
  const c = pair.control.control as Record<string, unknown> | undefined;
  return { disposition: c?.disposition, answer_ref: c?.answer_ref, implementation_ref: c?.implementation_ref, superseded_by: c?.superseded_by };
}

function validateOp(wb: Workbench, req: ValidateRequest, view: ReadView): Response {
  const paths = req.record !== undefined ? [req.record.path] : controlFiles(wb, wb.root);
  const findings = paths.flatMap((p) => [...blockedFindingOf(wb, p, view), ...findingsOf(wb, p)]);
  return { ok: true, result: { workbench: wb.root, state: wb.state, checked: paths.length, valid: findings.length === 0, findings } };
}

// --- transition -----------------------------------------------------------------

interface Moved {
  from: string;
  next: Record<string, unknown>;
  schemaId: string;
}

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);

/**
 * `transition` as a plan function: the pair, the caller's expected revision,
 * the table's edge and target-state rules, the references the payload brings
 * resolved, and the record after the move validated against its schema.
 * The answer's shape is FJ01's for every kind.
 */
function transitionPlan(req: TransitionRequest): PlanFunction {
  return (ctx: PlanContext): Result<Planned> => {
    const r = ctx.readPair(req.record.path);
    if (!r.ok) return r;
    const pair = r.value;
    const cas = ctx.cas(pair, req.expected_revision);
    if (!cas.ok) return cas;

    const payload = req.payload ?? {};
    const moved = pair.kind === "package" ? movePackage(pair, req.to, payload) : moveRecord(ctx, pair, req.to, payload);
    if (!moved.ok) return moved;
    const { from, next, schemaId } = moved.value;
    const what = pair.kind === "package" ? "the record after the transition is not a valid package" : `the record after the transition is not a valid ${pair.kind} record`;
    const v = ctx.validateResult(schemaId, next, what);
    if (!v.ok) return v;

    const bytes = Buffer.from(serialise(next), "utf-8");
    const revision = revisionOf(bytes);
    return {
      ok: true,
      value: {
        writes: [{ path: req.record.path, bytes }],
        result: { operation_id: req.operation_id, path: req.record.path, from, to: req.to, revision, previous_revision: req.expected_revision },
        revisions: { [req.record.path]: revision },
      },
    };
  };
}

const refused = (rule: { class: StoreError["class"]; reason: string }): Result<never> => ({ ok: false, error: { class: rule.class, reason: "transition-refused", detail: rule.reason } });

function movePackage(pair: Pair, to: string, payload: TransitionPayload): Result<Moved> {
  const from = pair.control.status as string;
  const terminal = transitions().kinds["package"]?.terminal.includes(to) ?? false;
  // A live target state carries no claim unless the payload brings one; a
  // terminal state keeps the historical claim unless the payload says otherwise.
  const claim = "claim" in payload ? (payload.claim ?? null) : terminal ? (pair.control.claim ?? null) : null;
  const outcome = payload.outcome ?? null;
  const rule = allowed("package", from, to, { claim, outcome });
  if (!rule.ok) return refused(rule);
  return { ok: true, value: { from, next: { ...pair.control, status: to, claim, outcome }, schemaId: PACKAGE_SCHEMA_ID } };
}

/** The decision fields a transition may set; a field the payload leaves out keeps its stored value, and the schema judges the result. */
const DECISION_FIELDS = ["answer_ref", "implementation_ref", "superseded_by", "deferral"] as const;

function moveRecord(ctx: PlanContext, pair: Pair, to: string, payload: TransitionPayload): Result<Moved> {
  const kind = pair.kind;
  const control = (pair.control.control ?? {}) as Record<string, unknown>;
  const from = control.state as string;
  const terminal = transitions().kinds[kind]?.terminal.includes(to) ?? false;
  let fields: Record<string, unknown> = {};

  if (kind === "issue") {
    // As the package claim: a live state carries none, a terminal one keeps
    // what it has unless the payload brings one.
    const disposition = "disposition" in payload ? (payload.disposition ?? null) : terminal ? (control.disposition ?? null) : null;
    fields = { disposition };
  } else if (kind === "decision") {
    for (const f of DECISION_FIELDS) fields[f] = f in payload ? (payload[f] ?? null) : (control[f] ?? null);
  }
  const rule = allowed(kind, from, to, fields as RulePayload);
  if (!rule.ok) return refused(rule);

  if (kind === "decision") {
    for (const f of DECISION_FIELDS) {
      if (!(f in payload)) continue; // a stored value was resolved when it was set
      const value = fields[f];
      const target = f === "deferral" && isObject(value) ? value.target : value;
      const resolved = resolveReference(ctx, target);
      if (!resolved.ok) return resolved;
    }
  }
  return { ok: true, value: { from, next: { ...pair.control, control: { ...control, state: to, ...fields } }, schemaId: RECORD_SCHEMA_ID } };
}

/**
 * A reference the payload brings, resolved when it can be: a `record_ref`
 * to one control file of this workbench, an `artefact_ref` to a file at its
 * hash. A legacy citation string, a git commit, a foreign reference and a
 * named external target are carried unresolved; this kernel has nothing to
 * resolve them against.
 */
function resolveReference(ctx: PlanContext, value: unknown): Result<void> {
  if (!isObject(value)) return { ok: true, value: undefined };
  if (typeof value.record_id === "string") {
    if (ctx.wb.id !== null && value.workbench_id !== ctx.wb.id) {
      return { ok: false, error: { class: "unresolved-reference", reason: "foreign-workbench", detail: `the reference names workbench ${JSON.stringify(value.workbench_id)}; this workbench is ${ctx.wb.id}` } };
    }
    const r = ctx.resolveRecordId(value.record_id);
    return r.ok ? { ok: true, value: undefined } : r;
  }
  if (typeof value.path === "string" && typeof value.sha256 === "string") {
    const r = ctx.resolveArtefact({ path: value.path, sha256: value.sha256 });
    return r.ok ? { ok: true, value: undefined } : r;
  }
  return { ok: true, value: undefined };
}
