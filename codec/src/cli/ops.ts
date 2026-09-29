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
//   create      a new pair: the control record the kernel builds, and the
//               narrative when the request carries its body, in one intent
//   transition  a package or an issue, plan, discussion or decision record:
//               `allowed()` over the tables, as a plan function the kernel
//               runs under the caller's expected revision
//   claim       `transition` into the state the table's `claim` edges enter,
//   release     and out along its `release` edges: the transition plan
//               function with defaults and clearer refusals, never a second
//               route (decision 260928-1735, option 1)
//   set-mode    a package's mode, `autonomous` only with a resolving source
//               in the user's word
//   set-dependencies
//               a package's `depends_on`, replaced whole: every target a
//               package of this workbench, none the package itself, and no
//               cycle through it; the conditions are evaluated at dispatch
//               time and by `reconcile`, never here
//   adopt-plan  a plan record bound into a package's `active_documents` at
//               the narrative revision accepted, as its one plan (replacing
//               the one before) or as one more spec, with the record's
//               `acceptance` naming the package
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

import { existsSync, readFileSync, statSync } from "node:fs";
import { canonical } from "../journal.js";
import { mutate, read, recoveryBlocked, type KernelOptions, type PlanContext, type PlanFunction, type Planned, type PlannedWrite, type ReadView } from "../kernel.js";
import { allowed, stateRules, transitions, type TransitionPayload as RulePayload } from "../transitions.js";
import {
  KINDS,
  PACKAGE_SCHEMA_ID,
  RECORD_SCHEMA_ID,
  SCHEMA_ID_PREFIX,
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
  type AdoptPlanRequest,
  type ClaimRequest,
  type CreateRequest,
  type ListRequest,
  type RecordRef,
  type ReleaseRequest,
  type Request,
  type Response,
  type SetDependenciesRequest,
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
    case "create":
      return mutate(wb, req, createPlan(req), kernel);
    case "transition":
      return mutate(wb, req, transitionPlan(req), kernel);
    case "claim":
      return mutate(wb, req, claimPlan(req), kernel);
    case "release":
      return mutate(wb, req, releasePlan(req), kernel);
    case "set-mode":
      return mutate(wb, req, setModePlan(req), kernel);
    case "set-dependencies":
      return mutate(wb, req, setDependenciesPlan(req), kernel);
    case "adopt-plan":
      return mutate(wb, req, adoptPlanPlan(req), kernel);
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

// --- create -----------------------------------------------------------------------
//
// A new pair in one journaled operation. The kernel builds the control record,
// never the payload alone: identity, workbench, narrative, filer, provenance
// `created`, and for a package `open`, no claim, mode `ordinary` with no
// source, no dependencies, documents or evidence. What the payload may add is
// a package's `domain` and `references`, and a record's `control` in its
// kind's initial state. So a created package is never `autonomous`: that is
// `set-mode`'s, on the user's word.
//
// With `narrative.content` both files are writes of one intent, the narrative
// first, so a crash leaves either nothing, a narrative the next request rolls
// forward into the pair, or the pair; the walk never finds a control file
// whose narrative is still to come. Without it the narrative must already be
// there and the operation writes the control file alone.

const COMMON_SCHEMA_ID = "urn:fusion:schema:fusion.common/v1";

type CreateKind = CreateRequest["kind"];
type RecordKind = Exclude<CreateKind, "package">;

/** The store each kind is filed in: a package is its own directory in `work-packages/`, a record sits in its kind's store. */
const STORE_OF: Readonly<Record<CreateKind, string>> = { package: "work-packages", issue: "issues", plan: "plans", discussion: "discussions", decision: "decisions" };

/** What a package payload may carry; every other field of a new package is the kernel's. */
const PACKAGE_PAYLOAD: readonly string[] = ["domain", "references"];

/**
 * A record payload is its `control` object in the kind's initial state: the
 * keys it may carry, and the values creation fixes. The keys not fixed (a
 * plan's steps and criteria, a discussion's participants and outcome
 * references) are the caller's, and the record schema judges their shape.
 */
const INITIAL_CONTROL: Readonly<Record<RecordKind, { keys: readonly string[]; fixed: Readonly<Record<string, unknown>> }>> = {
  issue: { keys: ["state", "disposition"], fixed: { state: "open", disposition: null } },
  plan: { keys: ["state", "steps", "criteria", "acceptance"], fixed: { state: "open", acceptance: null } },
  discussion: { keys: ["state", "participants", "outcome_refs"], fixed: { state: "open" } },
  decision: {
    keys: ["state", "answer_ref", "implementation_ref", "superseded_by", "deferral"],
    fixed: { state: "open", answer_ref: null, implementation_ref: null, superseded_by: null, deferral: null },
  },
};

const refusal = <T>(cls: StoreError["class"], reason: string, detail: string): Result<T> => ({ ok: false, error: { class: cls, reason, detail } });

/** The basename a new record takes: `common.schema.json`'s `legacy_markerless_citation`, read from the loaded schema. */
function markerlessName(): RegExp {
  const doc = schemas().document(COMMON_SCHEMA_ID) as { $defs?: Record<string, { pattern?: unknown } | undefined> } | undefined;
  const pattern = doc?.$defs?.["legacy_markerless_citation"]?.pattern;
  if (typeof pattern !== "string") throw new Error(`${COMMON_SCHEMA_ID}: $defs.legacy_markerless_citation.pattern is not a string`);
  return new RegExp(pattern);
}

/** The hash of the file at `path`, `null` when nothing stands there, and a refusal when a directory does. */
function fileHash(wb: Workbench, path: string): Result<string | null> {
  const abs = resolveInside(wb, path);
  if (!abs.ok) return abs;
  if (!existsSync(abs.value)) return { ok: true, value: null };
  if (!statSync(abs.value).isFile()) return refusal("unknown-scope", "not-a-file", `${path} is a directory in ${wb.root}`);
  return { ok: true, value: revisionOf(readFileSync(abs.value)) };
}

/**
 * Where the pair goes, when scope, kind and path agree: a package's narrative
 * is `work-packages/<d>/<d>.md` and its control file `package.json` beside it;
 * a record's narrative is `<container>/<store>/<stem>.md`, or
 * `shared/<store>/<stem>.md` without a container, and its control file
 * `<stem>.record.json` beside it. A container is a package directory.
 */
function pairPaths(ctx: PlanContext, req: CreateRequest): Result<{ control: string; narrative: string }> {
  const { kind, scope } = req;
  const narrative = req.narrative.path;
  const store = STORE_OF[kind];
  const mismatch = (why: string): Result<never> => refusal("unknown-scope", "store-kind-mismatch", `create ${kind}: ${why}`);
  if (scope.store !== store) return mismatch(`a ${kind} is filed in ${store}/; the scope names ${scope.store}/`);
  const slash = narrative.lastIndexOf("/");
  const dir = narrative.slice(0, Math.max(slash, 0));
  const name = narrative.slice(slash + 1);
  const stem = name.slice(0, -".md".length);
  let control: string;
  if (kind === "package") {
    if (scope.container !== null) return mismatch(`a package is its own directory in ${store}/, never inside the container ${scope.container}`);
    if (dir !== `${store}/${stem}`) return mismatch(`a package's narrative is ${store}/<d>/<d>.md; the request names ${narrative}`);
    control = `${dir}/package.json`;
  } else {
    const expected = scope.container === null ? `shared/${store}` : `${scope.container}/${store}`;
    if (dir !== expected) return mismatch(`a ${kind} filed in ${expected}/ has its narrative there; the request names ${narrative}`);
    if (scope.container !== null) {
      const holder = `${scope.container}/package.json`;
      const pkg = ctx.readPair(holder);
      if (!pkg.ok && pkg.error.reason !== "record-not-found") return pkg;
      if (!pkg.ok || pkg.value.kind !== "package") return refusal("unknown-scope", "container-missing", `${scope.container} is not a package directory: ${holder} ${pkg.ok ? `is a ${pkg.value.kind} record` : "does not exist"}`);
    }
    control = `${dir}/${stem}.record.json`;
  }
  if (!markerlessName().test(name)) {
    return refusal("schema-invalid", "narrative-name", `${name} is not a marker-free name (YYMMDD-HHMM-<topic>.md, no underscore): a new record carries its state in JSON, never in its file name`);
  }
  return { ok: true, value: { control, narrative } };
}

/**
 * The true origin. A user request is its own mandate and names no record. A
 * package or campaign origin names the package whose scope the new record
 * decomposes, and it must resolve in this workbench to a package; campaign
 * records are not addressable in FJ02, so a campaign origin resolves against
 * packages only. `legacy-unknown` is what an import records when it cannot
 * recover the origin; a record created now knows its own.
 */
function checkOrigin(ctx: PlanContext, origin: CreateRequest["origin"]): Result<void> {
  if (origin.kind === "legacy-unknown") return refusal("schema-invalid", "origin-legacy-on-create", "legacy-unknown is kept by an import that could not recover the origin; a record created now names its own");
  if (origin.kind === "user-request") {
    return origin.ref === null ? { ok: true, value: undefined } : refusal("schema-invalid", "origin-ref-not-admitted", "a user-request origin carries ref null: the user's request is the mandate, no record is");
  }
  if (origin.ref === null) return refusal("schema-invalid", "origin-ref-required", `a ${origin.kind} origin names the package whose scope the new record decomposes; its ref is null`);
  const hit = resolveRecordRef(ctx, origin.ref);
  if (!hit.ok) return hit;
  const pair = ctx.readPair(hit.value.path);
  if (!pair.ok) return pair;
  if (pair.value.kind !== "package") {
    const campaign = origin.kind === "campaign" ? " (campaign records are not addressable in FJ02, so a campaign origin resolves against packages only)" : "";
    return refusal("unresolved-reference", "not-a-package", `the ${origin.kind} origin ${origin.ref.record_id} is the ${pair.value.kind} record ${hit.value.path}; an origin resolves to a package${campaign}`);
  }
  return { ok: true, value: undefined };
}

const schemaField = (schemaId: string): string => schemaId.slice(SCHEMA_ID_PREFIX.length);

/** The record the kernel writes: every field fixed at creation, and what the payload may add to them. */
function newRecord(ctx: PlanContext, req: CreateRequest): Result<{ next: Record<string, unknown>; schemaId: string }> {
  const payload = req.payload;
  const admitted = req.kind === "package" ? PACKAGE_PAYLOAD : INITIAL_CONTROL[req.kind].keys;
  const extra = Object.keys(payload).filter((k) => !admitted.includes(k));
  if (extra.length > 0) {
    const whose = req.kind === "package" ? "the rest of a new package (status open, no claim, mode ordinary) is the kernel's" : `a ${req.kind} payload is its control object`;
    return refusal("schema-invalid", "payload-field-not-admitted", `a ${req.kind} payload admits ${admitted.join(", ")}; it carries ${extra.join(", ")}, and ${whose}`);
  }
  const common = {
    id: req.id,
    workbench_id: ctx.wb.id,
    narrative: { path: req.narrative.path },
    filed_by: req.filed_by,
    provenance: { source: "created", legacy_fields: {} },
    extensions: {},
  };
  if (req.kind === "package") {
    if (payload.domain === undefined || payload.domain === null) {
      return refusal("schema-invalid", "domain-required", "a package payload carries its domain; null is kept only for a package imported without one");
    }
    const next = {
      schema: schemaField(PACKAGE_SCHEMA_ID),
      ...common,
      domain: payload.domain,
      status: "open",
      claim: null,
      mode: { value: "ordinary", source: null },
      origin: req.origin,
      depends_on: [],
      active_documents: [],
      references: payload.references ?? [],
      evidence: [],
      outcome: null,
    };
    return { ok: true, value: { next, schemaId: PACKAGE_SCHEMA_ID } };
  }
  const { fixed } = INITIAL_CONTROL[req.kind];
  const off = Object.keys(fixed).filter((k) => payload[k] !== fixed[k]);
  if (off.length > 0) {
    const sets = off.map((k) => `${k} ${k in payload ? JSON.stringify(payload[k]) : "absent"}`).join(", ");
    return refusal("schema-invalid", "not-initial-state", `a new ${req.kind} record starts at ${JSON.stringify(fixed)}; the payload has ${sets}`);
  }
  const next = { schema: schemaField(RECORD_SCHEMA_ID), ...common, kind: req.kind, references: [], control: { ...payload } };
  return { ok: true, value: { next, schemaId: RECORD_SCHEMA_ID } };
}

function createPlan(req: CreateRequest): PlanFunction {
  return (ctx: PlanContext): Result<Planned> => {
    const paths = pairPaths(ctx, req);
    if (!paths.ok) return paths;
    const { control, narrative } = paths.value;

    // The control file first: a fresh-id retry of a landed create meets the
    // pair it made, whatever else it would also meet.
    const stored = fileHash(ctx.wb, control);
    if (!stored.ok) return stored;
    if (stored.value !== null) return refusal("conflict", "record-exists", `${control} exists; create never replaces a record`);

    const writes: PlannedWrite[] = [];
    let narrativeHash: string;
    const content = req.narrative.content;
    const standing = fileHash(ctx.wb, narrative);
    if (!standing.ok) return standing;
    if (content !== undefined) {
      if (standing.value !== null) return refusal("conflict", "narrative-exists", `${narrative} exists; with narrative.content create writes both halves of a new pair and never replaces a narrative`);
      const bytes = Buffer.from(content, "utf-8");
      // A lone surrogate has no UTF-8 encoding and would be written as U+FFFD: not the bytes sent.
      if (bytes.toString("utf-8") !== content) return refusal("schema-invalid", "narrative-not-utf8", "narrative.content holds a lone surrogate, which has no UTF-8 encoding");
      writes.push({ path: narrative, bytes });
      narrativeHash = revisionOf(bytes);
    } else {
      if (standing.value === null) return refusal("unresolved-reference", "narrative-missing", `${narrative} does not exist; without narrative.content create requires it`);
      narrativeHash = standing.value;
    }

    const taken = ctx.resolveRecordId(req.id);
    if (taken.ok) return refusal("conflict", "id-in-use", `the id ${req.id} is carried by ${taken.value.path}`);
    if (taken.error.reason !== "record-not-found") return refusal("conflict", "id-in-use", taken.error.detail);

    const origin = checkOrigin(ctx, req.origin);
    if (!origin.ok) return origin;

    const built = newRecord(ctx, req);
    if (!built.ok) return built;
    const { next, schemaId } = built.value;
    const v = ctx.validateResult(schemaId, next, `the ${req.kind} record create would write is not valid`);
    if (!v.ok) return v;

    const bytes = Buffer.from(serialise(next), "utf-8");
    const revision = revisionOf(bytes);
    writes.push({ path: control, bytes });
    return {
      ok: true,
      value: {
        writes,
        result: { operation_id: req.operation_id, path: control, kind: req.kind, revision, narrative: { path: narrative, sha256: narrativeHash } },
        revisions: { [control]: revision },
      },
    };
  };
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
    const r = resolveRecordRef(ctx, { workbench_id: value.workbench_id, record_id: value.record_id });
    return r.ok ? { ok: true, value: undefined } : r;
  }
  if (typeof value.path === "string" && typeof value.sha256 === "string") {
    const r = ctx.resolveArtefact({ path: value.path, sha256: value.sha256 });
    return r.ok ? { ok: true, value: undefined } : r;
  }
  return { ok: true, value: undefined };
}

/** A `record_ref` resolved to the one control file of this workbench that carries its id. */
function resolveRecordRef(ctx: PlanContext, ref: { workbench_id: unknown; record_id: string }): Result<{ path: string; id: string }> {
  if (ctx.wb.id !== null && ref.workbench_id !== ctx.wb.id) {
    return { ok: false, error: { class: "unresolved-reference", reason: "foreign-workbench", detail: `the reference names workbench ${JSON.stringify(ref.workbench_id)}; this workbench is ${ctx.wb.id}` } };
  }
  return ctx.resolveRecordId(ref.record_id);
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

// --- the package operations' common entry ---------------------------------------------

const isTerminal = (kind: string, state: unknown): boolean => typeof state === "string" && (transitions().kinds[kind]?.terminal.includes(state) ?? false);

/**
 * The package a package operation changes: read, at the caller's expected
 * revision, a package and not a record, and live. A terminal record is
 * history: no header change is written into it after its terminal
 * transition (conventions, `## Terminal states are history`), so every
 * operation over it is refused, whatever it would write.
 */
function livePackage(ctx: PlanContext, req: { record: { path: string }; expected_revision: string }, op: string, does: string): Result<Pair> {
  const r = ctx.readPair(req.record.path);
  if (!r.ok) return r;
  const pair = r.value;
  const cas = ctx.cas(pair, req.expected_revision);
  if (!cas.ok) return cas;
  if (pair.kind !== "package") return refusal("schema-invalid", "not-a-package", `${req.record.path} is a ${pair.kind} record; ${op} ${does}`);
  const status = pair.control.status;
  if (isTerminal("package", status)) return refusal("conflict", "package-terminal", `the package is ${String(status)}, which is terminal; its record is history and ${op} writes nothing into it`);
  return r;
}

/** One control record's write: its bytes and revision, from a value the caller has validated. */
function recordWrite(path: string, value: Record<string, unknown>): PlannedWrite & { revision: string } {
  const bytes = Buffer.from(serialise(value), "utf-8");
  return { path, bytes, revision: revisionOf(bytes) };
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
    const r = livePackage(ctx, req, "set-mode", "sets a package's mode");
    if (!r.ok) return r;
    const pair = r.value;
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

// --- set-dependencies ---------------------------------------------------------------
//
// The request's list replaces the package's `depends_on` whole, an empty list
// included. Each target must resolve in this workbench to a package; what a
// condition asks of its target (`terminal`, `succeeded`) is not evaluated
// here: an unmet condition blocks dispatch and changes no state
// (`codec/contract/dependencies.json`), so it is dispatch time's question and
// `reconcile` reports it.
//
// The cycle check is over the workbench's whole `depends_on` graph with this
// package's edges replaced by the new list, and it refuses a cycle through
// this package. Only this package's outgoing edges change, so every cycle the
// new list could close runs through it; a cycle elsewhere is one this request
// neither makes nor can break, and refusing on it would block every
// set-dependencies in the workbench until somebody else acted, so it is
// `reconcile`'s to report. A package file the strict reader refuses, or one a
// blocked intent names, contributes no edges: what it depends on is not
// decided, and `validate` and `reconcile` report it.

/** A control file of an evidence record, by its name: the walk admits it, `readPair` does not yet read its kind. */
const isEvidenceFile = (path: string): boolean => path.endsWith(".evidence.json");

/** The package a `record_ref` names, resolved in this workbench: a record kind or an evidence record is `not-a-package`. */
function resolvePackage(ctx: PlanContext, ref: RecordRef, role: string): Result<Pair> {
  const hit = resolveRecordRef(ctx, ref);
  if (!hit.ok) return hit;
  if (isEvidenceFile(hit.value.path)) return refusal("unresolved-reference", "not-a-package", `the ${role} ${ref.record_id} is the evidence record ${hit.value.path}; it must be a package`);
  const pair = ctx.readPair(hit.value.path);
  if (!pair.ok) return pair;
  if (pair.value.kind !== "package") return refusal("unresolved-reference", "not-a-package", `the ${role} ${ref.record_id} is the ${pair.value.kind} record ${hit.value.path}; it must be a package`);
  return pair;
}

/** Every package's `depends_on` targets in this workbench, by package id: the edges the cycle check walks. */
function dependencyEdges(ctx: PlanContext): Map<string, string[]> {
  const edges = new Map<string, string[]>();
  for (const path of controlFiles(ctx.wb, ctx.wb.root)) {
    if (!path.endsWith("/package.json") && path !== "package.json") continue;
    const r = ctx.readPair(path);
    if (!r.ok || r.value.kind !== "package" || typeof r.value.control.id !== "string") continue;
    const deps = Array.isArray(r.value.control.depends_on) ? r.value.control.depends_on : [];
    const targets = deps.flatMap((d) => (isObject(d) && isObject(d.target) && d.target.workbench_id === ctx.wb.id && typeof d.target.record_id === "string" ? [d.target.record_id] : []));
    edges.set(r.value.control.id, targets);
  }
  return edges;
}

/** A path of ids from `start` back to `start` along `edges`, first found in edge order, or null when there is none. */
function cycleThrough(start: string, edges: ReadonlyMap<string, readonly string[]>): string[] | null {
  const seen = new Set<string>([start]);
  const path = [start];
  const visit = (node: string): boolean => {
    for (const next of edges.get(node) ?? []) {
      if (next === start) return true;
      if (seen.has(next)) continue;
      seen.add(next);
      path.push(next);
      if (visit(next)) return true;
      path.pop();
    }
    return false;
  };
  return visit(start) ? [...path, start] : null;
}

function setDependenciesPlan(req: SetDependenciesRequest): PlanFunction {
  return (ctx: PlanContext): Result<Planned> => {
    const r = livePackage(ctx, req, "set-dependencies", "sets a package's dependencies");
    if (!r.ok) return r;
    const pkg = r.value;
    const self = pkg.control.id as string;

    // Distinct by record_id: the schema's uniqueItems catches identical entries only.
    const counted = new Map<string, number>();
    for (const e of req.depends_on) counted.set(e.target.record_id, (counted.get(e.target.record_id) ?? 0) + 1);
    const twice = [...counted].filter(([, n]) => n > 1).map(([id]) => id);
    if (twice.length > 0) return refusal("schema-invalid", "duplicate-target", `depends_on names ${twice.join(", ")} more than once; one edge per target`);

    for (const e of req.depends_on) {
      if (e.target.record_id === self && e.target.workbench_id === ctx.wb.id) {
        return refusal("conflict", "self-dependency", `depends_on names the package itself, ${self}`);
      }
      const target = resolvePackage(ctx, e.target, "dependency target");
      if (!target.ok) return target;
    }

    const edges = dependencyEdges(ctx);
    edges.set(self, req.depends_on.map((e) => e.target.record_id));
    const cycle = cycleThrough(self, edges);
    if (cycle !== null) return refusal("conflict", "cycle", `depends_on would close the cycle ${cycle.join(" -> ")}`);

    const next = { ...pkg.control, depends_on: req.depends_on };
    const v = ctx.validateResult(PACKAGE_SCHEMA_ID, next, "the record after set-dependencies is not a valid package");
    if (!v.ok) return v;
    const w = recordWrite(req.record.path, next);
    return {
      ok: true,
      value: {
        writes: [w],
        result: { operation_id: req.operation_id, path: req.record.path, depends_on: req.depends_on, revision: w.revision, previous_revision: req.expected_revision },
        revisions: { [req.record.path]: w.revision },
      },
    };
  };
}

// --- adopt-plan ---------------------------------------------------------------------
//
// Binds a plan-kind record into a package's `active_documents` at the exact
// narrative revision the caller accepted, and writes the binding's other half
// into the record: `control.acceptance` names the package and that revision.
// A record is adopted by one package in one role, which the record's single
// `acceptance` field says.
//
// `role: plan` (the default) replaces the package's plan entry, never
// appends to it: the package schema allows one (`maxContains: 1`). A plan it
// replaces moves its `record_ref` into `references`, as the conventions
// move a replaced plan to `**Cross-references:**`, and its record's
// `acceptance` is cleared: three writes in one intent. The replaced record's
// `acceptance` is cleared only while it names this package; a replaced ref
// that no longer resolves (the record was removed, or it is foreign) has no
// acceptance here to clear, and is still moved. A replaced plan record in a
// terminal state (closed or deferred) is not written either: a terminal record
// is history, and nothing is written into it after its terminal transition
// (conventions, `## Terminal states are history`), the rule `livePackage`
// applies to packages; its ref is still moved. Each of these is two writes.
// Re-adopting the plan in force at a new revision rewrites its own entry and
// moves nothing: two writes.
//
// `role: spec` adds an entry, any number of them, distinct by record_id:
// re-adopting a spec replaces its entry. Two writes.

const PLAN_ROLE = "plan";

interface ActiveDocument {
  ref: RecordRef;
  role: "spec" | "plan";
  revision: string;
}

const sameRecord = (a: unknown, id: string): boolean => isObject(a) && a.record_id === id;

/** `acceptance` naming this package, by id and workbench. */
const acceptedBy = (acceptance: unknown, pkg: Pair): boolean =>
  isObject(acceptance) && isObject(acceptance.ref) && acceptance.ref.record_id === pkg.control.id && acceptance.ref.workbench_id === pkg.control.workbench_id;

/** A plan record with its control's `acceptance` replaced. */
const withAcceptance = (doc: Pair, acceptance: unknown): Record<string, unknown> => ({ ...doc.control, control: { ...(doc.control.control as Record<string, unknown>), acceptance } });

/**
 * The record a replaced plan entry names, when there is one here to clear:
 * `null` when its ref no longer resolves in this workbench, when its record
 * is terminal (history, never written), or when it no longer names this
 * package.
 */
function replacedRecord(ctx: PlanContext, ref: RecordRef, pkg: Pair): Result<Pair | null> {
  const hit = resolveRecordRef(ctx, ref);
  if (!hit.ok) return hit.error.reason === "record-not-found" || hit.error.reason === "foreign-workbench" ? { ok: true, value: null } : hit;
  if (isEvidenceFile(hit.value.path)) return { ok: true, value: null };
  const pair = ctx.readPair(hit.value.path);
  if (!pair.ok) return pair;
  if (pair.value.kind !== "plan") return { ok: true, value: null };
  const control = pair.value.control.control as Record<string, unknown> | undefined;
  if (isTerminal("plan", control?.state)) return { ok: true, value: null };
  return { ok: true, value: acceptedBy(control?.acceptance, pkg) ? pair.value : null };
}

function adoptPlanPlan(req: AdoptPlanRequest): PlanFunction {
  return (ctx: PlanContext): Result<Planned> => {
    const r = livePackage(ctx, req, "adopt-plan", "binds a document into a package");
    if (!r.ok) return r;
    const pkg = r.value;
    const role = req.role ?? PLAN_ROLE;
    const docId = req.plan.record_id;

    // The document: a plan-kind record of this workbench, live, at the revision accepted.
    const hit = resolveRecordRef(ctx, req.plan);
    if (!hit.ok) return hit;
    const notAPlan = (what: string): Result<never> => refusal("unresolved-reference", "not-a-plan", `${docId} is ${what}; adopt-plan binds a plan record, as a ${role}`);
    if (isEvidenceFile(hit.value.path)) return notAPlan(`the evidence record ${hit.value.path}`);
    const got = ctx.readPair(hit.value.path);
    if (!got.ok) return got;
    const doc = got.value;
    if (doc.kind !== "plan") return notAPlan(`the ${doc.kind} record ${doc.path}`);
    const control = (doc.control.control ?? {}) as Record<string, unknown>;
    if (isTerminal("plan", control.state)) {
      return refusal("conflict", "plan-terminal", `${doc.path} is ${String(control.state)}, which is terminal; a closed or deferred plan is history and is not adopted`);
    }
    if (doc.narrative === null || doc.narrative.sha256 === null) {
      return refusal("unresolved-reference", "narrative-missing", `${doc.path} names ${doc.narrative === null ? "no narrative" : `${doc.narrative.path}, which does not exist`}; its revision cannot be accepted`);
    }
    if (doc.narrative.sha256 !== req.revision) {
      return refusal("conflict", "plan-revision-mismatch", `${doc.narrative.path} is ${doc.narrative.sha256}; the request accepts ${req.revision}`);
    }
    const acceptance = control.acceptance;
    if (acceptance !== null && acceptance !== undefined && !acceptedBy(acceptance, pkg)) {
      const holder = isObject(acceptance) && isObject(acceptance.ref) ? String(acceptance.ref.record_id) : JSON.stringify(acceptance);
      return refusal("conflict", "plan-adopted-elsewhere", `${doc.path} is adopted by the package ${holder}; a record is adopted by one package`);
    }

    const docs = (Array.isArray(pkg.control.active_documents) ? pkg.control.active_documents : []) as ActiveDocument[];
    const otherRole = docs.find((d) => sameRecord(d.ref, docId) && d.role !== role);
    if (otherRole !== undefined) {
      return refusal("conflict", "role-conflict", `${docId} is this package's ${otherRole.role} already; a record is adopted in one role`);
    }

    const entry: ActiveDocument = { ref: req.plan, role, revision: req.revision };
    const at = docs.findIndex((d) => d.role === role && (role === PLAN_ROLE || sameRecord(d.ref, docId)));
    const nextDocs = at < 0 ? [...docs, entry] : docs.map((d, i) => (i === at ? entry : d));

    // The plan it replaces, when it is another record: into references, its acceptance cleared.
    const replaced = role === PLAN_ROLE && at >= 0 && !sameRecord(docs[at]?.ref, docId) ? (docs[at] as ActiveDocument).ref : null;
    let references = (Array.isArray(pkg.control.references) ? pkg.control.references : []) as unknown[];
    let cleared: Pair | null = null;
    if (replaced !== null) {
      if (!references.some((x) => canonical(x) === canonical(replaced))) references = [...references, replaced];
      const old = replacedRecord(ctx, replaced, pkg);
      if (!old.ok) return old;
      cleared = old.value;
    }

    const nextPkg = { ...pkg.control, active_documents: nextDocs, references };
    const nextDoc = withAcceptance(doc, { ref: { workbench_id: pkg.control.workbench_id, record_id: pkg.control.id }, revision: req.revision });
    const checks: Array<[Record<string, unknown>, string, string]> = [
      [nextDoc, RECORD_SCHEMA_ID, `the ${role} record after adopt-plan is not valid`],
      [nextPkg, PACKAGE_SCHEMA_ID, "the record after adopt-plan is not a valid package"],
    ];
    const nextOld = cleared === null ? null : withAcceptance(cleared, null);
    if (nextOld !== null) checks.push([nextOld, RECORD_SCHEMA_ID, "the replaced plan record after adopt-plan is not valid"]);
    for (const [value, schemaId, what] of checks) {
      const v = ctx.validateResult(schemaId, value, what);
      if (!v.ok) return v;
    }

    // The documents first, the package last.
    const writes = [recordWrite(doc.path, nextDoc), ...(cleared !== null && nextOld !== null ? [recordWrite(cleared.path, nextOld)] : []), recordWrite(req.record.path, nextPkg)];
    const pkgWrite = writes[writes.length - 1] as PlannedWrite & { revision: string };
    return {
      ok: true,
      value: {
        writes: writes.map(({ path, bytes }) => ({ path, bytes })),
        result: {
          operation_id: req.operation_id,
          path: req.record.path,
          role,
          document: { path: doc.path, revision: (writes[0] as { revision: string }).revision, narrative: doc.narrative },
          replaced,
          revision: pkgWrite.revision,
          previous_revision: req.expected_revision,
        },
        revisions: Object.fromEntries(writes.map((w) => [w.path, w.revision])),
      },
    };
  };
}
