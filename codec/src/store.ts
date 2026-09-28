// ---------------------------------------------------------------------------
// The record-pair store and the local write discipline of spec section 6.
//
// Three questions, three functions:
//
//   openWorkbench(root)                     what kind of workbench is this?
//   readPair(wb, path)                      the control record, its revision, its narrative
//   writeControl(wb, path, value, expected) replace the control record, if it is still the one read
//
// `openWorkbench` reads `workbench.json` when present (spec 4.1). A manifest
// with an unknown schema or a required feature this codec lacks is reported
// as `unsupported`, with the diagnosis attached rather than thrown, because
// inspection may show raw data while mutation is refused. No manifest at all
// is the `legacy` state: reads are allowed, mutation is refused with
// `unsupported-format/legacy-workbench`.
//
// The revision of a record is `sha256:` over the exact stored bytes, returned
// beside the record and never written into it. `writeControl` is the whole of
// FJ01's mutation: a local exclusive lock on the record (`.json-state/<sha of
// path>.lock`, created with O_EXCL, released on exit, stale after 60 s by
// mtime when its holder is gone, the rule `bin/fusion-commit-lock` applies),
// a re-read of the stored bytes under the lock and a refusal
// `conflict/revision-mismatch` when their hash is not the one the caller read,
// the deterministic serialisation to a temp file in the same directory, an
// fsync, an atomic rename. No journal: the one write is one file, and the
// multi-file journal the spec asks for is FJ02's.
//
// The serialisation is deterministic so that two writers of the same value
// produce the same bytes and so the same revision: two-space indent, LF, a
// final newline, and the key order of the schema's `properties`, applied
// recursively through `$ref`, `allOf` and the matching `oneOf` branch. Keys
// the schema does not name (the content of `extensions` and `legacy_fields`)
// keep the order they arrived in. Every valid fixture under `fixtures/valid/`
// is byte-identical to its own serialisation, which `store.test.ts` asserts.
//
// Everything here takes and returns workbench-relative paths and refuses one
// that leaves the root: a record outside the workbench is `unknown-scope`.
// ---------------------------------------------------------------------------

import { createHash } from "node:crypto";
import {
  closeSync,
  existsSync,
  fsyncSync,
  mkdirSync,
  openSync,
  readFileSync,
  renameSync,
  statSync,
  unlinkSync,
  writeSync,
} from "node:fs";
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import type { ErrorClass } from "./cli/protocol.js";
import { strictParse } from "./strict-json.js";
import { schemas, type SchemaSet, type ValidationError } from "./validate.js";

export const WORKBENCH_MANIFEST = "workbench.json";
export const WORKBENCH_SCHEMA_ID = "urn:fusion:schema:fusion.workbench/v1";
export const PACKAGE_SCHEMA_ID = "urn:fusion:schema:fusion.package/v1";
export const RECORD_SCHEMA_ID = "urn:fusion:schema:fusion.record/v1";
export const SCHEMA_ID_PREFIX = "urn:fusion:schema:";
/** The features this codec can honour in `required_features` (spec 4.1). */
export const SUPPORTED_FEATURES: readonly string[] = ["json-control-v1"];
/** Local state, class L, never tracked: locks and operation answers. */
export const STATE_DIR = ".json-state";
/** A lock older than this whose holder is gone is reaped, as `bin/fusion-commit-lock` does. */
export const LOCK_STALE_MS = 60_000;

export interface StoreError {
  class: ErrorClass;
  reason: string;
  detail: string;
  errors?: ValidationError[];
}

export type Result<T> = { ok: true; value: T } | { ok: false; error: StoreError };

const err = <T>(cls: ErrorClass, reason: string, detail: string, errors?: ValidationError[]): Result<T> => ({
  ok: false,
  error: { class: cls, reason, detail, ...(errors !== undefined ? { errors } : {}) },
});

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);

export const revisionOf = (bytes: Uint8Array): string => "sha256:" + createHash("sha256").update(bytes).digest("hex");

// --- the workbench ------------------------------------------------------------

export type WorkbenchState = "json-control" | "legacy" | "unsupported";

export interface Workbench {
  /** Absolute, resolved. */
  root: string;
  state: WorkbenchState;
  /** The manifest's id, when there is a valid manifest. */
  id: string | null;
  /** The manifest as parsed, whatever its state; null when absent or unparseable. */
  manifest: unknown;
  /** Why the state is `unsupported`; null otherwise. */
  diagnosis: StoreError | null;
}

/**
 * Opens the workbench at `root`. Only a root that is not a directory is an
 * error; every manifest state is a value, so that `inspect` can show it.
 */
export function openWorkbench(root: string, set: SchemaSet = schemas()): Result<Workbench> {
  const abs = resolve(root);
  let isDir = false;
  try {
    isDir = statSync(abs).isDirectory();
  } catch {
    isDir = false;
  }
  if (!isDir) return err("unknown-scope", "workbench-missing", `${abs} is not a directory`);

  const manifestPath = join(abs, WORKBENCH_MANIFEST);
  if (!existsSync(manifestPath)) return { ok: true, value: { root: abs, state: "legacy", id: null, manifest: null, diagnosis: null } };

  const unsupported = (diagnosis: StoreError, manifest: unknown): Result<Workbench> => ({
    ok: true,
    value: { root: abs, state: "unsupported", id: null, manifest, diagnosis },
  });

  const parsed = strictParse(readFileSync(manifestPath));
  if (!parsed.ok) return unsupported({ class: "schema-invalid", reason: parsed.reason, detail: `${WORKBENCH_MANIFEST}: ${parsed.detail}` }, null);
  const manifest = parsed.value as Record<string, unknown>;
  const schema = manifest.schema;
  if (schema !== WORKBENCH_SCHEMA_ID.slice(SCHEMA_ID_PREFIX.length)) {
    return unsupported(
      { class: "unsupported-format", reason: "unknown-schema", detail: `${WORKBENCH_MANIFEST} declares schema ${JSON.stringify(schema)}; this codec reads fusion.workbench/v1` },
      manifest,
    );
  }
  const v = set.validate(WORKBENCH_SCHEMA_ID, manifest);
  if (!v.ok) {
    if (v.class === "unsupported-format") return unsupported({ class: "unsupported-format", reason: "unknown-schema", detail: `no schema ${v.schemaId} loaded` }, manifest);
    return unsupported({ class: "schema-invalid", reason: "manifest-invalid", detail: describeErrors(v.errors), errors: v.errors }, manifest);
  }
  const features = manifest.required_features as string[];
  const unknown = features.filter((f) => !SUPPORTED_FEATURES.includes(f));
  if (unknown.length > 0) {
    return unsupported(
      { class: "unsupported-format", reason: "unknown-feature", detail: `${WORKBENCH_MANIFEST} requires ${unknown.join(", ")}; this codec supports ${SUPPORTED_FEATURES.join(", ")}` },
      manifest,
    );
  }
  return { ok: true, value: { root: abs, state: "json-control", id: manifest.id as string, manifest, diagnosis: null } };
}

export const describeErrors = (errors: ValidationError[]): string => errors.map((e) => `${e.instancePath || "/"} ${e.keyword}: ${e.message}`).join("; ");

// --- paths --------------------------------------------------------------------

/**
 * The absolute path of a workbench-relative one, or a refusal when it is
 * absolute, escapes the root, or carries a backslash.
 */
export function resolveInside(wb: Workbench, path: string): Result<string> {
  if (path.length === 0 || isAbsolute(path) || path.includes("\\")) return err("unknown-scope", "path-not-relative", `${JSON.stringify(path)} is not a workbench-relative path`);
  const abs = resolve(wb.root, path);
  const rel = relative(wb.root, abs);
  if (rel.length === 0 || rel.startsWith("..") || isAbsolute(rel)) return err("unknown-scope", "path-outside-workbench", `${path} leaves ${wb.root}`);
  return { ok: true, value: abs };
}

// --- the pair -----------------------------------------------------------------

export const KINDS = ["package", "issue", "plan", "discussion", "decision"] as const;
export type Kind = (typeof KINDS)[number];

export interface Pair {
  /** Workbench-relative path of the control file, as given. */
  path: string;
  kind: Kind;
  schemaId: string;
  control: Record<string, unknown>;
  bytes: Buffer;
  revision: string;
  /** The narrative the control record names; `sha256` null when the file is absent. Null when the record names none. */
  narrative: { path: string; sha256: string | null } | null;
}

/** Reads one control record. Strict parse only; schema validity is `validate`'s question, not the reader's. */
export function readPair(wb: Workbench, path: string, set: SchemaSet = schemas()): Result<Pair> {
  const abs = resolveInside(wb, path);
  if (!abs.ok) return abs;
  let bytes: Buffer;
  try {
    bytes = readFileSync(abs.value);
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === "ENOENT") return err("unresolved-reference", "record-not-found", `${path} does not exist in ${wb.root}`);
    throw e;
  }
  const parsed = strictParse(bytes);
  if (!parsed.ok) return err("schema-invalid", parsed.reason, `${path}: ${parsed.detail}`);
  const control = parsed.value as Record<string, unknown>;
  const schemaField = control.schema;
  if (typeof schemaField !== "string") return err("schema-invalid", "schema-field-missing", `${path}: no string "schema" field`);
  const schemaId = SCHEMA_ID_PREFIX + schemaField;
  if (set.document(schemaId) === undefined) return err("unsupported-format", "unknown-schema", `${path} declares ${schemaField}; loaded: ${set.ids().join(", ")}`);
  const kind = kindOf(schemaId, control);
  if (kind === null) return err("unsupported-format", "not-a-pair-kind", `${path} declares ${schemaField}${schemaId === RECORD_SCHEMA_ID ? ` with kind ${JSON.stringify(control.kind)}` : ""}; a pair is a package or an issue, plan, discussion or decision record`);
  return { ok: true, value: { path, kind, schemaId, control, bytes, revision: revisionOf(bytes), narrative: narrativeOf(wb, control) } };
}

function kindOf(schemaId: string, control: Record<string, unknown>): Kind | null {
  if (schemaId === PACKAGE_SCHEMA_ID) return "package";
  if (schemaId === RECORD_SCHEMA_ID && typeof control.kind === "string" && (KINDS as readonly string[]).includes(control.kind)) return control.kind as Kind;
  return null;
}

function narrativeOf(wb: Workbench, control: Record<string, unknown>): Pair["narrative"] {
  const n = control.narrative;
  if (!isObject(n) || typeof n.path !== "string") return null;
  const abs = resolveInside(wb, n.path);
  if (!abs.ok || !existsSync(abs.value)) return { path: n.path, sha256: null };
  return { path: n.path, sha256: revisionOf(readFileSync(abs.value)) };
}

// --- the serialisation ----------------------------------------------------------

/**
 * The bytes a control record is stored as: two-space indent, LF, a final
 * newline, keys in the order the schema's `properties` name them. Throws on a
 * `schema` field the set does not know: the caller validated first.
 */
export function serialise(value: unknown, set: SchemaSet = schemas()): string {
  if (!isObject(value) || typeof value.schema !== "string") throw new Error("a control record is an object with a string schema field");
  const schemaId = SCHEMA_ID_PREFIX + value.schema;
  const doc = set.document(schemaId);
  if (doc === undefined) throw new Error(`no schema ${schemaId} loaded`);
  const ordered = order(value, { node: doc, base: schemaId }, set);
  return JSON.stringify(ordered, null, 2) + "\n";
}

interface Located {
  node: unknown;
  /** The `$id` of the document `node` sits in, for a `#/...` reference. */
  base: string;
}

function order(value: unknown, at: Located, set: SchemaSet): unknown {
  if (Array.isArray(value)) {
    const items = merged(at, value, set).items;
    return value.map((v) => (items === undefined ? v : order(v, items, set)));
  }
  if (!isObject(value)) return value;
  const { properties } = merged(at, value, set);
  const out: Record<string, unknown> = {};
  for (const [key, node] of properties) {
    if (key in value) out[key] = order(value[key], node, set);
  }
  for (const key of Object.keys(value)) {
    if (!(key in out)) out[key] = value[key];
  }
  return out;
}

interface Merged {
  /** Property name to its schema, in declaration order across the merged nodes. */
  properties: Map<string, Located>;
  items: Located | undefined;
}

/**
 * The properties (and items) a value is described by at `at`, following
 * `$ref`, every `allOf` member, and the one `oneOf`/`anyOf` branch the value
 * matches by type, required keys and constants.
 */
function merged(at: Located, value: unknown, set: SchemaSet): Merged {
  const result: Merged = { properties: new Map(), items: undefined };
  const visit = (loc: Located): void => {
    const resolved = deref(loc, set);
    const node = resolved.node;
    if (!isObject(node)) return;
    if (isObject(node.properties)) {
      for (const key of Object.keys(node.properties)) {
        if (!result.properties.has(key)) result.properties.set(key, { node: node.properties[key], base: resolved.base });
      }
    }
    if (node.items !== undefined && result.items === undefined) result.items = { node: node.items, base: resolved.base };
    if (Array.isArray(node.allOf)) for (const member of node.allOf) visit({ node: member, base: resolved.base });
    for (const key of ["oneOf", "anyOf"]) {
      const branches = node[key];
      if (!Array.isArray(branches)) continue;
      const match = branches.find((b) => matches(deref({ node: b, base: resolved.base }, set), value, set));
      if (match !== undefined) visit({ node: match, base: resolved.base });
    }
  };
  visit(at);
  return result;
}

/** Whether `value` plausibly belongs to the branch at `loc`: its type, its required keys, its constants. */
function matches(loc: Located, value: unknown, set: SchemaSet): boolean {
  const node = loc.node;
  if (!isObject(node)) return false;
  const types = Array.isArray(node.type) ? node.type : typeof node.type === "string" ? [node.type] : null;
  const actual = jsonType(value);
  if (types !== null && !types.some((t) => t === actual || (t === "number" && actual === "integer"))) return false;
  if (types === null && (node.$ref !== undefined || Array.isArray(node.allOf))) {
    // A bare reference or composition: judge it by what it resolves to.
    const inner = merged(loc, value, set);
    if (inner.properties.size > 0 && actual !== "object") return false;
  }
  if (isObject(value)) {
    const required = Array.isArray(node.required) ? node.required : [];
    if (!required.every((k) => typeof k === "string" && k in value)) return false;
    if (isObject(node.properties)) {
      for (const [k, p] of Object.entries(node.properties)) {
        if (isObject(p) && "const" in p && k in value && value[k] !== p.const) return false;
      }
    }
    if (Array.isArray(node.allOf)) {
      for (const member of node.allOf) if (!matches(deref({ node: member, base: loc.base }, set), value, set)) return false;
    }
  }
  if (typeof value === "string" && typeof node.pattern === "string" && !new RegExp(node.pattern).test(value)) return false;
  return true;
}

function jsonType(value: unknown): string {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  if (typeof value === "number") return Number.isInteger(value) ? "integer" : "number";
  return typeof value;
}

/** Follows a `$ref` chain to the node it names; the base document travels with it. */
function deref(loc: Located, set: SchemaSet): Located {
  let current = loc;
  for (let hops = 0; hops < 32; hops++) {
    const node = current.node;
    if (!isObject(node) || typeof node.$ref !== "string") return current;
    const [docPart, pointer = ""] = node.$ref.split("#", 2) as [string, string?];
    const base = docPart.length > 0 ? docPart : current.base;
    const doc = set.document(base);
    if (doc === undefined) throw new Error(`$ref ${node.$ref} names a schema that is not loaded`);
    let target: unknown = doc;
    for (const seg of pointer.split("/").filter((s) => s.length > 0)) {
      const key = seg.replace(/~1/g, "/").replace(/~0/g, "~");
      target = isObject(target) ? target[key] : undefined;
    }
    if (target === undefined) throw new Error(`$ref ${node.$ref} does not resolve`);
    // A referencing node may carry its own keywords beside $ref (a description,
    // a sibling allOf); the target's keywords are what describe the value.
    current = { node: target, base };
  }
  throw new Error("$ref chain longer than 32 hops");
}

// --- the write ----------------------------------------------------------------

export interface WriteOptions {
  /** How long to wait on a live lock before answering `conflict/lock-timeout`. */
  waitMs?: number;
  /** The poll interval while waiting. */
  pollMs?: number;
  /** The clock, for tests. */
  now?: () => number;
}

export interface Written {
  revision: string;
  bytes: Buffer;
}

/**
 * Replaces the control record at `path` with `value`, provided the stored
 * bytes still hash to `expectedRevision`. The value is validated by the
 * caller; here it is serialised, so an unknown schema throws.
 */
export async function writeControl(wb: Workbench, path: string, value: unknown, expectedRevision: string, options: WriteOptions = {}): Promise<Result<Written>> {
  if (wb.state === "legacy") return err("unsupported-format", "legacy-workbench", `${wb.root} carries no ${WORKBENCH_MANIFEST}; reads are allowed, mutation is not (spec 4.1)`);
  if (wb.state === "unsupported") return err("unsupported-format", wb.diagnosis?.reason ?? "unsupported", wb.diagnosis?.detail ?? "the manifest is unsupported");
  const abs = resolveInside(wb, path);
  if (!abs.ok) return abs;
  const text = serialise(value);
  const bytes = Buffer.from(text, "utf-8");

  const lock = await acquireLock(wb, path, options);
  if (!lock.ok) return lock;
  try {
    let stored: Buffer;
    try {
      stored = readFileSync(abs.value);
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code === "ENOENT") return err("unresolved-reference", "record-not-found", `${path} does not exist in ${wb.root}`);
      throw e;
    }
    const current = revisionOf(stored);
    if (current !== expectedRevision) return err("conflict", "revision-mismatch", `stored ${current} expected ${expectedRevision}`);
    replaceAtomically(abs.value, bytes);
    return { ok: true, value: { revision: revisionOf(bytes), bytes } };
  } finally {
    releaseLock(lock.value);
  }
}

/** Writes `bytes` to a temp file beside `target`, fsyncs it, and renames it over `target`. */
export function replaceAtomically(target: string, bytes: Uint8Array): void {
  const dir = dirname(target);
  const temp = join(dir, `.${basename(target)}.${process.pid}.${Math.random().toString(36).slice(2, 10)}.tmp`);
  const fd = openSync(temp, "w", 0o644);
  try {
    let offset = 0;
    while (offset < bytes.byteLength) offset += writeSync(fd, bytes, offset, bytes.byteLength - offset);
    fsyncSync(fd);
  } finally {
    closeSync(fd);
  }
  try {
    renameSync(temp, target);
  } catch (e) {
    try {
      unlinkSync(temp);
    } catch {
      /* the rename failed and the temp file is what it left; nothing more to do */
    }
    throw e;
  }
  // The rename is durable once the directory entry is; best effort, since not
  // every platform lets a directory be fsynced.
  try {
    const dfd = openSync(dir, "r");
    try {
      fsyncSync(dfd);
    } finally {
      closeSync(dfd);
    }
  } catch {
    /* directory fsync unsupported here */
  }
}

// --- the lock -----------------------------------------------------------------

const held = new Set<string>();
let exitHookInstalled = false;

const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

export const lockPathFor = (wb: Workbench, path: string): string =>
  join(wb.root, STATE_DIR, `${createHash("sha256").update(path.split(sep).join("/")).digest("hex")}.lock`);

async function acquireLock(wb: Workbench, path: string, options: WriteOptions): Promise<Result<string>> {
  const lock = lockPathFor(wb, path);
  mkdirSync(dirname(lock), { recursive: true });
  const now = options.now ?? Date.now;
  const waitMs = options.waitMs ?? LOCK_STALE_MS + 5_000;
  const pollMs = options.pollMs ?? 50;
  const started = now();
  for (;;) {
    try {
      const fd = openSync(lock, "wx", 0o644);
      try {
        writeSync(fd, `pid: ${process.pid}\nacquired_at: ${new Date(now()).toISOString()}\n`);
      } finally {
        closeSync(fd);
      }
      held.add(lock);
      installExitHook();
      return { ok: true, value: lock };
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code !== "EEXIST") throw e;
    }
    if (isStale(lock, now())) {
      try {
        unlinkSync(lock);
      } catch {
        /* another waiter reaped it first */
      }
      continue;
    }
    if (now() - started >= waitMs) {
      return err("conflict", "lock-timeout", `${path} is locked by another writer (${describeHolder(lock)}) and was not released within ${waitMs} ms`);
    }
    await sleep(pollMs);
  }
}

function releaseLock(lock: string): void {
  held.delete(lock);
  try {
    unlinkSync(lock);
  } catch {
    /* already gone: reaped as stale by a waiter after this process stalled */
  }
}

function installExitHook(): void {
  if (exitHookInstalled) return;
  exitHookInstalled = true;
  process.on("exit", () => {
    for (const lock of held) {
      try {
        unlinkSync(lock);
      } catch {
        /* nothing to release */
      }
    }
  });
}

/** Older than `LOCK_STALE_MS` by mtime, and its recorded holder is not running (or none is recorded). */
function isStale(lock: string, nowMs: number): boolean {
  let mtime: number;
  try {
    mtime = statSync(lock).mtimeMs;
  } catch {
    return false; // gone between the EEXIST and now: the next open decides
  }
  if (nowMs - mtime < LOCK_STALE_MS) return false;
  const pid = holderPid(lock);
  if (pid === null) return true;
  try {
    process.kill(pid, 0);
    return false; // alive
  } catch (e) {
    return (e as NodeJS.ErrnoException).code === "ESRCH";
  }
}

function holderPid(lock: string): number | null {
  try {
    const m = /^pid: ([0-9]+)$/m.exec(readFileSync(lock, "utf-8"));
    return m === null ? null : Number(m[1]);
  } catch {
    return null;
  }
}

function describeHolder(lock: string): string {
  try {
    return readFileSync(lock, "utf-8").trim().split("\n").join(", ");
  } catch {
    return "holder unknown";
  }
}
