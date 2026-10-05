The rewritten texts name the party of a transition three ways, and an implementer moves a decision to a terminal state before its verification is read
---
FJ03d step 6 settled that an implementer writes its `Resolved:` note and the dispatcher sends the transition after reading `Verification:`. Three passages on `fj03d` do not say that. One names a reviewing agent as the sender. One reads as a single actor appending the note and transitioning. And for a decision the implementer still sends `--to implemented` itself, into a state no edge leaves.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Cross-references:** 261004-2212_*_plan-fj03d-rules-prompts-and-live-predicates-switched-with-this-workbench-in-one-window.md, 260929-1810_*_the-shipped-prompts-disagree-on-who-moves-which-marker-and-one-names-a-marker-no-vocabulary-has.md

Severity: Medium. Scope: `rules/fusion-workbench-conventions.md` (`### When to update`, `### Issue files`), `agents/orchestrator.md` (`### Step 3 — read the return`, the bullet "Mark the source complete"; `## Scope`), `agents/code-implementer.md` (`### Working from the dispatch prompt`, item 3), `agents/data-implementer.md` (the paragraph "Decision realisation"), `agents/implementation-planner.md` (`## Open decisions as planning input, and the ones you file yourself`), `rules/decision-record-examples.md` (Example 1), all on `fj03d` at `cd1b5522`.

**The three passages.**

1. `rules/fusion-workbench-conventions.md` `### When to update`, fourth bullet: "When a review confirms a plan step, issue, or decision is done: the reviewing agent transitions it." `agents/reviewer.md` names no `transition` and states the agent never modifies and only reports; `agents/orchestrator.md` `## Scope` says `bin/fusion-write transition` on issues, plans and their steps is the dispatch loop's. The bullet was translated from "the reviewing agent marks it" and now gives a third party an operation no prompt hands it.
2. `rules/fusion-workbench-conventions.md` `### Issue files`: "When an issue is resolved, append below the narrative's content ... Then `transition --to closed --disposition ...`", addressed to one reader. `agents/code-implementer.md` (`### Working from the dispatch prompt`, item 3) says the implementer appends the note and the state moves "by whoever dispatched you ..., never by you". `agents/orchestrator.md` "Mark the source complete" says "the issue's `Resolved:` note, then `--to closed --disposition`", which reads as the orchestrator writing the note too. A session following all three writes the note twice or leaves open who writes it. `agents/data-implementer.md` carries no sentence on an issue's or a plan step's state at all, where its sibling does.
3. Decision to `implemented`: `agents/code-implementer.md` "append `Implemented: ...` and `transition --to implemented --implementation-ref --actor code-implementer`", `agents/data-implementer.md` "you MUST append ... and run `bin/fusion-write transition --to implemented ...`", `agents/implementation-planner.md` "whose executor then transitions it to `implemented` after the commit", and Example 1 of `rules/decision-record-examples.md`. `agents/orchestrator.md` `## Scope` lists `answered`, `deferred` and `superseded` as its decision transitions and leaves `implemented` out. So the executor sends it, before the dispatcher has read `Verification:`. `implemented` is terminal (`codec/contract/transitions.json`: the only edge out is to `superseded`), so a decision transitioned on a change whose verification then fails cannot be put back to `answered`. The plan's step-6 note states the opposite for this line too ("They write `Resolved:` / `Implemented:` and the dispatcher transitions after reading `Verification:`").

**Why it matters.** Issue 260929-1810 asks that each passage name the operation "and the one party that may send it". For an issue and a plan step the prompts now do; the rule file they cite does not, and for a decision the party differs from the one the plan recorded.

**Acceptance.**

1. `### When to update` names no party the prompts give no transition to: the bullet names the dispatcher, or is removed.
2. `### Issue files` and the orchestrator's "Mark the source complete" bullet say who appends `Resolved:` (the executor) and who transitions (the dispatcher), once each; `agents/data-implementer.md` carries the same sentence as `agents/code-implementer.md`.
3. For `implemented`, one of two, and the text says which: the dispatcher sends it after reading `Verification:` (then `agents/orchestrator.md` `## Scope` lists it, and both implementer prompts, the planner's sentence and Example 1 change), or the executor keeps it by the user's ruling and the step-6 note of the FJ03d plan is corrected.
4. `reference-resolution-lint` and the dispatch-path bound are green; no baseline moves.

Executor: `code-implementer`; item 3 needs the user's ruling first.
