# The Turn 1 review's totals table says fourteen findings and the body carries seventeen

---

**Severity:** Medium (the wrong number is the one every downstream reader quotes; it under-states the session's own review by three findings, one of them a Medium and two Low)
**Domain:** code
**Filed by:** reconciler, Phase 3 pass of orchestrator session `260810-0241-orchestrator-session.md`
**Affects:** `260810-0512-coderev-turn-1-range-8960e1a-to-head.md:167-179`; any reader who takes the totals table as the count
**Cross-references:** `260810-0751_*_the-record-about-counting-instances-of-a-shape-gives-three-different-counts.md` (the same class, filed by the Turn 2 reviewer against a Turn 1 record); `260810-0752-coderev-turn-2-range-ff70d3a-to-head.md:4` (a second count defect in the same cohort, below)

---

## The defect

`260810-0512-coderev-turn-1-range-8960e1a-to-head.md:169-176` reads:

| Severity | Count |
|---|---|
| Critical | 0 |
| High | 3 |
| Medium | 6 |
| Low | 5 |
| **Total filed** | **14** |

and `:178` adds "All fourteen are in `shared/issues/` with `_o_` markers, timestamps `260810-0455_*_npm-test-is-red-at-head-because-the-rules-emission-golden-was-never-regenerated.md`
… `260810-0511_*_the-queue-head-parser-is-written-twice-in-one-file-that-calls-itself-the-canonical-implementation.md`."

The body of the same file carries seventeen findings, `F1` … `F17`, each with an explicit severity
in its heading. Tallied from the headings:

- High: F1, F2, F3 → **3** (table agrees)
- Medium: F4, F5, F6, F7, F8, F9, F10 → **7** (table says 6)
- Low: F11, F12, F13, F14, F15, F16, F17 → **7** (table says 5)
- Total → **17** (table says 14)

The stamp range in the sentence is right: seventeen records exist in `shared/issues/` between
`260810-0455_*_npm-test-is-red-at-head-because-the-rules-emission-golden-was-never-regenerated.md` and `260810-0511_*_the-queue-head-parser-is-written-twice-in-one-file-that-calls-itself-the-canonical-implementation.md`, one per finding, and every one of them is real. Only the count is
wrong. The table's own rows sum to 14, so this is not a transcription slip in the total cell — two
severity rows are short.

## Why it matters beyond the file

The wrong number propagated. It is the figure quoted back to the reconciler in the Phase 3 dispatch
("a `coderev` pass over the whole range then filed 14 findings, 3 high"), and it is the figure any
future reader of the review will take, because a totals table is what a reader trusts over a manual
recount of seventeen headings.

Three findings under-counted is not cosmetic here: the session's own arithmetic — closed versus
filed — is the input to the Coherence verdict, and this table biases it toward progress.

## A second, smaller instance in the same cohort

`260810-0752-coderev-turn-2-range-ff70d3a-to-head.md:4` reads "**Range:** `ff70d3a..HEAD`, 6
commits". `git rev-list --count ff70d3a..c923935` (HEAD at that review's write time) returns **5**.
The nine findings and the file counts in the same header are correct; only the commit count is off
by one.

## Reproduction

```
cd /Users/k1/Projects/productive/fusion/fusion-workbench/shared/reviews
grep -cE '^\*\*F[0-9]+ · ' 260810-0512-coderev-turn-1-range-8960e1a-to-head.md          # 17
grep -oE '^\*\*F[0-9]+ · [A-Za-z]+' 260810-0512-coderev-turn-1-range-8960e1a-to-head.md \
  | awk -F'· ' '{print $2}' | sort | uniq -c                                            # 3 High 7 Low 7 Medium
sed -n '167,179p' 260810-0512-coderev-turn-1-range-8960e1a-to-head.md                   # table says 14
cd /Users/k1/Projects/productive/fusion && git rev-list --count ff70d3a..c923935        # 5, header says 6
```

## Acceptance criteria

- [ ] The Turn 1 review's totals table reads 3 / 7 / 7 / 17, and the sentence at `:178` says
      seventeen.
- [ ] The Turn 2 review's range line says 5 commits.
- [ ] Decide whether a review's totals should be derived rather than typed. The counts are
      mechanically recoverable from the finding headings the file already carries, and this is the
      third counting defect the cohort has produced (with `260810-0751_*_the-record-about-counting-instances-of-a-shape-gives-three-different-counts.md` and `260810-0508_*_fifteen-commits-landed-with-no-plugin-version-bump.md`,
      whose "fifteen commits" is now 22). If the answer is that they stay typed, say so somewhere a
      reviewer reads, rather than leaving the next recount to a reconciler.

---
**Reconciliation 260817-1836** (reconciler, domain `code`). Re-verified reproducible at HEAD `2552586`: `260810-0512-coderev-turn-1-range-8960e1a-to-head.md:169-178` still shows the fourteen-finding table over a seventeen-finding body, and `260810-0752-coderev-turn-2-range-ff70d3a-to-head.md:4` still says six commits over five. Marker stays open. Log: `260817-1836-reconciliation.md`.

---
Resolved: fixed — both reviews carry an appended correction (3/7/7/17 and seventeen; 5 commits) and the totals stay typed, said in the note; 260810-0512-coderev-turn-1-range-8960e1a-to-head.md:443 and 260810-0752-coderev-turn-2-range-ff70d3a-to-head.md:375
