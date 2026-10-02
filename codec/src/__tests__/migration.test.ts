// ---------------------------------------------------------------------------
// `migration` (FJ04 steps 5 and 6): `survey` and `plan`, then `apply` per
// chunk, `verify` and `rollback`, against the contract delta as amended for
// Prior `ab9cb59` (`codec/fixtures/prior/REQUESTS.md`), with questions 51 and
// 52 built to fusion's leaning while Prior has not answered them.
//
// Every store here is generated: a legacy v12-shaped tree of packages and
// issues with fixed ids, its proposal composed as the host would compose it,
// written to `.json-state/migration/proposal.json` and bound by its sha256.
// Nothing is copied from a real workbench. One generated store has the
// largest measured copy's size (749 pairs, 182 rewrites, 1 680 writes, 7 942
// files in 952 directories, one 465 KB narrative): the freeze over it is held
// to the strict reader's cap and to its bound, and each of its 35 chunks and
// its verify to the client's 5 s post-wait allowance.
// ---------------------------------------------------------------------------

import { execFileSync } from "node:child_process";
import { appendFileSync, cpSync, existsSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, symlinkSync, unlinkSync, utimesSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { dispatch } from "../cli/ops.js";
import type { Response } from "../cli/protocol.js";
import { canonical, commitIntent, requestDigest, type Intent } from "../journal.js";
import { CutReached } from "../kernel.js";
import { CHUNK_WRITES, EXCLUSION_ALLOWLIST, FREEZE_MAX_BYTES, FREEZE_MAX_FILES, PLAN_SCHEMA_ID, RECEIPT_SCHEMA_ID, applyDeletions, freezeOver, inventory, survey } from "../migration.js";
import { openWorkbench, revisionOf, serialise } from "../store.js";
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
  source_inventory_sha256: string;
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

/** The whole allowlist, the selection fusion's host always makes (C8). */
const ALLOWLIST = Object.keys(EXCLUSION_ALLOWLIST);

/**
 * The digest the host copies into the proposal: `survey`'s `eligible_sha256`
 * over `root` as it stands (C9, option 1), from the codec's own survey.
 */
function observed(root: string): string {
  const wb = openWorkbench(root);
  if (!wb.ok) throw new Error(wb.error.detail);
  const r = survey(wb.value);
  if (!r.ok) throw new Error(r.error.detail);
  return (r.result as { eligible_sha256: string }).eligible_sha256;
}

/** Writes a legacy store of `shape` under `root` and returns the proposal the host would compose for it, over the survey taken last. */
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
    source_inventory_sha256: observed(root),
    operation_ids: {
      plan: oid(0),
      apply: Array.from({ length: chunks + spare }, (_, i) => oid(100 + i)),
      verify: oid(1),
      rollback: Array.from({ length: chunks + 1 + spare }, (_, i) => oid(5_000 + i)),
    },
    exclusions: [...ALLOWLIST],
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
    expect(Object.keys(r)).toEqual(["layout", "entries", "eligible_sha256", "local_state"]);
    expect(r.layout).toBe("legacy");
    const entries = r.entries as Array<Record<string, unknown>>;
    // The eligible digest leaves out the allowlisted .fusion-setup, a file standing as a file, and nothing else.
    const eligibleEntries = entries.filter((e) => e.path !== ".fusion-setup");
    expect(r.eligible_sha256).toBe(revisionOf(Buffer.from(canonical(eligibleEntries), "utf-8")));
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
    expect(index.exclusions).toEqual(ALLOWLIST);
    expect(index.source_inventory_sha256).toBe(p.source_inventory_sha256);
    expect(r.parts).toEqual(index.parts);
    const parts = index.parts as Array<{ part: string; n: number; path: string; sha256: string; writes?: number }>;
    expect(parts.map((x) => x.part)).toEqual(["chunk", "records", "inventory", "findings", "repairs", "answers"]);
    // No answer was stored before this plan: the baseline is an empty list.
    expect(readJson(`archive/migrations/${MID}/parts/answers-1.json`).entries).toEqual([]);
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
    name: "an exclusion outside the allowlist (an arbitrary root name): proposal-invalid",
    arrange: (p) => {
      p.exclusions.push("stilwerk");
    },
    rebind: true,
    expect: { class: "schema-invalid", reason: "proposal-invalid" },
  },
  {
    name: "an allowlisted exclusion that holds a narrative: proposal-invalid",
    arrange: (p) => {
      // The issue moved under an allowlisted directory, which the proposal excludes.
      const [, r] = issue(p);
      const narrative = `.guard-state/issues/${r.narrative.split("/").at(-1) as string}`;
      write(root, narrative, readFileSync(join(root, r.narrative)));
      rmSync(join(root, r.narrative));
      r.narrative = narrative;
      r.control_path = narrative.replace(/\.md$/, ".record.json");
      r.backup = backupOf(narrative);
      r.control.narrative = { path: narrative };
      (r.control.provenance as { backup: { path: string } }).backup.path = r.backup;
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
    name: "an eligible file added between composition and plan: source-changed, naming both digests",
    arrange: () => write(root, "shared/memos/notes-someone.md", "written after the survey the proposal was composed from\n"),
    expect: { class: "conflict", reason: "source-changed" },
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

// --- apply, verify, rollback: the run ------------------------------------------------------

const PLAN_PATH = `archive/migrations/${MID}/plan.json`;
/** Ids of the requests a test sends beside the schedule: a tag no generated id carries. */
const tid = (n: number): string => uuid(0xd1, n);
/** 20 packages and 30 issues, 5 of them rewritten: 125 writes, cut 50 / 50 / 25 by whole pairs into three chunks. */
const THREE: Shape = { packages: 20, issues: 30, rewrittenIssues: 5, body: 100 };

interface Run {
  p: Proposal;
  plan: { path: string; sha256: string };
  chunks: number;
}

async function planned(shape: Shape = THREE, arrange?: (p: Proposal) => void): Promise<Run> {
  const p = generate(root, shape);
  arrange?.(p);
  const r = okResult(await dispatch(planRequest(root, propose(root, p))));
  return { p, plan: r.plan as { path: string; sha256: string }, chunks: (r.schedule as { apply: unknown[] }).apply.length };
}

const applyReq = (r: Run, n: number, operation_id = r.p.operation_ids.apply[n - 1] as string) => ({ op: "migration", workbench: root, operation_id, phase: "apply", plan: r.plan, chunk: n });
const verifyReq = (r: Run, operation_id = r.p.operation_ids.verify) => ({ op: "migration", workbench: root, operation_id, phase: "verify", plan: r.plan });
const rollbackReq = (r: Run, k: number, operation_id = r.p.operation_ids.rollback[k] as string) => ({ op: "migration", workbench: root, operation_id, phase: "rollback", plan: r.plan, chunk: k });
const begin = (operation_id: string) => ({ op: "maintenance", workbench: root, operation_id, action: "begin" });
const end = (operation_id: string, fence: string) => ({ op: "maintenance", workbench: root, operation_id, action: "end", fence });
const F1 = (r: Run): string => r.p.operation_ids.apply[0] as string;

async function applyAll(r: Run, through = r.chunks): Promise<Response[]> {
  const out: Response[] = [];
  for (let n = 1; n <= through; n++) {
    const a = await dispatch(applyReq(r, n));
    okResult(a);
    out.push(a);
  }
  return out;
}

const chunkFile = (r: Run, n: number) => readJson(`archive/migrations/${MID}/chunks/${n}.json`) as { writes: Array<{ kind: string; path: string; from?: string; source_sha256: string | null; after_sha256: string }> };
const fenceFile = (): Record<string, unknown> | null => (existsSync(join(root, ".json-state/maintenance.json")) ? (JSON.parse(readFileSync(join(root, ".json-state/maintenance.json"), "utf-8")) as Record<string, unknown>) : null);
const inspectOf = async (): Promise<Record<string, unknown>> => okResult(await dispatch({ op: "inspect", workbench: root }));
const surveyEntries = async (): Promise<Array<Record<string, unknown>>> => okResult(await dispatch({ op: "migration", workbench: root, phase: "survey" })).entries as Array<Record<string, unknown>>;

describe("migration apply", () => {
  it("lands three chunks in order, chunk 1 setting the fence under its own id; each answer names its writes, the fence and the control revisions", async () => {
    const r = await planned();
    expect(r.chunks).toBe(3);
    const before = tree(root);
    const [a1, a2, a3] = await applyAll(r);
    const first = okResult(a1 as Response);
    // The established envelope (C15): revisions beside result, not inside it.
    expect(Object.keys(a1 as Response)).toEqual(["ok", "result", "revisions"]);
    expect(Object.keys(first)).toEqual(["operation_id", "migration_id", "chunk", "fence", "writes"]);
    const revisions = (a1 as { revisions: Record<string, string> }).revisions;
    expect(first.fence).toEqual(fenceFile());
    expect((first.fence as { operation_id: string }).operation_id).toBe(F1(r));
    expect(okResult(a3 as Response).fence).toEqual(first.fence);
    const writes = first.writes as Array<{ path: string; kind: string }>;
    expect(writes).toEqual(chunkFile(r, 1).writes.map((w) => ({ path: w.path, kind: w.kind })));
    for (const w of chunkFile(r, 1).writes) {
      expect(revisionOf(readFileSync(join(root, w.path))), w.path).toBe(w.after_sha256);
      if (w.kind === "control") expect(revisions[w.path]).toBe(w.after_sha256);
    }
    expect(okResult(a2 as Response).chunk).toBe(2);
    expect(tree(root)).not.toBe(before);
  });

  it("every request replays its stored answer, before and after activation, and a replay writes nothing", async () => {
    const r = await planned();
    const answers = await applyAll(r);
    const t = tree(root);
    for (let n = 1; n <= r.chunks; n++) expect(await dispatch(applyReq(r, n))).toEqual(answers[n - 1]);
    expect(tree(root)).toBe(t);
    const v = await dispatch(verifyReq(r));
    okResult(v);
    expect(await dispatch(verifyReq(r))).toEqual(v);
    for (let n = 1; n <= r.chunks; n++) expect(await dispatch(applyReq(r, n))).toEqual(answers[n - 1]);
    expect(refusalOf(await dispatch({ ...applyReq(r, 1), chunk: 2 }))).toMatchObject({ class: "conflict", reason: "operation-id-reused" });
  });

  it("a chunk sent before its predecessor is chunk-out-of-order; one beyond the last too; an unscheduled or unassigned id is operation-id-unscheduled; each writes nothing", async () => {
    const r = await planned();
    const t = tree(root);
    // Chunk 2 first: no fence stands, and chunk 2 runs under chunk 1's.
    expect(refusalOf(await dispatch(applyReq(r, 2)))).toMatchObject({ class: "conflict", reason: "maintenance-active" });
    expect(refusalOf(await dispatch(applyReq(r, 1, tid(0x99))))).toMatchObject({ class: "conflict", reason: "operation-id-unscheduled" });
    expect(refusalOf(await dispatch(applyReq(r, 1, r.p.operation_ids.apply[2] as string)))).toMatchObject({ class: "conflict", reason: "operation-id-unscheduled" });
    const unassigned = r.p.operation_ids.apply[r.chunks] as string;
    expect(refusalOf(await dispatch(applyReq(r, 1, unassigned)))).toMatchObject({ class: "conflict", reason: "operation-id-unscheduled" });
    expect(refusalOf(await dispatch(applyReq(r, r.chunks + 1, unassigned)))).toMatchObject({ class: "migration-incomplete", reason: "chunk-out-of-order" });
    expect(tree(root)).toBe(t);
    await applyAll(r, 1);
    const t1 = tree(root);
    const e = refusalOf(await dispatch(applyReq(r, 3)));
    expect(e).toMatchObject({ class: "migration-incomplete", reason: "chunk-out-of-order" });
    expect(e.detail).toContain("the chunks landed are 1");
    expect(refusalOf(await dispatch(verifyReq(r)))).toMatchObject({ class: "migration-incomplete", reason: "chunks-missing" });
    expect(tree(root)).toBe(t1);
  });

  it("before chunk 1 the whole eligible inventory is rechecked: an added file refuses, an excluded root entry and .json-state/ do not", async () => {
    const r = await planned();
    write(root, ".fusion-setup", '{"setup":"rewritten by setup metadata"}\n');
    write(root, ".json-state/migration/notes.txt", "host bookkeeping\n");
    write(root, "shared/memos/notes-someone.md", "an old client wrote this\n");
    const t = tree(root);
    const e = refusalOf(await dispatch(applyReq(r, 1)));
    expect(e).toMatchObject({ class: "conflict", reason: "source-changed" });
    expect(e.detail).toContain("shared was added: a directory (and 2 more)");
    expect(tree(root)).toBe(t);
    expect(fenceFile()).toBeNull();
    rmSync(join(root, "shared"), { recursive: true });
    okResult(await dispatch(applyReq(r, 1)));
  });

  it("a source edited after plan is refused at the next chunk, naming it, whichever chunk converts it; the chunks before stand", async () => {
    const r = await planned();
    await applyAll(r, 1);
    const target = chunkFile(r, 3).writes.find((w) => w.kind === "original")?.from as string;
    writeFileSync(join(root, target), "edited by an old v12 client\n");
    const t = tree(root);
    const e = refusalOf(await dispatch(applyReq(r, 2)));
    expect(e).toMatchObject({ class: "conflict", reason: "source-changed" });
    expect(e.detail).toContain(target);
    expect(tree(root)).toBe(t);
  });

  it("a fence that is not chunk 1's refuses: maintenance-active", async () => {
    const r = await planned();
    write(root, ".json-state/maintenance.json", JSON.stringify({ operation_id: tid(0x61), since: "2026-10-02T09:00:00.000Z" }));
    expect(refusalOf(await dispatch(applyReq(r, 1)))).toMatchObject({ class: "conflict", reason: "maintenance-active" });
    rmSync(join(root, ".json-state/maintenance.json"));
    await applyAll(r, 1);
    write(root, ".json-state/maintenance.json", JSON.stringify({ operation_id: tid(0x61), since: "2026-10-02T09:00:00.000Z" }));
    expect(refusalOf(await dispatch(applyReq(r, 2)))).toMatchObject({ class: "conflict", reason: "maintenance-active" });
    expect(refusalOf(await dispatch(verifyReq(r)))).toMatchObject({ class: "conflict", reason: "maintenance-active" });
  });

  it("a crash between the fence and chunk 1's intent: the fence stands named by chunk 1, and the same request lands", async () => {
    const r = await planned();
    await expect(dispatch(applyReq(r, 1), { kernel: { faults: { cutAt: "after-fence" } } })).rejects.toThrow(CutReached);
    expect(fenceFile()?.operation_id).toBe(F1(r));
    expect(existsSync(join(root, ".json-state/journal", F1(r)))).toBe(false);
    expect(okResult(await dispatch(applyReq(r, 1))).fence).toEqual(fenceFile());
  });

  it("a cut inside a chunk is held from reads and other requests and finished by the same request; a cut between chunks goes on with the next", async () => {
    const r = await planned();
    await applyAll(r, 1);
    const writes = chunkFile(r, 2).writes;
    await expect(dispatch(applyReq(r, 2), { kernel: { faults: { cutAt: "after-write:3" } } })).rejects.toThrow(CutReached);
    const id2 = r.p.operation_ids.apply[1] as string;
    expect(existsSync(join(root, ".json-state/journal", id2))).toBe(true);
    const s = okResult(await dispatch({ op: "migration", workbench: root, phase: "survey" }));
    expect((s.local_state as { intents: unknown[] }).intents).toEqual([{ operation_id: id2, op: "migration", phase: "apply" }]);
    expect((await inspectOf()).pending).toBeNull();
    expect(refusalOf(await dispatch(applyReq(r, 3)))).toMatchObject({ class: "conflict", reason: "intent-pending" });
    expect(refusalOf(await dispatch(verifyReq(r)))).toMatchObject({ class: "conflict", reason: "intent-pending" });
    expect(existsSync(join(root, ".json-state/journal", id2))).toBe(true);
    const landed = okResult(await dispatch(applyReq(r, 2)));
    expect(landed.chunk).toBe(2);
    for (const w of writes) expect(revisionOf(readFileSync(join(root, w.path))), w.path).toBe(w.after_sha256);
    expect(existsSync(join(root, ".json-state/journal", id2))).toBe(false);
    // A cut after chunk 3's answer and before its intent left: verify meets it pending; the same request finishes it, answering as stored.
    await expect(dispatch(applyReq(r, 3), { kernel: { faults: { cutAt: "after-answer" } } })).rejects.toThrow(CutReached);
    expect(refusalOf(await dispatch(verifyReq(r)))).toMatchObject({ class: "conflict", reason: "intent-pending" });
    expect(okResult(await dispatch(applyReq(r, 3))).chunk).toBe(3);
    okResult(await dispatch(verifyReq(r)));
  });

  it("a file edited after a chunk's commit point blocks its recovery and stays as edited; restored, the same request lands", async () => {
    const r = await planned();
    await expect(dispatch(applyReq(r, 1), { kernel: { faults: { cutAt: "after-intent" } } })).rejects.toThrow(CutReached);
    const rewrite = chunkFile(r, 1).writes.find((w) => w.kind === "rewrite") as { path: string; source_sha256: string };
    const source = readFileSync(join(root, rewrite.path));
    writeFileSync(join(root, rewrite.path), "edited by hand after the commit point\n");
    const e = refusalOf(await dispatch(applyReq(r, 1)));
    expect(e).toMatchObject({ class: "operation-unknown", reason: "recovery-blocked" });
    expect(readFileSync(join(root, rewrite.path), "utf-8")).toBe("edited by hand after the commit point\n");
    expect(existsSync(join(root, ".json-state/journal", F1(r)))).toBe(true);
    writeFileSync(join(root, rewrite.path), source);
    okResult(await dispatch(applyReq(r, 1)));
  });
});

describe("migration verify", () => {
  it("writes the receipt binding every part by hash and then the manifest, last; the answer names both", async () => {
    const r = await planned();
    await applyAll(r);
    const v = okResult(await dispatch(verifyReq(r)));
    expect(Object.keys(v)).toEqual(["operation_id", "migration_id", "plan", "checks", "counts", "receipt", "manifest"]);
    const receipt = readJson(`archive/migrations/${MID}/receipt.json`);
    expect(validate(RECEIPT_SCHEMA_ID, receipt)).toEqual({ ok: true });
    const index = readJson(PLAN_PATH);
    expect(receipt.plan).toEqual(r.plan);
    expect(receipt.parts).toEqual((index.parts as Array<{ path: string; sha256: string }>).map((x) => ({ path: x.path, sha256: x.sha256 })));
    expect(receipt.verify_operation_id).toBe(r.p.operation_ids.verify);
    const manifestBytes = readFileSync(join(root, "workbench.json"));
    expect(receipt.manifest_revision).toBe(revisionOf(manifestBytes));
    expect(JSON.parse(manifestBytes.toString("utf-8"))).toEqual({ schema: "fusion.workbench/v1", id: WB, required_features: ["json-control-v1"], migration: { id: MID, source_layout: "fusion-v12", receipt: `archive/migrations/${MID}/receipt.json` }, extensions: {} });
    // The activated tree (C11): the eligible inventory with the manifest entry of the bytes verify wrote.
    const after = inventory(root, (path) => path === ".json-state" || path === ".fusion-setup" || path.startsWith(`archive/migrations/${MID}`));
    expect(after.some((e) => e.path === "workbench.json")).toBe(true);
    expect(receipt.after_inventory_sha256).toBe(revisionOf(Buffer.from(canonical(after), "utf-8")));
    expect((receipt.checks as Array<{ name: string }>).map((c) => c.name)).toEqual(["pairs", "ids", "graph", "references", "acceptance", "closure", "validate", "reconcile"]);
    expect(v.receipt).toEqual({ path: `archive/migrations/${MID}/receipt.json`, sha256: revisionOf(readFileSync(join(root, `archive/migrations/${MID}/receipt.json`))) });
    expect(v.manifest).toEqual({ path: "workbench.json", revision: revisionOf(manifestBytes) });
    const i = await inspectOf();
    expect(i.state).toBe("json-control");
    expect(i.maintenance).toEqual(fenceFile());
    // Records read back through the codec, and the fence still refuses ordinary work until its end.
    const listed = okResult(await dispatch({ op: "list", workbench: root })).records as unknown[];
    expect(listed).toHaveLength(50);
    expect(okResult(await dispatch({ op: "validate", workbench: root })).valid).toBe(true);
    const pkg = "work-packages/260901-0900-pkg-0000/package.json";
    const transition = { op: "transition", workbench: root, operation_id: tid(0x71), record: { path: pkg }, expected_revision: revisionOf(readFileSync(join(root, pkg))), actor: { actor: "user", person: "kai" }, to: "claimed", reason: "r", payload: { claim: { checkout_id: "a216a4b9", person: "kai", claimed_at: "2026-10-02T09:00:00+02:00" } } };
    expect(refusalOf(await dispatch(transition))).toMatchObject({ class: "conflict", reason: "maintenance-active" });
    okResult(await dispatch(end(tid(0x62), F1(r))));
    expect((await inspectOf()).maintenance).toBeNull();
  });

  it("a failed check writes no receipt and no manifest: a dependency cycle is check-failed naming the graph", async () => {
    const r = await planned(THREE, (p) => {
      const [a, b] = Object.entries(p.records).filter(([, x]) => x.kind === "package");
      (a?.[1] as Record_).control.depends_on = [{ target: { workbench_id: WB, record_id: b?.[0] }, condition: "terminal" }];
      (b?.[1] as Record_).control.depends_on = [{ target: { workbench_id: WB, record_id: a?.[0] }, condition: "terminal" }];
    });
    await applyAll(r);
    const t = tree(root);
    const e = refusalOf(await dispatch(verifyReq(r)));
    expect(e).toMatchObject({ class: "migration-incomplete", reason: "check-failed" });
    expect(e.detail).toMatch(/^graph: 1 problem, a cycle through/);
    expect(existsSync(join(root, "workbench.json"))).toBe(false);
    expect(existsSync(join(root, `archive/migrations/${MID}/receipt.json`))).toBe(false);
    expect(tree(root)).toBe(t);
  });

  it("a store differing from the expected final state is source-changed; the wrong id is operation-id-unscheduled", async () => {
    const r = await planned();
    await applyAll(r);
    expect(refusalOf(await dispatch(verifyReq(r, tid(0x98))))).toMatchObject({ class: "conflict", reason: "operation-id-unscheduled" });
    write(root, "work-packages/260901-0900-pkg-0003/stray.md", "x\n");
    const e = refusalOf(await dispatch(verifyReq(r)));
    expect(e).toMatchObject({ class: "conflict", reason: "source-changed" });
    expect(e.detail).toContain("stray.md was added");
    expect(existsSync(join(root, "workbench.json"))).toBe(false);
  });

  it("a changed plan part is plan-file-changed, and so is a part the index does not name", async () => {
    const r = await planned();
    await applyAll(r);
    write(root, `archive/migrations/${MID}/parts/findings-9.json`, "{}\n");
    expect(refusalOf(await dispatch(verifyReq(r)))).toMatchObject({ class: "conflict", reason: "plan-file-changed" });
    rmSync(join(root, `archive/migrations/${MID}/parts/findings-9.json`));
    const path = join(root, `archive/migrations/${MID}/parts/repairs-1.json`);
    writeFileSync(path, readFileSync(path, "utf-8").replace("\n}", ' \n}'));
    expect(refusalOf(await dispatch(verifyReq(r)))).toMatchObject({ class: "conflict", reason: "plan-file-changed" });
  });

  it("every cut of verify is named by inspect.pending's verify variant, reconstructible; reads and other requests leave it; only its own request finishes it", async () => {
    for (const cut of ["after-intent", "after-write:0", "after-write:1"] as const) {
      rmSync(root, { recursive: true, force: true });
      mkdirSync(root);
      const r = await planned();
      await applyAll(r);
      await expect(dispatch(verifyReq(r), { kernel: { faults: { cutAt: cut } } })).rejects.toThrow(CutReached);
      const i = await inspectOf();
      // The manifest is never visible before the receipt is written, and verify writes it last.
      expect(i.state, cut).toBe(cut === "after-write:1" ? "json-control" : "legacy");
      expect(existsSync(join(root, `archive/migrations/${MID}/receipt.json`)), cut).toBe(cut !== "after-intent");
      expect(i.pending, cut).toEqual({ op: "migration", phase: "verify", operation_id: r.p.operation_ids.verify, id: WB, migration_id: MID, plan: r.plan, blocked: false });
      const pending = i.pending as { operation_id: string; plan: { path: string; sha256: string } };
      // Reads and the fence's end leave it.
      okResult(await dispatch({ op: "list", workbench: root }));
      if (cut === "after-write:1") {
        // Under the manifest the fence's end meets the held intent and leaves the fence standing.
        expect(refusalOf(await dispatch(end(tid(0x63), F1(r))))).toMatchObject({ class: "operation-unknown", reason: "migration-pending" });
        expect(fenceFile()?.operation_id).toBe(F1(r));
      }
      expect(refusalOf(await dispatch(rollbackReq(r, r.chunks)))).toMatchObject({ class: "conflict", reason: "intent-pending" });
      expect(existsSync(join(root, ".json-state/journal", pending.operation_id)), cut).toBe(true);
      // The host's reconstruction from the workbench path and the variant's fields is the original request.
      const v = okResult(await dispatch({ op: "migration", workbench: root, operation_id: pending.operation_id, phase: "verify", plan: pending.plan }));
      expect(v.manifest).toEqual({ path: "workbench.json", revision: revisionOf(readFileSync(join(root, "workbench.json"))) });
      expect((await inspectOf()).pending, cut).toBeNull();
      expect((await inspectOf()).state).toBe("json-control");
    }
  });

  it("a verify intent that disagrees with itself is pending-migration-unreadable; two verifies, or one beside an initialize, are pending-migration-ambiguous", async () => {
    const r = await planned();
    await applyAll(r);
    await expect(dispatch(verifyReq(r), { kernel: { faults: { cutAt: "after-intent" } } })).rejects.toThrow(CutReached);
    const dir = join(root, ".json-state/journal", r.p.operation_ids.verify);
    const intentPath = join(dir, "intent.json");
    const good = readFileSync(intentPath, "utf-8");
    const bad = good.replace(`"migration_id": "${MID}"`, '"migration_id": "migration-20260101-other"');
    expect(bad).not.toBe(good);
    writeFileSync(intentPath, bad);
    expect(refusalOf(await dispatch({ op: "inspect", workbench: root }))).toMatchObject({ class: "operation-unknown", reason: "pending-migration-unreadable" });
    writeFileSync(intentPath, good);
    const wb = { root, state: "legacy" as const, id: null, manifest: null, diagnosis: null };
    const manifest = Buffer.from(serialise({ schema: "fusion.workbench/v1", id: WB, required_features: ["json-control-v1"], migration: null, extensions: {} }), "utf-8");
    const init: Intent = { operation_id: tid(0x6a), op: "initialize", request_digest: revisionOf(Buffer.from("x")), writes: [{ path: "workbench.json", before: null, after: revisionOf(manifest) }], response: { ok: true, result: { id: WB } }, created_at: new Date(0).toISOString() };
    expect(commitIntent(wb, init, new Map([["workbench.json", manifest]])).ok).toBe(true);
    expect(refusalOf(await dispatch({ op: "inspect", workbench: root }))).toMatchObject({ class: "operation-unknown", reason: "pending-migration-ambiguous" });
    rmSync(join(root, ".json-state/journal", tid(0x6a)), { recursive: true });
    cpSync(dir, join(root, ".json-state/journal", tid(0x6b)), { recursive: true });
    writeFileSync(join(root, ".json-state/journal", tid(0x6b), "intent.json"), good.replace(`"operation_id": "${r.p.operation_ids.verify}"`, `"operation_id": "${tid(0x6b)}"`).replace(`"operation_id": "${r.p.operation_ids.verify}"`, `"operation_id": "${tid(0x6b)}"`));
    expect(refusalOf(await dispatch({ op: "inspect", workbench: root }))).toMatchObject({ class: "operation-unknown", reason: "pending-migration-ambiguous" });
  });

  it("a second plan after activation is a no-op naming the receipt and changing nothing", async () => {
    const r = await planned();
    await applyAll(r);
    okResult(await dispatch(verifyReq(r)));
    okResult(await dispatch(end(tid(0x62), F1(r))));
    const t = tree(root);
    const again = okResult(await dispatch(planRequest(root, propose(root, r.p), tid(0x64))));
    expect(again).toMatchObject({ no_op: true, migration_id: MID, receipt: { path: `archive/migrations/${MID}/receipt.json` } });
    expect(again.later_operations).toEqual([{ operation_id: tid(0x62), op: "maintenance" }]);
    expect(tree(root)).toBe(t);
  });
});

describe("migration rollback", () => {
  /** The survey's entries outside this migration's directories, and the directories the run created and left empty. */
  const split = (entries: Array<Record<string, unknown>>, before: ReadonlySet<string>) => ({
    kept: entries.filter((e) => before.has(e.path as string)),
    left: entries.filter((e) => !before.has(e.path as string)),
  });

  it("before activation: chunks backwards, chunk 0 removes the plan files, maintenance end on legacy closes the fence; the store is the survey before plan, plus named empty directories", async () => {
    const p = generate(root, THREE);
    const surveyed = await surveyEntries();
    const r = { p, plan: okResult(await dispatch(planRequest(root, propose(root, p)))).plan as { path: string; sha256: string }, chunks: 3 };
    await applyAll(r, 2);
    // Chunk 1 is not next while 2 is landed, and 0 is not while any is.
    expect(refusalOf(await dispatch(rollbackReq(r, 1)))).toMatchObject({ class: "migration-incomplete", reason: "chunk-out-of-order" });
    expect(refusalOf(await dispatch(rollbackReq(r, 0)))).toMatchObject({ class: "migration-incomplete", reason: "chunk-out-of-order" });
    expect(refusalOf(await dispatch(rollbackReq(r, 2, tid(0x97))))).toMatchObject({ class: "conflict", reason: "operation-id-unscheduled" });
    const b2 = okResult(await dispatch(rollbackReq(r, 2)));
    expect(Object.keys(b2)).toEqual(["operation_id", "migration_id", "chunk", "restored", "removed", "activation_undone"]);
    const c2 = chunkFile(r, 2).writes;
    expect(b2.restored).toEqual(c2.filter((w) => w.kind === "rewrite").map((w) => w.path));
    expect(b2.removed).toEqual([...c2.filter((w) => w.kind === "control"), ...c2.filter((w) => w.kind === "original")].map((w) => w.path));
    expect(b2.activation_undone).toBe(false);
    // An old apply replayed after its rollback recreates nothing.
    const t = tree(root);
    okResult(await dispatch(applyReq(r, 2)));
    expect(tree(root)).toBe(t);
    okResult(await dispatch(rollbackReq(r, 1)));
    expect(refusalOf(await dispatch(end(tid(0x65), F1(r))))).toMatchObject({ class: "unsupported-format", reason: "legacy-workbench" });
    const z = okResult(await dispatch(rollbackReq(r, 0)));
    expect(Object.keys(z)).toEqual(["operation_id", "migration_id", "chunk", "restored", "removed", "activation_undone", "plan", "fence", "progress", "progress_sha256"]);
    expect(z.fence).toBe(F1(r));
    // The applied prefix was chunks 1 and 2: their rollbacks, highest first, then chunk 0 (question 51).
    const progress = z.progress as Array<{ chunk: number; operation_id: string; request_digest: string }>;
    expect(progress.map((x) => [x.chunk, x.operation_id])).toEqual([[2, r.p.operation_ids.rollback[2]], [1, r.p.operation_ids.rollback[1]], [0, r.p.operation_ids.rollback[0]]]);
    expect(progress[2]?.request_digest).toBe(requestDigest(rollbackReq(r, 0)));
    expect(z.progress_sha256).toBe(revisionOf(Buffer.from(canonical(progress), "utf-8")));
    expect(z.plan).toEqual(r.plan);
    expect((z.removed as string[]).at(-1)).toBe(PLAN_PATH);
    expect(existsSync(join(root, PLAN_PATH))).toBe(false);
    expect(fenceFile()?.operation_id).toBe(F1(r));
    // The fence's end on the legacy store, admitted by chunk 0's evidence, and its replay.
    expect(refusalOf(await dispatch(end(tid(0x66), tid(0x61))))).toMatchObject({ class: "unsupported-format", reason: "legacy-workbench" });
    const ended = await dispatch(end(tid(0x65), F1(r)));
    expect(okResult(ended).action).toBe("end");
    expect(fenceFile()).toBeNull();
    expect(await dispatch(end(tid(0x65), F1(r)))).toEqual(ended);
    expect(refusalOf(await dispatch(end(tid(0x67), F1(r))))).toMatchObject({ class: "unsupported-format", reason: "legacy-workbench" });
    // The store: the survey before plan, plus empty directories the run created, every one named.
    const after = await surveyEntries();
    const { kept, left } = split(after, new Set(surveyed.map((e) => e.path as string)));
    expect(kept).toEqual(surveyed);
    expect(left.every((e) => e.kind === "directory")).toBe(true);
    expect(left.map((e) => e.path)).toEqual(["archive", "archive/migrations", `archive/migrations/${MID}`, `archive/migrations/${MID}/chunks`, `archive/migrations/${MID}/originals`, ...left.map((e) => e.path as string).filter((x) => x.startsWith(`archive/migrations/${MID}/originals/`)), `archive/migrations/${MID}/parts`]);
    expect((await inspectOf()).state).toBe("legacy");
    // A new plan: empty directories plan nothing. The limit of the observed
    // inventory: survey counts the empty directories the rollback left under
    // this migration's own archive/migrations/<id>/, which plan's eligible
    // inventory leaves out, so a re-plan under the same migration id is
    // source-changed until they are gone (or the host takes a new id).
    const again = { ...p, source_inventory_sha256: observed(root), operation_ids: { ...p.operation_ids, plan: oid(2), apply: p.operation_ids.apply.map((_, i) => oid(0x300 + i)), verify: oid(3), rollback: p.operation_ids.rollback.map((_, i) => oid(0x400 + i)) } };
    expect(refusalOf(await dispatch(planRequest(root, propose(root, again), oid(2))))).toMatchObject({ class: "conflict", reason: "source-changed" });
    rmSync(join(root, `archive/migrations/${MID}`), { recursive: true });
    okResult(await dispatch(planRequest(root, propose(root, { ...again, source_inventory_sha256: observed(root) }), oid(2))));
  });

  it("a full abort before chunk 1 needs no fence: chunk 0 alone, its evidence naming none", async () => {
    const r = await planned();
    const z = okResult(await dispatch(rollbackReq(r, 0)));
    expect(z.fence).toBeNull();
    expect(fenceFile()).toBeNull();
    expect(existsSync(join(root, PLAN_PATH))).toBe(false);
  });

  it("a rollback cut inside its intent has restored the narratives before it removes an original; its own request finishes it", async () => {
    const r = await planned();
    await applyAll(r, 1);
    const c1 = chunkFile(r, 1).writes;
    const rewrites = c1.filter((w) => w.kind === "rewrite");
    expect(rewrites.length).toBeGreaterThan(0);
    // The intent: the narratives written back first, then controls, then originals.
    const cut = `after-write:${rewrites.length - 1}` as const;
    await expect(dispatch(rollbackReq(r, 1), { kernel: { faults: { cutAt: cut } } })).rejects.toThrow(CutReached);
    for (const w of rewrites) expect(revisionOf(readFileSync(join(root, w.path)))).toBe(w.source_sha256);
    for (const w of c1.filter((x) => x.kind === "original")) expect(existsSync(join(root, w.path))).toBe(true);
    const intent = JSON.parse(readFileSync(join(root, ".json-state/journal", r.p.operation_ids.rollback[1] as string, "intent.json"), "utf-8")) as { phase: string; writes: Array<{ path: string; after: string | null }> };
    expect(intent.phase).toBe("rollback");
    const kinds = intent.writes.map((w) => (w.after !== null ? "write" : c1.find((x) => x.path === w.path)?.kind));
    expect(kinds).toEqual([...rewrites.map(() => "write"), ...c1.filter((x) => x.kind === "control").map(() => "control"), ...c1.filter((x) => x.kind === "original").map(() => "original")]);
    okResult(await dispatch(rollbackReq(r, 1)));
    for (const w of c1.filter((x) => x.kind !== "rewrite")) expect(existsSync(join(root, w.path)), w.path).toBe(false);
  });

  it("a removal entry meeting a dangling link where its file stood is diverged: recovery is blocked and the link stays", async () => {
    const r = await planned();
    await applyAll(r, 1);
    await expect(dispatch(rollbackReq(r, 1), { kernel: { faults: { cutAt: "after-intent" } } })).rejects.toThrow(CutReached);
    const control = chunkFile(r, 1).writes.find((w) => w.kind === "control")?.path as string;
    rmSync(join(root, control));
    symlinkSync("nowhere.json", join(root, control));
    expect(refusalOf(await dispatch(rollbackReq(r, 1)))).toMatchObject({ class: "operation-unknown", reason: "recovery-blocked" });
    expect(lstatSync(join(root, control)).isSymbolicLink()).toBe(true);
    rmSync(join(root, control));
    // Absent is the removal's post-state: the same request lands.
    okResult(await dispatch(rollbackReq(r, 1)));
  });

  it("a file chunk k wrote and changed since is after-state-changed", async () => {
    const r = await planned();
    await applyAll(r, 1);
    const control = chunkFile(r, 1).writes.find((w) => w.kind === "control")?.path as string;
    writeFileSync(join(root, control), "{}\n");
    expect(refusalOf(await dispatch(rollbackReq(r, 1)))).toMatchObject({ class: "conflict", reason: "after-state-changed" });
  });

  it("after activation: under a maintenance begin, against the receipt's baseline, exempting exactly verify, the end of chunk 1's fence and that begin, bound in rollback.json; then back to legacy, and the begin's end on legacy", async () => {
    const p = generate(root, THREE);
    const surveyed = await surveyEntries();
    const r = { p, plan: okResult(await dispatch(planRequest(root, propose(root, p)))).plan as { path: string; sha256: string }, chunks: 3 };
    await applyAll(r);
    okResult(await dispatch(verifyReq(r)));
    // Under chunk 1's fence the first rollback after activation is refused: it runs under a begin of its own.
    expect(refusalOf(await dispatch(rollbackReq(r, 3)))).toMatchObject({ class: "conflict", reason: "maintenance-active" });
    okResult(await dispatch(end(tid(0x62), F1(r))));
    expect(refusalOf(await dispatch(rollbackReq(r, 3)))).toMatchObject({ class: "conflict", reason: "maintenance-active" });
    okResult(await dispatch(begin(tid(0x68))));
    expect(refusalOf(await dispatch(rollbackReq(r, 2)))).toMatchObject({ class: "migration-incomplete", reason: "chunk-out-of-order" });
    const first = okResult(await dispatch(rollbackReq(r, 3)));
    expect(first.activation_undone).toBe(true);
    expect((first.removed as string[]).slice(0, 2)).toEqual(["workbench.json", `archive/migrations/${MID}/receipt.json`]);
    expect((await inspectOf()).state).toBe("legacy");
    const binding = readJson(`archive/migrations/${MID}/rollback.json`);
    expect(binding.fence).toBe(tid(0x68));
    expect((binding.exempt as Array<{ operation_id: string; op: string }>).map((e) => [e.operation_id, e.op]).sort()).toEqual([[tid(0x62), "maintenance"], [tid(0x68), "maintenance"], [r.p.operation_ids.verify, "migration"]].sort());
    okResult(await dispatch(rollbackReq(r, 2)));
    okResult(await dispatch(rollbackReq(r, 1)));
    const z = okResult(await dispatch(rollbackReq(r, 0)));
    expect(z.fence).toBe(tid(0x68));
    expect(existsSync(join(root, `archive/migrations/${MID}/rollback.json`))).toBe(false);
    expect(refusalOf(await dispatch(end(tid(0x69), F1(r))))).toMatchObject({ class: "unsupported-format", reason: "legacy-workbench" });
    okResult(await dispatch(end(tid(0x69), tid(0x68))));
    const { kept, left } = split(await surveyEntries(), new Set(surveyed.map((e) => e.path as string)));
    expect(kept).toEqual(surveyed);
    expect(left.every((e) => e.kind === "directory")).toBe(true);
  });

  it("after activation, ordinary work refuses the rollback even when it was undone; so does an edited narrative the plan left unconverted", async () => {
    const r = await planned();
    await applyAll(r);
    okResult(await dispatch(verifyReq(r)));
    okResult(await dispatch(end(tid(0x62), F1(r))));
    // A create, then its pair removed by hand: the bytes return, the stored answer does not.
    const later = "work-packages/261002-1200-later-work";
    const create = { op: "create", workbench: root, operation_id: tid(0x72), id: uuid(0xc1, 1), kind: "package", filed_by: { actor: "user", person: "kai" }, origin: { kind: "user-request", ref: null }, scope: { container: null, store: "work-packages" }, narrative: { path: `${later}/261002-1200-later-work.md`, content: "# Later work\n" }, payload: { domain: "code" } };
    const made = await dispatch(create);
    okResult(made);
    okResult(await dispatch(begin(tid(0x68))));
    const t = tree(root);
    const e = refusalOf(await dispatch(rollbackReq(r, 3)));
    expect(e).toMatchObject({ class: "conflict", reason: "after-state-changed" });
    expect(tree(root)).toBe(t);
    rmSync(join(root, later), { recursive: true });
    const e2 = refusalOf(await dispatch(rollbackReq(r, 3)));
    expect(e2).toMatchObject({ class: "conflict", reason: "after-state-changed" });
    expect(e2.detail).toContain(tid(0x72));
  });

  it("after activation, an edited file refuses the rollback against the receipt's baseline, naming it", async () => {
    const r = await planned();
    await applyAll(r);
    okResult(await dispatch(verifyReq(r)));
    okResult(await dispatch(end(tid(0x62), F1(r))));
    okResult(await dispatch(begin(tid(0x68))));
    write(root, "work-packages/260901-0900-pkg-0001/notes.md", "an unconverted narrative, new\n");
    const e = refusalOf(await dispatch(rollbackReq(r, 3)));
    expect(e).toMatchObject({ class: "conflict", reason: "after-state-changed" });
    expect(e.detail).toContain("work-packages/260901-0900-pkg-0001/notes.md was added");
    expect(existsSync(join(root, "workbench.json"))).toBe(true);
  });
});

// --- Prior a1fb17a: the evidence list ------------------------------------------------------
//
// Each case is named after the guard it shows (FJ04 addendum for a1fb17a;
// plan step 6, "Tests").

const ANSWER = (id: string, op = "create"): string => JSON.stringify({ operation_id: id, op, request_digest: revisionOf(Buffer.from(`request of ${id}`)), response: { ok: true, result: {} } }, null, 2) + "\n";
const opsFile = (id: string): string => join(root, ".json-state/ops", `${id}.json`);
/** Two answers stored before the plan, as an earlier codec run leaves them. */
const PRE = [tid(0xa0), tid(0xa1)];
const storePre = (): void => {
  for (const id of PRE) write(root, `.json-state/ops/${id}.json`, ANSWER(id));
};

/** Plans, applies, verifies, ends chunk 1's fence and begins the rollback's: the store activated and fenced for its first rollback. */
async function activated(arrange?: (p: Proposal) => void, between?: () => Promise<void>): Promise<Run> {
  const r = await planned(THREE, arrange);
  await applyAll(r);
  okResult(await dispatch(verifyReq(r)));
  okResult(await dispatch(end(tid(0x62), F1(r))));
  await between?.();
  okResult(await dispatch(begin(tid(0x68))));
  return r;
}

describe("the exclusion allowlist (R1)", () => {
  it("the codec's constant is the schema's enum, name for name and in order, with no trailing slash", () => {
    const schema = JSON.parse(readFileSync(fileURLToPath(new URL("../../schemas/migration-plan.schema.json", import.meta.url)), "utf-8")) as { $defs: { exclusions: { items: { enum: string[] } } } };
    expect(Object.keys(EXCLUSION_ALLOWLIST)).toEqual(schema.$defs.exclusions.items.enum);
    expect(Object.keys(EXCLUSION_ALLOWLIST).some((n) => n.endsWith("/"))).toBe(false);
    expect(Object.entries(EXCLUSION_ALLOWLIST).filter(([, k]) => k === "directory").map(([n]) => n)).toEqual([".guard-state", ".commit-lock"]);
  });

  it("an operational log appended during the run, and a guard directory that comes and goes, are tolerated and left in place", async () => {
    const r = await planned();
    const log = join(root, "orchestrator-events.jsonl");
    appendFileSync(log, "planned\n");
    for (let n = 1; n <= r.chunks; n++) {
      okResult(await dispatch(applyReq(r, n)));
      appendFileSync(log, `applied ${n}\n`);
      if (n === 1) write(root, ".guard-state/state.json", "{}\n");
      if (n === 2) rmSync(join(root, ".guard-state"), { recursive: true });
    }
    okResult(await dispatch(verifyReq(r)));
    appendFileSync(log, "verified\n");
    write(root, ".commit-lock/owner", "pid\n");
    okResult(await dispatch(end(tid(0x62), F1(r))));
    okResult(await dispatch(begin(tid(0x68))));
    appendFileSync(log, "rolling back\n");
    for (let k = r.chunks; k >= 0; k--) okResult(await dispatch(rollbackReq(r, k)));
    okResult(await dispatch(end(tid(0x69), tid(0x68))));
    // Rollback neither restored nor removed excluded data.
    expect(readFileSync(log, "utf-8")).toBe("planned\napplied 1\napplied 2\napplied 3\nverified\nrolling back\n");
    expect(readFileSync(join(root, ".commit-lock/owner"), "utf-8")).toBe("pid\n");
    expect((await inspectOf()).state).toBe("legacy");
  });

  it("a link in place of orchestrator-events.jsonl and a directory in place of .fusion-setup are differences, never skipped", async () => {
    const r = await planned();
    symlinkSync("elsewhere.jsonl", join(root, "orchestrator-events.jsonl"));
    let e = refusalOf(await dispatch(applyReq(r, 1)));
    expect(e).toMatchObject({ class: "conflict", reason: "source-changed" });
    expect(e.detail).toContain('orchestrator-events.jsonl was added: a link to "elsewhere.jsonl"');
    unlinkSync(join(root, "orchestrator-events.jsonl"));
    rmSync(join(root, ".fusion-setup"));
    mkdirSync(join(root, ".fusion-setup"));
    e = refusalOf(await dispatch(applyReq(r, 1)));
    expect(e).toMatchObject({ class: "conflict", reason: "source-changed" });
    expect(e.detail).toContain(".fusion-setup was added: a directory");
    expect(fenceFile()).toBeNull();
    rmSync(join(root, ".fusion-setup"), { recursive: true });
    write(root, ".fusion-setup", '{"setup":"rewritten"}\n');
    okResult(await dispatch(applyReq(r, 1)));
  });
});

describe("the operation baseline (R3), the activated tree (C11) and rollback.json (52)", () => {
  it("pre-existing answers are told apart from later ones by the baseline, whatever their mtimes say", async () => {
    const r = await activated(() => storePre());
    const index = readJson(PLAN_PATH);
    const answersPart = (index.parts as Array<{ part: string; path: string }>).find((x) => x.part === "answers")?.path as string;
    expect((readJson(answersPart).entries as Array<{ operation_id: string; answer_sha256: string }>).map((e) => [e.operation_id, e.answer_sha256])).toEqual(PRE.map((id) => [id, revisionOf(readFileSync(opsFile(id)))]));
    // Equal to verify's mtime, then misleadingly later than everything.
    const verifyAt = lstatSync(opsFile(r.p.operation_ids.verify)).mtime;
    for (const id of PRE) utimesSync(opsFile(id), verifyAt, verifyAt);
    // An answer stored after activation, with an mtime set misleadingly early, is a later operation.
    write(root, `.json-state/ops/${tid(0xa2)}.json`, ANSWER(tid(0xa2)));
    utimesSync(opsFile(tid(0xa2)), new Date(0), new Date(0));
    const e = refusalOf(await dispatch(rollbackReq(r, r.chunks)));
    expect(e).toMatchObject({ class: "conflict", reason: "after-state-changed" });
    expect(e.detail).toContain(tid(0xa2));
    rmSync(opsFile(tid(0xa2)));
    const later = new Date(Date.now() + 3_600_000);
    for (const id of PRE) utimesSync(opsFile(id), later, later);
    okResult(await dispatch(rollbackReq(r, r.chunks)));
  });

  it("the answers parts are the codec's to order: a whole entry repeated, an id repeated with other fields, or entries out of bytewise order are plan-file-changed", async () => {
    // The plan schema leaves uniqueness and order to the codec (6b follow-up): each altered part is schema-valid, re-bound by a rewritten index, and refused by the frozen-plan reader.
    const r = await planned(THREE, () => storePre());
    await applyAll(r);
    const index = readJson(PLAN_PATH);
    const parts = index.parts as Array<{ part: string; path: string; sha256: string }>;
    const at = parts.findIndex((x) => x.part === "answers");
    const entry = parts[at] as { path: string; sha256: string };
    const part = readJson(entry.path);
    const good = part.entries as Array<Record<string, string>>;
    expect(good.map((e) => e.operation_id)).toEqual(PRE);
    const variants: Array<[string, Array<Record<string, string>>]> = [
      ["a whole entry twice", [good[0] as Record<string, string>, good[0] as Record<string, string>, good[1] as Record<string, string>]],
      ["one id with other fields", [good[0] as Record<string, string>, { ...(good[0] as Record<string, string>), op: "transition" }, good[1] as Record<string, string>]],
      ["out of bytewise order", [good[1] as Record<string, string>, good[0] as Record<string, string>]],
    ];
    const keepPart = readFileSync(join(root, entry.path));
    const keepIndex = readFileSync(join(root, PLAN_PATH));
    for (const [name, entries] of variants) {
      const altered = { ...part, entries };
      expect(validate(PLAN_SCHEMA_ID, altered), name).toEqual({ ok: true });
      const bytes = Buffer.from(serialise(altered), "utf-8");
      writeFileSync(join(root, entry.path), bytes);
      const rebound = { ...index, parts: parts.map((x, i) => (i === at ? { ...x, sha256: revisionOf(bytes) } : x)) };
      const indexBytes = Buffer.from(serialise(rebound), "utf-8");
      writeFileSync(join(root, PLAN_PATH), indexBytes);
      const plan = { path: PLAN_PATH, sha256: revisionOf(indexBytes) };
      const e = refusalOf(await dispatch({ op: "migration", workbench: root, operation_id: r.p.operation_ids.verify, phase: "verify", plan }));
      expect(e, name).toMatchObject({ class: "conflict", reason: "plan-file-changed" });
      expect(e.detail, name).toContain("out of bytewise order or twice");
      writeFileSync(join(root, entry.path), keepPart);
      writeFileSync(join(root, PLAN_PATH), keepIndex);
    }
    okResult(await dispatch(verifyReq(r)));
  });

  it("a missing baseline answer refuses the first rollback after activation", async () => {
    const r = await activated(() => storePre());
    rmSync(opsFile(PRE[0] as string));
    const e = refusalOf(await dispatch(rollbackReq(r, r.chunks)));
    expect(e).toMatchObject({ class: "conflict", reason: "after-state-changed" });
    expect(e.detail).toContain(`${PRE[0]} (create) that the baseline froze at plan is missing`);
    expect(existsSync(join(root, "workbench.json"))).toBe(true);
  });

  it("a changed baseline answer refuses the first rollback after activation", async () => {
    const r = await activated(() => storePre());
    writeFileSync(opsFile(PRE[1] as string), ANSWER(PRE[1] as string, "transition"));
    const e = refusalOf(await dispatch(rollbackReq(r, r.chunks)));
    expect(e).toMatchObject({ class: "conflict", reason: "after-state-changed" });
    expect(e.detail).toContain(`${PRE[1]} (create) that the baseline froze at plan is changed`);
  });

  it("an unrelated maintenance begin and end between activation and the rollback's begin refuse it", async () => {
    const r = await activated(undefined, async () => {
      okResult(await dispatch(begin(tid(0x6c))));
      okResult(await dispatch(end(tid(0x6d), tid(0x6c))));
    });
    const e = refusalOf(await dispatch(rollbackReq(r, r.chunks)));
    expect(e).toMatchObject({ class: "conflict", reason: "after-state-changed" });
    expect(e.detail).toContain(`${tid(0x6c)} (maintenance begin)`);
  });

  it("the untouched store's first rollback after activation compares the activated tree, the manifest included", async () => {
    const r = await activated();
    // The manifest at other bytes is a difference of the activated tree, named as such.
    const manifest = join(root, "workbench.json");
    const bytes = readFileSync(manifest);
    writeFileSync(manifest, bytes.toString("utf-8").replace("{}", '{"x-note": "edited"}'));
    expect(refusalOf(await dispatch(rollbackReq(r, r.chunks)))).toMatchObject({ class: "migration-incomplete", reason: "receipt-unverified" });
    writeFileSync(manifest, bytes);
    const first = okResult(await dispatch(rollbackReq(r, r.chunks)));
    expect(first.activation_undone).toBe(true);
  });

  it("an altered rollback.json is refused at a later chunk before it is trusted; replays never read it, after chunk 0 removed it too", async () => {
    const r = await activated();
    const firstResponse = await dispatch(rollbackReq(r, r.chunks));
    const first = okResult(firstResponse);
    const path = `archive/migrations/${MID}/rollback.json`;
    const good = readFileSync(join(root, path));
    expect(Object.keys(first)).toEqual(["operation_id", "migration_id", "chunk", "restored", "removed", "activation_undone", "binding"]);
    expect(first.binding).toEqual({ path, sha256: revisionOf(good) });
    const binding = readJson(path);
    expect(validate(PLAN_SCHEMA_ID, binding)).toEqual({ ok: true });
    expect(binding).toMatchObject({ schema: "fusion.migration-plan/v1", part: "rollback-binding", migration_id: MID, plan: r.plan, receipt: { path: `archive/migrations/${MID}/receipt.json` }, fence: tid(0x68) });
    expect(good.toString("utf-8")).toBe(serialise(binding));
    // The same content at other bytes: refused on the bound hash alone.
    writeFileSync(join(root, path), JSON.stringify(binding));
    const e = refusalOf(await dispatch(rollbackReq(r, r.chunks - 1)));
    expect(e).toMatchObject({ class: "conflict", reason: "plan-file-changed" });
    expect(e.detail).toContain(path);
    // Removed: refused the same way.
    rmSync(join(root, path));
    expect(refusalOf(await dispatch(rollbackReq(r, r.chunks - 1)))).toMatchObject({ class: "conflict", reason: "plan-file-changed" });
    writeFileSync(join(root, path), good);
    for (let k = r.chunks - 1; k >= 0; k--) okResult(await dispatch(rollbackReq(r, k)));
    expect(existsSync(join(root, path))).toBe(false);
    expect(await dispatch(rollbackReq(r, r.chunks))).toEqual(firstResponse);
  });

  it("completed cleanup admits the matching legacy end and its replay, and old apply, verify and rollback replays answer without plan files", async () => {
    const r = await activated();
    const applies = [];
    for (let n = 1; n <= r.chunks; n++) applies.push(await dispatch(applyReq(r, n)));
    const verified = await dispatch(verifyReq(r));
    const rollbacks: Response[] = [];
    for (let k = r.chunks; k >= 0; k--) rollbacks.push(await dispatch(rollbackReq(r, k)));
    for (const x of rollbacks) okResult(x);
    const ended = await dispatch(end(tid(0x69), tid(0x68)));
    okResult(ended);
    expect(existsSync(join(root, PLAN_PATH))).toBe(false);
    const t = tree(root);
    expect(await dispatch(end(tid(0x69), tid(0x68)))).toEqual(ended);
    for (let n = 1; n <= r.chunks; n++) expect(await dispatch(applyReq(r, n))).toEqual(applies[n - 1]);
    expect(await dispatch(verifyReq(r))).toEqual(verified);
    for (let k = r.chunks; k >= 0; k--) expect(await dispatch(rollbackReq(r, k))).toEqual(rollbacks[r.chunks - k]);
    expect(tree(root)).toBe(t);
    expect(fenceFile()).toBeNull();
  });
});

describe("chunk 0's evidence and legacy end (51)", () => {
  it("a cleanup cut before its stored answer cannot authorise end; one cut after its answer is pending and refuses it; its own request lands it", async () => {
    const r = await planned();
    await applyAll(r, 1);
    okResult(await dispatch(rollbackReq(r, 1)));
    await expect(dispatch(rollbackReq(r, 0), { kernel: { faults: { cutAt: "after-intent" } } })).rejects.toThrow(CutReached);
    expect(refusalOf(await dispatch(end(tid(0x65), F1(r))))).toMatchObject({ class: "unsupported-format", reason: "legacy-workbench" });
    expect(fenceFile()?.operation_id).toBe(F1(r));
    // Finished by its own request, then cut again on a fresh store at the answer.
    okResult(await dispatch(rollbackReq(r, 0)));
    okResult(await dispatch(end(tid(0x65), F1(r))));

    rmSync(root, { recursive: true, force: true });
    mkdirSync(root);
    const s = await planned();
    await applyAll(s, 1);
    okResult(await dispatch(rollbackReq(s, 1)));
    await expect(dispatch(rollbackReq(s, 0), { kernel: { faults: { cutAt: "after-answer" } } })).rejects.toThrow(CutReached);
    expect(existsSync(join(root, ".json-state/journal", s.p.operation_ids.rollback[0] as string))).toBe(true);
    expect(refusalOf(await dispatch(end(tid(0x65), F1(s))))).toMatchObject({ class: "operation-unknown", reason: "migration-pending" });
    expect(fenceFile()?.operation_id).toBe(F1(s));
    okResult(await dispatch(rollbackReq(s, 0)));
    okResult(await dispatch(end(tid(0x65), F1(s))));
  });

  it("legacy end refuses a progress list that does not hold: a listed answer changed, or progress_sha256 not its list's", async () => {
    const r = await planned();
    await applyAll(r, 2);
    okResult(await dispatch(rollbackReq(r, 2)));
    okResult(await dispatch(rollbackReq(r, 1)));
    okResult(await dispatch(rollbackReq(r, 0)));
    const listed = opsFile(r.p.operation_ids.rollback[2] as string);
    const good = readFileSync(listed, "utf-8");
    writeFileSync(listed, good.replace(/"request_digest": "sha256:[0-9a-f]+"/, `"request_digest": "${revisionOf(Buffer.from("another request"))}"`));
    const e = refusalOf(await dispatch(end(tid(0x65), F1(r))));
    expect(e).toMatchObject({ class: "unsupported-format", reason: "legacy-workbench" });
    expect(e.detail).toContain("the rollback of chunk 2");
    writeFileSync(listed, good);
    const zero = opsFile(r.p.operation_ids.rollback[0] as string);
    const z = readFileSync(zero, "utf-8");
    writeFileSync(zero, z.replace(/"progress_sha256": "sha256:[0-9a-f]+"/, `"progress_sha256": "${revisionOf(Buffer.from("x"))}"`));
    expect(refusalOf(await dispatch(end(tid(0x65), F1(r))))).toMatchObject({ class: "unsupported-format", reason: "legacy-workbench" });
    writeFileSync(zero, z);
    okResult(await dispatch(end(tid(0x65), F1(r))));
  });

  it("a crash after chunk 1's fence and before its intent, then a full abort: chunk 0 names the fence, lists itself alone, and the matching end closes it", async () => {
    const r = await planned();
    await expect(dispatch(applyReq(r, 1), { kernel: { faults: { cutAt: "after-fence" } } })).rejects.toThrow(CutReached);
    expect(fenceFile()?.operation_id).toBe(F1(r));
    const z = okResult(await dispatch(rollbackReq(r, 0)));
    expect(z.fence).toBe(F1(r));
    expect(z.progress).toEqual([{ chunk: 0, operation_id: r.p.operation_ids.rollback[0], request_digest: requestDigest(rollbackReq(r, 0)) }]);
    expect(existsSync(join(root, PLAN_PATH))).toBe(false);
    const ended = await dispatch(end(tid(0x65), F1(r)));
    okResult(ended);
    expect(fenceFile()).toBeNull();
    expect(await dispatch(end(tid(0x65), F1(r)))).toEqual(ended);
  });
});

describe("recovery is the same request's alone (R4, C14), and reconstruction in two forms (departure 5)", () => {
  it("the same id with a changed digest never recovers its migration intent: operation-id-reused, nothing landed", async () => {
    const r = await planned();
    await expect(dispatch(applyReq(r, 1), { kernel: { faults: { cutAt: "after-intent" } } })).rejects.toThrow(CutReached);
    const t = tree(root);
    expect(refusalOf(await dispatch({ ...applyReq(r, 1), chunk: 2 }))).toMatchObject({ class: "conflict", reason: "operation-id-reused" });
    expect(refusalOf(await dispatch({ ...applyReq(r, 1), workbench: `${root}/.` }))).toMatchObject({ class: "conflict", reason: "operation-id-reused" });
    expect(tree(root)).toBe(t);
    expect(existsSync(join(root, ".json-state/journal", F1(r)))).toBe(true);
    okResult(await dispatch(applyReq(r, 1)));
  });

  it("requests sent without workbench are reconstructed bare: the no-op lists only the end, and the rollback exempts its end and begin", async () => {
    const bare = <T extends { workbench?: string }>(req: T): Omit<T, "workbench"> => {
      const out = { ...req };
      delete out.workbench;
      return out;
    };
    const opts = { defaultWorkbench: root };
    /** The run to activation with every request bare, answered against the default workbench. */
    const run = async (): Promise<Run> => {
      const p = generate(root, THREE);
      const planned_ = okResult(await dispatch(bare(planRequest(root, propose(root, p))), opts));
      const r: Run = { p, plan: planned_.plan as { path: string; sha256: string }, chunks: 3 };
      for (let n = 1; n <= r.chunks; n++) okResult(await dispatch(bare(applyReq(r, n)), opts));
      okResult(await dispatch(bare(verifyReq(r)), opts));
      okResult(await dispatch(bare(end(tid(0x62), F1(r))), opts));
      return r;
    };
    const r = await run();
    const again = okResult(await dispatch(planRequest(root, propose(root, r.p), tid(0x64))));
    expect(again.later_operations).toEqual([{ operation_id: tid(0x62), op: "maintenance" }]);
    // The no-op stored an answer of its own, neither baseline nor scheduled: no operation is exempt by its name.
    okResult(await dispatch(bare(begin(tid(0x68))), opts));
    const e = refusalOf(await dispatch(bare(rollbackReq(r, r.chunks)), opts));
    expect(e).toMatchObject({ class: "conflict", reason: "after-state-changed" });
    expect(e.detail).toContain(`${tid(0x64)} (migration)`);

    rmSync(root, { recursive: true, force: true });
    mkdirSync(root);
    const s = await run();
    okResult(await dispatch(bare(begin(tid(0x68))), opts));
    expect(okResult(await dispatch(bare(rollbackReq(s, s.chunks)), opts)).activation_undone).toBe(true);
    for (let k = s.chunks - 1; k >= 0; k--) okResult(await dispatch(bare(rollbackReq(s, k)), opts));
    okResult(await dispatch(bare(end(tid(0x69), tid(0x68))), opts));
  });

  it("the limit: an end that spelled its workbench otherwise than the resolved root reconstructs in neither form, and the rollback refuses", async () => {
    const r = await planned();
    await applyAll(r);
    okResult(await dispatch(verifyReq(r)));
    okResult(await dispatch({ ...end(tid(0x62), F1(r)), workbench: `${root}/.` }));
    okResult(await dispatch(begin(tid(0x68))));
    const e = refusalOf(await dispatch(rollbackReq(r, r.chunks)));
    expect(e).toMatchObject({ class: "conflict", reason: "after-state-changed" });
    expect(e.detail).toContain("found 1 verify, 0 ends and 1 begin");
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

  it("applies every chunk, then verifies, each request within the 5 s allowance in process", async () => {
    expect(answer.ok).toBe(true);
    if (!answer.ok) return;
    const plan = (answer.result as { plan: { path: string; sha256: string } }).plan;
    const chunks = (answer.result as { schedule: { apply: Array<{ chunk: number; operation_id: string }> } }).schedule.apply;
    const times: number[] = [];
    for (const { chunk, operation_id } of chunks) {
      const t0 = performance.now();
      const r = await dispatch({ op: "migration", workbench: big, operation_id, phase: "apply", plan, chunk });
      times.push(performance.now() - t0);
      expect(r.ok, JSON.stringify(r).slice(0, 1000)).toBe(true);
    }
    const t0 = performance.now();
    const v = await dispatch({ op: "migration", workbench: big, operation_id: proposal.operation_ids.verify, phase: "verify", plan });
    const verifyMs = performance.now() - t0;
    expect(v.ok, JSON.stringify(v).slice(0, 1000)).toBe(true);
    const sorted = [...times].sort((a, b) => a - b);
    console.info(`[migration] largest-size apply: ${times.length} chunks, median ${Math.round(sorted[Math.floor(sorted.length / 2)] as number)} ms, max ${Math.round(sorted.at(-1) as number)} ms; verify ${Math.round(verifyMs)} ms, in process`);
    for (const [i, t] of times.entries()) expect(t, `chunk ${i + 1}`).toBeLessThan(5_000);
    expect(verifyMs).toBeLessThan(5_000);
  }, 300_000);
});
