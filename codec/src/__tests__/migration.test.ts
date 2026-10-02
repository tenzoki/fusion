// ---------------------------------------------------------------------------
// `migration survey` and `migration plan` (FJ04 step 5), against the contract
// delta as amended for Prior `ab9cb59` (`codec/fixtures/prior/REQUESTS.md`).
//
// Every store here is generated: a legacy v12-shaped tree of packages and
// issues with fixed ids, its proposal composed as the host would compose it,
// written to `.json-state/migration/proposal.json` and bound by its sha256.
// Nothing is copied from a real workbench. One generated store has the
// largest measured copy's size (749 pairs, 182 rewrites, 1 680 writes, 7 942
// files in 952 directories, one 465 KB narrative), and the freeze over it is
// held to the strict reader's cap and to its bound.
// ---------------------------------------------------------------------------

import { execFileSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { dispatch } from "../cli/ops.js";
import type { Response } from "../cli/protocol.js";
import { commitIntent, requestDigest, type Intent } from "../journal.js";
import { CutReached } from "../kernel.js";
import { CHUNK_WRITES, FREEZE_MAX_BYTES, FREEZE_MAX_FILES, PLAN_SCHEMA_ID, RECEIPT_SCHEMA_ID, applyDeletions, freezeOver, inventory } from "../migration.js";
import { revisionOf, serialise } from "../store.js";
import { MAX_RECORD_BYTES, strictParse } from "../strict-json.js";
import { validate } from "../validate.js";

const FIXTURE = fileURLToPath(new URL("../../fixtures/workbench/", import.meta.url));
const WB = "5e1f0000-0000-4000-8000-00000000f004";
const MID = "migration-20261002-generated";
const PROPOSAL = ".json-state/migration/proposal.json";
const uuid = (tag: number, n: number): string => `${tag.toString(16).padStart(8, "0")}-0000-4000-8000-${n.toString(16).padStart(12, "0")}`;
const rid = (n: number): string => uuid(0xa1, n);
const oid = (n: number): string => uuid(0xb1, n);
const pad = (n: number): string => String(n).padStart(4, "0");
const STATUS = "**Status:** open\n";

// --- the generator ------------------------------------------------------------------

interface Shape {
  packages: number;
  issues: number;
  /** How many issues carry a status line the import removes; every package does. */
  rewrittenIssues: number;
  /** Narrative body bytes beyond the head. */
  body: number;
  /** One package narrative of this many bytes, when set. */
  big?: number;
  /** Plain files beyond the narratives, and the directories they spread over. */
  filler?: { files: number; dirs: number; bytes: number };
  /** Spare operation ids beyond the schedule's need. */
  spare?: number;
}

interface Record_ {
  row: string;
  kind: string;
  narrative: string;
  source_sha256: string;
  control_path: string;
  backup: string;
  rewrite: { after_sha256: string; deletions: Array<{ offset: number; length: number }> } | null;
  control: Record<string, unknown>;
}

interface Proposal {
  schema: string;
  migration_id: string;
  workbench_id: string;
  source_layout: string;
  operation_ids: { plan: string; apply: string[]; verify: string; rollback: string[] };
  exclusions: string[];
  records: Record<string, Record_>;
  counts: Record<string, number>;
  findings: Array<Record<string, unknown>>;
  repairs: unknown[];
}

const backupOf = (narrative: string): string => `archive/migrations/${MID}/originals/${narrative}`;
const provenance = (marker: string | null, narrative: string, sha256: string): Record<string, unknown> => ({
  source: "imported",
  legacy_fields: { file_marker: marker, head: { Status: "open" } },
  backup: { path: backupOf(narrative), sha256, kind: "other" },
});

function packageControl(id: string, narrative: string, sha256: string): Record<string, unknown> {
  return {
    schema: "fusion.package/v1",
    id,
    workbench_id: WB,
    domain: "code",
    status: "open",
    claim: null,
    mode: { value: "ordinary", source: { kind: "legacy", raw: "**Mode:** ordinary" } },
    origin: { kind: "user-request", ref: null },
    filed_by: { actor: "user", person: "example-person" },
    narrative: { path: narrative },
    depends_on: [],
    active_documents: [],
    references: [],
    evidence: [],
    outcome: null,
    provenance: provenance(null, narrative, sha256),
    extensions: {},
  };
}

function recordControl(kind: string, id: string, narrative: string, sha256: string, control: Record<string, unknown>): Record<string, unknown> {
  return {
    schema: "fusion.record/v1",
    id,
    workbench_id: WB,
    kind,
    narrative: { path: narrative },
    filed_by: { actor: "reviewer", person: null },
    references: [],
    provenance: provenance("o", narrative, sha256),
    extensions: {},
    control,
  };
}

const write = (root: string, path: string, bytes: string | Buffer): void => {
  mkdirSync(dirname(join(root, path)), { recursive: true });
  writeFileSync(join(root, path), bytes);
};

/** Writes a legacy store of `shape` under `root` and returns the proposal the host would compose for it. */
function generate(root: string, shape: Shape): Proposal {
  const records: Record<string, Record_> = {};
  const add = (id: string, r: Omit<Record_, "backup">): void => {
    records[id] = { ...r, backup: backupOf(r.narrative) };
  };
  const narrative = (title: string, n: number, bytes: number): string => `${STATUS}# ${title}\n\n${"lorem ipsum dolor sit amet ".repeat(Math.ceil(bytes / 27)).slice(0, bytes)}\n`;
  const withRewrite = (text: string): { sha: string; rewrite: Record_["rewrite"] } => {
    const src = Buffer.from(text, "utf-8");
    const out = applyDeletions(src, [{ offset: 0, length: Buffer.byteLength(STATUS) }]);
    if (!out.ok) throw new Error(out.why);
    return { sha: revisionOf(src), rewrite: { after_sha256: revisionOf(out.bytes), deletions: [{ offset: 0, length: Buffer.byteLength(STATUS) }] } };
  };
  const dirs: string[] = [];
  for (let i = 0; i < shape.packages; i++) {
    const name = `260901-0900-pkg-${pad(i)}`;
    const dir = `work-packages/${name}`;
    dirs.push(dir);
    const path = `${dir}/${name}.md`;
    const text = narrative(`Package ${i}`, i, i === 0 && shape.big !== undefined ? shape.big : shape.body);
    write(root, path, text);
    const { sha, rewrite } = withRewrite(text);
    const id = rid(i);
    add(id, { row: "package-live", kind: "package", narrative: path, source_sha256: sha, control_path: `${dir}/package.json`, rewrite, control: packageControl(id, path, sha) });
  }
  for (let j = 0; j < shape.issues; j++) {
    const dir = dirs[j % dirs.length] as string;
    const stem = `260901-1000_o_issue-${pad(j)}`;
    const path = `${dir}/issues/${stem}.md`;
    const rewritten = j < shape.rewrittenIssues;
    const text = rewritten ? narrative(`Issue ${j}`, j, shape.body) : narrative(`Issue ${j}`, j, shape.body).slice(STATUS.length);
    write(root, path, text);
    const id = rid(10_000 + j);
    const sha = revisionOf(Buffer.from(text, "utf-8"));
    const rewrite = rewritten ? withRewrite(text).rewrite : null;
    add(id, { row: "record-live", kind: "issue", narrative: path, source_sha256: sha, control_path: `${dir}/issues/${stem}.record.json`, rewrite, control: recordControl("issue", id, path, sha, { state: "open", disposition: null }) });
  }
  if (shape.filler !== undefined) {
    const { files, dirs: fillerDirs, bytes } = shape.filler;
    for (let k = 0; k < files; k++) write(root, `shared/history/d${pad(k % fillerDirs)}/260901-1200_c_closed-${pad(k)}.md`, `# Closed ${k}\n${"h".repeat(bytes)}\n`);
  }
  write(root, ".fusion-setup", '{"setup":"generated"}\n');
  const pairs = Object.values(records);
  const writes = pairs.reduce((n, r) => n + (r.rewrite === null ? 2 : 3), 0);
  const chunks = Math.ceil(writes / (CHUNK_WRITES - 2)) + 1; // enough ids for any cut
  const spare = shape.spare ?? 2;
  return {
    schema: "fusion.migration-proposal/v1",
    migration_id: MID,
    workbench_id: WB,
    source_layout: "fusion-v12",
    operation_ids: {
      plan: oid(0),
      apply: Array.from({ length: chunks + spare }, (_, i) => oid(100 + i)),
      verify: oid(1),
      rollback: Array.from({ length: chunks + 1 + spare }, (_, i) => oid(5_000 + i)),
    },
    exclusions: [".fusion-setup"],
    records,
    counts: { package_live: shape.packages, package_terminal: 0, record_live: shape.issues, record_closure: 0, plain_terminal: shape.filler?.files ?? 0, empty_container: 0 },
    findings: [{ class: "reference-not-a-citation", severity: "reported", path: pairs[0]?.narrative ?? "x.md", detail: "a generated finding" }],
    repairs: [],
  };
}

/** Writes the proposal under `.json-state/migration/` and returns its binding. */
function propose(root: string, p: Proposal | string): { path: string; sha256: string } {
  const bytes = Buffer.from(typeof p === "string" ? p : JSON.stringify(p), "utf-8");
  write(root, PROPOSAL, bytes);
  return { path: PROPOSAL, sha256: revisionOf(bytes) };
}

const planRequest = (root: string, proposal: { path: string; sha256: string }, operation_id = oid(0)) => ({ op: "migration", workbench: root, operation_id, phase: "plan", proposal });
const refusalOf = (r: Response): { class: string; reason: string; detail?: string } => {
  expect(r.ok, JSON.stringify(r).slice(0, 2000)).toBe(false);
  if (r.ok) throw new Error("unreachable");
  return r.error;
};
const okResult = (r: Response): Record<string, unknown> => {
  expect(r.ok, JSON.stringify(r).slice(0, 2000)).toBe(true);
  if (!r.ok) throw new Error("unreachable");
  return r.result as Record<string, unknown>;
};
/** The tree outside `.json-state/`, every entry with its bytes' hash: what a refusal must leave as it was. */
const tree = (root: string): string => JSON.stringify(inventory(root, (p) => p === ".json-state"));

let root: string;
beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), "codec-migration-"));
});
afterEach(() => {
  rmSync(root, { recursive: true, force: true });
});

const SMALL: Shape = { packages: 3, issues: 4, rewrittenIssues: 1, body: 200 };

// --- the strict reader's cap ----------------------------------------------------------

describe("the strict reader's cap", () => {
  it("the default still refuses one byte over 1 MiB; the proposal's cap accepts a 2 MiB proposal and still refuses a duplicate key", () => {
    const body = (n: number): string => `{"a":"${"x".repeat(n - 8)}"}`;
    const over = Buffer.from(body(MAX_RECORD_BYTES + 1));
    expect(over.byteLength).toBe(MAX_RECORD_BYTES + 1);
    expect(strictParse(over)).toMatchObject({ ok: false, reason: "too-large" });
    const large = Buffer.from(body(2 * MAX_RECORD_BYTES));
    expect(strictParse(large, 16 * MAX_RECORD_BYTES).ok).toBe(true);
    expect(strictParse(large)).toMatchObject({ ok: false, reason: "too-large" });
    const twice = Buffer.from(`{"a":1,"b":"${"x".repeat(2 * MAX_RECORD_BYTES)}","a":2}`);
    expect(strictParse(twice, 16 * MAX_RECORD_BYTES)).toMatchObject({ ok: false, reason: "duplicate-key" });
  });
});

// --- survey ---------------------------------------------------------------------------

describe("migration survey", () => {
  it("lists every entry in the four forms, bytewise by path, and leaves the store byte-identical with no .json-state/", async () => {
    generate(root, SMALL);
    symlinkSync("../260901-0900-pkg-0000/260901-0900-pkg-0000.md", join(root, "work-packages/260901-0900-pkg-0001/latest.md"));
    symlinkSync("nowhere.md", join(root, "shared-dangling.md"));
    mkdirSync(join(root, "work-packages/260901-0900-empty/issues"), { recursive: true });
    execFileSync("mkfifo", [join(root, "notes.fifo")]);
    write(root, "Zeta.md", "upper case sorts first bytewise\n");
    const before = tree(root);
    const r = okResult(await dispatch({ op: "migration", workbench: root, phase: "survey" }));
    expect(Object.keys(r)).toEqual(["layout", "entries", "local_state"]);
    expect(r.layout).toBe("legacy");
    const entries = r.entries as Array<Record<string, unknown>>;
    const paths = entries.map((e) => e.path as string);
    expect(paths).toEqual([...paths].sort((a, b) => Buffer.compare(Buffer.from(a), Buffer.from(b))));
    expect(paths[0]).toBe(".fusion-setup");
    expect(paths.indexOf("Zeta.md")).toBeLessThan(paths.indexOf("notes.fifo"));
    const at = (p: string) => entries.find((e) => e.path === p);
    expect(at("work-packages/260901-0900-pkg-0001/latest.md")).toEqual({ path: "work-packages/260901-0900-pkg-0001/latest.md", kind: "link", target: "../260901-0900-pkg-0000/260901-0900-pkg-0000.md" });
    expect(at("shared-dangling.md")).toEqual({ path: "shared-dangling.md", kind: "link", target: "nowhere.md" });
    expect(at("work-packages/260901-0900-empty/issues")).toEqual({ path: "work-packages/260901-0900-empty/issues", kind: "directory" });
    expect(at("notes.fifo")).toEqual({ path: "notes.fifo", kind: "other" });
    const zeta = Buffer.from("upper case sorts first bytewise\n");
    expect(at("Zeta.md")).toEqual({ path: "Zeta.md", kind: "file", size: zeta.byteLength, sha256: revisionOf(zeta) });
    expect(r.local_state).toEqual({ present: false, intents: [], maintenance: null, unreadable: [] });
    expect(existsSync(join(root, ".json-state"))).toBe(false);
    expect(tree(root)).toBe(before);
  });

  it("names pending intents, the fence and what does not read, finishing nothing", async () => {
    cpSync(FIXTURE, root, { recursive: true });
    const wb = { root, state: "json-control" as const, id: null, manifest: null, diagnosis: null };
    const target = "shared/issues/260928-1400-parser-fails-on-empty-input.md";
    const after = Buffer.from("rewritten by a migration intent\n");
    const intent: Intent = { operation_id: oid(7), op: "migration", request_digest: revisionOf(Buffer.from("x")), writes: [{ path: target, before: revisionOf(readFileSync(join(root, target))), after: revisionOf(after) }], response: { ok: true, result: { operation_id: oid(7), chunk: 1 } }, created_at: new Date(0).toISOString() };
    expect(commitIntent(wb, intent, new Map([[target, after]])).ok).toBe(true);
    mkdirSync(join(root, ".json-state/journal/0badbad0-0000-4000-8000-000000000000"));
    writeFileSync(join(root, ".json-state/maintenance.json"), JSON.stringify({ operation_id: oid(8), since: "2026-10-02T09:00:00.000Z" }));
    const before = tree(root);
    const r = okResult(await dispatch({ op: "migration", workbench: root, phase: "survey" }));
    expect(r.layout).toBe("json-control");
    expect(r.local_state).toEqual({
      present: true,
      intents: [{ operation_id: oid(7), op: "migration", phase: "apply" }],
      maintenance: { operation_id: oid(8), since: "2026-10-02T09:00:00.000Z" },
      unreadable: [{ path: ".json-state/journal/0badbad0-0000-4000-8000-000000000000", reason: "journal-unreadable" }],
    });
    expect((r.entries as Array<{ path: string }>).some((e) => e.path.startsWith(".json-state"))).toBe(false);
    expect(tree(root)).toBe(before);
    expect(existsSync(join(root, ".json-state/journal", oid(7)))).toBe(true);
  });

  it("an unsupported manifest is refused with its diagnosis", async () => {
    mkdirSync(join(root, "workbench.json"));
    expect(refusalOf(await dispatch({ op: "migration", workbench: root, phase: "survey" }))).toMatchObject({ class: "schema-invalid", reason: "manifest-not-a-file" });
  });
});

// --- plan: the freeze -------------------------------------------------------------------

const readJson = (path: string): Record<string, unknown> => {
  const p = strictParse(readFileSync(join(root, path)));
  if (!p.ok) throw new Error(`${path}: ${p.detail}`);
  return p.value as Record<string, unknown>;
};

describe("migration plan: the frozen plan", () => {
  it("freezes chunk files, parts and the index in one intent, the index last, each file valid and bound by the index", async () => {
    const p = generate(root, SMALL);
    const ref = propose(root, p);
    const r = okResult(await dispatch(planRequest(root, ref)));
    expect(Object.keys(r)).toEqual(["operation_id", "migration_id", "plan", "parts", "schedule", "counts"]);
    const index = readJson(`archive/migrations/${MID}/plan.json`);
    expect(r.plan).toEqual({ path: `archive/migrations/${MID}/plan.json`, sha256: revisionOf(readFileSync(join(root, `archive/migrations/${MID}/plan.json`))) });
    expect(validate(PLAN_SCHEMA_ID, index)).toEqual({ ok: true });
    expect(index.proposal).toEqual(ref);
    expect(index.exclusions).toEqual([".fusion-setup"]);
    expect(r.parts).toEqual(index.parts);
    const parts = index.parts as Array<{ part: string; n: number; path: string; sha256: string; writes?: number }>;
    expect(parts.map((x) => x.part)).toEqual(["chunk", "records", "inventory", "findings", "repairs"]);
    for (const x of parts) {
      const bytes = readFileSync(join(root, x.path));
      expect(revisionOf(bytes), x.path).toBe(x.sha256);
      expect(bytes.byteLength).toBeLessThanOrEqual(MAX_RECORD_BYTES);
      expect(validate(PLAN_SCHEMA_ID, readJson(x.path)), x.path).toEqual({ ok: true });
      expect(bytes.toString("utf-8"), x.path).toBe(serialise(readJson(x.path)));
    }
    // 3 packages and 1 issue rewritten (3 writes each), 3 issues not (2 each).
    expect(parts[0]?.writes).toBe(18);
    const chunk = readJson(parts[0]?.path as string);
    const kinds = (chunk.writes as Array<{ kind: string }>).map((w) => w.kind);
    expect(kinds.slice(0, 7)).toEqual(Array(7).fill("original"));
    expect(kinds.slice(7).every((k) => k !== "original")).toBe(true);
    // The schedule: one apply chunk, rollback 0 and 1, the surplus unassigned.
    expect(r.schedule).toEqual({
      plan: oid(0),
      apply: [{ chunk: 1, operation_id: oid(100) }],
      verify: oid(1),
      rollback: [{ chunk: 0, operation_id: oid(5000) }, { chunk: 1, operation_id: oid(5001) }],
      unassigned: [...p.operation_ids.apply.slice(1), ...p.operation_ids.rollback.slice(2)],
    });
    // The inventory: the eligible entries, no exclusion and no own directory.
    const entries = (readJson(`archive/migrations/${MID}/parts/inventory-1.json`).entries as Array<{ path: string }>).map((e) => e.path);
    expect(entries).not.toContain(".fusion-setup");
    expect(entries.some((e) => e.startsWith(".json-state") || e.startsWith(`archive/migrations/${MID}`))).toBe(false);
    expect(entries).toContain("work-packages/260901-0900-pkg-0000/260901-0900-pkg-0000.md");
    const records = readJson(`archive/migrations/${MID}/parts/records-1.json`);
    expect(records.counts).toEqual(p.counts);
    expect(Object.keys(records.records as object)).toHaveLength(7);
    // Nothing but the plan files was written outside .json-state/.
    expect(existsSync(join(root, "work-packages/260901-0900-pkg-0000/package.json"))).toBe(false);
  });

  it("replays its stored answer; the same id with another proposal is operation-id-reused; a changed proposal under its old hash is source-changed", async () => {
    const p = generate(root, SMALL);
    const ref = propose(root, p);
    const first = await dispatch(planRequest(root, ref));
    okResult(first);
    const index = readFileSync(join(root, `archive/migrations/${MID}/plan.json`));
    expect(await dispatch(planRequest(root, ref))).toEqual(first);
    expect(readFileSync(join(root, `archive/migrations/${MID}/plan.json`)).equals(index)).toBe(true);
    expect(refusalOf(await dispatch(planRequest(root, { ...ref, sha256: revisionOf(Buffer.from("other")) })))).toMatchObject({ class: "conflict", reason: "operation-id-reused" });
    // A fresh id over the frozen plan meets the plan files.
    const again = { ...p, operation_ids: { ...p.operation_ids, plan: oid(2) } };
    expect(refusalOf(await dispatch(planRequest(root, propose(root, again), oid(2))))).toMatchObject({ class: "conflict", reason: "migration-planned" });
  });

  it("a proposal edited after its hash was taken is refused source-changed, and a narrative edited after the proposal read it too", async () => {
    const p = generate(root, SMALL);
    const ref = propose(root, p);
    writeFileSync(join(root, PROPOSAL), JSON.stringify(p) + " ");
    const before = tree(root);
    expect(refusalOf(await dispatch(planRequest(root, ref)))).toMatchObject({ class: "conflict", reason: "source-changed" });
    const ref2 = propose(root, p);
    writeFileSync(join(root, "work-packages/260901-0900-pkg-0001/issues/260901-1000_o_issue-0001.md"), "edited by an old client\n");
    const edited = tree(root);
    const e = refusalOf(await dispatch(planRequest(root, ref2)));
    expect(e).toMatchObject({ class: "conflict", reason: "source-changed" });
    expect(e.detail).toContain("issue-0001.md");
    expect(tree(root)).toBe(edited);
    expect(before).not.toBe(edited);
  });

  it("a workbench just over one chunk: a pair is never split, the next chunk takes it whole", async () => {
    // 17 rewritten packages, 3 writes each: 51 writes, 16 pairs fit 48.
    const p = generate(root, { packages: 17, issues: 0, rewrittenIssues: 0, body: 100 });
    const r = okResult(await dispatch(planRequest(root, propose(root, p))));
    const chunks = (r.parts as Array<{ part: string; writes?: number; path: string }>).filter((x) => x.part === "chunk");
    expect(chunks.map((c) => c.writes)).toEqual([48, 3]);
    const second = readJson(chunks[1]?.path as string).writes as Array<{ kind: string; path: string; from?: string }>;
    expect(second.map((w) => w.kind)).toEqual(["original", "control", "rewrite"]);
    expect(new Set(second.map((w) => w.from ?? w.path.replace(/package\.json$/, "")).map((x) => x.split("/").slice(0, 2).join("/"))).size).toBe(1);
    expect((r.schedule as { apply: unknown[] }).apply).toHaveLength(2);
  });

  it("a freeze cut after its commit point is held for its own request: reads and other requests leave it, the same request lands it", async () => {
    const p = generate(root, SMALL);
    const ref = propose(root, p);
    await expect(dispatch(planRequest(root, ref), { kernel: { faults: { cutAt: "after-intent" } } })).rejects.toThrow(CutReached);
    expect(existsSync(join(root, `archive/migrations/${MID}/plan.json`))).toBe(false);
    const s = okResult(await dispatch({ op: "migration", workbench: root, phase: "survey" }));
    expect((s.local_state as { intents: unknown[] }).intents).toEqual([{ operation_id: oid(0), op: "migration", phase: "plan" }]);
    expect(okResult(await dispatch({ op: "list", workbench: root })).records).toEqual([]);
    const other = { ...p, operation_ids: { ...p.operation_ids, plan: oid(3) } };
    expect(refusalOf(await dispatch(planRequest(root, propose(root, other), oid(3))))).toMatchObject({ class: "conflict", reason: "intent-pending" });
    expect(existsSync(join(root, ".json-state/journal", oid(0)))).toBe(true);
    expect(existsSync(join(root, `archive/migrations/${MID}/plan.json`))).toBe(false);
    propose(root, p);
    const landed = okResult(await dispatch(planRequest(root, ref)));
    expect(existsSync(join(root, `archive/migrations/${MID}/plan.json`))).toBe(true);
    expect(landed.plan).toEqual({ path: `archive/migrations/${MID}/plan.json`, sha256: revisionOf(readFileSync(join(root, `archive/migrations/${MID}/plan.json`))) });
    expect(existsSync(join(root, ".json-state/journal", oid(0)))).toBe(false);
  });

  it("apply, verify and rollback are refused not-implemented, naming the phase", async () => {
    const plan = { path: `archive/migrations/${MID}/plan.json`, sha256: revisionOf(Buffer.from("x")) };
    for (const [phase, extra] of [["apply", { chunk: 1 }], ["verify", {}], ["rollback", { chunk: 0 }]] as const) {
      const e = refusalOf(await dispatch({ op: "migration", workbench: root, operation_id: oid(9), phase, plan, ...extra }));
      expect(e).toMatchObject({ class: "operation-unknown", reason: "not-implemented" });
      expect(e.detail).toContain(`migration ${phase}`);
    }
  });
});

// --- plan: the refusals, in the contract's order ------------------------------------------

/** `arrange` changes the disk or the proposal; a returned proposal (or text), or `rebind`, binds the request to the changed proposal. */
type Case = { name: string; arrange: (p: Proposal) => Proposal | string | void; rebind?: true; expect: { class: string; reason: string } };

const first = (p: Proposal): [string, Record_] => Object.entries(p.records)[0] as [string, Record_];
const issue = (p: Proposal): [string, Record_] => Object.entries(p.records).find(([, r]) => r.kind === "issue") as [string, Record_];

const CASES: Case[] = [
  {
    name: "a manifest that is no file: its own diagnosis",
    arrange: () => mkdirSync(join(root, "workbench.json")),
    expect: { class: "schema-invalid", reason: "manifest-not-a-file" },
  },
  {
    name: "a held migration intent of another operation: intent-pending",
    arrange: () => {
      const wb = { root, state: "legacy" as const, id: null, manifest: null, diagnosis: null };
      const after = Buffer.from("{}\n");
      const intent: Intent = { operation_id: oid(7), op: "migration", request_digest: revisionOf(Buffer.from("x")), writes: [{ path: "archive/migrations/x.json", before: null, after: revisionOf(after) }], response: { ok: true, result: {} }, created_at: new Date(0).toISOString() };
      expect(commitIntent(wb, intent, new Map([["archive/migrations/x.json", after]])).ok).toBe(true);
    },
    expect: { class: "conflict", reason: "intent-pending" },
  },
  {
    name: "a committed initialize: intent-pending, and it is not landed",
    arrange: () => {
      const wb = { root, state: "legacy" as const, id: null, manifest: null, diagnosis: null };
      const manifest = Buffer.from(serialise({ schema: "fusion.workbench/v1", id: WB, required_features: ["json-control-v1"], migration: null, extensions: {} }), "utf-8");
      const intent: Intent = { operation_id: oid(6), op: "initialize", request_digest: revisionOf(Buffer.from("x")), writes: [{ path: "workbench.json", before: null, after: revisionOf(manifest) }], response: { ok: true, result: { id: WB } }, created_at: new Date(0).toISOString() };
      expect(commitIntent(wb, intent, new Map([["workbench.json", manifest]])).ok).toBe(true);
    },
    expect: { class: "conflict", reason: "intent-pending" },
  },
  {
    name: "a manifest of a store never migrated: manifest-present",
    arrange: () => write(root, "workbench.json", serialise({ schema: "fusion.workbench/v1", id: WB, required_features: ["json-control-v1"], migration: null, extensions: {} })),
    expect: { class: "conflict", reason: "manifest-present" },
  },
  {
    name: "a manifest naming this migration's receipt that does not exist: receipt-unverified",
    arrange: () => write(root, "workbench.json", serialise({ schema: "fusion.workbench/v1", id: WB, required_features: ["json-control-v1"], migration: { id: MID, source_layout: "fusion-v12", receipt: `archive/migrations/${MID}/receipt.json` }, extensions: {} })),
    expect: { class: "migration-incomplete", reason: "receipt-unverified" },
  },
  {
    name: "a standing fence: maintenance-active",
    arrange: () => write(root, ".json-state/maintenance.json", JSON.stringify({ operation_id: oid(8), since: "2026-10-02T09:00:00.000Z" })),
    expect: { class: "conflict", reason: "maintenance-active" },
  },
  {
    name: "another migration's plan files: migration-planned",
    arrange: () => write(root, "archive/migrations/migration-20260901-other/plan.json", "{}\n"),
    expect: { class: "conflict", reason: "migration-planned" },
  },
  {
    name: "a proposal that is a directory: proposal-invalid",
    arrange: () => {
      rmSync(join(root, PROPOSAL));
      mkdirSync(join(root, PROPOSAL));
    },
    expect: { class: "schema-invalid", reason: "proposal-invalid" },
  },
  {
    name: "a proposal over 16 MiB: proposal-invalid, before its hash is compared",
    arrange: () => writeFileSync(join(root, PROPOSAL), Buffer.alloc(16 * MAX_RECORD_BYTES + 1, 0x20)),
    expect: { class: "schema-invalid", reason: "proposal-invalid" },
  },
  {
    name: "a proposal whose bytes are not the request's: source-changed",
    arrange: () => writeFileSync(join(root, PROPOSAL), "{}"),
    expect: { class: "conflict", reason: "source-changed" },
  },
  {
    name: "a proposal with a duplicate key: proposal-invalid",
    arrange: (p) => JSON.stringify(p).replace('"migration_id":', '"repairs":[],"migration_id":'),
    expect: { class: "schema-invalid", reason: "proposal-invalid" },
  },
  {
    name: "a proposal its schema refuses: proposal-invalid",
    arrange: (p) => ({ ...p, operation_ids: { ...p.operation_ids, rollback: [oid(5000)] } }),
    expect: { class: "schema-invalid", reason: "proposal-invalid" },
  },
  {
    name: "overlapping deletion ranges: proposal-invalid",
    arrange: (p) => {
      const [, r] = first(p);
      r.rewrite = { after_sha256: r.rewrite?.after_sha256 as string, deletions: [{ offset: 0, length: 10 }, { offset: 5, length: 3 }] };
    },
    rebind: true,
    expect: { class: "schema-invalid", reason: "proposal-invalid" },
  },
  {
    name: "an exclusion that holds a narrative: proposal-invalid",
    arrange: (p) => {
      // The issue moved under a root entry of its own, which the proposal then excludes.
      const [, r] = issue(p);
      const narrative = `local/issues/${r.narrative.split("/").at(-1) as string}`;
      write(root, narrative, readFileSync(join(root, r.narrative)));
      rmSync(join(root, r.narrative));
      r.narrative = narrative;
      r.control_path = narrative.replace(/\.md$/, ".record.json");
      r.backup = backupOf(narrative);
      r.control.narrative = { path: narrative };
      (r.control.provenance as { backup: { path: string } }).backup.path = r.backup;
      p.exclusions.push("local");
    },
    rebind: true,
    expect: { class: "schema-invalid", reason: "proposal-invalid" },
  },
  {
    name: "a control path that is not the pair's: proposal-invalid",
    arrange: (p) => {
      const [, r] = issue(p);
      r.control_path = r.control_path.replace(".record.json", "-x.record.json");
    },
    rebind: true,
    expect: { class: "schema-invalid", reason: "proposal-invalid" },
  },
  {
    name: "counts that are not the rows': proposal-invalid",
    arrange: (p) => {
      p.counts.record_live += 1;
    },
    rebind: true,
    expect: { class: "schema-invalid", reason: "proposal-invalid" },
  },
  {
    name: "a control carrying another id than its key: duplicate-id",
    arrange: (p) => {
      const [, r] = issue(p);
      r.control.id = first(p)[0];
    },
    rebind: true,
    expect: { class: "schema-invalid", reason: "duplicate-id" },
  },
  {
    name: "a control path already on disk: record-exists",
    arrange: (p) => write(root, first(p)[1].control_path, "{}\n"),
    expect: { class: "conflict", reason: "record-exists" },
  },
  {
    name: "an open blocking finding: blocking-finding",
    arrange: (p) => {
      p.findings.push({ class: "filed-by-missing", severity: "blocking", path: first(p)[1].narrative, detail: "no actor" });
    },
    rebind: true,
    expect: { class: "migration-incomplete", reason: "blocking-finding" },
  },
  {
    name: "a dependency on no proposed record: closure-incomplete",
    arrange: (p) => {
      const [, r] = first(p);
      r.control.depends_on = [{ target: { workbench_id: WB, record_id: rid(99_999) }, condition: "terminal" }];
    },
    rebind: true,
    expect: { class: "unresolved-reference", reason: "closure-incomplete" },
  },
  {
    name: "an acceptance its package does not carry: proposal-invalid",
    arrange: (p) => {
      const [pkgId] = first(p);
      const [, r] = issue(p);
      r.kind = "plan";
      r.control = recordControl("plan", r.control.id as string, r.narrative, r.source_sha256, { state: "open", steps: [], criteria: [], acceptance: { ref: { workbench_id: WB, record_id: pkgId }, revision: r.rewrite?.after_sha256 ?? r.source_sha256 } });
    },
    rebind: true,
    expect: { class: "schema-invalid", reason: "proposal-invalid" },
  },
  {
    name: "deletions that do not give the after-hash: proposal-invalid",
    arrange: (p) => {
      const [, r] = first(p);
      r.rewrite = { after_sha256: revisionOf(Buffer.from("not this")), deletions: r.rewrite?.deletions ?? [] };
    },
    rebind: true,
    expect: { class: "schema-invalid", reason: "proposal-invalid" },
  },
  {
    name: "a plan id that is not this request's: proposal-invalid",
    arrange: (p) => ({ ...p, operation_ids: { ...p.operation_ids, plan: oid(4) } }),
    expect: { class: "schema-invalid", reason: "proposal-invalid" },
  },
  {
    name: "a scheduled id that already has a stored answer: proposal-invalid",
    arrange: (p) => write(root, `.json-state/ops/${p.operation_ids.verify}.json`, "{}\n"),
    expect: { class: "schema-invalid", reason: "proposal-invalid" },
  },
];

describe("migration plan: each refusal writes nothing outside .json-state/", () => {
  for (const c of CASES) {
    it(c.name, async () => {
      const p = generate(root, SMALL);
      let ref = propose(root, p);
      const changed = c.arrange(p);
      if (changed !== undefined) ref = propose(root, changed);
      else if (c.rebind) ref = propose(root, p);
      const before = tree(root);
      const e = refusalOf(await dispatch(planRequest(root, ref)));
      expect(e, e.detail).toMatchObject(c.expect);
      expect(tree(root)).toBe(before);
      expect(existsSync(join(root, `archive/migrations/${MID}`))).toBe(false);
    });
  }

  it("the bound: a freeze over the file count, the byte total or one file's cap is plan-too-large", () => {
    const req = { op: "migration" as const, operation_id: oid(0), phase: "plan" as const, proposal: { path: PROPOSAL, sha256: revisionOf(Buffer.from("p")) } };
    const file = (path: string, n: number) => ({ path, bytes: Buffer.alloc(n, 0x61) });
    expect(freezeOver(req, [file("a.json", 10)], {})).toBeNull();
    expect(freezeOver(req, Array.from({ length: FREEZE_MAX_FILES + 1 }, (_, i) => file(`f${i}.json`, 10)), {})).toContain(`at most ${FREEZE_MAX_FILES}`);
    expect(freezeOver(req, Array.from({ length: 7 }, (_, i) => file(`b${i}.json`, MAX_RECORD_BYTES)), {})).toContain(`at most ${FREEZE_MAX_BYTES}`);
    expect(freezeOver(req, [file("big.json", MAX_RECORD_BYTES + 1)], {})).toContain("over the");
  });

  it("a second run over a verified receipt is a no-op naming it; a receipt whose manifest revision differs is receipt-unverified", async () => {
    const p = generate(root, SMALL);
    const ref = propose(root, p);
    const planned = okResult(await dispatch(planRequest(root, ref)));
    const manifest = Buffer.from(serialise({ schema: "fusion.workbench/v1", id: WB, required_features: ["json-control-v1"], migration: { id: MID, source_layout: "fusion-v12", receipt: `archive/migrations/${MID}/receipt.json` }, extensions: {} }), "utf-8");
    const parts = (planned.parts as Array<{ path: string; sha256: string }>).map((x) => ({ path: x.path, sha256: x.sha256 }));
    const receipt = (revision: string) => ({
      schema: "fusion.migration-receipt/v1",
      migration_id: MID,
      workbench_id: WB,
      source_layout: "fusion-v12",
      plan: planned.plan,
      parts,
      verify_operation_id: oid(1),
      after_inventory_sha256: revisionOf(Buffer.from("after")),
      checks: [{ name: "pairs", result: "passed", checked: 7 }],
      counts: p.counts,
      versions: { schemas: ["urn:fusion:schema:fusion.migration-plan/v1"], features: ["json-control-v1"] },
      manifest_revision: revision,
    });
    expect(validate(RECEIPT_SCHEMA_ID, receipt(revisionOf(manifest)))).toEqual({ ok: true });
    write(root, `archive/migrations/${MID}/receipt.json`, serialise(receipt(revisionOf(manifest))));
    write(root, "workbench.json", manifest);
    write(root, `.json-state/ops/${oid(0xe0)}.json`, JSON.stringify({ operation_id: oid(0xe0), op: "create", request_digest: revisionOf(Buffer.from("c")), response: { ok: true, result: {} } }));
    const before = tree(root);
    const r = okResult(await dispatch(planRequest(root, ref, oid(0x51))));
    expect(r).toEqual({
      operation_id: oid(0x51),
      migration_id: MID,
      no_op: true,
      receipt: { path: `archive/migrations/${MID}/receipt.json`, sha256: revisionOf(readFileSync(join(root, `archive/migrations/${MID}/receipt.json`))) },
      manifest_revision: revisionOf(manifest),
      later_operations: [{ operation_id: oid(0xe0), op: "create" }],
    });
    expect(tree(root)).toBe(before);
    write(root, `archive/migrations/${MID}/receipt.json`, serialise(receipt(revisionOf(Buffer.from("another manifest")))));
    expect(refusalOf(await dispatch(planRequest(root, ref, oid(0x52))))).toMatchObject({ class: "migration-incomplete", reason: "receipt-unverified" });
  });
});

// --- a migration intent in an ordinary store's reads and mutations ---------------------------

describe("a migration intent is finished by its own request only", () => {
  it("reads mark the paths it names migration-pending, a mutation of them is refused, and neither finishes it", async () => {
    cpSync(FIXTURE, root, { recursive: true });
    const wb = { root, state: "json-control" as const, id: null, manifest: null, diagnosis: null };
    const target = "shared/issues/260928-1400-parser-fails-on-empty-input.record.json";
    const stored = readFileSync(join(root, target));
    const after = Buffer.from("{}\n");
    const intent: Intent = { operation_id: oid(7), op: "migration", request_digest: revisionOf(Buffer.from("x")), writes: [{ path: target, before: revisionOf(stored), after: revisionOf(after) }], response: { ok: true, result: { chunk: 1 } }, created_at: new Date(0).toISOString() };
    expect(commitIntent(wb, intent, new Map([[target, after]])).ok).toBe(true);
    expect(refusalOf(await dispatch({ op: "show", workbench: root, record: { path: target } }))).toMatchObject({ class: "operation-unknown", reason: "migration-pending" });
    const listed = okResult(await dispatch({ op: "list", workbench: root })).records as Array<{ path: string; problem?: { reason: string } }>;
    expect(listed.find((x) => x.path === target)?.problem?.reason).toBe("migration-pending");
    const transition = { op: "transition", workbench: root, operation_id: oid(0x70), record: { path: target }, expected_revision: revisionOf(stored), actor: { actor: "user", person: "kai" }, to: "closed", reason: "r", payload: { disposition: { kind: "fixed", reason_ref: null } } };
    expect(refusalOf(await dispatch(transition))).toMatchObject({ class: "operation-unknown", reason: "migration-pending" });
    expect(readFileSync(join(root, target)).equals(stored)).toBe(true);
    expect(existsSync(join(root, ".json-state/journal", oid(7)))).toBe(true);
    expect(requestDigest({})).toMatch(/^sha256:/);
  });
});

// --- the largest copy's size ------------------------------------------------------------------

describe("a generated store of the largest measured copy's size", () => {
  let big: string;
  let answer: Response;
  let ms = 0;
  let proposal: Proposal;
  beforeAll(async () => {
    big = mkdtempSync(join(tmpdir(), "codec-migration-large-"));
    // 110 packages and 639 issues: 749 pairs; 110 + 72 = 182 rewrites, 1 680 writes;
    // 7 193 filler files over 943 directories make 7 942 files and 952 directories;
    // one 465 KB narrative.
    proposal = generate(big, { packages: 110, issues: 639, rewrittenIssues: 72, body: 12_000, big: 465 * 1024, filler: { files: 7_192, dirs: 750, bytes: 600 }, spare: 0 });
    const ref = propose(big, proposal);
    const t0 = performance.now();
    answer = await dispatch({ op: "migration", workbench: big, operation_id: oid(0), phase: "plan", proposal: ref });
    ms = performance.now() - t0;
  }, 120_000);
  afterAll(() => {
    rmSync(big, { recursive: true, force: true });
  });

  it("freezes in one intent within its bound, every plan file under 1 MiB", () => {
    expect(answer.ok, JSON.stringify(answer).slice(0, 1000)).toBe(true);
    if (!answer.ok) return;
    const r = answer.result as { parts: Array<{ part: string; path: string; writes?: number }> };
    const files = [...r.parts.map((x) => x.path), `archive/migrations/${MID}/plan.json`];
    const sizes = files.map((f) => readFileSync(join(big, f)).byteLength);
    for (const [i, s] of sizes.entries()) expect(s, files[i]).toBeLessThanOrEqual(MAX_RECORD_BYTES);
    expect(files.length).toBeLessThanOrEqual(FREEZE_MAX_FILES);
    expect(sizes.reduce((a, b) => a + b, 0)).toBeLessThanOrEqual(FREEZE_MAX_BYTES);
    const chunks = r.parts.filter((x) => x.part === "chunk");
    expect(chunks.reduce((n, c) => n + (c.writes ?? 0), 0)).toBe(1_680);
    expect(r.parts.filter((x) => x.part === "inventory").length).toBeGreaterThan(1);
    // The figure the step note records.
    console.info(`[migration] largest-size freeze: ${files.length} files, ${sizes.reduce((a, b) => a + b, 0)} bytes, largest ${Math.max(...sizes)}, ${chunks.length} chunks, ${Math.round(ms)} ms in process`);
  });

  it("answers within the 5 s post-wait allowance in process", () => {
    expect(ms).toBeLessThan(5_000);
  });
});
