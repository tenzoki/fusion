A question the closing pass explicitly left to the user has no open record anywhere, only prose inside a closed defect

---

**Severity:** Medium
**Domain:** code
**Filed by:** coderev, reviewing C2 Turn 3
**Affects:** `circles/260823-0023-settle-what-travels-between-checkouts/issues/260823-1318_*_ten-record-citations-in-the-turn-1-review-dangle-after-this-turns-renames-and-no-gate-covers-reviews.md:56-64` (`## Direction`) and its closure note
**Cross-references:** `rules/fusion-workbench-conventions.md` `## Issues vs decisions` (a question goes to `$OUT_DECISION`, not to an issue); `agents/reconciler.md:131`, `:141` (a decision misfiled as a defect is surfaced, not closed); `circles/260819-1645-four-constraints-on-deep-change/decisions/260819-1645_*_what-defines-the-citation-gates-corpus-and-what-happens-when-a-marker-move-changes-it.md`, the user answer this question would amend

---

## What is wrong

The `260823-1318` record carries two things: a repair, and a question. Its `## Direction` says so plainly, "Two things, and the second is the larger one", and the second is whether a review file belongs in the citation gate's corpus. Its closure note is equally plain:

> **The corpus question this record raises second is deliberately left open.** … It stays a question for the user.

The record is nonetheless renamed `_c_`. So the sentence "it stays a question for the user" is the only place that question exists. There is no `_o_` decision record for it, in the Circle's store or in `shared/`, and no backlog entry: checked at HEAD, the Circle holds one decision (`260823-0800_*_does-the-two-checkout-transport-verification-become-a-shipped-check.md`, unrelated) and `shared/decisions/` holds nothing on the corpus.

**The question is real and it recurred inside this Circle.** Turn 2 measured ten dangling citations in the Turn 1 review; Turn 3 repaired those and pre-emptively repaired seven more in the Turn 2 review, because closing six records would have broken the file recording them. That is the same fault twice in two Turns, and the closure note names the trade the answer turns on (admitting reviews reddens the suite on every successful repair pass unless the closing pass corrects the review in the same commit). A trade that specific is a decision record's content.

**Closure compounds it.** Once C2 goes terminal the sentence sits in a closed issue inside a closed Circle: outside every `$SCAN_ISSUES` and `$SCAN_DECISIONS` by the resolver's scoping, and outside the marker filters as well. It is filed separately as `circles/260823-0023-settle-what-travels-between-checkouts/issues/260823-1403_*_closing-a-circle-removes-its-open-records-from-every-agents-scan-set-and-no-closure-step-says-so.md`.

## Verified

Read the record and its closure note at `a2a18f9`. `ls` over `circles/260823-0023-settle-what-travels-between-checkouts/decisions/`, `shared/decisions/` and `shared/backlog/`: no record on the corpus question. The repair itself is sound and is not what this record is about: the fourteen rewrites resolve, and the pass was right not to widen a user-answered corpus inside a defect repair.

## Direction, not a prescription

File the question as an `_o_` decision record with the two options the closure note already states and the cost it already names, so it reaches `$SCAN_DECISIONS` and a reconciler's Grounding pass. Placement is `shared/` under the Origin Rule: the corpus is a framework-wide surface and the question outlives this Circle, which is the same reasoning that put `260819-1645` where it is.

Do this before the Circle closes. Afterwards the question is reachable only by somebody who opens a closed Circle's issue store on purpose.

---

Resolved: 2026-08-23 by coder. The question is filed as an open decision record at
`shared/decisions/260823-1414_*_does-the-workbench-citation-gates-corpus-cover-review-files.md`,
in `shared/` per the Origin Rule and for the reason this record gives: the corpus is a
framework-wide surface and the question outlives the Circle that met it twice.

**It is filed unanswered, and that is the whole point of filing it.** The record carries no
`Recommendation` beyond a statement of why the filing pass may not make the call: the corpus is the
user's own recorded answer under
`circles/260819-1645-four-constraints-on-deep-change/decisions/260819-1645_*_what-defines-the-citation-gates-corpus-and-what-happens-when-a-marker-move-changes-it.md`,
which no repair pass may amend.

**What the filing added to the closure note it rescued.** The note stated the two options and the
cost. The record states four, and it measures the two that were only asserted: admitting every review
file costs 270 citation repairs across 64 of the 90 review files before the clause could be armed,
while admitting only the reviews of a non-terminal Circle costs none today, the three such files
carrying zero dangling citations because this Circle repaired them by hand. That is the trade the
answer turns on, and it was a guess until it was counted.

**The scan is a floor, not the gate's own figure**, and the record says so: it reads one citation
form, excludes fenced blocks only, and makes no `undecidable` partition, so whoever implements an
answer re-measures with `hooks/lib/__tests__/helpers/citation-scan.ts`.

**Measured.** No shipped surface moved for this item.
