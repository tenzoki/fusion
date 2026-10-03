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
export {};
