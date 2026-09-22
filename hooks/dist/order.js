/**
 * The order the work-item store imposes on itself, printed for a human or an
 * agent to read.
 *
 * The computation is `lib/work-graph.ts`, and this is its only caller — no hook
 * runs it, no test gates on it, no pipeline step invokes it. Read that module's
 * header for what a node is, why a `done` item is outside the graph, and why
 * the figures measure unfinished work only.
 *
 * Output, one `KEY=value` per line, then one row per item in the computed
 * order, prerequisites first, then the cycle and unresolved rows:
 *
 *   anchor=workbench-root
 *   items=7
 *   edges=5
 *   unresolved-edges=2
 *   cycles=1
 *   ready=3
 *   roots=3
 *   no-depends-on-field=4
 *   unreadable-head=1
 *   verdict=cyclic
 *   note=4 items carry no `**Depends-on:**` field …
 *      1      0       2  ready    <item-a>
 *      2      0       1  paused   <item-f>
 *      3      1       0  blocked  <item-b>
 *   cycle=<item-c>, <item-d>
 *   unresolved=<item-b> wants <item-e>.md
 *   unreadable=<item-g>
 *
 * The item row is five fixed columns — order, depth, blocks, readiness,
 * container name — in the indented shape `bin/fusion-plan-size` prints. The
 * readiness column reads `ready`, `blocked` or `paused`: the third is the
 * item's own `**Status:**` and overrides the other two whatever its out-edges,
 * because `ready` invites a reader to pick the item up and a paused item is one
 * somebody has set down. Its `depth` and `blocks` stay computed like any node's,
 * which is what puts "this paused item is blocking three others" in front of
 * a reader.
 *
 * `ready=` counts the items with no RESOLVED unmet prerequisite; `roots=`
 * counts the items at depth 0, where the order starts. A paused item never
 * counts in `ready=`, and `roots=` still counts it at depth 0, which is
 * correct. The two are equal in an acyclic store with no paused item in it, and
 * differ where a cycle sits at depth 0 — a cycle's member has a prerequisite
 * inside its own component and is never `ready` — or where a paused item does.
 *
 * `ready=` is optimistic by up to two counts, and the module header says why:
 * `no-depends-on-field=` (an absent field asserts nothing) and
 * `unresolved-edges=` (an entry naming live work in a form the grammar does not
 * define blocks nothing here, and only the terminal-target dangle is genuinely
 * no edge). Neither is measurable from here.
 *
 * `unreadable-head=` counts the item-form records whose head yields no readable
 * `**Status:**`, each named on an `unreadable=` row. A terminal item is outside
 * the graph by ruling and is not among them.
 *
 * ## The `note=` line is mandatory, and it is a user's ruling rather than a
 * ## courtesy
 *
 * Whenever `no-depends-on-field=` or `unresolved-edges=` is above zero, one
 * `note=` line names the count and says that `ready=` is optimistic by it. The
 * template's field is permitted rather than mandated and is absent when there
 * is nothing to say, so an absent field and a genuinely prerequisite-free item
 * are indistinguishable. That con was accepted at the gate rather than designed
 * away, on the condition that the helper's own output state it instead of
 * leaving a reader to infer it
 * (`260908-2018_*_does-the-record-template-mandate-the-prerequisite-field-or-merely-permit-it.md`,
 * the `Answered:` line). The unresolved half joined on the same reasoning: the
 * evidence was already on the page as `unresolved=` rows while the `ready` word
 * beside the dependent contradicted it. The line kind is `bin/fusion-forum`'s:
 * a degradation that changed the answer, stated rather than hidden.
 *
 * ## Exit codes, and the one that is deliberately NOT here
 *
 *   0  the check ran. `verdict=` says what it found.
 *   1  usage error.
 *   2  no fusion workbench above the working directory; nothing to compute.
 *
 * **No exit code carries the verdict**, the stdout-verdict rule
 * `bin/fusion-plan-size`, `bin/fusion-review-coverage`, `bin/fusion-staging-drift`
 * and `bin/fusion-citation-check` all carry: a check that hands its verdict to
 * an exit code teaches its reader to ignore that code. A cycle is a finding
 * about the store, not a failure of this program.
 *
 * `verdict=empty` is a real answer and reaches exit 0 like the other two: "there
 * are no live work items" is an answer about the project, and a broken install
 * must never be reported as one — that is the wrapper's own exit 3.
 */
import { computeWorkGraph } from "./lib/work-graph.js";
import { findWorkbenchRoot } from "./lib/workbench-root.js";
import { exitZeroOnStdoutEpipe } from "./lib/fail-open.js";
// The reader may close stdout first; see exitZeroOnStdoutEpipe.
exitZeroOnStdoutEpipe();
const USAGE = "usage: fusion-work-order";
/** The five fixed columns, in the indented shape `renderPlanRow` prints. */
function renderItemRow(row) {
    return [
        "  ",
        String(row.order).padStart(5),
        String(row.depth).padStart(7),
        String(row.blocks).padStart(8),
        "  ",
        row.readiness.padEnd(7),
        "  ",
        row.dir,
    ].join("");
}
/**
 * The mandated caveat. It states each count that is above zero, why that count
 * asserts nothing about readiness, and that the doubt is unmeasurable from
 * here — all three, because all three are what the gate accepted.
 */
function caveat(noField, unresolved) {
    const parts = [];
    if (noField > 0) {
        const items = noField === 1 ? "1 item carries" : `${noField} items carry`;
        parts.push(`${items} no \`**Depends-on:**\` field, and an absent field is not a claim of ` +
            "independence: the grammar says the field is absent when there is nothing to say");
    }
    if (unresolved > 0) {
        parts.push(`\`unresolved-edges=${unresolved}\` names entries that resolved to no node, and a ` +
            "dependent whose entry names live work in a form the grammar does not define " +
            "reads `ready` all the same (only an entry naming a terminal item is genuinely no edge)");
    }
    return `note=${parts.join("; ")}. \`ready=\` is optimistic by ${parts.length === 1 ? "that count" : "those counts"}, and nothing here can tell by how much.`;
}
function main(argv) {
    if (argv.length > 0) {
        process.stderr.write(`fusion-work-order: unknown argument ${JSON.stringify(argv[0])}\n${USAGE}\n`);
        return 1;
    }
    const root = findWorkbenchRoot();
    if (root === null) {
        process.stderr.write("fusion-work-order: no fusion workbench above the working directory — nothing to compute.\n");
        return 2;
    }
    const report = computeWorkGraph(root);
    const out = [
        "anchor=workbench-root",
        `items=${report.items}`,
        `edges=${report.edges}`,
        `unresolved-edges=${report.unresolvedEdges.length}`,
        `cycles=${report.cycles.length}`,
        `ready=${report.rows.filter((r) => r.readiness === "ready").length}`,
        `roots=${report.rows.filter((r) => r.depth === 0).length}`,
        `no-depends-on-field=${report.noDependsOnField}`,
        `unreadable-head=${report.unreadableHead}`,
        `verdict=${report.verdict}`,
    ];
    if (report.noDependsOnField > 0 || report.unresolvedEdges.length > 0) {
        out.push(caveat(report.noDependsOnField, report.unresolvedEdges.length));
    }
    for (const r of report.rows)
        out.push(renderItemRow(r));
    for (const c of report.cycles)
        out.push(`cycle=${c.members.join(", ")}`);
    for (const u of report.unresolvedEdges)
        out.push(`unresolved=${u.from} wants ${u.entry}`);
    for (const d of report.unreadable)
        out.push(`unreadable=${d}`);
    process.stdout.write(out.join("\n") + "\n");
    return 0;
}
process.exitCode = main(process.argv.slice(2));
