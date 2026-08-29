# coder — repair what the new Circle-record grammar made visible (plan step 8c)

**Status:** Complete
**Date:** 2026-08-20
**Agent:** coder
**Task:** Not a plan step. It follows from the user's answer at
`260819-2321_*_a-citation-of-a-circle-record-produces-no-token-so-the-gate-cannot-see-the-form-the-repair-adopted.md`
— fix the grammar first, then arm — and the grammar landed at step 8b in the previous commit.
Step 9 arms the gate after this.
**HEAD at start:** `46133dc`, clean tree.

## Re-measured before starting, and 8b's figures held

Every pass in this Circle has found a different figure from the one it was handed, so the dispatch
asked for a re-measurement first. This one did not move: the wide reading held 34 violations from
`scanRecordCitations`, 24 of them the deliberate literals steps 5 and 7 left and 10 the new
`circle-record` class, exactly as 8b's log reports. 8b's own log had joined the tree between the two
runs and changed nothing, because history is not in this corpus — see the corpus finding below.

One thing about the driver did move and is worth stating, because it was wrong rather than stale.
Step 7's driver carried its own local copy of `GATE_KINDS`, written before the `circle-record` class
existed, so it would have reported 24 where the gate sees 34. This pass calls `scanRecordCitations`
itself — the gate's entry point — and derives nothing. A measurement of a gate that re-declares the
gate's own constant is measuring a copy.

## Before and after, both readings

The corpus is assembled from the tree and never from a written list: Circle records in every state,
`portfolio.md`, issues carrying `_o_`, decisions carrying `_o_` or `_a_` in the wide reading and
`_o_` alone in the narrow one, `archive/` excluded.

**Wide reading** (decisions `_o_` or `_a_`):

| | Before | After |
|---|---|---|
| files | 191 | 192 |
| tokens | 1 776 | 1 793 |
| **`scanRecordCitations` violations** | **34** | **26** |
| `stale-marker`, kind `circle-record` | 10 | **2** |
| `stale-marker`, kinds `record` + `bare-record` | 24 | 24 |
| `dangling`, gate kinds | 0 | 0 |
| `wrong-store` | 0 | 0 |
| `resolved`, kind `circle-record` | 37 | 45 |
| `dangling`, kind `stamp-name` | 0 | 0 |

**Narrow reading** (decisions `_o_` alone):

| | Before | After |
|---|---|---|
| files | 171 | 172 |
| tokens | 1 580 | 1 597 |
| **`scanRecordCitations` violations** | **34** | **26** |
| `stale-marker`, kind `circle-record` | 10 | **2** |
| `stale-marker`, kinds `record` + `bare-record` | 24 | 24 |
| `dangling`, gate kinds | 0 | 0 |
| `wrong-store` | 0 | 0 |
| `resolved`, kind `circle-record` | 34 | 42 |
| `dangling`, kind `stamp-name` | 0 | 0 |

The two readings agree on every violation figure, before and after, because all ten hits sat in a
Circle record, in `portfolio.md` or in an issue carrying `_o_` — the parts both readings select. The
file and token counts differ by the 20 `_a_` decisions only the wide reading opens.

The +1 file and +17 tokens on each side are this pass's own defect record joining the corpus. It
carries 13 resolved citations and **zero** violations, checked before the corpus was re-measured.

## The ten, and the treatment each received

Eight starred, two left literal. The two are named individually here, because a deliberate leave
that is not named is indistinguishable from one that was missed — the practice steps 5 and 7
established for their 24.

**Starred (`_*_` at the marker position) — 8:**

| where | line | spelled | Circle whose record it points at |
|---|---|---|---|
| `260814-0813_*_…-validation-case.md` | 10 | `_a_` | `260801-1244-curator` |
| the same record | 42 | `_t_` | the same |
| `260814-1450_*_…-landed-the-review.md` | 26 | `_t_` | the same |
| `circles/260815-0007-…/260815-0804_*_…-and-lists-six.md` | 15 | `_t_` | `260815-0007-remove-eight-mechanisms-and-cap-growth` |
| `portfolio.md` | 72 | `_a_` | `260819-1645-four-constraints-on-deep-change` |
| `260811-2105_*_…-citations-are-stale.md` | 37 | `_a_` | `260801-1244-curator` |
| the same record | 102 | `_t_` | `260816-1741-guard-becomes-observation-only` |
| `260813-0913_*_…-may-write-the-other.md` | 91 | `_a_` | `260813-0858-playmaker-maintains-backlog-store` |

Every one is a pointer whose marker ages: a `**Where.**` head, an `**Affects:**` field, a
line-and-range reference, a portfolio entry, a dated reconciliation note whose subject is the text
of a record's title rather than its state. None was rewritten to the marker its target carries
today, which is the repair that goes stale at the next transition. Two of the eight deserve a word:

- **`260811-2105_*_…:37`** reads *"The single live (`_a_`) record — `circles/…/_*_circle.md` — carries eight literal citations"*.
  The parenthetical `(_a_)` is the statement and is untouched; it carries no store and no slug and
  is not a citation token. The path beside it is the pointer and is starred. The rule's own
  distinction, applied to two occurrences of one letter in one clause.
- **`260811-2105_*_…:102`** is the same shape: the clause *"before that Circle's `_t_` → terminal transition"*
  keeps its letter, the path in front of it is starred. The two `record` citations further along the
  same line stay literal — they are step 7's leaves, and they are two of the 24.

**Left literal, and why — 2:**

- **`circles/260815-0007-…/260815-0804_*_…-activation-renamed.md:5`.** The record's entire
  subject is that a decision's `**Cross-references:**` field spells `_a_circle` for a record that
  activation had renamed. Line 5 is the sentence stating that finding, and it quotes the defective
  citation. Star it and the record says a correct citation is wrong. The identical citation at line
  22 is already `exempt` — it sits in a blockquote — which is the asymmetry the defect record below
  is about: one character of markdown decides whether the same statement is a violation.
  **Still live**, and worth knowing: the cited decision's line 7 does still carry the stale spelling.
  That decision transitioned to `_i_`, so it is in neither corpus reading, and the gate will show
  green over an open defect whose subject is a citation it cannot see. This is the corpus decision's
  own subject, arriving for the second time inside the plan that asked it — step 8 found the first
  instance.
- **`260813-0913_*_…-may-write-the-other.md:112`.** A reconciliation note of 260813-1545
  reporting *"one citation has gone stale"* and quoting what the closing section says. Starring the
  quotation deletes the finding. The note also asked its reader to cite the record in the wildcard
  form when the record was picked up, which is what line 91 above now does — so the note is
  describing finished work. **A dated correction was appended** rather than the note being rewritten:
  it says which half is now the pointer and which is the quotation, and that the record has since
  closed, so the note's "it will be `_c_circle.md` after closure" has come true. Correcting the
  quotation instead would have made the record assert something false about the past.

**No hit took treatment 1 (correct the path) or treatment 3 (annotate as deliberately removed).**
`rules/circle-records.md` `### Deletion is outside the vocabulary` was read first and its literal was
not used: all ten targets exist, none was deleted, and writing that one was would have asserted
something that did not happen. That is the fourth consecutive pass to report treatment 3 at zero.

## The corpus question 8b flagged, settled by measurement

8b's log says two things that cannot both be true of one set: that history *"neither corpus reading
opens"*, and that its own log — which lives in `history/` — is *"in the corpus"* and contributes six
irreducible faults. **Both statements are true, of two different sets that the log calls by one
word.** Measured on this tree:

| set | history files in it | 8b's log in it |
|---|---|---|
| corpus A — the whole workbench excluding `archive/`, 8b's before/after instrument | **536** | yes |
| corpus B wide — the repair corpus | **0** | no |
| corpus B narrow — the repair corpus | **0** | no |

Corpus A is a measuring instrument and was never a candidate for the gate. What the gate scans is
settled: the user answered
`260819-1645_*_what-defines-the-citation-gates-corpus-and-what-happens-when-a-marker-move-changes-it.md`
with option 1, over the corpus its own first paragraph names — the Circle records, `portfolio.md`,
the open decisions and the open issues. History is not among the four kinds, and neither are
`analyses/` or `planning/`; the wide reading opens **zero** files from any of the three.

**So the six irreducible faults in 8b's log are not step 9's problem, and step 9 should not go
looking for them.** They are real and they are unrepairable — three rows of an exercise table
including two negative controls, two mentions of the one genuinely dead Circle name among the 25,
and one verbatim quotation of `skills/migrate/SKILL.md:96` — but they sit outside the corpus
predicate as answered. One arithmetic note, since 8b's count and a rerun disagree: `scanRecordCitations`
finds **five** of the six today. The sixth is a bare dashed name of kind `stamp-name`, which the gate
does not read until step 9 widens `GATE_KINDS` under decision
`260819-2016_*_does-the-citation-gate-judge-the-stamp-name-class-which-scanrecordcitations-does-not-read.md`.
8b counted it as a fault because that widening is coming, which is right.

**The conditional is worth writing down, because the corpus predicate is not obviously final.** The
answered decision's own closing note observes that a recomputed corpus follows the markers, which is
what lets a record walk out of scope as it reaches its terminal state, and says the alternative
"is a corpus predicate that does not narrow" — while adding that nobody has proposed one. Anyone
who does propose one meets this: **a history log is a record of what a pass did, and its faults
cannot be repaired without destroying what the file is for.** 8b's exercise table is the clearest
case in the workbench — naming a negative control requires writing it, and a scanner cannot tell the
control from the thing it controls for. A corpus that reaches history acquires a class of file that
can never be made green honestly, and 536 files' worth of it.

## The larger finding, which blocks step 9's acceptance and is filed as a defect

The repair steps were meant to leave this corpus at zero violations. They cannot, and neither could
this one. **26 citations remain, in both readings, every one of them a statement rather than a
pointer** — a defect record quoting the defective citation it was filed about, a table transcribing
citations left literal elsewhere, a reconciler note whose observation is two markers in one clause.
Starring any of them deletes the finding it carries. Step 9's acceptance is `npm test` green on the
commit that lands it, and a gate asserting `violations.length === 0` over this corpus is red on
arrival — from 26 correct citations the parser has no way to tell apart from broken ones.

The seven exemptions in `scanCitationTokens` are six syntactic tests and one file allowlist, and
none of them expresses "the marker is the statement here". The asymmetry is visible inside one
record: the same citation is exempt at line 22 because it is blockquoted and a violation at line 5
because it is prose.

Filed as
`260820-0530_*_twenty-six-citations-in-the-corpus-are-statements-rather-than-pointers-and-no-exemption-expresses-that.md`,
with all 26 located by file and line, four options set out and none chosen — the trade is the same
shape the corpus decision already put to the user rather than settling in a plan. The record names
the 26 by line number and never by token, deliberately: writing them out would have added 26 more
instances of the class to a record that is itself inside the corpus.

## What this pass did not do

- **No marker was transitioned**, on any record.
- **No plan step was marked**, and step 8c is not one.
- **Nothing in `hooks/`, `agents/`, `rules/` or `skills/` was touched.** The exemption gap above is
  named and left for step 9, which owns that file.
- **No golden was regenerated and no pinned constant was written.** None moved: the shipped surfaces
  are unchanged, and `reference-resolution-lint.test.ts` `BASELINE` scans shipped text only.
- **Nothing was committed.**

## What this log costs the corpus

Zero, and for a structural reason rather than a careful one: it is in `history/`, which the corpus
does not open, as measured above. Scanned anyway, on the same footing 8b used — `scanRecordCitations`
reports **zero** violations over it: 24 citations, all resolved — 18 of kind `record` and 6 of kind
`circle-record`. It carries no `stamp-name` token at all, so step 9's widening cannot add one, and
its single bare stamp is a date in prose, which no reading of the gate judges. Every record it names
is cited in the `_*_` wildcard form, and the eight repaired lines are named by line number and
spelled marker in separate columns rather than as the citations they used to be.

## Verification

`cd hooks && npm test` — **exit 0**, 37 test files and 678 tests passed. Run with output redirected
to a file rather than piped, so the code read is the process's own.

The corpus scan was re-run in both readings after the last edit, including the new defect record:
zero `dangling` in gate kinds, zero `wrong-store`, zero `dangling` of kind `stamp-name`, and 26
`stale-marker` — the 24 deliberate literals of steps 5 and 7, plus the two named above.

## Files changed

```
 1  circles/260801-1244-curator/issues/260814-1450_*_…-landed-the-review.md
 2  circles/260801-1244-curator/issues/260814-0813_*_…-validation-case.md
 1  circles/260815-0007-…/issues/260815-0804_*_…-and-lists-six.md
 1  portfolio.md
 2  shared/issues/260811-2105_*_…-citations-are-stale.md
 1  shared/issues/260813-0913_*_…-may-write-the-other.md  + one appended correction note
```

Six records, 18 insertions against 8 deletions. Plus one new defect record and this log.
