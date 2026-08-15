# Step 7 named a `review-coverage` sender set that does not exist, and its removal orphaned `SCAN_INVESTIGATIONS`

---
**Severity:** Medium
**Domain:** code
**Filed by:** coder, executing plan step 7 (`conceptrev` removal)
**Affects:** `circles/260815-0007-remove-eight-mechanisms-and-cap-growth/planning/260815-0029_*_plan-remove-eight-mechanisms-and-cap-growth.md` step 7; `hooks/lib/review-coverage.ts`; `bin/fusion-paths`
**Cross-references:** `shared/issues/260811-1145_*_conceptrev-review-files-are-scanned-and-trigger-the-coverage-report-though-no-mandate-covers-them.md`; plan step 8; plan `## Open questions`

---

## The defect

Step 7's fifth Changes bullet reads:

> `hooks/lib/review-coverage.ts` and `review-coverage-mandate.test.ts`: remove `conceptrev`
> from the recognised sender set. Note `shared/issues/260811-1145_o_…` — that open defect is
> retired by this step and should be transitioned `_o_` → `_c_` with a `Resolved:` footer
> citing the removal.

Both halves are false at HEAD `6350854`, and they are false in different ways.

**There is no sender set to edit.** `grep -n conceptrev hooks/lib/review-coverage.ts` returns
nothing, and `review-coverage-mandate.test.ts:68` already fixes `REVIEWER_PROMPTS` to
`["coderev.md", "ontorev.md"]`. `reviewFiles()` takes every `*.md` under every reviews store
with **no** sender filter at all — which is precisely what `260811-1145` was filed about. The
bullet asks for the removal of a discriminator whose absence is the defect.

**The removal does not retire `260811-1145`.** The defect is that the scan has no sender
filter, not that a `conceptrev` agent exists. Deleting the agent stops new `conceptrev`
assessments from being written; it does nothing about the ones already on disk. This Circle's
own plan review is one of them —
`circles/260815-0007-remove-eight-mechanisms-and-cap-growth/reviews/260815-0044-conceptrev-plan-remove-eight-mechanisms-and-cap-growth.md`
— it sits in the active Circle's reviews store, `reviewFiles()` reads it, and it will report
`UNUSABLE (no **Reviewed-range:** line)` on every coverage run for the rest of this Circle.
The `_o_` → `_c_` transition was therefore **not** performed: `260811-1145` stays open, and
its fix direction (make the sender segment the discriminator on both sides, in one exported
constant) is unchanged by the agent's removal. Only its *incidence* narrows.

## The second finding: `SCAN_INVESTIGATIONS` now has no consumer

`agents/conceptrev.md:42` named `$SCAN_INVESTIGATIONS`, and after its deletion **no prompt in
the tree names the key** — verified with the resolver's own derivation grep
(`grep -oE '\$(OUT|SCAN)_[A-Z][A-Z_]*'`) over `agents/*.md` and `skills/*/SKILL.md`.

The plan's `## Open questions` entry says the opposite:

> `shared/investigations/` and `SCAN_INVESTIGATIONS` stay either way — consuming projects hold
> reports there and `/fusion:archive` still names the key.

`/fusion:archive` does **not** name it in the form the resolver reads. `skills/archive/SKILL.md:62`
writes `SCAN_INVESTIGATIONS` as bare prose without the `$`, so the derivation grep never sees
it, and `bin/fusion-paths archive` emits no such key (confirmed by running it).

The arm was **kept**: an unnamed key costs nothing at run time, `shared/investigations/` still
holds reports, and whether the arm is retired is step 8's question, not step 7's. What is filed
here is that the premise the open question rests on is wrong, so step 8 must decide it from the
measurement above rather than from the archive skill.

## Fix direction

1. Correct step 7's fifth bullet in the plan, or mark it as executed-with-deviation, so the
   next reader does not go looking for a sender set.
2. Leave `260811-1145` open and let it be fixed on its own terms — one exported sender
   constant, asserted by `review-coverage-mandate.test.ts`, applied in both `reviewFiles()`
   and `measureReviewCoverageForModel`. That fix is still needed and is now the only thing
   that stops the permanent `UNUSABLE` row on this Circle's own review file.
3. Correct the plan's open question before step 8 reads it.

---
Partially answered by step 8 (2026-08-15). **Fix direction 3 is settled; 1 and 2 stay open and this record stays `_o_` for them.**

Step 8 re-ran the measurement this record asks it to decide from, over the whole key table rather than the one key: with `agents/investigator.md` gone, `OUT_INVESTIGATION` and `SCAN_INVESTIGATIONS` are the **only two of the resolver's 23 keys named by no shipped prompt** — every other key has at least one consumer, and `OUT_HISTORY` has fifteen. Orphaning is not a normal state in this resolver; those two were the whole of it.

**Both arms were removed**, not just the one this record names. `rules/workbench-path-resolution.md` states the criterion the removal applied: a key set is a restatement of the prompts, so a key no prompt names restates nothing, and the store's survival is not an argument for the key's survival. Splitting the pair would have been worse than either choice, because `SCAN_INVESTIGATIONS` is defined as the read counterpart of `OUT_INVESTIGATION`.

The "an unnamed key costs nothing at run time" reasoning that kept the arm at step 7 is true and was not the question. What decided it is that the retirement is **not silent**: the ORDER-membership check in `bin/fusion-paths` exits 4 on a prompt naming an unknown key, naming the prompt, the key and both places to add it back, so a future investigating agent fails loudly at its first Setup rather than writing to the workbench root.

`shared/investigations/` stays, `/fusion:setup` still creates it, and `/fusion:archive` still keeps it out of tier scope by safety filter 4. Its prose was corrected in two places that had counted the shared-only kinds: the archive skill's "three kinds need no derivation" is now two, and the resolver rule's "four unconditionally-shared kinds" is now three, with the retirement written up there as the worked case.
