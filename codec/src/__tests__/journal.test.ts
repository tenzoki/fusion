// ---------------------------------------------------------------------------
// The intent journal and the stored answer, over a temp copy of the scratch
// workbench (FJ02 plan step 2).
//
// Every case works on a fresh copy of `fixtures/workbench/`; nothing here
// writes into `codec/fixtures/`. The journal functions are called directly,
// as the kernel will call them under the lock; the lock itself is
// `store.test.ts`'s subject.
// ---------------------------------------------------------------------------

import { cpSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, unlinkSync, utimesSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it } from "vitest";
import type { Response } from "../cli/protocol.js";
import {
  INTENT_FILE,
  answerPath,
  applyWrites,
  canonical,
  commitIntent,
  fileState,
  journalDir,
  opsDir,
  readAnswer,
  readIntents,
  recover,
  removeIntent,
  replayAnswer,
  requestDigest,
  sweep,
  writeAnswer,
  type Intent,
  type Write,
} from "../journal.js";
import { STATE_DIR, openWorkbench, revisionOf, type Workbench } from "../store.js";
import { MAX_RECORD_BYTES, strictParse } from "../strict-json.js";

const FIXTURE = fileURLToPath(new URL("../../fixtures/workbench/", import.meta.url));
const OPEN = "work-packages/260928-1200-parser-fix/package.json";
const ISSUE = "shared/issues/260928-1400-parser-fails-on-empty-input.record.json";
/** A narrative the scratch workbench lacks, in a directory it lacks: the write creates both. */
const NEW_NOTE = "work-packages/260928-1200-parser-fix/notes/260929-0900-a-note.md";
const OP_ID = "3b1f2d7e-8c4a-4f5b-9e6d-0a1b2c3d4e5f";

const roots: string[] = [];
afterEach(() => {
  for (const r of roots.splice(0)) rmSync(r, { recursive: true, force: true });
});

/** A fresh copy of the scratch workbench, opened. */
const fresh = (): Workbench => {
  const root = mkdtempSync(join(tmpdir(), "codec-journal-"));
  roots.push(root);
  cpSync(FIXTURE, root, { recursive: true });
  const r = openWorkbench(root);
  if (!r.ok) throw new Error(r.error.detail);
  return r.value;
};

const bytesAt = (wb: Workbench, path: string): Buffer | null => (existsSync(join(wb.root, path)) ? readFileSync(join(wb.root, path)) : null);

interface Planned {
  writes: Write[];
  contents: Map<string, Buffer>;
}

/** The writes that take each path from what is on disk now to the given bytes. */
const plan = (wb: Workbench, targets: Record<string, string | Buffer>): Planned => {
  const writes: Write[] = [];
  const contents = new Map<string, Buffer>();
  for (const [path, next] of Object.entries(targets)) {
    const bytes = typeof next === "string" ? Buffer.from(next, "utf-8") : next;
    const current = bytesAt(wb, path);
    writes.push({ path, before: current === null ? null : revisionOf(current), after: revisionOf(bytes) });
    contents.set(path, bytes);
  }
  return { writes, contents };
};

const REQUEST = {
  op: "transition",
  operation_id: OP_ID,
  record: { path: OPEN },
  expected_revision: "sha256:" + "1".repeat(64),
  actor: { kind: "user", person: "kai" },
  to: "paused",
  reason: "a test",
};

const RESPONSE: Response = { ok: true, result: { operation_id: OP_ID, marker: "the intent's response" } };

const intentOf = (planned: Planned, id = OP_ID): Intent => ({
  operation_id: id,
  op: "transition",
  request_digest: requestDigest({ ...REQUEST, operation_id: id }),
  writes: planned.writes,
  response: RESPONSE,
  created_at: "2026-09-29T09:00:00.000Z",
});

const commit = (wb: Workbench, planned: Planned, id = OP_ID): Intent => {
  const intent = intentOf(planned, id);
  const c = commitIntent(wb, intent, planned.contents);
  if (!c.ok) throw new Error(`${c.error.reason}: ${c.error.detail}`);
  return intent;
};

const journalEntries = (wb: Workbench): string[] => (existsSync(journalDir(wb)) ? readdirSync(journalDir(wb)).sort() : []);

/** The package with its status changed, as a writer would produce it (bytes need not be canonical here). */
const pausedPackage = (wb: Workbench): string => readFileSync(join(wb.root, OPEN), "utf-8").replace('"status": "open"', '"status": "paused"');

// --- the request digest --------------------------------------------------------------

describe("the request digest", () => {
  it("canonical sorts keys at every level; the digest is sha256 over its UTF-8 bytes, so key order never matters", () => {
    expect(canonical({ b: 1, a: { d: [2, { f: 1, e: 0 }], c: null } })).toBe('{"a":{"c":null,"d":[2,{"e":0,"f":1}]},"b":1}');
    const shuffled = Object.fromEntries(Object.entries(REQUEST).reverse());
    expect(requestDigest(shuffled)).toBe(requestDigest(REQUEST));
    expect(requestDigest(REQUEST)).toBe(revisionOf(Buffer.from(canonical(REQUEST), "utf-8")));
    expect(requestDigest({ ...REQUEST, to: "open" })).not.toBe(requestDigest(REQUEST));
  });
});

// --- the intent ----------------------------------------------------------------------

describe("commitIntent and readIntents", () => {
  it("an intent commits as one directory, journal/<id>/, holding intent.json and one staged file per distinct post-bytes, and reads back whole", () => {
    const wb = fresh();
    const before = bytesAt(wb, OPEN);
    const planned = plan(wb, { [OPEN]: pausedPackage(wb), [NEW_NOTE]: "# a note\n" });
    const intent = commit(wb, planned);

    expect(journalEntries(wb)).toEqual([OP_ID]);
    const dir = join(journalDir(wb), OP_ID);
    expect(readdirSync(dir).sort()).toEqual([INTENT_FILE, ...planned.writes.map((w) => w.after.slice("sha256:".length))].sort());
    // Committing is not applying: no file of the operation has changed yet.
    expect(bytesAt(wb, OPEN)?.equals(before ?? Buffer.alloc(0))).toBe(true);
    expect(bytesAt(wb, NEW_NOTE)).toBeNull();
    // intent.json carries paths, hashes and the response, never a body.
    const text = readFileSync(join(dir, INTENT_FILE), "utf-8");
    expect(text).not.toContain("# a note");

    const read = readIntents(wb);
    expect(read.ok, JSON.stringify(read)).toBe(true);
    if (!read.ok) return;
    expect(read.value).toHaveLength(1);
    expect(read.value[0]?.intent).toEqual(intent);
    for (const [path, bytes] of planned.contents) expect(read.value[0]?.contents.get(path)?.equals(bytes)).toBe(true);
  });

  it("two writes with the same post-bytes share one staged file", () => {
    const wb = fresh();
    const planned = plan(wb, { [NEW_NOTE]: "same\n", "shared/issues/260929-0900-twin.md": "same\n" });
    commit(wb, planned);
    expect(readdirSync(join(journalDir(wb), OP_ID))).toHaveLength(2);
    const read = readIntents(wb);
    expect(read.ok && read.value[0]?.contents.size).toBe(2);
  });

  it("an existing journal/<id>/ is refused, never replaced", () => {
    const wb = fresh();
    commit(wb, plan(wb, { [NEW_NOTE]: "first\n" }));
    const snapshot = readFileSync(join(journalDir(wb), OP_ID, INTENT_FILE));
    const second = plan(wb, { [NEW_NOTE]: "second\n" });
    const c = commitIntent(wb, intentOf(second), second.contents);
    expect(c).toMatchObject({ ok: false, error: { class: "conflict", reason: "intent-exists" } });
    expect(readFileSync(join(journalDir(wb), OP_ID, INTENT_FILE)).equals(snapshot)).toBe(true);
    expect(journalEntries(wb)).toEqual([OP_ID]);
  });

  it("a control record whose post-bytes exceed the reader's cap is refused schema-invalid/too-large before anything is written", () => {
    const wb = fresh();
    const planned = plan(wb, { [NEW_NOTE]: "fine\n", [OPEN]: Buffer.alloc(MAX_RECORD_BYTES + 1, 0x20) });
    const c = commitIntent(wb, intentOf(planned), planned.contents);
    expect(c).toMatchObject({ ok: false, error: { class: "schema-invalid", reason: "too-large" } });
    if (!c.ok) expect(c.error.detail).toContain(OPEN);
    expect(journalEntries(wb)).toEqual([]);
  });

  it("an intent staging a narrative of 1 MiB less a few bytes commits, reads back and recovers, and its answer stays under the cap (C12)", () => {
    const wb = fresh();
    const big = Buffer.alloc(MAX_RECORD_BYTES - 16, 0x61);
    const planned = plan(wb, { [NEW_NOTE]: big, [OPEN]: pausedPackage(wb) });
    commit(wb, planned);
    expect(statSync(join(journalDir(wb), OP_ID, INTENT_FILE)).size).toBeLessThan(4_096);
    const read = readIntents(wb);
    expect(read.ok, JSON.stringify(read.ok ? null : read.error)).toBe(true);
    if (!read.ok || read.value[0] === undefined) return;
    expect(recover(wb, read.value[0])).toEqual({ landed: true });
    expect(bytesAt(wb, NEW_NOTE)?.equals(big)).toBe(true);
    expect(statSync(answerPath(wb, OP_ID)).size).toBeLessThan(MAX_RECORD_BYTES);
    const answer = readAnswer(wb, OP_ID);
    expect(answer.ok && answer.value?.response).toEqual(RESPONSE);
  });

  it("a committed intent with a staged file missing, or one whose bytes do not match its name, or an unreadable intent.json, is conflict/journal-unreadable naming it", () => {
    const cases: Array<[string, (dir: string, staged: string) => void]> = [
      ["staged file missing", (dir, staged) => unlinkSync(join(dir, staged))],
      ["staged bytes not matching the name", (dir, staged) => writeFileSync(join(dir, staged), "tampered\n")],
      ["intent.json not strict JSON", (dir) => writeFileSync(join(dir, INTENT_FILE), '{"operation_id": ')],
      ["intent.json not an intent", (dir) => writeFileSync(join(dir, INTENT_FILE), '{"operation_id": "x"}\n')],
      ["intent.json missing", (dir) => unlinkSync(join(dir, INTENT_FILE))],
    ];
    for (const [label, spoil] of cases) {
      const wb = fresh();
      const planned = plan(wb, { [NEW_NOTE]: "# a note\n" });
      commit(wb, planned);
      spoil(join(journalDir(wb), OP_ID), planned.writes[0]!.after.slice("sha256:".length));
      const read = readIntents(wb);
      expect(read, label).toMatchObject({ ok: false, error: { class: "conflict", reason: "journal-unreadable" } });
      if (!read.ok) expect(read.error.detail, label).toContain(`${STATE_DIR}/journal/${OP_ID}`);
    }
    const wb = fresh();
    mkdirSync(journalDir(wb), { recursive: true });
    writeFileSync(join(journalDir(wb), OP_ID), "a file where an intent directory belongs\n");
    expect(readIntents(wb)).toMatchObject({ ok: false, error: { reason: "journal-unreadable" } });
  });

  it("removeIntent takes the id out of journal/ and leaves nothing behind", () => {
    const wb = fresh();
    commit(wb, plan(wb, { [NEW_NOTE]: "# a note\n" }));
    removeIntent(wb, OP_ID);
    expect(journalEntries(wb)).toEqual([]);
  });
});

// --- the sweep -------------------------------------------------------------------------

describe("sweep", () => {
  it("dot-named entries in journal/ and ops/ are never parsed and never journal-unreadable, and the sweep deletes them (C11)", () => {
    const wb = fresh();
    const planned = plan(wb, { [NEW_NOTE]: "# a note\n" });
    commit(wb, planned, "11111111-1111-4111-8111-111111111111");
    const j = journalDir(wb);
    // A crash inside commitIntent before its rename: an uncommitted intent directory.
    mkdirSync(join(j, `.${OP_ID}.4242.abcd1234.tmp`));
    writeFileSync(join(j, `.${OP_ID}.4242.abcd1234.tmp`, INTENT_FILE), '{"half": ');
    // A crash inside removeIntent after its rename: a removed intent not yet deleted.
    mkdirSync(join(j, `.${OP_ID}.4242.abcd1234.done`));
    writeFileSync(join(j, `.${OP_ID}.4242.abcd1234.done`, INTENT_FILE), "garbage");
    // A temp file of replaceAtomically in either directory.
    writeFileSync(join(j, `.stray.4242.abcd1234.tmp`), "");
    mkdirSync(opsDir(wb), { recursive: true });
    writeFileSync(join(opsDir(wb), `.${OP_ID}.json.4242.abcd1234.tmp`), '{"half": ');

    const read = readIntents(wb);
    expect(read.ok, JSON.stringify(read)).toBe(true);
    expect(read.ok && read.value.map((p) => p.intent.operation_id)).toEqual(["11111111-1111-4111-8111-111111111111"]);

    const removed = sweep(wb);
    expect(removed).toHaveLength(4);
    expect(journalEntries(wb)).toEqual(["11111111-1111-4111-8111-111111111111"]);
    expect(readdirSync(opsDir(wb))).toEqual([]);
    expect(readIntents(wb).ok).toBe(true);
  });

  it("with no journal and no ops directory the sweep removes nothing", () => {
    expect(sweep(fresh())).toEqual([]);
  });
});

// --- the file state ------------------------------------------------------------------

describe("fileState", () => {
  it("post, pre and diverged, for both before forms, tested post first", () => {
    const wb = fresh();
    const stored = bytesAt(wb, OPEN)!;
    const next = Buffer.from(pausedPackage(wb));
    const w: Write = { path: OPEN, before: revisionOf(stored), after: revisionOf(next) };
    expect(fileState(wb, w)).toBe("pre");
    writeFileSync(join(wb.root, OPEN), next);
    expect(fileState(wb, w)).toBe("post");
    writeFileSync(join(wb.root, OPEN), "edited by hand\n");
    expect(fileState(wb, w)).toBe("diverged");
    unlinkSync(join(wb.root, OPEN));
    expect(fileState(wb, w), "absent where the write expects a file is diverged").toBe("diverged");

    const created: Write = { path: NEW_NOTE, before: null, after: revisionOf(Buffer.from("# a note\n")) };
    expect(fileState(wb, created), "absent where the write creates the file is pre").toBe("pre");
    mkdirSync(join(wb.root, "work-packages/260928-1200-parser-fix/notes"), { recursive: true });
    writeFileSync(join(wb.root, NEW_NOTE), "# a note\n");
    expect(fileState(wb, created)).toBe("post");
    writeFileSync(join(wb.root, NEW_NOTE), "someone else's note\n");
    expect(fileState(wb, created), "present where the write creates the file, with other bytes").toBe("diverged");
  });

  it("a no-op write (post-bytes equal to pre-bytes) reads post, so it is never rewritten", () => {
    const wb = fresh();
    const stored = bytesAt(wb, ISSUE)!;
    expect(fileState(wb, { path: ISSUE, before: revisionOf(stored), after: revisionOf(stored) })).toBe("post");
  });
});

// --- recovery -------------------------------------------------------------------------

describe("recover", () => {
  const landedIn = (wb: Workbench, planned: Planned): void => {
    for (const [path, bytes] of planned.contents) expect(bytesAt(wb, path)?.equals(bytes), path).toBe(true);
    expect(journalEntries(wb)).toEqual([]);
    const answer = readAnswer(wb, OP_ID);
    expect(answer.ok && answer.value).toEqual({ operation_id: OP_ID, op: "transition", request_digest: requestDigest(REQUEST), response: RESPONSE });
  };

  it("a one-write intent recovers from every prefix of landed writes (none, the one)", () => {
    for (const landed of [0, 1]) {
      const wb = fresh();
      const planned = plan(wb, { [OPEN]: pausedPackage(wb) });
      commit(wb, planned);
      applyWrites(wb, planned.writes.slice(0, landed), planned.contents);
      const read = readIntents(wb);
      if (!read.ok || read.value[0] === undefined) throw new Error("no intent read back");
      expect(recover(wb, read.value[0]), `${landed} landed`).toEqual({ landed: true });
      landedIn(wb, planned);
    }
  });

  it("a two-write intent recovers from every prefix of landed writes (none, first only, both), creating the parent directory", () => {
    for (const landed of [0, 1, 2]) {
      const wb = fresh();
      const planned = plan(wb, { [NEW_NOTE]: "# a note\n", [OPEN]: pausedPackage(wb) });
      commit(wb, planned);
      applyWrites(wb, planned.writes.slice(0, landed), planned.contents);
      const read = readIntents(wb);
      if (!read.ok || read.value[0] === undefined) throw new Error("no intent read back");
      expect(recover(wb, read.value[0]), `${landed} landed`).toEqual({ landed: true });
      landedIn(wb, planned);
    }
  });

  it("an intent whose answer already exists writes nothing and is removed", () => {
    const wb = fresh();
    const planned = plan(wb, { [OPEN]: pausedPackage(wb) });
    commit(wb, planned);
    applyWrites(wb, planned.writes, planned.contents);
    const earlier: Response = { ok: true, result: { stored: "before the crash" } };
    writeAnswer(wb, { operation_id: OP_ID, op: "transition", request_digest: requestDigest(REQUEST), response: earlier });
    const answerBytes = readFileSync(answerPath(wb, OP_ID));
    const old = Date.now() / 1000 - 3_600;
    utimesSync(join(wb.root, OPEN), old, old);
    const mtime = statSync(join(wb.root, OPEN)).mtimeMs;

    const read = readIntents(wb);
    if (!read.ok || read.value[0] === undefined) throw new Error("no intent read back");
    expect(recover(wb, read.value[0])).toEqual({ landed: true });
    expect(readFileSync(answerPath(wb, OP_ID)).equals(answerBytes)).toBe(true);
    expect(statSync(join(wb.root, OPEN)).mtimeMs).toBe(mtime);
    expect(journalEntries(wb)).toEqual([]);
  });

  it("a diverged file blocks: the file, the other files and the intent stay as they are, no answer is written, the path is reported", () => {
    const wb = fresh();
    const stored = bytesAt(wb, OPEN)!;
    const planned = plan(wb, { [NEW_NOTE]: "# a note\n", [OPEN]: pausedPackage(wb) });
    commit(wb, planned);
    writeFileSync(join(wb.root, OPEN), stored.toString("utf-8").replace('"status": "open"', '"status": "dropped"'));
    const edited = readFileSync(join(wb.root, OPEN));
    const intentBytes = readFileSync(join(journalDir(wb), OP_ID, INTENT_FILE));

    const read = readIntents(wb);
    if (!read.ok || read.value[0] === undefined) throw new Error("no intent read back");
    const r = recover(wb, read.value[0]);
    expect(r).toEqual({ landed: false, blocked: [planned.writes[1]] });
    expect(readFileSync(join(wb.root, OPEN)).equals(edited)).toBe(true);
    expect(bytesAt(wb, NEW_NOTE), "a write at pre is not applied while another is diverged").toBeNull();
    expect(readFileSync(join(journalDir(wb), OP_ID, INTENT_FILE)).equals(intentBytes)).toBe(true);
    expect(existsSync(answerPath(wb, OP_ID))).toBe(false);
  });

  it("a file restored by hand to its pre-bytes after a partial landing is rolled forward", () => {
    const wb = fresh();
    const stored = bytesAt(wb, OPEN)!;
    const planned = plan(wb, { [OPEN]: pausedPackage(wb), [NEW_NOTE]: "# a note\n" });
    commit(wb, planned);
    applyWrites(wb, planned.writes.slice(0, 1), planned.contents);
    writeFileSync(join(wb.root, OPEN), stored);
    const read = readIntents(wb);
    if (!read.ok || read.value[0] === undefined) throw new Error("no intent read back");
    expect(recover(wb, read.value[0])).toEqual({ landed: true });
    landedIn(wb, planned);
  });
});

// --- the stored answer -------------------------------------------------------------------

describe("the stored answer", () => {
  it("is {operation_id, op, request_digest, response}: no request body, and it replays by digest", () => {
    const wb = fresh();
    writeAnswer(wb, { operation_id: OP_ID, op: "transition", request_digest: requestDigest(REQUEST), response: RESPONSE });
    const parsed = strictParse(readFileSync(answerPath(wb, OP_ID)));
    expect(parsed.ok && Object.keys(parsed.value as object)).toEqual(["operation_id", "op", "request_digest", "response"]);
    expect(replayAnswer(wb, { ...REQUEST })).toEqual({ ok: true, value: RESPONSE });
    expect(replayAnswer(wb, { ...REQUEST, to: "dropped" })).toMatchObject({ ok: false, error: { class: "conflict", reason: "operation-id-reused" } });
    expect(replayAnswer(wb, { ...REQUEST, operation_id: "22222222-2222-4222-8222-222222222222" })).toEqual({ ok: true, value: null });
  });

  it("an answer in FJ01's form answers the identical request and refuses a different one", () => {
    const wb = fresh();
    const fj01Response: Response = { ok: true, result: { operation_id: OP_ID, path: OPEN, from: "open", to: "paused" }, revisions: { [OPEN]: "sha256:" + "2".repeat(64) } };
    mkdirSync(opsDir(wb), { recursive: true });
    // Exactly what `ops.ts` `transition` stores at FJ01: the whole request beside the response.
    writeFileSync(answerPath(wb, OP_ID), JSON.stringify({ operation_id: OP_ID, request: REQUEST, response: fj01Response }, null, 2) + "\n");
    const shuffled = Object.fromEntries(Object.entries(REQUEST).reverse()) as typeof REQUEST;
    expect(replayAnswer(wb, shuffled)).toEqual({ ok: true, value: fj01Response });
    expect(readAnswer(wb, OP_ID)).toMatchObject({ ok: true, value: { op: "transition", request_digest: requestDigest(REQUEST) } });
    expect(replayAnswer(wb, { ...REQUEST, reason: "another reason" })).toMatchObject({ ok: false, error: { class: "conflict", reason: "operation-id-reused" } });
  });

  it("an unreadable answer is conflict/operation-record-unreadable", () => {
    const wb = fresh();
    mkdirSync(opsDir(wb), { recursive: true });
    writeFileSync(answerPath(wb, OP_ID), '{"operation_id": ');
    expect(readAnswer(wb, OP_ID)).toMatchObject({ ok: false, error: { class: "conflict", reason: "operation-record-unreadable" } });
    writeFileSync(answerPath(wb, OP_ID), '{"operation_id": "x"}\n');
    expect(readAnswer(wb, OP_ID)).toMatchObject({ ok: false, error: { class: "conflict", reason: "operation-record-unreadable" } });
  });
});
