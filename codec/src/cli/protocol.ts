// ---------------------------------------------------------------------------
// The stdin/stdout protocol of `fusion-record`: one request in, one response
// out, both JSON, as Prior's `concept/fusion-json-workbench-spec.md` section 6
// lays it out.
//
// The sixteen operations, the spec's table and `maintenance` (request 39, the
// archive revision), are the request union below, each with its argument shape. `IMPLEMENTED_OPERATIONS` names the ones this
// codec answers, and `inspect` reports it; every other one is answered
// `operation-unknown/not-implemented` with a detail naming the package that
// lands it (`LANDS_IN`), so that a caller written against the whole table gets
// a typed refusal and never a parse error. The token names no package, so it
// stays true as packages land. The shapes of the operations not yet answered
// are the contract their packages fill in; they are validated today so that a
// request against them fails for the right reason.
//
// A request is validated against `schemas/protocol.schema.json` (the seventh
// schema, `$id` `urn:fusion:schema:fusion.protocol/v1`) before it is
// dispatched, by the same loader as every record; an invalid request is a
// `schema-invalid` answer, never a crash. The TypeScript below and the JSON
// schema say the same thing twice on purpose: the schema is what both hosts
// validate against, the types are what the dispatcher is written in, and
// `protocol.test.ts` holds the two equal on the operation list and the error
// classes.
//
// Every mutation carries an `operation_id` the caller may reuse: a repeat with
// the same request returns the stored answer, the same id with a different
// request is `conflict/operation-id-reused`. The `workbench` field is the
// absolute path of the workbench root; when absent, `main.ts` takes it from
// `FUSION_WORKBENCH` in the environment, which is what `bin/fusion-record`
// exports after `fusion-workbench-root`.
// ---------------------------------------------------------------------------

import type { ValidationError } from "../validate.js";

export const PROTOCOL_SCHEMA_ID = "urn:fusion:schema:fusion.protocol/v1";

/** The operations of spec section 6's table, in the table's order, `maintenance` (request 39) after `reconcile`. */
export const OPERATIONS = [
  "inspect",
  "list",
  "show",
  "validate",
  "initialize",
  "create",
  "transition",
  "claim",
  "release",
  "set-mode",
  "set-dependencies",
  "adopt-plan",
  "attach-evidence",
  "reconcile",
  "maintenance",
  "migration",
] as const;

export type Operation = (typeof OPERATIONS)[number];

/** The operations this codec answers with a result; the rest answer `operation-unknown/not-implemented`. */
export const IMPLEMENTED_OPERATIONS: readonly Operation[] = ["inspect", "list", "show", "validate", "initialize", "create", "transition", "claim", "release", "set-mode", "set-dependencies", "adopt-plan", "attach-evidence", "reconcile", "maintenance", "migration"];

/**
 * The package that lands each operation not yet answered: the detail of its
 * `not-implemented` refusal. Empty since FJ04's step 6, which answers the last
 * phases of `migration`; the table stays for an operation the spec adds later.
 */
export const LANDS_IN: Partial<Record<Operation, string>> = {};

/** The typed error classes of spec section 6, in the spec's order. */
export const ERROR_CLASSES = [
  "schema-invalid",
  "unsupported-format",
  "conflict",
  "unknown-scope",
  "missing-evidence",
  "unresolved-reference",
  "operation-unknown",
  "migration-incomplete",
] as const;

export type ErrorClass = (typeof ERROR_CLASSES)[number];

// --- shared argument shapes -------------------------------------------------

/** Names one record pair by the workbench-relative path of its control file. */
export interface RecordSelector {
  path: string;
}

export interface Actor {
  actor: string;
  person: string | null;
}

export interface RecordRef {
  workbench_id: string;
  record_id: string;
  revision?: string;
  display?: string;
}

export interface EvidenceRef {
  ref: RecordRef & { revision: string };
  policy: "claude-guided" | "prior-enforced";
}

interface Base<Op extends Operation> {
  op: Op;
  /** Absolute path of the workbench root. Defaults to `FUSION_WORKBENCH` in `main.ts`. */
  workbench?: string;
}

interface Mutation<Op extends Operation> extends Base<Op> {
  operation_id: string;
  record: RecordSelector;
  expected_revision: string;
  actor: Actor;
}

// --- the reads, and transition ------------------------------------------------

export type InspectRequest = Base<"inspect">;

export interface ListRequest extends Base<"list"> {
  /** A store or a container, workbench-relative (`work-packages`, `shared/issues`, `work-packages/<d>`); absent is the whole workbench. */
  scope?: string;
}

export interface ShowRequest extends Base<"show"> {
  record: RecordSelector;
}

export interface ValidateRequest extends Base<"validate"> {
  /** One pair; absent is the whole workbench. */
  record?: RecordSelector;
}

/**
 * A cross-reference in the common schema's union: a record, an artefact, a
 * foreign reference, or a legacy citation string.
 */
export type Reference = RecordRef | ArtefactRef | ForeignRef | string;

export interface ArtefactRef {
  path: string;
  sha256: string;
  kind: string;
}

export interface ForeignRef {
  project: string;
  citation: string;
}

/** A deferred decision's target (a reference, or a named external target) and who ruled. */
export interface Deferral {
  target: Reference | { kind: "external"; name: string };
  ruled_by: Actor;
}

/** What the target state may need to see, in the record's own field shapes. */
export interface TransitionPayload {
  claim?: { checkout_id: string; person: string | null; claimed_at: string | null } | null;
  outcome?: { class: string; reason: string; evidence: EvidenceRef[] } | null;
  disposition?: { kind: string; reason_ref: Reference | null } | null;
  answer_ref?: Reference | null;
  /** A git commit (a hex object name) or a reference. */
  implementation_ref?: string | Reference | null;
  superseded_by?: RecordRef | null;
  deferral?: Deferral | null;
  /**
   * Plan progress (Prior's FJ02 response 18): updates keyed by the id of a
   * step or criterion the stored plan already has. Read on a plan record
   * only, refused on any other kind; never adds, removes or reorders an entry.
   */
  steps?: Array<{ id: string; state: "open" | "in_progress" | "done" }>;
  criteria?: Array<{ id: string; met: boolean | null }>;
}

export interface TransitionRequest extends Mutation<"transition"> {
  to: string;
  reason: string;
  payload?: TransitionPayload;
}

// --- the operations FJ02 and FJ04 land ------------------------------------------

/**
 * `initialize` (Prior's request 27): the manifest of a new workbench, written
 * by the codec into an existing empty directory. `workbench` is required on
 * this branch and `id` is the new workbench's UUID; the codec composes the
 * manifest itself, so a request carrying one is `schema-invalid/request`.
 */
export interface InitializeRequest extends Base<"initialize"> {
  workbench: string;
  operation_id: string;
  id: string;
}

export interface CreateRequest extends Base<"create"> {
  operation_id: string;
  id: string;
  kind: "package" | "issue" | "plan" | "discussion" | "decision";
  filed_by: Actor;
  origin: { kind: "user-request" | "package" | "campaign" | "legacy-unknown"; ref: RecordRef | null };
  /** The container the pair goes into, or null for `shared/`, and the store within it. */
  scope: { container: string | null; store: string };
  /** With `content` the operation writes both halves of the pair; without it the narrative must already exist. */
  narrative: { path: string; content?: string };
  /** A package's `domain` and `references`; a record's `control` in its kind's initial state. */
  payload: Record<string, unknown>;
}

/**
 * The fields of a `fusion.evidence/v1` record the codec reads when it creates
 * one; the evidence schema is the whole shape, validated with the request.
 * `host`, `execution_policy` and `verdict` are left out on purpose: creation
 * stores them as sent and derives nothing from them.
 */
export interface EvidencePayload {
  schema: string;
  id: string;
  workbench_id: string;
  report: ArtefactRef;
  predecessor: RecordRef | null;
  [field: string]: unknown;
}

/**
 * `create` of an evidence record, its own branch of the protocol (Prior's FJ02
 * request and response 19): the sole write route for a new evidence record,
 * written beside a report already on disk at its declared hash. The codec
 * chooses the file's path and returns it in the answer.
 */
export interface CreateEvidenceRequest extends Base<"create"> {
  operation_id: string;
  id: string;
  kind: "evidence";
  /** The container the record goes into, or null for `shared/`, and its `reviews` store. */
  scope: { container: string | null; store: "reviews" };
  /** The complete record; the codec writes exactly these fields, serialised, and adds nothing. */
  payload: EvidencePayload;
}

/** A package's claim, as `package.claim` and `fusion.common/v1`'s `$defs/claim` shape it. */
export interface Claim {
  checkout_id: string;
  person: string | null;
  claimed_at: string | null;
}

/** The user's consent evidence for a takeover: a record, or the user's word held in a record or an artefact. */
export type TakeoverSource = RecordRef | { kind: "user-word"; ref: RecordRef | ArtefactRef };

/**
 * The administrative takeover of a standing claim (request 62, accepted with
 * corrections in Prior's answer to 62): the complete standing claim the
 * caller inspected, and the evidence of the user's consent. Absent, `claim`
 * is the ordinary operation; the protocol schema refuses `null`.
 */
export interface Takeover {
  previous_claim: Claim;
  source: TakeoverSource;
}

export interface ClaimRequest extends Mutation<"claim"> {
  claim: Claim;
  takeover?: Takeover;
}

export interface ReleaseRequest extends Mutation<"release"> {
  reason: string;
}

export interface SetModeRequest extends Mutation<"set-mode"> {
  mode: { value: "ordinary" | "autonomous"; source: unknown };
}

export interface SetDependenciesRequest extends Mutation<"set-dependencies"> {
  depends_on: Array<{ target: RecordRef; condition: "terminal" | "succeeded" }>;
}

export interface AdoptPlanRequest extends Mutation<"adopt-plan"> {
  plan: RecordRef;
  /** The hash of the plan narrative as accepted. */
  revision: string;
  /** The `active_documents` role the record is bound in; absent means `plan`. */
  role?: "spec" | "plan";
}

export interface AttachEvidenceRequest extends Mutation<"attach-evidence"> {
  evidence: EvidenceRef;
}

export interface ReconcileRequest extends Base<"reconcile"> {
  /** A store or a container, workbench-relative, as `list` takes it; absent is the whole workbench. */
  scope?: string;
}

/**
 * `maintenance` (request 39, the archive revision): the fence a host holds
 * while it moves pairs into `archive/`. `begin` sets it; `end`, under an
 * `operation_id` of its own (a stored answer is keyed by it), removes the
 * fence whose `begin` it names in `fence`. While a fence stands every other
 * fresh mutation but `initialize` is refused `conflict/maintenance-active`.
 */
export type MaintenanceRequest =
  | (Base<"maintenance"> & { operation_id: string; action: "begin" })
  | (Base<"maintenance"> & { operation_id: string; action: "end"; fence: string });

/** A file bound by its bytes (FJ04 contract delta as amended, 45(a)): a workbench-relative path and the sha256 of the exact bytes. */
export interface BoundFile {
  path: string;
  sha256: string;
}

/**
 * `migration` (FJ04 contract delta as amended for Prior `ab9cb59`): the
 * maintenance run of spec section 8, one branch per phase. `survey` is a read
 * and carries no `operation_id`; every other phase does. `proposal` is the
 * host's mapping proposal under `.json-state/migration/`, `plan` the frozen
 * index `archive/migrations/<migration id>/plan.json`, each bound by its
 * sha256; `chunk` counts from 1 in `apply` and from 0 in `rollback`, where 0
 * names the plan files.
 */
export type MigrationRequest =
  | (Base<"migration"> & { phase: "survey" })
  | (Base<"migration"> & { phase: "plan"; operation_id: string; proposal: BoundFile })
  | (Base<"migration"> & { phase: "apply"; operation_id: string; plan: BoundFile; chunk: number })
  | (Base<"migration"> & { phase: "verify"; operation_id: string; plan: BoundFile })
  | (Base<"migration"> & { phase: "rollback"; operation_id: string; plan: BoundFile; chunk: number });

export type MigrationPlanRequest = Extract<MigrationRequest, { phase: "plan" }>;
export type MigrationApplyRequest = Extract<MigrationRequest, { phase: "apply" }>;
export type MigrationVerifyRequest = Extract<MigrationRequest, { phase: "verify" }>;
export type MigrationRollbackRequest = Extract<MigrationRequest, { phase: "rollback" }>;

export type Request =
  | InspectRequest
  | ListRequest
  | ShowRequest
  | ValidateRequest
  | InitializeRequest
  | CreateRequest
  | CreateEvidenceRequest
  | TransitionRequest
  | ClaimRequest
  | ReleaseRequest
  | SetModeRequest
  | SetDependenciesRequest
  | AdoptPlanRequest
  | AttachEvidenceRequest
  | ReconcileRequest
  | MaintenanceRequest
  | MigrationRequest;

// --- the response envelope ----------------------------------------------------

export interface ProtocolError {
  class: ErrorClass;
  /** A short token naming the refusal within its class (`revision-mismatch`, `not-implemented`, ...). */
  reason: string;
  detail?: string;
  /** Present on a `schema-invalid` answer that came from the validator. */
  errors?: ValidationError[];
}

export type Response =
  | { ok: true; result: unknown; revisions?: Record<string, string> }
  | { ok: false; error: ProtocolError };

export const fail = (cls: ErrorClass, reason: string, detail?: string, errors?: ValidationError[]): Response => ({
  ok: false,
  error: { class: cls, reason, ...(detail !== undefined ? { detail } : {}), ...(errors !== undefined ? { errors } : {}) },
});

export const isOperation = (op: unknown): op is Operation => typeof op === "string" && (OPERATIONS as readonly string[]).includes(op);
