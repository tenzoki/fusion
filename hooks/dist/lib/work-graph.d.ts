/**
 * The order the work-item store imposes on itself — computed per run, stored
 * nowhere.
 *
 * A work item's `**Depends-on:**` field carries the prerequisite relation and
 * carries nothing else: an entry there asserts that the named item reaches
 * `done` or `dropped` before this item may start, and every citation that binds
 * an item without ordering it sits in `**Cross-references:**`, which this module
 * never reads (`rules/fusion-workbench-conventions.md`
 * `## Backlog entries — work items`). Nothing here reads the text of a value to
 * learn what a writer meant; the field a basename sits in is the whole of the
 * grammar.
 *
 * Binding decision for the field's meaning:
 * `260908-2018_*_does-the-new-field-name-only-the-ordering-edge-or-the-four-relation-types-beside-it.md`.
 * Binding decision for a helper computing an order at all:
 * `260909-1808_*_may-a-helper-compute-an-order-over-work-items-after-the-portfolio-layer-goes.md`
 * (option 3) — a helper may READ the store and REPORT an order, and the report
 * is a report. No agent asserts a ranking, no marker records one, and the user
 * overrides the figures wherever he wants to.
 *
 * ## The graph spans live work items only, and two kinds of record are outside it
 *
 * A NODE IS A WORK-ITEM RECORD WHOSE `**Status:**` IS LIVE — `open`, `claimed`
 * or `paused`. The node set is the live half of the status partition and was
 * never the enumeration `{open, claimed}`: that was the complete list of the
 * live values on the day this module was written, and `paused` joined it on
 * 2026-09-15 (`260915-2028_*_what-shape-does-the-work-items-fifth-status-value-take.md`,
 * option 1). The test stays an ALLOWLIST, so a record whose `**Status:**` is
 * unreadable or garbage is outside the node set rather than admitted to it.
 * `done` and `dropped` are terminal, and a terminal item is not a node: its
 * outgoing entries are never read, and an entry naming it resolves to nothing
 * and is reported as a dangle. That is the user's ruling at gate G1, recorded in
 * `260908-2018_*_is-a-closed-prerequisite-a-satisfied-edge-or-no-edge-and-what-is-an-archived-one.md`
 * — the record as filed asked about an edge's target and was answered on the
 * dependent side, the target and resolution sides following by implication.
 * **Its accepted consequence, stated at the gate and repeated here because a
 * later reader will otherwise read the figures as more than they are**: `depth`
 * and `blocks` measure unfinished work only, so the graph is blind to what has
 * closed. An item whose whole chain of prerequisites is done and an item that
 * never had one score identically.
 *
 * A TERMINAL CIRCLE RECORD — `circles/<dir>/_<m>_circle.md` — is outside for a
 * different reason, and it is not a migration remnant waiting to be converted.
 * It is the other record form the container store holds permanently
 * (`CIRCLE_RECORD_RE` in `./citation-corpus.ts`, whose header carries why both
 * forms stand in one tree by design): a Circle carries its state in a filename
 * marker and has no `**Status:**` field, no `**Depends-on:**` field and no
 * grammar this module could read. In fusion's own workbench those records are
 * the large majority of the containers, and the ratio only ever moves one way.
 * The node set is `ITEM_RECORD_RE` and nothing else, imported rather than
 * re-spelled so that this module and the citation gate cannot drift on what a
 * work-item record is.
 *
 * `archive/**` IS NEVER OPENED. Only `fusion-workbench/circles/` is read, so an
 * entry naming an item that was archived resolves to nothing and is reported by
 * name, exactly like an entry naming an item that never existed. That is the
 * `3b-i` half of the same ruling.
 *
 * ## What it does not do
 *
 * It computes and returns. It writes no file, keeps no cache, builds no index
 * and touches nothing on disk but the records it reads. Two runs over an
 * unchanged store return equal reports, which is what makes the figures safe to
 * print and safe to ignore.
 *
 * It carries no verdict in any exit code, because it is a library and has none;
 * its caller prints `verdict=` as a line of stdout, the stdout-verdict rule
 * `lib/plan-size.ts`, `lib/staging-drift.ts` and `lib/review-coverage.ts` all
 * carry.
 *
 * ## One figure describes what the store does NOT say
 *
 * `noDependsOnField` counts the nodes carrying no `**Depends-on:**` field at
 * all. An absent field and a genuinely prerequisite-free item are
 * indistinguishable — the grammar says the field is absent when there is
 * nothing to say — so `readiness` is optimistic by exactly that count. The cost
 * was accepted at a user gate rather than designed away, and the caller is
 * obliged to say so whenever the count is above zero.
 */
/** The live values of `**Status:**`. `done` and `dropped` are not nodes. */
export type ItemStatus = "open" | "claimed" | "paused";
/**
 * Three-valued and derived, never configured. Every node is non-terminal, so
 * every resolved out-edge is an unmet prerequisite and a node is `ready`
 * exactly when it has none.
 *
 * `paused` is the node's own status and overrides both of the derived values,
 * because `ready` is an invitation to pick the item up and that status exists
 * to withdraw the invitation. Until 2026-09-15 this comment said a third value
 * would be an unreachable branch, and that was TRUE of the node set it was
 * written against: every live value then was pickable. What changed is the node
 * set, not the reasoning — `paused` is live but unpickable, which is a case the
 * two derived values cannot express.
 */
export type Readiness = "ready" | "blocked" | "paused";
export interface WorkItemNode {
    /** The container directory name, `YYMMDD-HHMM-<slug>`. */
    dir: string;
    /** The record basename, `<dir>.md` — the form a `**Depends-on:**` entry takes. */
    base: string;
    status: ItemStatus;
    /** The field's entries as written, in file order; empty when the field is absent. */
    dependsOn: string[];
}
/** `from` depends on `to`: "from may start after to". Both are container names. */
export interface ResolvedEdge {
    from: string;
    to: string;
}
/** An entry naming no node — an item archived, terminal, misspelt or never filed. */
export interface UnresolvedEdge {
    from: string;
    /** The entry exactly as the field carries it, so the reader sees what to fix. */
    entry: string;
}
/** One strongly connected component of size above one, or a self-edge. */
export interface CycleGroup {
    /** Container names, basename ascending. */
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
export interface WorkGraphReport {
    /** Nodes: live items only. */
    items: number;
    /** Resolved edges, one per distinct `(from, to)` pair. */
    edges: number;
    unresolvedEdges: UnresolvedEdge[];
    cycles: CycleGroup[];
    /** One row per node, prerequisites first. */
    rows: ItemRow[];
    /** Nodes carrying no `**Depends-on:**` field at all — see the header. */
    noDependsOnField: number;
    /** `empty` when there are no nodes; `cyclic` when any cycle was found. */
    verdict: "acyclic" | "cyclic" | "empty";
}
/**
 * Read `root`'s work-item store and return the ordering report.
 *
 * `root` is the project root — the directory holding `fusion-workbench/`, which
 * is what `findWorkbenchRoot` returns and what the callers of `lib/plan-size.ts`
 * and `lib/staging-drift.ts` pass. A root with no workbench, or a workbench with
 * no `circles/`, is a real answer and not a failure: zero items and
 * `verdict=empty`.
 *
 * A container holding no record of its own name is skipped in silence — that is
 * every terminal Circle container, and there is nothing to report about one. A
 * record whose head declares no readable `**Status:**` is outside the node set
 * for the same reason a terminal one is: the grammar says the field is always
 * written, so a record without it states no live work.
 */
export declare function computeWorkGraph(root: string): WorkGraphReport;
