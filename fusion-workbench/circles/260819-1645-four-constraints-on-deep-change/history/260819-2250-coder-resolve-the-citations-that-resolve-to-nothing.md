# coder — resolve the citations that resolve to nothing (plan step 7)

**Status:** Complete
**Date:** 2026-08-19
**Agent:** coder
**Task:** Step 7 of `circles/260819-1645-four-constraints-on-deep-change/planning/260819-2016_*_four-constraints-on-deep-change.md`, plus two things the plan does not carry: the 21 citations that changed class when step 6b landed, and the prose of the one `wrong-store` hit whose wrong path was its own statement.
**HEAD at start:** `4aae336`

## Corpus and driver

The driver step 5 built and step 6 reused, extended rather than replaced: it grew a `--narrow`
switch and three listing flags. It assembles the file list from the tree and never from a written
list — Circle records in every state, `portfolio.md`, issues carrying `_o_`, and decisions carrying
`_o_` or `_a_` in the wider reading and `_o_` alone in the narrow one, `archive/` excluded — then
calls `scanCitationTokens` from `hooks/lib/__tests__/helpers/citation-scan.ts`.

Both readings were measured, because the corpus question is still open. The narrow reading is a
subset of the wider one by construction: it selects the same Circle records and issues and fewer
decisions. A wider reading with no violation therefore cannot hide one in the narrow reading, and
the two tables below agree.

## Before and after

**Wider reading** (decisions `_o_` or `_a_`), 188 files:

| | Before | After |
|---|---|---|
| `dangling` (gate kinds) | 41 | **0** |
| `stale-marker` | 42 | 24 (all deliberate) |
| `wrong-store` | 1 | **0** |
| **`scanRecordCitations` violations** | **84** | **24** |
| `resolved` (partitioned) | 909 | 950 |
| tokens | 1 745 | 1 738 |

**Narrow reading** (decisions `_o_` only), 168 files:

| | Before | After |
|---|---|---|
| `dangling` (gate kinds) | 35 | **0** |
| `stale-marker` | 38 | 24 (all deliberate) |
| `wrong-store` | 1 | **0** |
| **`scanRecordCitations` violations** | **74** | **24** |

**31 records edited**, 76 insertions against 60 deletions; the surplus is the six citations that
needed a clause of their own and one appended correction note. No marker was transitioned, no plan
step was marked, nothing was committed, no golden was regenerated and no pinned constant was
written.

## What each treatment did, in aggregate

**Treatment 1 — correct the path: 34 of the 41.** Three shapes, and none of them was a guess.

- **13 citations of a Circle *directory* that the `260817-1907` sweep archived** — five of
  `260813-0910-documentation-matches-shipped-plugin`, five of `260801-1244-guard-bash-inspection`,
  three of `260719-1536-plane-mirror-integration`. All three directories are on disk under
  `archive/260817-1907-safe-cleanup-scoped/circles/`, verified before any edit.
- **11 citations truncated with three ASCII dots** where the grammar reads only `…`. The record
  each names is on disk; the dots are the whole defect, which is the open record
  `shared/issues/260812-2136_*_the-citation-grammar-reads-one-ellipsis-and-one-marker-syntax-and-the-workbench-uses-two-of-each.md`
  measuring itself.
- **6 citations of a session history file written without a code span**, so the sentence's own full
  stop was swallowed into the token and a path that exists resolved to nothing. Backticks, and
  in one head field a reworded clause, since that field's house form carries no backticks.
- **1 citation whose stamp was wrong when it was written** — `260814-1210` for a record filed at
  `260814-1200`, the defect `circles/260801-1244-curator/issues/260814-1450_*_…` claim 4 has
  carried since 14 August.
- **3 more marker or store corrections** folded into the lines above.

**Treatment 2 — pull the substance into the text and drop the dead path: 7.** Every one is a
citation that could not be repaired *as* a citation, because the token was the evidence rather than
a pointer:

- Two records quote synthetic fixtures and fabricated worked examples verbatim
  (`990101-0101_o_never-existed`, a `rag-sanitisation` example in
  `rules/decision-record-examples.md`). The parser cannot tell a quoted fixture from a citation, so
  the fixtures are now named by stamp and description.
- Two illustrate a citation *form* with a stamp that names nothing and never did
  (`260811-0753`, `260801-1020_*_slug`); they are now written with `<placeholder>` spans, which is
  what they always meant.
- One is the ASCII-dot specimen itself: repairing the citation would delete the evidence, so the
  dots moved into the sentence and the token now resolves.
- One is a defect record listing the two tokens in its corpus that resolve to nothing at all.
  Written as paths they were two more instances of what the record counts.
- One is the cross-reference whose target was never filed. See the defect below.

**Treatment 3 — annotate as deliberately removed: 0.** No hit qualified. Every unresolvable target
was found either in `archive/`, under another marker, or nowhere in any commit — and the third case
is a record that was never written, which is not a deletion. `rules/circle-records.md`
`### Deletion is outside the vocabulary` was read first and its literal was not used, because using
it would have asserted a deletion that did not happen. Step 6 reported the same for its class.

**One defect filed**, where none of the three applied cleanly:
`circles/260819-1645-four-constraints-on-deep-change/issues/260819-2250_*_a-decision-records-cross-reference-names-a-defect-record-that-was-never-filed-and-the-intended-target-is-not-recoverable.md`.
`shared/decisions/260813-0826_*_…:7` cross-referenced a defect record about the user-facing
documentation lagging two releases. No file with that slug exists in any commit; `799fded` added
exactly two records at that stamp and neither is it. The curator reached the same wall on
2026-08-14 and stopped there, and so did this pass: the path was dropped under treatment 2 and the
lost reference is named in the defect rather than guessed at.

## The 21 that changed class, and the five left standing

Step 6b's tolerance for one `archive/<sweep>/` level turned 21 `dangling` hits into `stale-marker`,
which is step 5's class with step 5's treatment. Re-measured here rather than taken from that log:
**23** hits in the wider reading were `stale-marker` and not in step 5's list of nineteen. The two
beyond 6b's count are both in
`shared/decisions/260816-1707_*_which-install-path-is-the-authoritative-one-for-end-users.md` and
point at `260816-0719`, which this session's own step 1 moved `_a_` → `_i_` after step 5 had run.
They are the same class arriving by a different route.

**18 were starred.** Every one is a pointer whose marker ages: cross-reference lines, `Active
spec/plan:` fields, dependency lists, a bullet naming a neighbouring record. None was rewritten to
the marker its target carries today, which is the repair that goes stale again.

**5 were left literal**, by the pointer-versus-statement test in `rules/circle-records.md`
`### Citation form in the portfolio` — starring a statement deletes its content. Named individually,
because a deliberate leave that is not named is indistinguishable from one that was missed:

- `circles/260801-1244-curator/issues/260814-1419_*_nine-open-marker-citations-were-left-literal-on-lines-where-their-siblings-were-starred.md`,
  **lines 18, 21, 22 and 24** — the right-hand column of that record's table, which is a verbatim
  quotation of the nine citations left literal elsewhere and is the evidence the record exists to
  carry. Step 5 left lines 19, 25 and 26 of the same column for the same reason and could not have
  seen these four, because their targets were archived and the hits read `dangling` at the time. The
  left-hand column of that table names the record *edited by* the pass and is a pointer; those were
  starred by step 5 and are untouched here.
- `shared/issues/260812-1720_*_the-reference-resolution-lint-does-not-scan-the-workbench-where-citations-are-densest.md`,
  **line 24** — the head of the bullet whose subject *is* the stale exact marker
  (`a **stale exact marker** — …_o_… seven times for a file that has been _c_ since it completed`).
  Step 5 left lines 25 and 26, the continuation of the same bullet.

One in that file went the other way and is stated because the judgement is not obvious.
**Line 31** was starred. Its bullet's subject is *ellipsis truncation*, not markers, so the letter
carries none of the statement — and step 6 had already starred one specimen on that same line,
leaving the two inconsistent.

The 19 step 5 left are untouched and still read as they did. Total deliberate leaves: **24 in both
readings** — every one of them sits in an issue record carrying `_o_` or in a Circle record, which
both readings select. The 18 that were starred divide 14 / 4 between the two, the four being
citations inside `_a_` decisions that the narrow reading does not look at.

## The one `wrong-store` hit, which was a prose problem

`circles/260801-1244-curator/issues/260814-2153_*_…:77` read *"One correction that belongs to
whoever picks this up. Decision `260815-2109` cites this record as `shared/issues/260814-2153_o_…`.
No such path exists"* — a paragraph whose wrong path was its own subject. Step 6 fixed the citation
it complains about, so the paragraph was describing finished work and asking for it at the same
time.

Rewritten to say what happened: the decision cited this record from the wrong store, the citation
was corrected on 2026-08-19, and the note now stands as the record of a correction rather than as a
request for one. The store word appears without a stamp behind it, so it is no longer a citation
token, and the record's own finding is untouched. Correcting the quoted path instead would have
made the record assert something false about the present, which is the failure the dispatch named.

The same shape appeared once more, unasked for, in
`circles/260801-1244-curator/issues/260814-1450_*_…`. Its claim 4 *is* the wrong stamp at
`_c_circle.md:104`, and repairing that citation made the claim historical. The wrong stamp is kept
where the record reports it — as a stamp, which resolves to nothing and is never a violation, not as
a path, which was a third copy of the dead citation — and a dated correction note is appended. The
marker does not move: the record's other three sub-claims are unchanged.

## What this pass did not do

- **No Circle-directory citation resolves through the scanner, even corrected.** `findRecord()`
  learned the one-sweep archive prefix in step 6b; `circleDirs()` did not, and it reads only
  `fusion-workbench/circles/`. So `archive/<sweep>/circles/<dir>/` still scans `dangling`. The
  thirteen were repaired by citing the Circle's *record* at its archive path
  (`…/circles/<dir>/_c_circle.md`), which is a true path, is more precise than the bare directory,
  and yields no token at all — `CIRCLE_RE` does not match a directory followed by a path segment.
  That is the honest repair available without touching `hooks/`, which is outside this step's file
  set. **It is not a fix for the asymmetry**, and step 9's gate will inherit it: a citation of an
  archived Circle *directory* is still unexpressible, exactly as a citation of an archived record
  was before 6b.
- **`shared/analyses/260813-0831-…:234` carries the same never-filed path** and was not touched.
  Analyses are not in either corpus reading. It is named in the defect record.
- **`stamp-name` hits were not touched.** They are step 8.

## Verification

`cd hooks && npx vitest run` — **exit 0**, 37 test files and 678 tests passed. Run without a pipe so
the exit code is the process's own.

The corpus scan was re-run in both readings after the last edit: `scanRecordCitations` reports
**zero** `dangling` and **zero** `wrong-store` over the repair corpus, and the only remaining
violations are the 24 deliberate `stale-marker` literals named above, identical in both readings.
Wider reading: 189 files, 1 743 tokens. Narrow: 169 files, 1 548 tokens.

## Files changed

31 workbench records, one new defect record and this log. Edit count per record:

```
8  circles/260801-1244-curator/_c_circle.md
3  circles/260801-1244-curator/issues/260814-1450_*_the-turn-3-bookkeeping-says-no-review-ran-in-the-commit-that-landed-the-review.md
1  circles/260801-1244-curator/issues/260814-2153_*_the-commit-that-closes-the-last-reviews-own-high-finding-is-the-one-commit-no-review-opens.md
3  circles/260801-1244-guard-rules-write/_c_circle.md
7  circles/260801-1244-rule-provenance-header/_c_circle.md
1  circles/260804-1205-shell-reachability-model/_s_circle.md
2  circles/260805-2005-textschicht-gegen-code-nachziehen/_c_circle.md
2  circles/260813-0858-playmaker-maintains-backlog-store/_c_circle.md
2  circles/260815-0007-remove-eight-mechanisms-and-cap-growth/_c_circle.md
1  circles/260815-0007-remove-eight-mechanisms-and-cap-growth/issues/260815-1247_*_the-churn-leaves-were-removed-without-a-retirement-entry-and-the-retirement-table-could-not-have-held-one.md
1  circles/260815-0007-remove-eight-mechanisms-and-cap-growth/issues/260815-1633_*_eight-shipped-surfaces-still-present-the-three-demoted-skill-names-as-user-commands.md
2  circles/260816-1741-guard-becomes-observation-only/_b_circle.md
2  shared/decisions/260719-2141_*_concurrency-worktree-slots-vs-single-active-circle.md
3  shared/decisions/260810-1635_*_where-does-the-obligation-sit-to-update-the-artefact-that-explains-a-behaviour-when-the-behaviour-changes.md
1  shared/decisions/260812-0254_*_should-a-cited-artifact-path-be-absolute-so-an-editor-can-open-it.md
2  shared/decisions/260813-0826_*_should-fusion-help-become-a-self-knowledge-skill-that-answers-from-the-live-installation.md
2  shared/decisions/260816-1707_*_which-install-path-is-the-authoritative-one-for-end-users.md
2  shared/issues/260801-1410_*_unattributed-edit-to-ontocoder-prompt-during-session.md
1  shared/issues/260810-0820_*_the-turn-1-review-totals-table-says-fourteen-findings-and-the-body-carries-seventeen.md
1  shared/issues/260810-1618_*_a-release-was-tagged-and-pushed-while-its-own-review-pass-was-still-running.md
2  shared/issues/260811-1734_*_reduce-the-surface-so-a-claim-cannot-go-stale-in-several-places-at-once.md
2  shared/issues/260811-2105_*_circle-records-carry-the-same-silent-citation-form-and-a-third-of-their-citations-are-stale.md
1  shared/issues/260811-2147_*_nothing-pins-the-gitignore-bin-exception-list-against-the-contents-of-bin-and-the-failure-is-a-helper-missing-from-the-tarball.md
1  shared/issues/260812-0253_*_agents-answer-a-question-the-user-did-not-ask-and-the-length-caps-do-not-hold.md
1  shared/issues/260812-1720_*_the-reference-resolution-lint-does-not-scan-the-workbench-where-citations-are-densest.md
1  shared/issues/260812-2136_*_the-citation-grammar-reads-one-ellipsis-and-one-marker-syntax-and-the-workbench-uses-two-of-each.md
1  shared/issues/260813-0913_*_a-dependency-between-two-circles-can-only-be-recorded-on-one-side-because-nobody-may-write-the-other.md
2  shared/issues/260814-1419_*_the-shipped-chat-voice-profiles-changed-and-the-workbench-copies-agents-actually-load-did-not.md
1  shared/issues/260816-0119_*_the-lints-newly-widened-surface-still-stops-at-hooks-lib-tests-where-real-citations-have-gone-stale.md
1  shared/issues/260816-1330_*_the-repunctuations-evidence-paragraph-carries-a-token-count-nobody-can-reproduce-and-an-inverted-capitalisation-claim.md
1  shared/issues/260816-1345_*_the-register-defects-corpus-table-is-labelled-always-on-and-is-not-the-always-on-set.md
```
