import { describe, expect, it } from "vitest";
import { spawnSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, renameSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { ask, type Ask } from "../record-client.js";
import { abandon, beginFence, finalize, inventoryPath, move, moveUnit, planMove, readInventory, resume, survey, surveyOutcome, type Inventory, type Options, type Outcome } from "../record-archive.js";
import { parseFlags, write } from "../record-write.js";
import { CASE_TIMEOUT, REPO_ROOT } from "./helpers/guard-harness.js";
import { BUNDLE, must as sent } from "./helpers/json-workbench.js";

// ---------------------------------------------------------------------------
// The host's archive move, against the real bundle over a copy of the
// recorded archive session's `base/` (its README names every record). The
// plan step's note records the cases red against copies without the fixed
// point, without the container inheritance, and with verification skipped.
// ---------------------------------------------------------------------------

const real: Ask = (w, r) => ask(w, r, { bundle: BUNDLE });
const O: Options = { ask: real, contract: resolve(REPO_ROOT, "codec", "contract", "transitions.json") };
const INTO = "261001-1200-sweep";
const [A, B, C, T, I, F] = ["260920-1000-chain-head-open", "260919-1000-chain-middle", "260918-1000-chain-tail-legacy", "260917-1000-terminal-issue", "260921-1000-incoming-reference", "260916-1000-failed-move-unit"].map((s) => `shared/issues/${s}.record.json`);
const [P, D, D2] = ["260922-0900-open-package", "260915-0900-done-package", "260914-0900-second-done-package"].map((s) => `work-packages/${s}`);
const D_ISSUE = `${D}/issues/260915-1000-done-package-issue.record.json`;
const ID = (n: number) => `a4c1e0${String(n).padStart(2, "0")}-0000-4000-8000-${String(n).padStart(12, "0")}`;

function withBase(fn: (wb: string, root: string) => void): void {
  const root = realpathSync(mkdtempSync(join(tmpdir(), "fusion-archive-")));
  const wb = join(root, "fusion-workbench");
  cpSync(resolve(REPO_ROOT, "codec", "fixtures", "protocol-session-archive", "base"), wb, { recursive: true });
  writeFileSync(join(wb, ".fusion-setup"), "{}\n");
  try {
    fn(wb, root);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}
const must = (wb: string, r: { op: string; [k: string]: unknown }): Record<string, any> => sent({ root: dirname(wb), workbench: wb, next: 1 }, r).result;
const put = (wb: string, rel: string, body: string) => (mkdirSync(dirname(join(wb, rel)), { recursive: true }), writeFileSync(join(wb, rel), body), rel);
/** An open package referring to `refs` by id: a remaining record that binds them. */
const referring = (wb: string, stem: string, ...ids: string[]) => must(wb, { op: "create", operation_id: randomUUID(), id: randomUUID(), kind: "package", filed_by: { actor: "user", person: null }, origin: { kind: "user-request", ref: null }, scope: { container: null, store: "work-packages" }, narrative: { path: `work-packages/${stem}/${stem}.md`, content: `# ${stem}\n` }, payload: { domain: "code", references: ids.map((record_id) => ({ workbench_id: "a4c1be00-0000-4000-8000-000000000000", record_id })) } });
const surveyed = (wb: string, lines: string[]): Outcome => {
  const s = survey(wb, lines, O);
  return "stop" in s ? s.stop : surveyOutcome(s.survey);
};
const moved = (wb: string, lines: string[], o: Options = O): Outcome => move(wb, surveyed(wb, lines).lines.join("\n"), INTO, o);
/** `candidate=`/`moved=` sources, and `held=` as source -> [why, path, at, target]. */
const read = (o: Outcome) => ({ kept: o.lines.filter((l) => /^(candidate|moved)=/.test(l)).map((l) => l.split("\t")[1]), held: Object.fromEntries(o.lines.filter((l) => l.startsWith("held=")).map((l) => l.split("\t")).map(([, s, ...why]) => [s, why])), refused: o.lines.filter((l) => l.startsWith("refused=")).map((l) => l.slice(8).split("\t")[0]) });
const fence = (wb: string) => must(wb, { op: "inspect" }).maintenance;
const at = (wb: string, rel: string) => existsSync(join(wb, rel));
const inv = (wb: string): Inventory => (readInventory(join(wb, inventoryPath(INTO))) as { inventory: Inventory }).inventory;
/** A move stopped after its first unit, as a crash leaves it: inventory, fence, recheck, one unit. */
function crashAfterFirst(wb: string): Inventory {
  const p = planMove(wb, surveyed(wb, [F, D2]).lines.join("\n"), INTO, O);
  if ("stop" in p) throw new Error(p.stop.detail);
  expect([beginFence(wb, p.inventory, O), "lines" in finalize(wb, p.inventory, p.digest, O)]).toEqual([null, true]);
  moveUnit(wb, p.inventory, p.inventory.units[0]);
  return p.inventory;
}

describe("survey: which units may leave", () => {
  it("the chain is held over two rounds, the incoming reference holds T, live records are held, and a line naming no unit is refused", () => withBase((wb) => {
    symlinkSync("../archive/migrations", join(wb, "shared", "old"));
    put(wb, `archive/260925-0900-sweep/${B}`, readFileSync(join(wb, B), "utf-8")); // an older copy of B, only in archive/
    const o = read(surveyed(wb, [B, C, T, F, P, D, `${D2}/`, A.replace(".record.json", ".md"), "archive/x", D_ISSUE, "shared/old/migration-20260918-session", "shared/nope.md"]));
    expect(o.kept).toEqual([F, D, D2]);
    expect(o.held).toEqual({ [B]: ["binding", A, "/references/0", B], [C]: ["binding", B, "/references/0", C], [T]: ["binding", I, "/references/0", T], [P]: ["live", `${P}/package.json`, "-", "open"], [A]: ["live", A, "-", "open"] });
    expect(o.refused).toEqual(["archive/x", D_ISSUE, "shared/old/migration-20260918-session", "shared/nope.md"]);
  }));

  it("a container inherits a descendant's hold, an ambiguous id holds every unit carrying it, and an unreadable record holds everything", () => withBase((wb) => {
    const copy = "shared/issues/260916-1001-failed-move-copy";
    put(wb, `${copy}.md`, readFileSync(join(wb, F.replace(".record.json", ".md")), "utf-8"));
    put(wb, `${copy}.record.json`, readFileSync(join(wb, F), "utf-8").replace(F.replace(".record.json", ".md"), `${copy}.md`));
    referring(wb, "261001-0900-q", ID(13), ID(6));
    const q = "work-packages/261001-0900-q/package.json";
    expect(read(surveyed(wb, [D, F, `${copy}.record.json`, D2])).held).toEqual({ [D]: ["binding", q, "/references/0", D_ISSUE], [F]: ["binding", q, "/references/1", ID(6)], [`${copy}.record.json`]: ["binding", q, "/references/1", ID(6)] });
    put(wb, "shared/issues/260930-0000-broken.record.json", "{}\n");
    const all = surveyed(wb, [D2]);
    expect([all.kind, read(all).held[D2].slice(0, 2)]).toEqual(["nothing", ["unreadable", "shared/issues/260930-0000-broken.record.json"]]);
  }));
});

describe("move: fence, recheck, move, verify, end", () => {
  it("the eligible units leave whole to the same paths under archive/, and the store reads clean without them", () => withBase((wb) => {
    const o = moved(wb, [T, I, F, D, D2]);
    expect([o.kind, read(o).kept, o.lines.at(-1)]).toEqual(["done", [T, I, F, D, D2], "result=moved"]);
    expect([D, T, `${D2}/reviews/260914-1500-review.evidence.json`].map((p) => [at(wb, p), at(wb, `archive/${INTO}/${p}`)])).toEqual(Array(3).fill([false, true]));
    expect(must(wb, { op: "list" }).records.map((r: { path: string }) => r.path).filter((p: string) => [T, I, F, D, D2].some((u) => p.startsWith(u)))).toEqual([]);
    const rec = must(wb, { op: "reconcile" });
    expect([must(wb, { op: "validate" }).valid, rec.records, rec.references.filter((r: { status: string }) => r.status !== "resolved"), fence(wb), inv(wb).outcome]).toEqual([true, [], [], null, "moved"]);
  }));

  it("an evidence group in shared/ moves whole, and a binding to one of its records holds it whole", () => withBase((wb, root) => {
    for (const a of [["init", "-q"], ["-c", "user.email=s@x", "-c", "user.name=S", "commit", "-q", "--allow-empty", "-m", "b"]]) spawnSync("git", a, { cwd: root, env: { ...process.env, GIT_CONFIG_GLOBAL: "/dev/null", GIT_CONFIG_SYSTEM: "/dev/null" } });
    const ev = (n: string) => {
      const call = parseFlags("evidence", ["--record", `${P}/package.json`, "--report", put(wb, `shared/reviews/261001-100${n}-r.md`, `# ${n}\n`), "--verdict", "accept", "--actor", "reviewer"]);
      const o = write({ ...(call as { call: any }).call, workbench: wb, identity: { checkout: "5e8248d7" }, roleVersion: "12.0.0" }, real);
      return Object.keys((o as { revisions: Record<string, string> }).revisions)[0];
    };
    const [e1, e2] = [ev("1"), ev("2")];
    referring(wb, "261001-0902-binds", JSON.parse(readFileSync(join(wb, e2), "utf-8")).id);
    const sv = surveyed(wb, [e1, "shared/reviews/261001-1002-r.md"]);
    expect([read(move(wb, sv.lines.join("\n"), INTO, O)).kept, read(sv).held["shared/reviews/261001-1002-r.md"], [e1, "shared/reviews/261001-1001-r.md", e2].map((p) => at(wb, p))]).toEqual([["shared/reviews/261001-1001-r.md"], ["binding", "work-packages/261001-0902-binds/package.json", "/references/0", e2], [false, false, true]]);
  }));

  it("a write between survey and fence is caught by the recheck, and a taken destination refuses its unit; the fence ends with nothing moved", () => withBase((wb) => {
    const s = surveyed(wb, [F, D2]).lines.join("\n");
    referring(wb, "261001-0901-late", ID(6));
    put(wb, `archive/${INTO}/${D2}/x.md`, "taken\n");
    const o = move(wb, s, INTO, O);
    expect([o.kind, o.lines.find((l) => l.startsWith("store=")), read(o).held[F].slice(0, 3), read(o).held[D2][0], at(wb, F), fence(wb), inv(wb).outcome]).toEqual(["nothing", "store=changed", ["binding", "work-packages/261001-0901-late/package.json", "/references/0"], "collision", true, null, "nothing"]);
  }));

  it("verification catches a narrative left behind, which validate and reconcile cannot see, and the move is restored", () => withBase((wb) => {
    const lossy = { rename: (from: string, to: string) => (from.endsWith(".md") ? undefined : renameSync(from, to)) };
    const o = moved(wb, [F], { ...O, io: lossy });
    expect([o.kind, o.detail, at(wb, F), at(wb, `archive/${INTO}/${F}`), fence(wb), inv(wb).outcome]).toEqual(["restored", expect.stringContaining("is still at its source"), true, false, null, "restored"]);
  }));
});

describe("recovery: resume and abandon", () => {
  it("a crash after the first unit: abandon is refused, and resume finishes the move and ends the fence", () => withBase((wb) => {
    const file = join(wb, inventoryPath(crashAfterFirst(wb).into));
    expect([abandon(wb, file, O).kind, fence(wb) !== null]).toEqual(["fence", true]);
    const o = resume(wb, file, O);
    expect([o.kind, read(o).kept, at(wb, D2), fence(wb), inv(wb).outcome]).toEqual(["done", [F, D2], false, null, "moved"]);
  }));

  it("a crash with a hash changed since: resume puts the first unit back and ends the fence", () => withBase((wb) => {
    const file = join(wb, inventoryPath(crashAfterFirst(wb).into));
    writeFileSync(join(wb, D2, "260914-0900-second-done-package.md"), "edited by hand\n");
    const o = resume(wb, file, O);
    expect([o.kind, o.detail, at(wb, F), at(wb, `archive/${INTO}/${F}`), fence(wb)]).toEqual(["restored", expect.stringContaining("does not hash"), true, false, null]);
  }));

  it("a crash between inventory and begin, and one after begin with nothing moved, are each closed by abandon", () => withBase((wb) => {
    const plan = (into: string) => planMove(wb, surveyed(wb, [F]).lines.join("\n"), into, O) as { inventory: Inventory };
    const before = plan(INTO);
    expect([abandon(wb, join(wb, inventoryPath(INTO)), O).lines.at(-1), fence(wb)]).toEqual(["result=abandoned", null]);
    const after = plan("261001-1201-sweep");
    expect([before.inventory.fence !== after.inventory.fence, beginFence(wb, after.inventory, O), fence(wb).operation_id]).toEqual([true, null, after.inventory.fence]);
    expect([abandon(wb, join(wb, inventoryPath("261001-1201-sweep")), O).kind, fence(wb), at(wb, F), resume(wb, join(wb, inventoryPath(INTO)), O).kind]).toEqual(["done", null, true, "usage"]);
  }));
});

describe("bin/fusion-archive and bin/fusion-write", () => {
  it("exit by the header's table, and a write meeting the fence names resume and abandon", () => withBase((wb, root) => {
    const cli = (bin: string, cwd: string, ...a: string[]) => spawnSync(resolve(REPO_ROOT, "bin", bin), a, { cwd, encoding: "utf-8" });
    writeFileSync(join(root, "c.txt"), `# candidates\n${F}\n${P}\n`);
    const s = cli("fusion-archive", root, "survey", "--candidates", "c.txt");
    writeFileSync(join(root, "s.txt"), s.stdout);
    const runs = [s, cli("fusion-archive", root, "move", "--survey", "s.txt", "--into", "bad"), cli("fusion-archive", root, "survey"), cli("fusion-archive", tmpdir(), "survey", "--candidates", "c.txt"), cli("fusion-archive", root, "move", "--survey", "s.txt", "--into", INTO)];
    expect(runs.map((r) => r.status)).toEqual([0, 2, 2, 1, 0]);
    expect(s.stdout.split("\n").map((l) => l.split("=")[0])).toEqual(["workbench_id", "store", "candidate", "held", ""]);
    const p = planMove(wb, s.stdout.replace(F, I), "261001-1202-sweep", O) as { inventory: Inventory };
    beginFence(wb, p.inventory, O);
    const w = cli("fusion-write", root, "transition", "--record", A, "--to", "in_progress", "--reason", "r", "--actor", "user");
    expect([w.status, w.stderr]).toEqual([6, expect.stringMatching(/maintenance-active[\s\S]*fusion-archive resume[\s\S]*abandon/)]);
  }), 2 * CASE_TIMEOUT);
});
