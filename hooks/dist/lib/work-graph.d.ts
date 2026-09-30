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
 *                      store does not exist yet), its `state` read as there.
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
import { type Ask, type Refusal } from "./record-client.js";
import { type Unread } from "./codec-read.js";
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
/** An unmet condition on a target that is no node: `to` is its container, or the record id where no row named it. */
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
export type Failure = Unread;
export type Read = {
    kind: "report";
    report: WorkGraphReport;
} | ({
    kind: "failed";
} & Failure);
/**
 * The ordering report over `input`. Pure: no disk, no codec, and equal
 * inputs give equal reports. Every `from` and `to` of an edge names a node of
 * `input.nodes`; the reader guarantees it, and a violation is a bug here
 * rather than a state of the store, so it throws.
 */
export declare function orderOf(input: OrderInput): WorkGraphReport;
/**
 * The ordering report of `workbench`, or why none could be read. `ask` is the
 * record client's by default, and a test's stand-in when injected.
 */
export declare function readWorkGraph(workbench: string, ask?: Ask): Read;
