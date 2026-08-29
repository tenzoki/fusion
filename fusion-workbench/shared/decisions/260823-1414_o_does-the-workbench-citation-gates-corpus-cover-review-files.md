# Does the workbench citation gate's corpus cover review files, and under which predicate?

---
**Domain:** code
**Filed by:** coder, at the closing pass of Circle `260823-0023-settle-what-travels-between-checkouts`
**Cross-references:** `260819-1645_*_what-defines-the-citation-gates-corpus-and-what-happens-when-a-marker-move-changes-it.md` (the user answer this question would amend); `hooks/lib/__tests__/workbench-citation-lint.test.ts` (`inCorpus`, the predicate at issue); `260823-1318_*_ten-record-citations-in-the-turn-1-review-dangle-after-this-turns-renames-and-no-gate-covers-reviews.md` (the first measured instance, and the closure note that left this question unfiled); `260823-1404_*_a-question-the-closing-pass-left-to-the-user-has-no-open-record-anywhere-only-a-closed-defects-prose.md` (the finding that this record exists at all); `260806-0015_*_zitierform-fuer-workbench-records.md` (the wildcard form); `260816-0119_*_can-anything-carry-the-rename-to-citation-obligation-when-a-record-marker-moves.md` (answered: the gate is the whole mechanism, so a surface outside the corpus has nothing)

---

## Question

`hooks/lib/__tests__/workbench-citation-lint.test.ts` selects its corpus with `inCorpus(rel)`:
Circle records, open (`_o_`) issues, live (`_o_`/`_a_`) decisions, live (`_o_`/`_p_`) plans, and
`portfolio.md`. A review file under a Circle's `reviews/` store or under `shared/reviews/` matches
none of the five. **Should it?**

The question is not abstract. A review file carries a `Record:` pointer per finding by
construction, so every finding a later pass closes breaks a citation in the review that raised it.
That happened twice inside one Circle, two Turns apart, and neither instance was seen by any gate:

- **Turn 2** measured ten `Record:` citations in the Turn 1 review that the Turn 2 renames had
  killed. The suite was green throughout. The one instance the gate *did* catch in that same range
  sat in an open issue, one file away, and was corrected because the corpus reaches an open issue.
- **`a76ee8f`** recorded, as a checked fact, that renaming two decision records from `_a_` to `_i_`
  broke nothing. Four files cited those records by a hard marker: two history files, a third
  history file and an analysis. All four had been dangling since before that range opened, and no
  gate reads history or analyses either.

`shared/decisions/260816-0119_*` was answered "nothing new: the reference lint remains the whole
mechanism." That answer makes corpus membership the entire question, because for a surface outside
the corpus there is no second mechanism and no written obligation behind it.

It must be answered now rather than left standing because the corpus is a **user's** recorded
answer under `260819-1645`, so no repair pass may widen it, and because the cost of the widest
answer grows with every review file written: 90 exist today.

## Options

1. **Leave the corpus as it stands.** Reviews stay out. The obligation stays where this Circle put
   it in practice: a pass that closes findings repairs the citations of the review that raised
   them, in the same commit.
   - Pros: no change to a user-answered predicate; no repair debt; the closing pass is the only
     party holding both the old and the new name, which is the asymmetry `260816-0119` names.
   - Cons: it is exactly the written obligation `260816-0119` option 2 was refused as, and this
     Circle is the demonstration, having missed the class twice while its own pass was looking for
     it. Nothing fails when it is skipped.
2. **Admit every review file.** `inCorpus` gains a `reviews/` clause with no further predicate.
   - Pros: the densest concentration of record citations the project produces comes under the one
     mechanism that exists; states the property without a number, as option 1 of `260819-1645` did.
   - Cons: **270 dangling citations across 64 of the 90 review files** would have to be repaired
     before arming, and repairing a closed Circle's review rewrites history that nobody will open
     again. Worse structurally: a review's citations going stale as its findings close is *correct
     and desirable*, so this reddens the suite on every successful repair pass unless the closing
     pass corrects the review in the same commit. That is option 1's obligation, now enforced.
3. **Admit only the reviews of a non-terminal Circle** (`_a_` / `_t_`), leaving `shared/reviews/`
   and every closed Circle's reviews out.
   - Pros: mirrors what the corpus already does, dropping a record when the record goes terminal.
     A live Circle's review is a document somebody is about to follow; a closed one's is not. And
     the repair debt is **zero today**: the three reviews in non-terminal Circles carry 0 dangling
     hard-marker citations, because this Circle repaired them by hand.
   - Cons: `inCorpus` is pure over a workbench-relative *path string*, and a review file's path
     does not say what marker its Circle record carries. This clause is the first that would need
     to read a sibling file, which changes the predicate's shape and its testability. The whole
     point of the pure predicate is that a case can be put to it that the tree does not carry.
     It also leaves `shared/reviews/` (34 files, 116 dangling) permanently unreachable, and a
     shared review has no Circle whose marker could ever admit it.
4. **Leave the corpus alone and put the obligation on the review's own form**: a reviewer writes
   every `Record:` citation with `_*_` at the marker position when the review is filed, so the
   class cannot arise. The reviewer agents are the only writers of these files.
   - Pros: prevention rather than detection, at the one site that has the information; costs no
     predicate change, no repair debt, and no test. It is the citation form the project already
     ratified in `260806-0015`, applied to a surface that never adopted it.
   - Cons: another written obligation with no mechanism behind it, which is what `260816-0119`
     option 2 was refused as and what option 1 above is already criticised for. It also cannot
     repair the 270 citations already written, and it does nothing for history files and analyses,
     which have the same gap and no single writer.

## Constraints

- The corpus is the user's recorded answer under `260819-1645`. Any change here amends that record
  and is the user's call, not a repair pass's.
- **No baseline and no approvable number.** `260819-1645` chose option 1 explicitly so that nothing
  in the gate can be edited to silence it. Whatever is admitted is recomputed on every run, so it
  reddens the suite for whoever moves a marker, including somebody who touched no citation.
- The predicate must not require the citing text to know a record's state; that is precisely what
  the `_*_` wildcard of `260806-0015` removed.
- Any repair debt an option carries is paid **before** the clause is armed, per the same order
  `260819-1645` imposed on its own 245-citation repair. An armed clause over unrepaired text is a
  red suite that invites the number nobody may write.
- Reviews, history files and analyses share one gap. An answer that covers reviews alone should say
  so deliberately rather than by omission; `260823-1402_*_four-hard-marker-citations-of-the-c1-circle-record-dangle-in-the-same-files-this-turn-repaired.md_*` measured the same class in an analysis
  and two history files, four files away from the review repair that was looking for it.

## Recommendation

**None, and deliberately so.** The trade is between a repair debt whose size is now measured and an
obligation whose failure rate is also now measured, and choosing between those two is the same
judgement `260819-1645` reserved to the user when it accepted a red archive sweep. The filing pass
was dispatched to record the question, not to answer it.

What the filing pass can say is what the measurements settle, so that the answer is not re-derived:
option 2 costs 270 repairs today and grows; option 3 costs none today and needs a predicate that
reads outside its own argument; options 1 and 4 cost nothing to land and nothing enforces either.

## Measured

At HEAD `7cd79f1` on 2026-08-23, over `circles/*/reviews/*.md` and `shared/reviews/*.md`, counting
bare-record tokens of the form `YYMMDD-HHMM_x_<slug>.md` outside fenced blocks and resolving each
against the tree by filename:

| Set | Files | Tokens | Dangling |
|---|---|---|---|
| every review file | 90 | 522 | 270 (in 64 files) |
| `shared/reviews/` alone | 34 | n/a | 116 (in 22 files) |
| reviews of a non-terminal (`_a_`/`_t_`) Circle | 3 | 0 | 0 |

**This is not the project's own parser and does not claim to be.** It reads one citation form,
excludes fenced blocks only, and makes no `undecidable` partition, so it is a floor on options 2
and 3 rather than the figure the gate would report. `hooks/lib/__tests__/helpers/citation-scan.ts`
is what would produce that figure, and whoever implements an answer should re-measure with it.

---
Answered:
Implemented:
Deferred:
Superseded by:
Retired:

---
**Correction appended 260824** (ontocoder, plan step 5 of `260824-1905_*_plan-close-every-open-defect.md`). The `## Measured` anchor was changed from `a2a18f9` to `7cd79f1`,
this record's own filing commit. The file counts in the table (90, 34, 3) and the "90 exist today" in
`## Question` are the tree at `7cd79f1`; at `a2a18f9` the first and third read 89 and 2, because the
active Circle's third review was added one commit later. The token and dangling figures (522, 270 in
64, 116 in 22, zero) are identical at both anchors and are unchanged. Filed as
`260823-1640_*_the-corpus-decisions-measured-block-declares-an-anchor-whose-tree-gives-different-file-counts.md`.
