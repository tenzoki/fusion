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
//   claim       `transition` into the state the table's `claim` edges enter,
//   release     and out along its `release` edges: the transition plan
//               function with defaults and clearer refusals, never a second
//               route (decision 260928-1735, option 1)
//   set-mode    a package's mode, `autonomous` only with a resolving source
//               in the user's word
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
  type ClaimRequest,
  type ListRequest,
  type ReleaseRequest,
  type Request,
  type Response,
  type SetModeRequest,
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
    case "claim":
      return mutate(wb, req, claimPlan(req), kernel);
    case "release":
      return mutate(wb, req, releasePlan(req), kernel);
    case "set-mode":
      return mutate(wb, req, setModePlan(req), kernel);
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
 *
 * `precheck` is how `claim` and `release` enter: it runs after the caller's
 * revision and before the table, and may only refuse. Everything after it,
 * the edge, the claim rule, the `claimed_at` check, the result's schema, the
 * write and the operation-id binding, is this function's for both entry
 * points alike.
 */
function transitionPlan(req: TransitionRequest, precheck?: (pair: Pair) => Result<void>): PlanFunction {
  return (ctx: PlanContext): Result<Planned> => {
    const r = ctx.readPair(req.record.path);
    if (!r.ok) return r;
    const pair = r.value;
    const cas = ctx.cas(pair, req.expected_revision);
    if (!cas.ok) return cas;
    if (precheck !== undefined) {
      const p = precheck(pair);
      if (!p.ok) return p;
    }

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
  const table = transitions().kinds["package"];
  const terminal = table?.terminal.includes(to) ?? false;
  // A live target state carries no claim unless the payload brings one; a
  // terminal state keeps the historical claim unless the payload says otherwise.
  const claim = "claim" in payload ? (payload.claim ?? null) : terminal ? (pair.control.claim ?? null) : null;
  const outcome = payload.outcome ?? null;
  const rule = allowed("package", from, to, { claim, outcome });
  if (!rule.ok) return refused(rule);
  // A claim made now carries the time it was made: the caller knows it and
  // the kernel never guesses it (C8, C20). The check is here and not in
  // `packageRules`, which the state rules of a record at rest share: an
  // imported claim may carry a null time (spec line 211) and such a record
  // still moves out of its state. So it applies to a move into a state whose
  // claim rule is `required` only, which no edge re-enters: every such move
  // makes a new claim, whichever of `claim` and `transition` asked for it.
  if (table?.claim?.[to] === "required" && isObject(claim) && claim.claimed_at === null) {
    return { ok: false, error: { class: "schema-invalid", reason: "claimed-at-required", detail: `package: a move into ${to} makes a new claim, whose claimed_at is known to the caller and never guessed; it is null` } };
  }
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

// --- claim and release ------------------------------------------------------------------
//
// Both are `transitionPlan` with the target and the claim filled in from the
// request (decision 260928-1735, option 1: one kernel for both entry points).
// What each adds is a precheck with a clearer message, in the class the
// table gives `transition` for the same input: a second claim is a conflict
// either way, and so is a release of what is not claimed. The one place the
// two routes differ in outcome is release of a paused package: the table
// gives `paused -> open` to `transition`, not to `release`, so `transition`
// lands it and `release` refuses it, since a paused package holds no claim to
// give up. Neither route is less checked than the other.
//
// Ownership is not decided here. The kernel receives no identity it may
// authorise on (`actor.person` is attribution, never authorisation): the host
// reads the claim through `show`, decides whether the caller holds it, and
// sends that record's revision, which the kernel's CAS makes binding. Whether
// that meets Prior's shared-enforcement condition is asked as request 22 of
// the FJ02 plan (discussion 260929-0709, C16 and C23); an answer requiring a
// kernel check re-cuts this code with a new request field.

/** The one state the table's package edges of `op` enter, and the states they leave. */
function operationEdges(op: "claim" | "release"): { to: string; from: string[] } {
  const edges = (transitions().kinds["package"]?.edges ?? []).filter((e) => e.operation === op);
  const targets = [...new Set(edges.map((e) => e.to))];
  if (targets.length !== 1) throw new Error(`contract/transitions.json: the package edges of ${op} enter ${targets.join(", ") || "no state"}; exactly one is expected`);
  return { to: targets[0] as string, from: edges.map((e) => e.from) };
}

/** The transition a claim or release stands for: the request's own id, record, revision and actor. */
function asTransition(req: ClaimRequest | ReleaseRequest, to: string, reason: string, payload: TransitionPayload): TransitionRequest {
  return {
    op: "transition",
    ...(req.workbench !== undefined ? { workbench: req.workbench } : {}),
    operation_id: req.operation_id,
    record: req.record,
    expected_revision: req.expected_revision,
    actor: req.actor,
    to,
    reason,
    payload,
  };
}

function claimPlan(req: ClaimRequest): PlanFunction {
  const { to } = operationEdges("claim");
  return transitionPlan(asTransition(req, to, "claim", { claim: req.claim }), (pair) => {
    if (pair.kind !== "package" || pair.control.status !== to) return { ok: true, value: undefined };
    const held = isObject(pair.control.claim) ? `checkout ${String(pair.control.claim.checkout_id)}` : "no recorded checkout";
    return { ok: false, error: { class: "conflict", reason: "already-claimed", detail: `the package is already ${to}, held by ${held}; a second claim is a conflict` } };
  });
}

function releasePlan(req: ReleaseRequest): PlanFunction {
  const { to, from } = operationEdges("release");
  return transitionPlan(asTransition(req, to, req.reason, { claim: null }), (pair) => {
    const state = stateOf(pair);
    if (pair.kind === "package" && typeof state === "string" && from.includes(state)) return { ok: true, value: undefined };
    const what = pair.kind === "package" ? "the package" : `the ${pair.kind} record`;
    return { ok: false, error: { class: "conflict", reason: "not-claimed", detail: `${what} is ${String(state)}; release gives up the claim of a package that is ${from.join(" or ")}` } };
  });
}

// --- set-mode -----------------------------------------------------------------------

/**
 * A package's mode. `autonomous` is written on the user's word only: its
 * source is a `user-word` object whose reference resolves, or a record
 * reference that resolves, and the package schema refuses it with none. A
 * `legacy` source is what an import keeps, never what an operation writes.
 * `ordinary` writes `source: null`, and a request that brings a source with
 * it is refused rather than having the source dropped. A package in a
 * terminal status is refused whatever the mode: its record is history.
 */
function setModePlan(req: SetModeRequest): PlanFunction {
  return (ctx: PlanContext): Result<Planned> => {
    const r = ctx.readPair(req.record.path);
    if (!r.ok) return r;
    const pair = r.value;
    const cas = ctx.cas(pair, req.expected_revision);
    if (!cas.ok) return cas;
    if (pair.kind !== "package") {
      return { ok: false, error: { class: "schema-invalid", reason: "not-a-package", detail: `${req.record.path} is a ${pair.kind} record; set-mode sets a package's mode` } };
    }
    // A terminal record is history: no header change is written into it after
    // its terminal transition (conventions, `## Terminal states are history`).
    const status = pair.control.status;
    if (typeof status === "string" && (transitions().kinds["package"]?.terminal.includes(status) ?? false)) {
      return { ok: false, error: { class: "conflict", reason: "package-terminal", detail: `the package is ${status}, which is terminal; its mode is history and set-mode writes nothing into it` } };
    }
    const { value, source } = req.mode;
    if (isObject(source) && source.kind === "legacy") {
      return { ok: false, error: { class: "schema-invalid", reason: "legacy-source-on-set-mode", detail: "a legacy mode source is kept by an import only; set-mode takes the user's word or a record" } };
    }
    if (value === "ordinary" && source !== null) {
      return { ok: false, error: { class: "schema-invalid", reason: "source-on-ordinary", detail: "set-mode writes ordinary with source null; the request brings a source" } };
    }

    const next = { ...pair.control, mode: { value, source } };
    const v = ctx.validateResult(PACKAGE_SCHEMA_ID, next, "the record after set-mode is not a valid package");
    if (!v.ok) return v;
    // The schema has fixed the source's shape: null, a record_ref, or a user-word object around one of two references.
    if (isObject(source)) {
      const resolved = resolveReference(ctx, source.kind === "user-word" ? source.ref : source);
      if (!resolved.ok) return resolved;
    }

    const bytes = Buffer.from(serialise(next), "utf-8");
    const revision = revisionOf(bytes);
    return {
      ok: true,
      value: {
        writes: [{ path: req.record.path, bytes }],
        result: { operation_id: req.operation_id, path: req.record.path, mode: next.mode, revision, previous_revision: req.expected_revision },
        revisions: { [req.record.path]: revision },
      },
    };
  };
}
