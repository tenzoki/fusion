/**
 * The order the work-package store imposes on itself, printed for a human or an
 * agent to read.
 *
 * The computation is `lib/work-graph.ts`, and this is its only caller — no hook
 * or pipeline step runs it, and no test gates on its verdict. Read that module's
 * header for what a node is, why a `done` item is outside the graph, and why
 * the figures measure unfinished work only.
 *
 * Usage: `fusion-work-order [--format text|tsv|markdown|json]`. With no
 * argument, or with `--format text`, the output is the text format below, one
 * `KEY=value` per line, then one row per item in the computed order,
 * prerequisites first, then the cycle and unresolved rows. `--format tsv`,
 * `--format json` and `--format markdown` print the same computation as
 * `## The TSV format`, `## The JSON format` and `## The Markdown format` define.
 * All four read one projection of the report, so they cannot disagree.
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
 * are indistinguishable. That con was accepted at the approval rather than designed
 * away, on the condition that the helper's own output state it instead of
 * leaving a reader to infer it
 * (`260908-2018_*_does-the-record-template-mandate-the-prerequisite-field-or-merely-permit-it.md`,
 * the `Answered:` line). The unresolved half joined on the same reasoning: the
 * evidence was already on the page as `unresolved=` rows while the `ready` word
 * beside the dependent contradicted it. The line kind is `bin/fusion-forum`'s:
 * a degradation that changed the answer, stated rather than hidden.
 *
 * ## The TSV format
 *
 * `--format tsv` prints the computation the text format prints — the same
 * figures, item order, cycles, unresolved entries and unreadable records — and
 * computes nothing new. It exists so a consumer reads status and prerequisites
 * from here instead of parsing the records a second time. This section is the
 * contract; a consumer can be written from it alone.
 *
 * LAYOUT. UTF-8, no byte-order mark. Every line ends in one LF, the last
 * included; no CR, no blank line. Three parts in this order: comment lines,
 * exactly one header line, zero or more item rows. The header is printed even
 * with no rows (`verdict=empty`).
 *
 * COMMENT LINES. `#` then `key=value`, no space: strip the first character and
 * split at the first `=`. They appear in this fixed order:
 *
 *   #format=1                  always the first line; see COMPATIBILITY
 *   #anchor=workbench-root
 *   #items=  #edges=  #unresolved-edges=  #cycles=  #ready=  #roots=
 *   #no-depends-on-field=  #unreadable-head=
 *                              one line each, in that order, each the integer
 *                              the text format prints under the same key
 *   #verdict=                  acyclic, cyclic or empty
 *   #note=                     the text format's caveat after its `note=`,
 *                              present exactly when the text format prints
 *                              that line (see the `note=` section below)
 *   #unreadable=<item>         one per record whose head yields no readable
 *                              status, ascending; none when unreadable-head is 0
 *
 * HEADER. Ten tab-separated column names; the first five are the text format's
 * five columns in its order:
 *
 *   order depth blocks readiness item status field depends-on unresolved cycle
 *
 * ROWS. One per live item, in the computed order. Terminal (`done`, `dropped`)
 * and archived items are never rows.
 *
 *   order       integer, 1-based position, consecutive without gaps
 *   depth       integer, the longest prerequisite chain below the item; 0 for none
 *   blocks      integer, how many other live items wait on this one, transitively
 *   readiness   ready, blocked or paused, as the text format's column; paused is
 *               the item's own status and overrides the two derived values
 *   item        the container directory name, YYMMDD-HHMM-<slug>
 *   status      the item's own `**Status:**`: open, claimed or paused
 *   field       present when the head carries a `**Depends-on:**` line, even an
 *               empty one; absent when it carries none. Only this column tells
 *               an absent field from an empty one: an absent field asserts
 *               nothing, and no in-cell marker could be told from an entry
 *               spelled the same way
 *   depends-on  the field's entries as written, in file order, unresolved ones
 *               included, joined with `,` and no space. Empty when field is
 *               absent and when it is present but empty. An entry cannot hold a
 *               comma: the field's grammar splits on commas
 *   unresolved  this item's entries that resolved to no live item, each once,
 *               ascending, joined with `,`; empty when there are none. An entry
 *               naming a terminal or archived item is here and stays in
 *               depends-on, as the text format's `unresolved=` rows report it
 *   cycle       0 when the item is in no cycle; otherwise the 1-based number of
 *               its cycle, counted in the order the text format prints its
 *               `cycle=` rows. A cycle's members are the rows sharing its
 *               number; a self-edge is a cycle of one
 *
 * ESCAPING. In every cell and every comment value: backslash `\\`, tab `\t`,
 * carriage return `\r`, line feed `\n`. Nothing else is escaped and nothing is
 * quoted. Item names and the fixed vocabularies never need it; the rule exists
 * so an entry written by hand can never break a row.
 *
 * ORDERINGS. Fixed and locale-independent: rows in the computed order, comment
 * lines as above, `#unreadable=` lines and the unresolved cell ascending by
 * code unit, depends-on in file order. Two runs over an unchanged store print
 * identical bytes.
 *
 * EXIT CODES are the ones below and mean the same in every format. On every
 * non-zero exit stdout is empty and the reason is on stderr, so a consumer
 * never parses a partial stream. An unknown format name (`md` included: there
 * are no aliases), a missing value, `--format=tsv` as one token, a repeated
 * `--format` and any other argument are each a usage error.
 *
 * COMPATIBILITY. `#format=` is an integer, 1 for the format defined here.
 * Appending a column after the last one, or adding a comment key after
 * `#verdict=`/`#note=` and before the `#unreadable=` lines, leaves it
 * unchanged, and a consumer addresses columns by header name and ignores
 * columns and comment keys it does not know. Removing, renaming or reordering
 * a column or comment key, changing a value's meaning, vocabulary or encoding,
 * or changing the escaping rule raises it by one.
 *
 * ## The JSON format
 *
 * `--format json` prints the TSV's computation as one JSON object followed by
 * one LF: `JSON.stringify(value, null, 2)`, UTF-8, no byte-order mark. Keys
 * come in this fixed order, so two runs over an unchanged store print
 * identical bytes:
 *
 *   format       integer, 1 for this definition; see COMPATIBILITY
 *   anchor       "workbench-root"
 *   summary      object, the TSV comment keys `items` through `verdict` in
 *                their TSV order, the counts as numbers
 *   note         the TSV's `#note=` value as a string, or null where the TSV
 *                prints no such line. Always present: test the value, not the key
 *   items        array, one object per TSV row in the same order, keyed by the
 *                ten TSV header names in header order
 *   cycles       array of member arrays, in the order the `cycle` numbers count
 *   unresolved   array of { item, entry }, in the text format's order
 *   unreadable   array of item names, ascending
 *
 * Names and vocabularies are the TSV's; only the types differ. `order`,
 * `depth`, `blocks` and `cycle` are numbers (`cycle` is 0 for none, otherwise
 * the 1-based index into `cycles`); `depends-on` (file order) and `unresolved`
 * (ascending) are arrays of strings; `field` stays "present" or "absent".
 * Nothing is escaped beyond what JSON requires. On `verdict: "empty"` every
 * count but `unreadable-head` is 0, `note` is null, `items`, `cycles` and
 * `unresolved` are empty, and `unreadable` names any unreadable record.
 *
 * COMPATIBILITY. `format` is versioned independently of the TSV's `#format=`.
 * Adding a key anywhere leaves it unchanged, and a consumer ignores keys it
 * does not know. Removing or renaming a key, or changing a value's type,
 * meaning or vocabulary, raises it by one.
 *
 * ## The Markdown format
 *
 * `--format markdown` prints the same computation as GitHub-flavoured Markdown
 * for a person or a document, not for a parser. UTF-8, every line ends in one
 * LF, blocks are separated by exactly one blank line, in this order:
 *
 *   1. `<!-- fusion-work-order markdown format=1 -->`, the version marker.
 *   2. The summary as a bullet list, `- anchor: workbench-root` through
 *      `- verdict: …`, in the TSV comment order.
 *   3. `**Note:** <caveat>`, present exactly when the TSV prints `#note=`. The
 *      caveat is fusion's own Markdown and is emitted unescaped.
 *   4. One pipe table: the ten TSV header names, a delimiter row that
 *      right-aligns order, depth, blocks and cycle, then one row per item in
 *      the computed order, `depends-on` and `unresolved` joined with `, `. On
 *      `verdict=empty` the header and delimiter rows stand with no body.
 *   5. Each only when non-empty, a bold label paragraph, then a list:
 *      `**Cycles**` with `- 1: <member>, <member>` numbered as the `cycle`
 *      column; `**Unresolved**` with `- <item> wants <entry>`; `**Unreadable**`
 *      with `- <item>`.
 *
 * ESCAPING, in every table cell and list value (the note excepted): a
 * backslash before each of `\` `|` `` ` `` `*` `_` `~` `[` `]` `<` `>` `&`,
 * then tab, CR and LF as the references `&#9;`, `&#13;` and `&#10;`.
 * CommonMark renders a backslash before ASCII punctuation as the literal
 * character, so the rule is lossless and no value can break a row or a list
 * item.
 *
 * COMPATIBILITY. The marker's `format=` is raised on the JSON's terms.
 *
 * ## Exit codes, and the one that is deliberately NOT here
 *
 *   0  the check ran. `verdict=` says what it found.
 *   1  usage error: any argument but `--format` with one of `text`, `tsv`,
 *      `markdown`, `json`.
 *   2  no fusion workbench above the working directory; nothing to compute.
 *   3  (the wrapper `bin/fusion-work-order`, before this program runs) the
 *      plugin's compiled hooks are missing.
 *
 * **No exit code carries the result**, the stdout-verdict rule
 * `bin/fusion-plan-size`, `bin/fusion-review-coverage`, `bin/fusion-staging-drift`
 * and `bin/fusion-citation-check` all carry: a check that hands its result to
 * an exit code teaches its reader to ignore that code. A cycle is a finding
 * about the store, not a failure of this program.
 *
 * `verdict=empty` is a real answer and reaches exit 0 like the other two: "there
 * are no live work packages" is an answer about the project, and a broken install
 * must never be reported as one — that is the wrapper's own exit 3.
 */
export {};
