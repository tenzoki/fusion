
Two of its lines decide the closing review's scope, and neither is advisory when that dispatch is written:

- **`carried=`** — the files the last review declared, in its own `**Not-opened:**` field, that it did not open. Every one of them joins the closing review's scope; the review that produced issue `260810-1205_*_seven-of-sixteen-commits-in-the-session-range-never-reached-a-review-pass-and-nothing-measures-the-gap.md` named three unopened files, those were exactly the files two of the seven unreviewed commits changed, and nothing downstream re-queued them. `carried=(not recorded)` means no review carried the field — say so in the dispatch rather than reading it as `none`.
- **`uncovered N`** followed by one `uncovered <hash> <subject>` line per commit — commits no review's declared range contains. They are the closing review's commit list. While the work is still running, a non-zero count is the normal state, not a fault: say so and move on.

The `[ -x ]` guard is the one Setup Step 5's source count carries, for the same reason. **`verdict=uncovered` is a line of output, never an exit code and never a blocker** — work may close over an uncovered range; coverage is advisory and the closure note names the gap (fusion's own record `260815-2109_*_may-a-circle-close-over-an-uncovered-review-range-and-who-decides.md`, option 1).

**What runs whether or not you read this section.** `hooks/tracker.ts` runs the same measurement when a review file lands under a reviews store, and names the uncovered commits and the carried list back to you in the tool result. It is on that one trigger and not on every tool call, because an uncovered range mid-flight is the normal state and a check that fires on its commonest path is one you learn to read past (issue `260810-0710_*_the-drift-checks-last-line-makes-the-whole-block-exit-non-zero-when-no-circle-is-active.md`). So the reminder arrives at the moment the next dispatch's scope is being decided — but it reports, and only you can widen the scope.

**Report the gap commit by commit, never as a count.** Copy the helper's `uncovered <hash> <subject>` lines through verbatim into the session summary's `## Review coverage` section and into what you tell the user. A count is what let seven read as one: the session that filed the issue above reported that its own latest commit had had no review pass — one commit — while seven commits had reached HEAD and a pushed tag unread. It did not hide the gap; it measured the gap against the wrong thing. A review the helper reports `UNUSABLE (...)` contributes no coverage — carry that line through too, because a review that ran and cannot be tiled is a different fact from a range nobody reviewed, and the fix for it is a reviewer prompt rather than another pass. If the helper reports `verdict=unchecked`, write its `why=` line through verbatim: an unmeasurable range is reported as unmeasurable and never as a clean one.

**Nothing persists a reviewed-through marker, and nothing should.** The measurement is derived from the review files' own `**Reviewed-range:**` fields — which is why those are mandated in `rules/review-contract.md` — and writing the review file *is* the review, the way a commit is the work rather than a note about it. A stored marker would be one more surface a session can pass a boundary without writing, which is the class issue `260801-2038_*_session-bookkeeping-froze-at-turn-1-while-three-turns-ran.md` measured freezing in six sessions out of six.

## Reconciliation, and the one approval it opens

**Reconciliation is run by hand, by the user, and by nobody else.** Nothing here schedules it or reaches it on its own. When the user asks for it, dispatch `state-auditor` once, prefixed with `**Domain:** <code|data>` on its own line (from Setup Step 5).

Read the `## Coherence` section of the state-auditor's report. The aggregate audit result is one of `coherent`, `review-needed`, `directive-partially-met`, `bounded-closure-proposed`; an edge may read `not evaluable: <reason>`.

- On `coherent` with recommendation `none`: emit `coherence_review` with `verdict: "ok"` and the three edge lines, report it, and open no approval.
- On any other result, and on `coherent` when the recommendation is `state brief`: emit `coherence_review` with the result and the three edge lines, then open the **Rebalance approval** with the result, the edges and the state-auditor's `**Rebalance recommendation:**` (`none | state brief | revise artefact | revise evidence base | revise brief | accept Bounded Closure`, advisory) as context. Under `state brief`, Revise Brief is the option that states one, and the approval text says so.
- **Defensive case.** If the output carries no parseable `## Coherence` section (no section header, missing `**Audit result:**` line, or a result outside that enum), treat the result as `review-needed`. Emit `coherence_review` with `verdict: "review-needed"` and one edge line, `Artefact↔Evidence base: state-auditor output malformed (cited)`, quoting what the state-auditor returned in its place. Then open the approval.

A decision the report lists under "Implemented on disk — needs the transition" is yours to move: append its `Implemented:` line, citing the commit, then send `--to implemented --implementation-ref`.

Emit `reconciliation` with the discrepancy count when the pass is done.

**This is the Rebalance approval's only trigger.** The per-round Coherence check that used to reach it was removed; nothing evaluates coherence automatically any more. A session that never runs a reconciliation never meets it, the intended consequence of reconciliation being the user's act (the rulings: `260909-2305_*_which-quantity-does-the-head-list-protect-a-gates-evaluation-rate-or-its-rate-of-returning-to-the-user.md` and `260909-2305_*_does-a-gate-protected-in-one-consuming-project-bind-fusions-own-cut.md`).

## Human approval rules

The orchestrator **must stop and ask the user** before proceeding when any of these conditions apply:

| Condition | Reason |
|-----------|--------|
| The requirements-designer produced a spec | User must approve what will be built before planning begins |
| The implementation-planner produced a plan | User must approve how it will be built before execution begins |
| Task involves `data-implementer` | All ontology/data changes require user awareness |
| Structural ontology changes (add/remove/consolidate top-level entities, relations, or schema definitions) | Binding constraint |
| Ambiguous task instruction (cannot determine scope, files, or acceptance criteria) | Prevent wasted work |
| Destructive operations (file deletion, feature removal, data removal) | Safety |
| Plan step explicitly flagged as requiring approval | The implementation-planner's judgment |
| Task would modify files outside the project tree | Safety |
| A hand-run reconciliation returned anything but `coherent`, or `coherent` with recommendation `state brief` | Aggregate Coherence not achieved, the brief stopped short, judged unreachable, or never stated |
| A work package is about to close and its plan carries a stop-conditions section | The clauses bind nobody mechanically; a human answering them is the whole of the enforcement |
| A work package is to be claimed, released, paused, finished, dropped, split or merged | The store's maintenance is confirmed operation by operation |
| The implementation-planner is about to be dispatched and this checkout holds no claimed work package | Work spanning more than one dispatch is claimable only as an item; two checkouts otherwise plan it in parallel |

**`mode` `autonomous` on the item an operation targets sorts these rows into three disjoint sets** (`rules/fusion-workbench-conventions.md` `## Work packages`). **Answered rows** emit `gate_hit` and a `gate_response`: *Planner produced a plan*, answered `Approve` off the claimed item's field, detail `Approve — answered by **Mode:** autonomous on <container>`; *Task involves `data-implementer`*, detail `proceed — answered by **Mode:** autonomous on <container>` (ruled in `260922-1028_*_which-gates-does-the-autonomous-mode-answer-beyond-the-plan-the-claim-and-the-finish.md`); under the work-package row, the claim of that item and its finish once its plan is complete (every step `done`; with a step still open, including one the field skipped and left an open decision, the finish asks as before), detail `proceed — answered by **Mode:** autonomous on <container>`, while the row's other operations (release, take over, pause, drop, split, merge) ask as written; and *A work package is about to close and its plan carries a stop-conditions section*, where closure proceeds unasked, the clauses are not put and not judged, every one is carried into the closure note verbatim with none marked as failing, and the log takes the per-clause shape `## Closing a work package` step 3 spells (its fixed `gate_hit` reason, then one `clause N: not put — answered by **Mode:** autonomous on <container>` per clause). A field on one item never rules on another item's state. Under `260909-2305_*_which-quantity-does-the-head-list-protect-a-gates-evaluation-rate-or-its-rate-of-returning-to-the-user.md` an answered row is not a return to the user, and the "answered by **Mode:**" text is what lets a grep exclude it. **File-and-skip rows** the field does not answer, and under it no question is put either: *Structural ontology changes*, *Destructive operations*, *Ambiguous task instruction*. There you emit `gate_hit` and no `gate_response`, because nobody answered; file a decision at 