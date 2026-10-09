// ---------------------------------------------------------------------------
// The operation kernel (FJ02 plan step 3): the mutation sequence at every cut,
// recovery in-process and through a spawned bundle, blocked intents and the
// replay of their ids, the lock through the kernel (the CAS and lock cases of
// FJ01's `writeControl`, moved here with its removal), concurrent and killed
// processes, a pull, the read protocol's retries, and why no stored answer is
// pruned (FJ02b plan step 4), and the removal entry a migration rollback
// alone writes (FJ04 step 6).
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
import { cpSync, existsSync, lstatSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, renameSync, rmSync, statSync, symlinkSync, unlinkSync, utimesSync, writeFileSync } from "node:fs";
import { hostname, tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";
import { afterEach, describe, expect, it } from "vitest";
import { dispatch } from "../cli/ops.js";
import type { Response, TransitionRequest } from "../cli/protocol.js";
import { commitIntent, fileState, journalDir, opsDir, pendingIds, readIntent, requestDigest, type Intent, type Write } from "../journal.js";
import { CUTS, CutReached, blockedIntent, cutsFor, isHeld, mutate, read, type KernelOptions, type MutationRequest, type PlanFunction } from "../kernel.js";
import { LOCK_STALE_MS, STATE_DIR, lockPathFor, openWorkbench, revisionOf, serialise, type Workbench } from "../store.js";
import { strictParse } from "../strict-json.js";
import { PLACEHOLDER, fromPlaceholder, toPlaceholder } from "./helpers/session.js";

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

// --- retention: no stored answer is pruned --------------------------------------------------------

// The fusion twin of Prior's `TestCodecFJ02RetainedAnswerPreventsABAReplay`
// (Prior's response 21 to the FJ02 requests). A revision is the hash of the
// stored bytes, so it names content and never a moment: `01-create`,
// `02-claim` and `03-release` of the recorded FJ02 session leave the package
// at the bytes `01` wrote, which is the revision `02` expects. After `03` the
// one thing that tells a late copy of `02` from a first attempt is its stored
// answer. The cases send the recorded requests to the committed bundle and
// delete that one answer, on a temp copy, to show what pruning would do. The
// CAS is shown intact beside it, so the defect is the return of old bytes.
//
// The `<workbench>` substitution is the recorded sessions' own, taken from the
// helper their recorders share (`helpers/session.ts`), so the recorded bytes
// are replayed here by the rule they were recorded under.

const SESSION = fileURLToPath(new URL("../../fixtures/protocol-session-fj02/", import.meta.url));

describe("stored answers are never pruned: content revisions return", () => {
  type Recorded = "01-create" | "02-claim" | "03-release";
  const recorded = (name: Recorded, half: "request" | "response"): string => readFileSync(join(SESSION, `${name}.${half}.json`), "utf-8");
  const request = (name: Recorded): Record<string, unknown> => JSON.parse(recorded(name, "request")) as Record<string, unknown>;
  const answered = (name: Recorded): Record<string, unknown> => okResult(JSON.parse(recorded(name, "response")) as Response);

  const PKG = String(answered("01-create").path);
  /** The revision 01 answered, and the one the package returns to after 03. */
  const CREATED = String(answered("01-create").revision);
  /** The revision 02 answered: the package claimed. */
  const CLAIMED = String(answered("02-claim").revision);
  const ids = (["01-create", "02-claim", "03-release"] as const).map((n) => String(request(n).operation_id));
  const CLAIM_ID = ids[1] as string;

  /** One request line to the committed bundle, the placeholder replaced by `root`; its stdout, the root recorded as the placeholder. */
  const send = (root: string, line: string): string => {
    const run = spawnSync(process.execPath, [BUNDLE], { input: fromPlaceholder(root, line), encoding: "utf-8", env: baseEnv });
    expect(run.status, run.stderr).toBe(0);
    expect(run.stderr).toBe("");
    return toPlaceholder(root, run.stdout);
  };

  /** What `show` reports of the package, through the bundle. */
  const shown = (root: string): { status: unknown; revision: unknown } => {
    const r = okResult(JSON.parse(send(root, JSON.stringify({ op: "show", workbench: PLACEHOLDER, record: { path: PKG } }))) as Response);
    return { status: (r.control as Record<string, unknown>).status, revision: r.revision };
  };

  /** A fresh copy on which the recorded 01, 02 and 03 ran, each answering its recorded bytes. */
  const released = (): string => {
    const root = fresh();
    for (const name of ["01-create", "02-claim", "03-release"] as const) expect(send(root, recorded(name, "request")), name).toBe(recorded(name, "response"));
    expect(revision(root, PKG), "after 03 the package is at the revision 01 answered").toBe(CREATED);
    return root;
  };

  const answerOf = (root: string, id: string): string => join(root, STATE_DIR, "ops", `${id}.json`);

  it("01, 02 and 03 as recorded, on two copies: each package is back at the bytes and the revision 01 answered, which is the one 02 expects", () => {
    expect(request("02-claim").expected_revision).toBe(CREATED);
    expect(CLAIMED).not.toBe(CREATED);
    const copies = [released(), released()] as const;
    for (const root of copies) {
      expect(shown(root)).toEqual({ status: "open", revision: CREATED });
      expect(opsEntries(root)).toEqual(ids.map((id) => `${id}.json`).sort());
      expect(journalEntries(root)).toEqual([]);
    }
    expect(bytesOf(copies[0], PKG).equals(bytesOf(copies[1], PKG))).toBe(true);
  });

  it("the answer retained: the replayed 02 answers the recorded bytes and lands nothing; the package stays open at 01's revision", () => {
    const root = released();
    const bytes = bytesOf(root, PKG);
    expect(existsSync(answerOf(root, CLAIM_ID))).toBe(true);
    expect(send(root, recorded("02-claim", "request"))).toBe(recorded("02-claim", "response"));
    expect(shown(root)).toEqual({ status: "open", revision: CREATED });
    expect(bytesOf(root, PKG).equals(bytes), "the stored answer was returned; the old claim did not run").toBe(true);
  });

  it("only 02's answer deleted: the replayed 02 passes the CAS and lands a second time; the package is claimed at 02's recorded revision", () => {
    const root = released();
    unlinkSync(answerOf(root, CLAIM_ID));
    expect(opsEntries(root), "the one file deleted, and nothing else").toEqual([ids[0], ids[2]].map((id) => `${id}.json`).sort());
    const again = JSON.parse(send(root, recorded("02-claim", "request"))) as Response;
    expect(again.ok, JSON.stringify(again)).toBe(true);
    // The defect this case documents: a claim that was released is held again, by a request as old as the claim.
    expect(shown(root)).toEqual({ status: "claimed", revision: CLAIMED });
    expect(controlOf(root, PKG).claim).toEqual(request("02-claim").claim);
  });

  it("the CAS is intact where the answers were kept: a release under a fresh operation id against 02's revision is conflict/revision-mismatch", () => {
    const root = released();
    expect(send(root, recorded("02-claim", "request")), "the replay, as in the retained case").toBe(recorded("02-claim", "response"));
    const stale: Record<string, unknown> = { ...request("03-release"), operation_id: OTHER_ID };
    expect(ids).not.toContain(OTHER_ID);
    expect(stale.expected_revision).toBe(CLAIMED);
    expect(JSON.parse(send(root, JSON.stringify(stale)))).toMatchObject({ ok: false, error: { class: "conflict", reason: "revision-mismatch", detail: `stored ${CREATED} expected ${CLAIMED}` } });
    expect(shown(root)).toEqual({ status: "open", revision: CREATED });
    expect(opsEntries(root), "a refusal stores no answer").toEqual(ids.map((id) => `${id}.json`).sort());
  });
});

// --- initialize through the kernel -----------------------------------------------------------
//
// The initialize plan's step 3: `mutate` with every state admitted, the
// content check under the lock, competing initializers in one process and in
// two, interruption before and after the commit point, and a diverged manifest.

describe("initialize through the kernel", () => {
  const WB_NEW = "6b8d0f2a-3c5e-4b7d-8f9a-1b2c3d4e5f60";
  const WB_OTHER = "7b8d0f2a-3c5e-4b7d-8f9a-1b2c3d4e5f60";
  /** A fresh empty directory: the target `initialize` lands on. */
  const emptyTarget = (): string => {
    const dir = mkdtempSync(join(tmpdir(), "codec-init-"));
    roots.push(dir);
    return dir;
  };
  const init = (dir: string, over: Record<string, unknown> = {}): Record<string, unknown> & MutationRequest => ({ op: "initialize", workbench: dir, operation_id: OP_ID, id: WB_NEW, ...over });
  const manifestId = (dir: string): unknown => controlOf(dir, "workbench.json").id;

  it("mutate refuses a legacy or unsupported workbench unless the operation admits it: the gate is a parameter", async () => {
    const dir = emptyTarget();
    const plan: PlanFunction = () => ({ ok: true, value: { writes: [], result: "planned" } });
    expect(await mutate(open(dir), { op: "create", operation_id: OP_ID }, plan)).toMatchObject({ ok: false, error: { class: "unsupported-format", reason: "legacy-workbench" } });
    expect(existsSync(join(dir, STATE_DIR)), "refused before the lock").toBe(false);
    expect(await mutate(open(dir), { op: "initialize", operation_id: OP_ID }, plan, {}, ["legacy"])).toEqual({ ok: true, result: "planned" });
  });

  it("two initializers in one process, the first paused holding the lock: exactly one lands, the manifest id is the winner's, the other is manifest-present", async () => {
    const dir = emptyTarget();
    const locked = deferred();
    const go = deferred();
    const first = dispatch(init(dir), { kernel: { faults: { pause: async (p) => { if (p === "locked") { locked.resolve(); await go.promise; } } } } });
    await locked.promise;
    const second = dispatch(init(dir, { operation_id: OTHER_ID, id: WB_OTHER }), { kernel: { pollMs: 5 } });
    await sleep(100);
    expect(existsSync(join(dir, "workbench.json")), "the second waits on the lock").toBe(false);
    go.resolve();
    const [a, b] = await Promise.all([first, second]);
    expect(a).toMatchObject({ ok: true, result: { id: WB_NEW } });
    expect(b).toMatchObject({ ok: false, error: { class: "conflict", reason: "manifest-present" } });
    expect(manifestId(dir)).toBe(WB_NEW);
    expect(opsEntries(dir)).toEqual([`${OP_ID}.json`]);
  });

  it("two bundle processes at once over one empty directory: exactly one lands and the manifest id is the winner's", async () => {
    for (let round = 0; round < 3; round++) {
      const dir = emptyTarget();
      const [ra, rb] = await Promise.all([runAsync([BUNDLE], JSON.stringify(init(dir))), runAsync([BUNDLE], JSON.stringify(init(dir, { operation_id: OTHER_ID, id: WB_OTHER })))]);
      expect([ra.code, rb.code]).toEqual([0, 0]);
      const answers = [JSON.parse(ra.stdout), JSON.parse(rb.stdout)] as Response[];
      expect(answers.filter((r) => r.ok), JSON.stringify(answers)).toHaveLength(1);
      expect(answers.filter((r) => !r.ok)).toMatchObject([{ ok: false, error: { class: "conflict", reason: "manifest-present" } }]);
      const winner = answers[0]?.ok === true ? 0 : 1;
      expect(manifestId(dir)).toBe(winner === 0 ? WB_NEW : WB_OTHER);
      expect(journalEntries(dir)).toEqual([]);
    }
  });

  it("before the commit point: a stale lock of a dead PID and a dot-named half-built intent do not stop it", async () => {
    const dir = emptyTarget();
    mkdirSync(join(dir, STATE_DIR, "journal", `.${OTHER_ID}.4242.deadbeef.tmp`), { recursive: true });
    writeFileSync(join(dir, STATE_DIR, "journal", `.${OTHER_ID}.4242.deadbeef.tmp`, "intent.json"), "{ half");
    writeFileSync(lockPathFor(open(dir)), `pid: ${deadPid()}\nhost: ${hostname()}\nnonce: 00\nacquired_at: ${new Date().toISOString()}\n`);
    const r = await dispatch(init(dir));
    expect(r).toMatchObject({ ok: true, result: { id: WB_NEW, path: "workbench.json" } });
    expect(journalEntries(dir), "swept").toEqual([]);
    expect(existsSync(lockPathFor(open(dir)))).toBe(false);
  });

  for (const cut of cutsFor(1)) {
    it(`${cut}: the identical request answers the uncut bytes and the manifest is written once; another id is then manifest-present`, async () => {
      const clean = emptyTarget();
      const cleanAnswer = await dispatch(init(clean));
      expect(cleanAnswer.ok).toBe(true);

      const dir = emptyTarget();
      await expect(dispatch(init(dir), { kernel: { faults: { cutAt: cut } } })).rejects.toBeInstanceOf(CutReached);
      expect(journalEntries(dir)).toEqual([OP_ID]);
      expect(open(dir).state).toBe(cut === "after-intent" ? "legacy" : "json-control");
      expect(JSON.stringify(await dispatch(init(dir)))).toBe(JSON.stringify(cleanAnswer));
      expect(journalEntries(dir)).toEqual([]);
      expect(bytesOf(dir, "workbench.json").equals(bytesOf(clean, "workbench.json"))).toBe(true);
      expect(await dispatch(init(dir, { operation_id: OTHER_ID, id: WB_OTHER }))).toMatchObject({ ok: false, error: { class: "conflict", reason: "manifest-present" } });
      expect(manifestId(dir)).toBe(WB_NEW);
    });
  }

  it("a diverged manifest under the committed intent is recovery-blocked for the same request and another one, and never overwritten", async () => {
    const dir = emptyTarget();
    await expect(dispatch(init(dir), { kernel: { faults: { cutAt: "after-intent" } } })).rejects.toBeInstanceOf(CutReached);
    const hand = '{"written":"by hand"}\n';
    writeFileSync(join(dir, "workbench.json"), hand);
    const same = await dispatch(init(dir));
    expect(same).toMatchObject({ ok: false, error: { class: "operation-unknown", reason: "recovery-blocked" } });
    if (!same.ok) expect(same.error.detail).toContain("workbench.json");
    expect(await dispatch(init(dir, { id: WB_OTHER }))).toMatchObject({ ok: false, error: { class: "conflict", reason: "operation-id-reused" } });
    // Another operation id: the other intent is blocked, so it is refused before the directory is judged.
    expect(await dispatch(init(dir, { operation_id: OTHER_ID, id: WB_OTHER }))).toMatchObject({ ok: false, error: { class: "operation-unknown", reason: "recovery-blocked" } });
    expect(readFileSync(join(dir, "workbench.json"), "utf-8")).toBe(hand);
    expect(journalEntries(dir)).toEqual([OP_ID]);
  });

  it("inspect.pending names a blocked committed initialize: an intent whose manifest stands at neither its pre- nor its post-bytes", async () => {
    const dir = emptyTarget();
    const wb = open(dir);
    const bytes = Buffer.from(serialise({ schema: "fusion.workbench/v1", id: WB_NEW, required_features: ["json-control-v1"], migration: null, extensions: {} }), "utf-8");
    // Hand-written: it names pre-bytes the absent manifest does not have, so the absence is at neither.
    const writes: Write[] = [{ path: "workbench.json", before: revisionOf(Buffer.from("other")), after: revisionOf(bytes) }];
    const response: Response = { ok: true, result: { operation_id: OP_ID, id: WB_NEW, path: "workbench.json", revision: revisionOf(bytes) }, revisions: { "workbench.json": revisionOf(bytes) } };
    const intent: Intent = { operation_id: OP_ID, op: "initialize", request_digest: requestDigest(init(dir)), writes, response, created_at: new Date().toISOString() };
    expect(commitIntent(wb, intent, new Map([["workbench.json", bytes]])).ok).toBe(true);
    expect(okResult(await dispatch({ op: "inspect", workbench: dir })).pending).toEqual({ operation_id: OP_ID, id: WB_NEW, blocked: true });
    expect(await dispatch(init(dir))).toMatchObject({ ok: false, error: { reason: "recovery-blocked" } });
    expect(await dispatch(init(dir, { operation_id: OTHER_ID }))).toMatchObject({ ok: false, error: { reason: "recovery-blocked" } });
    expect(existsSync(join(dir, "workbench.json"))).toBe(false);
  });

  it("blockedIntent is the recovery classification: null at pre or post, the diverged path otherwise, as inspect.pending reports it", async () => {
    const dir = emptyTarget();
    await expect(dispatch(init(dir), { kernel: { faults: { cutAt: "after-intent" } } })).rejects.toBeInstanceOf(CutReached);
    const intentOf = () => {
      const r = readIntent(open(dir), OP_ID);
      if (!r.ok || r.value === null) throw new Error("the intent does not read");
      return r.value;
    };
    expect(blockedIntent(open(dir), intentOf()), "absent: at pre").toBeNull();
    writeFileSync(join(dir, "workbench.json"), '{"written":"by hand"}\n');
    expect(blockedIntent(open(dir), intentOf())).toEqual({ operation_id: OP_ID, paths: ["workbench.json"], diverged: ["workbench.json"] });
    expect(okResult(await dispatch({ op: "inspect", workbench: dir })).pending).toMatchObject({ blocked: true });
    unlinkSync(join(dir, "workbench.json"));
    const landed = await dispatch(init(dir));
    expect(landed.ok).toBe(true);
    expect(okResult(await dispatch({ op: "inspect", workbench: dir })).pending, "the intent left the journal").toBeNull();
  });
});

// --- removal entries (FJ04 step 6) ---------------------------------------------------------

describe("a removal entry: after null, a migration rollback's only", () => {
  const ROLLBACK = { op: "migration", operation_id: OP_ID, phase: "rollback" } as MutationRequest;
  const removing = (root: string, path: string): PlanFunction => () => ({ ok: true, value: { writes: [], removals: [{ path, before: revision(root, path) }], result: { removed: [path] } } });

  it("is refused before anything is written as null to null or outside migration rollback, and a journal holding one does not read", () => {
    const root = fresh();
    const wb = open(root);
    const base = { operation_id: OP_ID, request_digest: requestDigest({}), response: { ok: true as const, result: {} }, created_at: new Date(0).toISOString() };
    const removal = { path: ISSUE, before: revision(root, ISSUE), after: null };
    expect(() => commitIntent(wb, { ...base, op: "transition", writes: [removal] }, new Map())).toThrow(/only migration rollback removes a file/);
    expect(() => commitIntent(wb, { ...base, op: "migration", phase: "apply", writes: [removal] }, new Map())).toThrow(/only migration rollback removes a file/);
    expect(() => commitIntent(wb, { ...base, op: "migration", phase: "rollback", writes: [{ path: ISSUE, before: null, after: null } as unknown as Write] }, new Map())).toThrow(/from null to null/);
    expect(journalEntries(root)).toEqual([]);
    // Hand-written into the journal, the same intent reads as journal-unreadable.
    mkdirSync(join(journalDir(wb), OP_ID), { recursive: true });
    writeFileSync(join(journalDir(wb), OP_ID, "intent.json"), JSON.stringify({ ...base, op: "transition", writes: [removal] }));
    expect(readIntent(wb, OP_ID)).toMatchObject({ ok: false, error: { class: "conflict", reason: "journal-unreadable" } });
  });

  it("reads its state by lstat: the regular file at before is pre, absence post, a dangling link, a directory or other bytes diverged", () => {
    const root = fresh();
    const wb = open(root);
    const w = { path: ISSUE, before: revision(root, ISSUE), after: null } as const;
    expect(fileState(wb, w)).toBe("pre");
    const stored = bytesOf(root, ISSUE);
    writeFileSync(join(root, ISSUE), "other bytes\n");
    expect(fileState(wb, w)).toBe("diverged");
    rmSync(join(root, ISSUE));
    expect(fileState(wb, w)).toBe("post");
    symlinkSync("nowhere.json", join(root, ISSUE));
    expect(fileState(wb, w)).toBe("diverged");
    rmSync(join(root, ISSUE));
    symlinkSync(join(root, "shared/issues/260928-1400-parser-fails-on-empty-input.md"), join(root, ISSUE));
    expect(fileState(wb, { ...w, before: revision(root, "shared/issues/260928-1400-parser-fails-on-empty-input.md") })).toBe("diverged");
    rmSync(join(root, ISSUE));
    mkdirSync(join(root, ISSUE));
    expect(fileState(wb, w)).toBe("diverged");
    rmSync(join(root, ISSUE), { recursive: true });
    writeFileSync(join(root, ISSUE), stored);
    expect(fileState(wb, w)).toBe("pre");
  });

  it("cut at every point, the same request lands it: the file gone, the answer stored, recovery idempotent", async () => {
    for (const cut of cutsFor(1)) {
      const root = fresh();
      const wb = open(root);
      const plan = removing(root, ISSUE);
      await expect(mutate(wb, ROLLBACK, plan, { faults: { cutAt: cut } }, ["json-control"])).rejects.toThrow(CutReached);
      // A read leaves the held migration intent where it stands.
      okResult(await dispatch({ op: "list", workbench: root }));
      expect(pendingIds(wb), cut).toEqual([OP_ID]);
      expect(okResult(await mutate(wb, ROLLBACK, plan, {}, ["json-control"])), cut).toEqual({ removed: [ISSUE] });
      expect(existsSync(join(root, ISSUE)), cut).toBe(false);
      expect(journalEntries(root), cut).toEqual([]);
      expect(opsEntries(root), cut).toEqual([`${OP_ID}.json`]);
    }
  });

  it("a removal whose entry diverged after the commit point blocks recovery and leaves the entry", async () => {
    const root = fresh();
    const wb = open(root);
    const plan = removing(root, ISSUE);
    await expect(mutate(wb, ROLLBACK, plan, { faults: { cutAt: "after-intent" } }, ["json-control"])).rejects.toThrow(CutReached);
    rmSync(join(root, ISSUE));
    symlinkSync("nowhere.json", join(root, ISSUE));
    const r = await mutate(wb, ROLLBACK, plan, {}, ["json-control"]);
    expect(r).toMatchObject({ ok: false, error: { class: "operation-unknown", reason: "recovery-blocked" } });
    expect(lstatSync(join(root, ISSUE)).isSymbolicLink()).toBe(true);
    expect(pendingIds(wb)).toEqual([OP_ID]);
  });
});

// --- the hold: released to its id and digest only (FJ04 addendum for a1fb17a, R4) -----------

describe("a held migration intent is released only to the request carrying its id and its digest", () => {
  const ROLLBACK = { op: "migration", operation_id: OP_ID, phase: "rollback", chunk: 1 } as MutationRequest;
  const removing = (root: string, path: string): PlanFunction => () => ({ ok: true, value: { writes: [], removals: [{ path, before: revision(root, path) }], result: { removed: [path] } } });

  it("the same id under another digest is operation-id-reused with no recovery effect; a read and another id leave it; the same request lands it", async () => {
    const root = fresh();
    const wb = open(root);
    const plan = removing(root, ISSUE);
    await expect(mutate(wb, ROLLBACK, plan, { faults: { cutAt: "after-intent" } }, ["json-control"])).rejects.toThrow(CutReached);
    const changed = { ...ROLLBACK, chunk: 2 } as MutationRequest;
    const intent = readIntent(wb, OP_ID);
    if (!intent.ok || intent.value === null) throw new Error("the intent does not read");
    expect(isHeld(intent.value, changed)).toBe(true);
    expect(isHeld(intent.value, null)).toBe(true);
    expect(isHeld(intent.value, ROLLBACK)).toBe(false);
    const r = await mutate(wb, changed, plan, {}, ["json-control"]);
    expect(r).toMatchObject({ ok: false, error: { class: "conflict", reason: "operation-id-reused" } });
    expect(existsSync(join(root, ISSUE)), "no recovery effect").toBe(true);
    expect(pendingIds(wb)).toEqual([OP_ID]);
    okResult(await dispatch({ op: "list", workbench: root }));
    expect(pendingIds(wb)).toEqual([OP_ID]);
    expect(okResult(await mutate(wb, ROLLBACK, plan, {}, ["json-control"]))).toEqual({ removed: [ISSUE] });
    expect(existsSync(join(root, ISSUE))).toBe(false);
    expect(pendingIds(wb)).toEqual([]);
  });
});

// --- a takeover through the existing kernel (request 62; Prior's answer to 62, part 9) --------

describe("a one-write claim with takeover cut at every point of CUTS", () => {
  const HELD = { checkout_id: "deadbeef", person: "kai", claimed_at: "2026-09-28T13:41:00+02:00" };
  const NEW = { checkout_id: "a216a4b9", person: "kai", claimed_at: "2026-10-09T14:00:00+02:00" };
  const SOURCE = { kind: "user-word", ref: { workbench_id: "5d6d15ba-5b44-45b2-8aa2-39dd3bf82964", record_id: "d068e1ae-3f62-429a-880a-2785763aaf01" } };
  /** The open package of a fresh copy at rest in claimed, held by a checkout that is gone. */
  const claimedCopy = (): string => {
    const root = fresh();
    writeFileSync(join(root, OPEN), serialise({ ...controlOf(root, OPEN), status: "claimed", claim: HELD }));
    return root;
  };
  const takeoverRequest = (root: string) => ({
    op: "claim",
    workbench: root,
    operation_id: OP_ID,
    record: { path: OPEN },
    expected_revision: revision(root, OPEN),
    actor: { actor: "orchestrator", person: "kai" },
    claim: NEW,
    takeover: { previous_claim: HELD, source: SOURCE },
  });

  for (const cut of cutsFor(1)) {
    it(`${cut}: a read recovers one claim replacement and one history entry, transferred_at the frozen request time; the identical retry answers the uncut bytes; a fresh id on the inspected revision is revision-mismatch`, async () => {
      const clean = claimedCopy();
      const cleanAnswer = await dispatch(takeoverRequest(clean));
      expect(cleanAnswer.ok, JSON.stringify(cleanAnswer)).toBe(true);

      const root = claimedCopy();
      const req = takeoverRequest(root);
      await expect(dispatch(req, { kernel: { faults: { cutAt: cut } } })).rejects.toBeInstanceOf(CutReached);
      expect(journalEntries(root), "the intent is pending after the cut").toEqual([OP_ID]);

      const shown = okResult(await dispatch({ op: "show", workbench: root, record: { path: OPEN } }));
      expect(journalEntries(root), "recovered: the intent left the journal").toEqual([]);
      const control = shown.control as { claim: unknown; provenance: { claim_transfers: Array<{ previous_claim: unknown; claim: unknown; transferred_at: string }> } };
      expect(control.claim).toEqual(NEW);
      expect(control.provenance.claim_transfers, "one entry, not two").toHaveLength(1);
      expect(control.provenance.claim_transfers[0]).toMatchObject({ previous_claim: HELD, claim: NEW, transferred_at: NEW.claimed_at });
      expect(bytesOf(root, OPEN).equals(bytesOf(clean, OPEN)), "the bytes of the uncut run").toBe(true);

      const again = await dispatch(req);
      expect(JSON.stringify(again), "replay bytes unchanged").toBe(JSON.stringify(cleanAnswer));
      expect(bytesOf(root, OPEN).equals(bytesOf(clean, OPEN)), "the retry rewrote nothing").toBe(true);
      expect(await dispatch({ ...req, operation_id: OTHER_ID })).toMatchObject({ ok: false, error: { class: "conflict", reason: "revision-mismatch" } });
    });
  }
});
