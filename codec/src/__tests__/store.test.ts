// ---------------------------------------------------------------------------
// The record-pair store over the scratch workbench.
//
// Every case copies `fixtures/workbench/` to a fresh temp directory first and
// never writes into `codec/fixtures/`: the fixture is the one both hosts read,
// and a test that mutated it would change what the next test reads. The
// serialisation cases read the valid fixtures in place, which is a read.
// ---------------------------------------------------------------------------

import { createHash } from "node:crypto";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, unlinkSync, utimesSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { strictParse } from "../strict-json.js";
import {
  LOCK_STALE_MS,
  STATE_DIR,
  lockPathFor,
  openWorkbench,
  readPair,
  revisionOf,
  serialise,
  writeControl,
  type Workbench,
} from "../store.js";

const FIXTURE = fileURLToPath(new URL("../../fixtures/workbench/", import.meta.url));
const VALID = fileURLToPath(new URL("../../fixtures/valid/", import.meta.url));
const OPEN = "work-packages/260928-1200-parser-fix/package.json";
const DONE = "work-packages/260927-0900-strict-reader/package.json";
const ISSUE = "shared/issues/260928-1400-parser-fails-on-empty-input.record.json";

const sha = (bytes: Uint8Array): string => "sha256:" + createHash("sha256").update(bytes).digest("hex");

let root: string;
beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), "codec-store-"));
  cpSync(FIXTURE, root, { recursive: true });
});
afterEach(() => {
  rmSync(root, { recursive: true, force: true });
});

const open = (): Workbench => {
  const r = openWorkbench(root);
  if (!r.ok) throw new Error(`${r.error.class}/${r.error.reason}: ${r.error.detail}`);
  return r.value;
};

const control = (path: string): Record<string, unknown> => {
  const p = strictParse(readFileSync(join(root, path)));
  if (!p.ok) throw new Error(p.detail);
  return p.value as Record<string, unknown>;
};

// --- openWorkbench --------------------------------------------------------------

describe("openWorkbench", () => {
  it("the scratch workbench is under JSON control and carries the manifest id", () => {
    const wb = open();
    expect(wb.state).toBe("json-control");
    expect(wb.id).toBe("5d6d15ba-5b44-45b2-8aa2-39dd3bf82964");
    expect(wb.diagnosis).toBeNull();
    expect(wb.root).toBe(root);
  });

  it("without workbench.json the workbench is legacy: readable, not mutable (spec 4.1)", async () => {
    unlinkSync(join(root, "workbench.json"));
    const wb = open();
    expect(wb.state).toBe("legacy");
    expect(wb.manifest).toBeNull();
    const pair = readPair(wb, OPEN);
    expect(pair.ok).toBe(true);
    if (!pair.ok) return;
    const w = await writeControl(wb, OPEN, pair.value.control, pair.value.revision);
    expect(w).toMatchObject({ ok: false, error: { class: "unsupported-format", reason: "legacy-workbench" } });
  });

  it("an unknown manifest schema is unsupported-format/unknown-schema, with the raw manifest attached", () => {
    writeFileSync(join(root, "workbench.json"), readFileSync(join(VALID, "..", "invalid", "workbench", "schema-namespace-unknown.json")));
    const wb = open();
    expect(wb.state).toBe("unsupported");
    expect(wb.diagnosis).toMatchObject({ class: "unsupported-format", reason: "unknown-schema" });
    expect(wb.manifest).not.toBeNull();
  });

  it("a required feature this codec lacks is unsupported-format/unknown-feature", () => {
    writeFileSync(join(root, "workbench.json"), readFileSync(join(VALID, "workbench", "extra-feature.json")));
    const wb = open();
    expect(wb.state).toBe("unsupported");
    expect(wb.diagnosis).toMatchObject({ class: "unsupported-format", reason: "unknown-feature" });
    expect(wb.diagnosis?.detail).toContain("json-control-v1");
  });

  it("an invalid manifest is schema-invalid/manifest-invalid; a manifest with a duplicate key names the strict reason", () => {
    writeFileSync(join(root, "workbench.json"), readFileSync(join(VALID, "..", "invalid", "workbench", "id-not-uuid.json")));
    expect(open().diagnosis).toMatchObject({ class: "schema-invalid", reason: "manifest-invalid" });
    writeFileSync(join(root, "workbench.json"), '{"schema": "fusion.workbench/v1", "schema": "x"}\n');
    expect(open().diagnosis).toMatchObject({ class: "schema-invalid", reason: "duplicate-key" });
  });

  it("a root that is not a directory is unknown-scope/workbench-missing", () => {
    expect(openWorkbench(join(root, "absent"))).toMatchObject({ ok: false, error: { class: "unknown-scope", reason: "workbench-missing" } });
    expect(openWorkbench(join(root, "workbench.json"))).toMatchObject({ ok: false, error: { class: "unknown-scope" } });
  });
});

// --- readPair -------------------------------------------------------------------

describe("readPair", () => {
  it("a package pair: kind, control, the revision of the stored bytes, the narrative and its hash", () => {
    const wb = open();
    const r = readPair(wb, OPEN);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.value.kind).toBe("package");
    expect(r.value.schemaId).toBe("urn:fusion:schema:fusion.package/v1");
    expect(r.value.control.status).toBe("open");
    expect(r.value.revision).toBe(sha(readFileSync(join(root, OPEN))));
    expect(r.value.narrative).toEqual({
      path: "work-packages/260928-1200-parser-fix/260928-1200-parser-fix.md",
      sha256: sha(readFileSync(join(root, "work-packages/260928-1200-parser-fix/260928-1200-parser-fix.md"))),
    });
  });

  it("a record pair: the kind comes from the control's kind field", () => {
    const r = readPair(open(), ISSUE);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.value.kind).toBe("issue");
    expect(r.value.narrative?.sha256).toMatch(/^sha256:[0-9a-f]{64}$/);
  });

  it("a narrative the record names but the tree lacks reads as sha256 null", () => {
    unlinkSync(join(root, "shared/issues/260928-1400-parser-fails-on-empty-input.md"));
    const r = readPair(open(), ISSUE);
    expect(r.ok && r.value.narrative).toEqual({ path: "shared/issues/260928-1400-parser-fails-on-empty-input.md", sha256: null });
  });

  it("a missing record is unresolved-reference/record-not-found", () => {
    expect(readPair(open(), "work-packages/absent/package.json")).toMatchObject({ ok: false, error: { class: "unresolved-reference", reason: "record-not-found" } });
  });

  it("a path that leaves the workbench, or is absolute, is unknown-scope", () => {
    const wb = open();
    expect(readPair(wb, "../package.json")).toMatchObject({ ok: false, error: { class: "unknown-scope", reason: "path-outside-workbench" } });
    expect(readPair(wb, join(root, OPEN))).toMatchObject({ ok: false, error: { class: "unknown-scope", reason: "path-not-relative" } });
    expect(readPair(wb, "work-packages/../../x.json")).toMatchObject({ ok: false, error: { class: "unknown-scope" } });
  });

  it("a conflict-marker file is refused by the strict reader as schema-invalid/syntax (spec 6: Konfliktmarker sind ungültige Records)", () => {
    const text = readFileSync(join(root, OPEN), "utf-8");
    const marked = text.replace('"status": "open"', '<<<<<<< HEAD\n  "status": "open"\n=======\n  "status": "claimed"\n>>>>>>> other');
    writeFileSync(join(root, OPEN), marked);
    const r = readPair(open(), OPEN);
    expect(r).toMatchObject({ ok: false, error: { class: "schema-invalid", reason: "syntax" } });
  });

  it("a control without a schema field, with an unknown schema, or of a non-pair schema, is named as such", () => {
    const wb = open();
    writeFileSync(join(root, OPEN), '{"id": "x"}\n');
    expect(readPair(wb, OPEN)).toMatchObject({ ok: false, error: { class: "schema-invalid", reason: "schema-field-missing" } });
    writeFileSync(join(root, OPEN), '{"schema": "fusion.package/v9"}\n');
    expect(readPair(wb, OPEN)).toMatchObject({ ok: false, error: { class: "unsupported-format", reason: "unknown-schema" } });
    writeFileSync(join(root, OPEN), readFileSync(join(VALID, "campaign", "minimal.json")));
    expect(readPair(wb, OPEN)).toMatchObject({ ok: false, error: { class: "unsupported-format", reason: "not-a-pair-kind" } });
  });
});

// --- serialise -----------------------------------------------------------------

describe("serialise", () => {
  const files = readdirSync(VALID, { withFileTypes: true })
    .filter((d) => d.isDirectory() && d.name !== "protocol")
    .flatMap((d) => readdirSync(join(VALID, d.name)).map((f) => `${d.name}/${f}`))
    .sort();

  it("covers every valid record fixture", () => {
    expect(files.length).toBeGreaterThan(30);
  });

  for (const rel of files) {
    it(`${rel} is byte-identical to its own serialisation`, () => {
      const bytes = readFileSync(join(VALID, rel));
      const p = strictParse(bytes);
      expect(p.ok).toBe(true);
      if (!p.ok) return;
      expect(serialise(p.value)).toBe(bytes.toString("utf-8"));
    });
  }

  it("orders keys by the schema's properties, recursively, and keeps unnamed keys in arrival order", () => {
    const v = control(DONE);
    const shuffled = {
      extensions: { zeta: 1, alpha: 2 },
      claim: { claimed_at: "2026-09-28T13:41:00+02:00", person: "kai", checkout_id: "a216a4b9" },
      status: "done",
      schema: "fusion.package/v1",
      ...Object.fromEntries(Object.entries(v).filter(([k]) => !["extensions", "claim", "status", "schema"].includes(k))),
    };
    const out = serialise(shuffled);
    expect(Object.keys(JSON.parse(out) as object)).toEqual(Object.keys(v));
    expect(Object.keys((JSON.parse(out) as { claim: object }).claim)).toEqual(["checkout_id", "person", "claimed_at"]);
    expect(Object.keys((JSON.parse(out) as { extensions: object }).extensions)).toEqual(["zeta", "alpha"]);
    expect(out.endsWith("}\n")).toBe(true);
    expect(out.includes("\r")).toBe(false);
  });

  it("throws on a value without a known schema field", () => {
    expect(() => serialise({ id: 1 })).toThrow(/schema field/);
    expect(() => serialise({ schema: "fusion.nothing/v1" })).toThrow(/no schema/);
  });
});

// --- writeControl ----------------------------------------------------------------

describe("writeControl", () => {
  it("writes the deterministic bytes, returns their revision, and the record reads back", async () => {
    const wb = open();
    const before = readPair(wb, OPEN);
    if (!before.ok) throw new Error(before.error.detail);
    const next = { ...before.value.control, status: "paused" };
    const w = await writeControl(wb, OPEN, next, before.value.revision);
    expect(w.ok, JSON.stringify(w)).toBe(true);
    if (!w.ok) return;
    const stored = readFileSync(join(root, OPEN));
    expect(w.value.revision).toBe(sha(stored));
    expect(w.value.revision).not.toBe(before.value.revision);
    expect(stored.toString("utf-8")).toBe(serialise(next));
    const after = readPair(wb, OPEN);
    expect(after.ok && after.value.control.status).toBe("paused");
    expect(after.ok && after.value.revision).toBe(w.value.revision);
  });

  it("write, read, write again: identical bytes and the same revision", async () => {
    const wb = open();
    const first = readPair(wb, OPEN);
    if (!first.ok) throw new Error(first.error.detail);
    const w1 = await writeControl(wb, OPEN, { ...first.value.control, status: "paused" }, first.value.revision);
    if (!w1.ok) throw new Error(w1.error.detail);
    const second = readPair(wb, OPEN);
    if (!second.ok) throw new Error(second.error.detail);
    const w2 = await writeControl(wb, OPEN, second.value.control, second.value.revision);
    if (!w2.ok) throw new Error(w2.error.detail);
    expect(w2.value.revision).toBe(w1.value.revision);
    expect(readFileSync(join(root, OPEN)).equals(w1.value.bytes)).toBe(true);
  });

  it("refuses conflict/revision-mismatch when the stored bytes are not the ones read, and leaves the file alone", async () => {
    const wb = open();
    const pair = readPair(wb, OPEN);
    if (!pair.ok) throw new Error(pair.error.detail);
    const stale = "sha256:" + "0".repeat(64);
    const w = await writeControl(wb, OPEN, { ...pair.value.control, status: "paused" }, stale);
    expect(w).toMatchObject({ ok: false, error: { class: "conflict", reason: "revision-mismatch" } });
    if (w.ok) return;
    expect(w.error.detail).toBe(`stored ${pair.value.revision} expected ${stale}`);
    expect(readFileSync(join(root, OPEN)).equals(pair.value.bytes)).toBe(true);
    expect(readdirSync(join(root, "work-packages/260928-1200-parser-fix")).filter((f) => f.endsWith(".tmp"))).toEqual([]);
  });

  it("a second writer with the revision the first one replaced is refused", async () => {
    const wb = open();
    const pair = readPair(wb, OPEN);
    if (!pair.ok) throw new Error(pair.error.detail);
    const a = await writeControl(wb, OPEN, { ...pair.value.control, status: "paused" }, pair.value.revision);
    expect(a.ok).toBe(true);
    const b = await writeControl(wb, OPEN, { ...pair.value.control, status: "dropped" }, pair.value.revision);
    expect(b).toMatchObject({ ok: false, error: { class: "conflict", reason: "revision-mismatch" } });
  });

  it("a missing record under the lock is unresolved-reference", async () => {
    const wb = open();
    const pair = readPair(wb, OPEN);
    if (!pair.ok) throw new Error(pair.error.detail);
    const w = await writeControl(wb, "work-packages/absent/package.json", pair.value.control, pair.value.revision);
    expect(w).toMatchObject({ ok: false, error: { class: "unresolved-reference", reason: "record-not-found" } });
  });

  it("takes the lock under .json-state/, and releases it after the write", async () => {
    const wb = open();
    const pair = readPair(wb, OPEN);
    if (!pair.ok) throw new Error(pair.error.detail);
    const lock = lockPathFor(wb, OPEN);
    expect(lock.startsWith(join(root, STATE_DIR) + "/")).toBe(true);
    expect(lock.endsWith(".lock")).toBe(true);
    const w = await writeControl(wb, OPEN, pair.value.control, pair.value.revision);
    expect(w.ok).toBe(true);
    expect(existsSync(lock)).toBe(false);
    expect(existsSync(join(root, STATE_DIR))).toBe(true);
  });

  it("waits on a live lock and proceeds once it is released", async () => {
    const wb = open();
    const pair = readPair(wb, OPEN);
    if (!pair.ok) throw new Error(pair.error.detail);
    const lock = lockPathFor(wb, OPEN);
    mkdirSync(dirname(lock), { recursive: true });
    writeFileSync(lock, `pid: ${process.pid}\nacquired_at: ${new Date().toISOString()}\n`, { flag: "wx" });
    const started = Date.now();
    const pending = writeControl(wb, OPEN, { ...pair.value.control, status: "paused" }, pair.value.revision, { pollMs: 10 });
    await new Promise((r) => setTimeout(r, 300));
    expect(readFileSync(join(root, OPEN)).equals(pair.value.bytes), "wrote through a live lock").toBe(true);
    unlinkSync(lock);
    const w = await pending;
    expect(w.ok, JSON.stringify(w)).toBe(true);
    expect(Date.now() - started).toBeGreaterThanOrEqual(250);
    expect(existsSync(lock)).toBe(false);
  });

  it("answers conflict/lock-timeout when a live lock is never released", async () => {
    const wb = open();
    const pair = readPair(wb, OPEN);
    if (!pair.ok) throw new Error(pair.error.detail);
    const lock = lockPathFor(wb, OPEN);
    mkdirSync(dirname(lock), { recursive: true });
    writeFileSync(lock, `pid: ${process.pid}\nacquired_at: ${new Date().toISOString()}\n`, { flag: "wx" });
    const w = await writeControl(wb, OPEN, pair.value.control, pair.value.revision, { waitMs: 100, pollMs: 10 });
    expect(w).toMatchObject({ ok: false, error: { class: "conflict", reason: "lock-timeout" } });
    expect(existsSync(lock), "the timeout must not steal the lock").toBe(true);
    unlinkSync(lock);
  });

  it(`reaps a lock older than ${LOCK_STALE_MS / 1000} s by mtime whose holder is gone, and one that records no holder`, async () => {
    const wb = open();
    const pair = readPair(wb, OPEN);
    if (!pair.ok) throw new Error(pair.error.detail);
    const lock = lockPathFor(wb, OPEN);
    const old = (Date.now() - 2 * LOCK_STALE_MS) / 1000;
    mkdirSync(dirname(lock), { recursive: true });

    writeFileSync(lock, "", { flag: "wx" });
    utimesSync(lock, old, old);
    const w1 = await writeControl(wb, OPEN, { ...pair.value.control, status: "paused" }, pair.value.revision, { waitMs: 500, pollMs: 10 });
    expect(w1.ok, JSON.stringify(w1)).toBe(true);
    if (!w1.ok) return;

    // A dead holder: a pid no process has. 2^22 is above the default Linux
    // pid_max and macOS's limit, so `kill -0` on it is ESRCH.
    writeFileSync(lock, `pid: ${2 ** 22 + 1}\nacquired_at: 2026-01-01T00:00:00.000Z\n`, { flag: "wx" });
    utimesSync(lock, old, old);
    const w2 = await writeControl(wb, OPEN, { ...pair.value.control, status: "open" }, w1.value.revision, { waitMs: 500, pollMs: 10 });
    expect(w2.ok, JSON.stringify(w2)).toBe(true);
    expect(existsSync(lock)).toBe(false);
  });

  it("does not reap a lock that is old but whose holder is still running", async () => {
    const wb = open();
    const pair = readPair(wb, OPEN);
    if (!pair.ok) throw new Error(pair.error.detail);
    const lock = lockPathFor(wb, OPEN);
    const old = (Date.now() - 2 * LOCK_STALE_MS) / 1000;
    mkdirSync(dirname(lock), { recursive: true });
    writeFileSync(lock, `pid: ${process.pid}\nacquired_at: 2026-01-01T00:00:00.000Z\n`, { flag: "wx" });
    utimesSync(lock, old, old);
    const w = await writeControl(wb, OPEN, pair.value.control, pair.value.revision, { waitMs: 100, pollMs: 10 });
    expect(w).toMatchObject({ ok: false, error: { class: "conflict", reason: "lock-timeout" } });
    expect(existsSync(lock)).toBe(true);
    unlinkSync(lock);
  });

  it("the revision helper is sha256 over the exact bytes", () => {
    expect(revisionOf(Buffer.from("{}\n"))).toBe("sha256:" + createHash("sha256").update("{}\n").digest("hex"));
  });
});
