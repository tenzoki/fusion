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
