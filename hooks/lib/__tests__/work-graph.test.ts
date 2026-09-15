/**
 * `computeWorkGraph` against a store on disk — the check the live store cannot be.
 *
 * The computation was proved once, at `0078ecc1`, against a scratch store that
 * step then deleted, so the proof survives only as prose in that commit message.
 * The live store is two nodes and no edges, which passes under several wrong
 * implementations. This fixture is the smallest store that does not: a chain
 * whose topological order is NOT its basename order, a fan-out, a two-member
 * cycle, an entry naming nothing, a `done` item carrying an outgoing entry, and
 * a `paused` item with a dependent.
 *
 * The `done` item is what the G1 ruling turns on and what the real store cannot
 * show: a terminal item is not a node, its own entries go unread, and an entry
 * naming IT dangles like any other unresolved name.
 *
 * Records are written as files rather than handed over as a graph, because the
 * head-block parse is half of what can go wrong. Every fixture record repeats
 * its field name in its body, below the closing `---`, where a scan that ran
 * past the head would read prose as an edge.
 */

import { afterAll, describe, expect, it, vi } from "vitest";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { computeWorkGraph } from "../work-graph.js";

// Every path the module reads, captured at the boundary: `archive/**` is never
// opened is a claim about what it touches, not only about what it returns.
const { opened } = vi.hoisted(() => ({ opened: [] as string[] }));
vi.mock("node:fs", async (orig) => {
  const real = await orig<typeof import("node:fs")>();
  const note = (f: any) => (p: any, ...a: any[]) => (opened.push(String(p)), f(p, ...a));
  return {
    ...real,
    existsSync: note(real.existsSync),
    readFileSync: note(real.readFileSync),
    readdirSync: note(real.readdirSync),
  };
});

/** dir -> [status, `**Depends-on:**` entries]. `null` = the field is absent. */
const FIXTURE: Record<string, [string, string[] | null]> = {
  // The chain, named so that its topological order is not its basename order.
  "260101-0002-base": ["open", null],
  "260101-0001-mid": ["open", ["260101-0002-base.md"]],
  "260101-0003-tip": ["open", ["260101-0001-mid.md"]],
  // The fan-out, off the same root.
  "260101-0004-fan-a": ["open", ["260101-0002-base.md"]],
  "260101-0005-fan-b": ["open", ["260101-0002-base.md"]],
  // The cycle, and a claimed node so the second live status is exercised.
  "260101-0006-cyc-a": ["claimed", ["260101-0007-cyc-b.md"]],
  "260101-0007-cyc-b": ["open", ["260101-0006-cyc-a.md"]],
  // An entry naming no record at all, and a duplicate of it: one dangle.
  "260101-0008-dangle": ["open", ["260101-9999-never-filed.md", "260101-9999-never-filed.md"]],
  // Terminal, and carrying an outgoing entry that must go unread.
  "260101-0009-closed": ["done", ["260101-0002-base.md"]],
  // Depends on that terminal item, which therefore resolves to nothing.
  "260101-0010-after-done": ["open", ["260101-0009-closed.md"]],
  // Paused: live, so a node, and unlike the terminal item its own entry IS
  // read. It names that terminal item, so it dangles and adds no edge.
  "260101-0013-paused": ["paused", ["260101-0009-closed.md"]],
  "260101-0014-after-paused": ["open", ["260101-0013-paused.md"]],
};

const ARCHIVED = "260101-0012-archived";

function record(dir: string, status: string, deps: string[] | null): string {
  const head = [`# ${dir}`, "", "---", `**Status:** ${status}`];
  if (deps) head.push(`**Depends-on:** ${deps.join(", ")}`);
  return [...head, "---", "", "## Context", "", `**Depends-on:** ${dir}-decoy.md`, ""].join("\n");
}

function build(): string {
  const root = mkdtempSync(join(tmpdir(), "work-graph-"));
  const circles = join(root, "fusion-workbench", "circles");
  for (const [dir, [status, deps]] of Object.entries(FIXTURE)) {
    mkdirSync(join(circles, dir), { recursive: true });
    writeFileSync(join(circles, dir, `${dir}.md`), record(dir, status, deps));
  }
  // A terminal Circle record: a container holding no record of its own name.
  mkdirSync(join(circles, "260101-0011-circle"), { recursive: true });
  writeFileSync(join(circles, "260101-0011-circle", "_c_circle.md"), "# a closed Circle\n");
  // A live item that is a node in every respect except that it is archived.
  const arch = join(root, "fusion-workbench", "archive", "circles", ARCHIVED);
  mkdirSync(arch, { recursive: true });
  writeFileSync(join(arch, `${ARCHIVED}.md`), record(ARCHIVED, "open", null));
  return root;
}

const root = build();
const report = computeWorkGraph(root);
afterAll(() => rmSync(root, { recursive: true, force: true }));

/** In printed order: dir, depth, transitive blocks, readiness. */
const EXPECTED: [string, number, number, string][] = [
  ["260101-0002-base", 0, 4, "ready"],
  ["260101-0001-mid", 1, 1, "blocked"],
  ["260101-0003-tip", 2, 0, "blocked"],
  ["260101-0004-fan-a", 1, 0, "blocked"],
  ["260101-0005-fan-b", 1, 0, "blocked"],
  ["260101-0006-cyc-a", 0, 1, "blocked"],
  ["260101-0007-cyc-b", 0, 1, "blocked"],
  ["260101-0008-dangle", 0, 0, "ready"],
  ["260101-0010-after-done", 0, 0, "ready"],
  ["260101-0013-paused", 0, 1, "paused"],
  ["260101-0014-after-paused", 1, 0, "blocked"],
];

describe("computeWorkGraph over a fixture store", () => {
  it("reports the order, the depth, the blocking count and the readiness", () => {
    expect(report.rows.map((r) => [r.dir, r.depth, r.blocks, r.readiness])).toEqual(EXPECTED);
    expect(report.rows.map((r) => r.order)).toEqual(EXPECTED.map((_, i) => i + 1));
    // `mid` sorts first and is emitted second: the order is the graph's, not the name's.
    expect(report.items).toBe(11);
    expect(report.edges).toBe(7);
    expect(report.noDependsOnField).toBe(1);
    expect(report.verdict).toBe("cyclic");
  });

  it("names the cycle's members and keeps them consecutive", () => {
    expect(report.cycles).toEqual([{ members: ["260101-0006-cyc-a", "260101-0007-cyc-b"] }]);
    expect(report.rows[5].dir).toBe("260101-0006-cyc-a");
    expect(report.rows[6].dir).toBe("260101-0007-cyc-b");
  });

  it("reports an entry naming no node once, by name, and leaves the dependent ready", () => {
    expect(report.unresolvedEdges).toEqual([
      { from: "260101-0008-dangle", entry: "260101-9999-never-filed.md" },
      { from: "260101-0010-after-done", entry: "260101-0009-closed.md" },
      { from: "260101-0013-paused", entry: "260101-0009-closed.md" },
    ]);
    // `after-paused` is absent above, and that absence is the case: a paused
    // item is a NODE, so the entry naming it resolves. Before it joined the
    // node set that entry dangled and its dependent printed `ready` — a false
    // invitation on the one figure a reader picks work off.
  });

  it("puts a terminal item outside the graph, its outgoing entry unread", () => {
    expect(report.rows.map((r) => r.dir)).not.toContain("260101-0009-closed");
    // `closed` names `base` as a prerequisite. If that entry were read, `base`
    // would block five items rather than four and the edge count would be eight.
    expect(report.rows[0].blocks).toBe(4);
    expect(report.rows.find((r) => r.dir === "260101-0006-cyc-a")?.status).toBe("claimed");
  });

  it("opens no path under archive/, and the item archived there is not a node", () => {
    expect(report.rows.map((r) => r.dir)).not.toContain(ARCHIVED);
    expect(opened.filter((p) => p.includes("archive"))).toEqual([]);
    expect(opened.length).toBeGreaterThan(0);
  });

  it("returns an equal report on a second run over the unchanged store", () => {
    expect(JSON.stringify(computeWorkGraph(root))).toBe(JSON.stringify(report));
  });
});
