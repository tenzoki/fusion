// ---------------------------------------------------------------------------
// The reference contract: every citation form fusion writes, parsed into one
// discriminated union and rendered back.
//
// Three prose forms come from `rules/fusion-workbench-conventions.md`
// `## Filename Patterns`: a marker-bearing record cited by its storeless
// basename with the marker wildcarded (`YYMMDD-HHMM_*_<topic>.md`) or, in
// older text, concrete (`_o_`, `_p_`, `_c_`, `_d_`, `_a_`, `_i_`, `_s_`); a
// markerless artefact (`YYMMDD-HHMM-<topic>.md`); and a record in another
// project's workbench (`foreign:<project>:<citation>`). Two structured shapes
// come from `schemas/common.schema.json`: `record_ref` and `artefact_ref`;
// the structured `foreign_ref` object is accepted as the third.
//
// The string patterns are read out of `common.schema.json` at load, so the
// parser and the validator cannot disagree about what a citation looks like.
// A citation carrying a store segment (`shared/issues/...`) is refused with
// the reason `store-prefixed`, as the conventions say a check must; a bare
// stamp is refused as `bare-stamp`, because a stamp alone names no file.
//
// Nothing here resolves a reference against a file system or reads state
// from a marker: a concrete marker in a citation is a spelling, not a fact
// about the record's current state.
// ---------------------------------------------------------------------------

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { strictParse } from "./strict-json.js";

export const COMMON_SCHEMA = fileURLToPath(new URL("../schemas/common.schema.json", import.meta.url));

// --- the union --------------------------------------------------------------

export type Marker = "*" | "o" | "p" | "c" | "d" | "a" | "i" | "s";

export interface RecordRef {
  workbench_id: string;
  record_id: string;
  revision?: string;
  display?: string;
}

export interface ArtefactRef {
  path: string;
  sha256: string;
  kind: string;
}

export type LegacyCitation =
  | { kind: "legacy-marker"; basename: string; stamp: string; marker: Marker; topic: string }
  | { kind: "legacy-markerless"; basename: string; stamp: string; topic: string };

export type Reference =
  | LegacyCitation
  | { kind: "foreign"; project: string; citation: LegacyCitation }
  | { kind: "record"; ref: RecordRef }
  | { kind: "artefact"; ref: ArtefactRef };

export type ParseReason = "store-prefixed" | "bare-stamp" | "unrecognised" | "malformed-object";

export type ParseResult = { ok: true; reference: Reference } | { ok: false; class: "schema-invalid"; reason: ParseReason; detail: string };

// --- the patterns, from the schema ------------------------------------------

interface Patterns {
  marker: RegExp;
  markerless: RegExp;
  foreign: RegExp;
  uuid: RegExp;
  sha256: RegExp;
  workbenchPath: RegExp;
  token: RegExp;
  project: RegExp;
}

function patternOf(defs: Record<string, unknown>, name: string, prop = "pattern"): RegExp {
  const d = defs[name];
  const p = typeof d === "object" && d !== null ? (d as Record<string, unknown>)[prop] : undefined;
  if (typeof p !== "string") throw new Error(`${COMMON_SCHEMA}: $defs.${name}.${prop} is not a string pattern`);
  return new RegExp(p);
}

function loadPatterns(): Patterns {
  const parsed = strictParse(readFileSync(COMMON_SCHEMA));
  if (!parsed.ok) throw new Error(`${COMMON_SCHEMA}: ${parsed.reason}: ${parsed.detail}`);
  const defs = (parsed.value as { $defs?: Record<string, unknown> }).$defs;
  if (defs === undefined) throw new Error(`${COMMON_SCHEMA}: no $defs`);
  const foreignRef = defs["foreign_ref"] as { properties?: { project?: { pattern?: string } } } | undefined;
  const project = foreignRef?.properties?.project?.pattern;
  if (typeof project !== "string") throw new Error(`${COMMON_SCHEMA}: $defs.foreign_ref.properties.project.pattern is missing`);
  return {
    marker: patternOf(defs, "legacy_marker_citation"),
    markerless: patternOf(defs, "legacy_markerless_citation"),
    foreign: patternOf(defs, "legacy_foreign_citation"),
    uuid: patternOf(defs, "uuid"),
    sha256: patternOf(defs, "sha256"),
    workbenchPath: patternOf(defs, "workbench_path"),
    token: patternOf(defs, "token"),
    project: new RegExp(project),
  };
}

let patterns: Patterns | undefined;
export const citationPatterns = (): Patterns => (patterns ??= loadPatterns());

// The two prose forms split into their parts: stamp, marker, topic.
const MARKER_PARTS = /^([0-9]{6}-[0-9]{4})_(\*|[opcdais])_(.+)\.md$/;
const MARKERLESS_PARTS = /^([0-9]{6}-[0-9]{4})-(.+)\.md$/;
const BARE_STAMP = /^[0-9]{6}-[0-9]{4}$/;
const FOREIGN_PREFIX = /^foreign:([^:]*):(.*)$/;

// --- parsing ----------------------------------------------------------------

const refuse = (reason: ParseReason, detail: string): ParseResult => ({ ok: false, class: "schema-invalid", reason, detail });

/**
 * Parses a citation string or a structured reference object. A string is
 * one of the three prose forms; an object is a `record_ref`, an
 * `artefact_ref` or a `foreign_ref` as `common.schema.json` shapes them.
 */
export function parseReference(input: unknown): ParseResult {
  if (typeof input === "string") return parseCitation(input);
  if (typeof input === "object" && input !== null && !Array.isArray(input)) return parseObject(input as Record<string, unknown>);
  return refuse("unrecognised", `a reference is a citation string or a reference object, not ${input === null ? "null" : typeof input}`);
}

function parseCitation(text: string): ParseResult {
  const p = citationPatterns();
  const foreign = FOREIGN_PREFIX.exec(text);
  if (foreign !== null) {
    if (!p.foreign.test(text)) {
      const inner = parseCitation(foreign[2] ?? "");
      if (!inner.ok) return refuse(inner.reason, `foreign citation: ${inner.detail}`);
      return refuse("unrecognised", `"${text}" is not a foreign:<project>:<citation> form`);
    }
    const inner = parseCitation(foreign[2] ?? "");
    if (!inner.ok) return refuse(inner.reason, `foreign citation: ${inner.detail}`);
    if (inner.reference.kind === "foreign") return refuse("unrecognised", "a foreign citation does not nest another");
    return { ok: true, reference: { kind: "foreign", project: foreign[1] ?? "", citation: inner.reference as LegacyCitation } };
  }
  if (text.includes("/") || text.includes("\\")) {
    return refuse("store-prefixed", `"${text}" carries a path segment; a record is cited by its storeless basename`);
  }
  if (BARE_STAMP.test(text)) return refuse("bare-stamp", `"${text}" is a stamp, not a citation; a stamp alone names no file`);
  if (p.marker.test(text)) {
    const m = MARKER_PARTS.exec(text);
    if (m !== null) {
      return { ok: true, reference: { kind: "legacy-marker", basename: text, stamp: m[1] ?? "", marker: m[2] as Marker, topic: m[3] ?? "" } };
    }
  }
  if (p.markerless.test(text)) {
    const m = MARKERLESS_PARTS.exec(text);
    if (m !== null) return { ok: true, reference: { kind: "legacy-markerless", basename: text, stamp: m[1] ?? "", topic: m[2] ?? "" } };
  }
  return refuse("unrecognised", `"${text}" is none of the citation forms the conventions define`);
}

function parseObject(o: Record<string, unknown>): ParseResult {
  const p = citationPatterns();
  const keys = Object.keys(o).sort();
  const str = (k: string): string | undefined => (typeof o[k] === "string" ? (o[k] as string) : undefined);

  if ("record_id" in o && "workbench_id" in o) {
    const extra = keys.filter((k) => !["workbench_id", "record_id", "revision", "display"].includes(k));
    if (extra.length > 0) return refuse("malformed-object", `record_ref carries unknown keys ${extra.join(", ")}`);
    const workbench_id = str("workbench_id");
    const record_id = str("record_id");
    if (workbench_id === undefined || !p.uuid.test(workbench_id)) return refuse("malformed-object", "record_ref.workbench_id is not a UUID");
    if (record_id === undefined || !p.uuid.test(record_id)) return refuse("malformed-object", "record_ref.record_id is not a UUID");
    const ref: RecordRef = { workbench_id, record_id };
    if ("revision" in o) {
      const revision = str("revision");
      if (revision === undefined || !p.sha256.test(revision)) return refuse("malformed-object", "record_ref.revision is not a sha256: value");
      ref.revision = revision;
    }
    if ("display" in o) {
      const display = str("display");
      if (display === undefined || display.length === 0) return refuse("malformed-object", "record_ref.display is not a non-empty string");
      ref.display = display;
    }
    return { ok: true, reference: { kind: "record", ref } };
  }

  if ("path" in o && "sha256" in o && "kind" in o) {
    if (keys.length !== 3) return refuse("malformed-object", `artefact_ref carries unknown keys ${keys.filter((k) => !["path", "sha256", "kind"].includes(k)).join(", ")}`);
    const path = str("path");
    const sha256 = str("sha256");
    const kind = str("kind");
    if (path === undefined || !p.workbenchPath.test(path)) return refuse("malformed-object", "artefact_ref.path is not a workbench-relative path");
    if (sha256 === undefined || !p.sha256.test(sha256)) return refuse("malformed-object", "artefact_ref.sha256 is not a sha256: value");
    if (kind === undefined || !p.token.test(kind)) return refuse("malformed-object", "artefact_ref.kind is not a lowercase token");
    return { ok: true, reference: { kind: "artefact", ref: { path, sha256, kind } } };
  }

  if ("project" in o && "citation" in o) {
    if (keys.length !== 2) return refuse("malformed-object", `foreign_ref carries unknown keys ${keys.filter((k) => !["project", "citation"].includes(k)).join(", ")}`);
    const project = str("project");
    const citation = str("citation");
    if (project === undefined || !p.project.test(project)) return refuse("malformed-object", "foreign_ref.project is not a project name");
    if (citation === undefined) return refuse("malformed-object", "foreign_ref.citation is not a string");
    const inner = parseCitation(citation);
    if (!inner.ok) return refuse(inner.reason, `foreign_ref.citation: ${inner.detail}`);
    if (inner.reference.kind === "foreign") return refuse("malformed-object", "foreign_ref.citation does not nest another foreign citation");
    return { ok: true, reference: { kind: "foreign", project, citation: inner.reference as LegacyCitation } };
  }

  return refuse("malformed-object", `an object with keys ${keys.join(", ")} is neither a record_ref, an artefact_ref nor a foreign_ref`);
}

// --- rendering --------------------------------------------------------------

/**
 * The prose form of a reference. A legacy citation renders as its basename,
 * a foreign one with its prefix, an artefact as its workbench path. A
 * `record_ref` renders as its `display` when it has one; without a display
 * there is no prose form, and the record id is returned so that the output
 * still names the record and never invents a basename.
 */
export function renderReference(reference: Reference): string {
  switch (reference.kind) {
    case "legacy-marker":
    case "legacy-markerless":
      return reference.basename;
    case "foreign":
      return `foreign:${reference.project}:${reference.citation.basename}`;
    case "artefact":
      return reference.ref.path;
    case "record":
      return reference.ref.display ?? reference.ref.record_id;
  }
}
