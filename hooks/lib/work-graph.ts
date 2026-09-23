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
 * `archive/**` IS NEVER OPENED. Only the container roots are read, so an
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
 * ## Two figures describe what the store does NOT say
 *
 * `noDependsOnField` counts the nodes carrying no `**Depends-on:**` field at
 * all. An absent field and a genuinely prerequisite-free item are
 * indistinguishable — the grammar says the field is absent when there is
 * nothing to say. `unresolvedEdges` names every entry that resolved to no
 * node, and an item whose only entries are there reads `ready`: correct where
 * the entry names a terminal item (the G1 ruling above), and an unmet
 * prerequisite where it names live work in a form the grammar does not define
 * (a container name, a missing `.md`, a typo, an archived target), which the
 * literal lookup cannot tell apart. So `readiness` is optimistic by up to those
 * two counts, and nothing here measures by how much. Both costs were accepted
 * at user gates rather than designed away, and the caller is obliged to say so
 * whenever either count is above zero.
 *
 * A third figure, `unreadableHead`, describes what this module could NOT read:
 * an item-form record whose head yields no `**Status:**` in the five-value
 * vocabulary. It is reported by name and never guessed at.
 */

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { ITEM_RECORD_RE } from "./citation-corpus.js";
import { containerRoots } from "./stores.js";

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
  /** Item-form records whose head yields no readable `**Status:**`, by container name. */
  unreadable: string[];
  /** `unreadable.length`, the figure the caller prints beside `noDependsOnField`. */
  unreadableHead: number;
  /** `empty` when there are no nodes; `cyclic` when any cycle was found. */
  verdict: "acyclic" | "cyclic" | "empty";
}

/** Code-unit comparison, so the order is the same in every locale. */
function ascending(a: string, b: string): number {
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
function headBlock(text: string): string[] {
  const head: string[] = [];
  let opened = false;
  for (const line of text.split("\n")) {
    if (line.trim() === "---") {
      if (opened) break;
      opened = true;
      continue;
    }
    if (/^#{2,6}\s/.test(line)) break;
    if (opened) head.push(line);
  }
  return head;
}

/** One head field's value, or null when the field is absent. */
function headField(head: string[], name: string): string | null {
  const re = new RegExp(`^\\*\\*${name}:\\*\\*\\s*(.*)$`);
  for (const line of head) {
    const m = re.exec(line.trim());
    if (m) return m[1].trim();
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
 * Read `root`'s work-item store and return the ordering report.
 *
 * `root` is the project root — the directory holding `fusion-workbench/`, which
 * is what `findWorkbenchRoot` returns and what the callers of `lib/plan-size.ts`
 * and `lib/staging-drift.ts` pass. A root with no workbench, or a workbench with
 * no container root, is a real answer and not a failure: zero items and
 * `verdict=empty`.
 *
 * A container holding no record of its own name is skipped in silence — that is
 * every terminal Circle container, and there is nothing to report about one.
 * Two further kinds of record are outside the node set, FOR DIFFERENT REASONS,
 * and only one of them is silent. A terminal item (`done`, `dropped`) is outside
 * by the user's ruling at G1, and nothing is reported. An item-form record whose
 * head yields no readable `**Status:**` — the field absent, or a value outside
 * the five — is outside because a parse failed, and that is reported: the
 * record is named in `unreadable`, so a reader can tell "no live items" from
 * "one live item this module could not read". `/fusion:archive` reports the
 * same condition as a workbench-state fault, and the two consumers of one field
 * must not disagree on whether it is worth saying.
 */
export function computeWorkGraph(root: string): WorkGraphReport {
  const wb = join(root, "fusion-workbench");
  const nodes: WorkItemNode[] = [];
  const unreadable: string[] = [];
  const seen = new Set<string>();
  let noDependsOnField = 0;

  for (const top of containerRoots(wb)) {
    const rootDir = join(wb, top);
    if (!existsSync(rootDir)) continue;
    for (const entry of readdirSync(rootDir, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const base = `${entry.name}.md`;
      // The new root is read first, so a package standing under both roots
      // mid-migration is one node, read where it now lives.
      if (seen.has(entry.name) || !ITEM_RECORD_RE.test(`${top}/${entry.name}/${base}`)) continue;
      seen.add(entry.name);

      let text: string;
      try {
        text = readFileSync(join(rootDir, entry.name, base), "utf-8");
      } catch {
        continue;
      }

      const head = headBlock(text);
      const status = headField(head, "Status");
      // An allowlist of the live values, not a denylist of the terminal ones:
      // a terminal status is outside by ruling and silent; anything else is a
      // head this module could not read, and that is named rather than dropped.
      if (status === "done" || status === "dropped") continue;
      if (status !== "open" && status !== "claimed" && status !== "paused") {
        unreadable.push(entry.name);
        continue;
      }

      const raw = headField(head, "Depends-on");
      if (raw === null) noDependsOnField += 1;
      const dependsOn =
        raw === null
          ? []
          : raw
              .split(",")
              .map((s) => s.trim())
              .filter((s) => s.length > 0);

      nodes.push({ dir: entry.name, base, status, dependsOn });
    }
  }

  nodes.sort((a, b) => ascending(a.base, b.base));
  unreadable.sort(ascending);

  // --- edges ---------------------------------------------------------------
  // Resolution is a lookup in the node map and never a citation scan: the
  // scanner resolves against the whole workbench, where a decision record
  // sharing a basename would resolve an entry that names no work item at all.
  // An entry is compared literally, so a name written in any other form than
  // the basename the grammar defines is reported rather than guessed at.
  const byBase = new Map<string, number>();
  nodes.forEach((n, i) => byBase.set(n.base, i));

  const out: number[][] = nodes.map(() => []);
  const unresolvedEdges: UnresolvedEdge[] = [];
  const seenEdge = new Set<string>();
  const seenDangle = new Set<string>();
  let edges = 0;

  nodes.forEach((n, i) => {
    for (const entry of n.dependsOn) {
      const j = byBase.get(entry);
      if (j === undefined) {
        const key = `${n.dir} ${entry}`;
        if (seenDangle.has(key)) continue;
        seenDangle.add(key);
        unresolvedEdges.push({ from: n.dir, entry });
        continue;
      }
      const key = `${i} ${j}`;
      if (seenEdge.has(key)) continue;
      seenEdge.add(key);
      out[i].push(j);
      edges += 1;
    }
  });

  unresolvedEdges.sort(
    (a, b) => ascending(a.from, b.from) || ascending(a.entry, b.entry),
  );

  // --- components ----------------------------------------------------------
  const comp = stronglyConnected(out);
  const componentCount = comp.length === 0 ? 0 : Math.max(...comp) + 1;
  const members: number[][] = Array.from({ length: componentCount }, () => []);
  nodes.forEach((_, i) => members[comp[i]].push(i));
  for (const m of members) m.sort((a, b) => ascending(nodes[a].base, nodes[b].base));

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
  // Ties break on the component's smallest member basename, which is
  // chronological then lexical for a `YYMMDD-HHMM-` name and identical across
  // runs. The condensation is a DAG, so every component is emitted.
  const remaining = prereqs.map((p) => p.size);
  const emitted: number[] = [];
  const pending = new Set<number>();
  for (let c = 0; c < componentCount; c++) if (remaining[c] === 0) pending.add(c);

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
            : out[i].length === 0
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
    unresolvedEdges,
    cycles,
    rows,
    noDependsOnField,
    unreadable,
    unreadableHead: unreadable.length,
    verdict,
  };
}
