/**
 * The order the work-package store imposes on itself, read from JSON control
 * data through the codec, computed per run and stored nowhere.
 *
 * Two halves. `readWorkGraph` asks the codec and builds the input; `orderOf`
 * is pure and computes over it: Tarjan for the cycles, Kahn over the
 * condensation for the order, depth and the transitive blocking count, and
 * the paused override on readiness. Nothing here reads a `**Status:**` or
 * `**Depends-on:**` line, and nothing here evaluates a dependency condition:
 * `reconcile` reports every `depends_on` edge as the codec's own rule
 * evaluates it, and this module consumes that report. Step 4 of
 * `260929-1810_*_plan-fj03a-the-record-client-the-format-gate-and-scope-and-order-on-json.md`.
 *
 * Binding decision for a helper computing an order at all:
 * `260909-1808_*_may-a-helper-compute-an-order-over-work-items-after-the-portfolio-layer-goes.md`
 * (option 3): a helper may READ the store and REPORT an order, and the report
 * is a report. No agent asserts a ranking, no marker records one, the user
 * overrides the figures wherever he wants to, and the report authorises no
 * dispatch.
 *
 * ## The sequence, and what each answer of the codec means here
 *
 *   gate (`inspect`)   anything but `json-control` fails the read by name:
 *                      `legacy`, `unsupported`, `refused`, `unanswered`.
 *                      None of them is an empty store.
 *   `list`             every control file, without a scope, as `lib/scope.ts`
 *                      sends it (a scoped `list` is refused where the container
 *                      store does not exist yet). The package rows of the
 *                      container store are read: a live `status` (`open`,
 *                      `claimed`, `paused`) is a node, a terminal one (`done`,
 *                      `dropped`) is remembered as a target and is no node, and
 *                      a row that is a `problem`, names no id or carries a
 *                      status outside the five is `unreadable`, named and
 *                      outside the graph. A `problem` whose reason is
 *                      `recovery-blocked` is the refusal it is and ends the
 *                      read. No live node: the report is empty and `reconcile`
 *                      is not asked.
 *   `reconcile`        without a scope, for the same reason. Its `records`
 *                      findings are read BEFORE its `dependencies`: a finding
 *                      whose reason is `recovery-blocked` against any package
 *                      ends the read with a named failure and no report,
 *                      wherever the protocol put it (Prior's review of the
 *                      FJ03a plan, `## C.`); any other finding against a live
 *                      node moves that node to `unreadable`, because a record
 *                      the codec reports against contributes no edge it has
 *                      decided, and this reader cannot tell from outside which
 *                      findings withheld the edges. Then each `dependencies`
 *                      entry of a live node is placed by the table below.
 *
 * ## The table one edge entry falls in, and it is disjoint and complete
 *
 *   entry                             target's row      input to `orderOf`
 *   `satisfied`                       any               no edge, no row
 *   `unmet`, reason `dependency-unmet`  a live node       a resolved edge
 *   `unmet`, reason `dependency-unmet`  a terminal package  an `unmet` row: the
 *                                                       dependent is blocked
 *   `unmet`, reason `dependency-unmet`  no listed package  `unresolved`, reason
 *                                                       `target-unlisted` or
 *                                                       `target-unreadable`
 *   `unmet`, any other reason         none, or no package  `unresolved`, the
 *                                                       dependent's readiness
 *                                                       untouched
 *
 * A dependency on a terminal package under `condition: terminal` is
 * `satisfied` and prints no row, where the Markdown reader printed
 * `unresolved=` because it could not tell a terminal target from a missing
 * one. A dependency on a dropped package under `succeeded` is `unmet` with the
 * codec's reason and blocks the dependent without adding a node: the target
 * is terminal and the graph spans live packages only (the G1 ruling,
 * `260908-2018_*_is-a-closed-prerequisite-a-satisfied-edge-or-no-edge-and-what-is-an-archived-one.md`),
 * so `depth` and `blocks` still measure unfinished work only.
 *
 * ## Two figures describe what the store does NOT say
 *
 * `noDependsOnField` counts the live nodes whose `depends_on` is empty. An
 * empty list is no claim of independence: nobody is obliged to write a
 * prerequisite down. `unresolvedEdges` names every entry the codec could not
 * resolve to a package, and a dependent whose only entries are there reads
 * `ready`. So `readiness` is optimistic by up to those two counts, nothing
 * here measures by how much, and an unresolved prerequisite is no proof that
 * the dependency condition holds (Prior's review, `## Order output and
 * activation`). The caller is obliged to say so whenever either count is
 * above zero.
 *
 * ## What it does not do
 *
 * It computes and returns. It writes no file, keeps no cache and sends no
 * mutation; it deletes no intent and repairs no diverged file, and whatever
 * the codec finds pending it reports, and the report ends the read. A read
 * may still finish a committed intent, which is the codec's and is declared in
 * `lib/record-client.ts` `## The recovery declaration`; no automatic hook
 * reaches this module. Two runs over an unchanged store return equal reports.
 */

import { basename, dirname } from "node:path";
import { ask as askCodec, gate, type Answer, type Ask, type Refusal } from "./record-client.js";
import type { Unknown } from "./scope.js";
import { CONTAINER_STORE } from "./stores.js";

/** The live values of `status`. `done` and `dropped` are not nodes. */
export type ItemStatus = "open" | "claimed" | "paused";

/**
 * Three-valued and derived, never configured. A node is `ready` exactly when
 * it has no resolved edge and no `unmet` row; `paused` is the node's own
 * status and overrides both, because `ready` is an invitation to pick the
 * item up and that status exists to withdraw the invitation.
 */
export type Readiness = "ready" | "blocked" | "paused";

export interface WorkItemNode {
  /** The container directory name, `YYMMDD-HHMM-<slug>`. */
  dir: string;
  status: ItemStatus;
}

/** `from` depends on `to`: "from may start after to". Both are container names. */
export interface ResolvedEdge {
  from: string;
  to: string;
}

/** An unmet condition on a terminal target: `from` is blocked by a package that is no node. */
export interface UnmetEdge {
  from: string;
  to: string;
  condition: string;
  /** The codec's reason, as `dependencySatisfied` phrased it. */
  detail: string;
}

/** An entry the codec could not resolve to a listed package. */
export interface UnresolvedEdge {
  from: string;
  /** The `record_id` the entry names, so the reader sees what to fix. */
  target: string;
  reason: string;
}

/** A package row outside the graph because it did not read, with the codec's finding. */
export interface Unreadable {
  dir: string;
  problem: Refusal;
}

/** One strongly connected component of size above one, or a self-edge. */
export interface CycleGroup {
  /** Container names, ascending. */
  members: string[];
}

export interface ItemFigures {
  /** 1-based row position in the printed order. Members of a cycle are consecutive. */
  order: number;
  /** Longest path to a node with no prerequisites; 0 where there are none. */
  depth: number;
  /** How many other items wait on this one, transitively. */
  blocks: number;
  readiness: Readiness;
}

export type ItemRow = WorkItemNode & ItemFigures;

/** What `readWorkGraph` builds and `orderOf` computes over. */
export interface OrderInput {
  nodes: WorkItemNode[];
  edges: ResolvedEdge[];
  unmet: UnmetEdge[];
  unresolved: UnresolvedEdge[];
  unreadable: Unreadable[];
  noDependsOnField: number;
}

export interface WorkGraphReport {
  /** Nodes: live packages only. */
  items: number;
  /** Resolved edges, one per distinct `(from, to)` pair. */
  edges: number;
  unmetEdges: UnmetEdge[];
  unresolvedEdges: UnresolvedEdge[];
  cycles: CycleGroup[];
  /** One row per node, prerequisites first. */
  rows: ItemRow[];
  /** Live nodes whose `depends_on` is empty; see the header. */
  noDependsOnField: number;
  unreadable: Unreadable[];
  /** `unreadable.length`, the figure the caller prints beside `noDependsOnField`. */
  unreadableHead: number;
  /** `empty` when there are no nodes; `cyclic` when any cycle was found. */
  verdict: "acyclic" | "cyclic" | "empty";
}

/** Why no report could be read; each member names its cause, and none is an empty store. */
export type Failure = Extract<Unknown, { cause: "legacy" | "unsupported" | "unanswered" | "refused" }>;

export type Read = { kind: "report"; report: WorkGraphReport } | ({ kind: "failed" } & Failure);

/** Code-unit comparison, so the order is the same in every locale. */
function ascending(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

/**
 * Tarjan's strongly connected components over `out`, returning a component id
 * per node. Recursive, and the recursion depth is the number of live work
 * packages: a backlog, not a data set.
 */
function stronglyConnected(out: number[][]): number[] {
  const n = out.length;
  const index = new Array<number>(n).fill(-1);
  const low = new Array<number>(n).fill(0);
  const onStack = new Array<boolean>(n).fill(false);
  const comp = new Array<number>(n).fill(-1);
  const stack: number[] = [];
  let next = 0;
  let components = 0;

  const visit = (v: number): void => {
    index[v] = next;
    low[v] = next;
    next += 1;
    stack.push(v);
    onStack[v] = true;

    for (const w of out[v]) {
      if (index[w] === -1) {
        visit(w);
        low[v] = Math.min(low[v], low[w]);
      } else if (onStack[w]) {
        low[v] = Math.min(low[v], index[w]);
      }
    }

    if (low[v] === index[v]) {
      for (;;) {
        const w = stack.pop()!;
        onStack[w] = false;
        comp[w] = components;
        if (w === v) break;
      }
      components += 1;
    }
  };

  for (let v = 0; v < n; v++) if (index[v] === -1) visit(v);
  return comp;
}

/**
 * The ordering report over `input`. Pure: no disk, no codec, and equal
 * inputs give equal reports. Every `from` and `to` of an edge names a node of
 * `input.nodes`; the reader guarantees it, and a violation is a bug here
 * rather than a state of the store, so it throws.
 */
export function orderOf(input: OrderInput): WorkGraphReport {
  const nodes = [...input.nodes].sort((a, b) => ascending(a.dir, b.dir));
  const byDir = new Map<string, number>();
  nodes.forEach((n, i) => byDir.set(n.dir, i));
  const at = (dir: string): number => {
    const i = byDir.get(dir);
    if (i === undefined) throw new Error(`work-graph: ${dir} is on an edge and is no node`);
    return i;
  };

  // --- edges, one per distinct pair -----------------------------------------
  const out: number[][] = nodes.map(() => []);
  const seenEdge = new Set<string>();
  let edges = 0;
  for (const e of input.edges) {
    const [i, j] = [at(e.from), at(e.to)];
    const key = `${i} ${j}`;
    if (seenEdge.has(key)) continue;
    seenEdge.add(key);
    out[i].push(j);
    edges += 1;
  }
  const unmetFrom = new Set(input.unmet.map((u) => at(u.from)));
  const unmetEdges = [...input.unmet].sort((a, b) => ascending(a.from, b.from) || ascending(a.to, b.to));
  const unresolvedEdges = [...input.unresolved].sort((a, b) => ascending(a.from, b.from) || ascending(a.target, b.target));
  const unreadable = [...input.unreadable].sort((a, b) => ascending(a.dir, b.dir));

  // --- components ----------------------------------------------------------
  const comp = stronglyConnected(out);
  const componentCount = comp.length === 0 ? 0 : Math.max(...comp) + 1;
  const members: number[][] = Array.from({ length: componentCount }, () => []);
  nodes.forEach((_, i) => members[comp[i]].push(i));
  for (const m of members) m.sort((a, b) => ascending(nodes[a].dir, nodes[b].dir));

  /** Prerequisite components of each component, self excluded. */
  const prereqs: Set<number>[] = Array.from({ length: componentCount }, () => new Set());
  /** The reverse: components waiting on each component. */
  const dependents: Set<number>[] = Array.from({ length: componentCount }, () => new Set());
  nodes.forEach((_, i) => {
    for (const j of out[i]) {
      if (comp[i] === comp[j]) continue;
      prereqs[comp[i]].add(comp[j]);
      dependents[comp[j]].add(comp[i]);
    }
  });

  // --- Kahn over the condensation, prerequisites first ---------------------
  // Ties break on the component's smallest member name, which is
  // chronological then lexical for a `YYMMDD-HHMM-` name and identical across
  // runs. The condensation is a DAG, so every component is emitted.
  const remaining = prereqs.map((p) => p.size);
  const emitted: number[] = [];
  const pending = new Set<number>();
  for (let c = 0; c < componentCount; c++) if (remaining[c] === 0) pending.add(c);

  while (pending.size > 0) {
    let pick = -1;
    for (const c of pending) {
      if (pick === -1 || ascending(nodes[members[c][0]].dir, nodes[members[pick][0]].dir) < 0) {
        pick = c;
      }
    }
    pending.delete(pick);
    emitted.push(pick);
    for (const d of dependents[pick]) {
      remaining[d] -= 1;
      if (remaining[d] === 0) pending.add(d);
    }
  }

  // --- depth, on the condensation so a cycle cannot make it unbounded ------
  const depth = new Array<number>(componentCount).fill(0);
  for (const c of emitted) {
    let d = 0;
    for (const p of prereqs[c]) d = Math.max(d, depth[p] + 1);
    depth[c] = d;
  }

  // --- transitive blocking count ------------------------------------------
  // Every item that reaches this one by depending on it, its own cycle's other
  // members included: inside a cycle each member does wait on each other.
  const blocks = new Array<number>(componentCount).fill(0);
  for (let c = 0; c < componentCount; c++) {
    const seen = new Set<number>([c]);
    const queue = [c];
    let reached = 0;
    while (queue.length > 0) {
      const cur = queue.pop()!;
      reached += members[cur].length;
      for (const d of dependents[cur]) {
        if (seen.has(d)) continue;
        seen.add(d);
        queue.push(d);
      }
    }
    blocks[c] = reached - 1;
  }

  // --- rows and cycles -----------------------------------------------------
  const rows: ItemRow[] = [];
  const cycles: CycleGroup[] = [];
  let order = 0;
  for (const c of emitted) {
    const selfEdge = members[c].length === 1 && out[members[c][0]].includes(members[c][0]);
    if (members[c].length > 1 || selfEdge) {
      cycles.push({ members: members[c].map((i) => nodes[i].dir) });
    }
    for (const i of members[c]) {
      order += 1;
      rows.push({
        ...nodes[i],
        order,
        depth: depth[c],
        blocks: blocks[c],
        readiness:
          nodes[i].status === "paused"
            ? "paused"
            : out[i].length === 0 && !unmetFrom.has(i)
              ? "ready"
              : "blocked",
      });
    }
  }

  const verdict: WorkGraphReport["verdict"] =
    nodes.length === 0 ? "empty" : cycles.length > 0 ? "cyclic" : "acyclic";

  return {
    items: nodes.length,
    edges,
    unmetEdges,
    unresolvedEdges,
    cycles,
    rows,
    noDependsOnField: input.noDependsOnField,
    unreadable,
    unreadableHead: unreadable.length,
    verdict,
  };
}

// --- the reader ---------------------------------------------------------------

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const failed = (f: Failure): Read => ({ kind: "failed", ...f });

/** The refusal an answer carries, as one value to name. */
const refusalOf = (answer: Answer & { kind: "refused" }): Refusal => ({
  class: answer.class,
  reason: answer.reason,
  ...(answer.detail !== undefined && { detail: answer.detail }),
});

/** `Refusal` read off a `problem` or a finding the codec put in a row; anything else is reported as it came. */
function problemOf(value: unknown): Refusal {
  if (isObject(value) && typeof value.class === "string" && typeof value.reason === "string") {
    return { class: value.class, reason: value.reason, ...(typeof value.detail === "string" && { detail: value.detail }) };
  }
  return { class: "operation-unknown", reason: "problem-unreadable", detail: `the codec's finding is ${JSON.stringify(value)}` };
}

/** The gate's non-admitting states, each as the failure it is. */
function refusedByGate(workbench: string, ask: Ask): Failure | null {
  const g = gate(workbench, { ask });
  switch (g.state) {
    case "json-control":
      return null;
    case "legacy":
      return { cause: "legacy" };
    case "unsupported":
      return { cause: "unsupported", diagnosis: g.diagnosis };
    case "refused":
      return { cause: "refused", op: "inspect", refusal: { class: g.class, reason: g.reason, ...(g.detail !== undefined && { detail: g.detail }) } };
    case "unanswered":
      return { cause: "unanswered", op: "inspect", how: g.cause, detail: g.detail };
  }
}

/** A row of `list` that is a package of the container store, readable or not. */
const isPackageRow = (row: Record<string, unknown>): boolean =>
  typeof row.path === "string" && row.path.startsWith(`${CONTAINER_STORE}/`) && basename(row.path) === "package.json";

/** One `list` or `reconcile` answer's result object, or the failure that stands in for it. */
function resultOf(workbench: string, op: string, ask: Ask): { result: Record<string, unknown> } | { failure: Failure } {
  const answer = ask(workbench, { op });
  if (answer.kind === "unanswered") return { failure: { cause: "unanswered", op, how: answer.cause, detail: answer.detail } };
  if (answer.kind === "refused") return { failure: { cause: "refused", op, refusal: refusalOf(answer) } };
  if (!isObject(answer.result)) return { failure: { cause: "unanswered", op, how: "unparseable", detail: `the result of ${op} is no object` } };
  return { result: answer.result };
}

/** The list `key` of a result, or the failure that it is missing. */
function listOf(op: string, result: Record<string, unknown>, key: string): { list: unknown[] } | { failure: Failure } {
  return Array.isArray(result[key]) ? { list: result[key] } : { failure: { cause: "unanswered", op, how: "unparseable", detail: `the result of ${op} carries no \`${key}\` list` } };
}

interface Listed {
  path: string;
  dir: string;
  id: string;
  /** A live status makes a node; `null` is a terminal package, a target and no node. */
  status: ItemStatus | null;
}

/** The blocked recovery a finding or problem carries, as the failure that ends the read. */
const blocked = (op: string, problem: Refusal): Failure | null =>
  problem.reason === "recovery-blocked" ? { cause: "refused", op, refusal: problem } : null;

/**
 * The ordering report of `workbench`, or why none could be read. `ask` is the
 * record client's by default, and a test's stand-in when injected.
 */
export function readWorkGraph(workbench: string, ask: Ask = askCodec): Read {
  const gated = refusedByGate(workbench, ask);
  if (gated !== null) return failed(gated);

  // --- list: the nodes, the terminal targets, the rows that did not read ----
  const listed = resultOf(workbench, "list", ask);
  if ("failure" in listed) return failed(listed.failure);
  const records = listOf("list", listed.result, "records");
  if ("failure" in records) return failed(records.failure);

  const packages: Listed[] = [];
  const unreadable: Unreadable[] = [];
  for (const row of records.list) {
    if (!isObject(row) || !isPackageRow(row)) continue;
    const path = row.path as string;
    const dir = basename(dirname(path));
    if ("problem" in row) {
      const problem = problemOf(row.problem);
      const b = blocked("list", problem);
      if (b !== null) return failed(b);
      unreadable.push({ dir, problem });
      continue;
    }
    const status = row.status;
    // An allowlist of the five values, not a denylist: a status outside them
    // is a row this module could not read, named rather than dropped.
    if (typeof row.id !== "string" || row.id === "") {
      unreadable.push({ dir, problem: { class: "schema-invalid", reason: "id-unnamed", detail: `${path} names no id` } });
    } else if (status === "open" || status === "claimed" || status === "paused") {
      packages.push({ path, dir, id: row.id, status });
    } else if (status === "done" || status === "dropped") {
      packages.push({ path, dir, id: row.id, status: null });
    } else {
      unreadable.push({ dir, problem: { class: "schema-invalid", reason: "status-unreadable", detail: `${path} carries status ${JSON.stringify(status)}` } });
    }
  }
  const nodes = new Map<string, Listed>(packages.filter((p) => p.status !== null).map((p) => [p.path, p]));
  const empty = (): Read => ({ kind: "report", report: orderOf({ nodes: [], edges: [], unmet: [], unresolved: [], unreadable, noDependsOnField: 0 }) });
  if (nodes.size === 0) return empty();

  // --- reconcile: the findings first, then the edges -----------------------
  const reconciled = resultOf(workbench, "reconcile", ask);
  if ("failure" in reconciled) return failed(reconciled.failure);
  const findings = listOf("reconcile", reconciled.result, "records");
  if ("failure" in findings) return failed(findings.failure);
  const dependencies = listOf("reconcile", reconciled.result, "dependencies");
  if ("failure" in dependencies) return failed(dependencies.failure);

  const packagePaths = new Set(packages.map((p) => p.path));
  for (const f of findings.list) {
    if (!isObject(f) || typeof f.path !== "string" || !packagePaths.has(f.path)) continue;
    const problem = problemOf(f);
    const b = blocked("reconcile", problem);
    if (b !== null) return failed(b);
    const node = nodes.get(f.path);
    if (node === undefined) continue;
    nodes.delete(f.path);
    unreadable.push({ dir: node.dir, problem });
  }
  if (nodes.size === 0) return empty();

  const byId = new Map<string, Listed>(packages.map((p) => [p.id, p]));
  const unreadableDirs = new Set(unreadable.map((u) => u.dir));
  const edges: ResolvedEdge[] = [];
  const unmet: UnmetEdge[] = [];
  const unresolved: UnresolvedEdge[] = [];
  const entries = new Map<string, number>([...nodes.keys()].map((p) => [p, 0]));
  for (const e of dependencies.list) {
    if (!isObject(e) || typeof e.path !== "string" || e.status === "cycle") continue;
    const from = nodes.get(e.path);
    if (from === undefined) continue; // a terminal package's entries are never read
    entries.set(e.path, (entries.get(e.path) ?? 0) + 1);
    if (e.status === "satisfied") continue;
    const target = typeof e.target === "string" ? e.target : JSON.stringify(e.target);
    const reason = typeof e.reason === "string" ? e.reason : "reason-unnamed";
    const b = blocked("reconcile", { class: typeof e.class === "string" ? e.class : "operation-unknown", reason, ...(typeof e.detail === "string" && { detail: e.detail }) });
    if (b !== null) return failed(b);
    if (reason !== "dependency-unmet") {
      unresolved.push({ from: from.dir, target, reason: `${typeof e.class === "string" ? e.class : "operation-unknown"}/${reason}` });
      continue;
    }
    const to = byId.get(target);
    if (to !== undefined && nodes.has(to.path)) edges.push({ from: from.dir, to: to.dir });
    else if (to !== undefined && to.status === null) unmet.push({ from: from.dir, to: to.dir, condition: String(e.condition), detail: typeof e.detail === "string" ? e.detail : "" });
    // The codec resolved the target and this read did not list it as a live or
    // terminal package: it moved to `unreadable` above, or the store changed
    // between the two reads. Either way the edge is unresolved here.
    else unresolved.push({ from: from.dir, target, reason: to !== undefined && unreadableDirs.has(to.dir) ? "target-unreadable" : "target-unlisted" });
  }

  return {
    kind: "report",
    report: orderOf({
      nodes: [...nodes.values()].map((n) => ({ dir: n.dir, status: n.status as ItemStatus })),
      edges,
      unmet,
      unresolved,
      unreadable,
      noDependsOnField: [...entries.values()].filter((n) => n === 0).length,
    }),
  };
}
