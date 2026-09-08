# Should the dispatch-bound gate's context list cover the prompt's own prose name for the value?

---
**Domain:** code
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>
**Cross-references:** `260907-1450_*_plan-bounded-executor-dispatches.md` `### 14. A lint against the dispatch bound returning to the prose`; `260811-1712_*_max-turns-is-hardcoded-in-eight-places-and-cannot-be-set-per-project.md`, the measured failure the gate exists to prevent

---

## Question

`hooks/lib/__tests__/dispatch-bound-lint.test.ts` fires on a literal count of minutes only when the
line also carries one of four context words the plan named: `Stop by`, `stopping time`,
`dispatch_minutes`, `dispatchMinutes`. The orchestrator prompt's own prose heading for the value is
**The dispatch bound.**, which is not among them, so the sentence *"The dispatch bound is 35 minutes
unless the project says otherwise"* passes the gate. The coder building step 14 found this by putting
that sentence in its must-fire list and watching it not fire, then pinned the miss as an explicit
absence case rather than widening past the plan on its own judgement.

The choice has to be made now rather than later because the absence case is in the tree, and it is
written to be deleted by whoever widens the list.

## Options

1. **Add `dispatch bound` to the context list and delete the absence case.**
   - Pros: closes the phrasing a figure would most plausibly arrive in, since it is the prompt's own
     name for the value. The measured precedent had the Turn budget written in four spellings, so a
     gate keyed to a fixed vocabulary is exactly what failed before.
   - Cons: departs from the plan's prescribed four; widens a pattern that already matches on any line
     carrying a bare number, which raises the chance of a false fire on prose about something else.
2. **Leave the absence case as it stands.**
   - Pros: the hole is documented rather than silent, and its failure message tells the next reader
     what to do; the gate stays exactly as specified.
   - Cons: a gate that misses the most likely phrasing is weak where it most needs to be strong, and
     the documentation of a hole is not the closing of one.
3. **Widen differently: fire on any minute literal anywhere in the two files.**
   - Pros: no vocabulary to keep current.
   - Cons: both files legitimately discuss minutes for other reasons, so this trades a false negative
     for a stream of false positives, which is the failure mode that gets a gate ignored.

## Constraints

Whatever is chosen, the gate keeps its anti-vacuity assertion: deleting `<dispatch-minutes>` from the
prompt must not be a way to pass. And nothing here can check that a dispatched orchestrator read the
configured value, which the gate's own header states.

## Recommendation

Option 1. The prompt's own name for the value is not an edge case, and the precedent this gate exists
to prevent was four spellings of one number.
