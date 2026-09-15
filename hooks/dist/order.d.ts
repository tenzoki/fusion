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
 *   verdict=cyclic
 *   note=4 items carry no `**Depends-on:**` field …
 *      1      0       2  ready    <item-a>
 *      2      0       1  paused   <item-f>
 *      3      1       0  blocked  <item-b>
 *   cycle=<item-c>, <item-d>
 *   unresolved=<item-b> wants <item-e>.md
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
 * `ready=` counts the items with no unmet prerequisite; `roots=` counts the
 * items at depth 0, where the order starts. A paused item never counts in
 * `ready=`, and `roots=` still counts it at depth 0, which is correct. The two
 * are equal in an acyclic store with no paused item in it, and differ where a
 * cycle sits at depth 0 — a cycle's member has a prerequisite inside its own
 * component and is never `ready` — or where a paused item does.
 *
 * ## The `note=` line is mandatory, and it is a user's ruling rather than a
 * ## courtesy
 *
 * Whenever `no-depends-on-field=` is above zero, one `note=` line says that an
 * absent field is not a claim of independence and that `ready=` is optimistic
 * by that count. The template's field is permitted rather than mandated and is
 * absent when there is nothing to say, so an absent field and a genuinely
 * prerequisite-free item are indistinguishable. That con was accepted at the
 * gate rather than designed away, on the condition that the helper's own output
 * state it instead of leaving a reader to infer it
 * (`260908-2018_*_does-the-record-template-mandate-the-prerequisite-field-or-merely-permit-it.md`,
 * the `Answered:` line). The line kind is `bin/fusion-forum`'s: a degradation
 * that changed the answer, stated rather than hidden.
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
export {};
