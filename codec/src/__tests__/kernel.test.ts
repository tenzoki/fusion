// ---------------------------------------------------------------------------
// The operation kernel (FJ02 plan step 3): the mutation sequence at every cut,
// recovery in-process and through a spawned bundle, blocked intents and the
// replay of their ids, the lock through the kernel (the CAS and lock cases of
// FJ01's `writeControl`, moved here with its removal), concurrent and killed
// processes, a pull, and the read protocol's retries.
//
// Every case works on a fresh copy of `fixtures/workbench/`; nothing here
// writes into `codec/fixtures/`. The cuts are enumerated from the kernel's
// own `CUTS` through `cutsFor`, never from a hand-written list. Fault points
// are reached in-process only: the spawned cases run the committed bundle,
// which `main.ts` gives no fault options, except the one killed holder, which
// is a bundle of the kernel's own source built here with esbuild so that it
// can pause while holding the lock.
// ---------------------------------------------------------------------------

import { spawn, spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, renameSync, rmSync, statSync, unlinkSync, utimesSync, writeFileSync } from "node:fs";
import { hostname, tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";
import { afterEach, describe, expect, it } from "vitest";
import { dispatch } from "../cli/ops.js";
import type { Response, TransitionRequest } from "../cli/protocol.js";
import { commitIntent, journalDir, opsDir, pendingIds, requestDigest, type Intent, type Write } from "../journal.js";
import { CUTS, CutReached, cutsFor, mutate, read, type KernelOptions, type MutationRequest, type PlanFunction } from "../kernel.js";
import { LOCK_STALE_MS, STATE_DIR, lockPathFor, openWorkbench, revisionOf, serialise, type Workbench } from "../store.js";
import { strictParse } from "../strict-json.js";

const FIXTURE = fileURLToPath(new URL("../../fixtures/workbench/", import.meta.url));
const VALID = fileURLToPath(new URL("../../fixtures/valid/", import.meta.url));
const BUNDLE = fileURLToPath(new URL("../../dist/fusion-record.js", import.meta.url));
const SRC_DIR = fileURLToPath(new URL("../", import.meta.url));
const OPEN = "work-packages/260928-1200-parser-fix/package.json";
const ISSUE = "shared/issues/260928-1400-parser-fails-on-empty-input.record.json";
const OP_ID = "7a1f3b2e-5a4d-4e8f-9b0c-1d2e3f4a5b6c";
const OTHER_ID = "7b1f3b2e-5a4d-4e8f-9b0c-1d2e3f4a5b6c";
const CLAIM = { checkout_id: "a1b2c3d4", person: "kai", claimed_at: "2026-09-29T09:00:00+02:00" };
const ACTOR = { actor: "user", person: "kai" };

const roots: string[] = [];
/** Every process a case spawned: one a failing case left running (a holder pauses forever) is killed here. */
const spawned: Array<ReturnType<typeof spawn>> = [];
afterEach(() => {
  for (const c of spawned.splice(0)) if (c.exitCode === null && c.signalCode === null) c.kill("SIGKILL");
  for (const r of roots.splice(0)) rmSync(r, { recursive: true, force: true });
});

/** A fresh copy of the scratch workbench; its absolute root. */
const fresh = (): string => {
  const root = mkdtempSync(join(tmpdir(), "codec-kernel-"));
  roots.push(root);
  cpSync(FIXTURE, root, { recursive: true });
  return root;
};
const open = (root: string): Workbench => {
  const r = openWorkbench(root);
  if (!r.ok) throw new Error(r.error.detail);
  return r.value;
};
const bytesOf = (root: string, path: string): Buffer => readFileSync(join(root, path));
const revision = (root: string, path: string): string => revisionOf(bytesOf(root, path));
const controlOf = (root: string, path: string): Record<string, unknown> => {
  const p = strictParse(bytesOf(root, path));
  if (!p.ok) throw new Error(p.detail);
  return p.value as Record<string, unknown>;
};
const okResult = (r: Response): Record<string, unknown> => {
  expect(r.ok, JSON.stringify(r)).toBe(true);
  if (!r.ok) throw new Error("unreachable");
  return r.result as Record<string, unknown>;
};
const journalEntries = (root: string): string[] => (existsSync(join(root, STATE_DIR, "journal")) ? readdirSync(join(root, STATE_DIR, "journal")).sort() : []);
const opsEntries = (root: string): string[] => (existsSync(join(root, STATE_DIR, "ops")) ? readdirSync(join(root, STATE_DIR, "ops")).sort() : []);
/** Every file of a directory, by name, with its bytes: what "unchanged" is compared on. */
const dirBytes = (dir: string): Record<string, string> =>
  Object.fromEntries(readdirSync(dir).sort().map((n) => [n, readFileSync(join(dir, n)).toString("base64")]));

/** The open package claimed: the FJ01 transition, in this suite's ids. */
const claimRequest = (root: string, over: Partial<TransitionRequest> = {}): TransitionRequest => ({
  op: "transition",
  workbench: root,
  operation_id: OP_ID,
  record: { path: OPEN },
  expected_revision: revision(root, OPEN),
  actor: ACTOR,
  to: "claimed",
  reason: "FJ02 kernel test",
  payload: { claim: CLAIM },
  ...over,
});

interface Deferred<T = void> {
  promise: Promise<T>;
  resolve: (v: T) => void;
}
const deferred = <T = void>(): Deferred<T> => {
  let resolve!: (v: T) => void;
  const promise = new Promise<T>((r) => (resolve = r));
  return { promise, resolve };
};
const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

/** A PID that belonged to a process of this host and is dead now. */
const deadPid = (): number => {
  const child = spawnSync(process.execPath, ["-e", ""]);
  if (typeof child.pid !== "number") throw new Error("could not spawn a child to borrow a dead PID from");
  return child.pid;
};

// --- the fault points ------------------------------------------------------------------

describe("the cuts", () => {
  it("are enumerated from CUTS: one point per write between the intent and the answer", () => {
    expect(CUTS).toEqual(["after-intent", "after-write:<n>", "after-answer"]);
    expect(cutsFor(1)).toEqual(["after-intent", "after-write:0", "after-answer"]);
    expect(cutsFor(2)).toEqual(["after-intent", "after-write:0", "after-write:1", "after-answer"]);
  });
});

// --- the mutation sequence at every cut --------------------------------------------------

describe("a one-write transition cut at every point of CUTS", () => {
  for (const cut of cutsFor(1)) {
    it(`${cut}: show recovers the landed state; an identical retry returns the uncut answer; a divergent one is operation-id-reused; a fresh id on the old revision is revision-mismatch`, async () => {
      // The answer the uncut run returns, on a second copy.
      const clean = fresh();
      const cleanAnswer = await dispatch(claimRequest(clean));
      expect(cleanAnswer.ok, JSON.stringify(cleanAnswer)).toBe(true);

      const root = fresh();
      const req = claimRequest(root);
      const preRevision = req.expected_revision;
      await expect(dispatch(req, { kernel: { faults: { cutAt: cut } } })).rejects.toBeInstanceOf(CutReached);
      expect(journalEntries(root), "the intent is pending after the cut").toEqual([OP_ID]);
      expect(existsSync(lockPathFor(open(root))), "the cut released the lock").toBe(false);

      const shown = okResult(await dispatch({ op: "show", workbench: root, record: { path: OPEN } }));
      expect((shown.control as Record<string, unknown>).status).toBe("claimed");
      expect(shown.revision).toBe(revision(clean, OPEN));
      expect(journalEntries(root), "recovered: the intent left the journal").toEqual([]);
      expect(opsEntries(root)).toEqual([`${OP_ID}.json`]);

      const again = await dispatch(req);
      expect(JSON.stringify(again)).toBe(JSON.stringify(cleanAnswer));
      expect(await dispatch({ ...req, reason: "another reason" })).toMatchObject({ ok: false, error: { class: "conflict", reason: "operation-id-reused" } });
      expect(await dispatch({ ...req, operation_id: OTHER_ID, expected_revision: preRevision })).toMatchObject({
        ok: false,
        error: { class: "conflict", reason: "revision-mismatch", detail: `stored ${revision(clean, OPEN)} expected ${preRevision}` },
      });
      expect(bytesOf(root, OPEN).equals(bytesOf(clean, OPEN)), "executed once: the bytes of the uncut run").toBe(true);
    });
  }

  it("the lost answer (after-write:0): the record moved and no answer is stored; the identical retry is answered, not refused, and rewrites nothing", async () => {
    const root = fresh();
    const req = claimRequest(root);
    await expect(dispatch(req, { kernel: { faults: { cutAt: "after-write:0" } } })).rejects.toBeInstanceOf(CutReached);
    expect(controlOf(root, OPEN).status).toBe("claimed");
    expect(existsSync(join(root, STATE_DIR, "ops", `${OP_ID}.json`)), "the answer was lost with the process").toBe(false);
    const mtime = statSync(join(root, OPEN)).mtimeMs;
    const bytes = bytesOf(root, OPEN);

    // FJ01 answered this retry `revision-mismatch`: the record had moved and no answer existed.
    const retry = await dispatch(req);
    const result = okResult(retry);
    expect(result).toMatchObject({ operation_id: OP_ID, from: "open", to: "claimed", revision: revisionOf(bytes), previous_revision: req.expected_revision });
    expect(statSync(join(root, OPEN)).mtimeMs, "recovery found the file at its post-bytes").toBe(mtime);
    expect(bytesOf(root, OPEN).equals(bytes)).toBe(true);
    expect(await dispatch(req)).toEqual(retry);
  });

  it("a crash inside the intent's commit leaves a dot-temp directory in journal/; the next write sweeps it, and it is never journal-unreadable", async () => {
    const root = fresh();
    const temp = join(root, STATE_DIR, "journal", `.${OTHER_ID}.4242.deadbeef.tmp`);
    mkdirSync(temp, { recursive: true });
    writeFileSync(join(temp, "intent.json"), "{ half written");
    mkdirSync(join(root, STATE_DIR, "ops"), { recursive: true });
    writeFileSync(join(root, STATE_DIR, "ops", `.${OTHER_ID}.json.4242.deadbeef.tmp`), "{");
    const r = await dispatch(claimRequest(root));
    expect(r.ok, JSON.stringify(r)).toBe(true);
    expect(journalEntries(root)).toEqual([]);
    expect(opsEntries(root)).toEqual([`${OP_ID}.json`]);
  });

  it("a crash inside the intent's removal leaves a dot-named directory; the next write sweeps it and lands, and the first operation still replays", async () => {
    const root = fresh();
    const req = claimRequest(root);
    await expect(dispatch(req, { kernel: { faults: { cutAt: "after-answer" } } })).rejects.toBeInstanceOf(CutReached);
    const first = JSON.parse(readFileSync(join(root, STATE_DIR, "ops", `${OP_ID}.json`), "utf-8")) as { response: Response };
    // The removal's rename happened; its deletion did not.
    renameSync(join(root, STATE_DIR, "journal", OP_ID), join(root, STATE_DIR, "journal", `.${OP_ID}.4242.cafebabe.done`));
    const release = await dispatch({ ...claimRequest(root), operation_id: OTHER_ID, to: "open", payload: {} });
    expect(release.ok, JSON.stringify(release)).toBe(true);
    expect(journalEntries(root)).toEqual([]);
    expect(await dispatch(req)).toEqual(first.response);
  });
});

// --- a two-write create at every cut -------------------------------------------------------

const NEW_NARRATIVE = "work-packages/260929-0900-journal-recovery/260929-0900-journal-recovery.md";
const NEW_CONTROL = "work-packages/260929-0900-journal-recovery/package.json";

/** A package with its Markdown body: two writes in one intent, the narrative first. */
const createRequest = (root: string, over: Record<string, unknown> = {}): Record<string, unknown> & MutationRequest => ({
  op: "create",
  workbench: root,
  operation_id: OP_ID,
  id: "3b8e1f4a-6c2d-4e7f-9a1b-2c3d4e5f6a7b",
  kind: "package",
  filed_by: ACTOR,
  origin: { kind: "user-request", ref: null },
  scope: { container: null, store: "work-packages" },
  narrative: { path: NEW_NARRATIVE, content: "# Journal recovery\n\nAn interrupted operation is recovered from what is on disk alone.\n" },
  payload: { domain: "code" },
  ...over,
});

describe("a two-write create cut at every point of CUTS", () => {
  /** What each cut leaves before any recovery: [narrative, control] present. */
  const leftBehind = (cut: string): [boolean, boolean] => (cut === "after-intent" ? [false, false] : cut === "after-write:0" ? [true, false] : [true, true]);

  for (const cut of cutsFor(2)) {
    it(`${cut}: no half pair survives a recovery; an identical retry returns the uncut answer; a divergent one is operation-id-reused; a fresh id is record-exists`, async () => {
      const clean = fresh();
      const cleanAnswer = await dispatch(createRequest(clean));
      expect(cleanAnswer.ok, JSON.stringify(cleanAnswer)).toBe(true);

      const root = fresh();
      const req = createRequest(root);
      await expect(dispatch(req, { kernel: { faults: { cutAt: cut } } })).rejects.toBeInstanceOf(CutReached);
      expect(journalEntries(root), "the intent is pending after the cut").toEqual([OP_ID]);
      expect([existsSync(join(root, NEW_NARRATIVE)), existsSync(join(root, NEW_CONTROL))], "the narrative is written first").toEqual(leftBehind(cut));

      // A read recovers: the whole pair, at the bytes the uncut run wrote.
      const listed = okResult(await dispatch({ op: "list", workbench: root, scope: "work-packages" }));
      expect((listed.records as Array<{ path: string }>).map((r) => r.path)).toContain(NEW_CONTROL);
      expect(journalEntries(root), "recovered: the intent left the journal").toEqual([]);
      for (const path of [NEW_NARRATIVE, NEW_CONTROL]) expect(bytesOf(root, path).equals(bytesOf(clean, path)), path).toBe(true);

      const again = await dispatch(req);
      expect(JSON.stringify(again)).toBe(JSON.stringify(cleanAnswer));
      expect(await dispatch({ ...req, payload: { domain: "data" } })).toMatchObject({ ok: false, error: { class: "conflict", reason: "operation-id-reused" } });
      expect(await dispatch({ ...req, operation_id: OTHER_ID })).toMatchObject({ ok: false, error: { class: "conflict", reason: "record-exists" } });
      for (const path of [NEW_NARRATIVE, NEW_CONTROL]) expect(bytesOf(root, path).equals(bytesOf(clean, path)), `${path}: created once`).toBe(true);
    });
  }
});

// --- recovery through a real process ------------------------------------------------------

describe("recovery through the committed bundle", () => {
  it("a hand-written pending intent over two files, one landed and one not, is recovered by a spawned show", () => {
    const root = fresh();
    const wb = open(root);
    const paused = Buffer.from(serialise({ ...controlOf(root, OPEN), status: "paused" }), "utf-8");
    const issue = controlOf(root, ISSUE);
    const inProgress = Buffer.from(serialise({ ...issue, control: { ...(issue.control as object), state: "in_progress" } }), "utf-8");
    const writes: Write[] = [
      { path: OPEN, before: revision(root, OPEN), after: revisionOf(paused) },
      { path: ISSUE, before: revision(root, ISSUE), after: revisionOf(inProgress) },
    ];
    const response: Response = { ok: true, result: { hand: "written" } };
    const intent: Intent = { operation_id: OP_ID, op: "transition", request_digest: requestDigest({ op: "transition", note: "hand-written" }), writes, response, created_at: "2026-09-29T09:00:00.000Z" };
    const c = commitIntent(
      wb,
      intent,
      new Map([
        [OPEN, paused],
        [ISSUE, inProgress],
      ]),
    );
    if (!c.ok) throw new Error(c.error.detail);
    writeFileSync(join(root, OPEN), paused); // the first write landed, the second did not

    const { FUSION_WORKBENCH: _drop, ...env } = process.env;
    const run = spawnSync(process.execPath, [BUNDLE], { input: JSON.stringify({ op: "show", workbench: root, record: { path: ISSUE } }), encoding: "utf-8", env });
    expect(run.status, run.stderr).toBe(0);
    const shown = JSON.parse(run.stdout) as Response;
    const result = okResult(shown);
    expect((result.control as { control: { state: string } }).control.state).toBe("in_progress");
    expect(result.revision).toBe(revisionOf(inProgress));
    expect(bytesOf(root, OPEN).equals(paused)).toBe(true);
    expect(journalEntries(root)).toEqual([]);
    const stored = JSON.parse(readFileSync(join(root, STATE_DIR, "ops", `${OP_ID}.json`), "utf-8")) as Record<string, unknown>;
    expect(stored).toEqual({ operation_id: OP_ID, op: "transition", request_digest: intent.request_digest, response });
  });
});

// --- a diverged file blocks ------------------------------------------------------------------

/** The open package's claim cut after its intent, then OPEN edited by hand: an intent blocked on OPEN. */
const blockOpen = async (root: string): Promise<{ req: TransitionRequest; pre: Buffer; edited: Buffer; intent: Record<string, string> }> => {
  const pre = bytesOf(root, OPEN);
  const req = claimRequest(root);
  await expect(dispatch(req, { kernel: { faults: { cutAt: "after-intent" } } })).rejects.toBeInstanceOf(CutReached);
  const edited = Buffer.from(pre.toString("utf-8").replace('"domain": "code"', '"domain": "data"'), "utf-8");
  expect(edited.equals(pre)).toBe(false);
  writeFileSync(join(root, OPEN), edited);
  return { req, pre, edited, intent: dirBytes(join(root, STATE_DIR, "journal", OP_ID)) };
};

describe("a file edited by hand under a pending intent", () => {
  it("blocks: the record is untouched, show answers recovery-blocked, a mutation of it is refused, and one of another record lands", async () => {
    const root = fresh();
    const { edited } = await blockOpen(root);

    const shown = await dispatch({ op: "show", workbench: root, record: { path: OPEN } });
    expect(shown).toMatchObject({ ok: false, error: { class: "operation-unknown", reason: "recovery-blocked" } });
    if (!shown.ok) {
      expect(shown.error.detail).toContain(OP_ID);
      expect(shown.error.detail).toContain(OPEN);
    }
    expect(bytesOf(root, OPEN).equals(edited)).toBe(true);

    const move = await dispatch({ ...claimRequest(root), operation_id: OTHER_ID, to: "paused", payload: {} });
    expect(move).toMatchObject({ ok: false, error: { class: "operation-unknown", reason: "recovery-blocked" } });
    expect(bytesOf(root, OPEN).equals(edited), "never overwritten").toBe(true);

    const issueMove = await dispatch({ ...claimRequest(root), operation_id: "7c1f3b2e-5a4d-4e8f-9b0c-1d2e3f4a5b6c", record: { path: ISSUE }, expected_revision: revision(root, ISSUE), to: "in_progress", payload: {} });
    expect(issueMove.ok, JSON.stringify(issueMove)).toBe(true);
    expect(journalEntries(root), "the blocked intent stays").toEqual([OP_ID]);

    const listed = okResult(await dispatch({ op: "list", workbench: root })).records as Array<Record<string, unknown>>;
    expect(listed.find((r) => r.path === OPEN)?.problem).toMatchObject({ class: "operation-unknown", reason: "recovery-blocked" });
    expect(listed.find((r) => r.path === ISSUE)?.status).toBe("in_progress");
    const validated = okResult(await dispatch({ op: "validate", workbench: root }));
    expect(validated.valid).toBe(false);
    expect((validated.findings as Array<Record<string, unknown>>).filter((f) => f.reason === "recovery-blocked").map((f) => f.path)).toEqual([OPEN]);
  });

  it("a request reusing the blocked intent's id: the same request is recovery-blocked, a different one operation-id-reused, and the intent's bytes are unchanged (C13)", async () => {
    const root = fresh();
    const { req, intent } = await blockOpen(root);
    const same = await dispatch(req);
    expect(same).toMatchObject({ ok: false, error: { class: "operation-unknown", reason: "recovery-blocked" } });
    if (!same.ok) expect(same.error.detail).toContain(OPEN);
    // A different request under the id, on another record: FJ01 would have written it over the half-landed one.
    const other = await dispatch({ ...req, record: { path: ISSUE }, expected_revision: revision(root, ISSUE), to: "in_progress", payload: {} });
    expect(other).toMatchObject({ ok: false, error: { class: "conflict", reason: "operation-id-reused" } });
    expect(dirBytes(join(root, STATE_DIR, "journal", OP_ID))).toEqual(intent);
    expect(controlOf(root, ISSUE).control).toMatchObject({ state: "open" });
  });

  it("the first hand correction: the file restored to its pre-bytes is rolled forward by the next request", async () => {
    const root = fresh();
    const { req, pre } = await blockOpen(root);
    writeFileSync(join(root, OPEN), pre);
    expect(controlOf(root, OPEN).status).toBe("open");
    const again = await dispatch(req);
    expect(okResult(again)).toMatchObject({ from: "open", to: "claimed", revision: revision(root, OPEN) });
    expect(controlOf(root, OPEN).status).toBe("claimed");
    expect(journalEntries(root)).toEqual([]);
  });

  it("the second: the intent directory deleted by hand accepts what landed", async () => {
    const root = fresh();
    const { edited } = await blockOpen(root);
    rmSync(join(root, STATE_DIR, "journal", OP_ID), { recursive: true });
    const shown = okResult(await dispatch({ op: "show", workbench: root, record: { path: OPEN } }));
    expect(shown.revision).toBe(revisionOf(edited));
  });

  it("with that intent blocked and write.lock held by a live process, reads answer without the lock while a write waits (C22)", async () => {
    const root = fresh();
    await blockOpen(root);
    const lock = lockPathFor(open(root));
    const content = `pid: ${process.pid}\nhost: ${hostname()}\nnonce: 00\nacquired_at: ${new Date().toISOString()}\n`;
    writeFileSync(lock, content, { flag: "wx" });
    const kernel: KernelOptions = { waitMs: 300, pollMs: 10 };

    const started = Date.now();
    const shown = await dispatch({ op: "show", workbench: root, record: { path: ISSUE } }, { kernel });
    expect(shown.ok, JSON.stringify(shown)).toBe(true);
    expect(Date.now() - started, "answered without waiting on the lock").toBeLessThan(300);
    expect(await dispatch({ op: "show", workbench: root, record: { path: OPEN } }, { kernel })).toMatchObject({ ok: false, error: { reason: "recovery-blocked" } });
    expect(okResult(await dispatch({ op: "list", workbench: root }, { kernel })).records).toHaveLength(3);
    expect(readFileSync(lock, "utf-8")).toBe(content);

    const write = await dispatch({ ...claimRequest(root), operation_id: OTHER_ID, record: { path: ISSUE }, expected_revision: revision(root, ISSUE), to: "in_progress", payload: {} }, { kernel });
    expect(write).toMatchObject({ ok: false, error: { class: "conflict", reason: "lock-timeout" } });
    unlinkSync(lock);
  });
});

// --- the CAS and the lock through the kernel (FJ01's writeControl cases, moved) --------------

let seq = 0;
const nextId = (): string => `10000000-0000-4000-8000-${String(++seq).padStart(12, "0")}`;

/** A plan function that replaces one control record with `value` under `expected`: what `writeControl` did, as a plan. */
const writePlan =
  (path: string, value: Record<string, unknown>, expected: string): PlanFunction =>
  (ctx) => {
    const r = ctx.readPair(path);
    if (!r.ok) return r;
    const cas = ctx.cas(r.value, expected);
    if (!cas.ok) return cas;
    const v = ctx.validateResult(r.value.schemaId, value, "the value is not a valid record");
    if (!v.ok) return v;
    const bytes = Buffer.from(serialise(value), "utf-8");
    return { ok: true, value: { writes: [{ path, bytes }], result: { path, revision: revisionOf(bytes) }, revisions: { [path]: revisionOf(bytes) } } };
  };

const write = (wb: Workbench, path: string, value: Record<string, unknown>, expected: string, options: KernelOptions = {}): Promise<Response> =>
  mutate(wb, { op: "test-write", operation_id: nextId(), path, expected } as MutationRequest, writePlan(path, value, expected), options);

describe("the kernel's compare-and-swap (moved from store.test.ts)", () => {
  it("writes the deterministic bytes, returns their revision, and the record reads back", async () => {
    const root = fresh();
    const wb = open(root);
    const before = revision(root, OPEN);
    const next = { ...controlOf(root, OPEN), status: "paused" };
    const w = await write(wb, OPEN, next, before);
    const result = okResult(w);
    expect(result.revision).toBe(revision(root, OPEN));
    expect(result.revision).not.toBe(before);
    expect(bytesOf(root, OPEN).toString("utf-8")).toBe(serialise(next));
    expect(controlOf(root, OPEN).status).toBe("paused");
  });

  it("write, read, write again: identical bytes and the same revision; the no-op write still lands its answer", async () => {
    const root = fresh();
    const wb = open(root);
    const w1 = okResult(await write(wb, OPEN, { ...controlOf(root, OPEN), status: "paused" }, revision(root, OPEN)));
    const w2 = okResult(await write(wb, OPEN, controlOf(root, OPEN), revision(root, OPEN)));
    expect(w2.revision).toBe(w1.revision);
    expect(opsEntries(root)).toHaveLength(2);
    expect(journalEntries(root)).toEqual([]);
  });

  it("refuses conflict/revision-mismatch when the stored bytes are not the ones read, and writes, stores and journals nothing", async () => {
    const root = fresh();
    const wb = open(root);
    const bytes = bytesOf(root, OPEN);
    const stale = "sha256:" + "0".repeat(64);
    const w = await write(wb, OPEN, { ...controlOf(root, OPEN), status: "paused" }, stale);
    expect(w).toMatchObject({ ok: false, error: { class: "conflict", reason: "revision-mismatch", detail: `stored ${revisionOf(bytes)} expected ${stale}` } });
    expect(bytesOf(root, OPEN).equals(bytes)).toBe(true);
    expect(readdirSync(join(root, "work-packages/260928-1200-parser-fix")).filter((f) => f.endsWith(".tmp"))).toEqual([]);
    expect(opsEntries(root)).toEqual([]);
    expect(journalEntries(root)).toEqual([]);
  });

  it("a second writer with the revision the first one replaced is refused", async () => {
    const root = fresh();
    const wb = open(root);
    const r0 = revision(root, OPEN);
    const control = controlOf(root, OPEN);
    expect((await write(wb, OPEN, { ...control, status: "paused" }, r0)).ok).toBe(true);
    expect(await write(wb, OPEN, { ...control, status: "open" }, r0)).toMatchObject({ ok: false, error: { class: "conflict", reason: "revision-mismatch" } });
  });

  it("a missing record under the lock is unresolved-reference", async () => {
    const root = fresh();
    const w = await write(open(root), "work-packages/absent/package.json", controlOf(root, OPEN), revision(root, OPEN));
    expect(w).toMatchObject({ ok: false, error: { class: "unresolved-reference", reason: "record-not-found" } });
  });

  it("a legacy workbench refuses mutation with unsupported-format/legacy-workbench; an unsupported manifest with its diagnosis", async () => {
    const root = fresh();
    const r0 = revision(root, OPEN);
    unlinkSync(join(root, "workbench.json"));
    expect(await write(open(root), OPEN, controlOf(root, OPEN), r0)).toMatchObject({ ok: false, error: { class: "unsupported-format", reason: "legacy-workbench" } });
    writeFileSync(join(root, "workbench.json"), readFileSync(join(VALID, "workbench", "extra-feature.json")));
    expect(await write(open(root), OPEN, controlOf(root, OPEN), r0)).toMatchObject({ ok: false, error: { class: "unsupported-format", reason: "unknown-feature" } });
    expect(existsSync(join(root, STATE_DIR)), "a refused mutation takes no lock").toBe(false);
  });
});

describe("the kernel's lock (moved from store.test.ts)", () => {
  const setLock = (root: string, content: string, ageMs = 0): string => {
    const lock = lockPathFor(open(root));
    mkdirSync(dirname(lock), { recursive: true });
    writeFileSync(lock, content, { flag: "wx" });
    if (ageMs > 0) utimesSync(lock, (Date.now() - ageMs) / 1000, (Date.now() - ageMs) / 1000);
    return lock;
  };

  it("takes the lock under .json-state/, and releases it after the write", async () => {
    const root = fresh();
    const wb = open(root);
    const lock = lockPathFor(wb);
    expect(lock).toBe(join(root, STATE_DIR, "write.lock"));
    expect((await write(wb, OPEN, controlOf(root, OPEN), revision(root, OPEN))).ok).toBe(true);
    expect(existsSync(lock)).toBe(false);
    expect(existsSync(join(root, STATE_DIR))).toBe(true);
  });

  it("waits on a live lock and proceeds once it is released", async () => {
    const root = fresh();
    const wb = open(root);
    const bytes = bytesOf(root, OPEN);
    const lock = setLock(root, `pid: ${process.pid}\nacquired_at: ${new Date().toISOString()}\n`);
    const started = Date.now();
    const pending = write(wb, OPEN, { ...controlOf(root, OPEN), status: "paused" }, revisionOf(bytes), { pollMs: 10 });
    await sleep(300);
    expect(bytesOf(root, OPEN).equals(bytes), "wrote through a live lock").toBe(true);
    unlinkSync(lock);
    const w = await pending;
    expect(w.ok, JSON.stringify(w)).toBe(true);
    expect(Date.now() - started).toBeGreaterThanOrEqual(250);
    expect(existsSync(lock)).toBe(false);
  });

  it("answers conflict/lock-timeout when a live lock is never released, and does not steal it", async () => {
    const root = fresh();
    const lock = setLock(root, `pid: ${process.pid}\nacquired_at: ${new Date().toISOString()}\n`);
    const w = await write(open(root), OPEN, controlOf(root, OPEN), revision(root, OPEN), { waitMs: 100, pollMs: 10 });
    expect(w).toMatchObject({ ok: false, error: { class: "conflict", reason: "lock-timeout" } });
    expect(existsSync(lock)).toBe(true);
    unlinkSync(lock);
  });

  it(`replaces a lock older than ${LOCK_STALE_MS / 1000} s that records no holder, and one whose holder is gone`, async () => {
    const root = fresh();
    const wb = open(root);
    const lock = setLock(root, "", 2 * LOCK_STALE_MS);
    const w1 = await write(wb, OPEN, { ...controlOf(root, OPEN), status: "paused" }, revision(root, OPEN), { waitMs: 500, pollMs: 10 });
    expect(w1.ok, JSON.stringify(w1)).toBe(true);
    setLock(root, `pid: ${deadPid()}\nacquired_at: 2026-01-01T00:00:00.000Z\n`, 2 * LOCK_STALE_MS);
    const w2 = await write(wb, OPEN, { ...controlOf(root, OPEN), status: "open" }, revision(root, OPEN), { waitMs: 500, pollMs: 10 });
    expect(w2.ok, JSON.stringify(w2)).toBe(true);
    expect(existsSync(lock)).toBe(false);
  });

  it("does not replace a lock that is old but whose holder is still running", async () => {
    const root = fresh();
    const lock = setLock(root, `pid: ${process.pid}\nacquired_at: 2026-01-01T00:00:00.000Z\n`, 2 * LOCK_STALE_MS);
    const w = await write(open(root), OPEN, controlOf(root, OPEN), revision(root, OPEN), { waitMs: 100, pollMs: 10 });
    expect(w).toMatchObject({ ok: false, error: { class: "conflict", reason: "lock-timeout" } });
    expect(existsSync(lock)).toBe(true);
    unlinkSync(lock);
  });
});

// --- processes: concurrent, killed, and Prior's live owner -------------------------------------

interface Ran {
  stdout: string;
  code: number | null;
  signal: NodeJS.Signals | null;
}

const { FUSION_WORKBENCH: _unset, ...baseEnv } = process.env;

/** Spawns `node <script> ...args` with `input` on stdin; `onSpawn` sees the child, for a kill. */
const runAsync = (args: string[], input: string, onSpawn?: (child: ReturnType<typeof spawn>) => void): Promise<Ran> =>
  new Promise((resolve, reject) => {
    const child = spawn(process.execPath, args, { env: baseEnv, stdio: ["pipe", "pipe", "pipe"] });
    spawned.push(child);
    let stdout = "";
    child.stdout.on("data", (c: Buffer) => (stdout += c.toString("utf-8")));
    child.on("error", reject);
    child.on("close", (code, signal) => resolve({ stdout, code, signal }));
    child.stdin.end(input);
    onSpawn?.(child);
  });

/**
 * A process that takes the workbench write lock through the kernel and
 * pauses there: a bundle of the kernel's own source with a fault point, built
 * here, since the shipped bundle has no path to one.
 */
const HOLDER = `
import { writeFileSync } from "node:fs";
import { installInlined } from "./cli/schemas.js";
import { mutate } from "./kernel.js";
import { openWorkbench } from "./store.js";
installInlined();
const [root, ready] = process.argv.slice(2);
const wb = openWorkbench(root);
if (!wb.ok) throw new Error(wb.error.detail);
const alive = setInterval(() => {}, 60_000);
const r = await mutate(wb.value, { op: "transition", operation_id: "${OTHER_ID}" }, () => { throw new Error("never planned"); }, {
  faults: { pause: async (point) => { if (point === "locked") { writeFileSync(ready, String(process.pid)); await new Promise(() => {}); } } },
});
// Reached only when the mutation never took the lock: say why, and end.
process.stdout.write(JSON.stringify(r));
clearInterval(alive);
`;

describe("processes", () => {
  it("two bundle processes at once with the same expected_revision and different ids: exactly one lands, the other is revision-mismatch", async () => {
    const root = fresh();
    const a = claimRequest(root);
    const b = { ...claimRequest(root), operation_id: OTHER_ID, payload: { claim: { ...CLAIM, checkout_id: "b1b2c3d4" } } };
    const [ra, rb] = await Promise.all([runAsync([BUNDLE], JSON.stringify(a)), runAsync([BUNDLE], JSON.stringify(b))]);
    expect([ra.code, rb.code]).toEqual([0, 0]);
    const answers = [JSON.parse(ra.stdout), JSON.parse(rb.stdout)] as Response[];
    expect(answers.filter((r) => r.ok)).toHaveLength(1);
    expect(answers.filter((r) => !r.ok)).toMatchObject([{ ok: false, error: { class: "conflict", reason: "revision-mismatch" } }]);
    const winner = answers.findIndex((r) => r.ok);
    expect(controlOf(root, OPEN).claim).toEqual(winner === 0 ? CLAIM : { ...CLAIM, checkout_id: "b1b2c3d4" });
    expect(opsEntries(root)).toEqual([`${winner === 0 ? OP_ID : OTHER_ID}.json`]);
    expect(journalEntries(root)).toEqual([]);
  });

  it(`a holder killed by SIGKILL while it holds the lock is replaced at once: the next bundle's transition lands well inside ${LOCK_STALE_MS / 1000} s (C9)`, async () => {
    const root = fresh();
    const work = mkdtempSync(join(tmpdir(), "codec-holder-"));
    roots.push(work);
    const holder = join(work, "holder.mjs");
    await build({ stdin: { contents: HOLDER, resolveDir: SRC_DIR, sourcefile: "holder.ts", loader: "ts" }, bundle: true, platform: "node", format: "esm", target: "node20", outfile: holder, logLevel: "warning" });
    const ready = join(work, "ready");
    let child: ReturnType<typeof spawn> | undefined;
    let ended: Ran | undefined;
    const exited = runAsync([holder, root, ready], "", (c) => (child = c)).then((r) => (ended = r));
    for (let waited = 0; !existsSync(ready); waited += 20) {
      if (ended !== undefined || waited > 20_000) throw new Error(`the holder never took the lock: ${JSON.stringify(ended)}`);
      await sleep(20);
    }
    const lock = lockPathFor(open(root));
    expect(readFileSync(lock, "utf-8")).toContain(`pid: ${child?.pid}\n`);
    child?.kill("SIGKILL");
    expect((await exited).signal).toBe("SIGKILL");
    expect(existsSync(lock), "SIGKILL runs no exit hook: the lock stays").toBe(true);

    const started = Date.now();
    const r = await runAsync([BUNDLE], JSON.stringify(claimRequest(root)));
    expect(JSON.parse(r.stdout)).toMatchObject({ ok: true, result: { to: "claimed" } });
    expect(Date.now() - started).toBeLessThan(10_000);
    expect(existsSync(lock)).toBe(false);
  });

  // Prior's `TestCodecDoesNotReapAnOldLockWhoseOwnerIsAlive`
  // (`internal/fusionhost/codec_process_test.go`) through the committed
  // bundle, as Prior runs it: FJ01's lock content (a live PID, no host line)
  // at write.lock with an mtime an hour old, a spawned transition killed after
  // 500 ms, and the lock's bytes and the record's digest unchanged (C21).
  it("Prior's live-owner regression through the committed bundle: the codec waits, and the lock and the record are unchanged", async () => {
    const root = fresh();
    const lock = lockPathFor(open(root));
    mkdirSync(dirname(lock), { recursive: true });
    const content = `pid: ${process.pid}\nacquired_at: ${new Date(Date.now() - 3_600_000).toISOString()}\n`;
    writeFileSync(lock, content, { flag: "wx" });
    const hourAgo = (Date.now() - 3_600_000) / 1000;
    utimesSync(lock, hourAgo, hourAgo);
    const digest = revision(root, OPEN);

    let child: ReturnType<typeof spawn> | undefined;
    const ran = runAsync([BUNDLE], JSON.stringify(claimRequest(root)), (c) => (child = c));
    await sleep(500);
    expect(child?.exitCode, "still waiting on the live owner").toBeNull();
    child?.kill("SIGKILL");
    expect((await ran).signal).toBe("SIGKILL");
    expect(readFileSync(lock, "utf-8")).toBe(content);
    expect(revision(root, OPEN)).toBe(digest);
    unlinkSync(lock);
  });
});

// --- a pull ------------------------------------------------------------------------------------

describe("a git pull without a daemon", () => {
  it("record bytes replaced under the caller: the old revision is refused and show returns the new one", async () => {
    const root = fresh();
    const old = revision(root, OPEN);
    const pulled = serialise({ ...controlOf(root, OPEN), status: "paused" });
    writeFileSync(join(root, OPEN), pulled);
    const now = revisionOf(Buffer.from(pulled, "utf-8"));
    expect(await dispatch(claimRequest(root, { expected_revision: old }))).toMatchObject({ ok: false, error: { class: "conflict", reason: "revision-mismatch", detail: `stored ${now} expected ${old}` } });
    const shown = okResult(await dispatch({ op: "show", workbench: root, record: { path: OPEN } }));
    expect(shown.revision).toBe(now);
    expect((shown.control as Record<string, unknown>).status).toBe("paused");
  });
});

// --- the read protocol ---------------------------------------------------------------------------

/** A plan function writing the two scratch records (the package paused, the issue in progress), after `gate`. */
const pairPlan =
  (root: string, gate: Promise<void>, entered: Deferred): PlanFunction =>
  async (ctx) => {
    entered.resolve();
    await gate;
    const pkg = ctx.readPair(OPEN);
    const issue = ctx.readPair(ISSUE);
    if (!pkg.ok || !issue.ok) throw new Error("the scratch records read");
    const a = Buffer.from(serialise({ ...pkg.value.control, status: "paused" }), "utf-8");
    const b = Buffer.from(serialise({ ...issue.value.control, control: { state: "in_progress", disposition: null } }), "utf-8");
    return { ok: true, value: { writes: [{ path: OPEN, bytes: a }, { path: ISSUE, bytes: b }], result: { root } } };
  };

/** What a read body sees of the two records: each one's state. */
const states = (root: string): [unknown, unknown] => [controlOf(root, OPEN).status, (controlOf(root, ISSUE).control as Record<string, unknown>).state];

describe("the read protocol", () => {
  it("a read that straddles a landed operation is retried and returns one consistent state", async () => {
    const root = fresh();
    const wb = open(root);
    const gate = deferred();
    const entered = deferred();
    const writer = mutate(wb, { op: "test-pair", operation_id: OP_ID } as MutationRequest, pairPlan(root, gate.promise, entered));
    await entered.promise; // the writer holds the lock and has committed nothing

    const seen: Array<[unknown, unknown]> = [];
    const r = await read(wb, async () => {
      const pkg = controlOf(root, OPEN).status;
      if (seen.length === 0) {
        gate.resolve();
        expect((await writer).ok).toBe(true);
      }
      const issue = (controlOf(root, ISSUE).control as Record<string, unknown>).state;
      seen.push([pkg, issue]);
      return [pkg, issue];
    });
    expect(seen[0], "the first attempt saw a mixture").toEqual(["open", "in_progress"]);
    expect(r).toEqual({ ok: true, value: ["paused", "in_progress"] });
    expect(seen).toHaveLength(2);
  });

  it("the interleaving of C17: the writer's answer and its intent's removal falling between the after-snapshot's two listings is retried, not accepted", async () => {
    const root = fresh();
    const wb = open(root);
    const planGate = deferred();
    const entered = deferred();
    const atWrite = deferred();
    const writeGate = deferred();
    const writer = mutate(wb, { op: "test-pair", operation_id: OP_ID } as MutationRequest, pairPlan(root, planGate.promise, entered), {
      faults: {
        pause: async (point) => {
          if (point !== "after-write:0") return;
          atWrite.resolve();
          await writeGate.promise;
        },
      },
    });
    await entered.promise;

    const seen: Array<[unknown, unknown]> = [];
    let interleaved = false;
    const r = await read(
      wb,
      async () => {
        if (seen.length === 0) {
          planGate.resolve();
          await atWrite.promise; // the intent is committed and the first file written
        }
        const s = states(root);
        seen.push(s);
        return s;
      },
      {
        faults: {
          pause: async (point) => {
            if (point !== "read:after:between-listings" || interleaved) return;
            interleaved = true;
            // journal/ was listed (it holds the intent); now the writer
            // finishes: its second file, ops/<id>.json, the intent's removal.
            writeGate.resolve();
            expect((await writer).ok).toBe(true);
          },
        },
      },
    );
    expect(interleaved).toBe(true);
    expect(seen[0], "the first attempt saw the package paused and the issue still open").toEqual(["paused", "open"]);
    expect(r).toEqual({ ok: true, value: ["paused", "in_progress"] });
    expect(seen).toHaveLength(2);
  });

  it("dot-named entries appearing in journal/ or ops/ during a read change no snapshot", async () => {
    const root = fresh();
    const wb = open(root);
    mkdirSync(journalDir(wb), { recursive: true });
    mkdirSync(opsDir(wb), { recursive: true });
    let attempts = 0;
    const r = await read(wb, () => {
      attempts++;
      if (attempts === 1) {
        mkdirSync(join(journalDir(wb), `.${OP_ID}.4242.deadbeef.tmp`));
        writeFileSync(join(opsDir(wb), `.${OP_ID}.json.4242.deadbeef.tmp`), "{");
      }
      return states(root);
    });
    expect(r).toEqual({ ok: true, value: ["open", "open"] });
    expect(attempts).toBe(1);
    expect(pendingIds(wb)).toEqual([]);
  });
});

// --- a three-write replacement adopt-plan at every cut ------------------------------------------

describe("a three-write replacement adopt-plan cut at every point of CUTS", () => {
  const WB_ID = "5d6d15ba-5b44-45b2-8aa2-39dd3bf82964";
  const OPEN_ID = "591d5bf4-2219-46b6-a0d3-cbdb28d6af16";
  const CONTAINER = "work-packages/260928-1200-parser-fix";
  const PLANS = { a: "aaaaaaaa-0000-4000-8000-00000000000a", b: "bbbbbbbb-0000-4000-8000-00000000000b" } as const;
  const control = (k: "a" | "b"): string => `${CONTAINER}/plans/260929-110${k === "a" ? 1 : 2}-plan-${k}.record.json`;
  const narrative = (k: "a" | "b"): string => `${CONTAINER}/plans/260929-110${k === "a" ? 1 : 2}-plan-${k}.md`;

  /** Plans A and B created, A adopted by the open package: the state the replacement starts from, with fixed ids. */
  const seed = async (root: string): Promise<void> => {
    for (const k of ["a", "b"] as const) {
      const created = await dispatch({
        op: "create",
        workbench: root,
        operation_id: `c${k.repeat(7)}-0000-4000-8000-000000000001`,
        id: PLANS[k],
        kind: "plan",
        filed_by: ACTOR,
        origin: { kind: "package", ref: { workbench_id: WB_ID, record_id: OPEN_ID } },
        scope: { container: CONTAINER, store: "plans" },
        narrative: { path: narrative(k), content: `# Plan ${k}\n` },
        payload: { state: "open", steps: [], criteria: [], acceptance: null },
      });
      expect(created.ok, JSON.stringify(created)).toBe(true);
    }
    const adopted = await dispatch(adoptB(root, { operation_id: "cccccccc-0000-4000-8000-000000000002", plan: { workbench_id: WB_ID, record_id: PLANS.a }, revision: revision(root, narrative("a")) }));
    expect(adopted.ok, JSON.stringify(adopted)).toBe(true);
  };
  const adoptB = (root: string, over: Record<string, unknown> = {}): Record<string, unknown> & MutationRequest => ({
    op: "adopt-plan",
    workbench: root,
    operation_id: OP_ID,
    record: { path: OPEN },
    expected_revision: revision(root, OPEN),
    actor: ACTOR,
    plan: { workbench_id: WB_ID, record_id: PLANS.b },
    revision: revision(root, narrative("b")),
    ...over,
  });
  /** The three files in the order the plan function writes them: the new plan, the replaced one, the package. */
  const FILES = [control("b"), control("a"), OPEN];

  for (const cut of cutsFor(3)) {
    it(`${cut}: a read recovers to the three-file post state; an identical retry returns the uncut answer; a divergent one is operation-id-reused; a fresh id on the old revision is revision-mismatch`, async () => {
      const clean = fresh();
      await seed(clean);
      const cleanAnswer = await dispatch(adoptB(clean));
      expect(cleanAnswer.ok, JSON.stringify(cleanAnswer)).toBe(true);

      const root = fresh();
      await seed(root);
      const req = adoptB(root);
      const pre = FILES.map((f) => bytesOf(root, f));
      await expect(dispatch(req, { kernel: { faults: { cutAt: cut } } })).rejects.toBeInstanceOf(CutReached);
      expect(journalEntries(root), "the intent is pending after the cut").toEqual([OP_ID]);
      const landed = cut === "after-intent" ? 0 : cut === "after-answer" ? 3 : Number(cut.slice("after-write:".length)) + 1;
      FILES.forEach((f, i) => {
        const expected = i < landed ? bytesOf(clean, f) : (pre[i] as Buffer);
        expect(bytesOf(root, f).equals(expected), `${f} before recovery: ${i < landed ? "post" : "pre"}`).toBe(true);
      });

      // A read recovers: all three files at the bytes the uncut run wrote.
      const shown = okResult(await dispatch({ op: "show", workbench: root, record: { path: OPEN } }));
      expect(shown.revision).toBe(revision(clean, OPEN));
      expect(journalEntries(root), "recovered: the intent left the journal").toEqual([]);
      for (const f of FILES) expect(bytesOf(root, f).equals(bytesOf(clean, f)), `${f} after recovery`).toBe(true);
      expect((controlOf(root, OPEN).active_documents as unknown[]).length).toBe(1);
      expect(((controlOf(root, control("a")).control as Record<string, unknown>).acceptance)).toBeNull();

      const again = await dispatch(req);
      expect(JSON.stringify(again)).toBe(JSON.stringify(cleanAnswer));
      expect(await dispatch({ ...req, role: "spec" })).toMatchObject({ ok: false, error: { class: "conflict", reason: "operation-id-reused" } });
      expect(await dispatch({ ...req, operation_id: OTHER_ID })).toMatchObject({ ok: false, error: { class: "conflict", reason: "revision-mismatch" } });
      for (const f of FILES) expect(bytesOf(root, f).equals(bytesOf(clean, f)), `${f}: executed once`).toBe(true);
    });
  }
});
