// ---------------------------------------------------------------------------
// The operation kernel (spec section 6, FJ02 plan step 3): the one mutation
// path every named operation runs through, and the read protocol every read
// runs under.
//
//   mutate(wb, req, plan, options)   one mutation, in one order for all
//   read(wb, body, options)          one consistent lock-free read
//
// `mutate` runs, in this order and for every operation alike: the workbench
// state, against the states the operation admits (`json-control` alone for
// every operation but `initialize`, which admits every state and decides on
// the directory's content under the lock instead); the workbench write lock;
// `sweep`;
// the recovery of every pending intent; the replay lookup, which consults
// `journal/<id>/` before `ops/<id>.json` (discussion 260929-0709, C13); the
// operation's own plan function; the durable intent; each write by temp file,
// fsync and rename; the stored answer; the intent's removal. The plan
// function is where an operation's rules live. It reads what it needs through
// the context (under the lock), checks the caller's expected revision with
// `cas`, validates the records it would write, and returns the writes and the
// result; it never writes. So `claim` and `release` (step 4) can only ever be
// `transition` with defaults: there is no second route to the files.
//
// The intent is the commit point. Once `journal/<id>/` exists under its own
// name the operation lands, on this attempt or through recovery on any later
// request, and an identical retry is answered rather than refused. After
// recovery an intent still pending is blocked (a file it names is at neither
// its pre- nor its post-bytes): a request under its id is `recovery-blocked`
// when it is the same request and `operation-id-reused` when it is not, and
// an operation that reads or writes a path such an intent names is
// `recovery-blocked`. Nothing here ever overwrites a diverged file.
//
// `read` takes no lock unless a writer may be mid-flight (C5, C17, C22). It
// lists `journal/` then `ops/`, ignoring dot-named entries, runs the body, and
// lists both again in the same order through the same helper; equal id sets
// mean no operation started or landed meanwhile. The order matters in the
// second listing: the writer stores `ops/<id>.json` before its intent leaves
// `journal/`, so an operation finishing between the two listings is still
// seen. A pending intent found by the first listing is classified without the
// lock by hashing the files it names: one with a diverged file is blocked,
// stable, and an ordinary member of both snapshots; one with every file at
// pre or post may belong to a live writer, and only then does the reader take
// the lock, recover and start again.
//
// Fault injection is in-process only: `options.faults` cuts at a point of
// `CUTS` by throwing `CutReached`, or pauses there. `main.ts` passes no
// options, so the shipped CLI has no path to either.
// ---------------------------------------------------------------------------

import { readdirSync, readFileSync } from "node:fs";
import {
  applyWrites,
  commitIntent,
  fileState,
  opsDir,
  pendingIds,
  readIntent,
  readIntents,
  recover,
  removeIntent,
  replayAnswer,
  requestDigest,
  sweep,
  writeAnswer,
  type Intent,
  type PendingIntent,
  type Write,
} from "./journal.js";
import {
  LOCK_STALE_MS,
  WORKBENCH_MANIFEST,
  acquireLock,
  controlFiles,
  describeErrors,
  readPair,
  releaseLock,
  resolveInside,
  revisionOf,
  type Pair,
  type Result,
  type StoreError,
  type Workbench,
  type WorkbenchState,
  type WriteOptions,
} from "./store.js";
import { strictParse } from "./strict-json.js";
import { validate } from "./validate.js";
import { fail, type Response } from "./cli/protocol.js";

// --- the fault points ---------------------------------------------------------------

/**
 * The points a mutation can be cut at, in the order it passes them.
 * `after-write:<n>` stands for one point per write, `n` counting from 0;
 * `cutsFor` expands it for an operation of a given number of writes.
 */
export const CUTS = ["after-intent", "after-write:<n>", "after-answer"] as const;

export type Cut = "after-intent" | `after-write:${number}` | "after-answer";

/** Every cut of an operation that writes `writes` files, in the order `mutate` passes them. */
export const cutsFor = (writes: number): Cut[] =>
  CUTS.flatMap((c): Cut[] => (c === "after-write:<n>" ? Array.from({ length: writes }, (_, i): Cut => `after-write:${i}`) : [c]));

/** Thrown at the cut `faults.cutAt` names: the in-process stand-in for a crash there. */
export class CutReached extends Error {
  constructor(readonly cut: Cut) {
    super(`fault injection: the operation was cut at ${cut}`);
    this.name = "CutReached";
  }
}

/**
 * Test-only. `cutAt` throws `CutReached` at that point, after the lock is
 * released as a killed holder's lock would be replaced. `pause` is awaited at
 * every point a mutation or a read passes: `locked` (the lock is held,
 * nothing else done), each cut, and for a read `read:<before|after>:between-listings`.
 */
export interface Faults {
  cutAt?: Cut;
  pause?: (point: string) => Promise<void> | void;
}

export interface KernelOptions extends WriteOptions {
  faults?: Faults;
}

// --- the plan function ----------------------------------------------------------------

/** One file an operation writes, as the bytes it will hold. */
export interface PlannedWrite {
  path: string;
  bytes: Buffer;
}

/** What a plan function hands the kernel: the writes, and the answer's `result` and `revisions`. */
export interface Planned {
  writes: PlannedWrite[];
  result: unknown;
  revisions?: Record<string, string>;
}

/** What a plan function may ask, all of it under the lock. */
export interface PlanContext {
  readonly wb: Workbench;
  /** The intents recovery left blocked, read-only: `initialize` refuses on any of them before it reads the directory. */
  readonly blocked: readonly Blocked[];
  /** A pair, or `recovery-blocked` when a blocked intent names its path. */
  readPair(path: string): Result<Pair>;
  /** `conflict/revision-mismatch` unless the pair's stored bytes hash to `expected`. */
  cas(pair: Pair, expected: string): Result<void>;
  /** The one control file carrying `id`: none is `unresolved-reference/record-not-found`, more than one `conflict/ambiguous-reference`. */
  resolveRecordId(id: string): Result<{ path: string; id: string }>;
  /** An artefact reference: inside the workbench, present, and at the named hash. */
  resolveArtefact(ref: { path: string; sha256: string }): Result<{ path: string; sha256: string }>;
  /** `schema-invalid/result-invalid` when `value` is not valid under `schemaId`; `what` opens the detail. */
  validateResult(schemaId: string, value: unknown, what: string): Result<void>;
}

export type PlanFunction = (ctx: PlanContext) => Result<Planned> | Promise<Result<Planned>>;

/** The part of a request the kernel reads: its op and id; the whole request is digested for replay. */
export interface MutationRequest {
  readonly op: string;
  readonly operation_id: string;
}

// --- blocked intents --------------------------------------------------------------------

/** A pending intent that recovery could not land, and the files that stopped it. */
export interface Blocked {
  operation_id: string;
  /** Every path the intent writes. */
  paths: string[];
  /** The paths at neither their pre- nor their post-bytes. */
  diverged: string[];
}

const blockedOf = (p: PendingIntent, diverged: Write[]): Blocked => ({
  operation_id: p.intent.operation_id,
  paths: p.intent.writes.map((w) => w.path),
  diverged: diverged.map((w) => w.path),
});

/** The refusal for a path a blocked intent names, or for a replay of the blocked intent itself. */
export function recoveryBlocked(b: Blocked): StoreError {
  const files = b.diverged.join(", ");
  const verb = b.diverged.length === 1 ? "is" : "are";
  return {
    class: "operation-unknown",
    reason: "recovery-blocked",
    detail: `operation ${b.operation_id} is pending in .json-state/journal/${b.operation_id} and cannot land: ${files} ${verb} at neither the pre- nor the post-bytes it names (edited by hand, or changed by a pull); restore the file to its pre-bytes, or remove the intent directory and accept what landed`,
  };
}

const blockedOn = (blocked: readonly Blocked[], path: string): Blocked | undefined => blocked.find((b) => b.paths.includes(path));

/**
 * The recovery classification of one committed intent, without the lock: the
 * intent is blocked when a file it names is at neither its pre- nor its
 * post-bytes, and null when every file is at one of them (landed, or a live
 * writer's). Lock-free readers classify through this, and so does
 * `inspect.pending`, so the two never disagree on what is blocked.
 */
export function blockedIntent(wb: Workbench, p: PendingIntent): Blocked | null {
  const diverged = p.intent.writes.filter((w) => fileState(wb, w) === "diverged");
  return diverged.length === 0 ? null : blockedOf(p, diverged);
}

// --- mutate -------------------------------------------------------------------------------

const refuse = (e: StoreError): Response => fail(e.class, e.reason, e.detail, e.errors);
const ok = <T>(value: T): Result<T> => ({ ok: true, value });
const no = <T>(cls: StoreError["class"], reason: string, detail: string): Result<T> => ({ ok: false, error: { class: cls, reason, detail } });

/** The states an ordinary mutation admits: a workbench under JSON control. */
export const JSON_CONTROL_ONLY: readonly WorkbenchState[] = ["json-control"];
/** The states `initialize` admits: all of them, since its plan function reads the directory itself. */
export const EVERY_STATE: readonly WorkbenchState[] = ["json-control", "legacy", "unsupported"];

/**
 * Runs one mutation through the sequence the header describes and returns
 * its answer. A refusal writes nothing and stores nothing, so a retry is an
 * ordinary first attempt. `admits` names the states the operation runs on;
 * the state was read when the workbench was opened, before the lock, so a
 * plan function that admits more than `json-control` must not rely on it.
 * Throws only for a defect or an I/O failure, and for `CutReached` when a
 * test asked for a cut.
 */
export async function mutate(wb: Workbench, req: MutationRequest, plan: PlanFunction, options: KernelOptions = {}, admits: readonly WorkbenchState[] = JSON_CONTROL_ONLY): Promise<Response> {
  if (!admits.includes(wb.state)) {
    if (wb.state === "legacy") return fail("unsupported-format", "legacy-workbench", `${wb.root} carries no ${WORKBENCH_MANIFEST}; reads are allowed, mutation is not (spec 4.1)`);
    if (wb.state === "unsupported") return fail("unsupported-format", wb.diagnosis?.reason ?? "unsupported", wb.diagnosis?.detail ?? "the manifest is unsupported");
    throw new Error(`mutate: ${req.op} admits ${admits.join(", ")}, and the workbench is ${wb.state}`);
  }

  const faults = options.faults;
  const point = async (at: Cut): Promise<void> => {
    await faults?.pause?.(at);
    if (faults?.cutAt === at) throw new CutReached(at);
  };

  const lock = await acquireLock(wb, options);
  if (!lock.ok) return refuse(lock.error);
  try {
    await faults?.pause?.("locked");
    sweep(wb);
    const pending = readIntents(wb);
    if (!pending.ok) return refuse(pending.error);
    const blocked: Blocked[] = [];
    for (const p of pending.value) {
      const r = recover(wb, p);
      if (!r.landed) blocked.push(blockedOf(p, r.blocked));
    }

    // The replay lookup: a blocked intent under this id first, then the stored answer.
    const digest = requestDigest(req);
    const own = pending.value.find((p) => p.intent.operation_id === req.operation_id);
    const ownBlocked = blocked.find((b) => b.operation_id === req.operation_id);
    if (own !== undefined && ownBlocked !== undefined) {
      return own.intent.request_digest === digest ? refuse(recoveryBlocked(ownBlocked)) : reused(req.operation_id);
    }
    const replay = replayAnswer(wb, req as MutationRequest & Record<string, unknown>);
    if (!replay.ok) return refuse(replay.error);
    if (replay.value !== null) return replay.value;

    const planned = await plan(planContext(wb, blocked));
    if (!planned.ok) return refuse(planned.error);
    for (const w of planned.value.writes) {
      const b = blockedOn(blocked, w.path);
      if (b !== undefined) return refuse(recoveryBlocked(b));
    }

    const writes: Write[] = [];
    const contents = new Map<string, Buffer>();
    for (const w of planned.value.writes) {
      const abs = resolveInside(wb, w.path);
      if (!abs.ok) return refuse(abs.error);
      if (contents.has(w.path)) throw new Error(`the plan of ${req.op} writes ${w.path} twice`);
      writes.push({ path: w.path, before: hashOrNull(abs.value), after: revisionOf(w.bytes) });
      contents.set(w.path, w.bytes);
    }
    const response: Response = {
      ok: true,
      result: planned.value.result,
      ...(planned.value.revisions !== undefined ? { revisions: planned.value.revisions } : {}),
    };
    const now = options.now ?? Date.now;
    const intent: Intent = { operation_id: req.operation_id, op: req.op, request_digest: digest, writes, response, created_at: new Date(now()).toISOString() };
    const committed = commitIntent(wb, intent, contents);
    if (!committed.ok) return refuse(committed.error);
    await point("after-intent");

    // A write whose post-bytes equal the stored bytes is kept: it reads as
    // landed (post is tested first), and the no-op still stores its answer.
    for (let i = 0; i < writes.length; i++) {
      applyWrites(wb, [writes[i] as Write], contents);
      await point(`after-write:${i}`);
    }
    writeAnswer(wb, { operation_id: req.operation_id, op: req.op, request_digest: digest, response });
    await point("after-answer");
    removeIntent(wb, req.operation_id);
    return response;
  } finally {
    releaseLock(lock.value);
  }
}

const reused = (id: string): Response => fail("conflict", "operation-id-reused", `operation_id ${id} was already used for a different request`);

function hashOrNull(abs: string): string | null {
  try {
    return revisionOf(readFileSync(abs));
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw e;
  }
}

/** The read half of the plan context: what a body under `read` may ask, as a plan function asks it under the lock. */
export type ReadContext = Pick<PlanContext, "wb" | "readPair" | "resolveRecordId" | "resolveArtefact">;

function planContext(wb: Workbench, blocked: readonly Blocked[]): PlanContext {
  return {
    ...readContext(wb, blocked),
    blocked,
    cas(pair, expected) {
      if (pair.revision !== expected) return no("conflict", "revision-mismatch", `stored ${pair.revision} expected ${expected}`);
      return ok(undefined);
    },
    validateResult(schemaId, value, what) {
      const v = validate(schemaId, value);
      if (v.ok) return ok(undefined);
      if (v.class === "unsupported-format") return no("unsupported-format", "unknown-schema", `no schema ${v.schemaId}`);
      return { ok: false, error: { class: "schema-invalid", reason: "result-invalid", detail: `${what}: ${describeErrors(v.errors)}`, errors: v.errors } };
    },
  };
}

/**
 * The reads a plan function and a read body share, over the blocked intents
 * each was given: a pair (a path a blocked intent names is `recovery-blocked`),
 * an id resolved by walking every control file, an artefact at its hash.
 * `reconcile` resolves record ids through its body-local index instead
 * (`indexedContext` in `cli/ops.ts`), one walk per read attempt under this
 * resolver's criterion: the same sorted walk, strict-refused files skipped,
 * no blocked filter, the same refusals. So the two never disagree on what
 * resolves.
 */
export function readContext(wb: Workbench, blocked: readonly Blocked[]): ReadContext {
  return {
    wb,
    readPair(path) {
      const b = blockedOn(blocked, path);
      if (b !== undefined) return { ok: false, error: recoveryBlocked(b) };
      return readPair(wb, path);
    },
    resolveRecordId(id) {
      const hits: string[] = [];
      for (const path of controlFiles(wb, wb.root)) {
        const abs = resolveInside(wb, path);
        if (!abs.ok) continue;
        const parsed = strictParse(readFileSync(abs.value));
        // A file the strict reader refuses carries no id anyone can resolve;
        // `validate` reports it.
        if (parsed.ok && (parsed.value as Record<string, unknown>).id === id) hits.push(path);
      }
      if (hits.length === 0) return no("unresolved-reference", "record-not-found", `no control file in ${wb.root} carries the id ${id}`);
      if (hits.length > 1) return no("conflict", "ambiguous-reference", `the id ${id} is carried by ${hits.join(", ")}`);
      return ok({ path: hits[0] as string, id });
    },
    resolveArtefact(ref) {
      const abs = resolveInside(wb, ref.path);
      if (!abs.ok) return abs;
      const current = hashOrNull(abs.value);
      if (current === null) return no("unresolved-reference", "artefact-missing", `${ref.path} does not exist in ${wb.root}`);
      if (current !== ref.sha256) return no("missing-evidence", "artefact-changed", `${ref.path} is ${current}, the reference names ${ref.sha256}`);
      return ok({ path: ref.path, sha256: current });
    },
  };
}

// --- read -------------------------------------------------------------------------------

/** What a read body is told: the blocked intents, and which of them names a path. */
export interface ReadView {
  blocked: readonly Blocked[];
  blockedOn(path: string): Blocked | undefined;
}

const NO_VIEW: ReadView = { blocked: [], blockedOn: () => undefined };

interface Snapshot {
  journal: string[];
  /** The sorted id set of `journal/` and `ops/`, dot names excluded, as one comparable key. */
  key: string;
}

function answeredIds(wb: Workbench): string[] {
  try {
    return readdirSync(opsDir(wb))
      .filter((n) => !n.startsWith(".") && n.endsWith(".json"))
      .map((n) => n.slice(0, -".json".length));
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw e;
  }
}

/** One listing, `journal/` then `ops/`, the order both snapshots use (C17). */
async function snapshot(wb: Workbench, phase: "before" | "after", faults: Faults | undefined): Promise<Snapshot> {
  const journal = pendingIds(wb);
  await faults?.pause?.(`read:${phase}:between-listings`);
  const ops = answeredIds(wb);
  return { journal, key: [...new Set([...journal, ...ops])].sort().join("\n") };
}

type Classified = { kind: "stable"; blocked: Blocked[] } | { kind: "live" } | { kind: "changed" } | { kind: "unreadable"; error: StoreError };

/**
 * Classifies the pending intents of a first listing without the lock (C22).
 * A live writer's files are only ever at pre or post, so an intent with a
 * diverged file is blocked and stays so; one without may be mid-flight.
 */
function classify(wb: Workbench, ids: readonly string[]): Classified {
  const blocked: Blocked[] = [];
  for (const id of ids) {
    const r = readIntent(wb, id);
    if (!r.ok || r.value === null) {
      // Gone since the listing (its writer finished): the snapshot will differ.
      if (!pendingIds(wb).includes(id)) return { kind: "changed" };
      if (!r.ok) return { kind: "unreadable", error: r.error };
      continue;
    }
    const b = blockedIntent(wb, r.value);
    if (b === null) return { kind: "live" };
    blocked.push(b);
  }
  return { kind: "stable", blocked };
}

/** Takes the lock, recovers every pending intent, releases it: what a reader does when a writer may be mid-flight. */
async function recoverUnderLock(wb: Workbench, options: KernelOptions): Promise<Result<void>> {
  const lock = await acquireLock(wb, options);
  if (!lock.ok) return lock;
  try {
    sweep(wb);
    const pending = readIntents(wb);
    if (!pending.ok) return pending;
    for (const p of pending.value) recover(wb, p);
    return ok(undefined);
  } finally {
    releaseLock(lock.value);
  }
}

/**
 * Runs `body` over one consistent state of the workbench and returns what it
 * returned, retrying while an operation starts or lands during it. After
 * `options.waitMs` without a consistent read the answer is
 * `conflict/lock-timeout`, as a writer's would be. On a workbench not under
 * JSON control the body runs once, without recovery. The intent expected there
 * is a committed `initialize` whose manifest has not landed (or stands at
 * other bytes), and no read finishes it: an `initialize` request does, and
 * `inspect` names it as `pending` (decision 260930-1654, option 3; Prior item
 * 33, as corrected at Prior `ae1ad78`).
 */
export async function read<T>(wb: Workbench, body: (view: ReadView) => T | Promise<T>, options: KernelOptions = {}): Promise<Result<T>> {
  if (wb.state !== "json-control") return ok(await body(NO_VIEW));
  const now = options.now ?? Date.now;
  const waitMs = options.waitMs ?? LOCK_STALE_MS + 5_000;
  const started = now();
  for (;;) {
    const before = await snapshot(wb, "before", options.faults);
    const c = before.journal.length === 0 ? ({ kind: "stable", blocked: [] } as Classified) : classify(wb, before.journal);
    if (c.kind === "unreadable") return { ok: false, error: c.error };
    if (c.kind === "live") {
      const remaining = Math.max(0, waitMs - (now() - started));
      const r = await recoverUnderLock(wb, { ...options, waitMs: remaining });
      if (!r.ok) return r;
    } else if (c.kind === "stable") {
      const blocked = c.blocked;
      const value = await body({ blocked, blockedOn: (path) => blockedOn(blocked, path) });
      const after = await snapshot(wb, "after", options.faults);
      if (after.key === before.key) return ok(value);
    }
    if (now() - started >= waitMs) {
      return no("conflict", "lock-timeout", `no consistent read of ${wb.root} within ${waitMs} ms: operations kept starting or landing under it`);
    }
  }
}
