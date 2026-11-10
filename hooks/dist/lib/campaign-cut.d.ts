/**
 * The cut: the live work packages of one workbench distributed over N lanes,
 * one per checkout, so that two packages whose declared areas overlap never
 * stand in different lanes. Behind `bin/fusion-campaign cut --checkouts N`,
 * whose header is the authoritative documentation of the output; this header
 * is that of the mechanism, plan step 15 of
 * `261108-2301-plan-campaign-the-frame-for-work-spread-over-several-checkouts.md`.
 *
 * Pure: no disk, no codec, no clock. `lib/campaign.ts` `readCutInput` builds
 * the input out of `lib/work-graph.ts` `readWorkGraph` (the nodes, their
 * order and depth, the resolved edges) and one `show` per live node (its
 * `resources`); equal inputs give equal cuts, so two runs over one store
 * print the same bytes.
 *
 * ## The rules, (a) to (h) of the plan, as this module reads them
 *
 *   (a) Groups. Union-find over the nodes whose declared areas overlap: two
 *       areas overlap when they are equal or one is a prefix of the other at
 *       a `/` boundary (`insideArea` of `lib/campaign.ts`, the one spelling
 *       `codec/schemas/package.schema.json` admits). A node without areas is
 *       a group of its own. Overlap is never split, so a file declared on
 *       several packages joins them all into one group, however large.
 *   (b) Group order. By dependency depth descending (the greatest `depth`
 *       `orderOf` gives a member), then by member count descending, then by
 *       name ascending, the name being the smallest member's container.
 *   (c) Placement. `bound` is `ceil(nodes / N)` and a lane stays within
 *       tolerance `k` when its count after the group is at most `bound + k`.
 *       A group goes to the lane with the fewest members among the lanes that
 *       hold an edge neighbour of one of its members (either direction of the
 *       edge) and stay within tolerance; without such a lane, to the lane with
 *       the fewest members overall, the lowest number on a tie. A group that
 *       fits in no lane within tolerance still goes to the smallest lane, and
 *       that placement is reported as an imbalance: the lane, its count after
 *       the placement, the group's members.
 *   (d) Lane order. The global order `orderOf` printed, filtered to the lane.
 *   (e) Hand-offs. One per resolved edge whose ends stand in different lanes,
 *       named from the prerequisite to the dependent, since that is the
 *       direction the work passes. A terminal package is no node, so an edge
 *       on one is no hand-off (the G1 ruling `lib/work-graph.ts` applies).
 *   (f) The nodes with no declared area, named and counted.
 *   (g) The same cut at N+1 and N−1, compared with the cut at N: a package
 *       moves when its lane number differs, and a hand-off appears or
 *       disappears by its `(from, to)` pair. Lane numbers are what the rules
 *       assign, so a renumbering counts as moves; the rows say which packages
 *       and nothing more. There is no cut over zero lanes, so N=1 has no
 *       delta-minus.
 *   (h) The proposal, the document `bin/fusion-campaign lanes --from` reads
 *       (`lib/campaign-write.ts` `readProposal`): its `lanes` key is an array
 *       of `{id, members}` with `id` `lane-<n>` and the members in lane order,
 *       and by construction every package stands in exactly one lane and
 *       every id is distinct, two of the three lane rules; the third, one
 *       checkout per lane, is `--assign`'s. The other keys restate the rows.
 *
 * No size figure enters: a lane's count is its number of members, and no
 * estimate of any package's effort is read or made.
 */
/** One live package, as the cut reads it. */
export interface CutNode {
    /** The container name. */
    dir: string;
    /** The declared areas, `resources` of the package; empty where none is declared. */
    areas: string[];
    /** `orderOf`'s depth: the longest path to a node with no prerequisites. */
    depth: number;
}
/** `from` depends on `to`; both are nodes. */
export interface CutEdge {
    from: string;
    to: string;
}
export interface CutInput {
    /** The live packages, in the order `orderOf` printed them. */
    nodes: CutNode[];
    edges: CutEdge[];
}
/** One group of rule (a), with its figures for rule (b). */
export interface Group {
    /** The members, ascending. */
    members: string[];
    depth: number;
    /** The smallest member. */
    name: string;
}
/** A hand-off, named from the prerequisite to the dependent. */
export interface Handoff {
    from: string;
    to: string;
    fromLane: number;
    toLane: number;
}
export interface Imbalance {
    lane: number;
    /** The lane's member count after the placement. */
    size: number;
    members: string[];
}
export interface Cut {
    checkouts: number;
    tolerance: number;
    /** `ceil(nodes / checkouts)`. */
    bound: number;
    /** Lane 1 first; each lane's members in the global order. */
    lanes: string[][];
    /** Container to lane number. */
    laneOf: Map<string, number>;
    /** Ascending by `from`, then `to`. */
    handoffs: Handoff[];
    /** The nodes with no declared area, ascending. */
    noAreas: string[];
    /** In the order the groups were placed. */
    imbalance: Imbalance[];
}
/** The cut at N compared with the cut at another N: rule (g). */
export interface Delta {
    checkouts: number;
    /** Packages whose lane number differs, ascending. */
    moves: Array<{
        dir: string;
        from: number;
        to: number;
    }>;
    appearing: Array<{
        from: string;
        to: string;
    }>;
    disappearing: Array<{
        from: string;
        to: string;
    }>;
}
/** Rule (a): the groups, and the edge neighbours each member brings. */
export declare function groupsOf(input: CutInput): Group[];
/** Rules (a) to (f) at `checkouts` lanes; `tolerance` is rule (c)'s `k`. */
export declare function cutAt(input: CutInput, checkouts: number, tolerance: number): Cut;
/** Rule (g): `other` against `base`. */
export declare function deltaOf(base: Cut, other: Cut): Delta;
/** The cut at N, and rule (g)'s two comparisons; `minus` is null at N=1. */
export interface CutReport {
    cut: Cut;
    plus: Delta;
    minus: Delta | null;
}
export declare function cutReport(input: CutInput, checkouts: number, tolerance: number): CutReport;
/** The lane's id in the proposal, and the name `lanes --assign` takes. */
export declare const laneId: (n: number) => string;
/** Rule (h): the proposal document, `lanes` in the shape `readProposal` reads, the other keys restating the rows. */
export declare function proposalOf(cut: Cut): Record<string, unknown>;
/** The `KEY=value` text `bin/fusion-campaign cut` prints; that script's header defines every line. */
export declare function renderCut(report: CutReport, members: number, proposalPath: string): string;
