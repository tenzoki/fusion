# The decision procedure tells an agent "the model stays exact" for the two commands that delete a protected rule file

---

**Severity:** High
**Domain:** code (documentation of a security control)
**Filed by:** reconciler, closing pass of session `260803-1737-orchestrator-session.md`
**Affects:** `rules/protected-path-discipline.md:172` — the file loaded into every agent's context on every dispatch in every consuming project
**Kind:** NEW in `c9c44a3` (the section did not exist before the separator-conditioned degrade). Not caught by the Turn 7 review, which measured the code's verdicts and read this section as describing them.
**Cross-references:**
`260804-0836_*_…` and `260804-0837_*_…` (the two live defects this sentence denies),
`rules/protected-path-discipline.md:551-568` (where the same file states both defects correctly),
`rules/protected-path-discipline.md:261-262` (where the same file corrects the `&&` premise),
`hooks/lib/bash-mutation-guard.ts:2465` (the degrade condition), `:1990` (`state.moved`).

---

## What is wrong

`rules/protected-path-discipline.md:168` opens a section headed **"The rule, so you can predict a case this file does not list"**. It is the block the document hands an agent as its reasoning tool for commands the file does not enumerate — the whole point of shipping the rule rather than a table. It offers three ordered questions. Question 2 reads:

> 2. **Is every joiner between that builtin and the write an `&&`?** Yes → the model stays
>    exact and this rule denies nothing.

Run that procedure on `true || cd build && rm rules/x.md`. There is a directory builtin, so question 1 passes it on. Every joiner between `cd build` and `rm rules/x.md` is `&&`, so question 2 answers **yes**, and the document then tells the agent the model stays exact.

The model is not exact. The `cd` never runs, the shell stays at the project root, and `rm rules/x.md` deletes a protected rule file. Measured in both shells on `260804-0836_*_a-cd-skipped-by-an-earlier-double-pipe-is-still-modelled-as-made-so-the-and-guarantee-leaks.md`; the guard allows it.

The same procedure returns the same reassurance for `echo hi | cd build && rm rules/x.md`, which bash subshells and which deletes the same file (`260804-0837_*_a-cd-inside-a-pipeline-runs-in-a-subshell-in-bash-and-the-model-follows-it-anyway.md`).

So the document's decision procedure returns the *safe* answer for exactly the two commands the Circle's own review calls a release blocker.

## Measured

`classifyBashMutation` at HEAD `cc012fc`, shipped protected list:

```
  allow  true || cd build && rm rules/x.md      <- question 2 says "yes", doc says exact
  allow  echo hi | cd build && rm rules/x.md    <- question 2 says "yes", doc says exact
  DENY   cd build; rm rules/x.md                <- question 2 says "no", doc says denied. Correct.
  DENY   cd rules && rm x.md                    <- modelled, lands on the list. Correct.
  allow  cd build && rm out.js                  <- modelled, lands off it. Correct.
```

The last three rows are why this is a documentation defect rather than a restatement of `260804-0836_*_a-cd-skipped-by-an-earlier-double-pipe-is-still-modelled-as-made-so-the-and-guarantee-leaks.md`. Everything else in the section is right. The clause "and this rule denies nothing" is right — that rule does deny nothing there. The only wrong words are **"the model stays exact"**, and they are the words that tell the agent the outcome is safe rather than merely un-denied.

## Why the file's own honesty section does not repair it

`rules/protected-path-discipline.md:568` says:

> the sentence "the guard's model of where the shell is standing is exact for every `cd`
> written in the command text and reached by a path the shell guarantees" is **not** true,
> and nothing in this file should be read as claiming it.

Line 172 claims it, 396 lines earlier, in the affirmative, inside the section an agent is told to reason from. A disclaimer in the appendix of a 629-line file does not repair an assertion in the middle of its decision procedure — and the agent that reaches for the procedure is by definition the one that has not read to the end.

The same file has a second, milder instance at `:152-154`: "**Write `&&`, not `;`.** … `&&` is the only joiner it accepts as an answer: bash will not run the right-hand side unless the left-hand side returned zero." That is narrowly true of the and-or list and is offered as the answer to whether the `cd` succeeded, which it is not. It is corrected 107 lines later at `:261-262` ("It guarantees that the and-or list to its *left* returned zero, not that the segment immediately before it ran"). Misleading at the point of statement, repaired downstream.

`README-hooks.md:184` states the same rule **without** the exactness claim and names both open leaks four sentences later. It does not carry this defect. The two files diverged.

## Why this is filed separately from `260804-0836_*_a-cd-skipped-by-an-earlier-double-pipe-is-still-modelled-as-made-so-the-and-guarantee-leaks.md` / `260804-0837_*_a-cd-inside-a-pipeline-runs-in-a-subshell-in-bash-and-the-model-follows-it-anyway.md`

Those two are code defects with one decision (`260804-0947_*_should-the-joiner-be-consulted-for-the-segment-that-moves-as-well-as-the-one-that-writes.md`) between them. This is a documentation defect that survives whichever way that decision goes: if option 1 is taken, line 172 becomes true and should be re-verified rather than assumed; if the decision is deferred, line 172 is actively steering agents wrong in the meantime, and that is worth fixing in isolation because it costs one clause.

It is also filed separately because it is the shape this Circle keeps meeting on the *documentation* side — a correct measurement written up one word too strongly. The Turn 8 handover names it as the method note that has now cost three Turns: *"What has failed, three times running, is one inference laid over correct data."* This is the fourth.

## Recommended fix

Delete "the model stays exact and" from `:172`. The remainder — "this rule denies nothing" — is true, sufficient, and is what question 2 is actually about. Then add the pointer the section is missing: that a "yes" at question 2 means *this rule* is silent, not that the command is safe, and that `:551-568` lists what is still open.

Optionally move the `&&` correction from `:261-262` up to `:152-154`, so the premise is not stated strongly and softened a hundred lines later.

None of this is behavioural, so it can land in the same commit as anything else.

## Anti-vacuity

A lint that greps for "exact" in this file would be theatre. What would actually catch the next one: the two open leaks each carry a row in `rules/protected-path-discipline.md`'s illustration block, and any sentence in the file that a reader could apply to those two rows must be checked against them. That is a review instruction, not a test, and it is worth writing into the Step 9 task rather than into the suite.

## Origin

Found by the reconciler's documentation audit during the closing pass of session `260803-1737-orchestrator-session.md`, by running the document's own three-question procedure against the two issues the same session left open.

---

**Step 3 disposition (coder, 2026-08-05) — branch A, text corrected. CLOSING, together with `260804-1223_*_260804-1025s-reproduction-is-stale-but-its-clause-still-overclaims-here-are-the-commands-that-replace-it.md`.**

The clause is gone. `rules/protected-path-discipline.md` question 3 now reads "Yes →
**this rule** denies nothing. That is the whole of what a 'yes' here buys", followed by the
pointer this issue's § Recommended fix asks for: it is not a statement that the directory
model is exact and not a statement that the command is safe, and the modifier, wrapper,
`CDPATH` and fail-closed rules each have their own section and can each deny a command that
answers all four questions the reassuring way.

The three rows the question now names are measured rather than carried over. One trap on
the way, worth recording because it would have produced a false green: **`hooks/dist` is
stale at this commit** (step 5 owns the rebuild), and measured against it all three rows
*allow*. Measured against the TypeScript source built fresh into a scratch directory,
shipped protected list, `env: {}`:

```
DENY   cd -P build && rm out.js
DENY   command cd build && rm out.js
DENY   pushd -n build && rm out.js
```

**The milder second instance is untouched, and that is a decision rather than an
oversight.** This issue also names `### A cd is tracked`'s "**Write `&&`, not `;`** … `&&`
is the only joiner it accepts as an answer", stated strongly and corrected a hundred lines
later. After step 2's split the correction sits in `rules/protected-path-internals.md`,
which is loaded by three agents rather than sixteen — but the paragraph's own next
sentences are the joiner table and the rule read from it, and the table answers the
question the strong sentence overstates. The premise is no longer softened downstream; it
is qualified in place. No edit was needed and none was made.

**Optional item declined.** The suggestion to move the `&&` correction up is superseded by
the same split.
