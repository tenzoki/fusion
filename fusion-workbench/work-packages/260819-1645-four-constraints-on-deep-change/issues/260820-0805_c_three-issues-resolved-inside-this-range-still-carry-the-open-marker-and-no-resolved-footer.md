# Three issues resolved inside this range still carry the open marker and no `Resolved:` footer

---

Five defect records sit in this Circle's store. Three of them were answered by the user and fixed
inside the same range, and none of the three carries a `Resolved:` line or has moved off the open
marker.

| record | what closed it |
|---|---|
| `260819-2213_*_the-citation-grammar-cannot-express-a-record-inside-archive-so-a-corrected-archive-path-still-scans-as-wrong-store.md` | fix shape 1 landed in `4aae336`: `anchoredUnder` and `unsweep` in `hooks/lib/__tests__/helpers/citation-scan.ts` |
| `260819-2321_*_a-citation-of-a-circle-record-produces-no-token-so-the-gate-cannot-see-the-form-the-repair-adopted.md` | `CIRCLE_REC_RE` and the `circle-record` kind landed in `46133dc` |
| `260820-0530_*_twenty-six-citations-in-the-corpus-are-statements-rather-than-pointers-and-no-exemption-expresses-that.md` | all three legs of the answer landed: the fence exemption in `b6ed978`, the twenty-four rewrites in `0d4e0f2`, the failure message and the convention line in `bbfc912` |

Each of the three carries the user's answer appended at its foot, so the answer is recorded; what is
missing is the closure. The other two are correctly open: `260819-2250` names a reference in an
analysis file the repair corpus does not cover, and `260819-2300_*_circledirs-did-not-learn-the-archive-prefix-that-findrecord-did-so-an-archived-circle-directory-stays-unexpressible.md` is explicitly not answered here.

The comparison that makes this a finding rather than a timing note: the same range **did** close two
defect records it inherited — `260816-2320_*_the-write-trace-is-now-the-guards-only-product-and-two-of-its-four-tools-reach-no-integration-case.md`
and `260819-0001_*_an-executor-reached-for-git-stash-while-two-were-dispatched-in-parallel.md`
each gained a `Resolved:` footer and the closed marker in `ad7ffed`. The records the Circle filed
itself did not get the same treatment.

---

**Severity:** Medium — an open marker is what every queue and every reconciliation pass reads, so
three fixed defects will be re-picked as work. `rules/fusion-workbench-conventions.md`
`### Issue files` requires the footer and the rename together.
**Domain:** code
**Filed by:** `coderev`, reviewing `b91c01c..bbfc912`
**Owner:** `orchestrator`

**Timing, stated rather than assumed.** This range is one Turn and the Turn has not ended, so a
reader may fairly say the closures are due at the Turn boundary rather than overdue now. Two things
argue they are already overdue: the same range closed two other records at the moment their fix
landed rather than at a boundary, and each of these three was answered and fixed several commits
before the last one.

## Fix direction

Append `Resolved:` to each naming the commit and what landed, and rename each to the closed marker.
Note that closing them removes them from the citation gate's corpus, which is the documented
narrowing recorded in `hooks/lib/__tests__/workbench-citation-lint.test.ts:69-78`; none of the three
carries a dangling citation today, so nothing goes unnoticed on this occasion.

---
Resolved: all three carry a `Resolved:` footer citing the commit that closed them and are `_c_`. The comparison this record drew was right: the range had closed two inherited defects properly and left its own three open, which is the asymmetry a Circle is likeliest to have because its own records are the ones nobody inherits.
