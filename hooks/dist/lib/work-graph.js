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
 * A NODE IS A WORK-ITEM RECORD WHOSE `**Status:**` IS `open` OR `claimed`.
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
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { ITEM_RECORD_RE } from "./citation-corpus.js";
/** Code-unit comparison, so the order is the same in every locale. */
function ascending(a, b) {
    return a < b ? -1 : a > b ? 1 : 0;
}
/**
 * The head block: the lines between the record's opening `---` and whichever
 * comes first, its closing `---` or a body section heading.
 *
 * BOUNDED ON PURPOSE. A record's prose quotes its own field names — the item
 * that carries this store's only `**Depends-on:**` value explains in its body
 * what the field is for — so a field scan over the whole file would read a
 * sentence about the grammar as an instance of it. The H1 title above the
 * opening `---` is not a section heading and does not end anything.
 */
function headBlock(text) {
    const head = [];
    let opened = false;
    for (const line of text.split("\n")) {
        if (line.trim() === "---") {
            if (opened)
                break;
            opened = true;
            continue;
        }
        if (/^#{2,6}\s/.test(line))
            break;
        if (opened)
            head.push(line);
    }
    return head;
}
/** One head field's value, or null when the field is absent. */
function headField(head, name) {
    const re = new RegExp(`^\\*\\*${name}:\\*\\*\\s*(.*)$`);
    for (const line of head) {
        const m = re.exec(line.trim());
        if (m)
            return m[1].trim();
    }
    return null;
}
/**
 * Tarjan's strongly connected components over `out`, returning a component id
 * per node. Ids come back in reverse topological order of the condensation;
 * nothing downstream relies on that, because Kahn re-derives the order with the
 * tie-break the report needs.
 *
 * Recursive, and the recursion depth is the number of live work items — a
 * backlog, not a data set.
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
export function computeWorkGraph(root) {
    const circles = join(root, "fusion-workbench", "circles");
    const nodes = [];
    let noDependsOnField = 0;
    if (existsSync(circles)) {
        for (const entry of readdirSync(circles, { withFileTypes: true })) {
            if (!entry.isDirectory())
                continue;
            const base = `${entry.name}.md`;
            if (!ITEM_RECORD_RE.test(`circles/${entry.name}/${base}`))
                continue;
            let text;
            try {
                text = readFileSync(join(circles, entry.name, base), "utf-8");
            }
            catch {
                continue;
            }
            const head = headBlock(text);
            const status = headField(head, "Status");
            if (status !== "open" && status !== "claimed")
                continue;
            const raw = headField(head, "Depends-on");
            if (raw === null)
                noDependsOnField += 1;
            const dependsOn = raw === null
                ? []
                : raw
                    .split(",")
                    .map((s) => s.trim())
                    .filter((s) => s.length > 0);
            nodes.push({ dir: entry.name, base, status, dependsOn });
        }
    }
    nodes.sort((a, b) => ascending(a.base, b.base));
    // --- edges ---------------------------------------------------------------
    // Resolution is a lookup in the node map and never a citation scan: the
    // scanner resolves against the whole workbench, where a decision record
    // sharing a basename would resolve an entry that names no work item at all.
    // An entry is compared literally, so a name written in any other form than
    // the basename the grammar defines is reported rather than guessed at.
    const byBase = new Map();
    nodes.forEach((n, i) => byBase.set(n.base, i));
    const out = nodes.map(() => []);
    const unresolvedEdges = [];
    const seenEdge = new Set();
    const seenDangle = new Set();
    let edges = 0;
    nodes.forEach((n, i) => {
        for (const entry of n.dependsOn) {
            const j = byBase.get(entry);
            if (j === undefined) {
                const key = `${n.dir} ${entry}`;
                if (seenDangle.has(key))
                    continue;
                seenDangle.add(key);
                unresolvedEdges.push({ from: n.dir, entry });
                continue;
            }
            const key = `${i} ${j}`;
            if (seenEdge.has(key))
                continue;
            seenEdge.add(key);
            out[i].push(j);
            edges += 1;
        }
    });
    unresolvedEdges.sort((a, b) => ascending(a.from, b.from) || ascending(a.entry, b.entry));
    // --- components ----------------------------------------------------------
    const comp = stronglyConnected(out);
    const componentCount = comp.length === 0 ? 0 : Math.max(...comp) + 1;
    const members = Array.from({ length: componentCount }, () => []);
    nodes.forEach((_, i) => members[comp[i]].push(i));
    for (const m of members)
        m.sort((a, b) => ascending(nodes[a].base, nodes[b].base));
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
    // Ties break on the component's smallest member basename, which is
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
            if (pick === -1 || ascending(nodes[members[c][0]].base, nodes[members[pick][0]].base) < 0) {
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
                readiness: out[i].length === 0 ? "ready" : "blocked",
            });
        }
    }
    const verdict = nodes.length === 0 ? "empty" : cycles.length > 0 ? "cyclic" : "acyclic";
    return {
        items: nodes.length,
        edges,
        unresolvedEdges,
        cycles,
        rows,
        noDependsOnField,
        verdict,
    };
}
