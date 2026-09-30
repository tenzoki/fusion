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
 *                      store does not exist yet).
 *   `reconcile`        without a scope, for the same reason, and asked on every
 *                      read. Its `records` findings are read BEFORE its
 *                      `dependencies`. Each package row of `list` is then
 *                      judged by `lib/codec-read.ts` `unreadRow`, the criterion
 *                      `lib/scope.ts` applies too: a row that is a `problem`,
 *                      that a finding names, that names no id or that carries a
 *                      status outside the five is `unreadable`, named and
 *                      outside the graph, whether its status is live or
 *                      terminal, because a record the codec reports against
 *                      contributes nothing it has decided. A `problem` or
 *                      finding whose reason is `recovery-blocked` ends the read
 *                      with a named failure and no report, wherever the
 *                      protocol put it (Prior's review of the FJ03a plan,
 *                      `## C.`). A live `status` (`open`, `claimed`, `paused`)
 *                      is a node, a terminal one (`done`, `dropped`) is a
 *                      target and no node. Then each `dependencies` entry of a
 *                      node is placed by the table below.
 *
 * ## The table one edge entry falls in, and it is disjoint and complete
 *
 *   entry                               target            input to `orderOf`
 *   `satisfied`                         any               no edge, no row
 *   `unmet`, reason `dependency-unmet`  a node            a resolved edge
 *   `unmet`, reason `dependency-unmet`  no node: terminal, an `unmet` row: the
 *                                       unreadable or     dependent is blocked
 *                                       unlisted
 *   `unmet`, any other reason           none, or no package  `unresolved`, the
 *                                                       dependent's readiness
 *                                                       untouched
 *
 * The codec evaluated a `dependency-unmet` entry and found the condition
 * unmet, so that entry blocks its dependent whatever this read concluded
 * about the target; `unresolved` is left for the entries the codec itself
 * could not resolve to a package (the closed FJ03a plan's `## Data
 * Structures`, and
 * `260930-1446_*_the-order-reader-reports-a-dependent-ready-when-the-codec-reported-its-edge-to-a-live-package-unmet.md`).
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
import { ask as askCodec } from "./record-client.js";
import { blockedRead, findingsByPath, isObject, isPackageRow, listOf, problemOf, refusedByGate, resultOf, unreadRow } from "./codec-read.js";
/** Code-unit comparison, so the order is the same in every locale. */
function ascending(a, b) {
    return a < b ? -1 : a > b ? 1 : 0;
}
/**
 * Tarjan's strongly connected components over `out`, returning a component id
 * per node. Recursive, and the recursion depth is the number of live work
 * packages: a backlog, not a data set.
 */
function stronglyConnected(out) {
    const n = out.length;
    const index = new Array(n).fill(-1);
    const low = new Array(n).fill(0);
    const onStack = new Array(n).fill(false);
    const comp = new Array(n).fill(-1);
    const stack = [];
    let next = 0;
    let components = 0;
    const visit = (v) => {
        index[v] = next;
        low[v] = next;
        next += 1;
        stack.push(v);
        onStack[v] = true;
        for (const w of out[v]) {
            if (index[w] === -1) {
                visit(w);
                low[v] = Math.min(low[v], low[w]);
            }
            else if (onStack[w]) {
                low[v] = Math.min(low[v], index[w]);
            }
        }
        if (low[v] === index[v]) {
            for (;;) {
                const w = stack.pop();
                onStack[w] = false;
                comp[w] = components;
                if (w === v)
                    break;
            }
            components += 1;
        }
    };
    for (let v = 0; v < n; v++)
        if (index[v] === -1)
            visit(v);
    return comp;
}
/**
 * The ordering report over `input`. Pure: no disk, no codec, and equal
 * inputs give equal reports. Every `from` and `to` of an edge names a node of
 * `input.nodes`; the reader guarantees it, and a violation is a bug here
 * rather than a state of the store, so it throws.
 */
export function orderOf(input) {
    const nodes = [...input.nodes].sort((a, b) => ascending(a.dir, b.dir));
    const byDir = new Map();
    nodes.forEach((n, i) => byDir.set(n.dir, i));
    const at = (dir) => {
        const i = byDir.get(dir);
        if (i === undefined)
            throw new Error(`work-graph: ${dir} is on an edge and is no node`);
        return i;
    };
    // --- edges, one per distinct pair -----------------------------------------
    const out = nodes.map(() => []);
    const seenEdge = new Set();
    let edges = 0;
    for (const e of input.edges) {
        const [i, j] = [at(e.from), at(e.to)];
        const key = `${i} ${j}`;
        if (seenEdge.has(key))
            continue;
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
    const members = Array.from({ length: componentCount }, () => []);
    nodes.forEach((_, i) => members[comp[i]].push(i));
    for (const m of members)
        m.sort((a, b) => ascending(nodes[a].dir, nodes[b].dir));
    /** Prerequisite components of each component, self excluded. */
    const prereqs = Array.from({ length: componentCount }, () => new Set());
    /** The reverse: components waiting on each component. */
    const dependents = Array.from({ length: componentCount }, () => new Set());
    nodes.forEach((_, i) => {
        for (const j of out[i]) {
            if (comp[i] === comp[j])
                continue;
            prereqs[comp[i]].add(comp[j]);
            dependents[comp[j]].add(comp[i]);
        }
    });
    // --- Kahn over the condensation, prerequisites first ---------------------
    // Ties break on the component's smallest member name, which is
    // chronological then lexical for a `YYMMDD-HHMM-` name and identical across
    // runs. The condensation is a DAG, so every component is emitted.
    const remaining = prereqs.map((p) => p.size);
    const emitted = [];
    const pending = new Set();
    for (let c = 0; c < componentCount; c++)
        if (remaining[c] === 0)
            pending.add(c);
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
            if (remaining[d] === 0)
                pending.add(d);
        }
    }
    // --- depth, on the condensation so a cycle cannot make it unbounded ------
    const depth = new Array(componentCount).fill(0);
    for (const c of emitted) {
        let d = 0;
        for (const p of prereqs[c])
            d = Math.max(d, depth[p] + 1);
        depth[c] = d;
    }
    // --- transitive blocking count ------------------------------------------
    // Every item that reaches this one by depending on it, its own cycle's other
    // members included: inside a cycle each member does wait on each other.
    const blocks = new Array(componentCount).fill(0);
    for (let c = 0; c < componentCount; c++) {
        const seen = new Set([c]);
        const queue = [c];
        let reached = 0;
        while (queue.length > 0) {
            const cur = queue.pop();
            reached += members[cur].length;
            for (const d of dependents[cur]) {
                if (seen.has(d))
                    continue;
                seen.add(d);
                queue.push(d);
            }
        }
        blocks[c] = reached - 1;
    }
    // --- rows and cycles -----------------------------------------------------
    const rows = [];
    const cycles = [];
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
                readiness: nodes[i].status === "paused"
                    ? "paused"
                    : out[i].length === 0 && !unmetFrom.has(i)
                        ? "ready"
                        : "blocked",
            });
        }
    }
    const verdict = nodes.length === 0 ? "empty" : cycles.length > 0 ? "cyclic" : "acyclic";
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
const failed = (f) => ({ kind: "failed", ...f });
/**
 * The ordering report of `workbench`, or why none could be read. `ask` is the
 * record client's by default, and a test's stand-in when injected.
 */
export function readWorkGraph(workbench, ask = askCodec) {
    const gated = refusedByGate(workbench, ask);
    if (gated !== null)
        return failed(gated);
    // --- list and reconcile's findings: which package rows read ---------------
    const listed = resultOf(workbench, { op: "list" }, ask);
    if ("unread" in listed)
        return failed(listed.unread);
    const records = listOf("list", listed.result, "records");
    if ("unread" in records)
        return failed(records.unread);
    const reconciled = resultOf(workbench, { op: "reconcile" }, ask);
    if ("unread" in reconciled)
        return failed(reconciled.unread);
    const findings = listOf("reconcile", reconciled.result, "records");
    if ("unread" in findings)
        return failed(findings.unread);
    const dependencies = listOf("reconcile", reconciled.result, "dependencies");
    if ("unread" in dependencies)
        return failed(dependencies.unread);
    const found = findingsByPath("reconcile", findings.list);
    const packages = [];
    const unreadable = [];
    /** Every id a package row names, readable or not, so an unmet edge to an unreadable target names its container. */
    const dirOf = new Map();
    for (const row of records.list) {
        if (!isObject(row) || !isPackageRow(row))
            continue;
        const path = row.path;
        const dir = basename(dirname(path));
        if (typeof row.id === "string")
            dirOf.set(row.id, dir);
        const bad = unreadRow(row, found);
        if (bad !== null) {
            const b = blockedRead(bad.op, bad.problem);
            if (b !== null)
                return failed(b);
            unreadable.push({ dir, problem: bad.problem });
            continue;
        }
        const status = row.status;
        packages.push({ path, dir, id: row.id, status: status === "done" || status === "dropped" ? null : status });
    }
    const nodes = new Map(packages.filter((p) => p.status !== null).map((p) => [p.path, p]));
    const byId = new Map(packages.map((p) => [p.id, p]));
    // --- the edges, each placed by the table --------------------------------------
    const edges = [];
    const unmet = [];
    const unresolved = [];
    const entries = new Map([...nodes.keys()].map((p) => [p, 0]));
    for (const e of dependencies.list) {
        if (!isObject(e) || typeof e.path !== "string" || e.status === "cycle")
            continue;
        const from = nodes.get(e.path);
        if (from === undefined)
            continue; // a terminal or unreadable package's entries are never read
        entries.set(e.path, (entries.get(e.path) ?? 0) + 1);
        if (e.status === "satisfied")
            continue;
        const target = typeof e.target === "string" ? e.target : JSON.stringify(e.target);
        const problem = problemOf({ class: typeof e.class === "string" ? e.class : "operation-unknown", reason: typeof e.reason === "string" ? e.reason : "reason-unnamed", detail: e.detail });
        const b = blockedRead("reconcile", problem);
        if (b !== null)
            return failed(b);
        if (problem.reason !== "dependency-unmet") {
            unresolved.push({ from: from.dir, target, reason: `${problem.class}/${problem.reason}` });
            continue;
        }
        // The codec evaluated the condition and found it unmet, so the dependent is
        // blocked whatever this read concluded about the target: an edge when the
        // target is a node, an `unmet` row when it is terminal, unreadable or unlisted.
        const to = byId.get(target);
        if (to !== undefined && nodes.has(to.path))
            edges.push({ from: from.dir, to: to.dir });
        else
            unmet.push({ from: from.dir, to: dirOf.get(target) ?? target, condition: String(e.condition), detail: problem.detail ?? "" });
    }
    return {
        kind: "report",
        report: orderOf({
            nodes: [...nodes.values()].map((n) => ({ dir: n.dir, status: n.status })),
            edges,
            unmet,
            unresolved,
            unreadable,
            noDependsOnField: [...entries.values()].filter((n) => n === 0).length,
        }),
    };
}
