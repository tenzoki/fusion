The corpus decision's `## Measured` block declares an anchor whose tree gives different file counts from the ones in its table

---

**Severity:** Low
**Domain:** code
**Filed by:** coderev, reviewing C2 Turn 4 (`a2a18f9..2ec2bc2`)
**Affects:** `260823-1414_*_does-the-workbench-citation-gates-corpus-cover-review-files.md`, `## Measured` (the anchor line and the `Files` column) and `## Question` (the closing sentence)
**Cross-references:** `260819-1645_*_what-defines-the-citation-gates-corpus-and-what-happens-when-a-marker-move-changes-it.md`, the user answer this record would amend

---

## What is wrong

The record's `## Measured` block opens:

> At HEAD `a2a18f9` on 2026-08-23, over `circles/*/reviews/*.md` and `shared/reviews/*.md` …

Its `Files` column does not hold at that anchor.

| Set | Record says | At `a2a18f9` | At `1544224` / `7cd79f1` |
|---|---|---|---|
| every review file | **90** | 89 | 90 |
| `shared/reviews/` alone | 34 | 34 | 34 |
| reviews of a non-terminal Circle | **3** | 2 | 3 |

The third review of the active Circle, `260823-1410-coderev-c2-turn-3.md`, was added by `1544224`, one commit *after* the declared anchor. The `## Question` section carries the same figure — "the cost of the widest answer grows with every review file written: 90 exist today."

So the file counts are the tree at `1544224` or `7cd79f1` — the latter being the commit that filed this record — and the anchor names the last commit of the range the filing pass had been reviewing.

## What is right, and it is the substantive half

**Every token and dangling figure reproduces exactly, at both anchors.** I rebuilt the measurement independently from the record's own description — tokens of the form `YYMMDD-HHMM_x_<slug>.md` outside fenced blocks, resolved by filename against that tree:

```
REF=a2a18f9   tokens 522   dangling 270 (in 64 files)
              shared/reviews alone: dangling 116 (in 22 files)
              non-terminal Circle reviews: 0 tokens, 0 dangling
REF=1544224   identical on all five figures
```

522, 270-in-64, 116-in-22 and the zero are correct as stated, and they are the numbers the options are costed on. The record's own caveat — that this is a floor rather than the figure `hooks/lib/__tests__/helpers/citation-scan.ts` would report — is honest and holds.

**The record is genuinely unanswered.** Marker `_o_`, all five trailer lines (`Answered:` / `Implemented:` / `Deferred:` / `Superseded by:` / `Retired:`) empty, and `## Recommendation` reads "None, and deliberately so", giving the reason. The four options are real alternatives with costs attached, and two of them are argued against on the record's own evidence. Nothing in it pre-answers the question.

## Why a wrong anchor on a right measurement still matters

The anchor is the only thing that makes the table reproducible. A reader who does what this record explicitly invites — "whoever implements an answer should re-measure" — will check out `a2a18f9`, get 89 files where the table says 90, and have no way to tell whether the rest of the table is wrong too. The five figures that *are* right are the ones the decision turns on, so the cost of the wrong anchor is entirely to their credibility.

## Verified

Reproduced the measurement at `a2a18f9`, `1544224`, `7cd79f1` and `2ec2bc2` from `git ls-tree` / `git show` blobs, so nothing depends on the working tree. Confirmed `260823-1410-coderev-c2-turn-3.md` is added by `1544224` (`git log --diff-filter=A`). Confirmed exactly one non-terminal Circle exists at every commit in the range. Confirmed the eleven review files under `fusion-workbench/archive/` are excluded by the record's stated glob and that including them gives 100, not 90, so archive inclusion is not an alternative explanation.

## Direction, not a prescription

Change the anchor to the commit the counts were taken at, rather than the counts to the anchor. `7cd79f1` is this record's own filing commit and is the honest answer; the token figures are identical there, so nothing else in the table moves.

Then reconcile "90 exist today" in `## Question` with whatever the table ends up saying — one number in two places is how this drifted in the first place.

Separately and not part of this record: option 3's "the repair debt is **zero today**" is no longer true at HEAD. That is filed as `260823-1639_*_the-reconcilers-review-annotation-wrote-two-hard-marker-citations-and-one-died-one-commit-later.md`.

---
Resolved: fixed — the anchor is the filing commit `7cd79f1` and the 90 in `## Question` reconciles with the table at that anchor; 260823-1414_*_does-the-workbench-citation-gates-corpus-cover-review-files.md:107 and 260823-1414_*_does-the-workbench-citation-gates-corpus-cover-review-files.md:130
