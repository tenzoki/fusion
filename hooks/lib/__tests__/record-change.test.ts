import { describe, expect, it } from "vitest";
import { spawnSync } from "node:child_process";
import { appendFileSync, chmodSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { composeRows, logObserved, logResend, PENDING_FILE, repairRetained, type Observer, type PriorShow, type RecordChangeRow } from "../record-change.js";
import type { CodecRequest } from "../record-client.js";
import { REPO_ROOT } from "./helpers/guard-harness.js";
import { createPackage, must, withJsonProject, type JsonProject, type Package } from "./helpers/json-workbench.js";

// ---------------------------------------------------------------------------
// The record_change writer: rows from what a write observed, one line per key,
// retained when the append fails. Every answer below is the real bundle's, so
// a row is composed from an answer a session could have received. The plan
// step's note records each case red against a broken copy of the module.
// ---------------------------------------------------------------------------

const BY: Observer = { ts: "2026-09-30T10:00:00", person: "Test Person <t@example.com>", checkout: "5e8248d7", session_id: "sid-rc" };
const ACTOR = { actor: "user", person: null };
let n = 0;
const uuid = (): string => `f03c0000-0000-4000-8000-${String(++n).padStart(12, "0")}`;
const logFile = (p: JsonProject): string => resolve(p.workbench, "orchestrator-events.jsonl");
const pendingFile = (p: JsonProject): string => resolve(p.workbench, PENDING_FILE);
const lines = (file: string): RecordChangeRow[] => readFileSync(file, "utf-8").split("\n").filter((l) => l !== "").map((l) => JSON.parse(l));
const show = (p: JsonProject, path: string) => must(p, { op: "show", record: { path } }).result;

/** Send `request` as the writer does: a `show` of each named path first, then the rows of the answer it observed. */
function observe(p: JsonProject, request: CodecRequest, shown: string[] = [], by: Observer = BY): RecordChangeRow[] {
  const shows = Object.fromEntries(shown.map((path) => [path, show(p, path) as unknown as PriorShow]));
  const { result, revisions } = must(p, request);
  return composeRows({ request, workbenchId: String(must(p, { op: "inspect" }).result.id), result, revisions, shows }, by);
}

/** A mutation of the package at the revision it stands at. */
const mutation = (p: JsonProject, pkg: Package, op: string, fields: object): CodecRequest =>
  ({ op, operation_id: uuid(), record: { path: pkg.path }, expected_revision: show(p, pkg.path).revision, actor: ACTOR, ...fields });
const claimOf = (p: JsonProject, pkg: Package): CodecRequest => mutation(p, pkg, "claim", { claim: { checkout_id: "5e8248d7", person: null, claimed_at: "2026-09-30T10:00:00Z" } });

/** The order `bin/monitor` gives the log's record_change rows: its own `_record_changes`, run over `file`. */
function monitorOrder(file: string): RecordChangeRow[] {
  const method = /\n( +def _record_changes\(self\):[\s\S]*?\n +return rows\n)/.exec(readFileSync(resolve(REPO_ROOT, "bin", "monitor"), "utf-8"))![1];
  const py = ["import json, sys, textwrap", 'RECORD_CHANGE = "record_change"', "class Tail:", "    def rows(self): return [json.loads(l) for l in open(sys.argv[1]) if l.strip()]",
    "_EVENTS_TAIL = Tail()", "exec(textwrap.dedent(sys.argv[2]))", "print(json.dumps(_record_changes(None)))"].join("\n");
  const run = spawnSync("python3", ["-c", py, file, method], { encoding: "utf-8" });
  expect(run.status, run.stderr).toBe(0);
  return JSON.parse(run.stdout);
}

describe("composing rows", () => {
  it("gives one row per record written, with ids from the request or the prior show; initialize gives none", () => {
    withJsonProject((p) => {
      const pkg = createPackage(p, "260930-1200-p");
      const plan = (stem: string): RecordChangeRow => {
        const [row] = observe(p, { op: "create", operation_id: uuid(), id: uuid(), kind: "plan", filed_by: ACTOR, origin: { kind: "user-request", ref: null },
          scope: { container: pkg.dir, store: "plans" }, narrative: { path: `${pkg.dir}/plans/${stem}.md`, content: `# ${stem}\n` }, payload: { state: "open", steps: [], criteria: [], acceptance: null } });
        expect(row.change).toEqual({ created: "open" });
        return row;
      };
      const adopt = (doc: RecordChangeRow) => observe(p, mutation(p, pkg, "adopt-plan", { plan: { workbench_id: doc.workbench_id, record_id: doc.record_id }, revision: (show(p, doc.path).narrative as { sha256: string }).sha256 }), [pkg.path]);
      const [a, b] = [plan("260930-1201-a"), plan("260930-1202-b")];
      const brief = (rows: RecordChangeRow[]) => rows.map((r) => [r.record_id, r.kind, r.change]);
      expect(brief(adopt(a))).toEqual([[a.record_id, "plan", { adopted_as: "plan" }], [pkg.id, "package", { adopted: "plan" }]]);
      const second = adopt(b);
      expect(brief(second)).toEqual([[b.record_id, "plan", { adopted_as: "plan" }], [a.record_id, "plan", { replaced_by: b.record_id }], [pkg.id, "package", { adopted: "plan" }]]);
      expect(new Set(second.map((r) => r.operation_id)).size).toBe(1);

      const bare = { workbenchId: "w", result: {}, shows: {} };
      expect(composeRows({ ...bare, request: { op: "create", operation_id: "o", id: pkg.id, kind: "package" }, revisions: { [pkg.path]: "r" } }, BY)[0].change).toEqual({ created: show(p, pkg.path).control.status });
      expect(composeRows({ ...bare, request: { op: "initialize", operation_id: "o" }, revisions: { "workbench.json": "r" } }, BY)).toEqual([]);
      expect([logObserved(p.workbench, []), logResend(p.workbench, "initialize", "w", "o", { "workbench.json": "r" })]).toEqual([{ event: "none" }, { event: "none" }]);
      expect(existsSync(logFile(p))).toBe(false);
    });
  });

  it("leaves an unread identity half and an unset session out, never null", () => {
    withJsonProject((p) => {
      const pkg = createPackage(p, "260930-1200-p");
      const [row] = observe(p, claimOf(p, pkg), [pkg.path], { ts: BY.ts, checkout: "5e8248d7" });
      expect(Object.keys(row)).toEqual(["ts", "event", "host", "op", "operation_id", "workbench_id", "record_id", "path", "kind", "revision", "change", "checkout"]);
      expect(row).toMatchObject({ host: "claude", op: "claim", record_id: pkg.id, kind: "package", change: { from: "open", to: "claimed" } });
    });
  });
});

describe("appending by key", () => {
  it("duplicate delivery: the same rows twice, after a torn line, give one line each", () => {
    withJsonProject((p) => {
      const pkg = createPackage(p, "260930-1200-p");
      const rows = observe(p, claimOf(p, pkg), [pkg.path]);
      const torn = '{"ts":"2026-09-30T09:00:00","event":"task_st';
      writeFileSync(logFile(p), torn);
      expect([logObserved(p.workbench, rows), logObserved(p.workbench, [...rows, ...rows])]).toEqual([{ event: "logged" }, { event: "logged" }]);
      expect(readFileSync(logFile(p), "utf-8")).toBe(`${torn}\n${JSON.stringify(rows[0])}\n`);
    });
  });

  it("a failed append retains the rows as they were, reports pending, and resends nothing", () => {
    withJsonProject((p) => {
      const pkg = createPackage(p, "260930-1200-p");
      const rows = observe(p, claimOf(p, pkg), [pkg.path]);
      writeFileSync(logFile(p), "");
      chmodSync(logFile(p), 0o444);
      expect(logObserved(p.workbench, rows)).toMatchObject({ event: "pending" });
      expect([lines(pendingFile(p)), readFileSync(logFile(p), "utf-8"), show(p, pkg.path).revision]).toEqual([rows, "", rows[0].revision]);
      expect(logResend(p.workbench, "claim", rows[0].workbench_id, rows[0].operation_id, { [pkg.path]: rows[0].revision }).event).toBe("pending");
    });
  });

  it("delayed logging: a retained row lands after a later one with its own ts, a torn retained line stays, and the monitor's stable sort places it and leaves out a row whose ts is no stamp", () => {
    withJsonProject((p) => {
      const pkg = createPackage(p, "260930-1200-p");
      const early = observe(p, claimOf(p, pkg), [pkg.path]);
      writeFileSync(logFile(p), "");
      chmodSync(logFile(p), 0o444);
      logObserved(p.workbench, early);
      chmodSync(logFile(p), 0o644); appendFileSync(pendingFile(p), '{"ts":"torn');
      const late = observe(p, mutation(p, pkg, "release", { reason: "set aside" }), [pkg.path], { ...BY, ts: "2026-09-30T10:05:00" });
      expect(logObserved(p.workbench, late)).toEqual({ event: "logged" });
      expect([repairRetained(p.workbench), readFileSync(pendingFile(p), "utf-8")]).toEqual([{ appended: 1, retained: 0, detail: expect.stringContaining("1 line(s)") }, '{"ts":"torn']);
      expect(lines(logFile(p)).map((r) => [r.ts, r.change.to])).toEqual([["2026-09-30T10:05:00", "open"], ["2026-09-30T10:00:00", "claimed"]]);
      appendFileSync(logFile(p), `${JSON.stringify({ ts: 5, event: "record_change", change: { to: "stampless" } })}\n`);
      expect(monitorOrder(logFile(p)).map((r) => r.change.to)).toEqual(["claimed", "open"]);
    });
  });

  it("a re-send writes no fresh row: unlogged with nothing retained, the retained row once it is", () => {
    withJsonProject((p) => {
      const pkg = createPackage(p, "260930-1200-p");
      const request = claimOf(p, pkg);
      const [row] = observe(p, request, [pkg.path]);
      const resend = () => logResend(p.workbench, "claim", row.workbench_id, row.operation_id, must(p, request).revisions);
      expect(resend()).toMatchObject({ event: "unlogged" });
      expect(existsSync(logFile(p))).toBe(false);
      mkdirSync(dirname(pendingFile(p)), { recursive: true });
      writeFileSync(pendingFile(p), `${JSON.stringify(row)}\n`);
      expect([resend(), resend(), lines(logFile(p)), existsSync(pendingFile(p))]).toEqual([{ event: "logged" }, { event: "logged" }, [row], false]);
    });
  });
});
