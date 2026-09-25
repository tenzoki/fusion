# coder — repair the wrong-store citations (plan step 6)

**Status:** Complete
**Date:** 2026-08-19
**Agent:** coder
**Task:** Step 6 of `260819-2016_*_four-constraints-on-deep-change.md` — correct every `wrong-store` citation in the repair corpus to where the record actually is.
**HEAD at start:** `ad7ffed`

## Corpus

The same wider reading step 5 ran, driven from the same scanner and the same file-list helper, never
from a written list: Circle records in every state, `portfolio.md`, decisions carrying `_o_` or
`_a_`, issues carrying `_o_`, excluding `archive/`. That selected **186 files** and 1 743 tokens at
the start of this pass (187 and 1 744 after this pass filed one defect record, which is itself in
the corpus).

The plan measured 49 `wrong-store` hits at 260819-2016 and the scan found 48 at `ad7ffed`. The
corpus is defined by state markers, so it drifts as records transition; step 5 recorded the same
effect in the opposite direction.

## Before and after

| | Before | After |
|---|---|---|
| `wrong-store` | 48 | 43 |
| `resolved` (all kinds) | 1 142 | 1 148 |
| `stale-marker` | 21 | 21 |
| `dangling` (partitioned) | 161 | 156 |

**45 citations corrected across 29 records**, on 41 lines. Every edit rewrites the directory part of
one citation and stars its marker position; `git diff --numstat` shows equal insertions and
deletions for all 29 files. No marker was transitioned and nothing was committed.

## The count fell by five, not by forty-five, and that is the finding

Forty of the 48 hits name a record the `archive/260817-1907-safe-cleanup-scoped` sweep moved. All
forty now carry the record's true archive path — checked file by file, every one of the 27 distinct
new paths globs to exactly one existing file — and **all forty still scan as `wrong-store`, with the
token, the match and the fix text unchanged.**

The scanner cannot express a citation of an archived record. `REC_RE` recognises exactly two
prefixes before a store, `circles/<dir>/` and `shared/`, and `findRecord()` then requires the
record's directory to *start* with that prefix. An archived record's directory starts with
`archive/<sweep>/`, so the anchored branch never matches, and the regex simply begins its match
further along the path — which makes the token the scanner reads byte-identical whether or not the
archive prefix is written in front of it. The one form it does accept for an archived record is a
path with the store segment alone and no `shared/`, which is a path that does not exist on disk.

So there is no true path that clears this class, and the honest repair is the one that helps a
reader and leaves the count where it is. It is filed as
`260819-2213_*_the-citation-grammar-cannot-express-a-record-inside-archive-so-a-corrected-archive-path-still-scans-as-wrong-store.md`,
with the two available fix shapes stated and neither chosen. It matters before step 9: the gate that
step arms raises `wrong-store` as a violation, so on this corpus it opens red on forty citations that
are already correct.

The five hits whose target is still in a live store did resolve. Four were records that moved
between stores or into a Circle, one was a store correction inside `shared/`.

## The three left for step 7, named

- `260814-1419_*_nine-open-marker-citations-were-left-literal-on-lines-where-their-siblings-were-starred.md:39` — the token `260801-1122` resolves to two candidates, a `shared/history/` file and an archived planning record. The store word in the citation points at the second, but that is a judgement and the dispatch's bound is explicit: do not pick between candidates.
- `260812-1720_*_the-reference-resolution-lint-does-not-scan-the-workbench-where-citations-are-densest.md:31` — the same token, truncated, with the same two candidates.
- `260814-2153_*_the-commit-that-closes-the-last-reviews-own-high-finding-is-the-one-commit-no-review-opens.md:77` — the wrong path **is** the statement. The line reads "Decision `260815-2109` cites this record as … No such path exists", and correcting the quoted path deletes what the sentence reports. This is the pointer-versus-statement test in `rules/circle-records.md` `### Citation form in the portfolio`, applied to a store instead of a marker, and it is the rule step 5 used for its own nineteen leaves.

  One consequence, stated rather than hidden: this pass **fixed** the citation that line complains
  about, in `260815-2109_*_may-a-circle-close-over-an-uncovered-review-range-and-who-decides.md:7`.
  The observation is now historical, and the paragraph's closing sentence, "One correction that
  belongs to whoever picks this up", names work that is done. Rewriting that prose is beyond
  correcting a citation and is handed to step 7 with the token.

## Deliberate deletions seen: none

`rules/circle-records.md` `### Deletion is outside the vocabulary, and the annotation sits on the
references` was read before starting. No hit in this class could be one: `wrong-store` is by
definition a citation whose target the scanner found somewhere on disk, and a deliberately deleted
record is found nowhere. Every such case is a `dangling` hit and reaches step 7 as treatment 3.

## Verification

`cd hooks && npx vitest run` — **exit 0**, 37 test files and 678 tests passed. Nothing moved: this
pass wrote only workbench records, and none of the three bounded surfaces or the four lint gates
reads them. No golden was regenerated and no pinned constant was written.

One expectation was wrong and is corrected here rather than carried forward. Step 5's log records
`reference-resolution-lint.test.ts` failing its `BASELINE` pin at `paths` 1 179 and `records` 104,
left for the commit that lands step 4. At `ad7ffed` that gate is green, so the re-approval landed
between the two passes.

## Files changed

29 records, edit count per file, plus one new defect record and this log:

```
4  circles/260801-1244-curator/_c_circle.md
1  circles/260801-1244-curator/issues/260814-2022_*_initiated-by-carries-quoted-user-dialogue-and-no-surface-bounds-it-to-one-line.md
1  circles/260801-1244-guard-rules-write/_c_circle.md
1  circles/260805-2005-textschicht-gegen-code-nachziehen/_c_circle.md
3  circles/260813-0858-playmaker-maintains-backlog-store/_c_circle.md
1  circles/260815-0007-remove-eight-mechanisms-and-cap-growth/_c_circle.md
1  circles/260815-0007-remove-eight-mechanisms-and-cap-growth/issues/260815-1247_*_the-implemented-decision-records-two-cross-references-were-broken-by-the-commit-that-transitioned-it.md
2  circles/260816-1741-guard-becomes-observation-only/_b_circle.md
1  shared/decisions/260719-2141_*_concurrency-worktree-slots-vs-single-active-circle.md
1  shared/decisions/260806-1152_*_stash-manifest-dirname-and-pointer-content-duplicate.md
2  shared/decisions/260807-0158_*_how-is-a-unique-record-filename-obtained.md
1  shared/decisions/260810-1544_*_should-prompt-called-bin-helpers-get-one-guarded-call-convention-and-does-the-work-tree-preference-extend-to-them.md
2  shared/decisions/260810-1635_*_where-does-the-obligation-sit-to-update-the-artefact-that-explains-a-behaviour-when-the-behaviour-changes.md
1  shared/decisions/260810-2032_*_should-the-drift-checks-four-sentences-be-pinned-to-an-approved-baseline-instead-of-screened-by-a-blacklist.md
2  shared/decisions/260810-2145_*_should-a-repeated-skill-body-snippet-become-a-bin-helper-now-that-one-fact-lives-in-four-executable-copies.md
2  shared/decisions/260811-1522_*_should-the-readme-hooks-lib-table-pin-its-prose-to-the-modules-it-describes.md
3  shared/decisions/260815-2109_*_may-a-circle-close-over-an-uncovered-review-range-and-who-decides.md
1  shared/decisions/260816-0740_*_does-the-prose-register-get-a-measurable-gate-and-which-surface-does-it-measure.md
1  shared/issues/260803-1837_*_no-route-turns-existing-pre-circle-work-into-a-circle.md
2  shared/issues/260807-2154_*_corrected-sibling-wording-never-reaches-an-existing-consumer.md
1  shared/issues/260807-2154_*_the-writing-profile-carries-no-handle-for-the-reference-that-now-points-at-it.md
2  shared/issues/260808-0030_*_line-number-citations-into-rule-files-go-stale-and-no-gate-reads-them.md
3  shared/issues/260808-0030_*_the-coderev-pass-filed-four-issues-and-left-no-review-file.md
1  shared/issues/260810-0819_*_head-carries-six-records-twice-and-the-class-fix-was-deferred-to-a-decision-never-filed.md
1  shared/issues/260810-2110_*_the-domain-capture-one-liner-is-now-copied-into-a-fourth-skill-body-and-the-copying-is-the-stated-justification.md
1  shared/issues/260811-1613_*_four-prompts-now-defer-to-a-routing-table-that-still-carries-the-gap-260811-1301-names.md
1  shared/issues/260811-2245_*_no-test-pins-that-the-project-language-cases-are-cited-by-content-so-the-next-ordinal-ships-unnoticed.md
1  shared/issues/260812-1720_*_the-reference-resolution-lint-does-not-scan-the-workbench-where-citations-are-densest.md
1  shared/issues/260816-1330_*_the-foreclosure-clause-does-not-say-whether-it-costs-a-line-per-option-and-the-cap-two-sections-below-forbids-relaxing.md
```
