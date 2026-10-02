// ---------------------------------------------------------------------------
// The intent journal and the stored answer (spec section 6, FJ02 plan step 2).
//
// An operation that changes files becomes durable as an INTENT before its
// first file changes, and leaves the journal only after its last file and its
// stored answer have landed. Everything lives under `.json-state/`, class L:
//
//   journal/<operation_id>/          one pending intent, committed by one
//     intent.json                    directory rename: {operation_id, op,
//                                    request_digest, writes, response,
//                                    created_at}
//     <hex of a post-hash>           the exact post-bytes of each write, one
//                                    file per distinct content, named by its
//                                    hash and checked against it on read
//   ops/<operation_id>.json          the stored answer: {operation_id, op,
//                                    request_digest, response}
//
// Every name beginning with a dot in `journal/` or `ops/` is transient: an
// intent directory still being built, one being removed, a temp file of
// `replaceAtomically`. Such an entry belongs to no operation, is never parsed,
// and is deleted by `sweep`, which only the lock holder calls (discussion
// 260929-0709, C11).
//
// Per named file three hashes decide the state, tested post first (C4), so a
// write whose post-bytes equal its pre-bytes reads as landed: `post`, `pre`
// (or absent where the write creates the file), or `diverged`. A live
// writer's files are only ever at pre or post, because every write is a
// rename, so `diverged` means a hand edit or a pull intervened, and recovery
// leaves it and the intent as they stand.
//
// The strict reader's 1 MiB cap applies to each file separately (C12), so
// no file here may exceed it: `intent.json` and an answer carry paths, hashes
// and a response and never a request body; a staged file over the cap is
// refused before anything is written.
//
// Replay equality is FJ01's rule, a key-sorted rendering of the request,
// computed here as a digest so the answer file need not carry the request.
// An answer the FJ01 bundle stored (`{operation_id, request, response}`) is
// still read, by digesting its request.
//
// A removal entry (FJ04 contract delta as amended, "The journal's removal
// entry") is a write with `after: null`: it removes a REGULAR file and needs
// a non-null `before`. It is admitted in an intent of `migration`'s
// `rollback` phase only, which the intent names in `phase`; anywhere else, or
// null to null, `commitIntent` refuses it before anything is written and a
// journal holding one reads as `journal-unreadable`. Its state is read by
// `lstat`, never through a link: a regular file at `before` is pre, an absent
// entry is post, anything else (a link, dangling or not, a directory, other
// bytes) is diverged. Applying it unlinks the file and fsyncs the parent;
// recovery is idempotent, since absent is done. Intents written before this
// revision carry no `phase` and no removal, and read and recover as before.
// ---------------------------------------------------------------------------

import { randomBytes } from "node:crypto";
import { existsSync, lstatSync, mkdirSync, readdirSync, readFileSync, renameSync, rmSync, statSync, unlinkSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import type { Response } from "./cli/protocol.js";
import { STATE_DIR, fsyncDirectory, replaceAtomically, resolveInside, revisionOf, writeDurably, type Result, type Workbench } from "./store.js";
import { MAX_RECORD_BYTES, strictParse } from "./strict-json.js";

export const JOURNAL_DIR = "journal";
export const OPS_DIR = "ops";
export const INTENT_FILE = "intent.json";

/** One file an operation writes: its pre-hash (`null`: the file must be absent) and its post-hash. */
export interface Write {
  path: string;
  before: string | null;
  after: string;
}

/** A removal entry: the regular file at `before` is removed (header). */
export interface Removal {
  path: string;
  before: string;
  after: null;
}

/** One entry of an intent: a write, or a removal. */
export type Entry = Write | Removal;

/** The phase that alone may carry a removal entry, of the op that alone has phases. */
export const REMOVAL_OP = "migration";
export const REMOVAL_PHASE = "rollback";

export interface Intent {
  operation_id: string;
  op: string;
  /** `migration` intents only: the request's phase. Absent in every other intent, and in every intent written before FJ04's step 6. */
  phase?: string;
  request_digest: string;
  writes: Entry[];
  response: Response;
  created_at: string;
}

/** A committed intent as read back: the intent and each write's post-bytes by path. */
export interface PendingIntent {
  intent: Intent;
  contents: Map<string, Buffer>;
}

export type FileState = "post" | "pre" | "diverged";

export type Recovery = { landed: true } | { landed: false; blocked: Entry[] };

export interface StoredAnswer {
  operation_id: string;
  op: string;
  request_digest: string;
  response: Response;
}

const err = <T>(cls: "conflict" | "schema-invalid", reason: string, detail: string): Result<T> => ({ ok: false, error: { class: cls, reason, detail } });

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);

const SHA256 = /^sha256:[0-9a-f]{64}$/;
/** An operation id names a directory and a file: no separator, no leading dot. The protocol admits UUIDs only. */
const OPERATION_ID = /^[A-Za-z0-9][A-Za-z0-9_-]*$/;

export const journalDir = (wb: Workbench): string => join(wb.root, STATE_DIR, JOURNAL_DIR);
export const opsDir = (wb: Workbench): string => join(wb.root, STATE_DIR, OPS_DIR);
export const answerPath = (wb: Workbench, id: string): string => join(opsDir(wb), `${id}.json`);
const intentDir = (wb: Workbench, id: string): string => join(journalDir(wb), id);
const stagedName = (hash: string): string => hash.slice("sha256:".length);
const nonce = (): string => `${process.pid}.${randomBytes(4).toString("hex")}`;

function checkId(id: string): void {
  // The protocol schema admits UUIDs only, so a failure here is a caller defect.
  if (!OPERATION_ID.test(id)) throw new Error(`operation id ${JSON.stringify(id)} cannot name a journal entry`);
}

// --- the request digest ---------------------------------------------------------

/** JSON with every object's keys sorted, so that two requests compare by content. */
export function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (typeof value === "object" && value !== null) {
    return `{${Object.keys(value).sort().map((k) => `${JSON.stringify(k)}:${canonical((value as Record<string, unknown>)[k])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

/** `sha256:` over the UTF-8 bytes of the canonical rendering: replay equality as FJ01 decides it. */
export const requestDigest = (req: unknown): string => revisionOf(Buffer.from(canonical(req), "utf-8"));

// --- the intent -----------------------------------------------------------------

/**
 * Makes `intent` durable: every post-bytes staged beside `intent.json` in a
 * dot-named directory, each file fsynced, then one rename to
 * `journal/<operation_id>/`, which is the commit point. `contents` maps each
 * write's path to its post-bytes. An existing intent under the id is refused,
 * never replaced; a staged file or `intent.json` over the reader's cap is
 * refused `schema-invalid/too-large` before anything is written.
 */
export function commitIntent(wb: Workbench, intent: Intent, contents: ReadonlyMap<string, Uint8Array>): Result<void> {
  checkId(intent.operation_id);
  const malformed = removalProblem(intent);
  // A removal outside a rollback, or null to null, is a defect of the caller: refused before anything is written.
  if (malformed !== null) throw new Error(`the intent of ${intent.operation_id} is malformed: ${malformed}`);
  const staged = new Map<string, Uint8Array>();
  for (const w of intent.writes) {
    const inside = resolveInside(wb, w.path);
    if (!inside.ok) return inside;
    if (w.after === null) continue; // a removal stages no bytes
    const bytes = contents.get(w.path);
    if (bytes === undefined || revisionOf(bytes) !== w.after) throw new Error(`the post-bytes given for ${w.path} do not hash to ${w.after}`);
    if (bytes.byteLength > MAX_RECORD_BYTES) {
      return err("schema-invalid", "too-large", `${w.path}: ${bytes.byteLength} bytes after the operation; the strict reader's cap is ${MAX_RECORD_BYTES} bytes (1 MiB), so it could not be read back`);
    }
    staged.set(stagedName(w.after), bytes);
  }
  const intentBytes = Buffer.from(JSON.stringify(intent, null, 2) + "\n", "utf-8");
  if (intentBytes.byteLength > MAX_RECORD_BYTES) {
    return err("schema-invalid", "too-large", `the intent of ${intent.operation_id} is ${intentBytes.byteLength} bytes; the strict reader's cap is ${MAX_RECORD_BYTES} bytes (1 MiB)`);
  }

  const dir = journalDir(wb);
  mkdirSync(dir, { recursive: true });
  const target = intentDir(wb, intent.operation_id);
  if (existsSync(target)) return err("conflict", "intent-exists", `${STATE_DIR}/${JOURNAL_DIR}/${intent.operation_id} is already a pending intent; it is never replaced`);

  const temp = join(dir, `.${intent.operation_id}.${nonce()}.tmp`);
  mkdirSync(temp);
  try {
    writeDurably(join(temp, INTENT_FILE), intentBytes);
    for (const [name, bytes] of staged) writeDurably(join(temp, name), bytes);
    fsyncDirectory(temp);
    renameSync(temp, target);
  } catch (e) {
    rmSync(temp, { recursive: true, force: true });
    throw e;
  }
  fsyncDirectory(dir);
  return { ok: true, value: undefined };
}

/**
 * Takes an intent out of the journal: one rename to a dot name, which is the
 * one act by which an id leaves `journal/`, then the deletion. A crash while
 * deleting leaves a dot-named directory, never a half-removed intent.
 */
export function removeIntent(wb: Workbench, id: string): void {
  checkId(id);
  const dir = journalDir(wb);
  const gone = join(dir, `.${id}.${nonce()}.done`);
  renameSync(intentDir(wb, id), gone);
  fsyncDirectory(dir);
  rmSync(gone, { recursive: true, force: true });
}

/**
 * Deletes every dot-named entry of `journal/` and `ops/`. Called by the lock
 * holder only: under the lock no other writer is building one, so each is
 * dead. Returns what it removed, workbench-relative.
 */
export function sweep(wb: Workbench): string[] {
  const removed: string[] = [];
  for (const dir of [journalDir(wb), opsDir(wb)]) {
    let names: string[];
    try {
      names = readdirSync(dir);
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code === "ENOENT") continue;
      throw e;
    }
    for (const name of names.filter((n) => n.startsWith(".")).sort()) {
      rmSync(join(dir, name), { recursive: true, force: true });
      removed.push(relative(wb.root, join(dir, name)).split("\\").join("/"));
    }
  }
  return removed;
}

/** The ids of the committed intents: every entry of `journal/` not named with a dot, sorted. */
export function pendingIds(wb: Workbench): string[] {
  try {
    return readdirSync(journalDir(wb)).filter((n) => !n.startsWith(".")).sort();
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw e;
  }
}

function isEntry(v: unknown): v is Entry {
  return isObject(v) && typeof v.path === "string" && (v.before === null || (typeof v.before === "string" && SHA256.test(v.before))) && (v.after === null || (typeof v.after === "string" && SHA256.test(v.after)));
}

/** Why the intent's removal entries are malformed (header), or null: null to null, or a removal outside `migration`'s `rollback`. */
export function removalProblem(intent: Pick<Intent, "op" | "phase" | "writes">): string | null {
  for (const w of intent.writes) {
    if (w.after !== null) continue;
    if (w.before === null) return `${w.path} is written from null to null`;
    if (intent.op !== REMOVAL_OP || intent.phase !== REMOVAL_PHASE) return `${w.path} is removed by an intent of ${intent.op}${intent.phase === undefined ? "" : ` ${intent.phase}`}; only ${REMOVAL_OP} ${REMOVAL_PHASE} removes a file`;
  }
  return null;
}

function isIntent(v: unknown): v is Intent {
  return (
    isObject(v) &&
    typeof v.operation_id === "string" &&
    typeof v.op === "string" &&
    (v.phase === undefined || typeof v.phase === "string") &&
    typeof v.request_digest === "string" &&
    SHA256.test(v.request_digest) &&
    Array.isArray(v.writes) &&
    v.writes.every(isEntry) &&
    isObject(v.response) &&
    typeof v.created_at === "string"
  );
}

/**
 * Every committed intent, each read whole: `intent.json` through the strict
 * reader, every staged file as bytes under the cap and equal to the hash its
 * name states. A committed entry with a piece missing or failing a check is
 * `conflict/journal-unreadable` naming it.
 */
export function readIntents(wb: Workbench): Result<PendingIntent[]> {
  const out: PendingIntent[] = [];
  for (const name of pendingIds(wb)) {
    const one = readIntent(wb, name);
    if (!one.ok) return one;
    if (one.value !== null) out.push(one.value);
  }
  return { ok: true, value: out };
}

/**
 * The committed intent `journal/<name>/`, read whole as `readIntents` reads
 * each; `null` when no entry of that name exists. The replay lookup consults
 * it by the request's id before `ops/` (C13), and a lock-free reader
 * classifies a pending intent through it (C22), so a reader racing the
 * writer's removal sees `null` or an unreadable entry that is gone on a
 * second look, never a throw.
 */
export function readIntent(wb: Workbench, name: string): Result<PendingIntent | null> {
  const rel = `${STATE_DIR}/${JOURNAL_DIR}/${name}`;
  const unreadable = (why: string): Result<PendingIntent | null> => err("conflict", "journal-unreadable", `${rel}: ${why}`);
  const abs = join(journalDir(wb), name);
  try {
    if (!statSync(abs).isDirectory()) return unreadable("not an intent directory");
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === "ENOENT") return { ok: true, value: null };
    throw e;
  }
  let intentBytes: Buffer;
  try {
    intentBytes = readFileSync(join(abs, INTENT_FILE));
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === "ENOENT") return unreadable(`${INTENT_FILE} is missing`);
    throw e;
  }
  const parsed = strictParse(intentBytes);
  if (!parsed.ok) return unreadable(`${INTENT_FILE}: ${parsed.reason}: ${parsed.detail}`);
  const intent = parsed.value;
  if (!isIntent(intent)) return unreadable(`${INTENT_FILE} is not an intent`);
  if (intent.operation_id !== name) return unreadable(`${INTENT_FILE} names operation ${intent.operation_id}`);
  const malformed = removalProblem(intent);
  if (malformed !== null) return unreadable(malformed);
  const contents = new Map<string, Buffer>();
  for (const w of intent.writes) {
    if (!resolveInside(wb, w.path).ok) return unreadable(`a write names ${JSON.stringify(w.path)}, which is not inside the workbench`);
    if (w.after === null) continue; // a removal has no staged bytes
    const staged = stagedName(w.after);
    const file = join(abs, staged);
    let size: number;
    try {
      size = statSync(file).size;
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code === "ENOENT") return unreadable(`the staged post-bytes ${staged} of ${w.path} are missing`);
      throw e;
    }
    if (size > MAX_RECORD_BYTES) return unreadable(`the staged post-bytes ${staged} are ${size} bytes, over the ${MAX_RECORD_BYTES}-byte cap`);
    let bytes: Buffer;
    try {
      bytes = readFileSync(file);
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code === "ENOENT") return unreadable(`the staged post-bytes ${staged} of ${w.path} are missing`);
      throw e;
    }
    if (revisionOf(bytes) !== w.after) return unreadable(`the staged file ${staged} does not hash to its name`);
    contents.set(w.path, bytes);
  }
  return { ok: true, value: { intent, contents } };
}

// --- the file state and recovery ----------------------------------------------------

/**
 * Where one named file stands, tested post first (C4). A removal entry is
 * read by `lstat` (header): a regular file at `before` is pre, an absent entry
 * post, anything else diverged.
 */
export function fileState(wb: Workbench, write: Entry): FileState {
  const abs = resolveInside(wb, write.path);
  if (!abs.ok) throw new Error(`${write.path}: ${abs.error.detail}`);
  if (write.after === null) return removalState(abs.value, write.before);
  let hash: string | null;
  try {
    hash = revisionOf(readFileSync(abs.value));
  } catch (e) {
    const code = (e as NodeJS.ErrnoException).code;
    if (code === "EISDIR") return "diverged";
    if (code !== "ENOENT") throw e;
    hash = null;
  }
  if (hash !== null && hash === write.after) return "post";
  if (hash === write.before) return "pre"; // null === null: absent where the write creates the file
  return "diverged";
}

function removalState(abs: string, before: string | null): FileState {
  try {
    if (!lstatSync(abs).isFile()) return "diverged"; // a link, dangling or not, a directory, a device
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === "ENOENT") return "post";
    throw e;
  }
  return revisionOf(readFileSync(abs)) === before ? "pre" : "diverged";
}

/**
 * Applies the given writes from their post-bytes, each by temp file, fsync
 * and rename, creating the parent directory; a removal entry unlinks its
 * regular file and fsyncs the parent, and an absent entry is already done.
 * The caller has found every removal's entry at pre or post. The first
 * attempt and recovery share it.
 */
export function applyWrites(wb: Workbench, writes: readonly Entry[], contents: ReadonlyMap<string, Uint8Array>): void {
  for (const w of writes) {
    const abs = resolveInside(wb, w.path);
    if (!abs.ok) throw new Error(`${w.path}: ${abs.error.detail}`);
    if (w.after === null) {
      try {
        unlinkSync(abs.value);
      } catch (e) {
        if ((e as NodeJS.ErrnoException).code !== "ENOENT") throw e;
      }
      fsyncDirectory(dirname(abs.value));
      continue;
    }
    const bytes = contents.get(w.path);
    if (bytes === undefined) throw new Error(`no post-bytes for ${w.path}`);
    mkdirSync(dirname(abs.value), { recursive: true });
    replaceAtomically(abs.value, bytes);
  }
}

/**
 * Rolls one pending intent forward. A file at `diverged` leaves everything as
 * it stands and is reported. Otherwise every file at `pre` gets its staged
 * post-bytes, the answer is written from the intent when it is missing, and
 * the intent is removed.
 */
export function recover(wb: Workbench, pending: PendingIntent): Recovery {
  const { intent, contents } = pending;
  const states = intent.writes.map((w) => ({ w, state: fileState(wb, w) }));
  const blocked = states.filter((s) => s.state === "diverged").map((s) => s.w);
  if (blocked.length > 0) return { landed: false, blocked };
  applyWrites(
    wb,
    states.filter((s) => s.state === "pre").map((s) => s.w),
    contents,
  );
  if (!existsSync(answerPath(wb, intent.operation_id))) {
    writeAnswer(wb, { operation_id: intent.operation_id, op: intent.op, request_digest: intent.request_digest, response: intent.response });
  }
  removeIntent(wb, intent.operation_id);
  return { landed: true };
}

// --- the stored answer ----------------------------------------------------------------

export function writeAnswer(wb: Workbench, answer: StoredAnswer): void {
  checkId(answer.operation_id);
  mkdirSync(opsDir(wb), { recursive: true });
  replaceAtomically(answerPath(wb, answer.operation_id), Buffer.from(JSON.stringify(answer, null, 2) + "\n", "utf-8"));
}

/**
 * The stored answer under `id`, in either readable form: FJ02's digest form,
 * or FJ01's `{operation_id, request, response}` with the request digested
 * here. `null` when none is stored.
 */
export function readAnswer(wb: Workbench, id: string): Result<StoredAnswer | null> {
  checkId(id);
  const file = answerPath(wb, id);
  if (!existsSync(file)) return { ok: true, value: null };
  const rel = relative(wb.root, file);
  const parsed = strictParse(readFileSync(file));
  if (!parsed.ok) return err("conflict", "operation-record-unreadable", `${rel}: ${parsed.reason}: ${parsed.detail}`);
  const v = parsed.value;
  if (isObject(v) && isObject(v.response) && typeof v.request_digest === "string" && typeof v.op === "string") {
    return { ok: true, value: { operation_id: id, op: v.op, request_digest: v.request_digest, response: v.response as unknown as Response } };
  }
  if (isObject(v) && isObject(v.response) && isObject(v.request)) {
    return { ok: true, value: { operation_id: id, op: String(v.request.op), request_digest: requestDigest(v.request), response: v.response as unknown as Response } };
  }
  return err("conflict", "operation-record-unreadable", `${rel}: neither a stored answer nor FJ01's {operation_id, request, response}`);
}

/**
 * The replay lookup over `ops/`: the stored response when the same request
 * was answered under this id, `conflict/operation-id-reused` when the id
 * answered a different request, `null` when the id is unused.
 */
export function replayAnswer(wb: Workbench, req: { readonly operation_id: string; readonly [field: string]: unknown }): Result<Response | null> {
  const stored = readAnswer(wb, req.operation_id);
  if (!stored.ok) return stored;
  if (stored.value === null) return { ok: true, value: null };
  if (stored.value.request_digest !== requestDigest(req)) {
    return err("conflict", "operation-id-reused", `operation_id ${req.operation_id} was already used for a different request`);
  }
  return { ok: true, value: stored.value.response };
}
