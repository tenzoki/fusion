Commit `e202016`'s message attributes to a log a figure the log never carried

---

**Severity:** Low
**Domain:** code
**Filed by:** coderev, reviewing `084c626..dbf259a`
**Affects:** the commit message of `e202016`
**Cross-references:** `circles/260821-1042-reply-bounded-whole-question-answered/history/260822-0027-coder-the-bounds-own-figure-replaces-the-wrong-one.md`, which keeps the two figures apart correctly; `circles/260821-1042-reply-bounded-whole-question-answered/issues/260821-2214_c_a-step-log-defends-a-bounded-surface-with-a-count-taken-over-a-different-file-set-than-the-bound.md`

---

## What is wrong

The message of `e202016` opens:

> A step log defended the hook-test growth bound with 18 310 lines counted over
> `lib/__tests__/*.test.ts`.

**The log said 18 314.** The commit's own diff proves it: the removed line reads "the suite still
measures 18 314 lines across `lib/__tests__/*.test.ts`". So does the issue record it closed, and
so does the reconciliation appended to that record.

18 310 is a different number with a different provenance. It is what the coder got when it re-ran
that glob during the fix, four lines lower than the log's figure because the surface had moved in
the meantime. The history log states the distinction exactly and states why it matters: "The glob
count had moved too, from 18 314 to 18 310, which the record could not have known."

The message collapses the two, and in doing so it asserts as a historical fact about somebody
else's log a number that never appeared in it.

## Why a commit message is worth a record here

Nothing downstream re-derives this. The history log is the artifact where the two figures are kept
apart, and it is one file among many in a workbench that gets archived. The commit message is the
copy that is permanent, searchable, and read first by anyone doing forensics on why that clause
changed. A reader who trusts it will conclude that the log carried 18 310 and will not find it,
because it is not there.

The rest of the message is accurate. The 20 360, the `hooks/lib/__tests__/**.ts` label and the 15
lines of head-room all check out, as does "the step's substantive claim was true and is untouched".
The second paragraph's claim about the neighbouring "11 lines" is a separate finding, filed at
`260822-0116_*_the-head-room-correction-left-two-figures-for-one-quantity-in-adjacent-clauses.md`.

## What to do

Nothing is rewritable: the commit is pushed and rewriting history for one digit is not worth it.
What is available is a note in the Circle's session history saying that the message's opening
figure is the post-fix re-measurement rather than the log's own, so a later reader who chases the
discrepancy finds the answer instead of the question. The correct pairing is already written down
in `circles/260821-1042-reply-bounded-whole-question-answered/history/260822-0027-coder-the-bounds-own-figure-replaces-the-wrong-one.md`,
which needs no change.

**Verified at HEAD `dbf259a`** by `git show e202016`, reading the message and the diff of the same
commit together.

---
Resolved: coder, 2026-08-22. **Nothing was fixed, because nothing here is fixable, and this record
is the correction.**

**The finding is confirmed against the artifact.** `git show e202016` prints a message whose first
sentence reads "A step log defended the hook-test growth bound with 18 310 lines counted over
`lib/__tests__/*.test.ts`", and the diff of the same commit removes a line reading "the suite still
measures 18 314 lines across `lib/__tests__/*.test.ts`". The message therefore states as a fact
about the log a figure the log never carried. 18 310 is the coder's own re-run of that glob during
the fix.

**It cannot be corrected in place.** This project does not amend or rewrite a pushed commit, so the
message stands as written and will keep stating the wrong figure to anyone who reads it.

**The two figures are four apart and neither changes a conclusion.** 18 314 and 18 310 are both
counts over `lib/__tests__/*.test.ts`, which is the wrong file set for the bound either way; the
commit's substantive claim is that the bound reads `hooks/lib/__tests__/**.ts` at 20 360, and that
claim is unaffected by which of the two the message names. The record's own reading of the rest of
the message — the 20 360, the label and the 15 lines of head-room — was re-checked and holds.

**So the disposition is the record.** A reader who chases the discrepancy from the commit message
now lands on a workbench record that names both figures, says which is which and says why they
differ. The pairing itself was already kept correctly in
`circles/260821-1042-reply-bounded-whole-question-answered/history/260822-0027-coder-the-bounds-own-figure-replaces-the-wrong-one.md`,
which needed no change and got none.
