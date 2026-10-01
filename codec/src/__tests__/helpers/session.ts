// ---------------------------------------------------------------------------
// The machinery of a recorded session (FJ02b step 5): what the FJ02 recorder
// (`round-trip-cli-fj02.test.ts`), the FJ02b recorder
// (`round-trip-cli-fj02b.test.ts`) and the `initialize` recorder
// (`round-trip-cli-initialize.test.ts`) share, so that none carries a copy of
// another's. The FJ01 recorder (`round-trip-cli.test.ts`) keeps its own: its
// recorded bytes are what Prior pinned first, and it is left as it stands.
//
// A session is a directory under `fixtures/` holding
// `<nn>-<op>.request.json` and `<nn>-<op>.response.json` pairs, a `seed/` and
// a README. What this file holds is how one is run and compared:
//
//   - the wrapper `bin/fusion-record` spawned once per exchange, over a temp
//     copy of the session's base, the scratch workbench unless the session
//     names another (the wrapper, never `node` on the bundle);
//   - the one substitution, the workbench's absolute path recorded as the
//     literal `<workbench>`;
//   - a `seed/<nn>-<op>/` set copied onto the workbench root immediately
//     before its exchange;
//   - the file listing and the bytes a comparison reads;
//   - the regeneration switch, one environment variable per session.
//
// What it does not hold is an assertion about a session: each recorder states
// its own, by name, so a red case names the session it belongs to. `result`
// is the one exception, an `ok` check every recorder makes before it reads an
// answer.
//
// Importing this file runs nothing: a session touches the disk at `start()`.
// ---------------------------------------------------------------------------

import { spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { expect } from "vitest";
import type { Response } from "../../cli/protocol.js";
import { revisionOf } from "../../store.js";

export const CODEC_DIR = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
export const WRAPPER = resolve(CODEC_DIR, "../bin/fusion-record");
/** The scratch workbench a session starts from a fresh copy of, unless it names another base. */
export const FIXTURE = join(CODEC_DIR, "fixtures", "workbench");
export const PLACEHOLDER = "<workbench>";

// --- the one substitution ----------------------------------------------------------

/** A path as it stands inside a JSON string. */
export const inJson = (root: string): string => JSON.stringify(root).slice(1, -1);
/** `text` as it is recorded: every occurrence of `root` the placeholder. */
export const toPlaceholder = (root: string, text: string): string => text.split(inJson(root)).join(PLACEHOLDER);
/** `text` as it is replayed: every placeholder `root`. */
export const fromPlaceholder = (root: string, text: string): string => text.split(PLACEHOLDER).join(inJson(root));

// --- bytes and listings --------------------------------------------------------------

/** The bytes a request is sent as: one JSON object, one line, a trailing newline. */
export const requestBytes = (request: object): string => JSON.stringify(request) + "\n";
export const parse = (stdout: string): Response => JSON.parse(stdout) as Response;
export const bytesAt = (dir: string, path: string): Buffer => readFileSync(join(dir, path));

/** Every regular file under `dir`, relative to it, sorted. */
export function filesUnder(dir: string): string[] {
  const out: string[] = [];
  const walk = (d: string): void => {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      const abs = join(d, e.name);
      if (e.isDirectory()) walk(abs);
      else out.push(relative(dir, abs).split("\\").join("/"));
    }
  };
  if (existsSync(dir)) walk(dir);
  return out.sort();
}

// --- reviewed deltas -------------------------------------------------------------------
//
// A recorded response is never rewritten once the Prior side has replayed it,
// not even under a session's update variable. When a later revision moves its
// bytes, a reviewed delta file beside it, `<nn>-<op>.<topic>-delta.json`,
// names exactly what moved, and the gate holds the fresh answer equal to the
// recording with its deltas applied in order. Two forms:
//
//   - The first, `15-reconcile.role-delta.json` (FJ02, Prior `a15dfc8`): no
//     `format` field; `adds` inserts each named field after the field it
//     names, in the one entry of the array `list` whose `path` and `at` match.
//   - `fusion.session-delta/2` (the archive revision): `changes`, each a
//     JSON pointer (RFC 6901) into the response. `replace` swaps a member or
//     element that stands, in its place; `add` inserts an array element at an
//     index up to the length, or an object member that is new, after the
//     member `after` names, so the key order is stated rather than implied.
//     `follows` lists the delta files applied before this one, in order, so a
//     chain is read off the files alone.
//
// Application is strict, so nothing but the named fields can differ: the
// recorded bytes must round-trip through JSON, a pointer must land where its
// change says, and a change that leaves its value as it was is refused.

export const DELTA_FORMAT = "fusion.session-delta/2";

export interface FieldDelta {
  exchange: string;
  recorded: string;
  why: string;
  /** The JSON pointer of the array whose entries the delta changes. */
  list: string;
  adds: Array<{ entry: { path: string; at: string }; field: string; after: string; value: unknown }>;
}

export type DeltaChange = { op: "replace"; pointer: string; value: unknown } | { op: "add"; pointer: string; value: unknown; after?: string };

export interface PointerDelta {
  format: typeof DELTA_FORMAT;
  exchange: string;
  recorded: string;
  follows: string[];
  why: string;
  changes: DeltaChange[];
}

export type Delta = FieldDelta | PointerDelta;

type Json = Record<string, unknown>;

/** The tokens of a JSON pointer, unescaped. */
const tokensOf = (pointer: string): string[] => {
  if (!pointer.startsWith("/")) throw new Error(`${JSON.stringify(pointer)} is not a JSON pointer`);
  return pointer.slice(1).split("/").map((t) => t.replace(/~1/g, "/").replace(/~0/g, "~"));
};

/** The value a JSON pointer names, or undefined where it names nothing. */
export function valueAt(doc: unknown, pointer: string): unknown {
  return tokensOf(pointer).reduce<unknown>((v, key) => (v !== null && typeof v === "object" ? (v as Json)[key] : undefined), doc);
}

/** The array a JSON pointer names. */
export function listAt(doc: unknown, pointer: string): Json[] {
  const at = valueAt(doc, pointer);
  if (!Array.isArray(at)) throw new Error(`${pointer} names no array`);
  return at as Json[];
}

/** `object` with the new member `key` inserted after `after`. */
function placed(object: Json, key: string, value: unknown, after: string): Json {
  const next: Json = {};
  for (const [k, v] of Object.entries(object)) {
    next[k] = v;
    if (k === after) next[key] = value;
  }
  return next;
}

/** `change` applied to `doc` in place: the parent its pointer names is changed, and nothing else. */
function applyChange(doc: unknown, change: DeltaChange): void {
  const tokens = tokensOf(change.pointer);
  const last = tokens.pop() as string;
  const parent = tokens.reduce<unknown>((v, key) => (v !== null && typeof v === "object" ? (v as Json)[key] : undefined), doc);
  const where = `${change.op} ${change.pointer}`;
  if (parent === null || typeof parent !== "object") throw new Error(`${where}: the parent names nothing`);
  const same = (recorded: unknown): boolean => JSON.stringify(recorded) === JSON.stringify(change.value);
  if (Array.isArray(parent)) {
    if (!/^(0|[1-9][0-9]*)$/.test(last)) throw new Error(`${where}: ${JSON.stringify(last)} is no array index`);
    const i = Number(last);
    if (change.op === "replace") {
      if (i >= parent.length) throw new Error(`${where}: no element ${i}`);
      if (same(parent[i])) throw new Error(`${where}: the value is the recorded one`);
      parent[i] = change.value;
    } else {
      if (i > parent.length) throw new Error(`${where}: index ${i} is past the end (${parent.length})`);
      parent.splice(i, 0, change.value);
    }
    return;
  }
  const object = parent as Json;
  if (change.op === "replace") {
    if (!(last in object)) throw new Error(`${where}: no member ${last}`);
    if (same(object[last])) throw new Error(`${where}: the value is the recorded one`);
    object[last] = change.value; // an existing key keeps its place
    return;
  }
  if (last in object) throw new Error(`${where}: the member stands already`);
  if (change.after === undefined || !(change.after in object)) throw new Error(`${where}: an added member names the member it follows, and ${JSON.stringify(change.after)} is none`);
  const entries = Object.entries(placed(object, last, change.value, change.after));
  for (const k of Object.keys(object)) delete object[k];
  for (const [k, v] of entries) object[k] = v;
}

/** `text`, a recorded response or the result of an earlier delta, with exactly `delta` applied. */
export function applyDelta(text: string, delta: Delta): string {
  const doc = JSON.parse(text) as unknown;
  if (JSON.stringify(doc) + "\n" !== text) throw new Error(`${delta.exchange}: the bytes a delta applies to do not round-trip through JSON`);
  if ("format" in delta) {
    if (delta.format !== DELTA_FORMAT) throw new Error(`${delta.exchange}: unknown delta format ${JSON.stringify(delta.format)}`);
    if (delta.changes.length === 0) throw new Error(`${delta.exchange}: a delta changes something`);
    for (const change of delta.changes) applyChange(doc, change);
    return JSON.stringify(doc) + "\n";
  }
  const list = listAt(doc, delta.list);
  for (const add of delta.adds) {
    const hits = list.map((e, i) => [e, i] as const).filter(([e]) => e.path === add.entry.path && e.at === add.entry.at);
    if (hits.length !== 1) throw new Error(`${add.entry.path} ${add.entry.at}: ${hits.length} entries, not one`);
    const [entry, i] = hits[0] as readonly [Json, number];
    if (add.field in entry) throw new Error(`${add.entry.path} ${add.entry.at} already carries ${add.field}`);
    if (!(add.after in entry)) throw new Error(`${add.entry.path} ${add.entry.at} carries no ${add.after}`);
    list[i] = placed(entry, add.field, add.value, add.after);
  }
  return JSON.stringify(doc) + "\n";
}

export const readDelta = (dir: string, file: string): Delta => JSON.parse(readFileSync(join(dir, file), "utf-8")) as Delta;

/**
 * What exchange `exchange` answers now: its recorded response with each file
 * of `chain` applied in order. Each delta must name the exchange and its
 * recording, and a `fusion.session-delta/2` file's `follows` must be exactly
 * the files before it, so the chain is the one the files themselves state.
 */
export function deltaChain(dir: string, exchange: string, chain: readonly string[]): string {
  let text = readFileSync(join(dir, `${exchange}.response.json`), "utf-8");
  chain.forEach((file, i) => {
    const delta = readDelta(dir, file);
    if (delta.exchange !== exchange || delta.recorded !== `${exchange}.response.json`) throw new Error(`${file} names ${delta.exchange} and ${delta.recorded}, not ${exchange}`);
    if ("format" in delta && JSON.stringify(delta.follows) !== JSON.stringify(chain.slice(0, i))) throw new Error(`${file} follows ${JSON.stringify(delta.follows)}, not ${JSON.stringify(chain.slice(0, i))}`);
    text = applyDelta(text, delta);
  });
  return text;
}

// --- a session -----------------------------------------------------------------------

export interface Exchange<Name extends string = string> {
  name: Name;
  /** The request as sent, with the real workbench path. */
  request: Record<string, unknown>;
  /** Exactly what the wrapper wrote to stdout. */
  stdout: string;
  stderr: string;
  status: number | null;
}

export interface SessionOptions {
  /** The session's directory name under `fixtures/`. */
  directory: string;
  /** The environment variable that, set to `1`, rewrites the recorded files from the fresh run. */
  updateVariable: string;
  /** The prefix of the temp directory the session runs in. */
  tmpPrefix: string;
  /**
   * The directory `start()` copies to the workbench root, absolute; the
   * scratch workbench, `FIXTURE`, when none is named. The `initialize` session
   * names its own: a root holding the targets its requests name.
   */
  base?: string;
}

/** Where a started session runs. */
export interface Place {
  tmp: string;
  /** The project directory the wrapper is run from; the workbench is `fusion-workbench/` under it. */
  project: string;
  root: string;
}

/** One exchange as it is recorded, and the files that hold it. */
export interface Fresh {
  requestFile: string;
  responseFile: string;
  freshRequest: string;
  freshResponse: string;
}

export interface Session<Name extends string> {
  /** The session's directory, and its `seed/`. */
  readonly dir: string;
  readonly seedDir: string;
  /** True when the run rewrites the recorded files. */
  readonly update: boolean;
  /** Every exchange of the run, in the order sent. */
  readonly exchanges: Array<Exchange<Name>>;
  /** What each seed directory must hold, computed by the run: path (workbench-relative) to bytes. */
  readonly expectedSeeds: Map<Name, Map<string, Buffer>>;
  /** Makes the temp directory and copies the session's base into it. */
  start(): Place;
  /** Removes the temp directory; nothing to do when the session never started. */
  stop(): void;
  /** Sends `request` to the wrapper and keeps the exchange under `name`. */
  exchange(name: Name, request: object): Exchange<Name>;
  byName(name: Name): Exchange<Name>;
  /** The `result` of an exchange that answered `ok: true`; fails the case otherwise. */
  result(e: Exchange<Name>): Record<string, unknown>;
  record(text: string): string;
  replay(text: string): string;
  /** The revision of the file at `path` in the workbench, as it stands now. */
  revisionAt(path: string): string;
  /**
   * Records what `name`'s seed must hold, rewrites it when the session
   * regenerates, then copies the committed seed onto the workbench as a
   * replayer copies it. The comparison with what the run computed is a case of
   * the recorder's own, so a stale seed fails there by name; the session runs
   * on the committed bytes.
   */
  seedBefore(name: Name, files: Map<string, Buffer>): void;
  /** The exchange `name` as it is recorded, written to its two files first when the session regenerates. */
  fresh(name: Name): Fresh;
}

export function openSession<Name extends string>(options: SessionOptions): Session<Name> {
  const dir = join(CODEC_DIR, "fixtures", options.directory);
  const seedDir = join(dir, "seed");
  const update = process.env[options.updateVariable] === "1";
  const exchanges: Array<Exchange<Name>> = [];
  const expectedSeeds = new Map<Name, Map<string, Buffer>>();
  let place: Place | undefined;

  const at = (): Place => {
    if (place === undefined) throw new Error(`the session ${options.directory} was not started`);
    return place;
  };

  const byName = (name: Name): Exchange<Name> => {
    const e = exchanges.find((x) => x.name === name);
    if (e === undefined) throw new Error(`no exchange ${name}`);
    return e;
  };

  const record = (text: string): string => toPlaceholder(at().root, text);

  return {
    dir,
    seedDir,
    update,
    exchanges,
    expectedSeeds,

    start(): Place {
      const tmp = mkdtempSync(join(tmpdir(), options.tmpPrefix));
      const project = join(tmp, "project");
      const root = join(project, "fusion-workbench");
      mkdirSync(project);
      cpSync(options.base ?? FIXTURE, root, { recursive: true });
      place = { tmp, project, root };
      return place;
    },

    stop(): void {
      if (place !== undefined) rmSync(place.tmp, { recursive: true, force: true });
    },

    exchange(name: Name, request: object): Exchange<Name> {
      const { FUSION_WORKBENCH: _drop, ...env } = process.env;
      const r = spawnSync(WRAPPER, [], { input: requestBytes(request), cwd: at().project, encoding: "utf-8", env });
      const e: Exchange<Name> = { name, request: request as Record<string, unknown>, stdout: r.stdout ?? "", stderr: r.stderr ?? "", status: r.status };
      exchanges.push(e);
      return e;
    },

    byName,

    result(e: Exchange<Name>): Record<string, unknown> {
      const response = parse(e.stdout);
      expect(response.ok, `${e.name}: ${e.stdout}`).toBe(true);
      if (!response.ok) throw new Error("unreachable");
      return response.result as Record<string, unknown>;
    },

    record,
    replay: (text: string): string => fromPlaceholder(at().root, text),
    revisionAt: (path: string): string => revisionOf(bytesAt(at().root, path)),

    seedBefore(name: Name, files: Map<string, Buffer>): void {
      const { root } = at();
      expectedSeeds.set(name, files);
      const seed = join(seedDir, name);
      if (update) {
        rmSync(seed, { recursive: true, force: true });
        for (const [path, bytes] of files) {
          mkdirSync(dirname(join(seed, path)), { recursive: true });
          writeFileSync(join(seed, path), bytes);
        }
      }
      for (const path of filesUnder(seed)) {
        mkdirSync(dirname(join(root, path)), { recursive: true });
        writeFileSync(join(root, path), bytesAt(seed, path));
      }
    },

    fresh(name: Name): Fresh {
      const e = byName(name);
      const requestFile = join(dir, `${name}.request.json`);
      const responseFile = join(dir, `${name}.response.json`);
      const freshRequest = record(requestBytes(e.request));
      const freshResponse = record(e.stdout);
      if (update) {
        mkdirSync(dir, { recursive: true });
        writeFileSync(requestFile, freshRequest);
        writeFileSync(responseFile, freshResponse);
      }
      return { requestFile, responseFile, freshRequest, freshResponse };
    },
  };
}
