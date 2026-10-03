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
 * Usage: `fusion-work-order [--format text|tsv|markdown|json]`. With no
 * argument, or with `--format text`, the output is the text format below, one
 * `KEY=value` per line, then one row per item in the computed order,
 * prerequisites first, then the cycle, unmet, unresolved and unreadable rows.
 * `--format tsv`, `--format json` and `--format markdown` print the same
 * computation as `## The TSV format`, `## The JSON format` and
 * `## The Markdown format` define. All four read one projection of the report,
 * so they cannot disagree.
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
 * ## The TSV format
 *
 * `--format tsv` prints the computation the text format prints — the same
 * figures, item order, cycles, unmet, unresolved and unreadable entries — and
 * computes nothing new. It exists so a consumer reads status and prerequisites
 * from here instead of reading the control files a second time. This section
 * is the contract; a consumer can be written from it alone.
 *
 * LAYOUT. UTF-8, no byte-order mark. Every line ends in one LF, the last
 * included; no CR, no blank line. Three parts in this order: comment lines,
 * exactly one header line, zero or more item rows. The header is printed even
 * with no rows (`verdict=empty`).
 *
 * COMMENT LINES. `#` then `key=value`, no space: strip the first character and
 * split at the first `=`. They appear in this fixed order:
 *
 *   #format=2                  always the first line; see COMPATIBILITY
 *   #anchor=workbench-root
 *   #items=  #edges=  #unmet-edges=  #unresolved-edges=  #cycles=  #ready=
 *   #roots=  #no-depends-on-field=  #unreadable-head=
 *                              one line each, in that order, each the integer
 *                              the text format prints under the same key
 *   #verdict=                  acyclic, cyclic or empty
 *   #note=                     the text format's caveat after its `note=`,
 *                              present exactly when the text format prints
 *                              that line
 *   #unreadable=<item>: <class>/<reason>
 *                              one per package row that did not read, as the
 *                              text format's `unreadable=` row, ascending by
 *                              item; none when unreadable-head is 0
 *
 * HEADER. Ten tab-separated column names; the first five are the text format's
 * five columns in its order:
 *
 *   order depth blocks readiness item status depends-on unmet unresolved cycle
 *
 * ROWS. One per live package, in the computed order. Terminal (`done`,
 * `dropped`) and archived packages are never rows.
 *
 *   order       integer, 1-based position, consecutive without gaps
 *   depth       integer, the longest prerequisite chain below the item; 0 for none
 *   blocks      integer, how many other live items wait on this one, transitively
 *   readiness   ready, blocked or paused, as the text format's column; paused is
 *               the package's own status and overrides the two derived values
 *   item        the container directory name, YYMMDD-HHMM-<slug>
 *   status      the package's own `status`: open, claimed or paused
 *   depends-on  the record ids its `depends_on` names, in the order `reconcile`
 *               reports them, satisfied, unmet and unresolved ones included,
 *               joined with `,` and no space; empty for an empty list, which
 *               `no-depends-on-field=` counts
 *   unmet       the targets of this item's `unmet=` rows, each once,
 *               ascending, joined with `,`: a container name, or the record id
 *               where no row named it; empty when there are none
 *   unresolved  the record ids of this item's `unresolved=` rows, each once,
 *               ascending, joined with `,`; empty when there are none
 *   cycle       0 when the item is in no cycle; otherwise the 1-based number of
 *               its cycle, counted in the order the text format prints its
 *               `cycle=` rows. A cycle's members are the rows sharing its
 *               number; a self-edge is a cycle of one
 *
 * ESCAPING. In every cell and every comment value: backslash `\\`, tab `\t`,
 * carriage return `\r`, line feed `\n`. Nothing else is escaped and nothing is
 * quoted. Item names, record ids and the fixed vocabularies never need it; the
 * rule exists so no value can ever break a row.
 *
 * ORDERINGS. Fixed and locale-independent: rows in the computed order, comment
 * lines as above, `#unreadable=` lines and the unmet and unresolved cells
 * ascending by code unit, depends-on in `reconcile`'s order. Two runs over an
 * unchanged store print identical bytes.
 *
 * EXIT CODES are the ones below and mean the same in every format. On every
 * non-zero exit stdout is empty and the reason is on stderr, so a consumer
 * never parses a partial stream. An unknown format name (`md` included: there
 * are no aliases), a missing value, `--format=tsv` as one token, a repeated
 * `--format` and any other argument are each a usage error.
 *
 * COMPATIBILITY. `#format=` is an integer, 2 for the format defined here.
 * Appending a column after the last one, or adding a comment key after
 * `#verdict=`/`#note=` and before the `#unreadable=` lines, leaves it
 * unchanged, and a consumer addresses columns by header name and ignores
 * columns and comment keys it does not know. Removing, renaming or reordering
 * a column or comment key, changing a value's meaning, vocabulary or encoding,
 * or changing the escaping rule raises it by one. Format 1 was the Markdown
 * reader's (fusion 12.1.0 to 12.2.3); 2 follows JSON control, which removed
 * the `field` column (a package always carries `depends_on`, so an absent
 * field and an empty one are no longer two states), added `#unmet-edges=` and
 * the `unmet` column, made `depends-on` and `unresolved` record ids, and gave
 * `#unreadable=` the codec's reason.
 *
 * ## The JSON format
 *
 * `--format json` prints the TSV's computation as one JSON object followed by
 * one LF: `JSON.stringify(value, null, 2)`, UTF-8, no byte-order mark. Keys
 * come in this fixed order, so two runs over an unchanged store print
 * identical bytes:
 *
 *   format       integer, 2 for this definition; see COMPATIBILITY
 *   anchor       "workbench-root"
 *   summary      object, the TSV comment keys `items` through `verdict` in
 *                their TSV order, the counts as numbers
 *   note         the TSV's `#note=` value as a string, or null where the TSV
 *                prints no such line. Always present: test the value, not the key
 *   items        array, one object per TSV row in the same order, keyed by the
 *                ten TSV header names in header order
 *   cycles       array of member arrays, in the order the `cycle` numbers count
 *   unmet        array of { item, target, condition, detail }, in the text
 *                format's order
 *   unresolved   array of { item, target, reason }, in the text format's order
 *   unreadable   array of { item, problem }, `problem` being `<class>/<reason>`,
 *                ascending by item
 *
 * Names and vocabularies are the TSV's; only the types differ. `order`,
 * `depth`, `blocks` and `cycle` are numbers (`cycle` is 0 for none, otherwise
 * the 1-based index into `cycles`); `depends-on` (`reconcile`'s order), `unmet`
 * and `unresolved` (ascending) are arrays of strings. Nothing is escaped
 * beyond what JSON requires. On `verdict: "empty"` every count but
 * `unreadable-head` is 0, `note` is null, `items`, `cycles`, `unmet` and
 * `unresolved` are empty, and `unreadable` names any unreadable package.
 *
 * COMPATIBILITY. `format` is versioned independently of the TSV's `#format=`.
 * Adding a key anywhere leaves it unchanged, and a consumer ignores keys it
 * does not know. Removing or renaming a key, or changing a value's type,
 * meaning or vocabulary, raises it by one: 1 was the Markdown reader's, 2
 * carries the TSV's format 2 changes and the typed `unmet`, `unresolved` and
 * `unreadable` arrays.
 *
 * ## The Markdown format
 *
 * `--format markdown` prints the same computation as GitHub-flavoured Markdown
 * for a person or a document, not for a parser. UTF-8, every line ends in one
 * LF, blocks are separated by exactly one blank line, in this order:
 *
 *   1. `<!-- fusion-work-order markdown format=2 -->`, the version marker.
 *   2. The summary as a bullet list, `- anchor: workbench-root` through
 *      `- verdict: …`, in the TSV comment order.
 *   3. `**Note:** <caveat>`, present exactly when the TSV prints `#note=`. The
 *      caveat is fusion's own Markdown and is emitted unescaped.
 *   4. One pipe table: the ten TSV header names, a delimiter row that
 *      right-aligns order, depth, blocks and cycle, then one row per item in
 *      the computed order, `depends-on`, `unmet` and `unresolved` joined with
 *      `, `. On `verdict=empty` the header and delimiter rows stand with no body.
 *   5. Each only when non-empty, a bold label paragraph, then a list:
 *      `**Cycles**` with `- 1: <member>, <member>` numbered as the `cycle`
 *      column; `**Unmet**` with `- <item> wants <target> under <condition>:
 *      <detail>`; `**Unresolved**` with `- <item> wants <target>: <reason>`;
 *      `**Unreadable**` with `- <item>: <problem>`.
 *
 * ESCAPING, in every table cell and list value (the note excepted): a
 * backslash before each of `\` `|` `` ` `` `*` `_` `~` `[` `]` `<` `>` `&`,
 * then tab, CR and LF as the references `&#9;`, `&#13;` and `&#10;`.
 * CommonMark renders a backslash before ASCII punctuation as the literal
 * character, so the rule is lossless and no value can break a row or a list
 * item.
 *
 * COMPATIBILITY. The marker's `format=` is raised on the JSON's terms; 2
 * carries the TSV's format 2 changes and the Unmet list.
 *
 * ## Exit codes, and the one that is deliberately NOT here
 *
 *   0  the check ran. `verdict=` says what it found.
 *   1  usage error: any argument but `--format` with one of `text`, `tsv`,
 *      `markdown`, `json`.
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
import type { Failure, WorkGraphReport } from "./lib/work-graph.js";

type Readers = { readWorkGraph: typeof import("./lib/work-graph.js").readWorkGraph; findWorkbenchRoot: typeof import("./lib/workbench-root.js").findWorkbenchRoot };

const FORMATS = ["text", "tsv", "markdown", "json"] as const;
type Format = (typeof FORMATS)[number];
const USAGE = `usage: fusion-work-order [--format ${FORMATS.join("|")}]`;

/** One item as every format prints it, keyed by the TSV header names in header order. */
type ViewRow = {
  order: number;
  depth: number;
  blocks: number;
  readiness: string;
  item: string;
  status: string;
  "depends-on": string[];
  unmet: string[];
  unresolved: string[];
  cycle: number;
};

/**
 * What every format prints, derived once. The four renderers read only this,
 * which is what makes "the same computation" a property of the code rather
 * than of four parallel sets of filters.
 */
type OrderView = {
  summary: [string, number | string][];
  note: string | null;
  rows: ViewRow[];
  cycles: string[][];
  unmet: { item: string; target: string; condition: string; detail: string }[];
  unresolved: { item: string; target: string; reason: string }[];
  unreadable: { item: string; problem: string }[];
};

const COLUMNS = ["order", "depth", "blocks", "readiness", "item", "status", "depends-on", "unmet", "unresolved", "cycle"] as const;

/** Once each, ascending by code unit, as the `unmet` and `unresolved` cells list them. */
const uniqueSorted = (values: string[]): string[] => [...new Set(values)].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));

function project(report: WorkGraphReport): OrderView {
  const unresolvedCount = report.unresolvedEdges.length;
  const cycleOf = new Map<string, number>();
  report.cycles.forEach((c, i) => c.members.forEach((m) => cycleOf.set(m, i + 1)));
  return {
    summary: [
      ["anchor", "workbench-root"],
      ["items", report.items],
      ["edges", report.edges],
      ["unmet-edges", report.unmetEdges.length],
      ["unresolved-edges", unresolvedCount],
      ["cycles", report.cycles.length],
      ["ready", report.rows.filter((r) => r.readiness === "ready").length],
      ["roots", report.rows.filter((r) => r.depth === 0).length],
      ["no-depends-on-field", report.noDependsOnField],
      ["unreadable-head", report.unreadableHead],
      ["verdict", report.verdict],
    ],
    note:
      report.noDependsOnField > 0 || unresolvedCount > 0
        ? caveat(report.noDependsOnField, unresolvedCount)
        : null,
    rows: report.rows.map((r) => ({
      order: r.order,
      depth: r.depth,
      blocks: r.blocks,
      readiness: r.readiness,
      item: r.dir,
      status: r.status,
      "depends-on": r.dependsOn,
      unmet: uniqueSorted(report.unmetEdges.filter((u) => u.from === r.dir).map((u) => u.to)),
      unresolved: uniqueSorted(report.unresolvedEdges.filter((u) => u.from === r.dir).map((u) => u.target)),
      cycle: cycleOf.get(r.dir) ?? 0,
    })),
    cycles: report.cycles.map((c) => c.members),
    unmet: report.unmetEdges.map((u) => ({ item: u.from, target: u.to, condition: u.condition, detail: u.detail })),
    unresolved: report.unresolvedEdges.map((u) => ({ item: u.from, target: u.target, reason: u.reason })),
    unreadable: report.unreadable.map((d) => ({ item: d.dir, problem: `${d.problem.class}/${d.problem.reason}` })),
  };
}

/** The five fixed columns, in the indented shape `renderPlanRow` prints. */
function renderItemRow(row: ViewRow): string {
  return [
    "  ",
    String(row.order).padStart(5),
    String(row.depth).padStart(7),
    String(row.blocks).padStart(8),
    "  ",
    row.readiness.padEnd(7),
    "  ",
    row.item,
  ].join("");
}

/**
 * The mandated caveat, without its `note=` prefix. It states each count that is above zero, why that count
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
  return `${parts.join("; ")}. \`ready=\` is optimistic by ${
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

/** The text format, the one `/fusion:wp-order` renders. */
function renderText(view: OrderView): string {
  const out = view.summary.map(([k, v]) => `${k}=${v}`);
  if (view.note !== null) out.push(`note=${view.note}`);
  for (const r of view.rows) out.push(renderItemRow(r));
  for (const c of view.cycles) out.push(`cycle=${c.join(", ")}`);
  for (const u of view.unmet) out.push(`unmet=${u.item} wants ${u.target} under ${u.condition}: ${u.detail}`);
  for (const u of view.unresolved) out.push(`unresolved=${u.item} wants ${u.target}: ${u.reason}`);
  for (const d of view.unreadable) out.push(`unreadable=${d.item}: ${d.problem}`);
  return out.join("\n") + "\n";
}

/** Spec'd escaping for every TSV cell and comment value: backslash first, then tab, CR, LF. */
function esc(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/\t/g, "\\t").replace(/\r/g, "\\r").replace(/\n/g, "\\n");
}

/** The `## The TSV format` stream. */
function renderTsv(view: OrderView): string {
  const comments: [string, string | number][] = [["format", 2], ...view.summary];
  if (view.note !== null) comments.push(["note", view.note]);
  for (const d of view.unreadable) comments.push(["unreadable", `${d.item}: ${d.problem}`]);

  const lines = comments.map(([k, v]) => `#${k}=${esc(String(v))}`);
  lines.push(COLUMNS.join("\t"));
  for (const r of view.rows) {
    const cells = COLUMNS.map((c) => {
      const v = r[c];
      return Array.isArray(v) ? v.join(",") : String(v);
    });
    lines.push(cells.map(esc).join("\t"));
  }
  return lines.join("\n") + "\n";
}

/** The `## The JSON format` object. */
function renderJson(view: OrderView): string {
  const [[, anchor], ...counts] = view.summary;
  return (
    JSON.stringify(
      {
        format: 2,
        anchor,
        summary: Object.fromEntries(counts),
        note: view.note,
        items: view.rows,
        cycles: view.cycles,
        unmet: view.unmet,
        unresolved: view.unresolved,
        unreadable: view.unreadable,
      },
      null,
      2,
    ) + "\n"
  );
}

/**
 * `## The Markdown format` escaping: a backslash before each listed ASCII
 * punctuation character first, then the three control characters as numeric
 * references — in that order, so the references' own `&` stays unescaped.
 */
function mdEsc(value: string): string {
  return value
    .replace(/[\\|`*_~[\]<>&]/g, "\\$&")
    .replace(/\t/g, "&#9;")
    .replace(/\r/g, "&#13;")
    .replace(/\n/g, "&#10;");
}

/** The `## The Markdown format` document. */
function renderMarkdown(view: OrderView): string {
  const blocks: string[] = ["<!-- fusion-work-order markdown format=2 -->"];
  blocks.push(view.summary.map(([k, v]) => `- ${k}: ${mdEsc(String(v))}`).join("\n"));
  if (view.note !== null) blocks.push(`**Note:** ${view.note}`);

  const numeric = new Set<string>(["order", "depth", "blocks", "cycle"]);
  const tableRow = (cells: string[]) => `| ${cells.join(" | ")} |`;
  const table = [
    tableRow([...COLUMNS]),
    tableRow(COLUMNS.map((c) => (numeric.has(c) ? "---:" : "---"))),
    ...view.rows.map((r) =>
      tableRow(
        COLUMNS.map((c) => {
          const v = r[c];
          return Array.isArray(v) ? v.map(mdEsc).join(", ") : mdEsc(String(v));
        }),
      ),
    ),
  ];
  blocks.push(table.join("\n"));

  const listBlock = (label: string, items: string[]) => {
    if (items.length > 0) blocks.push(`**${label}**`, items.map((i) => `- ${i}`).join("\n"));
  };
  listBlock("Cycles", view.cycles.map((c, i) => `${i + 1}: ${c.map(mdEsc).join(", ")}`));
  listBlock("Unmet", view.unmet.map((u) => `${mdEsc(u.item)} wants ${mdEsc(u.target)} under ${mdEsc(u.condition)}: ${mdEsc(u.detail)}`));
  listBlock("Unresolved", view.unresolved.map((u) => `${mdEsc(u.item)} wants ${mdEsc(u.target)}: ${mdEsc(u.reason)}`));
  listBlock("Unreadable", view.unreadable.map((d) => `${mdEsc(d.item)}: ${mdEsc(d.problem)}`));
  return blocks.join("\n\n") + "\n";
}

const RENDERERS: Record<Format, (view: OrderView) => string> = {
  text: renderText,
  tsv: renderTsv,
  markdown: renderMarkdown,
  json: renderJson,
};

/** No argument is text; `--format <name>` with one of the four names is that format; anything else is null. */
function parseFormat(argv: string[]): Format | null {
  if (argv.length === 0) return "text";
  if (argv.length === 2 && argv[0] === "--format") {
    return FORMATS.find((f) => f === argv[1]) ?? null;
  }
  return null;
}

function main(argv: string[], { readWorkGraph, findWorkbenchRoot }: Readers): number {
  const format = parseFormat(argv);
  if (format === null) {
    process.stderr.write(
      `fusion-work-order: unknown argument ${JSON.stringify(argv.join(" "))}\n${USAGE}\n`,
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
  process.stdout.write(RENDERERS[format](project(read.report)));
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
