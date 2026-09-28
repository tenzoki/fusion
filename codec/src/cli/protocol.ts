// ---------------------------------------------------------------------------
// The stdin/stdout protocol of `fusion-record`: one request in, one response
// out, both JSON, as Prior's `concept/fusion-json-workbench-spec.md` section 6
// lays it out.
//
// The fourteen operations of the spec's table are the request union below,
// each with its argument shape. FJ01 implements five of them (`inspect`,
// `list`, `show`, `validate`, `transition`) and answers the other nine with
// `operation-unknown/not-implemented-in-fj01`, so that a caller written
// against the whole table gets a typed refusal and never a parse error. The
// shapes of the nine are the contract those later packages fill in; they are
// validated today so that a request against them fails for the right reason.
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

/** The operations of spec section 6's table, in the table's order. */
export const OPERATIONS = [
  "inspect",
  "list",
  "show",
  "validate",
  "create",
  "transition",
  "claim",
  "release",
  "set-mode",
  "set-dependencies",
  "adopt-plan",
  "attach-evidence",
  "reconcile",
  "migration",
] as const;

export type Operation = (typeof OPERATIONS)[number];

/** The operations FJ01 answers with a result; the rest answer `operation-unknown`. */
export const IMPLEMENTED_OPERATIONS: readonly Operation[] = ["inspect", "list", "show", "validate", "transition"];

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

// --- the five FJ01 operations ------------------------------------------------

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

/** What the target state may need to see, in the record's own field shapes. */
export interface TransitionPayload {
  claim?: { checkout_id: string; person: string | null; claimed_at: string | null } | null;
  outcome?: { class: string; reason: string; evidence: EvidenceRef[] } | null;
  disposition?: { kind: string; reason_ref: unknown } | null;
  answer_ref?: RecordRef | null;
  implementation_ref?: string | null;
  superseded_by?: RecordRef | null;
}

export interface TransitionRequest extends Mutation<"transition"> {
  to: string;
  reason: string;
  payload?: TransitionPayload;
}

// --- the nine later operations, shapes only ----------------------------------

export interface CreateRequest extends Base<"create"> {
  operation_id: string;
  id: string;
  kind: "package" | "issue" | "plan" | "discussion" | "decision";
  filed_by: Actor;
  origin: { kind: "user-request" | "package" | "campaign" | "legacy-unknown"; ref: RecordRef | null };
  /** The container the pair goes into, or null for `shared/`, and the store within it. */
  scope: { container: string | null; store: string };
  narrative: { path: string };
  payload: Record<string, unknown>;
}

export interface ClaimRequest extends Mutation<"claim"> {
  claim: { checkout_id: string; person: string | null; claimed_at: string | null };
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
  revision: string;
}

export interface AttachEvidenceRequest extends Mutation<"attach-evidence"> {
  evidence: EvidenceRef;
}

export interface ReconcileRequest extends Base<"reconcile"> {
  scope?: string;
}

export interface MigrationRequest extends Base<"migration"> {
  phase: "survey" | "plan" | "apply" | "verify";
  /** The frozen plan, workbench-relative; required from `apply` on. */
  plan?: string;
}

export type Request =
  | InspectRequest
  | ListRequest
  | ShowRequest
  | ValidateRequest
  | CreateRequest
  | TransitionRequest
  | ClaimRequest
  | ReleaseRequest
  | SetModeRequest
  | SetDependenciesRequest
  | AdoptPlanRequest
  | AttachEvidenceRequest
  | ReconcileRequest
  | MigrationRequest;

// --- the response envelope ----------------------------------------------------

export interface ProtocolError {
  class: ErrorClass;
  /** A short token naming the refusal within its class (`revision-mismatch`, `not-implemented-in-fj01`, ...). */
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
