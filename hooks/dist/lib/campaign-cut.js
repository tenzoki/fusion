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
import { insideArea } from "./campaign.js";
/** Code-unit comparison, so every order here is the same in every locale. */
const ascending = (a, b) => (a < b ? -1 : a > b ? 1 : 0);
/** Rule (a): the groups, and the edge neighbours each member brings. */
export function groupsOf(input) {
    const nodes = input.nodes;
    const parent = nodes.map((_, i) => i);
    const find = (i) => {
        while (parent[i] !== i) {
            parent[i] = parent[parent[i]];
            i = parent[i];
        }
        return i;
    };
    const union = (a, b) => {
        const [ra, rb] = [find(a), find(b)];
        if (ra !== rb)
            parent[Math.max(ra, rb)] = Math.min(ra, rb);
    };
    // Quadratic over the live packages, which is a backlog and not a data set.
    for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
            const a = nodes[i].areas;
            const b = nodes[j].areas;
            if (a.some((area) => insideArea(area, b)) || b.some((area) => insideArea(area, a)))
                union(i, j);
        }
    }
    const byRoot = new Map();
    nodes.forEach((_, i) => {
        const r = find(i);
        const m = byRoot.get(r);
        if (m === undefined)
            byRoot.set(r, [i]);
        else
            m.push(i);
    });
    const groups = [];
    for (const members of byRoot.values()) {
        const dirs = members.map((i) => nodes[i].dir).sort(ascending);
        groups.push({ members: dirs, depth: Math.max(...members.map((i) => nodes[i].depth)), name: dirs[0] });
    }
    // Rule (b).
    return groups.sort((a, b) => b.depth - a.depth || b.members.length - a.members.length || ascending(a.name, b.name));
}
/** Rules (a) to (f) at `checkouts` lanes; `tolerance` is rule (c)'s `k`. */
export function cutAt(input, checkouts, tolerance) {
    if (!Number.isInteger(checkouts) || checkouts < 1)
        throw new Error(`campaign-cut: ${checkouts} lanes is no cut`);
    const nodeOf = new Map(input.nodes.map((n) => [n.dir, n]));
    const neighbours = new Map(input.nodes.map((n) => [n.dir, new Set()]));
    const edges = new Map();
    for (const e of input.edges) {
        if (!nodeOf.has(e.from) || !nodeOf.has(e.to))
            throw new Error(`campaign-cut: ${e.from} -> ${e.to} is an edge and one end is no node`);
        edges.set(`${e.from}\t${e.to}`, e);
        neighbours.get(e.from).add(e.to);
        neighbours.get(e.to).add(e.from);
    }
    const bound = Math.ceil(input.nodes.length / checkouts);
    const counts = new Array(checkouts).fill(0);
    const laneOf = new Map();
    const imbalance = [];
    const smallestOf = (candidates) => candidates.reduce((best, lane) => (counts[lane] < counts[best] ? lane : best));
    const within = (lane, size) => counts[lane] + size <= bound + tolerance;
    // Rule (c), group by group in the order of rule (b).
    for (const group of groupsOf(input)) {
        const size = group.members.length;
        // Lane indices here; `laneOf` holds the printed numbers, one above.
        const adjacentLanes = new Set();
        for (const m of group.members)
            for (const n of neighbours.get(m) ?? [])
                if (laneOf.has(n))
                    adjacentLanes.add(laneOf.get(n) - 1);
        const preferred = [...adjacentLanes].sort((a, b) => a - b).filter((lane) => within(lane, size));
        const all = counts.map((_, lane) => lane);
        const lane = preferred.length > 0 ? smallestOf(preferred) : smallestOf(all);
        const fits = within(lane, size);
        counts[lane] += size;
        for (const m of group.members)
            laneOf.set(m, lane + 1);
        if (!fits)
            imbalance.push({ lane: lane + 1, size: counts[lane], members: group.members });
    }
    // Rule (d).
    const lanes = Array.from({ length: checkouts }, () => []);
    for (const n of input.nodes)
        lanes[laneOf.get(n.dir) - 1].push(n.dir);
    // Rule (e): one per distinct edge whose ends stand in different lanes, prerequisite first.
    const handoffs = [];
    for (const e of edges.values()) {
        const [dependent, prerequisite] = [laneOf.get(e.from), laneOf.get(e.to)];
        if (dependent !== prerequisite)
            handoffs.push({ from: e.to, to: e.from, fromLane: prerequisite, toLane: dependent });
    }
    handoffs.sort((a, b) => ascending(a.from, b.from) || ascending(a.to, b.to));
    // Rule (f).
    const noAreas = input.nodes.filter((n) => n.areas.length === 0).map((n) => n.dir).sort(ascending);
    return { checkouts, tolerance, bound, lanes, laneOf, handoffs, noAreas, imbalance };
}
/** Rule (g): `other` against `base`. */
export function deltaOf(base, other) {
    const moves = [];
    for (const [dir, from] of [...base.laneOf].sort(([a], [b]) => ascending(a, b))) {
        const to = other.laneOf.get(dir);
        if (to !== from)
            moves.push({ dir, from, to });
    }
    const key = (h) => `${h.from}\t${h.to}`;
    const inBase = new Set(base.handoffs.map(key));
    const inOther = new Set(other.handoffs.map(key));
    return {
        checkouts: other.checkouts,
        moves,
        appearing: other.handoffs.filter((h) => !inBase.has(key(h))).map(({ from, to }) => ({ from, to })),
        disappearing: base.handoffs.filter((h) => !inOther.has(key(h))).map(({ from, to }) => ({ from, to })),
    };
}
export function cutReport(input, checkouts, tolerance) {
    const cut = cutAt(input, checkouts, tolerance);
    return {
        cut,
        plus: deltaOf(cut, cutAt(input, checkouts + 1, tolerance)),
        minus: checkouts > 1 ? deltaOf(cut, cutAt(input, checkouts - 1, tolerance)) : null,
    };
}
/** The lane's id in the proposal, and the name `lanes --assign` takes. */
export const laneId = (n) => `lane-${n}`;
/** Rule (h): the proposal document, `lanes` in the shape `readProposal` reads, the other keys restating the rows. */
export function proposalOf(cut) {
    return {
        checkouts: cut.checkouts,
        tolerance: cut.tolerance,
        bound: cut.bound,
        lanes: cut.lanes.map((members, i) => ({ id: laneId(i + 1), members })),
        handoffs: cut.handoffs.map((h) => ({ from: h.from, to: h.to, from_lane: laneId(h.fromLane), to_lane: laneId(h.toLane) })),
        no_areas: cut.noAreas,
        imbalance: cut.imbalance.map((i) => ({ lane: laneId(i.lane), size: i.size, members: i.members })),
    };
}
/** The `KEY=value` text `bin/fusion-campaign cut` prints; that script's header defines every line. */
export function renderCut(report, members, proposalPath) {
    const { cut } = report;
    const out = [`checkouts=${cut.checkouts}`, `tolerance=${cut.tolerance}`, `members=${members}`, `bound=${cut.bound}`];
    cut.lanes.forEach((lane, i) => {
        for (const dir of lane)
            out.push(`lane=${i + 1}\t${dir}`);
    });
    for (const h of cut.handoffs)
        out.push(`handoff=${[h.from, h.to, h.fromLane, h.toLane].join("\t")}`);
    for (const dir of cut.noAreas)
        out.push(`no-areas=${dir}`);
    out.push(`no-areas-count=${cut.noAreas.length}`);
    for (const i of cut.imbalance)
        out.push(`imbalance=${[i.lane, i.size, i.members.join(",")].join("\t")}`);
    const delta = (key, d) => {
        out.push(`${key}=checkouts\t${d.checkouts}`);
        for (const m of d.moves)
            out.push(`${key}=move\t${m.dir}\t${m.from}\t${m.to}`);
        for (const h of d.appearing)
            out.push(`${key}=handoff-appears\t${h.from}\t${h.to}`);
        for (const h of d.disappearing)
            out.push(`${key}=handoff-disappears\t${h.from}\t${h.to}`);
    };
    delta("delta-plus", report.plus);
    if (report.minus !== null)
        delta("delta-minus", report.minus);
    out.push(`proposal=${proposalPath}`);
    return out.join("\n") + "\n";
}
