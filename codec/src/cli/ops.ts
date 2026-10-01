// ---------------------------------------------------------------------------
// The dispatcher: one validated request in, one response out, over the store
// and the kernel.
//
// `dispatch` validates the request against the protocol schema first, so
// every operation below reads typed arguments and no operation can be reached
// with a shape the schema refuses. The operations answered:
//
//   inspect     the workbench's manifest state, the schema ids, the features
//   list        the control files under a store or a container, with kind,
//               status (null for an evidence record) and revision
//   show        one pair: control, revision, narrative hash; an evidence
//               record with its report instead of a narrative
//   validate    strict parse, schema, and the state rules `transitions.ts`
//               owns, for one pair or the whole workbench; for an evidence
//               record its report and the naming rule instead of a narrative
//   initialize  the manifest of a new workbench, written into an existing
//               directory holding nothing but the codec's own state
//               (Prior's request 27); every other target is refused by name
//   create      a new pair: the control record the kernel builds, and the
//               narrative when the request carries its body, in one intent;
//               with `kind: evidence` one immutable evidence record beside a
//               report already on disk, at the path the codec chooses
//               (Prior's FJ02 response 19)
//   transition  a package or an issue, plan, discussion or decision record:
//               `allowed()` over the tables, as a plan function the kernel
//               runs under the caller's expected revision; on a live plan
//               also plan progress, `payload.steps` and `payload.criteria`
//               applied as updates keyed by id, with or without a state
//               change (Prior's FJ02 response 18); a payload field foreign
//               to the record's kind is refused (FJ03c response 37)
//   claim      `transition` into the state the table's `claim` edges enter,
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
//   attach-evidence
//               an evidence record bound into a package's `evidence` at its
//               exact revision, through `bindEvidence`, which the package
//               transition to `done` also runs for every `outcome.evidence`
//               entry
//   reconcile   the deviations shown, nothing repaired: blocked intents, the
//               `validate` findings, every reference and whether it resolves,
//               every evidence binding, every dependency edge and cycle, and
//               status copies in live narratives
//   maintenance the fence a host holds while it moves pairs (request 39):
//               `begin` sets `.json-state/maintenance.json` over a journal
//               with no pending intent, `end` removes the fence it names;
//               while one stands the kernel refuses every other fresh
//               mutation but `initialize`, and reads answer as before
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

import { existsSync, lstatSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { JOURNAL_DIR, OPS_DIR, canonical, fileState, pendingIds, readIntent, type FileState } from "../journal.js";
import {
  EVERY_STATE,
  blockedIntent,
  mutate,
  read,
  readContext,
  recoveryBlocked,
  type KernelOptions,
  type PlanContext,
  type PlanFunction,
  type Planned,
  type PlannedWrite,
  type ReadContext,
  type ReadView,
} from "../kernel.js";
import { allowed, dependencySatisfied, stateRules, stepAllowed, transitions, type Outcome, type TransitionPayload as RulePayload } from "../transitions.js";
import {
  EVIDENCE_SUFFIX,
  KINDS,
  MAINTENANCE_FILE,
  PACKAGE_SCHEMA_ID,
  RECORD_SCHEMA_ID,
  SCHEMA_ID_PREFIX,
  STATE_DIR,
  SUPPORTED_FEATURES,
  EVIDENCE_SCHEMA_ID,
  WORKBENCH_MANIFEST,
  WORKBENCH_SCHEMA_ID,
  controlFiles,
  describeErrors,
  evidenceName,
  evidenceNaming,
  lockProtocolOwns,
  openWorkbench,
  readFence,
  readPair,
  reportProblem,
  resolveCurrent,
  resolveInside,
  revisionOf,
  serialise,
  type Pair,
  type Result,
  type StoreError,
  type Workbench,
} from "../store.js";
import { strictParse } from "../strict-json.js";
import { schemas, validate } from "../validate.js";
import {
  IMPLEMENTED_OPERATIONS,
  LANDS_IN,
  OPERATIONS,
  PROTOCOL_SCHEMA_ID,
  fail,
  isOperation,
  type AdoptPlanRequest,
  type AttachEvidenceRequest,
  type ClaimRequest,
  type CreateEvidenceRequest,
  type CreateRequest,
  type EvidenceRef,
  type InitializeRequest,
  type ListRequest,
  type MaintenanceRequest,
  type ReconcileRequest,
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
    case "initialize":
      return initialize(wb, req, kernel);
    case "create":
      return mutate(wb, req, req.kind === "evidence" ? createEvidencePlan(req) : createPlan(req), kernel);
    case "transition":
      return mutate(wb, req, transitionPlan(req, payloadAdmitted(req)), kernel);
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
    case "attach-evidence":
      return mutate(wb, req, attachEvidencePlan(req), kernel);
    case "reconcile":
      return readable(wb) ?? reading(wb, (view) => reconcile(wb, req, view), kernel);
    case "maintenance":
      return mutate(wb, req, maintenancePlan(req, kernel), kernel);
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

/**
 * `inspect.maintenance` (request 39) follows `pending`: null, or the standing
 * fence `{operation_id, since}`. A fence file that does not read is refused
 * `operation-unknown/maintenance-unreadable`, never answered null, as an
 * unreadable journal is for `pending`; the journal is asked first.
 */
function inspect(wb: Workbench): Response {
  const pending = pendingInitialize(wb);
  if (!pending.ok) return fromStore(pending.error);
  const fence = readFence(wb);
  if (!fence.ok) return fromStore(fence.error);
  return {
    ok: true,
    result: {
      workbench: wb.root,
      state: wb.state,
      id: wb.id,
      manifest: wb.manifest,
      diagnosis: wb.diagnosis,
      pending: pending.value,
      maintenance: fence.value,
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

// --- initialize -----------------------------------------------------------------
//
// `initialize` writes `workbench.json` into an existing directory that holds
// nothing, through the kernel's one sequence, and refuses every other target by
// name (Prior's request 27; `codec/fixtures/prior/REQUESTS.md`, "One qualified
// revision"). One content check decides the target, `initialContent`, and it
// runs at two sites. Under the lock, after recovery and the replay lookup,
// in the plan function, which reads the directory and never the state the
// workbench was opened with, since recovery may have landed a manifest since.
// And once before the lock when `.json-state` is not a directory: no intent,
// stored answer or lock can exist there, so the lock path would answer the
// same, and a refused target keeps its bytes and gains no `.json-state/`. The
// same check runs there when `.json-state/journal` or `.json-state/ops` stands
// and is not a directory, which the sweep under the lock cannot list.
//
// The one exempt entry is a `.json-state/` directory holding only what the
// lock protocol owns (`lockProtocolOwns`) and a `journal/` and an `ops/` with no
// entry but the dot-named ones the sweep removes. Nothing else is guessed at:
// `.DS_Store`, `.gitkeep`, a marker, an empty store directory is an entry.

/** At most this many entries are named in a refusal's detail. */
const NAMED_ENTRIES = 5;

const isDirectoryEntry = (path: string): boolean | null => {
  try {
    return lstatSync(path).isDirectory();
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw e;
  }
};

const namesIn = (dir: string): string[] => {
  try {
    return readdirSync(dir);
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw e;
  }
};

/**
 * Every entry of the directory `root` the exemption does not cover,
 * root-relative and sorted; empty means `initialize` may write. An entry
 * inside `.json-state/` is named by its path there, a committed intent as
 * `.json-state/journal/<operation_id>`.
 */
function initialContent(root: string): string[] {
  const found: string[] = [];
  for (const name of namesIn(root)) {
    const state = join(root, name);
    if (name !== STATE_DIR || isDirectoryEntry(state) !== true) {
      found.push(name);
      continue;
    }
    for (const inner of namesIn(state)) {
      const rel = `${STATE_DIR}/${inner}`;
      if (inner === JOURNAL_DIR || inner === OPS_DIR) {
        const isDir = isDirectoryEntry(join(state, inner));
        if (isDir === false) found.push(rel);
        // A dot-named entry is the sweep's: an intent being built or removed, a temp file.
        else if (isDir === true) for (const n of namesIn(join(state, inner))) if (!n.startsWith(".")) found.push(`${rel}/${n}`);
      } else if (!lockProtocolOwns(state, inner)) {
        found.push(rel);
      }
    }
  }
  return found.sort();
}

/** The refusal the content check answers, or null when the target is empty but for the exemption. */
function contentRefusal(root: string, entries: readonly string[]): StoreError | null {
  if (entries.length === 0) return null;
  const named = entries.slice(0, NAMED_ENTRIES).join(", ") + (entries.length > NAMED_ENTRIES ? ` and ${entries.length - NAMED_ENTRIES} more` : "");
  if (entries.includes(WORKBENCH_MANIFEST)) {
    return { class: "conflict", reason: "manifest-present", detail: `${root} already holds ${WORKBENCH_MANIFEST}, and initialize never replaces a manifest; it holds ${named}` };
  }
  return { class: "conflict", reason: "target-not-empty", detail: `initialize writes a new workbench into an empty directory, and ${root} holds ${named}` };
}

/** The manifest's `required_features`: the feature this contract introduces, never whatever else this codec may support later. */
const INITIAL_FEATURES: readonly string[] = ["json-control-v1"];

/** Whether `.json-state/<name>` stands and does not list as a directory, which the lock holder's sweep could not read. */
const unlistable = (root: string, name: string): boolean => {
  try {
    return !statSync(join(root, STATE_DIR, name)).isDirectory();
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === "ENOENT") return false;
    throw e;
  }
};

async function initialize(wb: Workbench, req: InitializeRequest, options: KernelOptions): Promise<Response> {
  const stateDir = (): boolean => isDirectoryEntry(join(wb.root, STATE_DIR)) === true;
  // A `journal` or `ops` that is no directory: the sweep under the lock would
  // throw before the replay lookup, so the content check answers here.
  const precheck = (): boolean => !stateDir() || unlistable(wb.root, JOURNAL_DIR) || unlistable(wb.root, OPS_DIR);
  if (precheck()) {
    const refused = contentRefusal(wb.root, initialContent(wb.root));
    // A `.json-state/` that appeared meanwhile is a concurrent writer's (on
    // such a target only `initialize` takes the lock), so what this check saw
    // may be that writer's work in flight: the lock path answers instead.
    if (refused !== null && precheck()) return fromStore(refused);
  }
  return mutate(wb, req, initializePlan(req), options, EVERY_STATE);
}

function initializePlan(req: InitializeRequest): PlanFunction {
  return (ctx: PlanContext): Result<Planned> => {
    // Another operation's blocked intent stops this one before the directory is judged.
    const blocked = ctx.blocked[0];
    if (blocked !== undefined) return { ok: false, error: recoveryBlocked(blocked) };
    const refused = contentRefusal(ctx.wb.root, initialContent(ctx.wb.root));
    if (refused !== null) return { ok: false, error: refused };

    const manifest = { schema: schemaField(WORKBENCH_SCHEMA_ID), id: req.id, required_features: [...INITIAL_FEATURES], migration: null, extensions: {} };
    const v = ctx.validateResult(WORKBENCH_SCHEMA_ID, manifest, "the manifest initialize would write is not valid");
    if (!v.ok) return v;
    const bytes = Buffer.from(serialise(manifest), "utf-8");
    const revision = revisionOf(bytes);
    return {
      ok: true,
      value: {
        writes: [{ path: WORKBENCH_MANIFEST, bytes }],
        result: { operation_id: req.operation_id, id: req.id, path: WORKBENCH_MANIFEST, revision },
        revisions: { [WORKBENCH_MANIFEST]: revision },
      },
    };
  };
}

/** `inspect.pending`: the committed `initialize`, the workbench UUID its manifest carries, and whether recovery is blocked. */
export interface PendingInitialize {
  operation_id: string;
  id: string;
  blocked: boolean;
}

/**
 * `inspect.pending` (decision 260930-1654, option 3; Prior item 33 as
 * corrected at Prior `ae1ad78`): the committed `initialize` in
 * `.json-state/journal/`, until its intent leaves the journal, whatever else
 * the root holds and whatever `workbench.json` is. It reports the operation
 * and is no permission to initialize afresh; `state` stays the manifest's.
 * `id` is read from the staged manifest after it validates, and `blocked` is
 * the kernel's recovery classification (`blockedIntent`). Journal data that
 * cannot be read, or contradicts itself, is refused and never answered
 * `null`: a committed entry that does not read (its `op` is then unknown), an
 * `initialize` whose writes are not exactly the manifest, a staged manifest
 * that does not validate or carries another id than the intent's recorded
 * answer (`pending-initialize-unreadable`); and more than one committed
 * `initialize` (`pending-initialize-ambiguous`), since one field cannot name
 * two. A journal that cannot be listed for any reason but its absence (a
 * `.json-state` or a `journal` that is no directory, a denied read) is
 * `pending-initialize-unreadable` too, naming the journal and the error code,
 * and never a throw: `inspect` is the gate every reader calls first. No read
 * finishes the intent; an `initialize` request does, under the lock.
 */
function pendingInitialize(wb: Workbench): Result<PendingInitialize | null> {
  const journal = `${STATE_DIR}/${JOURNAL_DIR}`;
  const dirOf = (id: string): string => `${journal}/${id}`;
  /** `what` names its place first: the journal, or the intent's directory. */
  const refusal = (what: string): Result<never> => ({
    ok: false,
    error: { class: "operation-unknown", reason: "pending-initialize-unreadable", detail: `${what}; inspect cannot say whether an initialize is pending, so the intent is to be read and corrected by hand` },
  });
  const unreadable = (id: string, why: string): Result<never> => refusal(`${dirOf(id)}: ${why}`);
  const listed = (): Result<string[]> => {
    try {
      return { ok: true, value: pendingIds(wb) };
    } catch (e) {
      const code = (e as NodeJS.ErrnoException).code ?? "an error without a code";
      return refusal(`${journal}: the journal cannot be listed (${code})`);
    }
  };
  const ids = listed();
  if (!ids.ok) return ids;
  const found: PendingInitialize[] = [];
  for (const name of ids.value) {
    const r = readIntent(wb, name);
    // Gone since the listing: its writer finished, and it is pending no more.
    if (!r.ok || r.value === null) {
      const again = listed();
      if (!again.ok) return again;
      if (!again.value.includes(name)) continue;
    }
    if (!r.ok) return refusal(r.error.detail); // `readIntent`'s detail already begins with the intent's directory
    if (r.value === null) continue;
    const { intent, contents } = r.value;
    if (intent.op !== "initialize") continue;
    const write = intent.writes.length === 1 ? intent.writes[0] : undefined;
    if (write === undefined || write.path !== WORKBENCH_MANIFEST) {
      return unreadable(name, `an initialize intent writes ${intent.writes.map((w) => w.path).join(", ") || "nothing"}, not exactly ${WORKBENCH_MANIFEST}`);
    }
    const parsed = strictParse(contents.get(WORKBENCH_MANIFEST) as Buffer);
    if (!parsed.ok) return unreadable(name, `the staged ${WORKBENCH_MANIFEST}: ${parsed.reason}: ${parsed.detail}`);
    const v = validate(WORKBENCH_SCHEMA_ID, parsed.value);
    if (!v.ok) return unreadable(name, `the staged ${WORKBENCH_MANIFEST} is not valid: ${v.class === "schema-invalid" ? describeErrors(v.errors) : `no schema ${v.schemaId}`}`);
    const id = (parsed.value as Record<string, unknown>).id as string;
    const answered = intent.response.ok ? (intent.response.result as Record<string, unknown> | undefined)?.id : undefined;
    if (answered !== id) return unreadable(name, `the staged ${WORKBENCH_MANIFEST} carries id ${id}, and the intent's recorded answer ${answered === undefined ? "names none" : `names ${JSON.stringify(answered)}`}`);
    found.push({ operation_id: intent.operation_id, id, blocked: blockedIntent(wb, r.value) !== null });
  }
  if (found.length > 1) {
    return {
      ok: false,
      error: { class: "operation-unknown", reason: "pending-initialize-ambiguous", detail: `more than one committed initialize is pending: ${found.map((p) => dirOf(p.operation_id)).join(", ")}; one pending field cannot name them, so they are to be resolved by hand` },
    };
  }
  return { ok: true, value: found[0] ?? null };
}

// --- maintenance ------------------------------------------------------------------
//
// The fence (request 39, the archive revision). The kernel orders it: under the
// lock, sweep and recovery, then the replay lookup, then the fence check, then
// this plan. So a replay of an operation completed before the fence answers its
// stored bytes, a second `begin` under any id meets the fence, and an `end`
// reaches this plan only when no fence stands or `fence` names the standing
// one. The plan returns no writes and the fence to set or remove, which the
// kernel applies before it stores the answer `{operation_id, action, since}`;
// `since` is the fence's, so `end` answers the time its `begin` set.

function maintenancePlan(req: MaintenanceRequest, options: KernelOptions): PlanFunction {
  return (ctx: PlanContext): Result<Planned> => {
    if (req.action === "begin") {
      // Pending committed writes are settled first (`## 36`): one recovery could not land stops the fence.
      const blocked = ctx.blocked[0];
      if (blocked !== undefined) return { ok: false, error: recoveryBlocked(blocked) };
      const since = new Date((options.now ?? Date.now)()).toISOString();
      return { ok: true, value: { writes: [], result: { operation_id: req.operation_id, action: "begin", since }, fence: { operation_id: req.operation_id, since } } };
    }
    // The kernel let an `end` through, so the fence it names stands, or none does.
    if (ctx.fence === null) {
      return { ok: false, error: { class: "conflict", reason: "maintenance-not-active", detail: `no maintenance fence stands in ${STATE_DIR}/${MAINTENANCE_FILE}, so there is no fence ${req.fence} to end; inspect names the standing fence, null when there is none` } };
    }
    return { ok: true, value: { writes: [], result: { operation_id: req.operation_id, action: "end", since: ctx.fence.since }, fence: null } };
  };
}

// --- list ---------------------------------------------------------------------

const stateOf = (pair: Pair): unknown =>
  pair.kind === "package" ? pair.control.status : ((pair.control.control as Record<string, unknown> | undefined)?.state ?? null);

function scopeDir(wb: Workbench, scope: string | undefined): { ok: true; dir: string } | { ok: false; response: Response } {
  if (scope === undefined) return { ok: true, dir: wb.root };
  const abs = resolveCurrent(wb, scope, "scope");
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
  return { ok: true, result: { workbench: wb.root, state: wb.state, scope: req.scope ?? null, records } };
}

// --- show ---------------------------------------------------------------------

function show(wb: Workbench, req: ShowRequest, view: ReadView): Response {
  const blocked = view.blockedOn(req.record.path);
  if (blocked !== undefined) return fromStore(recoveryBlocked(blocked));
  const r = readPair(wb, req.record.path);
  if (!r.ok) return fromStore(r.error);
  const { path, kind, control, revision, narrative, report } = r.value;
  const narrativeBlocked = narrative === null ? undefined : view.blockedOn(narrative.path);
  if (narrativeBlocked !== undefined) return fromStore(recoveryBlocked(narrativeBlocked));
  // `report` for an evidence record only, so every other kind's answer keeps FJ01's shape.
  return { ok: true, result: { path, kind, control, revision, narrative, ...(kind === "evidence" ? { report } : {}) } };
}

// --- validate -----------------------------------------------------------------

export interface Finding {
  path: string;
  class: StoreError["class"];
  reason: string;
  detail: string;
}

/**
 * The findings against one pair: the strict reader's, the schema's, the
 * state rules', the narrative's, the workbench id's. An evidence record names
 * no narrative; its findings in that place are its report's and the naming
 * rule's, and only an evidence file can carry them, so a workbench without
 * one reads exactly as before (the recorded `06-validate`, C18).
 */
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
  if (pair.kind === "evidence") {
    for (const e of [reportProblem(pair), evidenceNaming(pair)]) if (e !== null) findings.push({ path, class: e.class, reason: e.reason, detail: e.detail });
  } else if (pair.narrative === null) findings.push({ path, class: "unresolved-reference", reason: "narrative-unnamed", detail: "the record names no narrative" });
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

// --- a plan's steps and criteria, keyed by id ------------------------------------
//
// A plan's `steps` and `criteria` are anchors keyed by a stable `id`; the
// record schema's `uniqueItems` refuses two identical entries but not two
// entries sharing an id. Plan progress updates an entry by its id, which is
// only well-defined over unique ids, so one check refuses a repeat wherever
// such an array enters: a new plan's arrays at `create`, and at `transition`
// the stored arrays and the payload's (Prior's FJ02 response 18).

/** The two progress arrays of a plan, the noun their refusals name, and the field an entry's update writes. */
const PROGRESS: ReadonlyArray<{ field: "steps" | "criteria"; noun: string; value: "state" | "met" }> = [
  { field: "steps", noun: "step", value: "state" },
  { field: "criteria", noun: "criterion", value: "met" },
];

/** The ids `entries` carries more than once, in first-seen order; an entry without a string id is the schema's to judge. */
function repeatedIds(entries: unknown): string[] {
  if (!Array.isArray(entries)) return [];
  const seen = new Set<string>();
  const twice = new Set<string>();
  for (const e of entries) {
    if (!isObject(e) || typeof e.id !== "string") continue;
    if (seen.has(e.id)) twice.add(e.id);
    seen.add(e.id);
  }
  return [...twice];
}

/** `schema-invalid/duplicate-<noun>-id` when `entries` repeats an id; `where` says whose array it is. */
function uniqueIds(noun: string, field: string, entries: unknown, where: string): Result<void> {
  const twice = repeatedIds(entries);
  if (twice.length === 0) return { ok: true, value: undefined };
  return refusal("schema-invalid", `duplicate-${noun}-id`, `${where} ${field}: the id ${twice.join(", ")} appears more than once; a ${noun} is updated by its id, which must name one entry`);
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
  if (req.kind === "plan") {
    for (const { field, noun } of PROGRESS) {
      const unique = uniqueIds(noun, field, payload[field], "the new plan's");
      if (!unique.ok) return unique;
    }
  }
  const next = { schema: schemaField(RECORD_SCHEMA_ID), ...common, kind: req.kind, references: [], control: { ...payload } };
  return { ok: true, value: { next, schemaId: RECORD_SCHEMA_ID } };
}

/**
 * `unknown-scope/archived-path` when a path `create` files under (the scope's
 * container, the narrative, an evidence record's report) lies in `archive/`.
 * It runs first in the plan, so after the replay lookup: a completed create
 * whose pair was archived since still answers its stored bytes. A path
 * `resolveInside` refuses is left to the check that refuses it today.
 */
function archivedTarget(wb: Workbench, paths: ReadonlyArray<string | null>): Result<void> {
  for (const path of paths) {
    if (path === null) continue;
    const r = resolveCurrent(wb, path, "scope");
    if (!r.ok && r.error.reason === "archived-path") return r;
  }
  return { ok: true, value: undefined };
}

function createPlan(req: CreateRequest): PlanFunction {
  return (ctx: PlanContext): Result<Planned> => {
    const outside = archivedTarget(ctx.wb, [req.scope.container, req.narrative.path]);
    if (!outside.ok) return outside;
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

// --- create of an evidence record ---------------------------------------------------
//
// The sole write route for a new evidence record (Prior's FJ02 response 19),
// into the layout decision 260928-2251 set: the record beside the Markdown
// report it records, in a container's `reviews/` or in `shared/reviews/`. The
// report is the reviewer's file and is already on disk; the kernel writes the
// record alone, `serialise(payload)`, and adds nothing to it. Every check
// below refuses with nothing written, in this order: a container or report in
// `archive/` (`archivedTarget`); the id the envelope and
// the payload carry; the payload's workbench; the report's directory against
// the scope, and the container a package directory; the report's name; the
// report on disk at the payload's hash; the id in use nowhere; the
// predecessor; the chosen path free.
//
// The path is a function of the report and the predecessor. A record without
// a predecessor, or whose predecessor names another report, is the report's
// first record, `<basename>.evidence.json`; a collision there is
// `record-exists` and never read as a correction. A predecessor naming the
// same report makes a correction, `<basename>.<n>.evidence.json`, admitted
// only over an unchanged report: the predecessor's `report.sha256` must equal
// the payload's, and the file on disk has that hash by the report check. The
// same report path does not mean an unchanged report, and a changed report
// takes a new basename.
//
// Nothing here reads `host`, `execution_policy` or `verdict`. The kernel
// receives no caller identity it may authorise on, so a label a caller writes
// (`host: prior`, `prior-enforced`, `accept`) confers nothing and is stored as
// sent (Prior's FJ02 response 19); `bindEvidence` checks policy agreement and
// freshness on its own, at `attach-evidence` and at a package's move to `done`.

/**
 * The correction counter for `basename` in `dir`: one above the highest
 * counter present in the directory as it stands, 2 when none is. It is read
 * under the write lock and frozen in the intent and the stored answer, so an
 * identical retry answers the same path, and it never collides with a file
 * that stands. That is the whole guarantee: no durable counter is kept, so a
 * suffix freed by a hand deletion of the highest file can be chosen again,
 * while a gap below the highest is not refilled.
 */
function nextCorrection(wb: Workbench, dir: string, basename: string): Result<number> {
  const abs = resolveInside(wb, dir);
  if (!abs.ok) return abs;
  let highest = 1;
  for (const entry of readdirSync(abs.value)) {
    const name = evidenceName(`${dir}/${entry}`);
    if (name !== null && name.basename === basename && name.correction !== null) highest = Math.max(highest, name.correction);
  }
  return { ok: true, value: highest + 1 };
}

function createEvidencePlan(req: CreateEvidenceRequest): PlanFunction {
  return (ctx: PlanContext): Result<Planned> => {
    const payload = req.payload;
    const report = payload.report;
    const outside = archivedTarget(ctx.wb, [req.scope.container, report.path]);
    if (!outside.ok) return outside;
    if (payload.id !== req.id) return refusal("schema-invalid", "id-mismatch", `the envelope's id is ${req.id}; the payload's is ${payload.id}`);
    if (payload.workbench_id !== ctx.wb.id) {
      return refusal("unknown-scope", "foreign-workbench-id", `the payload carries workbench_id ${payload.workbench_id}; this workbench is ${String(ctx.wb.id)}`);
    }

    // The report sits in the scope's reviews/ store, in a package directory or in shared/.
    const { container } = req.scope;
    const dir = `${container ?? "shared"}/${REVIEWS_STORE}`;
    const slash = report.path.lastIndexOf("/");
    if (report.path.slice(0, Math.max(slash, 0)) !== dir) {
      return refusal("unknown-scope", "store-kind-mismatch", `create evidence: the scope's store is ${dir}/, and an evidence record sits beside its report there; the report is ${report.path}`);
    }
    if (container !== null) {
      const holder = `${container}/package.json`;
      const pkg = ctx.readPair(holder);
      if (!pkg.ok && pkg.error.reason !== "record-not-found") return pkg;
      if (!pkg.ok || pkg.value.kind !== "package") return refusal("unknown-scope", "container-missing", `${container} is not a package directory: ${holder} ${pkg.ok ? `is a ${pkg.value.kind} record` : "does not exist"}`);
    }

    // The report's name: marker-free, and `<basename>.evidence.json` must read back as its first record.
    const name = report.path.slice(slash + 1);
    const basename = name.endsWith(".md") ? name.slice(0, -".md".length) : null;
    const first = `${dir}/${basename ?? name}${EVIDENCE_SUFFIX}`;
    const reading = evidenceName(first);
    if (basename === null || !markerlessName().test(name) || reading === null || reading.correction !== null || reading.report !== report.path) {
      return refusal("schema-invalid", "report-name", `${name} is not a report name an evidence record can pair with: a marker-free YYMMDD-HHMM-<topic>.md whose last dotted segment is no correction counter, so that ${first} reads back as its first record`);
    }

    // The report on disk at the payload's hash, judged as `validate` judges a stored record.
    const stored = fileHash(ctx.wb, report.path);
    if (!stored.ok) return stored;
    const bytes = Buffer.from(serialise(payload), "utf-8");
    const revision = revisionOf(bytes);
    const candidate: Pair = { path: first, kind: "evidence", schemaId: EVIDENCE_SCHEMA_ID, control: payload, bytes, revision, narrative: null, report: { path: report.path, sha256: report.sha256, stored: stored.value } };
    const problem = reportProblem(candidate);
    if (problem !== null) return { ok: false, error: problem };

    const taken = ctx.resolveRecordId(req.id);
    if (taken.ok) return refusal("conflict", "id-in-use", `the id ${req.id} is carried by ${taken.value.path}`);
    if (taken.error.reason !== "record-not-found") return refusal("conflict", "id-in-use", taken.error.detail);

    let path = first;
    if (payload.predecessor !== null) {
      const hit = resolveRecordRef(ctx, payload.predecessor);
      if (!hit.ok) return hit;
      const got = ctx.readPair(hit.value.path);
      if (!got.ok) return got;
      const pred = got.value;
      if (pred.kind !== "evidence") return refusal("unresolved-reference", "not-evidence", `the predecessor ${payload.predecessor.record_id} is the ${pred.kind} record ${pred.path}; a correction names an evidence record`);
      const pinned = payload.predecessor.revision;
      if (pinned !== undefined && pred.revision !== pinned) {
        return refusal("missing-evidence", "evidence-revision-mismatch", `the predecessor ${pred.path} is stored at ${pred.revision}; the payload pins ${pinned}`);
      }
      if (pred.report?.path === report.path) {
        if (pred.report.sha256 !== report.sha256) {
          return refusal("conflict", "predecessor-report-changed", `the predecessor ${pred.path} records ${report.path} at ${String(pred.report.sha256)}; this record names ${report.sha256}. A correction under the same basename is over an unchanged report; a changed report takes a new basename`);
        }
        const n = nextCorrection(ctx.wb, dir, basename);
        if (!n.ok) return n;
        path = `${dir}/${basename}.${n.value}${EVIDENCE_SUFFIX}`;
      }
    }

    const standing = fileHash(ctx.wb, path);
    if (!standing.ok) return standing;
    if (standing.value !== null) return refusal("conflict", "record-exists", `${path} exists; an evidence record is immutable once accepted, and a record without a predecessor naming this report is its first record, never a correction`);

    return {
      ok: true,
      value: {
        writes: [{ path, bytes }],
        result: { operation_id: req.operation_id, path, kind: "evidence", revision, report: { path: report.path, sha256: report.sha256 } },
        revisions: { [path]: revision },
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
 * Per target kind, the `transition` payload fields it admits (Prior's FJ03c
 * response 37): the payload properties of the protocol schema's `transition`
 * branch that are control fields of the kind. `ops.test.ts` derives the table
 * from those schema positions, as the Claude client's `PAYLOAD_FIELDS` test
 * does, and pins it to Prior's table. Evidence has no row: it is immutable
 * and refused before the payload is read.
 */
export const TRANSITION_PAYLOAD_FIELDS: Readonly<Record<string, readonly string[]>> = {
  package: ["claim", "outcome"],
  issue: ["disposition"],
  plan: ["steps", "criteria"],
  decision: ["answer_ref", "implementation_ref", "superseded_by", "deferral"],
  discussion: [],
};

/**
 * The `transition` operation's own check on the caller's payload: a present
 * key outside the target kind's row, `null` included, is refused, never
 * dropped. It is the precheck of the `transition` entry alone, so it runs
 * after the record's kind is read and before any rule, intent or write; the
 * payload `claim` and `release` compose is the kernel's, not the caller's.
 * Within the row the target state's rules decide, as before.
 */
function payloadAdmitted(req: TransitionRequest): (pair: Pair) => Result<void> {
  return (pair) => {
    const admitted = TRANSITION_PAYLOAD_FIELDS[pair.kind] ?? [];
    const foreign = Object.keys(req.payload ?? {}).filter((k) => !admitted.includes(k));
    if (foreign.length === 0) return { ok: true, value: undefined };
    const row = admitted.length > 0 ? admitted.join(", ") : "no field";
    const carried = foreign.map((f) => {
      const on = Object.keys(TRANSITION_PAYLOAD_FIELDS).filter((k) => TRANSITION_PAYLOAD_FIELDS[k]?.includes(f));
      return on.length > 0 ? `${f} (admitted on ${on.join(", ")})` : f;
    });
    return refusal("schema-invalid", "payload-field-not-admitted", `${req.record.path} is a record of kind ${pair.kind}, whose transition payload admits ${row}; it carries ${carried.join(", ")}`);
  };
}

/**
 * `transition` as a plan function: the pair, the caller's expected revision,
 * the table's edge and target-state rules, the references the payload brings
 * resolved, and the record after the move validated against its schema.
 * The answer's shape is FJ01's for every kind.
 *
 * `precheck` is each entry's own check: `payloadAdmitted` for `transition`,
 * the claim and release conditions for `claim` and `release`. It runs after
 * the caller's revision and before the table, and may only refuse. Everything after it,
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
    if (pair.kind === "evidence") {
      return refusal("conflict", "evidence-immutable", `${req.record.path} is an evidence record, which has no lifecycle and is immutable once accepted (spec 4.4); a correction is a new record naming it as predecessor`);
    }
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
    if (pair.kind === "package" && req.to === EVIDENCE_CHECKED_ON) {
      const outcome = next.outcome as { evidence?: EvidenceRef[] } | null;
      for (const binding of outcome?.evidence ?? []) {
        const bound = bindEvidence(ctx, pair, binding);
        if (!bound.ok) return bound;
      }
    }

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
  } else if (kind === "plan") {
    const progressed = planProgress(control, from, to, payload);
    if (!progressed.ok) return progressed;
    return { ok: true, value: { from, next: { ...pair.control, control: { ...control, state: to, ...progressed.value } }, schemaId: RECORD_SCHEMA_ID } };
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

type ProgressEntry = Record<string, unknown> & { id: string };

/**
 * A plan's transition, checks 2 to 7 of plan progress (Prior's FJ02 response
 * 18; check 1, the two fields on another kind, is the plan row of
 * `TRANSITION_PAYLOAD_FIELDS`, which `payloadAdmitted` checks): the
 * control fields the move writes besides `state`, which are the progress
 * arrays the payload carries and nothing else. `acceptance` and the record's
 * `references` are never written here, so an adoption and its bindings stay
 * as they are.
 *
 * `to` equal to the stored state is admitted only when the payload carries
 * progress into a live plan and changes a value: the exception is for
 * progress, never a general self-transition, and a terminal plan is history.
 * Every other `to` is the table's edge, exactly as a move without progress.
 */
function planProgress(control: Record<string, unknown>, from: string, to: string, payload: TransitionPayload): Result<Record<string, unknown>> {
  const carried = PROGRESS.filter(({ field }) => payload[field] !== undefined);

  // 2. The state.
  if (to !== from || carried.length === 0) {
    const rule = allowed("plan", from, to);
    if (!rule.ok) return refused(rule);
  } else if (isTerminal("plan", from)) {
    return refused({ class: "conflict", reason: `plan: ${from} is terminal (${transitions().kinds["plan"]?.reopen ?? "no edge leaves it"}); plan progress is never written into it` });
  }

  // 3. Every id unique on both sides, and every id the payload names one the stored plan has.
  const arrays: Array<{ field: string; value: string; stored: ProgressEntry[]; updates: ProgressEntry[] }> = [];
  for (const { field, noun, value } of carried) {
    const stored = (Array.isArray(control[field]) ? control[field] : []) as ProgressEntry[];
    const updates = payload[field] as ProgressEntry[];
    for (const [entries, where] of [
      [stored, "the stored plan's"],
      [updates, "the payload's"],
    ] as const) {
      const unique = uniqueIds(noun, field, entries, where);
      if (!unique.ok) return unique;
    }
    const known = new Set(stored.map((e) => e.id));
    const unknown = updates.filter((u) => !known.has(u.id)).map((u) => u.id);
    if (unknown.length > 0) {
      return refusal("unresolved-reference", `unknown-${noun}-id`, `the payload's ${field} names ${unknown.join(", ")}, which the stored plan lacks; plan progress updates the ${field} it has and never adds one`);
    }
    arrays.push({ field, value, stored, updates });
  }

  // 4. Each step whose state changes moves along the step table; an entry equal to the stored one is not checked.
  // 5. A criterion takes any `met` the schema admits: re-evaluation has no direction.
  const byId = (entries: ProgressEntry[]): Map<string, ProgressEntry> => new Map(entries.map((e) => [e.id, e]));
  let changed = false;
  for (const { field, value, stored, updates } of arrays) {
    const was = byId(stored);
    for (const u of updates) {
      const before = (was.get(u.id) as ProgressEntry)[value];
      if (before === u[value]) continue;
      changed = true;
      if (field !== "steps") continue;
      const rule = stepAllowed(String(before), String(u[value]));
      if (!rule.ok) return { ok: false, error: { class: rule.class, reason: "transition-refused", detail: `step ${u.id}: ${rule.reason}` } };
    }
  }

  // 6. A move to the stored state that changes nothing is no move.
  if (to === from && !changed) {
    return refused({ class: "conflict", reason: `plan: to is the stored state ${from} and the payload changes no step or criterion; staying in a state is admitted for plan progress only` });
  }

  // 7. The stored arrays with the named entries' values replaced in place; order and every other entry untouched.
  const fields: Record<string, unknown> = {};
  for (const { field, value, stored, updates } of arrays) {
    const next = byId(updates);
    fields[field] = stored.map((e) => {
      const u = next.get(e.id);
      return u === undefined ? e : { ...e, [value]: u[value] };
    });
  }
  return { ok: true, value: fields };
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
function resolveRecordRef(ctx: Pick<PlanContext, "wb" | "resolveRecordId">, ref: { workbench_id: unknown; record_id: string }): Result<{ path: string; id: string }> {
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

/** The package a `record_ref` names, resolved in this workbench: a record kind or an evidence record is `not-a-package`. */
function resolvePackage(ctx: Pick<PlanContext, "wb" | "readPair" | "resolveRecordId">, ref: RecordRef, role: string): Result<Pair> {
  const hit = resolveRecordRef(ctx, ref);
  if (!hit.ok) return hit;
  const pair = ctx.readPair(hit.value.path);
  if (!pair.ok) return pair;
  if (pair.value.kind !== "package") return refusal("unresolved-reference", "not-a-package", `the ${role} ${ref.record_id} is the ${pair.value.kind} record ${hit.value.path}; it must be a package`);
  return pair;
}

/** Every package's `depends_on` targets in this workbench, by package id: the edges the cycle check walks. */
function dependencyEdges(ctx: Pick<PlanContext, "wb" | "readPair">): Map<string, string[]> {
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

// --- evidence -----------------------------------------------------------------------
//
// A package binds an evidence record through an `evidence_ref`: the record's
// id at the exact revision of its stored bytes, and the execution policy the
// binding claims. `bindEvidence` is the one check of such a binding, and it
// runs wherever one is written or relied on: `attach-evidence` before it
// appends the binding, the package transition to `done` for every
// `outcome.evidence` entry, and `reconcile` to report a stale one. A binding holds while the evidence record is the one bound (the id
// resolves to an evidence file whose stored bytes hash to the pinned
// revision), sits beside the report it names (the naming rule, C2), belongs
// to this workbench, was produced under the policy the binding claims (an
// import never upgrades claude-guided, and neither does a binding), was
// produced against the brief as it stands now and, when it names one,
// against the plan revision in force, and its report is on disk at the hash
// it names. The package's status is not read: a status change alone never
// makes a binding stale, a brief change does (spec section 9).

/** The package state whose transition checks every binding its outcome carries. */
const EVIDENCE_CHECKED_ON = "done";

/** What `bindEvidence` reads: under the lock for a mutation, under the read protocol for `reconcile`. */
export type EvidenceContext = Pick<PlanContext, "wb" | "readPair" | "resolveRecordId">;

/** The revision of the plan in force: the `role: plan` entry of the package's `active_documents`, or null when it has none. */
function activePlanRevision(pkg: Pair): string | null {
  const docs = Array.isArray(pkg.control.active_documents) ? pkg.control.active_documents : [];
  const plan = docs.find((d) => isObject(d) && d.role === PLAN_ROLE);
  return isObject(plan) && typeof plan.revision === "string" ? plan.revision : null;
}

/** Checks `binding` against the evidence record it names and the package `pkg` as it stands; the record when the binding holds. */
export function bindEvidence(ctx: EvidenceContext, pkg: Pair, binding: EvidenceRef): Result<Pair> {
  const id = binding.ref.record_id;
  const hit = resolveRecordRef(ctx, binding.ref);
  if (!hit.ok) return hit;
  const got = ctx.readPair(hit.value.path);
  if (!got.ok) return got;
  const ev = got.value;
  if (ev.kind !== "evidence") return refusal("unresolved-reference", "not-evidence", `${id} is the ${ev.kind} record ${ev.path}; an evidence binding names a fusion.evidence/v1 record`);
  if (ev.revision !== binding.ref.revision) {
    return refusal("missing-evidence", "evidence-revision-mismatch", `${ev.path} is stored at ${ev.revision}; the binding names ${binding.ref.revision}`);
  }
  const v = validate(EVIDENCE_SCHEMA_ID, ev.control);
  if (!v.ok) return refusal("schema-invalid", "evidence-invalid", `${ev.path}: ${v.class === "schema-invalid" ? describeErrors(v.errors) : `no schema ${v.schemaId}`}`);
  const naming = evidenceNaming(ev);
  if (naming !== null) return { ok: false, error: naming };
  const record = ev.control;
  if (ctx.wb.id !== null && record.workbench_id !== ctx.wb.id) {
    return refusal("unknown-scope", "foreign-workbench-id", `${ev.path} carries workbench_id ${JSON.stringify(record.workbench_id)}; this workbench is ${ctx.wb.id}`);
  }
  if (record.execution_policy !== binding.policy) {
    return refusal("schema-invalid", "policy-mismatch", `${ev.path} was produced ${String(record.execution_policy)}; the binding claims ${binding.policy}, and a binding never changes the policy a result was produced under`);
  }
  const brief = pkg.narrative?.sha256 ?? null;
  if (record.brief_revision !== brief) {
    return refusal("missing-evidence", "brief-changed", `${ev.path} was produced against the brief at ${String(record.brief_revision)}; ${pkg.narrative === null ? "the package names no brief" : `${pkg.narrative.path} is ${brief ?? "absent"}`} now`);
  }
  if (record.plan_revision !== null) {
    const plan = activePlanRevision(pkg);
    if (plan === null) return refusal("missing-evidence", "no-active-plan", `${ev.path} was produced against the plan at ${String(record.plan_revision)}; the package has no plan in force`);
    if (plan !== record.plan_revision) return refusal("missing-evidence", "plan-changed", `${ev.path} was produced against the plan at ${String(record.plan_revision)}; the plan in force is at ${plan}`);
  }
  const report = reportProblem(ev);
  if (report !== null) return { ok: false, error: report };
  return { ok: true, value: ev };
}

/**
 * Appends a binding to a live package's `evidence`, once `bindEvidence`
 * holds. The same record at the same revision bound twice is a conflict; the
 * package schema's `uniqueItems` would catch the identical entry only.
 */
function attachEvidencePlan(req: AttachEvidenceRequest): PlanFunction {
  return (ctx: PlanContext): Result<Planned> => {
    const r = livePackage(ctx, req, "attach-evidence", "binds evidence to a package");
    if (!r.ok) return r;
    const pkg = r.value;
    const bound = (Array.isArray(pkg.control.evidence) ? pkg.control.evidence : []) as EvidenceRef[];
    const { record_id, revision: at } = req.evidence.ref;
    if (bound.some((b) => isObject(b.ref) && b.ref.record_id === record_id && b.ref.revision === at)) {
      return refusal("conflict", "evidence-already-bound", `the package binds ${record_id} at ${at} already`);
    }
    const ev = bindEvidence(ctx, pkg, req.evidence);
    if (!ev.ok) return ev;

    const next = { ...pkg.control, evidence: [...bound, req.evidence] };
    const v = ctx.validateResult(PACKAGE_SCHEMA_ID, next, "the record after attach-evidence is not a valid package");
    if (!v.ok) return v;
    const w = recordWrite(req.record.path, next);
    return {
      ok: true,
      value: {
        writes: [w],
        result: { operation_id: req.operation_id, path: req.record.path, evidence: req.evidence, evidence_record: ev.value.path, revision: w.revision, previous_revision: req.expected_revision },
        revisions: { [req.record.path]: w.revision },
      },
    };
  };
}

// --- reconcile ----------------------------------------------------------------------
//
// The deviations shown, nothing repaired (spec section 6, "Abweichungen
// zeigen"). A read under the kernel's read protocol, so it takes the lock and
// recovers only when a pending intent may still belong to a live writer; an
// intent left blocked is reported and never resolved. Six sections, each one
// kind of statement:
//
//   intents       every pending intent left blocked: the operation it belongs
//                 to, and where each file it names stands (post, pre, diverged)
//   records       every `validate` finding, so one call covers both, and an
//                 evidence file outside a `reviews/` store (decision
//                 260928-2251: evidence lives beside its report in a
//                 container's `reviews/` or in `shared/reviews/`)
//   references    every reference a control record carries and whether it
//                 resolves here: resolved, unresolved, ambiguous, foreign, or
//                 unchecked (a legacy citation, a git commit, a named external
//                 target, none of which this kernel resolves)
//   evidence      every binding of a package, `evidence` and `outcome.evidence`,
//                 through `bindEvidence`: fresh, or stale with the refusal
//   dependencies  every `depends_on` edge through `dependencySatisfied` against
//                 the target's live JSON, satisfied or unmet; then every cycle
//                 of the workbench's graph, including one no single
//                 `set-dependencies` closed (that operation refuses only a
//                 cycle through the package it sets, so a merge or a hand edit
//                 can leave one)
//   narratives    a status line (`**Status:**`, `**Claim:**`, `**Mode:**`,
//                 `**Depends-on:**`, `**Active spec/plan:**`) in the head of a
//                 live record's narrative, and a narrative that is a
//                 merge-conflict file; a terminal record's narrative is history
//                 and is not read
//
// A record whose control file the strict reader or its schema refuses is
// reported under `records` and contributes to no other section: what it says
// is not decided. The walk never enters the root's `archive/`, and a scope in
// it is `archived-path`. Scope narrows the walk as `list`'s does; references still
// resolve against the whole workbench, an intent is reported when a path it
// names is in scope, and a cycle when a package of the scope is on it. The
// report carries no clock value and no absolute path but the echoed
// `workbench`: a resolution failure is reported by class and reason, since the
// detail of a missing record names the root.

/** The store an evidence record lives in, in a container or in `shared/`. */
const REVIEWS_STORE = "reviews";
const EVIDENCE_PLACE = new RegExp(`^(shared|${STORE_OF.package}/[^/]+)/${REVIEWS_STORE}/[^/]+$`);

/** An evidence file outside a `reviews/` store: a finding of `reconcile` only, so `validate`'s set is FJ01's (C18). */
function placementFinding(path: string): Finding | null {
  if (!path.endsWith(EVIDENCE_SUFFIX) || EVIDENCE_PLACE.test(path)) return null;
  return {
    path,
    class: "unknown-scope",
    reason: "evidence-outside-reviews",
    detail: `${path} is an evidence record outside a ${REVIEWS_STORE}/ store; it lives beside its report in <container>/${REVIEWS_STORE}/ or shared/${REVIEWS_STORE}/`,
  };
}

interface IntentEntry {
  operation_id: string;
  op: string;
  files: Array<{ path: string; state: FileState }>;
}

type ReferenceStatus = "resolved" | "unresolved" | "ambiguous" | "foreign" | "unchecked";

interface ReferenceEntry {
  path: string;
  /** A JSON pointer into the control record. */
  at: string;
  /** On an `/active_documents/<i>/ref` entry alone, whatever its status: the binding's stored role, when that is `plan` or `spec`. */
  role?: ActiveDocument["role"];
  status: ReferenceStatus;
  /** The control file or artefact it resolves to. */
  target?: string;
  class?: StoreError["class"];
  reason?: string;
}

interface EvidenceEntry {
  path: string;
  at: string;
  record_id: string;
  revision: string;
  policy: string;
  status: "fresh" | "stale";
  class?: StoreError["class"];
  reason?: string;
}

interface EdgeEntry {
  path: string;
  at: string;
  target: string;
  condition: string;
  status: "satisfied" | "unmet";
  class?: StoreError["class"];
  reason?: string;
  detail?: string;
}

interface CycleEntry {
  status: "cycle";
  /** The package ids around the cycle, the first repeated last. */
  ids: string[];
}

interface NarrativeEntry {
  path: string;
  narrative: string;
  class: StoreError["class"];
  reason: string;
  line: string;
  line_number: number;
}

const field = (v: unknown, key: string): unknown => (isObject(v) ? v[key] : undefined);

/** A place a control record carries a reference; `binding` is the `active_documents` entry that carries it, when one does. */
export interface ReferenceSite {
  at: string;
  value: unknown;
  binding?: unknown;
}

/**
 * Every place a control record carries a reference, as a JSON pointer and the
 * value there, in the schema's field order; an absent or null one is no site.
 * The set is every schema position that reaches a record, artefact or
 * evidence reference, a `reference`, or a narrative, the record's own
 * narrative excepted and `extensions` and `legacy_fields` opaque: a test
 * derives it from the schemas and holds this function to it, so the host can
 * decide archival safety from `reconcile` alone (request 40; decision
 * 261001-1030, option 1). An evidence record's report and a `provenance.backup`
 * are artefact references, resolved by hash as every artefact is.
 */
export function referenceSites(pair: Pair): ReferenceSite[] {
  const sites: ReferenceSite[] = [];
  const add = (at: string, value: unknown): void => {
    if (value !== null && value !== undefined) sites.push({ at, value });
  };
  const each = (at: string, items: unknown, key?: string): void => {
    if (!Array.isArray(items)) return;
    items.forEach((item, i) => add(key === undefined ? `${at}/${i}` : `${at}/${i}/${key}`, key === undefined ? item : field(item, key)));
  };
  const c = pair.control;
  const backup = (): void => add("/provenance/backup", field(c.provenance, "backup"));
  if (pair.kind === "evidence") {
    add("/report", c.report);
    add("/predecessor", c.predecessor);
    return sites;
  }
  if (pair.kind === "package") {
    add("/origin/ref", field(c.origin, "ref"));
    const source = field(c.mode, "source");
    // A legacy source is the imported header line, which names nothing.
    if (field(source, "kind") === "user-word") add("/mode/source/ref", field(source, "ref"));
    else if (field(source, "kind") !== "legacy") add("/mode/source", source);
    each("/depends_on", c.depends_on, "target");
    if (Array.isArray(c.active_documents)) {
      c.active_documents.forEach((binding, i) => {
        const value = field(binding, "ref");
        if (value !== null && value !== undefined) sites.push({ at: `/active_documents/${i}/ref`, value, binding });
      });
    }
    each("/references", c.references);
    each("/evidence", c.evidence, "ref");
    each("/outcome/evidence", field(c.outcome, "evidence"), "ref");
    backup();
    return sites;
  }
  each("/references", c.references);
  backup();
  const control = c.control;
  if (pair.kind === "issue") add("/control/disposition/reason_ref", field(field(control, "disposition"), "reason_ref"));
  else if (pair.kind === "plan") add("/control/acceptance/ref", field(field(control, "acceptance"), "ref"));
  else if (pair.kind === "discussion") each("/control/outcome_refs", field(control, "outcome_refs"));
  else if (pair.kind === "decision") {
    for (const f of DECISION_FIELDS) add(f === "deferral" ? "/control/deferral/target" : `/control/${f}`, f === "deferral" ? field(field(control, f), "target") : field(control, f));
  }
  return sites;
}

/**
 * One reference, resolved as a mutation resolves it: an id through
 * `indexedContext`, which answers what the kernel's walk answers. An
 * active-document binding's entry carries its stored `role` after `at`, taken
 * from the binding at its source and never from the target, so an unresolved
 * or ambiguous binding carries it too, with no `target` (Prior `a15dfc8`).
 */
function referenceEntry(ctx: ReadContext, path: string, site: ReferenceSite): ReferenceEntry {
  const { value } = site;
  const role = site.binding === undefined ? undefined : field(site.binding, "role");
  const head: Pick<ReferenceEntry, "path" | "at" | "role"> = { path, at: site.at, ...(role === "plan" || role === "spec" ? { role } : {}) };
  if (!isObject(value)) return { ...head, status: "unchecked" }; // a legacy citation string or a git commit
  if (typeof value.record_id === "string") {
    const hit = resolveRecordRef(ctx, { workbench_id: value.workbench_id, record_id: value.record_id });
    if (hit.ok) return { ...head, status: "resolved", target: hit.value.path };
    if (hit.error.reason === "foreign-workbench") return { ...head, status: "foreign" };
    return { ...head, status: hit.error.reason === "ambiguous-reference" ? "ambiguous" : "unresolved", class: hit.error.class, reason: hit.error.reason };
  }
  if (typeof value.path === "string" && typeof value.sha256 === "string") {
    const hit = ctx.resolveArtefact({ path: value.path, sha256: value.sha256 });
    return hit.ok ? { ...head, status: "resolved", target: hit.value.path } : { ...head, status: "unresolved", class: hit.error.class, reason: hit.error.reason };
  }
  if (typeof value.project === "string") return { ...head, status: "foreign" };
  return { ...head, status: "unchecked" }; // a named external target
}

/** Every binding a package makes, `evidence` then `outcome.evidence`, through `bindEvidence`. */
function evidenceEntries(ctx: ReadContext, pkg: Pair): EvidenceEntry[] {
  const bound = pkg.control.evidence as EvidenceRef[];
  const outcome = pkg.control.outcome as { evidence: EvidenceRef[] } | null;
  const sites: Array<[string, EvidenceRef[]]> = [
    ["/evidence", bound],
    ["/outcome/evidence", outcome?.evidence ?? []],
  ];
  return sites.flatMap(([at, bindings]) =>
    bindings.map((binding, i): EvidenceEntry => {
      const base = { path: pkg.path, at: `${at}/${i}`, record_id: binding.ref.record_id, revision: binding.ref.revision, policy: binding.policy };
      const r = bindEvidence(ctx, pkg, binding);
      return r.ok ? { ...base, status: "fresh" } : { ...base, status: "stale", class: r.error.class, reason: r.error.reason };
    }),
  );
}

/** The evidence records an outcome binds, as `dependencySatisfied` reads them; one that does not resolve to an evidence record is left out, and the condition reports it. */
function evidenceRecords(ctx: ReadContext, outcome: Outcome | null): Record<string, { verdict: string; revision: string }> {
  const out: Record<string, { verdict: string; revision: string }> = {};
  for (const b of outcome?.evidence ?? []) {
    const hit = resolveRecordRef(ctx, b.ref);
    if (!hit.ok) continue;
    const ev = ctx.readPair(hit.value.path);
    if (!ev.ok || ev.value.kind !== "evidence") continue;
    out[b.ref.record_id] = { verdict: String(ev.value.control.verdict), revision: ev.value.revision };
  }
  return out;
}

/** Every `depends_on` edge of a package against its target's live JSON: a target that does not resolve to a package here is unmet. */
function edgeEntries(ctx: ReadContext, pkg: Pair): EdgeEntry[] {
  const edges = pkg.control.depends_on as SetDependenciesRequest["depends_on"];
  return edges.map((edge, i): EdgeEntry => {
    const base = { path: pkg.path, at: `/depends_on/${i}`, target: edge.target.record_id, condition: edge.condition };
    const target = resolvePackage(ctx, edge.target, "dependency target");
    if (!target.ok) return { ...base, status: "unmet", class: target.error.class, reason: target.error.reason };
    const t = target.value.control;
    const outcome = isObject(t.outcome) ? (t.outcome as unknown as Outcome) : null;
    const rule = dependencySatisfied(edge.condition, { status: String(t.status), outcome, evidence_records: evidenceRecords(ctx, outcome) });
    return rule.ok ? { ...base, status: "satisfied" } : { ...base, status: "unmet", class: rule.class, reason: "dependency-unmet", detail: rule.reason };
  });
}

/**
 * The cycles of the graph, each once: for every package id in sorted order
 * that no cycle reported so far passes through, the first cycle through it in
 * edge order. So every package that lies on a cycle lies on a reported one.
 */
function cyclesOf(edges: ReadonlyMap<string, readonly string[]>): string[][] {
  const covered = new Set<string>();
  const out: string[][] = [];
  for (const id of [...edges.keys()].sort()) {
    if (covered.has(id)) continue;
    const cycle = cycleThrough(id, edges);
    if (cycle === null) continue;
    for (const n of cycle) covered.add(n);
    out.push(cycle);
  }
  return out;
}

const STATUS_COPY = /^\*\*(Status|Claim|Mode|Depends-on|Active spec\/plan):\*\*/;
const CONFLICT_START = /^<{7}( |$)/;
const CONFLICT_END = /^>{7}( |$)/;
const FENCE = /^(```|~~~)/;
const SECTION = /^## /;

/**
 * A live record's narrative: a merge-conflict file is one finding and nothing
 * else is read from it; otherwise every status line in its head (the lines
 * before the first `## ` heading, fenced blocks skipped) is a copy of what the
 * JSON holds. A terminal record's narrative is not read: its markers are
 * history. A missing narrative, or one a blocked intent names, is `records`'.
 */
function narrativeEntries(wb: Workbench, pair: Pair, view: ReadView): NarrativeEntry[] {
  const narrative = pair.narrative;
  if (narrative === null || narrative.sha256 === null) return [];
  if (isTerminal(pair.kind, stateOf(pair))) return [];
  if (view.blockedOn(narrative.path) !== undefined) return [];
  const abs = resolveInside(wb, narrative.path);
  if (!abs.ok) return [];
  const lines = readFileSync(abs.value, "utf-8").split(/\r?\n/);
  const entry = (cls: StoreError["class"], reason: string, i: number): NarrativeEntry => ({ path: pair.path, narrative: narrative.path, class: cls, reason, line: lines[i] as string, line_number: i + 1 });

  const start = lines.findIndex((l) => CONFLICT_START.test(l));
  if (start >= 0 && lines.some((l) => CONFLICT_END.test(l))) return [entry("schema-invalid", "conflict-markers", start)];

  const out: NarrativeEntry[] = [];
  let fenced = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] as string;
    if (FENCE.test(line)) fenced = !fenced;
    else if (!fenced && SECTION.test(line)) break;
    else if (!fenced && STATUS_COPY.test(line)) out.push(entry("conflict", "status-copy-in-narrative", i));
  }
  return out;
}

/**
 * `ctx` with `resolveRecordId` answered from one walk of the workbench, taken
 * on the first call, where the kernel's resolver walks and parses every
 * control file per call: that made `reconcile` quadratic in the record count
 * (issue 260930-1712). The index answers what the kernel's walk answers over
 * the same files: `controlFiles` in its sorted order, a file the strict reader
 * refuses skipped, no blocked-intent filter, the ambiguous detail listing the
 * hits in walk order, and the kernel's two refusals word for word.
 *
 * It serves one run of `reconcile`'s body and nothing else. A mutation
 * resolves through the kernel's own walk, since an index kept across its
 * writes could go stale inside it (discussion 260930-1800, C10); and `read`
 * runs the body again after a consistency retry or a recovery, so every
 * attempt builds its own index over the view it reads (Prior `a15dfc8`).
 */
export function indexedContext(ctx: ReadContext): ReadContext {
  const { wb } = ctx;
  let index: Map<string, string[]> | null = null;
  const build = (): Map<string, string[]> => {
    const hits = new Map<string, string[]>();
    for (const path of controlFiles(wb, wb.root)) {
      const abs = resolveInside(wb, path);
      if (!abs.ok) continue;
      const parsed = strictParse(readFileSync(abs.value));
      if (!parsed.ok) continue;
      const id = (parsed.value as Record<string, unknown>).id;
      if (typeof id !== "string") continue;
      const carriers = hits.get(id);
      if (carriers === undefined) hits.set(id, [path]);
      else carriers.push(path);
    }
    return hits;
  };
  return {
    ...ctx,
    resolveRecordId(id) {
      index ??= build();
      const hits = index.get(id) ?? [];
      if (hits.length === 0) return refusal("unresolved-reference", "record-not-found", `no control file in ${wb.root} carries the id ${id}`);
      if (hits.length > 1) return refusal("conflict", "ambiguous-reference", `the id ${id} is carried by ${hits.join(", ")}`);
      return { ok: true, value: { path: hits[0] as string, id } };
    },
  };
}

function reconcile(wb: Workbench, req: ReconcileRequest, view: ReadView): Response {
  const scope = scopeDir(wb, req.scope);
  if (!scope.ok) return scope.response;
  const within = req.scope === undefined ? null : relative(wb.root, scope.dir).split("\\").join("/");
  const inScope = (path: string): boolean => within === null || path === within || path.startsWith(`${within}/`);
  const ctx = indexedContext(readContext(wb, view.blocked));

  const intents: IntentEntry[] = [];
  for (const b of view.blocked) {
    if (!b.paths.some(inScope)) continue;
    const r = readIntent(wb, b.operation_id);
    if (!r.ok) return fromStore(r.error); // as every read answers an unreadable intent
    if (r.value === null) continue; // removed since the listing: the after-snapshot differs and the read runs again
    intents.push({ operation_id: b.operation_id, op: r.value.intent.op, files: r.value.intent.writes.map((w) => ({ path: w.path, state: fileState(wb, w) })) });
  }

  const paths = controlFiles(wb, scope.dir);
  const records: Finding[] = [];
  const references: ReferenceEntry[] = [];
  const evidence: EvidenceEntry[] = [];
  const dependencies: Array<EdgeEntry | CycleEntry> = [];
  const narratives: NarrativeEntry[] = [];
  const scopedPackages = new Set<string>();
  for (const path of paths) {
    records.push(...blockedFindingOf(wb, path, view), ...findingsOf(wb, path));
    const placed = placementFinding(path);
    if (placed !== null) records.push(placed);

    const r = ctx.readPair(path);
    if (!r.ok || !validate(r.value.schemaId, r.value.control).ok) continue; // reported under records
    const pair = r.value;
    for (const site of referenceSites(pair)) references.push(referenceEntry(ctx, path, site));
    if (pair.kind === "package") {
      scopedPackages.add(pair.control.id as string);
      evidence.push(...evidenceEntries(ctx, pair));
      dependencies.push(...edgeEntries(ctx, pair));
    }
    narratives.push(...narrativeEntries(wb, pair, view));
  }
  for (const ids of cyclesOf(dependencyEdges(ctx))) {
    if (ids.some((id) => scopedPackages.has(id))) dependencies.push({ status: "cycle", ids });
  }

  return {
    ok: true,
    result: { workbench: wb.root, state: wb.state, scope: req.scope ?? null, checked: paths.length, intents, records, references, evidence, dependencies, narratives },
  };
}
