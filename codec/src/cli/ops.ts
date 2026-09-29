// ---------------------------------------------------------------------------
// The dispatcher: one validated request in, one response out, over the store.
//
// `dispatch` validates the request against the protocol schema first, so
// every operation below reads typed arguments and no operation can be reached
// with a shape the schema refuses. The five FJ01 operations:
//
//   inspect     the workbench's manifest state, the schema ids, the features
//   list        the record pairs under a store or a container, with kind,
//               status and revision
//   show        one pair: control, revision, narrative hash
//   validate    strict parse, schema, and the state rules `transitions.ts`
//               owns, for one pair or the whole workbench
//   transition  package records only: `allowed()` over the tables, then
//               `writeControl` under the caller's expected revision
//
// The other nine answer `operation-unknown/not-implemented-in-fj01`.
//
// A `transition` is replayable by its `operation_id`: the answer of a landed
// write is stored under `.json-state/ops/<operation_id>.json` beside the
// request that produced it, a repeat of the same request returns that answer
// without touching the record, and the same id with a different request is
// `conflict/operation-id-reused`. Only landed writes are stored: a refusal
// changed nothing, so a retry is an ordinary first attempt.
//
// Every answer to a request that reached an operation is `ok: true` or
// `ok: false` with one of the spec's typed errors; nothing here throws for a
// state of the workbench. A throw is a defect in this file.
// ---------------------------------------------------------------------------

import { existsSync, mkdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { canonical } from "../journal.js";
import { allowed, stateRules, transitions, type TransitionPayload as RulePayload } from "../transitions.js";
import {
  KINDS,
  PACKAGE_SCHEMA_ID,
  STATE_DIR,
  SUPPORTED_FEATURES,
  controlFiles,
  describeErrors,
  openWorkbench,
  readPair,
  replaceAtomically,
  resolveInside,
  writeControl,
  type Pair,
  type StoreError,
  type Workbench,
  type WriteOptions,
} from "../store.js";
import { strictParse } from "../strict-json.js";
import { schemas, validate } from "../validate.js";
import {
  IMPLEMENTED_OPERATIONS,
  OPERATIONS,
  PROTOCOL_SCHEMA_ID,
  fail,
  isOperation,
  type ListRequest,
  type Request,
  type Response,
  type ShowRequest,
  type TransitionRequest,
  type ValidateRequest,
} from "./protocol.js";

export interface DispatchOptions {
  /** Used when the request names no `workbench`: what `bin/fusion-record` exports as `FUSION_WORKBENCH`. */
  defaultWorkbench?: string;
  /** Passed through to `writeControl`, for the lock tests. */
  write?: WriteOptions;
}

const fromStore = (e: StoreError): Response => fail(e.class, e.reason, e.detail, e.errors);

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
  if (!IMPLEMENTED_OPERATIONS.includes(req.op)) {
    return fail("operation-unknown", "not-implemented-in-fj01", `${req.op} is specified (spec section 6) and lands in a later package`);
  }

  const root = req.workbench ?? options.defaultWorkbench;
  if (root === undefined) return fail("unknown-scope", "workbench-unspecified", "the request names no workbench and FUSION_WORKBENCH is not set");
  const opened = openWorkbench(root);
  if (!opened.ok) return fromStore(opened.error);
  const wb = opened.value;

  switch (req.op) {
    case "inspect":
      return inspect(wb);
    case "list":
      return readable(wb) ?? list(wb, req);
    case "show":
      return readable(wb) ?? show(wb, req);
    case "validate":
      return readable(wb) ?? validateOp(wb, req);
    case "transition":
      return transition(wb, req, options.write);
    default:
      return fail("operation-unknown", "not-implemented-in-fj01", `${(req as Request).op} lands in a later package`);
  }
}

/** Reads other than `inspect` refuse an unsupported manifest with its own diagnosis; `inspect` shows it. */
function readable(wb: Workbench): Response | null {
  if (wb.state === "unsupported" && wb.diagnosis !== null) return fromStore(wb.diagnosis);
  return null;
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

function list(wb: Workbench, req: ListRequest): Response {
  const scope = scopeDir(wb, req.scope);
  if (!scope.ok) return scope.response;
  const records = controlFiles(wb, scope.dir).map((path) => {
    const r = readPair(wb, path);
    if (!r.ok) return { path, problem: r.error };
    return { path, kind: r.value.kind, id: r.value.control.id ?? null, status: stateOf(r.value), revision: r.value.revision, narrative: r.value.narrative };
  });
  return { ok: true, result: { workbench: wb.root, scope: req.scope ?? null, records } };
}

// --- show ---------------------------------------------------------------------

function show(wb: Workbench, req: ShowRequest): Response {
  const r = readPair(wb, req.record.path);
  if (!r.ok) return fromStore(r.error);
  const { path, kind, control, revision, narrative } = r.value;
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

function rulePayload(pair: Pair): RulePayload {
  if (pair.kind === "package") return { claim: pair.control.claim, outcome: (pair.control.outcome as RulePayload["outcome"]) ?? null };
  const c = pair.control.control as Record<string, unknown> | undefined;
  return { disposition: c?.disposition, answer_ref: c?.answer_ref, implementation_ref: c?.implementation_ref, superseded_by: c?.superseded_by };
}

function validateOp(wb: Workbench, req: ValidateRequest): Response {
  const paths = req.record !== undefined ? [req.record.path] : controlFiles(wb, wb.root);
  const findings = paths.flatMap((p) => findingsOf(wb, p));
  return { ok: true, result: { workbench: wb.root, state: wb.state, checked: paths.length, valid: findings.length === 0, findings } };
}

// --- transition -----------------------------------------------------------------

interface StoredAnswer {
  operation_id: string;
  request: unknown;
  response: Response;
}

const opsDir = (wb: Workbench): string => join(wb.root, STATE_DIR, "ops");
const answerPath = (wb: Workbench, id: string): string => join(opsDir(wb), `${id}.json`);

function storedAnswer(wb: Workbench, req: TransitionRequest): Response | null {
  const file = answerPath(wb, req.operation_id);
  if (!existsSync(file)) return null;
  const parsed = strictParse(readFileSync(file));
  if (!parsed.ok) return fail("conflict", "operation-record-unreadable", `${relative(wb.root, file)}: ${parsed.reason}: ${parsed.detail}`);
  const stored = parsed.value as StoredAnswer;
  if (canonical(stored.request) !== canonical(req)) {
    return fail("conflict", "operation-id-reused", `operation_id ${req.operation_id} was already used for a different request`);
  }
  return stored.response;
}

async function transition(wb: Workbench, req: TransitionRequest, write?: WriteOptions): Promise<Response> {
  if (wb.state === "legacy") return fail("unsupported-format", "legacy-workbench", `${wb.root} carries no workbench.json; reads are allowed, mutation is not (spec 4.1)`);
  if (wb.state === "unsupported" && wb.diagnosis !== null) return fromStore(wb.diagnosis);

  const replay = storedAnswer(wb, req);
  if (replay !== null) return replay;

  const r = readPair(wb, req.record.path);
  if (!r.ok) return fromStore(r.error);
  const pair = r.value;
  if (pair.kind !== "package") {
    return fail("operation-unknown", "not-implemented-in-fj01", `transition of a ${pair.kind} record lands in a later package; FJ01 moves packages only`);
  }
  if (pair.revision !== req.expected_revision) {
    return fail("conflict", "revision-mismatch", `stored ${pair.revision} expected ${req.expected_revision}`);
  }

  const from = pair.control.status as string;
  const table = transitions().kinds["package"];
  const terminal = table?.terminal.includes(req.to) ?? false;
  const payload = req.payload ?? {};
  // A live target state carries no claim unless the payload brings one; a
  // terminal state keeps the historical claim unless the payload says otherwise.
  const claim = "claim" in payload ? (payload.claim ?? null) : terminal ? (pair.control.claim ?? null) : null;
  const outcome = payload.outcome ?? null;

  const rule = allowed("package", from, req.to, { claim, outcome });
  if (!rule.ok) return fail(rule.class, "transition-refused", rule.reason);

  const next = { ...pair.control, status: req.to, claim, outcome };
  const v = validate(PACKAGE_SCHEMA_ID, next);
  if (!v.ok) {
    if (v.class === "unsupported-format") return fail("unsupported-format", "unknown-schema", `no schema ${v.schemaId}`);
    return fail("schema-invalid", "result-invalid", `the record after the transition is not a valid package: ${describeErrors(v.errors)}`, v.errors);
  }

  const w = await writeControl(wb, req.record.path, next, req.expected_revision, write);
  if (!w.ok) return fromStore(w.error);

  const response: Response = {
    ok: true,
    result: { operation_id: req.operation_id, path: req.record.path, from, to: req.to, revision: w.value.revision, previous_revision: req.expected_revision },
    revisions: { [req.record.path]: w.value.revision },
  };
  const record: StoredAnswer = { operation_id: req.operation_id, request: req, response };
  mkdirSync(opsDir(wb), { recursive: true });
  replaceAtomically(answerPath(wb, req.operation_id), Buffer.from(JSON.stringify(record, null, 2) + "\n", "utf-8"));
  return response;
}
