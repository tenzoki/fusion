# Is a completed plan amended when one of its verification lines turns out unreachable, or is the filed defect enough?

---
**Domain:** code
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>
**Cross-references:** `260908-1619_*_plan-step-5-prescribes-a-minute-illustration-its-own-acceptance-criterion-forbids.md`, `260908-1648_*_plan-step-7-asks-for-eight-changed-golden-blocks-where-seven-bound-agents-exist.md`, `260908-1720_*_plan-step-8s-third-verification-expects-a-hash-count-of-zero-that-a-third-passage-makes-unreachable.md`, `260908-1845-orchestrator-byte-reckoning.md`, `260908-1852-reconciliation.md`

---

## Question

Four passages of `260907-1450_*_plan-bounded-executor-dispatches.md` and its specification state a
figure the tree contradicts, and in three of the four the same step's own instructions are what make
the figure unreachable. The build is right in every case; what is wrong is the text an executor reads.
The plan is now complete and carries the closed marker, so the question is what happens to that text.

Filed at the Rebalance gate of session `260908-1529-orchestrator-session.md`, on the user's choice of
*Revise Grounding* after the reconciler returned `review-needed` with the recommendation
`revise Grounding`. Nothing in this workbench decides it today, and the session that met it four
times is the right one to raise it.

**The four, and one of them is not like the others.**

1. Step 5's `## When you read the clock.` prescribes an overshoot illustration in minutes while the
   same step's acceptance criterion and its `Do not:` line forbid any number of minutes in the file.
2. Step 7 asks for "exactly eight blocks" in the regenerated golden and its acceptance criterion names
   seven, which is the count seven bound agents produce.
3. Step 8's third verification expects `grep -c '045a14f\|f38f37d' agents/orchestrator.md` to reach 0,
   while a third passage carrying `f38f37d` is one the same step forbids moving. It reads 1.
4. `## Where this Circle stops` asks whether four pinned values are byte-identical to `abcaa823`.
   `RULE_BASELINE` is not, by a comment block another checkout rewrote in `01e0f688` before this
   session began, with every numeric entry unchanged.

The first three are self-contradictions inside one step. The fourth is a clause falsified from
outside, by a commit this Circle did not make, and an answer may reasonably treat the two kinds
differently.

## Options

1. **Amend the plan and the specification in place, marker notwithstanding.** Correct the four
   passages so the text matches what was actually asked and actually done.
   - Pros: the next reader of either document is not misled; a plan is read again long after it
     closes, by reconciliation passes and by whoever writes the next plan of the same shape.
   - Cons: editing a completed plan rewrites the record of what an executor was told, which is the
     evidence the four filed defects rest on. It also reopens a document whose closed marker says it
     is finished.
2. **Leave both documents exactly as they are; the filed defects are the correction.** Each of the
   four is recorded, cited from the plan's reconciliation log, and reachable from the plan by that
   log.
   - Pros: preserves what was asked, which is what makes the defects legible at all; costs nothing;
     matches how a closed issue keeps its `Resolved:` note when later reasoning reverses it.
   - Cons: a reader who opens the plan without the reconciliation log reads four false figures and
     has no signal that anything is wrong with them.
3. **Annotate in place without rewriting: leave every original figure and add one line beside each
   naming the record that corrects it.** The plan's `## Reconciliation Log` already does this at
   document level; this would do it at the four sites.
   - Pros: the reader meets the correction where the error is, and nothing is erased.
   - Cons: a third convention beside the reconciliation log and the defect records, and it still
     edits a document whose marker says complete.

## Constraints

Whatever is chosen holds for the specification too, which is `_o_` and carries the upstream copy of
the first contradiction. And no answer may delete the evidence the four defect records cite: their
acceptance tests are written against the text as it stands.

## Recommendation

None. The trade in options 1 and 3 is between a reader who is misled and a record that is preserved,
and this project has ruled both ways before — a closed issue keeps its original `Resolved:` note and
gains a `Revised by:` line, which is option 3's shape, while `CLAUDE.md` rows are corrected in place.
Which precedent governs a completed plan is exactly what is open.
