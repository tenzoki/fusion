// ---------------------------------------------------------------------------
// The record-pair store over the scratch workbench.
//
// Every case copies `fixtures/workbench/` to a fresh temp directory first and
// never writes into `codec/fixtures/`: the fixture is the one both hosts read,
// and a test that mutated it would change what the next test reads. The
// serialisation cases read the valid fixtures in place, which is a read.
// ---------------------------------------------------------------------------

import { execFileSync, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { chmodSync, cpSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, renameSync, rmSync, statSync, symlinkSync, unlinkSync, utimesSync, writeFileSync } from "node:fs";
import { hostname, tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { dispatch } from "../cli/ops.js";
import type { Response } from "../cli/protocol.js";
import type { KernelOptions } from "../kernel.js";
import { strictParse } from "../strict-json.js";
import {
  LOCK_FILE,
  LOCK_STALE_MS,
  SELF_IGNORE,
  STATE_DIR,
  TAKEOVER_INFIX,
  acquireLock,
  controlFiles,
  evidenceName,
  evidenceNaming,
  lockPathFor,
  lockProtocolOwns,
  openWorkbench,
  readPair,
  reportProblem,
  releaseLock,
  revisionOf,
  serialise,
  type HeldLock,
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

  // The refusal to mutate a legacy workbench is the kernel's: kernel.test.ts.
  it("without workbench.json the workbench is legacy and readable (spec 4.1)", () => {
    unlinkSync(join(root, "workbench.json"));
    const wb = open();
    expect(wb.state).toBe("legacy");
    expect(wb.manifest).toBeNull();
    const pair = readPair(wb, OPEN);
    expect(pair.ok).toBe(true);
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

  // Issue 260930-1654 (a directory named workbench.json): the bundle threw
  // EISDIR and exited 1. Every manifest entry is a value, never a throw.
  it("a workbench.json that is not a regular file is unsupported with schema-invalid/manifest-not-a-file: a directory, a dangling link", () => {
    unlinkSync(join(root, "workbench.json"));
    mkdirSync(join(root, "workbench.json"));
    const dir = open();
    expect(dir.state).toBe("unsupported");
    expect(dir.manifest).toBeNull();
    expect(dir.diagnosis).toMatchObject({ class: "schema-invalid", reason: "manifest-not-a-file" });
    rmSync(join(root, "workbench.json"), { recursive: true });
    symlinkSync(join(root, "nowhere.json"), join(root, "workbench.json"));
    expect(open().diagnosis).toMatchObject({ class: "schema-invalid", reason: "manifest-not-a-file" });
  });

  // Issue 261001-0841 (isRegularFile, request 41): only ENOENT, the dangling
  // link above, is not-a-file; any other stat failure names its own cause.
  it("a workbench.json whose kind cannot be examined is schema-invalid/manifest-unreadable with its error code: a link loop, a link through a denied directory", () => {
    unlinkSync(join(root, "workbench.json"));
    symlinkSync("workbench.json", join(root, "workbench.json"));
    const loop = open();
    expect(loop.state).toBe("unsupported");
    expect(loop.manifest).toBeNull();
    expect(loop.diagnosis).toMatchObject({ class: "schema-invalid", reason: "manifest-unreadable" });
    expect(loop.diagnosis?.detail).toContain("ELOOP");
    if (process.getuid?.() === 0) return; // root reads through a mode-000 directory
    unlinkSync(join(root, "workbench.json"));
    mkdirSync(join(root, "denied"));
    writeFileSync(join(root, "denied", "manifest.json"), "{}\n");
    symlinkSync(join(root, "denied", "manifest.json"), join(root, "workbench.json"));
    chmodSync(join(root, "denied"), 0o000);
    try {
      const denied = open();
      expect(denied.diagnosis).toMatchObject({ class: "schema-invalid", reason: "manifest-unreadable" });
      expect(denied.diagnosis?.detail).toContain("EACCES");
    } finally {
      chmodSync(join(root, "denied"), 0o755);
    }
  });

  it("a workbench.json linked to a regular manifest reads through the link, as before", () => {
    renameSync(join(root, "workbench.json"), join(root, "manifest.json"));
    symlinkSync(join(root, "manifest.json"), join(root, "workbench.json"));
    expect(open().state).toBe("json-control");
  });
});

describe("lockProtocolOwns: the lock protocol's own entries of .json-state/", () => {
  it("the lock, a takeover claim, the self-ignore holding exactly *, and the temp files the protocol writes for them", () => {
    const state = join(root, STATE_DIR);
    mkdirSync(state, { recursive: true });
    writeFileSync(join(state, ".gitignore"), SELF_IGNORE);
    expect(lockProtocolOwns(state, LOCK_FILE)).toBe(true);
    expect(lockProtocolOwns(state, `${LOCK_FILE}${TAKEOVER_INFIX}${"a".repeat(64)}`)).toBe(true);
    expect(lockProtocolOwns(state, ".gitignore")).toBe(true);
    expect(lockProtocolOwns(state, `.${LOCK_FILE}.4242.0a1b2c3d.tmp`)).toBe(true);
    expect(lockProtocolOwns(state, `.${LOCK_FILE}${TAKEOVER_INFIX}${"a".repeat(64)}.4242.0a1b2c3d.tmp`)).toBe(true);
    // The temp name is a dot before the target's own name, so the self-ignore's starts with two.
    expect(lockProtocolOwns(state, "..gitignore.4242.0a1b2c3d.tmp")).toBe(true);
    expect(lockProtocolOwns(state, ".gitignore.4242.0a1b2c3d.tmp")).toBe(false);
  });

  it("a self-ignore with other bytes, a stranger's temp file, and any other name are not the protocol's", () => {
    const state = join(root, STATE_DIR);
    mkdirSync(state, { recursive: true });
    writeFileSync(join(state, ".gitignore"), "*.lock\n");
    expect(lockProtocolOwns(state, ".gitignore")).toBe(false);
    expect(lockProtocolOwns(state, ".workbench.json.4242.0a1b2c3d.tmp")).toBe(false);
    expect(lockProtocolOwns(state, `.${LOCK_FILE}.tmp`)).toBe(false);
    expect(lockProtocolOwns(state, "journal")).toBe(false);
    expect(lockProtocolOwns(state, ".DS_Store")).toBe(false);
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

// --- evidence on disk (FJ02 step 7) ------------------------------------------------

describe("evidence records: the kind, the report, the naming rule", () => {
  const DIR = "work-packages/260928-1200-parser-fix/reviews";
  const EVIDENCE = `${DIR}/260929-1200-review.evidence.json`;
  const REPORT = `${DIR}/260929-1200-review.md`;
  const REPORT_BYTES = Buffer.from("# Review\n\nVerdict: accept.\n", "utf-8");
  /** The valid fixture as an evidence record of this workbench, naming `reportPath` at the hash of REPORT_BYTES, written at `at`. */
  const writeEvidence = (at: string, reportPath: string): void => {
    const fixture = strictParse(readFileSync(join(VALID, "evidence", "accept-prior-enforced.json")));
    if (!fixture.ok) throw new Error(fixture.detail);
    const record = { ...(fixture.value as Record<string, unknown>), report: { path: reportPath, sha256: sha(REPORT_BYTES), kind: "review" } };
    mkdirSync(join(root, dirname(at)), { recursive: true });
    writeFileSync(join(root, at), serialise(record));
  };
  const pairAt = (path: string) => {
    const r = readPair(open(), path);
    if (!r.ok) throw new Error(`${r.error.class}/${r.error.reason}: ${r.error.detail}`);
    return r.value;
  };

  it("readPair reads a fusion.evidence/v1 file as kind evidence: no narrative, and the report's path, named hash and hash on disk", () => {
    writeEvidence(EVIDENCE, REPORT);
    writeFileSync(join(root, REPORT), REPORT_BYTES);
    const pair = pairAt(EVIDENCE);
    expect(pair.kind).toBe("evidence");
    expect(pair.schemaId).toBe("urn:fusion:schema:fusion.evidence/v1");
    expect(pair.narrative).toBeNull();
    expect(pair.report).toEqual({ path: REPORT, sha256: sha(REPORT_BYTES), stored: sha(REPORT_BYTES) });
    expect(pair.revision).toBe(sha(readFileSync(join(root, EVIDENCE))));
    // Every other kind carries no report.
    expect(pairAt(OPEN).report).toBeNull();
    expect(pairAt(ISSUE).report).toBeNull();
  });

  it("the report's hash on disk is null when nothing stands there, and differs from the named one after an edit", () => {
    writeEvidence(EVIDENCE, REPORT);
    expect(pairAt(EVIDENCE).report?.stored).toBeNull();
    expect(reportProblem(pairAt(EVIDENCE))).toMatchObject({ class: "unresolved-reference", reason: "report-missing" });
    writeFileSync(join(root, REPORT), "# Review, edited\n");
    expect(pairAt(EVIDENCE).report?.stored).toBe(sha(Buffer.from("# Review, edited\n")));
    expect(reportProblem(pairAt(EVIDENCE))).toMatchObject({ class: "missing-evidence", reason: "report-changed" });
    writeFileSync(join(root, REPORT), REPORT_BYTES);
    expect(reportProblem(pairAt(EVIDENCE))).toBeNull();
  });

  it("every name ending .evidence.json has one reading: a last segment from 2 is the correction counter, anything else the basename's", () => {
    expect(evidenceName(`${DIR}/260929-1200-review.evidence.json`)).toEqual({ basename: "260929-1200-review", correction: null, report: `${DIR}/260929-1200-review.md` });
    expect(evidenceName(`${DIR}/260929-1200-review.2.evidence.json`)).toEqual({ basename: "260929-1200-review", correction: 2, report: `${DIR}/260929-1200-review.md` });
    expect(evidenceName(`${DIR}/260929-1200-review.10.evidence.json`)).toMatchObject({ basename: "260929-1200-review", correction: 10 });
    expect(evidenceName(`${DIR}/260929-1200-review.1.evidence.json`)).toMatchObject({ basename: "260929-1200-review.1", correction: null });
    expect(evidenceName(`${DIR}/260929-1200-review.02.evidence.json`)).toMatchObject({ basename: "260929-1200-review.02", correction: null });
    expect(evidenceName("review.evidence.json")).toEqual({ basename: "review", correction: null, report: "review.md" });
    expect(evidenceName(`${DIR}/260929-1200-review.record.json`)).toBeNull();
  });

  it("the naming rule (C2): report.path must name the neighbouring <basename>.md; a correction names the same report", () => {
    const cases: Array<[string, string, string | null]> = [
      ["the first record, its neighbour", EVIDENCE, null],
      ["a correction, the same report", `${DIR}/260929-1200-review.2.evidence.json`, null],
      ["a report in another directory", EVIDENCE, "report-not-neighbour"],
      ["a report of another basename", EVIDENCE, "report-not-neighbour"],
      ["an evidence record under a record's name", `${DIR}/260929-1200-review.record.json`, "report-not-neighbour"],
    ];
    const reports = [REPORT, REPORT, `shared/reviews/260929-1200-review.md`, `${DIR}/260929-1300-other.md`, REPORT];
    cases.forEach(([label, at, reason], i) => {
      writeEvidence(at, reports[i] as string);
      const problem = evidenceNaming(pairAt(at));
      if (reason === null) expect(problem, label).toBeNull();
      else expect(problem, label).toMatchObject({ class: "unknown-scope", reason });
      unlinkSync(join(root, at));
    });
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

// --- the revision ------------------------------------------------------------------
//
// The CAS and lock cases that drove FJ01's `writeControl` moved to
// kernel.test.ts with the function's removal (FJ02 step 3): the kernel is the
// one write path, so they are asserted through it.

describe("revisionOf", () => {
  it("the revision helper is sha256 over the exact bytes", () => {
    expect(revisionOf(Buffer.from("{}\n"))).toBe("sha256:" + createHash("sha256").update("{}\n").digest("hex"));
  });
});

// --- the workbench write lock ----------------------------------------------------------

/** A PID that belonged to a process of this host and is dead now: a child that has exited. */
const deadPid = (): number => {
  const child = spawnSync(process.execPath, ["-e", ""]);
  if (typeof child.pid !== "number") throw new Error("could not spawn a child to borrow a dead PID from");
  return child.pid;
};

const hex = (bytes: Uint8Array): string => createHash("sha256").update(bytes).digest("hex");
const stateEntries = (): string[] => readdirSync(join(root, STATE_DIR)).sort();
const takeoverClaims = (): string[] => stateEntries().filter((n) => n.startsWith(`${LOCK_FILE}${TAKEOVER_INFIX}`));
const hourAgo = (): number => (Date.now() - 3_600_000) / 1000;

let opSeq = 0;
/**
 * A write through the kernel, the one write path since FJ01's `writeControl`
 * was removed (FJ02 step 3): the open package moved to `paused` under its
 * current revision, with the lock options given.
 */
const pauseOpen = (kernel: KernelOptions = {}, wbRoot: string = root): Promise<Response> =>
  dispatch(
    {
      op: "transition",
      workbench: wbRoot,
      operation_id: `00000000-0000-4000-8000-${String(++opSeq).padStart(12, "0")}`,
      record: { path: OPEN },
      expected_revision: sha(readFileSync(join(wbRoot, OPEN))),
      actor: { actor: "user", person: "kai" },
      to: "paused",
      reason: "a lock test",
    },
    { kernel },
  );

interface Deferred {
  promise: Promise<void>;
  resolve: () => void;
}
const deferred = (): Deferred => {
  let resolve!: () => void;
  const promise = new Promise<void>((r) => (resolve = r));
  return { promise, resolve };
};

describe("the workbench write lock", () => {
  it("is one file for the workbench, .json-state/write.lock, and records pid, host, nonce and time", async () => {
    const wb = open();
    expect(lockPathFor(wb)).toBe(join(root, STATE_DIR, LOCK_FILE));
    const l = await acquireLock(wb);
    expect(l.ok, JSON.stringify(l)).toBe(true);
    if (!l.ok) return;
    const text = readFileSync(lockPathFor(wb), "utf-8");
    expect(text).toMatch(new RegExp(`^pid: ${process.pid}\\nhost: ${hostname().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\nnonce: [0-9a-f]{16}\\nacquired_at: \\S+\\n$`));
    expect(l.value.bytes.equals(readFileSync(lockPathFor(wb)))).toBe(true);
    releaseLock(l.value);
    expect(existsSync(lockPathFor(wb))).toBe(false);
    expect(stateEntries().filter((n) => n.endsWith(".tmp")), "no temp file survives an acquisition").toEqual([]);
  });

  it("a lock of this host whose PID is dead is replaced at once, with no age condition (C9)", async () => {
    const wb = open();
    const lock = lockPathFor(wb);
    mkdirSync(dirname(lock), { recursive: true });
    // Fresh mtime: under FJ01's rule this lock blocked every writer for 60 s.
    writeFileSync(lock, `pid: ${deadPid()}\nhost: ${hostname()}\nnonce: 00\nacquired_at: ${new Date().toISOString()}\n`, { flag: "wx" });
    const started = Date.now();
    const w = await pauseOpen({ waitMs: 2_000, pollMs: 10 });
    expect(w.ok, JSON.stringify(w)).toBe(true);
    expect(Date.now() - started).toBeLessThan(2_000);
    expect(existsSync(lock)).toBe(false);
    expect(takeoverClaims()).toEqual([]);
  });

  it("FJ01's lock content with a dead PID and a fresh mtime (no host line: read as this host's) is replaced at once too", async () => {
    const wb = open();
    const lock = lockPathFor(wb);
    mkdirSync(dirname(lock), { recursive: true });
    writeFileSync(lock, `pid: ${deadPid()}\nacquired_at: ${new Date().toISOString()}\n`, { flag: "wx" });
    const w = await pauseOpen({ waitMs: 2_000, pollMs: 10 });
    expect(w.ok, JSON.stringify(w)).toBe(true);
  });

  // Port of Prior's `TestCodecDoesNotReapAnOldLockWhoseOwnerIsAlive`
  // (F09-Prior `internal/fusionhost/codec_process_test.go`), which must stay
  // green: FJ01's lock content (a live PID, no host line) with an mtime an hour
  // old, now at `write.lock`. The codec waits until its deadline, never reaps,
  // and leaves the lock's bytes and the record unchanged (C21).
  it("Prior's live-owner regression: an hour-old lock whose PID is alive is waited on and never replaced", async () => {
    const wb = open();
    const pair = readPair(wb, OPEN);
    if (!pair.ok) throw new Error(pair.error.detail);
    const lock = lockPathFor(wb);
    mkdirSync(dirname(lock), { recursive: true });
    const content = `pid: ${process.pid}\nacquired_at: ${new Date(Date.now() - 3_600_000).toISOString()}\n`;
    writeFileSync(lock, content, { flag: "wx" });
    utimesSync(lock, hourAgo(), hourAgo());
    const started = Date.now();
    const w = await pauseOpen({ waitMs: 300, pollMs: 10 });
    expect(w).toMatchObject({ ok: false, error: { class: "conflict", reason: "lock-timeout" } });
    expect(Date.now() - started).toBeGreaterThanOrEqual(300);
    expect(readFileSync(lock, "utf-8")).toBe(content);
    expect(readFileSync(join(root, OPEN)).equals(pair.value.bytes)).toBe(true);
    unlinkSync(lock);
  });

  it("a lock naming another host is never replaced, whatever its PID and age, and the timeout names the host", async () => {
    const wb = open();
    const lock = lockPathFor(wb);
    mkdirSync(dirname(lock), { recursive: true });
    const content = `pid: ${deadPid()}\nhost: other-checkout.invalid\nnonce: 00\nacquired_at: 2026-01-01T00:00:00.000Z\n`;
    writeFileSync(lock, content, { flag: "wx" });
    utimesSync(lock, hourAgo(), hourAgo());
    const w = await pauseOpen({ waitMs: 200, pollMs: 10 });
    expect(w).toMatchObject({ ok: false, error: { class: "conflict", reason: "lock-timeout" } });
    if (!w.ok) expect(w.error.detail).toContain("host: other-checkout.invalid");
    expect(readFileSync(lock, "utf-8")).toBe(content);
    expect(takeoverClaims()).toEqual([]);
  });

  it(`a lock recording no PID is waited on while young and replaced once older than ${LOCK_STALE_MS / 1000} s`, async () => {
    const wb = open();
    const lock = lockPathFor(wb);
    mkdirSync(dirname(lock), { recursive: true });
    writeFileSync(lock, "acquired_at: 2026-01-01T00:00:00.000Z\n", { flag: "wx" });
    const young = await pauseOpen({ waitMs: 150, pollMs: 10 });
    expect(young).toMatchObject({ ok: false, error: { class: "conflict", reason: "lock-timeout" } });
    expect(existsSync(lock)).toBe(true);
    const old = (Date.now() - 2 * LOCK_STALE_MS) / 1000;
    utimesSync(lock, old, old);
    const w = await pauseOpen({ waitMs: 1_000, pollMs: 10 });
    expect(w.ok, JSON.stringify(w)).toBe(true);
    expect(existsSync(lock)).toBe(false);
  });

  it("the takeover race (C10): two waiters judge one stale lock; exactly one holds, in either order, and a third that finds the name free never overlaps", async () => {
    const wb = open();
    const lock = lockPathFor(wb);
    mkdirSync(dirname(lock), { recursive: true });

    for (const [first, second] of [
      ["a", "b"],
      ["b", "a"],
    ] as const) {
      writeFileSync(lock, `pid: ${deadPid()}\nhost: ${hostname()}\nnonce: ${first}\nacquired_at: 2026-01-01T00:00:00.000Z\n`, { flag: "wx" });
      let holders = 0;
      let most = 0;
      const took = (l: HeldLock): HeldLock => {
        holders++;
        most = Math.max(most, holders);
        return l;
      };
      const give = (l: HeldLock): void => {
        holders--;
        releaseLock(l);
      };
      const entered = { a: deferred(), b: deferred() };
      const gate = { a: deferred(), b: deferred() };
      const judgedBytes: Record<string, Buffer> = {};
      const acquirer = async (name: "a" | "b"): Promise<HeldLock> => {
        let paused = false;
        const l = await acquireLock(wb, {
          waitMs: 5_000,
          pollMs: 5,
          lockHooks: {
            afterJudge: async ({ bytes }) => {
              if (paused) return;
              paused = true;
              judgedBytes[name] = bytes;
              entered[name].resolve();
              await gate[name].promise;
            },
          },
        });
        if (!l.ok) throw new Error(`${l.error.reason}: ${l.error.detail}`);
        return took(l.value);
      };

      const pFirst = acquirer(first);
      const pSecond = acquirer(second);
      let secondHolds = false;
      void pSecond.then(() => (secondHolds = true));
      await Promise.all([entered.a.promise, entered.b.promise]);
      expect(judgedBytes.a?.equals(judgedBytes.b ?? Buffer.alloc(0)), "both judged the same stale instance").toBe(true);

      gate[first].resolve();
      const lFirst = await pFirst;
      expect(holders).toBe(1);
      expect(readFileSync(lock).equals(lFirst.bytes)).toBe(true);
      give(lFirst);

      // The name is free: a third acquirer takes it by the ordinary exclusive create.
      const third = await acquireLock(wb, { waitMs: 1_000, pollMs: 5 });
      if (!third.ok) throw new Error(third.error.detail);
      const lThird = took(third.value);

      gate[second].resolve();
      await new Promise((r) => setTimeout(r, 150));
      expect(secondHolds, "the second waiter replaced a lock it did not judge").toBe(false);
      expect(readFileSync(lock).equals(lThird.bytes)).toBe(true);
      give(lThird);

      const lSecond = await pSecond;
      expect(readFileSync(lock).equals(lSecond.bytes)).toBe(true);
      give(lSecond);

      expect(most, `order ${first} then ${second}`).toBe(1);
      expect(existsSync(lock)).toBe(false);
      expect(takeoverClaims()).toEqual([]);
    }
  });

  it("a takeover claim whose own holder is dead is taken over one level up", async () => {
    const wb = open();
    const lock = lockPathFor(wb);
    mkdirSync(dirname(lock), { recursive: true });
    const stale = Buffer.from(`pid: ${deadPid()}\nhost: ${hostname()}\nnonce: 01\nacquired_at: 2026-01-01T00:00:00.000Z\n`);
    writeFileSync(lock, stale, { flag: "wx" });
    // A waiter that died holding the claim on that instance.
    writeFileSync(`${lock}${TAKEOVER_INFIX}${hex(stale)}`, `pid: ${deadPid()}\nhost: ${hostname()}\nnonce: 02\nacquired_at: 2026-01-01T00:00:00.000Z\n`, { flag: "wx" });
    const l = await acquireLock(wb, { waitMs: 1_000, pollMs: 5 });
    expect(l.ok, JSON.stringify(l)).toBe(true);
    if (!l.ok) return;
    expect(readFileSync(lock).equals(l.value.bytes)).toBe(true);
    expect(takeoverClaims()).toEqual([]);
    releaseLock(l.value);
  });

  it("a leftover claim naming a replaced instance neither blocks nor is honoured, and the next holder removes it with old temp files", async () => {
    const wb = open();
    const lock = lockPathFor(wb);
    const dir = dirname(lock);
    mkdirSync(dir, { recursive: true });
    // A live claim (this process) on an instance that is no longer at the name.
    const leftover = `${lock}${TAKEOVER_INFIX}${hex(Buffer.from("an instance replaced long ago"))}`;
    writeFileSync(leftover, `pid: ${process.pid}\nhost: ${hostname()}\nnonce: 03\nacquired_at: 2026-01-01T00:00:00.000Z\n`, { flag: "wx" });
    // The instance actually at the name is stale.
    writeFileSync(lock, `pid: ${deadPid()}\nhost: ${hostname()}\nnonce: 04\nacquired_at: 2026-01-01T00:00:00.000Z\n`, { flag: "wx" });
    const oldTemp = join(dir, `.${LOCK_FILE}.99999.deadbeef.tmp`);
    const youngTemp = join(dir, `.${LOCK_FILE}.99999.cafebabe.tmp`);
    writeFileSync(oldTemp, "x");
    writeFileSync(youngTemp, "x");
    const old = (Date.now() - 2 * LOCK_STALE_MS) / 1000;
    utimesSync(oldTemp, old, old);

    const l = await acquireLock(wb, { waitMs: 1_000, pollMs: 5 });
    expect(l.ok, JSON.stringify(l)).toBe(true);
    if (!l.ok) return;
    expect(existsSync(leftover), "the holder removes a claim on another instance").toBe(false);
    expect(existsSync(oldTemp), "a temp file older than LOCK_STALE_MS is dead").toBe(false);
    expect(existsSync(youngTemp), "a young temp file may belong to a live waiter").toBe(true);
    releaseLock(l.value);

    // With the name free, a leftover claim does not stand in the way either.
    writeFileSync(leftover, `pid: ${process.pid}\nhost: ${hostname()}\nnonce: 05\nacquired_at: 2026-01-01T00:00:00.000Z\n`, { flag: "wx" });
    const again = await acquireLock(wb, { waitMs: 200, pollMs: 5 });
    expect(again.ok, JSON.stringify(again)).toBe(true);
    if (!again.ok) return;
    expect(existsSync(leftover)).toBe(false);
    releaseLock(again.value);
    unlinkSync(youngTemp);
  });

  it("release leaves a lock that is no longer this instance alone", async () => {
    const wb = open();
    const l = await acquireLock(wb);
    if (!l.ok) throw new Error(l.error.detail);
    const other = `pid: ${process.pid}\nhost: ${hostname()}\nnonce: 06\nacquired_at: 2026-01-01T00:00:00.000Z\n`;
    writeFileSync(lockPathFor(wb), other);
    releaseLock(l.value);
    expect(readFileSync(lockPathFor(wb), "utf-8")).toBe(other);
    unlinkSync(lockPathFor(wb));
  });
});

// --- the self-ignore ----------------------------------------------------------------

describe("the self-ignore of .json-state/ (class L)", () => {
  const gitignore = (): string => join(root, STATE_DIR, ".gitignore");

  it("absent: every lock creates .json-state/.gitignore holding exactly *", async () => {
    const wb = open();
    expect(existsSync(join(root, STATE_DIR))).toBe(false);
    const l = await acquireLock(wb);
    if (!l.ok) throw new Error(l.error.detail);
    releaseLock(l.value);
    expect(readFileSync(gitignore(), "utf-8")).toBe(SELF_IGNORE);
    expect(SELF_IGNORE).toBe("*\n");
  });

  it("an empty or edited .gitignore is replaced with *", async () => {
    const wb = open();
    mkdirSync(join(root, STATE_DIR));
    for (const wrong of ["", "!*\n", "*"]) {
      writeFileSync(gitignore(), wrong);
      const l = await acquireLock(wb);
      if (!l.ok) throw new Error(l.error.detail);
      releaseLock(l.value);
      expect(readFileSync(gitignore(), "utf-8")).toBe(SELF_IGNORE);
    }
  });

  it("a correct .gitignore is left alone: nothing is written", async () => {
    const wb = open();
    mkdirSync(join(root, STATE_DIR));
    writeFileSync(gitignore(), SELF_IGNORE);
    utimesSync(gitignore(), hourAgo(), hourAgo());
    const before = statSync(gitignore()).mtimeMs;
    const l = await acquireLock(wb);
    if (!l.ok) throw new Error(l.error.detail);
    releaseLock(l.value);
    expect(statSync(gitignore()).mtimeMs).toBe(before);
  });

  it("a .json-state/ created without it (by the FJ01 bundle, by Prior's regression) gains it at the first lock", async () => {
    const wb = open();
    mkdirSync(join(root, STATE_DIR, "ops"), { recursive: true });
    writeFileSync(join(root, STATE_DIR, "ops", "00000000-0000-4000-8000-000000000000.json"), "{}\n");
    expect(existsSync(gitignore())).toBe(false);
    expect(wb.state).toBe("json-control");
    const w = await pauseOpen();
    expect(w.ok, JSON.stringify(w)).toBe(true);
    expect(readFileSync(gitignore(), "utf-8")).toBe(SELF_IGNORE);
  });

  it("in a git repository whose root .gitignore re-includes everything, nothing under .json-state/ is listed or added after a write (C3)", async () => {
    const repo = mkdtempSync(join(tmpdir(), "codec-selfignore-"));
    try {
      const git = (...args: string[]): string => execFileSync("git", args, { cwd: repo, encoding: "utf-8", env: { ...process.env, GIT_CONFIG_NOSYSTEM: "1" } });
      git("init", "-q");
      writeFileSync(join(repo, ".gitignore"), "!fusion-workbench/**\n!.json-state/\n!*.json\n");
      const wbRoot = join(repo, "fusion-workbench");
      cpSync(FIXTURE, wbRoot, { recursive: true });
      const w = await pauseOpen({}, wbRoot);
      expect(w.ok, JSON.stringify(w)).toBe(true);
      // The kernel's write left its stored answer under .json-state/ops/.
      // Something for git to see in there besides the .gitignore itself.
      mkdirSync(join(wbRoot, STATE_DIR, "ops"), { recursive: true });
      writeFileSync(join(wbRoot, STATE_DIR, "ops", "00000000-0000-4000-8000-000000000000.json"), "{}\n");

      const status = git("status", "--porcelain", "-uall");
      expect(status, "git sees the workbench at all").toContain(`fusion-workbench/${OPEN}`);
      expect(status.split("\n").filter((l) => l.includes(STATE_DIR))).toEqual([]);
      git("add", "-A");
      const staged = git("diff", "--cached", "--name-only").split("\n");
      expect(staged).toContain(`fusion-workbench/${OPEN}`);
      expect(staged.filter((l) => l.includes(STATE_DIR))).toEqual([]);
    } finally {
      rmSync(repo, { recursive: true, force: true });
    }
  });
});

// --- the walk -----------------------------------------------------------------------

describe("controlFiles", () => {
  it("walks packages, records and evidence records, skipping dot entries", () => {
    const wb = open();
    const before = controlFiles(wb, root);
    expect(before).toContain(OPEN);
    expect(before).toContain(ISSUE);
    writeFileSync(join(root, "shared", "issues", "260929-0800-a-review.evidence.json"), "{}\n");
    mkdirSync(join(root, STATE_DIR, "ops"), { recursive: true });
    writeFileSync(join(root, STATE_DIR, "ops", "x.record.json"), "{}\n");
    const after = controlFiles(wb, root);
    expect(after).toEqual([...before, "shared/issues/260929-0800-a-review.evidence.json"].sort());
  });
});
