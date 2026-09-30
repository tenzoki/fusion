// ---------------------------------------------------------------------------
// `initialize`, `list.result.state` and `inspect.pending` through
// `bin/fusion-record`, recorded (the initialize plan's step 8, as amended
// after step 7a; Prior's request 27, response 28 and item 33 with the
// corrections of Prior `ae1ad78` `## 33`).
//
// Twenty-six exchanges, through the wrapper only. `<workbench>` is not a
// workbench here but a root R holding the targets the requests name, each a
// directory or file directly under R:
//
//   legacy/      a v12 store: a `.fusion-setup` and one package's Markdown
//   file         a regular file
//   new/         an empty directory, made by the recorder (git keeps none)
//   pending/     a committed `initialize` intent and nothing else
//   crowded/     a committed `initialize` intent beside another root entry
//   diverged/    a committed `initialize` intent under a manifest at neither
//                of its bytes (a valid one naming another workbench)
//   nonfile/     a committed `initialize` intent under a `workbench.json`
//                that is a directory
//   unreadable/  a committed intent whose `intent.json` does not parse
//
//   01 inspect     new: legacy, pending null
//   02 list        new: state legacy, records []
//   03 list        legacy: state legacy, records []
//   04 initialize  legacy: conflict/target-not-empty, nothing written
//   05 initialize  file: unknown-scope/workbench-missing
//   06 initialize  new: the manifest lands
//   07 initialize  06 repeated: 06's bytes
//   08 inspect     new: json-control, after the replay
//   09 initialize  06's operation id with another workbench id:
//                  conflict/operation-id-reused
//   10 initialize  new under another operation id: conflict/manifest-present
//   11 list        new: state json-control, records []
//   12 create      a package in new
//   13 initialize  06 repeated after 12 landed: 06's bytes
//   14 inspect     new: json-control, after the replay
//   15 list        new: the one record
//   16 inspect     pending: legacy, pending {operation_id, id, blocked: false}
//   17 initialize  pending, the request rebuilt from the target and 16's
//                  pending alone: the committed result
//   18 inspect     pending: json-control, pending null
//   19 inspect     crowded: legacy, pending named despite the other entry
//   20 initialize  crowded, rebuilt from 19's pending: the committed result
//   21 inspect     crowded: json-control, pending null
//   22 inspect     diverged: pending with blocked: true
//   23 initialize  diverged, rebuilt from 22's pending:
//                  operation-unknown/recovery-blocked, every file kept
//   24 inspect     nonfile: unsupported, schema-invalid/manifest-not-a-file,
//                  pending with blocked: true
//   25 initialize  nonfile, rebuilt from 24's pending:
//                  operation-unknown/recovery-blocked, every file kept
//   26 inspect     unreadable: operation-unknown/pending-initialize-unreadable
//
// ## The recorded session
//
// Every exchange is recorded under `fixtures/protocol-session-initialize/` as
// `<nn>-<op>.request.json` and `<nn>-<op>.response.json`, a GOLDEN as the FJ02
// and FJ02b sessions are, rewritten only under
// `UPDATE_PROTOCOL_SESSION_INITIALIZE=1`, with the same substitution: R's
// absolute path is the literal `<workbench>`, so a target is
// `<workbench>/new`. The machinery is `helpers/session.ts`, started from this
// session's own `base/` in place of the scratch workbench.
//
// `base/` holds `legacy/` and `file` as the constants below write them; this
// recorder writes it under the update variable and checks it on every run.
//
// ## The seeded intents, and the second substitution
//
// No operation of the protocol leaves a committed intent standing, so every
// intent is a seed. Each readable one is produced by an in-process cut of the
// very request the `initialize` exchange after it sends (`dispatch` with
// `cutAt: "after-intent"` and a fixed clock, in a scratch directory), keeping
// only `.json-state/journal/`. An intent records the digest of its request,
// and a request names its target by absolute path, so that one field depends
// on R. The seed records it as `<request-digest:<nn>-<op>>`, and whoever
// copies the seed replaces it with `sha256:` over the canonical rendering of
// exchange <nn>'s request as sent (keys sorted, no whitespace). Every
// `initialize` request here is written in sorted key order, so that rendering
// is the request line itself without its newline; a case below holds that.
// With any other digest 17 and 20 answer `conflict/operation-id-reused`, and
// so do 23 and 25.
//
// Nothing else depends on the clock, the host or a generated id: every id and
// operation id is a fixed literal, the intents' `created_at` is fixed, and
// every revision is `sha256:` over deterministic bytes.
// ---------------------------------------------------------------------------

import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { dispatch } from "../cli/ops.js";
import type { CreateRequest, InitializeRequest, InspectRequest, ListRequest } from "../cli/protocol.js";
import { canonical, requestDigest, type Intent } from "../journal.js";
import { CutReached } from "../kernel.js";
import { SELF_IGNORE, SELF_IGNORE_FILE, STATE_DIR, revisionOf, serialise } from "../store.js";
import { CODEC_DIR, PLACEHOLDER, bytesAt, filesUnder, openSession, parse, requestBytes } from "./helpers/session.js";

// --- the fixed literals ----------------------------------------------------------

const LEGACY = "legacy";
const FILE = "file";
const NEW = "new";
const PENDING = "pending";
const CROWDED = "crowded";
const DIVERGED = "diverged";
const NONFILE = "nonfile";
const UNREADABLE = "unreadable";

/** Operation ids by exchange number; workbench and record ids in a range of their own. */
const op = (n: number): string => `1a1e00${String(n).padStart(2, "0")}-0000-4000-8000-0000000000${String(n).padStart(2, "0")}`;
/** The workbench id a request of exchange `n` names. */
const wbId = (n: number): string => `1a1ebe${String(n).padStart(2, "0")}-0000-4000-8000-0000000000${String(n).padStart(2, "0")}`;
const WB_NEW = wbId(6);
const WB_BY_HAND = "1a1ebeff-0000-4000-8000-0000000000ff";
const PKG_ID = "1a1e1012-0000-4000-8000-000000000012";

/** The clock of every cut, and so the `created_at` of every seeded intent. */
const CUT_AT = Date.parse("2026-09-30T18:00:00.000Z");

const LEGACY_STEM = "260930-0900-legacy-store";
/** `base/`, root-relative path to bytes: the v12 store and the regular file. */
const BASE_FILES = new Map<string, Buffer>([
  [FILE, Buffer.from("A regular file where initialize is sent a directory.\n", "utf-8")],
  [`${LEGACY}/.fusion-setup`, Buffer.from('{"setup_at":"2026-09-30T09:00:00+02:00","plugin_version":"12.0.0"}\n', "utf-8")],
  [
    `${LEGACY}/work-packages/${LEGACY_STEM}/${LEGACY_STEM}.md`,
    Buffer.from(`# A v12 store FJ04 would migrate\n\n---\n**Domain:** code\n**Status:** open\n**Filed by:** user, Kai Stalmann <ks@qantr.com>\n\n---\n\n## Directive\n\nStay as it is: initialize refuses this directory.\n`, "utf-8"),
  ],
]);

const PKG_STEM = "260930-1800-initialize-session";
const PKG = `work-packages/${PKG_STEM}/package.json`;
const PKG_MD = `work-packages/${PKG_STEM}/${PKG_STEM}.md`;
const PKG_CONTENT = "# initialize session\n\nThe first record of a workbench initialize wrote.\n";

const manifestOf = (id: string): Buffer => Buffer.from(serialise({ schema: "fusion.workbench/v1", id, required_features: ["json-control-v1"], migration: null, extensions: {} }), "utf-8");
/** The manifest a hand wrote into `diverged/` under the committed intent: neither the intent's pre-bytes (absent) nor its post-bytes. */
const BY_HAND = manifestOf(WB_BY_HAND);
/** The other root entry of `crowded/`. */
const CROWDED_NOTE = Buffer.from("A note someone left before the manifest landed.\n", "utf-8");
/** What stands inside `nonfile/workbench.json/`, so git keeps the directory. */
const NONFILE_NOTE = Buffer.from("workbench.json is a directory here.\n", "utf-8");
/** An intent whose `intent.json` is cut short. */
const UNREADABLE_INTENT = Buffer.from('{\n  "operation_id": "' + op(26) + '",\n  "op": "initialize",\n', "utf-8");

const NAMES = [
  "01-inspect",
  "02-list",
  "03-list",
  "04-initialize",
  "05-initialize",
  "06-initialize",
  "07-initialize",
  "08-inspect",
  "09-initialize",
  "10-initialize",
  "11-list",
  "12-create",
  "13-initialize",
  "14-inspect",
  "15-list",
  "16-inspect",
  "17-initialize",
  "18-inspect",
  "19-inspect",
  "20-initialize",
  "21-inspect",
  "22-inspect",
  "23-initialize",
  "24-inspect",
  "25-initialize",
  "26-inspect",
] as const;
type Name = (typeof NAMES)[number];

/**
 * The seeded pending intents: the exchange a seed directory precedes, its
 * target, and the `initialize` exchange that sends the intent's own request,
 * rebuilt from the target and the seed exchange's `pending` alone.
 */
const INTENTS: ReadonlyArray<{ seed: Name; target: string; sends: Name; n: number; blocked: boolean }> = [
  { seed: "16-inspect", target: PENDING, sends: "17-initialize", n: 17, blocked: false },
  { seed: "19-inspect", target: CROWDED, sends: "20-initialize", n: 20, blocked: false },
  { seed: "22-inspect", target: DIVERGED, sends: "23-initialize", n: 23, blocked: true },
  { seed: "24-inspect", target: NONFILE, sends: "25-initialize", n: 25, blocked: true },
];
/** Every seed directory: the four above and the unreadable intent. */
const SEEDED: readonly Name[] = [...INTENTS.map((i) => i.seed), "26-inspect"];

/** The exchanges refused, each with the one reason it is recorded for. */
const REFUSED: ReadonlyArray<[Name, { class: string; reason: string }]> = [
  ["04-initialize", { class: "conflict", reason: "target-not-empty" }],
  ["05-initialize", { class: "unknown-scope", reason: "workbench-missing" }],
  ["09-initialize", { class: "conflict", reason: "operation-id-reused" }],
  ["10-initialize", { class: "conflict", reason: "manifest-present" }],
  ["23-initialize", { class: "operation-unknown", reason: "recovery-blocked" }],
  ["25-initialize", { class: "operation-unknown", reason: "recovery-blocked" }],
  ["26-inspect", { class: "operation-unknown", reason: "pending-initialize-unreadable" }],
];

/** The successful replays, each followed by an `inspect` of its target. */
const REPLAYS: ReadonlyArray<[Name, Name]> = [
  ["07-initialize", "08-inspect"],
  ["13-initialize", "14-inspect"],
];

/** Where the lock protocol writes its self-ignore, the one file a blocked `initialize` adds. */
const SELF_IGNORE_PATH = `${STATE_DIR}/${SELF_IGNORE_FILE}`;

/** The placeholder a seeded intent carries for its request's digest. */
const digestPlaceholder = (name: Name): string => `<request-digest:${name}>`;

// --- the exchange machinery (helpers/session.ts) ----------------------------------------

const BASE = join(CODEC_DIR, "fixtures", "protocol-session-initialize", "base");
const session = openSession<Name>({ directory: "protocol-session-initialize", updateVariable: "UPDATE_PROTOCOL_SESSION_INITIALIZE", tmpPrefix: "codec-round-trip-initialize-", base: BASE });
const { exchanges, expectedSeeds, exchange, byName, result, record, replay, seedBefore } = session;
const SESSION = session.dir;
const SEED = session.seedDir;
const UPDATE = session.update;
const FIX = "UPDATE_PROTOCOL_SESSION_INITIALIZE=1";

// Under the update variable `base/` is written from the constants before the session copies it.
if (UPDATE) {
  rmSync(BASE, { recursive: true, force: true });
  for (const [path, bytes] of BASE_FILES) {
    mkdirSync(dirname(join(BASE, path)), { recursive: true });
    writeFileSync(join(BASE, path), bytes);
  }
}

let tmp: string;
let root: string;
const at = (target: string): string => join(root, target);

/** An `initialize` request in sorted key order, so its line is its canonical rendering. */
const initialize = (target: string, operation_id: string, id: string): InitializeRequest => ({ id, op: "initialize", operation_id, workbench: at(target) });

/** Every file and directory under `dir`, path to bytes (a directory as `<dir>`): what "unchanged" is compared on. */
function tree(dir: string): Record<string, string> {
  const out: Record<string, string> = {};
  const walk = (d: string, rel: string): void => {
    for (const n of readdirSync(d).sort()) {
      const abs = join(d, n);
      const r = rel === "" ? n : `${rel}/${n}`;
      if (statSync(abs).isDirectory()) {
        out[r] = "<dir>";
        walk(abs, r);
      } else out[r] = readFileSync(abs).toString("base64");
    }
  };
  walk(dir, "");
  return out;
}

// --- the seeded intents --------------------------------------------------------------------

/**
 * The committed intent `request` leaves when it is cut after its commit point,
 * as the seed records it under `target/`: the journal directory alone, the
 * intent's digest replaced by the placeholder of exchange `sends`. The cut
 * runs in a scratch directory of its own, so the digest found there is
 * replaced, never kept.
 */
async function intentSeed(sends: Name, target: string, request: InitializeRequest): Promise<Map<string, Buffer>> {
  const scratch = join(tmp, `cut-${sends}`);
  mkdirSync(scratch);
  const sent = { ...request, workbench: scratch };
  let cut: unknown;
  try {
    await dispatch(sent, { kernel: { now: () => CUT_AT, faults: { cutAt: "after-intent" } } });
  } catch (e) {
    cut = e;
  }
  if (!(cut instanceof CutReached)) throw new Error(`the cut of ${sends} was not reached: ${String(cut)}`);
  const journal = ".json-state/journal";
  const files = new Map<string, Buffer>();
  for (const path of filesUnder(join(scratch, journal))) {
    let bytes = bytesAt(scratch, `${journal}/${path}`);
    if (path.endsWith("/intent.json")) {
      const quoted = JSON.stringify(requestDigest(sent));
      const text = bytes.toString("utf-8");
      if (text.split(quoted).length !== 2) throw new Error(`${sends}: the intent does not carry its request's digest exactly once`);
      bytes = Buffer.from(text.replace(quoted, JSON.stringify(digestPlaceholder(sends))), "utf-8");
    }
    files.set(`${target}/${journal}/${path}`, bytes);
  }
  return files;
}

/** What a replayer does after copying a seed: the placeholder of `sends` becomes the digest of that exchange's request. */
function resolveDigest(sends: Name, request: InitializeRequest): void {
  for (const path of filesUnder(root).filter((p) => p.endsWith("/intent.json"))) {
    const text = bytesAt(root, path).toString("utf-8");
    if (text.includes(digestPlaceholder(sends))) writeFileSync(join(root, path), text.replace(digestPlaceholder(sends), requestDigest(request)));
  }
}

/** The `initialize` request a host rebuilds from nothing but the target and the `pending` an `inspect` answered. */
function rebuilt(target: string, inspected: Name): InitializeRequest {
  const pending = result(byName(inspected)).pending as { operation_id: string; id: string };
  return initialize(target, pending.operation_id, pending.id);
}

// --- the session -----------------------------------------------------------------------

const sentRequests = new Map<Name, InitializeRequest>();
/** The request each seeded intent was cut from, by the exchange that sends it. */
const seededRequests = new Map<Name, InitializeRequest>();
let legacyBefore: Record<string, string>;
let legacyAfter04: Record<string, string>;
let fileAfter05: Buffer;
/** The target of each blocked `initialize`, immediately before and after it. */
const aroundBlocked = new Map<Name, { before: Record<string, string>; after: Record<string, string> }>();

beforeAll(async () => {
  ({ tmp, root } = session.start());
  mkdirSync(at(NEW));

  const inspect = (target: string): InspectRequest => ({ op: "inspect", workbench: at(target) });
  const list = (target: string): ListRequest => ({ op: "list", workbench: at(target) });
  const init = (name: Name, request: InitializeRequest): void => {
    sentRequests.set(name, request);
    exchange(name, request);
  };

  exchange("01-inspect", inspect(NEW));
  exchange("02-list", list(NEW));
  legacyBefore = tree(at(LEGACY));
  exchange("03-list", list(LEGACY));
  init("04-initialize", initialize(LEGACY, op(4), WB_NEW));
  legacyAfter04 = tree(at(LEGACY));
  init("05-initialize", initialize(FILE, op(5), WB_NEW));
  fileAfter05 = bytesAt(root, FILE);

  const first = initialize(NEW, op(6), WB_NEW);
  init("06-initialize", first);
  init("07-initialize", first);
  exchange("08-inspect", inspect(NEW));
  init("09-initialize", initialize(NEW, op(6), wbId(9)));
  init("10-initialize", initialize(NEW, op(10), wbId(10)));
  exchange("11-list", list(NEW));
  exchange("12-create", {
    op: "create",
    workbench: at(NEW),
    operation_id: op(12),
    id: PKG_ID,
    kind: "package",
    filed_by: { actor: "user", person: "Kai Stalmann <ks@qantr.com>" },
    origin: { kind: "user-request", ref: null },
    scope: { container: null, store: "work-packages" },
    narrative: { path: PKG_MD, content: PKG_CONTENT },
    payload: { domain: "code" },
  } satisfies CreateRequest);
  init("13-initialize", first);
  exchange("14-inspect", inspect(NEW));
  exchange("15-list", list(NEW));

  // The seeded intents: each seed copied, its digest resolved, the target
  // inspected, and the intent's own request rebuilt from that answer and sent.
  const extra: Record<string, Array<[string, Buffer]>> = {
    [CROWDED]: [[`${CROWDED}/notes.txt`, CROWDED_NOTE]],
    [DIVERGED]: [[`${DIVERGED}/workbench.json`, BY_HAND]],
    [NONFILE]: [[`${NONFILE}/workbench.json/note.txt`, NONFILE_NOTE]],
  };
  for (const { seed, target, sends, n, blocked } of INTENTS) {
    const request = initialize(target, op(n), wbId(n));
    seededRequests.set(sends, request);
    const files = await intentSeed(sends, target, request);
    for (const [path, bytes] of extra[target] ?? []) files.set(path, bytes);
    seedBefore(seed, files);
    resolveDigest(sends, request);
    exchange(seed, inspect(target));
    const before = blocked ? tree(at(target)) : undefined;
    init(sends, rebuilt(target, seed));
    if (before !== undefined) aroundBlocked.set(sends, { before, after: tree(at(target)) });
    if (!blocked) exchange(NAMES[NAMES.indexOf(sends) + 1] as Name, inspect(target));
  }

  seedBefore("26-inspect", new Map([[`${UNREADABLE}/.json-state/journal/${op(26)}/intent.json`, UNREADABLE_INTENT]]));
  exchange("26-inspect", inspect(UNREADABLE));
}, 120_000);

afterAll(() => {
  session.stop();
});

// --- what each exchange answered ---------------------------------------------------------

const refusalOf = (name: Name): { class: string; reason: string; detail: string } => {
  const response = parse(byName(name).stdout);
  expect(response.ok, `${name}: ${byName(name).stdout}`).toBe(false);
  if (response.ok) throw new Error("unreachable");
  return response.error as { class: string; reason: string; detail: string };
};

describe("the twenty-six initialize exchanges through bin/fusion-record", () => {
  it("every exchange was answered: exit 0, one line on stdout, nothing on stderr", () => {
    expect(exchanges.map((e) => e.name)).toEqual([...NAMES]);
    for (const e of exchanges) {
      expect(e.status, `${e.name}: ${e.stderr}`).toBe(0);
      expect(e.stderr, e.name).toBe("");
      expect(e.stdout.endsWith("\n"), e.name).toBe(true);
      expect(e.stdout.trim().split("\n"), e.name).toHaveLength(1);
    }
  });

  it("every initialize request is sent in sorted key order: its line is its canonical rendering, so a replayer's digest is sha256 over it", () => {
    for (const [name, request] of sentRequests) {
      expect(requestBytes(request), name).toBe(canonical(request) + "\n");
      expect(requestDigest(request), name).toBe(revisionOf(Buffer.from(canonical(request), "utf-8")));
    }
    expect([...sentRequests.keys()]).toEqual(NAMES.filter((n) => n.endsWith("-initialize")));
  });

  it("01 and 02: an empty directory is legacy, with no pending initialize and no records", () => {
    expect(result(byName("01-inspect"))).toMatchObject({ workbench: at(NEW), state: "legacy", id: null, manifest: null, pending: null });
    expect(result(byName("02-list"))).toEqual({ workbench: at(NEW), state: "legacy", scope: null, records: [] });
  });

  it("03 and 04: a v12 store lists as legacy with no records, and initialize refuses it by name, leaving it byte-identical with no .json-state/", () => {
    expect(result(byName("03-list"))).toEqual({ workbench: at(LEGACY), state: "legacy", scope: null, records: [] });
    expect(refusalOf("04-initialize").detail).toContain(`holds .fusion-setup, work-packages`);
    expect(legacyAfter04).toEqual(legacyBefore);
    expect(tree(at(LEGACY))).toEqual(legacyBefore);
    expect(existsSync(join(at(LEGACY), ".json-state"))).toBe(false);
  });

  it("05: a regular file is no target, and it keeps its bytes", () => {
    expect(fileAfter05.equals(BASE_FILES.get(FILE) as Buffer)).toBe(true);
  });

  for (const [name, expected] of REFUSED) {
    it(`${name}: ${expected.class}/${expected.reason}`, () => {
      expect(refusalOf(name)).toMatchObject(expected);
    });
  }

  it("06: the ruled manifest over the empty directory, answered {operation_id, id, path, revision} with revisions", () => {
    const rev = revisionOf(manifestOf(WB_NEW));
    expect(parse(byName("06-initialize").stdout)).toEqual({ ok: true, result: { operation_id: op(6), id: WB_NEW, path: "workbench.json", revision: rev }, revisions: { "workbench.json": rev } });
  });

  for (const [replayed, inspected] of REPLAYS) {
    it(`${replayed}, 06 repeated: 06's bytes; ${inspected} then finds the manifest 06 wrote`, () => {
      expect(byName(replayed).request).toEqual(byName("06-initialize").request);
      expect(byName(replayed).stdout).toBe(byName("06-initialize").stdout);
      expect(result(byName(inspected))).toMatchObject({ workbench: at(NEW), state: "json-control", id: WB_NEW, manifest: { id: WB_NEW }, pending: null });
    });
  }

  it("09 and 10: the manifest 06 wrote is never replaced, and neither refusal stores an answer", () => {
    expect(refusalOf("09-initialize").detail).toContain(op(6));
    expect(refusalOf("10-initialize").detail).toContain("workbench.json");
    expect(bytesAt(root, `${NEW}/workbench.json`).equals(manifestOf(WB_NEW))).toBe(true);
    for (const n of [4, 5, 10]) expect(existsSync(join(at(NEW), ".json-state", "ops", `${op(n)}.json`)), op(n)).toBe(false);
  });

  it("11, 12 and 15: no records, then the first record lands and list names it", () => {
    expect(result(byName("11-list"))).toEqual({ workbench: at(NEW), state: "json-control", scope: null, records: [] });
    const created = result(byName("12-create"));
    expect(created).toMatchObject({ operation_id: op(12), path: PKG, kind: "package" });
    const listed = result(byName("15-list"));
    expect(listed).toMatchObject({ workbench: at(NEW), state: "json-control", scope: null });
    expect(listed.records).toEqual([{ path: PKG, kind: "package", id: PKG_ID, status: "open", revision: created.revision, narrative: { path: PKG_MD, sha256: revisionOf(Buffer.from(PKG_CONTENT, "utf-8")) } }]);
  });

  for (const { seed, target, sends, n, blocked } of INTENTS) {
    it(`${seed}: pending names the committed intent of ${target}/ with its workbench id, blocked ${String(blocked)}`, () => {
      expect(result(byName(seed)).pending).toEqual({ operation_id: op(n), id: wbId(n), blocked });
    });

    it(`${sends}: the request rebuilt from the target and ${seed}'s pending alone is the one the intent was cut from`, () => {
      expect(byName(sends).request).toEqual(seededRequests.get(sends));
      expect(requestDigest(byName(sends).request)).toBe(requestDigest(seededRequests.get(sends) as InitializeRequest));
    });
  }

  it("16 to 21: without a manifest, and beside another entry, the target is legacy until the intent's own request lands it; then json-control, pending null", () => {
    expect(result(byName("16-inspect"))).toMatchObject({ workbench: at(PENDING), state: "legacy", id: null, manifest: null });
    expect(result(byName("19-inspect"))).toMatchObject({ workbench: at(CROWDED), state: "legacy", id: null, manifest: null });
    for (const [sends, inspected, target, n] of [["17-initialize", "18-inspect", PENDING, 17], ["20-initialize", "21-inspect", CROWDED, 20]] as const) {
      const intent = JSON.parse((expectedSeeds.get(INTENTS.find((i) => i.sends === sends)?.seed as Name) as Map<string, Buffer>).get(`${target}/.json-state/journal/${op(n)}/intent.json`)?.toString("utf-8") ?? "null") as Intent;
      expect(byName(sends).stdout, sends).toBe(JSON.stringify(intent.response) + "\n");
      expect(result(byName(sends))).toEqual({ operation_id: op(n), id: wbId(n), path: "workbench.json", revision: revisionOf(manifestOf(wbId(n))) });
      expect(bytesAt(root, `${target}/workbench.json`).equals(manifestOf(wbId(n))), target).toBe(true);
      expect(result(byName(inspected))).toMatchObject({ workbench: at(target), state: "json-control", id: wbId(n), pending: null });
    }
    expect(bytesAt(root, `${CROWDED}/notes.txt`).equals(CROWDED_NOTE)).toBe(true);
  });

  it("22 and 24: a manifest at neither of the intent's bytes is json-control or unsupported as it reads, and pending names the intent blocked", () => {
    expect(result(byName("22-inspect"))).toMatchObject({ workbench: at(DIVERGED), state: "json-control", id: WB_BY_HAND });
    expect(result(byName("24-inspect"))).toMatchObject({ workbench: at(NONFILE), state: "unsupported", id: null, diagnosis: { class: "schema-invalid", reason: "manifest-not-a-file" } });
  });

  for (const sends of ["23-initialize", "25-initialize"] as const) {
    it(`${sends}: a blocked answer leaves every file of the target byte-identical, the intent standing; the lock adds only its self-ignore`, () => {
      expect(refusalOf(sends).detail).toContain("workbench.json");
      const { before, after } = aroundBlocked.get(sends) as { before: Record<string, string>; after: Record<string, string> };
      // The seed cannot carry the lock's self-ignore (a `*` .gitignore would hide
      // the seed from git), so taking the lock writes it; nothing else moves.
      const { [SELF_IGNORE_PATH]: selfIgnore, ...rest } = after;
      expect(before[SELF_IGNORE_PATH]).toBeUndefined();
      expect(selfIgnore === undefined ? undefined : Buffer.from(selfIgnore, "base64").toString("utf-8")).toBe(SELF_IGNORE);
      expect(rest).toEqual(before);
      expect(Object.keys(after)).toContain(`.json-state/journal/${byName(sends).request.operation_id as string}/intent.json`);
    });
  }

  it("26: an intent that does not read is refused by name, never reported as pending: null", () => {
    expect(refusalOf("26-inspect").detail).toContain(`.json-state/journal/${op(26)}`);
  });
});

// --- the recorded session ------------------------------------------------------------------

describe(`the recorded session under fixtures/protocol-session-initialize/ (${UPDATE ? "REGENERATING" : "golden"})`, () => {
  it("no recorded byte carries the temp path, and the placeholder round-trips", () => {
    for (const e of exchanges) {
      const req = record(requestBytes(e.request));
      const res = record(e.stdout);
      expect(req, e.name).not.toContain(root);
      expect(res, e.name).not.toContain(root);
      expect(req, e.name).not.toContain(tmp);
      expect(res, e.name).not.toContain(tmp);
      expect(replay(req), e.name).toBe(requestBytes(e.request));
      expect(replay(res), e.name).toBe(e.stdout);
      expect(req, e.name).toContain(PLACEHOLDER);
    }
  });

  for (const name of NAMES) {
    it(`${name}: the recorded request and response equal the fresh exchange`, () => {
      const { requestFile, responseFile, freshRequest, freshResponse } = session.fresh(name);
      const missing = [requestFile, responseFile].filter((f) => !existsSync(f));
      expect(missing, `recorded session incomplete: ${missing.join(", ")}.\nFIX: run \`${FIX} npm test -- round-trip-cli-initialize\` in codec/ and commit fixtures/protocol-session-initialize/.`).toEqual([]);
      expect(readFileSync(requestFile, "utf-8"), `${name}.request.json differs from the fresh exchange. If the protocol changed on purpose, regenerate with ${FIX} and commit the files; the Prior side replays them.`).toBe(freshRequest);
      expect(readFileSync(responseFile, "utf-8"), `${name}.response.json differs from the fresh exchange. If the protocol changed on purpose, regenerate with ${FIX} and commit the files; the Prior side replays them.`).toBe(freshResponse);
    });
  }

  it("base/ holds exactly the v12 store and the regular file the constants state", () => {
    expect(filesUnder(BASE), `base/ is not the stated file set. If it changed on purpose, regenerate with ${FIX}.`).toEqual([...BASE_FILES.keys()].sort());
    for (const [path, bytes] of BASE_FILES) expect(bytesAt(BASE, path).equals(bytes), `base/${path}`).toBe(true);
    expect(readdirSync(BASE).sort()).toEqual([FILE, LEGACY]);
  });

  for (const name of SEEDED) {
    it(`seed/${name}/ holds exactly the computed bytes`, () => {
      const expected = expectedSeeds.get(name);
      expect(expected, `no seed was computed for ${name}`).toBeDefined();
      const dir = join(SEED, name);
      expect(filesUnder(dir), `seed/${name}/ is not the computed file set. If a producer changed on purpose, regenerate with ${FIX}.`).toEqual([...(expected as Map<string, Buffer>).keys()].sort());
      for (const [path, bytes] of expected as Map<string, Buffer>) {
        expect(bytesAt(dir, path).equals(bytes), `seed/${name}/${path} differs from what produces it. If a producer changed on purpose, regenerate with ${FIX}.`).toBe(true);
      }
    });
  }

  for (const { seed, target, sends, n } of INTENTS) {
    it(`seed/${seed}/: the intent of ${sends}'s request as the cut wrote it, its digest the placeholder`, () => {
      const intent = JSON.parse(readFileSync(join(SEED, seed, target, ".json-state", "journal", op(n), "intent.json"), "utf-8")) as Intent;
      expect(Object.keys(intent)).toEqual(["operation_id", "op", "request_digest", "writes", "response", "created_at"]);
      expect(intent).toMatchObject({ operation_id: op(n), op: "initialize", request_digest: digestPlaceholder(sends), created_at: new Date(CUT_AT).toISOString() });
      expect(intent.writes).toEqual([{ path: "workbench.json", before: null, after: revisionOf(manifestOf(wbId(n))) }]);
    });
  }

  it("the recorded set is exactly the twenty-six pairs, a README, base/ and seed/", () => {
    const files = readdirSync(SESSION).sort();
    const expected = ["README.md", "base", "seed", ...NAMES.flatMap((n) => [`${n}.request.json`, `${n}.response.json`])].sort();
    expect(files).toEqual(expected);
    expect(readdirSync(SEED).sort()).toEqual([...SEEDED].sort());
  });
});
