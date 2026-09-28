// ---------------------------------------------------------------------------
// What the three mappers share: the typed refusal, the vocabularies read out
// of `contract/prior-mapping.json`, and the value-level rules the table's
// `null_vs_empty` column names.
//
// An import never invents a value. Where the table says a Go value is refused
// (an empty string Prior requires, a zero counter that must be positive, an
// enum value Prior does not write) the mapper stops with `schema-invalid` and
// the Go path of the offending field; a work item nobody knows is
// `unresolved-reference`. Both are the spec's typed errors (section 6).
//
// The vocabularies are the table's, not this file's: `verbatim_vocabularies`
// and `state_mapping.rows` are read once at load, so the set of package states
// an importer accepts is exactly the set the Prior side is asked to confirm.
// ---------------------------------------------------------------------------

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { strictParse } from "../strict-json.js";
import type { LegacyFields, PriorJsonSha256, PriorOpaque } from "./blocks.js";
import { compareGoStrings } from "./gojson.js";

export const CONTRACT_DIR = fileURLToPath(new URL("../../contract/", import.meta.url));

// --- the refusal ------------------------------------------------------------

export type PriorRefusalClass = "schema-invalid" | "unresolved-reference";

export interface PriorRefusal {
  ok: false;
  class: PriorRefusalClass;
  /** The Go path of the field, `Candidates[c1].Disposition.WorkItemID`. */
  path: string;
  reason: string;
}

export type PriorResult<T> = { ok: true; value: T } | PriorRefusal;

/**
 * Whether an import resolved its work item ids against an inventory the
 * caller supplied (`checked`) or only carried them (`carry-only`). Prior's
 * FJ00 response 3d: omitting the inventory may support raw inspection, but
 * must not count as a validated migration or enable dispatch; the mode is
 * returned beside the blocks so that FJ04 can refuse a carry-only import as
 * one. It is a fact about the call, never a record field.
 */
export interface ImportInventory {
  work_items: "checked" | "carry-only";
}

export type ImportResult<T> = PriorResult<T> & { inventory: ImportInventory };

export function inventoryOf(workItems: ReadonlySet<string> | undefined): ImportInventory {
  return { work_items: workItems === undefined ? "carry-only" : "checked" };
}

/** Thrown inside a mapper and turned into a `PriorRefusal` at its boundary. */
export class Refusal extends Error {
  constructor(
    readonly cls: PriorRefusalClass,
    readonly path: string,
    readonly reason: string,
  ) {
    super(`${cls} at ${path}: ${reason}`);
    this.name = "Refusal";
  }
  toResult(): PriorRefusal {
    return { ok: false, class: this.cls, path: this.path, reason: this.reason };
  }
}

export function invalid(path: string, reason: string): never {
  throw new Refusal("schema-invalid", path, reason);
}

export function unresolved(path: string, reason: string): never {
  throw new Refusal("unresolved-reference", path, reason);
}

/** Runs a mapper and turns its thrown `Refusal` into the result shape; anything else propagates. */
export function guarded<T>(fn: () => T): PriorResult<T> {
  try {
    return { ok: true, value: fn() };
  } catch (e) {
    if (e instanceof Refusal) return e.toResult();
    throw e;
  }
}

// --- the table's vocabularies -----------------------------------------------

interface MappingTable {
  verbatim_vocabularies: Record<string, string[] | string>;
  state_mapping: { rows: Array<{ prior_value: string; fusion_status: string | null; outcome_class: string | null; confirmed: boolean }> };
  rows: Array<{ aggregate: string; prior_key: string; null_vs_empty: string; revision_encoding: string | null; confirmed: boolean }>;
}

function loadMapping(): MappingTable {
  const file = CONTRACT_DIR + "prior-mapping.json";
  const parsed = strictParse(readFileSync(file));
  if (!parsed.ok) throw new Error(`${file}: ${parsed.reason}: ${parsed.detail}`);
  return parsed.value as MappingTable;
}

let table: MappingTable | undefined;
export const priorMapping = (): MappingTable => (table ??= loadMapping());

function vocabulary(name: string): ReadonlySet<string> {
  const v = priorMapping().verbatim_vocabularies[name];
  if (!Array.isArray(v)) throw new Error(`contract/prior-mapping.json: verbatim_vocabularies has no list "${name}"`);
  return new Set(v);
}

export const VOCABULARY = {
  dispositionOutcome: () => vocabulary("candidates.Disposition.Outcome"),
  refreshPolicy: () => vocabulary("candidates.Source.RefreshPolicy"),
  admissionStatus: () => vocabulary("packages.Admission.Status"),
  campaignState: () => vocabulary("campaign.State.State"),
  requestedOutcome: () => vocabulary("campaign.State.RequestedOutcome"),
  /** The `packages.Package.State` values, from `state_mapping.rows`. */
  packageState: (): ReadonlySet<string> => new Set(priorMapping().state_mapping.rows.map((r) => r.prior_value)),
} as const;

/**
 * The fusion status for a Prior package state, as `state_mapping` records
 * it, with its `confirmed` flag (every row is confirmed since Prior's ruling
 * at `prior_review_commit`). No importer here applies it: the Package is
 * kept verbatim in the formation block, and whether a fusion package is
 * created is FJ04's question.
 */
export function proposedPackageStatus(state: string): { fusion_status: string | null; outcome_class: string | null; confirmed: boolean } | undefined {
  const row = priorMapping().state_mapping.rows.find((r) => r.prior_value === state);
  return row === undefined ? undefined : { fusion_status: row.fusion_status, outcome_class: row.outcome_class, confirmed: row.confirmed };
}

// register.go `fieldValue` and `validatePolicy`: the schema carries these too.
export const POLICY_FIELDS: ReadonlySet<string> = new Set(["severity", "confidence", "estimated_scope", "risk"]);
export const POLICY_OPERATORS: ReadonlySet<string> = new Set(["gte", "lte", "eq"]);

// --- value rules (the null_vs_empty column) ---------------------------------

/** `empty-string-refused`. */
export function nonEmpty(path: string, v: string): string {
  if (v === "") invalid(path, "Prior requires a non-empty value; an empty one is refused");
  return v;
}

/** `empty-string-to-null` on import. */
export const emptyToNull = (v: string): string | null => (v === "" ? null : v);

/** `empty-string-to-null` on export. */
export const nullToEmpty = (v: string | null): string => v ?? "";

/** `zero-refused`: an integer that must be positive. */
export function positive(path: string, v: number): number {
  integer(path, v);
  if (v < 1) invalid(path, `must be a positive integer, got ${v}`);
  return v;
}

/** `integer (minimum 0)` in the type column. */
export function nonNegative(path: string, v: number): number {
  integer(path, v);
  if (v < 0) invalid(path, `must be a non-negative integer, got ${v}`);
  return v;
}

export function integer(path: string, v: number): number {
  if (typeof v !== "number" || !Number.isInteger(v)) invalid(path, `must be an integer, got ${JSON.stringify(v)}`);
  return v;
}

export function boolean(path: string, v: boolean): boolean {
  if (typeof v !== "boolean") invalid(path, `must be a boolean, got ${JSON.stringify(v)}`);
  return v;
}

export function oneOf(path: string, v: string, allowed: ReadonlySet<string>): string {
  if (!allowed.has(v)) invalid(path, `"${v}" is not one of ${[...allowed].join(", ")}`);
  return v;
}

/** `zero-time-refused`: Go's zero `time.Time`. */
export function nonZeroTime(path: string, v: string): string {
  if (typeof v !== "string" || v === "") invalid(path, "must be an RFC 3339 time");
  if (v.startsWith("0001-01-01T00:00:00")) invalid(path, "Go's zero time has no meaning here and is refused");
  return v;
}

// --- revision encodings -----------------------------------------------------

const HEX64 = /^[0-9a-f]{64}$/;

/** `prior-json-sha256`: the value must be what Go's `hash` produces, 64 lowercase hex. */
export function jsonSha(path: string, v: string): PriorJsonSha256 {
  if (!HEX64.test(v)) invalid(path, "expected the hex SHA-256 Prior computes over json.Marshal (64 lowercase hex characters)");
  return `prior-json-sha256:${v}`;
}

export function jsonShaOrNull(path: string, v: string): PriorJsonSha256 | null {
  return v === "" ? null : jsonSha(path, v);
}

export function unJsonSha(path: string, v: string | null): string {
  if (v === null) return "";
  if (!v.startsWith("prior-json-sha256:")) invalid(path, `expected a prior-json-sha256: value, got ${JSON.stringify(v)}`);
  const hex = v.slice("prior-json-sha256:".length);
  if (!HEX64.test(hex)) invalid(path, "prior-json-sha256: value does not carry 64 lowercase hex characters");
  return hex;
}

/** `prior-opaque`: the raw Prior string behind the prefix, verbatim; empty is never this value. */
export function opaque(path: string, v: string): PriorOpaque {
  nonEmpty(path, v);
  return `prior-opaque:${v}`;
}

export const opaqueOrNull = (path: string, v: string): PriorOpaque | null => (v === "" ? null : opaque(path, v));

export function unOpaque(path: string, v: string | null): string {
  if (v === null) return "";
  if (!v.startsWith("prior-opaque:") || v.length === "prior-opaque:".length) {
    invalid(path, `expected a prior-opaque: value with a non-empty payload, got ${JSON.stringify(v)}`);
  }
  return v.slice("prior-opaque:".length);
}

// --- collections ------------------------------------------------------------

/**
 * Remembers which Go collections were `[]`/`{}` rather than `null` so that
 * export can write the same form again (`legacy_fields.empty_collections`).
 */
export class EmptyTracker {
  private readonly paths = new Set<string>();

  /**
   * `prefix` is the Go path of the value the tracked paths are relative to
   * (`Candidates[c1]` for a candidate's tracker); it appears in refusals only,
   * so that `legacy_fields.empty_collections` stays relative to the block that
   * carries it.
   */
  constructor(
    initial: readonly string[] = [],
    private readonly prefix = "",
  ) {
    for (const p of initial) this.paths.add(p);
  }

  private full(path: string): string {
    return this.prefix === "" ? path : `${this.prefix}.${path}`;
  }

  /** `nil-and-empty-to-[]` on import: a slice to an array, remembering the empty non-nil case. */
  list<T>(path: string, v: T[] | null): T[] {
    if (v === null) return [];
    if (!Array.isArray(v)) invalid(this.full(path), `expected an array or null, got ${JSON.stringify(v)}`);
    if (v.length === 0) this.paths.add(path);
    return [...v];
  }

  /** `nil-and-empty-to-[]` on import: a map to its entries sorted by key, remembering `{}`. */
  entries<T>(path: string, v: Record<string, T> | null): Array<[string, T]> {
    if (v === null) return [];
    if (typeof v !== "object" || Array.isArray(v)) invalid(this.full(path), `expected an object or null, got ${JSON.stringify(v)}`);
    const keys = Object.keys(v).sort(compareGoStrings);
    if (keys.length === 0) this.paths.add(path);
    return keys.map((k) => [k, v[k] as T]);
  }

  /** Export: `[]` where the original was empty non-nil, `null` where it was nil. */
  unlist<T>(path: string, v: T[]): T[] | null {
    if (v.length > 0) return [...v];
    return this.paths.has(path) ? [] : null;
  }

  /** Export: `{}` where the original was empty non-nil, `null` where it was nil. */
  unentries<T>(path: string, entries: Array<[string, T]>): Record<string, T> | null {
    if (entries.length === 0) return this.paths.has(path) ? {} : null;
    const out: Record<string, T> = {};
    for (const [k, v] of entries) {
      if (k in out) invalid(`${this.full(path)}[${k}]`, "duplicate key on export");
      out[k] = v;
    }
    return out;
  }

  sorted(): string[] {
    return [...this.paths].sort();
  }
}

/** `nil-refused`: at least one element required. */
export function atLeastOne<T>(path: string, v: T[] | null): T[] {
  if (v === null || v.length === 0) invalid(path, "Prior requires at least one element");
  return [...v];
}

/** Set semantics (`uniqueItems`): a repeated element is refused, not deduplicated. */
export function distinct(path: string, v: string[]): string[] {
  const seen = new Set<string>();
  for (const s of v) {
    if (seen.has(s)) invalid(path, `"${s}" occurs more than once in a set-valued field`);
    seen.add(s);
  }
  return v;
}

/** A set of non-empty strings: the schema's `string_set`. */
export function stringSet(path: string, v: string[]): string[] {
  for (const s of v) if (s === "") invalid(path, "a set-valued field holds no empty string");
  return distinct(path, v);
}

/** Every entry's key must equal the id inside it; the map key is not a second identity. */
export function keyMatches(path: string, key: string, id: string): void {
  if (key !== id) invalid(path, `map key "${key}" differs from the entry's ID "${id}"`);
}

/** The legacy_fields object for a block: the removed fields plus the nil/empty record. */
export function legacyFields(tracker: EmptyTracker, removed: Record<string, unknown> = {}): LegacyFields {
  return { ...removed, empty_collections: tracker.sorted() };
}

/** Reads `empty_collections` back out of imported provenance for the export direction. */
export function trackerFrom(legacy: LegacyFields | undefined, path: string): EmptyTracker {
  const list = legacy?.empty_collections;
  if (list === undefined) return new EmptyTracker();
  if (!Array.isArray(list) || list.some((p) => typeof p !== "string")) {
    invalid(`${path}.provenance.legacy_fields.empty_collections`, "must be an array of Go paths");
  }
  return new EmptyTracker(list);
}
