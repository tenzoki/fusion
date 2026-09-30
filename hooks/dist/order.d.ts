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
 * by an `unmet=` row alone sits at depth 0 too, because the terminal target
 * it waits on is no node.
 *
 * `unmet-edges=` counts the `unmet=` rows: a condition the codec evaluated
 * against a terminal target and found unmet (`succeeded` on a dropped
 * package is the case). A dependency on a terminal package under `terminal`
 * is satisfied and prints nothing. `unresolved-edges=` counts the entries the
 * codec could not resolve to a listed package, each named with the codec's
 * reason. `unreadable-head=` counts the package rows that did not read, or
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
 *   3  the codec bundle is not installed, so nothing could be asked (the
 *      wrapper's own 3 covers the compiled hooks).
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
