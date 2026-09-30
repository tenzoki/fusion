import { describe, expect, it } from "vitest";
import { orderOf, readWorkGraph, type OrderInput } from "../work-graph.js";
import type { Answer, Ask } from "../record-client.js";

// `orderOf` over the smallest input several wrong implementations fail on: a chain whose order is
// not its name order, a fan-out, a two-member cycle, a self-edge, a paused node with a dependent, an
// unmet row on a terminal target, an unresolved entry, an unreadable row. Then `readWorkGraph`
// through an injected `ask`, for the answers the real bundle is not made to give: the result-level
// blocked recovery of Prior's `## C.` beside the typed refusals, and each row of the placement table.

const d = (n: number, s: string) => `260101-${String(n).padStart(4, "0")}-${s}`;
const [base, mid, tip, fanA, fanB, cycA, cycB, dangle, closed, paused, afterPaused, twice, self, waits, garbage] =
  ["base", "mid", "tip", "fan-a", "fan-b", "cyc-a", "cyc-b", "dangle", "closed", "paused", "after-paused", "twice", "self", "waits", "garbage"].map((s, i) => d([2, 1, 3, 4, 5, 6, 7, 8, 9, 13, 14, 15, 16, 17, 18][i], s));
const open = (dir: string, status: "open" | "claimed" | "paused" = "open") => ({ dir, status });
const INPUT: OrderInput = {
  nodes: [base, mid, tip, fanA, fanB, cycB, dangle, afterPaused, twice, self, waits].map((n) => open(n)).concat(open(cycA, "claimed"), open(paused, "paused")),
  edges: [[mid, base], [tip, mid], [fanA, base], [fanB, base], [cycA, cycB], [cycB, cycA], [afterPaused, paused], [twice, base], [twice, base], [self, self]].map(([from, to]) => ({ from, to })),
  unmet: [{ from: waits, to: closed, condition: "succeeded", detail: "succeeded: the target is dropped, not done" }],
  unresolved: [{ from: dangle, target: "f03a0000-0000-4000-8000-999999999999", reason: "unresolved-reference/record-not-found" }],
  unreadable: [{ dir: garbage, problem: { class: "schema-invalid", reason: "conflict-markers" } }],
  noDependsOnField: 2,
};
const report = orderOf(INPUT);

describe("orderOf", () => {
  it("reports the order, the depth, the blocking count and the readiness", () => {
    expect(report.rows.map((r) => [r.dir, r.depth, r.blocks, r.readiness])).toEqual([
      [base, 0, 5, "ready"], [mid, 1, 1, "blocked"], [tip, 2, 0, "blocked"], [fanA, 1, 0, "blocked"], [fanB, 1, 0, "blocked"],
      [cycA, 0, 1, "blocked"], [cycB, 0, 1, "blocked"], [dangle, 0, 0, "ready"], [paused, 0, 1, "paused"], [afterPaused, 1, 0, "blocked"],
      [twice, 1, 0, "blocked"], [self, 0, 0, "blocked"], [waits, 0, 0, "blocked"],
    ]);
    expect(report.rows.map((r) => r.order)).toEqual(report.rows.map((_, i) => i + 1));
    // `twice` adds one edge, not two; `self` adds one. Without the pair set: 10.
    expect([report.items, report.edges, report.noDependsOnField, report.verdict]).toEqual([13, 9, 2, "cyclic"]);
    expect(report.rows.find((r) => r.dir === cycA)?.status).toBe("claimed");
  });

  it("names each cycle's members, consecutive in the rows", () => {
    expect(report.cycles).toEqual([{ members: [cycA, cycB] }, { members: [self] }]);
    expect(report.rows.slice(5, 7).map((r) => r.dir)).toEqual([cycA, cycB]);
  });

  it("blocks a dependent on an unmet row without making the terminal target a node", () => {
    // `waits` has no resolved edge and is not ready; `closed` is on no row, and depth stays 0:
    // the graph still measures unfinished work only.
    expect(report.rows.map((r) => r.dir)).not.toContain(closed);
    expect(report.unmetEdges).toEqual(INPUT.unmet);
    expect(report.unresolvedEdges).toEqual(INPUT.unresolved);
    expect([report.unreadable, report.unreadableHead]).toEqual([INPUT.unreadable, 1]);
  });

  it("is pure: an equal input gives an equal report, an empty one verdict=empty, and an edge off the node set throws", () => {
    expect(JSON.stringify(orderOf({ ...INPUT, nodes: [...INPUT.nodes].reverse() }))).toBe(JSON.stringify(report));
    expect(orderOf({ nodes: [], edges: [], unmet: [], unresolved: [], unreadable: [], noDependsOnField: 0 })).toMatchObject({ items: 0, verdict: "empty" });
    expect(() => orderOf({ ...INPUT, edges: [{ from: base, to: closed }] })).toThrow(closed);
  });
});

describe("readWorkGraph through an injected ask", () => {
  const ID = "0b1d5f4a-6c1e-4d9a-9f2a-1e0c3b6d8a7f";
  const path = (dir: string) => `work-packages/${dir}/package.json`;
  const result = (result: unknown): Answer => ({ kind: "result", result, revisions: {} });
  const inspect = result({ state: "json-control", id: ID });
  const row = (dir: string, id: string, status = "open") => ({ path: path(dir), kind: "package", id, status, revision: "r" });
  const edge = (dir: string, target: string, status: "satisfied" | "unmet", more: Record<string, unknown> = {}) => ({ path: path(dir), at: "/depends_on/0", target, condition: "terminal", status, ...more });
  const unmet = (dir: string, target: string, detail = "terminal: the target is open, not done or dropped") => edge(dir, target, "unmet", { class: "conflict", reason: "dependency-unmet", detail });
  const blocked = { class: "operation-unknown", reason: "recovery-blocked", detail: "operation x is pending" };
  const reconciled = (dependencies: unknown[], records: unknown[] = []) => result({ state: "json-control", intents: [], records, references: [], evidence: [], dependencies, narratives: [] });

  /** An ask answering from `byOp`, counting the calls per op. */
  function asking(byOp: Record<string, Answer>): { ask: Ask; calls: Record<string, number> } {
    const calls: Record<string, number> = {};
    return { calls, ask: (_wb, req) => (calls[req.op] = (calls[req.op] ?? 0) + 1, byOp[req.op]) };
  }

  it("stops on a blocked recovery reported inside an ok: true reconcile answer, as the refusal it is", () => {
    // Prior's `## C.`: the findings are read before the dependencies, and a blocked package
    // ends the read with a named failure and no report, however clean the edges look.
    const list = result({ records: [row(base, "1"), row(mid, "2")] });
    const { ask } = asking({ inspect, list, reconcile: reconciled([unmet(mid, "1")], [{ path: path(base), ...blocked }]) });
    expect(readWorkGraph("/wb", ask)).toEqual({ kind: "failed", cause: "refused", op: "reconcile", refusal: blocked });
    // The same finding as a `list` problem row, and as the reason on an edge entry.
    expect(readWorkGraph("/wb", asking({ inspect, list: result({ records: [row(base, "1"), { path: path(mid), problem: blocked }] }), reconcile: reconciled([]) }).ask)).toMatchObject({ kind: "failed", cause: "refused", op: "list" });
    expect(readWorkGraph("/wb", asking({ inspect, list, reconcile: reconciled([edge(mid, "1", "unmet", blocked)]) }).ask)).toMatchObject({ kind: "failed", cause: "refused", op: "reconcile", refusal: blocked });
  });

  it("hands a typed refusal, an unanswered call and a refused gate on as what they are, never as an empty store", () => {
    const list = result({ records: [row(base, "1")] });
    const refused: Answer = { kind: "refused", class: "conflict", reason: "lock-timeout", detail: "held by 1234" };
    expect(readWorkGraph("/wb", asking({ inspect, list, reconcile: refused }).ask)).toEqual({ kind: "failed", cause: "refused", op: "reconcile", refusal: { class: "conflict", reason: "lock-timeout", detail: "held by 1234" } });
    expect(readWorkGraph("/wb", asking({ inspect, list: { kind: "unanswered", cause: "timeout", detail: "stopped" } }).ask)).toEqual({ kind: "failed", cause: "unanswered", op: "list", how: "timeout", detail: "stopped" });
    expect(readWorkGraph("/wb", asking({ inspect: result({ state: "legacy" }) }).ask)).toEqual({ kind: "failed", cause: "legacy" });
  });

  it("places each edge entry by the table, and judges every package row by the codec's findings", () => {
    const list = result({ records: [row(base, "1"), row(mid, "2"), row(closed, "3", "dropped"), row(tip, "4", "open"), row(garbage, "5", "garbage"), row(fanA, "6"), row(fanB, "7")] });
    const { ask, calls } = asking({
      inspect, list,
      reconcile: reconciled(
        [unmet(mid, "1"), edge(base, "3", "satisfied"), { ...unmet(tip, "3", "succeeded: the target is dropped, not done"), condition: "succeeded" }, unmet(fanA, "6"), edge(closed, "1", "unmet", { reason: "x" }),
          edge(mid, "9", "unmet", { class: "unresolved-reference", reason: "record-not-found" }), unmet(fanB, "6"), { status: "cycle", ids: [] }],
        [{ path: path(fanA), class: "schema-invalid", reason: "schema", detail: "bad" }, { path: path(closed), class: "unresolved-reference", reason: "narrative-missing", detail: "" }],
      ),
    });
    const read = readWorkGraph("/wb", ask);
    expect(read.kind).toBe("report");
    if (read.kind !== "report") return;
    // `base` under `terminal` on the dropped target: satisfied, no edge, no row. `tip` under
    // `succeeded` on it: an unmet row. `fanA` and `closed` are reported against, so both are
    // unreadable, and `fanB`, whose only prerequisite is `fanA`, is blocked by the codec's `unmet`.
    expect(read.report.rows.map((r) => [r.dir, r.readiness])).toEqual([[base, "ready"], [mid, "blocked"], [tip, "blocked"], [fanB, "blocked"]]);
    expect(read.report.unmetEdges.map((u) => [u.from, u.to, u.condition])).toEqual([[tip, closed, "succeeded"], [fanB, fanA, "terminal"]]);
    expect(read.report.unresolvedEdges).toEqual([{ from: mid, target: "9", reason: "unresolved-reference/record-not-found" }]);
    expect(read.report.unreadable.map((u) => [u.dir, u.problem.reason])).toEqual([[fanA, "schema"], [closed, "narrative-missing"], [garbage, "status-unreadable"]]);
    expect([read.report.edges, read.report.noDependsOnField]).toEqual([1, 0]);
    expect(calls).toEqual({ inspect: 1, list: 1, reconcile: 1 });
    // No live node: the report is empty, and a terminal row reported against is still named.
    const none = asking({ inspect, list: result({ records: [row(closed, "3", "dropped")] }), reconcile: reconciled([], [{ path: path(closed), class: "schema-invalid", reason: "schema" }]) });
    expect(readWorkGraph("/wb", none.ask)).toMatchObject({ kind: "report", report: { verdict: "empty", unreadableHead: 1 } });
  });
});
