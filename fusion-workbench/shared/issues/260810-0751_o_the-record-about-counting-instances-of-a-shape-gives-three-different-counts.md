# The record about counting instances of a shape gives three different counts

---

**Severity:** Low
**Domain:** code
**Filed by:** coderev, review of `ff70d3a..HEAD` (session `260810-0241`, Turn 2)
**Affects:** `shared/issues/260810-0710_o_the-drift-checks-last-line-makes-the-whole-block-exit-non-zero-when-no-circle-is-active.md`; commit `8d66265`'s message
**Cross-references:** `shared/issues/260810-0506_o_the-activation-pointer-write-in-next-6-3-exits-non-zero-when-no-queue-exists.md`

---

## The defect

The record's own argument is that two instances of one shell idiom hazard in one Turn are worth
reading together rather than patching separately. It then states the count three ways within
seven lines:

- *"**It is the third instance of one shape tonight**, and that is the reason to read the three
  together rather than patch each"*
- the list underneath it has **two** bullets — `260810-0506`, and this record
- *"**Both** arrived in Turn 1 of session `260810-0241`"*

`8d66265`'s commit message, filing the same record, says *"It is the **second** instance of the
shape tonight, after `260810-0506`"* — which matches the list and the "Both", and contradicts the
record's own opening.

## Why a miscount here is worth a record

The count is the argument. "Twice in one Turn, by different agents" is what carries the record's
third question — whether the shape earns a check — and a reader who takes "third" at face value
looks for a missing instance that does not exist. The same session already produced
`05c013d`, whose subject is a list that called itself exhaustive and was missing two entries; this
is the same failure with the sign reversed.

*Verified:* the two sites named are real and do share the shape. `agents/orchestrator.md:868` is
`[ -n "$REC" ] && row …` in final position, so the drift-check block exits non-zero whenever no
Circle is active; `/fusion:next` step 6.3 carries `[ -f … ] && echo …` in the same position. No
third site was found in this range.

## Suggested fix direction

One word. Change "third" to "second" and "the three" to "the two", or add the third instance if
one exists that this reviewer did not find.
