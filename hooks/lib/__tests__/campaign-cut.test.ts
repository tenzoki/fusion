import { afterAll, describe, expect, it } from "vitest";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, realpathSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { cutAt, cutReport, deltaOf, groupsOf, proposalOf, renderCut, type CutInput } from "../campaign-cut.js";
import { insideArea } from "../campaign.js";
import { readProposal } from "../campaign-write.js";
import { buildFixture, fixture, PIPELINE_ANALYSIS, type FixtureEntry } from "./helpers/campaign-fixture.js";
import { pluginRoot } from "./helpers/citation-scan.js";
import { CASE_TIMEOUT } from "./helpers/guard-harness.js";
import { withJsonProject, type JsonProject } from "./helpers/json-workbench.js";

// Drives the real `bin/fusion-campaign cut` over workbenches the kernel wrote out of the measured case of plan step 6
// (`helpers/campaign-fixture.ts`), the way `campaign-write.test.ts` drives the writes: every path physical, the codec
// reached through this tree's bundle, no git. Under test are the acceptance figures of plan step 15, which come from a
// simulation of rules (a) to (e) run on 2026-11-09 and not from the helper: a helper that follows the rules and misses
// one is reported and the figure is not bent.
//
// HOME is a directory of its own, because `bin/fusion-tmp` puts the proposal file under it.

const script = join(pluginRoot, "bin", "fusion-campaign");
const home = realpathSync(mkdtempSync(join(tmpdir(), "fusion-campaign-cut-home-")));
afterAll(() => rmSync(home, { recursive: true, force: true }));
const env = { ...process.env, HOME: home, GIT_CONFIG_GLOBAL: "/dev/null", GIT_CONFIG_SYSTEM: "/dev/null", GIT_CONFIG_NOSYSTEM: "1" };

interface Run {
  status: number;
  stdout: string;
  stderr: string;
  value(key: string): string | null;
  lines(key: string): string[];
  /** Container to lane number, off the `lane=` rows. */
  laneOf: Map<string, number>;
}
function run(cwd: string, ...args: string[]): Run {
  const r = spawnSync(script, args, { cwd, encoding: "utf-8", env });
  const stdout = r.stdout ?? "";
  const lines = (key: string) => stdout.split("\n").filter((l) => l.startsWith(`${key}=`)).map((l) => l.slice(key.length + 1));
  const laneOf = new Map(lines("lane").map((l) => l.split("\t")).map(([n, dir]) => [dir, Number(n)]));
  return { status: r.status ?? -1, stdout, stderr: r.stderr ?? "", lines, value: (k) => lines(k)[0] ?? null, laneOf };
}

const pipeline = fixture.packages.filter((e) => e.group === PIPELINE_ANALYSIS);
const name = (prefix: string): string => {
  const found = pipeline.map((e) => e.name).filter((n) => n.startsWith(prefix));
  if (found.length !== 1) throw new Error(`${prefix} names ${found.length} entries`);
  return found[0];
};
const under = (entries: FixtureEntry[], area: string): string[] => entries.filter((e) => e.areas.some((a) => insideArea(a, [area]))).map((e) => e.name);
const overlapping = (a: string[], b: string[]): boolean => a.some((x) => insideArea(x, b)) || b.some((x) => insideArea(x, a));

/** Two packages with overlapping declared areas never land in different lanes, and every live package stands in exactly one. */
function overlapNeverSplit(r: Run, entries: FixtureEntry[], areasOf: (e: FixtureEntry) => string[], live: string[]): void {
  expect([...r.laneOf.keys()].sort()).toEqual([...live].sort());
  const lanesSeen = r.lines("lane").map((l) => l.split("\t")[0]);
  expect(new Set(lanesSeen).size).toBe(Number(r.value("checkouts")));
  for (const a of entries) {
    for (const b of entries) {
      if (a.name < b.name && r.laneOf.has(a.name) && r.laneOf.has(b.name) && overlapping(areasOf(a), areasOf(b))) {
        expect(r.laneOf.get(a.name), `${a.name} and ${b.name} overlap`).toBe(r.laneOf.get(b.name));
      }
    }
  }
}

/** The proposal file: the whole document, and its `lanes` as `readProposal` reads them, equal to the `lane=` rows. */
function proposalMatches(r: Run): Record<string, unknown> {
  const path = r.value("proposal") as string;
  expect(path.startsWith(join(home, ".fusion-tmp"))).toBe(true);
  const document = JSON.parse(readFileSync(path, "utf-8")) as Record<string, unknown>;
  const read = readProposal(path);
  if ("detail" in read) throw new Error(read.detail);
  const byLane = new Map<number, string[]>();
  for (const l of r.lines("lane")) {
    const [n, dir] = l.split("\t");
    byLane.set(Number(n), [...(byLane.get(Number(n)) ?? []), dir]);
  }
  expect(read.lanes).toEqual([...byLane.keys()].sort((a, b) => a - b).map((n) => ({ id: `lane-${n}`, members: byLane.get(n) })));
  expect(Object.keys(document).sort()).toEqual(["bound", "checkouts", "handoffs", "imbalance", "lanes", "no_areas", "tolerance"]);
  return document;
}

/** Build the 23 pipeline entries and run the cut, twice, so the bytes are compared. */
function cutOver(p: JsonProject, options: Parameters<typeof buildFixture>[1], ...args: string[]): Run {
  buildFixture(p, { entries: pipeline, ...options });
  const first = run(p.root, "cut", ...args);
  expect(first.status, first.stderr).toBe(0);
  const second = run(p.root, "cut", ...args);
  expect(second.stdout).toBe(first.stdout);
  return first;
}

describe("bin/fusion-campaign cut over the measured case, the acceptance figures of plan step 15", () => {
  const ROUTE_FROM = name("261031-1718");
  const ROUTE_TO = name("261101-1002");
  const HEADER = name("260814-1228");
  const areas = (e: FixtureEntry): string[] => e.areas;
  const both = (e: FixtureEntry): string[] => [...e.areas, ...e.shared_areas];

  it("(1) every entry live: process, strategy/catalog and ai each in a lane of their own, the route edge a hand-off, the header package beside its one edge", () => {
    withJsonProject((p) => {
      const r = cutOver(p, { transitions: false }, "--checkouts", "3");
      expect([r.value("checkouts"), r.value("tolerance"), r.value("members"), r.value("bound")]).toEqual(["3", "1", "23", "8"]);
      const live = pipeline.map((e) => e.name);
      overlapNeverSplit(r, pipeline, areas, live);
      const laneOfAll = (names: string[]): number => {
        const lanes = new Set(names.map((n) => r.laneOf.get(n)));
        expect(lanes.size, names.join(", ")).toBe(1);
        return [...lanes][0] as number;
      };
      const [process, strategy, ai] = [laneOfAll(under(pipeline, "codebase/go/pkg/process")), laneOfAll([...under(pipeline, "codebase/go/pkg/strategy"), ...under(pipeline, "codebase/go/pkg/catalog")]), laneOfAll(under(pipeline, "codebase/go/pkg/ai"))];
      expect(new Set([process, strategy, ai]).size).toBe(3);
      expect(r.lines("handoff")).toContain([ROUTE_FROM, ROUTE_TO, process, ai].join("\t"));
      expect(r.lines("no-areas")).toContain(HEADER);
      expect([r.value("no-areas-count"), r.laneOf.get(HEADER)]).toEqual(["3", r.laneOf.get(ROUTE_FROM)]);
      expect(r.lines("handoff").filter((h) => h.startsWith(`${ROUTE_FROM}\t${HEADER}\t`))).toEqual([]);
      expect(r.lines("imbalance")).toEqual([]);
      // The lane order is the global order: prerequisites first.
      const order = r.lines("lane").map((l) => l.split("\t")[1]);
      expect(order.indexOf(ROUTE_FROM)).toBeLessThan(order.indexOf(name("261101-1001")));
      expect([r.lines("delta-plus")[0], r.lines("delta-minus")[0]]).toEqual(["checkouts\t4", "checkouts\t2"]);
      const document = proposalMatches(r);
      expect(document.handoffs).toContainEqual({ from: ROUTE_FROM, to: ROUTE_TO, from_lane: `lane-${process}`, to_lane: `lane-${ai}` });
      expect(document.no_areas).toContain(HEADER);
    });
  }, CASE_TIMEOUT * 4);

  it("(2) the states of 56c19983a, 15 live: the done route source names no hand-off, strategy/catalog shares no lane with ai, one imbalance of seven against a bound of six", () => {
    withJsonProject((p) => {
      const r = cutOver(p, {}, "--checkouts", "3");
      const live = pipeline.filter((e) => e.status !== "done" && e.status !== "dropped");
      expect([live.length, r.value("members"), r.value("bound")]).toEqual([15, "15", "5"]);
      overlapNeverSplit(r, live, areas, live.map((e) => e.name));
      expect(r.lines("handoff").filter((h) => h.split("\t").includes(ROUTE_FROM))).toEqual([]);
      const group = [...under(live, "codebase/go/pkg/strategy"), ...under(live, "codebase/go/pkg/catalog")];
      const groupLanes = new Set(group.map((n) => r.laneOf.get(n)));
      expect([group.length, groupLanes.size]).toEqual([7, 1]);
      for (const n of under(live, "codebase/go/pkg/ai")) expect(r.laneOf.get(n), n).not.toBe([...groupLanes][0]);
      expect(r.lines("imbalance")).toEqual([[[...groupLanes][0], 7, [...group].sort().join(",")].join("\t")]);
      proposalMatches(r);
    });
  }, CASE_TIMEOUT * 4);

  it("(3) every entry live with shared_areas declared too: 21 of the 23 form one group and one imbalance names it", () => {
    withJsonProject((p) => {
      const r = cutOver(p, { transitions: false, areasOf: both }, "--checkouts", "3");
      const live = pipeline.map((e) => e.name);
      overlapNeverSplit(r, pipeline, both, live);
      const rows = r.lines("imbalance").map((l) => l.split("\t"));
      expect(rows.length).toBe(1);
      const members = rows[0][2].split(",");
      expect([rows[0][1], members.length]).toEqual(["21", 21]);
      expect(live.filter((n) => !members.includes(n)).sort()).toEqual([name("260916-1447-op"), name("261020-1619")].sort());
      proposalMatches(r);
    });
  }, CASE_TIMEOUT * 4);

  it("usage: cut without --checkouts, and each malformed flag, is exit 2 with nothing on stdout", () => {
    withJsonProject((p) => {
      for (const args of [["cut"], ["cut", "--checkouts"], ["cut", "--checkouts", "0"], ["cut", "--checkouts", "x"], ["cut", "--tolerance", "1"], ["cut", "--checkouts", "3", "--tolerance", "-1"], ["cut", "--checkouts", "3", "--checkouts", "2"], ["cut", "--checkouts", "3", "--lanes", "2"]]) {
        const r = run(p.root, ...args);
        expect([r.status, r.stdout], args.join(" ")).toEqual([2, ""]);
      }
    });
  }, CASE_TIMEOUT);
});

describe("lib/campaign-cut.ts, the rules on a small input", () => {
  // a, b and c overlap by prefix at a slash boundary; d does not (`pkg/aid` is no child of `pkg/ai`); e depends on a; f and g have no areas.
  const input: CutInput = {
    nodes: [
      { dir: "a", areas: ["pkg/ai"], depth: 0 },
      { dir: "b", areas: ["pkg/ai/x.go"], depth: 0 },
      { dir: "c", areas: ["pkg/ai/y.go", "pkg/z"], depth: 0 },
      { dir: "d", areas: ["pkg/aid"], depth: 0 },
      { dir: "e", areas: ["other"], depth: 1 },
      { dir: "f", areas: [], depth: 0 },
      { dir: "g", areas: [], depth: 0 },
    ],
    edges: [{ from: "e", to: "a" }],
  };

  it("groups by overlap, orders by depth, size and name, and prefers the neighbour's lane within tolerance", () => {
    expect(groupsOf(input).map((g) => [g.members.join(","), g.depth])).toEqual([["e", 1], ["a,b,c", 0], ["d", 0], ["f", 0], ["g", 0]]);
    // N=2, bound 4, tolerance 1: e to lane 1; a,b,c to lane 1 beside its neighbour e (4 <= 5); d, f, g to lane 2.
    const two = cutAt(input, 2, 1);
    expect([two.bound, two.lanes, two.handoffs, two.noAreas, two.imbalance]).toEqual([4, [["a", "b", "c", "e"], ["d", "f", "g"]], [], ["f", "g"], []]);
    // N=3, tolerance 0, bound 3: the neighbour's lane would exceed the bound, so the group goes to the smallest lane and the edge is a hand-off from a to e; f takes the lowest of the tied lanes.
    const strict = cutAt(input, 3, 0);
    expect([strict.bound, strict.lanes, strict.handoffs, strict.imbalance]).toEqual([3, [["e", "f"], ["a", "b", "c"], ["d", "g"]], [{ from: "a", to: "e", fromLane: 2, toLane: 1 }], []]);
    // N=1: everything in one lane, no hand-off, no delta-minus.
    const one = cutReport(input, 1, 1);
    expect([one.cut.lanes.length, one.cut.handoffs, one.minus]).toEqual([1, [], null]);
    // A group larger than bound + k goes to the smallest lane and is reported.
    const tight = cutAt(input, 4, 0);
    expect(tight.imbalance).toEqual([{ lane: 2, size: 3, members: ["a", "b", "c"] }]);
  });

  it("delta: the packages whose lane number differs and the hand-offs that appear or disappear; the rendering and the proposal", () => {
    const base = cutAt(input, 2, 1);
    const other = cutAt(input, 3, 0);
    expect(deltaOf(base, other)).toEqual({ checkouts: 3, moves: [{ dir: "a", from: 1, to: 2 }, { dir: "b", from: 1, to: 2 }, { dir: "c", from: 1, to: 2 }, { dir: "d", from: 2, to: 3 }, { dir: "f", from: 2, to: 1 }, { dir: "g", from: 2, to: 3 }], appearing: [{ from: "a", to: "e" }], disappearing: [] });
    const text = renderCut({ cut: other, plus: deltaOf(other, cutAt(input, 4, 0)), minus: deltaOf(other, cutAt(input, 2, 0)) }, 7, "/tmp/p.json");
    expect(text.split("\n").slice(0, 14)).toEqual(["checkouts=3", "tolerance=0", "members=7", "bound=3", "lane=1\te", "lane=1\tf", "lane=2\ta", "lane=2\tb", "lane=2\tc", "lane=3\td", "lane=3\tg", "handoff=a\te\t2\t1", "no-areas=f", "no-areas=g"]);
    expect(text).toContain("\nno-areas-count=2\n");
    expect(text).toContain("\ndelta-plus=checkouts\t4\n");
    expect(text).toContain("\ndelta-minus=checkouts\t2\n");
    expect(text).toContain("\ndelta-minus=move\ta\t2\t1\n");
    expect(text).toContain("\ndelta-minus=handoff-disappears\ta\te\n");
    expect(text.endsWith("\nproposal=/tmp/p.json\n")).toBe(true);
    expect(proposalOf(other)).toEqual({ checkouts: 3, tolerance: 0, bound: 3, lanes: [{ id: "lane-1", members: ["e", "f"] }, { id: "lane-2", members: ["a", "b", "c"] }, { id: "lane-3", members: ["d", "g"] }], handoffs: [{ from: "a", to: "e", from_lane: "lane-2", to_lane: "lane-1" }], no_areas: ["f", "g"], imbalance: [] });
  });
});
