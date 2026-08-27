Five of fifteen `**Not-opened:**` entries name records that do not exist, and no gate reads that field

---

**Severity:** High. The field's only purpose is to be inherited as the next review's scope, so an entry that resolves to nothing is a file that silently never gets reviewed — which is the failure `260810-1205` built this mechanism to close.
**Domain:** code
**Filed by:** orchestrator, reading `bin/fusion-review-coverage` output at the Turn-5 boundary
**Affects:** `fusion-workbench/shared/reviews/260822-1421-coderev-c0-cut-only-circle.md`, its `**Not-opened:**` field; `agents/coderev.md` and `rules/review-contract.md`, which mandate the field; `hooks/lib/review-coverage.ts`, which reports it verbatim
**Cross-references:** `shared/issues/260810-1205_*_the-session-closure-and-filing-counts-are-hand-maintained-and-both-drifted-by-two-against-the-disk.md` (the record that mandated the field); `agents/orchestrator.md` Step 3c, which obliges the next dispatch to carry the list

---

## What is wrong

`bin/fusion-review-coverage` reported `carried=` with fifteen paths. Five of them do not exist on disk:

```
shared/decisions/260822-1154_a_does-the-hook-test-line-budget-cover-comment-prose.md
shared/decisions/260822-1155_a_must-a-cut-only-circle-re-baseline-the-surfaces-it-cuts.md
shared/decisions/260822-1137_o_what-authority-does-a-distributed-record-carry-when-the-transport-is-git.md
shared/decisions/260822-1138_o_how-should-the-active-circle-pointer-behave-when-two-checkouts-both-appended-to-it.md
shared/decisions/260822-1156_a_what-happens-when-the-required-work-exceeds-the-remaining-head-room.md
```

The store holds seven `260822-*` decision records and none carries any of those five names. Each
failing entry is a plausible **paraphrase** of a real record rather than a copy of its path: the
stamp is wrong (`1155`, `1137`, `1138`, `1156` name no record at all), the marker is wrong
(`_a_` where the record is `_o_`), and the slug is reworded. The real records they gesture at are
`260822-1154_*_does-the-hook-test-line-budget-cover-comment-prose.md`,
`260822-1154_*_does-a-cut-only-circle-re-baseline-the-surfaces-it-cuts.md`,
`260822-1136_*_which-identity-does-an-attributed-record-carry-when-the-transport-is-git.md`,
`260822-1136_*_how-does-the-tracked-event-log-behave-when-two-checkouts-both-appended-to-it.md`
and `260822-1102_*_what-happens-when-a-planned-circles-required-work-exceeds-the-remaining-head-room.md`.
The ten remaining entries resolve.

Those five are wildcarded, and the reason is this record's own subject. They are pointers: the marker
letter carries nothing here, because the statement about wrong markers is the sentence above, which
describes the failing entries rather than these. Written out, each would die at its target's next
transition — and one did, on 260823, when the event-log record moved from open to answered. All five
were wildcarded then rather than the one that broke, because the other four are the same pointer
waiting for the same transition.

## Why nothing caught it

`hooks/lib/__tests__/workbench-citation-lint.test.ts` recomputes its corpus from the tree on every
run and would have reddened on a dead path — but review files are not in its corpus, which covers
Circle records, `_o_` issues, `_o_`/`_a_` decisions and `portfolio.md`. `bin/fusion-review-coverage`
reads the field and prints it verbatim; it resolves nothing and claims nothing about resolvability.
So a field whose entire value is that a later pass can act on it has no reader that checks it can be
acted on.

The next dispatch is where the cost lands. `agents/orchestrator.md` Step 3c obliges the orchestrator
to add every carried entry to the next review's scope, calling it "an obligation, not a footnote"
and citing the release that shipped over seven unreviewed commits. Five of those additions would
name nothing. The orchestrator would either halt on a missing path or, worse, pass the name to a
reviewer that quietly finds no file — and a file nobody reviewed is indistinguishable from a file
somebody reviewed and cleared.

## What to consider

The field is written by an agent from memory of what it read, which is exactly the shape this
project has measured failing elsewhere: a hand-maintained restatement of something already on disk.
Two directions, neither costed here.

1. **Make the field checkable.** Extend the citation gate's corpus to review files, or have
   `bin/fusion-review-coverage` resolve each carried path and mark the ones that do not exist. The
   helper already reports `UNUSABLE (...)` for a review whose range field cannot be parsed, so an
   unresolvable carried entry has an existing vocabulary to join.
2. **Make the field derivable rather than written.** A reviewer that names files it did not open
   could name them by a mechanism rather than by recall, though what that mechanism is is not
   obvious and is not proposed here.

The immediate repair is to correct the five entries in the review file, which does not fix the
class.

---
Resolved: fixed — the five entries are corrected to the real records in wildcard form and the class is `shared/decisions/260823-1414_*_does-the-workbench-citation-gates-corpus-cover-review-files.md`; shared/reviews/260822-1421-coderev-c0-cut-only-circle.md:4 and shared/reviews/260822-1421-coderev-c0-cut-only-circle.md:235
