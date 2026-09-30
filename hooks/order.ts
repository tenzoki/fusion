/**
 * The order the work-package store imposes on itself, read from JSON control
 * data through the codec and printed for a human or an agent to read.
 *
 * The computation is `lib/work-graph.ts`, and this is its only caller: no
 * hook runs it, no test gates on it, no pipeline step invokes it. Read that
 * module's header for what a node is, why a terminal package is outside the
 * graph, how each `reconcile` edge is placed, and why the figures measure
 * unfinished work only.
 *
 * Output, one `KEY=value` per line, then one row per item in the computed
 * order, prerequisites first, then the cycle, unmet, unresolved and
 * unreadable rows:
 *
 *   anchor=workbench-root
 *   items=7
 *   edges=5
 *   unmet-edges=1
 *   unresolved-edges=1
 *   cycles=1
 *   ready=3
 *   roots=3
 *   no-depends-on-field=4
 *   unreadable-head=1
 *   verdict=cyclic
 *   note=4 items carry an empty `depends_on` list …
 *      1      0       2  ready    <item-a>
 *      2      0       1  paused   <item-f>
 *      3      1       0  blocked  <item-b>
 *   cycle=<item-c>, <item-d>
 *   unmet=<item-h> wants <item-i> under succeeded: succeeded: the target is dropped, not done
 *   unresolved=<item-b> wants <record-id>: unresolved-reference/record-not-found
 *   unreadable=<item-g>: schema-invalid/conflict-markers
 *
 * The item row is five fixed columns (order, depth, blocks, readiness,
 * container name) in the indented shape `bin/fusion-plan-size` prints. The
 * readiness column reads `ready`, `blocked` or `paused`: the third is the
 * package's own `status` and overrides the other two whatever its edges,
 * because `ready` invites a reader to pick the item up and a paused item is
 * one somebody has set down. Its `depth` and `blocks` stay computed like any
 * node's, which is what puts "this paused item is blocking three others" in
 * front of a reader.
 *
 * `ready=` counts the items with no resolved edge and no `unmet=` row;
 * `roots=` counts the items at depth 0, where the order starts. A paused
 * item never counts in `ready=` and still counts at depth 0. An item blocked
 * by an `unmet=` row alone sits at depth 0 too, because the target it waits
 * on is no node.
 *
 * `unmet-edges=` counts the `unmet=` rows: a condition the codec evaluated
 * and found unmet against a target that is no node, because it is terminal
 * (`succeeded` on a dropped package), unreadable or unlisted; the dependent
 * is blocked all the same. A dependency on a terminal package under
 * `terminal` is satisfied and prints nothing. `unresolved-edges=` counts the
 * entries the codec could not resolve to a package, each named with the
 * codec's reason. `unreadable-head=` counts the package rows that did not read, or
 * that `reconcile` reported a finding against, each named with it.
 *
 * ## The `note=` line is mandatory, and it is a user's ruling rather than a
 * ## courtesy
 *
 * Whenever `no-depends-on-field=` or `unresolved-edges=` is above zero, one
 * `note=` line names the count and says that `ready=` is optimistic by it. An
 * empty `depends_on` list is no claim of independence, so an item with an
 * empty list and a genuinely prerequisite-free item are indistinguishable;
 * that con was accepted at the approval rather than designed away, on the
 * condition that the helper's own output state it
 * (`260908-2018_*_does-the-record-template-mandate-the-prerequisite-field-or-merely-permit-it.md`,
 * the `Answered:` line). The unresolved half says what the codec changed: a
 * satisfied terminal target is now told apart from an unresolved one, so
 * every entry left on an `unresolved=` row is one the codec could not
 * resolve, the dependent reads `ready` all the same, and an unresolved
 * prerequisite is no proof that the dependency condition holds. The line
 * closes by saying that this report authorises no dispatch (Prior's review of
 * the FJ03a plan, `## Order output and activation`).
 *
 * ## Exit codes, and the one that is deliberately NOT here
 *
 *   0  the check ran. `verdict=` says what it found.
 *   1  usage error.
 *   2  no fusion workbench above the working directory; nothing to compute.
 *   3  the plugin itself could not run: the codec bundle is not installed,
 *      so nothing could be asked (the wrapper's own 3 covers the compiled
 *      hooks), or an internal error stopped this entry (a module missing
 *      from an install, or a throw of the reader or `orderOf`), named on
 *      stderr with its stack and nothing on stdout.
 *   4  the workbench was not read: refused by the gate (`legacy`,
 *      `unsupported`), or the codec refused a read or gave no answer, a
 *      blocked recovery among them wherever the protocol reports it. The
 *      cause is on stderr and NOTHING is on stdout: a named failure and no
 *      usable success output.
 *
 * **No exit code carries the result**, the stdout-verdict rule
 * `bin/fusion-plan-size`, `bin/fusion-review-coverage`, `bin/fusion-staging-drift`
 * and `bin/fusion-citation-check` all carry: a check that hands its result to
 * an exit code teaches its reader to ignore that code. A cycle is a finding
 * about the store, not a failure of this program.
 *
 * `verdict=empty` is a real answer and reaches exit 0 like the other two:
 * "there are no live work packages" is an answer about the project, and a
 * workbench that was not read must never be reported as one; that is what 3
 * and 4 are for.
 */

import { join } from "node:path";
import type { Failure } from "./lib/work-graph.js";

type Readers = { readWorkGraph: typeof import("./lib/work-graph.js").readWorkGraph; findWorkbenchRoot: typeof import("./lib/workbench-root.js").findWorkbenchRoot };

const USAGE = "usage: fusion-work-order";

/** The five fixed columns, in the indented shape `renderPlanRow` prints. */
function renderItemRow(row: {
  order: number;
  depth: number;
  blocks: number;
  readiness: string;
  dir: string;
}): string {
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
 * asserts nothing about readiness, that the doubt is unmeasurable from here,
 * and that the report authorises no dispatch.
 */
function caveat(noField: number, unresolved: number): string {
  const parts: string[] = [];
  if (noField > 0) {
    const items = noField === 1 ? "1 item carries" : `${noField} items carry`;
    parts.push(
      `${items} an empty \`depends_on\` list, and an empty list is no claim of ` +
        "independence: nobody is obliged to write a prerequisite down",
    );
  }
  if (unresolved > 0) {
    parts.push(
      `\`unresolved-edges=${unresolved}\` names entries the codec could not resolve to a ` +
        "package, and the dependent reads `ready` all the same; an unresolved prerequisite " +
        "is no proof that the dependency condition holds (a satisfied terminal target is " +
        "told apart from an unresolved one and prints no row)",
    );
  }
  return `note=${parts.join("; ")}. \`ready=\` is optimistic by ${
    parts.length === 1 ? "that count" : "those counts"
  }, nothing here can tell by how much, and this report authorises no dispatch.`;
}

/** One line naming why the workbench was not read, and the exit code that names it. */
function failure(f: Failure, workbench: string): { line: string; code: 3 | 4 } {
  const refusal = (r: { class: string; reason: string; detail?: string }): string => `${r.class}/${r.reason}${r.detail === undefined ? "" : `: ${r.detail}`}`;
  switch (f.cause) {
    case "legacy":
      return { code: 4, line: `the workbench at ${workbench} is legacy (no workbench.json: its control data is Markdown), which this version reads only once it has been migrated to JSON.` };
    case "unsupported":
      return { code: 4, line: `the workbench at ${workbench} is unsupported by this version's codec${f.diagnosis === null ? "" : ` (${refusal(f.diagnosis)})`}.` };
    case "unanswered":
      return f.how === "bundle-missing"
        ? { code: 3, line: `${f.detail}; nothing could be asked.` }
        : { code: 4, line: `the codec gave no answer to ${f.op} (${f.how}: ${f.detail}).` };
    case "refused":
      return { code: 4, line: `the codec refused ${f.op} (${refusal(f.refusal)}).` };
  }
}

function main(argv: string[], { readWorkGraph, findWorkbenchRoot }: Readers): number {
  if (argv.length > 0) {
    process.stderr.write(
      `fusion-work-order: unknown argument ${JSON.stringify(argv[0])}\n${USAGE}\n`,
    );
    return 1;
  }

  const root = findWorkbenchRoot();
  if (root === null) {
    process.stderr.write(
      "fusion-work-order: no fusion workbench above the working directory — nothing to compute.\n",
    );
    return 2;
  }

  const workbench = join(root, "fusion-workbench");
  const read = readWorkGraph(workbench);
  if (read.kind === "failed") {
    const f = failure(read, workbench);
    process.stderr.write(`fusion-work-order: ${f.line} No order was computed.\n`);
    return f.code;
  }
  const report = read.report;

  const out: string[] = [
    "anchor=workbench-root",
    `items=${report.items}`,
    `edges=${report.edges}`,
    `unmet-edges=${report.unmetEdges.length}`,
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

  for (const r of report.rows) out.push(renderItemRow(r));
  for (const c of report.cycles) out.push(`cycle=${c.members.join(", ")}`);
  for (const u of report.unmetEdges) out.push(`unmet=${u.from} wants ${u.to} under ${u.condition}: ${u.detail}`);
  for (const u of report.unresolvedEdges) out.push(`unresolved=${u.from} wants ${u.target}: ${u.reason}`);
  for (const d of report.unreadable) out.push(`unreadable=${d.dir}: ${d.problem.class}/${d.problem.reason}`);

  process.stdout.write(out.join("\n") + "\n");
  return 0;
}

// An internal error is 3, "the plugin itself could not run", and never Node's
// own 1, which is the usage error here. The modules are imported inside the
// `try`, so one missing from an incomplete install is caught like a throw of
// the reader or of `orderOf`.
try {
  const [{ readWorkGraph }, { findWorkbenchRoot }, { exitZeroOnStdoutEpipe }] = await Promise.all([import("./lib/work-graph.js"), import("./lib/workbench-root.js"), import("./lib/fail-open.js")]);
  exitZeroOnStdoutEpipe(); // the reader may close stdout first
  process.exitCode = main(process.argv.slice(2), { readWorkGraph, findWorkbenchRoot });
} catch (e) {
  process.stderr.write(`fusion-work-order: an internal error stopped the order entry, a fusion bug or an incomplete install and not the workbench's. No order was computed.\n${e instanceof Error ? e.stack : String(e)}\n`);
  process.exitCode = 3;
}
