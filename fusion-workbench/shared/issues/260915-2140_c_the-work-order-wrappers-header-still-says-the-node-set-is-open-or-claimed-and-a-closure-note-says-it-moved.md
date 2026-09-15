The work-order wrapper's header still says the node set is `open` or `claimed`, and a closure note says it moved
---
`hooks/order.ts` and `bin/fusion-work-order` carry the same three pieces of prose about the report. The change corrected the copy in `hooks/order.ts` and left the copy in `bin/fusion-work-order` untouched, so the shipped helper's own header — which `CLAUDE.md` names as that helper's authoritative documentation — states the node set, the readiness column and the `ready=`/`roots=` relation as they stood before `paused` existed.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Cross-references:** 260915-2028_*_a-fifth-status-value-for-work-items.md, 260910-2011_*_the-deferred-state-has-no-value-in-the-work-items-status-set.md

**Evidence.** Three stale statements, all in `bin/fusion-work-order`:

- `:31` — "A node is a work item whose `**Status:**` is `open` or `claimed`." False at HEAD; `hooks/lib/work-graph.ts` admits `paused` and the corrected statement is in that module's header.
- `:27-29` — "`ready=` counts the items with no unmet prerequisite and `roots=` the items at depth 0 …; the two are equal in an acyclic store and differ only where a cycle sits at depth 0." False: a paused node is at depth 0 and never `ready`, so the two differ there too. `hooks/order.ts:38-44` was corrected on exactly this sentence.
- `:21-22` — the worked example prints only `ready` and `blocked`, and the five-column note beneath it does not name the third value. `hooks/order.ts:21-35` gained both.

Verified against a scratch store rather than inferred: a store holding one `paused` item, one dependent, and one item of each other status prints `items=4`, the paused item at `readiness=paused` with `blocks 1`, its dependent `blocked`, and no `unresolved=` line — the plan's own manual stop condition, which the behaviour meets.

**And the closure note asserts the file moved.** `260910-2011_*_the-deferred-state-has-no-value-in-the-work-items-status-set.md`, `Resolved:` note: "`hooks/order.ts` **and `bin/fusion-work-order`** print the widened column". `git diff v11.2.0..HEAD --stat` lists no file under `bin/`. `rules/critical-stance.md` §3: the claim is unverified and stated as checked.

**Scope.** `bin/` is on no growth bound, so the correction costs nothing anybody has to fund.

**Acceptance.** `bin/fusion-work-order`'s header states the live node set as `open`, `claimed` or `paused`, names `paused` in the readiness column note and in the `ready=`/`roots=` sentence, and the closure note's file list matches the diff.

Resolved: all three statements in `bin/fusion-work-order`'s header now match `hooks/order.ts`. The node set reads "`open`, `claimed` or `paused`"; the five-column note names the third readiness value and says it overrides the other two whatever the item's out-edges, its `depth` and `blocks` staying computed; the `ready=`/`roots=` sentence says a paused item never counts in `ready=` and still counts at depth 0, so the two are equal only in an acyclic store with no paused item in it. The worked example gained a `paused` row. `bin/` is on no growth bound, so the correction was funded by nothing. The closure note on `260910-2011_*_the-deferred-state-has-no-value-in-the-work-items-status-set.md` carried the overstatement and now carries a `Corrected 260915:` clause naming what did not hold and what does now.
