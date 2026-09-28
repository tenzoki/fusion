// ---------------------------------------------------------------------------
// Go's `encoding/json` output, reproduced byte for byte for Prior's aggregates.
//
// Prior computes every revision and hash it stores as hex SHA-256 over
// `json.Marshal` of a Go value (`registerRevision`, `planRevision`,
// `stateRevision`, `charterHash`, `evidenceHash`, the snapshot hash in
// `Select`). A round-tripped aggregate is only proven lossless when the
// revision recomputed from the exported value equals the stored one, and that
// needs the exact bytes Go would have written. `JSON.stringify` does not give
// them: it keeps insertion order, escapes fewer characters and knows no
// nil/empty distinction. This module does, for the struct types Prior
// persists, described once in `GO_STRUCTS` in declaration order.
//
// The facts about Go's marshalling this file relies on, each from
// `encoding/json` (Go 1.22 and later; Prior builds with Go 1.26):
//
//  1. Struct fields are written in declaration order, every field, no
//     `omitempty` because the structs carry no tags; the key is the field name.
//  2. Map keys (all `string` here) are sorted with `<` on the Go string, which
//     is a byte-wise comparison of the UTF-8 encoding, not a UTF-16 one.
//  3. A nil slice is `null`, an empty non-nil slice is `[]`; a nil map is
//     `null`, an empty non-nil map is `{}`; a nil pointer is `null`.
//  4. Integers (`int`, `int64`, `uint64`) are written as plain decimal digits.
//     JavaScript numbers are exact up to 2^53; a value beyond that cannot be
//     reproduced and is refused rather than rounded.
//  5. Booleans are `true`/`false`.
//  6. `time.Time` marshals as `time.RFC3339Nano` in quotes: fractional seconds
//     only when non-zero and trimmed of trailing zeros, `Z` for UTC and
//     `+HH:MM` otherwise. Prior stores `CheckedAt` as `checkedAt.UTC()`. The
//     on-disk string is that output, and parsing then formatting it in Go
//     yields the same string again, so it is carried and re-emitted verbatim.
//  7. Strings are quoted with `"` and `\\` escaped, `\b \f \n \r \t` as those
//     two-character escapes, every other control character below 0x20 as
//     the six-character escape with lowercase hex, and, because
//     `Encoder.SetEscapeHTML` is left at its default of true for `json.Marshal`,
//     `<`, `>` and `&` as the six-character escapes for 003c, 003e and 0026,
//     and U+2028 and U+2029 as the escapes for 2028 and 2029. All
//     other characters, including DEL (0x7f) and everything above U+007F, are
//     written raw as UTF-8. Invalid UTF-8 in the Go string becomes the escape
//     for fffd; a JavaScript string read from such output holds U+FFFD and
//     would be written raw, so a source string that was not valid UTF-8 is the
//     one case this reproduction does not cover.
//  8. No whitespace anywhere.
//
// `computePriorRevision` clears `Revision` before hashing exactly as the three
// Go functions do, and returns the hex digest as they do (without the
// `prior-json-sha256:` prefix, which is the fusion import's typing of it).
// ---------------------------------------------------------------------------

import { createHash } from "node:crypto";
import type {
  PriorAggregate,
  PriorCampaignState,
  PriorCandidate,
  PriorCharter,
  PriorEvidence,
  PriorPlan,
  PriorRegister,
  PriorSnapshot,
} from "./types.js";

// --- the Go type model ------------------------------------------------------

export type GoType =
  | { kind: "string" }
  | { kind: "int" }
  | { kind: "bool" }
  | { kind: "time" }
  | { kind: "struct"; name: string }
  | { kind: "slice"; elem: GoType }
  | { kind: "map"; elem: GoType }
  | { kind: "ptr"; elem: GoType };

export interface GoStruct {
  /** Qualified as `codec/contract/prior-mapping.json` names aggregates: `candidates.Source`. */
  name: string;
  /** In declaration order, as `fixtures/prior/source-structs.txt` has them. */
  fields: ReadonlyArray<readonly [string, GoType]>;
}

const str: GoType = { kind: "string" };
const int: GoType = { kind: "int" };
const bool: GoType = { kind: "bool" };
const time: GoType = { kind: "time" };
const struct = (name: string): GoType => ({ kind: "struct", name });
const slice = (elem: GoType): GoType => ({ kind: "slice", elem });
const map = (elem: GoType): GoType => ({ kind: "map", elem });
const ptr = (elem: GoType): GoType => ({ kind: "ptr", elem });

function def(name: string, fields: ReadonlyArray<readonly [string, GoType]>): [string, GoStruct] {
  return [name, { name, fields }];
}

/**
 * Every struct Prior persists or hashes, keyed by qualified name. The two
 * `*HashInput` entries are the anonymous structs `evidenceHash` and
 * `scopeHash` marshal; `scopeHash` is listed for completeness and is not
 * stored anywhere.
 */
export const GO_STRUCTS: ReadonlyMap<string, GoStruct> = new Map<string, GoStruct>([
  // modules/fusion/candidates/register.go:20-77
  def("candidates.Source", [["ID", str], ["Revision", str], ["Watermark", str], ["RefreshPolicy", str]]),
  def("candidates.Evidence", [["Ref", str], ["Revision", str]]),
  def("candidates.Candidate", [
    ["SchemaVersion", int],
    ["ID", str],
    ["StableKey", str],
    ["Kind", str],
    ["Statement", str],
    ["Purpose", str],
    ["Version", int],
    ["Source", struct("candidates.Source")],
    ["Evidence", slice(struct("candidates.Evidence"))],
    ["Reproduction", slice(str)],
    ["Severity", int],
    ["Confidence", int],
    ["EstimatedScope", int],
    ["Risk", int],
    ["AffectedResources", slice(str)],
    ["Dependencies", slice(str)],
    ["Qualification", ptr(struct("candidates.Qualification"))],
    ["Disposition", ptr(struct("candidates.Disposition"))],
    ["MergeInto", str],
  ]),
  def("candidates.Qualification", [
    ["CandidateVersion", int],
    ["SourceRevision", str],
    ["EvidenceHash", str],
    ["Passed", bool],
    ["Reasons", slice(str)],
    ["CheckedAt", time],
  ]),
  def("candidates.Disposition", [
    ["CandidateVersion", int],
    ["PolicyVersion", str],
    ["SnapshotHash", str],
    ["Outcome", str],
    ["WorkItemID", str],
    ["CurrentAttempt", int],
    ["Score", int],
    ["Reasons", slice(str)],
  ]),
  def("candidates.Register", [
    ["ID", str],
    ["Revision", str],
    ["Candidates", map(struct("candidates.Candidate"))],
    ["Stable", map(str)],
    ["Watermarks", map(str)],
    ["IntakeClosed", bool],
    ["ClosedWatermark", str],
  ]),
  def("candidates.Predicate", [["Field", str], ["Operator", str], ["Value", int]]),
  def("candidates.Weight", [["Field", str], ["Multiplier", int]]),
  def("candidates.Policy", [
    ["Version", str],
    ["Predicates", slice(struct("candidates.Predicate"))],
    ["Weights", slice(struct("candidates.Weight"))],
    ["MinimumScore", int],
    ["MaximumRisk", int],
  ]),
  def("candidates.Snapshot", [["Watermark", str], ["Versions", map(int)], ["SourceRevisions", map(str)]]),
  // register.go:462-469, the anonymous struct evidenceHash marshals
  def("candidates.EvidenceHashInput", [
    ["Version", int],
    ["Source", str],
    ["Evidence", slice(struct("candidates.Evidence"))],
    ["Reproduction", slice(str)],
  ]),

  // modules/fusion/packages/packages.go:19-56
  def("packages.Candidate", [
    ["ID", str],
    ["Purpose", str],
    ["Version", int],
    ["Resources", slice(str)],
    ["Dependencies", slice(str)],
    ["Risk", int],
    ["ValidationCost", int],
    ["EstimatedSize", int],
    ["Qualified", bool],
    ["Selected", bool],
  ]),
  def("packages.FormationPolicy", [
    ["Version", str],
    ["MaxRisk", int],
    ["MaxValidationCost", int],
    ["MaxSize", int],
    ["Budget", int],
  ]),
  def("packages.Package", [
    ["ID", str],
    ["Members", slice(str)],
    ["Dependencies", slice(str)],
    ["Resources", slice(str)],
    ["Reasons", slice(str)],
    ["Risk", int],
    ["ValidationCost", int],
    ["EstimatedSize", int],
    ["State", str],
    ["BaseRevision", str],
    ["AcceptedRevision", str],
    ["BaselineHash", str],
    ["FailureReason", str],
  ]),
  def("packages.Deferred", [["Candidate", str], ["Reason", str]]),
  def("packages.Attempt", [["Candidate", str], ["CandidateVersion", int], ["Attempt", int], ["ItemID", str]]),
  def("packages.Admission", [
    ["ID", str],
    ["PackageID", str],
    ["Status", str],
    ["LeaseRef", str],
    ["WorkbenchRevision", str],
    ["Attempts", slice(struct("packages.Attempt"))],
  ]),
  def("packages.Plan", [
    ["ID", str],
    ["Revision", str],
    ["PolicyVersion", str],
    ["AcceptedRevision", str],
    ["RemainingBudget", int],
    ["Candidates", map(struct("packages.Candidate"))],
    ["Packages", map(struct("packages.Package"))],
    ["Order", slice(str)],
    ["Deferred", slice(struct("packages.Deferred"))],
    ["Admissions", map(struct("packages.Admission"))],
    ["ActiveItems", map(str)],
  ]),

  // modules/fusion/campaign/campaign.go:21-53
  def("campaign.Limits", [
    ["MaxAttempts", int],
    ["MaxFailures", int],
    ["MaxConsecutiveFailures", int],
    ["MaxReviews", int],
    ["ResourceUnits", int],
  ]),
  def("campaign.Charter", [
    ["SchemaVersion", int],
    ["CampaignID", str],
    ["Revision", str],
    ["AuthorisationRef", str],
    ["Objective", str],
    ["ItemKinds", slice(str)],
    ["CandidateSources", slice(str)],
    ["WorkflowTemplates", slice(str)],
    ["StopConditions", slice(str)],
    ["IntakePolicy", str],
    ["SelectionPolicy", str],
    ["PackagePolicy", str],
    ["AcceptancePolicy", str],
    ["AutonomyPolicy", str],
    ["BackendPolicy", str],
    ["DeliveryPolicy", str],
    ["DataBoundary", slice(str)],
    ["Capabilities", slice(str)],
    ["BudgetAccount", str],
    ["Limits", struct("campaign.Limits")],
  ]),
  def("campaign.Counters", [
    ["Attempts", int],
    ["Failures", int],
    ["ConsecutiveFailures", int],
    ["Reviews", int],
    ["ResourceUnits", int],
  ]),
  def("campaign.Settlement", [["OwnedRuns", int], ["OpenIntents", int], ["UnknownEffects", int], ["Quarantined", int]]),
  def("campaign.CompletionEvidence", [
    ["ObjectiveMet", bool],
    ["IntakeClosed", bool],
    ["AllAttemptsTerminal", bool],
    ["FinalAuditPassed", bool],
    ["Watermark", str],
    ["AuditRef", str],
  ]),
  def("campaign.State", [
    ["CampaignID", str],
    ["Revision", str],
    ["State", str],
    ["PreviousTerminal", str],
    ["Reason", str],
    ["Charter", struct("campaign.Charter")],
    ["CharterHash", str],
    ["Counters", struct("campaign.Counters")],
    ["Settlement", struct("campaign.Settlement")],
    ["RequestedOutcome", str],
    ["Sessions", slice(str)],
    ["Runs", slice(str)],
    ["BaselineHash", str],
  ]),
]);

export class GoMarshalError extends Error {
  constructor(
    readonly path: string,
    detail: string,
  ) {
    super(`${path}: ${detail}`);
    this.name = "GoMarshalError";
  }
}

function structOf(name: string, path: string): GoStruct {
  const s = GO_STRUCTS.get(name);
  if (s === undefined) throw new GoMarshalError(path, `unknown Go struct ${name}`);
  return s;
}

// --- scalars ----------------------------------------------------------------

// The characters Go escapes that `JSON.stringify` does not; the two line
// separators are built from their code points so that no editor or transport
// turns the escape into the raw character (U+2028 is a line terminator to tsc).
const HTML_UNSAFE = new RegExp("[<>&" + String.fromCharCode(0x2028, 0x2029) + "]", "g");

/** Fact 7: `JSON.stringify` agrees with Go on everything but the HTML-safe set. */
export function goQuote(s: string): string {
  return JSON.stringify(s).replace(HTML_UNSAFE, (c) => "\\u" + c.charCodeAt(0).toString(16).padStart(4, "0"));
}

/** Fact 2: Go compares map keys byte-wise on their UTF-8 encoding. */
export function compareGoStrings(a: string, b: string): number {
  return Buffer.compare(Buffer.from(a, "utf8"), Buffer.from(b, "utf8"));
}

export function sortedGoKeys(o: Record<string, unknown>): string[] {
  return Object.keys(o).sort(compareGoStrings);
}

// Go's own RFC3339Nano output, which is the only form fact 6 admits verbatim.
const GO_TIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,9})?(Z|[+-]\d{2}:\d{2})$/;

// --- the marshaller ---------------------------------------------------------

/**
 * The bytes `json.Marshal` writes for `value` read as Go type `type`, as a
 * string (the digest is taken over its UTF-8 encoding). Throws
 * `GoMarshalError` naming the path when the value does not fit the type:
 * a missing struct field, a non-integer where Go has an int, a time string
 * Go would not have produced.
 */
export function goMarshal(value: unknown, type: GoType, path = "$"): string {
  switch (type.kind) {
    case "string":
      if (typeof value !== "string") throw new GoMarshalError(path, `expected a string, got ${describe(value)}`);
      return goQuote(value);
    case "int":
      if (typeof value !== "number" || !Number.isInteger(value)) {
        throw new GoMarshalError(path, `expected an integer, got ${describe(value)}`);
      }
      if (!Number.isSafeInteger(value)) throw new GoMarshalError(path, `${value} exceeds 2^53 and cannot be reproduced exactly`);
      return String(value);
    case "bool":
      if (typeof value !== "boolean") throw new GoMarshalError(path, `expected a boolean, got ${describe(value)}`);
      return value ? "true" : "false";
    case "time":
      if (typeof value !== "string" || !GO_TIME.test(value)) {
        throw new GoMarshalError(path, `expected an RFC 3339 time as Go writes it, got ${describe(value)}`);
      }
      return `"${value}"`;
    case "ptr":
      if (value === null) return "null";
      return goMarshal(value, type.elem, path);
    case "slice": {
      if (value === null) return "null";
      if (!Array.isArray(value)) throw new GoMarshalError(path, `expected an array or null, got ${describe(value)}`);
      return "[" + value.map((v, i) => goMarshal(v, type.elem, `${path}[${i}]`)).join(",") + "]";
    }
    case "map": {
      if (value === null) return "null";
      if (!isRecord(value)) throw new GoMarshalError(path, `expected an object or null, got ${describe(value)}`);
      const parts = sortedGoKeys(value).map((k) => goQuote(k) + ":" + goMarshal(value[k], type.elem, `${path}[${k}]`));
      return "{" + parts.join(",") + "}";
    }
    case "struct": {
      if (!isRecord(value)) throw new GoMarshalError(path, `expected an object for ${type.name}, got ${describe(value)}`);
      const s = structOf(type.name, path);
      const known = new Set(s.fields.map(([f]) => f));
      for (const k of Object.keys(value)) {
        if (!known.has(k)) throw new GoMarshalError(`${path}.${k}`, `not a field of ${type.name}`);
      }
      const parts = s.fields.map(([f, t]) => {
        if (!(f in value)) throw new GoMarshalError(`${path}.${f}`, `field of ${type.name} is missing`);
        return `"${f}":` + goMarshal(value[f], t, `${path}.${f}`);
      });
      return "{" + parts.join(",") + "}";
    }
  }
}

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);

function describe(v: unknown): string {
  if (v === null) return "null";
  if (v === undefined) return "undefined";
  if (Array.isArray(v)) return "an array";
  return `a ${typeof v}`;
}

/** hex SHA-256 over the UTF-8 bytes of a marshalled value: Prior's `hash`. */
export function goHash(marshalled: string): string {
  return createHash("sha256").update(Buffer.from(marshalled, "utf8")).digest("hex");
}

// --- the aggregates ---------------------------------------------------------

export type PriorAggregateKind = "candidates.Register" | "packages.Plan" | "campaign.State";

/**
 * Which of the three aggregates a value is, read off the fields only it has.
 * Throws when the value is none of them: the caller passed something this
 * module has no field order for.
 */
export function priorAggregateKind(value: unknown): PriorAggregateKind {
  if (isRecord(value)) {
    if ("Candidates" in value && "Stable" in value && "Watermarks" in value) return "candidates.Register";
    if ("Packages" in value && "Order" in value && "Admissions" in value) return "packages.Plan";
    if ("Charter" in value && "CharterHash" in value && "Counters" in value) return "campaign.State";
  }
  throw new GoMarshalError("$", "not a candidates.Register, packages.Plan or campaign.State");
}

/**
 * Prior's `registerRevision`, `planRevision` and `stateRevision`: the hex
 * SHA-256 of `json.Marshal` of the aggregate with `Revision` set to "". The
 * stored `Revision` of a value read from disk must equal this, and so must the
 * one recomputed from an exported value if the round trip lost nothing.
 */
export function computePriorRevision(aggregate: PriorAggregate): string {
  const kind = priorAggregateKind(aggregate);
  const cleared = { ...aggregate, Revision: "" };
  return goHash(goMarshal(cleared, struct(kind)));
}

/** Prior's `charterHash`: hex SHA-256 of `json.Marshal(Charter)`, Revision label included. */
export function computeCharterHash(charter: PriorCharter): string {
  return goHash(goMarshal(charter, struct("campaign.Charter")));
}

/**
 * Prior's `evidenceHash`: the anonymous struct over Version, Source.Revision,
 * `sortedEvidence(Evidence)` and a copy of Reproduction. Both slices are
 * built with `append(nil, ...)`, so an empty input marshals as `null`.
 */
export function computeEvidenceHash(c: Pick<PriorCandidate, "Version" | "Source" | "Evidence" | "Reproduction">): string {
  const evidence = sortedEvidence(c.Evidence);
  const reproduction = c.Reproduction === null || c.Reproduction.length === 0 ? null : [...c.Reproduction];
  const input = { Version: c.Version, Source: c.Source.Revision, Evidence: evidence, Reproduction: reproduction };
  return goHash(goMarshal(input, struct("candidates.EvidenceHashInput")));
}

/** register.go `sortedEvidence`: a copy sorted by (Ref, Revision); nil when the input is empty. */
export function sortedEvidence(values: PriorEvidence[] | null): PriorEvidence[] | null {
  if (values === null || values.length === 0) return null;
  return [...values].sort((a, b) => (a.Ref === b.Ref ? compareGoStrings(a.Revision, b.Revision) : compareGoStrings(a.Ref, b.Ref)));
}

/** The `hash(snapshot)` `Select` stores as `Disposition.SnapshotHash`. */
export function computeSnapshotHash(snapshot: PriorSnapshot): string {
  return goHash(goMarshal(snapshot, struct("candidates.Snapshot")));
}

// --- walking a value by its Go type -----------------------------------------

/**
 * Visits every struct field present in `value`, reporting the qualified
 * struct name and the field name. The fixture suite uses it to prove that
 * every `prior_key` of `contract/prior-mapping.json` occurs in some fixture.
 * A nil pointer, slice or map has no fields to visit below it.
 */
export function walkGoFields(value: unknown, type: GoType, visit: (struct: string, field: string) => void, path = "$"): void {
  switch (type.kind) {
    case "string":
    case "int":
    case "bool":
    case "time":
      return;
    case "ptr":
      if (value !== null) walkGoFields(value, type.elem, visit, path);
      return;
    case "slice":
      if (Array.isArray(value)) value.forEach((v, i) => walkGoFields(v, type.elem, visit, `${path}[${i}]`));
      return;
    case "map":
      if (isRecord(value)) for (const k of Object.keys(value)) walkGoFields(value[k], type.elem, visit, `${path}[${k}]`);
      return;
    case "struct": {
      if (!isRecord(value)) throw new GoMarshalError(path, `expected an object for ${type.name}`);
      for (const [f, t] of structOf(type.name, path).fields) {
        if (!(f in value)) throw new GoMarshalError(`${path}.${f}`, `field of ${type.name} is missing`);
        visit(type.name, f);
        walkGoFields(value[f], t, visit, `${path}.${f}`);
      }
    }
  }
}

/** Convenience for callers holding a struct name rather than a `GoType`. */
export const goStructType = struct;

// Re-exported so the type checks in this file's callers can name them.
export type { PriorCampaignState, PriorPlan, PriorRegister };
