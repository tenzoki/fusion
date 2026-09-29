// ---------------------------------------------------------------------------
// The record-pair store and the local write discipline of spec section 6.
//
// Four questions, four functions:
//
//   openWorkbench(root)                     what kind of workbench is this?
//   readPair(wb, path)                      the control record, its revision, its narrative
//   writeControl(wb, path, value, expected) replace the control record, if it is still the one read
//   acquireLock(wb) / releaseLock(lock)     the one workbench write lock every writer takes
//
// `openWorkbench` reads `workbench.json` when present (spec 4.1). A manifest
// with an unknown schema or a required feature this codec lacks is reported
// as `unsupported`, with the diagnosis attached rather than thrown, because
// inspection may show raw data while mutation is refused. No manifest at all
// is the `legacy` state: reads are allowed, mutation is refused with
// `unsupported-format/legacy-workbench`.
//
// The revision of a record is `sha256:` over the exact stored bytes, returned
// beside the record and never written into it. `writeControl` is FJ01's
// mutation, kept until the kernel replaces it (FJ02 step 3): the workbench
// write lock, a re-read of the stored bytes under it and a refusal
// `conflict/revision-mismatch` when their hash is not the one the caller read,
// the deterministic serialisation to a temp file in the same directory, an
// fsync, an atomic rename. The journal that makes a multi-file operation
// recoverable is `journal.ts`.
//
// The lock is ONE file for the whole workbench, `.json-state/write.lock`
// (decision 260928-2251, option 1), and its protocol is the FJ02 plan's
// (discussion 260929-0709, claims C9, C10, C21):
//
//   - It is created by linking a complete file (pid, host, nonce, time) to the
//     name, so a lock this codec writes always records its PID.
//   - A holder is judged by what the lock records. Another host's lock is
//     never stale. A lock of this host, or one recording no host (FJ01's
//     format, and the hand-made lock of Prior's live-owner regression), is
//     stale the moment its PID is dead, with no age condition, and live while
//     the PID answers. Only a lock recording no PID at all falls back to the
//     60 s age rule.
//   - A stale lock is never unlinked. The one waiter that creates the claim
//     `write.lock.takeover.<hash of the stale bytes>` renames its own lock over
//     the name, after checking the name still holds those bytes. Ownership
//     moves only by an exclusive create, so no waiter can remove a lock it did
//     not judge.
//
// `.json-state/` is class L: every lock first makes sure it holds a
// `.gitignore` of `*`, so a tracked workbench never lists it and a clone
// never carries a foreign lock or intent.
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

import { createHash, randomBytes } from "node:crypto";
import {
  closeSync,
  existsSync,
  fstatSync,
  fsyncSync,
  linkSync,
  mkdirSync,
  openSync,
  readdirSync,
  readFileSync,
  renameSync,
  rmSync,
  statSync,
  unlinkSync,
  writeSync,
} from "node:fs";
import { hostname } from "node:os";
import { basename, dirname, isAbsolute, join, relative, resolve } from "node:path";
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
/** Local state, class L, never tracked: the write lock, the journal, operation answers. */
export const STATE_DIR = ".json-state";
/** The age after which a lock recording no PID is stale; a lock temp file older than this is dead. */
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

// --- the walk -------------------------------------------------------------------

/**
 * A control file by its name: a package, a record, or an evidence record.
 * Evidence is admitted to the walk ahead of `readPair` learning its kind, so
 * that every lookup over the walk sees every control file.
 */
export const isControlFile = (name: string): boolean => name === "package.json" || name.endsWith(".record.json") || name.endsWith(".evidence.json");

/** Every control file under `dir`, workbench-relative with forward slashes, sorted; dot entries skipped. */
export function controlFiles(wb: Workbench, dir: string): string[] {
  const out: string[] = [];
  const walk = (d: string): void => {
    let entries;
    try {
      entries = readdirSync(d, { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of entries) {
      if (e.name.startsWith(".")) continue;
      const abs = join(d, e.name);
      if (e.isDirectory()) walk(abs);
      else if (e.isFile() && isControlFile(e.name)) out.push(relative(wb.root, abs).split("\\").join("/"));
    }
  };
  walk(dir);
  return out.sort();
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
  /** Test-only pause points in `acquireLock`; `main.ts` passes none. */
  lockHooks?: LockHooks;
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

  const lock = await acquireLock(wb, options);
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

const tempBeside = (target: string): string => join(dirname(target), `.${basename(target)}.${process.pid}.${randomBytes(4).toString("hex")}.tmp`);

function writeAll(fd: number, bytes: Uint8Array): void {
  let offset = 0;
  while (offset < bytes.byteLength) offset += writeSync(fd, bytes, offset, bytes.byteLength - offset);
}

/** Creates `path`, which must not exist, with `bytes`, and fsyncs it before returning. */
export function writeDurably(path: string, bytes: Uint8Array): void {
  const fd = openSync(path, "wx", 0o644);
  try {
    writeAll(fd, bytes);
    fsyncSync(fd);
  } finally {
    closeSync(fd);
  }
}

/** The rename is durable once the directory entry is; best effort, since not every platform lets a directory be fsynced. */
export function fsyncDirectory(dir: string): void {
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

/** Writes `bytes` to a temp file beside `target`, fsyncs it, and renames it over `target`. */
export function replaceAtomically(target: string, bytes: Uint8Array): void {
  const temp = tempBeside(target);
  writeDurably(temp, bytes);
  try {
    renameSync(temp, target);
  } catch (e) {
    unlinkQuietly(temp);
    throw e;
  }
  fsyncDirectory(dirname(target));
}

/**
 * Gives `target` the complete `bytes` in one step, or reports that the name is
 * taken: a durable temp file is linked to the name, which is atomic and fails
 * on an existing name, so no reader ever sees the file half written.
 */
function linkComplete(target: string, bytes: Uint8Array): boolean {
  for (;;) {
    const temp = tempBeside(target);
    writeDurably(temp, bytes);
    try {
      linkSync(temp, target);
      fsyncDirectory(dirname(target));
      return true;
    } catch (e) {
      const code = (e as NodeJS.ErrnoException).code;
      if (code === "EEXIST") return false;
      // The holder's sweep removed the temp file between the write and the
      // link (it is removed only once older than LOCK_STALE_MS): write anew.
      if (code !== "ENOENT") throw e;
    } finally {
      unlinkQuietly(temp);
    }
  }
}

function unlinkQuietly(path: string): void {
  try {
    unlinkSync(path);
  } catch {
    /* already gone */
  }
}

/** Unlinks `path` only while it still holds `bytes`: a file this process did not write is never removed. */
function unlinkIfHolds(path: string, bytes: Uint8Array): void {
  try {
    if (readFileSync(path).equals(bytes)) unlinkSync(path);
  } catch {
    /* gone already */
  }
}

// --- the self-ignore ----------------------------------------------------------

/** The content of `.json-state/.gitignore`: the directory ignores itself, `.gitignore` included (class L). */
export const SELF_IGNORE = "*\n";

/**
 * Makes sure `.json-state/` exists and holds a `.gitignore` of exactly `*`.
 * Absent: created by linking a complete file, so a crash never leaves it
 * empty, and a concurrent creator's `EEXIST` is success. Present with other
 * bytes (an empty file a non-atomic writer left, an edit): replaced
 * atomically. Present and correct: nothing is written. It runs on every lock,
 * so a `.json-state/` another writer created without it gains it at the first
 * lock taken here.
 */
export function ensureSelfIgnore(wb: Workbench): void {
  const dir = join(wb.root, STATE_DIR);
  mkdirSync(dir, { recursive: true });
  const file = join(dir, ".gitignore");
  let current: Buffer | null;
  try {
    current = readFileSync(file);
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code !== "ENOENT") throw e;
    current = null;
  }
  const wanted = Buffer.from(SELF_IGNORE, "utf-8");
  if (current === null) linkComplete(file, wanted);
  else if (!current.equals(wanted)) replaceAtomically(file, wanted);
}

// --- the lock -----------------------------------------------------------------

/** The one workbench-wide write lock, under `STATE_DIR`. */
export const LOCK_FILE = "write.lock";
/** A takeover claim on a stale lock instance is `<lock>.takeover.<hex sha256 of its bytes>`. */
export const TAKEOVER_INFIX = ".takeover.";

export interface LockHooks {
  /** Runs after a waiter judged the lock stale and before it claims the takeover, for the race test. */
  afterJudge?: (judged: { path: string; bytes: Buffer }) => Promise<void> | void;
}

/** A lock this process holds: where, and the bytes it wrote, which name the instance. */
export interface HeldLock {
  path: string;
  bytes: Buffer;
}

const held = new Map<string, Buffer>();
let exitHookInstalled = false;

const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

const hexOf = (bytes: Uint8Array): string => createHash("sha256").update(bytes).digest("hex");

export const lockPathFor = (wb: Workbench): string => join(wb.root, STATE_DIR, LOCK_FILE);

/** What every lock and every claim this codec writes records; the nonce makes each instance's bytes unique. */
function lockContent(now: () => number): Buffer {
  return Buffer.from(`pid: ${process.pid}\nhost: ${hostname()}\nnonce: ${randomBytes(8).toString("hex")}\nacquired_at: ${new Date(now()).toISOString()}\n`, "utf-8");
}

type Judgement = { state: "gone" } | { state: "live"; bytes: Buffer } | { state: "stale"; bytes: Buffer };

/**
 * Whether the holder `path` records is alive, from what the file records.
 * Another host's lock is never stale: a PID means nothing off the host that
 * recorded it. A lock of this host, or one recording no host, is stale when
 * its PID is dead (`ESRCH`) and live when the PID answers or the answer is
 * `EPERM`. A lock recording no PID is stale only once older than
 * `LOCK_STALE_MS`.
 */
function judge(path: string, nowMs: number): Judgement {
  let bytes: Buffer;
  let mtimeMs: number;
  try {
    const fd = openSync(path, "r");
    try {
      mtimeMs = fstatSync(fd).mtimeMs;
      bytes = readFileSync(fd);
    } finally {
      closeSync(fd);
    }
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === "ENOENT") return { state: "gone" };
    throw e;
  }
  const text = bytes.toString("utf-8");
  const host = /^host: (.*)$/m.exec(text)?.[1];
  if (host !== undefined && host !== hostname()) return { state: "live", bytes };
  const pidMatch = /^pid: ([0-9]+)$/m.exec(text);
  const pid = pidMatch === null ? null : Number(pidMatch[1]);
  // pid 0 would signal this process group; it names no holder.
  if (pid !== null && Number.isSafeInteger(pid) && pid > 0) return { state: alive(pid) ? "live" : "stale", bytes };
  return { state: nowMs - mtimeMs >= LOCK_STALE_MS ? "stale" : "live", bytes };
}

function alive(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch (e) {
    return (e as NodeJS.ErrnoException).code !== "ESRCH";
  }
}

/**
 * Replaces the stale instance `stale` at `path` with `own`, never unlinking
 * it. Only the process that creates the claim `<path>.takeover.<hash of
 * stale>` may replace that instance, and it does so by renaming `own` over
 * `path` after checking `path` still holds `stale`. A claim whose own holder
 * is dead is taken over the same way, one level up. Returns whether `own` is
 * now at `path`; false means start again.
 */
function takeOver(path: string, stale: Buffer, own: Buffer, now: () => number, depth = 0): boolean {
  if (depth > 4) return false;
  const claim = `${path}${TAKEOVER_INFIX}${hexOf(stale)}`;
  const claimBytes = lockContent(now);
  if (!linkComplete(claim, claimBytes)) {
    const j = judge(claim, now());
    if (j.state !== "stale") return false; // another waiter is taking over, or just finished
    if (!takeOver(claim, j.bytes, claimBytes, now, depth + 1)) return false;
  }
  try {
    let current: Buffer;
    try {
      current = readFileSync(path);
    } catch {
      return false; // gone meanwhile: the next exclusive create decides
    }
    if (!current.equals(stale)) return false;
    const temp = tempBeside(path);
    writeDurably(temp, own);
    try {
      renameSync(temp, path);
    } catch (e) {
      unlinkQuietly(temp);
      throw e;
    }
    fsyncDirectory(dirname(path));
    return true;
  } finally {
    unlinkIfHolds(claim, claimBytes);
  }
}

/**
 * Takes the workbench write lock, waiting on a live holder until `waitMs`
 * and then answering `conflict/lock-timeout` naming it. Every mutation and
 * every recovery goes through here.
 */
export async function acquireLock(wb: Workbench, options: WriteOptions = {}): Promise<Result<HeldLock>> {
  ensureSelfIgnore(wb);
  const lock = lockPathFor(wb);
  const now = options.now ?? Date.now;
  const waitMs = options.waitMs ?? LOCK_STALE_MS + 5_000;
  const pollMs = options.pollMs ?? 50;
  const started = now();
  for (;;) {
    const own = lockContent(now);
    if (linkComplete(lock, own)) return hold(lock, own, now());
    const j = judge(lock, now());
    if (j.state === "gone") continue; // released between the create and the read
    if (j.state === "stale") {
      await options.lockHooks?.afterJudge?.({ path: lock, bytes: j.bytes });
      const mine = lockContent(now);
      if (takeOver(lock, j.bytes, mine, now)) return hold(lock, mine, now());
    }
    if (now() - started >= waitMs) {
      return err("conflict", "lock-timeout", `the workbench write lock ${STATE_DIR}/${LOCK_FILE} is held by another writer (${describeHolder(lock)}) and was not released within ${waitMs} ms`);
    }
    await sleep(pollMs);
  }
}

/**
 * Records the lock as held, then clears what dead waiters left: takeover
 * claims on any instance but the one now held (a claim on a replaced
 * instance is never honoured, since its re-check fails, but it would stay),
 * and temp files older than `LOCK_STALE_MS`.
 */
function hold(lock: string, bytes: Buffer, nowMs: number): Result<HeldLock> {
  held.set(lock, bytes);
  installExitHook();
  const dir = dirname(lock);
  const ownClaim = `${LOCK_FILE}${TAKEOVER_INFIX}${hexOf(bytes)}`;
  for (const name of readdirSync(dir)) {
    const abs = join(dir, name);
    if (name.startsWith(`${LOCK_FILE}${TAKEOVER_INFIX}`) && !name.startsWith(ownClaim)) {
      unlinkQuietly(abs);
    } else if (name.startsWith(".") && name.endsWith(".tmp")) {
      try {
        const st = statSync(abs);
        if (st.isFile() && nowMs - st.mtimeMs >= LOCK_STALE_MS) unlinkQuietly(abs);
      } catch {
        /* gone already */
      }
    }
  }
  return { ok: true, value: { path: lock, bytes } };
}

/** Releases a lock this process holds; a lock that is no longer this instance is left alone. */
export function releaseLock(lock: HeldLock): void {
  held.delete(lock.path);
  unlinkIfHolds(lock.path, lock.bytes);
}

function installExitHook(): void {
  if (exitHookInstalled) return;
  exitHookInstalled = true;
  process.on("exit", () => {
    for (const [lock, bytes] of held) unlinkIfHolds(lock, bytes);
  });
}

function describeHolder(lock: string): string {
  try {
    const text = readFileSync(lock, "utf-8").trim();
    const fields = text.length === 0 ? "records nothing" : text.split("\n").join(", ");
    return /^host: /m.test(text) ? fields : `${fields}, no host recorded: read as ${hostname()}`;
  } catch {
    return "holder unknown";
  }
}
