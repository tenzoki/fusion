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
// the directory's content under the lock instead, and `migration`, which
// admits every state too, so that its replay and its own recovery are decided
// before the store's shape is judged, FJ04 contract delta as amended); the
// workbench write lock; `sweep`;
// the recovery of every pending intent but a held one (below); the replay lookup, which consults
// `journal/<id>/` before `ops/<id>.json` (discussion 260929-0709, C13); the
// maintenance fence (request 39), which refuses every fresh mutation but
// `initialize` and the `end` naming it while it stands; the operation's own
// plan function; the durable intent; each write by temp file, fsync and
// rename; the stored answer; the intent's removal. A replay therefore still
// answers under the fence, and nothing the fence refuses writes an intent. The plan
// function is where an operation's rules live. It reads what it needs through
// the context (under the lock), checks the caller's expected revision with
// `cas`, validates the records it would write, and returns the writes and the
// result; it never writes. So `claim` and `release` (step 4) can only ever be
// `transition` with defaults: there is no second route to the files.
//
// A migration intent is held: only the request that committed it finishes
// it (FJ04 contract delta as amended, "Who finishes a migration intent").
// Every other request's recovery, a read's included, leaves an intent whose
// `op` is `migration` untouched unless the request carries its operation id
// and its request digest both (FJ04 addendum for a1fb17a, R4), and a
// `migration` request leaves a committed `initialize` untouched as well.
// The same id under another digest finds its own intent held, and the replay
// lookup answers `operation-id-reused` with no recovery effect. A held intent stands in `blocked` beside the ones recovery could not
// land, flagged `held`: a path it names answers
// `operation-unknown/migration-pending` instead of `recovery-blocked`, and
// `migration`'s plan function refuses `conflict/intent-pending` while one
// stands. The maintenance fence is not checked here for `migration`: its
// plan function checks it in the contract's order, after the store's state.
//
// The fence itself is set and removed outside the journal: `maintenance`'s
// plan function returns no writes and a `fence` instead, which `mutate`
// applies under the lock before it stores the answer, and the fence writes no
// record. `migration apply` of chunk 1 is the one plan that sets a fence AND
// writes: it returns `fenceFirst`, which `mutate` sets in its own sequence
// before it commits the intent (unless that very fence already stands, after
// a crash between the two), so a crash between leaves the fence named by the
// request's own id and no intent, and the same request passes it.
//
// A plan may also return `removals`, each a regular file at a hash it has
// checked, which the intent carries as removal entries after the writes
// (`journal.ts`, `after: null`). Only `migration rollback` returns any; the
// journal refuses them in every other intent. A `migration` intent records the
// request's `phase`, which is what the journal reads that from.
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
  type Entry,
  type Intent,
  type PendingIntent,
} from "./journal.js";
import {
  LOCK_STALE_MS,
  MAINTENANCE_FILE,
  STATE_DIR,
  WORKBENCH_MANIFEST,
  acquireLock,
  controlFiles,
  readFence,
  removeFence,
  writeFence,
  describeErrors,
  readPair,
  releaseLock,
  resolveInside,
  revisionOf,
  type Fence,
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

/** `after-fence` is passed only by a plan that returns `fenceFirst`, so it is no member of `CUTS`, which every operation passes. */
export type Cut = "after-fence" | "after-intent" | `after-write:${number}` | "after-answer";

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
  /**
   * `maintenance` alone: the fence to set, or null to remove the standing one.
   * Never beside writes: the fence takes no intent, and `mutate` applies it
   * before it stores the answer.
   */
  fence?: Fence | null;
  /** `migration apply` of chunk 1 alone: the fence set in its own sequence before the intent (header). */
  fenceFirst?: Fence;
  /** Regular files to remove, each at the hash the plan checked, after the writes and in this order (`migration rollback` alone). */
  removals?: Array<{ path: string; before: string }>;
}

/** What a plan function may ask, all of it under the lock. */
export interface PlanContext {
  readonly wb: Workbench;
  /** The intents recovery left blocked, read-only: `initialize` refuses on any of them before it reads the directory. */
  readonly blocked: readonly Blocked[];
  /** The fence standing when the plan runs: null for every operation the fence let through but the `end` naming it. */
  readonly fence: Fence | null;
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
  /** Set when the intent is held for its own request (a migration intent), not blocked: its `op`. */
  held?: string;
}

const blockedOf = (p: PendingIntent, diverged: Entry[]): Blocked => ({
  operation_id: p.intent.operation_id,
  paths: p.intent.writes.map((w) => w.path),
  diverged: diverged.map((w) => w.path),
});

/** A committed intent recovery leaves for its own request: every path it names is held. */
const heldOf = (p: PendingIntent): Blocked => ({ operation_id: p.intent.operation_id, paths: p.intent.writes.map((w) => w.path), diverged: [], held: p.intent.op });

/**
 * Whether `p` is held from the request `req` (null for a read): a migration
 * intent, and a committed `initialize` when `req` is a migration request,
 * unless `req` carries the intent's operation id AND its request digest
 * (FJ04 addendum for a1fb17a, prefix step 3, R4). The same id under another
 * digest stays held, so the replay lookup answers `operation-id-reused` with
 * no recovery effect. `digest` is `requestDigest(req)`, passed by a caller
 * that has it.
 */
export function isHeld(p: PendingIntent, req: MutationRequest | null, digest: string | null = req === null ? null : requestDigest(req)): boolean {
  if (req !== null && p.intent.operation_id === req.operation_id && p.intent.request_digest === digest) return false;
  return p.intent.op === "migration" || (req?.op === "migration" && p.intent.op === "initialize");
}

/** The refusal for a path a blocked or held intent names, or for a replay of the blocked intent itself. */
export function recoveryBlocked(b: Blocked): StoreError {
  if (b.held !== undefined) {
    return {
      class: "operation-unknown",
      reason: "migration-pending",
      detail: `operation ${b.operation_id} (${b.held}) is pending in .json-state/journal/${b.operation_id}, and only its own request finishes it; until then the files it names (${b.paths.join(", ")}) are not answered as fact`,
    };
  }
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
    const digest = requestDigest(req);
    const blocked: Blocked[] = [];
    for (const p of pending.value) {
      if (isHeld(p, req, digest)) {
        blocked.push(heldOf(p));
        continue;
      }
      const r = recover(wb, p);
      if (!r.landed) blocked.push(blockedOf(p, r.blocked));
    }

    // The replay lookup: a blocked or held intent under this id first, then the stored answer.
    const own = pending.value.find((p) => p.intent.operation_id === req.operation_id);
    const ownBlocked = blocked.find((b) => b.operation_id === req.operation_id);
    if (own !== undefined && ownBlocked !== undefined) {
      return own.intent.request_digest === digest ? refuse(recoveryBlocked(ownBlocked)) : reused(req.operation_id);
    }
    const replay = replayAnswer(wb, req as MutationRequest & Record<string, unknown>);
    if (!replay.ok) return refuse(replay.error);
    if (replay.value !== null) return replay.value;

    const fence = readFence(wb);
    const fenced = req.op === "migration" ? null : fenceRefusal(req, fence);
    if (fenced !== null) return refuse(fenced);

    const planned = await plan(planContext(wb, blocked, fence.ok ? fence.value : null));
    if (!planned.ok) return refuse(planned.error);
    const removals = planned.value.removals ?? [];
    if (planned.value.fence !== undefined) {
      if (planned.value.writes.length > 0 || removals.length > 0 || planned.value.fenceFirst !== undefined) throw new Error(`the plan of ${req.op} sets a fence and writes files`);
      // Fence first, answer second: a crash between leaves the fence set and no
      // answer, and a retry meets the fence it set, named by its own id.
      const response: Response = { ok: true, result: planned.value.result };
      if (planned.value.fence === null) removeFence(wb);
      else writeFence(wb, planned.value.fence);
      writeAnswer(wb, { operation_id: req.operation_id, op: req.op, request_digest: digest, response });
      return response;
    }
    for (const w of [...planned.value.writes, ...removals]) {
      const b = blockedOn(blocked, w.path);
      if (b !== undefined) return refuse(recoveryBlocked(b));
    }

    const writes: Entry[] = [];
    const contents = new Map<string, Buffer>();
    /** The absolute path of one named file, each named once. */
    const named = (path: string): Result<string> => {
      const abs = resolveInside(wb, path);
      if (abs.ok && writes.some((x) => x.path === path)) throw new Error(`the plan of ${req.op} writes ${path} twice`);
      return abs;
    };
    for (const w of planned.value.writes) {
      const abs = named(w.path);
      if (!abs.ok) return refuse(abs.error);
      writes.push({ path: w.path, before: hashOrNull(abs.value), after: revisionOf(w.bytes) });
      contents.set(w.path, w.bytes);
    }
    for (const r of removals) {
      const abs = named(r.path);
      if (!abs.ok) return refuse(abs.error);
      writes.push({ path: r.path, before: r.before, after: null });
    }
    const response: Response = {
      ok: true,
      result: planned.value.result,
      ...(planned.value.revisions !== undefined ? { revisions: planned.value.revisions } : {}),
    };
    const now = options.now ?? Date.now;
    const phase = req.op === "migration" ? (req as MutationRequest & { phase?: unknown }).phase : undefined;
    const intent: Intent = { operation_id: req.operation_id, op: req.op, ...(typeof phase === "string" ? { phase } : {}), request_digest: digest, writes, response, created_at: new Date(now()).toISOString() };
    const first = planned.value.fenceFirst;
    if (first !== undefined) {
      const standing = readFence(wb);
      if (!standing.ok || standing.value === null || standing.value.operation_id !== first.operation_id) writeFence(wb, first);
      await point("after-fence");
    }
    const committed = commitIntent(wb, intent, contents);
    if (!committed.ok) return refuse(committed.error);
    await point("after-intent");

    // A write whose post-bytes equal the stored bytes is kept: it reads as
    // landed (post is tested first), and the no-op still stores its answer.
    for (let i = 0; i < writes.length; i++) {
      applyWrites(wb, [writes[i] as Entry], contents);
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

/**
 * The fence's refusal of `req`, or null when it passes (request 39). A fence
 * that stands refuses every fresh mutation but `initialize`, which never meets
 * a fenced store (a fenced store has a manifest, and its plan answers
 * `manifest-present`), and the `maintenance end` whose `fence` names it. A
 * fence file that does not read fences too, the `end` included, since no `end`
 * can be matched against it (request 39 (d)).
 */
export function fenceRefusal(req: MutationRequest, fence: Result<Fence | null>): StoreError | null {
  if (req.op === "initialize") return null;
  if (!fence.ok) return { class: "conflict", reason: "maintenance-active", detail: fence.error.detail };
  if (fence.value === null) return null;
  const r = req as MutationRequest & { action?: unknown; fence?: unknown };
  if (r.op === "maintenance" && r.action === "end" && r.fence === fence.value.operation_id) return null;
  return {
    class: "conflict",
    reason: "maintenance-active",
    detail: `a maintenance fence stands in ${STATE_DIR}/${MAINTENANCE_FILE}, set by operation ${fence.value.operation_id} since ${fence.value.since}; every fresh mutation is refused until the maintenance end naming it`,
  };
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

function planContext(wb: Workbench, blocked: readonly Blocked[], fence: Fence | null): PlanContext {
  return {
    ...readContext(wb, blocked),
    blocked,
    fence,
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

/**
 * The view of a store not under JSON control: no recovery runs there, and a
 * migration intent pending on it is held, so its paths answer
 * `migration-pending` as they do on a store under JSON control. An entry that
 * does not read is left to the operation that meets it; with none held the
 * view is the empty one, so a read without a migration answers as before.
 */
function heldView(wb: Workbench): ReadView {
  const held: Blocked[] = [];
  let ids: string[];
  try {
    ids = pendingIds(wb);
  } catch {
    return NO_VIEW; // a journal that does not list: the operation meeting it answers as before
  }
  for (const id of ids) {
    const r = readIntent(wb, id);
    if (r.ok && r.value !== null && isHeld(r.value, null)) held.push(heldOf(r.value));
  }
  return held.length === 0 ? NO_VIEW : { blocked: held, blockedOn: (path) => blockedOn(held, path) };
}

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
    if (isHeld(r.value, null)) {
      blocked.push(heldOf(r.value));
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
    for (const p of pending.value) if (!isHeld(p, null)) recover(wb, p);
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
  if (wb.state !== "json-control") return ok(await body(heldView(wb)));
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
