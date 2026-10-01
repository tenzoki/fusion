// ---------------------------------------------------------------------------
// The dispatcher and the operations it answers over the scratch workbench,
// and `main.ts` by spawning `node` on the committed bundle.
//
// Every case copies `fixtures/workbench/` to a fresh temp directory and never
// writes into `codec/fixtures/`. The operations not yet answered are driven
// from their valid request fixtures, so the refusal is asserted on the exact
// shape the schema admits. The spawn cases run `dist/fusion-record.js`, which
// `npm test` builds first; a missing bundle fails with the remedy named.
// ---------------------------------------------------------------------------

import { spawnSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, renameSync, rmSync, statSync, symlinkSync, unlinkSync, writeFileSync } from "node:fs";
import { hostname, tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { bindEvidence, dispatch, indexedContext, TRANSITION_PAYLOAD_FIELDS } from "../cli/ops.js";
import {
  OPERATIONS,
  IMPLEMENTED_OPERATIONS,
  LANDS_IN,
  type AdoptPlanRequest,
  type AttachEvidenceRequest,
  type EvidenceRef,
  type ClaimRequest,
  type CreateEvidenceRequest,
  type CreateRequest,
  type EvidencePayload,
  type RecordRef,
  type ReleaseRequest,
  type Response,
  type SetDependenciesRequest,
  type SetModeRequest,
  type TransitionRequest,
} from "../cli/protocol.js";
import { installInlined } from "../cli/schemas.js";
import { commitIntent, requestDigest, type Intent, type Write } from "../journal.js";
import { CutReached, mutate, readContext } from "../kernel.js";
import { controlFiles, lockPathFor, openWorkbench, revisionOf, serialise, type Pair, type Result } from "../store.js";
import { MAX_RECORD_BYTES, strictParse } from "../strict-json.js";
import { transitions } from "../transitions.js";
import { loadSchemas } from "../validate.js";
import { placeEvidence, seedCorrection, seedEvidence, trySeedCorrection, type SeedOptions, type Seeded } from "./helpers/seed.js";

// Pass-through spies, so `reconcile`'s work can be counted (whole-store walks,
// strict parses) without changing what any case sees.
vi.mock("../store.js", async (importOriginal) => {
  const store = await importOriginal<typeof import("../store.js")>();
  return { ...store, controlFiles: vi.fn(store.controlFiles) };
});
vi.mock("../strict-json.js", async (importOriginal) => {
  const strict = await importOriginal<typeof import("../strict-json.js")>();
  return { ...strict, strictParse: vi.fn(strict.strictParse) };
});

const FIXTURE = fileURLToPath(new URL("../../fixtures/workbench/", import.meta.url));
const VALID = fileURLToPath(new URL("../../fixtures/valid/", import.meta.url));
const BUNDLE = fileURLToPath(new URL("../../dist/fusion-record.js", import.meta.url));
const OPEN = "work-packages/260928-1200-parser-fix/package.json";
const DONE = "work-packages/260927-0900-strict-reader/package.json";
const ISSUE = "shared/issues/260928-1400-parser-fails-on-empty-input.record.json";
const OP_ID = "0f0d8c3a-9b7e-4c1d-8a2f-6e5b4d3c2b1a";
const CLAIM = { checkout_id: "a216a4b9", person: "kai", claimed_at: "2026-09-28T17:05:00+02:00" };
const ACTOR = { actor: "user", person: "kai" };

let root: string;
beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), "codec-ops-"));
  cpSync(FIXTURE, root, { recursive: true });
});
afterEach(() => {
  rmSync(root, { recursive: true, force: true });
});

const bytesOf = (path: string): Buffer => readFileSync(join(root, path));
const revision = (path: string): string => revisionOf(bytesOf(path));
const okResult = (r: Response): Record<string, unknown> => {
  expect(r.ok, JSON.stringify(r)).toBe(true);
  if (!r.ok) throw new Error("unreachable");
  return r.result as Record<string, unknown>;
};
const fixture = (rel: string): Record<string, unknown> => {
  const p = strictParse(readFileSync(join(VALID, rel)));
  if (!p.ok) throw new Error(p.detail);
  return p.value as Record<string, unknown>;
};

const transitionRequest = (over: Partial<TransitionRequest> & { payload?: TransitionRequest["payload"] } = {}): TransitionRequest => ({
  op: "transition",
  workbench: root,
  operation_id: OP_ID,
  record: { path: OPEN },
  expected_revision: revision(OPEN),
  actor: ACTOR,
  to: "claimed",
  reason: "FJ01 round trip",
  payload: { claim: CLAIM },
  ...over,
});

// --- the inlined contract ----------------------------------------------------------

describe("the inlined schemas and tables", () => {
  it("are the same set the directory loader reads", () => {
    const inlined = installInlined();
    const fromDisk = loadSchemas();
    expect(inlined.ids()).toEqual(fromDisk.ids());
    for (const id of fromDisk.ids()) expect(inlined.document(id), id).toEqual(fromDisk.document(id));
  });
});

// --- dispatch ---------------------------------------------------------------------

describe("dispatch: the request itself", () => {
  it("a non-object is schema-invalid; an op outside the table is operation-unknown/unknown-op", async () => {
    expect(await dispatch([])).toMatchObject({ ok: false, error: { class: "schema-invalid", reason: "request-not-an-object" } });
    expect(await dispatch({ op: "delete", workbench: root })).toMatchObject({ ok: false, error: { class: "operation-unknown", reason: "unknown-op" } });
    expect(await dispatch({ workbench: root })).toMatchObject({ ok: false, error: { class: "operation-unknown", reason: "unknown-op" } });
  });

  it("a request the protocol schema refuses is schema-invalid/request with the validator's errors", async () => {
    const r = await dispatch({ op: "show", workbench: root, record: { path: "not-a-control-file.md" } });
    expect(r).toMatchObject({ ok: false, error: { class: "schema-invalid", reason: "request" } });
    if (r.ok) return;
    expect(r.error.errors?.length).toBeGreaterThan(0);
  });

  it("without a workbench in the request or the options: unknown-scope/workbench-unspecified", async () => {
    expect(await dispatch({ op: "inspect" })).toMatchObject({ ok: false, error: { class: "unknown-scope", reason: "workbench-unspecified" } });
    expect((await dispatch({ op: "inspect" }, { defaultWorkbench: root })).ok).toBe(true);
  });

  it("a workbench root that does not exist is unknown-scope/workbench-missing", async () => {
    expect(await dispatch({ op: "inspect", workbench: join(root, "absent") })).toMatchObject({ ok: false, error: { class: "unknown-scope", reason: "workbench-missing" } });
  });

  for (const op of OPERATIONS.filter((o) => !IMPLEMENTED_OPERATIONS.includes(o))) {
    it(`${op}: the valid fixture request is answered operation-unknown/not-implemented, the detail naming the package that lands it`, async () => {
      const req = { ...fixture(`protocol/${op}.json`), workbench: root };
      const r = await dispatch(req);
      expect(r).toMatchObject({ ok: false, error: { class: "operation-unknown", reason: "not-implemented" } });
      if (!r.ok) expect(r.error.detail).toContain(`${op} is specified (spec section 6) and lands in ${LANDS_IN[op]}`);
    });
  }

  it("migration lands in FJ04", () => {
    expect(LANDS_IN.migration).toBe("FJ04");
  });
});

// --- inspect ------------------------------------------------------------------------

describe("inspect", () => {
  it("reports the manifest state, the id, the schema ids, the features and the operation split", async () => {
    const result = okResult(await dispatch({ op: "inspect", workbench: root }));
    expect(result.state).toBe("json-control");
    expect(result.id).toBe("5d6d15ba-5b44-45b2-8aa2-39dd3bf82964");
    expect(result.schemas).toContain("urn:fusion:schema:fusion.protocol/v1");
    expect(result.features).toEqual(["json-control-v1"]);
    expect(result.operations).toEqual({ implemented: [...IMPLEMENTED_OPERATIONS], deferred: OPERATIONS.filter((o) => !IMPLEMENTED_OPERATIONS.includes(o)) });
  });

  it("a legacy workbench inspects as legacy; an unsupported manifest inspects ok with its diagnosis and raw data", async () => {
    unlinkSync(join(root, "workbench.json"));
    expect(okResult(await dispatch({ op: "inspect", workbench: root })).state).toBe("legacy");
    writeFileSync(join(root, "workbench.json"), readFileSync(join(VALID, "workbench", "extra-feature.json")));
    const result = okResult(await dispatch({ op: "inspect", workbench: root }));
    expect(result.state).toBe("unsupported");
    expect(result.diagnosis).toMatchObject({ class: "unsupported-format", reason: "unknown-feature" });
    expect(result.manifest).not.toBeNull();
    // ... while the other reads refuse with the same diagnosis.
    expect(await dispatch({ op: "list", workbench: root })).toMatchObject({ ok: false, error: { class: "unsupported-format", reason: "unknown-feature" } });
    expect(await dispatch({ op: "show", workbench: root, record: { path: OPEN } })).toMatchObject({ ok: false, error: { reason: "unknown-feature" } });
  });
});

// --- list ---------------------------------------------------------------------------

describe("list", () => {
  it("the whole workbench: three pairs, sorted by path, with kind, status and revision", async () => {
    const result = okResult(await dispatch({ op: "list", workbench: root }));
    const records = result.records as Array<Record<string, unknown>>;
    expect(records.map((r) => r.path)).toEqual([ISSUE, DONE, OPEN]);
    expect(records.map((r) => [r.kind, r.status])).toEqual([["issue", "open"], ["package", "done"], ["package", "open"]]);
    for (const r of records) expect(r.revision).toBe(revision(r.path as string));
  });

  it("a store or a container as scope narrows the listing; a missing scope is unknown-scope", async () => {
    expect((okResult(await dispatch({ op: "list", workbench: root, scope: "work-packages" })).records as unknown[]).length).toBe(2);
    expect((okResult(await dispatch({ op: "list", workbench: root, scope: "shared/issues" })).records as unknown[]).length).toBe(1);
    expect((okResult(await dispatch({ op: "list", workbench: root, scope: "work-packages/260928-1200-parser-fix" })).records as unknown[]).length).toBe(1);
    expect(await dispatch({ op: "list", workbench: root, scope: "shared/plans" })).toMatchObject({ ok: false, error: { class: "unknown-scope", reason: "scope-missing" } });
  });

  it("an unreadable control file is listed with its problem, not hidden", async () => {
    writeFileSync(join(root, OPEN), "{ not json\n");
    const records = okResult(await dispatch({ op: "list", workbench: root })).records as Array<Record<string, unknown>>;
    const broken = records.find((r) => r.path === OPEN);
    expect(broken?.problem).toMatchObject({ class: "schema-invalid", reason: "syntax" });
  });
});

// --- initialize, list.state, inspect.pending ----------------------------------------------
//
// Prior's request 27 and response 28, one case per ruled case (the initialize
// plan's step 3). The processes, the cuts and the stale lock are the kernel
// suite's; here the flowchart's leaves through `dispatch`.

describe("initialize", () => {
  const INIT_ID = "2c4e6a8b-1d3f-4a5b-9c7d-0e1f2a3b4c5d";
  const WB_NEW = "6b8d0f2a-3c5e-4b7d-8f9a-1b2c3d4e5f60";
  const OTHER_OP = "3c4e6a8b-1d3f-4a5b-9c7d-0e1f2a3b4c5d";
  /** A target directory inside the case's temp root, made empty unless `entries` names files to put there. */
  const target = (name = "new", entries: Record<string, string> = {}): string => {
    const dir = join(root, name);
    mkdirSync(dir);
    for (const [rel, content] of Object.entries(entries)) {
      mkdirSync(join(dir, rel, ".."), { recursive: true });
      writeFileSync(join(dir, rel), content);
    }
    return dir;
  };
  const init = (workbench: string, over: Record<string, unknown> = {}) => ({ op: "initialize", workbench, operation_id: INIT_ID, id: WB_NEW, ...over });
  /** Every file and directory under `dir`, path to bytes (a directory as `<dir>`): what "unchanged" is compared on. */
  const tree = (dir: string): Record<string, string> => {
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
  };
  const MANIFEST = `{\n  "schema": "fusion.workbench/v1",\n  "id": "${WB_NEW}",\n  "required_features": [\n    "json-control-v1"\n  ],\n  "migration": null,\n  "extensions": {}\n}\n`;

  it("over an empty directory writes exactly the ruled manifest and answers {operation_id, id, path, revision} with revisions", async () => {
    const dir = target();
    const r = await dispatch(init(dir));
    const rev = revisionOf(Buffer.from(MANIFEST, "utf-8"));
    expect(r).toEqual({ ok: true, result: { operation_id: INIT_ID, id: WB_NEW, path: "workbench.json", revision: rev }, revisions: { "workbench.json": rev } });
    expect(readFileSync(join(dir, "workbench.json"), "utf-8")).toBe(MANIFEST);
    expect(readdirSync(join(dir, ".json-state", "journal"))).toEqual([]);
    expect(readdirSync(join(dir, ".json-state", "ops"))).toEqual([`${INIT_ID}.json`]);
    expect(okResult(await dispatch({ op: "inspect", workbench: dir }))).toMatchObject({ state: "json-control", id: WB_NEW, pending: null });
  });

  it("a non-empty legacy target is target-not-empty, the detail naming the first entries sorted; it stays byte-identical and gains no .json-state/", async () => {
    const dir = target("legacy", {
      ".fusion-setup": '{"version":"12.0.0"}\n',
      "work-packages/260901-0900-a/260901-0900-a.md": "# a\n",
      "shared/plans/.gitkeep": "",
      "stilwerk/chat-voice-de.yaml": "x: 1\n",
      "monitor": "binary",
      "orchestrator-events.jsonl": "",
    });
    const before = tree(dir);
    const r = await dispatch(init(dir));
    expect(r).toMatchObject({ ok: false, error: { class: "conflict", reason: "target-not-empty" } });
    if (!r.ok) expect(r.error.detail).toContain("holds .fusion-setup, monitor, orchestrator-events.jsonl, shared, stilwerk and 1 more");
    expect(tree(dir)).toEqual(before);
    expect(existsSync(join(dir, ".json-state"))).toBe(false);
    // Scaffolding is not guessed at: one .DS_Store is an entry.
    const ds = target("ds", { ".DS_Store": "" });
    expect(await dispatch(init(ds))).toMatchObject({ ok: false, error: { reason: "target-not-empty" } });
    expect(readdirSync(ds)).toEqual([".DS_Store"]);
    // A .json-state that is not a directory is such an entry, refused before any lock.
    const file = target("state-file", { ".json-state": "" });
    const rf = await dispatch(init(file));
    expect(rf).toMatchObject({ ok: false, error: { reason: "target-not-empty" } });
    if (!rf.ok) expect(rf.error.detail).toContain("holds .json-state");
    expect(statSync(join(file, ".json-state")).isFile()).toBe(true);
  });

  // Issue 261001-0841 (inspect over a non-directory journal): the sweep under
  // the lock threw ENOTDIR, and the content check was never reached.
  it("a .json-state/journal or .json-state/ops that is no directory is target-not-empty naming it, before the lock; the target keeps its bytes", async () => {
    for (const inner of ["journal", "ops"]) {
      const dir = target(`${inner}-file`, { [`.json-state/${inner}`]: "" });
      const before = tree(dir);
      const r = await dispatch(init(dir));
      expect(r, inner).toMatchObject({ ok: false, error: { class: "conflict", reason: "target-not-empty" } });
      if (!r.ok) expect(r.error.detail).toContain(`holds .json-state/${inner}`);
      expect(tree(dir), inner).toEqual(before);
    }
  });

  it("a manifest that is valid, unsupported, or a directory is manifest-present, before the lock and under it", async () => {
    // Valid, and under JSON control: the scratch workbench, which carries .json-state/ after a write.
    expect(await dispatch(init(root))).toMatchObject({ ok: false, error: { class: "conflict", reason: "manifest-present" } });
    expect(okResult(await dispatch(transitionRequest())).to).toBe("claimed");
    expect(existsSync(join(root, ".json-state"))).toBe(true);
    const r = await dispatch(init(root, { operation_id: OTHER_OP }));
    expect(r).toMatchObject({ ok: false, error: { class: "conflict", reason: "manifest-present" } });
    if (!r.ok) expect(r.error.detail).toContain("workbench.json");
    // Unsupported: a feature this codec lacks.
    const unsupported = target("unsupported", { "workbench.json": readFileSync(join(VALID, "workbench", "extra-feature.json"), "utf-8") });
    expect(await dispatch(init(unsupported))).toMatchObject({ ok: false, error: { reason: "manifest-present" } });
    // A directory named workbench.json (issue 260930-1654).
    const dirManifest = target("dir-manifest");
    mkdirSync(join(dirManifest, "workbench.json"));
    expect(await dispatch(init(dirManifest))).toMatchObject({ ok: false, error: { reason: "manifest-present" } });
    for (const t of [unsupported, dirManifest]) expect(existsSync(join(t, ".json-state")), t).toBe(false);
  });

  it("a regular file or a missing target is unknown-scope/workbench-missing", async () => {
    const file = join(root, "a-file");
    writeFileSync(file, "");
    expect(await dispatch(init(file))).toMatchObject({ ok: false, error: { class: "unknown-scope", reason: "workbench-missing" } });
    expect(await dispatch(init(join(root, "absent")))).toMatchObject({ ok: false, error: { class: "unknown-scope", reason: "workbench-missing" } });
    expect(existsSync(join(root, "absent"))).toBe(false);
  });

  it("the request: workbench required, a manifest field refused, an id that is no UUID refused", async () => {
    const dir = target();
    const { workbench: _w, ...noWorkbench } = init(dir);
    expect(await dispatch(noWorkbench, { defaultWorkbench: dir })).toMatchObject({ ok: false, error: { class: "schema-invalid", reason: "request" } });
    expect(await dispatch(init(dir, { manifest: { schema: "fusion.workbench/v1" } }))).toMatchObject({ ok: false, error: { class: "schema-invalid", reason: "request" } });
    expect(await dispatch(init(dir, { id: "not-a-uuid" }))).toMatchObject({ ok: false, error: { class: "schema-invalid", reason: "request" } });
    expect(readdirSync(dir)).toEqual([]);
  });

  it("the same request answers the stored bytes, after a later create too; a changed request under the id is operation-id-reused", async () => {
    const dir = target();
    const first = await dispatch(init(dir));
    expect(first.ok).toBe(true);
    expect(await dispatch(init(dir))).toEqual(first);
    const created = await dispatch({
      op: "create",
      workbench: dir,
      operation_id: OTHER_OP,
      id: "4d4e6a8b-1d3f-4a5b-9c7d-0e1f2a3b4c5d",
      kind: "package",
      filed_by: ACTOR,
      origin: { kind: "user-request", ref: null },
      scope: { container: null, store: "work-packages" },
      narrative: { path: "work-packages/260930-1700-first/260930-1700-first.md", content: "# first\n" },
      payload: { domain: "code" },
    });
    expect(created.ok, JSON.stringify(created)).toBe(true);
    expect(await dispatch(init(dir))).toEqual(first);
    expect(await dispatch(init(dir, { id: "7b8d0f2a-3c5e-4b7d-8f9a-1b2c3d4e5f60" }))).toMatchObject({ ok: false, error: { class: "conflict", reason: "operation-id-reused" } });
    expect(readFileSync(join(dir, "workbench.json"), "utf-8")).toBe(MANIFEST);
  });

  it("a stored answer of another operation in ops/ is an entry: target-not-empty, and nothing is written", async () => {
    const dir = target("answered", { [`.json-state/ops/${OTHER_OP}.json`]: '{"operation_id":"x"}\n' });
    const r = await dispatch(init(dir));
    expect(r).toMatchObject({ ok: false, error: { class: "conflict", reason: "target-not-empty" } });
    if (!r.ok) expect(r.error.detail).toContain(`.json-state/ops/${OTHER_OP}.json`);
    expect(existsSync(join(dir, "workbench.json"))).toBe(false);
  });

  it("the exemption: a .json-state/ with the self-ignore, an empty journal/ and ops/, and the sweep's dot entries lands", async () => {
    const dir = target("exempt", { ".json-state/.gitignore": "*\n", [`.json-state/journal/.${OTHER_OP}.1.2.tmp/intent.json`]: "{}", ".json-state/ops/.x.tmp": "" });
    expect((await dispatch(init(dir))).ok).toBe(true);
    // Anything else inside .json-state/ is an entry, named by its path there.
    const other = target("stray", { ".json-state/notes.txt": "" });
    const r = await dispatch(init(other));
    expect(r).toMatchObject({ ok: false, error: { reason: "target-not-empty" } });
    if (!r.ok) expect(r.error.detail).toContain(".json-state/notes.txt");
  });
});

describe("inspect.pending and list.state", () => {
  const INIT_ID = "2c4e6a8b-1d3f-4a5b-9c7d-0e1f2a3b4c5d";
  const WB_NEW = "6b8d0f2a-3c5e-4b7d-8f9a-1b2c3d4e5f60";
  const empty = (name: string): string => {
    const dir = join(root, name);
    mkdirSync(dir);
    return dir;
  };
  const init = (workbench: string, operation_id = INIT_ID) => ({ op: "initialize", workbench, operation_id, id: WB_NEW });

  it("pending is null on a JSON workbench, on an empty directory and on a v12 one; the clean committed window names the initialize with its workbench id, not blocked", async () => {
    expect(okResult(await dispatch({ op: "inspect", workbench: root })).pending).toBeNull();
    const dir = empty("new");
    expect(okResult(await dispatch({ op: "inspect", workbench: dir }))).toMatchObject({ state: "legacy", pending: null });
    await expect(dispatch(init(dir), { kernel: { faults: { cutAt: "after-intent" } } })).rejects.toBeInstanceOf(CutReached);
    // No read finishes it: inspect and list answer legacy, and the intent stands.
    const inspected = okResult(await dispatch({ op: "inspect", workbench: dir }));
    expect(inspected).toMatchObject({ state: "legacy", id: null });
    expect(inspected.pending).toEqual({ operation_id: INIT_ID, id: WB_NEW, blocked: false });
    expect(okResult(await dispatch({ op: "list", workbench: dir }))).toMatchObject({ state: "legacy", records: [] });
    expect(readdirSync(join(dir, ".json-state", "journal"))).toEqual([INIT_ID]);
    expect(existsSync(join(dir, "workbench.json"))).toBe(false);
    // The intent's own request finishes it and answers the committed result.
    const done = await dispatch(init(dir));
    expect(done).toMatchObject({ ok: true, result: { operation_id: INIT_ID, id: WB_NEW, path: "workbench.json" } });
    expect(okResult(await dispatch({ op: "inspect", workbench: dir }))).toMatchObject({ state: "json-control", pending: null });
  });

  it("another initialize over the pending window lands the committed intent first and is then manifest-present", async () => {
    const dir = empty("new");
    await expect(dispatch(init(dir), { kernel: { faults: { cutAt: "after-intent" } } })).rejects.toBeInstanceOf(CutReached);
    const other = await dispatch({ ...init(dir, "5c4e6a8b-1d3f-4a5b-9c7d-0e1f2a3b4c5d"), id: "7b8d0f2a-3c5e-4b7d-8f9a-1b2c3d4e5f60" });
    expect(other).toMatchObject({ ok: false, error: { class: "conflict", reason: "manifest-present" } });
    expect(okResult(await dispatch({ op: "inspect", workbench: dir }))).toMatchObject({ state: "json-control", id: WB_NEW });
  });

  /** A target holding a committed `initialize` cut after its intent: the manifest has not landed. */
  const committed = async (name: string, operation_id = INIT_ID): Promise<string> => {
    const dir = empty(name);
    await expect(dispatch(init(dir, operation_id), { kernel: { faults: { cutAt: "after-intent" } } })).rejects.toBeInstanceOf(CutReached);
    return dir;
  };
  const pendingOf = async (dir: string): Promise<unknown> => okResult(await dispatch({ op: "inspect", workbench: dir })).pending;
  /** Every file and directory under `dir`, path to bytes (a directory as `<dir>`). */
  const tree = (dir: string): Record<string, string> => {
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
  };
  const manifestBytes = (id: string): Buffer => Buffer.from(serialise({ schema: "fusion.workbench/v1", id, required_features: ["json-control-v1"], migration: null, extensions: {} }), "utf-8");
  /** Commits an intent by hand, with no check: for the journal data `initialize` itself never writes. */
  const handIntent = (dir: string, operation_id: string, writes: Array<{ path: string; bytes: Buffer; before?: string | null }>, response: Response, op = "initialize"): void => {
    const wb = openWorkbench(dir);
    if (!wb.ok) throw new Error(wb.error.detail);
    const ws: Write[] = writes.map((w) => ({ path: w.path, before: w.before ?? null, after: revisionOf(w.bytes) }));
    const intent: Intent = { operation_id, op, request_digest: requestDigest(init(dir, operation_id)), writes: ws, response, created_at: "2026-09-30T20:00:00.000Z" };
    const c = commitIntent(wb.value, intent, new Map(writes.map((w) => [w.path, w.bytes])));
    if (!c.ok) throw new Error(c.error.detail);
  };
  const answerFor = (id: string, bytes: Buffer, operation_id = INIT_ID): Response => ({
    ok: true,
    result: { operation_id, id, path: "workbench.json", revision: revisionOf(bytes) },
    revisions: { "workbench.json": revisionOf(bytes) },
  });

  it("extra root content beside the committed intent: pending still names it, and the state stays legacy", async () => {
    const dir = await committed("extra");
    writeFileSync(join(dir, ".DS_Store"), "");
    mkdirSync(join(dir, "work-packages", "260901-0900-a"), { recursive: true });
    writeFileSync(join(dir, "work-packages", "260901-0900-a", "260901-0900-a.md"), "# a\n");
    writeFileSync(join(dir, ".json-state", "notes.txt"), "");
    expect(okResult(await dispatch({ op: "inspect", workbench: dir }))).toMatchObject({ state: "legacy", pending: { operation_id: INIT_ID, id: WB_NEW, blocked: false } });
    // It reports the operation, never a permission to initialize afresh: another id lands the intent first and is refused.
    expect(await dispatch({ ...init(dir, "5c4e6a8b-1d3f-4a5b-9c7d-0e1f2a3b4c5d"), id: "7b8d0f2a-3c5e-4b7d-8f9a-1b2c3d4e5f60" })).toMatchObject({ ok: false, error: { reason: "manifest-present" } });
  });

  it("a divergent manifest and a non-file manifest: pending is named and blocked, and the state is the one the bytes give", async () => {
    const garbage = await committed("garbage");
    writeFileSync(join(garbage, "workbench.json"), '{"written":"by hand"}\n');
    expect(okResult(await dispatch({ op: "inspect", workbench: garbage }))).toMatchObject({ state: "unsupported", diagnosis: { reason: "unknown-schema" }, pending: { operation_id: INIT_ID, id: WB_NEW, blocked: true } });
    // A valid manifest of another workbench: json-control, the manifest's id, and the intent's id in pending.
    const other = await committed("other");
    writeFileSync(join(other, "workbench.json"), manifestBytes("7b8d0f2a-3c5e-4b7d-8f9a-1b2c3d4e5f60"));
    expect(okResult(await dispatch({ op: "inspect", workbench: other }))).toMatchObject({ state: "json-control", id: "7b8d0f2a-3c5e-4b7d-8f9a-1b2c3d4e5f60", pending: { operation_id: INIT_ID, id: WB_NEW, blocked: true } });
    const dirManifest = await committed("dir-manifest");
    mkdirSync(join(dirManifest, "workbench.json"));
    expect(okResult(await dispatch({ op: "inspect", workbench: dirManifest }))).toMatchObject({
      state: "unsupported",
      diagnosis: { class: "schema-invalid", reason: "manifest-not-a-file" },
      pending: { operation_id: INIT_ID, id: WB_NEW, blocked: true },
    });
  });

  it("a blocked intent: every initialize is a typed refusal, and every file stays byte-identical", async () => {
    for (const [name, place] of [
      ["diverged", (d: string) => writeFileSync(join(d, "workbench.json"), '{"written":"by hand"}\n')],
      ["not-a-file", (d: string) => mkdirSync(join(d, "workbench.json"))],
    ] as const) {
      const dir = await committed(name);
      place(dir);
      const before = tree(dir);
      expect(await dispatch(init(dir)), name).toMatchObject({ ok: false, error: { class: "operation-unknown", reason: "recovery-blocked" } });
      expect(await dispatch({ ...init(dir), id: "7b8d0f2a-3c5e-4b7d-8f9a-1b2c3d4e5f60" }), name).toMatchObject({ ok: false, error: { class: "conflict", reason: "operation-id-reused" } });
      expect(await dispatch(init(dir, "5c4e6a8b-1d3f-4a5b-9c7d-0e1f2a3b4c5d")), name).toMatchObject({ ok: false, error: { class: "operation-unknown", reason: "recovery-blocked" } });
      expect(tree(dir), name).toEqual(before);
    }
  });

  it("journal data that does not read or contradicts itself is refused pending-initialize-unreadable, never pending: null", async () => {
    const unreadable = async (dir: string, detail: string): Promise<void> => {
      const r = await dispatch({ op: "inspect", workbench: dir });
      expect(r, dir).toMatchObject({ ok: false, error: { class: "operation-unknown", reason: "pending-initialize-unreadable" } });
      if (!r.ok) expect(r.error.detail).toContain(detail);
    };
    // An intent that does not read: its op cannot be known.
    const broken = await committed("broken");
    writeFileSync(join(broken, ".json-state", "journal", INIT_ID, "intent.json"), "{ half");
    await unreadable(broken, `.json-state/journal/${INIT_ID}`);
    // The same over a JSON workbench: an unreadable entry is never read as "no initialize".
    const other = "8c4e6a8b-1d3f-4a5b-9c7d-0e1f2a3b4c5d";
    mkdirSync(join(root, ".json-state", "journal", other), { recursive: true });
    await unreadable(root, `.json-state/journal/${other}`);
    // An initialize whose writes are not exactly the manifest.
    const twoWrites = empty("two-writes");
    handIntent(twoWrites, INIT_ID, [{ path: "workbench.json", bytes: manifestBytes(WB_NEW) }, { path: "extra.json", bytes: Buffer.from("{}\n") }], answerFor(WB_NEW, manifestBytes(WB_NEW)));
    await unreadable(twoWrites, "not exactly workbench.json");
    const elsewhere = empty("elsewhere");
    handIntent(elsewhere, INIT_ID, [{ path: "other.json", bytes: manifestBytes(WB_NEW) }], answerFor(WB_NEW, manifestBytes(WB_NEW)));
    await unreadable(elsewhere, "not exactly workbench.json");
    // Staged manifest bytes that do not validate.
    const invalid = empty("invalid");
    const bad = Buffer.from('{"schema":"fusion.workbench/v1","id":"not-a-uuid"}\n');
    handIntent(invalid, INIT_ID, [{ path: "workbench.json", bytes: bad }], answerFor("not-a-uuid", bad));
    await unreadable(invalid, "is not valid");
    // A staged id other than the intent's recorded answer, and a recorded answer naming none.
    const mismatch = empty("mismatch");
    handIntent(mismatch, INIT_ID, [{ path: "workbench.json", bytes: manifestBytes(WB_NEW) }], answerFor("7b8d0f2a-3c5e-4b7d-8f9a-1b2c3d4e5f60", manifestBytes(WB_NEW)));
    await unreadable(mismatch, `carries id ${WB_NEW}`);
    const noAnswer = empty("no-answer");
    handIntent(noAnswer, INIT_ID, [{ path: "workbench.json", bytes: manifestBytes(WB_NEW) }], { ok: true, result: {} });
    await unreadable(noAnswer, "names none");
  });

  // Issue 261001-0841: the listing threw ENOTDIR and the bundle exited 1.
  it("a .json-state or a journal that is no directory: inspect is pending-initialize-unreadable naming the journal and its code, and the bundle answers with exit 0", async () => {
    const stateFile = empty("state-file");
    writeFileSync(join(stateFile, ".json-state"), "");
    const journalFile = empty("journal-file");
    mkdirSync(join(journalFile, ".json-state"));
    writeFileSync(join(journalFile, ".json-state", "journal"), "");
    const { FUSION_WORKBENCH: _drop, ...env } = process.env;
    for (const dir of [stateFile, journalFile]) {
      const r = await dispatch({ op: "inspect", workbench: dir });
      expect(r, dir).toMatchObject({ ok: false, error: { class: "operation-unknown", reason: "pending-initialize-unreadable" } });
      if (!r.ok) expect(r.error.detail).toContain(".json-state/journal: the journal cannot be listed (ENOTDIR)");
      const b = spawnSync(process.execPath, [BUNDLE], { input: JSON.stringify({ op: "inspect", workbench: dir }), encoding: "utf-8", env });
      expect(b.status, b.stderr).toBe(0);
      expect(b.stderr).toBe("");
      expect(JSON.parse(b.stdout)).toEqual(r);
    }
  });

  // Issue 261001-0841 (isRegularFile, request 41), through the bundle.
  it("a workbench.json link loop: inspect is unsupported with schema-invalid/manifest-unreadable, and the bundle answers with exit 0", async () => {
    const dir = empty("loop");
    symlinkSync("workbench.json", join(dir, "workbench.json"));
    const r = okResult(await dispatch({ op: "inspect", workbench: dir }));
    expect(r).toMatchObject({ state: "unsupported", pending: null, diagnosis: { class: "schema-invalid", reason: "manifest-unreadable" } });
    const { FUSION_WORKBENCH: _drop, ...env } = process.env;
    const b = spawnSync(process.execPath, [BUNDLE], { input: JSON.stringify({ op: "inspect", workbench: dir }), encoding: "utf-8", env });
    expect(b.status, b.stderr).toBe(0);
    expect(JSON.parse(b.stdout)).toMatchObject({ ok: true, result: { diagnosis: { reason: "manifest-unreadable" } } });
  });

  it("more than one committed initialize is refused pending-initialize-ambiguous, naming the intent directories", async () => {
    const SECOND = "5c4e6a8b-1d3f-4a5b-9c7d-0e1f2a3b4c5d";
    const dir = await committed("two");
    const bytes = manifestBytes("7b8d0f2a-3c5e-4b7d-8f9a-1b2c3d4e5f60");
    handIntent(dir, SECOND, [{ path: "workbench.json", bytes }], answerFor("7b8d0f2a-3c5e-4b7d-8f9a-1b2c3d4e5f60", bytes, SECOND));
    const r = await dispatch({ op: "inspect", workbench: dir });
    expect(r).toMatchObject({ ok: false, error: { class: "operation-unknown", reason: "pending-initialize-ambiguous" } });
    if (!r.ok) expect(r.error.detail).toContain(`.json-state/journal/${INIT_ID}, .json-state/journal/${SECOND}`);
    // A non-initialize intent beside one initialize is no second one: pending names the initialize.
    const mixed = await committed("mixed");
    handIntent(mixed, SECOND, [{ path: "x.json", bytes: Buffer.from("{}\n") }], { ok: true, result: {} }, "create");
    expect(await pendingOf(mixed)).toEqual({ operation_id: INIT_ID, id: WB_NEW, blocked: false });
  });

  it("reconstruction: the request built from the target and inspect.pending alone answers the committed result; over a copy it is operation-id-reused", async () => {
    const clean = empty("clean");
    const cleanAnswer = await dispatch(init(clean));
    expect(cleanAnswer.ok).toBe(true);
    const dir = await committed("window");
    const rebuild = async (target: string) => {
      const p = (await pendingOf(target)) as { operation_id: string; id: string };
      return { op: "initialize", workbench: target, operation_id: p.operation_id, id: p.id };
    };
    // The copy is taken inside the window: another path, so another request digest.
    const copy = join(root, "copied");
    cpSync(dir, copy, { recursive: true });
    const built = await rebuild(dir);
    expect(built).toEqual(init(dir));
    expect(JSON.stringify(await dispatch(built))).toBe(JSON.stringify(cleanAnswer));
    expect(okResult(await dispatch({ op: "inspect", workbench: dir }))).toMatchObject({ state: "json-control", id: WB_NEW, pending: null });
    const r = await dispatch(await rebuild(copy));
    expect(r).toMatchObject({ ok: false, error: { class: "conflict", reason: "operation-id-reused" } });
  });

  it("a successful replay is no proof of the manifest: after workbench.json is deleted the replay still succeeds, and inspect answers legacy", async () => {
    const dir = empty("replayed");
    const first = await dispatch(init(dir));
    expect(first.ok).toBe(true);
    unlinkSync(join(dir, "workbench.json"));
    expect(await dispatch(init(dir))).toEqual(first);
    expect(okResult(await dispatch({ op: "inspect", workbench: dir }))).toMatchObject({ state: "legacy", pending: null });
    expect(existsSync(join(dir, "workbench.json"))).toBe(false);
  });

  // The blocked case of the precedence is "a blocked intent: every initialize is a typed refusal" above.
  it("precedence on initialize: replay before manifest-present, which a fresh initialize over any manifest entry answers", async () => {
    const dir = empty("landed");
    const first = await dispatch(init(dir));
    expect(first.ok).toBe(true);
    unlinkSync(join(dir, "workbench.json"));
    mkdirSync(join(dir, "workbench.json"));
    // Replay: the stored answer, and operation-id-reused for another request under the id.
    expect(await dispatch(init(dir))).toEqual(first);
    expect(await dispatch({ ...init(dir), id: "7b8d0f2a-3c5e-4b7d-8f9a-1b2c3d4e5f60" })).toMatchObject({ ok: false, error: { class: "conflict", reason: "operation-id-reused" } });
    // Fresh: manifest-present, not manifest-not-a-file.
    expect(await dispatch(init(dir, "5c4e6a8b-1d3f-4a5b-9c7d-0e1f2a3b4c5d"))).toMatchObject({ ok: false, error: { class: "conflict", reason: "manifest-present" } });
    // inspect: ok, unsupported with the diagnosis; ordinary reads: the typed refusal; other mutations: the gate's.
    expect(okResult(await dispatch({ op: "inspect", workbench: dir }))).toMatchObject({ state: "unsupported", diagnosis: { class: "schema-invalid", reason: "manifest-not-a-file" }, pending: null });
    expect(await dispatch({ op: "list", workbench: dir })).toMatchObject({ ok: false, error: { class: "schema-invalid", reason: "manifest-not-a-file" } });
    expect(
      await dispatch({ op: "create", workbench: dir, operation_id: OP_ID, id: "4d4e6a8b-1d3f-4a5b-9c7d-0e1f2a3b4c5d", kind: "package", filed_by: ACTOR, origin: { kind: "user-request", ref: null }, scope: { container: null, store: "work-packages" }, narrative: { path: "work-packages/260930-1700-first/260930-1700-first.md", content: "# first\n" }, payload: { domain: "code" } }),
    ).toMatchObject({ ok: false, error: { class: "unsupported-format", reason: "manifest-not-a-file" } });
  });

  it("list answers state: legacy with records [] on an empty and a v12 directory, json-control with records [] after initialize; unsupported stays refused", async () => {
    const dir = empty("new");
    expect(okResult(await dispatch({ op: "list", workbench: dir }))).toEqual({ workbench: dir, state: "legacy", scope: null, records: [] });
    const v12 = empty("v12");
    mkdirSync(join(v12, "work-packages", "260901-0900-a"), { recursive: true });
    writeFileSync(join(v12, "work-packages", "260901-0900-a", "260901-0900-a.md"), "# a\n");
    writeFileSync(join(v12, ".fusion-setup"), "{}\n");
    expect(okResult(await dispatch({ op: "list", workbench: v12 }))).toMatchObject({ state: "legacy", records: [] });
    expect((await dispatch(init(dir))).ok).toBe(true);
    expect(okResult(await dispatch({ op: "list", workbench: dir }))).toEqual({ workbench: dir, state: "json-control", scope: null, records: [] });
    expect(okResult(await dispatch({ op: "list", workbench: root })).state).toBe("json-control");
    writeFileSync(join(dir, "workbench.json"), readFileSync(join(VALID, "workbench", "extra-feature.json")));
    expect(await dispatch({ op: "list", workbench: dir })).toMatchObject({ ok: false, error: { class: "unsupported-format", reason: "unknown-feature" } });
  });

  it("a directory named workbench.json: inspect shows manifest-not-a-file, every other read refuses with it, and the bundle answers with exit 0", async () => {
    unlinkSync(join(root, "workbench.json"));
    mkdirSync(join(root, "workbench.json"));
    expect(okResult(await dispatch({ op: "inspect", workbench: root }))).toMatchObject({ state: "unsupported", pending: null, diagnosis: { class: "schema-invalid", reason: "manifest-not-a-file" } });
    for (const req of [{ op: "list" }, { op: "show", record: { path: OPEN } }, { op: "validate" }, { op: "reconcile" }]) {
      expect(await dispatch({ ...req, workbench: root }), req.op).toMatchObject({ ok: false, error: { class: "schema-invalid", reason: "manifest-not-a-file" } });
    }
    expect(await dispatch(transitionRequest())).toMatchObject({ ok: false, error: { reason: "manifest-not-a-file" } });
    const { FUSION_WORKBENCH: _drop, ...env } = process.env;
    const r = spawnSync(process.execPath, [BUNDLE], { input: JSON.stringify({ op: "inspect", workbench: root }), encoding: "utf-8", env });
    expect(r.status, r.stderr).toBe(0);
    expect(r.stderr).toBe("");
    expect(JSON.parse(r.stdout)).toMatchObject({ ok: true, result: { state: "unsupported", diagnosis: { reason: "manifest-not-a-file" } } });
  });
});

// --- show ---------------------------------------------------------------------------

describe("show", () => {
  it("one pair: control, the revision of the stored bytes, the narrative and its hash", async () => {
    const result = okResult(await dispatch({ op: "show", workbench: root, record: { path: OPEN } }));
    expect(result.kind).toBe("package");
    expect((result.control as Record<string, unknown>).status).toBe("open");
    expect(result.revision).toBe(revision(OPEN));
    expect(result.narrative).toEqual({ path: "work-packages/260928-1200-parser-fix/260928-1200-parser-fix.md", sha256: revision("work-packages/260928-1200-parser-fix/260928-1200-parser-fix.md") });
  });

  it("a missing record is unresolved-reference/record-not-found", async () => {
    expect(await dispatch({ op: "show", workbench: root, record: { path: "work-packages/absent/package.json" } })).toMatchObject({ ok: false, error: { class: "unresolved-reference", reason: "record-not-found" } });
  });
});

// --- validate -----------------------------------------------------------------------

describe("validate", () => {
  it("the scratch workbench is valid: three pairs, no findings", async () => {
    expect(okResult(await dispatch({ op: "validate", workbench: root }))).toMatchObject({ checked: 3, valid: true, findings: [] });
  });

  it("one pair", async () => {
    expect(okResult(await dispatch({ op: "validate", workbench: root, record: { path: ISSUE } }))).toMatchObject({ checked: 1, valid: true });
  });

  it("a schema violation, a missing narrative and a foreign workbench id are each a finding", async () => {
    const open = fixture("package/open.json");
    writeFileSync(join(root, OPEN), serialise({ ...open, status: "claimed" })); // claimed without a claim
    unlinkSync(join(root, "shared/issues/260928-1400-parser-fails-on-empty-input.md"));
    const done = fixture("package/done-completed.json");
    writeFileSync(join(root, DONE), serialise({ ...done, workbench_id: "00000000-0000-4000-8000-000000000000" }));
    const result = okResult(await dispatch({ op: "validate", workbench: root }));
    expect(result.valid).toBe(false);
    const findings = result.findings as Array<Record<string, unknown>>;
    expect(findings.map((f) => `${f.path} ${f.class}/${f.reason}`).sort()).toEqual(
      [`${DONE} unknown-scope/foreign-workbench-id`, `${ISSUE} unresolved-reference/narrative-missing`, `${OPEN} schema-invalid/schema`].sort(),
    );
  });

  it("the state rules of transitions.ts are applied to a record at rest", async () => {
    // A done package whose outcome class dropped admits: the schema's if/then
    // catches it too, so build a case the schema alone lets through: an issue
    // in_progress carrying a disposition is refused by both; a package in
    // claimed with a claim but an outcome is refused by both. The rules are
    // reached when the schema passes, which the scratch fixture shows: the
    // finding list is empty, and the rules ran (a throw would surface).
    expect(okResult(await dispatch({ op: "validate", workbench: root, record: { path: DONE } }))).toMatchObject({ valid: true });
  });
});

// --- transition ------------------------------------------------------------------------

describe("transition", () => {
  it("open to claimed with a claim: the record is rewritten deterministically and the new revision is returned", async () => {
    const before = revision(OPEN);
    const r = await dispatch(transitionRequest());
    const result = okResult(r);
    expect(result).toMatchObject({ operation_id: OP_ID, path: OPEN, from: "open", to: "claimed", previous_revision: before });
    expect(result.revision).toBe(revision(OPEN));
    expect(result.revision).not.toBe(before);
    if (!r.ok) return;
    expect(r.revisions).toEqual({ [OPEN]: result.revision });
    const stored = strictParse(bytesOf(OPEN));
    expect(stored.ok && (stored.value as Record<string, unknown>).status).toBe("claimed");
    expect(stored.ok && (stored.value as Record<string, unknown>).claim).toEqual(CLAIM);
    expect(bytesOf(OPEN).toString("utf-8")).toBe(serialise(stored.ok ? stored.value : {}));
    expect(existsSync(join(root, ".json-state", "ops", `${OP_ID}.json`))).toBe(true);
  });

  it("the same operation_id with the same request returns the stored answer and touches nothing", async () => {
    const req = transitionRequest();
    const first = await dispatch(req);
    expect(first.ok).toBe(true);
    const mtime = statSync(join(root, OPEN)).mtimeMs;
    const bytes = bytesOf(OPEN);
    const again = await dispatch(req);
    expect(again).toEqual(first);
    expect(statSync(join(root, OPEN)).mtimeMs).toBe(mtime);
    expect(bytesOf(OPEN).equals(bytes)).toBe(true);
    // The replay also holds when the record has moved on since: the answer is the stored one.
    const later = await dispatch(transitionRequest({ operation_id: "1f0d8c3a-9b7e-4c1d-8a2f-6e5b4d3c2b1a", expected_revision: revision(OPEN), to: "open", payload: {} }));
    expect(later.ok).toBe(true);
    expect(await dispatch(req)).toEqual(first);
  });

  it("the same operation_id with a different request is conflict/operation-id-reused", async () => {
    const req = transitionRequest();
    expect((await dispatch(req)).ok).toBe(true);
    expect(await dispatch({ ...req, reason: "another reason" })).toMatchObject({ ok: false, error: { class: "conflict", reason: "operation-id-reused" } });
    expect(await dispatch({ ...req, expected_revision: revision(OPEN) })).toMatchObject({ ok: false, error: { class: "conflict", reason: "operation-id-reused" } });
  });

  it("a stale expected_revision is conflict/revision-mismatch and the record is untouched", async () => {
    const stale = "sha256:" + "0".repeat(64);
    const bytes = bytesOf(OPEN);
    const r = await dispatch(transitionRequest({ expected_revision: stale }));
    expect(r).toMatchObject({ ok: false, error: { class: "conflict", reason: "revision-mismatch", detail: `stored ${revision(OPEN)} expected ${stale}` } });
    expect(bytesOf(OPEN).equals(bytes)).toBe(true);
    expect(existsSync(join(root, ".json-state", "ops", `${OP_ID}.json`)), "a refusal is not stored").toBe(false);
  });

  it("an edge the table does not list is conflict/transition-refused; a payload the target state refuses is schema-invalid", async () => {
    expect(await dispatch(transitionRequest({ to: "done", payload: { outcome: { class: "completed", reason: "r", evidence: [] } } }))).toMatchObject({
      ok: false,
      error: { class: "conflict", reason: "transition-refused" },
    });
    expect(await dispatch(transitionRequest({ payload: {} }))).toMatchObject({ ok: false, error: { class: "schema-invalid", reason: "transition-refused" } });
    expect(await dispatch(transitionRequest({ to: "paused", payload: { claim: CLAIM } }))).toMatchObject({ ok: false, error: { class: "schema-invalid", reason: "transition-refused" } });
    expect(await dispatch(transitionRequest({ to: "archived", payload: {} }))).toMatchObject({ ok: false, error: { class: "schema-invalid" } });
  });

  it("a malformed claim is refused by the protocol schema before any operation runs", async () => {
    const r = await dispatch(transitionRequest({ payload: { claim: { ...CLAIM, checkout_id: "A216A4B9" } } }));
    expect(r).toMatchObject({ ok: false, error: { class: "schema-invalid", reason: "request" } });
  });

  it("claimed to open drops the claim; claimed to done keeps the historical claim and needs an outcome", async () => {
    expect((await dispatch(transitionRequest())).ok).toBe(true);
    const release = await dispatch(transitionRequest({ operation_id: "2f0d8c3a-9b7e-4c1d-8a2f-6e5b4d3c2b1a", expected_revision: revision(OPEN), to: "open", payload: {} }));
    expect(release.ok, JSON.stringify(release)).toBe(true);
    let stored = strictParse(bytesOf(OPEN));
    expect(stored.ok && (stored.value as Record<string, unknown>).claim).toBeNull();

    expect((await dispatch(transitionRequest({ operation_id: "3f0d8c3a-9b7e-4c1d-8a2f-6e5b4d3c2b1a", expected_revision: revision(OPEN) }))).ok).toBe(true);
    const noOutcome = await dispatch(transitionRequest({ operation_id: "4f0d8c3a-9b7e-4c1d-8a2f-6e5b4d3c2b1a", expected_revision: revision(OPEN), to: "done", payload: {} }));
    expect(noOutcome).toMatchObject({ ok: false, error: { class: "schema-invalid", reason: "transition-refused" } });
    const done = await dispatch(transitionRequest({ operation_id: "4f0d8c3a-9b7e-4c1d-8a2f-6e5b4d3c2b1a", expected_revision: revision(OPEN), to: "done", payload: { outcome: { class: "completed", reason: "all criteria met", evidence: [] } } }));
    expect(done.ok, JSON.stringify(done)).toBe(true);
    stored = strictParse(bytesOf(OPEN));
    expect(stored.ok && (stored.value as Record<string, unknown>).claim).toEqual(CLAIM);
    expect(stored.ok && (stored.value as Record<string, unknown>).status).toBe("done");
    expect(okResult(await dispatch({ op: "validate", workbench: root, record: { path: OPEN } })).valid).toBe(true);
  });

  // --- the record kinds (FJ02 step 3): one case per kind, and the decision's references ---

  /** The record kinds' starting records: the valid fixtures, written into the temp copy with a narrative beside each. */
  const seedRecord = (fixtureRel: string, store: string, stem: string): string => {
    const value = fixture(fixtureRel);
    const narrative = `shared/${store}/${stem}.md`;
    const path = `shared/${store}/${stem}.record.json`;
    mkdirSync(join(root, "shared", store), { recursive: true });
    writeFileSync(join(root, narrative), `# ${stem}\n`);
    writeFileSync(join(root, path), serialise({ ...value, narrative: { path: narrative } }));
    return path;
  };
  const controlOf = (path: string): Record<string, unknown> => {
    const p = strictParse(bytesOf(path));
    if (!p.ok) throw new Error(p.detail);
    return (p.value as { control: Record<string, unknown> }).control;
  };
  const recordMove = async (path: string, to: string, payload: TransitionRequest["payload"], id: string): Promise<Response> =>
    dispatch(transitionRequest({ operation_id: id, record: { path }, expected_revision: revision(path), to, reason: `move to ${to}`, payload }));
  /** Asserts FJ01's response shape for a record kind, and that the record is valid and at `to`. */
  const landed = async (r: Response, path: string, from: string, to: string, id: string): Promise<void> => {
    const result = okResult(r);
    expect(Object.keys(result)).toEqual(["operation_id", "path", "from", "to", "revision", "previous_revision"]);
    expect(result).toMatchObject({ operation_id: id, path, from, to, revision: revision(path) });
    if (r.ok) expect(r.revisions).toEqual({ [path]: revision(path) });
    expect(controlOf(path).state).toBe(to);
    const stored = strictParse(bytesOf(path));
    if (!stored.ok) throw new Error(stored.detail);
    expect(bytesOf(path).toString("utf-8"), "the stored bytes are the deterministic serialisation").toBe(serialise(stored.value));
    expect(okResult(await dispatch({ op: "validate", workbench: root, record: { path } })).valid).toBe(true);
  };

  it("issue: open to closed with a fixed disposition lands; closing without one is refused and the record untouched", async () => {
    const before = bytesOf(ISSUE);
    expect(await recordMove(ISSUE, "closed", {}, "5a0d8c3a-9b7e-4c1d-8a2f-6e5b4d3c2b1a")).toMatchObject({ ok: false, error: { class: "schema-invalid", reason: "transition-refused" } });
    expect(bytesOf(ISSUE).equals(before)).toBe(true);
    const id = "5b0d8c3a-9b7e-4c1d-8a2f-6e5b4d3c2b1a";
    const disposition = { kind: "fixed", reason_ref: "260928-1200-parser-fix.md" };
    await landed(await recordMove(ISSUE, "closed", { disposition }, id), ISSUE, "open", "closed", id);
    expect(controlOf(ISSUE).disposition).toEqual(disposition);
  });

  it("plan: open to in_progress moves the state only; steps and criteria stay as stored", async () => {
    const path = seedRecord("record/plan-open-unadopted.json", "plans", "260929-1000-a-plan");
    const steps = controlOf(path).steps;
    const id = "5c0d8c3a-9b7e-4c1d-8a2f-6e5b4d3c2b1a";
    await landed(await recordMove(path, "in_progress", {}, id), path, "open", "in_progress", id);
    expect(controlOf(path).steps).toEqual(steps);
  });

  it("discussion: open to closed", async () => {
    const path = seedRecord("record/discussion-open.json", "discussions", "260929-1000-a-discussion");
    const id = "5d0d8c3a-9b7e-4c1d-8a2f-6e5b4d3c2b1a";
    await landed(await recordMove(path, "closed", {}, id), path, "open", "closed", id);
  });

  it("decision: open to deferred with a deferral to an external target; without one it is refused", async () => {
    const path = seedRecord("record/decision-open.json", "decisions", "260929-1000-a-decision");
    expect(await recordMove(path, "deferred", {}, "5e0d8c3a-9b7e-4c1d-8a2f-6e5b4d3c2b1a")).toMatchObject({ ok: false, error: { class: "schema-invalid", reason: "transition-refused" } });
    const deferral = { target: { kind: "external" as const, name: "v1.x" }, ruled_by: ACTOR };
    const id = "5f0d8c3a-9b7e-4c1d-8a2f-6e5b4d3c2b1a";
    await landed(await recordMove(path, "deferred", { deferral }, id), path, "open", "deferred", id);
    expect(controlOf(path)).toMatchObject({ deferral, answer_ref: null, implementation_ref: null, superseded_by: null });
  });

  it("decision: open to answered by a citation string (carried unresolved), then to implemented by a reference that resolves", async () => {
    const path = seedRecord("record/decision-open.json", "decisions", "260929-1000-a-decision");
    const answered = "6a0d8c3a-9b7e-4c1d-8a2f-6e5b4d3c2b1a";
    await landed(await recordMove(path, "answered", { answer_ref: "260809-1400-fixture-format-consultation.md" }, answered), path, "open", "answered", answered);
    expect(controlOf(path).answer_ref).toBe("260809-1400-fixture-format-consultation.md");

    // implementation_ref as a reference, not a commit hash: the widened
    // protocol payload (git_commit | reference), end to end.
    const wbId = "5d6d15ba-5b44-45b2-8aa2-39dd3bf82964";
    const dangling = { workbench_id: wbId, record_id: "00000000-0000-4000-8000-00000000dead" };
    const before = bytesOf(path);
    expect(await recordMove(path, "implemented", { implementation_ref: dangling }, "6b0d8c3a-9b7e-4c1d-8a2f-6e5b4d3c2b1a")).toMatchObject({ ok: false, error: { class: "unresolved-reference", reason: "record-not-found" } });
    expect(await recordMove(path, "implemented", { implementation_ref: { ...dangling, workbench_id: "00000000-0000-4000-8000-000000000000" } }, "6b1d8c3a-9b7e-4c1d-8a2f-6e5b4d3c2b1a")).toMatchObject({ ok: false, error: { class: "unresolved-reference", reason: "foreign-workbench" } });
    expect(bytesOf(path).equals(before), "a refused reference writes nothing").toBe(true);
    const ref = { workbench_id: wbId, record_id: "591d5bf4-2219-46b6-a0d3-cbdb28d6af16", display: "260928-1200-parser-fix.md" };
    const implemented = "6c0d8c3a-9b7e-4c1d-8a2f-6e5b4d3c2b1a";
    await landed(await recordMove(path, "implemented", { implementation_ref: ref }, implemented), path, "answered", "implemented", implemented);
    expect(controlOf(path)).toMatchObject({ implementation_ref: ref, answer_ref: "260809-1400-fixture-format-consultation.md" });
  });

  it("decision: implementation_ref as a git commit, and an artefact reference checked against the bytes on disk", async () => {
    const path = seedRecord("record/decision-open.json", "decisions", "260929-1000-a-decision");
    const note = "shared/decisions/260929-1000-a-decision.md";
    const artefact = { path: note, sha256: revision(note), kind: "decision" };
    expect(await recordMove(path, "answered", { answer_ref: { ...artefact, sha256: "sha256:" + "0".repeat(64) } }, "6d0d8c3a-9b7e-4c1d-8a2f-6e5b4d3c2b1a")).toMatchObject({ ok: false, error: { class: "missing-evidence", reason: "artefact-changed" } });
    expect(await recordMove(path, "answered", { answer_ref: { ...artefact, path: "shared/decisions/absent.md" } }, "6d1d8c3a-9b7e-4c1d-8a2f-6e5b4d3c2b1a")).toMatchObject({ ok: false, error: { class: "unresolved-reference", reason: "artefact-missing" } });
    const id = "6e0d8c3a-9b7e-4c1d-8a2f-6e5b4d3c2b1a";
    await landed(await recordMove(path, "implemented", { implementation_ref: "20942d0c" }, id), path, "open", "implemented", id);
    expect(controlOf(path).implementation_ref).toBe("20942d0c");
  });

  it("decision: a state the target forbids a field in is refused by the record schema, and nothing is written", async () => {
    const path = seedRecord("record/decision-open.json", "decisions", "260929-1000-a-decision");
    const before = bytesOf(path);
    // answered carries no implementation_ref (record.schema.json decision_control).
    const r = await recordMove(path, "answered", { answer_ref: "260809-1400-fixture-format-consultation.md", implementation_ref: "20942d0c" }, "6f0d8c3a-9b7e-4c1d-8a2f-6e5b4d3c2b1a");
    expect(r).toMatchObject({ ok: false, error: { class: "schema-invalid", reason: "result-invalid" } });
    expect(bytesOf(path).equals(before)).toBe(true);
  });

  it("a legacy workbench refuses mutation with unsupported-format/legacy-workbench", async () => {
    unlinkSync(join(root, "workbench.json"));
    expect(await dispatch(transitionRequest())).toMatchObject({ ok: false, error: { class: "unsupported-format", reason: "legacy-workbench" } });
  });

  it("a missing record is unresolved-reference", async () => {
    expect(await dispatch(transitionRequest({ record: { path: "work-packages/absent/package.json" } }))).toMatchObject({ ok: false, error: { class: "unresolved-reference", reason: "record-not-found" } });
  });

  // --- foreign payload fields (Prior's FJ03c response 37) ---

  const SCHEMAS = fileURLToPath(new URL("../../schemas/", import.meta.url));
  const schemaFile = (name: string) => JSON.parse(readFileSync(join(SCHEMAS, name), "utf-8"));
  const journalOf = (): string[] => (existsSync(join(root, ".json-state", "journal")) ? readdirSync(join(root, ".json-state", "journal")) : []);
  const storedAnswer = (id: string): boolean => existsSync(join(root, ".json-state", "ops", `${id}.json`));

  it("TRANSITION_PAYLOAD_FIELDS is the transition payload read against each kind's control fields in the schemas, and Prior's table at b912302", () => {
    // The derivation of `hooks/lib/__tests__/record-write.test.ts` for the
    // client's PAYLOAD_FIELDS, so both hosts' tables are one set.
    const payload = schemaFile("protocol.schema.json").oneOf.find((b: { properties: { op: { const?: string } } }) => b.properties.op.const === "transition").properties.payload.properties;
    const kinds: Record<string, object> = { package: schemaFile("package.schema.json").properties };
    for (const k of ["issue", "plan", "decision", "discussion"]) kinds[k] = schemaFile("record.schema.json").$defs[`${k}_control`].properties;
    const derived = Object.fromEntries(Object.entries(kinds).map(([k, props]) => [k, Object.keys(payload).filter((f) => f in props)]));
    expect(TRANSITION_PAYLOAD_FIELDS).toEqual(derived);
    expect(TRANSITION_PAYLOAD_FIELDS).toEqual({
      package: ["claim", "outcome"],
      issue: ["disposition"],
      plan: ["steps", "criteria"],
      decision: ["answer_ref", "implementation_ref", "superseded_by", "deferral"],
      discussion: [],
    });
    expect(Object.keys(TRANSITION_PAYLOAD_FIELDS).sort(), "one row per kind the table moves").toEqual(Object.keys(transitions().kinds).sort());
    expect(Object.values(TRANSITION_PAYLOAD_FIELDS).flat().sort(), "every payload field admitted on some kind").toEqual(Object.keys(payload).sort());
  });

  /** One record per kind, the move it lands with its own fields, and a foreign field from another row. */
  const perKind = (): Array<{ kind: string; path: string; to: string; own: TransitionRequest["payload"]; foreign: TransitionRequest["payload"] }> => [
    { kind: "package", path: OPEN, to: "claimed", own: { claim: CLAIM }, foreign: { disposition: { kind: "fixed", reason_ref: "260928-1200-parser-fix.md" } } },
    { kind: "issue", path: ISSUE, to: "closed", own: { disposition: { kind: "fixed", reason_ref: "260928-1200-parser-fix.md" } }, foreign: { outcome: { class: "completed", reason: "r", evidence: [] } } },
    { kind: "plan", path: seedRecord("record/plan-open-unadopted.json", "plans", "260929-1000-a-plan"), to: "in_progress", own: { steps: [{ id: "step-1", state: "done" }] }, foreign: { answer_ref: "260809-1400-fixture-format-consultation.md" } },
    { kind: "decision", path: seedRecord("record/decision-open.json", "decisions", "260929-1000-a-decision"), to: "answered", own: { answer_ref: "260809-1400-fixture-format-consultation.md" }, foreign: { claim: CLAIM } },
    { kind: "discussion", path: seedRecord("record/discussion-open.json", "discussions", "260929-1000-a-discussion"), to: "closed", own: {}, foreign: { deferral: { target: { kind: "external", name: "v1.x" }, ruled_by: ACTOR } } },
  ];

  it("per kind, a field foreign to the kind is schema-invalid/payload-field-not-admitted, a present null too: the record's bytes unchanged, no intent, no stored answer; the move with its own fields then lands", async () => {
    for (const { kind, path, to, own, foreign } of perKind()) {
      const field = Object.keys(foreign ?? {})[0] as string;
      const before = bytesOf(path);
      const cases: Array<[string, TransitionRequest["payload"]]> = [
        ["a foreign field", { ...own, ...foreign }],
        ["a foreign null", { ...own, [field]: null }],
        ["a foreign field alone", { ...foreign }],
      ];
      for (const [label, payload] of cases) {
        const id = randomUUID();
        const r = await recordMove(path, to, payload, id);
        expect(r, `${kind}: ${label}`).toMatchObject({ ok: false, error: { class: "schema-invalid", reason: "payload-field-not-admitted" } });
        if (!r.ok) expect(r.error.detail, `${kind}: ${label}`).toContain(`it carries ${field} (admitted on `);
        expect(bytesOf(path).equals(before), `${kind}: ${label}: bytes`).toBe(true);
        expect(journalOf(), `${kind}: ${label}: intent`).toEqual([]);
        expect(storedAnswer(id), `${kind}: ${label}: answer`).toBe(false);
      }
      const id = randomUUID();
      const moved = await recordMove(path, to, own, id);
      if (kind === "package") {
        expect(okResult(moved), kind).toMatchObject({ operation_id: id, from: "open", to });
        expect(strictParse(bytesOf(path))).toMatchObject({ ok: true, value: { status: to, claim: CLAIM } });
      } else {
        await landed(moved, path, "open", to, id);
      }
    }
  });

  it("the refusal comes before the target state's rules and after the revision check", async () => {
    const before = bytesOf(ISSUE);
    // An edge the table does not list, carrying a foreign field: the field is refused, not the edge.
    expect(await recordMove(ISSUE, "claimed", { claim: CLAIM }, randomUUID())).toMatchObject({ ok: false, error: { class: "schema-invalid", reason: "payload-field-not-admitted" } });
    // A move the state rule refuses without its field, carrying a foreign one: the field is refused.
    expect(await recordMove(ISSUE, "closed", { outcome: null }, randomUUID())).toMatchObject({ ok: false, error: { class: "schema-invalid", reason: "payload-field-not-admitted" } });
    // A stale revision is the caller's first answer, as before.
    expect(await dispatch(transitionRequest({ operation_id: randomUUID(), record: { path: ISSUE }, expected_revision: "sha256:" + "0".repeat(64), to: "closed", payload: { outcome: null } }))).toMatchObject({ ok: false, error: { class: "conflict", reason: "revision-mismatch" } });
    expect(bytesOf(ISSUE).equals(before)).toBe(true);
    expect(journalOf()).toEqual([]);
  });

  it("every admitted field lands on its own kind", async () => {
    const lands = async (path: string, to: string, payload: TransitionRequest["payload"], label: string): Promise<void> => {
      const r = await recordMove(path, to, payload, randomUUID());
      expect(r.ok, `${label}: ${JSON.stringify(r)}`).toBe(true);
    };
    await lands(OPEN, "claimed", { claim: CLAIM }, "package claim");
    await lands(OPEN, "done", { outcome: { class: "completed", reason: "all criteria met", evidence: [] } }, "package outcome");
    await lands(ISSUE, "closed", { disposition: { kind: "fixed", reason_ref: "260928-1200-parser-fix.md" } }, "issue disposition");
    const plan = seedRecord("record/plan-open-unadopted.json", "plans", "260929-1000-a-plan");
    await lands(plan, "in_progress", { steps: [{ id: "step-1", state: "in_progress" }] }, "plan steps");
    await lands(plan, "closed", { criteria: [] }, "plan criteria");
    const decision = seedRecord("record/decision-open.json", "decisions", "260929-1000-a-decision");
    await lands(decision, "answered", { answer_ref: "260809-1400-fixture-format-consultation.md" }, "decision answer_ref");
    await lands(decision, "implemented", { implementation_ref: "20942d0c" }, "decision implementation_ref");
    await lands(decision, "superseded", { superseded_by: { workbench_id: "5d6d15ba-5b44-45b2-8aa2-39dd3bf82964", record_id: "d068e1ae-3f62-429a-880a-2785763aaf01" } }, "decision superseded_by");
    const deferred = seedRecord("record/decision-open.json", "decisions", "260929-1100-another-decision");
    await lands(deferred, "deferred", { deferral: { target: { kind: "external", name: "v1.x" }, ruled_by: ACTOR } }, "decision deferral");
    expect(controlOf(plan)).toMatchObject({ state: "closed", steps: [{ id: "step-1", state: "in_progress" }] });
    expect(controlOf(decision).superseded_by).toMatchObject({ record_id: "d068e1ae-3f62-429a-880a-2785763aaf01" });
  });
  // `claim` and `release` compose their own payload and keep their answers on
  // a record kind: "claim on a record kind is refused in transition's class".
});

// --- claim, release and set-mode (FJ02 step 4) ------------------------------------------

describe("claim, release and set-mode over the shared kernel", () => {
  // Second copies of the scratch workbench, for the cases that run the same
  // input through two entry points and compare what each left behind.
  const copies: string[] = [];
  afterEach(() => {
    for (const d of copies.splice(0)) rmSync(d, { recursive: true, force: true });
  });
  const copy = (): string => {
    const d = mkdtempSync(join(tmpdir(), "codec-ops-copy-"));
    cpSync(FIXTURE, d, { recursive: true });
    copies.push(d);
    return d;
  };

  const PACKAGE = transitions().kinds["package"]!;
  const WB_ID = "5d6d15ba-5b44-45b2-8aa2-39dd3bf82964";
  const STALE = "sha256:" + "0".repeat(64);
  /** A claim another checkout holds, for the combinations with a standing claim. */
  const STANDING = { checkout_id: "b327b5c0", person: "someone else", claimed_at: "2026-09-28T12:00:00+02:00" };
  /** The one state the table's edges of `op` enter, read from the table as the operations read it. */
  const targetOf = (op: string): string => {
    const targets = [...new Set(PACKAGE.edges.filter((e) => e.operation === op).map((e) => e.to))];
    expect(targets, `the ${op} edges of transitions.json`).toHaveLength(1);
    return targets[0] as string;
  };

  const bytesIn = (dir: string, path = OPEN): Buffer => readFileSync(join(dir, path));
  const revisionIn = (dir: string, path = OPEN): string => revisionOf(bytesIn(dir, path));
  const packageIn = (dir: string): Record<string, unknown> => {
    const p = strictParse(bytesIn(dir));
    if (!p.ok) throw new Error(p.detail);
    return p.value as Record<string, unknown>;
  };
  /** Rewrites the open package of `dir` at rest in `status` with `claim` standing, and the outcome a terminal status needs. */
  const seed = (dir: string, status: string, claim: unknown): void => {
    const p = strictParse(readFileSync(join(FIXTURE, OPEN)));
    if (!p.ok) throw new Error(p.detail);
    const terminal = PACKAGE.terminal.includes(status);
    const outcome = terminal ? { class: PACKAGE.outcome_classes?.[status]?.[0], reason: "seeded at rest", evidence: [] } : null;
    writeFileSync(join(dir, OPEN), serialise({ ...(p.value as Record<string, unknown>), status, claim, outcome }));
  };

  const claimRequest = (dir: string, over: Partial<ClaimRequest> = {}): ClaimRequest => ({
    op: "claim",
    workbench: dir,
    operation_id: OP_ID,
    record: { path: OPEN },
    expected_revision: revisionIn(dir),
    actor: ACTOR,
    claim: CLAIM,
    ...over,
  });
  const releaseRequest = (dir: string, over: Partial<ReleaseRequest> = {}): ReleaseRequest => ({
    op: "release",
    workbench: dir,
    operation_id: OP_ID,
    record: { path: OPEN },
    expected_revision: revisionIn(dir),
    actor: ACTOR,
    reason: "session ended",
    ...over,
  });
  const transitionIn = (dir: string, to: string, payload: TransitionRequest["payload"], over: Partial<TransitionRequest> = {}): TransitionRequest =>
    transitionRequest({ workbench: dir, expected_revision: revisionIn(dir), to, payload, ...over });
  const setModeRequest = (dir: string, mode: SetModeRequest["mode"], over: Partial<SetModeRequest> = {}): SetModeRequest => ({
    op: "set-mode",
    workbench: dir,
    operation_id: OP_ID,
    record: { path: OPEN },
    expected_revision: revisionIn(dir),
    actor: ACTOR,
    mode,
    ...over,
  });
  const errorOf = (r: Response): { class: string; reason: string } => {
    expect(r.ok, JSON.stringify(r)).toBe(false);
    if (r.ok) throw new Error("unreachable");
    return { class: r.error.class, reason: r.error.reason };
  };

  // --- the shared-enforcement proof (C20) ---

  it("the shared-enforcement proof: claim and transition to claimed write byte-identical records and answer alike", async () => {
    const other = copy();
    const viaClaim = await dispatch(claimRequest(root));
    const viaTransition = await dispatch(transitionIn(other, "claimed", { claim: CLAIM }));
    expect(viaClaim.ok, JSON.stringify(viaClaim)).toBe(true);
    expect(viaClaim).toEqual(viaTransition);
    expect(okResult(viaClaim).revision).toBe(revisionIn(other));
    expect(bytesIn(root).equals(bytesIn(other)), "the two routes wrote the same bytes").toBe(true);
    // The operation id is bound to the request that used it, whichever route that was.
    expect(await dispatch(claimRequest(root, { expected_revision: okResult(viaClaim).previous_revision as string }))).toEqual(viaClaim);
    expect(errorOf(await dispatch(transitionIn(root, "claimed", { claim: CLAIM })))).toEqual({ class: "conflict", reason: "operation-id-reused" });
  });

  it("the shared-enforcement proof: a stale revision, a claimed package, a malformed claim and claimed_at null are refused in one class on both routes", async () => {
    const a = copy();
    const b = copy();
    const pristine = bytesIn(a);
    const same = async (claimReq: ClaimRequest, transitionReq: TransitionRequest, expected: { class: string; claim: string; transition: string }): Promise<void> => {
      const before = [bytesIn(a), bytesIn(b)];
      const viaClaim = errorOf(await dispatch(claimReq));
      const viaTransition = errorOf(await dispatch(transitionReq));
      expect(viaClaim).toEqual({ class: expected.class, reason: expected.claim });
      expect(viaTransition).toEqual({ class: expected.class, reason: expected.transition });
      expect(bytesIn(a).equals(before[0] as Buffer) && bytesIn(b).equals(before[1] as Buffer), "a refusal writes nothing").toBe(true);
    };
    const nullTime = { ...CLAIM, claimed_at: null };

    await same(claimRequest(a, { expected_revision: STALE }), transitionIn(b, "claimed", { claim: CLAIM }, { expected_revision: STALE }), { class: "conflict", claim: "revision-mismatch", transition: "revision-mismatch" });
    await same(claimRequest(a, { claim: { ...CLAIM, checkout_id: "A216A4B9" } }), transitionIn(b, "claimed", { claim: { ...CLAIM, checkout_id: "A216A4B9" } }), { class: "schema-invalid", claim: "request", transition: "request" });
    await same(claimRequest(a, { claim: nullTime }), transitionIn(b, "claimed", { claim: nullTime }), { class: "schema-invalid", claim: "claimed-at-required", transition: "claimed-at-required" });
    expect(bytesIn(a).equals(pristine)).toBe(true);

    // From paused, the table's other edge into claimed.
    expect((await dispatch(transitionIn(a, "paused", {}, { operation_id: randomUUID() }))).ok).toBe(true);
    expect((await dispatch(transitionIn(b, "paused", {}, { operation_id: randomUUID() }))).ok).toBe(true);
    await same(claimRequest(a, { operation_id: randomUUID(), claim: nullTime }), transitionIn(b, "claimed", { claim: nullTime }, { operation_id: randomUUID() }), { class: "schema-invalid", claim: "claimed-at-required", transition: "claimed-at-required" });

    // A second claim on a claimed package: the table's conflict, with the holder named by claim.
    expect((await dispatch(claimRequest(a, { operation_id: randomUUID() }))).ok).toBe(true);
    expect((await dispatch(transitionIn(b, "claimed", { claim: CLAIM }, { operation_id: randomUUID() }))).ok).toBe(true);
    expect(bytesIn(a).equals(bytesIn(b))).toBe(true);
    const second = await dispatch(claimRequest(a, { operation_id: randomUUID(), claim: STANDING }));
    expect(second.ok).toBe(false);
    if (!second.ok) expect(second.error.detail).toContain(`checkout ${CLAIM.checkout_id}`);
    await same(claimRequest(a, { operation_id: randomUUID(), claim: STANDING }), transitionIn(b, "claimed", { claim: STANDING }, { operation_id: randomUUID() }), { class: "conflict", claim: "already-claimed", transition: "transition-refused" });
  });

  // --- every package status and claim combination (spec section 9), at the operation level ---

  it("claim over every package status with and without a standing claim: the class the table gives, and transition's for the same input", async () => {
    const target = targetOf("claim");
    let combinations = 0;
    for (const status of PACKAGE.states) {
      for (const standing of [null, STANDING]) {
        const label = `claim from ${status} with${standing === null ? "out" : ""} a standing claim`;
        const other = copy();
        seed(root, status, standing);
        seed(other, status, standing);
        const id = randomUUID();
        const viaClaim = await dispatch(claimRequest(root, { operation_id: id }));
        const viaTransition = await dispatch(transitionIn(other, target, { claim: CLAIM }, { operation_id: id }));
        const edge = PACKAGE.edges.find((e) => e.from === status && e.to === target);
        if (edge !== undefined) {
          expect(edge.operation, label).toBe("claim");
          expect(viaClaim.ok, `${label}: ${JSON.stringify(viaClaim)}`).toBe(true);
          expect(viaClaim, label).toEqual(viaTransition);
          expect(bytesIn(root).equals(bytesIn(other)), label).toBe(true);
          expect(packageIn(root).claim, label).toEqual(CLAIM);
        } else {
          const before = bytesIn(root);
          expect(errorOf(viaClaim), label).toEqual({ class: "conflict", reason: status === target ? "already-claimed" : "transition-refused" });
          expect(errorOf(viaTransition), label).toEqual({ class: "conflict", reason: "transition-refused" });
          expect(bytesIn(root).equals(before), label).toBe(true);
        }
        combinations++;
      }
    }
    expect(combinations).toBe(PACKAGE.states.length * 2);
  });

  it("release over every package status with and without a standing claim: the class the table gives, and transition's for the same input", async () => {
    const target = targetOf("release");
    let combinations = 0;
    for (const status of PACKAGE.states) {
      for (const standing of [null, STANDING]) {
        const label = `release from ${status} with${standing === null ? "out" : ""} a standing claim`;
        const other = copy();
        seed(root, status, standing);
        seed(other, status, standing);
        const id = randomUUID();
        const before = bytesIn(root);
        const viaRelease = await dispatch(releaseRequest(root, { operation_id: id }));
        const viaTransition = await dispatch(transitionIn(other, target, { claim: null }, { operation_id: id }));
        const edge = PACKAGE.edges.find((e) => e.from === status && e.to === target);
        if (edge?.operation === "release") {
          expect(viaRelease.ok, `${label}: ${JSON.stringify(viaRelease)}`).toBe(true);
          expect(viaRelease, label).toEqual(viaTransition);
          expect(bytesIn(root).equals(bytesIn(other)), label).toBe(true);
          expect(packageIn(root).claim, label).toBeNull();
        } else {
          expect(errorOf(viaRelease), label).toEqual({ class: "conflict", reason: "not-claimed" });
          expect(bytesIn(root).equals(before), label).toBe(true);
          if (edge === undefined) {
            expect(errorOf(viaTransition), label).toEqual({ class: "conflict", reason: "transition-refused" });
          } else {
            // The table gives this edge to transition, not to release: a
            // package that holds no claim has none to give up.
            expect(edge.operation, label).toBe("transition");
            expect(viaTransition.ok, `${label}: ${JSON.stringify(viaTransition)}`).toBe(true);
          }
        }
        combinations++;
      }
    }
    expect(combinations).toBe(PACKAGE.states.length * 2);
  });

  it("a package at rest in claimed with claimed_at null, as an import may leave it, still moves to paused by transition and to open by release", async () => {
    const imported = { ...STANDING, claimed_at: null };
    seed(root, "claimed", imported);
    const paused = await dispatch(transitionRequest({ operation_id: randomUUID(), expected_revision: revision(OPEN), to: "paused", payload: {} }));
    expect(paused.ok, JSON.stringify(paused)).toBe(true);
    expect(packageIn(root)).toMatchObject({ status: "paused", claim: null });

    seed(root, "claimed", imported);
    const released = await dispatch(releaseRequest(root, { operation_id: randomUUID() }));
    expect(released.ok, JSON.stringify(released)).toBe(true);
    expect(okResult(released)).toMatchObject({ from: "claimed", to: "open" });
    expect(packageIn(root)).toMatchObject({ status: "open", claim: null });
  });

  it("claim and release answer transition's response shape, replay by operation_id, and refuse a divergent reuse", async () => {
    const claimed = await dispatch(claimRequest(root));
    expect(Object.keys(okResult(claimed))).toEqual(["operation_id", "path", "from", "to", "revision", "previous_revision"]);
    expect(okResult(claimed)).toMatchObject({ from: "open", to: "claimed", revision: revision(OPEN) });
    const releaseId = randomUUID();
    const req = releaseRequest(root, { operation_id: releaseId });
    const released = await dispatch(req);
    expect(okResult(released)).toMatchObject({ operation_id: releaseId, from: "claimed", to: "open", revision: revision(OPEN) });
    expect(await dispatch(req)).toEqual(released);
    expect(errorOf(await dispatch({ ...req, reason: "another reason" }))).toEqual({ class: "conflict", reason: "operation-id-reused" });
    expect(okResult(await dispatch({ op: "validate", workbench: root, record: { path: OPEN } })).valid).toBe(true);
  });

  it("claim on a record kind is refused in transition's class; release of a record kind is not-claimed", async () => {
    const issueRevision = revision(ISSUE);
    expect(errorOf(await dispatch(claimRequest(root, { record: { path: ISSUE }, expected_revision: issueRevision })))).toEqual({ class: "schema-invalid", reason: "transition-refused" });
    expect(errorOf(await dispatch(releaseRequest(root, { record: { path: ISSUE }, expected_revision: issueRevision })))).toEqual({ class: "conflict", reason: "not-claimed" });
    expect(revision(ISSUE)).toBe(issueRevision);
  });

  // --- set-mode ---

  /** The user's word in a file of the workbench, as an artefact reference to it. */
  const userWordFile = (): { path: string; sha256: string; kind: "memo" } => {
    const path = "shared/memos/260929-0900-autonomy.md";
    mkdirSync(join(root, "shared", "memos"), { recursive: true });
    writeFileSync(join(root, path), "Run the parser fix autonomously.\n");
    return { path, sha256: revision(path), kind: "memo" };
  };
  const issueId = (): string => {
    const p = strictParse(bytesOf(ISSUE));
    if (!p.ok) throw new Error(p.detail);
    return (p.value as { id: string }).id;
  };

  it("set-mode autonomous with a user-word artefact that resolves lands, validates, and replays; ordinary then writes source null", async () => {
    const source = { kind: "user-word", ref: userWordFile() };
    const req = setModeRequest(root, { value: "autonomous", source });
    const r = await dispatch(req);
    const result = okResult(r);
    expect(result).toEqual({ operation_id: OP_ID, path: OPEN, mode: { value: "autonomous", source }, revision: revision(OPEN), previous_revision: req.expected_revision });
    if (r.ok) expect(r.revisions).toEqual({ [OPEN]: revision(OPEN) });
    expect(packageIn(root).mode).toEqual({ value: "autonomous", source });
    expect(bytesOf(OPEN).toString("utf-8")).toBe(serialise(packageIn(root)));
    expect(okResult(await dispatch({ op: "validate", workbench: root, record: { path: OPEN } })).valid).toBe(true);
    expect(await dispatch(req)).toEqual(r);

    const ordinary = await dispatch(setModeRequest(root, { value: "ordinary", source: null }, { operation_id: randomUUID() }));
    expect(ordinary.ok, JSON.stringify(ordinary)).toBe(true);
    expect(packageIn(root).mode).toEqual({ value: "ordinary", source: null });
  });

  it("set-mode autonomous with a user-word record reference, or a bare record reference, that resolves lands", async () => {
    const ref = { workbench_id: WB_ID, record_id: issueId() };
    expect((await dispatch(setModeRequest(root, { value: "autonomous", source: { kind: "user-word", ref } }))).ok).toBe(true);
    expect((await dispatch(setModeRequest(root, { value: "autonomous", source: ref }, { operation_id: randomUUID() }))).ok).toBe(true);
    expect(packageIn(root).mode).toEqual({ value: "autonomous", source: ref });
  });

  it("set-mode refuses a dangling, foreign or changed source, a null source, a legacy source and a source on ordinary, and writes nothing", async () => {
    const artefact = userWordFile();
    const dangling = { workbench_id: WB_ID, record_id: "00000000-0000-4000-8000-00000000dead" };
    const cases: Array<[string, SetModeRequest["mode"], { class: string; reason: string }]> = [
      ["a dangling user-word record", { value: "autonomous", source: { kind: "user-word", ref: dangling } }, { class: "unresolved-reference", reason: "record-not-found" }],
      ["a dangling bare record", { value: "autonomous", source: dangling }, { class: "unresolved-reference", reason: "record-not-found" }],
      ["a foreign record", { value: "autonomous", source: { kind: "user-word", ref: { ...dangling, workbench_id: "00000000-0000-4000-8000-000000000000" } } }, { class: "unresolved-reference", reason: "foreign-workbench" }],
      ["a missing artefact", { value: "autonomous", source: { kind: "user-word", ref: { ...artefact, path: "shared/memos/absent.md" } } }, { class: "unresolved-reference", reason: "artefact-missing" }],
      ["a changed artefact", { value: "autonomous", source: { kind: "user-word", ref: { ...artefact, sha256: STALE } } }, { class: "missing-evidence", reason: "artefact-changed" }],
      ["a null source", { value: "autonomous", source: null }, { class: "schema-invalid", reason: "result-invalid" }],
      ["a legacy source", { value: "autonomous", source: { kind: "legacy", raw: "**Mode:** autonomous" } }, { class: "schema-invalid", reason: "legacy-source-on-set-mode" }],
      ["a legacy source on ordinary", { value: "ordinary", source: { kind: "legacy", raw: "**Mode:** ordinary" } }, { class: "schema-invalid", reason: "legacy-source-on-set-mode" }],
      ["a source on ordinary", { value: "ordinary", source: { kind: "user-word", ref: artefact } }, { class: "schema-invalid", reason: "source-on-ordinary" }],
    ];
    const before = bytesOf(OPEN);
    for (const [label, mode, expected] of cases) {
      expect(errorOf(await dispatch(setModeRequest(root, mode, { operation_id: randomUUID() }))), label).toEqual(expected);
      expect(bytesOf(OPEN).equals(before), label).toBe(true);
    }
    expect(errorOf(await dispatch(setModeRequest(root, { value: "autonomous", source: { kind: "user-word", ref: artefact } }, { expected_revision: STALE })))).toEqual({ class: "conflict", reason: "revision-mismatch" });
    expect(errorOf(await dispatch(setModeRequest(root, { value: "ordinary", source: null }, { record: { path: ISSUE }, expected_revision: revision(ISSUE) })))).toEqual({ class: "schema-invalid", reason: "not-a-package" });
    expect(existsSync(join(root, ".json-state", "ops", `${OP_ID}.json`)), "a refusal is not stored").toBe(false);
  });

  for (const status of PACKAGE.terminal) {
    it(`set-mode on a package at rest in ${status} is conflict/package-terminal, whatever the mode, and writes nothing`, async () => {
      seed(root, status, CLAIM);
      const before = bytesOf(OPEN);
      const modes: Array<SetModeRequest["mode"]> = [
        { value: "autonomous", source: { kind: "user-word", ref: userWordFile() } },
        { value: "ordinary", source: null },
      ];
      for (const mode of modes) {
        const r = await dispatch(setModeRequest(root, mode, { operation_id: randomUUID() }));
        expect(errorOf(r), mode.value).toEqual({ class: "conflict", reason: "package-terminal" });
        if (!r.ok) expect(r.error.detail).toContain(`the package is ${status}`);
        expect(bytesOf(OPEN).equals(before), mode.value).toBe(true);
      }
    });
  }

  it("the scratch open package never becomes autonomous by any route but set-mode with provenance", async () => {
    // create is the other route a package enters by; its true-origin case in `describe("create")` pins it there.
    const ordinary = { value: "ordinary", source: null };
    const expectOrdinary = (label: string): void => expect(packageIn(root).mode, label).toEqual(ordinary);
    expect(errorOf(await dispatch(transitionRequest({ payload: { claim: CLAIM, mode: { value: "autonomous", source: null } } as TransitionRequest["payload"] })))).toEqual({ class: "schema-invalid", reason: "request" });
    expect(errorOf(await dispatch({ ...claimRequest(root), mode: { value: "autonomous", source: null } }))).toEqual({ class: "schema-invalid", reason: "request" });
    expectOrdinary("refused requests");
    expect((await dispatch(claimRequest(root))).ok).toBe(true);
    expectOrdinary("after claim");
    expect((await dispatch(releaseRequest(root, { operation_id: randomUUID() }))).ok).toBe(true);
    expectOrdinary("after release");
    expect((await dispatch(transitionRequest({ operation_id: randomUUID(), expected_revision: revision(OPEN), to: "paused", payload: {} }))).ok).toBe(true);
    expectOrdinary("after transition");
    expect(errorOf(await dispatch(setModeRequest(root, { value: "autonomous", source: null }, { operation_id: randomUUID() })))).toMatchObject({ class: "schema-invalid" });
    expect(errorOf(await dispatch(setModeRequest(root, { value: "autonomous", source: { kind: "legacy", raw: "**Mode:** autonomous" } }, { operation_id: randomUUID() })))).toMatchObject({ class: "schema-invalid" });
    expectOrdinary("after set-mode without provenance");
    expect((await dispatch(setModeRequest(root, { value: "autonomous", source: { kind: "user-word", ref: userWordFile() } }, { operation_id: randomUUID() }))).ok).toBe(true);
    expect((packageIn(root).mode as { value: string }).value).toBe("autonomous");
  });
});

// --- create ------------------------------------------------------------------------------

describe("create", () => {
  const WB_ID = "5d6d15ba-5b44-45b2-8aa2-39dd3bf82964";
  const OPEN_ID = "591d5bf4-2219-46b6-a0d3-cbdb28d6af16";
  const ISSUE_ID = "d068e1ae-3f62-429a-880a-2785763aaf01";
  const CONTAINER = "work-packages/260928-1200-parser-fix";
  const FROM_OPEN: CreateRequest["origin"] = { kind: "package", ref: { workbench_id: WB_ID, record_id: OPEN_ID } };
  const USER_REQUEST: CreateRequest["origin"] = { kind: "user-request", ref: null };
  const AGENT = { actor: "implementation-planner", person: null };
  const KINDS: Array<CreateRequest["kind"]> = ["package", "issue", "plan", "discussion", "decision"];
  const STORE: Record<CreateRequest["kind"], string> = { package: "work-packages", issue: "issues", plan: "plans", discussion: "discussions", decision: "decisions" };
  const ID: Record<CreateRequest["kind"], string> = {
    package: "3b8e1f4a-6c2d-4e7f-9a1b-2c3d4e5f6a7b",
    issue: "7a1c2e3f-4d5b-4c6a-8b7d-9e0f1a2b3c4d",
    plan: "8a1c2e3f-4d5b-4c6a-8b7d-9e0f1a2b3c4d",
    discussion: "9a1c2e3f-4d5b-4c6a-8b7d-9e0f1a2b3c4d",
    decision: "aa1c2e3f-4d5b-4c6a-8b7d-9e0f1a2b3c4d",
  };
  /** Each kind's payload as a caller sends it: a package's domain, a record's control in its initial state. */
  const PAYLOAD: Record<CreateRequest["kind"], Record<string, unknown>> = {
    package: { domain: "code" },
    issue: { state: "open", disposition: null },
    plan: { state: "open", steps: [{ id: "s1", state: "open" }], criteria: [{ id: "c1", met: null }], acceptance: null },
    discussion: { state: "open", participants: [ACTOR], outcome_refs: [] },
    decision: { state: "open", answer_ref: null, implementation_ref: null, superseded_by: null, deferral: null },
  };
  const contentOf = (kind: string): string => `# A new ${kind}\n\nFiled by the FJ02 create tests.\n`;

  /** A create of `kind`; a record goes into the open package's container unless `at.container` says otherwise; `at.content` null sends no body. */
  const createRequest = (kind: CreateRequest["kind"], over: Partial<CreateRequest> = {}, at: { container?: string | null; stem?: string; content?: string | null } = {}): CreateRequest => {
    const stem = at.stem ?? (kind === "package" ? "260929-0900-journal-recovery" : `260929-1000-new-${kind}`);
    const container = kind === "package" ? null : at.container === undefined ? CONTAINER : at.container;
    const dir = kind === "package" ? `work-packages/${stem}` : `${container ?? "shared"}/${STORE[kind]}`;
    const content = at.content === undefined ? contentOf(kind) : at.content;
    const path = `${dir}/${stem}.md`;
    return {
      op: "create",
      workbench: root,
      operation_id: OP_ID,
      id: ID[kind],
      kind,
      filed_by: ACTOR,
      origin: kind === "package" ? USER_REQUEST : FROM_OPEN,
      scope: { container, store: STORE[kind] },
      narrative: content === null ? { path } : { path, content },
      payload: PAYLOAD[kind],
      ...over,
    };
  };
  const controlOf = (req: CreateRequest): string => {
    const path = req.narrative.path;
    return req.kind === "package" ? path.replace(/[^/]+\.md$/, "package.json") : path.replace(/\.md$/, ".record.json");
  };
  const parsed = (path: string): Record<string, unknown> => {
    const p = strictParse(bytesOf(path));
    if (!p.ok) throw new Error(p.detail);
    return p.value as Record<string, unknown>;
  };
  const errorOf = (r: Response): { class: string; reason: string } => {
    expect(r.ok, JSON.stringify(r)).toBe(false);
    if (r.ok) throw new Error("unreachable");
    return { class: r.error.class, reason: r.error.reason };
  };
  const journal = (): string[] => (existsSync(join(root, ".json-state", "journal")) ? readdirSync(join(root, ".json-state", "journal")) : []);
  const answered = (id: string): boolean => existsSync(join(root, ".json-state", "ops", `${id}.json`));
  /** A refusal wrote nothing: neither half of the pair, no answer, no pending intent. */
  const nothingWritten = (req: CreateRequest, label: string): void => {
    expect(existsSync(join(root, controlOf(req))), `${label}: control`).toBe(false);
    if (req.narrative.content !== undefined) expect(existsSync(join(root, req.narrative.path)), `${label}: narrative`).toBe(false);
    expect(answered(req.operation_id), `${label}: answer`).toBe(false);
    expect(journal(), `${label}: journal`).toEqual([]);
  };
  const writeNarrative = (path: string, text: string): void => {
    mkdirSync(join(root, path, ".."), { recursive: true });
    writeFileSync(join(root, path), text);
  };

  /** What a landed create must have written and answered, for the request that made it. */
  const expectLanded = async (req: CreateRequest, r: Response, narrativeBytes: Buffer, label: string): Promise<void> => {
    const control = controlOf(req);
    expect(r.ok, `${label}: ${JSON.stringify(r)}`).toBe(true);
    if (!r.ok) return;
    expect(r.result, label).toEqual({ operation_id: req.operation_id, path: control, kind: req.kind, revision: revision(control), narrative: { path: req.narrative.path, sha256: revisionOf(narrativeBytes) } });
    expect(r.revisions, label).toEqual({ [control]: revision(control) });
    expect(bytesOf(req.narrative.path).equals(narrativeBytes), `${label}: the narrative's bytes`).toBe(true);
    const record = parsed(control);
    expect(bytesOf(control).toString("utf-8"), `${label}: deterministic bytes`).toBe(serialise(record));
    expect(record, label).toMatchObject({
      id: req.id,
      workbench_id: WB_ID,
      narrative: { path: req.narrative.path },
      filed_by: req.filed_by,
      provenance: { source: "created", legacy_fields: {} },
      extensions: {},
    });
    if (req.kind === "package") {
      expect(record, label).toMatchObject({
        schema: "fusion.package/v1",
        domain: req.payload.domain,
        status: "open",
        claim: null,
        mode: { value: "ordinary", source: null },
        origin: req.origin,
        depends_on: [],
        active_documents: [],
        references: req.payload.references ?? [],
        evidence: [],
        outcome: null,
      });
    } else {
      expect(record, label).toMatchObject({ schema: "fusion.record/v1", kind: req.kind, references: [], control: req.payload });
    }
    expect(okResult(await dispatch({ op: "validate", workbench: root, record: { path: control } })), label).toMatchObject({ checked: 1, valid: true, findings: [] });
  };
  const land = async (req: CreateRequest, label = `${req.kind}`): Promise<Response> => {
    const r = await dispatch(req);
    await expectLanded(req, r, req.narrative.content !== undefined ? Buffer.from(req.narrative.content, "utf-8") : bytesOf(req.narrative.path), label);
    return r;
  };

  // --- every kind ---

  for (const kind of KINDS) {
    it(`${kind}, with content: one operation writes both halves; the record is the kernel's, deterministic and valid`, async () => {
      const places: Array<string | null> = kind === "package" ? [null] : [CONTAINER, null];
      for (const container of places) {
        const req = createRequest(kind, { operation_id: randomUUID(), id: randomUUID() }, { container });
        expect(existsSync(join(root, req.narrative.path)), "the narrative is new").toBe(false);
        await land(req, `${kind} in ${container ?? "shared"}`);
      }
      const all = okResult(await dispatch({ op: "validate", workbench: root }));
      expect(all).toMatchObject({ checked: 3 + places.length, valid: true, findings: [] });
    });

    it(`${kind}, without content: the narrative already there is left as it is, and the control file is the one write`, async () => {
      const req = createRequest(kind, {}, { content: null });
      writeNarrative(req.narrative.path, "# Written before the record\n");
      const before = bytesOf(req.narrative.path);
      const mtime = statSync(join(root, req.narrative.path)).mtimeMs;
      await land(req);
      expect(bytesOf(req.narrative.path).equals(before)).toBe(true);
      expect(statSync(join(root, req.narrative.path)).mtimeMs, "the narrative was not rewritten").toBe(mtime);
    });
  }

  it("a create into a container that exists but lacks the store directory creates it", async () => {
    for (const kind of ["issue", "plan", "discussion", "decision"] as const) {
      expect(existsSync(join(root, CONTAINER, STORE[kind])), `${CONTAINER}/${STORE[kind]} before`).toBe(false);
      await land(createRequest(kind, { operation_id: randomUUID() }));
      expect(statSync(join(root, CONTAINER, STORE[kind])).isDirectory()).toBe(true);
    }
  });

  it("a package payload's references are carried; its domain is required and never null", async () => {
    const references = ["260928-1200-parser-fix.md", { workbench_id: WB_ID, record_id: ISSUE_ID }];
    await land(createRequest("package", { payload: { domain: "data", references } }));
    for (const payload of [{}, { domain: null }, { references: [] }]) {
      const req = createRequest("package", { operation_id: randomUUID(), id: randomUUID(), payload }, { stem: "260929-0901-no-domain" });
      expect(errorOf(await dispatch(req)), JSON.stringify(payload)).toEqual({ class: "schema-invalid", reason: "domain-required" });
      nothingWritten(req, JSON.stringify(payload));
    }
  });

  // --- replay ---

  it("an identical retry returns the stored answer and touches nothing; a divergent one is operation-id-reused; a fresh id is record-exists", async () => {
    const req = createRequest("package");
    const first = await land(req);
    const control = controlOf(req);
    const mtimes = [statSync(join(root, control)).mtimeMs, statSync(join(root, req.narrative.path)).mtimeMs];
    expect(await dispatch(req)).toEqual(first);
    expect([statSync(join(root, control)).mtimeMs, statSync(join(root, req.narrative.path)).mtimeMs]).toEqual(mtimes);
    const divergent = { ...req, narrative: { ...req.narrative, content: `${req.narrative.content ?? ""}one line more\n` } };
    expect(errorOf(await dispatch(divergent))).toEqual({ class: "conflict", reason: "operation-id-reused" });
    // The same pair under a fresh operation id: the kernel's absence check, never a second creation.
    const again = await dispatch({ ...req, operation_id: randomUUID() });
    expect(errorOf(again)).toEqual({ class: "conflict", reason: "record-exists" });
    expect(errorOf(await dispatch({ ...req, operation_id: randomUUID(), id: randomUUID() }))).toEqual({ class: "conflict", reason: "record-exists" });
    expect([statSync(join(root, control)).mtimeMs, statSync(join(root, req.narrative.path)).mtimeMs]).toEqual(mtimes);
  });

  /** A package create whose request serialises to `bytes` exactly, its content the padding. */
  const createOfSize = (bytes: number, over: Partial<CreateRequest> = {}, stem?: string): CreateRequest => {
    const base = createRequest("package", over, { content: "", stem });
    const overhead = Buffer.byteLength(JSON.stringify(base), "utf-8");
    // The final newline serialises as the two bytes `\n`.
    const req = { ...base, narrative: { ...base.narrative, content: `${"x".repeat(bytes - overhead - 2)}\n` } };
    expect(Buffer.byteLength(JSON.stringify(req), "utf-8")).toBe(bytes);
    return req;
  };
  const runBundle = (req: unknown): Response => {
    const { FUSION_WORKBENCH: _drop, ...env } = process.env;
    const r = spawnSync(process.execPath, [BUNDLE], { input: JSON.stringify(req), encoding: "utf-8", env, maxBuffer: 4 * MAX_RECORD_BYTES });
    expect(r.status, r.stderr).toBe(0);
    return JSON.parse(r.stdout) as Response;
  };

  it("a request within 16 bytes of the 1 MiB request cap lands through the bundle; its stored answer reads back; identical and divergent retries (C12)", () => {
    const req = createOfSize(MAX_RECORD_BYTES - 16);
    const first = runBundle(req);
    expect(first.ok, JSON.stringify(first).slice(0, 400)).toBe(true);
    expect(bytesOf(req.narrative.path).toString("utf-8")).toBe(req.narrative.content);
    expect(journal()).toEqual([]);
    // The stored answer carries the request's digest, never its body, and is read back by the strict reader.
    const answer = readFileSync(join(root, ".json-state", "ops", `${OP_ID}.json`));
    expect(answer.byteLength).toBeLessThan(4096);
    const stored = strictParse(answer);
    expect(stored.ok).toBe(true);
    if (stored.ok) expect(Object.keys(stored.value as object).sort()).toEqual(["op", "operation_id", "request_digest", "response"]);
    expect(runBundle(req)).toEqual(first);
    const content = req.narrative.content ?? "";
    const divergent = { ...req, narrative: { ...req.narrative, content: `${content.slice(0, -2)}y\n` } };
    expect(runBundle(divergent)).toMatchObject({ ok: false, error: { class: "conflict", reason: "operation-id-reused" } });
    // One byte over the cap is refused before any operation runs.
    const over = createOfSize(MAX_RECORD_BYTES + 1, { operation_id: randomUUID(), id: randomUUID() }, "260929-0902-over-cap");
    expect(runBundle(over)).toMatchObject({
      ok: false,
      error: { class: "schema-invalid", reason: "too-large" },
    });
    expect(existsSync(join(root, "work-packages", "260929-0902-over-cap"))).toBe(false);
  });

  it("the same near-cap create cut after its intent: the intent and its staged narrative read back, and recovery lands the pair", async () => {
    const req = createOfSize(MAX_RECORD_BYTES - 16);
    await expect(dispatch(req, { kernel: { faults: { cutAt: "after-intent" } } })).rejects.toBeInstanceOf(CutReached);
    expect(journal()).toEqual([OP_ID]);
    expect(existsSync(join(root, req.narrative.path))).toBe(false);
    const shown = okResult(await dispatch({ op: "show", workbench: root, record: { path: controlOf(req) } }));
    expect(shown.narrative).toEqual({ path: req.narrative.path, sha256: revisionOf(Buffer.from(req.narrative.content ?? "", "utf-8")) });
    expect(journal()).toEqual([]);
    const retry = await dispatch(req);
    expect(okResult(retry)).toMatchObject({ operation_id: OP_ID, path: controlOf(req), revision: revision(controlOf(req)) });
  });

  // --- true origin (spec section 9: package formation by agents; no invented autonomous) ---

  it("an agent filing under a package origin that resolves lands with mode ordinary whatever the payload attempts, and filed_by as sent", async () => {
    const base = createRequest("package", { filed_by: AGENT, origin: FROM_OPEN });
    const attempts: Array<[string, Record<string, unknown>]> = [
      ["mode", { domain: "code", mode: { value: "autonomous", source: { kind: "user-word", ref: { workbench_id: WB_ID, record_id: ISSUE_ID } } } }],
      ["status", { domain: "code", status: "claimed" }],
      ["claim", { domain: "code", claim: CLAIM }],
      ["origin", { domain: "code", origin: USER_REQUEST }],
    ];
    for (const [field, payload] of attempts) {
      const req = { ...base, operation_id: randomUUID(), payload };
      const r = await dispatch(req);
      expect(errorOf(r), field).toEqual({ class: "schema-invalid", reason: "payload-field-not-admitted" });
      if (!r.ok) expect(r.error.detail, field).toContain(field);
      nothingWritten(req, field);
    }
    expect(errorOf(await dispatch({ ...base, mode: { value: "autonomous", source: null } }))).toEqual({ class: "schema-invalid", reason: "request" });
    await land(base);
    const record = parsed(controlOf(base));
    expect(record.mode).toEqual({ value: "ordinary", source: null });
    expect(record.filed_by).toEqual(AGENT);
    expect(record.origin).toEqual(FROM_OPEN);
    // A record an agent files under a package origin carries no origin field; the origin was checked all the same.
    await land(createRequest("issue", { operation_id: randomUUID(), filed_by: AGENT }));
  });

  it("an origin that does not resolve to a package of this workbench is refused and nothing is written", async () => {
    const dangling = { workbench_id: WB_ID, record_id: "00000000-0000-4000-8000-00000000dead" };
    const cases: Array<[string, CreateRequest["origin"], { class: string; reason: string }]> = [
      ["a dangling package ref", { kind: "package", ref: dangling }, { class: "unresolved-reference", reason: "record-not-found" }],
      ["a foreign package ref", { kind: "package", ref: { ...dangling, workbench_id: "00000000-0000-4000-8000-000000000000" } }, { class: "unresolved-reference", reason: "foreign-workbench" }],
      ["a package ref to an issue", { kind: "package", ref: { workbench_id: WB_ID, record_id: ISSUE_ID } }, { class: "unresolved-reference", reason: "not-a-package" }],
      ["a campaign ref to an issue", { kind: "campaign", ref: { workbench_id: WB_ID, record_id: ISSUE_ID } }, { class: "unresolved-reference", reason: "not-a-package" }],
      ["a package origin without a ref", { kind: "package", ref: null }, { class: "schema-invalid", reason: "origin-ref-required" }],
      ["a user request with a ref", { kind: "user-request", ref: { workbench_id: WB_ID, record_id: OPEN_ID } }, { class: "schema-invalid", reason: "origin-ref-not-admitted" }],
      ["legacy-unknown", { kind: "legacy-unknown", ref: null }, { class: "schema-invalid", reason: "origin-legacy-on-create" }],
    ];
    for (const kind of ["package", "issue"] as const) {
      for (const [label, origin, expected] of cases) {
        const req = createRequest(kind, { operation_id: randomUUID(), origin });
        const r = await dispatch(req);
        expect(errorOf(r), `${kind}: ${label}`).toEqual(expected);
        if (!r.ok && origin.kind === "campaign") expect(r.error.detail).toContain("campaign records are not addressable in FJ02");
        nothingWritten(req, `${kind}: ${label}`);
      }
    }
    // A campaign origin resolves against packages only, and one that names a package lands.
    await land(createRequest("package", { origin: { kind: "campaign", ref: { workbench_id: WB_ID, record_id: OPEN_ID } } }));
  });

  // --- where the pair goes ---

  it("scope, kind and path must agree, a container must be a package directory, and a new name is marker-free", async () => {
    const issue = createRequest("issue");
    const cases: Array<[string, CreateRequest, { class: string; reason: string }]> = [
      ["an issue into the plans store", { ...issue, scope: { container: CONTAINER, store: "plans" } }, { class: "unknown-scope", reason: "store-kind-mismatch" }],
      ["an issue whose narrative is outside its scope", { ...issue, narrative: { ...issue.narrative, path: `${CONTAINER}/plans/260929-1000-new-issue.md` } }, { class: "unknown-scope", reason: "store-kind-mismatch" }],
      ["an issue whose narrative is in shared/ while the scope names a container", { ...issue, narrative: { ...issue.narrative, path: "shared/issues/260929-1000-new-issue.md" } }, { class: "unknown-scope", reason: "store-kind-mismatch" }],
      ["a package inside a container", createRequest("package", { scope: { container: CONTAINER, store: "work-packages" } }), { class: "unknown-scope", reason: "store-kind-mismatch" }],
      ["a package whose narrative is not <d>/<d>.md", createRequest("package", { narrative: { path: "work-packages/260929-0900-journal-recovery/260929-0901-other.md", content: "x\n" } }), { class: "unknown-scope", reason: "store-kind-mismatch" }],
      ["a container that does not exist", createRequest("issue", {}, { container: "work-packages/260929-1111-absent" }), { class: "unknown-scope", reason: "container-missing" }],
      ["a container without a package record", createRequest("issue", {}, { container: "shared" }), { class: "unknown-scope", reason: "container-missing" }],
      ["a marker-bearing record name", createRequest("issue", {}, { stem: "260929-1000_o_empty-input" }), { class: "schema-invalid", reason: "narrative-name" }],
      ["a marker-bearing package name", createRequest("package", {}, { stem: "260929-0900_o_journal-recovery" }), { class: "schema-invalid", reason: "narrative-name" }],
      ["a name without its stamp", createRequest("issue", {}, { stem: "empty-input" }), { class: "schema-invalid", reason: "narrative-name" }],
    ];
    for (const [label, req, expected] of cases) {
      const r = await dispatch({ ...req, operation_id: randomUUID() });
      expect(errorOf(r), label).toEqual(expected);
      expect(journal(), label).toEqual([]);
      expect(existsSync(join(root, req.narrative.path)), label).toBe(false);
    }
  });

  it("the id, the control file and the narrative: id-in-use, record-exists, narrative-exists, narrative-missing", async () => {
    const taken = createRequest("issue", { id: OPEN_ID });
    expect(errorOf(await dispatch(taken))).toEqual({ class: "conflict", reason: "id-in-use" });
    nothingWritten(taken, "id-in-use");

    const withBody = createRequest("issue", { operation_id: randomUUID() });
    writeNarrative(withBody.narrative.path, "# Already here\n");
    expect(errorOf(await dispatch(withBody))).toEqual({ class: "conflict", reason: "narrative-exists" });
    expect(bytesOf(withBody.narrative.path).toString("utf-8")).toBe("# Already here\n");
    expect(existsSync(join(root, controlOf(withBody)))).toBe(false);

    const withoutBody = createRequest("plan", { operation_id: randomUUID() }, { content: null });
    expect(errorOf(await dispatch(withoutBody))).toEqual({ class: "unresolved-reference", reason: "narrative-missing" });
    nothingWritten(withoutBody, "narrative-missing");

    // A control file standing without a create: record-exists, whatever the narrative.
    const standing = createRequest("decision", { operation_id: randomUUID() });
    writeNarrative(controlOf(standing), readFileSync(join(root, ISSUE)).toString("utf-8"));
    expect(errorOf(await dispatch(standing))).toEqual({ class: "conflict", reason: "record-exists" });
    expect(existsSync(join(root, standing.narrative.path))).toBe(false);
  });

  it("a record payload is its control in the kind's initial state; anything else is refused and nothing is written", async () => {
    const cases: Array<[string, CreateRequest["kind"], Record<string, unknown>, { class: string; reason: string }]> = [
      ["a closed issue", "issue", { state: "closed", disposition: { kind: "fixed", reason_ref: null } }, { class: "schema-invalid", reason: "not-initial-state" }],
      ["an issue without its disposition", "issue", { state: "open" }, { class: "schema-invalid", reason: "not-initial-state" }],
      ["an issue carrying a candidate", "issue", { state: "open", disposition: null, candidate: {} }, { class: "schema-invalid", reason: "payload-field-not-admitted" }],
      ["a plan in progress", "plan", { ...PAYLOAD.plan, state: "in_progress" }, { class: "schema-invalid", reason: "not-initial-state" }],
      ["an adopted plan", "plan", { ...PAYLOAD.plan, acceptance: { ref: { workbench_id: WB_ID, record_id: OPEN_ID }, revision: revision(OPEN) } }, { class: "schema-invalid", reason: "not-initial-state" }],
      ["a closed discussion", "discussion", { ...PAYLOAD.discussion, state: "closed" }, { class: "schema-invalid", reason: "not-initial-state" }],
      ["an answered decision", "decision", { ...PAYLOAD.decision, state: "answered", answer_ref: "260928-1200-parser-fix.md" }, { class: "schema-invalid", reason: "not-initial-state" }],
      ["an open decision with an answer", "decision", { ...PAYLOAD.decision, answer_ref: "260928-1200-parser-fix.md" }, { class: "schema-invalid", reason: "not-initial-state" }],
      ["a discussion whose participants are not actors", "discussion", { ...PAYLOAD.discussion, participants: ["kai"] }, { class: "schema-invalid", reason: "result-invalid" }],
      ["a plan without steps", "plan", { state: "open", criteria: [], acceptance: null }, { class: "schema-invalid", reason: "result-invalid" }],
    ];
    for (const [label, kind, payload, expected] of cases) {
      const req = createRequest(kind, { operation_id: randomUUID(), payload });
      expect(errorOf(await dispatch(req)), label).toEqual(expected);
      nothingWritten(req, label);
    }
  });

  it("content with a lone surrogate, which has no UTF-8 encoding, is refused rather than written altered", async () => {
    const req = createRequest("issue", {}, { content: "# Broken \ud800 body\n" });
    expect(errorOf(await dispatch(req))).toEqual({ class: "schema-invalid", reason: "narrative-not-utf8" });
    nothingWritten(req, "lone surrogate");
  });

  it("the valid fixtures create.json and create-with-content.json land on the scratch workbench", async () => {
    const issue = { ...fixture("protocol/create.json"), workbench: root } as unknown as CreateRequest;
    writeNarrative(issue.narrative.path, "# Empty input\n");
    await land(issue, "create.json");
    await land({ ...fixture("protocol/create-with-content.json"), workbench: root, operation_id: randomUUID() } as unknown as CreateRequest, "create-with-content.json");
  });
});

// --- main.ts, spawned on the committed bundle ------------------------------------------

describe("main.ts on dist/fusion-record.js", () => {
  const run = (args: string[], input: string, env: Record<string, string | undefined> = {}) => {
    const { FUSION_WORKBENCH: _drop, ...base } = process.env;
    return spawnSync(process.execPath, [BUNDLE, ...args], { input, encoding: "utf-8", env: { ...base, ...env } });
  };
  const parse = (stdout: string): Response => JSON.parse(stdout) as Response;

  it("the bundle exists", () => {
    expect(existsSync(BUNDLE), `${BUNDLE} is absent: run \`npm run build\` in codec/ (npm test does)`).toBe(true);
  });

  it("show on stdin: one response line on stdout, nothing on stderr, exit 0", () => {
    const r = run([], JSON.stringify({ op: "show", workbench: root, record: { path: OPEN } }));
    expect(r.status, r.stderr).toBe(0);
    expect(r.stderr).toBe("");
    expect(r.stdout.endsWith("\n")).toBe(true);
    expect(r.stdout.trim().split("\n")).toHaveLength(1);
    const response = parse(r.stdout);
    expect(response.ok).toBe(true);
    if (!response.ok) return;
    expect((response.result as Record<string, unknown>).revision).toBe(revision(OPEN));
  });

  it("--file reads the request from a file; FUSION_WORKBENCH is the default workbench", () => {
    const file = join(root, "request.json");
    writeFileSync(file, JSON.stringify({ op: "list", scope: "shared/issues" }));
    const r = run(["--file", file], "", { FUSION_WORKBENCH: root });
    expect(r.status, r.stderr).toBe(0);
    const response = parse(r.stdout);
    expect(response.ok).toBe(true);
    if (!response.ok) return;
    expect(((response.result as Record<string, unknown>).records as unknown[]).length).toBe(1);
    // An explicit workbench wins over the environment.
    const explicit = run([], JSON.stringify({ op: "inspect", workbench: join(root, "absent") }), { FUSION_WORKBENCH: root });
    expect(parse(explicit.stdout)).toMatchObject({ ok: false, error: { reason: "workbench-missing" } });
  });

  it("a transition through the bundle lands and replays", () => {
    const req = transitionRequest();
    const first = run([], JSON.stringify(req));
    expect(first.status).toBe(0);
    const a = parse(first.stdout);
    expect(a.ok, first.stdout).toBe(true);
    expect(parse(run([], JSON.stringify(req)).stdout)).toEqual(a);
    expect(parse(run([], JSON.stringify({ ...req, reason: "x" })).stdout)).toMatchObject({ ok: false, error: { reason: "operation-id-reused" } });
  });

  it("claim and release through the bundle land; a claim with claimed_at null is refused there too", () => {
    const base = { workbench: root, record: { path: OPEN }, actor: ACTOR };
    const refused = parse(run([], JSON.stringify({ ...base, op: "claim", operation_id: OP_ID, expected_revision: revision(OPEN), claim: { ...CLAIM, claimed_at: null } })).stdout);
    expect(refused).toMatchObject({ ok: false, error: { class: "schema-invalid", reason: "claimed-at-required" } });
    const claimed = parse(run([], JSON.stringify({ ...base, op: "claim", operation_id: OP_ID, expected_revision: revision(OPEN), claim: CLAIM })).stdout);
    expect(claimed).toMatchObject({ ok: true, result: { from: "open", to: "claimed" } });
    const released = parse(run([], JSON.stringify({ ...base, op: "release", operation_id: "1f0d8c3a-9b7e-4c1d-8a2f-6e5b4d3c2b1a", expected_revision: revision(OPEN), reason: "done for today" })).stdout);
    expect(released).toMatchObject({ ok: true, result: { from: "claimed", to: "open", revision: revision(OPEN) } });
  });

  it("a request that is not strict JSON is answered schema-invalid on stdout, exit 0", () => {
    const r = run([], '{"op": "inspect",}');
    expect(r.status).toBe(0);
    expect(r.stderr).toBe("");
    expect(parse(r.stdout)).toMatchObject({ ok: false, error: { class: "schema-invalid", reason: "syntax" } });
    const dup = run([], '{"op": "inspect", "op": "list"}');
    expect(parse(dup.stdout)).toMatchObject({ ok: false, error: { class: "schema-invalid", reason: "duplicate-key" } });
  });

  it("usage errors exit 2 with the reason on stderr and nothing on stdout", () => {
    for (const args of [["--bogus"], ["--file"], ["--file", join(root, "absent.json")]]) {
      const r = run(args, "");
      expect(r.status, args.join(" ")).toBe(2);
      expect(r.stdout).toBe("");
      expect(r.stderr).toMatch(/^fusion-record: /);
    }
  });

  it("without a workbench anywhere the answer is unknown-scope, exit 0", () => {
    const r = run([], JSON.stringify({ op: "inspect" }));
    expect(r.status).toBe(0);
    expect(parse(r.stdout)).toMatchObject({ ok: false, error: { class: "unknown-scope", reason: "workbench-unspecified" } });
  });
});

// --- set-dependencies and adopt-plan ----------------------------------------------------

describe("set-dependencies and adopt-plan", () => {
  const WB_ID = "5d6d15ba-5b44-45b2-8aa2-39dd3bf82964";
  const OPEN_ID = "591d5bf4-2219-46b6-a0d3-cbdb28d6af16";
  const DONE_ID = "b6e23b92-0f65-4a35-89c9-2a53e4ac37c0";
  const ISSUE_ID = "d068e1ae-3f62-429a-880a-2785763aaf01";
  const CONTAINER = "work-packages/260928-1200-parser-fix";
  const P1 = "11111111-1111-4111-8111-111111111111";
  const P2 = "22222222-2222-4222-8222-222222222222";
  const PLAN_A = "aaaaaaaa-0000-4000-8000-00000000000a";
  const PLAN_B = "bbbbbbbb-0000-4000-8000-00000000000b";
  const SPEC_1 = "cccccccc-0000-4000-8000-00000000000c";
  const SPEC_2 = "dddddddd-0000-4000-8000-00000000000d";
  const refTo = (record_id: string): RecordRef => ({ workbench_id: WB_ID, record_id });

  const errorOf = (r: Response): { class: string; reason: string } => {
    expect(r.ok, JSON.stringify(r)).toBe(false);
    if (r.ok) throw new Error("unreachable");
    return { class: r.error.class, reason: r.error.reason };
  };
  const detailOf = (r: Response): string => (r.ok ? "" : (r.error.detail ?? ""));
  const parsed = (path: string): Record<string, unknown> => {
    const p = strictParse(bytesOf(path));
    if (!p.ok) throw new Error(p.detail);
    return p.value as Record<string, unknown>;
  };
  const controlOfRecord = (path: string): Record<string, unknown> => parsed(path).control as Record<string, unknown>;
  const journal = (): string[] => (existsSync(join(root, ".json-state", "journal")) ? readdirSync(join(root, ".json-state", "journal")) : []);
  const answered = (id: string): boolean => existsSync(join(root, ".json-state", "ops", `${id}.json`));
  /** A refusal wrote nothing: every named file at its bytes before, no answer, no pending intent. */
  const unchanged = (before: Record<string, Buffer>, id: string, label: string): void => {
    for (const [path, bytes] of Object.entries(before)) expect(bytesOf(path).equals(bytes), `${label}: ${path}`).toBe(true);
    expect(answered(id), `${label}: answer`).toBe(false);
    expect(journal(), `${label}: journal`).toEqual([]);
  };
  const snapshot = (...paths: string[]): Record<string, Buffer> => Object.fromEntries(paths.map((p) => [p, bytesOf(p)]));
  const writeAt = (path: string, text: string): void => {
    mkdirSync(join(root, path, ".."), { recursive: true });
    writeFileSync(join(root, path), text);
  };

  /** A new open package, created through the kernel; its control path. */
  const newPackage = async (id: string, stem: string): Promise<string> => {
    const r = await dispatch({
      op: "create",
      workbench: root,
      operation_id: randomUUID(),
      id,
      kind: "package",
      filed_by: ACTOR,
      origin: { kind: "user-request", ref: null },
      scope: { container: null, store: "work-packages" },
      narrative: { path: `work-packages/${stem}/${stem}.md`, content: `# ${stem}\n` },
      payload: { domain: "code" },
    } satisfies CreateRequest);
    expect(r.ok, JSON.stringify(r)).toBe(true);
    return `work-packages/${stem}/package.json`;
  };
  /** A new open plan record in the open package's container, with its body; its control and narrative paths. */
  const newPlan = async (id: string, stem: string): Promise<{ control: string; narrative: string }> => {
    const narrative = `${CONTAINER}/plans/${stem}.md`;
    const r = await dispatch({
      op: "create",
      workbench: root,
      operation_id: randomUUID(),
      id,
      kind: "plan",
      filed_by: ACTOR,
      origin: { kind: "package", ref: refTo(OPEN_ID) },
      scope: { container: CONTAINER, store: "plans" },
      narrative: { path: narrative, content: `# ${stem}\n\n1. The one step.\n` },
      payload: { state: "open", steps: [{ id: "s1", state: "open" }], criteria: [], acceptance: null },
    } satisfies CreateRequest);
    expect(r.ok, JSON.stringify(r)).toBe(true);
    return { control: `${CONTAINER}/plans/${stem}.record.json`, narrative };
  };

  const depsRequest = (path: string, depends_on: SetDependenciesRequest["depends_on"], over: Partial<SetDependenciesRequest> = {}): SetDependenciesRequest => ({
    op: "set-dependencies",
    workbench: root,
    operation_id: randomUUID(),
    record: { path },
    expected_revision: revision(path),
    actor: ACTOR,
    depends_on,
    ...over,
  });
  const on = (record_id: string, condition: "terminal" | "succeeded" = "terminal"): SetDependenciesRequest["depends_on"][number] => ({ target: refTo(record_id), condition });

  const adoptRequest = (planId: string, narrative: string, over: Partial<AdoptPlanRequest> = {}): AdoptPlanRequest => ({
    op: "adopt-plan",
    workbench: root,
    operation_id: randomUUID(),
    record: { path: OPEN },
    expected_revision: revision(OPEN),
    actor: ACTOR,
    plan: refTo(planId),
    revision: revision(narrative),
    ...over,
  });
  const acceptanceBy = (pkgId: string, narrative: string): Record<string, unknown> => ({ ref: refTo(pkgId), revision: revision(narrative) });
  const validAll = async (label: string): Promise<void> => {
    expect(okResult(await dispatch({ op: "validate", workbench: root })), label).toMatchObject({ valid: true, findings: [] });
  };

  // --- set-dependencies: targets ---

  it("targets that resolve to packages land whatever their state and condition: the conditions are not evaluated; the list replaces the stored one; replays", async () => {
    const p1 = await newPackage(P1, "260929-1101-first");
    // A done target under `succeeded` whose outcome binds no accepted evidence, and an open target: both unmet, both land.
    const depends_on = [on(DONE_ID, "succeeded"), on(P1, "succeeded")];
    const req = depsRequest(OPEN, depends_on);
    const first = await dispatch(req);
    expect(okResult(first)).toEqual({ operation_id: req.operation_id, path: OPEN, depends_on, revision: revision(OPEN), previous_revision: req.expected_revision });
    expect(first.ok && first.revisions).toEqual({ [OPEN]: revision(OPEN) });
    expect(parsed(OPEN).depends_on).toEqual(depends_on);
    expect(parsed(p1).status, "the target is untouched").toBe("open");
    await validAll("after set-dependencies");

    expect(await dispatch(req)).toEqual(first);
    expect(errorOf(await dispatch({ ...req, depends_on: [] }))).toEqual({ class: "conflict", reason: "operation-id-reused" });

    // Replaced whole, never merged.
    okResult(await dispatch(depsRequest(OPEN, [on(DONE_ID)])));
    expect(parsed(OPEN).depends_on).toEqual([on(DONE_ID)]);
    okResult(await dispatch(depsRequest(OPEN, [])));
    expect(parsed(OPEN).depends_on).toEqual([]);
  });

  it("targets that do not resolve, that are records, that are evidence records, that are foreign: refused, nothing written", async () => {
    const plan = await newPlan(PLAN_A, "260929-1102-plan-a");
    const evidence = { ...fixture("evidence/accept-prior-enforced.json"), id: "eeeeeeee-0000-4000-8000-00000000000e" };
    writeAt("shared/reviews/260929-1103-review.evidence.json", `${JSON.stringify(evidence, null, 2)}\n`);
    const cases: Array<[string, SetDependenciesRequest["depends_on"], { class: string; reason: string }]> = [
      ["an id no control file carries", [on("99999999-0000-4000-8000-000000000009")], { class: "unresolved-reference", reason: "record-not-found" }],
      ["an issue record", [on(ISSUE_ID)], { class: "unresolved-reference", reason: "not-a-package" }],
      ["a plan record", [on(PLAN_A)], { class: "unresolved-reference", reason: "not-a-package" }],
      ["an evidence record", [on(evidence.id as string)], { class: "unresolved-reference", reason: "not-a-package" }],
      ["a package of another workbench", [{ target: { workbench_id: "0e0e0e0e-0000-4000-8000-000000000000", record_id: DONE_ID }, condition: "terminal" }], { class: "unresolved-reference", reason: "foreign-workbench" }],
      ["a good target before a bad one", [on(DONE_ID), on(ISSUE_ID)], { class: "unresolved-reference", reason: "not-a-package" }],
    ];
    const before = snapshot(OPEN, plan.control);
    for (const [label, depends_on, expected] of cases) {
      const req = depsRequest(OPEN, depends_on);
      expect(errorOf(await dispatch(req)), label).toEqual(expected);
      unchanged(before, req.operation_id, label);
    }
  });

  it("the package itself is conflict/self-dependency; two edges to one target are schema-invalid/duplicate-target", async () => {
    const before = snapshot(OPEN);
    for (const depends_on of [[on(OPEN_ID)], [on(DONE_ID), on(OPEN_ID, "succeeded")]]) {
      const req = depsRequest(OPEN, depends_on);
      const r = await dispatch(req);
      expect(errorOf(r)).toEqual({ class: "conflict", reason: "self-dependency" });
      expect(detailOf(r)).toContain(OPEN_ID);
      unchanged(before, req.operation_id, "self");
    }
    const dup = depsRequest(OPEN, [on(DONE_ID, "terminal"), on(DONE_ID, "succeeded")]);
    expect(errorOf(await dispatch(dup))).toEqual({ class: "schema-invalid", reason: "duplicate-target" });
    unchanged(before, dup.operation_id, "duplicate");
    // Identical entries never reach the operation: the protocol schema's uniqueItems refuses the request.
    expect(errorOf(await dispatch(depsRequest(OPEN, [on(DONE_ID), on(DONE_ID)])))).toEqual({ class: "schema-invalid", reason: "request" });
  });

  // --- set-dependencies: cycles ---

  it("a two-node cycle is conflict/cycle naming both ids, and nothing is written", async () => {
    const p1 = await newPackage(P1, "260929-1101-first");
    okResult(await dispatch(depsRequest(p1, [on(OPEN_ID)])));
    const before = snapshot(OPEN, p1);
    const req = depsRequest(OPEN, [on(DONE_ID), on(P1, "succeeded")]);
    const r = await dispatch(req);
    expect(errorOf(r)).toEqual({ class: "conflict", reason: "cycle" });
    expect(detailOf(r)).toContain(`${OPEN_ID} -> ${P1} -> ${OPEN_ID}`);
    unchanged(before, req.operation_id, "two-node");
  });

  it("a three-node cycle is conflict/cycle naming the three ids in edge order, and nothing is written", async () => {
    const p1 = await newPackage(P1, "260929-1101-first");
    const p2 = await newPackage(P2, "260929-1102-second");
    okResult(await dispatch(depsRequest(p1, [on(P2)])));
    okResult(await dispatch(depsRequest(p2, [on(OPEN_ID)])));
    const before = snapshot(OPEN, p1, p2);
    const req = depsRequest(OPEN, [on(P1)]);
    const r = await dispatch(req);
    expect(errorOf(r)).toEqual({ class: "conflict", reason: "cycle" });
    expect(detailOf(r)).toContain(`${OPEN_ID} -> ${P1} -> ${P2} -> ${OPEN_ID}`);
    unchanged(before, req.operation_id, "three-node");
    // The same three nodes closed from P2's end: P1 -> P2 stands, OPEN -> P1 lands once P2 no longer points back.
    okResult(await dispatch(depsRequest(p2, [])));
    okResult(await dispatch(depsRequest(OPEN, [on(P1)])));
    const closing = await dispatch(depsRequest(p2, [on(OPEN_ID)]));
    expect(errorOf(closing)).toEqual({ class: "conflict", reason: "cycle" });
    expect(detailOf(closing)).toContain(`${P2} -> ${OPEN_ID} -> ${P1} -> ${P2}`);
  });

  it("a cycle the request neither makes nor can break (not through this package) does not refuse it; a cycle through it does", async () => {
    const p1 = await newPackage(P1, "260929-1101-first");
    const p2 = await newPackage(P2, "260929-1102-second");
    okResult(await dispatch(depsRequest(p1, [on(P2)])));
    // P2 -> P1 by hand: the cycle P1 -> P2 -> P1 exists before the request.
    writeFileSync(join(root, p2), serialise({ ...parsed(p2), depends_on: [on(P1)] }));
    const r = await dispatch(depsRequest(OPEN, [on(P1)]));
    expect(okResult(r).depends_on).toEqual([on(P1)]);
    // Setting P1's list through the kernel meets the cycle through P1.
    const again = await dispatch(depsRequest(p1, [on(P2), on(DONE_ID)]));
    expect(errorOf(again)).toEqual({ class: "conflict", reason: "cycle" });
    expect(detailOf(again)).toContain(`${P1} -> ${P2} -> ${P1}`);
  });

  it("a terminal package, a record and a stale revision are refused before any target is read", async () => {
    const r1 = depsRequest(DONE, [on(OPEN_ID)]);
    expect(errorOf(await dispatch(r1))).toEqual({ class: "conflict", reason: "package-terminal" });
    expect(errorOf(await dispatch(depsRequest(ISSUE, [on(OPEN_ID)])))).toEqual({ class: "schema-invalid", reason: "not-a-package" });
    expect(errorOf(await dispatch(depsRequest(OPEN, [on(DONE_ID)], { expected_revision: revision(DONE) })))).toEqual({ class: "conflict", reason: "revision-mismatch" });
    unchanged(snapshot(OPEN, DONE, ISSUE), r1.operation_id, "refusals");
  });

  // --- adopt-plan ---

  it("a plan adopted by a package without one: the entry and the record's acceptance, two writes in one intent; replays", async () => {
    const a = await newPlan(PLAN_A, "260929-1102-plan-a");
    const req = adoptRequest(PLAN_A, a.narrative);
    const first = await dispatch(req);
    expect(okResult(first)).toEqual({
      operation_id: req.operation_id,
      path: OPEN,
      role: "plan",
      document: { path: a.control, revision: revision(a.control), narrative: { path: a.narrative, sha256: revision(a.narrative) } },
      replaced: null,
      revision: revision(OPEN),
      previous_revision: req.expected_revision,
    });
    expect(first.ok && first.revisions).toEqual({ [a.control]: revision(a.control), [OPEN]: revision(OPEN) });
    expect(parsed(OPEN).active_documents).toEqual([{ ref: refTo(PLAN_A), role: "plan", revision: revision(a.narrative) }]);
    expect(controlOfRecord(a.control).acceptance).toEqual(acceptanceBy(OPEN_ID, a.narrative));
    for (const path of [OPEN, a.control]) expect(bytesOf(path).toString("utf-8"), `${path}: deterministic bytes`).toBe(serialise(parsed(path)));
    await validAll("after adopt-plan");

    expect(await dispatch(req)).toEqual(first);
    expect(errorOf(await dispatch({ ...req, role: "spec" }))).toEqual({ class: "conflict", reason: "operation-id-reused" });
  });

  it("a replacement adopt-plan lands all three files: one plan entry, the replaced ref in references, the replaced record's acceptance cleared; maxContains is never reached", async () => {
    const a = await newPlan(PLAN_A, "260929-1102-plan-a");
    const b = await newPlan(PLAN_B, "260929-1103-plan-b");
    okResult(await dispatch(adoptRequest(PLAN_A, a.narrative)));
    const req = adoptRequest(PLAN_B, b.narrative);
    const r = await dispatch(req);
    expect(okResult(r)).toMatchObject({ role: "plan", replaced: refTo(PLAN_A), revision: revision(OPEN) });
    expect(r.ok && r.revisions).toEqual({ [b.control]: revision(b.control), [a.control]: revision(a.control), [OPEN]: revision(OPEN) });
    const pkg = parsed(OPEN);
    expect(pkg.active_documents).toEqual([{ ref: refTo(PLAN_B), role: "plan", revision: revision(b.narrative) }]);
    expect(pkg.references).toEqual([refTo(PLAN_A)]);
    expect(controlOfRecord(a.control).acceptance).toBeNull();
    expect(controlOfRecord(b.control).acceptance).toEqual(acceptanceBy(OPEN_ID, b.narrative));
    await validAll("after the replacement");
    expect(await dispatch(req)).toEqual(r);

    // Replacing back: the entry is replaced again, never appended; references carry each replaced ref once.
    okResult(await dispatch(adoptRequest(PLAN_A, a.narrative)));
    const again = parsed(OPEN);
    expect((again.active_documents as Array<{ role: string }>).filter((d) => d.role === "plan")).toHaveLength(1);
    expect(again.references).toEqual([refTo(PLAN_A), refTo(PLAN_B)]);
    okResult(await dispatch(adoptRequest(PLAN_B, b.narrative)));
    expect(parsed(OPEN).references, "a ref already there is not added twice").toEqual([refTo(PLAN_A), refTo(PLAN_B)]);
    await validAll("after replacing back and forth");
  });

  it("the revision check: a narrative edited after show is conflict/plan-revision-mismatch naming both hashes, nothing written; the new hash lands", async () => {
    const a = await newPlan(PLAN_A, "260929-1102-plan-a");
    const shown = okResult(await dispatch({ op: "show", workbench: root, record: { path: a.control } }));
    const accepted = (shown.narrative as { sha256: string }).sha256;
    writeFileSync(join(root, a.narrative), `${bytesOf(a.narrative).toString("utf-8")}2. A step added after show.\n`);
    const req = adoptRequest(PLAN_A, a.narrative, { revision: accepted });
    const before = snapshot(OPEN, a.control);
    const r = await dispatch(req);
    expect(errorOf(r)).toEqual({ class: "conflict", reason: "plan-revision-mismatch" });
    expect(detailOf(r)).toContain(accepted);
    expect(detailOf(r)).toContain(revision(a.narrative));
    unchanged(before, req.operation_id, "stale narrative revision");
    okResult(await dispatch(adoptRequest(PLAN_A, a.narrative)));
    expect(controlOfRecord(a.control).acceptance).toEqual(acceptanceBy(OPEN_ID, a.narrative));
  });

  for (const state of transitions().kinds["plan"]?.terminal ?? []) {
    it(`a plan record in the terminal state ${state} is conflict/plan-terminal, nothing written`, async () => {
      const a = await newPlan(PLAN_A, "260929-1102-plan-a");
      okResult(await dispatch({ op: "transition", workbench: root, operation_id: randomUUID(), record: { path: a.control }, expected_revision: revision(a.control), actor: ACTOR, to: state, reason: "terminal target" } satisfies TransitionRequest));
      const req = adoptRequest(PLAN_A, a.narrative);
      const before = snapshot(OPEN, a.control);
      expect(errorOf(await dispatch(req))).toEqual({ class: "conflict", reason: "plan-terminal" });
      unchanged(before, req.operation_id, state);
    });
  }

  for (const state of transitions().kinds["plan"]?.terminal ?? []) {
    it(`a replaced plan record already ${state} is history and not written: two writes, its ref still moved, the new plan adopted`, async () => {
      const a = await newPlan(PLAN_A, "260929-1102-plan-a");
      const b = await newPlan(PLAN_B, "260929-1103-plan-b");
      okResult(await dispatch(adoptRequest(PLAN_A, a.narrative)));
      okResult(await dispatch({ op: "transition", workbench: root, operation_id: randomUUID(), record: { path: a.control }, expected_revision: revision(a.control), actor: ACTOR, to: state, reason: "terminal before replacement" } satisfies TransitionRequest));
      const old = bytesOf(a.control);
      const r = await dispatch(adoptRequest(PLAN_B, b.narrative));
      expect(okResult(r)).toMatchObject({ role: "plan", replaced: refTo(PLAN_A) });
      expect(r.ok && r.revisions).toEqual({ [b.control]: revision(b.control), [OPEN]: revision(OPEN) });
      expect(bytesOf(a.control).equals(old), `the ${state} plan's bytes are unchanged`).toBe(true);
      expect(controlOfRecord(a.control)).toMatchObject({ state, acceptance: acceptanceBy(OPEN_ID, a.narrative) });
      expect(parsed(OPEN)).toMatchObject({ active_documents: [{ ref: refTo(PLAN_B), role: "plan", revision: revision(b.narrative) }], references: [refTo(PLAN_A)] });
      expect(controlOfRecord(b.control).acceptance).toEqual(acceptanceBy(OPEN_ID, b.narrative));
      await validAll(`${state} and replaced`);
    });
  }

  it("a plan adopted by another package is conflict/plan-adopted-elsewhere naming the holder", async () => {
    const a = await newPlan(PLAN_A, "260929-1102-plan-a");
    const p1 = await newPackage(P1, "260929-1101-first");
    okResult(await dispatch(adoptRequest(PLAN_A, a.narrative)));
    const req = adoptRequest(PLAN_A, a.narrative, { record: { path: p1 }, expected_revision: revision(p1) });
    const before = snapshot(OPEN, p1, a.control);
    const r = await dispatch(req);
    expect(errorOf(r)).toEqual({ class: "conflict", reason: "plan-adopted-elsewhere" });
    expect(detailOf(r)).toContain(OPEN_ID);
    unchanged(before, req.operation_id, "elsewhere");
    // ... and as a spec there too: the record's one acceptance says who holds it.
    expect(errorOf(await dispatch({ ...req, operation_id: randomUUID(), role: "spec" }))).toEqual({ class: "conflict", reason: "plan-adopted-elsewhere" });
  });

  it("a document that is no plan record is refused: an issue or a package is not-a-plan, an unknown id record-not-found, a foreign one foreign-workbench", async () => {
    const any = "work-packages/260928-1200-parser-fix/260928-1200-parser-fix.md";
    const cases: Array<[string, RecordRef, { class: string; reason: string }]> = [
      ["an issue record", refTo(ISSUE_ID), { class: "unresolved-reference", reason: "not-a-plan" }],
      ["a package", refTo(DONE_ID), { class: "unresolved-reference", reason: "not-a-plan" }],
      ["an unknown id", refTo("99999999-0000-4000-8000-000000000009"), { class: "unresolved-reference", reason: "record-not-found" }],
      ["another workbench", { workbench_id: "0e0e0e0e-0000-4000-8000-000000000000", record_id: ISSUE_ID }, { class: "unresolved-reference", reason: "foreign-workbench" }],
    ];
    const before = snapshot(OPEN, ISSUE, DONE);
    for (const [label, plan, expected] of cases) {
      const req = adoptRequest(PLAN_A, any, { plan });
      expect(errorOf(await dispatch(req)), label).toEqual(expected);
      unchanged(before, req.operation_id, label);
    }
  });

  it("specs are adopted alongside the plan, any number, distinct by record_id: two writes each; a record is adopted in one role", async () => {
    const a = await newPlan(PLAN_A, "260929-1102-plan-a");
    const s1 = await newPlan(SPEC_1, "260929-1104-spec-one");
    const s2 = await newPlan(SPEC_2, "260929-1105-spec-two");
    okResult(await dispatch(adoptRequest(PLAN_A, a.narrative)));
    for (const [id, s] of [[SPEC_1, s1], [SPEC_2, s2]] as const) {
      const r = await dispatch(adoptRequest(id, s.narrative, { role: "spec" }));
      expect(okResult(r)).toMatchObject({ role: "spec", replaced: null });
      expect(r.ok && r.revisions).toEqual({ [s.control]: revision(s.control), [OPEN]: revision(OPEN) });
      expect(controlOfRecord(s.control).acceptance).toEqual(acceptanceBy(OPEN_ID, s.narrative));
    }
    const entries = (): unknown => parsed(OPEN).active_documents;
    expect(entries()).toEqual([
      { ref: refTo(PLAN_A), role: "plan", revision: revision(a.narrative) },
      { ref: refTo(SPEC_1), role: "spec", revision: revision(s1.narrative) },
      { ref: refTo(SPEC_2), role: "spec", revision: revision(s2.narrative) },
    ]);
    // Re-adopting a spec at a new revision replaces its own entry, in place.
    writeFileSync(join(root, s1.narrative), "# spec one, revised\n");
    okResult(await dispatch(adoptRequest(SPEC_1, s1.narrative, { role: "spec" })));
    expect((entries() as Array<{ revision: string }>)[1]?.revision).toBe(revision(s1.narrative));
    expect((entries() as unknown[]).length).toBe(3);
    expect(parsed(OPEN).references, "a spec replaces nothing").toEqual([]);
    await validAll("plan and two specs");

    // One role per record, whichever way round.
    const before = snapshot(OPEN, a.control, s1.control);
    for (const req of [adoptRequest(PLAN_A, a.narrative, { role: "spec" }), adoptRequest(SPEC_1, s1.narrative, { role: "plan" }), adoptRequest(SPEC_1, s1.narrative)]) {
      expect(errorOf(await dispatch(req)), JSON.stringify(req.plan)).toEqual({ class: "conflict", reason: "role-conflict" });
      unchanged(before, req.operation_id, "role-conflict");
    }
  });

  it("re-adopting the plan in force at a new revision rewrites its entry and moves nothing: two writes", async () => {
    const a = await newPlan(PLAN_A, "260929-1102-plan-a");
    okResult(await dispatch(adoptRequest(PLAN_A, a.narrative)));
    writeFileSync(join(root, a.narrative), "# plan a, revised\n");
    const r = await dispatch(adoptRequest(PLAN_A, a.narrative));
    expect(okResult(r)).toMatchObject({ replaced: null });
    expect(r.ok && r.revisions).toEqual({ [a.control]: revision(a.control), [OPEN]: revision(OPEN) });
    expect(parsed(OPEN)).toMatchObject({ active_documents: [{ ref: refTo(PLAN_A), role: "plan", revision: revision(a.narrative) }], references: [] });
    expect(controlOfRecord(a.control).acceptance).toEqual(acceptanceBy(OPEN_ID, a.narrative));
  });

  it("a replaced plan whose record is gone is still moved into references; there is no acceptance to clear, so two writes", async () => {
    const a = await newPlan(PLAN_A, "260929-1102-plan-a");
    const b = await newPlan(PLAN_B, "260929-1103-plan-b");
    okResult(await dispatch(adoptRequest(PLAN_A, a.narrative)));
    rmSync(join(root, a.control));
    const r = await dispatch(adoptRequest(PLAN_B, b.narrative));
    expect(okResult(r)).toMatchObject({ replaced: refTo(PLAN_A) });
    expect(r.ok && r.revisions).toEqual({ [b.control]: revision(b.control), [OPEN]: revision(OPEN) });
    expect(parsed(OPEN).references).toEqual([refTo(PLAN_A)]);
  });

  it("a terminal package, a record and a stale revision are refused", async () => {
    const a = await newPlan(PLAN_A, "260929-1102-plan-a");
    expect(errorOf(await dispatch(adoptRequest(PLAN_A, a.narrative, { record: { path: DONE }, expected_revision: revision(DONE) })))).toEqual({ class: "conflict", reason: "package-terminal" });
    expect(errorOf(await dispatch(adoptRequest(PLAN_A, a.narrative, { record: { path: ISSUE }, expected_revision: revision(ISSUE) })))).toEqual({ class: "schema-invalid", reason: "not-a-package" });
    expect(errorOf(await dispatch(adoptRequest(PLAN_A, a.narrative, { expected_revision: revision(DONE) })))).toEqual({ class: "conflict", reason: "revision-mismatch" });
    expect(controlOfRecord(a.control).acceptance).toBeNull();
  });
});

// --- attach-evidence, and evidence on done (FJ02 step 7) ------------------------------

describe("attach-evidence, evidence records in the walk, and evidence checked on done", () => {
  const WB_ID = "5d6d15ba-5b44-45b2-8aa2-39dd3bf82964";
  const OPEN_ID = "591d5bf4-2219-46b6-a0d3-cbdb28d6af16";
  const OPEN_NARRATIVE = "work-packages/260928-1200-parser-fix/260928-1200-parser-fix.md";
  const CONTAINER = "work-packages/260928-1200-parser-fix";

  const errorOf = (r: Response): { class: string; reason: string } => {
    expect(r.ok, JSON.stringify(r)).toBe(false);
    if (r.ok) throw new Error("unreachable");
    return { class: r.error.class, reason: r.error.reason };
  };
  const parsed = (path: string): Record<string, unknown> => {
    const p = strictParse(bytesOf(path));
    if (!p.ok) throw new Error(p.detail);
    return p.value as Record<string, unknown>;
  };
  const answered = (id: string): boolean => existsSync(join(root, ".json-state", "ops", `${id}.json`));
  const journal = (): string[] => (existsSync(join(root, ".json-state", "journal")) ? readdirSync(join(root, ".json-state", "journal")) : []);
  const snapshot = (...paths: string[]): Record<string, Buffer> => Object.fromEntries(paths.map((p) => [p, bytesOf(p)]));
  const unchanged = (before: Record<string, Buffer>, id: string, label: string): void => {
    for (const [path, bytes] of Object.entries(before)) expect(bytesOf(path).equals(bytes), `${label}: ${path}`).toBe(true);
    expect(answered(id), `${label}: answer`).toBe(false);
    expect(journal(), `${label}: journal`).toEqual([]);
  };

  let seq = 0;
  /** A fresh evidence id and basename per seed, so one case can seed several side by side. */
  const seed = async (over: Partial<SeedOptions> = {}): Promise<Seeded> => {
    seq += 1;
    const n = String(seq).padStart(2, "0");
    return seedEvidence(root, { package: OPEN, id: `e7e7e7e7-0000-4000-8000-0000000001${n}`, basename: `260929-12${n}-review`, ...over });
  };
  /** As `seed`, the pair placed by hand: for the records `create` refuses, which a consumer must refuse on its own. */
  const place = async (over: Partial<SeedOptions> = {}): Promise<Seeded> => {
    seq += 1;
    const n = String(seq).padStart(2, "0");
    return placeEvidence(root, { package: OPEN, id: `e7e7e7e7-0000-4000-8000-0000000001${n}`, basename: `260929-12${n}-review`, ...over });
  };
  const attachRequest = (evidence: EvidenceRef, over: Partial<AttachEvidenceRequest> = {}): AttachEvidenceRequest => ({
    op: "attach-evidence",
    workbench: root,
    operation_id: randomUUID(),
    record: { path: OPEN },
    expected_revision: revision(OPEN),
    actor: ACTOR,
    evidence,
    ...over,
  });
  const move = async (to: string, payload: TransitionRequest["payload"] = {}): Promise<Response> =>
    dispatch(transitionRequest({ operation_id: randomUUID(), expected_revision: revision(OPEN), to, reason: `move to ${to}`, payload }));

  /**
   * `bindEvidence` run directly, inside a mutation that writes nothing, so it
   * reads the package and the evidence through the kernel's own context, as
   * `attach-evidence`, the `done` transition and `reconcile` do.
   */
  const probe = async (binding: EvidenceRef): Promise<Result<Pair>> => {
    const wb = openWorkbench(root);
    if (!wb.ok) throw new Error(wb.error.detail);
    let out: Result<Pair> | undefined;
    const r = await mutate(wb.value, { op: "probe", operation_id: randomUUID() }, (ctx) => {
      const pkg = ctx.readPair(OPEN);
      if (!pkg.ok) return pkg;
      out = bindEvidence(ctx, pkg.value, binding);
      return { ok: true, value: { writes: [], result: null } };
    });
    expect(r.ok, JSON.stringify(r)).toBe(true);
    if (out === undefined) throw new Error("the probe never ran");
    return out;
  };
  const reasonOf = (r: Result<Pair>): string => (r.ok ? "fresh" : `${r.error.class}/${r.error.reason}`);

  // --- attach ---

  it("attach lands: the binding appended, deterministic bytes, the evidence file validated with the rest; replays; a divergent replay is operation-id-reused", async () => {
    const ev = await seed();
    const req = attachRequest(ev.binding);
    const first = await dispatch(req);
    expect(okResult(first)).toEqual({ operation_id: req.operation_id, path: OPEN, evidence: ev.binding, evidence_record: ev.path, revision: revision(OPEN), previous_revision: req.expected_revision });
    expect(first.ok && first.revisions).toEqual({ [OPEN]: revision(OPEN) });
    expect(parsed(OPEN).evidence).toEqual([ev.binding]);
    expect(bytesOf(OPEN).toString("utf-8")).toBe(serialise(parsed(OPEN)));
    expect(okResult(await dispatch({ op: "validate", workbench: root }))).toMatchObject({ checked: 4, valid: true, findings: [] });

    expect(await dispatch(req)).toEqual(first);
    expect(errorOf(await dispatch({ ...req, evidence: { ...ev.binding, policy: "prior-enforced" } }))).toEqual({ class: "conflict", reason: "operation-id-reused" });
  });

  it("the same record at the same revision bound twice is conflict/evidence-already-bound, nothing written", async () => {
    const ev = await seed();
    okResult(await dispatch(attachRequest(ev.binding)));
    const req = attachRequest(ev.binding);
    const before = snapshot(OPEN);
    expect(errorOf(await dispatch(req))).toEqual({ class: "conflict", reason: "evidence-already-bound" });
    unchanged(before, req.operation_id, "twice");
  });

  it("each refusal of bindEvidence with the one field changed: nothing written", async () => {
    const good = await seed();
    const foreign = "0e0e0e0e-0000-4000-8000-000000000000";
    const cases: Array<[string, () => Promise<EvidenceRef>, { class: string; reason: string }]> = [
      ["an id no control file carries", async () => ({ ...good.binding, ref: { ...good.binding.ref, record_id: "99999999-0000-4000-8000-000000000009" } }), { class: "unresolved-reference", reason: "record-not-found" }],
      ["a ref of another workbench", async () => ({ ...good.binding, ref: { ...good.binding.ref, workbench_id: foreign } }), { class: "unresolved-reference", reason: "foreign-workbench" }],
      ["the id of a package", async () => ({ ...good.binding, ref: { ...good.binding.ref, record_id: OPEN_ID } }), { class: "unresolved-reference", reason: "not-evidence" }],
      ["a revision other than the stored bytes'", async () => ({ ...good.binding, ref: { ...good.binding.ref, revision: "sha256:" + "0".repeat(64) } }), { class: "missing-evidence", reason: "evidence-revision-mismatch" }],
      ["a record the evidence schema refuses", async () => (await place({ over: { verdict: "maybe" } })).binding, { class: "schema-invalid", reason: "evidence-invalid" }],
      ["a report in another directory", async () => (await place({ reportPath: "shared/reviews/260929-1299-review.md" })).binding, { class: "unknown-scope", reason: "report-not-neighbour" }],
      ["a report of another basename", async () => (await place({ reportPath: `${CONTAINER}/reviews/260929-1299-other.md` })).binding, { class: "unknown-scope", reason: "report-not-neighbour" }],
      ["a record of another workbench", async () => (await place({ over: { workbench_id: foreign } })).binding, { class: "unknown-scope", reason: "foreign-workbench-id" }],
      ["a binding claiming prior-enforced for a claude-guided result", async () => ({ ...good.binding, policy: "prior-enforced" }), { class: "schema-invalid", reason: "policy-mismatch" }],
      ["a binding claiming claude-guided for a prior-enforced result", async () => ({ ...(await seed({ policy: "prior-enforced" })).binding, policy: "claude-guided" }), { class: "schema-invalid", reason: "policy-mismatch" }],
      ["a brief revision other than the narrative's now", async () => (await seed({ over: { brief_revision: "sha256:" + "1".repeat(64) } })).binding, { class: "missing-evidence", reason: "brief-changed" }],
      ["a plan revision, and no plan in force", async () => (await seed({ over: { plan_revision: "sha256:" + "2".repeat(64) } })).binding, { class: "missing-evidence", reason: "no-active-plan" }],
      [
        "a report edited after the record",
        async () => {
          const ev = await seed();
          writeFileSync(join(root, ev.report), "# Review, edited afterwards\n");
          return ev.binding;
        },
        { class: "missing-evidence", reason: "report-changed" },
      ],
      [
        "a report removed",
        async () => {
          const ev = await seed();
          unlinkSync(join(root, ev.report));
          return ev.binding;
        },
        { class: "unresolved-reference", reason: "report-missing" },
      ],
    ];
    for (const [label, binding, expected] of cases) {
      const evidence = await binding();
      const req = attachRequest(evidence);
      const before = snapshot(OPEN);
      expect(errorOf(await dispatch(req)), label).toEqual(expected);
      unchanged(before, req.operation_id, label);
    }
    // The unchanged one still binds: every refusal above came from its one field.
    okResult(await dispatch(attachRequest(good.binding)));
  });

  it("plan_revision: bound against the plan in force; a plan at another revision is missing-evidence/plan-changed", async () => {
    const PLAN = "aaaaaaaa-0000-4000-8000-00000000000a";
    const narrative = `${CONTAINER}/plans/260929-1102-plan-a.md`;
    okResult(
      await dispatch({
        op: "create",
        workbench: root,
        operation_id: randomUUID(),
        id: PLAN,
        kind: "plan",
        filed_by: ACTOR,
        origin: { kind: "package", ref: { workbench_id: WB_ID, record_id: OPEN_ID } },
        scope: { container: CONTAINER, store: "plans" },
        narrative: { path: narrative, content: "# plan a\n" },
        payload: { state: "open", steps: [{ id: "s1", state: "open" }], criteria: [], acceptance: null },
      } satisfies CreateRequest),
    );
    okResult(await dispatch({ op: "adopt-plan", workbench: root, operation_id: randomUUID(), record: { path: OPEN }, expected_revision: revision(OPEN), actor: ACTOR, plan: { workbench_id: WB_ID, record_id: PLAN }, revision: revision(narrative) } satisfies AdoptPlanRequest));
    const fresh = await seed();
    expect(fresh.record.plan_revision, "the seed reads the plan in force").toBe(revision(narrative));
    const stale = await seed({ over: { plan_revision: "sha256:" + "3".repeat(64) } });
    const req = attachRequest(stale.binding);
    const before = snapshot(OPEN);
    expect(errorOf(await dispatch(req))).toEqual({ class: "missing-evidence", reason: "plan-changed" });
    unchanged(before, req.operation_id, "plan-changed");
    okResult(await dispatch(attachRequest(fresh.binding)));
  });

  it("a terminal package, a record and a stale revision are refused before the evidence is read", async () => {
    const ev = await seed();
    expect(errorOf(await dispatch(attachRequest(ev.binding, { record: { path: DONE }, expected_revision: revision(DONE) })))).toEqual({ class: "conflict", reason: "package-terminal" });
    expect(errorOf(await dispatch(attachRequest(ev.binding, { record: { path: ISSUE }, expected_revision: revision(ISSUE) })))).toEqual({ class: "schema-invalid", reason: "not-a-package" });
    expect(errorOf(await dispatch(attachRequest(ev.binding, { expected_revision: revision(DONE) })))).toEqual({ class: "conflict", reason: "revision-mismatch" });
    expect(parsed(OPEN).evidence).toEqual([]);
  });

  // --- the naming rule and the correction form (C2) ---

  it("a correction <basename>.2.evidence.json over the unchanged report binds beside the first; one without a predecessor meets the first record's name and is conflict/record-exists", async () => {
    const first = await seed();
    okResult(await dispatch(attachRequest(first.binding)));
    const firstBytes = bytesOf(first.path);
    const reportBytes = bytesOf(first.report);

    const taken = await trySeedCorrection(root, first, { id: "e7e7e7e7-0000-4000-8000-0000000002ff", over: { predecessor: null } });
    expect(taken.ok).toBe(false);
    if (!taken.ok) expect(taken.response).toMatchObject({ ok: false, error: { class: "conflict", reason: "record-exists" } });
    expect(bytesOf(first.path).equals(firstBytes), "the first record is immutable").toBe(true);

    const correction = await seedCorrection(root, first);
    expect(correction.path).toBe(`${first.dir}/${first.basename}.2.evidence.json`);
    expect(correction.report).toBe(first.report);
    expect(correction.record.predecessor).toEqual({ workbench_id: WB_ID, record_id: first.id, revision: first.revision });
    expect(bytesOf(first.report).equals(reportBytes), "the report is unchanged").toBe(true);
    okResult(await dispatch(attachRequest(correction.binding)));
    expect(parsed(OPEN).evidence).toEqual([first.binding, correction.binding]);
    expect(okResult(await dispatch({ op: "validate", workbench: root }))).toMatchObject({ checked: 5, valid: true });
  });

  // --- show, list and validate on an evidence file ---

  it("show answers an evidence file with its report and no narrative; list shows it with status null", async () => {
    const ev = await seed();
    const shown = okResult(await dispatch({ op: "show", workbench: root, record: { path: ev.path } }));
    expect(shown).toEqual({ path: ev.path, kind: "evidence", control: ev.record, revision: ev.revision, narrative: null, report: { path: ev.report, sha256: revision(ev.report), stored: revision(ev.report) } });
    // Every other kind keeps FJ01's answer shape: no report key.
    expect(Object.keys(okResult(await dispatch({ op: "show", workbench: root, record: { path: OPEN } })))).toEqual(["path", "kind", "control", "revision", "narrative"]);
    const records = okResult(await dispatch({ op: "list", workbench: root })).records as Array<Record<string, unknown>>;
    expect(records.find((r) => r.path === ev.path)).toEqual({ path: ev.path, kind: "evidence", id: ev.id, status: null, revision: ev.revision, narrative: null });
  });

  it("validate on an evidence file: valid beside its report; report-changed, report-missing and report-not-neighbour are findings (C2)", async () => {
    const ev = await seed();
    const one = async (path: string): Promise<string[]> => {
      const result = okResult(await dispatch({ op: "validate", workbench: root, record: { path } }));
      expect(result.checked).toBe(1);
      return (result.findings as Array<{ class: string; reason: string }>).map((f) => `${f.class}/${f.reason}`);
    };
    expect(await one(ev.path)).toEqual([]);
    writeFileSync(join(root, ev.report), "# Review, edited\n");
    expect(await one(ev.path)).toEqual(["missing-evidence/report-changed"]);
    unlinkSync(join(root, ev.report));
    expect(await one(ev.path)).toEqual(["unresolved-reference/report-missing"]);
    const elsewhere = await place({ reportPath: "shared/reviews/260929-1299-review.md" });
    expect(await one(elsewhere.path)).toEqual(["unknown-scope/report-not-neighbour"]);
    const otherName = await place({ reportPath: `${CONTAINER}/reviews/260929-1299-other.md` });
    expect(await one(otherName.path)).toEqual(["unknown-scope/report-not-neighbour"]);
  });

  // --- the section 9 check, and done ---

  it("a brief change makes bound evidence stale while a status change alone does not (spec section 9)", async () => {
    const ev = await seed();
    okResult(await dispatch(attachRequest(ev.binding)));
    expect(reasonOf(await probe(ev.binding)), "just attached").toBe("fresh");

    // Status changes alone: open -> paused -> open -> claimed. The package's revision moves; the binding does not go stale.
    const packageRevision = revision(OPEN);
    okResult(await move("paused"));
    okResult(await move("open"));
    okResult(await move("claimed", { claim: CLAIM }));
    expect(revision(OPEN)).not.toBe(packageRevision);
    expect(parsed(OPEN).status).toBe("claimed");
    expect(reasonOf(await probe(ev.binding)), "after the status changes").toBe("fresh");

    // A brief change: the narrative edited.
    writeFileSync(join(root, OPEN_NARRATIVE), `${bytesOf(OPEN_NARRATIVE).toString("utf-8")}\nOne more requirement.\n`);
    expect(reasonOf(await probe(ev.binding)), "after the brief changed").toBe("missing-evidence/brief-changed");
    const before = snapshot(OPEN);
    const done = await move("done", { outcome: { class: "completed", reason: "all criteria met", evidence: [ev.binding] } });
    expect(errorOf(done)).toEqual({ class: "missing-evidence", reason: "brief-changed" });
    expect(bytesOf(OPEN).equals(before[OPEN] as Buffer)).toBe(true);
  });

  it("done: an outcome binding fresh evidence lands; one binding it at the wrong revision is refused and the record untouched", async () => {
    const ev = await seed();
    okResult(await move("claimed", { claim: CLAIM }));
    const before = snapshot(OPEN);
    const wrong = { ...ev.binding, ref: { ...ev.binding.ref, revision: "sha256:" + "0".repeat(64) } };
    const refused = await move("done", { outcome: { class: "completed", reason: "all criteria met", evidence: [wrong] } });
    expect(errorOf(refused)).toEqual({ class: "missing-evidence", reason: "evidence-revision-mismatch" });
    expect(bytesOf(OPEN).equals(before[OPEN] as Buffer)).toBe(true);
    const landed = await move("done", { outcome: { class: "completed", reason: "all criteria met", evidence: [ev.binding] } });
    expect(okResult(landed)).toMatchObject({ from: "claimed", to: "done" });
    expect(parsed(OPEN)).toMatchObject({ status: "done", outcome: { evidence: [ev.binding] } });
  });

  it("an evidence record has no lifecycle: a transition of it is conflict/evidence-immutable and it is untouched", async () => {
    const ev = await seed();
    const before = snapshot(ev.path);
    const r = await dispatch(transitionRequest({ record: { path: ev.path }, expected_revision: ev.revision, to: "closed", payload: {} }));
    expect(errorOf(r)).toEqual({ class: "conflict", reason: "evidence-immutable" });
    expect(bytesOf(ev.path).equals(before[ev.path] as Buffer)).toBe(true);
  });
});

// --- reconcile -------------------------------------------------------------------------
//
// One case per section with its finding provoked on the temp copy, and the
// section 9 checks the step pins: historical markers do not change the JSON
// decision, merge conflicts, and local locks are not cross-checkout
// protection. Every case also holds that reconcile repairs nothing.

describe("reconcile", () => {
  const WB_ID = "5d6d15ba-5b44-45b2-8aa2-39dd3bf82964";
  const OPEN_ID = "591d5bf4-2219-46b6-a0d3-cbdb28d6af16";
  const DONE_ID = "b6e23b92-0f65-4a35-89c9-2a53e4ac37c0";
  const ISSUE_ID = "d068e1ae-3f62-429a-880a-2785763aaf01";
  const MISSING_EVIDENCE = "51f3db37-ef6a-4e92-88d8-6b695df10327";
  const CONTAINER = "work-packages/260928-1200-parser-fix";
  const OPEN_NARRATIVE = `${CONTAINER}/260928-1200-parser-fix.md`;
  const ISSUE_NARRATIVE = "shared/issues/260928-1400-parser-fails-on-empty-input.md";
  const refTo = (record_id: string): RecordRef => ({ workbench_id: WB_ID, record_id });

  type Report = {
    workbench: string;
    state: string;
    scope: string | null;
    checked: number;
    intents: Array<{ operation_id: string; op: string; files: Array<{ path: string; state: string }> }>;
    records: Array<{ path: string; class: string; reason: string; detail: string }>;
    references: Array<{ path: string; at: string; role?: string; status: string; target?: string; class?: string; reason?: string }>;
    evidence: Array<{ path: string; at: string; record_id: string; revision: string; policy: string; status: string; class?: string; reason?: string }>;
    dependencies: Array<Record<string, unknown>>;
    narratives: Array<{ path: string; narrative: string; class: string; reason: string; line: string; line_number: number }>;
  };
  const reconcile = async (scope?: string, at: string = root): Promise<Report> => okResult(await dispatch({ op: "reconcile", workbench: at, ...(scope !== undefined ? { scope } : {}) })) as unknown as Report;
  const errorOf = (r: Response): { class: string; reason: string } => {
    expect(r.ok, JSON.stringify(r)).toBe(false);
    if (r.ok) throw new Error("unreachable");
    return { class: r.error.class, reason: r.error.reason };
  };
  const parsed = (path: string): Record<string, unknown> => {
    const p = strictParse(bytesOf(path));
    if (!p.ok) throw new Error(p.detail);
    return p.value as Record<string, unknown>;
  };
  const writeAt = (path: string, bytes: string | Buffer): void => {
    mkdirSync(join(root, path, ".."), { recursive: true });
    writeFileSync(join(root, path), bytes);
  };
  /** A control record changed by hand, as a pull or an editor would leave it: the operations' checks never ran on it. */
  const rewrite = (path: string, change: (c: Record<string, unknown>) => Record<string, unknown>): void => writeAt(path, serialise(change(parsed(path))));
  /** Every file of the workbench with its bytes, `.json-state/` included: reconcile repairs nothing. */
  const everything = (at: string = root): Record<string, string> => {
    const out: Record<string, string> = {};
    const walk = (dir: string, rel: string): void => {
      for (const e of readdirSync(dir, { withFileTypes: true })) {
        const p = rel === "" ? e.name : `${rel}/${e.name}`;
        if (e.isDirectory()) walk(join(dir, e.name), p);
        else out[p] = readFileSync(join(dir, e.name)).toString("base64");
      }
    };
    walk(at, "");
    return out;
  };
  const move = async (path: string, to: string, payload: TransitionRequest["payload"] = {}): Promise<Response> =>
    dispatch(transitionRequest({ operation_id: randomUUID(), record: { path }, expected_revision: revision(path), to, reason: `move to ${to}`, payload }));

  /** A new open package, created through the kernel with the given origin; its control path. */
  const newPackage = async (id: string, stem: string, origin: CreateRequest["origin"] = { kind: "user-request", ref: null }): Promise<string> => {
    okResult(
      await dispatch({
        op: "create",
        workbench: root,
        operation_id: randomUUID(),
        id,
        kind: "package",
        filed_by: ACTOR,
        origin,
        scope: { container: null, store: "work-packages" },
        narrative: { path: `work-packages/${stem}/${stem}.md`, content: `# ${stem}\n` },
        payload: { domain: "code" },
      } satisfies CreateRequest),
    );
    return `work-packages/${stem}/package.json`;
  };
  const newPlan = async (id: string, stem: string): Promise<{ control: string; narrative: string }> => {
    const narrative = `${CONTAINER}/plans/${stem}.md`;
    okResult(
      await dispatch({
        op: "create",
        workbench: root,
        operation_id: randomUUID(),
        id,
        kind: "plan",
        filed_by: ACTOR,
        origin: { kind: "package", ref: refTo(OPEN_ID) },
        scope: { container: CONTAINER, store: "plans" },
        narrative: { path: narrative, content: `# ${stem}\n` },
        payload: { state: "open", steps: [{ id: "s1", state: "open" }], criteria: [], acceptance: null },
      } satisfies CreateRequest),
    );
    return { control: `${CONTAINER}/plans/${stem}.record.json`, narrative };
  };
  const adopt = (planId: string, narrative: string, operation_id: string = randomUUID()): AdoptPlanRequest => ({
    op: "adopt-plan",
    workbench: root,
    operation_id,
    record: { path: OPEN },
    expected_revision: revision(OPEN),
    actor: ACTOR,
    plan: refTo(planId),
    revision: revision(narrative),
  });
  const setDeps = async (path: string, depends_on: SetDependenciesRequest["depends_on"]): Promise<Response> =>
    dispatch({ op: "set-dependencies", workbench: root, operation_id: randomUUID(), record: { path }, expected_revision: revision(path), actor: ACTOR, depends_on } satisfies SetDependenciesRequest);
  const attach = async (path: string, evidence: EvidenceRef): Promise<Response> =>
    dispatch({ op: "attach-evidence", workbench: root, operation_id: randomUUID(), record: { path }, expected_revision: revision(path), actor: ACTOR, evidence } satisfies AttachEvidenceRequest);

  // --- the whole report on the scratch workbench ---

  it("the scratch workbench: every section, deterministic, nothing written, no clock value and no absolute path but the echoed root", async () => {
    const before = everything();
    const report = await reconcile();
    expect(report).toEqual({
      workbench: root,
      state: "json-control",
      scope: null,
      checked: 3,
      intents: [],
      records: [],
      references: [
        { path: ISSUE, at: "/references/0", status: "resolved", target: OPEN },
        { path: DONE, at: "/active_documents/0/ref", role: "plan", status: "unresolved", class: "unresolved-reference", reason: "record-not-found" },
        { path: DONE, at: "/evidence/0/ref", status: "unresolved", class: "unresolved-reference", reason: "record-not-found" },
        { path: DONE, at: "/outcome/evidence/0/ref", status: "unresolved", class: "unresolved-reference", reason: "record-not-found" },
      ],
      evidence: ["/evidence/0", "/outcome/evidence/0"].map((at) => ({
        path: DONE,
        at,
        record_id: MISSING_EVIDENCE,
        revision: "sha256:ee9f013094faaf0ba88e8ac54d7aecb82e7cc6c8b48a3b2bf7d6905f86354d09",
        policy: "prior-enforced",
        status: "stale",
        class: "unresolved-reference",
        reason: "record-not-found",
      })),
      dependencies: [],
      // The open package's narrative carries **Status:** open; the done package's **Status:** done is history and not read.
      narratives: [{ path: OPEN, narrative: OPEN_NARRATIVE, class: "conflict", reason: "status-copy-in-narrative", line: "**Status:** open", line_number: 4 }],
    });
    const text = JSON.stringify(report);
    expect(text.split(root).length - 1, "the root appears once, as workbench").toBe(1);
    expect(text, "no clock value").not.toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/);
    expect(await reconcile()).toEqual(report);
    expect(everything(), "reconcile wrote nothing").toEqual(before);
    // validate's finding set is FJ01's on the same workbench (the recorded 06-validate).
    expect(okResult(await dispatch({ op: "validate", workbench: root }))).toMatchObject({ checked: 3, valid: true, findings: [] });
  });

  it("after the recorded 02-transition the claimed package's narrative still carries **Status:** open, and reconcile reports it", async () => {
    okResult(await dispatch(transitionRequest()));
    expect((await reconcile()).narratives).toEqual([{ path: OPEN, narrative: OPEN_NARRATIVE, class: "conflict", reason: "status-copy-in-narrative", line: "**Status:** open", line_number: 4 }]);
  });

  it("scope narrows the walk as list's does; a missing scope is unknown-scope/scope-missing", async () => {
    const scoped = await reconcile("shared/issues");
    expect(scoped).toMatchObject({ scope: "shared/issues", checked: 1, narratives: [], evidence: [] });
    expect(scoped.references.map((r) => r.path)).toEqual([ISSUE]);
    expect((await reconcile(CONTAINER)).checked).toBe(1);
    expect(errorOf(await dispatch({ op: "reconcile", workbench: root, scope: "shared/plans" }))).toEqual({ class: "unknown-scope", reason: "scope-missing" });
  });

  it("the bundle answers reconcile as dispatch does", async () => {
    const r = spawnSync(process.execPath, [BUNDLE], { input: JSON.stringify({ op: "reconcile", workbench: root }), encoding: "utf-8" });
    expect(r.status, r.stderr).toBe(0);
    expect(JSON.parse(r.stdout)).toEqual(await dispatch({ op: "reconcile", workbench: root }));
  });

  // --- intents ---

  it("intents: a blocked intent with every file state (post, pre, diverged) and its operation; nothing repaired; a recoverable one is recovered by the read and not reported", async () => {
    const a = await newPlan("aaaaaaaa-0000-4000-8000-00000000000a", "260929-1102-plan-a");
    const b = await newPlan("bbbbbbbb-0000-4000-8000-00000000000b", "260929-1103-plan-b");
    okResult(await dispatch(adopt("aaaaaaaa-0000-4000-8000-00000000000a", a.narrative)));
    // The replacement writes the new plan, the replaced plan, the package: cut after the first, then the package edited by hand.
    const id = "9a9a9a9a-0000-4000-8000-000000000001";
    await expect(dispatch(adopt("bbbbbbbb-0000-4000-8000-00000000000b", b.narrative, id), { kernel: { faults: { cutAt: "after-write:0" } } })).rejects.toBeInstanceOf(CutReached);
    rewrite(OPEN, (c) => ({ ...c, domain: "data" }));

    const before = everything();
    const report = await reconcile();
    expect(report.intents).toEqual([
      {
        operation_id: id,
        op: "adopt-plan",
        files: [
          { path: b.control, state: "post" },
          { path: a.control, state: "pre" },
          { path: OPEN, state: "diverged" },
        ],
      },
    ]);
    expect(report.records.filter((f) => f.reason === "recovery-blocked").map((f) => f.path).sort()).toEqual([OPEN, a.control, b.control].sort());
    expect(everything(), "the intent and every file it names stand as they were").toEqual(before);
    expect((await reconcile("shared/issues")).intents, "no path of the intent is in scope").toEqual([]);

    // A pending intent whose files are all at pre or post may be a live writer's: the read takes the lock, recovers it, and it is gone.
    rmSync(join(root, ".json-state", "journal", id), { recursive: true });
    const issueMove = transitionRequest({ operation_id: "9a9a9a9a-0000-4000-8000-000000000002", record: { path: ISSUE }, expected_revision: revision(ISSUE), to: "in_progress", payload: {} });
    await expect(dispatch(issueMove, { kernel: { faults: { cutAt: "after-intent" } } })).rejects.toBeInstanceOf(CutReached);
    expect((parsed(ISSUE).control as Record<string, unknown>).state).toBe("open");
    const after = await reconcile();
    expect(after.intents).toEqual([]);
    expect((parsed(ISSUE).control as Record<string, unknown>).state, "recovered by the read").toBe("in_progress");
    expect(existsSync(join(root, ".json-state", "journal", issueMove.operation_id))).toBe(false);
  });

  // --- records ---

  it("records: every validate finding, and an evidence file outside a reviews/ store, which validate does not report", async () => {
    const outside = placeEvidence(root, { package: OPEN, id: "e7e7e7e7-0000-4000-8000-000000000301", basename: "260929-1301-review", dir: `${CONTAINER}/analyses` });
    const shared = await seedEvidence(root, { package: OPEN, id: "e7e7e7e7-0000-4000-8000-000000000302", basename: "260929-1302-review", dir: "shared/reviews" });
    const inContainer = await seedEvidence(root, { package: OPEN, id: "e7e7e7e7-0000-4000-8000-000000000303", basename: "260929-1303-review" });
    expect(inContainer.path).toBe(`${CONTAINER}/reviews/260929-1303-review.evidence.json`);
    const open = fixture("package/open.json");
    writeFileSync(join(root, OPEN), serialise({ ...open, status: "claimed" })); // claimed without a claim
    unlinkSync(join(root, ISSUE_NARRATIVE));

    const report = await reconcile();
    const validated = okResult(await dispatch({ op: "validate", workbench: root })).findings as Report["records"];
    const placement = report.records.filter((f) => f.reason === "evidence-outside-reviews");
    expect(placement.map((f) => [f.path, f.class])).toEqual([[outside.path, "unknown-scope"]]);
    expect(report.records.filter((f) => f.reason !== "evidence-outside-reviews"), "the rest is validate's findings, in validate's order").toEqual(validated);
    expect(validated.map((f) => `${f.path} ${f.class}/${f.reason}`).sort()).toEqual([`${ISSUE} unresolved-reference/narrative-missing`, `${OPEN} schema-invalid/schema`].sort());
    expect(validated.some((f) => f.path === outside.path), "validate keeps its finding set").toBe(false);
    expect(report.records.some((f) => f.path === shared.path || f.path === inContainer.path)).toBe(false);
    // A record the schema refuses is reported here and contributes to no other section.
    expect(report.references.some((r) => r.path === OPEN)).toBe(false);
    expect(report.narratives.some((n) => n.path === OPEN)).toBe(false);
  });

  // --- references ---

  it("references: resolved, unresolved, ambiguous, foreign and unchecked, over every field that carries one", async () => {
    // Another control file carrying the issue's id makes a reference to that id ambiguous.
    writeAt("shared/issues/260928-1401-duplicate.record.json", bytesOf(ISSUE));
    const foreignWb = "0e0e0e0e-0000-4000-8000-000000000000";
    const artefact = { path: OPEN_NARRATIVE, sha256: revision(OPEN_NARRATIVE), kind: "other" };
    rewrite(ISSUE, (c) => ({
      ...c,
      references: [
        { ...refTo(OPEN_ID), display: "260928-1200-parser-fix.md" },
        refTo("99999999-0000-4000-8000-000000000009"),
        refTo(ISSUE_ID),
        { workbench_id: foreignWb, record_id: OPEN_ID },
        { project: "menue-rs", citation: "260905-2054-reconciliation.md" },
        "260928-1200-parser-fix.md",
        artefact,
        { ...artefact, sha256: "sha256:" + "0".repeat(64) },
        { path: "shared/reviews/260929-1300-absent.md", sha256: "sha256:" + "0".repeat(64), kind: "review" },
      ],
    }));
    // The record kinds' own reference fields, from their fixtures, each beside a narrative.
    const placed: Record<string, string> = {};
    for (const name of ["decision-deferred", "decision-implemented", "plan-in-progress", "discussion-closed", "issue-closed"]) {
      const record = fixture(`record/${name}.json`);
      const narrative = (record.narrative as { path: string }).path;
      const control = narrative.replace(/\.md$/, ".record.json");
      writeAt(narrative, `# ${name}\n`);
      writeAt(control, serialise(record));
      placed[name] = control;
    }
    // A package's origin and its mode's source.
    const p1 = await newPackage("11111111-1111-4111-8111-111111111111", "260929-1101-first", { kind: "package", ref: refTo(OPEN_ID) });
    const word = { path: "shared/memos/260929-0900-the-users-word.md", sha256: "", kind: "memo" };
    writeAt(word.path, "Run it autonomously.\n");
    word.sha256 = revision(word.path);
    okResult(await dispatch({ op: "set-mode", workbench: root, operation_id: randomUUID(), record: { path: p1 }, expected_revision: revision(p1), actor: ACTOR, mode: { value: "autonomous", source: { kind: "user-word", ref: word } } } satisfies SetModeRequest));

    const report = await reconcile();
    expect(report.records, "every file is valid").toEqual([]);
    const of = (path: string): Array<[string, string, string]> =>
      report.references.filter((r) => r.path === path).map((r) => [r.at, r.status, r.target ?? `${r.class}/${r.reason}`] as [string, string, string]).map(([at, status, x]) => [at, status, status === "foreign" || status === "unchecked" ? "" : x]);
    expect(of(ISSUE)).toEqual([
      ["/references/0", "resolved", OPEN],
      ["/references/1", "unresolved", "unresolved-reference/record-not-found"],
      ["/references/2", "ambiguous", "conflict/ambiguous-reference"],
      ["/references/3", "foreign", ""],
      ["/references/4", "foreign", ""],
      ["/references/5", "unchecked", ""],
      ["/references/6", "resolved", OPEN_NARRATIVE],
      ["/references/7", "unresolved", "missing-evidence/artefact-changed"],
      ["/references/8", "unresolved", "unresolved-reference/artefact-missing"],
    ]);
    expect(of(placed["decision-deferred"] as string)).toEqual([["/control/deferral/target", "unchecked", ""]]);
    expect(of(placed["decision-implemented"] as string)).toEqual([
      ["/control/answer_ref", "unresolved", "unresolved-reference/artefact-missing"],
      ["/control/implementation_ref", "unchecked", ""],
    ]);
    expect(of(placed["plan-in-progress"] as string)).toEqual([
      ["/references/0", "unresolved", "unresolved-reference/record-not-found"],
      ["/control/acceptance/ref", "unresolved", "unresolved-reference/record-not-found"],
    ]);
    expect(of(placed["discussion-closed"] as string)).toEqual([
      ["/control/outcome_refs/0", "unresolved", "unresolved-reference/record-not-found"],
      ["/control/outcome_refs/1", "unchecked", ""],
    ]);
    expect(of(placed["issue-closed"] as string)).toEqual([["/control/disposition/reason_ref", "unchecked", ""]]);
    expect(of(p1)).toEqual([
      ["/origin/ref", "resolved", OPEN],
      ["/mode/source/ref", "resolved", word.path],
    ]);

    // The user's word edited afterwards: the source no longer resolves at its hash.
    writeAt(word.path, "Run it autonomously, but ask first.\n");
    expect((await reconcile()).references.find((r) => r.path === p1 && r.at === "/mode/source/ref")).toMatchObject({ status: "unresolved", class: "missing-evidence", reason: "artefact-changed" });
  });

  it("the role: every active-document binding carries its stored role after at, resolved, unresolved and ambiguous alike, and no target it did not resolve to; no other entry carries one", async () => {
    // A plan binding and a spec binding, both plan-kind records, adopted through the kernel.
    const plan = await newPlan("aaaaaaaa-0000-4000-8000-0000000000a1", "260929-1111-the-plan");
    const spec = await newPlan("aaaaaaaa-0000-4000-8000-0000000000a2", "260929-1112-the-spec");
    okResult(await dispatch(adopt("aaaaaaaa-0000-4000-8000-0000000000a1", plan.narrative)));
    okResult(await dispatch({ ...adopt("aaaaaaaa-0000-4000-8000-0000000000a2", spec.narrative), role: "spec" }));
    // Two more spec bindings by hand: one naming no record, one naming an id two control files carry.
    const twice = await newPlan("aaaaaaaa-0000-4000-8000-0000000000a3", "260929-1113-carried-twice");
    writeAt(`${CONTAINER}/plans/260929-1114-a-copy.record.json`, bytesOf(twice.control));
    const missing = "aaaaaaaa-0000-4000-8000-0000000000a4";
    const at = revision(spec.narrative);
    rewrite(OPEN, (c) => ({
      ...c,
      active_documents: [...(c.active_documents as unknown[]), { ref: refTo(missing), role: "spec", revision: at }, { ref: refTo("aaaaaaaa-0000-4000-8000-0000000000a3"), role: "spec", revision: at }],
      references: [refTo(ISSUE_ID)],
    }));

    const report = await reconcile();
    expect(report.records.filter((f) => f.path === OPEN && f.class === "schema-invalid"), "the package stays schema-valid, so its references are reported").toEqual([]);
    const mine = report.references.filter((r) => r.path === OPEN);
    expect(mine).toEqual([
      { path: OPEN, at: "/active_documents/0/ref", role: "plan", status: "resolved", target: plan.control },
      { path: OPEN, at: "/active_documents/1/ref", role: "spec", status: "resolved", target: spec.control },
      { path: OPEN, at: "/active_documents/2/ref", role: "spec", status: "unresolved", class: "unresolved-reference", reason: "record-not-found" },
      { path: OPEN, at: "/active_documents/3/ref", role: "spec", status: "ambiguous", class: "conflict", reason: "ambiguous-reference" },
      { path: OPEN, at: "/references/0", status: "resolved", target: ISSUE },
    ]);
    // The placement: role right after at, the rest in the order the entry always had.
    expect(mine.map((r) => Object.keys(r))).toEqual([
      ["path", "at", "role", "status", "target"],
      ["path", "at", "role", "status", "target"],
      ["path", "at", "role", "status", "class", "reason"],
      ["path", "at", "role", "status", "class", "reason"],
      ["path", "at", "status", "target"],
    ]);
    const binding = /^\/active_documents\/\d+\/ref$/;
    expect(report.references.filter((r) => !binding.test(r.at) && "role" in r), "no role outside a binding").toEqual([]);
    expect(report.references.filter((r) => binding.test(r.at) && !("role" in r)), "no binding without its role").toEqual([]);
  });

  // --- evidence ---

  it("evidence: fresh after attach and after status changes alone, stale once the brief changes, and a binding naming no record", async () => {
    const ev = await seedEvidence(root, { package: OPEN, id: "e7e7e7e7-0000-4000-8000-000000000401", basename: "260929-1401-review" });
    okResult(await attach(OPEN, ev.binding));
    const mine = async (): Promise<Report["evidence"]> => (await reconcile()).evidence.filter((e) => e.path === OPEN);
    expect(await mine()).toEqual([{ path: OPEN, at: "/evidence/0", record_id: ev.id, revision: ev.revision, policy: "claude-guided", status: "fresh" }]);

    okResult(await move(OPEN, "paused"));
    okResult(await move(OPEN, "open"));
    expect((await mine()).map((e) => e.status), "a status change alone").toEqual(["fresh"]);

    writeFileSync(join(root, OPEN_NARRATIVE), `${bytesOf(OPEN_NARRATIVE).toString("utf-8")}\nOne more requirement.\n`);
    expect(await mine()).toEqual([{ path: OPEN, at: "/evidence/0", record_id: ev.id, revision: ev.revision, policy: "claude-guided", status: "stale", class: "missing-evidence", reason: "brief-changed" }]);
    expect(parsed(OPEN).evidence, "nothing repaired").toEqual([ev.binding]);
    // The done package's bindings name a record that exists nowhere.
    expect((await reconcile()).evidence.filter((e) => e.path === DONE).map((e) => `${e.at} ${e.status} ${e.class}/${e.reason}`)).toEqual([
      "/evidence/0 stale unresolved-reference/record-not-found",
      "/outcome/evidence/0 stale unresolved-reference/record-not-found",
    ]);
  });

  // --- dependencies ---

  it("dependencies: every edge through dependencySatisfied against the target's live JSON, satisfied or unmet with the reason", async () => {
    const P1 = "11111111-1111-4111-8111-111111111111";
    const P2 = "22222222-2222-4222-8222-222222222222";
    const p1 = await newPackage(P1, "260929-1101-first");
    const p2 = await newPackage(P2, "260929-1102-second");
    // P2 done, completed, with accepted evidence bound at its revision: what `succeeded` asks.
    okResult(await move(p2, "claimed", { claim: CLAIM }));
    const ev = await seedEvidence(root, { package: p2, id: "e7e7e7e7-0000-4000-8000-000000000501", basename: "260929-1501-review" });
    okResult(await move(p2, "done", { outcome: { class: "completed", reason: "all criteria met", evidence: [ev.binding] } }));

    okResult(await setDeps(OPEN, [{ target: refTo(DONE_ID), condition: "succeeded" }, { target: refTo(P1), condition: "terminal" }, { target: refTo(P2), condition: "succeeded" }]));
    okResult(await setDeps(p1, [{ target: refTo(DONE_ID), condition: "terminal" }]));
    const edges = async (): Promise<Array<Record<string, unknown>>> => (await reconcile()).dependencies;
    expect(await edges()).toEqual([
      { path: OPEN, at: "/depends_on/0", target: DONE_ID, condition: "succeeded", status: "unmet", class: "unresolved-reference", reason: "dependency-unmet", detail: `succeeded: the outcome binds evidence ${MISSING_EVIDENCE}, which was not supplied` },
      { path: OPEN, at: "/depends_on/1", target: P1, condition: "terminal", status: "unmet", class: "conflict", reason: "dependency-unmet", detail: "terminal: the target is open, not done or dropped" },
      { path: OPEN, at: "/depends_on/2", target: P2, condition: "succeeded", status: "satisfied" },
      { path: p1, at: "/depends_on/0", target: DONE_ID, condition: "terminal", status: "satisfied" },
    ]);

    // The evidence P2's outcome binds changed by hand: its revision moved, so the binding is stale and `succeeded` unmet.
    writeFileSync(join(root, ev.path), `${bytesOf(ev.path).toString("utf-8")} `);
    expect((await edges())[2]).toMatchObject({ target: P2, status: "unmet", class: "missing-evidence", reason: "dependency-unmet" });
    // A target edited by hand to an id no control file carries.
    rewrite(p1, (c) => ({ ...c, depends_on: [{ target: refTo("99999999-0000-4000-8000-000000000009"), condition: "terminal" }] }));
    expect((await edges())[3]).toEqual({ path: p1, at: "/depends_on/0", target: "99999999-0000-4000-8000-000000000009", condition: "terminal", status: "unmet", class: "unresolved-reference", reason: "record-not-found" });
    expect(parsed(p1).depends_on, "nothing repaired").toEqual([{ target: refTo("99999999-0000-4000-8000-000000000009"), condition: "terminal" }]);
  });

  it("dependencies: a cycle no set-dependencies closed (a merge or a hand edit) is reported with its ids; it blocks no other set-dependencies; scope reports it only when a package of the scope is on it", async () => {
    const ids = ["11111111-1111-4111-8111-111111111111", "22222222-2222-4222-8222-222222222222", "33333333-3333-4333-8333-333333333333", "44444444-4444-4444-8444-444444444444", "55555555-5555-4555-8555-555555555555", "66666666-6666-4666-8666-666666666666"];
    const [P1, P2, P3, P4, P5, P6] = ids as [string, string, string, string, string, string];
    const p: string[] = [];
    for (const [i, id] of ids.entries()) p.push(await newPackage(id, `260929-110${i + 1}-package-${i + 1}`));
    const [p1, p2, p3, p4, p5, p6] = p as [string, string, string, string, string, string];
    // P1 -> P2 through the operation; P2 -> P1 as a merge would bring it.
    okResult(await setDeps(p1, [{ target: refTo(P2), condition: "terminal" }]));
    const on = (id: string): SetDependenciesRequest["depends_on"] => [{ target: refTo(id), condition: "terminal" }];
    rewrite(p2, (c) => ({ ...c, depends_on: on(P1) }));
    // P3 -> P4 -> P5 -> P3, and P6 -> P6, all by hand.
    rewrite(p3, (c) => ({ ...c, depends_on: on(P4) }));
    rewrite(p4, (c) => ({ ...c, depends_on: on(P5) }));
    rewrite(p5, (c) => ({ ...c, depends_on: on(P3) }));
    rewrite(p6, (c) => ({ ...c, depends_on: on(P6) }));

    // The foreign cycles do not run through the open package: its set-dependencies lands.
    okResult(await setDeps(OPEN, [{ target: refTo(P1), condition: "terminal" }]));
    // One that would close a cycle through the package being set is still refused there, and writes nothing.
    const p2Before = bytesOf(p2);
    expect(errorOf(await setDeps(p2, on(P1)))).toEqual({ class: "conflict", reason: "cycle" });
    expect(bytesOf(p2).equals(p2Before)).toBe(true);

    const cycles = (await reconcile()).dependencies.filter((d) => d.status === "cycle");
    expect(cycles).toEqual([
      { status: "cycle", ids: [P1, P2, P1] },
      { status: "cycle", ids: [P3, P4, P5, P3] },
      { status: "cycle", ids: [P6, P6] },
    ]);
    expect((await reconcile(CONTAINER)).dependencies.filter((d) => d.status === "cycle"), "the open package is on none").toEqual([]);
    expect((await reconcile(p4.slice(0, p4.lastIndexOf("/")))).dependencies.filter((d) => d.status === "cycle")).toEqual([{ status: "cycle", ids: [P3, P4, P5, P3] }]);
    expect(parsed(p2).depends_on, "nothing repaired").toEqual(on(P1));
  });

  // --- narratives: the section 9 check on status copies and historical markers ---

  it("narratives: every status line in the head of a live narrative; nothing after the first section heading or inside a fence", async () => {
    writeFileSync(
      join(root, OPEN_NARRATIVE),
      [
        "# Parser fix",
        "",
        "---",
        "**Domain:** code",
        "**Status:** open",
        "**Claim:** a216a4b9 — kai, 260929-1200",
        "**Mode:** autonomous",
        "**Active spec/plan:** 260929-1102_*_plan-a.md",
        "**Depends-on:** 260927-0900-strict-reader.md",
        "**Filed by:** user, kai",
        "```",
        "**Status:** quoted, not a head line",
        "```",
        "---",
        "",
        "## Directive",
        "",
        "**Status:** below the head",
        "",
      ].join("\n"),
    );
    expect((await reconcile()).narratives.map((n) => [n.line_number, n.line])).toEqual([
      [5, "**Status:** open"],
      [6, "**Claim:** a216a4b9 — kai, 260929-1200"],
      [7, "**Mode:** autonomous"],
      [8, "**Active spec/plan:** 260929-1102_*_plan-a.md"],
      [9, "**Depends-on:** 260927-0900-strict-reader.md"],
    ]);
  });

  it("historical markers do not change the JSON decision: a _c_-named record open in its JSON is open to show, list and reconcile; a terminal record's narrative is not read", async () => {
    const stem = "shared/issues/260928-1500_c_old-marker";
    const record = { ...fixture("record/issue-open.json"), id: "c0c0c0c0-0000-4000-8000-000000000001", narrative: { path: `${stem}.md` }, references: [] };
    writeAt(`${stem}.md`, "# Old marker\n\n**Status:** closed\n");
    writeAt(`${stem}.record.json`, serialise(record));
    // A record closed in its JSON whose narrative still says open: history, not read.
    const closed = fixture("record/issue-closed.json");
    const closedNarrative = (closed.narrative as { path: string }).path;
    writeAt(closedNarrative, "# Stats file stale\n\n**Status:** open\n");
    writeAt(closedNarrative.replace(/\.md$/, ".record.json"), serialise(closed));

    const shown = okResult(await dispatch({ op: "show", workbench: root, record: { path: `${stem}.record.json` } }));
    expect((shown.control as { control: { state: string } }).control.state).toBe("open");
    const listed = okResult(await dispatch({ op: "list", workbench: root, scope: "shared/issues" })).records as Array<Record<string, unknown>>;
    expect(listed.find((r) => r.path === `${stem}.record.json`)?.status).toBe("open");
    const report = await reconcile();
    expect(report.narratives.map((n) => [n.path, n.line])).toEqual([
      [`${stem}.record.json`, "**Status:** closed"],
      [OPEN, "**Status:** open"],
    ]);
    expect(report.records, "the marker in the name is no finding").toEqual([]);
  });

  // --- merge conflicts ---

  it("merge conflicts: a control file with markers is schema-invalid/syntax under records and refused a mutation; a narrative with markers is schema-invalid/conflict-markers; the other records are reported normally", async () => {
    const issueText = bytesOf(ISSUE).toString("utf-8");
    const conflicted = issueText.replace('    "state": "open",\n', '<<<<<<< HEAD\n    "state": "open",\n=======\n    "state": "in_progress",\n>>>>>>> origin/main\n');
    expect(conflicted).not.toBe(issueText);
    writeFileSync(join(root, ISSUE), conflicted);
    writeFileSync(join(root, OPEN_NARRATIVE), "# Parser fix\n\n<<<<<<< HEAD\n**Status:** open\n=======\n**Status:** claimed\n>>>>>>> origin/main\n");

    const report = await reconcile();
    expect(report.records.map((f) => `${f.path} ${f.class}/${f.reason}`)).toEqual([`${ISSUE} schema-invalid/syntax`]);
    expect(report.narratives).toEqual([{ path: OPEN, narrative: OPEN_NARRATIVE, class: "schema-invalid", reason: "conflict-markers", line: "<<<<<<< HEAD", line_number: 3 }]);
    expect(report.references.map((r) => r.path), "the other records' references are reported").toEqual([DONE, DONE, DONE]);
    expect(report.evidence.map((e) => e.path)).toEqual([DONE, DONE]);

    const before = bytesOf(ISSUE);
    const r = await dispatch(transitionRequest({ record: { path: ISSUE }, expected_revision: revisionOf(before), to: "in_progress", payload: {} }));
    expect(errorOf(r)).toEqual({ class: "schema-invalid", reason: "syntax" });
    expect(bytesOf(ISSUE).equals(before)).toBe(true);
  });

  // --- one id index per read attempt (plan 260930-1654 step 4) ---

  /** `n` packages written by hand, each referencing its neighbours, itself and a missing id, and depending on the one before. */
  const packagesWithReferences = (n: number): void => {
    const open = fixture("package/open.json");
    const idOf = (i: number): string => `00000000-0000-4000-8000-${String(i).padStart(12, "0")}`;
    for (let i = 0; i < n; i++) {
      const stem = `260930-2${String(i).padStart(3, "0")}-count-${i}`;
      const narrative = `work-packages/${stem}/${stem}.md`;
      writeAt(narrative, `# ${stem}\n`);
      writeAt(
        `work-packages/${stem}/package.json`,
        serialise({
          ...open,
          id: idOf(i),
          narrative: { path: narrative },
          depends_on: [{ target: refTo(idOf((i + n - 1) % n)), condition: "terminal" }],
          references: [refTo(idOf((i + n - 1) % n)), refTo(idOf((i + 1) % n)), refTo(idOf(i)), refTo(`ffffffff-0000-4000-8000-${String(i).padStart(12, "0")}`)],
        }),
      );
    }
  };
  /** One unscoped reconcile: its report, and the whole-store walks and strict parses it made. */
  const counted = async (): Promise<{ report: Report; walks: number; parses: number }> => {
    const walk = vi.mocked(controlFiles);
    const parse = vi.mocked(strictParse);
    walk.mockClear();
    parse.mockClear();
    const report = await reconcile();
    return { report, walks: walk.mock.calls.filter(([wb, dir]) => dir === wb.root).length, parses: parse.mock.calls.length };
  };

  it("work count: one reconcile walks the store a fixed number of times and parses linearly in records plus references, not their product", async () => {
    const N = 8;
    packagesWithReferences(N);
    const atN = await counted();
    expect(atN.report.records, "every file is valid").toEqual([]);
    rmSync(join(root, "work-packages"), { recursive: true });
    cpSync(join(FIXTURE, "work-packages"), join(root, "work-packages"), { recursive: true });
    packagesWithReferences(2 * N);
    const at2N = await counted();
    expect(at2N.report.records).toEqual([]);

    // Each package adds five reference sites (four references and its edge's target), each resolving an id, and one edge.
    expect(at2N.report.references.length).toBe(atN.report.references.length + 5 * N);
    expect(at2N.report.dependencies.length).toBe(atN.report.dependencies.length + N);
    const figures = `walks ${atN.walks} and ${at2N.walks}, parses ${atN.parses} and ${at2N.parses}, at N and 2N`;
    expect(at2N.parses, figures).toBeLessThanOrEqual(2 * atN.parses + 3);
    expect(at2N.walks, `whole-store walks do not grow with the store: ${figures}`).toBe(atN.walks);
  });

  it("the index is rebuilt per read attempt: a record landing during the first attempt is resolved by the retry", async () => {
    const LATE = "12121212-0000-4000-8000-000000000001";
    rewrite(OPEN, (c) => ({ ...c, references: [refTo(LATE)] }));
    expect((await reconcile()).references.find((r) => r.path === OPEN)).toMatchObject({ status: "unresolved", reason: "record-not-found" });

    let attempts = 0;
    let late = "";
    const r = await dispatch(
      { op: "reconcile", workbench: root },
      {
        kernel: {
          faults: {
            pause: async (point) => {
              if (point !== "read:after:between-listings") return;
              attempts++;
              if (attempts === 1) late = await newPackage(LATE, "260930-2100-late");
            },
          },
        },
      },
    );
    expect(attempts, "the answer of the landed create moved the snapshot, so the body ran again").toBe(2);
    const report = okResult(r) as unknown as Report;
    expect(report.references.find((e) => e.path === OPEN)).toEqual({ path: OPEN, at: "/references/0", status: "resolved", target: late });
  });

  it("the index answers what the kernel's walk answers: hits in walk order, a refused file skipped, no blocked-intent filter", async () => {
    // The issue's id carried three times, one copy sorting before the original; a copy of the open package the strict reader refuses.
    writeAt("shared/issues/260928-1300-first-copy.record.json", bytesOf(ISSUE));
    writeAt("shared/issues/260928-1401-second-copy.record.json", bytesOf(ISSUE));
    writeAt("shared/issues/260928-1402-refused.record.json", `${bytesOf(ISSUE).toString("utf-8")}\n<<<<<<< HEAD\n`);
    const opened = openWorkbench(root);
    if (!opened.ok) throw new Error(opened.error.detail);
    const blocked = [{ operation_id: OP_ID, paths: [OPEN], diverged: [OPEN] }];
    const kernel = readContext(opened.value, blocked);
    const indexed = indexedContext(kernel);
    for (const id of [OPEN_ID, DONE_ID, ISSUE_ID, MISSING_EVIDENCE]) expect(indexed.resolveRecordId(id), id).toEqual(kernel.resolveRecordId(id));
    expect(indexed.resolveRecordId(OPEN_ID), "a path a blocked intent names still resolves").toEqual({ ok: true, value: { path: OPEN, id: OPEN_ID } });
    const ambiguous = indexed.resolveRecordId(ISSUE_ID);
    expect(ambiguous.ok ? "" : ambiguous.error.detail).toBe(`the id ${ISSUE_ID} is carried by shared/issues/260928-1300-first-copy.record.json, ${ISSUE}, shared/issues/260928-1401-second-copy.record.json`);
  });

  // --- local locks ---

  it("local locks are not cross-checkout protection: a lock held in one copy stops nothing in another, and reconcile in the first reports nothing about it", async () => {
    const other = mkdtempSync(join(tmpdir(), "codec-ops-other-"));
    try {
      cpSync(FIXTURE, other, { recursive: true });
      const before = await reconcile();
      const opened = openWorkbench(root);
      if (!opened.ok) throw new Error(opened.error.detail);
      const lock = lockPathFor(opened.value);
      mkdirSync(join(lock, ".."), { recursive: true });
      const content = `pid: ${process.pid}\nhost: ${hostname()}\nnonce: 00\nacquired_at: 2026-09-29T12:00:00Z\n`;
      writeFileSync(lock, content, { flag: "wx" });

      // The other checkout's write takes its own lock and lands.
      const otherOpen = readFileSync(join(other, OPEN));
      const landed = await dispatch({ ...transitionRequest(), workbench: other, expected_revision: revisionOf(otherOpen) }, { kernel: { waitMs: 300, pollMs: 10 } });
      okResult(landed);
      expect(readFileSync(join(other, OPEN)).equals(otherOpen)).toBe(false);
      // Here the lock stops a write.
      expect(errorOf(await dispatch(transitionRequest(), { kernel: { waitMs: 300, pollMs: 10 } }))).toEqual({ class: "conflict", reason: "lock-timeout" });

      expect(await reconcile(), "reconcile here reports nothing about the other copy").toEqual(before);
      expect(readFileSync(lock, "utf-8"), "and leaves the lock alone").toBe(content);
      unlinkSync(lock);
    } finally {
      rmSync(other, { recursive: true, force: true });
    }
  });
});

// --- plan progress (FJ02b step 2, Prior's FJ02 response 18) -----------------------------

describe("transition: plan progress", () => {
  const WB_ID = "5d6d15ba-5b44-45b2-8aa2-39dd3bf82964";
  const OPEN_ID = "591d5bf4-2219-46b6-a0d3-cbdb28d6af16";
  const CONTAINER = "work-packages/260928-1200-parser-fix";
  const PLAN_ID = "f1f1f1f1-0000-4000-8000-000000000001";
  const STEM = "260929-1500-progress-plan";
  const PLAN = `${CONTAINER}/plans/${STEM}.record.json`;
  const NARRATIVE = `${CONTAINER}/plans/${STEM}.md`;
  const STEPS = [
    { id: "s1", state: "open" },
    { id: "s2", state: "open" },
    { id: "s3", state: "open" },
  ] as const;
  const CRITERIA = [
    { id: "c1", met: null },
    { id: "c2", met: null },
  ] as const;
  const STALE = "sha256:" + "0".repeat(64);
  type Progress = NonNullable<TransitionRequest["payload"]>;

  const errorOf = (r: Response): { class: string; reason: string } => {
    expect(r.ok, JSON.stringify(r)).toBe(false);
    if (r.ok) throw new Error("unreachable");
    return { class: r.error.class, reason: r.error.reason };
  };
  const detailOf = (r: Response): string => (r.ok ? "" : (r.error.detail ?? ""));
  const parsed = (path: string): Record<string, unknown> => {
    const p = strictParse(bytesOf(path));
    if (!p.ok) throw new Error(p.detail);
    return p.value as Record<string, unknown>;
  };
  const controlOf = (path = PLAN): Record<string, unknown> => parsed(path).control as Record<string, unknown>;
  const answered = (id: string): boolean => existsSync(join(root, ".json-state", "ops", `${id}.json`));
  const journal = (): string[] => (existsSync(join(root, ".json-state", "journal")) ? readdirSync(join(root, ".json-state", "journal")) : []);
  /** A refusal wrote nothing: every named file at its bytes before, no answer, no pending intent. */
  const unchanged = (before: Record<string, Buffer>, id: string, label: string): void => {
    for (const [path, bytes] of Object.entries(before)) expect(bytesOf(path).equals(bytes), `${label}: ${path}`).toBe(true);
    expect(answered(id), `${label}: answer`).toBe(false);
    expect(journal(), `${label}: journal`).toEqual([]);
  };
  const snapshot = (...paths: string[]): Record<string, Buffer> => Object.fromEntries(paths.map((p) => [p, bytesOf(p)]));

  const createPlanRequest = (over: Partial<CreateRequest> = {}): CreateRequest => ({
    op: "create",
    workbench: root,
    operation_id: randomUUID(),
    id: PLAN_ID,
    kind: "plan",
    filed_by: ACTOR,
    origin: { kind: "package", ref: { workbench_id: WB_ID, record_id: OPEN_ID } },
    scope: { container: CONTAINER, store: "plans" },
    narrative: { path: NARRATIVE, content: `# ${STEM}\n\n1. First.\n2. Second.\n3. Third.\n` },
    payload: { state: "open", steps: [...STEPS], criteria: [...CRITERIA], acceptance: null },
    ...over,
  });
  /** The plan every case starts from, created through the kernel: open, steps s1 s2 s3 open, criteria c1 c2 null. */
  const newPlan = async (): Promise<void> => {
    okResult(await dispatch(createPlanRequest()));
  };
  /** A transition of the plan, or of `over.record`, at its stored revision unless `over` names one. */
  const progress = (to: string, payload: Progress, over: Partial<TransitionRequest> = {}): TransitionRequest => {
    const path = over.record?.path ?? PLAN;
    return transitionRequest({ operation_id: randomUUID(), record: { path }, expected_revision: over.expected_revision ?? revision(path), to, reason: "plan progress", payload, ...over });
  };
  /** Dispatches `req`, asserts FJ02's answer shape and a valid, deterministic record; the stored control after. */
  const lands = async (req: TransitionRequest, label = req.to): Promise<Record<string, unknown>> => {
    const from = controlOf(req.record.path).state;
    const before = revision(req.record.path);
    const r = await dispatch(req);
    const result = okResult(r);
    expect(Object.keys(result), label).toEqual(["operation_id", "path", "from", "to", "revision", "previous_revision"]);
    expect(result, label).toEqual({ operation_id: req.operation_id, path: req.record.path, from, to: req.to, revision: revision(req.record.path), previous_revision: before });
    if (r.ok) expect(r.revisions, label).toEqual({ [req.record.path]: revision(req.record.path) });
    expect(bytesOf(req.record.path).toString("utf-8"), `${label}: deterministic bytes`).toBe(serialise(parsed(req.record.path)));
    expect(okResult(await dispatch({ op: "validate", workbench: root, record: { path: req.record.path } })), label).toMatchObject({ valid: true, findings: [] });
    return controlOf(req.record.path);
  };
  /** Refused with `expected`, nothing written. */
  const refusedWith = async (req: TransitionRequest, expected: { class: string; reason: string }, label: string): Promise<Response> => {
    const before = snapshot(req.record.path);
    const r = await dispatch(req);
    expect(errorOf(r), label).toEqual(expected);
    unchanged(before, req.operation_id, label);
    return r;
  };

  // --- landing ---

  it("a state change carrying steps and criteria lands both; the rest of the record is untouched", async () => {
    await newPlan();
    const before = parsed(PLAN);
    const control = await lands(progress("in_progress", { steps: [{ id: "s1", state: "in_progress" }], criteria: [{ id: "c2", met: true }] }));
    expect(control).toEqual({
      state: "in_progress",
      steps: [{ id: "s1", state: "in_progress" }, STEPS[1], STEPS[2]],
      criteria: [CRITERIA[0], { id: "c2", met: true }],
      acceptance: null,
    });
    const after = parsed(PLAN);
    for (const key of Object.keys(before).filter((k) => k !== "control")) expect(after[key], key).toEqual(before[key]);
    expect(Object.keys(after)).toEqual(Object.keys(before));
  });

  it("a progress-only update lands with to equal to open and with to equal to in_progress", async () => {
    await newPlan();
    let control = await lands(progress("open", { steps: [{ id: "s1", state: "in_progress" }] }), "open -> open");
    expect(control.state).toBe("open");
    expect(control.steps).toEqual([{ id: "s1", state: "in_progress" }, STEPS[1], STEPS[2]]);
    await lands(progress("in_progress", {}), "open -> in_progress, no progress");
    control = await lands(progress("in_progress", { steps: [{ id: "s1", state: "done" }, { id: "s2", state: "in_progress" }], criteria: [{ id: "c1", met: true }] }), "in_progress -> in_progress");
    expect(control).toMatchObject({ state: "in_progress", steps: [{ id: "s1", state: "done" }, { id: "s2", state: "in_progress" }, STEPS[2]], criteria: [{ id: "c1", met: true }, CRITERIA[1]] });
  });

  it("omitted entries keep their value and their position, compared field by field with the stored record", async () => {
    await newPlan();
    await lands(progress("in_progress", { steps: [{ id: "s1", state: "done" }, { id: "s3", state: "in_progress" }], criteria: [{ id: "c2", met: false }] }));
    const before = controlOf();
    // The update names the entries in the reverse of their stored order: the stored order stays.
    const control = await lands(progress("in_progress", { steps: [{ id: "s3", state: "done" }], criteria: [{ id: "c1", met: true }] }));
    const steps = control.steps as Array<Record<string, unknown>>;
    const criteria = control.criteria as Array<Record<string, unknown>>;
    const stepsBefore = before.steps as Array<Record<string, unknown>>;
    const criteriaBefore = before.criteria as Array<Record<string, unknown>>;
    expect(steps.map((s) => s.id)).toEqual(["s1", "s2", "s3"]);
    expect(criteria.map((c) => c.id)).toEqual(["c1", "c2"]);
    for (const i of [0, 1]) for (const key of ["id", "state"]) expect(steps[i]?.[key], `steps[${i}].${key}`).toBe(stepsBefore[i]?.[key]);
    expect(steps[2]).toEqual({ id: "s3", state: "done" });
    for (const key of ["id", "met"]) expect(criteria[1]?.[key], `criteria[1].${key}`).toBe(criteriaBefore[1]?.[key]);
    expect(criteria[0]).toEqual({ id: "c1", met: true });
    expect(control.acceptance).toBe(before.acceptance);
  });

  it("an included entry equal to the stored one is admitted, beside one that changes, and changes nothing itself", async () => {
    await newPlan();
    const control = await lands(progress("open", { steps: [STEPS[0], { id: "s2", state: "done" }], criteria: [CRITERIA[0]] }));
    expect(control.steps).toEqual([STEPS[0], { id: "s2", state: "done" }, STEPS[2]]);
    expect(control.criteria).toEqual([...CRITERIA]);
  });

  it("a criterion moves null -> true -> false -> null: re-evaluation has no direction", async () => {
    await newPlan();
    for (const met of [true, false, null]) {
      const control = await lands(progress("open", { criteria: [{ id: "c1", met }] }), `c1 to ${String(met)}`);
      expect(control.criteria).toEqual([{ id: "c1", met }, CRITERIA[1]]);
    }
  });

  // --- replay and CAS ---

  it("an identical replay returns the stored answer, also after the plan moved on; a divergent one is operation-id-reused", async () => {
    await newPlan();
    const req = progress("open", { steps: [{ id: "s1", state: "in_progress" }] });
    const first = await dispatch(req);
    okResult(first);
    const bytes = bytesOf(PLAN);
    expect(await dispatch(req)).toEqual(first);
    expect(bytesOf(PLAN).equals(bytes)).toBe(true);
    await lands(progress("in_progress", { steps: [{ id: "s1", state: "done" }] }));
    const moved = bytesOf(PLAN);
    expect(await dispatch(req), "the answer is the stored one").toEqual(first);
    expect(bytesOf(PLAN).equals(moved), "and the replay wrote nothing").toBe(true);
    expect(errorOf(await dispatch({ ...req, payload: { steps: [{ id: "s2", state: "in_progress" }] } }))).toEqual({ class: "conflict", reason: "operation-id-reused" });
    expect(errorOf(await dispatch({ ...req, payload: { steps: [{ id: "s1", state: "in_progress" }], criteria: [{ id: "c1", met: true }] } }))).toEqual({ class: "conflict", reason: "operation-id-reused" });
    expect(bytesOf(PLAN).equals(moved)).toBe(true);
  });

  it("a stale expected_revision is conflict/revision-mismatch, nothing written", async () => {
    await newPlan();
    const r = await refusedWith(progress("open", { steps: [{ id: "s1", state: "done" }] }, { expected_revision: STALE }), { class: "conflict", reason: "revision-mismatch" }, "stale");
    expect(detailOf(r)).toBe(`stored ${revision(PLAN)} expected ${STALE}`);
  });

  // --- forbidden step edges ---

  it("done -> open and in_progress -> open are conflict/transition-refused naming the step, nothing written", async () => {
    await newPlan();
    await lands(progress("open", { steps: [{ id: "s1", state: "done" }, { id: "s2", state: "in_progress" }] }));
    for (const [id, from] of [
      ["s1", "done"],
      ["s2", "in_progress"],
    ] as const) {
      const r = await refusedWith(progress("open", { steps: [{ id, state: "open" }] }), { class: "conflict", reason: "transition-refused" }, `${id} ${from} -> open`);
      expect(detailOf(r)).toContain(`step ${id}`);
      expect(detailOf(r)).toContain(`${from} -> open`);
    }
    // done -> in_progress is no step edge either, and a state change does not carry a forbidden step through.
    const r = await refusedWith(progress("in_progress", { steps: [{ id: "s1", state: "in_progress" }] }), { class: "conflict", reason: "transition-refused" }, "s1 done -> in_progress with a state change");
    expect(detailOf(r)).toContain("step s1");
  });

  // --- duplicate and unknown ids ---

  it("a payload naming an id twice is duplicate-step-id or duplicate-criterion-id; an id the plan lacks is unknown-step-id or unknown-criterion-id; nothing written", async () => {
    await newPlan();
    const cases: Array<[string, Progress, { class: string; reason: string }]> = [
      ["a step named twice", { steps: [{ id: "s2", state: "in_progress" }, { id: "s2", state: "done" }] }, { class: "schema-invalid", reason: "duplicate-step-id" }],
      ["a step named twice with the same value", { steps: [{ id: "s2", state: "in_progress" }, { id: "s2", state: "in_progress" }] }, { class: "schema-invalid", reason: "duplicate-step-id" }],
      ["a criterion named twice", { criteria: [{ id: "c1", met: true }, { id: "c1", met: false }] }, { class: "schema-invalid", reason: "duplicate-criterion-id" }],
      ["a step the plan lacks", { steps: [{ id: "s9", state: "in_progress" }] }, { class: "unresolved-reference", reason: "unknown-step-id" }],
      ["a criterion the plan lacks", { criteria: [{ id: "c9", met: true }] }, { class: "unresolved-reference", reason: "unknown-criterion-id" }],
      ["a known step beside an unknown one", { steps: [{ id: "s1", state: "done" }, { id: "s9", state: "done" }] }, { class: "unresolved-reference", reason: "unknown-step-id" }],
    ];
    for (const [label, payload, expected] of cases) {
      for (const to of ["open", "in_progress"]) {
        const r = await refusedWith(progress(to, payload), expected, `${label}, to ${to}`);
        if (expected.reason.startsWith("unknown")) expect(detailOf(r), label).toMatch(/[sc]9/);
      }
    }
  });

  it("a stored plan whose steps or criteria repeat an id (written by hand) refuses progress on that array; a move without progress lands as before", async () => {
    await newPlan();
    const hand = parsed(PLAN);
    const control = hand.control as Record<string, unknown>;
    // Two entries sharing an id but not identical: the record schema's uniqueItems admits them.
    writeFileSync(join(root, PLAN), serialise({ ...hand, control: { ...control, steps: [STEPS[0], { id: "s1", state: "done" }, STEPS[2]], criteria: [CRITERIA[0], { id: "c1", met: true }] } }));
    expect(okResult(await dispatch({ op: "validate", workbench: root, record: { path: PLAN } }))).toMatchObject({ valid: true });
    const r = await refusedWith(progress("open", { steps: [{ id: "s3", state: "done" }] }), { class: "schema-invalid", reason: "duplicate-step-id" }, "stored steps");
    expect(detailOf(r)).toContain("stored");
    await refusedWith(progress("in_progress", { criteria: [{ id: "c1", met: false }] }), { class: "schema-invalid", reason: "duplicate-criterion-id" }, "stored criteria");
    const moved = await lands(progress("in_progress", {}), "no progress");
    expect(moved.steps, "a move without progress reads no array").toEqual([STEPS[0], { id: "s1", state: "done" }, STEPS[2]]);
  });

  it("create refuses a new plan whose steps or criteria repeat an id, after the initial-state check; nothing written", async () => {
    const cases: Array<[string, Record<string, unknown>, { class: string; reason: string }]> = [
      ["steps", { state: "open", steps: [STEPS[0], { id: "s1", state: "in_progress" }], criteria: [], acceptance: null }, { class: "schema-invalid", reason: "duplicate-step-id" }],
      ["criteria", { state: "open", steps: [], criteria: [CRITERIA[0], { id: "c1", met: true }], acceptance: null }, { class: "schema-invalid", reason: "duplicate-criterion-id" }],
      ["a later state and a repeat", { state: "in_progress", steps: [STEPS[0], { id: "s1", state: "done" }], criteria: [], acceptance: null }, { class: "schema-invalid", reason: "not-initial-state" }],
    ];
    for (const [label, payload, expected] of cases) {
      const req = createPlanRequest({ payload });
      expect(errorOf(await dispatch(req)), label).toEqual(expected);
      expect(existsSync(join(root, PLAN)), `${label}: control`).toBe(false);
      expect(existsSync(join(root, NARRATIVE)), `${label}: narrative`).toBe(false);
      expect(answered(req.operation_id), `${label}: answer`).toBe(false);
      expect(journal(), `${label}: journal`).toEqual([]);
    }
    await newPlan();
    expect(controlOf()).toEqual({ state: "open", steps: [...STEPS], criteria: [...CRITERIA], acceptance: null });
  });

  // --- terminal refusal, and no general self-transition ---

  it("a closed and a deferred plan refuse a progress-only update and a state change carrying progress; nothing written", async () => {
    for (const terminal of ["closed", "deferred"]) {
      await newPlan();
      await lands(progress(terminal, {}), `open -> ${terminal}`);
      for (const [to, payload] of [
        [terminal, { steps: [{ id: "s1", state: "done" }] }],
        [terminal, { criteria: [{ id: "c1", met: true }] }],
        ["in_progress", { steps: [{ id: "s1", state: "done" }] }],
      ] as Array<[string, Progress]>) {
        const r = await refusedWith(progress(to, payload), { class: "conflict", reason: "transition-refused" }, `${terminal} -> ${to}`);
        expect(detailOf(r)).toContain(`${terminal} is terminal`);
      }
      // A fresh copy for the other terminal state: the plan id is taken now.
      rmSync(root, { recursive: true, force: true });
      cpSync(FIXTURE, root, { recursive: true });
    }
  });

  it("a progress-only update that changes nothing is refused: the exception is for progress, never a general self-transition", async () => {
    await newPlan();
    const nothing: Array<[string, Progress]> = [
      ["no payload", {}],
      ["empty arrays", { steps: [], criteria: [] }],
      ["entries equal to the stored ones", { steps: [STEPS[0]], criteria: [CRITERIA[1]] }],
    ];
    for (const [label, payload] of nothing) {
      await refusedWith(progress("open", payload), { class: "conflict", reason: "transition-refused" }, label);
    }
  });

  it("steps or criteria on an issue, a decision or a package are schema-invalid/payload-field-not-admitted, nothing written; the same move without them lands", async () => {
    const decision = createPlanRequest({
      id: "f2f2f2f2-0000-4000-8000-000000000002",
      kind: "decision",
      scope: { container: CONTAINER, store: "decisions" },
      narrative: { path: `${CONTAINER}/decisions/260929-1500-a-decision.md`, content: "# A decision\n" },
      payload: { state: "open", answer_ref: null, implementation_ref: null, superseded_by: null, deferral: null },
    });
    okResult(await dispatch(decision));
    const DECISION = `${CONTAINER}/decisions/260929-1500-a-decision.record.json`;
    const moves: Array<[string, string, Progress, Progress]> = [
      [ISSUE, "in_progress", {}, { steps: [{ id: "s1", state: "done" }] }],
      [DECISION, "answered", { answer_ref: "260809-1400-fixture-format-consultation.md" }, { criteria: [{ id: "c1", met: true }] }],
      [OPEN, "claimed", { claim: CLAIM }, { steps: [{ id: "s1", state: "done" }], criteria: [{ id: "c1", met: true }] }],
    ];
    for (const [path, to, base, extra] of moves) {
      const req = progress(to, { ...base, ...extra }, { record: { path }, expected_revision: revision(path) });
      const r = await refusedWith(req, { class: "schema-invalid", reason: "payload-field-not-admitted" }, path);
      expect(detailOf(r)).toContain("plan");
      okResult(await dispatch(progress(to, base, { record: { path }, expected_revision: revision(path) })));
    }
  });

  // --- route equivalence, and the bindings an adopted plan carries ---

  it("the progress-only and the state-changing route refuse a stale revision and a terminal record in the same class", async () => {
    await newPlan();
    const routes: Array<[string, string]> = [
      ["progress-only", "open"],
      ["state-changing", "in_progress"],
    ];
    for (const [label, to] of routes) {
      await refusedWith(progress(to, { steps: [{ id: "s1", state: "done" }] }, { expected_revision: STALE }), { class: "conflict", reason: "revision-mismatch" }, `${label}, stale`);
    }
    await lands(progress("closed", {}));
    for (const [label, to] of [
      ["progress-only", "closed"],
      ["state-changing", "in_progress"],
    ]) {
      await refusedWith(progress(to as string, { steps: [{ id: "s1", state: "done" }] }), { class: "conflict", reason: "transition-refused" }, `${label}, terminal`);
      await refusedWith(progress(to as string, { steps: [{ id: "s1", state: "done" }] }, { expected_revision: STALE }), { class: "conflict", reason: "revision-mismatch" }, `${label}, terminal and stale`);
    }
  });

  it("an adopted plan keeps its acceptance, the package's entry and its revision binding; reconcile reports an evidence binding against that plan fresh after progress", async () => {
    await newPlan();
    const adopt: AdoptPlanRequest = {
      op: "adopt-plan",
      workbench: root,
      operation_id: randomUUID(),
      record: { path: OPEN },
      expected_revision: revision(OPEN),
      actor: ACTOR,
      plan: { workbench_id: WB_ID, record_id: PLAN_ID },
      revision: revision(NARRATIVE),
    };
    okResult(await dispatch(adopt));
    const ev = await seedEvidence(root, { package: OPEN });
    expect(ev.record.plan_revision, "the evidence was produced against the plan in force").toBe(revision(NARRATIVE));
    okResult(
      await dispatch({ op: "attach-evidence", workbench: root, operation_id: randomUUID(), record: { path: OPEN }, expected_revision: revision(OPEN), actor: ACTOR, evidence: ev.binding } satisfies AttachEvidenceRequest),
    );
    const acceptance = controlOf().acceptance;
    expect(acceptance).toEqual({ ref: { workbench_id: WB_ID, record_id: OPEN_ID }, revision: revision(NARRATIVE) });
    const references = parsed(PLAN).references;
    const pkg = snapshot(OPEN, NARRATIVE, ev.path, ev.report);

    await lands(progress("in_progress", { steps: [{ id: "s1", state: "in_progress" }], criteria: [{ id: "c1", met: false }] }));
    const control = await lands(progress("in_progress", { steps: [{ id: "s1", state: "done" }], criteria: [{ id: "c1", met: true }] }));

    expect(control.acceptance, "acceptance").toEqual(acceptance);
    expect(parsed(PLAN).references, "references").toEqual(references);
    for (const [path, bytes] of Object.entries(pkg)) expect(bytesOf(path).equals(bytes), `${path} untouched`).toBe(true);
    const entry = (parsed(OPEN).active_documents as Array<Record<string, unknown>>).find((d) => d.role === "plan");
    expect(entry).toEqual({ ref: { workbench_id: WB_ID, record_id: PLAN_ID }, role: "plan", revision: revision(NARRATIVE) });

    // The scratch workbench's done package carries a stale binding of its own; this package's one binding is the question.
    const report = okResult(await dispatch({ op: "reconcile", workbench: root, scope: CONTAINER })) as { evidence: Array<{ path: string; record_id: string; status: string }>; records: unknown[] };
    expect(report.evidence).toEqual([expect.objectContaining({ path: OPEN, at: "/evidence/0", record_id: ev.id, revision: ev.revision, status: "fresh" })]);
    expect(report.records).toEqual([]);
  });
});

// --- create of an evidence record (FJ02b step 3, Prior's FJ02 response 19) ---------------

describe("create: evidence", () => {
  const WB_ID = "5d6d15ba-5b44-45b2-8aa2-39dd3bf82964";
  const OPEN_ID = "591d5bf4-2219-46b6-a0d3-cbdb28d6af16";
  const CONTAINER = "work-packages/260928-1200-parser-fix";
  const OPEN_NARRATIVE = `${CONTAINER}/260928-1200-parser-fix.md`;
  const REVIEWS = `${CONTAINER}/reviews`;
  const BASENAME = "260929-1600-review";
  const REPORT = `${REVIEWS}/${BASENAME}.md`;
  const FIRST = `${REVIEWS}/${BASENAME}.evidence.json`;
  const at = (n: number): string => `${REVIEWS}/${BASENAME}.${n}.evidence.json`;
  const REPORT_TEXT = "# Review of the parser fix\n\nVerdict: accept. Every check passed.\n";
  const OTHER_TEXT = "# Review of the parser fix, rewritten\n\nVerdict: revise.\n";
  const ZERO = "sha256:" + "0".repeat(64);
  const evidenceId = (n: number): string => `e8e8e8e8-0000-4000-8000-${String(n).padStart(12, "0")}`;

  const errorOf = (r: Response): { class: string; reason: string } => {
    expect(r.ok, JSON.stringify(r)).toBe(false);
    if (r.ok) throw new Error("unreachable");
    return { class: r.error.class, reason: r.error.reason };
  };
  const detailOf = (r: Response): string => (r.ok ? "" : (r.error.detail ?? ""));
  const parsed = (path: string): Record<string, unknown> => {
    const p = strictParse(bytesOf(path));
    if (!p.ok) throw new Error(p.detail);
    return p.value as Record<string, unknown>;
  };
  const answered = (id: string): boolean => existsSync(join(root, ".json-state", "ops", `${id}.json`));
  const journal = (): string[] => (existsSync(join(root, ".json-state", "journal")) ? readdirSync(join(root, ".json-state", "journal")) : []);
  const writeAt = (path: string, text: string): void => {
    mkdirSync(join(root, path, ".."), { recursive: true });
    writeFileSync(join(root, path), text);
  };
  /** Every file under the workbench but `.json-state/`, with its bytes: what a refusal must leave as it was. */
  const tree = (): Map<string, string> => {
    const out = new Map<string, string>();
    const walk = (dir: string, rel: string): void => {
      for (const e of readdirSync(dir, { withFileTypes: true })) {
        if (rel === "" && e.name === ".json-state") continue;
        const r = rel === "" ? e.name : `${rel}/${e.name}`;
        if (e.isDirectory()) walk(join(dir, e.name), r);
        else out.set(r, revisionOf(readFileSync(join(dir, e.name))));
      }
    };
    walk(root, "");
    return out;
  };

  /** A complete evidence record for the scratch open package over `REPORT` as it stands, with `over` applied. */
  const payloadOf = (id: string, over: Record<string, unknown> = {}): Record<string, unknown> => ({
    schema: "fusion.evidence/v1",
    id,
    workbench_id: WB_ID,
    subject: { git_tree: "0566591299a5f2c11f2573973ffc894791d20ee7", git_range: null },
    brief_revision: revision(OPEN_NARRATIVE),
    plan_revision: null,
    role: { profile: "reviewer", version: "12.0.0" },
    host: "claude-code",
    execution_policy: "claude-guided",
    verdict: "accept",
    uncertainties: [],
    checks: [{ id: "tests-green", result: "pass", detail: null }],
    report: { path: REPORT, sha256: existsSync(join(root, REPORT)) ? revision(REPORT) : ZERO, kind: "review" },
    predecessor: null,
    accepted_at: "2026-09-29T16:00:00Z",
    extensions: {},
    ...over,
  });
  const createRequest = (payload: Record<string, unknown>, over: Partial<CreateEvidenceRequest> = {}): CreateEvidenceRequest => ({
    op: "create",
    workbench: root,
    operation_id: randomUUID(),
    id: payload.id as string,
    kind: "evidence",
    scope: { container: CONTAINER, store: "reviews" },
    payload: payload as EvidencePayload,
    ...over,
  });
  /** The predecessor reference to the evidence file at `path`, pinned at its stored revision. */
  const predecessorOf = (path: string): RecordRef => ({ workbench_id: WB_ID, record_id: parsed(path).id as string, revision: revision(path) });
  /** A correction of the record at `of` over the report as it stands. */
  const correctionOf = (n: number, of: string, over: Record<string, unknown> = {}): Record<string, unknown> => payloadOf(evidenceId(n), { predecessor: predecessorOf(of), accepted_at: "2026-09-29T17:00:00Z", ...over });

  /** Dispatches `req`, asserts the answer's shape and that the file holds `serialise(payload)`; the answer's path. */
  const lands = async (req: CreateEvidenceRequest, path: string, label = path): Promise<Response> => {
    expect(existsSync(join(root, path)), `${label}: nothing stood at the path before`).toBe(false);
    const r = await dispatch(req);
    const result = okResult(r);
    expect(Object.keys(result), label).toEqual(["operation_id", "path", "kind", "revision", "report"]);
    expect(result, label).toEqual({ operation_id: req.operation_id, path, kind: "evidence", revision: revision(path), report: { path: req.payload.report.path, sha256: req.payload.report.sha256 } });
    if (r.ok) expect(r.revisions, label).toEqual({ [path]: revision(path) });
    expect(bytesOf(path).toString("utf-8"), `${label}: exactly the payload, serialised`).toBe(serialise(req.payload));
    return r;
  };
  /** Refused with `expected`: no file under the workbench changed or appeared, no answer, no pending intent. */
  const refusedWith = async (req: CreateEvidenceRequest, expected: { class: string; reason: string }, label: string): Promise<Response> => {
    const before = tree();
    const r = await dispatch(req);
    expect(errorOf(r), label).toEqual(expected);
    expect(tree(), `${label}: the workbench`).toEqual(before);
    expect(answered(req.operation_id), `${label}: answer`).toBe(false);
    expect(journal(), `${label}: journal`).toEqual([]);
    return r;
  };
  const reviews = (): string[] => readdirSync(join(root, REVIEWS)).sort();

  // --- creation and replay ---

  it("a first record lands at <basename>.evidence.json as serialise(payload); show and validate read it; the report is not written", async () => {
    writeAt(REPORT, REPORT_TEXT);
    const reportBytes = bytesOf(REPORT);
    const payload = payloadOf(evidenceId(1));
    await lands(createRequest(payload), FIRST);
    expect(reviews()).toEqual([`${BASENAME}.evidence.json`, `${BASENAME}.md`]);
    expect(bytesOf(REPORT).equals(reportBytes), "the report is the reviewer's file").toBe(true);
    const shown = okResult(await dispatch({ op: "show", workbench: root, record: { path: FIRST } }));
    expect(shown).toEqual({ path: FIRST, kind: "evidence", control: payload, revision: revision(FIRST), narrative: null, report: { path: REPORT, sha256: revision(REPORT), stored: revision(REPORT) } });
    expect(okResult(await dispatch({ op: "validate", workbench: root, record: { path: FIRST } }))).toMatchObject({ checked: 1, valid: true, findings: [] });
    expect(okResult(await dispatch({ op: "validate", workbench: root }))).toMatchObject({ valid: true });
  });

  it("an identical replay returns the same answer; a divergent one is operation-id-reused; a fresh operation id with the same evidence id is id-in-use; nothing written by any", async () => {
    writeAt(REPORT, REPORT_TEXT);
    const req = createRequest(payloadOf(evidenceId(1)));
    const first = await lands(req, FIRST);
    const bytes = bytesOf(FIRST);
    expect(await dispatch(req)).toEqual(first);
    expect(bytesOf(FIRST).equals(bytes)).toBe(true);
    expect(reviews()).toEqual([`${BASENAME}.evidence.json`, `${BASENAME}.md`]);

    const before = tree();
    expect(errorOf(await dispatch({ ...req, payload: { ...req.payload, verdict: "revise" } }))).toEqual({ class: "conflict", reason: "operation-id-reused" });
    expect(tree()).toEqual(before);
    await refusedWith(createRequest(payloadOf(evidenceId(1))), { class: "conflict", reason: "id-in-use" }, "the same evidence id under a fresh operation id");
  });

  // --- correction and suffix freezing ---

  it("corrections over the unchanged report take .2, then .3, then one above the highest; an identical replay of the first correction after later ones still answers .2", async () => {
    writeAt(REPORT, REPORT_TEXT);
    await lands(createRequest(payloadOf(evidenceId(1))), FIRST);
    const firstBytes = bytesOf(FIRST);
    const reportBytes = bytesOf(REPORT);

    const c2 = createRequest(correctionOf(2, FIRST));
    const answer2 = await lands(c2, at(2), ".2");
    expect(bytesOf(FIRST).equals(firstBytes), "the predecessor is never modified").toBe(true);
    expect(bytesOf(REPORT).equals(reportBytes), "the report is never rewritten").toBe(true);
    await lands(createRequest(correctionOf(3, FIRST)), at(3), ".3");
    // A correction of a correction names the same report: one above the highest present.
    await lands(createRequest(correctionOf(4, at(2))), at(4), ".4, correcting .2");

    const listed = reviews();
    expect(await dispatch(c2), "the suffix frozen in the stored answer").toEqual(answer2);
    expect(reviews(), "the replay allocated nothing").toEqual(listed);
    expect(bytesOf(FIRST).equals(firstBytes)).toBe(true);
    expect(bytesOf(REPORT).equals(reportBytes)).toBe(true);
    for (const path of [FIRST, at(2), at(3), at(4)]) {
      expect(okResult(await dispatch({ op: "validate", workbench: root, record: { path } })), path).toMatchObject({ valid: true, findings: [] });
    }
  });

  it("the narrowed guarantee: with the highest correction deleted by hand the next takes its suffix again; a gap below the highest is not refilled; no chosen path collides with a file that stands", async () => {
    writeAt(REPORT, REPORT_TEXT);
    await lands(createRequest(payloadOf(evidenceId(1))), FIRST);
    await lands(createRequest(correctionOf(2, FIRST)), at(2));
    const c3 = createRequest(correctionOf(3, FIRST));
    const answer3 = await lands(c3, at(3));

    unlinkSync(join(root, at(3)));
    // `lands` asserts nothing stood at the path before the request.
    await lands(createRequest(correctionOf(5, FIRST)), at(3), ".3 chosen again");
    expect(parsed(at(3)).id, "the file at .3 is the new record").toBe(evidenceId(5));
    // The stored answer of the first .3 still names it; a replay answers it and writes nothing.
    const bytes = bytesOf(at(3));
    expect(await dispatch(c3)).toEqual(answer3);
    expect(bytesOf(at(3)).equals(bytes)).toBe(true);

    unlinkSync(join(root, at(2)));
    await lands(createRequest(correctionOf(6, FIRST)), at(4), "the gap at .2 is not refilled");
  });

  // --- the two review corrections: a changed report under the same basename ---

  it("a correction under the same basename over a changed report is refused, nothing written: naming the new hash is predecessor-report-changed, naming the old one report-changed", async () => {
    writeAt(REPORT, REPORT_TEXT);
    await lands(createRequest(payloadOf(evidenceId(1))), FIRST);
    const hashA = revision(REPORT);
    const firstBytes = bytesOf(FIRST);
    writeAt(REPORT, OTHER_TEXT);
    const hashB = revision(REPORT);
    expect(hashB).not.toBe(hashA);

    const newHash = await refusedWith(createRequest(correctionOf(2, FIRST, { report: { path: REPORT, sha256: hashB, kind: "review" } })), { class: "conflict", reason: "predecessor-report-changed" }, "the new evidence names hash B");
    expect(detailOf(newHash)).toContain(hashA);
    expect(detailOf(newHash)).toContain(hashB);
    await refusedWith(createRequest(correctionOf(3, FIRST, { report: { path: REPORT, sha256: hashA, kind: "review" } })), { class: "missing-evidence", reason: "report-changed" }, "the new evidence names hash A, the file is at B");
    expect(bytesOf(FIRST).equals(firstBytes), "the predecessor").toBe(true);
    expect(revision(REPORT), "the report as the reviewer left it").toBe(hashB);
    expect(reviews()).toEqual([`${BASENAME}.evidence.json`, `${BASENAME}.md`]);
  });

  it("a correction whose predecessor names another report takes that report's first-record name", async () => {
    writeAt(REPORT, REPORT_TEXT);
    await lands(createRequest(payloadOf(evidenceId(1))), FIRST);
    const REPORT2 = `${REVIEWS}/260929-1601-review.md`;
    writeAt(REPORT2, OTHER_TEXT);
    await lands(createRequest(correctionOf(2, FIRST, { report: { path: REPORT2, sha256: revision(REPORT2), kind: "review" } })), `${REVIEWS}/260929-1601-review.evidence.json`);
  });

  it("predecessor null at a taken name is conflict/record-exists, never read as a correction", async () => {
    writeAt(REPORT, REPORT_TEXT);
    await lands(createRequest(payloadOf(evidenceId(1))), FIRST);
    const r = await refusedWith(createRequest(payloadOf(evidenceId(2))), { class: "conflict", reason: "record-exists" }, "predecessor null over the same report");
    expect(detailOf(r)).toContain(FIRST);
  });

  // --- wrong report, hash, scope and id ---

  it("each refusal of the check list with the one field changed, nothing written; the unchanged request then lands", async () => {
    writeAt(REPORT, REPORT_TEXT);
    await lands(createRequest(payloadOf(evidenceId(1))), FIRST);
    const good = (): Record<string, unknown> => correctionOf(2, FIRST);
    const reportAt = (path: string): Record<string, unknown> => ({ report: { path, sha256: revision(path), kind: "review" } });
    const NOWHERE = "work-packages/260929-1600-no-package";
    for (const [path, text] of [
      [`${CONTAINER}/analyses/${BASENAME}.md`, REPORT_TEXT],
      [`shared/reviews/${BASENAME}.md`, REPORT_TEXT],
      [`${NOWHERE}/reviews/${BASENAME}.md`, REPORT_TEXT],
      [`${REVIEWS}/260929-1602-review.2.md`, REPORT_TEXT],
      [`${REVIEWS}/260929-1603_o_review.md`, REPORT_TEXT],
      [`${REVIEWS}/260929-1604-review.txt`, REPORT_TEXT],
    ] as const) {
      writeAt(path, text);
    }
    const foreign = "0e0e0e0e-0000-4000-8000-000000000000";
    const cases: Array<[string, () => CreateEvidenceRequest, { class: string; reason: string }]> = [
      ["the envelope's id and the payload's disagree", () => createRequest(good(), { id: evidenceId(9) }), { class: "schema-invalid", reason: "id-mismatch" }],
      ["another workbench's id in the payload", () => createRequest({ ...good(), workbench_id: foreign }), { class: "unknown-scope", reason: "foreign-workbench-id" }],
      ["a report outside the scope's reviews/ store", () => createRequest({ ...good(), ...reportAt(`${CONTAINER}/analyses/${BASENAME}.md`) }), { class: "unknown-scope", reason: "store-kind-mismatch" }],
      ["a report in shared/reviews/ under a container's scope", () => createRequest({ ...good(), ...reportAt(`shared/reviews/${BASENAME}.md`) }), { class: "unknown-scope", reason: "store-kind-mismatch" }],
      ["the container's report under the shared scope", () => createRequest(good(), { scope: { container: null, store: "reviews" } }), { class: "unknown-scope", reason: "store-kind-mismatch" }],
      ["a container that is no package", () => createRequest({ ...good(), ...reportAt(`${NOWHERE}/reviews/${BASENAME}.md`) }, { scope: { container: NOWHERE, store: "reviews" } }), { class: "unknown-scope", reason: "container-missing" }],
      ["a report basename ending in .2", () => createRequest({ ...good(), ...reportAt(`${REVIEWS}/260929-1602-review.2.md`) }), { class: "schema-invalid", reason: "report-name" }],
      ["a report name carrying a state marker", () => createRequest({ ...good(), ...reportAt(`${REVIEWS}/260929-1603_o_review.md`) }), { class: "schema-invalid", reason: "report-name" }],
      ["a report that is no Markdown file", () => createRequest({ ...good(), ...reportAt(`${REVIEWS}/260929-1604-review.txt`) }), { class: "schema-invalid", reason: "report-name" }],
      ["a report absent", () => createRequest({ ...good(), report: { path: `${REVIEWS}/260929-1605-review.md`, sha256: ZERO, kind: "review" } }), { class: "unresolved-reference", reason: "report-missing" }],
      ["a report at another hash", () => createRequest({ ...good(), report: { path: REPORT, sha256: ZERO, kind: "review" } }), { class: "missing-evidence", reason: "report-changed" }],
      ["a predecessor no control file carries", () => createRequest({ ...good(), predecessor: { workbench_id: WB_ID, record_id: evidenceId(99) } }), { class: "unresolved-reference", reason: "record-not-found" }],
      ["a predecessor of another workbench", () => createRequest({ ...good(), predecessor: { ...predecessorOf(FIRST), workbench_id: foreign } }), { class: "unresolved-reference", reason: "foreign-workbench" }],
      ["a predecessor that is no evidence record", () => createRequest({ ...good(), predecessor: { workbench_id: WB_ID, record_id: OPEN_ID } }), { class: "unresolved-reference", reason: "not-evidence" }],
      ["a predecessor pinned at another revision", () => createRequest({ ...good(), predecessor: { ...predecessorOf(FIRST), revision: ZERO } }), { class: "missing-evidence", reason: "evidence-revision-mismatch" }],
    ];
    for (const [label, req, expected] of cases) await refusedWith(req(), expected, label);
    // Every refusal above came from its one field.
    await lands(createRequest(good()), at(2), "the unchanged correction");
    // A predecessor without a pinned revision resolves by id alone.
    const { revision: _pinned, ...unpinned } = predecessorOf(FIRST);
    await lands(createRequest(correctionOf(3, FIRST, { predecessor: unpinned })), at(3), "an unpinned predecessor");
  });

  it("a record into shared/reviews/ lands under the shared scope", async () => {
    const SHARED = `shared/reviews/${BASENAME}.md`;
    writeAt(SHARED, REPORT_TEXT);
    await lands(createRequest(payloadOf(evidenceId(1), { report: { path: SHARED, sha256: revision(SHARED), kind: "review" } }), { scope: { container: null, store: "reviews" } }), `shared/reviews/${BASENAME}.evidence.json`);
  });

  // --- host labels ---

  it("host prior, prior-enforced and accept land as sent and confer nothing: attach checks policy and freshness on its own; a claude-guided record stays claude-guided", async () => {
    writeAt(REPORT, REPORT_TEXT);
    const labelled = payloadOf(evidenceId(1), { host: "prior", execution_policy: "prior-enforced", verdict: "accept" });
    await lands(createRequest(labelled), FIRST);
    expect(parsed(FIRST), "stored as sent, nothing added or upgraded").toEqual(labelled);
    const REPORT2 = `${REVIEWS}/260929-1601-review.md`;
    writeAt(REPORT2, OTHER_TEXT);
    const guided = payloadOf(evidenceId(2), { report: { path: REPORT2, sha256: revision(REPORT2), kind: "review" } });
    const GUIDED = `${REVIEWS}/260929-1601-review.evidence.json`;
    await lands(createRequest(guided), GUIDED);
    expect(parsed(GUIDED).execution_policy).toBe("claude-guided");

    const attach = (path: string, policy: EvidenceRef["policy"]): AttachEvidenceRequest => ({
      op: "attach-evidence",
      workbench: root,
      operation_id: randomUUID(),
      record: { path: OPEN },
      expected_revision: revision(OPEN),
      actor: ACTOR,
      evidence: { ref: { workbench_id: WB_ID, record_id: parsed(path).id as string, revision: revision(path) }, policy },
    });
    const pkg = bytesOf(OPEN);
    expect(errorOf(await dispatch(attach(FIRST, "claude-guided")))).toEqual({ class: "schema-invalid", reason: "policy-mismatch" });
    expect(errorOf(await dispatch(attach(GUIDED, "prior-enforced"))), "a binding never upgrades claude-guided").toEqual({ class: "schema-invalid", reason: "policy-mismatch" });
    writeFileSync(join(root, OPEN_NARRATIVE), `${bytesOf(OPEN_NARRATIVE).toString("utf-8")}\nOne more requirement.\n`);
    expect(errorOf(await dispatch(attach(FIRST, "prior-enforced"))), "the label does not make stale evidence fresh").toEqual({ class: "missing-evidence", reason: "brief-changed" });
    expect(bytesOf(OPEN).equals(pkg), "no binding was written").toBe(true);
    expect(parsed(GUIDED).execution_policy).toBe("claude-guided");
  });
});

// --- archive/: outside the current record store ---------------------------------------------
//
// The boundary of Prior's ruling on request 36 (`codec/fixtures/prior/REQUESTS.md`,
// "The boundary: `archive/` outside the current record store"), row by row. The
// host moves pairs into `archive/<stamp>/` by hand here, as its archive helper will:
// the codec moves no file.

describe("archive/: outside the current record store", () => {
  const WB_ID = "5d6d15ba-5b44-45b2-8aa2-39dd3bf82964";
  const ISSUE_ID = "d068e1ae-3f62-429a-880a-2785763aaf01";
  const ARCH = "archive/260930-1200-sweep";
  const OLD_ID = "a1a1a1a1-0000-4000-8000-000000000001";
  const KEPT_ID = "a1a1a1a1-0000-4000-8000-000000000002";
  const NESTED_ID = "a1a1a1a1-0000-4000-8000-000000000003";
  const OLD = "shared/issues/260901-1000-stats-file-stale.record.json";
  const KEPT = "shared/issues/260902-1000-stats-refresh-follow-up.record.json";
  const NESTED = "shared/archive/260903-1000-nested-store.record.json";
  const DONE_DIR = "work-packages/260927-0900-strict-reader";
  const BACKUP = "archive/migrations/migration-20260928-example/backup/shared/issues/260901-1000-stats-file-stale.md";
  const OLD_AT = `${ARCH}/${OLD}`;
  const DONE_AT = `${ARCH}/${DONE_DIR}/package.json`;
  const DUPLICATE_AT = `${ARCH}/${ISSUE}`;

  const errorOf = (r: Response): { class: string; reason: string } => {
    expect(r.ok, JSON.stringify(r)).toBe(false);
    if (r.ok) throw new Error("unreachable");
    return { class: r.error.class, reason: r.error.reason };
  };
  const journal = (): string[] => (existsSync(join(root, ".json-state", "journal")) ? readdirSync(join(root, ".json-state", "journal")) : []);
  const writeAt = (path: string, bytes: string | Buffer): void => {
    mkdirSync(join(root, path, ".."), { recursive: true });
    writeFileSync(join(root, path), bytes);
  };
  /** Moves a file or directory as the host's archive move does: the same bytes at the new path. */
  const move = (from: string, to: string): void => {
    mkdirSync(join(root, to, ".."), { recursive: true });
    renameSync(join(root, from), join(root, to));
  };
  /** A closed issue pair at `path`, its narrative beside it, carrying `references`. */
  const closedIssue = (path: string, id: string, references: unknown[]): void => {
    const narrative = path.replace(/\.record\.json$/, ".md");
    writeAt(narrative, `# ${id}\n\nClosed.\n`);
    const record = { ...fixture("record/issue-closed.json"), id, narrative: { path: narrative }, references, provenance: { source: "created", legacy_fields: {} } };
    writeAt(path, serialise(record));
  };
  const wb = () => {
    const r = openWorkbench(root);
    if (!r.ok) throw new Error(r.error.detail);
    return r.value;
  };
  const listed = async (scope?: string): Promise<string[]> =>
    (okResult(await dispatch({ op: "list", workbench: root, ...(scope !== undefined ? { scope } : {}) })).records as Array<{ path: string }>).map((r) => r.path);

  beforeEach(() => {
    // A terminal issue pair that is archived, and a terminal issue that stays and
    // references it by id and the migration backup under archive/ by hash.
    closedIssue(OLD, OLD_ID, []);
    writeAt(BACKUP, "# the stats file is stale\n\nBackup bytes.\n");
    closedIssue(KEPT, KEPT_ID, [
      { workbench_id: WB_ID, record_id: OLD_ID, display: "260901-1000-stats-file-stale.md" },
      { path: BACKUP, sha256: revision(BACKUP), kind: "other" },
    ]);
    move(OLD, OLD_AT);
    move(OLD.replace(/\.record\.json$/, ".md"), OLD_AT.replace(/\.record\.json$/, ".md"));
    // A whole terminal package, and an archive-only copy of a current record's control file.
    move(DONE_DIR, `${ARCH}/${DONE_DIR}`);
    writeAt(DUPLICATE_AT, bytesOf(ISSUE));
    // A directory named archive below shared/ is an ordinary store directory.
    closedIssue(NESTED, NESTED_ID, []);
  });

  it("unscoped list, validate and reconcile name nothing in archive/, validate is valid, and a nested archive/ stays in the store", async () => {
    const current = [ISSUE, KEPT, NESTED, OPEN].sort();
    expect(await listed()).toEqual(current);
    expect(okResult(await dispatch({ op: "validate", workbench: root }))).toEqual({ workbench: root, state: "json-control", checked: 4, valid: true, findings: [] });
    const rec = okResult(await dispatch({ op: "reconcile", workbench: root }));
    expect(rec.checked).toBe(4);
    expect(JSON.stringify(rec)).not.toContain("archive/260930");
    expect(await listed("shared/archive")).toEqual([NESTED]);
    expect(okResult(await dispatch({ op: "show", workbench: root, record: { path: NESTED } }))).toMatchObject({ path: NESTED, kind: "issue" });
  });

  it("a by-id reference from a remaining terminal record to an archived one is record-not-found; a hash-bound artefact under archive/ still resolves", async () => {
    const refs = (okResult(await dispatch({ op: "reconcile", workbench: root })).references as Array<Record<string, unknown>>).filter((e) => e.path === KEPT && String(e.at).startsWith("/references/"));
    expect(refs).toEqual([
      { path: KEPT, at: "/references/0", status: "unresolved", class: "unresolved-reference", reason: "record-not-found" },
      { path: KEPT, at: "/references/1", status: "resolved", target: BACKUP },
    ]);
    expect(readContext(wb(), []).resolveArtefact({ path: BACKUP, sha256: revision(BACKUP) })).toEqual({ ok: true, value: { path: BACKUP, sha256: revision(BACKUP) } });
  });

  it("both id resolvers: an id only in archive/ is record-not-found, never ambiguous; an archive-only duplicate leaves the current id unambiguous", () => {
    for (const [name, ctx] of [["kernel", readContext(wb(), [])], ["reconcile index", indexedContext(readContext(wb(), []))]] as const) {
      expect(ctx.resolveRecordId(OLD_ID), name).toMatchObject({ ok: false, error: { class: "unresolved-reference", reason: "record-not-found" } });
      expect(ctx.resolveRecordId(ISSUE_ID), name).toEqual({ ok: true, value: { path: ISSUE, id: ISSUE_ID } });
    }
  });

  it("show and validate of an archived path are record-not-found, a normalised spelling included", async () => {
    for (const path of [OLD_AT, DONE_AT, DUPLICATE_AT, `./${OLD_AT}`]) {
      expect(errorOf(await dispatch({ op: "show", workbench: root, record: { path } })), path).toEqual({ class: "unresolved-reference", reason: "record-not-found" });
      const v = okResult(await dispatch({ op: "validate", workbench: root, record: { path } }));
      expect(v, path).toMatchObject({ checked: 1, valid: false, findings: [{ path, class: "unresolved-reference", reason: "record-not-found" }] });
    }
  });

  it("list and reconcile scoped to archive/ or below are unknown-scope/archived-path, an absent path below it included", async () => {
    for (const scope of ["archive", ARCH, `${ARCH}/shared/issues`, `./${ARCH}`, "archive/absent"]) {
      for (const op of ["list", "reconcile"]) {
        expect(errorOf(await dispatch({ op, workbench: root, scope })), `${op} ${scope}`).toEqual({ class: "unknown-scope", reason: "archived-path" });
      }
    }
  });

  it("a mutation's record in archive/ is record-not-found, with nothing written", async () => {
    const before = bytesOf(DONE_AT);
    const requests = [
      transitionRequest({ record: { path: DONE_AT }, expected_revision: revision(DONE_AT), to: "open", payload: {} }),
      transitionRequest({ record: { path: OLD_AT }, expected_revision: revision(OLD_AT), to: "open", payload: {} }),
      { op: "set-mode", workbench: root, operation_id: randomUUID(), record: { path: DONE_AT }, expected_revision: revision(DONE_AT), actor: ACTOR, mode: { value: "ordinary", source: null } },
    ];
    for (const req of requests) {
      const r = await dispatch(req);
      if (r.ok || r.error.class === "schema-invalid") throw new Error(JSON.stringify(r));
      expect(errorOf(r), JSON.stringify(req.record)).toEqual({ class: "unresolved-reference", reason: "record-not-found" });
    }
    expect(bytesOf(DONE_AT).equals(before)).toBe(true);
    expect(journal()).toEqual([]);
  });

  it("create into archive/ is unknown-scope/archived-path before any write: a record's container, an evidence record's container", async () => {
    const recordReq: CreateRequest = {
      op: "create",
      workbench: root,
      operation_id: randomUUID(),
      id: "b1b1b1b1-0000-4000-8000-000000000001",
      kind: "issue",
      filed_by: ACTOR,
      origin: { kind: "user-request", ref: null },
      scope: { container: `${ARCH}/${DONE_DIR}`, store: "issues" },
      narrative: { path: `${ARCH}/${DONE_DIR}/issues/260930-1300-into-the-archive.md`, content: "# no\n" },
      payload: { state: "open", disposition: null },
    };
    expect(errorOf(await dispatch(recordReq))).toEqual({ class: "unknown-scope", reason: "archived-path" });
    expect(existsSync(join(root, recordReq.narrative.path))).toBe(false);
    const report = `${ARCH}/${DONE_DIR}/reviews/260930-1300-review.md`;
    writeAt(report, "# A review of an archived package\n");
    const payload = { ...fixture("evidence/revise-claude-guided.json"), id: "b1b1b1b1-0000-4000-8000-000000000002", workbench_id: WB_ID, predecessor: null, report: { path: report, sha256: revision(report), kind: "review" } };
    const evReq: CreateEvidenceRequest = { op: "create", workbench: root, operation_id: randomUUID(), id: payload.id, kind: "evidence", scope: { container: `${ARCH}/${DONE_DIR}`, store: "reviews" }, payload: payload as unknown as EvidencePayload };
    expect(errorOf(await dispatch(evReq))).toEqual({ class: "unknown-scope", reason: "archived-path" });
    expect(readdirSync(join(root, ARCH, DONE_DIR, "reviews")).filter((n) => n.endsWith(".evidence.json"))).toEqual([]);
    expect(journal()).toEqual([]);
  });

  it("a link shared/old -> ../archive/... is refused like the path it aliases: show, validate, transition, list, reconcile, create", async () => {
    symlinkSync(`../${ARCH}/shared/issues`, join(root, "shared", "old"));
    const alias = `shared/old/${OLD.slice("shared/issues/".length)}`;
    expect(existsSync(join(root, alias))).toBe(true);
    expect(errorOf(await dispatch({ op: "show", workbench: root, record: { path: alias } }))).toEqual({ class: "unresolved-reference", reason: "record-not-found" });
    expect(okResult(await dispatch({ op: "validate", workbench: root, record: { path: alias } }))).toMatchObject({ valid: false, findings: [{ reason: "record-not-found" }] });
    expect(errorOf(await dispatch(transitionRequest({ record: { path: alias }, expected_revision: revision(alias), to: "open", payload: {} })))).toEqual({ class: "unresolved-reference", reason: "record-not-found" });
    for (const op of ["list", "reconcile"]) expect(errorOf(await dispatch({ op, workbench: root, scope: "shared/old" })), op).toEqual({ class: "unknown-scope", reason: "archived-path" });
    // The shared plans store, aliased into the archive: create through it is refused.
    mkdirSync(join(root, ARCH, "shared", "plans"), { recursive: true });
    symlinkSync(`../${ARCH}/shared/plans`, join(root, "shared", "plans"));
    const planReq: CreateRequest = {
      op: "create",
      workbench: root,
      operation_id: randomUUID(),
      id: "b1b1b1b1-0000-4000-8000-000000000003",
      kind: "plan",
      filed_by: ACTOR,
      origin: { kind: "user-request", ref: null },
      scope: { container: null, store: "plans" },
      narrative: { path: "shared/plans/260930-1300-through-a-link.md", content: "# no\n" },
      payload: { state: "open", steps: [], criteria: [], acceptance: null },
    };
    expect(errorOf(await dispatch(planReq))).toEqual({ class: "unknown-scope", reason: "archived-path" });
    expect(readdirSync(join(root, ARCH, "shared", "plans"))).toEqual([]);
    expect(await listed(), "the walk follows no link").toEqual([ISSUE, KEPT, NESTED, OPEN].sort());
    expect(journal()).toEqual([]);
  });

  it("a replay of a create completed before its pair was archived answers its stored bytes and recreates nothing", async () => {
    const req: CreateRequest = {
      op: "create",
      workbench: root,
      operation_id: randomUUID(),
      id: "b1b1b1b1-0000-4000-8000-000000000004",
      kind: "issue",
      filed_by: ACTOR,
      origin: { kind: "user-request", ref: null },
      scope: { container: null, store: "issues" },
      narrative: { path: "shared/issues/260930-1400-archived-after-landing.md", content: "# landed\n" },
      payload: { state: "open", disposition: null },
    };
    const first = await dispatch(req);
    expect(first.ok, JSON.stringify(first)).toBe(true);
    const control = "shared/issues/260930-1400-archived-after-landing.record.json";
    move(control, `${ARCH}/${control}`);
    move(req.narrative.path, `${ARCH}/${req.narrative.path}`);
    expect(await dispatch(req)).toEqual(first);
    expect(existsSync(join(root, control))).toBe(false);
    expect(existsSync(join(root, req.narrative.path))).toBe(false);
    expect(journal()).toEqual([]);
  });
});
